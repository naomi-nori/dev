"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromReviewUri = exports.toReviewUri = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
function toReviewUri({ path = '', commit, workspacePath, projectId }) {
    return vscode_1.Uri.file(path).with({
        scheme: constants_1.REVIEW_URI_SCHEME,
        query: JSON.stringify({ commit, workspacePath, projectId }),
    });
}
exports.toReviewUri = toReviewUri;
function fromReviewUri(uri) {
    const { commit, workspacePath, projectId } = JSON.parse(uri.query);
    return {
        path: uri.path || undefined,
        commit,
        workspacePath,
        projectId,
    };
}
exports.fromReviewUri = fromReviewUri;
//# sourceMappingURL=review_uri.js.map