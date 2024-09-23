import * as vscode from "vscode";
import * as path from "path";
import { FileAnalyzer } from "./fileAnalyzer";
import { ImportExportTreeProvider } from "./treeViewProvider";

let treeDataProvider: ImportExportTreeProvider;
let fileAnalyzer: FileAnalyzer;

export function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceRoot) {
    vscode.window.showErrorMessage("No workspace folder open");
    return;
  }

  fileAnalyzer = new FileAnalyzer(workspaceRoot);
  treeDataProvider = new ImportExportTreeProvider();

  const treeView = vscode.window.createTreeView("importExportExplorer", {
    treeDataProvider,
  });

  context.subscriptions.push(treeView);

  // Register the command to manually trigger analysis
  let analyzeCommand = vscode.commands.registerCommand(
    "extension.analyzeImportsExports",
    () => {
      analyzeCurrentFile();
    }
  );

  context.subscriptions.push(analyzeCommand);

  // Register an event listener for when the active editor changes
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        analyzeCurrentFile();
      }
    },
    null,
    context.subscriptions
  );

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

export function deactivate() {}
