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
exports.registerCommands = void 0;
const vscode = __importStar(require("vscode"));
const ast_1 = require("./ast");
const extension_1 = require("./extension");
const parser_options_1 = require("./parser-options");
const snippets = __importStar(require("./snippets.json"));
const commands = {
    goToLine,
    copyJsonReference,
    createNewTwo,
    createNewThree,
    createNewTwoYaml,
    createNewThreeYaml,
    addPath,
    addOperation,
    addSecurity,
    addHost,
    addBasePath,
    addInfo,
    addSecurityDefinitionBasic,
    addSecurityDefinitionApiKey,
    addSecurityDefinitionOauth2Implicit,
    addDefinitionObject,
    addParameterBody,
    addParameterPath,
    addParameterOther,
    addResponse,
    v3addInfo,
    v3addComponentsResponse,
    v3addComponentsParameter,
    v3addComponentsSchema,
    v3addServer,
    v3addSecuritySchemeBasic,
    v3addSecuritySchemeApiKey,
    v3addSecuritySchemeJWT,
    v3addSecuritySchemeOauth2Implicit,
    copySelectedTwoPathOutlineJsonReference,
    copySelectedTwoParametersOutlineJsonReference,
    copySelectedTwoResponsesOutlineJsonReference,
    copySelectedTwoDefinitionOutlineJsonReference,
    copySelectedTwoSecurityOutlineJsonReference,
    copySelectedTwoSecurityDefinitionOutlineJsonReference,
    copySelectedThreePathOutlineJsonReference,
    copySelectedThreeServersOutlineJsonReference,
    copySelectedThreeComponentsOutlineJsonReference,
    copySelectedThreeSecurityOutlineJsonReference
};
// preferred order of the tags, mixed v2 and v3 tags
const topTags = [
    'swagger',
    'openapi',
    'info',
    'externalDocs',
    'host',
    'basePath',
    'schemes',
    'consumes',
    'produces',
    'tags',
    'servers',
    'components',
    'paths',
    'parameters',
    'responses',
    'security',
    'securityDefinitions',
    'definitions',
];
// preferred order of tags in v3 components
const componentsTags = [
    'schemas',
    'responses',
    'parameters',
    'examples',
    'requestBodies',
    'headers',
    'securitySchemes',
    'links',
    'callbacks',
];
function registerCommands() {
    return Object.keys(commands).map((name) => registerCommand(name, commands[name]));
}
exports.registerCommands = registerCommands;
function registerCommand(name, handler) {
    const wrapped = function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield handler(...args);
            }
            catch (e) {
                vscode.window.showErrorMessage(`Failed to execute command: ${e.message}`);
            }
        });
    };
    return vscode.commands.registerCommand(`openapi.${name}`, wrapped);
}
function goToLine(range) {
    const editor = vscode.window.activeTextEditor;
    editor.selection = new vscode.Selection(range.start, range.start);
    editor.revealRange(editor.selection, vscode.TextEditorRevealType.AtTop);
}
function copyJsonReference(range) {
    const editor = vscode.window.activeTextEditor;
    const text = editor.document.getText();
    const languageId = editor.document.languageId;
    const root = safeParse(text, languageId);
    const node = root.findNodeAtOffset(editor.document.offsetAt(editor.selection.active));
    copyNodeJsonReference(node);
}
function copyNodeJsonReference(node) {
    if (node) {
        const pointer = node.getJsonPonter();
        // JSON Pointer is allowed to have special chars, but JSON Reference
        // requires these to be encoded
        const encoded = pointer
            .split('/')
            .map((segment) => encodeURIComponent(segment))
            .join('/');
        vscode.env.clipboard.writeText(`#${encoded}`);
        const disposable = vscode.window.setStatusBarMessage(`Copied Reference: #${encoded}`);
        setTimeout(() => disposable.dispose(), 1000);
    }
}
function copySelectedTwoPathOutlineJsonReference() {
    copySelectedJsonReference('openapiTwoPathOutline');
}
function copySelectedTwoParametersOutlineJsonReference() {
    copySelectedJsonReference('openapiTwoParametersOutline');
}
function copySelectedTwoResponsesOutlineJsonReference() {
    copySelectedJsonReference('openapiTwoResponsesOutline');
}
function copySelectedTwoDefinitionOutlineJsonReference() {
    copySelectedJsonReference('openapiTwoDefinitionOutline');
}
function copySelectedTwoSecurityOutlineJsonReference() {
    copySelectedJsonReference('openapiTwoSecurityOutline');
}
function copySelectedTwoSecurityDefinitionOutlineJsonReference() {
    copySelectedJsonReference('openapiTwoSecurityDefinitionOutline');
}
function copySelectedThreePathOutlineJsonReference() {
    copySelectedJsonReference('openapiThreePathOutline');
}
function copySelectedThreeServersOutlineJsonReference() {
    copySelectedJsonReference('openapiThreeServersOutline');
}
function copySelectedThreeComponentsOutlineJsonReference() {
    copySelectedJsonReference('openapiThreeComponentsOutline');
}
function copySelectedThreeSecurityOutlineJsonReference() {
    copySelectedJsonReference('openapiThreeSecurityOutline');
}
function copySelectedJsonReference(viewId) {
    copyNodeJsonReference(extension_1.outlines[viewId].selection[0]);
}
function createNew(snippet, language) {
    return __awaiter(this, void 0, void 0, function* () {
        const document = yield vscode.workspace.openTextDocument({
            language,
        });
        yield vscode.window.showTextDocument(document);
        const editor = vscode.window.activeTextEditor;
        yield editor.insertSnippet(new vscode.SnippetString(snippet), editor.document.positionAt(0));
    });
}
function createNewTwo() {
    return __awaiter(this, void 0, void 0, function* () {
        yield createNew(snippets.newVersionTwo, 'json');
    });
}
function createNewThree() {
    return __awaiter(this, void 0, void 0, function* () {
        yield createNew(snippets.newVersionThree, 'json');
    });
}
function createNewTwoYaml() {
    return __awaiter(this, void 0, void 0, function* () {
        yield createNew(snippets.newVersionTwoYaml, 'yaml');
    });
}
function createNewThreeYaml() {
    return __awaiter(this, void 0, void 0, function* () {
        yield createNew(snippets.newVersionThreeYaml, 'yaml');
    });
}
function addBasePath() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetAfter('basePath', '/swagger');
    });
}
function addHost() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetAfter('host', '/swagger');
    });
}
function addInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetAfter('info', '/swagger');
    });
}
function v3addInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetAfter('info', '/openapi');
    });
}
function addPath() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('path', 'paths');
    });
}
function addSecurityDefinitionBasic() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('securityBasic', 'securityDefinitions');
    });
}
function addSecurityDefinitionOauth2Implicit() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('securityOauth2Implicit', 'securityDefinitions');
    });
}
function addSecurityDefinitionApiKey() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('securityApiKey', 'securityDefinitions');
    });
}
function addSecurity() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('security', 'security', 'array');
    });
}
function addDefinitionObject() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('definitionObject', 'definitions');
    });
}
function addParameterPath() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('parameterPath', 'parameters');
    });
}
function addParameterBody() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('parameterBody', 'parameters');
    });
}
function addParameterOther() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('parameterOther', 'parameters');
    });
}
function addResponse() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('response', 'responses');
    });
}
function v3addComponentsResponse() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoComponents('componentsResponse', 'responses');
    });
}
function v3addComponentsParameter() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoComponents('componentsParameter', 'parameters');
    });
}
function v3addComponentsSchema() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoComponents('componentsSchema', 'schemas');
    });
}
function v3addSecuritySchemeBasic() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoComponents('componentsSecurityBasic', 'securitySchemes');
    });
}
function v3addSecuritySchemeApiKey() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoComponents('componentsSecurityApiKey', 'securitySchemes');
    });
}
function v3addSecuritySchemeJWT() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoComponents('componentsSecurityJwt', 'securitySchemes');
    });
}
function v3addSecuritySchemeOauth2Implicit() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoComponents('componentsSecurityOauth2Implicit', 'securitySchemes');
    });
}
function v3addServer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield insertSnippetIntoRoot('server', 'servers', 'array');
    });
}
function addOperation(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const languageId = editor.document.languageId;
        if (languageId === 'yaml') {
            const target = node.node.value;
            let snippet = snippets.operationYaml;
            const eol = editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
            yield editor.edit((builder) => {
                builder.insert(editor.document.positionAt(target.endPosition), eol);
            });
            yield editor.insertSnippet(new vscode.SnippetString(`\n${increaseIndent(snippet, 2)}\n`), editor.document.positionAt(target.endPosition + eol.length));
        }
        else {
            const target = node.node.parent.children[1];
            let snippet = snippets.operation;
            snippet = `\n${snippet}`;
            if (target.children.length > 0) {
                // append comma at the end of the snippet
                snippet = `${snippet},`;
            }
            yield editor.insertSnippet(new vscode.SnippetString(snippet), editor.document.positionAt(target.offset + 1));
        }
    });
}
function insertSnippetAfter(snippetName, pointer) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const text = editor.document.getText();
        const languageId = editor.document.languageId;
        const root = safeParse(text, languageId);
        if (languageId === 'yaml') {
            let snippet = snippets[`${snippetName}Yaml`];
            yield insertYamlSnippetAfter(root, snippet, pointer);
        }
        else {
            let snippet = snippets[snippetName];
            yield insertJsonSnippetAfter(root, snippet, pointer);
        }
    });
}
function insertYamlSnippetAfter(root, snippet, pointer) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const node = root.find(pointer);
        const eol = editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
        yield editor.edit((builder) => {
            builder.insert(editor.document.positionAt(node.node.endPosition), eol);
        });
        yield editor.insertSnippet(new vscode.SnippetString(`${snippet}`), editor.document.positionAt(node.node.endPosition + eol.length));
    });
}
function insertJsonSnippetAfter(root, snippet, pointer) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const jnode = root.find(pointer).node;
        const last = jnode.parent.parent.children.indexOf(jnode.parent) == jnode.parent.parent.children.length - 1;
        let insertPosition;
        if (last) {
            // inserting snippet after the last node in the object
            snippet = `,\n${snippet}`;
            insertPosition = jnode.offset + jnode.length;
        }
        else {
            snippet = `\n${snippet},`;
            insertPosition = jnode.offset + jnode.length + 1;
        }
        yield editor.insertSnippet(new vscode.SnippetString(snippet), editor.document.positionAt(insertPosition));
    });
}
function insertYamlSnippetInto(root, snippet, pointer) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const ynode = root.find(pointer).node;
        yield editor.insertSnippet(new vscode.SnippetString(`${snippet}\n`), editor.document.positionAt(ynode.value.startPosition));
    });
}
function insertJsonSnippetInto(root, snippet, pointer) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const jnode = root.find(pointer).node;
        snippet = `\n${snippet}`;
        if (jnode.children.length > 0) {
            // append coma at the end of the snippet
            snippet = `${snippet},`;
        }
        yield editor.insertSnippet(new vscode.SnippetString(snippet), editor.document.positionAt(jnode.offset + 1));
    });
}
function insertSnippetIntoRoot(snippetName, element, container = 'object') {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const text = editor.document.getText();
        const languageId = editor.document.languageId;
        const root = safeParse(text, languageId);
        if (languageId === 'yaml') {
            let snippet = snippets[`${snippetName}Yaml`];
            if (root.find(`/${element}`)) {
                yield insertYamlSnippetInto(root, snippet, `/${element}`);
            }
            else {
                const target = findInsertionAnchor(root, element);
                snippet = `${element}:\n${increaseIndent(snippet)}\n`;
                yield insertYamlSnippetAfter(root, snippet, `/${target}`);
            }
        }
        else {
            let snippet = snippets[snippetName];
            if (root.find(`/${element}`)) {
                yield insertJsonSnippetInto(root, snippet, `/${element}`);
            }
            else {
                if (container === 'object') {
                    snippet = `"${element}": {\n${snippet}\n}`;
                }
                else {
                    // array container otherwise
                    snippet = `"${element}": [\n${snippet}\n]`;
                }
                const target = findInsertionAnchor(root, element);
                yield insertJsonSnippetAfter(root, snippet, `/${target}`);
            }
        }
    });
}
function insertSnippetIntoComponents(snippetName, element) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const text = editor.document.getText();
        const languageId = editor.document.languageId;
        const root = safeParse(text, languageId);
        if (languageId === 'yaml') {
            let snippet = snippets[`${snippetName}Yaml`];
            if (root.find(`/components/${element}`)) {
                yield insertYamlSnippetInto(root, snippet, `/components/${element}`);
            }
            else if (root.find('/components')) {
                const position = findComponentsInsertionPosition(root, element);
                if (position >= 0) {
                    // found where to insert
                    snippet = `\n\t${element}:\n${increaseIndent(snippet, 2)}\n`;
                    yield insertYamlSnippetAfter(root, snippet, `/components/${componentsTags[position]}`);
                }
                else {
                    // insert into the 'components'
                    snippet = `${element}:\n${increaseIndent(snippet, 2)}\n`;
                    yield insertYamlSnippetInto(root, snippet, '/components');
                }
            }
            else {
                snippet = `components:\n\t${element}:\n${increaseIndent(snippet, 2)}\n`;
                const target = findInsertionAnchor(root, 'components');
                yield insertYamlSnippetAfter(root, snippet, `/${target}`);
            }
        }
        else {
            let snippet = snippets[snippetName];
            if (root.find(`/components/${element}`)) {
                yield insertJsonSnippetInto(root, snippet, `/components/${element}`);
            }
            else if (root.find('/components')) {
                const position = findComponentsInsertionPosition(root, element);
                if (position >= 0) {
                    // found where to insert
                    snippet = `"${element}": {\n${snippet}\n}`;
                    yield insertJsonSnippetAfter(root, snippet, `/components/${componentsTags[position]}`);
                }
                else {
                    // insert into the 'components'
                    snippet = `\t"${element}": {\n\t${snippet}\n\t}`;
                    yield insertJsonSnippetInto(root, snippet, '/components');
                }
            }
            else {
                snippet = `"components": {\n\t"${element}": {\n\t${snippet}\n\t}\n}`;
                const target = findInsertionAnchor(root, 'components');
                yield insertJsonSnippetAfter(root, snippet, `/${target}`);
            }
        }
    });
}
function findInsertionAnchor(root, element) {
    const desiredPosition = topTags.indexOf(element) - 1;
    let position = desiredPosition;
    for (; position >= 0; position--) {
        if (root.find(`/${topTags[position]}`)) {
            break;
        }
    }
    if (position >= 0) {
        return topTags[position];
    }
    return null;
}
function increaseIndent(snippet, level = 1) {
    return snippet
        .split('\n')
        .map((line) => '\t'.repeat(level) + line)
        .join('\n');
}
function findComponentsInsertionPosition(root, element) {
    const desiredPosition = componentsTags.indexOf(element) - 1;
    let position = desiredPosition;
    for (; position >= 0; position--) {
        if (root.find(`/components/${componentsTags[position]}`)) {
            break;
        }
    }
    return position;
}
function safeParse(text, languageId) {
    const [root, errors] = ast_1.parse(text, languageId, parser_options_1.parserOptions);
    if (errors.length) {
        throw new Error("Can't parse OpenAPI file");
    }
    return root;
}
//# sourceMappingURL=commands.js.map