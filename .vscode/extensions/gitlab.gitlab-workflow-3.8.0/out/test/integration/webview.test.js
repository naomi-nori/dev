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
const vscode = require('vscode');
const sinon = require('sinon');
const EventEmitter = require('events');
const webviewController = require('../../src/webview_controller');
const { tokenService } = require('../../src/services/token_service');
const openIssueResponse = require('./fixtures/rest/open_issue.json');
const { getServer, createJsonEndpoint, createPostEndpoint, } = require('./test_infrastructure/mock_server');
const { GITLAB_URL } = require('./test_infrastructure/constants');
const waitForMessage = (panel, type) => new Promise(resolve => {
    const sub = panel.webview.onDidReceiveMessage(message => {
        if (message.type !== type)
            return;
        sub.dispose();
        resolve(message);
    });
});
describe('GitLab webview', () => {
    let server;
    let webviewPanel;
    const sandbox = sinon.createSandbox();
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        server = getServer([
            createJsonEndpoint(`/projects/${openIssueResponse.project_id}/issues/${openIssueResponse.iid}/discussions`, []),
            createJsonEndpoint(`/projects/${openIssueResponse.project_id}/issues/${openIssueResponse.iid}/resource_label_events`, []),
            createPostEndpoint(`/projects/${openIssueResponse.project_id}/issues/${openIssueResponse.iid}/notes`, {}),
        ]);
        yield tokenService.setToken(GITLAB_URL, 'abcd-secret');
    }));
    /*
    This method replaces the mechanism that the Webview panel uses for sending messages between
    the extension and the webview. This is necessary since we can't control the webview and so
    we need to be able to simulate events triggered by the webview and see that the extension
    handles them well.
    */
    const replacePanelEventSystem = () => {
        const { createWebviewPanel } = vscode.window;
        sandbox.stub(vscode.window, 'createWebviewPanel').callsFake((viewType, title, column) => {
            const panel = createWebviewPanel(viewType, title, column);
            const eventEmitter = new EventEmitter();
            sandbox
                .stub(panel.webview, 'postMessage')
                .callsFake(message => eventEmitter.emit('', message));
            sandbox.stub(panel.webview, 'onDidReceiveMessage').callsFake(listener => {
                eventEmitter.on('', listener);
                return { dispose: () => { } };
            });
            return panel;
        });
    };
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        server.resetHandlers();
        replacePanelEventSystem();
        webviewPanel = yield webviewController.create(openIssueResponse, vscode.workspace.workspaceFolders[0]);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sandbox.restore();
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        server.close();
        yield tokenService.setToken(GITLAB_URL, undefined);
    }));
    it('sends a message', () => __awaiter(void 0, void 0, void 0, function* () {
        webviewPanel.webview.postMessage({
            command: 'saveNote',
            issuable: openIssueResponse,
            note: 'Hello',
            noteType: { path: 'issues' },
        });
        const sentMessage = yield waitForMessage(webviewPanel, 'noteSaved');
        assert.strictEqual(sentMessage.type, 'noteSaved');
        assert.strictEqual(sentMessage.status, undefined);
    }));
});
//# sourceMappingURL=webview.test.js.map