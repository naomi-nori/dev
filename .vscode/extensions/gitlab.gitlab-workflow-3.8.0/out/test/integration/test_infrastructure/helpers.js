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
exports.getWorkspaceFoder = exports.simulateQuickPickChoice = exports.closeAndDeleteFile = exports.createAndOpenFile = void 0;
const vscode = require("vscode");
exports.createAndOpenFile = (testFileUri) => __awaiter(void 0, void 0, void 0, function* () {
    const createFileEdit = new vscode.WorkspaceEdit();
    createFileEdit.createFile(testFileUri);
    yield vscode.workspace.applyEdit(createFileEdit);
    yield vscode.window.showTextDocument(testFileUri);
});
exports.closeAndDeleteFile = (testFileUri) => __awaiter(void 0, void 0, void 0, function* () {
    yield vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    const edit = new vscode.WorkspaceEdit();
    edit.deleteFile(testFileUri);
    yield vscode.workspace.applyEdit(edit);
});
exports.simulateQuickPickChoice = (sandbox, nthItem) => {
    sandbox.stub(vscode.window, 'showQuickPick').callsFake((options) => __awaiter(void 0, void 0, void 0, function* () {
        return (yield options)[nthItem];
    }));
};
exports.getWorkspaceFoder = () => {
    var _a;
    const folders = vscode.workspace.workspaceFolders;
    return folders && ((_a = folders[0]) === null || _a === void 0 ? void 0 : _a.uri.fsPath);
};
//# sourceMappingURL=helpers.js.map