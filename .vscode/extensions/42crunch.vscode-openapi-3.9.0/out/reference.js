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
exports.YamlSchemaDefinitionProvider = exports.JsonSchemaDefinitionProvider = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const json = __importStar(require("jsonc-parser"));
const yaml = __importStar(require("js-yaml"));
const ast_1 = require("./ast");
const parser_options_1 = require("./parser-options");
function refToUri(ref, currentDocumentUri) {
    if (ref.startsWith('#')) {
        // local reference
        return currentDocumentUri;
    }
    try {
        // see if this is an extenral url by trying to parse it,
        // if no scheme: is present, exception is thrown
        return vscode.Uri.parse(ref, true);
    }
    catch (_a) {
        // assume a local file reference
        const baseDir = path.dirname(currentDocumentUri.fsPath);
        if (ref.includes('#')) {
            const [filename] = ref.split('#', 2);
            return currentDocumentUri.with({ path: path.join(baseDir, filename) });
        }
        else {
            return currentDocumentUri.with({ path: path.join(baseDir, ref) });
        }
    }
}
function refToLocation(ref, currentDocumentUri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ref.includes('#')) {
            // reference to a file and an JSON pointer
            const [, pointer] = ref.split('#', 2);
            const refUri = refToUri(ref, currentDocumentUri);
            const refDocument = yield vscode.workspace.openTextDocument(refUri);
            const [root, errors] = ast_1.parse(refDocument.getText(), refDocument.languageId, parser_options_1.parserOptions);
            if (errors.length === 0) {
                const target = root.find(pointer);
                if (target) {
                    const [start, end] = target.getRange();
                    return new vscode.Location(refDocument.uri, new vscode.Range(refDocument.positionAt(start), refDocument.positionAt(end)));
                }
            }
        }
        else {
            // the entire file is referenced
            const refUri = refToUri(ref, currentDocumentUri);
            const refDocument = yield vscode.workspace.openTextDocument(refUri);
            return new vscode.Location(refDocument.uri, new vscode.Range(0, 0, 0, 0));
        }
    });
}
class JsonSchemaDefinitionProvider {
    provideDefinition(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const offset = document.offsetAt(position);
            const location = json.getLocation(document.getText(), offset);
            const last = location.path[location.path.length - 1];
            const pnode = location.previousNode;
            if (last === '$ref' && pnode && pnode.type === 'string') {
                return refToLocation(pnode.value, document.uri);
            }
            return null;
        });
    }
}
exports.JsonSchemaDefinitionProvider = JsonSchemaDefinitionProvider;
function extractRef(parsed) {
    for (const [name, value] of Object.entries(parsed)) {
        if (name === '$ref') {
            return value;
        }
        else if (typeof value === 'object' && value !== null) {
            const nested = extractRef(value);
            if (nested) {
                return nested;
            }
        }
    }
    return null;
}
const refRegex = new RegExp('\\$ref\\s*:\\s+([\\S]+)');
class YamlSchemaDefinitionProvider {
    provideDefinition(document, position, token) {
        const line = document.lineAt(position.line);
        if (line.text.match(refRegex)) {
            const parsed = yaml.safeLoad(line.text);
            const ref = extractRef(parsed);
            return refToLocation(ref, document.uri);
        }
        return null;
    }
}
exports.YamlSchemaDefinitionProvider = YamlSchemaDefinitionProvider;
//# sourceMappingURL=reference.js.map