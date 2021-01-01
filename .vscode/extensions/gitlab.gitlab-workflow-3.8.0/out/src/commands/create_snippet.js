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
const vscode = require('vscode');
const openers = require('../openers');
const gitLabService = require('../gitlab_service');
const gitlabProjectInput = require('../gitlab_project_input');
const { getCurrentWorkspaceFolder } = require('../services/workspace_service');
const visibilityOptions = [
    {
        label: 'Public',
        type: 'public',
    },
    {
        label: 'Internal',
        type: 'internal',
    },
    {
        label: 'Private',
        type: 'private',
    },
];
const contextOptions = [
    {
        label: 'Snippet from file',
        type: 'file',
    },
    {
        label: 'Snippet from selection',
        type: 'selection',
    },
];
function uploadSnippet(project, editor, visibility, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = '';
        const fileName = editor.document.fileName.split('/').reverse()[0];
        if (context === 'selection' && editor.selection) {
            const { start, end } = editor.selection;
            const endLine = end.line + 1;
            const startPos = new vscode.Position(start.line, 0);
            const endPos = new vscode.Position(endLine, 0);
            const range = new vscode.Range(startPos, endPos);
            content = editor.document.getText(range);
        }
        else {
            content = editor.document.getText();
        }
        const data = {
            title: fileName,
            file_name: fileName,
            visibility,
        };
        data.content = content;
        if (project) {
            data.id = project.id;
        }
        const snippet = yield gitLabService.createSnippet(data);
        openers.openUrl(snippet.web_url);
    });
}
function createSnippet() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        let workspaceFolder = null;
        let project = null;
        if (editor) {
            workspaceFolder = yield getCurrentWorkspaceFolder();
            project = yield gitLabService.fetchCurrentProjectSwallowError(workspaceFolder);
            if (project == null) {
                workspaceFolder = yield gitlabProjectInput.show([
                    {
                        label: "User's Snippets",
                        uri: '',
                    },
                ], "Select a Gitlab Project or use the User's Snippets");
                project = yield gitLabService.fetchCurrentProjectSwallowError(workspaceFolder);
            }
            const visibility = yield vscode.window.showQuickPick(visibilityOptions);
            if (visibility) {
                const context = yield vscode.window.showQuickPick(contextOptions);
                if (context) {
                    uploadSnippet(project, editor, visibility.type, context.type);
                }
            }
        }
        else {
            vscode.window.showInformationMessage('GitLab Workflow: No open file.');
        }
    });
}
module.exports = {
    createSnippet,
};
//# sourceMappingURL=create_snippet.js.map