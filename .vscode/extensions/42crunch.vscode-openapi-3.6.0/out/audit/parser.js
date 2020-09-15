"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
const fs = __importStar(require("fs"));
const path_1 = require("path");
const vscode = __importStar(require("vscode"));
const yaml = __importStar(require("js-yaml"));
const path_2 = require("path");
const json_schema_ref_parser_1 = __importDefault(require("json-schema-ref-parser"));
const url_1 = __importDefault(require("json-schema-ref-parser/lib/util/url"));
const pointer_1 = __importDefault(require("json-schema-ref-parser/lib/pointer"));
const ref_1 = __importDefault(require("json-schema-ref-parser/lib/ref"));
const pointer_2 = require("../pointer");
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
const resolver = {
    order: 10,
    canRead: file => {
        return url_1.default.isFileSystemPath(file.url);
    },
    read: file => {
        return new Promise((resolve, reject) => {
            let path;
            try {
                path = url_1.default.toFileSystemPath(file.url);
            }
            catch (err) {
                reject(new Error(`Malformed URI: ${file.url}`));
            }
            // console.log('Opening file: %s', path);
            try {
                fs.readFile(path, (err, data) => {
                    if (err) {
                        reject(new Error(`Error opening file "${path}"`));
                    }
                    else {
                        resolve(data);
                    }
                });
            }
            catch (err) {
                reject(new Error(`Error opening file "${path}"`));
            }
        });
    },
};
function parseDocument(document, options) {
    if (document.languageId === 'yaml') {
        const { yaml: { schema }, } = options.get();
        return yaml.safeLoad(document.getText(), { schema });
    }
    return JSON.parse(document.getText());
}
function mangle(value) {
    return value
        .replace(/~/g, '-')
        .replace(/\//g, '-')
        .replace(/\#/g, '');
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
function convertToJson(document, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsed = parseDocument(document, options);
        const cwd = path_2.dirname(document.uri.fsPath) + '/';
        const state = {
            version: null,
            parsed: null,
            mapping: { value: null, children: {} },
            files: { [document.uri.toString()]: true },
        };
        const bundled = yield json_schema_ref_parser_1.default.bundle(parsed, {
            cwd,
            resolve: { http: false },
            hooks: {
                onParse: parsed => {
                    state.parsed = parsed;
                    state.version = getOpenApiVersion(parsed);
                },
                onRemap: entry => {
                    if (!state.files[entry.file]) {
                        state.files[entry.file] = true;
                    }
                    // FIXME implement remap for openapi v2 and $ref location based remap
                    const hashPath = pointer_1.default.parse(entry.hash);
                    if (hashPath.length == 3 && hashPath[0] == 'components') {
                        const targetFileName = path_1.relative(cwd, entry.file);
                        const path = ['components', hashPath[1], mangle(targetFileName) + '-' + hashPath[2]];
                        set(state.parsed, path, entry.value);
                        insertMapping(state.mapping, path, { file: entry.file, hash: entry.hash });
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
                        insertMapping(state.mapping, path, { file: entry.file, hash: entry.hash });
                        return pointer_1.default.join('#', path);
                    }
                    insertMapping(state.mapping, path, { file: entry.file, hash: entry.hash });
                    entry.$ref = entry.parent[entry.key] = ref_1.default.dereference(entry.$ref, entry.value);
                },
            },
        });
        const documents = Object.keys(state.files).map(filename => vscode.Uri.file(filename).toString());
        const result = JSON.stringify(bundled);
        return [result, documents, state.mapping];
    });
}
exports.convertToJson = convertToJson;
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
//# sourceMappingURL=parser.js.map