import * as vscode from 'vscode';

import {config_build, runBuild} from './build';
import {config_check} from './build_check';
import {config_completion, TolzaCompletionProvider} from './completion_items';
import * as diagnostic from './diagnostics';
import {config_tolza_config, tolzaState} from './state';
import {config_workspace} from './workspace';


export async function activate(context: vscode.ExtensionContext) {
  config_tolza_config(context);
  tolzaState.output.show(true);

  context.subscriptions.push(diagnostic.diagnostics);

  config_build(context);

  config_check(context);

  config_completion(context);

  config_workspace(context);

  tolzaState.output.appendLine('Extension Tolza activated');
}
