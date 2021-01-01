"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
const errors_1 = require("request-promise/errors");
const common_1 = require("./common");
class ApiError extends Error {
    constructor(error, action) {
        super(error.message);
        this.action = action;
        this.message = `API request failed when trying to ${this.action} because: ${error.message}`;
        this.originalError = error;
    }
    get requestDetails() {
        if (!(this.originalError instanceof errors_1.StatusCodeError))
            return {};
        const { method } = this.originalError.options;
        // The url parameter exists, but the types are not complete
        // eslint-disable-next-line
        // @ts-ignore
        const { url } = this.originalError.options;
        const { response } = this.originalError;
        return {
            request: { method, url },
            response,
        };
    }
    get details() {
        const { message, stack } = this;
        return common_1.prettyJson(Object.assign({ message, stack: common_1.stackToArray(stack) }, this.requestDetails));
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=api_error.js.map