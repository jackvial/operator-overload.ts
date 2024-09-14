import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { dunderTransformer } from './transformer';

const fileNames = [path.resolve(__dirname, 'index.ts')];
const compilerOptions: ts.CompilerOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2017,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  outDir: path.resolve(__dirname, '../dist'),
  esModuleInterop: true,
};

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit(undefined, undefined, undefined, undefined, {
    before: [dunderTransformer(program)],
  });

  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  diagnostics.forEach((diagnostic) => {
    if (diagnostic.file && diagnostic.start !== undefined) {
      const { line, character } =
        diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.error(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  if (emitResult.emitSkipped) {
    throw new Error('Compilation failed');
  }
}

compile(fileNames, compilerOptions);
