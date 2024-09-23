"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileAnalyzer = void 0;
const fs = require("fs");
const path = require("path");
const importExportParser_1 = require("./importExportParser");
class FileAnalyzer {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }
    analyzeCurrentFile(document) {
        const filePath = document.uri.fsPath;
        const content = fs.readFileSync(filePath, "utf-8");
        const exports = (0, importExportParser_1.parseExports)(content);
        const imports = this.findImports(exports);
        return {
            currentFile: path.relative(this.workspaceRoot, filePath),
            exports,
            imports,
        };
    }
    findImports(exports) {
        const imports = {};
        const files = this.getAllFiles(this.workspaceRoot);
        files.forEach((file) => {
            const content = fs.readFileSync(file, "utf-8");
            const fileImports = (0, importExportParser_1.parseImports)(content);
            Object.keys(exports).forEach((exportName) => {
                if (fileImports.includes(exportName)) {
                    if (!imports[exportName]) {
                        imports[exportName] = [];
                    }
                    imports[exportName].push(path.relative(this.workspaceRoot, file));
                }
            });
        });
        return imports;
    }
    getAllFiles(dir) {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach((file) => {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                // Ignore node_modules directory
                if (path.basename(file) !== "node_modules") {
                    results = results.concat(this.getAllFiles(file));
                }
            }
            else {
                if (path.extname(file) === ".js" ||
                    path.extname(file) === ".jsx" ||
                    path.extname(file) === ".ts" ||
                    path.extname(file) === ".tsx") {
                    results.push(file);
                }
            }
        });
        return results;
    }
}
exports.FileAnalyzer = FileAnalyzer;
//# sourceMappingURL=fileAnalyzer.js.map