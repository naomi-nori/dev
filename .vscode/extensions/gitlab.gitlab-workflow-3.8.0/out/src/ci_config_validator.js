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
const { showInformationMessage, showErrorMessage } = vscode.window;
function validate() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            showInformationMessage('GitLab Workflow: No open file.');
            return;
        }
        const content = editor.document.getText();
        const response = yield gitLabService.validateCIConfig(content);
        if (!response) {
            showInformationMessage('GitLab Workflow: Failed to validate CI configuration.');
            return;
        }
        const { status, errors, error } = response;
        if (status === 'valid') {
            showInformationMessage('GitLab Workflow: Your CI configuration is valid.');
        }
        else if (status === 'invalid') {
            if (errors[0]) {
                showErrorMessage(errors[0]);
            }
            showErrorMessage('GitLab Workflow: Invalid CI configuration.');
        }
        else if (error) {
            showErrorMessage(`GitLab Workflow: Failed to validate CI configuration. Reason: ${error}`);
        }
    });
}
exports.validate = validate;
//# sourceMappingURL=ci_config_validator.js.map