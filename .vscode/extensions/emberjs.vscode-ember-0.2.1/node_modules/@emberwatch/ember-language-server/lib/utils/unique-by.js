"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function uniqueBy(arr, property) {
    const flags = new Map();
    return arr.filter(entry => {
        if (flags.get(entry[property])) {
            return false;
        }
        flags.set(entry[property], true);
        return true;
    });
}
exports.default = uniqueBy;
//# sourceMappingURL=unique-by.js.map