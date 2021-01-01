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
exports.deactivate = exports.activate = exports.outlines = void 0;
const vscode = __importStar(require("vscode"));
const semver = __importStar(require("semver"));
const configuration_1 = require("./configuration");
const constants_1 = require("./constants");
const util_1 = require("./util");
const parser_options_1 = require("./parser-options");
const outline_1 = require("./outline");
const reference_1 = require("./reference");
const completion_1 = require("./completion");
const context_1 = require("./context");
const commands_1 = require("./commands");
const whatsnew_1 = require("./whatsnew");
const audit = __importStar(require("./audit/activate"));
const preview = __importStar(require("./preview"));
exports.outlines = {};
function updateVersionContext(version) {
    if (version === constants_1.OpenApiVersion.V2) {
        vscode.commands.executeCommand('setContext', 'openapiTwoEnabled', true);
        vscode.commands.executeCommand('setContext', 'openapiThreeEnabled', false);
    }
    else if (version === constants_1.OpenApiVersion.V3) {
        vscode.commands.executeCommand('setContext', 'openapiThreeEnabled', true);
        vscode.commands.executeCommand('setContext', 'openapiTwoEnabled', false);
    }
    else {
        vscode.commands.executeCommand('setContext', 'openapiTwoEnabled', false);
        vscode.commands.executeCommand('setContext', 'openapiThreeEnabled', false);
    }
}
function onActiveEditorChanged(editor, didChangeTree, didChangeTreeIncludingErrors, didChangeEditor, diagnostics) {
    return __awaiter(this, void 0, void 0, function* () {
        if (editor) {
            const [version, node, errors] = util_1.parseDocument(editor.document);
            // parsing errors when changing documents or encountering unsupported documents
            // should cause version context values to change, clearing the outline
            updateVersionContext(version);
            if (errors) {
                diagnostics.set(editor.document.uri, errors);
                vscode.commands.executeCommand('setContext', 'openapiErrors', true);
            }
            else {
                diagnostics.delete(editor.document.uri);
                vscode.commands.executeCommand('setContext', 'openapiErrors', false);
                didChangeTree.fire([node, null]);
            }
            didChangeTreeIncludingErrors.fire([node, null]);
            didChangeEditor.fire([editor, version]);
        }
        else {
            didChangeTree.fire([null, null]);
            didChangeTreeIncludingErrors.fire([null, null]);
            didChangeEditor.fire([null, constants_1.OpenApiVersion.Unknown]);
        }
    });
}
function onDocumentChanged(event, didChangeTree, didChangeTreeIncludingErrors, diagnostics) {
    // check change events for the active editor only
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.toString() === event.document.uri.toString()) {
        const [version, node, errors] = util_1.parseDocument(event.document);
        didChangeTreeIncludingErrors.fire([node, event]);
        if (errors) {
            diagnostics.set(event.document.uri, errors);
            vscode.commands.executeCommand('setContext', 'openapiErrors', true);
            // in presense of parsing errors don't update version context values
            // effectively freezing current state of outline
        }
        else {
            diagnostics.delete(event.document.uri);
            vscode.commands.executeCommand('setContext', 'openapiErrors', false);
            updateVersionContext(version);
            didChangeTree.fire([node, event]);
        }
    }
}
function activate(context) {
    const didChangeTreeValid = new vscode.EventEmitter();
    const didChangeTreeIncludingErrors = new vscode.EventEmitter();
    const didChangeEditor = new vscode.EventEmitter();
    const versionProperty = 'openapiVersion';
    const openapiExtension = vscode.extensions.getExtension(constants_1.extensionQualifiedId);
    const currentVersion = semver.parse(openapiExtension.packageJSON.version);
    const previousVersion = context.globalState.get(versionProperty)
        ? semver.parse(context.globalState.get(versionProperty))
        : semver.parse('0.0.1');
    const yamlConfiguration = new configuration_1.Configuration('yaml');
    context.globalState.update(versionProperty, currentVersion.toString());
    parser_options_1.parserOptions.configure(yamlConfiguration);
    // OpenAPI v2 outlines
    registerOutlineTreeView('openapiTwoSpecOutline', new outline_1.GeneralTwoOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiTwoPathOutline', new outline_1.PathOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiTwoDefinitionOutline', new outline_1.DefinitionOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiTwoSecurityOutline', new outline_1.SecurityOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiTwoSecurityDefinitionOutline', new outline_1.SecurityDefinitionOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiTwoParametersOutline', new outline_1.ParametersOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiTwoResponsesOutline', new outline_1.ResponsesOutlineProvider(context, didChangeTreeValid.event));
    // OpenAPI v3 outlines
    registerOutlineTreeView('openapiThreePathOutline', new outline_1.PathOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiThreeSpecOutline', new outline_1.GeneralThreeOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiThreeComponentsOutline', new outline_1.ComponentsOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiThreeSecurityOutline', new outline_1.SecurityOutlineProvider(context, didChangeTreeValid.event));
    registerOutlineTreeView('openapiThreeServersOutline', new outline_1.ServersOutlineProvider(context, didChangeTreeValid.event));
    context_1.updateContext(didChangeTreeValid.event);
    commands_1.registerCommands();
    const jsonFile = { language: 'json' };
    const jsoncFile = { language: 'jsonc' };
    const yamlFile = { language: 'yaml' };
    const completionProvider = new completion_1.CompletionItemProvider(context, didChangeTreeIncludingErrors.event);
    vscode.languages.registerCompletionItemProvider(yamlFile, completionProvider, '"');
    vscode.languages.registerCompletionItemProvider(jsonFile, completionProvider, '"');
    vscode.languages.registerCompletionItemProvider(jsoncFile, completionProvider, '"');
    const jsonSchemaDefinitionProvider = new reference_1.JsonSchemaDefinitionProvider();
    const yamlSchemaDefinitionProvider = new reference_1.YamlSchemaDefinitionProvider();
    vscode.languages.registerDefinitionProvider(jsonFile, jsonSchemaDefinitionProvider);
    vscode.languages.registerDefinitionProvider(jsoncFile, jsonSchemaDefinitionProvider);
    vscode.languages.registerDefinitionProvider(yamlFile, yamlSchemaDefinitionProvider);
    const diagnostics = vscode.languages.createDiagnosticCollection('openapi');
    vscode.workspace.onDidCloseTextDocument((document) => {
        diagnostics.delete(document.uri);
    });
    // trigger refresh on activation
    onActiveEditorChanged(vscode.window.activeTextEditor, didChangeTreeValid, didChangeTreeIncludingErrors, didChangeEditor, diagnostics);
    vscode.window.onDidChangeActiveTextEditor((e) => onActiveEditorChanged(e, didChangeTreeValid, didChangeTreeIncludingErrors, didChangeEditor, diagnostics));
    vscode.workspace.onDidChangeTextDocument((e) => onDocumentChanged(e, didChangeTreeValid, didChangeTreeIncludingErrors, diagnostics));
    const yamlExtension = vscode.extensions.getExtension('redhat.vscode-yaml');
    util_1.provideYamlSchemas(context, yamlExtension);
    audit.activate(context, didChangeEditor.event);
    preview.activate(context);
    if (previousVersion.major < currentVersion.major) {
        whatsnew_1.create(context);
    }
    configuration_1.configuration.configure(context);
    yamlConfiguration.configure(context);
}
exports.activate = activate;
function deactivate() {
    for (let viewId in exports.outlines) {
        exports.outlines[viewId].dispose();
        delete exports.outlines[viewId];
    }
    return undefined;
}
exports.deactivate = deactivate;
function registerOutlineTreeView(id, provider) {
    exports.outlines[id] = vscode.window.createTreeView(id, {
        treeDataProvider: provider
    });
    // Length is 0 if deselected
    exports.outlines[id].onDidChangeSelection(event => {
        vscode.commands.executeCommand('setContext', id + 'Selected', event.selection.length > 0);
    });
}
//# sourceMappingURL=extension.js.map