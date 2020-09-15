"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const files_1 = require("vscode-languageserver/lib/files");
function getExtension(textDocument) {
    const filePath = files_1.uriToFilePath(textDocument.uri);
    const ext = filePath ? path_1.extname(filePath) : '';
    if (ext === '.handlebars') {
        return '.hbs';
    }
    return ext;
}
exports.getExtension = getExtension;
function hasExtension(textDocument, ...extensions) {
    const ext = getExtension(textDocument);
    return ext !== null && extensions.includes(ext);
}
exports.hasExtension = hasExtension;
//# sourceMappingURL=file-extension.js.map