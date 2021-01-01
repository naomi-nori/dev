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
const path = require('path');
const Mocha = require('mocha');
// glob is available in the VS Code runtime
// eslint-disable-next-line import/no-extraneous-dependencies
const glob = require('glob');
const getAllTestFiles = testsRoot => new Promise((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
        if (err)
            reject(err);
        resolve(files);
    });
});
function run(testsRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the mocha test
        const mocha = new Mocha();
        mocha.timeout(2000);
        mocha.color(true);
        const files = yield getAllTestFiles(testsRoot);
        // Add files to the test suite
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
        // Run the mocha test
        yield new Promise((res, rej) => mocha.run(failures => {
            if (failures) {
                rej(failures);
            }
            else {
                res();
            }
        }));
    });
}
module.exports = { run };
//# sourceMappingURL=index.js.map