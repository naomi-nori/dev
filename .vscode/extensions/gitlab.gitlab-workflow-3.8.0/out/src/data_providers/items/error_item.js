"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorItem = void 0;
const vscode_1 = require("vscode");
class ErrorItem extends vscode_1.TreeItem {
    constructor(message = 'Error occurred, please try to refresh.') {
        super(message);
        this.iconPath = new vscode_1.ThemeIcon('error');
    }
}
exports.ErrorItem = ErrorItem;
//# sourceMappingURL=error_item.js.map