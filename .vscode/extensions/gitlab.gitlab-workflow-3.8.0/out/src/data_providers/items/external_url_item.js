"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalUrlItem = void 0;
const vscode_1 = require("vscode");
const command_names_1 = require("../../command_names");
class ExternalUrlItem extends vscode_1.TreeItem {
    constructor(label, url) {
        super(label);
        this.command = {
            title: 'Open URL',
            command: command_names_1.VS_COMMANDS.OPEN,
            arguments: [vscode_1.Uri.parse(url)],
        };
    }
}
exports.ExternalUrlItem = ExternalUrlItem;
//# sourceMappingURL=external_url_item.js.map