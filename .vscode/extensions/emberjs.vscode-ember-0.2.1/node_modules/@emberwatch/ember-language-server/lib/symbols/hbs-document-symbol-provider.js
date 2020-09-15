"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const { preprocess, traverse } = require('@glimmer/syntax');
const estree_utils_1 = require("../estree-utils");
class HBSDocumentSymbolProvider {
    constructor() {
        this.extensions = ['.hbs'];
    }
    process(content) {
        let ast = preprocess(content);
        let symbols = [];
        traverse(ast, {
            BlockStatement(node) {
                if (node.program.blockParams.length === 0)
                    return;
                node.program.blockParams.forEach((blockParam) => {
                    let symbol = vscode_languageserver_1.SymbolInformation.create(blockParam, vscode_languageserver_1.SymbolKind.Variable, estree_utils_1.toLSRange(node.loc));
                    symbols.push(symbol);
                });
            }
        });
        return symbols;
    }
}
exports.default = HBSDocumentSymbolProvider;
//# sourceMappingURL=hbs-document-symbol-provider.js.map