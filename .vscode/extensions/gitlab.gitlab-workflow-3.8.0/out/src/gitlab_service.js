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
exports.fetchDiscussionsAndLabelEvents = exports.saveNote = exports.renderMarkdown = exports.fetchDiscussions = exports.fetchLabelEvents = exports.validateCIConfig = exports.createSnippet = exports.fetchMRIssues = exports.handlePipelineAction = exports.fetchOpenMergeRequestForCurrentBranch = exports.fetchLastJobsForCurrentBranch = exports.fetchIssuables = exports.fetchLastPipelineForCurrentBranch = exports.getAllGitlabProjects = exports.fetchVersion = exports.fetchCurrentUser = exports.fetchCurrentPipelineProject = exports.fetchCurrentProjectSwallowError = exports.fetchCurrentProject = void 0;
const vscode = require("vscode");
const request = require("request-promise");
const fs = require("fs");
const token_service_1 = require("./services/token_service");
const user_friendly_error_1 = require("./errors/user_friendly_error");
const api_error_1 = require("./errors/api_error");
const workspace_service_1 = require("./services/workspace_service");
const git_service_factory_1 = require("./git_service_factory");
const log_1 = require("./log");
const get_user_agent_header_1 = require("./utils/get_user_agent_header");
const custom_query_type_1 = require("./gitlab/custom_query_type");
const projectCache = {};
let versionCache = null;
function fetch(path, method = 'GET', data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ignoreCertificateErrors, ca, cert, certKey } = vscode.workspace.getConfiguration('gitlab');
        const instanceUrl = yield git_service_factory_1.createGitService(
        // fetching of instanceUrl is the only GitService method that doesn't need workspaceFolder
        // TODO: remove this default value once we implement https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/issues/260
        (yield workspace_service_1.getCurrentWorkspaceFolder()) || '').fetchCurrentInstanceUrl();
        const { proxy } = vscode.workspace.getConfiguration('http');
        const apiRoot = `${instanceUrl}/api/v4`;
        const glToken = token_service_1.tokenService.getToken(instanceUrl);
        const tokens = token_service_1.tokenService.getInstanceUrls().join(', ');
        if (!glToken) {
            let err = `
      GitLab Workflow: Cannot make request.
      GitLab URL for this workspace is set to ${instanceUrl}
      and there is no matching token for this URL.
    `;
            if (tokens.length) {
                err = `${err} You have configured tokens for ${tokens}.`;
            }
            vscode.window.showInformationMessage(err);
            throw new Error(err);
        }
        const config = {
            method,
            headers: Object.assign({ 'PRIVATE-TOKEN': glToken }, get_user_agent_header_1.getUserAgentHeader()),
            rejectUnauthorized: !ignoreCertificateErrors,
        };
        if (proxy) {
            config.proxy = proxy;
        }
        if (ca) {
            try {
                config.ca = fs.readFileSync(ca);
            }
            catch (e) {
                log_1.handleError(new user_friendly_error_1.UserFriendlyError(`Cannot read CA '${ca}'`, e));
            }
        }
        if (cert) {
            try {
                config.cert = fs.readFileSync(cert);
            }
            catch (e) {
                log_1.handleError(new user_friendly_error_1.UserFriendlyError(`Cannot read CA '${cert}'`, e));
            }
        }
        if (certKey) {
            try {
                config.key = fs.readFileSync(certKey);
            }
            catch (e) {
                log_1.handleError(new user_friendly_error_1.UserFriendlyError(`Cannot read CA '${certKey}'`, e));
            }
        }
        if (data) {
            config.formData = data;
        }
        config.transform = (body, response) => {
            try {
                return {
                    response: JSON.parse(body),
                    headers: response.headers,
                };
            }
            catch (e) {
                log_1.handleError(new user_friendly_error_1.UserFriendlyError('Failed to parse GitLab API response', e, `Response body: ${body}`));
                return { error: e };
            }
        };
        return yield request(`${apiRoot}${path}`, config);
    });
}
function fetchProjectData(remote) {
    return __awaiter(this, void 0, void 0, function* () {
        if (remote) {
            if (!(`${remote.namespace}_${remote.project}` in projectCache)) {
                const { namespace, project } = remote;
                const { response } = yield fetch(`/projects/${namespace.replace(/\//g, '%2F')}%2F${project}`);
                const projectData = response;
                projectCache[`${remote.namespace}_${remote.project}`] = projectData;
            }
            return projectCache[`${remote.namespace}_${remote.project}`] || null;
        }
        return null;
    });
}
function fetchCurrentProject(workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const remote = yield git_service_factory_1.createGitService(workspaceFolder).fetchGitRemote();
            return yield fetchProjectData(remote);
        }
        catch (e) {
            throw new api_error_1.ApiError(e, 'get current project');
        }
    });
}
exports.fetchCurrentProject = fetchCurrentProject;
function fetchCurrentProjectSwallowError(workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fetchCurrentProject(workspaceFolder);
        }
        catch (error) {
            log_1.logError(error);
            return null;
        }
    });
}
exports.fetchCurrentProjectSwallowError = fetchCurrentProjectSwallowError;
function fetchCurrentPipelineProject(workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const remote = yield git_service_factory_1.createGitService(workspaceFolder).fetchGitRemotePipeline();
            return yield fetchProjectData(remote);
        }
        catch (e) {
            log_1.logError(e);
            return null;
        }
    });
}
exports.fetchCurrentPipelineProject = fetchCurrentPipelineProject;
function fetchCurrentUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { response: user } = yield fetch('/user');
            return user;
        }
        catch (e) {
            throw new api_error_1.ApiError(e, 'get current user');
        }
    });
}
exports.fetchCurrentUser = fetchCurrentUser;
function fetchFirstUserByUsername(userName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { response: users } = yield fetch(`/users?username=${userName}`);
            return users[0];
        }
        catch (e) {
            log_1.handleError(new user_friendly_error_1.UserFriendlyError('Error when fetching GitLab user.', e));
            return undefined;
        }
    });
}
function fetchVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!versionCache) {
                const { response } = yield fetch('/version');
                versionCache = response.version;
            }
        }
        catch (e) {
            log_1.logError(e);
        }
        return versionCache;
    });
}
exports.fetchVersion = fetchVersion;
function getAllGitlabProjects() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode.workspace.workspaceFolders) {
            return [];
        }
        const projectsWithUri = vscode.workspace.workspaceFolders.map((workspaceFolder) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ({
                label: (_a = (yield fetchCurrentProject(workspaceFolder.uri.fsPath))) === null || _a === void 0 ? void 0 : _a.name,
                uri: workspaceFolder.uri.fsPath,
            });
        }));
        const fetchedProjectsWithUri = yield Promise.all(projectsWithUri);
        return fetchedProjectsWithUri.filter(p => p.label);
    });
}
exports.getAllGitlabProjects = getAllGitlabProjects;
function fetchLastPipelineForCurrentBranch(workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield fetchCurrentPipelineProject(workspaceFolder);
        let pipeline = null;
        if (project) {
            const branchName = yield git_service_factory_1.createGitService(workspaceFolder).fetchTrackingBranchName();
            const pipelinesRootPath = `/projects/${project.id}/pipelines`;
            const { response } = yield fetch(`${pipelinesRootPath}?ref=${branchName}`);
            const pipelines = response;
            if (pipelines.length) {
                const fetchResult = yield fetch(`${pipelinesRootPath}/${pipelines[0].id}`);
                pipeline = fetchResult.response;
            }
        }
        return pipeline;
    });
}
exports.fetchLastPipelineForCurrentBranch = fetchLastPipelineForCurrentBranch;
function fetchIssuables(params, workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const { type, scope, state, author, assignee, wip } = params;
        let { searchIn, pipelineId } = params;
        const config = {
            type: type || 'merge_requests',
            scope: scope || 'all',
            state: state || 'opened',
        };
        let issuable = null;
        const version = yield fetchVersion();
        if (!version) {
            return [];
        }
        const project = yield fetchCurrentProjectSwallowError(workspaceFolder);
        if (project) {
            if (config.type === 'vulnerabilities' && config.scope !== 'dismissed') {
                config.scope = 'all';
            }
            else if ((config.type === 'issues' || config.type === 'merge_requests') &&
                config.scope !== 'assigned_to_me' &&
                config.scope !== 'created_by_me') {
                config.scope = 'all';
            }
            // Normalize scope parameter for version < 11 instances.
            const [major] = version.split('.');
            if (parseInt(major, 10) < 11) {
                config.scope = config.scope.replace(/_/g, '-');
            }
            let path = '';
            if (config.type === 'epics') {
                if (project.namespace.kind === 'group') {
                    path = `/groups/${project.namespace.id}/${config.type}?include_ancestor_groups=true&state=${config.state}`;
                }
                else {
                    return [];
                }
            }
            else {
                const searchKind = config.type === custom_query_type_1.CustomQueryType.VULNERABILITY ? 'vulnerability_findings' : config.type;
                path = `/projects/${project.id}/${searchKind}?scope=${config.scope}&state=${config.state}`;
            }
            if (config.type === 'issues') {
                if (author) {
                    path = `${path}&author_username=${author}`;
                }
            }
            else if (author) {
                const authorUser = yield fetchFirstUserByUsername(author);
                if (authorUser) {
                    path = `${path}&author_id=${authorUser.id}`;
                }
                else {
                    path = `${path}&author_id=-1`;
                }
            }
            if (assignee === 'Any' || assignee === 'None') {
                path = `${path}&assignee_id=${assignee}`;
            }
            else if (assignee && config.type === 'issues') {
                path = `${path}&assignee_username=${assignee}`;
            }
            else if (assignee) {
                const assigneeUser = yield fetchFirstUserByUsername(assignee);
                if (assigneeUser) {
                    path = `${path}&assignee_id=${assigneeUser.id}`;
                }
                else {
                    path = `${path}&assignee_id=-1`;
                }
            }
            if (searchIn) {
                if (searchIn === 'all') {
                    searchIn = 'title,description';
                }
                path = `${path}&in=${searchIn}`;
            }
            if (config.type === 'merge_requests' && wip) {
                path = `${path}&wip=${wip}`;
            }
            let issueQueryParams = {};
            if (config.type === 'issues') {
                issueQueryParams = {
                    confidential: params.confidential,
                    'not[labels]': params.excludeLabels,
                    'not[milestone]': params.excludeMilestone,
                    'not[author_username]': params.excludeAuthor,
                    'not[assignee_username]': params.excludeAssignee,
                    'not[search]': params.excludeSearch,
                    'not[in]': params.excludeSearchIn,
                };
            }
            if (pipelineId) {
                if (pipelineId === 'branch') {
                    const workspace = yield workspace_service_1.getCurrentWorkspaceFolder();
                    if (workspace) {
                        pipelineId = yield fetchLastPipelineForCurrentBranch(workspace);
                    }
                }
                path = `${path}&pipeline_id=${pipelineId}`;
            }
            const queryParams = Object.assign({ labels: params.labels, milestone: params.milestone, search: params.search, created_before: params.createdBefore, created_after: params.createdAfter, updated_before: params.updatedBefore, updated_after: params.updatedAfter, order_by: params.orderBy, sort: params.sort, per_page: params.maxResults, report_type: params.reportTypes, severity: params.severityLevels, confidence: params.confidenceLevels }, issueQueryParams);
            const usedQueryParamNames = Object.keys(queryParams).filter(k => queryParams[k]);
            const urlQuery = usedQueryParamNames.reduce((acc, name) => `${acc}&${name}=${queryParams[name]}`, '');
            path = `${path}${urlQuery}`;
            const { response } = yield fetch(path);
            issuable = response;
        }
        return issuable;
    });
}
exports.fetchIssuables = fetchIssuables;
function fetchLastJobsForCurrentBranch(pipeline, workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield fetchCurrentPipelineProject(workspaceFolder);
        if (project) {
            const { response } = yield fetch(`/projects/${project.id}/pipelines/${pipeline.id}/jobs`);
            let jobs = response;
            // Gitlab return multiple jobs if you retry the pipeline we filter to keep only the last
            const alreadyProcessedJob = new Set();
            jobs = jobs.sort((one, two) => (one.created_at > two.created_at ? -1 : 1));
            jobs = jobs.filter(job => {
                if (alreadyProcessedJob.has(job.name)) {
                    return false;
                }
                alreadyProcessedJob.add(job.name);
                return true;
            });
            return jobs;
        }
        return null;
    });
}
exports.fetchLastJobsForCurrentBranch = fetchLastJobsForCurrentBranch;
function fetchOpenMergeRequestForCurrentBranch(workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield fetchCurrentProjectSwallowError(workspaceFolder);
        const branchName = yield git_service_factory_1.createGitService(workspaceFolder).fetchTrackingBranchName();
        const path = `/projects/${project === null || project === void 0 ? void 0 : project.id}/merge_requests?state=opened&source_branch=${branchName}`;
        const { response } = yield fetch(path);
        const mrs = response;
        if (mrs.length > 0) {
            return mrs[0];
        }
        return null;
    });
}
exports.fetchOpenMergeRequestForCurrentBranch = fetchOpenMergeRequestForCurrentBranch;
/**
 * Cancels or retries last pipeline or creates a new pipeline for current branch.
 *
 * @param {string} action create|retry|cancel
 */
