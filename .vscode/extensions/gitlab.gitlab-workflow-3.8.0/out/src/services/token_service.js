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
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const assert = require("assert");
const vscode_1 = require("vscode");
class TokenService {
    constructor() {
        this.onDidChangeEmitter = new vscode_1.EventEmitter();
    }
    init(context) {
        this.context = context;
    }
    get onDidChange() {
        return this.onDidChangeEmitter.event;
    }
    get glTokenMap() {
        assert(this.context);
        return this.context.globalState.get('glTokens', {});
    }
    getInstanceUrls() {
        return Object.keys(this.glTokenMap);
    }
    getToken(instanceUrl) {
        return this.glTokenMap[instanceUrl];
    }
    setToken(instanceUrl, token) {
        return __awaiter(this, void 0, void 0, function* () {
            assert(this.context);
            const tokenMap = this.glTokenMap;
            if (token) {
                tokenMap[instanceUrl] = token;
            }
            else {
                delete tokenMap[instanceUrl];
            }
            yield this.context.globalState.update('glTokens', tokenMap);
            this.onDidChangeEmitter.fire();
        });
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
//# sourceMappingURL=token_service.js.map