"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
/**
 * Manages connect input webview panels
 */
class QueryGridView {
    constructor(extensionPath, data) {
        this._disposables = [];
        this._extensionPath = extensionPath;
        // Create and show a new webview panel
        this._currentData = data;
        this._panel = vscode.window.createWebviewPanel(QueryGridView.viewType, 'Oracle result', vscode.ViewColumn.Beside, {
            // Enable javascript in the webview
            enableScripts: true,
            // And restric the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                vscode.Uri.file(path.join(this._extensionPath, 'resources', 'webview')),
                vscode.Uri.file(path.join(this._extensionPath, 'node_modules'))
            ]
        });
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update();
            } //else
            //  this.dispose();
        }, this, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                // case 'newGridView':
                //     this._controller.addConnection(message.data);
                //     this.dispose();
                //     return;
                case 'cancelGridView':
                    this.dispose();
                    return;
            }
        }, this, this._disposables);
    }
    static createOrShow(extensionPath, data) {
        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        if (QueryGridView.currentPanel) {
            QueryGridView.currentPanel._currentData = data;
            QueryGridView.currentPanel._panel.reveal(QueryGridView.currentPanel._panel.viewColumn /*vscode.ViewColumn.Beside*/);
        }
        else {
            QueryGridView.currentPanel = new QueryGridView(extensionPath, data);
        }
    }
    sendData(data) {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({
            command: 'showGridView',
            data: data
        });
    }
    dispose() {
        QueryGridView.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        if (this._htmlContent) {
            this._panel.webview.html = this._htmlContent;
            this.sendData(this._currentData);
        }
        else
            this._getHtmlForWebview()
                .then(html => {
                this._htmlContent = html;
                this._panel.webview.html = html;
                this.sendData(this._currentData);
            });
    }
    _getHtmlForWebview() {
        // html file
        const htmlPathOnDisk = path.join(this._extensionPath, 'resources', 'webview', 'gridView.html');
        // Local path to main script, css run in the webview
        const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'resources', 'webview', 'gridView.js'));
        const cssPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'resources', 'webview', 'gridView.css'));
        const scriptAgGrid = vscode.Uri.file(path.join(this._extensionPath, 'node_modules', 'ag-grid-community', 'dist', 'ag-grid-community.min.noStyle.js'));
        const cssAgGrid = vscode.Uri.file(path.join(this._extensionPath, 'node_modules', 'ag-grid-community', 'dist', 'styles', 'ag-grid.css'));
        const cssAgTheme = vscode.Uri.file(path.join(this._extensionPath, 'node_modules', 'ag-grid-community', 'dist', 'styles', 'ag-theme-balham.css'));
        // And the uri we use to load this script in the webview
        const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
        const cssUri = cssPathOnDisk.with({ scheme: 'vscode-resource' });
        const scriptAgGridUri = scriptAgGrid.with({ scheme: 'vscode-resource' });
        const cssAgGridUri = cssAgGrid.with({ scheme: 'vscode-resource' });
        const cssAgThemeUri = cssAgTheme.with({ scheme: 'vscode-resource' });
        // Use a nonce to whitelist which scripts can be run
        return this.readHTMLFile(htmlPathOnDisk, {
            scriptUri, cssUri, scriptAgGridUri, cssAgGridUri, cssAgThemeUri,
        }, this.getNonce());
    }
    readHTMLFile(file, uris, nonce) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, 'utf8', (err, data) => {
                if (err)
                    return reject(err);
                let html = data.toString();
                Object.keys(uris).forEach(uri => {
                    html = html.replace('${' + uri + '}', uris[uri]);
                });
                html = html.replace(/\${nonce}/g, nonce);
                return resolve(html);
            });
        });
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
QueryGridView.viewType = 'GridView';
exports.default = QueryGridView;
//# sourceMappingURL=query.gridview.js.map