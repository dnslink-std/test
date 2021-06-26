import { getCommand, startServer, runTests } from '@dnslink/test';

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
    const tests = runTests (cmd, { error: false });
    tests.onFinish(() => {});
  });
