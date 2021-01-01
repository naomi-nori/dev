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
exports.registerFocusSecurityAuditById = exports.registerFocusSecurityAudit = exports.registerSecurityAudit = void 0;
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
const path_1 = require("path");
const vscode = __importStar(require("vscode"));
const client_1 = require("./client");
const decoration_1 = require("./decoration");
const report_1 = require("./report");
const parser_options_1 = require("../parser-options");
const bundler_1 = require("../bundler");
const ast_1 = require("../ast");
function registerSecurityAudit(context, auditContext, pendingAudits) {
    return vscode.commands.registerTextEditorCommand('openapi.securityAudit', (textEditor, edit) => __awaiter(this, void 0, void 0, function* () {
        const uri = textEditor.document.uri.toString();
        if (pendingAudits[uri]) {
            vscode.window.showErrorMessage(`Audit for "${uri}" is already in progress`);
            return;
        }
        const existingAudit = auditContext[uri];
        if (existingAudit) {
            existingAudit.diagnostics.dispose();
        }
        delete auditContext[uri];
        pendingAudits[uri] = true;
        try {
            auditContext[uri] = yield securityAudit(context, textEditor);
            delete pendingAudits[uri];
        }
        catch (e) {
            delete pendingAudits[uri];
            vscode.window.showErrorMessage(`Failed to audit: ${e}`);
        }
    }));
}
exports.registerSecurityAudit = registerSecurityAudit;
function registerFocusSecurityAudit(context, auditContext) {
    return vscode.commands.registerCommand('openapi.focusSecurityAudit', (documentUri) => {
        const audit = auditContext[documentUri];
        if (audit) {
            report_1.ReportWebView.show(context.extensiontPath, audit);
        }
    });
}
exports.registerFocusSecurityAudit = registerFocusSecurityAudit;
function registerFocusSecurityAuditById(context, auditContext) {
    return vscode.commands.registerTextEditorCommand('openapi.focusSecurityAuditById', (textEditor, edit, params) => {
        const documentUri = textEditor.document.uri.toString();
        const uri = Buffer.from(params.uri, 'base64').toString('utf8');
        const audit = auditContext[uri];
        if (audit && audit.issues[documentUri]) {
            report_1.ReportWebView.showIds(context.extensionPath, audit, documentUri, params.ids);
        }
    });
}
exports.registerFocusSecurityAuditById = registerFocusSecurityAuditById;
function securityAudit(context, textEditor) {
    return __awaiter(this, void 0, void 0, function* () {
        const configuration = vscode.workspace.getConfiguration('openapi');
        let apiToken = configuration.get('securityAuditToken');
        if (!apiToken) {
            const email = yield vscode.window.showInputBox({
                prompt: 'Security Audit from 42Crunch runs ~200 checks for security best practices in your API. VS Code needs an API key to use the service. Enter your email to receive the token.',
                placeHolder: 'email address',
                validateInput: (value) => value.indexOf('@') > 0 && value.indexOf('@') < value.length - 1 ? null : 'Please enter valid email address',
            });
            if (!email) {
                return;
            }
            const tokenRequestResult = yield vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Requesting token' }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield client_1.requestToken(email);
                }
                catch (e) {
                    vscode.window.showErrorMessage('Unexpected error when trying to request token: ' + e);
                }
            }));
            if (!tokenRequestResult || tokenRequestResult.status !== 'success') {
                return;
            }
            const token = yield vscode.window.showInputBox({
                prompt: "API token has been sent. If you don't get the mail within a couple minutes, check your spam folder and that the address is correct. Paste the token above.",
                ignoreFocusOut: true,
                placeHolder: 'token',
            });
            if (!token) {
                return;
            }
            const configuration = vscode.workspace.getConfiguration();
            configuration.update('openapi.securityAuditToken', token, vscode.ConfigurationTarget.Global);
            apiToken = token;
        }
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Running API Contract Security Audit...',
            cancellable: false,
        }, (progress, cancellationToken) => __awaiter(this, void 0, void 0, function* () {
            return performAudit(context, textEditor, apiToken, progress);
        }));
    });
}
function performAudit(context, textEditor, apiToken, progress) {
    return __awaiter(this, void 0, void 0, function* () {
        const [json, mapping] = yield bundler_1.bundle(textEditor.document, parser_options_1.parserOptions);
        try {
            const documentUri = textEditor.document.uri.toString();
            const [grades, issues, documents] = yield auditDocument(textEditor.document, json, mapping, apiToken, progress);
            const diagnostics = createDiagnostics(path_1.basename(textEditor.document.fileName), documents, issues);
            const decorations = decoration_1.createDecorations(documentUri, issues);
            // set decorations for the current document
            if (decorations[documentUri]) {
                textEditor.setDecorations(decoration_1.decorationType, decorations[documentUri]);
            }
            const audit = {
                summary: Object.assign(Object.assign({}, grades), { documentUri, subdocumentUris: Object.keys(documents).filter((uri) => uri != documentUri) }),
                issues,
                diagnostics,
                decorations,
            };
            report_1.ReportWebView.show(context.extensionPath, audit);
            return audit;
        }
        catch (e) {
            if (e.statusCode && e.statusCode === 429) {
                vscode.window.showErrorMessage('Too many requests. You can run up to 3 security audits per minute, please try again later.');
            }
            else if (e.statusCode && e.statusCode === 403) {
                vscode.window.showErrorMessage('Authentication failed. Please paste the token that you received in email to Preferences > Settings > Extensions > OpenAPI > Security Audit Token. If you want to receive a new token instead, clear that setting altogether and initiate a new security audit for one of your OpenAPI files.');
            }
            else {
                vscode.window.showErrorMessage('Unexpected error when trying to audit API: ' + e);
            }
        }
    });
}
function parseDocument(document) {
    const [root, errors] = ast_1.parse(document.getText(), document.languageId, parser_options_1.parserOptions);
    // FIXME ignore errors for now, the file has been bundled so
    // errors here are mostly warnings
    //if (errors.length > 0) {
    //  throw new Error(`Unable to parse document: ${document.uri}`);
    //}
    return root;
}
function findIssueLocation(mainUri, root, mappings, pointer) {
    const node = root.find(pointer);
    if (node) {
        return [mainUri.toString(), pointer];
    }
    else {
        const mapping = bundler_1.findMapping(mappings, pointer);
        if (mapping) {
            const uri = mainUri.with({ path: mapping.file });
            return [uri.toString(), mapping.hash];
        }
    }
    throw new Error(`Cannot find entry for pointer: ${pointer}`);
}
function processIssues(document, mappings, issues) {
    return __awaiter(this, void 0, void 0, function* () {
        const mainUri = document.uri;
        const documentUris = { [mainUri.toString()]: true };
        const issuesPerDocument = {};
        const root = parseDocument(document);
        for (const issue of issues) {
            const [uri, pointer] = findIssueLocation(mainUri, root, mappings, issue.pointer);
            if (!issuesPerDocument[uri]) {
                issuesPerDocument[uri] = [];
            }
            if (!documentUris[uri]) {
                documentUris[uri] = true;
            }
            issuesPerDocument[uri].push(Object.assign(Object.assign({}, issue), { pointer: pointer }));
        }
        return [root, Object.keys(documentUris), issuesPerDocument];
    });
}
function auditDocument(mainDocument, json, mappings, apiToken, progress) {
    return __awaiter(this, void 0, void 0, function* () {
        const [grades, issues] = yield client_1.audit(json, apiToken.trim(), progress);
        const [mainRoot, documentUris, issuesPerDocument] = yield processIssues(mainDocument, mappings, issues);
        const files = {
            [mainDocument.uri.toString()]: [mainDocument, mainRoot],
        };
        const markerNode = mainRoot.find('/openapi') || mainRoot.find('/swagger');
        // load and parse all documents
        for (const uri of documentUris) {
            if (!files[uri]) {
                const document = yield vscode.workspace.openTextDocument(vscode.Uri.parse(uri));
                const root = parseDocument(document);
                files[uri] = [document, root];
            }
        }
        for (const [uri, issues] of Object.entries(issuesPerDocument)) {
            const [document, root] = files[uri];
            for (const issue of issues) {
                // '' applies only to main document
                const node = issue.pointer === '' ? markerNode : root.find(issue.pointer);
                if (node) {
                    const [start, end] = node.getRange();
                    const position = document.positionAt(start);
                    const line = document.lineAt(position.line);
                    issue.lineNo = position.line;
                    issue.range = new vscode.Range(new vscode.Position(position.line, line.firstNonWhitespaceCharacterIndex), new vscode.Position(position.line, line.range.end.character));
                }
                else {
                    throw new Error(`Unable to locate node: ${issue.pointer}`);
                }
            }
        }
        const documents = {};
        for (const [uri, [document, root]] of Object.entries(files)) {
            documents[uri] = document;
        }
        return [grades, issuesPerDocument, documents];
    });
}
function createDiagnostics(filename, documents, issues) {
    const diagnostics = vscode.languages.createDiagnosticCollection();
    const criticalityToSeverity = {
        1: vscode.DiagnosticSeverity.Hint,
        2: vscode.DiagnosticSeverity.Information,
        3: vscode.DiagnosticSeverity.Warning,
        4: vscode.DiagnosticSeverity.Error,
        5: vscode.DiagnosticSeverity.Error,
    };
    for (const [uri, document] of Object.entries(documents)) {
        if (issues[uri]) {
            const messages = issues[uri].map((issue) => ({
                source: `audit of ${filename}`,
                code: '',
                message: `${issue.description} ${issue.displayScore !== '0' ? `(score impact ${issue.displayScore})` : ''}`,
                severity: criticalityToSeverity[issue.criticality],
                range: issue.range,
            }));
            diagnostics.set(document.uri, messages);
        }
    }
    return diagnostics;
}
//# sourceMappingURL=commands.js.map