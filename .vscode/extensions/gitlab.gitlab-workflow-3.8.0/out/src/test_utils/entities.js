"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customQuery = exports.project = exports.mrVersion = exports.diffFile = exports.issuable = void 0;
const custom_query_type_1 = require("../gitlab/custom_query_type");
exports.issuable = {
    id: 1,
    iid: 1000,
    title: 'Issuable Title',
    project_id: 9999,
    web_url: 'https://gitlab.example.com/group/project/issues/1',
    author: {
        avatar_url: 'https://secure.gravatar.com/avatar/6042a9152ada74d9fb6a0cdce895337e?s=80&d=identicon',
        name: 'Tomas Vik',
    },
};
exports.diffFile = {
    old_path: 'old_file.js',
    new_path: 'new_file.js',
    new_file: false,
    deleted_file: false,
    renamed_file: true,
};
exports.mrVersion = {
    base_commit_sha: 'aaaaaaaa',
    head_commit_sha: 'bbbbbbbb',
    diffs: [exports.diffFile],
};
exports.project = {
    label: 'Project label',
    uri: '/home/johndoe/workspace/project',
};
exports.customQuery = {
    name: 'Query name',
    type: custom_query_type_1.CustomQueryType.ISSUE,
    maxResults: 10,
    scope: 'all',
    state: 'closed',
    wip: 'no',
    confidential: false,
    excludeSearchIn: 'all',
    orderBy: 'created_at',
    sort: 'desc',
    searchIn: 'all',
    noItemText: 'No item',
};
//# sourceMappingURL=entities.js.map