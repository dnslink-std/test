module.exports = {
  't01: A domain without a dnslink-entry, should return empty.': {
    dns () {},
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), { found: {} })
    }
  },
  't02: A domain without a _dnslink subdomain, containing one valid ipfs link, should return that link.': {
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/ABCD']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), { found: { ipfs: 'ABCD' } })
    }
  },
  't03: A domain with _dnslink subdomain, containing one valid ipfs link, should return that.': {
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/abcd'],
      [`_dnslink.${domain}`]: ['dnslink=/ipfs/EFGH']
    }),
    async run (t, cmd, domain) {
      const result = { found: { ipfs: 'EFGH' } }
      t.dnslink(await cmd(domain), result)
      t.dnslink(await cmd(`_dnslink.${domain}`), result)
    }
  },
  't04: Repeat _dnslink subdomains should cause an error': {
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/efgh'],
      [`_dnslink.${domain}`]: ['dnslink=/ipfs/IJKL'],
      [`_dnslink._dnslink.${domain}`]: ['dnslink=/ipfs/ijkl'],
      [`_dnslink._dnslink._dnslink.${domain}`]: ['dnslink=/ipfs/ijkl']
    }),
    async run (t, cmd, domain) {
      const result = { found: { ipfs: 'IJKL' } }
      t.dnslink(await cmd(domain), result)
      t.dnslink(await cmd(`_dnslink.${domain}`), result)
      t.dnslink(await cmd(`_dnslink._dnslink.${domain}`), {
        found: {},
        errors: [{ code: 'RECURSIVE_DNSLINK_PREFIX', domain: `_dnslink._dnslink.${domain}` }]
      })
    }
  },
  't05: Invalid entries for a key should be ignored, while a valid is returned.': {
    dns: domain => ({
      [`_dnslink.${domain}`]: ['dnslink=/ipfs/', 'dnslink=/ipfs/ ', 'dnslink=/ipfs/MNOP']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        found: { ipfs: 'MNOP' },
        errors: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/ ', reason: 'NO_VALUE' }
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
        found: { ipfs: 'QRST' },
        errors: [
          { code: 'CONFLICT_ENTRY', entry: 'dnslink=/ipfs/Z123' },
          { code: 'CONFLICT_ENTRY', entry: 'dnslink=/ipfs/ UVWX' }
        ]
      })
    }
  },
  't07: Multiple valid entries for different keys should be all returned.': {
    dns: domain => ({
      [domain]: ['dnslink=/ipfs/4567', 'dnslink=/ipns/890A', 'dnslink=/hyper/AABC']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), { found: { ipfs: '4567', ipns: '890A', hyper: 'AABC' } })
    }
  },
  't08: Different invalid entries should cause different error messages.': {
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
        found: {
          foo: 'bar'
        },
        errors: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'KEY_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/', reason: 'NO_VALUE' }
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
        found: { ipfs: 'AADE' }
      })
    }
  },
  't10: 32 redirects are expected to work.': {
    dns: domain => ({
      [`${domain}`]: [`dnslink=/dns/2.${domain}`],
      [`2.${domain}`]: [`dnslink=/dns/_dnslink.3.${domain}`],
      [`3.${domain}`]: [`dnslink=/dns/4.${domain}`],
      [`4.${domain}`]: [`dnslink=/dns/5.${domain}`],
      [`5.${domain}`]: [`dnslink=/dns/6.${domain}`],
      [`6.${domain}`]: [`dnslink=/dns/7.${domain}`],
      [`7.${domain}`]: [`dnslink=/dns/8.${domain}`],
      [`8.${domain}`]: [`dnslink=/dns/9.${domain}`],
      [`9.${domain}`]: [`dnslink=/dns/10.${domain}`],
      [`10.${domain}`]: [`dnslink=/dns/11.${domain}`],
      [`11.${domain}`]: [`dnslink=/dns/12.${domain}`],
      [`12.${domain}`]: [`dnslink=/dns/13.${domain}`],
      [`13.${domain}`]: [`dnslink=/dns/14.${domain}`],
      [`14.${domain}`]: [`dnslink=/dns/15.${domain}`],
      [`15.${domain}`]: [`dnslink=/dns/16.${domain}`],
      [`16.${domain}`]: [`dnslink=/dns/17.${domain}`],
      [`17.${domain}`]: [`dnslink=/dns/18.${domain}`],
      [`18.${domain}`]: [`dnslink=/dns/19.${domain}`],
      [`19.${domain}`]: [`dnslink=/dns/20.${domain}`],
      [`20.${domain}`]: [`dnslink=/dns/21.${domain}`],
      [`21.${domain}`]: [`dnslink=/dns/22.${domain}`],
      [`22.${domain}`]: [`dnslink=/dns/23.${domain}`],
      [`23.${domain}`]: [`dnslink=/dns/24.${domain}`],
      [`24.${domain}`]: [`dnslink=/dns/25.${domain}`],
      [`25.${domain}`]: [`dnslink=/dns/26.${domain}`],
      [`26.${domain}`]: [`dnslink=/dns/27.${domain}`],
      [`27.${domain}`]: [`dnslink=/dns/28.${domain}`],
      [`28.${domain}`]: [`dnslink=/dns/29.${domain}`],
      [`29.${domain}`]: [`dnslink=/dns/30.${domain}`],
      [`30.${domain}`]: [`dnslink=/dns/31.${domain}`],
      [`31.${domain}`]: [`dnslink=/dns/32.${domain}`],
      [`32.${domain}`]: ['dnslink=/ipfs/AAFG']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        found: { ipfs: 'AAFG' }
      })
    }
  },
  't11: 33 redirects should exceed the limit of redirects.': {
    dns: domain => ({
      [`${domain}`]: [`dnslink=/dns/2.${domain}`],
      [`2.${domain}`]: [`dnslink=/dns/_dnslink.3.${domain}`],
      [`3.${domain}`]: [`dnslink=/dns/4.${domain}`],
      [`4.${domain}`]: [`dnslink=/dns/5.${domain}`],
      [`5.${domain}`]: [`dnslink=/dns/6.${domain}`],
      [`6.${domain}`]: [`dnslink=/dns/7.${domain}`],
      [`7.${domain}`]: [`dnslink=/dns/8.${domain}`],
      [`8.${domain}`]: [`dnslink=/dns/9.${domain}`],
      [`9.${domain}`]: [`dnslink=/dns/10.${domain}`],
      [`10.${domain}`]: [`dnslink=/dns/11.${domain}`],
      [`11.${domain}`]: [`dnslink=/dns/12.${domain}`],
      [`12.${domain}`]: [`dnslink=/dns/13.${domain}`],
      [`13.${domain}`]: [`dnslink=/dns/14.${domain}`],
      [`14.${domain}`]: [`dnslink=/dns/15.${domain}`],
      [`15.${domain}`]: [`dnslink=/dns/16.${domain}`],
      [`16.${domain}`]: [`dnslink=/dns/17.${domain}`],
      [`17.${domain}`]: [`dnslink=/dns/18.${domain}`],
      [`18.${domain}`]: [`dnslink=/dns/19.${domain}`],
      [`19.${domain}`]: [`dnslink=/dns/20.${domain}`],
      [`20.${domain}`]: [`dnslink=/dns/21.${domain}`],
      [`21.${domain}`]: [`dnslink=/dns/22.${domain}`],
      [`22.${domain}`]: [`dnslink=/dns/23.${domain}`],
      [`23.${domain}`]: [`dnslink=/dns/24.${domain}`],
      [`24.${domain}`]: [`dnslink=/dns/25.${domain}`],
      [`25.${domain}`]: [`dnslink=/dns/26.${domain}`],
      [`26.${domain}`]: [`dnslink=/dns/27.${domain}`],
      [`27.${domain}`]: [`dnslink=/dns/28.${domain}`],
      [`28.${domain}`]: [`dnslink=/dns/29.${domain}`],
      [`29.${domain}`]: [`dnslink=/dns/30.${domain}`],
      [`30.${domain}`]: [`dnslink=/dns/31.${domain}`],
      [`31.${domain}`]: [`dnslink=/dns/32.${domain}`],
      [`32.${domain}`]: [`dnslink=/dns/33.${domain}`],
      [`33.${domain}`]: ['dnslink=/ipfs/aahi']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        found: {},
        errors: [
          {
            code: 'TOO_MANY_REDIRECTS',
            chain: [
              domain, `2.${domain}`, `3.${domain}`, `4.${domain}`, `5.${domain}`, `6.${domain}`, `7.${domain}`, `8.${domain}`, `9.${domain}`, `10.${domain}`,
              `11.${domain}`, `12.${domain}`, `13.${domain}`, `14.${domain}`, `15.${domain}`, `16.${domain}`, `17.${domain}`, `18.${domain}`, `19.${domain}`, `20.${domain}`,
              `21.${domain}`, `22.${domain}`, `23.${domain}`, `24.${domain}`, `25.${domain}`, `26.${domain}`, `27.${domain}`, `28.${domain}`, `29.${domain}`, `30.${domain}`,
              `31.${domain}`, `32.${domain}`, `33.${domain}`
            ]
          }
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
        found: {},
        errors: [{ code: 'ENDLESS_REDIRECT', chain: [domain, `1.${domain}`, domain] }]
      })
    }
  },
  't13: .eth domain support.': {
    domain: 'dnslink.eth',
    flag: 'eth',
    dns: domain => ({
      [`${domain}.link`]: ['dnslink=/ipfs/AAJK']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), { found: { ipfs: 'AAJK' } })
    }
  },
  't14: redirects take precendent over entries': {
    dns: domain => ({
      [domain]: [`dnslink=/dns/1.${domain}`, 'dnslink=/ipfs/mnop'],
      [`1.${domain}`]: ['dnslink=/ipns/AALM']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        found: { ipns: 'AALM' },
        errors: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/mnop', domain }
        ]
      })
    }
  },
  't15: Errors before redirects get assigned a domain': {
    dns: domain => ({
      [domain]: [`dnslink=/dns/1.${domain}`, 'dnslink=/ipfs/mnop', 'dnslink='],
      [`1.${domain}`]: [`dnslink=/dns/2.${domain}`, 'dnslink=/ipfs/qrst'],
      [`2.${domain}`]: [`dnslink=/dns/3.${domain}`, 'dnslink=/ipfs/', 'dnslink=/ipns/uvwx'],
      [`3.${domain}`]: ['dnslink=/ipns/AANO']
    }),
    async run (t, cmd, domain) {
      t.dnslink(await cmd(domain), {
        found: { ipns: 'AANO' },
        errors: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START', domain },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/mnop', domain },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/qrst', domain: `1.${domain}` },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/', reason: 'NO_VALUE', domain: `2.${domain}` },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipns/uvwx', domain: `2.${domain}` }]
      })
    }
  }
}
