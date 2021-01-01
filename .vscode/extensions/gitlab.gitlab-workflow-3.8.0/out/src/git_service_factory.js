"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGitService = void 0;
const vscode = require("vscode");
const git_service_1 = require("./git_service");
const token_service_1 = require("./services/token_service");
const log_1 = require("./log");
function createGitService(workspaceFolder) {
    const { instanceUrl, remoteName, pipelineGitRemoteName } = vscode.workspace.getConfiguration('gitlab');
    // the getConfiguration() returns null for missing attributes, we need to convert them to
    // undefined so that we can use optional properties and default function parameters
    return new git_service_1.GitService({
        workspaceFolder,
        instanceUrl: instanceUrl || undefined,
        remoteName: remoteName || undefined,
        pipelineGitRemoteName: pipelineGitRemoteName || undefined,
        tokenService: token_service_1.tokenService,
        log: log_1.log,
    });
}
exports.createGitService = createGitService;
//# sourceMappingURL=git_service_factory.js.map