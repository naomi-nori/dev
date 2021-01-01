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
const { CustomQueryItem } = require('./items/custom_query_item');
const { MultirootCustomQueryItem } = require('./items/multiroot_custom_query_item');
const gitLabService = require('../gitlab_service');
class DataProvider {
    constructor() {
        // Temporarily disable eslint to be able to start enforcing stricter rules
        // eslint-disable-next-line no-underscore-dangle
        this._onDidChangeTreeData = new vscode.EventEmitter();
        // Temporarily disable eslint to be able to start enforcing stricter rules
        // eslint-disable-next-line no-underscore-dangle
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    // eslint-disable-next-line class-methods-use-this
    getChildren(el) {
        return __awaiter(this, void 0, void 0, function* () {
            if (el)
                return el.getChildren(el);
            const projects = yield gitLabService.getAllGitlabProjects();
            const { customQueries } = vscode.workspace.getConfiguration('gitlab');
            if (projects.length === 0)
                return new vscode.TreeItem('No projects found');
            if (projects.length === 1)
                return customQueries.map(customQuery => new CustomQueryItem(customQuery, projects[0]));
            return customQueries.map(customQuery => new MultirootCustomQueryItem(customQuery, projects));
        });
    }
    // eslint-disable-next-line class-methods-use-this
    getParent() {
        return null;
    }
    // eslint-disable-next-line class-methods-use-this
    getTreeItem(item) {
        return item;
    }
    refresh() {
        // Temporarily disable eslint to be able to start enforcing stricter rules
        // eslint-disable-next-line no-underscore-dangle
        this._onDidChangeTreeData.fire();
    }
}
exports.DataProvider = DataProvider;
//# sourceMappingURL=issuable.js.map