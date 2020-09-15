import { Diagnostic } from 'vscode-languageserver';
import { TemplateLinterError } from '../template-linter';
export declare function toDiagnostic(source: string, error: TemplateLinterError): Diagnostic;
