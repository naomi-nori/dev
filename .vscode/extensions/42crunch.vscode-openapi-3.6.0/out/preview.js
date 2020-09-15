"use strict";
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const parser_options_1 = require("./parser-options");
const bundler_1 = require("./bundler");
const ON_CHANGE_TIMEOUT = 1000; // 1 sec timeout for onDidChange
function activate(context) {
    const previews = {};
    vscode.workspace.onDidChangeTextDocument((e) => __awaiter(this, void 0, void 0, function* () {
        const uri = e.document.uri.toString();
        for (const name of Object.keys(previews)) {
            const preview = previews[name];
            if (preview && preview.uris[uri]) {
                if (preview.timeout) {
                    clearTimeout(preview.timeout);
                }
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    const document = yield vscode.workspace.openTextDocument(preview.documentUri);
                    const [json, mapping, uris] = yield bundler_1.bundle(document, parser_options_1.parserOptions);
                    showPreview(context, previews, name, document, json, uris);
                }), ON_CHANGE_TIMEOUT);
            }
        }
    }));
    vscode.commands.registerTextEditorCommand('openapi.previewRedoc', (textEditor, edit) => __awaiter(this, void 0, void 0, function* () {
        try {
            const [json, mapping, uris] = yield bundler_1.bundle(textEditor.document, parser_options_1.parserOptions);
            yield showPreview(context, previews, 'redoc', textEditor.document, json, uris);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Failed to preview OpenAPI: ${e.message}}`);
        }
    }));
    vscode.commands.registerTextEditorCommand('openapi.previewSwaggerUI', (textEditor, edit) => __awaiter(this, void 0, void 0, function* () {
        try {
            const [json, mapping, uris] = yield bundler_1.bundle(textEditor.document, parser_options_1.parserOptions);
            showPreview(context, previews, 'swaggerui', textEditor.document, json, uris);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Failed to preview OpenAPI: ${e.message}}`);
        }
    }));
}
exports.activate = activate;
function showPreview(context, previews, name, document, json, uris) {
    return __awaiter(this, void 0, void 0, function* () {
        if (previews[name]) {
            const panel = previews[name].panel;
            panel.webview.postMessage({ command: 'preview', text: json });
            previews[name] = { panel, uris, documentUri: document.uri };
            return;
        }
        const title = name === 'redoc' ? 'OpenAPI ReDoc preview' : 'OpenAPI SwaggerUI preview';
        const panel = yield buildWebviewPanel(context, name, title);
        panel.onDidDispose(() => {
            clearTimeout(previews[name].timeout);
            previews[name] = null;
        }, undefined, context.subscriptions);
        panel.webview.postMessage({ command: 'preview', text: json });
        previews[name] = { panel, uris, documentUri: document.uri };
    });
}
function buildWebviewPanel(context, name, title) {
    const panel = vscode.window.createWebviewPanel(`openapiPreview-${name}`, title, vscode.ViewColumn.Two, {
        enableScripts: true,
        retainContextWhenHidden: true,
    });
    return new Promise((resolve, reject) => {
        panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'init':
                    resolve(panel);
            }
        }, undefined, context.subscriptions);
        const index = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'webview', 'generated', 'preview', name, 'index.js')));
        panel.webview.html = getWebviewContent(panel.webview, index);
    });
}
function getWebviewContent(webview, index) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; script-src ${webview.cspSource}; style-src 'unsafe-inline';">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <style>
	    body {
		  background-color: #FEFEFE;
	    }
	  </style>
  </head>
  <body>
	<div id="root"></div>
	<script src="${index}"></script>
  </body>
  </html>`;
}
//# sourceMappingURL=preview.js.map