import * as vscode from 'vscode';

import {config_build, runBuild} from './build';
import {scheduleCheck} from './build_check';
import {config_completion, TolzaCompletionProvider} from './completion_items';
import * as diagnostic from './diagnostics';
import {config_tolza_config} from './state';
import {config_workspace} from './workspace';


export async function activate(context: vscode.ExtensionContext) {
  config_tolza_config(context);

  context.subscriptions.push(diagnostic.diagnostics);

  config_build(context);

  config_completion(context);

  config_workspace(context);

  console.log('Extension Tolza activated');

  scheduleCheck(0);
}
