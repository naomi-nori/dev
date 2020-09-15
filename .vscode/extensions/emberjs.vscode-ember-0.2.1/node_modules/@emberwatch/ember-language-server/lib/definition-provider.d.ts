import { RequestHandler, TextDocumentPositionParams, Definition } from 'vscode-languageserver';
import Server from './server';
import ASTPath from './glimmer-utils';
export default class DefinitionProvider {
    private server;
    constructor(server: Server);
    handle(params: TextDocumentPositionParams): Definition | null;
    readonly handler: RequestHandler<TextDocumentPositionParams, Definition, void>;
    isComponentOrHelperName(path: ASTPath): boolean;
}
