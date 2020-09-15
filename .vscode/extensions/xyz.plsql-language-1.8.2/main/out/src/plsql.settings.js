"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
/**
 * Settings for plsql.
 */
class PLSQLSettings {
    // constructor() {
    // }
    /**
     * SearchPaths:
     * Search in all ws null (default)
     * Search in same ws (${workspaceFolder})
     * Search in specific folder (D:/Path...)
     * Search in specific ws (${workspaceFolder: name|index})
     * Array => ['D:/Path', ${workspaceFolder}]
     */
    static getSearchInfos(file) {
        // ignore search.exclude settings
        let ignore;
        const searchExclude = vscode.workspace.getConfiguration('search', file).get('exclude');
        if (searchExclude) {
            ignore = Object.keys(searchExclude).filter(key => searchExclude[key]);
        }
        const config = vscode.workspace.getConfiguration('plsql-language');
        let searchFld = config.get('searchPaths');
        if (searchFld) {
            if (!Array.isArray(searchFld))
                searchFld = [searchFld];
            searchFld = searchFld.map(folder => {
                // start with
                // ${workspaceFolder} => current workspace
                // ${workspaceFolder: name} => workspace find by name
                // ${workspaceFolder: index} => workspace find by index
                const match = folder.match(/\${workspaceFolder(?:\s*:\s*(.*))?}/i);
                if (match) {
                    if (vscode.workspace.workspaceFolders && match && match.index === 0) {
                        const wsId = match[1];
                        if (wsId) {
                            const find = vscode.workspace.workspaceFolders.find(ws => Number.isInteger(wsId - 1) ? ws.index === Number.parseInt(wsId, 10) : ws.name === wsId);
                            if (find)
                                return folder.replace(match[0], find.uri.fsPath);
                        }
                        else {
                            const wsFolder = vscode.workspace.getWorkspaceFolder(file);
                            if (wsFolder)
                                return folder.replace('${workspaceFolder}', wsFolder.uri.fsPath);
                        }
                    }
                    return '';
                }
                ;
                return folder;
            }).filter(folder => folder !== '');
        }
        else if (vscode.workspace.workspaceFolders) // search in all workspaces
            searchFld = vscode.workspace.workspaceFolders.map(ws => ws.uri.fsPath);
        else
            searchFld = [''];
        return { ignore, searchFld };
    }
    static translatePackageName(packageName) {
        const config = vscode.workspace.getConfiguration('plsql-language');
        // packageName using synonym => real packageName
        let name = packageName;
        const synonym = config.get('synonym');
        if (synonym) {
            const regExp = new RegExp(synonym.replace, 'i');
            name = name.replace(regExp, synonym.by || '');
        }
        return name;
    }
    static getCommentInSymbols() {
        const config = vscode.workspace.getConfiguration('plsql-language');
        return config.get('commentInSymbols');
    }
    static getHoverEnable() {
        const config = vscode.workspace.getConfiguration('plsql-language');
        return config.get('hover.enable');
    }
    static getSignatureEnable() {
        const config = vscode.workspace.getConfiguration('plsql-language');
        return config.get('signatureHelp.enable');
    }
    static getOracleConnectionEnable() {
        const config = vscode.workspace.getConfiguration('plsql-language');
        return config.get('oracleConnection.enable');
    }
    static getSearchExt(searchExt) {
        // copy of package.json
        const DEFAULT_EXT = ['sql', 'ddl', 'dml', 'pkh', 'pks', 'pkb', 'pck', 'pls', 'plb',
            'bdy', 'fnc', 'idx', 'mv', 'prc', 'prg', 'sch', 'seq', 'spc', 'syn', 'tab', 'tbl', 'tbp', 'tps', 'trg', 'typ', 'vw'];
        let allExt = [...new Set([...searchExt, ...DEFAULT_EXT])]; // (merge and remove duplicate)
        const config = vscode.workspace.getConfiguration('files', null), assoc = config.get('associations');
        if (assoc) {
            const assocExt = [], otherExt = [];
            Object.keys(assoc).forEach(key => (assoc[key] === 'plsql' ? assocExt : otherExt).push(key.replace(/^\*./, '').toLowerCase()));
            // Remove ext associated with another language
            if (otherExt.length)
                allExt = allExt.filter(item => otherExt.indexOf(item) === -1);
            // Add ext associated with plsql (remove duplicate)
            if (assocExt.length)
                allExt = [...new Set([...allExt, ...assocExt])];
        }
        return allExt;
    }
    static getDocInfos(file) {
        const config = vscode.workspace.getConfiguration('plsql-language'), enable = config.get('pldoc.enable'), author = config.get('pldoc.author');
        let location = config.get('pldoc.path');
        if (!location)
            location = path.join(__dirname, '../../../snippets/pldoc.json');
        else {
            // const wsFolder = vscode.workspace.getWorkspaceFolder(file);
            // temporary code to resolve bug https://github.com/Microsoft/vscode/issues/36221
            const wsFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(file.fsPath));
            const cwd = wsFolder ? wsFolder.uri.fsPath : '';
            location = location.replace('${workspaceRoot}', cwd); // deprecated
            location = location.replace('${workspaceFolder}', cwd);
            location = path.join(location, 'pldoc.json');
        }
        return { enable, author, location };
    }
    static getCompletionPath(wsFolder) {
        const config = vscode.workspace.getConfiguration('plsql-language');
        let location = config.get('completion.path');
        if (location) {
            const cwd = wsFolder ? wsFolder.fsPath : '';
            // location = location.replace('${workspaceRoot}', cwd); // deprecated
            location = location.replace('${workspaceFolder}', cwd);
            if (location)
                location = path.join(location, 'plsql.completion.json');
        }
        return location;
    }
    // global config
    static getConnections() {
        const config = vscode.workspace.getConfiguration('plsql-language');
        return config.get('connections');
    }
    static getConnectionPattern() {
        const config = vscode.workspace.getConfiguration('plsql-language');
        return {
            patternName: config.get('connection.patternName'),
            patternActiveInfos: config.get('connection.patternActiveInfos')
        };
    }
    static getEncoding(file) {
        const config = vscode.workspace.getConfiguration('files', file);
        return config.get('encoding', 'utf8');
    }
}
exports.PLSQLSettings = PLSQLSettings;
//# sourceMappingURL=plsql.settings.js.map