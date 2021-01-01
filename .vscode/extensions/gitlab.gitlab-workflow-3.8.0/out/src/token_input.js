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
const { GITLAB_COM_URL } = require('./constants');
const { tokenService } = require('./services/token_service');
function showInput() {
    return __awaiter(this, void 0, void 0, function* () {
        const instance = yield vscode.window.showInputBox({
            ignoreFocusOut: true,
            value: GITLAB_COM_URL,
            placeHolder: 'E.g. https://gitlab.com',
            prompt: 'URL to Gitlab instance',
        });
        const token = yield vscode.window.showInputBox({
            ignoreFocusOut: true,
            password: true,
            placeHolder: 'Paste your GitLab Personal Access Token...',
        });
        if (instance && token) {
            yield tokenService.setToken(instance, token);
        }
    });
}
function removeTokenPicker() {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceUrls = tokenService.getInstanceUrls();
        const selectedInstanceUrl = yield vscode.window.showQuickPick(instanceUrls, {
            ignoreFocusOut: true,
            placeHolder: 'Select Gitlab instance for PAT removal',
        });
        if (selectedInstanceUrl) {
            yield tokenService.setToken(selectedInstanceUrl, undefined);
        }
    });
}
exports.showInput = showInput;
exports.removeTokenPicker = removeTokenPicker;
//# sourceMappingURL=token_input.js.map