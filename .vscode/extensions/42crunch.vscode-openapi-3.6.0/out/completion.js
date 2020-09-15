"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionItemProvider = void 0;
const vscode = __importStar(require("vscode"));
const ast_1 = require("./ast");
const util_1 = require("./util");
const constants_1 = require("./constants");
const parser_options_1 = require("./parser-options");
const path_1 = __importDefault(require("path"));
const targetMapping = {
    [constants_1.OpenApiVersion.V2]: {
        schema: '/definitions',
        items: '/definitions',
        parameters: '/parameters',
        responses: '/responses',
        properties: '/definitions',
    },
    [constants_1.OpenApiVersion.V3]: {
        schema: '/components/schemas',
        responses: '/components/responses',
        parameters: '/components/parameters',
        examples: '/components/examples',
        requestBody: '/components/requestBodies',
        callbacks: '/components/callbacks',
        headers: '/components/headers',
        links: '/components/links',
        items: '/components/schemas',
        properties: '/components/schemas',
    },
};
function findTarget(root, node) {
    var _a, _b, _c;
    const mapping = targetMapping[util_1.getOpenApiVersion(root)];
    if (mapping) {
        return mapping[(_a = node.getParent()) === null || _a === void 0 ? void 0 : _a.getKey()] || mapping[(_c = (_b = node.getParent()) === null || _b === void 0 ? void 0 : _b.getParent()) === null || _c === void 0 ? void 0 : _c.getKey()];
    }
}
class CompletionItemProvider {
    constructor(context, didChangeTree) {
        this.context = context;
        this.didChangeTree = didChangeTree;
        didChangeTree(([node, changeEvent]) => {
            this.root = node;
        });
    }
    provideCompletionItems(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const line = document.lineAt(position).text;
            if (!(line.includes('$ref:') || line.includes('"$ref"'))) {
                return undefined;
            }
            const offset = document.offsetAt(position);
            const [start, end] = this.root.getRange();
            // if offset is beyond the range of the root node
            // which could happen in case of incomplete yaml node with
            // bunch of spaces at the end;
            // look for the node at the end of the root node range
            const node = this.root.findNodeAtOffset(offset > end ? end : offset);
            let searchRoot = this.root;
            let fileRef = '';
            // check if we are looking for remote references
            // we are looking for reference if the line ends with # and
            // the prefix part refers to a file existing file path
            if (line.trimRight().match('.*#("|\')?$')) {
                fileRef = line
                    .substring(line.lastIndexOf(':') + 1, line.lastIndexOf('#'))
                    .replace('"', '')
                    .replace("'", '')
                    .trim();
                try {
                    const otherPath = path_1.default.normalize(path_1.default.join(path_1.default.dirname(document.uri.fsPath), fileRef));
                    const otherUri = document.uri.with({ path: otherPath });
                    // stat fileUri, if it does not exists an exception is thrown
                    yield vscode.workspace.fs.stat(otherUri);
                    const otherDocument = yield vscode.workspace.openTextDocument(otherUri);
                    const [root, errors] = ast_1.parse(otherDocument.getText(), otherDocument.languageId, parser_options_1.parserOptions);
                    if (!errors.length) {
                        searchRoot = root;
                    }
                }
                catch (ex) {
                    // file does not exists, ignore the exception
                }
            }
            const target = findTarget(this.root, node);
            const targetNode = target && searchRoot.find(target);
            const qouteChar = line.charAt(position.character) == '"' || line.charAt(position.character) == "'"
                ? line.charAt(position.character)
                : '"';
            if (targetNode) {
                // don't include trailing quote when completing YAML and
                // there are already quotes in line
                let trailingQuote = qouteChar;
                let leadingSpace = ' ';
                if (line.charAt(position.character) == qouteChar) {
                    leadingSpace = '';
                    if (document.languageId === 'yaml') {
                        trailingQuote = '';
                    }
                }
                const completions = targetNode.getChildren().map((child) => {
                    const key = child.getKey();
                    return new vscode.CompletionItem(`${leadingSpace}${qouteChar}${fileRef}#${target}/${key}${trailingQuote}`);
                });
                return completions;
            }
        });
    }
}
exports.CompletionItemProvider = CompletionItemProvider;
//# sourceMappingURL=completion.js.map