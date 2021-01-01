"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGitRemote = void 0;
const url = require("url");
// returns path without the trailing slash or empty string if there is no path
const getInstancePath = (instanceUrl) => {
    const { pathname } = url.parse(instanceUrl);
    return pathname ? pathname.replace(/\/$/, '') : '';
};
const escapeForRegExp = (str) => {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
};
function parseGitRemote(instanceUrl, remote) {
    // Regex to match gitlab potential starting names for ssh remotes.
    const normalizedRemote = remote.match(`^[a-zA-Z0-9_-]+@`) ? `ssh://${remote}` : remote;
    const { host, pathname } = url.parse(normalizedRemote);
    if (!host || !pathname) {
        return null;
    }
    const pathRegExp = escapeForRegExp(getInstancePath(instanceUrl));
    const match = pathname.match(`${pathRegExp}/:?(.+)/([^/]+?)(?:.git)?/?$`);
    if (!match) {
        return null;
    }
    const [namespace, project] = match.slice(1, 3);
    return { host, namespace, project };
}
exports.parseGitRemote = parseGitRemote;
module.exports = { parseGitRemote };
//# sourceMappingURL=git_remote_parser.js.map