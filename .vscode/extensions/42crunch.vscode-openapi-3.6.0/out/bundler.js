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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMapping = exports.bundle = exports.getOpenApiVersion = void 0;
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
const path_1 = require("path");
const vscode = __importStar(require("vscode"));
const path_2 = require("path");
const json_schema_ref_parser_1 = __importDefault(require("json-schema-ref-parser"));
const url_1 = __importDefault(require("json-schema-ref-parser/lib/util/url"));
const pointer_1 = __importDefault(require("json-schema-ref-parser/lib/pointer"));
const ref_1 = __importDefault(require("json-schema-ref-parser/lib/ref"));
const pointer_2 = require("./pointer");
const bundler_parsers_1 = require("./bundler-parsers");
const destinationMap = {
    v2: {
        parameters: ['parameters'],
        schema: ['definitions'],
        responses: ['responses'],
    },
    v3: {
        parameters: ['components', 'parameters'],
        schema: ['components', 'schemas'],
        responses: ['components', 'responses'],
        examples: ['components', 'examples'],
        requestBody: ['components', 'requestBodies'],
        callbacks: ['components', 'callbacks'],
        headers: ['components', 'headers'],
        links: ['components', 'links'],
    },
};
function getOpenApiVersion(parsed) {
    const swaggerVersionValue = parsed['swagger'];
    const openApiVersionValue = parsed['openapi'];
    if (swaggerVersionValue === '2.0') {
        return 'v2';
    }
    else if (openApiVersionValue &&
        typeof openApiVersionValue === 'string' &&
        openApiVersionValue.match(/^3\.0\.\d(-.+)?$/)) {
        return 'v3';
    }
    return null;
}
exports.getOpenApiVersion = getOpenApiVersion;
const resolver = (documentUri) => {
    return {
        order: 10,
        canRead: (file) => {
            return true;
        },
        read: (file) => __awaiter(void 0, void 0, void 0, function* () {
            const uri = documentUri.with({ path: decodeURIComponent(file.url) });
            const document = yield vscode.workspace.openTextDocument(uri);
            return document.getText();
        }),
    };
};
function mangle(value) {
    return value.replace(/~/g, '-').replace(/\//g, '-').replace(/\#/g, '');
}
function set(target, path, value) {
    const head = path.slice(0, -1);
    const last = path[path.length - 1];
    let current = target;
    for (const key of head) {
        if (!current[key]) {
            current[key] = {};
        }
        current = current[key];
    }
    // check if the destination already exist
    if (current[last]) {
        throw new Error(`Unable to merge, object already exists at path: #/${path.join('/')}/${last}`);
    }
    current[last] = value;
}
function bundle(document, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsed = bundler_parsers_1.parseDocument(document, options);
        const cwd = path_2.dirname(document.uri.fsPath) + '/';
        const state = {
            version: null,
            parsed: null,
            mapping: { value: null, children: {} },
            uris: { [document.uri.toString()]: true },
        };
        const bundled = yield json_schema_ref_parser_1.default.bundle(parsed, {
            cwd,
            resolve: { http: false, file: resolver(document.uri) },
            parse: {
                json: bundler_parsers_1.bundlerJsonParser,
                yaml: bundler_parsers_1.bundlerYamlParserWithOptions(options),
            },
            hooks: {
                onParse: (parsed) => {
                    state.parsed = parsed;
                    state.version = getOpenApiVersion(parsed);
                },
                onRemap: (entry) => {
                    const filename = url_1.default.toFileSystemPath(entry.file);
                    const uri = document.uri.with({ path: decodeURIComponent(entry.file) }).toString();
                    if (!state.uris[uri]) {
                        state.uris[uri] = true;
                    }
                    // FIXME implement remap for openapi v2 and $ref location based remap
                    const hashPath = pointer_1.default.parse(entry.hash);
                    if (hashPath[0] == 'components') {
                        // TODO check that hashPath == 'schemas' or 'parameters', etc.
                        const targetFileName = path_1.relative(cwd, filename);
                        let path = ['components', hashPath[1], mangle(targetFileName) + '-' + hashPath[2]];
                        if (hashPath.length > 3) {
                            path = path.concat(hashPath.slice(3));
                        }
                        set(state.parsed, path, entry.value);
                        insertMapping(state.mapping, path, { file: filename, hash: entry.hash });
                        return pointer_1.default.join('#', path);
                    }
                    const path = pointer_1.default.parse(entry.pathFromRoot);
                    const parentKey = path[path.length - 1];
                    const grandparentKey = path[path.length - 2];
                    const destinations = destinationMap[state.version];
                    const destination = destinations[parentKey]
                        ? destinations[parentKey]
                        : destinations[grandparentKey]
                            ? destinations[grandparentKey]
                            : null;
                    if (destination) {
                        const ref = entry.$ref.$ref;
                        const mangled = mangle(ref);
                        const path = destination.concat([mangled]);
                        set(state.parsed, path, entry.value);
                        insertMapping(state.mapping, path, { file: filename, hash: entry.hash });
                        return pointer_1.default.join('#', path);
                    }
                    insertMapping(state.mapping, path, { file: filename, hash: entry.hash });
                    entry.$ref = entry.parent[entry.key] = ref_1.default.dereference(entry.$ref, entry.value);
                },
            },
        });
        const result = JSON.stringify(bundled);
        return [result, state.mapping, state.uris];
    });
}
exports.bundle = bundle;
function insertMapping(root, path, value) {
    let current = root;
    for (const segment of path) {
        if (!current.children[segment]) {
            current.children[segment] = { value: null, children: {} };
        }
        current = current.children[segment];
    }
    // TODO check that current.value is empty
    current.value = value;
}
function findMapping(root, pointer) {
    const path = pointer_2.parseJsonPointer(pointer);
    let current = root;
    let i = 0;
    for (; i < path.length && current.children[path[i]]; i++) {
        current = current.children[path[i]];
    }
    const { file, hash } = current.value;
    if (i < path.length) {
        const remaining = path.slice(i, path.length);
        return { file, hash: hash + pointer_2.joinJsonPointer(remaining) };
    }
    return { file, hash };
}
exports.findMapping = findMapping;
//# sourceMappingURL=bundler.js.map