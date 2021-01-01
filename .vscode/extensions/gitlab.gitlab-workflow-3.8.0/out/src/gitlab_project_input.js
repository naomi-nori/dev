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
const gitLabService = require('./gitlab_service');
function showPicker(additionalEntries = [], placeHolder = 'Select a Gitlab Project') {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolderOptions = yield gitLabService.getAllGitlabProjects();
        additionalEntries.forEach(additionalEntry => {
            workspaceFolderOptions.push(additionalEntry);
        });
        if (workspaceFolderOptions.length === 0) {
            return null;
        }
        if (workspaceFolderOptions.length === 1) {
            return workspaceFolderOptions[0];
        }
        const workspaceFolder = yield vscode.window.showQuickPick(workspaceFolderOptions, {
            placeHolder,
        });
        if (workspaceFolder) {
            return workspaceFolder.uri;
        }
        return null;
    });
}
exports.show = showPicker;
//# sourceMappingURL=gitlab_project_input.js.map