"use strict";
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.YamlNode = exports.JsonNode = exports.findYamlNodeAtOffset = exports.parseJson = exports.parseYaml = exports.parse = void 0;
const json_1 = require("./json");
Object.defineProperty(exports, "parseJson", { enumerable: true, get: function () { return json_1.parseJson; } });
Object.defineProperty(exports, "JsonNode", { enumerable: true, get: function () { return json_1.JsonNode; } });
const yaml_1 = require("./yaml");
Object.defineProperty(exports, "parseYaml", { enumerable: true, get: function () { return yaml_1.parseYaml; } });
Object.defineProperty(exports, "findYamlNodeAtOffset", { enumerable: true, get: function () { return yaml_1.findYamlNodeAtOffset; } });
Object.defineProperty(exports, "YamlNode", { enumerable: true, get: function () { return yaml_1.YamlNode; } });
function parse(text, languageId, options) {
    return languageId === 'yaml' ? yaml_1.parseYaml(text, options.get().yaml.schema) : json_1.parseJson(text);
}
exports.parse = parse;
//# sourceMappingURL=index.js.map