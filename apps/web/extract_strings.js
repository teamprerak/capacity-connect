const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles([
  "app/**/*.tsx",
  "components/**/*.tsx",
  "!app_backup/**/*.tsx",
  "!components_backup/**/*.tsx"
]);

const strings = new Set();

sourceFiles.forEach(sourceFile => {
  sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach(node => {
    const text = node.getText().trim();
    if (text && !/^[{}]+$/.test(text) && text.length > 1) {
      strings.add(text.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim());
    }
  });

  sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(node => {
    const parent = node.getParent();
    if (parent && parent.getKind() === SyntaxKind.JsxAttribute) {
      const attrName = parent.getNameNode().getText();
      if (['placeholder', 'title', 'alt', 'label'].includes(attrName)) {
        const text = node.getLiteralValue().trim();
        if (text) strings.add(text);
      }
    }
  });
});

console.log(`Extracted ${strings.size} unique strings.`);
fs.writeFileSync("extracted_strings.json", JSON.stringify(Array.from(strings), null, 2));
