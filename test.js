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
    case '_dnslink.t03.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'EFGH', ttl: 100 }] },
        log: []
      }
    case 't04.dnslink.example.com':
    case '_dnslink.t04.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'IJKL', ttl: 100 }] },
        log: []
      }
    case '_dnslink._dnslink.t04.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'MNOP', ttl: 100 }] },
        log: []
      }
    case '_dnslink._dnslink._dnslink.t04.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'QRST', ttl: 100 }] },
        log: []
      }
    case '_dnslink._dnslink._dnslink._dnslink.t04.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'QRST', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      }
    case 't05.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'MNOP', ttl: 100 }] },
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace/', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testnamespace/ ', reason: 'NO_IDENTIFIER' }
        ]
      }
    case 't06.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'QRST', ttl: 100 }, { identifier: 'UVWX', ttl: 100 }, { identifier: 'Z123', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      }
    case 't07.dnslink.example.com':
      return {
        links: {
          testnamespace: [{ identifier: '4567', ttl: 100 }],
          ns_3: [{ identifier: '890A', ttl: 100 }],
          ns_2: [{ identifier: 'AABC', ttl: 100 }]
        },
        log: [{ code: 'FALLBACK' }]
      }
    case 't08.dnslink.example.com':
      return {
        links: {
          foo: [
            { identifier: 'bar', ttl: 100 },
            { identifier: 'bar', ttl: 100 },
            { identifier: 'bar/ baz/ ?qoo=zap', ttl: 100 },
            { identifier: 'bar/baz', ttl: 100 },
            { identifier: 'bar/baz?qoo=zap', ttl: 100 }
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
          // Note: these errors are purposefully shuffled to make sure that the tests are order independent
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'NAMESPACE_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/boo%', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo', reason: 'NO_IDENTIFIER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/ホガ', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/フゲ/bar', reason: 'INVALID_CHARACTER' }
        ]
      }
    case 't09.dnslink.example.com':
      return {
        links: { dnslink: [{ identifier: 'b.t09.dnslink.example.com', ttl: 100 }] },
        log: []
      }
    case 'formaterror.t18.dnslink.example.com':
      return { error: { code: 'RCODE_1' } }
    case 'serverfailure.t18.dnslink.example.com':
      return { error: { code: 'RCODE_2' } }
    case 't18.dnslink.example.com':
      return { error: { code: 'RCODE_3' } }
    case 'notimplemented.t18.dnslink.example.com':
      return { error: { code: 'RCODE_4' } }
    case 'refused.t18.dnslink.example.com':
      return { error: { code: 'RCODE_5' } }
    case 'yxdomain.t18.dnslink.example.com':
      return { error: { code: 'RCODE_6' } }
    case 'yxrrset.t18.dnslink.example.com':
      return { error: { code: 'RCODE_7' } }
    case 'nxrrset.t18.dnslink.example.com':
      return { error: { code: 'RCODE_8' } }
    case 'notauth.t18.dnslink.example.com':
      return { error: { code: 'RCODE_9' } }
    case 'notzone.t18.dnslink.example.com':
      return { error: { code: 'RCODE_10' } }
    case 'dsotypeni.t18.dnslink.example.com':
      return { error: { code: 'RCODE_11' } }
    case '1.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ ttl: 100, identifier: 'AAVW' }] },
        log: []
      }
    case 'xn--froschgrn-x9a.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ ttl: 100, identifier: 'AAVW' }] },
        log: []
      }
    case '2.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ ttl: 100, identifier: 'BAEF' }] },
        log: []
      }
    case '1337.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ ttl: 100, identifier: 'BAEF' }] },
        log: []
      }
    case '3.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ ttl: 100, identifier: 'BAGH' }] },
        log: []
      }
    case 'abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ ttl: 100, identifier: 'BAGH' }] },
        log: []
      }
    case '4.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ ttl: 100, identifier: 'BAIJ' }] },
        log: []
      }
    case '4b.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ ttl: 100, identifier: 'BAIJ' }] },
        log: []
      }
    case '6.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'BAMN', ttl: 100 }] },
        log: []
      }
    case 'foo--bar.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'BAMN', ttl: 100 }] },
        log: []
      }
    case '7.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'BAOP', ttl: 100 }] },
        log: []
      }
    case '_.7.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'BAOP', ttl: 100 }] },
        log: []
      }
    case '8.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'BAQR', ttl: 100 }] },
        log: []
      }
    case '*.8.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'BAQR', ttl: 100 }] },
        log: []
      }
    case '9.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'BAST', ttl: 100 }] },
        log: []
      }
    case 's!ome.9.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'BAST', ttl: 100 }] },
        log: []
      }
    case '10.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAEF', ttl: 100 }] },
        log: []
      }
    case 'domain.com�.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAEF', ttl: 100 }] },
        log: []
      }
    case '11.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAGH', ttl: 100 }] },
        log: []
      }
    case 'domain.com©.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAGH', ttl: 100 }] },
        log: []
      }
    case '12.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAIJ', ttl: 100 }] },
        log: []
      }
    case '日本語.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAIJ', ttl: 100 }] },
        log: []
      }
    case '13.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAKL', ttl: 100 }] },
        log: []
      }
    case 'b\u00fccher.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAKL', ttl: 100 }] },
        log: []
      }
    case '14.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAMN', ttl: 100 }] },
        log: []
      }
    case '\uFFFD.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAMN', ttl: 100 }] },
        log: []
      }
    case '15.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAOP', ttl: 100 }] },
        log: []
      }
    case 'президент.рф.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAOP', ttl: 100 }] },
        log: []
      }
    case '16.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAQR', ttl: 100 }] },
        log: []
      }
    case DOMAIN_253C:
      return {
        links: { testnamespace: [{ identifier: 'CAQR', ttl: 100 }] },
        log: []
      }
    case '17.t19.dnslink.example.com':
      return {
        links: { testnamespace: [{ identifier: 'CAQR', ttl: 100 }] },
        log: []
      }
    case 'abc':
      return {
        links: { testnamespace: [{ identifier: 'BAKL', ttl: 100 }] },
        log: []
      }
    case 'example.0':
      return {
        links: { testnamespace: [{ identifier: 'BAUV', ttl: 100 }] },
        log: []
      }
    case '127.0.0.1':
      return {
        links: { testnamespace: [{ identifier: 'BAWX', ttl: 100 }] },
        log: []
      }
    case '256.0.0.0':
      return {
        links: { testnamespace: [{ identifier: 'BAYZ', ttl: 100 }] },
        log: []
      }
    case '192.168.0.9999':
      return {
        links: { testnamespace: [{ identifier: 'CAST', ttl: 100 }] },
        log: []
      }
    case '192.168.0':
      return {
        links: { testnamespace: [{ identifier: 'CAUV', ttl: 100 }] },
        log: []
      }
    case '123':
      return {
        links: { testnamespace: [{ identifier: 'CAWX', ttl: 100 }] },
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
