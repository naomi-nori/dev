import { TextDocumentIdentifier } from 'vscode-languageserver';
export declare function getExtension(textDocument: TextDocumentIdentifier): string | null;
export declare function hasExtension(textDocument: TextDocumentIdentifier, ...extensions: string[]): boolean;
