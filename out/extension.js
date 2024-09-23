"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fileAnalyzer_1 = require("./fileAnalyzer");
const treeViewProvider_1 = require("./treeViewProvider");
let treeDataProvider;
let fileAnalyzer;
function activate(context) {
    var _a;
    const workspaceRoot = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage("No workspace folder open");
        return;
    }
    fileAnalyzer = new fileAnalyzer_1.FileAnalyzer(workspaceRoot);
    treeDataProvider = new treeViewProvider_1.ImportExportTreeProvider();
    const treeView = vscode.window.createTreeView("importExportExplorer", {
        treeDataProvider,
    });
    context.subscriptions.push(treeView);
    // Register the command to manually trigger analysis
    let analyzeCommand = vscode.commands.registerCommand("extension.analyzeImportsExports", () => {
        analyzeCurrentFile();
    });
    context.subscriptions.push(analyzeCommand);
    // Register an event listener for when the active editor changes
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            analyzeCurrentFile();
        }
    }, null, context.subscriptions);
    // Analyze the current file on activation
    if (vscode.window.activeTextEditor) {
        analyzeCurrentFile();
    }
}
function analyzeCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const analysis = fileAnalyzer.analyzeCurrentFile(editor.document);
        // Convert relative paths to absolute paths
        if (analysis.imports) {
            for (const [importName, files] of Object.entries(analysis.imports)) {
                analysis.imports[importName] = files.map((file) => {
                    var _a;
                    return path.resolve(((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath) || "", file);
                });
            }
        }
        treeDataProvider.updateData(analysis);
        vscode.window.showInformationMessage("Import/Export analysis updated");
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map