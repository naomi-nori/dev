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
jest.mock('./custom_query_item');
const vscode = require('vscode');
const { MultirootCustomQueryItem } = require('./multiroot_custom_query_item');
const { CustomQueryItem } = require('./custom_query_item');
describe('MultirootCustomQueryItem', () => {
    const customQuery = { name: 'Query name' };
    let item;
    beforeEach(() => {
        const projects = ['a', 'b'];
        item = new MultirootCustomQueryItem(customQuery, projects);
    });
    it('should use query name to create collapsed item', () => {
        expect(vscode.TreeItem).toBeCalledWith('Query name', vscode.TreeItemCollapsibleState.Collapsed);
    });
    it('should return custom query children', () => __awaiter(void 0, void 0, void 0, function* () {
        CustomQueryItem.mockImplementation((query, project, showProject) => ({
            query,
            project,
            showProject,
        }));
        const [a, b] = yield item.getChildren();
        expect(a).toEqual({ query: customQuery, project: 'a', showProject: true });
        expect(b).toEqual({ query: customQuery, project: 'b', showProject: true });
    }));
});
//# sourceMappingURL=multiroot_custom_query_item.test.js.map