import { TextDocument } from 'vscode-languageserver';
import Server from './server';
export interface TemplateLinterError {
    fatal?: boolean;
    moduleId: string;
    rule?: string;
    severity: number;
    message: string;
    line?: number;
    column?: number;
    source?: string;
}
export default class TemplateLinter {
    private server;
    private _linterCache;
    constructor(server: Server);
    lint(textDocument: TextDocument): Promise<void>;
    private getLinterConfig(uri);
    private getLinter(uri);
}
