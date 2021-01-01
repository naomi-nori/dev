"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueItem = void 0;
const vscode_1 = require("vscode");
const command_names_1 = require("../../command_names");
class IssueItem extends vscode_1.TreeItem {
    constructor(issue, project) {
        super(`#${issue.iid} · ${issue.title}`);
        this.issue = issue;
        this.project = project;
        this.command = {
            command: command_names_1.PROGRAMMATIC_COMMANDS.SHOW_RICH_CONTENT,
            arguments: [this.issue, this.project.uri],
            title: 'Show Issue',
        };
    }
}
exports.IssueItem = IssueItem;
//# sourceMappingURL=issue_item.js.map