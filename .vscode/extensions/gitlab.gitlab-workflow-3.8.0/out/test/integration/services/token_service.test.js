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
const assert = require('assert');
const { TokenService } = require('../../../src/services/token_service');
describe('TokenService', () => {
    let tokenService;
    beforeEach(() => {
        let tokens = {};
        const fakeContext = {
            globalState: {
                get: () => tokens,
                update: (_, val) => {
                    tokens = val;
                },
            },
        };
        tokenService = new TokenService();
        tokenService.init(fakeContext);
    });
    it('can set and get one token', () => __awaiter(void 0, void 0, void 0, function* () {
        assert.strictEqual(tokenService.getToken('https://gitlab.com'), undefined);
        tokenService.setToken('https://gitlab.com', 'abc');
        assert.strictEqual(tokenService.getToken('https://gitlab.com'), 'abc');
    }));
    it('can retrieve all instance URLs', () => __awaiter(void 0, void 0, void 0, function* () {
        tokenService.setToken('https://gitlab.com', 'abc');
        tokenService.setToken('https://dev.gitlab.com', 'def');
        assert.deepStrictEqual(tokenService.getInstanceUrls(), [
            'https://gitlab.com',
            'https://dev.gitlab.com',
        ]);
    }));
});
//# sourceMappingURL=token_service.test.js.map