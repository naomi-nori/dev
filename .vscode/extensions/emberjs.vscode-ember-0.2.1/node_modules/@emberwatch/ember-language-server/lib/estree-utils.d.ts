import { Position, SourceLocation } from 'estree';
import { Position as LSPosition, Range as LSRange } from 'vscode-languageserver';
export declare function newPosition(line: number, column: number): Position;
export declare function comparePositions(a: Position, b: Position): number;
export declare function toPosition(lsp: LSPosition): Position;
export declare function toLSPosition(pos: Position): LSPosition;
export declare function toLSRange(loc: SourceLocation): LSRange;
export declare function newLocation(startLine: number, startColumn: number, endLine: number, endColumn: number): SourceLocation;
export declare function containsPosition(loc: SourceLocation, position: Position): boolean;
