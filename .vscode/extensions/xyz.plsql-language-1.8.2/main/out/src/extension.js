"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const plsqlDefinition_provider_1 = require("./provider/plsqlDefinition.provider");
const plsqlDocumentSymbol_provider_1 = require("./provider/plsqlDocumentSymbol.provider");
const plsqlCompletionItem_provider_1 = require("./provider/plsqlCompletionItem.provider");
const plsqlHover_provider_1 = require("./provider/plsqlHover.provider");
const plsqlSignature_provider_1 = require("./provider/plsqlSignature.provider");
const plsql_settings_1 = require("./plsql.settings");
const connect_controller_1 = require("./connect/connect.controller");
const connectUI_controller_1 = require("./connect/connectUI.controller");
const connect_statusBar_1 = require("./connect/connect.statusBar");
const query_controller_1 = require("./query/query.controller");
const oracle_server_1 = require("./client-oracle/oracle.server");
function activate(context) {
    // Default without $# redefinded here
    // because plsql.configuration.json don't work with getWordRangeAtPosition() according to issue #42649
    vscode.languages.setLanguageConfiguration('plsql', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\%\^\&\*\(\)\-\=\+\[\{\]\}\|\;\:\'\"\,\.\<\>\/\?\s]+)/
    });
    let hoverProvider, signatureHelpProvider;
    // language providers
    activateHover();
    activateSignatureHelp();
    // Oracle connection
    activateOracleConnection();
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('plsql', new plsqlCompletionItem_provider_1.PLSQLCompletionItemProvider(), '.', '\"'));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('plsql', new plsqlDefinition_provider_1.PLSQLDefinitionProvider()));
    // context.subscriptions.push(vscode.languages.registerReferenceProvider('plsql', new PLSQLReferenceProvider()));
    // context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('plsql', new PLSQLDocumentFormattingEditProvider()));
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider('plsql', new plsqlDocumentSymbol_provider_1.PLSQLDocumentSymbolProvider()));
    // context.subscriptions.push(vscode.languages.registerWorkspaceSymbolProvider(new PLSQLWorkspaceSymbolProvider()));
    // context.subscriptions.push(vscode.languages.registerRenameProvider('plsql', new PLSQLRenameProvider()));
    // context.subscriptions.push(vscode.languages.registerCodeActionsProvider('plsql', new PLSQLCodeActionProvider()));
    // Connection
    const connectController = new connect_controller_1.ConnectController();
    const connectStatusBar = new connect_statusBar_1.ConnectStatusBar(connectController);
    const connectUIController = new connectUI_controller_1.default(context, connectController);
    context.subscriptions.push(vscode.commands.registerCommand('plsql.activateConnection', connectUIController.activateConnectionsList, connectUIController));
    // Query
    const queryController = new query_controller_1.QueryController(context, connectController);
    context.subscriptions.push(vscode.commands.registerCommand('plsql.executeCommand', queryController.executeCommand, queryController));
    context.subscriptions.push(vscode.commands.registerCommand('plsql.createConnection', queryController.createConnection, queryController));
    context.subscriptions.push(vscode.commands.registerCommand('plsql.removeConnection', queryController.removeConnection, queryController));
    // context.subscriptions.push(vscode.commands.registerTextEditorCommand('plsql.runScript',
    //     queryController.runScript, queryController));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('plsql.runQuery', queryController.runQuery, queryController));
    vscode.workspace.onDidChangeConfiguration(configChangedEvent => {
        if (!configChangedEvent.affectsConfiguration('plsql-language'))
            return;
        connectController.configurationChanged();
        if (configChangedEvent.affectsConfiguration('plsql-language.signatureHelp'))
            activateSignatureHelp();
        if (configChangedEvent.affectsConfiguration('plsql-language.hover'))
            activateHover();
        if (configChangedEvent.affectsConfiguration('plsql-language.oracleConnection.enable'))
            activateOracleConnection();
    });
    function activateHover() {
        const enable = plsql_settings_1.PLSQLSettings.getHoverEnable();
        if (!hoverProvider && enable) {
            hoverProvider = new plsqlHover_provider_1.PLSQLHoverProvider();
            context.subscriptions.push(vscode.languages.registerHoverProvider('plsql', hoverProvider));
        }
        if (hoverProvider)
            hoverProvider.enable = enable;
    }
    function activateSignatureHelp() {
        const enable = plsql_settings_1.PLSQLSettings.getSignatureEnable();
        if (!signatureHelpProvider && enable) {
            signatureHelpProvider = new plsqlSignature_provider_1.PLSQLSignatureProvider();
            context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('plsql', signatureHelpProvider, '(', ','));
        }
        if (signatureHelpProvider)
            signatureHelpProvider.enable = enable;
    }
    function activateOracleConnection() {
        const enable = plsql_settings_1.PLSQLSettings.getOracleConnectionEnable();
        oracle_server_1.OracleService.activate(enable, context.asAbsolutePath(''));
    }
}
exports.activate = activate;
function deactivate() {
    oracle_server_1.OracleService.activate(false, '', true);
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map