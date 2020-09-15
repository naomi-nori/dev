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
exports.JsonNode = exports.parseJson = void 0;
const json = __importStar(require("jsonc-parser"));
const pointer_1 = require("../pointer");
function parseJson(text) {
    const parseErrors = [];
    const node = new JsonNode(json.parseTree(text, parseErrors));
    const normalizedErrors = parseErrors.map((error) => ({
        message: json.printParseErrorCode(error.error),
        offset: error.offset,
    }));
    return [node, normalizedErrors];
}
exports.parseJson = parseJson;
class JsonNode {
    constructor(node) {
        this.node = node;
    }
    find(rawpointer) {
        const pointer = pointer_1.parseJsonPointer(rawpointer);
        let node = this.node;
        if (!node) {
            return null;
        }
        for (let segment of pointer) {
            // each object we traverse must be either object or array
            if (node.type === 'object' && Array.isArray(node.children)) {
                let found = false;
                for (let propertyNode of node.children) {
                    if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
                        node = propertyNode.children[1];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return null;
                }
            }
            else {
                const index = parseInt(segment, 10);
                if (node.type === 'array' && index >= 0 && Array.isArray(node.children) && index < node.children.length) {
                    node = node.children[index];
                }
                else {
                    return null;
                }
            }
        }
        return new JsonNode(node);
    }
    getParent() {
        // each value node must have either property or array as it's parent
        // but check for type=object parent just in case
        const parent = this.node.parent;
        if (parent) {
            if (parent.type === 'property') {
                return new JsonNode(parent.parent);
            }
            else if (parent.type === 'array' || parent.type === 'object') {
                return new JsonNode(parent);
            }
        }
    }
    getKey() {
        const parent = this.node.parent;
        if (parent) {
            if (parent.type === 'property') {
                return parent.children[0].value;
            }
            else if (parent.type === 'array') {
                return String(parent.children.indexOf(this.node));
            }
        }
        return null;
    }
    getValue() {
        return this.node.value;
    }
    getRange() {
        return [this.node.offset, this.node.offset + this.node.length];
    }
    getChildren() {
        if (this.node.type === 'object') {
            return this.node.children.map((child) => new JsonNode(child.children[1]));
        }
        else if (this.node.type === 'array') {
            return this.node.children.map((child) => new JsonNode(child));
        }
    }
    getDepth() {
        let depth = 0;
        let parent = this.node.parent;
        while (parent) {
            if (parent.type === 'object' || parent.type === 'array') {
                depth++;
            }
            parent = parent.parent;
        }
        return depth;
    }
    findNodeAtOffset(offset) {
        const node = json.findNodeAtOffset(this.node, offset);
        if (node) {
            return new JsonNode(node);
        }
        return null;
    }
    getJsonPonter() {
        return pointer_1.joinJsonPointer(json.getNodePath(this.node));
    }
}
exports.JsonNode = JsonNode;
//# sourceMappingURL=json.js.map