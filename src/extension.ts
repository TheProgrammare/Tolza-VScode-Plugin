import * as vscode from "vscode";
import { execFile } from "child_process";
import * as diagnostic from "./diagnostics";
import * as utils from "./utils";
import { runBuild } from "./build";
import { runCheck, scheduleCheck } from "./check";
import { run } from "./run";
import { veloxParameters, veloxState } from "./state";
import { existsSync } from "fs";
import { exit } from "process";

export function activate(context: vscode.ExtensionContext) {
  utils.findVeloxConfig();

  if (!veloxState.config) {
    vscode.window.showErrorMessage("No velox.toml found");
    return;
  }

  const config = vscode.workspace.getConfiguration("velox");

  veloxParameters.path_toolchain = config.get<string>("toolchain", "");
  veloxParameters.path_compiler = config.get<string>("compiler", "");
  veloxParameters.command_check_args = config.get<string>(
    "command_check_args",
    "",
  );
  veloxParameters.command_build_args = config.get<string>(
    "command_build_args",
    "",
  );

  if (!existsSync(veloxParameters.path_toolchain)) {
    console.error(
      'Invalid toolchain path: "',
      veloxParameters.path_toolchain,
      '"',
    );
    exit(1);
  }
  if (!existsSync(veloxParameters.path_compiler)) {
    console.error(
      'Invalid compiler path: "',
      veloxParameters.path_compiler,
      '"',
    );
    exit(1);
  }

  context.subscriptions.push(diagnostic.diagnostics);

  context.subscriptions.push(
    vscode.commands.registerCommand("velox.check", runCheck),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("velox.build", runBuild),
  );

  context.subscriptions.push(vscode.commands.registerCommand("velox.run", run));

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => scheduleCheck(500)),
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => scheduleCheck(0)),
  );

  scheduleCheck(0);
}

export function deactivate() {}
