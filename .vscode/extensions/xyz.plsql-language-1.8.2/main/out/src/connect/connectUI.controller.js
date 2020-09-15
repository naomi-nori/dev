"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const connect_inputPannel_1 = require("./connect.inputPannel");
class ConnectUIController {
    constructor(context, controller) {
        this.context = context;
        this.controller = controller;
    }
    activateConnectionsList() {
        const me = this;
        let connections;
        const active = this.controller.getActive();
        if (active) {
            connections = this.controller.getConnections().filter(item => item !== active);
            connections.unshift(active);
        }
        else
            connections = this.controller.getConnections();
        const displayItems = connections
            .filter(item => item.active || !item.hidden)
            .map(item => {
            return {
                label: `${item.active ? '$(check) ' : ''} ${item.name}`,
                item: item,
                action: 'setActive'
            };
        });
        displayItems.push({
            label: '<Insert a new connection>',
            item: undefined,
            action: 'addConnection'
        });
        displayItems.push({
            label: '<Settings>',
            item: undefined,
            action: 'showSettings'
        });
        vscode.window.showQuickPick(displayItems)
            .then(val => {
            if (val) {
                me[val.action].apply(me, [val.item]);
            }
        });
    }
    // used via displayItem.action
    /*private*/ setActive(connection) {
        this.controller.setActive(connection, true);
        this.controller.saveConnections();
    }
    /*private*/ addConnection() {
        connect_inputPannel_1.default.createOrShow(this.context.extensionPath, this.controller, false);
    }
    /*private*/ showSettings() {
        // vscode.commands.executeCommand('workbench.action.openSettings');
        connect_inputPannel_1.default.createOrShow(this.context.extensionPath, this.controller, true);
    }
}
exports.default = ConnectUIController;
//# sourceMappingURL=connectUI.controller.js.map