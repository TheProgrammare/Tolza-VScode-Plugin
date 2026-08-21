import * as vscode from "vscode";
import * as fs from "fs";
import path = require("path");
import { tolzaState } from "./state";
import { execFile } from "child_process";
import { promisify } from "util";
import which from "which";

export function findTolzaConfig() {
  const workspace = vscode.workspace.workspaceFolders?.[0];

  if (!workspace) {
    return undefined;
  }

  let current = workspace.uri.fsPath;

  while (true) {
    const config = path.join(current, "tolza.toml");

    if (fs.existsSync(config)) {
      tolzaState.config = config;
      return;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      tolzaState.config = undefined;
      return;
    }

    current = parent;
  }
}

const execFileAsync = promisify(execFile);

export interface BinCheckResult {
  valid: boolean;
  path?: string;
  error?: string;
}

export async function check_bin(
  input: string,
  cwd?: string,
): Promise<BinCheckResult> {
  if (!input || input.trim() === "") {
    return {
      valid: false,
      error: "No path specified",
    };
  }

  let binPath: string | undefined;

  // direct path
  let candidate = input;

  // workspace relative resolution
  if (cwd && !path.isAbsolute(candidate)) {
    candidate = path.resolve(cwd, candidate);
  }

  if (fs.existsSync(candidate)) {
    binPath = candidate;
  }

  // search in path
  if (!binPath) {
    try {
      binPath = await which(input);
    } catch {
      return {
        valid: false,
        error: `Binary not found : ${input}`,
      };
    }
  }

  // check file type
  try {
    const stat = fs.statSync(binPath);

    if (!stat.isFile()) {
      return {
        valid: false,
        path: binPath,
        error: "The path dosen't point to a file",
      };
    }
  } catch {
    return {
      valid: false,
      path: binPath,
      error: "Impossible to read the file",
    };
  }

  // check permissions
  if (process.platform !== "win32") {
    try {
      fs.accessSync(binPath, fs.constants.X_OK);
    } catch {
      return {
        valid: false,
        path: binPath,
        error: "The file is not a binary",
      };
    }
  }

  // check bin integrity
  try {
    await execFileAsync(binPath, ["--version"], {
      timeout: 3000,
    });
  } catch (err: any) {
    return {
      valid: false,
      path: binPath,
      error: `The binary dosen't respond --version : ${
        err.message ?? "unknown error"
      }`,
    };
  }

  return {
    valid: true,
    path: binPath,
  };
}
