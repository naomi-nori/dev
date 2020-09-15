"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class PLSQLChannel {
    static show() {
        if (this._channel)
            this._channel.show();
    }
    static log(text) {
        if (!this._channel)
            this._channel = vscode.window.createOutputChannel('PLSQL');
        this._channel.appendLine(text);
    }
    static dispose() {
        if (this._channel)
            this._channel.dispose();
    }
}
exports.default = PLSQLChannel;
//# sourceMappingURL=plsqlChannel.js.map