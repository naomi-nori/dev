"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const plsql_settings_1 = require("../plsql.settings");
const events = require("events");
class ConnectController {
    constructor() {
        this.ID = 1;
        this._internalSave = false;
        this.eventEmitter = new events.EventEmitter();
    }
    configurationChanged() {
        if (this.connections && !this._internalSave)
            this.getConnections(true);
        else
            this._internalSave = false;
    }
    getConnections(refresh) {
        if (refresh || !this.connections) {
            const pattern = plsql_settings_1.PLSQLSettings.getConnectionPattern();
            this.patternActiveInfos = pattern.patternActiveInfos;
            this.patternName = pattern.patternName;
            this.connections = plsql_settings_1.PLSQLSettings.getConnections();
            delete this.active;
            this.active = this.getActive();
            // force only one connection active
            this.connections.forEach(item => {
                item.active = item === this.active;
                item.ID = ++this.ID;
                item.name = this.getName(item);
            });
            // recalc activeInfos, according to active connection and pattern
            this.updateActiveInfos(this.active);
            this.notifyActive(this.active);
            this.saveConnections();
        }
        return this.connections;
    }
    getConnectionByID(ID) {
        const connections = this.getConnections();
        if (connections)
            return connections.find(c => c.ID === ID);
    }
    getConnectionIndexByID(ID) {
        const connections = this.getConnections();
        if (connections)
            return connections.findIndex(c => c.ID === ID);
    }
    updateActiveInfos(connection) {
        this.activeInfos = this.getTextInfos(connection);
    }
    getTextInfos(connection) {
        if (this.patternActiveInfos && connection)
            return this.patternActiveInfos
                .replace('${database}', connection.database)
                .replace('${username}', connection.username)
                .replace('${password}', connection.password)
                .replace('${schema}', connection.schema);
        else
            return '';
    }
    getActive() {
        if (!this.active && this.connections)
            this.active = this.connections.find(item => item.active);
        return this.active;
    }
    setActive(connection, active) {
        let actConnection;
        if (active) {
            const element = this.getActive();
            if (element)
                element.active = false;
            connection.active = true;
            this.active = connection;
            actConnection = connection;
        }
        else {
            connection.active = false;
            actConnection = null;
        }
        this.updateActiveInfos(actConnection);
        this.notifyActive(actConnection);
    }
    getByTag(tag) {
        if (this.connections)
            return this.connections.find(item => item.tag === tag);
    }
    addConnection(connection) {
        connection.ID = ++this.ID;
        connection.name = this.getName(connection);
        if (connection.active)
            this.setActive(connection, true);
        this.connections.push(connection);
        this.saveConnections();
    }
    updateConnection(connection) {
        connection.name = this.getName(connection);
        const idx = this.getConnectionIndexByID(connection.ID);
        if (this.connections[idx].active !== connection.active)
            this.setActive(connection, connection.active);
        this.connections[idx] = connection;
        this.saveConnections();
    }
    removeConnection(connection) {
        if (typeof connection !== 'number')
            connection = this.connections.indexOf(connection);
        if (connection < 0)
            return;
        if (this.connections[connection].active)
            this.setActive(this.connections[connection], false);
        this.connections.splice(connection, 1);
        this.saveConnections();
    }
    saveConnections() {
        if (!this.connections)
            return;
        if (!this.connections.length) {
            const settings = plsql_settings_1.PLSQLSettings.getConnections();
            if (!settings || !settings.length)
                return;
        }
        this._internalSave = true;
        const config = vscode.workspace.getConfiguration('plsql-language');
        // TODO if no workspace !...
        config.update('connections', this.connections, false);
        config.update('connection.activeInfos', this.activeInfos, false);
    }
    getName(connection) {
        if (this.patternName)
            return this.patternName
                .replace('${database}', connection.database)
                .replace('${username}', connection.username)
                .replace('${password}', connection.password)
                .replace('${schema}', connection.schema);
        else
            return `unknown ${connection.ID}`;
    }
    notifyActive(connection) {
        this.eventEmitter.emit('setActive', connection);
    }
}
exports.ConnectController = ConnectController;
//# sourceMappingURL=connect.controller.js.map