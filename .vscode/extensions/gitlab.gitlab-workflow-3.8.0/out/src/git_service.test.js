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
const temp = require("temp");
const simple_git_1 = require("simple-git");
const git_service_1 = require("./git_service");
describe('git_service', () => {
    const ORIGIN = 'origin';
    const SECOND_REMOTE = 'second'; // name is important, we need this remote to be alphabetically behind origin
    let gitService;
    let workspaceFolder;
    let git;
    temp.track(); // clean temporary folders after the tests finish
    const createTempFolder = () => new Promise((resolve, reject) => {
        temp.mkdir('vscodeWorkplace', (err, dirPath) => {
            if (err)
                reject(err);
            resolve(dirPath);
        });
    });
    const getDefaultOptions = () => ({
        workspaceFolder,
        instanceUrl: 'https://gitlab.com',
        remoteName: undefined,
        pipelineGitRemoteName: undefined,
        tokenService: { getInstanceUrls: () => [] },
        log: () => {
            //
        },
    });
    describe('with initialized git repository', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            workspaceFolder = yield createTempFolder();
            git = simple_git_1.default(workspaceFolder, { binary: 'git' });
            yield git.init();
            yield git.addConfig('user.email', 'test@example.com');
            yield git.addConfig('user.name', 'Test Name');
            yield git.addRemote(ORIGIN, 'git@test.gitlab.com:gitlab-org/gitlab.git');
            gitService = new git_service_1.GitService(getDefaultOptions());
        }));
        describe('fetchGitRemote', () => {
            it('gets the remote url for first origin', () => __awaiter(void 0, void 0, void 0, function* () {
                const remoteUrl = yield gitService.fetchGitRemote();
                expect(remoteUrl).toEqual({
                    host: 'test.gitlab.com',
                    namespace: 'gitlab-org',
                    project: 'gitlab',
                });
            }));
            it('gets the remote url for user configured remote name', () => __awaiter(void 0, void 0, void 0, function* () {
                yield git.addRemote(SECOND_REMOTE, 'git@test.another.com:gitlab-org/gitlab.git');
                const options = Object.assign(Object.assign({}, getDefaultOptions()), { remoteName: SECOND_REMOTE });
                gitService = new git_service_1.GitService(options);
                const remoteUrl = yield gitService.fetchGitRemote();
                expect(remoteUrl === null || remoteUrl === void 0 ? void 0 : remoteUrl.host).toEqual('test.another.com');
            }));
            it('gets default remote for a branch', () => __awaiter(void 0, void 0, void 0, function* () {
                yield git.addRemote(SECOND_REMOTE, 'git@test.another.com:gitlab-org/gitlab.git');
                yield git.checkout(['-b', 'new-branch']);
                yield git.addConfig('branch.new-branch.remote', SECOND_REMOTE); // this is equivalent to setting a remote tracking branch
                const remoteUrl = yield gitService.fetchGitRemote();
                expect(remoteUrl === null || remoteUrl === void 0 ? void 0 : remoteUrl.host).toEqual('test.another.com');
            }));
        });
        describe('fetchBranchName', () => {
            it('gets the current branch name', () => __awaiter(void 0, void 0, void 0, function* () {
                yield git.checkout(['-b', 'new-branch']);
                // TODO if we use git branch command, we don't have to create a commit
                yield git.commit('Test commit', [], { '--allow-empty': null });
                const branchName = yield gitService.fetchBranchName();
                expect(branchName).toEqual('new-branch');
            }));
        });
        describe('fetchLastCommitId', () => {
            it('returns the last commit sha', () => __awaiter(void 0, void 0, void 0, function* () {
                yield git.commit('Test commit', [], { '--allow-empty': null });
                const lastCommitSha = yield git.revparse(['HEAD']);
                const result = yield gitService.fetchLastCommitId();
                expect(result).toEqual(lastCommitSha);
            }));
        });
        describe('fetchGitRemotePipeline', () => {
            it('returns default remote when the pipelineGitRemoteName setting is missing', () => __awaiter(void 0, void 0, void 0, function* () {
                yield git.addRemote(SECOND_REMOTE, 'git@test.another.com:gitlab-org/gitlab.git');
                const remoteUrl = yield gitService.fetchGitRemotePipeline();
                expect(remoteUrl === null || remoteUrl === void 0 ? void 0 : remoteUrl.host).toEqual('test.gitlab.com');
            }));
            it('returns url for the configured pipelineGitRemoteName remote', () => __awaiter(void 0, void 0, void 0, function* () {
                yield git.addRemote(SECOND_REMOTE, 'git@test.another.com:gitlab-org/gitlab.git');
                const options = Object.assign(Object.assign({}, getDefaultOptions()), { pipelineGitRemoteName: SECOND_REMOTE });
                gitService = new git_service_1.GitService(options);
                const remoteUrl = yield gitService.fetchGitRemotePipeline();
                expect(remoteUrl === null || remoteUrl === void 0 ? void 0 : remoteUrl.host).toEqual('test.another.com');
            }));
        });
        describe('fetchTrackingBranchName', () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                yield git.checkout(['-b', 'new-branch']);
                // TODO if we use git branch command, we don't have to create a commit
                yield git.commit('Test commit', [], { '--allow-empty': null });
            }));
            it('returns local branch name if tracking branch is not defined', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield gitService.fetchTrackingBranchName();
                expect(result).toEqual('new-branch');
            }));
            it('returns tracking branch if it is configured', () => __awaiter(void 0, void 0, void 0, function* () {
                yield git.addConfig('branch.new-branch.merge', `${ORIGIN}/test-branch`);
                const result = yield gitService.fetchTrackingBranchName();
                expect(result).toEqual(`${ORIGIN}/test-branch`);
            }));
        });
    });
    describe('without initialized git repository', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            workspaceFolder = yield createTempFolder();
            const options = Object.assign(Object.assign({}, getDefaultOptions()), { instanceUrl: undefined });
            gitService = new git_service_1.GitService(options);
        }));
        it('fetchGitRemote returns null', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield gitService.fetchGitRemote()).toEqual(null);
        }));
        it('fetchBranchName returns null', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield gitService.fetchBranchName()).toEqual(null);
        }));
        it('fetchLastCommitId returns null', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield gitService.fetchLastCommitId()).toEqual(null);
        }));
        it('fetchGitRemotePipeline returns null', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield gitService.fetchGitRemotePipeline()).toEqual(null);
        }));
        it('fetchTrackingBranchName returns null', () => __awaiter(void 0, void 0, void 0, function* () {
            expect(yield gitService.fetchTrackingBranchName()).toEqual(null);
        }));
    });
});
//# sourceMappingURL=git_service.test.js.map