const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const project = new Project({
  tsConfigFilePath: "apps/web/tsconfig.json",
});

const sourceFiles = project.getSourceFiles([
  "apps/web/app/**/*.tsx",
  "apps/web/components/**/*.tsx"
]);

const enDict = {};
let counter = 1;

function generateKey(text) {
  let key = text
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .substring(0, 40);
  
  if (!key || /^\d+$/.test(key)) {
    key = "text_" + counter++;
  }
  
  // ensure uniqueness
  if (enDict[key] && enDict[key] !== text) {
    let orig = key;
    let i = 1;
    while (enDict[orig + "_" + i] && enDict[orig + "_" + i] !== text) {
      i++;
    }
    key = orig + "_" + i;
  }
  return key;
}

const targetAttributes = ['placeholder', 'title', 'alt', 'label', 'description'];

for (const sourceFile of sourceFiles) {
  let componentFunctions = new Set();
  let fileChanged = false;
  
  while (true) {
    let replacedInPass = false;
    
    const descendant = sourceFile.getFirstDescendant((node) => {
      if (node.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)) return false;
      
      if (node.getKind() === SyntaxKind.JsxText) {
        const text = node.getText().trim();
        if (text.length > 1 && !/^[{}[\],.\s_-]+$/.test(text) && !/^\d+$/.test(text)) {
           return true;
        }
      }
      if (node.getKind() === SyntaxKind.StringLiteral) {
        const parent = node.getParent();
        if (parent && parent.getKind() === SyntaxKind.JsxAttribute) {
          const attrName = parent.getNameNode().getText();
          if (targetAttributes.includes(attrName)) {
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
        const text = descendant.getText();
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
    const importDecl = sourceFile.getImportDeclaration("next-intl");
    if (!importDecl) {
      sourceFile.addImportDeclaration({
        namedImports: ["useTranslations"],
        moduleSpecifier: "next-intl"
      });
    }

    sourceFile.getFunctions().forEach(func => {
       if (componentFunctions.has(func.getName() || 'anonymous')) {
           const body = func.getBody();
           if (body && body.getKind() === SyntaxKind.Block && !body.getText().includes('useTranslations()')) {
               body.insertStatements(0, "const t = useTranslations();");
           }
       }
    });

    sourceFile.getVariableDeclarations().forEach(vd => {
       const init = vd.getInitializer();
       if (init && init.getKind() === SyntaxKind.ArrowFunction) {
           if (componentFunctions.has(vd.getName())) {
               const body = init.getBody();
               if (body && body.getKind() === SyntaxKind.Block && !body.getText().includes('useTranslations()')) {
                   body.insertStatements(0, "const t = useTranslations();");
               }
           }
       }
    });

    sourceFile.saveSync();
    console.log(`Updated ${sourceFile.getFilePath()}`);
  }
}

const localesDir = path.join(__dirname, "apps", "web", "messages");
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

fs.writeFileSync(path.join(localesDir, 'en.json'), JSON.stringify(enDict, null, 2));
console.log("Extraction complete. Extracted", Object.keys(enDict).length, "keys.");
