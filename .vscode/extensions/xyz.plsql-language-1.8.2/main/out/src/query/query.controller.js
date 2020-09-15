"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const query_gridview_1 = require("./query.gridview");
const oracle_server_1 = require("../client-oracle/oracle.server");
const plsqlChannel_1 = require("../plsqlChannel");
class QueryController {
    constructor(context, connectionCtrl) {
        this.context = context;
        this.connectionCtrl = connectionCtrl;
        connectionCtrl.eventEmitter.on('setActive', connection => this.doConnectChange(connection));
        // Init first connection
        this.doConnectChange(connectionCtrl.getActive());
    }
    executeCommand(param) {
        if (!param)
            return;
        if (typeof param === 'string')
            param = { sql: param };
        else if (param.connection && param.connection.connection)
            param.connection = param.connection.connection;
        param.silent = true;
        // if (param.script)
        //     return this.internalRunScript(param);
        // else
        return this.internalRunQuery(param);
    }
    createConnection(param) {
        if (!param)
            return;
        if (param.tag) {
            const connection = this.connectionCtrl.getByTag(param.tag);
            if (connection)
                param = connection;
            else
                return Promise.reject(`Cannot connect tag ${param.tag} not found`);
        }
        param.silent = true;
        param.custom = true;
        return oracle_server_1.OracleService.connect(param);
    }
    removeConnection(param) {
        if (!param)
            return;
        if (param.connection && param.connection.connection)
            param.connection = param.connection.connection;
        param.silent = true;
        param.custom = true;
        return oracle_server_1.OracleService.disconnect(param);
    }
    async runQuery(editor) {
        const text = this.getTextFromRange(editor, this.getSelectionRange(editor));
        return this.internalRunQuery({ sql: text });
    }
    // public runScript(editor: vscode.TextEditor) {
    //     const text = editor.document.getText();
    //     return this.internalRunScript(sql: text});
    // }
    internalRunQuery(param) {
        return new Promise((resolve, reject) => {
            let p;
            if (!param.connection && !oracle_server_1.OracleService.isConnected())
                p = oracle_server_1.OracleService.connect(this._activeConnection);
            else
                p = Promise.resolve();
            p.then(data => {
                if (!param.silent && data && data.loginScript) {
                    plsqlChannel_1.default.show();
                    plsqlChannel_1.default.log(JSON.stringify(data.loginScript));
                }
                return oracle_server_1.OracleService.execCommand(param); // TODO input params
            })
                .then((data) => {
                if (!param.silent)
                    this.showQueryResult(data);
                return resolve(data);
            })
                .catch((err) => {
                if (!param.silent) {
                    vscode.window.showErrorMessage(JSON.stringify(err));
                }
                return reject(err);
            });
        });
    }
    // TODO
    // Actuatlly oracleDB doesn't run script !
    // private internalRunScript(param) {
    //     return new Promise<any>((resolve, reject) => {
    //         let p;
    //         if (OracleService.isConnected())
    //             p = OracleService.connect(this._activeConnection); // TODO no connection error
    //         else
    //             p = Promise.resolve();
    //         p.then(() => {
    //             return OracleService.execCommand(param.sql);
    //         })
    //         .then((data) => {
    //             if (!param.silent) {
    //                 PLSQLChannel.show();
    //                 PLSQLChannel.log(data);
    //                 PLSQLChannel.log('script terminated with success');
    //             }
    //             return resolve(data);
    //         })
    //         .catch((err) => {
    //             if (!param.silent) {
    //                 vscode.window.showErrorMessage(err);
    //             }
    //             return reject(err);
    //         });
    //     });
    // }
    showQueryResult(data) {
        if (data.data.metaData || data.data.rows)
            query_gridview_1.default.createOrShow(this.context.extensionPath, data);
        else {
            plsqlChannel_1.default.show();
            plsqlChannel_1.default.log(JSON.stringify(data.data));
        }
    }
    doConnectChange(connection) {
        oracle_server_1.OracleService.disconnect()
            .catch((err) => {
            if (err.disconnect)
                vscode.window.showErrorMessage(err.disconnect);
            if (err.error)
                vscode.window.showErrorMessage(err.error);
        });
        this._activeConnection = connection;
    }
    getSelectionRange(editor) {
        if (!editor.selection.isEmpty) {
            return new vscode.Range(editor.selection.start, editor.selection.end);
        }
        if (editor.document.lineCount === 0)
            return;
        // Get text delimited by /
        let lineStart;
        if (editor.selection)
            lineStart = editor.selection.start.line;
        else
            lineStart = 0;
        let lineEnd = lineStart;
        --lineStart;
        let chrStart = 0, found = false;
        while (lineStart >= 0) {
            let text = editor.document.lineAt(lineStart).text;
            if ((chrStart = text.search(/\//i)) > -1) {
                found = true;
                break;
            }
            --lineStart;
        }
        if (!found)
            lineStart = new vscode.Position(0, 0);
        else
            lineStart = editor.document.positionAt(editor.document.offsetAt(new vscode.Position(lineStart, chrStart)) + 1);
        found = false;
        let chrEnd = 0;
        while (lineEnd < editor.document.lineCount) {
            let text = editor.document.lineAt(lineEnd).text;
            if ((chrEnd = text.search(/\//i)) > -1) {
                found = true;
                break;
            }
            ++lineEnd;
        }
        if (!found)
            lineEnd = editor.document.lineAt(editor.document.lineCount - 1).range.end;
        else
            lineEnd = editor.document.positionAt(editor.document.offsetAt(new vscode.Position(lineEnd, chrEnd)) - 1);
        return new vscode.Range(lineStart, lineEnd);
    }
    getTextFromRange(editor, range) {
        if (range !== undefined) {
            return editor.document.getText(range);
        }
        return '';
    }
}
exports.QueryController = QueryController;
//# sourceMappingURL=query.controller.js.map