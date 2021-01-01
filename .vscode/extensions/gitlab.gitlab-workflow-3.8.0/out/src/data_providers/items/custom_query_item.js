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
exports.CustomQueryItem = void 0;
const vscode = require("vscode");
const gitLabService = require("../../gitlab_service");
const log_1 = require("../../log");
const error_item_1 = require("./error_item");
const mr_item_1 = require("./mr_item");
const external_url_item_1 = require("./external_url_item");
const issue_item_1 = require("./issue_item");
const vulnerability_item_1 = require("./vulnerability_item");
const custom_query_type_1 = require("../../gitlab/custom_query_type");
class CustomQueryItem extends vscode.TreeItem {
    constructor(customQuery, project, showProject = false) {
        super(showProject ? project.label : customQuery.name, vscode.TreeItemCollapsibleState.Collapsed);
        this.project = project;
        this.customQuery = customQuery;
        this.iconPath = showProject ? new vscode.ThemeIcon('project') : new vscode.ThemeIcon('filter');
    }
    getProjectIssues() {
        return __awaiter(this, void 0, void 0, function* () {
            const issues = yield gitLabService.fetchIssuables(this.customQuery, this.project.uri);
            if (issues.length === 0) {
                const noItemText = this.customQuery.noItemText || 'No items found.';
                return [new vscode.TreeItem(noItemText)];
            }
            const { MR, ISSUE, SNIPPET, EPIC, VULNERABILITY } = custom_query_type_1.CustomQueryType;
            switch (this.customQuery.type) {
                case MR:
                    return issues.map((mr) => new mr_item_1.MrItem(mr, this.project));
                case ISSUE:
                    return issues.map((issue) => new issue_item_1.IssueItem(issue, this.project));
                case SNIPPET:
                    return issues.map((snippet) => new external_url_item_1.ExternalUrlItem(`$${snippet.id} · ${snippet.title}`, snippet.web_url));
                case EPIC:
                    return issues.map((epic) => new external_url_item_1.ExternalUrlItem(`&${epic.iid} · ${epic.title}`, epic.web_url));
                case VULNERABILITY:
                    return issues.map((v) => new vulnerability_item_1.VulnerabilityItem(v));
                default:
                    throw new Error(`unknown custom query type ${this.customQuery.type}`);
            }
        });
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.getProjectIssues();
            }
            catch (e) {
                log_1.handleError(e);
                return [new error_item_1.ErrorItem()];
            }
        });
    }
}
exports.CustomQueryItem = CustomQueryItem;
//# sourceMappingURL=custom_query_item.js.map