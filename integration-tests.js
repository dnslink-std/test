module.exports = {
  't01: A domain without a dnslink-entry, should return empty.': {
    dns: domain => ({
      [domain]: ['txtentry=now']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {},
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'RESOLVE', domain }
        ]
      })
    }
  },
  't02: A domain without a _dnslink subdomain, containing one valid ipfs link, should return that link.': {
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/ABCD']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { ipfs: [{ value: 'ABCD', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'RESOLVE', domain }
        ]
      })
    }
  },
  't03: A domain with _dnslink subdomain, containing one valid ipfs link, should return that.': {
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/abcd'],
      [`_dnslink.${domain}`]: ['dnslink=/ipfs/EFGH']
    }),
    async run (t, cmd, domain) {
      const result = {
        links: { ipfs: [{ value: 'EFGH', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: `_dnslink.${domain}` }]
      }
      t.dnslink(await cmd(domain), result)
      t.dnslink(await cmd(`_dnslink.${domain}`), result)
    }
  },
  't04: Repeat _dnslink subdomains should cause a log entry': {
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/efgh'],
      [`_dnslink.${domain}`]: ['dnslink=/ipfs/IJKL'],
      [`_dnslink._dnslink.${domain}`]: ['dnslink=/ipfs/ijkl'],
      [`_dnslink._dnslink._dnslink.${domain}`]: ['dnslink=/ipfs/mnop']
    }),
    async run (t, cmd, domain) {
      const result = {
        links: { ipfs: [{ value: 'IJKL', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: `_dnslink.${domain}` }]
      }
      t.dnslink(await cmd(domain), result)
      t.dnslink(await cmd(`_dnslink.${domain}`), result)
      t.dnslink(await cmd(`_dnslink._dnslink.${domain}`), {
        error: {
          code: 'RECURSIVE_DNSLINK_PREFIX'
        }
      })
    }
  },
  't05: Invalid entries for a key should be ignored, while a valid is returned.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: ['dnslink=/ipfs/', 'dnslink=/ipfs/ ', 'dnslink=/ipfs/MNOP']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { ipfs: [{ value: 'MNOP', ttl: 100 }] },
        path: [],
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/ ', reason: 'NO_VALUE' },
          { code: 'RESOLVE', domain: `_dnslink.${domain}` }
        ]
      })
    }
  },
  't06: Of multiple valid entries for the same key should use the alphabetically smallest (trimmed!)': {
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/Z123', 'dnslink=/ipfs/QRST', 'dnslink=/ipfs/ UVWX']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {
          ipfs: [
            { value: 'QRST', ttl: 100 },
            { value: 'UVWX', ttl: 100 },
            { value: 'Z123', ttl: 100 }
          ]
        },
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'RESOLVE', domain }
        ]
      })
    }
  },
  't07: Multiple valid entries for different keys should be all returned.': {
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/4567', 'dnslink=/ipns/890A', 'dnslink=/hyper/AABC']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {
          ipfs: [{ value: '4567', ttl: 100 }],
          ipns: [{ value: '890A', ttl: 100 }],
          hyper: [{ value: 'AABC', ttl: 100 }]
        },
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'RESOLVE', domain }
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
        'dnslink=/foo/bar'
      ]
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {
          foo: [{ value: 'bar', ttl: 100 }]
        },
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'KEY_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/', reason: 'NO_VALUE' },
          { code: 'RESOLVE', domain }
        ]
      })
    }
  },
  't09: Simple /dns/ prefixed redirect.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [`dnslink=/dns/b.${domain}`],
      [`_dnslink.b.${domain}`]: ['dnslink=/ipfs/AADE']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { ipfs: [{ value: 'AADE', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'RESOLVE', domain: `_dnslink.b.${domain}` }
        ]
      })
    }
  },
  't10: 32 redirects are expected to work.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [`dnslink=/dns/2.${domain}/last-path?foo=bar&foo=bak`],
      [`_dnslink.2.${domain}`]: [`dnslink=/dns/_dnslink.3.${domain}`],
      [`_dnslink.3.${domain}`]: [`dnslink=/dns/4.${domain}`],
      [`_dnslink.4.${domain}`]: [`dnslink=/dns/5.${domain}`],
      [`_dnslink.5.${domain}`]: [`dnslink=/dns/6.${domain}`],
      [`_dnslink.6.${domain}`]: [`dnslink=/dns/7.${domain}`],
      [`_dnslink.7.${domain}`]: [`dnslink=/dns/8.${domain}`],
      [`_dnslink.8.${domain}`]: [`dnslink=/dns/9.${domain}`],
      [`_dnslink.9.${domain}`]: [`dnslink=/dns/10.${domain}`],
      [`_dnslink.10.${domain}`]: [`dnslink=/dns/11.${domain}`],
      [`_dnslink.11.${domain}`]: [`dnslink=/dns/12.${domain}`],
      [`_dnslink.12.${domain}`]: [`dnslink=/dns/13.${domain}`],
      [`_dnslink.13.${domain}`]: [`dnslink=/dns/14.${domain}`],
      [`_dnslink.14.${domain}`]: [`dnslink=/dns/15.${domain}`],
      [`_dnslink.15.${domain}`]: [`dnslink=/dns/16.${domain}`],
      [`_dnslink.16.${domain}`]: [`dnslink=/dns/17.${domain}`],
      [`_dnslink.17.${domain}`]: [`dnslink=/dns/18.${domain}/inbetween-path/moo-x abcd-foo?foo=baz`],
      [`_dnslink.18.${domain}`]: [`dnslink=/dns/19.${domain}`],
      [`_dnslink.19.${domain}`]: [`dnslink=/dns/20.${domain}`],
      [`_dnslink.20.${domain}`]: [`dnslink=/dns/21.${domain}`],
      [`_dnslink.21.${domain}`]: [`dnslink=/dns/22.${domain}`],
      [`_dnslink.22.${domain}`]: [`dnslink=/dns/23.${domain}`],
      [`_dnslink.23.${domain}`]: [`dnslink=/dns/24.${domain}`],
      [`_dnslink.24.${domain}`]: [`dnslink=/dns/25.${domain}`],
      [`_dnslink.25.${domain}`]: [`dnslink=/dns/26.${domain}`],
      [`_dnslink.26.${domain}`]: [`dnslink=/dns/27.${domain}`],
      [`_dnslink.27.${domain}`]: [`dnslink=/dns/28.${domain}`],
      [`_dnslink.28.${domain}`]: [`dnslink=/dns/29.${domain}`],
      [`_dnslink.29.${domain}`]: [`dnslink=/dns/30.${domain}`],
      [`_dnslink.30.${domain}`]: [`dnslink=/dns/31.${domain}`],
      [`_dnslink.31.${domain}`]: [`dnslink=/dns/32.${domain}/first-path ? goo=dom &# ha `],
      [`_dnslink.32.${domain}`]: ['dnslink=/ipfs/AAFG']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { ipfs: [{ value: 'AAFG', ttl: 100 }] },
        path: [
          { pathname: '/first-path%20', search: { ' goo': ['dom '] } },
          { pathname: '/inbetween-path/moo-x%20abcd-foo', search: { foo: ['baz'] } },
          { pathname: '/last-path', search: { foo: ['bar', 'bak'] } }
        ],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.2.${domain}`, pathname: '/last-path', search: { foo: ['bar', 'bak'] } },
          { code: 'REDIRECT', domain: `_dnslink.3.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.4.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.5.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.6.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.7.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.8.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.9.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.10.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.11.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.12.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.13.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.14.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.15.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.16.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.17.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.18.${domain}`, pathname: '/inbetween-path/moo-x%20abcd-foo', search: { foo: ['baz'] } },
          { code: 'REDIRECT', domain: `_dnslink.19.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.20.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.21.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.22.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.23.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.24.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.25.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.26.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.27.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.28.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.29.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.30.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.31.${domain}` },
          { code: 'RESOLVE', domain: `_dnslink.32.${domain}`, pathname: '/first-path%20', search: { ' goo': ['dom '] } }
        ]
      })
    }
  },
  't11: 33 redirects should exceed the limit of redirects.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [`dnslink=/dns/2.${domain}`],
      [`_dnslink.2.${domain}`]: [`dnslink=/dns/_dnslink.3.${domain}`],
      [`_dnslink.3.${domain}`]: [`dnslink=/dns/4.${domain}`],
      [`_dnslink.4.${domain}`]: [`dnslink=/dns/5.${domain}`],
      [`_dnslink.5.${domain}`]: [`dnslink=/dns/6.${domain}`],
      [`_dnslink.6.${domain}`]: [`dnslink=/dns/7.${domain}`],
      [`_dnslink.7.${domain}`]: [`dnslink=/dns/8.${domain}`],
      [`_dnslink.8.${domain}`]: [`dnslink=/dns/9.${domain}`],
      [`_dnslink.9.${domain}`]: [`dnslink=/dns/10.${domain}`],
      [`_dnslink.10.${domain}`]: [`dnslink=/dns/11.${domain}`],
      [`_dnslink.11.${domain}`]: [`dnslink=/dns/12.${domain}`],
      [`_dnslink.12.${domain}`]: [`dnslink=/dns/13.${domain}`],
      [`_dnslink.13.${domain}`]: [`dnslink=/dns/14.${domain}`],
      [`_dnslink.14.${domain}`]: [`dnslink=/dns/15.${domain}`],
      [`_dnslink.15.${domain}`]: [`dnslink=/dns/16.${domain}`],
      [`_dnslink.16.${domain}`]: [`dnslink=/dns/17.${domain}`],
      [`_dnslink.17.${domain}`]: [`dnslink=/dns/18.${domain}`],
      [`_dnslink.18.${domain}`]: [`dnslink=/dns/19.${domain}`],
      [`_dnslink.19.${domain}`]: [`dnslink=/dns/20.${domain}`],
      [`_dnslink.20.${domain}`]: [`dnslink=/dns/21.${domain}`],
      [`_dnslink.21.${domain}`]: [`dnslink=/dns/22.${domain}`],
      [`_dnslink.22.${domain}`]: [`dnslink=/dns/23.${domain}`],
      [`_dnslink.23.${domain}`]: [`dnslink=/dns/24.${domain}`],
      [`_dnslink.24.${domain}`]: [`dnslink=/dns/25.${domain}`],
      [`_dnslink.25.${domain}`]: [`dnslink=/dns/26.${domain}`],
      [`_dnslink.26.${domain}`]: [`dnslink=/dns/27.${domain}`],
      [`_dnslink.27.${domain}`]: [`dnslink=/dns/28.${domain}`],
      [`_dnslink.28.${domain}`]: [`dnslink=/dns/29.${domain}`],
      [`_dnslink.29.${domain}`]: [`dnslink=/dns/30.${domain}`],
      [`_dnslink.30.${domain}`]: [`dnslink=/dns/31.${domain}`],
      [`_dnslink.31.${domain}`]: [`dnslink=/dns/32.${domain}`],
      [`_dnslink.32.${domain}`]: [`dnslink=/dns/33.${domain}/ abcd`],
      [`_dnslink.33.${domain}`]: ['dnslink=/ipfs/aahi']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {},
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.2.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.3.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.4.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.5.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.6.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.7.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.8.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.9.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.10.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.11.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.12.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.13.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.14.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.15.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.16.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.17.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.18.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.19.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.20.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.21.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.22.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.23.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.24.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.25.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.26.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.27.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.28.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.29.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.30.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.31.${domain}` },
          { code: 'RESOLVE', domain: `_dnslink.32.${domain}` },
          { code: 'TOO_MANY_REDIRECTS', domain: '_dnslink.33.t11.dnslink.dev', pathname: '/%20abcd' }
        ]
      })
    }
  },
  't12: Recursive redirects are detected.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [`dnslink=/dns/1.${domain}`],
      [`1.${domain}`]: [`dnslink=/dns/${domain}`]
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: {},
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.1.${domain}` },
          { code: 'RESOLVE', domain: `1.${domain}` },
          { code: 'ENDLESS_REDIRECT', domain: `_dnslink.${domain}` }
        ]
      })
    }
  },
  't13: .eth domain support.': {
    domain: 'dnslink.eth',
    flag: 'eth',
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/AAJK'],
      [`${domain}.link`]: ['dnslink=/ipfs/AAJK']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { ipfs: [{ value: 'AAJK', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: `_dnslink.${domain}` }
        ]
      })
    }
  },
  't14: redirects take precendent over entries': {
    dns: domain => ({
      [domain]: [`dnslink=/dns/1.${domain}`, 'dnslink=/ipfs/mnop'],
      [`1.${domain}`]: ['dnslink=/ipns/AALM']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { ipns: [{ value: 'AALM', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/mnop' },
          { code: 'REDIRECT', domain },
          { code: 'REDIRECT', domain: `_dnslink.1.${domain}` },
          { code: 'RESOLVE', domain: `1.${domain}` }
        ]
      })
    }
  },
  't15: log order is maintained in redirects domain': {
    dns: domain => ({
      [domain]: [`dnslink=/dns/1.${domain}`, 'dnslink=/ipfs/mnop', 'dnslink='],
      [`1.${domain}`]: [`dnslink=/dns/2.${domain}`, 'dnslink=/ipfs/qrst'],
      [`2.${domain}`]: [`dnslink=/dns/3.${domain}`, 'dnslink=/ipfs/', 'dnslink=/ipns/uvwx'],
      [`3.${domain}`]: ['dnslink=/ipns/AANO']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(`${domain}/test-path?foo=bar&foo=baz&goo=ey`), {
        links: { ipns: [{ value: 'AANO', ttl: 100 }] },
        path: [{ pathname: '/test-path', search: { foo: ['bar', 'baz'], goo: ['ey'] } }],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}`, pathname: '/test-path', search: { foo: ['bar', 'baz'], goo: ['ey'] } },
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/mnop' },
          { code: 'REDIRECT', domain },
          { code: 'REDIRECT', domain: `_dnslink.1.${domain}` },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/qrst' },
          { code: 'REDIRECT', domain: `1.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.2.${domain}` },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/', reason: 'NO_VALUE' },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipns/uvwx' },
          { code: 'REDIRECT', domain: `2.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.3.${domain}` },
          { code: 'RESOLVE', domain: `3.${domain}` }
        ]
      })
    }
  },
  't16: invalid and ignored redirects': {
    dns: domain => ({
      [`_dnslink.${domain}`]: [`dnslink=/dns/1.${domain}`, `dnslink=/dns/2.${domain}`],
      [`_dnslink.1.${domain}`]: ['dnslink=/dns/3 3', `dnslink=/dns/3.${domain}`],
      [`_dnslink.3.${domain}`]: ['dnslink=/ipns/AAPQ']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(`${domain}`), {
        links: { ipns: [{ value: 'AAPQ', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: `dnslink=/dns/2.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/3 3' },
          { code: 'REDIRECT', domain: `_dnslink.1.${domain}` },
          { code: 'RESOLVE', domain: `_dnslink.3.${domain}` }
        ]
      })
    }
  },
  't17: fqdn edge case matching': {
    dns: domain => ({
      // Tests sourced via:
      // Validator: https://github.com/validatorjs/validator.js/blob/907bb07b8d6be7d159791645960eb5f5017a99b6/test/validators.js#L1009-L1031
      // isFQDN: https://github.com/parro-it/is-fqdn/blob/22cfb52d6c256f2862bb8ac5960a823410b93634/test.mjs#L22-L41
      // Apache Commons Validator: https://gitbox.apache.org/repos/asf?p=commons-validator.git;a=blob;f=src/test/java/org/apache/commons/validator/routines/UrlValidatorTest.java;h=557945680a6fc2e86ac1bf19ae8193aac65e90f1;hb=HEAD
      [`_dnslink.${domain}`]: [
        // ↓ Invalid redirects
        'dnslink=/dns/.',
        'dnslink=/dns/cool.foo..foo/bar',
        'dnslink=/dns/./foo',
        'dnslink=/dns/abc',
        'dnslink=/dns/abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz01.com',
        'dnslink=/dns/_.com',
        'dnslink=/dns/*.some.com',
        'dnslink=/dns/s!ome.com',
        'dnslink=/dns//more.com',
        'dnslink=/dns/domain.com�',
        'dnslink=/dns/domain.com©',
        'dnslink=/dns/example.0',
        'dnslink=/dns/127.0.0.1',
        'dnslink=/dns/256.0.0.0',
        'dnslink=/dns/192.168.0.9999',
        'dnslink=/dns/192.168.0',
        'dnslink=/dns/123',
        'dnslink=/dns/日本語.jp',
        'dnslink=/dns/foo--bar',
        'dnslink=/dns/b\u00fccher',
        'dnslink=/dns/\uFFFD',
        'dnslink=/dns/президент.рф',
        'dnslink=/ipfs/AARS'
      ],
      [`_dnslink.1.${domain}`]: [
        `dnslink=/dns/xn--froschgrn-x9a.${domain}`,
        'dnslink=/ipfs/aaab'
      ],
      [`_dnslink.xn--froschgrn-x9a.${domain}`]: [
        'dnslink=/ipfs/AAVW'
      ],
      [`_dnslink.2.${domain}`]: [
        `dnslink=/dns/1337.${domain}`,
        'dnslink=/ipfs/aaij'
      ],
      [`_dnslink.1337.${domain}`]: [
        'dnslink=/ipfs/BAEF'
      ],
      [`_dnslink.3.${domain}`]: [
        `dnslink=/dns/abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.${domain}`,
        'dnslink=/ipfs/aakl'
      ],
      [`_dnslink.abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.${domain}`]: [
        'dnslink=/ipfs/BAGH'
      ],
      [`_dnslink.4.${domain}`]: [
        `dnslink=/dns/4b.${domain}.`,
        'dnslink=/ipfs/aamn'
      ],
      [`_dnslink.4b.${domain}`]: [
        'dnslink=/ipfs/BAIJ'
      ]
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        links: { ipfs: [{ value: 'AARS', ttl: 100 }] },
        path: [],
        log: [
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/.' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/cool.foo..foo/bar' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/./foo' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/abc' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz01.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/127.0.0.1' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/256.0.0.0' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/_.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/*.some.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/s!ome.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns//more.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/domain.com�' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/domain.com©' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/example.0' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/192.168.0.9999' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/192.168.0' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/123' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/日本語.jp' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/foo--bar' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/b\u00fccher' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/\uFFFD' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dns/президент.рф' },
          { code: 'RESOLVE', domain: `_dnslink.${domain}` }
        ]
      })
      t.dnslink(await cmd(`1.${domain}`), {
        links: { ipfs: [{ value: 'AAVW', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/aaab' },
          { code: 'REDIRECT', domain: `_dnslink.1.${domain}` },
          { code: 'RESOLVE', domain: `_dnslink.xn--froschgrn-x9a.${domain}` }
        ]
      })
      t.dnslink(await cmd(`2.${domain}`), {
        links: { ipfs: [{ value: 'BAEF', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/aaij' },
          { code: 'REDIRECT', domain: `_dnslink.2.${domain}` },
          { code: 'RESOLVE', domain: `_dnslink.1337.${domain}` }
        ]
      })
      t.dnslink(await cmd(`3.${domain}`), {
        links: { ipfs: [{ value: 'BAGH', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/aakl' },
          { code: 'REDIRECT', domain: `_dnslink.3.${domain}` },
          { code: 'RESOLVE', domain: `_dnslink.abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.${domain}` }
        ]
      })
      t.dnslink(await cmd(`4.${domain}`), {
        links: { ipfs: [{ value: 'BAIJ', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/aamn' },
          { code: 'REDIRECT', domain: `_dnslink.4.${domain}` },
          { code: 'RESOLVE', domain: `_dnslink.4b.${domain}` }
        ]
      })
      t.dnslink(await cmd(`4.${domain}.`), {
        links: { ipfs: [{ value: 'BAIJ', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/aamn' },
          { code: 'REDIRECT', domain: `_dnslink.4.${domain}` },
          { code: 'RESOLVE', domain: `_dnslink.4b.${domain}` }
        ]
      })
    }
  }
}
