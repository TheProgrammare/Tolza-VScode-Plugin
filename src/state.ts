import * as crypto from 'crypto';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

import * as utils from './utils';

const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

if (!workspaceRoot) {
  throw new Error('No workspace folder open');
}

const workspaceId = getWorkspaceId(workspaceRoot);

export const tolzaState = {
  manifest: undefined as string | undefined,

  executable: undefined as string | undefined,

  buildMode: undefined as string | undefined,

  checkRunning: false,

  generation: 0,

  output: vscode.window.createOutputChannel('Tolza'),

  workspaceRoot: workspaceRoot,
  workspaceId: workspaceId,
  overlayRoot: path.join(
      os.tmpdir(),
      'tolza',
      workspaceId,
      ),
};

function getWorkspaceId(workspaceRoot: string): string {
  const normalized = path.resolve(workspaceRoot).replace(/\\g/, '/');

  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

export const tolzaParameters = {
  path_toolchain: '' as string,

  path_compiler: '' as string,

  command_check_args: '' as string,

  command_build_args: '' as string,
};


export async function config_tolza_config(context: vscode.ExtensionContext) {
  utils.findTolzaConfig();

  if (!tolzaState.manifest) {
    vscode.window.showErrorMessage('No manifest tolza.toml found');
    return;
  }

  const config = vscode.workspace.getConfiguration('tolza');

  tolzaParameters.path_toolchain = config.get<string>('toolchain', 'tolza');
  tolzaParameters.path_compiler = config.get<string>(
      'compiler',
      'tolza-compiler',
  );
  tolzaParameters.command_check_args = config.get<string>(
      'command_check_args',
      'tolza-compiler',
  );
  tolzaParameters.command_build_args = config.get<string>(
      'command_build_args',
      'tolza-compiler',
  );

  const toolchain_result = await utils.check_bin(
      tolzaParameters.path_toolchain,
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
  );

  if (!toolchain_result.valid) {
    vscode.window.showErrorMessage(
        `Invalid Tolza toolchain : ${toolchain_result.error}`,
    );
    return;
  }

  const compiler_result = await utils.check_bin(
      tolzaParameters.path_compiler,
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
  );

  if (!compiler_result.valid) {
    vscode.window.showErrorMessage(
        `Invalid Tolza compiler : ${compiler_result.error}`,
    );
    return;
  }
}
