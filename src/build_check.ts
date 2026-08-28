import {execFile} from 'child_process';
import * as vscode from 'vscode';

import {parseDiagnostics} from './diagnostics';
import {tolzaParameters, tolzaState} from './state';

let checkTimer: NodeJS.Timeout|undefined;

let checkGeneration = 0;

let checkRunning = false;
let checkPending = false;

export function scheduleCheck(delay: number) {
  if (checkTimer) {
    clearTimeout(checkTimer);
  }

  checkTimer = setTimeout(() => runBuild_Check(), delay);
}

export async function runBuild_Check() {
  if (!tolzaState.config) {
    return;
  }

  if (checkRunning) {
    checkPending = true;

    return;
  }

  checkRunning = true;

  const generation = ++checkGeneration;

  execFile(
      tolzaParameters.path_compiler,
      [
        'build', tolzaState.config, '--check', '--diagnostic-format', 'json',
        '--error-mode', 'fail_recover', tolzaParameters.command_check_args
      ],
      async (_error, stdout, stderr) => {
        if (generation !== checkGeneration) {
          checkRunning = false;

          return;
        }

        await parseDiagnostics(stdout + stderr);

        checkRunning = false;

        if (checkPending) {
          checkPending = false;

          runBuild_Check();
        }
      });
}
