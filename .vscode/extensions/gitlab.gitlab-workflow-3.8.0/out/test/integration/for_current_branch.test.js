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
const CurrentBranchDataProvider = require('../../src/data_providers/current_branch').DataProvider;
const { tokenService } = require('../../src/services/token_service');
const openIssueResponse = require('./fixtures/rest/open_issue.json');
const pipelinesResponse = require('./fixtures/rest/pipelines.json');
const pipelineResponse = require('./fixtures/rest/pipeline.json');
const openMergeRequestResponse = require('./fixtures/rest/open_mr.json');
const { getServer, createQueryJsonEndpoint, createJsonEndpoint, } = require('./test_infrastructure/mock_server');
const { GITLAB_URL } = require('./test_infrastructure/constants');
describe('GitLab tree view for current branch', () => {
    let server;
    let dataProvider;
    const pipelinesEndpoint = createQueryJsonEndpoint('/projects/278964/pipelines', {
        '?ref=master': pipelinesResponse,
    });
    const pipelineEndpoint = createJsonEndpoint('/projects/278964/pipelines/47', pipelineResponse);
    const mrEndpoint = createQueryJsonEndpoint('/projects/278964/merge_requests', {
        '?state=opened&source_branch=master': [openMergeRequestResponse],
    });
    const issueEndpoint = createJsonEndpoint('/projects/278964/merge_requests/33824/closes_issues', [
        openIssueResponse,
    ]);
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        yield tokenService.setToken(GITLAB_URL, 'abcd-secret');
    }));
    beforeEach(() => {
        dataProvider = new CurrentBranchDataProvider();
    });
    afterEach(() => {
        server.close();
    });
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield tokenService.setToken(GITLAB_URL, undefined);
    }));
    it('shows pipeline, mr and closing issue for the current branch', () => __awaiter(void 0, void 0, void 0, function* () {
        server = getServer([pipelinesEndpoint, pipelineEndpoint, mrEndpoint, issueEndpoint]);
        const forCurrentBranch = yield dataProvider.getChildren();
        assert.deepStrictEqual(forCurrentBranch.map(i => i.label), [
            'Pipeline #47 passed · Finished 4 years ago',
            '!33824 · Web IDE - remove unused actions (mappings)',
            '#219925 · Change primary button for editing on files',
        ]);
    }));
    it('handles error for pipeline API request', () => __awaiter(void 0, void 0, void 0, function* () {
        server = getServer([mrEndpoint, issueEndpoint]);
        const forCurrentBranch = yield dataProvider.getChildren();
        assert.deepStrictEqual(forCurrentBranch.map(i => i.label), [
            'Fetching pipeline failed',
            '!33824 · Web IDE - remove unused actions (mappings)',
            '#219925 · Change primary button for editing on files',
        ]);
    }));
    it('handles error for MR API request', () => __awaiter(void 0, void 0, void 0, function* () {
        server = getServer([pipelinesEndpoint, pipelineEndpoint]);
        const forCurrentBranch = yield dataProvider.getChildren();
        assert.deepStrictEqual(forCurrentBranch.map(i => i.label), [
            'Pipeline #47 passed · Finished 4 years ago',
            'Fetching MR failed',
            'No closing issue found',
        ]);
    }));
    it('handles error for issue API request', () => __awaiter(void 0, void 0, void 0, function* () {
        server = getServer([pipelinesEndpoint, pipelineEndpoint, mrEndpoint]);
        const forCurrentBranch = yield dataProvider.getChildren();
        assert.deepStrictEqual(forCurrentBranch.map(i => i.label), [
            'Pipeline #47 passed · Finished 4 years ago',
            '!33824 · Web IDE - remove unused actions (mappings)',
            'No closing issue found',
        ]);
    }));
});
//# sourceMappingURL=for_current_branch.test.js.map