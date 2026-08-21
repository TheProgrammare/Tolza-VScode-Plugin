import * as vscode from "vscode";
import { execFile } from "child_process";
import * as diagnostic from "./diagnostics";
import * as utils from "./utils";
import { runBuild } from "./build";
import { runCheck, scheduleCheck } from "./check";
import { run } from "./run";
import { tolzaParameters, tolzaState } from "./state";
import { existsSync } from "fs";
import { exit } from "process";

export async function activate(context: vscode.ExtensionContext) {
  utils.findTolzaConfig();

  if (!tolzaState.config) {
    vscode.window.showErrorMessage("No tolza.toml found");
    return;
  }

  const config = vscode.workspace.getConfiguration("tolza");

  tolzaParameters.path_toolchain = config.get<string>("toolchain", "tolza");
  tolzaParameters.path_compiler = config.get<string>(
    "compiler",
    "tolza-compiler",
  );
  tolzaParameters.command_check_args = config.get<string>(
    "command_check_args",
    "",
  );
  tolzaParameters.command_build_args = config.get<string>(
    "command_build_args",
    "",
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

  context.subscriptions.push(diagnostic.diagnostics);

  context.subscriptions.push(
    vscode.commands.registerCommand("tolza.check", runCheck),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tolza.build", runBuild),
  );

  context.subscriptions.push(vscode.commands.registerCommand("tolza.run", run));

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => scheduleCheck(500)),
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => scheduleCheck(0)),
  );

  console.log("Extension Tolza activated");

  scheduleCheck(0);
}

export function deactivate() {}
