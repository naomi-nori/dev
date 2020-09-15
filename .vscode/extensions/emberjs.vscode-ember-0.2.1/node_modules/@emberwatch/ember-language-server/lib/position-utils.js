"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compare(a, b) {
    if (a.line < b.line)
        return -1;
    if (a.line > b.line)
        return 1;
    if (a.character < b.character)
        return -1;
    if (a.character > b.character)
        return 1;
    return 0;
}
exports.compare = compare;
//# sourceMappingURL=position-utils.js.map