import { IConnection, TextDocuments } from 'vscode-languageserver';
import ProjectRoots from './project-roots';
import DefinitionProvider from './definition-provider';
import TemplateLinter from './template-linter';
import DocumentSymbolProvider from './symbols/document-symbol-provider';
import TemplateCompletionProvider from './completion-provider/template-completion-provider';
export default class Server {
    connection: IConnection;
    documents: TextDocuments;
    projectRoots: ProjectRoots;
    documentSymbolProviders: DocumentSymbolProvider[];
    templateCompletionProvider: TemplateCompletionProvider;
    definitionProvider: DefinitionProvider;
    templateLinter: TemplateLinter;
    constructor();
    listen(): void;
    private onInitialize({rootUri, rootPath});
    private onDidChangeContent(change);
    private onDidChangeWatchedFiles();
    private onCompletion(textDocumentPosition);
    private onDocumentSymbol(params);
}
