"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExports = parseExports;
exports.parseImports = parseImports;
const ts = require("typescript");
function parseExports(content) {
    const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);
    const exports = {};
    function visit(node) {
        var _a;
        if (ts.isExportDeclaration(node)) {
            if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                node.exportClause.elements.forEach((element) => {
                    exports[element.name.text] = "named";
                });
            }
        }
        else if (ts.isExportAssignment(node)) {
            exports["default"] = "default";
        }
        else if (ts.isFunctionDeclaration(node) ||
            ts.isClassDeclaration(node) ||
            ts.isInterfaceDeclaration(node) ||
            ts.isTypeAliasDeclaration(node) ||
            ts.isEnumDeclaration(node) ||
            ts.isVariableStatement(node)) {
            if ((_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
                if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
                    if (node.name) {
                        exports[node.name.text] = node.modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
                            ? "default"
                            : "named";
                    }
                }
                else if (ts.isInterfaceDeclaration(node)) {
                    exports[node.name.text] = "interface";
                }
                else if (ts.isTypeAliasDeclaration(node)) {
                    exports[node.name.text] = "type";
                }
                else if (ts.isEnumDeclaration(node)) {
                    exports[node.name.text] = "enum";
                }
                else if (ts.isVariableStatement(node)) {
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
function parseImports(content) {
    const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);
    const imports = [];
    function visit(node) {
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
                    }
                    else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
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
//# sourceMappingURL=importExportParser.js.map