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
const temp = require("temp");
const simple_git_1 = require("simple-git");
const path = require("path");
const fs = require("fs");
const constants_1 = require("./integration/test_infrastructure/constants");
function createTempFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            temp.mkdir('vscodeWorkplace', (err, dirPath) => {
                if (err)
                    reject(err);
                resolve(dirPath);
            });
        });
    });
}
function addFile(folderPath, relativePath, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const fullPath = path.join(folderPath, relativePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(fullPath, content);
    });
}
// `autoCleanUp = true` means that the directory gets deleted on process exit
function createTmpWorkspace(autoCleanUp = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (autoCleanUp)
            temp.track();
        const dirPath = yield createTempFolder();
        const git = simple_git_1.default(dirPath, { binary: 'git' });
        yield git.init();
        yield git.addRemote(constants_1.REMOTE.NAME, constants_1.REMOTE.URL);
        yield git.addConfig('user.email', 'test@example.com');
        yield git.addConfig('user.name', 'Test Name');
        yield git.commit('Test commit', [], {
            '--allow-empty': null,
        });
        yield addFile(dirPath, '/.vscode/settings.json', JSON.stringify(constants_1.DEFAULT_VS_CODE_SETTINGS));
        return dirPath;
    });
}
exports.default = createTmpWorkspace;
//# sourceMappingURL=create_tmp_workspace.js.map