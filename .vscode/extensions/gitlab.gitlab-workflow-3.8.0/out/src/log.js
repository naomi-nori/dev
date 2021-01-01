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
exports.handleError = exports.logError = exports.log = exports.initializeLogging = void 0;
const vscode = require("vscode");
const command_names_1 = require("./command_names");
function isDetailedError(object) {
    return Boolean(object.details);
}
let globalLog;
exports.initializeLogging = (logLine) => {
    globalLog = logLine;
};
exports.log = (line) => globalLog(line);
exports.logError = (e) => isDetailedError(e) ? globalLog(e.details) : globalLog(`${e.message}\n${e.stack}`);
exports.handleError = (e) => __awaiter(void 0, void 0, void 0, function* () {
    exports.logError(e);
    const choice = yield vscode.window.showErrorMessage(e.message, 'Show logs');
    if (choice === 'Show logs') {
        yield vscode.commands.executeCommand(command_names_1.USER_COMMANDS.SHOW_OUTPUT);
    }
});
//# sourceMappingURL=log.js.map