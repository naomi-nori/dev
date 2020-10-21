"use strict";
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = __importStar(require("js-yaml"));
function convertToJson(text, languageId, options) {
    if (languageId === 'yaml') {
        const { yaml: { schema }, } = options.get();
        const parsed = yaml.safeLoad(text, { schema });
        return JSON.stringify(parsed);
    }
    return text;
}
exports.convertToJson = convertToJson;
//# sourceMappingURL=parser.js.map