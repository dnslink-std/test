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
  't02: A domain without a _dnslink subdomain, containing one valid testnamespace link, should return that link.': {
    dns: domain => ({
      [domain]: 'dnslink=/testnamespace/ABCD'
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { testnamespace: [{ identifier: 'ABCD', ttl: 100 }] },
        log: [
          { code: 'FALLBACK' }
        ]
      })
    }
  },
  't03: A domain with _dnslink subdomain, containing one valid testnamespace link, should return that.': {
    dns: domain => ({
      [domain]: 'dnslink=/testnamespace/abcd',
      [`_dnslink.${domain}`]: 'dnslink=/testnamespace/EFGH'
    }),
    async run (t, cmd, domain) {
      const result = {
        links: { testnamespace: [{ identifier: 'EFGH', ttl: 100 }] },
        log: []
      }
      t.dnslink(await cmd(domain), result)
      t.dnslink(await cmd(`_dnslink.${domain}`), result)
    }
  },
  't04: Repeat _dnslink subdomains should cause a log entry': {
    dns: domain => ({
      [domain]: 'dnslink=/testnamespace/efgh',
      [`_dnslink.${domain}`]: 'dnslink=/testnamespace/IJKL',
      [`_dnslink._dnslink.${domain}`]: 'dnslink=/testnamespace/MNOP',
      [`_dnslink._dnslink._dnslink.${domain}`]: 'dnslink=/testnamespace/QRST'
    }),
    async run (t, cmd, domain) {
      const log = []
      t.dnslink(await cmd(domain), { links: { testnamespace: [{ identifier: 'IJKL', ttl: 100 }] }, log })
      t.dnslink(await cmd(`_dnslink.${domain}`), { links: { testnamespace: [{ identifier: 'IJKL', ttl: 100 }] }, log })
      t.dnslink(await cmd(`_dnslink._dnslink.${domain}`), { links: { testnamespace: [{ identifier: 'MNOP', ttl: 100 }] }, log })
      t.dnslink(await cmd(`_dnslink._dnslink._dnslink.${domain}`), { links: { testnamespace: [{ identifier: 'QRST', ttl: 100 }] }, log })
      t.dnslink(await cmd(`_dnslink._dnslink._dnslink._dnslink.${domain}`), {
        links: { testnamespace: [{ identifier: 'QRST', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      })
    }
  },
  't05: Invalid entries for a namespace should be ignored, while a valid is returned.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [
        'dnslink=/testnamespace/',
        'dnslink=/testnamespace/MNOP'
      ]
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { testnamespace: [{ identifier: 'MNOP', ttl: 100 }] },
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace/', reason: 'NO_IDENTIFIER' }
        ]
      })
    }
  },
  't06: Of multiple valid entries for the same namespace should use the alphabetically smallest (trimmed!)': {
    dns: domain => ({
      [domain]: [
        'dnslink=/testnamespace/Z123 ', 'dnslink=/testnamespace/QRST', 'dnslink=/testnamespace/ UVWX',
        'dnslink=/testnamespace/ ',
        'dnslink= /testnamespace/ x',
        'dnslink=/ testnamespace/4567',
        'dnslink=/testnamespace /890A'
      ]
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {
          testnamespace: [
            { identifier: ' ', ttl: 100 },
            { identifier: ' UVWX', ttl: 100 },
            { identifier: 'QRST', ttl: 100 },
            { identifier: 'Z123 ', ttl: 100 }
          ],
          ' testnamespace': [
            { identifier: '4567', ttl: 100 },
          ],
          'testnamespace ': [
            { identifier: '890A', ttl: 100 },
          ]
        },
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink= /testnamespace/ x', reason: 'WRONG_START' },
          { code: 'FALLBACK' }
        ]
      })
    }
  },
  't07: Multiple valid entries for different namespaces should be all returned.': {
    dns: domain => ({
      [domain]: ['dnslink=/testnamespace/4567', 'dnslink=/ns_3/890A', 'dnslink=/ns_2/AABC']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {
          testnamespace: [{ identifier: '4567', ttl: 100 }],
          ns_3: [{ identifier: '890A', ttl: 100 }],
          ns_2: [{ identifier: 'AABC', ttl: 100 }]
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
        'dnslink=/boo%',
        'dnslink=/boo%/baz%'
      ]
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {
          foo: [
            { identifier: 'bar', ttl: 100 },
            { identifier: 'bar/ baz/ ?qoo=zap ', ttl: 100 },
            { identifier: 'bar/baz', ttl: 100 },
            { identifier: 'bar/baz?qoo=zap', ttl: 100 }
          ],
          'foo ': [
            { identifier: ' bar ', ttl: 100 },
          ],
          boo: [
            { identifier: '%E3%83%9B%E3%82%AC', ttl: 100 }
          ],
          '%E3%81%B5%E3%81%92': [
            { identifier: 'baz', ttl: 100 }
          ],
          'boo%': [
            { identifier: 'baz%', ttl: 100 }
          ]
        },
        log: [
          { code: 'FALLBACK' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'NAMESPACE_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/フゲ/bar', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/ホガ', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/boo%', reason: 'NO_IDENTIFIER' }
        ]
      })
    }
  },
  't09: Simple /dnslink/ prefixed redirect.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: `dnslink=/dnslink/b.${domain}`,
      [`_dnslink.b.${domain}`]: 'dnslink=/testnamespace/AADE'
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { dnslink: [{ identifier: `b.${domain}`, ttl: 100 }] },
        log: []
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
      [`_dnslink.xn--froschgrn-x9a.${domain}`]: 'dnslink=/testnamespace/AAVW',
      [`_dnslink.1337.${domain}`]: 'dnslink=/testnamespace/BAEF',
      [`_dnslink.abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.${domain}`]: 'dnslink=/testnamespace/BAGH',
      [`_dnslink.4b.${domain}`]: 'dnslink=/testnamespace/BAIJ',
      [`_dnslink.foo--bar.${domain}`]: 'dnslink=/testnamespace/BAMN',
      [`_dnslink._.7.${domain}`]: 'dnslink=/testnamespace/BAOP',
      [`_dnslink.*.8.${domain}`]: 'dnslink=/testnamespace/BAQR',
      [`_dnslink.s!ome.9.${domain}`]: 'dnslink=/testnamespace/BAST',
      [`_dnslink.domain.com�.${domain}`]: 'dnslink=/testnamespace/CAEF',
      [`_dnslink.domain.com©.${domain}`]: 'dnslink=/testnamespace/CAGH',
      [`_dnslink.日本語.${domain}`]: 'dnslink=/testnamespace/CAIJ',
      [`_dnslink.b\u00fccher.${domain}`]: 'dnslink=/testnamespace/CAKL',
      [`_dnslink.\uFFFD.${domain}`]: 'dnslink=/testnamespace/CAMN',
      [`_dnslink.президент.рф.${domain}`]: 'dnslink=/testnamespace/CAOP',
      [`_dnslink.${DOMAIN_253C}`]: 'dnslink=/testnamespace/CAQR',
      '_dnslink.abc': 'dnslink=/testnamespace/BAKL',
      '_dnslink.example.0': 'dnslink=/testnamespace/BAUV',
      '_dnslink.127.0.0.1': 'dnslink=/testnamespace/BAWX',
      '_dnslink.256.0.0.0': 'dnslink=/testnamespace/BAYZ',
      '_dnslink.192.168.0.9999': 'dnslink=/testnamespace/CAST',
      '_dnslink.192.168.0': 'dnslink=/testnamespace/CAUV',
      '_dnslink.123': 'dnslink=/testnamespace/CAWX'
    }),
    async run (t, cmd, domain) {
      for (const [subdomain, identifier] of [
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
        await testLink(t, cmd, subdomain, identifier)
      }
    }
  }
}

async function testLink (t, cmd, domain, identifier) {
  t.dnslink(await cmd(domain), {
    links: { testnamespace: [{ identifier, ttl: 100 }] },
    log: []
  })
}
