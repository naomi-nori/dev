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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.provideYamlSchemas = exports.getOpenApiVersion = exports.parseDocument = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const constants_1 = require("./constants");
const ast_1 = require("./ast");
const parser_options_1 = require("./parser-options");
function parseDocument(document) {
    if (!(document.languageId === 'json' || document.languageId === 'jsonc' || document.languageId == 'yaml')) {
        return [constants_1.OpenApiVersion.Unknown, null, null];
    }
    const [node, errors] = ast_1.parse(document.getText(), document.languageId, parser_options_1.parserOptions);
    const version = getOpenApiVersion(node);
    const messages = errors.map((error) => {
        const position = document.positionAt(error.offset);
        const line = document.lineAt(position);
        return {
            code: '',
            severity: vscode.DiagnosticSeverity.Error,
            message: error.message,
            range: line.range,
        };
    });
    return [version, node, messages.length > 0 ? messages : null];
}
exports.parseDocument = parseDocument;
function getOpenApiVersion(root) {
    var _a, _b;
    const swaggerVersionValue = (_a = root === null || root === void 0 ? void 0 : root.find('/swagger')) === null || _a === void 0 ? void 0 : _a.getValue();
    const openApiVersionValue = (_b = root === null || root === void 0 ? void 0 : root.find('/openapi')) === null || _b === void 0 ? void 0 : _b.getValue();
    if (swaggerVersionValue === '2.0') {
        return constants_1.OpenApiVersion.V2;
    }
    else if (openApiVersionValue &&
        typeof openApiVersionValue === 'string' &&
        openApiVersionValue.match(/^3\.0\.\d(-.+)?$/)) {
        return constants_1.OpenApiVersion.V3;
    }
    return constants_1.OpenApiVersion.Unknown;
}
exports.getOpenApiVersion = getOpenApiVersion;
function provideYamlSchemas(context, yamlExtension) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!yamlExtension.isActive) {
            yield yamlExtension.activate();
        }
        function requestSchema(uri) {
            for (const document of vscode.workspace.textDocuments) {
                if (document.uri.toString() === uri) {
                    const [node] = ast_1.parse(document.getText(), 'yaml', parser_options_1.parserOptions);
                    const version = getOpenApiVersion(node);
                    if (version === constants_1.OpenApiVersion.V2) {
                        return 'openapi:v2';
                    }
                    else if (version === constants_1.OpenApiVersion.V3) {
                        return 'openapi:v3';
                    }
                    break;
                }
            }
            return null;
        }
        function requestSchemaContent(uri) {
            if (uri === 'openapi:v2') {
                const filename = path.join(context.extensionPath, 'schema', 'openapi-2.0.json');
                return fs.readFileSync(filename, { encoding: 'utf8' });
            }
            else if (uri === 'openapi:v3') {
                const filename = path.join(context.extensionPath, 'schema', 'openapi-3.0-2019-04-02.json');
                return fs.readFileSync(filename, { encoding: 'utf8' });
            }
            return null;
        }
        const schemaContributor = yamlExtension.exports;
        schemaContributor.registerContributor('openapi', requestSchema, requestSchemaContent);
    });
}
exports.provideYamlSchemas = provideYamlSchemas;
//# sourceMappingURL=util.js.map