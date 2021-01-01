"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_VS_CODE_SETTINGS = exports.REMOTE = exports.API_URL_PREFIX = exports.GITLAB_URL = void 0;
exports.GITLAB_URL = 'https://test.gitlab.com';
exports.API_URL_PREFIX = `${exports.GITLAB_URL}/api/v4`;
exports.REMOTE = {
    NAME: 'origin',
    URL: 'git@test.gitlab.com:gitlab-org/gitlab.git',
};
exports.DEFAULT_VS_CODE_SETTINGS = {
    'gitlab.instanceUrl': exports.GITLAB_URL,
    'files.enableTrash': false,
};
//# sourceMappingURL=constants.js.map