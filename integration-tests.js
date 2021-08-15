const DOMAIN_254C = /* _dnslink. */'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvw'
const DOMAIN_253C = DOMAIN_254C.substr(0, 244)

module.exports = {
  't01: A domain without a dnslink-entry, should return empty.': {
    dns: domain => ({
      [domain]: 'txtentry=now'
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {},
        log: [
          { code: 'FALLBACK' }
        ]
      })
    }
  },
  't02: A domain without a _dnslink subdomain, containing one valid testkey link, should return that link.': {
    dns: domain => ({
      [domain]: 'dnslink=/testkey/ABCD'
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { testkey: [{ value: 'ABCD', ttl: 100 }] },
        log: [
          { code: 'FALLBACK' }
        ]
      })
    }
  },
  't03: A domain with _dnslink subdomain, containing one valid testkey link, should return that.': {
    dns: domain => ({
      [domain]: 'dnslink=/testkey/abcd',
      [`_dnslink.${domain}`]: 'dnslink=/testkey/EFGH'
    }),
    async run (t, cmd, domain) {
      const result = {
        links: { testkey: [{ value: 'EFGH', ttl: 100 }] },
        log: []
      }
      t.dnslink(await cmd(domain), result)
      t.dnslink(await cmd(`_dnslink.${domain}`), result)
    }
  },
  't04: Repeat _dnslink subdomains should cause a log entry': {
    dns: domain => ({
      [domain]: 'dnslink=/testkey/efgh',
      [`_dnslink.${domain}`]: 'dnslink=/testkey/IJKL',
      [`_dnslink._dnslink.${domain}`]: 'dnslink=/testkey/MNOP',
      [`_dnslink._dnslink._dnslink.${domain}`]: 'dnslink=/testkey/QRST'
    }),
    async run (t, cmd, domain) {
      const log = []
      t.dnslink(await cmd(domain), { links: { testkey: [{ value: 'IJKL', ttl: 100 }] }, log })
      t.dnslink(await cmd(`_dnslink.${domain}`), { links: { testkey: [{ value: 'IJKL', ttl: 100 }] }, log })
      t.dnslink(await cmd(`_dnslink._dnslink.${domain}`), { links: { testkey: [{ value: 'MNOP', ttl: 100 }] }, log })
      t.dnslink(await cmd(`_dnslink._dnslink._dnslink.${domain}`), { links: { testkey: [{ value: 'QRST', ttl: 100 }] }, log })
      t.dnslink(await cmd(`_dnslink._dnslink._dnslink._dnslink.${domain}`), {
        links: { testkey: [{ value: 'QRST', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      })
    }
  },
  't05: Invalid entries for a key should be ignored, while a valid is returned.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [
        'dnslink=/testkey/',
        'dnslink=/testkey/ ',
        'dnslink=/testkey/MNOP'
      ]
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { testkey: [{ value: 'MNOP', ttl: 100 }] },
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testkey/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testkey/ ', reason: 'NO_VALUE' }
        ]
      })
    }
  },
  't06: Of multiple valid entries for the same key should use the alphabetically smallest (trimmed!)': {
    dns: domain => ({
      [domain]: ['dnslink=/testkey/Z123', 'dnslink=/testkey/QRST', 'dnslink=/testkey/ UVWX']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {
          testkey: [
            { value: 'QRST', ttl: 100 },
            { value: 'UVWX', ttl: 100 },
            { value: 'Z123', ttl: 100 }
          ]
        },
        log: [
          { code: 'FALLBACK' }
        ]
      })
    }
  },
  't07: Multiple valid entries for different keys should be all returned.': {
    dns: domain => ({
      [domain]: ['dnslink=/testkey/4567', 'dnslink=/ipns/890A', 'dnslink=/hyper/AABC']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {
          testkey: [{ value: '4567', ttl: 100 }],
          ipns: [{ value: '890A', ttl: 100 }],
          hyper: [{ value: 'AABC', ttl: 100 }]
        },
        log: [
          { code: 'FALLBACK' }
        ]
      })
    }
  },
  't08: Different invalid entries should cause different log messages.': {
    dns: domain => ({
      [domain]: [
        'dnslink=',
        'dnslink=/',
        'dnslink=/foo',
        'dnslink=/foo/',
        'dnslink=/foo/bar',
        'dnslink=/foo / bar ',
        'dnslink=/foo/bar/baz',
        'dnslink=/foo/bar/baz?qoo=zap',
        'dnslink=/foo/bar/ baz/ ?qoo=zap ',
        'dnslink=/フゲ/bar',
        'dnslink=/foo/ホガ',
        'dnslink=/%E3%81%B5%E3%81%92/baz',
        'dnslink=/boo/%E3%83%9B%E3%82%AC',
        'dnslink=/boo%'
      ]
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {
          foo: [
            { value: 'bar', ttl: 100 },
            { value: 'bar', ttl: 100 },
            { value: 'bar/ baz/ ?qoo=zap', ttl: 100 },
            { value: 'bar/baz', ttl: 100 },
            { value: 'bar/baz?qoo=zap', ttl: 100 }
          ],
          boo: [
            { value: 'ホガ', ttl: 100 }
          ],
          ふげ: [
            { value: 'baz', ttl: 100 }
          ]
        },
        log: [
          { code: 'FALLBACK' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'KEY_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/フゲ/bar', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/ホガ', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/boo%', reason: 'INVALID_ENCODING' }
        ]
      })
    }
  },
  't09: Simple /dnslink/ prefixed redirect.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: `dnslink=/dnslink/b.${domain}`,
      [`_dnslink.b.${domain}`]: 'dnslink=/testkey/AADE'
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { dnslink: [{ value: `b.${domain}`, ttl: 100 }] },
        log: []
      })
    }
  },
  't13: .eth domain support.': {
    domain: 'dnslink.eth',
    flag: 'eth',
    dns: domain => ({
      [domain]: 'dnslink=/testkey/AAJK',
      [`${domain}.link`]: 'dnslink=/testkey/AAJK'
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { testkey: [{ value: 'AAJK', ttl: 100 }] },
        log: [
          { code: 'FALLBACK' }
        ]
      })
    }
  },
  't18: dns RCODE is respected': {
    dns: domain => ({
      // https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml
      [`_dnslink.formaterror.${domain}`]: { type: 'RCODE', data: 1 },
      [`_dnslink.serverfailure.${domain}`]: { type: 'RCODE', data: 2 },
      [`_dnslink.notimplemented.${domain}`]: { type: 'RCODE', data: 4 },
      [`_dnslink.refused.${domain}`]: { type: 'RCODE', data: 5 },
      [`_dnslink.yxdomain.${domain}`]: { type: 'RCODE', data: 6 },
      [`_dnslink.yxrrset.${domain}`]: { type: 'RCODE', data: 7 },
      [`_dnslink.nxrrset.${domain}`]: { type: 'RCODE', data: 8 },
      [`_dnslink.notauth.${domain}`]: { type: 'RCODE', data: 9 },
      [`_dnslink.notzone.${domain}`]: { type: 'RCODE', data: 10 },
      [`_dnslink.dsotypeni.${domain}`]: { type: 'RCODE', data: 11 }
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(`formaterror.${domain}`), { error: { code: 'RCODE_1' } })
      t.dnslink(await cmd(`serverfailure.${domain}`), { error: { code: 'RCODE_2' } })
      t.dnslink(await cmd(domain), { error: { code: 'RCODE_3' } })
      t.dnslink(await cmd(`notimplemented.${domain}`), { error: { code: 'RCODE_4' } })
      t.dnslink(await cmd(`refused.${domain}`), { error: { code: 'RCODE_5' } })
      t.dnslink(await cmd(`yxdomain.${domain}`), { error: { code: 'RCODE_6' } })
      t.dnslink(await cmd(`yxrrset.${domain}`), { error: { code: 'RCODE_7' } })
      t.dnslink(await cmd(`nxrrset.${domain}`), { error: { code: 'RCODE_8' } })
      t.dnslink(await cmd(`notauth.${domain}`), { error: { code: 'RCODE_9' } })
      t.dnslink(await cmd(`notzone.${domain}`), { error: { code: 'RCODE_10' } })
      t.dnslink(await cmd(`dsotypeni.${domain}`), { error: { code: 'RCODE_11' } })
    }
  },
  't19: valid, tricky domain names': {
    dns: domain => ({
      [`_dnslink.xn--froschgrn-x9a.${domain}`]: 'dnslink=/testkey/AAVW',
      [`_dnslink.1337.${domain}`]: 'dnslink=/testkey/BAEF',
      [`_dnslink.abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.${domain}`]: 'dnslink=/testkey/BAGH',
      [`_dnslink.4b.${domain}`]: 'dnslink=/testkey/BAIJ',
      [`_dnslink.foo--bar.${domain}`]: 'dnslink=/testkey/BAMN',
      [`_dnslink._.7.${domain}`]: 'dnslink=/testkey/BAOP',
      [`_dnslink.*.8.${domain}`]: 'dnslink=/testkey/BAQR',
      [`_dnslink.s!ome.9.${domain}`]: 'dnslink=/testkey/BAST',
      [`_dnslink.domain.com�.${domain}`]: 'dnslink=/testkey/CAEF',
      [`_dnslink.domain.com©.${domain}`]: 'dnslink=/testkey/CAGH',
      [`_dnslink.日本語.${domain}`]: 'dnslink=/testkey/CAIJ',
      [`_dnslink.b\u00fccher.${domain}`]: 'dnslink=/testkey/CAKL',
      [`_dnslink.\uFFFD.${domain}`]: 'dnslink=/testkey/CAMN',
      [`_dnslink.президент.рф.${domain}`]: 'dnslink=/testkey/CAOP',
      [`_dnslink.${DOMAIN_253C}`]: 'dnslink=/testkey/CAQR',
      '_dnslink.abc': 'dnslink=/testkey/BAKL',
      '_dnslink.example.0': 'dnslink=/testkey/BAUV',
      '_dnslink.127.0.0.1': 'dnslink=/testkey/BAWX',
      '_dnslink.256.0.0.0': 'dnslink=/testkey/BAYZ',
      '_dnslink.192.168.0.9999': 'dnslink=/testkey/CAST',
      '_dnslink.192.168.0': 'dnslink=/testkey/CAUV',
      '_dnslink.123': 'dnslink=/testkey/CAWX'
    }),
    async run (t, cmd, domain) {
      for (const [subdomain, value] of [
        [`xn--froschgrn-x9a.${domain}`, 'AAVW'],
        [`1337.${domain}`, 'BAEF'],
        [`abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.${domain}`, 'BAGH'],
        [`4b.${domain}`, 'BAIJ'],
        [`foo--bar.${domain}`, 'BAMN'],
        [`_.7.${domain}`, 'BAOP'],
        [`*.8.${domain}`, 'BAQR'],
        [`s!ome.9.${domain}`, 'BAST'],
        [`domain.com�.${domain}`, 'CAEF'],
        [`domain.com©.${domain}`, 'CAGH'],
        [`日本語.${domain}`, 'CAIJ'],
        [`b\u00fccher.${domain}`, 'CAKL'],
        [`\uFFFD.${domain}`, 'CAMN'],
        [`президент.рф.${domain}`, 'CAOP'],
        [DOMAIN_253C, 'CAQR'],
        [DOMAIN_253C, 'CAQR'],
        ['abc', 'BAKL'],
        ['example.0', 'BAUV'],
        ['127.0.0.1', 'BAWX'],
        ['256.0.0.0', 'BAYZ'],
        ['192.168.0.9999', 'CAST'],
        ['192.168.0', 'CAUV'],
        ['123', 'CAWX']
      ]) {
        await testLink(t, cmd, subdomain, value)
      }
    }
  }
}

async function testLink (t, cmd, domain, value) {
  t.dnslink(await cmd(domain), {
    links: { testkey: [{ value, ttl: 100 }] },
    log: []
  })
}
