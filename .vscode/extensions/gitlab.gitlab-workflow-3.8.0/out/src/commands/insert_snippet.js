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
exports.insertSnippet = void 0;
const vscode = require("vscode");
const gitlab_new_service_1 = require("../gitlab/gitlab_new_service");
const git_service_factory_1 = require("../git_service_factory");
const workspace_service_1 = require("../services/workspace_service");
const pickSnippet = (snippets) => __awaiter(void 0, void 0, void 0, function* () {
    const quickPickItems = snippets.map(s => ({
        label: s.title,
        description: s.description,
        detail: s.blobs.nodes.map(blob => blob.name).join(','),
        original: s,
    }));
    return vscode.window.showQuickPick(quickPickItems);
});
const pickBlob = (blobs) => __awaiter(void 0, void 0, void 0, function* () {
    const quickPickItems = blobs.map(b => ({
        label: b.name,
        original: b,
    }));
    const result = yield vscode.window.showQuickPick(quickPickItems);
    return result === null || result === void 0 ? void 0 : result.original;
});
exports.insertSnippet = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!vscode.window.activeTextEditor) {
        vscode.window.showInformationMessage('There is no open file.');
        return;
    }
    const workspaceFolder = yield workspace_service_1.getCurrentWorkspaceFolderOrSelectOne();
    if (!workspaceFolder) {
        return;
    }
    const gitService = git_service_factory_1.createGitService(workspaceFolder);
    const instanceUrl = yield gitService.fetchCurrentInstanceUrl();
    const gitLabService = new gitlab_new_service_1.GitLabNewService(instanceUrl);
    const remote = yield gitService.fetchGitRemote();
    if (!remote) {
        throw new Error('Could not get parsed remote for your workspace');
    }
    const snippets = yield gitLabService.getSnippets(`${remote.namespace}/${remote.project}`);
    if (snippets.length === 0) {
        vscode.window.showInformationMessage('There are no project snippets.');
        return;
    }
    const result = yield pickSnippet(snippets);
    if (!result) {
        return;
    }
    const blobs = result.original.blobs.nodes;
    const blob = blobs.length > 1 ? yield pickBlob(blobs) : blobs[0];
    if (!blob) {
        return;
    }
    const snippet = yield gitLabService.getSnippetContent(result.original, blob);
    const editor = vscode.window.activeTextEditor;
    yield editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.start, snippet);
    });
});
//# sourceMappingURL=insert_snippet.js.map