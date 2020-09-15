import { SymbolInformation } from 'vscode-languageserver';
import DocumentSymbolProvider from './document-symbol-provider';
export default class JSDocumentSymbolProvider implements DocumentSymbolProvider {
    extensions: string[];
    process(content: string): SymbolInformation[];
}
