'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Options = require('./options');
const $Refs = require('./refs');
const parse = require('./parse');
const normalizeArgs = require('./normalize-args');
const resolveExternal = require('./resolve-external');
const bundle = require('./bundle');
const bundleOpenapi = require('./bundle-openapi');
const dereference = require('./dereference');
const url = require('./util/url');
const maybe = require('call-me-maybe');
const { ono } = require('ono');
module.exports = $RefParser;
module.exports.YAML = require('./util/yaml');
/**
 * This class parses a JSON schema, builds a map of its JSON references and their resolved values,
 * and provides methods for traversing, manipulating, and dereferencing those references.
 *
 * @constructor
 */
function $RefParser() {
    /**
     * The parsed (and possibly dereferenced) JSON schema object
     *
     * @type {object}
     * @readonly
     */
    this.schema = null;
    /**
     * The resolved JSON references
     *
     * @type {$Refs}
     * @readonly
     */
    this.$refs = new $Refs();
}
/**
 * Parses the given JSON schema.
 * This method does not resolve any JSON references.
 * It just reads a single file in JSON or YAML format, and parse it as a JavaScript object.
 *
 * @param {string} [path] - The file path or URL of the JSON schema
 * @param {object} [schema] - A JSON schema object. This object will be used instead of reading from `path`.
 * @param {$RefParserOptions} [options] - Options that determine how the schema is parsed
 * @param {function} [callback] - An error-first callback. The second parameter is the parsed JSON schema object.
 * @returns {Promise} - The returned promise resolves with the parsed JSON schema object.
 */
$RefParser.parse = function (path, schema, options, callback) {
    let Class = this; // eslint-disable-line consistent-this
    let instance = new Class();
    return instance.parse.apply(instance, arguments);
};
/**
 * Parses the given JSON schema.
 * This method does not resolve any JSON references.
 * It just reads a single file in JSON or YAML format, and parse it as a JavaScript object.
 *
 * @param {string} [path] - The file path or URL of the JSON schema
 * @param {object} [schema] - A JSON schema object. This object will be used instead of reading from `path`.
 * @param {$RefParserOptions} [options] - Options that determine how the schema is parsed
 * @param {function} [callback] - An error-first callback. The second parameter is the parsed JSON schema object.
 * @returns {Promise} - The returned promise resolves with the parsed JSON schema object.
 */
$RefParser.prototype.parse = function (path, schema, options, callback) {
    return __awaiter(this, arguments, void 0, function* () {
        let args = normalizeArgs(arguments);
        let promise;
        if (!args.path && !args.schema) {
            let err = ono(`Expected a file path, URL, or object. Got ${args.path || args.schema}`);
            return maybe(args.callback, Promise.reject(err));
        }
        // Reset everything
        this.schema = null;
        this.$refs = new $Refs();
        // If the path is a filesystem path, then convert it to a URL.
        // NOTE: According to the JSON Reference spec, these should already be URLs,
        // but, in practice, many people use local filesystem paths instead.
        // So we're being generous here and doing the conversion automatically.
        // This is not intended to be a 100% bulletproof solution.
        // If it doesn't work for your use-case, then use a URL instead.
        let pathType = 'http';
        if (url.isFileSystemPath(args.path)) {
            args.path = url.fromFileSystemPath(args.path);
            pathType = 'file';
        }
        // Resolve the absolute path of the schema
        args.path = url.resolve(url.cwd(), args.path);
        if (args.schema && typeof args.schema === 'object') {
            // A schema object was passed-in.
            // So immediately add a new $Ref with the schema object as its value
            let $ref = this.$refs._add(args.path);
            $ref.value = args.schema;
            $ref.pathType = pathType;
            promise = Promise.resolve(args.schema);
        }
        else {
            // Parse the schema file/url
            promise = parse(args.path, this.$refs, args.options);
        }
        let me = this;
        try {
            let result = yield promise;
            if (!result || typeof result !== 'object' || Buffer.isBuffer(result)) {
                throw ono.syntax(`"${me.$refs._root$Ref.path || result}" is not a valid JSON Schema`);
            }
            else {
                me.schema = result;
                return maybe(args.callback, Promise.resolve(me.schema));
            }
        }
        catch (e) {
            return maybe(args.callback, Promise.reject(e));
        }
    });
};
/**
 * Parses the given JSON schema and resolves any JSON references, including references in
 * externally-referenced files.
 *
 * @param {string} [path] - The file path or URL of the JSON schema
 * @param {object} [schema] - A JSON schema object. This object will be used instead of reading from `path`.
 * @param {$RefParserOptions} [options] - Options that determine how the schema is parsed and resolved
 * @param {function} [callback]
 * - An error-first callback. The second parameter is a {@link $Refs} object containing the resolved JSON references
 *
 * @returns {Promise}
 * The returned promise resolves with a {@link $Refs} object containing the resolved JSON references
 */
$RefParser.resolve = function (path, schema, options, callback) {
    let Class = this; // eslint-disable-line consistent-this
    let instance = new Class();
    return instance.resolve.apply(instance, arguments);
};
/**
 * Parses the given JSON schema and resolves any JSON references, including references in
 * externally-referenced files.
 *
 * @param {string} [path] - The file path or URL of the JSON schema
 * @param {object} [schema] - A JSON schema object. This object will be used instead of reading from `path`.
 * @param {$RefParserOptions} [options] - Options that determine how the schema is parsed and resolved
 * @param {function} [callback]
 * - An error-first callback. The second parameter is a {@link $Refs} object containing the resolved JSON references
 *
 * @returns {Promise}
 * The returned promise resolves with a {@link $Refs} object containing the resolved JSON references
 */
