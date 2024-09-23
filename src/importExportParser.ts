import * as ts from "typescript";

export function parseExports(content: string): any {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    content,
    ts.ScriptTarget.Latest,
    true
  );
  const exports: any = {};

  function visit(node: ts.Node) {
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach((element) => {
          exports[element.name.text] = "named";
        });
      }
    } else if (ts.isExportAssignment(node)) {
      exports["default"] = "default";
    } else if (
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node) ||
      ts.isVariableStatement(node)
    ) {
      if (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
          if (node.name) {
            exports[node.name.text] = node.modifiers.some(
              (m) => m.kind === ts.SyntaxKind.DefaultKeyword
            )
              ? "default"
              : "named";
          }
        } else if (ts.isInterfaceDeclaration(node)) {
          exports[node.name.text] = "interface";
        } else if (ts.isTypeAliasDeclaration(node)) {
          exports[node.name.text] = "type";
        } else if (ts.isEnumDeclaration(node)) {
          exports[node.name.text] = "enum";
        } else if (ts.isVariableStatement(node)) {
          node.declarationList.declarations.forEach((declaration) => {
            if (ts.isIdentifier(declaration.name)) {
              exports[declaration.name.text] = "const";
            }
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return exports;
}

export function parseImports(content: string): string[] {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    content,
    ts.ScriptTarget.Latest,
    true
  );
  const imports: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      if (node.importClause) {
        if (node.importClause.name) {
          imports.push(node.importClause.name.text);
        }
        if (node.importClause.namedBindings) {
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            node.importClause.namedBindings.elements.forEach((element) => {
              imports.push(element.name.text);
            });
          } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            imports.push(node.importClause.namedBindings.name.text);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return imports;
}
