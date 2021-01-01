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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundlerYamlParserWithOptions = exports.bundlerJsonParser = exports.parseDocument = void 0;
const yaml = __importStar(require("js-yaml"));
const json = __importStar(require("jsonc-parser"));
const parseJson = (text) => {
    const errors = [];
    const parsed = json.parse(text, errors, { allowTrailingComma: true });
    if (errors.length > 0) {
        const message = errors
            .map((error) => `${json.printParseErrorCode(error.error)} at offset ${error.offset}`)
            .join(', ');
        throw new Error(`Failed to parse JSON: ${message}`);
    }
    return parsed;
};
const parseYaml = (text, options) => {
    const { yaml: { schema }, } = options.get();
    return yaml.safeLoad(text, { schema });
};
function parseDocument(document, options) {
    if (document.languageId === 'yaml') {
        return parseYaml(document.getText(), options);
    }
    return parseJson(document.getText());
}
exports.parseDocument = parseDocument;
exports.bundlerJsonParser = {
    order: 100,
    canParse: ['.json', '.jsonc'],
    parse: (file) => {
        return new Promise((resolve, reject) => {
            let data = file.data;
            if (Buffer.isBuffer(data)) {
                data = data.toString();
            }
            if (typeof data === 'string') {
                if (data.trim().length === 0) {
                    resolve(undefined); // This mirrors the YAML behavior
                }
                else {
                    resolve(parseJson(data));
                }
            }
            else {
                // data is already a JavaScript value (object, array, number, null, NaN, etc.)
                resolve(data);
            }
        });
    },
};
exports.bundlerYamlParserWithOptions = (options) => ({
    order: 200,
    canParse: ['.yaml', '.yml'],
    parse: (file) => {
        return new Promise((resolve, reject) => {
            let data = file.data;
            if (Buffer.isBuffer(data)) {
                data = data.toString();
            }
            if (typeof data === 'string') {
                resolve(parseYaml(data, options));
            }
            else {
                // data is already a JavaScript value (object, array, number, null, NaN, etc.)
                resolve(data);
            }
        });
    },
});
//# sourceMappingURL=bundler-parsers.js.map