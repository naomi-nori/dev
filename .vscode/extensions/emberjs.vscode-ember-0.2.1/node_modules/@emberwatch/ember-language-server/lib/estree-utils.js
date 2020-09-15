"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
function newPosition(line, column) {
    return { line, column };
}
exports.newPosition = newPosition;
function comparePositions(a, b) {
    if (a.line < b.line)
        return -1;
    if (a.line > b.line)
        return 1;
    if (a.column < b.column)
        return -1;
    if (a.column > b.column)
        return 1;
    return 0;
}
exports.comparePositions = comparePositions;
function toPosition(lsp) {
    return newPosition(lsp.line + 1, lsp.character);
}
exports.toPosition = toPosition;
function toLSPosition(pos) {
    return vscode_languageserver_1.Position.create(pos.line - 1, pos.column);
}
exports.toLSPosition = toLSPosition;
function toLSRange(loc) {
    return vscode_languageserver_1.Range.create(toLSPosition(loc.start), toLSPosition(loc.end));
}
exports.toLSRange = toLSRange;
function newLocation(startLine, startColumn, endLine, endColumn) {
    let start = { line: startLine, column: startColumn };
    let end = { line: endLine, column: endColumn };
    return { start, end };
}
exports.newLocation = newLocation;
function containsPosition(loc, position) {
    return comparePositions(position, loc.start) >= 0 && comparePositions(position, loc.end) <= 0;
}
exports.containsPosition = containsPosition;
//# sourceMappingURL=estree-utils.js.map