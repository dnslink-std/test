
const domain = process.argv[2]

function getResult (options) {
  switch (domain) {
    case 't01.dnslink.dev':
      /* eslint-disable-next-line no-case-declarations */
      const result = {
        links: {},
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t01.dnslink.dev' },
          { code: 'RESOLVE', domain: 't01.dnslink.dev' }
        ]
      }
      if (typeof options.udp !== 'number') {
        result.error = 'Expected udp port in options'
      }
      if (typeof options.tcp !== 'number') {
        result.error = 'Expected tcp port in options'
      }
      if (typeof options.doh !== 'number') {
        result.error = 'Expected dns-over-http port in options'
      }
      return result
    case 't02.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'ABCD', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t02.dnslink.dev' },
          { code: 'RESOLVE', domain: 't02.dnslink.dev' }
        ]
      }
    case 't03.dnslink.dev':
    case '_dnslink.t03.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'EFGH', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.t03.dnslink.dev' }]
      }
    case 't04.dnslink.dev':
    case '_dnslink.t04.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'IJKL', ttl: 100 }] },
        path: [],
        log: [{
          code: 'RESOLVE', domain: '_dnslink.t04.dnslink.dev'
        }]
      }
    case '_dnslink._dnslink.t04.dnslink.dev':
      return {
        error: { code: 'RECURSIVE_DNSLINK_PREFIX' }
      }
    case 't05.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'MNOP', ttl: 100 }] },
        path: [],
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/ ', reason: 'NO_VALUE' },
          { code: 'RESOLVE', domain: '_dnslink.t05.dnslink.dev' }
        ]
      }
    case 't06.dnslink.dev':
      return {
        links: {
          ipfs: [
            { value: 'QRST', ttl: 100 },
            { value: 'UVWX', ttl: 100 },
            { value: 'Z123', ttl: 100 }
          ]
        },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t06.dnslink.dev' },
          { code: 'RESOLVE', domain: 't06.dnslink.dev' }
        ]
      }
    case 't07.dnslink.dev':
      return {
        links: {
          ipfs: [{ value: '4567', ttl: 100 }],
          ipns: [{ value: '890A', ttl: 100 }],
          hyper: [{ value: 'AABC', ttl: 100 }]
        },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t07.dnslink.dev' },
          { code: 'RESOLVE', domain: 't07.dnslink.dev' }
        ]
      }
    case 't08.dnslink.dev':
      return {
        links: { foo: [{ value: 'bar', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t08.dnslink.dev' },
          // Note: these errors are purposefully shuffled to make sure that the tests are order independent
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'KEY_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/', reason: 'NO_VALUE' },
          { code: 'RESOLVE', domain: 't08.dnslink.dev' }
        ]
      }
    case 't09.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'AADE', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t09.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.b.t09.dnslink.dev' }
        ]
      }
    case 't10.dnslink.dev':
      return {
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
      }
    case 't11.dnslink.dev':
      return {
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
      }
    case 't12.dnslink.dev':
      return {
        links: {},
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'REDIRECT', domain: `_dnslink.1.${domain}` },
          { code: 'RESOLVE', domain: `1.${domain}` },
          { code: 'ENDLESS_REDIRECT', domain: `_dnslink.${domain}` }
        ]
      }
    case 't13.dnslink.eth':
      return {
        links: { ipfs: [{ value: 'AAJK', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: `_dnslink.${domain}` }
        ]
      }
    case 't14.dnslink.dev':
      return {
        links: { ipns: [{ value: 'AALM', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/mnop' },
          { code: 'REDIRECT', domain },
          { code: 'REDIRECT', domain: `_dnslink.1.${domain}` },
          { code: 'RESOLVE', domain: `1.${domain}` }
        ]
      }
    case 't15.dnslink.dev/test-path?foo=bar&foo=baz&goo=ey':
      // eslint-disable-next-line
      const hostname = 't15.dnslink.dev'
      return {
        links: { ipns: [{ value: 'AANO', ttl: 100 }] },
        path: [
          { pathname: '/test-path', search: { foo: ['bar', 'baz'], goo: ['ey'] } }
        ],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${hostname}`, pathname: '/test-path', search: { foo: ['bar', 'baz'], goo: ['ey'] } },
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/mnop' },
          { code: 'REDIRECT', domain: hostname },
          { code: 'REDIRECT', domain: `_dnslink.1.${hostname}` },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/qrst' },
          { code: 'REDIRECT', domain: `1.${hostname}` },
          { code: 'REDIRECT', domain: `_dnslink.2.${hostname}` },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/', reason: 'NO_VALUE' },
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipns/uvwx' },
          { code: 'REDIRECT', domain: `2.${hostname}` },
          { code: 'REDIRECT', domain: `_dnslink.3.${hostname}` },
          { code: 'RESOLVE', domain: `3.${hostname}` }
        ]
      }
    case 't16.dnslink.dev':
      return {
        links: { ipns: [{ value: 'AAPQ', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/dnslink/2.t16.dnslink.dev' },
          { code: 'REDIRECT', domain: '_dnslink.t16.dnslink.dev' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/3 3' },
          { code: 'REDIRECT', domain: '_dnslink.1.t16.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.3.t16.dnslink.dev' }
        ]
      }
    case 't17.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'AARS', ttl: 100 }] },
        path: [],
        log: [
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/.' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/cool.foo..foo/bar' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/./foo' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/abc' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz01.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/127.0.0.1' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/256.0.0.0' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/_.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/*.some.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/s!ome.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink//more.com' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/domain.com�' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/domain.com©' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/example.0' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/192.168.0.9999' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/192.168.0' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/123' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/日本語.jp' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/foo--bar' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/bücher' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/�' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/президент.рф' },
          { code: 'RESOLVE', domain: '_dnslink.t17.dnslink.dev' }
        ]
      }
    case '1.t17.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'AAVW', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/aaab' },
          { code: 'REDIRECT', domain: '_dnslink.1.t17.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.xn--froschgrn-x9a.t17.dnslink.dev' }
        ]
      }
    case '2.t17.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAEF', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/aaij' },
          { code: 'REDIRECT', domain: '_dnslink.2.t17.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.1337.t17.dnslink.dev' }
        ]
      }
    case '3.t17.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAGH', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/aakl' },
          { code: 'REDIRECT', domain: '_dnslink.3.t17.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.t17.dnslink.dev' }
        ]
      }
    case '4.t17.dnslink.dev':
    case '4.t17.dnslink.dev.':
      return {
        links: { ipfs: [{ value: 'BAIJ', ttl: 100 }] },
        path: [],
        log: [
          { code: 'UNUSED_ENTRY', entry: 'dnslink=/ipfs/aamn' },
          { code: 'REDIRECT', domain: '_dnslink.4.t17.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.4b.t17.dnslink.dev' }
        ]
      }
  }
  return {
    error: `unexpected domain ${domain}`
  }
}
let out
try {
  const options = JSON.parse(process.argv[3])
  const result = getResult(options)
  out = JSON.stringify(result)
} catch (error) {
  out = JSON.stringify({ error: error.stack })
}
console.log(out)
