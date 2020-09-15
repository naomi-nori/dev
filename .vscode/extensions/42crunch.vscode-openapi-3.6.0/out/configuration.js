"use strict";
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = exports.Configuration = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
class Configuration {
    constructor(section) {
        this._onDidChange = new vscode_1.EventEmitter();
        this.section = section;
    }
    configure(context) {
        context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this.onConfigurationChanged, this));
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    onConfigurationChanged(e) {
        if (!e.affectsConfiguration(this.section)) {
            return;
        }
        this._onDidChange.fire(e);
    }
    changed(e, section, resource) {
        return e.affectsConfiguration(`${this.section}.${section}`, resource);
    }
    get(section, defaultValue) {
        return defaultValue === undefined
            ? vscode_1.workspace.getConfiguration(this.section).get(section)
            : vscode_1.workspace.getConfiguration(this.section).get(section, defaultValue);
    }
}
exports.Configuration = Configuration;
exports.configuration = new Configuration(constants_1.configId);
//# sourceMappingURL=configuration.js.map