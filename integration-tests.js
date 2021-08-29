const DOMAIN_254C = /* _dnslink. */'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvw'
const DOMAIN_253C = DOMAIN_254C.substr(0, 244)
let VALID_CHARS = ''
for (let char = 0x20; char <= 0x7e; char += 1) {
  if (char !== 0x2f) {
    VALID_CHARS += String.fromCharCode(char)
  }
}

module.exports = {
  't01: A domain without a dnslink-entry, should return empty.': {
    dns: domain => ({
      [domain]: 'txtentry=now'
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {},
        log: [{ code: 'FALLBACK' }]
      })
  },
  't02: A domain without a _dnslink subdomain, containing one valid testnamespace link, should return that link.': {
    dns: domain => ({
      [domain]: 'dnslink=/testnamespace/ABCD'
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: { testnamespace: [{ identifier: 'ABCD', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      })
  },
  't03: A domain with _dnslink subdomain, without DNSLink entry should return empty.': {
    dns: domain => ({
      [domain]: 'dnslink=/testnamespace/abcd',
      [`_dnslink.${domain}`]: 'txtentry=now'
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {},
        log: []
      })
  },
  't04: A domain with _dnslink subdomain, containing one valid testnamespace link, should return that.': {
    dns: domain => ({
      [domain]: 'dnslink=/testnamespace/efgh',
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
  't05: Multiple _dnslink subdomains lookup behaviour.': {
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
  't06: Only entries starting with / are valid.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [
        'dnslink=',
        'dnslink= /testnamespace/ ijkl'
      ]
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {},
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink= /testnamespace/ ijkl', reason: 'WRONG_START' }
        ]
      })
  },
  't07: Only entries with characterset are valid.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [
        `dnslink=/${VALID_CHARS}/QRST`,
        'dnslink=/\x19',
        'dnslink=/\x7f',
        'dnslink=/フゲ/UVWX',
        'dnslink=/YZ12/ホガ'
      ]
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {
          [VALID_CHARS]: [{ identifier: 'QRST', ttl: 100 }]
        },
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/\x19', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/\x7f', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/フゲ/UVWX', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/YZ12/ホガ', reason: 'INVALID_CHARACTER' }
        ]
      })
  },
  't08: Only entries with a namespace are valid.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [
        'dnslink=/',
        'dnslink=//mnop'
      ]
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {},
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'NAMESPACE_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=//mnop', reason: 'NAMESPACE_MISSING' }
        ]
      })
  },
  't09: Only entries with an identifier are valid.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [
        'dnslink=/testnamespace',
        'dnslink=/testnamespace/',
        'dnslink=/testnamespace%'
      ]
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {},
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace/', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace%', reason: 'NO_IDENTIFIER' }
        ]
      })
  },
  't10: Precedence of invalidity reasons: WRONG_START > INVALID_CHARACTER > NAMESPACE_MISSING > NO_IDENTIFIER.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [
        'dnslink= //\x19',
        'dnslink=//\x19',
        'dnslink=//',
        'dnslink=/testnamespace/'
      ]
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {},
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink= //\x19', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=//\x19', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=//', reason: 'NAMESPACE_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace/', reason: 'NO_IDENTIFIER' }
        ]
      })
  },
  't11: Sorting of multiple valid entries.': {
    dns: domain => ({
      [domain]: [
        'dnslink=/testnamespace/Z123 ',
        'dnslink=/testnamespace/QRST',
        'dnslink=/testnamespace/ UVWX',
        'dnslink=/testnamespace/lowercase'
      ]
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {
          testnamespace: [
            { identifier: ' UVWX', ttl: 100 },
            { identifier: 'QRST', ttl: 100 },
            { identifier: 'Z123 ', ttl: 100 },
            { identifier: 'lowercase', ttl: 100 }
          ]
        },
        log: [{ code: 'FALLBACK' }]
      })
  },
  't12: Multiple valid entries for different namespaces should be all returned.': {
    dns: domain => ({
      [domain]: [
        'dnslink=/ns_1/4567',
        'dnslink=/ns_1/890A',
        'dnslink=/ns_3/AABC',
        'dnslink=/ns_2/AADE'
      ]
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {
          ns_1: [
            { identifier: '4567', ttl: 100 },
            { identifier: '890A', ttl: 100 }
          ],
          ns_3: [{ identifier: 'AABC', ttl: 100 }],
          ns_2: [{ identifier: 'AADE', ttl: 100 }]
        },
        log: [{ code: 'FALLBACK' }]
      })
  },
  't13: Odd but valid DNSLink entries.': {
    dns: domain => ({
      [domain]: [
        'dnslink=/testnamespace/ ',
        'dnslink=/ /AAFG',
        'dnslink=/testnamespace / AAHI ',
        'dnslink=/ testnamespace/AAJK/LM',
        'dnslink=/testnamespace/AANO/PQ?RS=TU',
        'dnslink=/testnamespace/AAVW/ XY/ ?Z1=23 ',
        'dnslink=/%E3%81%B5%E3%81%92/AA45',
        'dnslink=/testnamespace/%E3%83%9B%E3%82%AC',
        'dnslink=/testnamespace%/AA67%',
        'dnslink=/dnslink/AA89'
      ]
    }),
    run: async (t, cmd, domain) =>
      t.dnslink(await cmd(domain), {
        links: {
          testnamespace: [
            { identifier: ' ', ttl: 100 },
            { identifier: '%E3%83%9B%E3%82%AC', ttl: 100 },
            { identifier: 'AANO/PQ?RS=TU', ttl: 100 },
            { identifier: 'AAVW/ XY/ ?Z1=23 ', ttl: 100 }
          ],
          ' ': [{ identifier: 'AAFG', ttl: 100 }],
          'testnamespace ': [{ identifier: ' AAHI ', ttl: 100 }],
          ' testnamespace': [{ identifier: 'AAJK/LM', ttl: 100 }],
          '%E3%81%B5%E3%81%92': [{ identifier: 'AA45', ttl: 100 }],
          'testnamespace%': [{ identifier: 'AA67%', ttl: 100 }],
          dnslink: [{ identifier: 'AA89', ttl: 100 }]
        },
        log: [{ code: 'FALLBACK' }]
      })
  },
  't14: dns DNS RCODE is respected.': {
    dns: domain => ({
      // https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml
      [`_dnslink.formaterror.${domain}`]: { type: 'DNS_RCODE', data: 1 },
      [`_dnslink.serverfailure.${domain}`]: { type: 'DNS_RCODE', data: 2 },
      [`_dnslink.notimplemented.${domain}`]: { type: 'DNS_RCODE', data: 4 },
      [`_dnslink.refused.${domain}`]: { type: 'DNS_RCODE', data: 5 },
      [`_dnslink.yxdomain.${domain}`]: { type: 'DNS_RCODE', data: 6 },
      [`_dnslink.yxrrset.${domain}`]: { type: 'DNS_RCODE', data: 7 },
      [`_dnslink.nxrrset.${domain}`]: { type: 'DNS_RCODE', data: 8 },
      [`_dnslink.notauth.${domain}`]: { type: 'DNS_RCODE', data: 9 },
      [`_dnslink.notzone.${domain}`]: { type: 'DNS_RCODE', data: 10 },
      [`_dnslink.dsotypeni.${domain}`]: { type: 'DNS_RCODE', data: 11 }
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(`formaterror.${domain}`), { error: { code: 'DNS_RCODE_1' } })
      t.dnslink(await cmd(`serverfailure.${domain}`), { error: { code: 'DNS_RCODE_2' } })
      t.dnslink(await cmd(domain), { error: { code: 'DNS_RCODE_3' } })
      t.dnslink(await cmd(`notimplemented.${domain}`), { error: { code: 'DNS_RCODE_4' } })
      t.dnslink(await cmd(`refused.${domain}`), { error: { code: 'DNS_RCODE_5' } })
      t.dnslink(await cmd(`yxdomain.${domain}`), { error: { code: 'DNS_RCODE_6' } })
      t.dnslink(await cmd(`yxrrset.${domain}`), { error: { code: 'DNS_RCODE_7' } })
      t.dnslink(await cmd(`nxrrset.${domain}`), { error: { code: 'DNS_RCODE_8' } })
      t.dnslink(await cmd(`notauth.${domain}`), { error: { code: 'DNS_RCODE_9' } })
      t.dnslink(await cmd(`notzone.${domain}`), { error: { code: 'DNS_RCODE_10' } })
      t.dnslink(await cmd(`dsotypeni.${domain}`), { error: { code: 'DNS_RCODE_11' } })
    }
  },
  't15: Uncommon yet valid domain names.': {
    dns: domain => ({
      [`_dnslink.xn--froschgrn-x9a.${domain}`]: 'dnslink=/testnamespace/AA0A',
      [`_dnslink.1337.${domain}`]: 'dnslink=/testnamespace/BABC',
      [`_dnslink.abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.${domain}`]: 'dnslink=/testnamespace/BADE',
      [`_dnslink.4b.${domain}`]: 'dnslink=/testnamespace/BAFG',
      [`_dnslink.foo--bar.${domain}`]: 'dnslink=/testnamespace/BAHI',
      [`_dnslink._.7.${domain}`]: 'dnslink=/testnamespace/BAJK',
      [`_dnslink.*.8.${domain}`]: 'dnslink=/testnamespace/BALM',
      [`_dnslink.s!ome.9.${domain}`]: 'dnslink=/testnamespace/BANO',
      [`_dnslink.domain.com�.${domain}`]: 'dnslink=/testnamespace/BAPQ',
      [`_dnslink.domain.com©.${domain}`]: 'dnslink=/testnamespace/BARS',
      [`_dnslink.日本語.${domain}`]: 'dnslink=/testnamespace/BATU',
      [`_dnslink.b\u00fccher.${domain}`]: 'dnslink=/testnamespace/BAVW',
      [`_dnslink.\uFFFD.${domain}`]: 'dnslink=/testnamespace/BAXY',
      [`_dnslink.президент.рф.${domain}`]: 'dnslink=/testnamespace/BAZ0',
      [`_dnslink.${DOMAIN_253C}`]: 'dnslink=/testnamespace/BA12',
      '_dnslink.abc': 'dnslink=/testnamespace/BA34',
      '_dnslink.example.0': 'dnslink=/testnamespace/BA56',
      '_dnslink.127.0.0.1': 'dnslink=/testnamespace/BA78',
      '_dnslink.256.0.0.0': 'dnslink=/testnamespace/BA90',
      '_dnslink.192.168.0.9999': 'dnslink=/testnamespace/CAAB',
      '_dnslink.192.168.0': 'dnslink=/testnamespace/CACD',
      '_dnslink.123': 'dnslink=/testnamespace/CAEF',
      '_dnslink.dnslink.dev/abcd?foo=bar': 'dnslink=/testnamespace/CAGH'
    }),
    async run (t, cmd, domain) {
      for (const [subdomain, identifier] of [
        [`xn--froschgrn-x9a.${domain}`, 'AA0A'],
        [`1337.${domain}`, 'BABC'],
        [`abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.${domain}`, 'BADE'],
        [`4b.${domain}`, 'BAFG'],
        [`foo--bar.${domain}`, 'BAHI'],
        [`_.7.${domain}`, 'BAJK'],
        [`*.8.${domain}`, 'BALM'],
        [`s!ome.9.${domain}`, 'BANO'],
        [`domain.com�.${domain}`, 'BAPQ'],
        [`domain.com©.${domain}`, 'BARS'],
        [`日本語.${domain}`, 'BATU'],
        [`b\u00fccher.${domain}`, 'BAVW'],
        [`\uFFFD.${domain}`, 'BAXY'],
        [`президент.рф.${domain}`, 'BAZ0'],
        [DOMAIN_253C, 'BA12'],
        ['abc', 'BA34'],
        ['example.0', 'BA56'],
        ['127.0.0.1', 'BA78'],
        ['256.0.0.0', 'BA90'],
        ['192.168.0.9999', 'CAAB'],
        ['192.168.0', 'CACD'],
        ['123', 'CAEF'],
        ['dnslink.dev/abcd?foo=bar', 'CAGH']
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
