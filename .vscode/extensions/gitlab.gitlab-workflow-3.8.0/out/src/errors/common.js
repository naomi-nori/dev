"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stackToArray = exports.prettyJson = void 0;
exports.prettyJson = (obj) => JSON.stringify(obj, null, 2);
exports.stackToArray = (stack) => stack && stack.split('\n');
//# sourceMappingURL=common.js.map