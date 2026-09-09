import {execFile} from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

import {parseDiagnostics} from './diagnostics';
import {updateOverlay} from './overlay';
import {tolzaParameters, tolzaState} from './state';

let checkRunning = false;
let checkPending = false;
let checkTimer: NodeJS.Timeout|undefined;

export function scheduleCheck(delay = 200) {
  if (checkTimer) {
    clearTimeout(checkTimer);
  }

  checkTimer = setTimeout(() => {
    checkTimer = undefined;
    void runBuild_Check();
  }, delay);
}

export function config_check(context: vscode.ExtensionContext) {
  context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(event => {
        const document = event.document;

        if (document.uri.scheme !== 'file' ||
            !document.uri.fsPath.startsWith(
                tolzaState.workspaceRoot + path.sep,
                )) {
          return;
        }

        tolzaState.output.appendLine(
            `[check] change: ${document.uri.fsPath}`,
        );

        scheduleCheck();
      }),
  );
}

export async function runBuild_Check() {
  if (!tolzaState.manifest) {
    return;
  }

  // Un check est déjà en cours.
  // On demande simplement d'en refaire un à la fin.
  if (checkRunning) {
    checkPending = true;

    tolzaState.output.appendLine(
        '[check] already running, pending=true',
    );

    return;
  }

  checkRunning = true;

  try {
    tolzaState.output.appendLine('[check] starting');

    await updateOverlay();

    await new Promise<void>(resolve => {
      execFile(
          tolzaParameters.path_compiler,
          [
            'build',
            tolzaState.manifest!,
            '--check',
            '--diagnostic-format',
            'json',
            '--error-mode',
            'fail_recover',
            '--log-level',
            'quiet',
            '--overlay',
            tolzaState.overlayRoot,
            tolzaParameters.command_check_args,
          ],
          async (_error, stdout, stderr) => {
            tolzaState.output.appendLine('[check] compiler finished');
            tolzaState.output.appendLine(stderr);
            tolzaState.output.appendLine(stdout);
            await parseDiagnostics(stdout + stderr);

            resolve();
          },
      );
    });
  } finally {
    checkRunning = false;

    if (checkPending) {
      checkPending = false;

      tolzaState.output.appendLine(
          '[check] running pending check',
      );

      void runBuild_Check();
    }
  }
}