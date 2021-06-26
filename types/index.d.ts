import tape = require('fresh-tape');

export type Command = (domain: string, options?: any) => Promise<any>;
export function getCommand(cmd: string[], signal: AbortSignal): Promise<Command>;
export interface ServerOptions {
  udp: number;
  tcp: number;
  doh: number;
}

export function startServer(): Promise<{
  serverOpts: ServerOptions
  close: () => Promise<void>
}>;

export const tests: {
  [name: string]: {
    domain?: string
    dns: (domain: string) => {
      [domain: string]: string[]
    }
    run: (t: tape.Test & { dnslink(actual: any, expected: any): void }, cmd: Command, domain: string) => Promise<void>
    targetDomain: string
  }
};

export function runTests(cmd: Command, flags?: { [flag: string]: boolean }): typeof tape;
