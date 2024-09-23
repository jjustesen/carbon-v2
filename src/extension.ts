import * as vscode from "vscode";
import * as path from "path";
import { FileAnalyzer } from "./fileAnalyzer";
import { ImportExportTreeProvider } from "./treeViewProvider";
import { GraphVisualization } from "./graphVisualization";

let treeDataProvider: ImportExportTreeProvider;
let fileAnalyzer: FileAnalyzer;
let graphVisualization: GraphVisualization;

export function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage("No workspace folder open");
    return;
  }

  fileAnalyzer = new FileAnalyzer(workspaceRoot);
  treeDataProvider = new ImportExportTreeProvider();
  graphVisualization = new GraphVisualization(context);

  const treeView = vscode.window.createTreeView("importExportExplorer", {
    treeDataProvider,
  });

  context.subscriptions.push(treeView);

  let analyzeCommand = vscode.commands.registerCommand(
    "extension.analyzeImportsExports",
    () => {
      analyzeCurrentFile();
    }
  );

  let showGraphCommand = vscode.commands.registerCommand(
    "extension.showImportExportGraph",
    () => {
      showGraph();
    }
  );

  context.subscriptions.push(analyzeCommand, showGraphCommand);

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        analyzeCurrentFile();
      }
    },
    null,
    context.subscriptions
  );

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
        analysis.imports[importName] = (files as string[]).map((file) =>
          path.resolve(
            vscode.workspace.workspaceFolders?.[0].uri.fsPath || "",
            file
          )
        );
      }
    }

    treeDataProvider.updateData(analysis);
    vscode.window.showInformationMessage("Import/Export analysis updated");
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

function convertAnalysisToGraphData(analysis: any) {
  const nodes: any[] = [];
  const links: any[] = [];

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

    (importedFiles as string[]).forEach((file) => {
      if (!nodes.some((node) => node.id === file)) {
        nodes.push({ id: file, type: "file" });
      }
      links.push({ source: file, target: importName, type: "exports" });
    });
  });

  return { nodes, links };
}

export function deactivate() {}
