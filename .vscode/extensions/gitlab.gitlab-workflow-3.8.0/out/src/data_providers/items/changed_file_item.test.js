"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_names_1 = require("../../command_names");
const entities_1 = require("../../test_utils/entities");
const changed_file_item_1 = require("./changed_file_item");
describe('ChangedFileItem', () => {
    describe('image file', () => {
        it.each(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp', '.avif', '.apng'])('should not show diff for %s', extension => {
            var _a;
            const changedImageFile = Object.assign(Object.assign({}, entities_1.diffFile), { new_path: `file${extension}` });
            const item = new changed_file_item_1.ChangedFileItem(entities_1.issuable, entities_1.mrVersion, changedImageFile, entities_1.project);
            expect((_a = item.command) === null || _a === void 0 ? void 0 : _a.command).toBe(command_names_1.PROGRAMMATIC_COMMANDS.NO_IMAGE_REVIEW);
        });
    });
});
//# sourceMappingURL=changed_file_item.test.js.map