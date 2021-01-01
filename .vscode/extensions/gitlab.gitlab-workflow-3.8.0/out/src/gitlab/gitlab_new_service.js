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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabNewService = void 0;
const vscode = require("vscode");
const graphql_request_1 = require("graphql-request");
const cross_fetch_1 = require("cross-fetch");
const url_1 = require("url");
const createHttpProxyAgent = require("https-proxy-agent");
const token_service_1 = require("../services/token_service");
const fetch_error_1 = require("../errors/fetch_error");
const get_user_agent_header_1 = require("../utils/get_user_agent_header");
const queryGetSnippets = graphql_request_1.gql `
  query GetSnippets($projectPath: ID!) {
    project(fullPath: $projectPath) {
      id
      snippets {
        nodes {
          id
          title
          description
          blobs {
            nodes {
              name
              path
            }
          }
        }
      }
    }
  }
`;
class GitLabNewService {
    constructor(instanceUrl) {
        this.instanceUrl = instanceUrl;
        const endpoint = new url_1.URL('/api/graphql', this.instanceUrl).href;
        this.client = new graphql_request_1.GraphQLClient(endpoint, this.fetchOptions);
    }
    get fetchOptions() {
        const token = token_service_1.tokenService.getToken(this.instanceUrl);
        const { proxy } = vscode.workspace.getConfiguration('http');
        const agent = proxy ? createHttpProxyAgent(proxy) : undefined;
        return {
            headers: Object.assign({ Authorization: `Bearer ${token}` }, get_user_agent_header_1.getUserAgentHeader()),
            agent,
        };
    }
    getSnippets(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.request(queryGetSnippets, {
                projectPath,
            });
            const { project } = result;
            // this can mean three things: project doesn't exist, user doesn't have access, or user credentials are wrong
            // https://gitlab.com/gitlab-org/gitlab/-/issues/270055
            if (!project) {
                throw new Error(`Project ${projectPath} was not found. You might not have permissions to see it.`);
            }
            const snippets = project.snippets.nodes;
            // each snippet has to contain projectId so we can make REST API call for the content
            return snippets.map(sn => (Object.assign(Object.assign({}, sn), { projectId: project.id })));
        });
    }
    // TODO change this method to use GraphQL when https://gitlab.com/gitlab-org/gitlab/-/issues/260316 is done
    getSnippetContent(snippet, blob) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectId = snippet.projectId.replace('gid://gitlab/Project/', '');
            const snippetId = snippet.id.replace('gid://gitlab/ProjectSnippet/', '');
            const url = `${this.instanceUrl}/api/v4/projects/${projectId}/snippets/${snippetId}/files/master/${blob.path}/raw`;
            const result = yield cross_fetch_1.default(url, this.fetchOptions);
            if (!result.ok) {
                throw new fetch_error_1.FetchError(`Fetching snippet from ${url} failed`, result);
            }
            return result.text();
        });
    }
    // This method has to use REST API till https://gitlab.com/gitlab-org/gitlab/-/issues/280803 gets done
    getMrDiff(mr) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionsUrl = `${this.instanceUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}/versions`;
            const versionsResult = yield cross_fetch_1.default(versionsUrl, this.fetchOptions);
            if (!versionsResult.ok) {
                throw new fetch_error_1.FetchError(`Fetching versions from ${versionsUrl} failed`, versionsResult);
            }
            const versions = yield versionsResult.json();
            const lastVersion = versions[0];
            const lastVersionUrl = `${this.instanceUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}/versions/${lastVersion.id}`;
            const diffResult = yield cross_fetch_1.default(lastVersionUrl, this.fetchOptions);
            if (!diffResult.ok) {
                throw new fetch_error_1.FetchError(`Fetching MR diff from ${lastVersionUrl} failed`, diffResult);
            }
            return diffResult.json();
        });
    }
    getFileContent(path, ref, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pathWithoutFirstSlash = path.replace(/^\//, '');
            const encodedPath = encodeURIComponent(pathWithoutFirstSlash);
            const fileUrl = `${this.instanceUrl}/api/v4/projects/${projectId}/repository/files/${encodedPath}/raw?ref=${ref}`;
            const fileResult = yield cross_fetch_1.default(fileUrl, this.fetchOptions);
            if (!fileResult.ok) {
                throw new fetch_error_1.FetchError(`Fetching file from ${fileUrl} failed`, fileResult);
            }
            return fileResult.text();
        });
    }
}
exports.GitLabNewService = GitLabNewService;
//# sourceMappingURL=gitlab_new_service.js.map