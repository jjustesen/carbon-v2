"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportExportTreeProvider = void 0;
const vscode = require("vscode");
const path = require("path");
class ImportExportTreeProvider {
    constructor(initialData = {}) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.data = {};
        this.data = initialData;
    }
    updateData(newData) {
        this.data = newData;
        this.refresh();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve([
                new ImportExportItem("Exports", vscode.TreeItemCollapsibleState.Expanded),
                new ImportExportItem("Imports", vscode.TreeItemCollapsibleState.Expanded),
            ]);
        }
        else if (element.label === "Exports") {
            return Promise.resolve(Object.entries(this.data.exports || {}).map(([name, type]) => new ImportExportItem(`${name} (${type})`, vscode.TreeItemCollapsibleState.None, undefined, this.getIconPath(type))));
        }
        else if (element.label === "Imports") {
            return Promise.resolve(Object.entries(this.data.imports || {}).map(([name, files]) => new ImportExportItem(name, vscode.TreeItemCollapsibleState.Expanded, files)));
        }
        else if (element.files) {
            return Promise.resolve(element.files.map((file) => {
                const fileName = path.basename(file);
                return new ImportExportItem(fileName, vscode.TreeItemCollapsibleState.None, undefined, undefined, {
                    command: "vscode.open",
                    title: "Open File",
                    arguments: [vscode.Uri.file(file)],
                });
            }));
        }
        return Promise.resolve([]);
    }
    getIconPath(type) {
        const iconName = type === "interface"
            ? "interface"
            : type === "type"
                ? "type"
                : type === "enum"
                    ? "enum"
                    : type === "default"
                        ? "default"
                        : "named";
        return {
            light: path.join(__filename, "..", "..", "resources", "light", `${iconName}.svg`),
            dark: path.join(__filename, "..", "..", "resources", "dark", `${iconName}.svg`),
        };
    }
}
exports.ImportExportTreeProvider = ImportExportTreeProvider;
class ImportExportItem extends vscode.TreeItem {
    constructor(label, collapsibleState, files, iconPath, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.files = files;
        this.command = command;
        this.iconPath = iconPath;
        this.command = command;
    }
}
//# sourceMappingURL=treeViewProvider.js.map