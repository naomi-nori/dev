"use strict";
const vscode = require('vscode');
const refresh = () => {
    vscode.gitLabWorkflow.sidebarDataProviders.forEach(provider => {
        provider.refresh();
    });
};
exports.refresh = refresh;
//# sourceMappingURL=sidebar.js.map