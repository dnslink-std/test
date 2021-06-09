import { getCommand, runTests } from '@dnslink/test';

const c = new AbortController();

getCommand(['hello'], c.signal)
  .then(({ cmd, close }) => {
    const tests = runTests (cmd, { error: false });
    tests.onFinish(close);
  });
