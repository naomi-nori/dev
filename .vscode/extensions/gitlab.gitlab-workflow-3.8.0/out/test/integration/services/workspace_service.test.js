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
const workspaceService = require('../../../src/services/workspace_service');
const { createAndOpenFile, closeAndDeleteFile, simulateQuickPickChoice, } = require('../test_infrastructure/helpers');
describe('workspace_service', () => {
    const sandbox = sinon.createSandbox();
    describe('one workspace, no open files', () => {
        it('getCurrentWorkspaceFolder returns workspace folder', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield workspaceService.getCurrentWorkspaceFolder();
            assert.strictEqual(result, vscode.workspace.workspaceFolders[0].uri.fsPath);
        }));
        it('getCurrentWorkspaceFolderOrSelectOne returns workspace folder', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield workspaceService.getCurrentWorkspaceFolderOrSelectOne();
            assert.strictEqual(result, vscode.workspace.workspaceFolders[0].uri.fsPath);
        }));
    });
    describe('multiple workspaces', () => {
        const fakeFolders = [
            {
                name: 'workspace 1',
                uri: { fsPath: '/ws1' },
            },
            {
                name: 'workspace 2',
                uri: { fsPath: '/ws2' },
            },
        ];
        let originalWorkspace;
        before(() => {
            [originalWorkspace] = vscode.workspace.workspaceFolders;
            sandbox.stub(vscode.workspace, 'workspaceFolders').get(() => fakeFolders);
        });
        after(() => {
            sandbox.restore();
        });
        it('getCurrentWorkspaceFolder returns null', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield workspaceService.getCurrentWorkspaceFolder();
            assert.strictEqual(result, null);
        }));
        it('getCurrentWorkspaceFolderOrSelectOne lets user select a workspace', () => __awaiter(void 0, void 0, void 0, function* () {
            // simulating user selecting second option
            simulateQuickPickChoice(sandbox, 1);
            const result = yield workspaceService.getCurrentWorkspaceFolderOrSelectOne();
            assert.strictEqual(result, '/ws2');
        }));
        describe('with open editor', () => {
            let testFileUri;
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                testFileUri = vscode.Uri.parse(`${originalWorkspace.uri.fsPath}/newfile.js`);
                yield createAndOpenFile(testFileUri);
            }));
            afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
                yield closeAndDeleteFile(testFileUri);
            }));
            it('getCurrentWorkspaceFolder returns workspace folder', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield workspaceService.getCurrentWorkspaceFolder();
                assert.strictEqual(result, originalWorkspace.uri.fsPath);
            }));
            it('getCurrentWorkspaceFolderOrSelectOne returns workspace folder', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield workspaceService.getCurrentWorkspaceFolderOrSelectOne();
                assert.strictEqual(result, originalWorkspace.uri.fsPath);
            }));
        });
    });
});
//# sourceMappingURL=workspace_service.test.js.map