/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // The server is implemented in node
        let serverModule = context.asAbsolutePath(path.join('node_modules', '@emberwatch', 'ember-language-server', 'lib', 'start-server.js'));
        // The debug options for the server
        let debugOptions = { execArgv: ["--nolazy", "--inspect=6004"] };
        // If the extension is launched in debug mode then the debug server options are used
        // Otherwise the run options are used
        let serverOptions = {
            run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
            debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
        };
        if (!(yield isEmberCliProject())) {
            return;
        }
        // Options to control the language client
        let clientOptions = {
            // Register the server for plain text documents
            documentSelector: ['handlebars', 'javascript'],
            outputChannelName: 'Ember Language Server',
            revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never
        };
        // Create the language client and start the client.
        let disposable = new vscode_languageclient_1.LanguageClient('emberLanguageServer', 'Ember Language Server', serverOptions, clientOptions).start();
        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        context.subscriptions.push(disposable);
    });
}
exports.activate = activate;
function isEmberCliProject() {
    return __awaiter(this, void 0, void 0, function* () {
        const emberCliBuildFile = yield vscode_1.workspace.findFiles('**/ember-cli-build.js', '**/{dist,tmp,node_modules}/**', 100);
        if (emberCliBuildFile.length < 1) {
            return false;
        }
        return true;
    });
}
//# sourceMappingURL=extension.js.map