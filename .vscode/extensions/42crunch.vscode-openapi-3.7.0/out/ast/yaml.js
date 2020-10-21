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
exports.findYamlNodeAtOffset = exports.YamlNode = exports.parseYaml = void 0;
const yaml = __importStar(require("yaml-ast-parser-custom-tags"));
const pointer_1 = require("../pointer");
function parseYaml(text, schema) {
    const documents = [];
    yaml.loadAll(text, (document) => {
        documents.push(document);
    }, { schema });
    if (documents.length !== 1) {
        return [null, []];
    }
    const node = new YamlNode(documents[0]);
    const normalizedErrors = documents[0].errors.map((error) => ({
        message: error.message,
        offset: error.mark ? error.mark.position : 0,
    }));
    return [node, normalizedErrors];
}
exports.parseYaml = parseYaml;
class YamlNode {
    constructor(node) {
        this.node = node;
    }
    find(rawpointer) {
        const pointer = pointer_1.parseJsonPointer(rawpointer);
        const result = findNodeAtLocation(this.node, pointer);
        if (result) {
            return new YamlNode(result);
        }
        return null;
    }
    getParent() {
        return new YamlNode(this.node.parent.parent);
    }
    getKey() {
        if (this.node.kind === yaml.Kind.MAPPING) {
            const mapping = this.node;
            return mapping.key.value;
        }
        else if (this.node.parent && this.node.parent.kind === yaml.Kind.SEQ) {
            const seq = this.node.parent;
            return String(seq.items.indexOf(this.node));
        }
        else if (this.node.parent && this.node.parent.kind === yaml.Kind.MAPPING) {
            return this.node.parent.key.value;
        }
    }
    getValue() {
        if (this.node.kind === yaml.Kind.MAPPING) {
            const mapping = this.node;
            if (mapping && mapping.value && mapping.value.value) {
                return mapping.value.value;
            }
        }
        else if (this.node.kind === yaml.Kind.SCALAR) {
            // fixme should not happen
            return this.node.value;
        }
    }
    getRange() {
        return [this.node.startPosition, this.node.endPosition];
    }
    getChildren() {
        const result = [];
        if (this.node.kind === yaml.Kind.MAPPING) {
            const value = this.node.value;
            if (value && value.kind === yaml.Kind.MAP) {
                for (const mapping of value.mappings) {
                    if (mapping) {
                        result.push(new YamlNode(mapping));
                    }
                }
            }
            else if (value && value.kind === yaml.Kind.SEQ) {
                for (const item of value.items) {
                    if (item) {
                        result.push(new YamlNode(item));
                    }
                }
            }
        }
        else if (this.node.kind === yaml.Kind.MAP) {
            for (const mapping of this.node.mappings) {
                result.push(new YamlNode(mapping));
            }
        }
        return result;
    }
    getDepth() {
        let depth = 0;
        let parent = this.node.parent;
        while (parent) {
            if (parent.kind === yaml.Kind.MAP || parent.kind === yaml.Kind.SEQ) {
                depth++;
            }
            parent = parent.parent;
        }
        return depth;
    }
    findNodeAtOffset(offset) {
        const found = findYamlNodeAtOffset(this.node, offset);
        if (found) {
            if (found.kind === yaml.Kind.SCALAR) {
                return new YamlNode(found.parent);
            }
            else if (found.kind === yaml.Kind.MAPPING) {
                return new YamlNode(found);
            }
            else if (found.kind === yaml.Kind.SEQ) {
                return new YamlNode(found);
            }
        }
    }
    getJsonPonter() {
        const path = [];
        let node = this.node;
        while (node) {
            if (node.kind === yaml.Kind.MAPPING) {
                const mapping = node;
                path.push(mapping.key.value);
            }
            else if (node.parent && node.parent.kind === yaml.Kind.SEQ) {
                const seq = node.parent;
                path.push(seq.items.indexOf(node));
            }
            node = node.parent;
        }
        return pointer_1.joinJsonPointer(path.reverse());
    }
}
exports.YamlNode = YamlNode;
function findNodeAtLocation(root, path) {
    if (path.length === 0) {
        return root;
    }
    if (root && root.kind === yaml.Kind.MAP) {
        const head = path[0];
        const tree = root;
        for (const mapping of tree.mappings) {
            if (mapping.key && mapping.key.kind === yaml.Kind.SCALAR && mapping.key.value === head) {
                if (path.length === 1) {
                    // this is the last entry in path, return found node
                    return mapping;
                }
                else {
                    return findNodeAtLocation(mapping.value, path.slice(1));
                }
            }
        }
    }
    else if (root && root.kind === yaml.Kind.SEQ) {
        const tree = root;
        const index = parseInt(path[0], 10);
        const mapping = tree.items[index];
        if (path.length === 1) {
            // this is the last entry in path, return found node
            return mapping;
        }
        else {
            return findNodeAtLocation(mapping, path.slice(1));
        }
    }
    return null;
}
function contains(node, offset) {
    return offset >= node.startPosition && offset <= node.endPosition;
}
function findYamlNodeAtOffset(node, offset) {
    if (contains(node, offset)) {
        if (node.kind === yaml.Kind.MAPPING) {
            const yamlMapping = node;
            const foundInKey = findYamlNodeAtOffset(yamlMapping.key, offset);
            if (foundInKey) {
                return foundInKey;
            }
            // in case of partial yaml like "foo:" yamlMapping.value could be null
            // in this case do not try to descend it and return key instead
            if (yamlMapping.value === null) {
                return yamlMapping.key;
            }
            else {
                const foundInValue = findYamlNodeAtOffset(yamlMapping.value, offset);
                if (foundInValue) {
                    return foundInValue;
                }
            }
        }
        else if (node.kind === yaml.Kind.MAP) {
            const yamlMap = node;
            for (const mapping of yamlMap.mappings) {
                const foundInMapping = findYamlNodeAtOffset(mapping, offset);
                if (foundInMapping) {
                    return foundInMapping;
                }
            }
            // this node contains the offset, but we didn't find it in the mappings
            // lets set the offset to the end of the last mapping and retry
            const lastMapping = yamlMap.mappings[yamlMap.mappings.length - 1];
            return findYamlNodeAtOffset(lastMapping, lastMapping.endPosition);
        }
        else if (node.kind === yaml.Kind.SEQ) {
            const yamlSeq = node;
            for (const item of yamlSeq.items) {
                const found = findYamlNodeAtOffset(item, offset);
                if (found) {
                    return found;
                }
            }
        }
        return node;
    }
    return null;
}
exports.findYamlNodeAtOffset = findYamlNodeAtOffset;
//# sourceMappingURL=yaml.js.map