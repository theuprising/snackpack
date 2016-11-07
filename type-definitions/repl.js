// @flow

declare class REPLServer extends events$EventEmitter {
  defineCommand(keyword: string, command: { help?: string, action: Function } | Function): void,
  displayPrompt(preserveCursor: boolean): void,
  context: any
}

type repl$replOpts = {
  prompt?: string,
  input?: stream$Readable,
  output?: stream$Writable,
  terminal?: boolean,
  eval?: Function,
  useColors?: boolean,
  useGlobal?: boolean,
  ignoreUndefined?: boolean,
  writer?: Function,
  completer?: Function,
  replMode?: string, // enum?
  breakEvalOnSigint?: boolean
}

declare module 'repl' {
  declare function start(options?: repl$replOpts): REPLServer
}

