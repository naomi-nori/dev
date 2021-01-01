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
const { getCurrentWorkspaceFolderOrSelectOne } = require('./services/workspace_service');
const { createGitService } = require('./git_service_factory');
const { handleError } = require('./log');
const { VS_COMMANDS } = require('./command_names');
const openUrl = url => vscode.commands.executeCommand(VS_COMMANDS.OPEN, vscode.Uri.parse(url));
/**
 * Fetches user and project before opening a link.
 * Link can contain some placeholders which will be replaced by this method
 * with relevant information. Implemented placeholders below.
 *
 * $projectUrl
 * $userId
 *
 * An example link is `$projectUrl/issues?assignee_id=$userId` which will be
 * `gitlab.com/gitlab-org/gitlab-ce/issues?assignee_id=502136`.
 *
 * @param {string} linkTemplate
 */
function getLink(linkTemplate, workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield gitLabService.fetchCurrentUser();
        const project = yield gitLabService.fetchCurrentProject(workspaceFolder);
        return linkTemplate.replace('$userId', user.id).replace('$projectUrl', project.web_url);
    });
}
function openLink(linkTemplate, workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        yield openUrl(yield getLink(linkTemplate, workspaceFolder));
    });
}
function showIssues() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = yield getCurrentWorkspaceFolderOrSelectOne();
        yield openLink('$projectUrl/issues?assignee_id=$userId', workspaceFolder);
    });
}
function showMergeRequests() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = yield getCurrentWorkspaceFolderOrSelectOne();
        yield openLink('$projectUrl/merge_requests?assignee_id=$userId', workspaceFolder);
    });
}
function getActiveFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri).uri.fsPath;
        if (!editor) {
            vscode.window.showInformationMessage('GitLab Workflow: No open file.');
            return undefined;
        }
        let currentProject;
        try {
            currentProject = yield gitLabService.fetchCurrentProject(workspaceFolder);
        }
        catch (e) {
            handleError(e);
            return undefined;
        }
        const branchName = yield createGitService(workspaceFolder).fetchTrackingBranchName();
        const filePath = editor.document.uri.path.replace(`${workspaceFolder}/`, '');
        const fileUrl = `${currentProject.web_url}/blob/${branchName}/${filePath}`;
        let anchor = '';
        if (editor.selection) {
            const { start, end } = editor.selection;
            anchor = `#L${start.line + 1}`;
            if (end.line > start.line) {
                anchor += `-${end.line + 1}`;
            }
        }
        return `${fileUrl}${anchor}`;
    });
}
function openActiveFile() {
    return __awaiter(this, void 0, void 0, function* () {
        yield openUrl(yield getActiveFile());
    });
}
function copyLinkToActiveFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const fileUrl = yield getActiveFile();
        yield vscode.env.clipboard.writeText(fileUrl);
    });
}
function openCurrentMergeRequest() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = yield getCurrentWorkspaceFolderOrSelectOne();
        const mr = yield gitLabService.fetchOpenMergeRequestForCurrentBranch(workspaceFolder);
        if (mr) {
            yield openUrl(mr.web_url);
        }
    });
}
function openCreateNewIssue() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = yield getCurrentWorkspaceFolderOrSelectOne();
        openLink('$projectUrl/issues/new', workspaceFolder);
    });
}
function openCreateNewMr() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = yield getCurrentWorkspaceFolderOrSelectOne();
        const project = yield gitLabService.fetchCurrentProject(workspaceFolder);
        const branchName = yield createGitService(workspaceFolder).fetchTrackingBranchName();
        openUrl(`${project.web_url}/merge_requests/new?merge_request%5Bsource_branch%5D=${branchName}`);
    });
}
function openProjectPage() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = yield getCurrentWorkspaceFolderOrSelectOne();
        openLink('$projectUrl', workspaceFolder);
    });
}
function openCurrentPipeline(workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!workspaceFolder) {
            // Temporarily disable eslint to be able to start enforcing stricter rules
            // eslint-disable-next-line no-param-reassign
            workspaceFolder = yield getCurrentWorkspaceFolderOrSelectOne();
        }
        const project = yield gitLabService.fetchCurrentPipelineProject(workspaceFolder);
        if (project) {
            const pipeline = yield gitLabService.fetchLastPipelineForCurrentBranch(workspaceFolder);
            if (pipeline) {
                openUrl(`${project.web_url}/pipelines/${pipeline.id}`);
            }
        }
    });
}
function compareCurrentBranch() {
    return __awaiter(this, void 0, void 0, function* () {
        let project = null;
        let lastCommitId = null;
        const workspaceFolder = yield getCurrentWorkspaceFolderOrSelectOne();
        project = yield gitLabService.fetchCurrentProject(workspaceFolder);
        lastCommitId = yield createGitService(workspaceFolder).fetchLastCommitId();
        if (project && lastCommitId) {
            openUrl(`${project.web_url}/compare/master...${lastCommitId}`);
        }
    });
}
exports.openUrl = openUrl;
exports.showIssues = showIssues;
exports.showMergeRequests = showMergeRequests;
exports.openActiveFile = openActiveFile;
exports.copyLinkToActiveFile = copyLinkToActiveFile;
exports.openCurrentMergeRequest = openCurrentMergeRequest;
exports.openCreateNewIssue = openCreateNewIssue;
exports.openCreateNewMr = openCreateNewMr;
exports.openProjectPage = openProjectPage;
exports.openCurrentPipeline = openCurrentPipeline;
exports.compareCurrentBranch = compareCurrentBranch;
//# sourceMappingURL=openers.js.map