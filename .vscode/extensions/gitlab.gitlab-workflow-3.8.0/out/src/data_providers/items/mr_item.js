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
exports.MrItem = void 0;
const vscode_1 = require("vscode");
const command_names_1 = require("../../command_names");
const gitlab_new_service_1 = require("../../gitlab/gitlab_new_service");
const git_service_factory_1 = require("../../git_service_factory");
const changed_file_item_1 = require("./changed_file_item");
class MrItem extends vscode_1.TreeItem {
    constructor(mr, project) {
        super(`!${mr.iid} · ${mr.title}`, vscode_1.TreeItemCollapsibleState.Collapsed);
        this.mr = mr;
        this.project = project;
        this.iconPath = vscode_1.Uri.parse(mr.author.avatar_url);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            const description = new vscode_1.TreeItem('Description');
            description.iconPath = new vscode_1.ThemeIcon('note');
            description.command = {
                command: command_names_1.PROGRAMMATIC_COMMANDS.SHOW_RICH_CONTENT,
                arguments: [this.mr, this.project.uri],
                title: 'Show MR',
            };
            const changedFiles = yield this.getChangedFiles();
            return [description, ...changedFiles];
        });
    }
    getChangedFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitService = git_service_factory_1.createGitService(this.project.uri);
            const instanceUrl = yield gitService.fetchCurrentInstanceUrl();
            const gitlabService = new gitlab_new_service_1.GitLabNewService(instanceUrl);
            const mrVersion = yield gitlabService.getMrDiff(this.mr);
            return mrVersion.diffs.map(d => new changed_file_item_1.ChangedFileItem(this.mr, mrVersion, d, this.project));
        });
    }
}
exports.MrItem = MrItem;
//# sourceMappingURL=mr_item.js.map