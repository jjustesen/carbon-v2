import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { parseExports, parseImports } from "./importExportParser";

export class FileAnalyzer {
  constructor(private workspaceRoot: string) {}

  analyzeCurrentFile(document: vscode.TextDocument): any {
    const filePath = document.uri.fsPath;
    const content = fs.readFileSync(filePath, "utf-8");

    const exports = parseExports(content);
    const imports = this.findImports(exports);

    return {
      currentFile: path.relative(this.workspaceRoot, filePath),
      exports,
      imports,
    };
  }

  findImports(exports: any): any {
    const imports: any = {};
    const files = this.getAllFiles(this.workspaceRoot);

    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      const fileImports = parseImports(content);

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

  private getAllFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        // Ignore node_modules directory
        if (path.basename(file) !== "node_modules") {
          results = results.concat(this.getAllFiles(file));
        }
      } else {
        if (
          path.extname(file) === ".js" ||
          path.extname(file) === ".jsx" ||
          path.extname(file) === ".ts" ||
          path.extname(file) === ".tsx"
        ) {
          results.push(file);
        }
      }
    });
    return results;
  }
}
