import tape = require('fresh-tape');

export type Command = (domain: string, options?: any) => Promise<any>;
export function getCommand(cmd: string[], signal: AbortSignal): Promise<{
  cmd: Command
  close: () => void
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

export function runTests(cmd: Command, withErrors?: boolean): typeof tape;
