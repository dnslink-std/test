import { getCommand, startServer, runTests, SETUP, SetupEntry } from '@dnslink/test';

const c = new AbortController();

startServer()
  .then(({ serverOpts, close }) => {
    // $ExpectType number
    serverOpts.udp;
    // $ExpectType number
    serverOpts.tcp;
    // $ExpectType number
    serverOpts.doh;
    close().then(() => {});
  });

getCommand(['hello'], c.signal)
  .then(cmd => {
    const tests = runTests (cmd, { error: false }, { only: ['t01'], skip: ['t10'] });
    tests.onFinish(() => {});
  });

const domainEntry = SETUP['some.domain'];
if (domainEntry !== undefined) {
  const rTypeTXT = domainEntry[16];
  if (rTypeTXT !== undefined) {
    // $ExpectType SetupEntry[]
    rTypeTXT;
  }
  // $ExpectType SetupEntry[] | undefined
  domainEntry.RCODE;
}
