"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const path = require("path");
const plsqlChannel_1 = require("../plsqlChannel");
class OracleService {
    static activate(enable, contextPath, silent = false) {
        if (!this._oracleServer && enable) {
            this._oracleServer = new OracleServer(path.join(contextPath, 'server-oracle', 'out'), 'server.js');
        }
        if (this._oracleServer) {
            if (enable)
                this._oracleServer.start()
                    .then(msg => {
                    if (!silent) {
                        // PLSQLChannel.show();
                        plsqlChannel_1.default.log(JSON.stringify(msg));
                    }
                })
                    .catch(err => {
                    if (!silent) {
                        vscode.window.showErrorMessage('Oracle start failed - See Output/PLSQL for more informations');
                        plsqlChannel_1.default.show();
                        plsqlChannel_1.default.log(JSON.stringify(err));
                    }
                });
            else {
                this._oracleServer.stop()
                    .catch((err) => {
                    if (!silent) {
                        vscode.window.showErrorMessage('Oracle stop failed - See Output/PLSQL for more informations');
                        plsqlChannel_1.default.show();
                        plsqlChannel_1.default.log(JSON.stringify(err));
                    }
                });
                this._oracleServer = null;
            }
        }
    }
    static execCommand(params) {
        if (this._oracleServer)
            return this._oracleServer.execCommand(params);
        else
            return this.ErrorNoOracleServer();
    }
    static isConnected() {
        if (this._oracleServer)
            return this._oracleServer.isConnected();
        else
            return false;
    }
    static connect(params) {
        if (this._oracleServer)
            return this._oracleServer.connect(params);
        else
            return this.ErrorNoOracleServer();
    }
    static disconnect(params) {
        if (this._oracleServer)
            return this._oracleServer.disconnect(params);
        else
            return this.ErrorNoOracleServer();
    }
    static ErrorNoOracleServer() {
        return Promise.reject('No oracle server');
    }
}
exports.OracleService = OracleService;
class OracleServer {
    constructor(path, module) {
        this._isClientReady = false;
        this._isClientInitialized = false;
        this._isConnected = false;
        this._serverPath = path;
        this._serverModule = module;
    }
    start() {
        if (this._client || !this._serverPath)
            return Promise.resolve();
        return new Promise((resolve, reject) => {
            const serverOptions = {
                runtime: 'node',
                // module: path.join(this._serverPath, this._serverModule),
                module: this._serverModule,
                options: {
                    cwd: this._serverPath
                },
                transport: vscode_languageclient_1.TransportKind.ipc
            };
            // Options to control the language client
            const clientOptions = {};
            // Create the language client and start the client.
            this._client = new vscode_languageclient_1.LanguageClient('oracleServer', 'Oracle Server', serverOptions, clientOptions);
            // Start the client. This will also launch the server
            this._client.start();
            let msg;
            msg = {};
            this._client.onReady()
                .then(() => {
                this._isClientReady = true;
                this._client.onNotification('Oracle/install', (data) => {
                    plsqlChannel_1.default.show();
                    plsqlChannel_1.default.log(data);
                });
                this._client.onNotification('Oracle/debug', (data) => {
                    plsqlChannel_1.default.show();
                    plsqlChannel_1.default.log(data);
                });
                return this.install();
            })
                .then(result => {
                if (result)
                    msg.install = result;
                return this.init();
            })
                .then(result => {
                if (result)
                    msg.init = result;
                this._isClientInitialized = true;
                return resolve(msg);
            })
                .catch(err => {
                msg.error = err;
                return reject(msg);
            });
        });
    }
    stop() {
        return new Promise((resolve, reject) => {
            this.disconnect()
                .then(() => promiseFinally())
                .catch((err) => promiseFinally(err));
            const promiseFinally = (dErr = false) => {
                if (!this._client)
                    return resolve();
                this._client.stop()
                    .then(() => {
                    if (dErr)
                        return reject({ disconnect: dErr });
                    return resolve();
                }, (err) => reject({ disconnect: dErr, error: err }));
                this._client = null;
            };
        });
    }
    connect(params) {
        return new Promise((resolve, reject) => {
            this.execRequest('Oracle/connect', params)
                .then(result => {
                if ((!params || !params.custom) && result && result.connected === true)
                    this._isConnected = true;
                return resolve(result);
            })
                .catch(err => reject(err));
        });
    }
    disconnect(params) {
        return new Promise((resolve, reject) => {
            this.execRequest('Oracle/disconnect', params)
                .then(result => {
                if ((!params || !params.custom) && result === true)
                    this._isConnected = false;
                return resolve(result);
            })
                .catch(err => reject(err));
        });
    }
    isConnected() {
        return this._isConnected;
    }
    execCommand(params) {
        return this.execRequest('Oracle/execCommand', params);
    }
    install() {
        return this.execRequest('Oracle/install', null, true);
    }
    init() {
        return this.execRequest('Oracle/init', null, true);
    }
    execRequest(name, params, initRequest = false) {
        return new Promise((resolve, reject) => {
            if (!this._client || !this._isClientReady)
                return reject('Client is not ready');
            if (!initRequest && !this._isClientInitialized)
                return reject('Client is not initialized');
            this._client.sendRequest(name, params)
                .then((data) => {
                if (data && data.error)
                    return reject(data);
                return resolve(data);
            }, error => reject(error));
        });
    }
}
//# sourceMappingURL=oracle.server.js.map