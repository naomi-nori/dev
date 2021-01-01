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
const assert = require('assert');
const sinon = require('sinon');
const vscode = require('vscode');
const simpleGit = require('simple-git');
const { graphql } = require('msw');
const { insertSnippet } = require('../../src/commands/insert_snippet');
const { tokenService } = require('../../src/services/token_service');
const snippetsResponse = require('./fixtures/graphql/snippets.json');
const { getServer, createTextEndpoint } = require('./test_infrastructure/mock_server');
const { GITLAB_URL, REMOTE } = require('./test_infrastructure/constants');
const { createAndOpenFile, closeAndDeleteFile, simulateQuickPickChoice, } = require('./test_infrastructure/helpers');
describe('Insert snippet', () => __awaiter(void 0, void 0, void 0, function* () {
    let server;
    let testFileUri;
    const sandbox = sinon.createSandbox();
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        server = getServer([
            createTextEndpoint('/projects/278964/snippets/111/files/master/test.js/raw', 'snippet content'),
            createTextEndpoint('/projects/278964/snippets/222/files/master/test2.js/raw', 'second blob content'),
            graphql.query('GetSnippets', (req, res, ctx) => {
                if (req.variables.projectPath === 'gitlab-org/gitlab')
                    return res(ctx.data(snippetsResponse));
                return res(ctx.data({ project: null }));
            }),
        ]);
        yield tokenService.setToken(GITLAB_URL, 'abcd-secret');
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        server.resetHandlers();
        testFileUri = vscode.Uri.parse(`${vscode.workspace.workspaceFolders[0].uri.fsPath}/newfile.js`);
        yield createAndOpenFile(testFileUri);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const git = simpleGit(vscode.workspace.workspaceFolders[0].uri.fsPath);
        yield git.removeRemote(REMOTE.NAME);
        yield git.addRemote(REMOTE.NAME, REMOTE.URL);
        sandbox.restore();
        yield closeAndDeleteFile(testFileUri);
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        server.close();
        yield tokenService.setToken(GITLAB_URL, undefined);
    }));
    it('inserts snippet when there is only one blob', () => __awaiter(void 0, void 0, void 0, function* () {
        simulateQuickPickChoice(sandbox, 0);
        yield insertSnippet();
        assert.strictEqual(vscode.window.activeTextEditor.document.getText(), 'snippet content');
    }));
    it('inserts snippet when there are multiple blobs', () => __awaiter(void 0, void 0, void 0, function* () {
        simulateQuickPickChoice(sandbox, 1);
        yield insertSnippet();
        assert.strictEqual(vscode.window.activeTextEditor.document.getText(), 'second blob content');
    }));
    it('throws an error when it cannot find GitLab project', () => __awaiter(void 0, void 0, void 0, function* () {
        const git = simpleGit(vscode.workspace.workspaceFolders[0].uri.fsPath);
        yield git.removeRemote(REMOTE.NAME);
        yield git.addRemote(REMOTE.NAME, 'git@test.gitlab.com:gitlab-org/nonexistent.git');
        yield assert.rejects(insertSnippet(), /Project gitlab-org\/nonexistent was not found./);
    }));
}));
//# sourceMappingURL=insert_snippet.test.js.map