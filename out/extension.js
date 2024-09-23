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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
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
exports.activate = activate;
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
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map