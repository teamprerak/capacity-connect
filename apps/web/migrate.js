const { Project, SyntaxKind, Node } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles([
  "app/**/*.tsx",
  "components/**/*.tsx"
]);

const enDict = {};
let counter = 1;

function generateKey(text) {
  let key = text
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .substring(0, 30);
  
  if (!key) {
    key = "text_" + counter++;
  }
  let orig = key;
  let i = 1;
  while (enDict[key] && enDict[key] !== text) {
    key = orig + "_" + i;
    i++;
  }
  return key;
}

for (const sourceFile of sourceFiles) {
  let fileChanged = false;
  let hasTranslatableText = false;

  // We will find all text nodes and replace them.
  // To avoid breaking things, we just use `const t = useTranslations('common');` inside components.
  
  const replacements = [];

  sourceFile.forEachDescendant(node => {
    if (node.getKind() === SyntaxKind.JsxText) {
      const text = node.getText().trim();
      if (text.length > 1 && !/^[{}[\],.\s]+$/.test(text)) {
        replacements.push(node);
      }
    } else if (node.getKind() === SyntaxKind.StringLiteral) {
      const parent = node.getParent();
      if (parent && parent.getKind() === SyntaxKind.JsxAttribute) {
        const attrName = parent.getNameNode().getText();
        if (['placeholder', 'title', 'alt', 'label'].includes(attrName)) {
          const text = node.getLiteralValue().trim();
          if (text.length > 0) {
            replacements.push(node);
          }
        }
      }
    }
  });

  if (replacements.length > 0) {
    fileChanged = true;
    hasTranslatableText = true;

    // We do the replacements backwards to not mess up offsets if we were doing it via text,
    // but with ts-morph it's better to replace them directly if we do it carefully.
    // However, replaceWithText invalidates other nodes. We should just replace text manually or use a loop.
    let currentReplacements = [];
    while (true) {
      let replaced = false;
      const node = sourceFile.getFirstDescendant(n => {
        if (n.getKind() === SyntaxKind.JsxText) {
          const text = n.getText().trim();
          return text.length > 1 && !/^[{}[\],.\s]+$/.test(text);
        }
        if (n.getKind() === SyntaxKind.StringLiteral) {
          const p = n.getParent();
          if (p && p.getKind() === SyntaxKind.JsxAttribute) {
            const attrName = p.getNameNode().getText();
            return ['placeholder', 'title', 'alt', 'label'].includes(attrName) && n.getLiteralValue().trim().length > 0;
          }
        }
        return false;
      });

      if (!node) break;

      const func = node.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) || 
                   node.getFirstAncestorByKind(SyntaxKind.ArrowFunction);
      
      if (func) {
        // Tag this function to inject `useTranslations`
        if (!func.hasUseTranslations) {
           func.hasUseTranslations = true;
        }
      }

      if (node.getKind() === SyntaxKind.JsxText) {
        const text = node.getText().trim();
        const cleanText = text.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim();
        const key = generateKey(cleanText);
        enDict[key] = cleanText;
        node.replaceWithText(` {t("${key}")} `);
      } else {
        const text = node.getLiteralValue().trim();
        const key = generateKey(text);
        enDict[key] = text;
        const parent = node.getParent();
        parent.setInitializer(`{t("${key}")}`);
      }
      replaced = true;
    }

    if (hasTranslatableText) {
      // Inject import
      const importDecl = sourceFile.getImportDeclaration("next-intl");
      if (!importDecl) {
        sourceFile.addImportDeclaration({
          namedImports: ["useTranslations"],
          moduleSpecifier: "next-intl"
        });
      }

      // Inject const t = useTranslations('common'); inside components
      sourceFile.getFunctions().forEach(func => {
        if (func.hasUseTranslations) {
          const body = func.getBody();
          if (body && body.getKind() === SyntaxKind.Block && !body.getText().includes('useTranslations')) {
            body.insertStatements(0, "const t = useTranslations('common');");
          }
        }
      });
      sourceFile.getVariableDeclarations().forEach(vd => {
        const init = vd.getInitializer();
        if (init && init.getKind() === SyntaxKind.ArrowFunction) {
           if (init.hasUseTranslations) {
              const body = init.getBody();
              if (body && body.getKind() === SyntaxKind.Block && !body.getText().includes('useTranslations')) {
                 body.insertStatements(0, "const t = useTranslations('common');");
              } else if (body && body.getKind() !== SyntaxKind.Block) {
                 // Convert implicit return arrow function to block
                 const exprText = body.getText();
                 init.setBodyText(`{\n  const t = useTranslations('common');\n  return ${exprText};\n}`);
              }
           }
        }
      });

      sourceFile.saveSync();
      console.log(`Updated ${sourceFile.getFilePath()}`);
    }
  }
}

// Generate locales
const localesDir = path.join(__dirname, "messages");
if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir);

const langs = ['en', 'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai', 'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te', 'ur'];

langs.forEach(lang => {
  let dict = {};
  if (lang === 'en') {
    dict = enDict;
  } else {
    for (const [key, val] of Object.entries(enDict)) {
      dict[key] = `[${lang.toUpperCase()}] ${val}`;
    }
  }
  fs.writeFileSync(path.join(localesDir, `${lang}.json`), JSON.stringify({ common: dict }, null, 2));
});

console.log("Completed. Keys extracted:", Object.keys(enDict).length);
