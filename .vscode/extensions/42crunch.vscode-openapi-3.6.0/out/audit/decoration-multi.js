"use strict";
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
exports.decorationType = vscode.window.createTextEditorDecorationType({});
function createDecoration(issues) {
    const options = [];
    const issueLines = {};
    for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        const line = issue.range.start.line;
        const issuesPerLine = issueLines[line] ? issueLines[line] : [];
        issuesPerLine.push({ issue, issueId: i });
        issueLines[line] = issuesPerLine;
    }
    // sort
    for (const lineNo of Object.keys(issueLines)) {
        issueLines[lineNo].sort((a, b) => a.issue.score - b.issue.score);
    }
    for (const lineNo of Object.keys(issueLines)) {
        const lineNoInt = parseInt(lineNo, 10);
        const issueIds = issueLines[lineNo].map(({ issue, issueId }) => issueId);
        const commandUri = vscode.Uri.parse(`command:openapi.focusSecurityAuditById?${encodeURIComponent(JSON.stringify(issueIds))}`);
        const count = issueLines[lineNo].length;
        const markdown = `[View detailed report for ${count} OpenAPI issue(s)](${commandUri})`;
        const down = new vscode.MarkdownString(markdown);
        down.isTrusted = true;
        const range = new vscode.Range(new vscode.Position(lineNoInt, 0), new vscode.Position(lineNoInt, 160));
        const decoration = {
            range: range,
            hoverMessage: down,
        };
        options.push(decoration);
    }
    return options;
}
exports.createDecoration = createDecoration;
//# sourceMappingURL=decoration-multi.js.map