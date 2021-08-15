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
    case 't02.dnslink.dev':
      return {
        links: { testkey: [{ value: 'ABCD', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      }
    case 't03.dnslink.dev':
    case '_dnslink.t03.dnslink.dev':
      return {
        links: { testkey: [{ value: 'EFGH', ttl: 100 }] },
        log: []
      }
    case 't04.dnslink.dev':
    case '_dnslink.t04.dnslink.dev':
      return {
        links: { testkey: [{ value: 'IJKL', ttl: 100 }] },
        log: []
      }
    case '_dnslink._dnslink.t04.dnslink.dev':
      return {
        links: { testkey: [{ value: 'MNOP', ttl: 100 }] },
        log: []
      }
    case '_dnslink._dnslink._dnslink.t04.dnslink.dev':
      return {
        links: { testkey: [{ value: 'QRST', ttl: 100 }] },
        log: []
      }
    case '_dnslink._dnslink._dnslink._dnslink.t04.dnslink.dev':
      return {
        links: { testkey: [{ value: 'QRST', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      }
    case 't05.dnslink.dev':
      return {
        links: { testkey: [{ value: 'MNOP', ttl: 100 }] },
        log: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testkey/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/testkey/ ', reason: 'NO_VALUE' }
        ]
      }
    case 't06.dnslink.dev':
      return {
        links: { testkey: [{ value: 'QRST', ttl: 100 }, { value: 'UVWX', ttl: 100 }, { value: 'Z123', ttl: 100 }] },
        log: [{ code: 'FALLBACK' }]
      }
    case 't07.dnslink.dev':
      return {
        links: {
          testkey: [{ value: '4567', ttl: 100 }],
          ipns: [{ value: '890A', ttl: 100 }],
          hyper: [{ value: 'AABC', ttl: 100 }]
        },
        log: [{ code: 'FALLBACK' }]
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
        log: [
          { code: 'FALLBACK' },
          // Note: these errors are purposefully shuffled to make sure that the tests are order independent
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'KEY_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/boo%', reason: 'INVALID_ENCODING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/ホガ', reason: 'INVALID_CHARACTER' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/フゲ/bar', reason: 'INVALID_CHARACTER' }
        ]
      }
    case 't09.dnslink.dev':
      return {
        links: { dnslink: [{ value: 'b.t09.dnslink.dev', ttl: 100 }] },
        log: []
      }
    case 't13.dnslink.eth':
      return {
        links: { testkey: [{ value: 'AAJK', ttl: 100 }] },
        log: [
          { code: 'FALLBACK' }
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
        links: { testkey: [{ ttl: 100, value: 'AAVW' }] },
        log: []
      }
    case 'xn--froschgrn-x9a.t19.dnslink.dev':
      return {
        links: { testkey: [{ ttl: 100, value: 'AAVW' }] },
        log: []
      }
    case '2.t19.dnslink.dev':
      return {
        links: { testkey: [{ ttl: 100, value: 'BAEF' }] },
        log: []
      }
    case '1337.t19.dnslink.dev':
      return {
        links: { testkey: [{ ttl: 100, value: 'BAEF' }] },
        log: []
      }
    case '3.t19.dnslink.dev':
      return {
        links: { testkey: [{ ttl: 100, value: 'BAGH' }] },
        log: []
      }
    case 'abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0.t19.dnslink.dev':
      return {
        links: { testkey: [{ ttl: 100, value: 'BAGH' }] },
        log: []
      }
    case '4.t19.dnslink.dev':
      return {
        links: { testkey: [{ ttl: 100, value: 'BAIJ' }] },
        log: []
      }
    case '4b.t19.dnslink.dev':
      return {
        links: { testkey: [{ ttl: 100, value: 'BAIJ' }] },
        log: []
      }
    case '6.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'BAMN', ttl: 100 }] },
        log: []
      }
    case 'foo--bar.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'BAMN', ttl: 100 }] },
        log: []
      }
    case '7.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'BAOP', ttl: 100 }] },
        log: []
      }
    case '_.7.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'BAOP', ttl: 100 }] },
        log: []
      }
    case '8.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'BAQR', ttl: 100 }] },
        log: []
      }
    case '*.8.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'BAQR', ttl: 100 }] },
        log: []
      }
    case '9.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'BAST', ttl: 100 }] },
        log: []
      }
    case 's!ome.9.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'BAST', ttl: 100 }] },
        log: []
      }
    case '10.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAEF', ttl: 100 }] },
        log: []
      }
    case 'domain.com�.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAEF', ttl: 100 }] },
        log: []
      }
    case '11.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAGH', ttl: 100 }] },
        log: []
      }
    case 'domain.com©.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAGH', ttl: 100 }] },
        log: []
      }
    case '12.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAIJ', ttl: 100 }] },
        log: []
      }
    case '日本語.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAIJ', ttl: 100 }] },
        log: []
      }
    case '13.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAKL', ttl: 100 }] },
        log: []
      }
    case 'b\u00fccher.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAKL', ttl: 100 }] },
        log: []
      }
    case '14.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAMN', ttl: 100 }] },
        log: []
      }
    case '\uFFFD.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAMN', ttl: 100 }] },
        log: []
      }
    case '15.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAOP', ttl: 100 }] },
        log: []
      }
    case 'президент.рф.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAOP', ttl: 100 }] },
        log: []
      }
    case '16.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAQR', ttl: 100 }] },
        log: []
      }
    case DOMAIN_253C:
      return {
        links: { testkey: [{ value: 'CAQR', ttl: 100 }] },
        log: []
      }
    case '17.t19.dnslink.dev':
      return {
        links: { testkey: [{ value: 'CAQR', ttl: 100 }] },
        log: []
      }
    case 'abc':
      return {
        links: { testkey: [{ value: 'BAKL', ttl: 100 }] },
        log: []
      }
    case 'example.0':
      return {
        links: { testkey: [{ value: 'BAUV', ttl: 100 }] },
        log: []
      }
    case '127.0.0.1':
      return {
        links: { testkey: [{ value: 'BAWX', ttl: 100 }] },
        log: []
      }
    case '256.0.0.0':
      return {
        links: { testkey: [{ value: 'BAYZ', ttl: 100 }] },
        log: []
      }
    case '192.168.0.9999':
      return {
        links: { testkey: [{ value: 'CAST', ttl: 100 }] },
        log: []
      }
    case '192.168.0':
      return {
        links: { testkey: [{ value: 'CAUV', ttl: 100 }] },
        log: []
      }
    case '123':
      return {
        links: { testkey: [{ value: 'CAWX', ttl: 100 }] },
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
