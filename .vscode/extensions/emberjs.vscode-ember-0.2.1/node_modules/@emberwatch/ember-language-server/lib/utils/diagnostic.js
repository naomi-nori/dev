"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const ParseErrorExp = /^Parse error on line (\d+)/;
const OnLineErrorExp = / \(on line (\d+)\)\.$/;
function toDiagnostic(source, error) {
    return {
        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
        range: toRange(source, error),
        message: toMessage(error),
        source: error.rule ? 'ember-template-lint' : 'glimmer-engine'
    };
}
exports.toDiagnostic = toDiagnostic;
function toLineRange(source, idx) {
    const line = (source.split('\n')[idx] || '').replace(/\s+$/, '');
    const pre = line.match(/^(\s*)/);
    const start = pre ? pre[1].length : 0;
    const end = line.length || start + 1;
    return [start, end];
}
function toMessage({ message }) {
    if (ParseErrorExp.test(message)) {
        return message.split('\n').pop() || '';
    }
    message = message.replace(OnLineErrorExp, '');
    return message;
}
function toRange(source, error) {
    let line;
    let column;
    const match = error.message.match(ParseErrorExp) || error.message.match(OnLineErrorExp);
    if (match) {
        line = Number(match[1]) - 1;
    }
    else if (error.line) {
        line = error.line - 1;
    }
    else {
        line = 0;
    }
    const [start, end] = toLineRange(source, line);
    if (typeof error.column === 'number') {
        column = error.column;
    }
    else {
        column = start;
    }
    return {
        start: { line, character: column },
        end: { line, character: end }
    };
}
//# sourceMappingURL=diagnostic.js.map