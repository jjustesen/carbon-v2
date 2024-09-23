"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseImports = exports.parseExports = void 0;
const ts = __importStar(require("typescript"));
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
exports.parseExports = parseExports;
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
exports.parseImports = parseImports;
//# sourceMappingURL=importExportParser.js.map