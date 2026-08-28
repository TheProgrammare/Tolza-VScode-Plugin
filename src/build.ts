import {execFile} from 'child_process';
import * as vscode from 'vscode';

import {runBuild_Check, scheduleCheck} from './build_check';
import {parseDiagnostics} from './diagnostics';
import {run} from './run';
import {tolzaParameters, tolzaState} from './state';

export async function config_build(context: vscode.ExtensionContext) {
  context.subscriptions.push(
      vscode.commands.registerCommand('tolza.build_check', runBuild_Check),
  );

  context.subscriptions.push(
      vscode.commands.registerCommand('tolza.build', runBuild),
  );

  context.subscriptions.push(vscode.commands.registerCommand('tolza.run', run));

  context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(() => scheduleCheck(500)),
  );

  context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(() => scheduleCheck(0)),
  );
}

export async function runBuild() {
  if (!tolzaState.config) {
    vscode.window.showErrorMessage('No tolza.toml found');

    return false;
  }

  let configFile = tolzaState.config.toString();

  return new Promise<boolean>((resolve) => {
    execFile(
        tolzaParameters.path_compiler,
        ['build', configFile, tolzaParameters.command_build_args],
        async (error, stdout, stderr) => {
          await parseDiagnostics(stdout + stderr);

          if (error) {
            resolve(false);

            return;
          }

          resolve(true);
        },
    );
  });
}

function parseBuildResult(output: string): boolean {
  const begin = '@@TOLZA_EXORDIUM_RESULTATI@@';
  const end = '@@TOLZA_EXORDIUM_RESULTATI@@';
  const start = output.indexOf(begin);
  const finish = output.indexOf(end);

  if (start === -1 || finish === -1) {
    return false;
  }

  const json = output.substring(start + begin.length, finish).trim();

  const result = JSON.parse(json);

  if (!result.success) {
    return false;
  }

  tolzaState.executable = result.executable;

  tolzaState.buildMode = result.mode;

  return true;
}
