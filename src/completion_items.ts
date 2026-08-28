import * as vscode from 'vscode';

export async function config_completion(context: vscode.ExtensionContext) {
  context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
          'tolza', new TolzaCompletionProvider()),
  );
}

const completionItems:
    ReadonlyMap<vscode.CompletionItemKind, readonly string[]> = new Map([
      // Modules
      [
        vscode.CompletionItemKind.Module,
        [
          'mod',
          'import',
          'export',
          'reexport',
        ],
      ],

      // Classes
      [
        vscode.CompletionItemKind.Class,
        [
          'form',

          // Primitive / built-in types
          'type',
          'u0',
          'bool',
          'cune',
          'rune',
          'fsize',
          'ssize',
          'usize',
          's8',
          'u8',
          'b8',
          's16',
          'u16',
          'b16',
          's32',
          'u32',
          'b32',
          's64',
          'u64',
          'b64',
          's128',
          'u128',
          'b128',
          'f16',
          'f32',
          'f64',
          'f80',
          'f128',
          'cstr',
          'str',
          'text',
          'dsize',
          'd32',
          'd64',
          'd128',
          'udsize',
          'ud32',
          'ud64',
          'ud128',
          'ptrsize',
          'opaque',
        ],
      ],

      // Structs
      [
        vscode.CompletionItemKind.Struct,
        [
          'facet',
        ],
      ],

      // Interfaces
      [
        vscode.CompletionItemKind.Interface,
        [
          'view',
        ],
      ],

      // Enums
      [
        vscode.CompletionItemKind.Enum,
        [
          'enum',
          'flag',
        ],
      ],

      // Functions
      [
        vscode.CompletionItemKind.Function,
        [],
      ],

      // Values
      [
        vscode.CompletionItemKind.Value,
        [
          'true',
          'false',
          'nullptr',
        ],
      ],

      // Operators
      [
        vscode.CompletionItemKind.Operator,
        [
          // Logical
          'and',
          'nand',
          'or',
          'nor',
          'xor',
          'xnor',
          'not',

          // Bitwise
          'b.not',
          'b.and',
          'b.nand',
          'b.or',
          'b.xor',
          'b.nor',
          'b.xnor',

          'b.shl.0',
          'b.shl.1',
          'b.shl.a',

          'b.shr.0',
          'b.shr.1',
          'b.shr.a',

          'b.rol',
          'b.ror',

          // Arithmetic
          '+',
          '-',
          '*',
          '**',
          '^',
          '/',
          '%m',
          '%q',
          '%r',

          // Domain specific
          'd.dre',
          'm.add',
          'm.sub',
          'm.dist',

          // Assignment
          '+=',
          '-=',
          '*=',
          '**=',
          '/=',
          '%m=',
          '%q=',
          '%r=',

          'd.dre=',
          'm.add=',
          'm.sub=',
          'm.dist=',

          'b.not=',
          'b.and=',
          'b.nand=',
          'b.or=',
          'b.xor=',
          'b.nor=',
          'b.xnor=',

          'b.shl.0=',
          'b.shl.1=',
          'b.shl.a=',

          'b.shr.0=',
          'b.shr.1=',
          'b.shr.a=',

          'b.rol=',
          'b.ror=',
        ],
      ],

      // Keywords
      [
        vscode.CompletionItemKind.Keyword,
        [
          // Variables
          'let',
          'var',
          'const',

          // Cast / type checking
          'as',
          'is',
          'nis',

          // Generics
          'gen',

          // Functions
          'fn',
          'lam',
          'extend',

          // Pointers / ownership / memory
          'ptr',
          'new',
          'del',
          'drop',
          'addr',
          'ref',
          'move',
          'mut',
          'copy',
          'with',
          'on',

          // Operator declaration
          'op',

          // Conditionals
          'if',
          'else',
          'elif',

          // Loops
          'for',
          'in',
          'nin',
          'step',
          'while',
          'do',
          'loop',

          // Match
          'match',

          // Control flow
          'break',
          'continue',
          'return',
          'goto',
          'label',

          // Misc
          'uninit',
          'extern',
          'use',
          'rule',
        ],
      ],
    ]);

export class TolzaCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position,
      ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    for (const [kind, labels] of completionItems) {
      for (const label of labels) {
        items.push(
            new vscode.CompletionItem(label, kind),
        );
      }
    }

    return items;
  }
}