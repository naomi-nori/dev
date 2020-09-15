import { CompletionItem, TextDocumentPositionParams } from 'vscode-languageserver';
import Server from '../server';
export default class TemplateCompletionProvider {
    private server;
    constructor(server: Server);
    provideCompletions(params: TextDocumentPositionParams): CompletionItem[];
}
