import path = require('path');
import * as vscode from 'vscode';
import {tolzaState} from './state';

export var diagnostics = vscode.languages.createDiagnosticCollection('tolza');

export async function parseDiagnostics(output: string) {
  const begin = '@@TOLZA_EXORDIUM_DIAGNOSTICORUM@@';

  const end = '@@TOLZA_CLAUSULA_DIAGNOSTICORUM@@';

  const start = output.indexOf(begin);

  const finish = output.indexOf(end);

  if (start === -1 || finish === -1 || finish < start) {
    tolzaState.output.appendLine('Tolza: no diagnostic block found');

    diagnostics.clear();

    return;
  }

  const json = output.substring(start + begin.length, finish).trim();

  let errors: any[];

  try {
    errors = JSON.parse(json);
  } catch {
    tolzaState.output.appendLine(`Tolza: invalid diagnostic JSON:\n ${json}`);

    return;
  }

  if (!Array.isArray(errors) || errors.length === 0) {
    diagnostics.clear();

    return;
  }

  const grouped = new Map<string, vscode.Diagnostic[]>();

  for (const error of errors) {
    if (!error.file || !error.message) {
      continue;
    }

    const uri = vscode.Uri.file(path.resolve(error.file));

    const document = vscode.workspace.textDocuments.find(
        (d) => d.uri.fsPath === uri.fsPath,
    );

    if (!document) {
      continue;
    }

    const diagnostic = new vscode.Diagnostic(
        new vscode.Range(
            document.positionAt(error.start_pos),
            document.positionAt(error.end_pos),
            ),
        formatMessage(error),
        error.type === 'warning' ? vscode.DiagnosticSeverity.Warning :
                                   vscode.DiagnosticSeverity.Error,
    );

    const list = grouped.get(uri.fsPath) ?? [];

    list.push(diagnostic);

    grouped.set(uri.fsPath, list);
  }

  diagnostics.clear();

  for (const [file, list] of grouped) {
    diagnostics.set(vscode.Uri.file(file), list);
  }
}

function formatMessage(error: any): string {
  let message = error.message;

  if (error.code) {
    message = `[${error.code}] ${message}`;
  }

  if (error.hint) {
    message += `\n${error.hint}`;
  }

  return message;
}
