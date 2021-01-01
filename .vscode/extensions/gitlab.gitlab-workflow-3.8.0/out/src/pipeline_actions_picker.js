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
const gitLabService = require('./gitlab_service');
const openers = require('./openers');
const statusBar = require('./status_bar');
const { getCurrentWorkspaceFolderOrSelectOne } = require('./services/workspace_service');
function showPicker() {
    return __awaiter(this, void 0, void 0, function* () {
        const items = [
            {
                label: 'View latest pipeline on GitLab',
                action: 'view',
            },
            {
                label: 'Create a new pipeline from current branch',
                action: 'create',
            },
            {
                label: 'Retry last pipeline',
                action: 'retry',
            },
            {
                label: 'Cancel last pipeline',
                action: 'cancel',
            },
        ];
        const workspaceFolder = yield getCurrentWorkspaceFolderOrSelectOne();
        const selected = yield vscode.window.showQuickPick(items);
        if (selected) {
            if (selected.action === 'view') {
                openers.openCurrentPipeline(workspaceFolder);
                return;
            }
            const newPipeline = yield gitLabService.handlePipelineAction(selected.action, workspaceFolder);
            if (newPipeline)
                statusBar.refreshPipeline();
        }
    });
}
exports.showPicker = showPicker;
//# sourceMappingURL=pipeline_actions_picker.js.map