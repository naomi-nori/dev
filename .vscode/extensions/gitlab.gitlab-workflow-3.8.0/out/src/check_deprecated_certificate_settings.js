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
const { openUrl } = require('./openers');
const WARNED_FLAG_NAME = 'warnedAboutCertDeprecation';
const checkDeprecatedCertificateSettings = (context) => __awaiter(void 0, void 0, void 0, function* () {
    const { ignoreCertificateErrors, ca, cert, certKey } = vscode.workspace.getConfiguration('gitlab');
    if ((ignoreCertificateErrors || ca || cert || certKey) &&
        !context.globalState.get(WARNED_FLAG_NAME)) {
        const response = yield vscode.window.showWarningMessage(`
You are using settings to set custom certificate for connecting to your GitLab instance.
This configuration is going to get removed in the next major version of GitLab Workflow extension.`, 'See more details', "Don't show again");
        if (response === "Don't show again") {
            context.globalState.update(WARNED_FLAG_NAME, true);
        }
        else if (response === 'See more details') {
            openUrl('https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/issues/247');
        }
    }
});
module.exports = checkDeprecatedCertificateSettings;
//# sourceMappingURL=check_deprecated_certificate_settings.js.map