"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
/**
 * Manages connect input webview panels
 */
class ConnectInputPanel {
    constructor(extensionPath, _controller, _showAll) {
        this._controller = _controller;
        this._showAll = _showAll;
        this._disposables = [];
        this._extensionPath = extensionPath;
        // Create and show a new webview panel
        this._panel = vscode.window.createWebviewPanel(ConnectInputPanel.viewType, 'Connection', vscode.ViewColumn.Active, {
            // Enable javascript in the webview
            enableScripts: true,
            // And restric the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                vscode.Uri.file(path.join(this._extensionPath, 'resources', 'webview'))
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
            }
            else
                this.dispose();
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'submitConnection':
                    if (!message.data.ID)
                        this._controller.addConnection(message.data);
                    else
                        this._controller.updateConnection(message.data);
                    if (!this._showAll)
                        this.dispose();
                    else
                        this.sendData(message.data.ID);
                    return;
                case 'cancelConnection':
                    if (!this._showAll)
                        this.dispose();
                    else
                        this.sendData(message.data.ID);
                    return;
                case 'deleteConnection':
                    const connection = this._controller.getConnectionIndexByID(message.data.ID);
                    if (connection >= 0)
                        this._controller.removeConnection(connection);
                    const connections = this._controller.getConnections();
                    let nextID;
                    if (connection < connections.length)
                        nextID = connections[connection].ID;
                    else if (connection > 0)
                        nextID = connections[connection - 1].ID;
                    this.sendData(nextID);
                    return;
                case 'showConnection':
                    this.sendData(message.data.ID);
                    return;
                case 'newConnection':
                    this.sendData();
                    return;
            }
        }, null, this._disposables);
    }
    static createOrShow(extensionPath, controller, showAll) {
        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        if (ConnectInputPanel.currentPanel) {
            ConnectInputPanel.currentPanel._panel.reveal();
        }
        else {
            ConnectInputPanel.currentPanel = new ConnectInputPanel(extensionPath, controller, showAll);
        }
    }
    sendData(connection) {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        const connections = this._controller.getConnections();
        if (this._showAll && connection && (typeof connection === 'number'))
            connection = this._controller.getConnectionByID(connection);
        this._panel.webview.postMessage({
            command: this._showAll ? 'settingsConnections' : 'newConnection',
            data: this._showAll ? {
                connection: connection,
                items: this._controller.getConnections()
            } : null
        });
    }
    dispose() {
        ConnectInputPanel.currentPanel = undefined;
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
            this.sendData(this._showAll ? this._controller.getActive() : null);
        }
        else
            this._getHtmlForWebview()
                .then(html => {
                this._htmlContent = html;
                this._panel.webview.html = html;
                this.sendData(this._showAll ? this._controller.getActive() : null);
            });
    }
    _getHtmlForWebview() {
        // html file
        const htmlPathOnDisk = path.join(this._extensionPath, 'resources', 'webview', 'connect.html');
        // Local path to main script, css run in the webview
        const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'resources', 'webview', 'connect.js'));
        const cssPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'resources', 'webview', 'connect.css'));
        // And the uri we use to load this script in the webview
        const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
        const cssUri = cssPathOnDisk.with({ scheme: 'vscode-resource' });
        // Use a nonce to whitelist which scripts can be run
        return this.readHTMLFile(htmlPathOnDisk, scriptUri, cssUri, this.getNonce());
    }
    readHTMLFile(file, scriptUri, cssUri, nonce) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, 'utf8', (err, data) => {
                if (err)
                    return reject(err);
                const html = data.toString()
                    .replace('${scriptUri}', scriptUri)
                    .replace('${cssUri}', cssUri)
                    .replace(/\${nonce}/g, nonce);
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
ConnectInputPanel.viewType = 'ConnectInput';
exports.default = ConnectInputPanel;
//# sourceMappingURL=connect.inputPannel.js.map