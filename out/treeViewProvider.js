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
exports.ImportExportTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
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