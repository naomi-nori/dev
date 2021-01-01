"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentWorkspaceFolderOrSelectOne = exports.getCurrentWorkspaceFolder = void 0;
const vscode = require("vscode");
function getWorkspaceFolderForOpenEditor() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!(editor === null || editor === void 0 ? void 0 : editor.document.uri)) {
            return undefined;
        }
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        return workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri.fsPath;
    });
}
function getCurrentWorkspaceFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        const editorFolder = yield getWorkspaceFolderForOpenEditor();
        if (editorFolder) {
            return editorFolder;
        }
        const { workspaceFolders } = vscode.workspace;
        if (workspaceFolders && workspaceFolders.length === 1) {
            return workspaceFolders[0].uri.fsPath;
        }
        return null;
    });
}
exports.getCurrentWorkspaceFolder = getCurrentWorkspaceFolder;
function getCurrentWorkspaceFolderOrSelectOne() {
    return __awaiter(this, void 0, void 0, function* () {
        const editorFolder = yield getWorkspaceFolderForOpenEditor();
        if (editorFolder) {
            return editorFolder;
        }
        const { workspaceFolders } = vscode.workspace;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }
        if (workspaceFolders.length === 1) {
            return workspaceFolders[0].uri.fsPath;
        }
        const workspaceFolderOptions = workspaceFolders.map(folder => ({
            label: folder.name,
            uri: folder.uri.fsPath,
        }));
        const selectedFolder = yield vscode.window.showQuickPick(workspaceFolderOptions, {
            placeHolder: 'Select a workspace',
        });
        if (selectedFolder) {
            return selectedFolder.uri;
        }
        return null;
    });
}
exports.getCurrentWorkspaceFolderOrSelectOne = getCurrentWorkspaceFolderOrSelectOne;
//# sourceMappingURL=workspace_service.js.map