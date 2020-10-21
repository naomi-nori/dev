"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDecorations = exports.decorationType = void 0;
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
const path_1 = require("path");
const vscode = __importStar(require("vscode"));
exports.decorationType = vscode.window.createTextEditorDecorationType({});
function createDecorations(mainUri, issues) {
    const mainFilename = path_1.basename(vscode.Uri.parse(mainUri).fsPath);
    const decorations = {};
    for (const [uri, issuez] of Object.entries(issues)) {
        decorations[uri] = createDecoration(mainUri, mainFilename, issuez);
    }
    return decorations;
}
exports.createDecorations = createDecorations;
function createDecoration(mainUri, mainFilename, issues) {
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
        const base64Uri = Buffer.from(mainUri).toString('base64');
        const params = {
            ids: issueIds,
            uri: base64Uri,
        };
        const commandUri = vscode.Uri.parse(`command:openapi.focusSecurityAuditById?${encodeURIComponent(JSON.stringify(params))}`);
        const count = issueLines[lineNo].length;
        const markdown = `[View detailed report for ${count} OpenAPI issue(s) in audit of ${mainFilename}](${commandUri})`;
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
//# sourceMappingURL=decoration.js.map