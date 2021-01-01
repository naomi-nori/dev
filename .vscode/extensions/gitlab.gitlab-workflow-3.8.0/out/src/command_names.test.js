"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_names_1 = require("./command_names");
const packageJson = require("../package.json");
describe('user commands', () => {
    it('should match exactly commands defined in package.json', () => {
        const packageJsonCommands = packageJson.contributes.commands.map(c => c.command);
        const constantCommands = Object.values(command_names_1.USER_COMMANDS);
        expect(packageJsonCommands.sort()).toEqual(constantCommands.sort());
    });
});
//# sourceMappingURL=command_names.test.js.map