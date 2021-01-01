"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchError = void 0;
const common_1 = require("./common");
class FetchError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
    }
    get requestDetails() {
        return {
            response: {
                status: this.response.status,
                headers: this.response.headers,
            },
        };
    }
    get details() {
        const { message, stack } = this;
        return common_1.prettyJson(Object.assign({ message, stack: common_1.stackToArray(stack) }, this.requestDetails));
    }
}
exports.FetchError = FetchError;
//# sourceMappingURL=fetch_error.js.map