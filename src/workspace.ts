import {execFile} from 'child_process';
import {existsSync} from 'fs';
import * as vscode from 'vscode';

import {parseDiagnostics} from './diagnostics';
import {tolzaParameters, tolzaState} from './state';


export async function config_workspace(context: vscode.ExtensionContext) {
  context.subscriptions.push(
      vscode.commands.registerCommand('tolza.new.workspace', new_workspace),
  );
  context.subscriptions.push(
      vscode.commands.registerCommand('tolza.new.manifest', new_manifest),
  );
  context.subscriptions.push(
      vscode.commands.registerCommand('tolza.new.profile', new_profile),
  );

  context.subscriptions.push(
      vscode.commands.registerCommand('tolza.audit', runAudit),
  );
  context.subscriptions.push(
      vscode.commands.registerCommand('tolza.check', runAudit),
  );
}

export async function new_workspace(uri: vscode.Uri) {
  tolzaState.output.appendLine(`Selected folder : ${uri.fsPath}`);

  const projectName = await vscode.window.showInputBox({
    prompt: 'Tolza project name',
    placeHolder: 'my-project',
    validateInput: (value) => {
      if (!value.trim()) {
        return 'The project name can\'t be empty.';
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'The project name can only contains lettres, numbers, _ and -.';
      }
    }
  });

  if (!projectName) return;

  const manifest = uri + projectName + 'tolza.toml';

  if (existsSync(manifest)) {
    vscode.window.showErrorMessage(`The workspace manifest at "${
        manifest}" already exists. Creation aborted.`);
    return;
  }

  const p = await new Promise<boolean>((resolve) => {
    execFile(
        tolzaParameters.path_toolchain,
        [
          'new', 'workspace', uri + projectName, '--name', projectName,
          uri.fsPath
        ],
        async (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(
                `Error: ${error.message}\n${stderr}`);
            resolve(false);
            return;
          }

          resolve(true);
        },
    );
  });

  if (p) {
    vscode.window.showInformationMessage(
        `The workspace has been created at "${uri + projectName}"`);
  } else {
    vscode.window.showInformationMessage(`Workspace creation aborted`);
  }

  return p;
}


export async function new_manifest(uri: vscode.Uri) {
  tolzaState.output.appendLine(`Selected folder : ${uri.fsPath}`);

  const projectName = await vscode.window.showInputBox({
    prompt: 'Tolza project name',
    placeHolder: 'my-project',
    validateInput: (value) => {
      if (!value.trim()) {
        return 'The project name can\'t be empty.';
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'The project name can only contains lettres, numbers, _ and -.';
      }
    }
  });

  if (!projectName) return;

  const manifest = uri + 'tolza.toml';

  if (existsSync(manifest)) {
    const answer = await vscode.window.showInformationMessage(
        `The workspace manifest at "${manifest}" already exists.
        Do you want to override it ?`,
        'Yes', 'No');
    if (answer === 'No') return;
  }

  const p = await new Promise<boolean>((resolve) => {
    execFile(
        tolzaParameters.path_toolchain,
        ['new', 'manifest', '--name', projectName, uri.fsPath],
        async (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(
                `Error: ${error.message}\n${stderr}`);
            resolve(false);
            return;
          }

          tolzaState.output.appendLine(stdout);
          tolzaState.output.appendLine(stderr);
          resolve(true);
        },
    );
  });


  if (p) {
    vscode.window.showInformationMessage(
        `The manifest has been created at "${uri}/tolza.toml"`);
  } else {
    vscode.window.showInformationMessage(`Manifest creation aborted`);
  }

  return p;
}

export async function new_profile(uri: vscode.Uri) {
  tolzaState.output.appendLine(`Selected folder : ${uri.fsPath}`);

  const profileName = await vscode.window.showInputBox({
    prompt: 'Tolza project name',
    placeHolder: 'my-project',
    validateInput: (value) => {
      if (!value.trim()) {
        return 'The project name can\'t be empty.';
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        return 'The project name can only contains lettres, numbers, _ and -.';
      }
    }
  });

  if (!profileName) return;

  const profile = uri + profileName + '.toml';

  const debugMode = await vscode.window.showInformationMessage(
                        'Use debug mode presets ?', 'Yes', 'No') === 'Yes';

  if (existsSync(profile)) {
    const answer = await vscode.window.showInformationMessage(
        `The workspace profile at "${profile}" already exists.
        Do you want to override it ?`,
        'Yes', 'No');
    if (answer === 'No') return;
  }

  const p = await new Promise<boolean>((resolve) => {
    execFile(
        tolzaParameters.path_toolchain,
        [
          'new', 'profile', '--name', profileName, debugMode ? '-d' : '',
          uri.fsPath
        ],
        async (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(
                `Error: ${error.message}\n${stderr}`);
            resolve(false);
            return;
          }

          tolzaState.output.appendLine(stdout);
          tolzaState.output.appendLine(stderr);
          resolve(true);
        },
    );
  });


  if (p) {
    vscode.window.showInformationMessage(
        `The profile has been created at "${uri + profileName}.toml"`);
  } else {
    vscode.window.showInformationMessage(`Profile creation aborted`);
  }

  return p;
}

export async function runAudit() {
  if (!tolzaState.config) {
    return;
  }

  const root = vscode.workspace.workspaceFolders?.[0];

  if (!root) return;

  execFile(
      tolzaParameters.path_toolchain, ['audit', root.uri.fsPath],
      async (error, stdout, stderr) => {
        if (error) {
          vscode.window.showErrorMessage(`Error: ${error.message}\n${stderr}`);
          return;
        }

        tolzaState.output.appendLine(stdout);
        tolzaState.output.appendLine(stderr);
      });
}

export async function check_toml(uri: vscode.Uri) {
  tolzaState.output.appendLine(`Selected folder : ${uri.fsPath}`);

  const p = await new Promise<boolean>((resolve) => {
    execFile(
        tolzaParameters.path_toolchain,
        ['check', 'profile', uri.fsPath],
        async (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(
                `Error: ${error.message}\n${stderr}`);
            resolve(false);
            return;
          }

          tolzaState.output.appendLine(stdout);
          tolzaState.output.appendLine(stderr);
          resolve(true);
        },
    );
  });


  if (p) {
    vscode.window.showInformationMessage(
        `The profile has been created at "${uri}.toml"`);
  } else {
    vscode.window.showInformationMessage(`Profile creation aborted`);
  }

  return p;
}