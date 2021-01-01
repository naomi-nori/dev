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
const { setupServer } = require('msw/node');
const { rest, graphql } = require('msw');
const assert = require('assert');
const { API_URL_PREFIX, GITLAB_URL } = require('./test_infrastructure/constants');
const { tokenService } = require('../../src/services/token_service');
const gitLabService = require('../../src/gitlab_service');
const { GitLabNewService } = require('../../src/gitlab/gitlab_new_service');
const snippetsResponse = require('./fixtures/graphql/snippets.json');
const validateUserAgent = req => {
    const userAgent = req.headers.get('User-Agent');
    assert(userAgent.startsWith('vs-code-gitlab-workflow/'), `User-Agent header ${userAgent} must start with vs-code-gitlab-workflow/`);
};
describe('User-Agent header', () => {
    let server;
    let capturedRequest;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        server = setupServer(rest.get(`${API_URL_PREFIX}/user`, (req, res, ctx) => {
            capturedRequest = req;
            return res(ctx.status(200), ctx.json({}));
        }), graphql.query('GetSnippets', (req, res, ctx) => {
            capturedRequest = req;
            return res(ctx.data(snippetsResponse));
        }));
        server.listen();
        yield tokenService.setToken(GITLAB_URL, 'abcd-secret');
    }));
    beforeEach(() => {
        server.resetHandlers();
        capturedRequest = undefined;
    });
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        server.close();
        yield tokenService.setToken(GITLAB_URL, undefined);
    }));
    it('is sent with requests from GitLabService', () => __awaiter(void 0, void 0, void 0, function* () {
        yield gitLabService.fetchCurrentUser();
        validateUserAgent(capturedRequest);
    }));
    it('is sent with requests from GitLabNewService', () => __awaiter(void 0, void 0, void 0, function* () {
        const subject = new GitLabNewService(GITLAB_URL);
        yield subject.getSnippets('gitlab-org/gitlab');
        validateUserAgent(capturedRequest);
    }));
});
//# sourceMappingURL=user_agent.test.js.map