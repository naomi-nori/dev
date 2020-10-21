"use strict";
/*
 Copyright (c) 42Crunch Ltd. All rights reserved.
 Licensed under the GNU Affero General Public License version 3. See LICENSE.txt in the project root for license information.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonPointer = exports.joinJsonPointer = void 0;
const SLASHES = /\//g;
const TILDES = /~/g;
function encodeJsonPointerSegment(segment) {
    if (typeof segment === 'number') {
        return String(segment);
    }
    return segment.replace(TILDES, '~0').replace(SLASHES, '~1');
}
function joinJsonPointer(path) {
    if (path.length == 0) {
        return '';
    }
    return '/' + path.map((segment) => encodeJsonPointerSegment(segment)).join('/');
}
exports.joinJsonPointer = joinJsonPointer;
function parseJsonPointer(pointer) {
    const hasExcape = /~/;
    const escapeMatcher = /~[01]/g;
    function escapeReplacer(m) {
        switch (m) {
            case '~1':
                return '/';
            case '~0':
                return '~';
        }
        throw new Error('Invalid tilde escape: ' + m);
    }
    function untilde(str) {
        if (!hasExcape.test(str)) {
            return str;
        }
        return str.replace(escapeMatcher, escapeReplacer);
    }
    return pointer.split('/').slice(1).map(untilde).map(decodeURIComponent);
}
exports.parseJsonPointer = parseJsonPointer;
//# sourceMappingURL=pointer.js.map