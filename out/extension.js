"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fileAnalyzer_1 = require("./fileAnalyzer");
const treeViewProvider_1 = require("./treeViewProvider");
const graphVisualization_1 = require("./graphVisualization");
let treeDataProvider;
let fileAnalyzer;
let graphVisualization;
function activate(context) {
    var _a;
    const workspaceRoot = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage("No workspace folder open");
        return;
    }
    fileAnalyzer = new fileAnalyzer_1.FileAnalyzer(workspaceRoot);
    treeDataProvider = new treeViewProvider_1.ImportExportTreeProvider();
    graphVisualization = new graphVisualization_1.GraphVisualization(context, workspaceRoot);
    const treeView = vscode.window.createTreeView("importExportExplorer", {
        treeDataProvider,
    });
    context.subscriptions.push(treeView);
    let analyzeCommand = vscode.commands.registerCommand("extension.analyzeImportsExports", () => {
        analyzeCurrentFile();
    });
    let showGraphCommand = vscode.commands.registerCommand("extension.showImportExportGraph", () => {
        showGraph();
    });
    context.subscriptions.push(analyzeCommand, showGraphCommand);
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            analyzeCurrentFile();
        }
    }, null, context.subscriptions);
    if (vscode.window.activeTextEditor) {
        analyzeCurrentFile();
    }
}
function analyzeCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const analysis = fileAnalyzer.analyzeCurrentFile(editor.document);
        if (analysis.imports) {
            for (const [importName, files] of Object.entries(analysis.imports)) {
                analysis.imports[importName] = files.map((file) => {
                    var _a;
                    return path.resolve(((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath) || "", file);
                });
            }
        }
        treeDataProvider.updateData(analysis);
        // vscode.window.showInformationMessage("Import/Export analysis updated");
    }
}
function showGraph() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const analysis = fileAnalyzer.analyzeCurrentFile(editor.document);
        const graphData = convertAnalysisToGraphData(analysis);
        graphVisualization.show(graphData);
    }
}
function convertAnalysisToGraphData(analysis) {
    const nodes = [];
    const links = [];
    // Add current file node
    nodes.push({ id: analysis.currentFile, type: "file" });
    // Add export nodes and links
    Object.entries(analysis.exports).forEach(([exportName, exportType]) => {
        nodes.push({ id: exportName, type: "export" });
        links.push({
            source: analysis.currentFile,
            target: exportName,
            type: "exports",
        });
    });
    // Add import nodes and links
    Object.entries(analysis.imports).forEach(([importName, importedFiles]) => {
        nodes.push({ id: importName, type: "import" });
        links.push({
            source: importName,
            target: analysis.currentFile,
            type: "imports",
        });
        importedFiles.forEach((file) => {
            if (!nodes.some((node) => node.id === file)) {
                nodes.push({ id: file, type: "file" });
            }
            links.push({ source: file, target: importName, type: "exports" });
        });
    });
    return { nodes, links };
}
function deactivate() { }
//# sourceMappingURL=extension.js.map