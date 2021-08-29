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
    case 't01.dnslink.example.com':
      /* eslint-disable-next-line no-case-declarations */
      const result = {
        links: {},
        log: [
          { code: 'FALLBACK' }
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
    case 't02.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'ABCD', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      }
    case 't03.dnslink.example.com':
      return {
        links: {},
        log: []
      }
    case 't04.dnslink.example.com':
    case '_dnslink.t04.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'EFGH', ttl: 100 }] },
        log: []
      }
    case '_dnslink.t05.dnslink.example.com':
    case 't05.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'IJKL', ttl: 100 }] },
        log: []
      }
    case '_dnslink._dnslink.t05.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'MNOP', ttl: 100 }] },
        log: []
      }
    case '_dnslink._dnslink._dnslink.t05.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'QRST', ttl: 100 }] },
        log: []
      }
    case '_dnslink._dnslink._dnslink._dnslink.t05.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'QRST', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      }
    case 't06.dnslink.example.com':
      return {
        links: {},
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink= /testnamespace/ ijkl', reason: 'WRONG_START' }
        ]
      }
    case 't07.dnslink.example.com':
      return {
        links: {
          ' !"#$%&\'()*+,-.0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~': [{ identifier: 'QRST', ttl: 100 }]
        },
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/YZ12/ホガ', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/フゲ/UVWX', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/\x7F', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/\x19', reason: 'INVALID_CHARACTER' }
        ]
      }
    case 't08.dnslink.example.com':
      return {
        links: {},
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'NAMESPACE_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=//mnop', reason: 'NAMESPACE_MISSING' }
        ]
      }
    case 't09.dnslink.example.com':
      return {
        links: {},
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace/', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace%', reason: 'NO_IDENTIFIER' }
        ]
      }
    case 't10.dnslink.example.com':
      return {
        links: {},
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink= //\x19', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=//\x19', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=//', reason: 'NAMESPACE_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace/', reason: 'NO_IDENTIFIER' }
        ]
      }
    case 't11.dnslink.example.com':
      return {
        links: {
          testnamespace: [
            { identifier: ' UVWX', ttl: 100 },
            { identifier: 'QRST', ttl: 100 },
            { identifier: 'Z123 ', ttl: 100 },
            { identifier: 'lowercase', ttl: 100 }
          ]
        },
        log: [
          { code: 'FALLBACK' }
        ]
      }
    case 't12.dnslink.example.com':
      return {
        links: {
          ns_1: [
            { identifier: '4567', ttl: 100 },
            { identifier: '890A', ttl: 100 }
          ],
          ns_3: [
            { identifier: 'AABC', ttl: 100 }
          ],
          ns_2: [
            { identifier: 'AADE', ttl: 100 }
          ]
        },
        log: [{ code: 'FALLBACK' }]
      }
    case 't13.dnslink.example.com':
      return {
        links: {
          ' ': [{ identifier: 'AAFG', ttl: 100 }],
          ' testnamespace': [{ identifier: 'AAJK/LM', ttl: 100 }],
          '%E3%81%B5%E3%81%92': [{ identifier: 'AA45', ttl: 100 }],
          'testnamespace ': [{ identifier: ' AAHI ', ttl: 100 }],
          'testnamespace%': [{ identifier: 'AA67%', ttl: 100 }],
          dnslink: [{ identifier: 'AA89', ttl: 100 }],
          testnamespace: [
            { identifier: ' ', ttl: 100 },
            { identifier: '%E3%83%9B%E3%82%AC', ttl: 100 },
            { identifier: 'AANO/PQ?RS=TU', ttl: 100 },
            { identifier: 'AAVW/ XY/ ?Z1=23 ', ttl: 100 }
          ]
        },
        log: [{ code: 'FALLBACK' }]
      }
    case 'formaterror.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_1' } }
    case 'serverfailure.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_2' } }
    case 't14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_3' } }
    case 'notimplemented.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_4' } }
    case 'refused.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_5' } }
    case 'yxdomain.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_6' } }
    case 'yxrrset.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_7' } }
    case 'nxrrset.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_8' } }
    case 'notauth.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_9' } }
    case 'notzone.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_10' } }
    case 'dsotypeni.t14.dnslink.example.com':
      return { error: { code: 'DNS_RCODE_11' } }
    case 'xn--froschgrn-x9a.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'AA0A', ttl: 100 }] }, log: [] }
    case '1337.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BABC', ttl: 100 }] }, log: [] }
    case 'abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BADE', ttl: 100 }] }, log: [] }
    case '4b.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BAFG', ttl: 100 }] }, log: [] }
    case 'foo--bar.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BAHI', ttl: 100 }] }, log: [] }
    case '_.7.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BAJK', ttl: 100 }] }, log: [] }
    case '*.8.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BALM', ttl: 100 }] }, log: [] }
    case 's!ome.9.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BANO', ttl: 100 }] }, log: [] }
    case 'domain.com�.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BAPQ', ttl: 100 }] }, log: [] }
    case 'domain.com©.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BARS', ttl: 100 }] }, log: [] }
    case '日本語.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BATU', ttl: 100 }] }, log: [] }
    case 'b\u00fccher.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BAVW', ttl: 100 }] }, log: [] }
    case '\uFFFD.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BAXY', ttl: 100 }] }, log: [] }
    case 'президент.рф.t15.dnslink.example.com':
      return { links: { testnamespace: [{ identifier: 'BAZ0', ttl: 100 }] }, log: [] }
    case DOMAIN_253C:
      return {
        links: { testnamespace: [{ identifier: 'BA12', ttl: 100 }] },
        log: []
      }
    case 'abc':
      return {
        links: { testnamespace: [{ identifier: 'BA34', ttl: 100 }] },
        log: []
      }
    case 'example.0':
      return {
        links: { testnamespace: [{ identifier: 'BA56', ttl: 100 }] },
        log: []
      }
    case '127.0.0.1':
      return {
        links: { testnamespace: [{ identifier: 'BA78', ttl: 100 }] },
        log: []
      }
    case '256.0.0.0':
      return {
        links: { testnamespace: [{ identifier: 'BA90', ttl: 100 }] },
        log: []
      }
    case '192.168.0.9999':
      return {
        links: { testnamespace: [{ identifier: 'CAAB', ttl: 100 }] },
        log: []
      }
    case '192.168.0':
      return {
        links: { testnamespace: [{ identifier: 'CACD', ttl: 100 }] },
        log: []
      }
    case '123':
      return {
        links: { testnamespace: [{ identifier: 'CAEF', ttl: 100 }] },
        log: []
      }
    case 'dnslink.dev/abcd?foo=bar':
      return {
        links: { testnamespace: [{ identifier: 'CAGH', ttl: 100 }] },
        log: []
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
