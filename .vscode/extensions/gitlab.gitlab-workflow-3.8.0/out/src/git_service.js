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
exports.GitService = void 0;
const execa = require("execa");
const url = require("url");
const constants_1 = require("./constants");
const git_remote_parser_1 = require("./git/git_remote_parser");
class GitService {
    constructor(options) {
        this.instanceUrl = options.instanceUrl;
        this.remoteName = options.remoteName;
        this.pipelineGitRemoteName = options.pipelineGitRemoteName;
        this.workspaceFolder = options.workspaceFolder;
        this.tokenService = options.tokenService;
        this.log = options.log;
    }
    fetch(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            const [git, ...args] = cmd.trim().split(' ');
            let currentWorkspaceFolder = this.workspaceFolder;
            if (currentWorkspaceFolder == null) {
                currentWorkspaceFolder = '';
            }
            try {
                const { stdout } = yield execa(git, args, {
                    cwd: currentWorkspaceFolder,
                    preferLocal: false,
                });
                return stdout;
            }
            catch (e) {
                this.log(`${e.message}\n${e.stack}`);
            }
            return null;
        });
    }
    fetchRemoteUrl(remoteName = '') {
        return __awaiter(this, void 0, void 0, function* () {
            // If remote name isn't provided, the command returns default remote for the current branch
            const getUrlForRemoteName = (name) => __awaiter(this, void 0, void 0, function* () { return this.fetch(`git ls-remote --get-url ${name}`); });
            const getFirstRemoteName = () => __awaiter(this, void 0, void 0, function* () {
                const multilineRemotes = yield this.fetch('git remote');
                return (multilineRemotes || '').split('\n')[0];
            });
            let remoteUrl = yield getUrlForRemoteName(remoteName);
            if (!remoteUrl) {
                // If there's no remote now, that means that there's no origin and no `remote.pushDefault` config.
                remoteUrl = yield getUrlForRemoteName(yield getFirstRemoteName());
            }
            if (remoteUrl) {
                return git_remote_parser_1.parseGitRemote(yield this.fetchCurrentInstanceUrl(), remoteUrl);
            }
            return null;
        });
    }
    fetchGitRemote() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchRemoteUrl(this.remoteName);
        });
    }
    fetchBranchName() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch('git rev-parse --abbrev-ref HEAD');
        });
    }
    fetchLastCommitId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch('git log --format=%H -n 1');
        });
    }
    fetchGitRemotePipeline() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetchRemoteUrl(this.pipelineGitRemoteName);
        });
    }
    /**
     * Fetches remote tracking branch name of current branch.
     * This should be used in link openers.
     *
     * Fixes #1 where local branch name is renamed and doesn't exists on remote but
     * local branch still tracks another branch on remote.
     */
    fetchTrackingBranchName() {
        return __awaiter(this, void 0, void 0, function* () {
            const branchName = yield this.fetchBranchName();
            try {
                const ref = yield this.fetch(`git config --get branch.${branchName}.merge`);
                if (ref) {
                    return ref.replace('refs/heads/', '');
                }
            }
            catch (e) {
                this.log(`Couldn't find tracking branch. Extension will fallback to branch name ${branchName}`);
                this.log(`${e.message}\n${e.stack}`);
            }
            return branchName;
        });
    }
    fetchGitRemoteUrls() {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchGitRemotesVerbose = () => __awaiter(this, void 0, void 0, function* () {
                const output = yield this.fetch('git remote -v');
                return (output || '').split('\n');
            });
            const parseRemoteFromVerboseLine = (line) => {
                // git remote -v output looks like
                // origin[TAB]git@gitlab.com:gitlab-org/gitlab-vscode-extension.git[WHITESPACE](fetch)
                // the interesting part is surrounded by a tab symbol and a whitespace
                return line.split(/\t| /)[1];
            };
            const remotes = yield fetchGitRemotesVerbose();
            const remoteUrls = remotes.map(remote => parseRemoteFromVerboseLine(remote)).filter(Boolean);
            // git remote -v returns a (fetch) and a (push) line for each remote,
            // so we need to remove duplicates
            return [...new Set(remoteUrls)];
        });
    }
    intersectionOfInstanceAndTokenUrls() {
        return __awaiter(this, void 0, void 0, function* () {
            const uriHostname = (uri) => url.parse(uri).host;
            const instanceUrls = this.tokenService.getInstanceUrls();
            const gitRemotes = yield this.fetchGitRemoteUrls();
            const gitRemoteHosts = gitRemotes.map(uriHostname);
            return instanceUrls.filter(host => gitRemoteHosts.includes(uriHostname(host)));
        });
    }
    heuristicInstanceUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            // if the intersection of git remotes and configured PATs exists and is exactly
            // one hostname, use it
            const intersection = yield this.intersectionOfInstanceAndTokenUrls();
            if (intersection.length === 1) {
                const heuristicUrl = intersection[0];
                this.log(`Found ${heuristicUrl} in the PAT list and git remotes, using it as the instanceUrl`);
                return heuristicUrl;
            }
            if (intersection.length > 1) {
                this.log(`Found more than one intersection of git remotes and configured PATs, ${intersection}`);
            }
            return null;
        });
    }
    fetchCurrentInstanceUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            // if the workspace setting exists, use it
            if (this.instanceUrl) {
                return this.instanceUrl;
            }
            // try to determine the instance URL heuristically
            const heuristicUrl = yield this.heuristicInstanceUrl();
            if (heuristicUrl) {
                return heuristicUrl;
            }
            // default to Gitlab cloud
            return constants_1.GITLAB_COM_URL;
        });
    }
}
exports.GitService = GitService;
//# sourceMappingURL=git_service.js.map