function handlePipelineAction(action, workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const pipeline = yield fetchLastPipelineForCurrentBranch(workspaceFolder);
        const project = yield fetchCurrentProjectSwallowError(workspaceFolder);
        if (pipeline && project) {
            let endpoint = `/projects/${project.id}/pipelines/${pipeline.id}/${action}`;
            if (action === 'create') {
                const branchName = yield git_service_factory_1.createGitService(workspaceFolder).fetchTrackingBranchName();
                endpoint = `/projects/${project.id}/pipeline?ref=${branchName}`;
            }
            try {
                const { response } = yield fetch(endpoint, 'POST');
                return response;
            }
            catch (e) {
                throw new user_friendly_error_1.UserFriendlyError(`Failed to ${action} pipeline.`, e);
            }
        }
        else {
            vscode.window.showErrorMessage('GitLab Workflow: No project or pipeline found.');
            return undefined;
        }
    });
}
exports.handlePipelineAction = handlePipelineAction;
function fetchMRIssues(mrId, workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield fetchCurrentProjectSwallowError(workspaceFolder);
        let issues = [];
        if (project) {
            try {
                const { response } = yield fetch(`/projects/${project.id}/merge_requests/${mrId}/closes_issues`);
                issues = response;
            }
            catch (e) {
                log_1.logError(e);
            }
        }
        return issues;
    });
}
exports.fetchMRIssues = fetchMRIssues;
// TODO specify the correct interface when we convert `create_snippet.js`
function createSnippet(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let snippet;
        let path = '/snippets';
        if (data.id) {
            path = `/projects/${data.id}/snippets`;
        }
        try {
            const { response } = yield fetch(path, 'POST', data);
            snippet = response;
        }
        catch (e) {
            log_1.handleError(new user_friendly_error_1.UserFriendlyError('Failed to create your snippet.', e));
        }
        return snippet;
    });
}
exports.createSnippet = createSnippet;
function validateCIConfig(content) {
    return __awaiter(this, void 0, void 0, function* () {
        let validCIConfig = null;
        try {
            const { response } = yield fetch('/ci/lint', 'POST', { content });
            validCIConfig = response;
        }
        catch (e) {
            log_1.handleError(new user_friendly_error_1.UserFriendlyError('Failed to validate CI configuration.', e));
        }
        return validCIConfig;
    });
}
exports.validateCIConfig = validateCIConfig;
function fetchLabelEvents(issuable) {
    return __awaiter(this, void 0, void 0, function* () {
        let labelEvents = [];
        try {
            const type = issuable.sha ? 'merge_requests' : 'issues';
            const { response } = yield fetch(`/projects/${issuable.project_id}/${type}/${issuable.iid}/resource_label_events?sort=asc&per_page=100`);
            labelEvents = response;
        }
        catch (e) {
            log_1.handleError(new user_friendly_error_1.UserFriendlyError('Failed to fetch label events for this issuable.', e));
        }
        labelEvents.forEach(el => {
            // Temporarily disable eslint to be able to start enforcing stricter rules
            // eslint-disable-next-line no-param-reassign
            el.body = '';
        });
        return labelEvents;
    });
}
exports.fetchLabelEvents = fetchLabelEvents;
function fetchDiscussions(issuable, page = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        let discussions = [];
        try {
            const type = issuable.sha ? 'merge_requests' : 'issues';
            const { response, headers } = yield fetch(`/projects/${issuable.project_id}/${type}/${issuable.iid}/discussions?sort=asc&per_page=5&page=${page}`);
            discussions = response;
            if (page === 1 && headers['x-next-page'] !== '') {
                const pages = [];
                // Temporarily disable eslint to be able to start enforcing stricter rules
                // eslint-disable-next-line no-plusplus
                for (let i = 2; i <= headers['x-total-pages']; i++) {
                    pages.push(fetchDiscussions(issuable, i));
                }
                const results = yield Promise.all(pages);
                results.forEach(result => {
                    discussions = discussions.concat(result);
                });
            }
        }
        catch (e) {
            log_1.handleError(new user_friendly_error_1.UserFriendlyError('Failed to fetch discussions for this issuable.', e));
        }
        return discussions;
    });
}
exports.fetchDiscussions = fetchDiscussions;
function renderMarkdown(markdown, workspaceFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        let rendered = { html: markdown };
        const version = yield fetchVersion();
        if (!version) {
            return markdown;
        }
        const [major] = version.split('.');
        if (parseInt(major, 10) < 11) {
            return markdown;
        }
        try {
            const project = yield fetchCurrentProject(workspaceFolder);
            const { response } = yield fetch('/markdown', 'POST', {
                text: markdown,
                // eslint-disable-next-line camelcase
                project: project === null || project === void 0 ? void 0 : project.path_with_namespace,
                gfm: 'true',
            });
            rendered = response;
        }
        catch (e) {
            log_1.logError(e);
            return markdown;
        }
        return rendered.html;
    });
}
exports.renderMarkdown = renderMarkdown;
function saveNote(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projectId = params.issuable.project_id;
            const { iid } = params.issuable;
            const { path } = params.noteType;
            const { response } = yield fetch(`/projects/${projectId}/${path}/${iid}/notes`, 'POST', {
                body: params.note,
            });
            return response;
        }
        catch (e) {
            log_1.logError(e);
        }
        return { success: false };
    });
}
exports.saveNote = saveNote;
function isLabelEvent(object) {
    return Boolean(object.label);
}
function fetchDiscussionsAndLabelEvents(issuable) {
    return __awaiter(this, void 0, void 0, function* () {
        const [discussions, labelEvents] = yield Promise.all([
            fetchDiscussions(issuable),
            fetchLabelEvents(issuable),
        ]);
        const combinedEvents = [...discussions, ...labelEvents];
        combinedEvents.sort((a, b) => {
            const aCreatedAt = isLabelEvent(a) ? a.created_at : a.notes[0].created_at;
            const bCreatedAt = isLabelEvent(b) ? b.created_at : b.notes[0].created_at;
            return aCreatedAt < bCreatedAt ? -1 : 1;
        });
        return combinedEvents;
    });
}
exports.fetchDiscussionsAndLabelEvents = fetchDiscussionsAndLabelEvents;
//# sourceMappingURL=gitlab_service.js.map