"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const estree_utils_1 = require("./estree-utils");
class ASTPath {
    constructor(path, index = path.length - 1) {
        this.path = path;
        this.index = index;
    }
    static toPosition(ast, position) {
        let path = _findFocusPath(ast, position);
        if (path) {
            return new ASTPath(path);
        }
    }
    get node() {
        return this.path[this.index];
    }
    get parent() {
        return this.path[this.index - 1];
    }
    get parentPath() {
        return new ASTPath(this.path, this.index - 1);
    }
}
exports.default = ASTPath;
function _findFocusPath(node, position, seen = new Set()) {
    seen.add(node);
    let path = [];
    let range = node.loc;
    if (range) {
        if (estree_utils_1.containsPosition(range, position)) {
            path.push(node);
        }
        else {
            return [];
        }
    }
    for (let key in node) {
        if (!node.hasOwnProperty(key)) {
            continue;
        }
        let value = node[key];
        if (!value || typeof value !== 'object' || seen.has(value)) {
            continue;
        }
        let childPath = _findFocusPath(value, position, seen);
        if (childPath.length > 0) {
            path = path.concat(childPath);
            break;
        }
    }
    return path;
}
//# sourceMappingURL=glimmer-utils.js.map