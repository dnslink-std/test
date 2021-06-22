
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
        links: { ipfs: 'ABCD' },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t02.dnslink.dev' },
          { code: 'RESOLVE', domain: 't02.dnslink.dev' }
        ]
      }
    case 't03.dnslink.dev':
    case '_dnslink.t03.dnslink.dev':
      return {
        links: { ipfs: 'EFGH' },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.t03.dnslink.dev' }]
      }
    case 't04.dnslink.dev':
    case '_dnslink.t04.dnslink.dev':
      return {
        links: { ipfs: 'IJKL' },
        path: [],
        log: [{
          code: 'RESOLVE', domain: '_dnslink.t04.dnslink.dev'
        }]
      }
    case '_dnslink._dnslink.t04.dnslink.dev':
      return {
        links: {},
        path: [],
        log: [{ code: 'RECURSIVE_DNSLINK_PREFIX', domain: '_dnslink._dnslink.t04.dnslink.dev' }]
      }
    case 't05.dnslink.dev':
      return {
        links: { ipfs: 'MNOP' },
        path: [],
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/ ', reason: 'NO_VALUE' },
          { code: 'RESOLVE', domain: '_dnslink.t05.dnslink.dev' }
        ]
      }
    case 't06.dnslink.dev':
      return {
        links: { ipfs: 'QRST' },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t06.dnslink.dev' },
          { code: 'CONFLICT_ENTRY', entry: 'dnslink=/ipfs/Z123' },
          { code: 'CONFLICT_ENTRY', entry: 'dnslink=/ipfs/ UVWX' },
          { code: 'RESOLVE', domain: 't06.dnslink.dev' }
        ]
      }
    case 't07.dnslink.dev':
      return {
        links: { ipfs: '4567', ipns: '890A', hyper: 'AABC' },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t07.dnslink.dev' },
          { code: 'RESOLVE', domain: 't07.dnslink.dev' }
        ]
      }
    case 't08.dnslink.dev':
      return {
        links: { foo: 'bar' },
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
        links: { ipfs: 'AADE' },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t09.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.b.t09.dnslink.dev' }
        ]
      }
    case 't10.dnslink.dev':
      return {
        links: { ipfs: 'AAFG' },
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
        links: { ipfs: 'AAJK' },
        path: [],
        log: [
          { code: 'RESOLVE', domain: `_dnslink.${domain}` }
        ]
      }
    case 't14.dnslink.dev':
      return {
        links: { ipns: 'AALM' },
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
        links: { ipns: 'AANO' },
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
