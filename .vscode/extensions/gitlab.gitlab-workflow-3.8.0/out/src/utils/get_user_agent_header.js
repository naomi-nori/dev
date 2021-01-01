"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAgentHeader = void 0;
const vscode = require("vscode");
exports.getUserAgentHeader = () => {
    var _a;
    const extension = vscode.extensions.getExtension('GitLab.gitlab-workflow');
    const extensionVersion = (_a = extension === null || extension === void 0 ? void 0 : extension.packageJSON) === null || _a === void 0 ? void 0 : _a.version;
    const nodePlatform = `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
    const vsCodeVersion = vscode.version;
    return {
        'User-Agent': `vs-code-gitlab-workflow/${extensionVersion} VSCode/${vsCodeVersion} ${nodePlatform}`,
    };
};
//# sourceMappingURL=get_user_agent_header.js.map