import * as vscode from "vscode";
import * as path from "path";

export class ImportExportTreeProvider
  implements vscode.TreeDataProvider<ImportExportItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    ImportExportItem | undefined | null | void
  > = new vscode.EventEmitter<ImportExportItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ImportExportItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private data: any = {};

  constructor(initialData: any = {}) {
    this.data = initialData;
  }

  updateData(newData: any): void {
    this.data = newData;
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ImportExportItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ImportExportItem): Thenable<ImportExportItem[]> {
    if (!element) {
      return Promise.resolve([
        new ImportExportItem(
          "Exports",
          vscode.TreeItemCollapsibleState.Expanded
        ),
        new ImportExportItem(
          "Imports",
          vscode.TreeItemCollapsibleState.Expanded
        ),
      ]);
    } else if (element.label === "Exports") {
      return Promise.resolve(
        Object.entries(this.data.exports || {}).map(
          ([name, type]) =>
            new ImportExportItem(
              `${name} (${type})`,
              vscode.TreeItemCollapsibleState.None,
              undefined,
              this.getIconPath(type as string)
            )
        )
      );
    } else if (element.label === "Imports") {
      return Promise.resolve(
        Object.entries(this.data.imports || {}).map(
          ([name, files]) =>
            new ImportExportItem(
              name,
              vscode.TreeItemCollapsibleState.Expanded,
              files as string[]
            )
        )
      );
    } else if (element.files) {
      return Promise.resolve(
        element.files.map((file) => {
          const fileName = path.basename(file);
          return new ImportExportItem(
            fileName,
            vscode.TreeItemCollapsibleState.None,
            undefined,
            undefined,
            {
              command: "vscode.open",
              title: "Open File",
              arguments: [vscode.Uri.file(file)],
            }
          );
        })
      );
    }
    return Promise.resolve([]);
  }

  private getIconPath(
    type: string
  ): { light: string; dark: string } | undefined {
    const iconName =
      type === "interface"
        ? "interface"
        : type === "type"
        ? "type"
        : type === "enum"
        ? "enum"
        : type === "default"
        ? "default"
        : "named";
    return {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "light",
        `${iconName}.svg`
      ),
      dark: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "dark",
        `${iconName}.svg`
      ),
    };
  }
}

class ImportExportItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly files?: string[],
    iconPath?: { light: string; dark: string },
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.iconPath = iconPath;
    this.command = command;
  }
}
