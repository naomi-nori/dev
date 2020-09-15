"use strict";
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.parserOptions = exports.filterInvalidCustomTags = exports.ParserOptions = void 0;
const js_yaml_1 = require("js-yaml");
class ParserOptions {
    constructor() {
        this.yamlSchema = this.buildYamlSchema([]);
    }
    configure(configuration) {
        this.configuration = configuration;
        const customTags = configuration.get('customTags');
        this.yamlSchema = this.buildYamlSchema(customTags);
        configuration.onDidChange(this.onConfigurationChanged, this);
    }
    get() {
        return {
            yaml: { schema: this.yamlSchema },
        };
    }
    onConfigurationChanged(e) {
        if (this.configuration.changed(e, 'customTags')) {
            const customTags = this.configuration.get('customTags');
            this.yamlSchema = this.buildYamlSchema(customTags);
        }
    }
    buildYamlSchema(customTags) {
        const filteredTags = filterInvalidCustomTags(customTags);
        const schemaWithAdditionalTags = js_yaml_1.Schema.create(filteredTags.map(tag => {
            const typeInfo = tag.split(' ');
            return new js_yaml_1.Type(typeInfo[0], { kind: (typeInfo[1] && typeInfo[1].toLowerCase()) || 'scalar' });
        }));
        const tagWithAdditionalItems = new Map();
        filteredTags.forEach(tag => {
            const typeInfo = tag.split(' ');
            const tagName = typeInfo[0];
            const tagType = (typeInfo[1] && typeInfo[1].toLowerCase()) || 'scalar';
            if (tagWithAdditionalItems.has(tagName)) {
                tagWithAdditionalItems.set(tagName, tagWithAdditionalItems.get(tagName).concat([tagType]));
            }
            else {
                tagWithAdditionalItems.set(tagName, [tagType]);
            }
        });
        tagWithAdditionalItems.forEach((additionalTagKinds, key) => {
            const newTagType = new js_yaml_1.Type(key, { kind: additionalTagKinds[0] || 'scalar' });
            newTagType.additionalKinds = additionalTagKinds;
            schemaWithAdditionalTags.compiledTypeMap[key] = newTagType;
        });
        return schemaWithAdditionalTags;
    }
}
exports.ParserOptions = ParserOptions;
function filterInvalidCustomTags(customTags) {
    const validCustomTags = ['mapping', 'scalar', 'sequence'];
    return customTags.filter(tag => {
        if (typeof tag === 'string') {
            const typeInfo = tag.split(' ');
            const type = (typeInfo[1] && typeInfo[1].toLowerCase()) || 'scalar';
            // We need to check if map is a type because map will throw an error within the yaml-ast-parser
            if (type === 'map') {
                return false;
            }
            return validCustomTags.indexOf(type) !== -1;
        }
        return false;
    });
}
exports.filterInvalidCustomTags = filterInvalidCustomTags;
exports.parserOptions = new ParserOptions();
//# sourceMappingURL=parser-options.js.map