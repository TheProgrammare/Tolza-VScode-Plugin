import * as vscode from "vscode";
import { execFile } from "child_process";
import { tolzaState } from "./state";
import { runBuild } from "./build";

export async function run() {
  const success = await runBuild();

  if (!success) {
    vscode.window.showErrorMessage("Build failed");

    return;
  }

  if (!tolzaState.executable) {
    vscode.window.showErrorMessage("Executable not found");

    return;
  }

  const terminal = vscode.window.createTerminal("Tolza Run");

  terminal.show();

  terminal.sendText(tolzaState.executable);
}
