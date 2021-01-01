"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const entities_1 = require("../../test_utils/entities");
const custom_query_item_1 = require("./custom_query_item");
describe('CustomQueryItem', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let item;
    describe('item labeled as a query', () => {
        beforeEach(() => {
            item = new custom_query_item_1.CustomQueryItem(entities_1.customQuery, entities_1.project);
        });
        it('should have query name as label', () => {
            expect(vscode.TreeItem).toBeCalledWith('Query name', vscode.TreeItemCollapsibleState.Collapsed);
        });
        it('should have filter icon', () => {
            expect(vscode.ThemeIcon).toHaveBeenCalledWith('filter');
        });
    });
    describe('item labeled as a project', () => {
        beforeEach(() => {
            item = new custom_query_item_1.CustomQueryItem(entities_1.customQuery, entities_1.project, true);
        });
        it('should have project label as label', () => {
            expect(vscode.TreeItem).toBeCalledWith('Project label', vscode.TreeItemCollapsibleState.Collapsed);
        });
        it('should have project icon', () => {
            expect(vscode.ThemeIcon).toHaveBeenCalledWith('project');
        });
    });
});
//# sourceMappingURL=custom_query_item.test.js.map