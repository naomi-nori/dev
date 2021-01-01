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
const statusBar = require('../../src/status_bar');
const { tokenService } = require('../../src/services/token_service');
const pipelinesResponse = require('./fixtures/rest/pipelines.json');
const pipelineResponse = require('./fixtures/rest/pipeline.json');
const { getServer, createJsonEndpoint } = require('./test_infrastructure/mock_server');
const { GITLAB_URL } = require('./test_infrastructure/constants');
const { USER_COMMANDS } = require('../../src/command_names');
describe('GitLab status bar', () => {
    let server;
    let returnedItems = [];
    const sandbox = sinon.createSandbox();
    const createFakeStatusBarItem = () => {
        const fakeItem = { show: sinon.spy(), hide: sinon.spy(), dispose: sinon.spy() };
        returnedItems.push(fakeItem);
        return fakeItem;
    };
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        server = getServer([
            createJsonEndpoint('/projects/278964/pipelines?ref=master', pipelinesResponse),
            createJsonEndpoint('/projects/278964/pipelines/47', pipelineResponse),
        ]);
        yield tokenService.setToken(GITLAB_URL, 'abcd-secret');
    }));
    beforeEach(() => {
        server.resetHandlers();
        sandbox.stub(vscode.window, 'createStatusBarItem').callsFake(createFakeStatusBarItem);
    });
    afterEach(() => {
        statusBar.dispose();
        sandbox.restore();
        returnedItems = [];
    });
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        server.close();
        yield tokenService.setToken(GITLAB_URL, undefined);
    }));
    it('shows the correct pipeline item', () => __awaiter(void 0, void 0, void 0, function* () {
        yield statusBar.init({ subscriptions: [] });
        assert.strictEqual(vscode.window.createStatusBarItem.firstCall.firstArg, vscode.StatusBarAlignment.Left);
        const pipelineItem = returnedItems[0];
        assert.strictEqual(pipelineItem.text, '$(check) GitLab: Pipeline passed');
        assert.strictEqual(pipelineItem.show.called, true);
        assert.strictEqual(pipelineItem.hide.called, false);
        assert.strictEqual(pipelineItem.command, USER_COMMANDS.PIPELINE_ACTIONS);
    }));
});
//# sourceMappingURL=status_bar.test.js.map