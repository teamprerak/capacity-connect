const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles([
  "app/**/*.tsx",
  "components/**/*.tsx",
  "!app_backup/**/*.tsx",
  "!components_backup/**/*.tsx"
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
  } else {
    // ensure uniqueness
    let orig = key;
    let i = 1;
    while (enDict[key] && enDict[key] !== text) {
      key = orig + "_" + i;
      i++;
    }
  }
  return key;
}

for (const sourceFile of sourceFiles) {
  let componentFunctions = new Set();
  let fileChanged = false;
  
  while (true) {
    let replacedInPass = false;
    
    // Find the first node we can replace
    const descendant = sourceFile.getFirstDescendant((node) => {
      if (node.getKind() === SyntaxKind.JsxText) {
        const text = node.getText().trim();
        if (text.length > 1 && !/^[{}[\],.\s]+$/.test(text)) {
           return true;
        }
      }
      if (node.getKind() === SyntaxKind.StringLiteral) {
        const parent = node.getParent();
        if (parent && parent.getKind() === SyntaxKind.JsxAttribute) {
          const attrName = parent.getNameNode().getText();
          if (['placeholder', 'title', 'alt', 'label'].includes(attrName)) {
            const text = node.getLiteralValue().trim();
            if (text.length > 0) return true;
          }
        }
      }
      return false;
    });

    if (descendant) {
      replacedInPass = true;
      fileChanged = true;
      
      const func = descendant.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) || 
                   descendant.getFirstAncestorByKind(SyntaxKind.ArrowFunction);
      let funcName = 'anonymous';
      if (func) {
        if (func.getKind() === SyntaxKind.FunctionDeclaration) {
            funcName = func.getName() || 'anonymous';
        } else {
            const parent = func.getParent();
            if (parent && parent.getKind() === SyntaxKind.VariableDeclaration) {
                funcName = parent.getName() || 'anonymous';
            }
        }
        componentFunctions.add(funcName);
      }
      
      if (descendant.getKind() === SyntaxKind.JsxText) {
        const text = descendant.getText().trim();
        const cleanText = text.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim();
        const key = generateKey(cleanText);
        enDict[key] = cleanText;
        descendant.replaceWithText(` {t("${key}")} `);
      } else {
        const text = descendant.getLiteralValue().trim();
        const key = generateKey(text);
        enDict[key] = text;
        const parent = descendant.getParent();
        parent.setInitializer(`{t("${key}")}`);
      }
    }
    
    if (!replacedInPass) break;
  }

  if (fileChanged) {
    const firstStatement = sourceFile.getStatements()[0];
    if (firstStatement) {
       const text = firstStatement.getText();
       if (!text.includes('"use client"') && !text.includes("'use client'")) {
           sourceFile.insertStatements(0, '"use client";\n');
       }
    } else {
        sourceFile.insertStatements(0, '"use client";\n');
    }

    const importDecl = sourceFile.getImportDeclaration("react-i18next");
    if (!importDecl) {
      sourceFile.addImportDeclaration({
        namedImports: ["useTranslation"],
        moduleSpecifier: "react-i18next"
      });
    }

    sourceFile.getFunctions().forEach(func => {
       if (componentFunctions.has(func.getName() || 'anonymous')) {
           const body = func.getBody();
           if (body && body.getKind() === SyntaxKind.Block && !body.getText().includes('useTranslation()')) {
               body.insertStatements(0, "const { t } = useTranslation();");
           }
       }
    });

    sourceFile.getVariableDeclarations().forEach(vd => {
       const init = vd.getInitializer();
       if (init && init.getKind() === SyntaxKind.ArrowFunction) {
           if (componentFunctions.has(vd.getName())) {
               const body = init.getBody();
               if (body && body.getKind() === SyntaxKind.Block && !body.getText().includes('useTranslation()')) {
                   body.insertStatements(0, "const { t } = useTranslation();");
               }
           }
       }
    });

    sourceFile.saveSync();
    console.log(`Updated ${sourceFile.getFilePath()}`);
  }
}

const localesDir = path.join(__dirname, "public", "locales");
const langs = ['en', 'hi', 'gu', 'bn', 'ta', 'te', 'mr', 'ml', 'pa', 'kn', 'ur', 'as', 'brx', 'doi', 'ks', 'kok', 'mai', 'mni', 'ne', 'or', 'sa', 'sat', 'sd'];

langs.forEach(lang => {
  const langDir = path.join(localesDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  
  const filePath = path.join(langDir, 'common.json');
  let dict = {};
  if (lang === 'en') {
    dict = enDict;
  } else {
    for (const [key, val] of Object.entries(enDict)) {
      dict[key] = `[${lang.toUpperCase()}] ${val}`;
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(dict, null, 2));
});

console.log("Translation generation complete. Total keys:", Object.keys(enDict).length);