$RefParser.prototype.resolve = function (path, schema, options, callback) {
    return __awaiter(this, arguments, void 0, function* () {
        let me = this;
        let args = normalizeArgs(arguments);
        try {
            yield this.parse(args.path, args.schema, args.options);
            yield resolveExternal(me, args.options);
            return maybe(args.callback, Promise.resolve(me.$refs));
        }
        catch (err) {
            return maybe(args.callback, Promise.reject(err));
        }
    });
};
/**
 * Parses the given JSON schema, resolves any JSON references, and bundles all external references
 * into the main JSON schema. This produces a JSON schema that only has *internal* references,
 * not any *external* references.
 *
 * @param {string} [path] - The file path or URL of the JSON schema
 * @param {object} [schema] - A JSON schema object. This object will be used instead of reading from `path`.
 * @param {$RefParserOptions} [options] - Options that determine how the schema is parsed, resolved, and dereferenced
 * @param {function} [callback] - An error-first callback. The second parameter is the bundled JSON schema object
 * @returns {Promise} - The returned promise resolves with the bundled JSON schema object.
 */
$RefParser.bundle = function (path, schema, options, callback) {
    let Class = this; // eslint-disable-line consistent-this
    let instance = new Class();
    return instance.bundle.apply(instance, arguments);
};
/**
 * Parses the given JSON schema, resolves any JSON references, and bundles all external references
 * into the main JSON schema. This produces a JSON schema that only has *internal* references,
 * not any *external* references.
 *
 * @param {string} [path] - The file path or URL of the JSON schema
 * @param {object} [schema] - A JSON schema object. This object will be used instead of reading from `path`.
 * @param {$RefParserOptions} [options] - Options that determine how the schema is parsed, resolved, and dereferenced
 * @param {function} [callback] - An error-first callback. The second parameter is the bundled JSON schema object
 * @returns {Promise} - The returned promise resolves with the bundled JSON schema object.
 */
$RefParser.prototype.bundle = function (path, schema, options, callback) {
    return __awaiter(this, arguments, void 0, function* () {
        let me = this;
        let args = normalizeArgs(arguments);
        try {
            yield this.resolve(args.path, args.schema, args.options);
            bundle(me, args.options);
            return maybe(args.callback, Promise.resolve(me.schema));
        }
        catch (err) {
            return maybe(args.callback, Promise.reject(err));
        }
    });
};
$RefParser.bundleOpenapi = function (path, schema, options, callback) {
    let Class = this; // eslint-disable-line consistent-this
    let instance = new Class();
    return instance.bundleOpenapi.apply(instance, arguments);
};
$RefParser.prototype.bundleOpenapi = function (path, schema, options, callback) {
    return __awaiter(this, arguments, void 0, function* () {
        let me = this;
        let args = normalizeArgs(arguments);
        const getVersion = openapi => {
            if (openapi.swagger && openapi.swagger === '2.0') {
                return 'v2';
            }
            else if (openapi.openapi && typeof openapi.openapi === 'string' && openapi.openapi.match(/^3\.0\.\d(-.+)?$/)) {
                return 'v3';
            }
            return null;
        };
        const merge = (obj, path, value) => {
            const last = path.pop();
            let current = obj;
            for (const key of path) {
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
        };
        try {
            yield this.resolve(args.path, args.schema, args.options);
            const version = getVersion(me.schema);
            if (!version) {
                throw new Error('Unable to detect OpenAPI version');
            }
            const added = bundleOpenapi(me, args.options, version, args.path);
            const mapping = [];
            for (const [path, pointer, value, file, hash] of added) {
                //console.log('merge', path.join('/'), file, hash);
                merge(me.schema, path, value);
                mapping.push([pointer, file, hash]);
            }
            return maybe(args.callback, Promise.resolve([me.schema, mapping]));
        }
        catch (err) {
            return maybe(args.callback, Promise.reject(err));
        }
    });
};
/**
 * Parses the given JSON schema, resolves any JSON references, and dereferences the JSON schema.
 * That is, all JSON references are replaced with their resolved values.
 *
 * @param {string} [path] - The file path or URL of the JSON schema
 * @param {object} [schema] - A JSON schema object. This object will be used instead of reading from `path`.
 * @param {$RefParserOptions} [options] - Options that determine how the schema is parsed, resolved, and dereferenced
 * @param {function} [callback] - An error-first callback. The second parameter is the dereferenced JSON schema object
 * @returns {Promise} - The returned promise resolves with the dereferenced JSON schema object.
 */
$RefParser.dereference = function (path, schema, options, callback) {
    let Class = this; // eslint-disable-line consistent-this
    let instance = new Class();
    return instance.dereference.apply(instance, arguments);
};
/**
 * Parses the given JSON schema, resolves any JSON references, and dereferences the JSON schema.
 * That is, all JSON references are replaced with their resolved values.
 *
 * @param {string} [path] - The file path or URL of the JSON schema
 * @param {object} [schema] - A JSON schema object. This object will be used instead of reading from `path`.
 * @param {$RefParserOptions} [options] - Options that determine how the schema is parsed, resolved, and dereferenced
 * @param {function} [callback] - An error-first callback. The second parameter is the dereferenced JSON schema object
 * @returns {Promise} - The returned promise resolves with the dereferenced JSON schema object.
 */
$RefParser.prototype.dereference = function (path, schema, options, callback) {
    return __awaiter(this, arguments, void 0, function* () {
        let me = this;
        let args = normalizeArgs(arguments);
        try {
            yield this.resolve(args.path, args.schema, args.options);
            dereference(me, args.options);
            return maybe(args.callback, Promise.resolve(me.schema));
        }
        catch (err) {
            return maybe(args.callback, Promise.reject(err));
        }
    });
};
//# sourceMappingURL=index.js.map