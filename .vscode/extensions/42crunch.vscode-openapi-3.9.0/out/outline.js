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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralThreeOutlineProvider = exports.GeneralTwoOutlineProvider = exports.ResponsesOutlineProvider = exports.ParametersOutlineProvider = exports.ServersOutlineProvider = exports.ComponentsOutlineProvider = exports.SecurityOutlineProvider = exports.SecurityDefinitionOutlineProvider = exports.DefinitionOutlineProvider = exports.PathOutlineProvider = void 0;
const vscode = __importStar(require("vscode"));
const configuration_1 = require("./configuration");
class OutlineProvider {
    constructor(context, didChangeTree) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.maxDepth = 1;
        didChangeTree(([node, changeEvent]) => {
            const pointer = this.getRootPointer();
            if (node && pointer) {
                this.root = node.find(pointer);
            }
            else if (node) {
                this.root = node;
            }
            else {
                this.root = null;
            }
            this._onDidChangeTreeData.fire();
        });
        this.sort = configuration_1.configuration.get('sortOutlines');
        configuration_1.configuration.onDidChange(this.onConfigurationChanged, this);
    }
    onConfigurationChanged(e) {
        if (configuration_1.configuration.changed(e, 'sortOutlines')) {
            this.sort = configuration_1.configuration.get('sortOutlines');
            this._onDidChangeTreeData.fire();
        }
    }
    getRootPointer() {
        return null;
    }
    getChildren(node) {
        if (!this.root) {
            return Promise.resolve([]);
        }
        if (!node) {
            node = this.root;
        }
        if (node.getDepth() > this.maxDepth) {
            return Promise.resolve([]);
        }
        return Promise.resolve(this.sortChildren(this.filterChildren(node, node.getChildren())));
    }
    filterChildren(node, children) {
        return children;
    }
    sortChildren(children) {
        if (this.sort) {
            return children.sort((a, b) => {
                const labelA = this.getLabel(a);
                const labelB = this.getLabel(b);
                return labelA.localeCompare(labelB);
            });
        }
        return children;
    }
    getTreeItem(node) {
        const label = this.getLabel(node);
        const collapsible = this.getCollapsible(node);
        const treeItem = new vscode.TreeItem(label, collapsible);
        treeItem.command = this.getCommand(node);
        treeItem.contextValue = this.getContextValue(node);
        return treeItem;
    }
    getCollapsible(node) {
        const canDisplayChildren = node.getDepth() < this.maxDepth;
        return canDisplayChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
    }
    getLabel(node) {
        return node ? node.getKey() : '<unknown>';
    }
    getCommand(node) {
        const editor = vscode.window.activeTextEditor;
        const [start, end] = node.getRange();
        return {
            command: 'openapi.goToLine',
            title: '',
            arguments: [new vscode.Range(editor.document.positionAt(start), editor.document.positionAt(end))],
        };
    }
    getContextValue(node) {
        return null;
    }
}
class PathOutlineProvider extends OutlineProvider {
    constructor() {
        super(...arguments);
        this.maxDepth = 5;
    }
    getRootPointer() {
        return '/paths';
    }
    filterChildren(node, children) {
        const depth = node.getDepth();
        const key = node.getKey();
        if (depth === 2) {
            return children.filter(child => {
                return ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace', 'parameters'].includes(child.getKey());
            });
        }
        else if (depth === 3 && key !== 'parameters') {
            return children.filter(child => {
                const key = child.getKey();
                return key === 'responses' || key === 'parameters';
            });
        }
        return children;
    }
    getLabel(node) {
        const depth = node.getDepth();
        if ((depth === 4 || depth === 5) && node.getParent().getKey() == 'parameters') {
            // return label for a parameter
            const ref = node.find('/$ref');
            const name = node.find('/name');
            const label = (ref && ref.getValue()) || (name && name.getValue());
            if (!label) {
                return '<unknown>';
            }
            return label;
        }
        return node.getKey();
    }
    getContextValue(node) {
        if (node.getDepth() === 2) {
            return 'path';
        }
        return null;
    }
}
exports.PathOutlineProvider = PathOutlineProvider;
class DefinitionOutlineProvider extends OutlineProvider {
    getRootPointer() {
        return '/definitions';
    }
}
exports.DefinitionOutlineProvider = DefinitionOutlineProvider;
class SecurityDefinitionOutlineProvider extends OutlineProvider {
    getRootPointer() {
        return '/securityDefinitions';
    }
}
exports.SecurityDefinitionOutlineProvider = SecurityDefinitionOutlineProvider;
class SecurityOutlineProvider extends OutlineProvider {
    getRootPointer() {
        return '/security';
    }
    getLabel(node) {
        const children = node.getChildren();
        if (children[0]) {
            return children[0].getKey();
        }
        return '<unknown>';
    }
}
exports.SecurityOutlineProvider = SecurityOutlineProvider;
class ComponentsOutlineProvider extends OutlineProvider {
    constructor() {
        super(...arguments);
        this.maxDepth = 3;
    }
    getRootPointer() {
        return '/components';
    }
}
exports.ComponentsOutlineProvider = ComponentsOutlineProvider;
class ServersOutlineProvider extends OutlineProvider {
    getRootPointer() {
        return '/servers';
    }
    getLabel(node) {
        for (const child of node.getChildren()) {
            if (child.getKey() === 'url') {
                const label = child.getValue();
                if (!label) {
                    return '<unknown>';
                }
                return label;
            }
        }
        return '<unknown>';
    }
}
exports.ServersOutlineProvider = ServersOutlineProvider;
class ParametersOutlineProvider extends OutlineProvider {
    getRootPointer() {
        return '/parameters';
    }
}
exports.ParametersOutlineProvider = ParametersOutlineProvider;
class ResponsesOutlineProvider extends OutlineProvider {
    getRootPointer() {
        return '/responses';
    }
}
exports.ResponsesOutlineProvider = ResponsesOutlineProvider;
class GeneralTwoOutlineProvider extends OutlineProvider {
    getChildren(node) {
        const targets = [
            '/swagger',
            '/host',
            '/basePath',
            '/info',
            '/schemes',
            '/consumes',
            '/produces',
            '/tags',
            '/externalDocs',
        ];
        const result = [];
        if (this.root) {
            for (const pointer of targets) {
                const node = this.root.find(pointer);
                if (node) {
                    result.push(node);
                }
            }
        }
        return Promise.resolve(result);
    }
}
exports.GeneralTwoOutlineProvider = GeneralTwoOutlineProvider;
class GeneralThreeOutlineProvider extends OutlineProvider {
    getChildren(node) {
        const targets = ['/openapi', '/info', '/tags', '/externalDocs'];
        const result = [];
        if (this.root) {
            for (const pointer of targets) {
                const node = this.root.find(pointer);
                if (node) {
                    result.push(node);
                }
            }
        }
        return Promise.resolve(result);
    }
}
exports.GeneralThreeOutlineProvider = GeneralThreeOutlineProvider;
//# sourceMappingURL=outline.js.map