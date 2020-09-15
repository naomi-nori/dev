"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const HelperItem = vscode_languageserver_1.CompletionItemKind.Function;
const ComponentItem = vscode_languageserver_1.CompletionItemKind.Class;
class EmberCompletionItem {
    constructor(label, kind, usableIn, version) {
        this.label = label;
        this.kind = kind;
        this.usableIn = usableIn;
        this.version = version;
        this.detail = 'Ember';
        if (version) {
            this.detail = `Ember ${this.version}`;
        }
    }
}
const emberCompletionItems = [
    new EmberCompletionItem('action', HelperItem, ['MustachePath', 'SubExpressionPath']),
    new EmberCompletionItem('component', HelperItem, ['BlockPath', 'MustachePath', 'SubExpressionPath'], '1.11.0'),
    new EmberCompletionItem('concat', HelperItem, ['MustachePath', 'SubExpressionPath'], '1.13.0'),
    new EmberCompletionItem('debugger', HelperItem, ['MustachePath']),
    new EmberCompletionItem('each', HelperItem, ['BlockPath']),
    new EmberCompletionItem('each-in', HelperItem, ['BlockPath'], '2.1.0'),
    new EmberCompletionItem('get', HelperItem, ['MustachePath', 'SubExpressionPath'], '2.1.0'),
    new EmberCompletionItem('hash', HelperItem, ['SubExpressionPath']),
    new EmberCompletionItem('if', HelperItem, ['BlockPath', 'MustachePath', 'SubExpressionPath']),
    new EmberCompletionItem('input', ComponentItem, ['MustachePath']),
    new EmberCompletionItem('link-to', ComponentItem, ['MustachePath']),
    new EmberCompletionItem('loc', HelperItem, ['MustachePath', 'SubExpressionPath']),
    new EmberCompletionItem('log', HelperItem, ['MustachePath']),
    new EmberCompletionItem('mount', HelperItem, ['MustachePath']),
    new EmberCompletionItem('mut', HelperItem, ['SubExpressionPath']),
    new EmberCompletionItem('outlet', HelperItem, ['MustachePath']),
    new EmberCompletionItem('partial', HelperItem, ['MustachePath']),
    new EmberCompletionItem('query-params', HelperItem, ['SubExpressionPath']),
    new EmberCompletionItem('render', HelperItem, ['MustachePath']),
    new EmberCompletionItem('textarea', ComponentItem, ['MustachePath']),
    new EmberCompletionItem('unbound', HelperItem, ['MustachePath', 'SubExpressionPath']),
    new EmberCompletionItem('unless', HelperItem, ['BlockPath', 'MustachePath', 'SubExpressionPath']),
    new EmberCompletionItem('with', HelperItem, ['BlockPath'])
];
function filterConfigs(type) {
    return emberCompletionItems.filter(({ usableIn }) => usableIn.includes(type));
}
exports.emberBlockItems = filterConfigs('BlockPath');
exports.emberMustacheItems = filterConfigs('MustachePath');
exports.emberSubExpressionItems = filterConfigs('SubExpressionPath');
//# sourceMappingURL=ember-helpers.js.map