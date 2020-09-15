"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const position_utils_1 = require("./position-utils");
function contains(range, position) {
    return position_utils_1.compare(position, range.start) >= 0 && position_utils_1.compare(position, range.end) <= 0;
}
exports.contains = contains;
//# sourceMappingURL=range-utils.js.map