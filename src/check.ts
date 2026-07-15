import * as vscode from "vscode";
import { veloxParameters, veloxState } from "./state";
import { execFile } from "child_process";
import { parseDiagnostics } from "./diagnostics";

let checkTimer: NodeJS.Timeout | undefined;

let checkGeneration = 0;

let checkRunning = false;
let checkPending = false;

export function scheduleCheck(delay: number) {
  if (checkTimer) {
    clearTimeout(checkTimer);
  }

  checkTimer = setTimeout(() => runCheck(), delay);
}

export async function runCheck() {
  if (!veloxState.config) {
    return;
  }

  if (checkRunning) {
    checkPending = true;

    return;
  }

  checkRunning = true;

  await vscode.workspace.saveAll();

  const generation = ++checkGeneration;

  execFile(
    veloxParameters.path_compiler,
    ["check", veloxState.config, veloxParameters.command_check_args],
    async (_error, stdout, stderr) => {
      if (generation !== checkGeneration) {
        checkRunning = false;

        return;
      }

      await parseDiagnostics(stdout + stderr);

      checkRunning = false;

      if (checkPending) {
        checkPending = false;

        runCheck();
      }
    },
  );
}
