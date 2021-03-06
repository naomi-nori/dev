"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plsql_settings_1 = require("./plsql.settings");
const plsqlParser_vscode_1 = require("./plsqlParser.vscode");
const plsqlNavigator_1 = require("./lib/plsqlNavigator");
class PlSqlNavigatorVSC /*extends PlSqlNavigator*/ {
    static goto(document, position) {
        plsqlParser_vscode_1.default.initParser(plsql_settings_1.PLSQLSettings.getCommentInSymbols());
        const cursorInfos = this.getCursorInfos(document, position), parserRoot = plsqlParser_vscode_1.default.parseDocument(document);
        plsqlNavigator_1.PlSqlNavigator.setEncoding(plsql_settings_1.PLSQLSettings.getEncoding(document.uri));
        return plsqlNavigator_1.PlSqlNavigator.goto(cursorInfos, document.offsetAt(cursorInfos.line.range.start), parserRoot, this.translatePackageName.bind(this, document), this.getGlobCmdEx.bind(this, document));
    }
    static getDeclaration(document, position) {
        plsqlParser_vscode_1.default.initParser(plsql_settings_1.PLSQLSettings.getCommentInSymbols());
        const cursorInfos = this.getCursorInfos(document, position), parserRoot = plsqlParser_vscode_1.default.parseDocument(document);
        plsqlNavigator_1.PlSqlNavigator.setEncoding(plsql_settings_1.PLSQLSettings.getEncoding(document.uri));
        return plsqlNavigator_1.PlSqlNavigator.goto(cursorInfos, document.offsetAt(cursorInfos.line.range.start), parserRoot, this.translatePackageName.bind(this, document), this.getGlobCmdEx.bind(this, document), true);
    }
    static complete(document, position, cursorInfos) {
        if (!cursorInfos.previousWord)
            return Promise.resolve(null);
        plsqlParser_vscode_1.default.initParser(plsql_settings_1.PLSQLSettings.getCommentInSymbols());
        plsqlNavigator_1.PlSqlNavigator.setEncoding(plsql_settings_1.PLSQLSettings.getEncoding(document.uri));
        return plsqlNavigator_1.PlSqlNavigator.complete(cursorInfos, this.translatePackageName.bind(this, document), this.getGlobCmdEx.bind(this, document));
    }
    static getCursorInfos(document, position) {
        const line = document.lineAt(position), lineText = line.text, range = document.getWordRangeAtPosition(position), endChar = range ? range.end.character : position.character, currentWord = range ? document.getText(range) : '', // 'pkg.'
        cursorInfo = plsqlNavigator_1.PlSqlNavigator.getCursorInfos(currentWord, endChar, lineText);
        return Object.assign({}, cursorInfo, { line });
    }
    static translatePackageName(document, packageName) {
        return plsql_settings_1.PLSQLSettings.translatePackageName(packageName);
    }
    static getGlobCmdEx(document, search) {
        const { searchFld, ignore } = plsql_settings_1.PLSQLSettings.getSearchInfos(document.uri);
        return {
            files: search.files,
            ext: plsql_settings_1.PLSQLSettings.getSearchExt(search.ext),
            searchFld: searchFld,
            current: document.uri.fsPath,
            params: {
                nocase: true,
                ignore: ignore
            }
        };
    }
}
exports.PlSqlNavigatorVSC = PlSqlNavigatorVSC;
//# sourceMappingURL=plsqlNavigator.vscode.js.map