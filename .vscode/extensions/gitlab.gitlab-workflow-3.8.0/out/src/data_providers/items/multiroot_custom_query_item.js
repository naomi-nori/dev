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
const vscode = require('vscode');
const { CustomQueryItem } = require('./custom_query_item');
class MultirootCustomQueryItem extends vscode.TreeItem {
    constructor(customQuery, projects) {
        super(customQuery.name, vscode.TreeItemCollapsibleState.Collapsed);
        this.customQuery = customQuery;
        this.projects = projects;
        this.iconPath = new vscode.ThemeIcon('filter');
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.projects.map(p => new CustomQueryItem(this.customQuery, p, true));
        });
    }
}
exports.MultirootCustomQueryItem = MultirootCustomQueryItem;
//# sourceMappingURL=multiroot_custom_query_item.js.map