/**
 * The tests in here are rudimentary and perform as example for implementers of this test suite
 * and as a way to make sure that changes in the code don't break functioning test cases.
 *
 * The tests in here are NOT thorough unit or even integration tests that take account of proper
 * output or what would happen if wrong output is provided!
 */
const domain = process.argv[2]
const DOMAIN_254C = /* _dnslink. */'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvwxyz0123456789.' +
  'abcdefghijklmnopqrstuvw'
const DOMAIN_253C = DOMAIN_254C.substr(0, 244)

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
        path: [],
        log: [
          { code: 'REDIRECT', domain: `_dnslink.${domain}` },
          // Note: these errors are purposefully shuffled to make sure that the tests are order independent
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'KEY_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/boo%', reason: 'INVALID_ENCODING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/ホガ', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/フゲ/bar', reason: 'INVALID_CHARACTER' },
          { code: 'RESOLVE', domain }
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
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/3..3', reason: 'EMPTY_PART' },
          { code: 'REDIRECT', domain: '_dnslink.1.t16.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.3.t16.dnslink.dev' }
        ]
      }
    case 't17.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'AARS', ttl: 100 }] },
        path: [],
        log: [
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/.', reason: 'EMPTY_PART' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink//more.com', reason: 'EMPTY_PART' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/foo..', reason: 'EMPTY_PART' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/..foo', reason: 'EMPTY_PART' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/foo..bar', reason: 'EMPTY_PART' },
          { code: 'INVALID_REDIRECT', entry: 'dnslink=/dnslink/abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz01', reason: 'TOO_LONG' },
          { code: 'INVALID_REDIRECT', entry: `dnslink=/dnslink/${DOMAIN_254C}`, reason: 'TOO_LONG' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/dnslink/domain.com�', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/dnslink/domain.com©', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/dnslink/日本語.jp', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/dnslink/b\u00fccher', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/dnslink/\uFFFD', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/dnslink/президент.рф', reason: 'INVALID_CHARACTER' },
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
    case 'formaterror.t18.dnslink.dev':
      return { error: { code: 'RCODE_1' } }
    case 'serverfailure.t18.dnslink.dev':
      return { error: { code: 'RCODE_2' } }
    case 't18.dnslink.dev':
      return { error: { code: 'RCODE_3' } }
    case 'notimplemented.t18.dnslink.dev':
      return { error: { code: 'RCODE_4' } }
    case 'refused.t18.dnslink.dev':
      return { error: { code: 'RCODE_5' } }
    case 'yxdomain.t18.dnslink.dev':
      return { error: { code: 'RCODE_6' } }
    case 'yxrrset.t18.dnslink.dev':
      return { error: { code: 'RCODE_7' } }
    case 'nxrrset.t18.dnslink.dev':
      return { error: { code: 'RCODE_8' } }
    case 'notauth.t18.dnslink.dev':
      return { error: { code: 'RCODE_9' } }
    case 'notzone.t18.dnslink.dev':
      return { error: { code: 'RCODE_10' } }
    case 'dsotypeni.t18.dnslink.dev':
      return { error: { code: 'RCODE_11' } }
    case '1.t19.dnslink.dev':
      return {
        links: { ipfs: [{ ttl: 100, value: 'AAVW' }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.1.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.xn--froschgrn-x9a.t19.dnslink.dev' }
        ]
      }
    case 'xn--froschgrn-x9a.t19.dnslink.dev':
      return {
        links: { ipfs: [{ ttl: 100, value: 'AAVW' }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.xn--froschgrn-x9a.t19.dnslink.dev' }]
      }
    case '2.t19.dnslink.dev':
      return {
        links: { ipfs: [{ ttl: 100, value: 'BAEF' }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.2.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.1337.t19.dnslink.dev' }
        ]
      }
    case '1337.t19.dnslink.dev':
      return {
        links: { ipfs: [{ ttl: 100, value: 'BAEF' }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.1337.t19.dnslink.dev' }]
      }
    case '3.t19.dnslink.dev':
      return {
        links: { ipfs: [{ ttl: 100, value: 'BAGH' }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.3.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.t19.dnslink.dev' }
        ]
      }
    case 'abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.t19.dnslink.dev':
      return {
        links: { ipfs: [{ ttl: 100, value: 'BAGH' }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.t19.dnslink.dev' }]
      }
    case '4.t19.dnslink.dev':
      return {
        links: { ipfs: [{ ttl: 100, value: 'BAIJ' }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.4.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.4b.t19.dnslink.dev' }
        ]
      }
    case '4b.t19.dnslink.dev':
      return {
        links: { ipfs: [{ ttl: 100, value: 'BAIJ' }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.4b.t19.dnslink.dev' }]
      }
    case '6.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAMN', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.6.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.foo--bar.t19.dnslink.dev' }
        ]
      }
    case 'foo--bar.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAMN', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.foo--bar.t19.dnslink.dev' }]
      }
    case '7.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAOP', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.7.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink._.7.t19.dnslink.dev' }
        ]
      }
    case '_.7.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAOP', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink._.7.t19.dnslink.dev' }]
      }
    case '8.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAQR', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.8.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.*.8.t19.dnslink.dev' }
        ]
      }
    case '*.8.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAQR', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.*.8.t19.dnslink.dev' }]
      }
    case '9.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAST', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.9.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.s!ome.9.t19.dnslink.dev' }
        ]
      }
    case 's!ome.9.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAST', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: '_dnslink.s!ome.9.t19.dnslink.dev' }]
      }
    case '10.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAEF', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.10.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.domain.com�.t19.dnslink.dev' }
        ]
      }
    case 'domain.com�.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAEF', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: '_dnslink.domain.com�.t19.dnslink.dev' }]
      }
    case '11.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAGH', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.11.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.domain.com©.t19.dnslink.dev' }
        ]
      }
    case 'domain.com©.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAGH', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: '_dnslink.domain.com©.t19.dnslink.dev' }]
      }
    case '12.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAIJ', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.12.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.日本語.t19.dnslink.dev' }
        ]
      }
    case '日本語.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAIJ', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: '_dnslink.日本語.t19.dnslink.dev' }]
      }
    case '13.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAKL', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.13.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.b\u00fccher.t19.dnslink.dev' }
        ]
      }
    case 'b\u00fccher.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAKL', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: '_dnslink.b\u00fccher.t19.dnslink.dev' }]
      }
    case '14.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAMN', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.14.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.\uFFFD.t19.dnslink.dev' }
        ]
      }
    case '\uFFFD.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAMN', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: '_dnslink.\uFFFD.t19.dnslink.dev' }]
      }
    case '15.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAOP', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.15.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.президент.рф.t19.dnslink.dev' }
        ]
      }
    case 'президент.рф.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAOP', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: '_dnslink.президент.рф.t19.dnslink.dev' }]
      }
    case '16.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAQR', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.16.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: `_dnslink.${DOMAIN_253C}` }
        ]
      }
    case DOMAIN_253C:
      return {
        links: { ipfs: [{ value: 'CAQR', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: `_dnslink.${DOMAIN_253C}` }]
      }
    case '17.t19.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAQR', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.17.t19.dnslink.dev' },
          { code: 'RESOLVE', domain: `_dnslink.${DOMAIN_253C}` }
        ]
      }
    case '1.t20.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAKL', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.1.t20.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.abc' }
        ]
      }
    case 'abc':
      return {
        links: { ipfs: [{ value: 'BAKL', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.abc' }]
      }
    case '2.t20.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAUV', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.2.t20.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.example.0' }
        ]
      }
    case 'example.0':
      return {
        links: { ipfs: [{ value: 'BAUV', ttl: 100 }] },
        path: [],
        log: [
          { code: 'RESOLVE', domain: '_dnslink.example.0' }
        ]
      }
    case '3.t20.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAWX', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.3.t20.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.127.0.0.1' }
        ]
      }
    case '127.0.0.1':
      return {
        links: { ipfs: [{ value: 'BAWX', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.127.0.0.1' }]
      }
    case '4.t20.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'BAYZ', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.4.t20.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.256.0.0.0' }
        ]
      }
    case '256.0.0.0':
      return {
        links: { ipfs: [{ value: 'BAYZ', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.256.0.0.0' }]
      }
    case '5.t20.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAST', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.5.t20.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.192.168.0.9999' }
        ]
      }
    case '192.168.0.9999':
      return {
        links: { ipfs: [{ value: 'CAST', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.192.168.0.9999' }]
      }
    case '6.t20.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAUV', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.6.t20.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.192.168.0' }
        ]
      }
    case '192.168.0':
      return {
        links: { ipfs: [{ value: 'CAUV', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.192.168.0' }]
      }
    case '7.t20.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAWX', ttl: 100 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.7.t20.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.123' }
        ]
      }
    case '123':
      return {
        links: { ipfs: [{ value: 'CAWX', ttl: 100 }] },
        path: [],
        log: [{ code: 'RESOLVE', domain: '_dnslink.123' }]
      }
    case 't21.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CAYZ', ttl: 25 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.t21.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.1.t21.dnslink.dev' }
        ]
      }
    case '2.t21.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CBAB', ttl: 80 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.2.t21.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.3.t21.dnslink.dev' }
        ]
      }
    case '4.t21.dnslink.dev':
      return {
        links: { ipfs: [{ value: 'CBCD', ttl: 35 }] },
        path: [],
        log: [
          { code: 'REDIRECT', domain: '_dnslink.4.t21.dnslink.dev' },
          { code: 'REDIRECT', domain: '_dnslink.5.t21.dnslink.dev' },
          { code: 'RESOLVE', domain: '_dnslink.6.t21.dnslink.dev' }
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
