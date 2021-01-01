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
const moment = require('moment');
const gitLabService = require('../gitlab_service');
const { ErrorItem } = require('./items/error_item');
const { getCurrentWorkspaceFolder } = require('../services/workspace_service');
const { handleError, logError } = require('../log');
const { MrItem } = require('./items/mr_item');
const { IssueItem } = require('./items/issue_item');
const { ExternalUrlItem } = require('./items/external_url_item');
class DataProvider {
    constructor() {
        this.eventEmitter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.eventEmitter.event;
        this.project = null;
        this.mr = null;
    }
    fetchPipeline(workspaceFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            let pipeline;
            try {
                pipeline = yield gitLabService.fetchLastPipelineForCurrentBranch(workspaceFolder);
            }
            catch (e) {
                logError(e);
                return new ErrorItem('Fetching pipeline failed');
            }
            if (!pipeline) {
                return new vscode.TreeItem('No pipeline found');
            }
            const statusText = pipeline.status === 'success' ? 'passed' : pipeline.status;
            const actions = {
                running: 'Started',
                pending: 'Created',
                success: 'Finished',
                failed: 'Failed',
                canceled: 'Canceled',
                skipped: 'Skipped',
            };
            const timeAgo = moment(pipeline.updated_at).fromNow();
            const actionText = actions[pipeline.status] || '';
            const message = `Pipeline #${pipeline.id} ${statusText} · ${actionText} ${timeAgo}`;
            const url = `${this.project.web_url}/pipelines/${pipeline.id}`;
            return new ExternalUrlItem(message, url);
        });
    }
    fetchMR(workspaceFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            let mr;
            try {
                mr = yield gitLabService.fetchOpenMergeRequestForCurrentBranch(workspaceFolder);
            }
            catch (e) {
                logError(e);
                return new ErrorItem('Fetching MR failed');
            }
            if (mr) {
                this.mr = mr;
                return new MrItem(this.mr, this.project);
            }
            return new vscode.TreeItem('No merge request found');
        });
    }
    fetchClosingIssue(workspaceFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mr) {
                const issues = yield gitLabService.fetchMRIssues(this.mr.iid, workspaceFolder);
                if (issues.length) {
                    return issues.map(issue => new IssueItem(issue, this.project));
                }
            }
            return [new vscode.TreeItem('No closing issue found')];
        });
    }
    getChildren(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (item)
                return item.getChildren();
            try {
                const workspaceFolder = yield getCurrentWorkspaceFolder();
                this.project = yield gitLabService.fetchCurrentProject(workspaceFolder);
                const pipelineItem = yield this.fetchPipeline(workspaceFolder);
                const mrItem = yield this.fetchMR(workspaceFolder);
                const closingIssuesItems = yield this.fetchClosingIssue(workspaceFolder);
                return [pipelineItem, mrItem, ...closingIssuesItems];
            }
            catch (e) {
                handleError(e);
                return [new ErrorItem()];
            }
        });
    }
    // eslint-disable-next-line class-methods-use-this
    getTreeItem(item) {
        return item;
    }
    refresh() {
        this.eventEmitter.fire();
    }
}
exports.DataProvider = DataProvider;
//# sourceMappingURL=current_branch.js.map