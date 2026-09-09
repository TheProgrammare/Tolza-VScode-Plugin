import * as fs from 'fs/promises';
import path from 'node:path';
import * as vscode from 'vscode';

import {tolzaState} from './state';

export async function updateOverlay(): Promise<void> {
  await fs.rm(tolzaState.overlayRoot, {
    recursive: true,
    force: true,
  });

  await fs.mkdir(tolzaState.overlayRoot, {
    recursive: true,
  });


  const dirtyDocs = vscode.workspace.textDocuments.filter(
      document => document.isDirty && document.uri.scheme === 'file' &&
          document.uri.fsPath.startsWith(tolzaState.workspaceRoot + path.sep),
  );

  for (const doc of dirtyDocs) {
    const relativePath =
        path.relative(tolzaState.workspaceRoot, doc.uri.fsPath);

    const overlayPath = path.join(tolzaState.overlayRoot, relativePath);

    await fs.mkdir(path.dirname(overlayPath), {recursive: true});

    await fs.writeFile(overlayPath, doc.getText(), 'utf8');
  }
}