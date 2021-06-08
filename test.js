
const domain = process.argv[2]

function getResult (options) {
  switch (domain) {
    case 't01.dnslink.dev':
      /* eslint-disable-next-line no-case-declarations */
      const result = { found: {} }
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
      return { found: { ipfs: 'ABCD' } }
    case 't03.dnslink.dev':
    case '_dnslink.t03.dnslink.dev':
      return { found: { ipfs: 'EFGH' } }
    case 't04.dnslink.dev':
    case '_dnslink.t04.dnslink.dev':
      return { found: { ipfs: 'IJKL' } }
    case '_dnslink._dnslink.t04.dnslink.dev':
      return {
        found: {},
        errors: [{ code: 'RECURSIVE_DNSLINK_PREFIX', domain: '_dnslink._dnslink.t04.dnslink.dev' }]
      }
    case 't05.dnslink.dev':
      return {
        found: { ipfs: 'MNOP' },
        errors: [
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/ipfs/ ', reason: 'NO_VALUE' }
        ]
      }
    case 't06.dnslink.dev':
      return {
        found: { ipfs: 'QRST' },
        errors: [
          { code: 'CONFLICT_ENTRY', entry: 'dnslink=/ipfs/Z123' },
          { code: 'CONFLICT_ENTRY', entry: 'dnslink=/ipfs/ UVWX' }
        ]
      }
    case 't07.dnslink.dev':
      return {
        found: { ipfs: '4567', ipns: '890A', hyper: 'AABC' }
      }
    case 't08.dnslink.dev':
      return {
        found: { foo: 'bar' },
        errors: [
          // Note: these errors are purposefully shuffled to make sure that the tests are order independent
          { code: 'INVALID_ENTRY', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo', reason: 'NO_VALUE' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/', reason: 'KEY_MISSING' },
          { code: 'INVALID_ENTRY', entry: 'dnslink=/foo/', reason: 'NO_VALUE' }
        ]
      }
    case 't09.dnslink.dev':
      return {
        found: { ipfs: 'AADE' }
      }
    case 't10.dnslink.dev':
      return {
        found: { ipfs: 'AAFG' }
      }
    case 't11.dnslink.dev':
      return {
        found: {},
        errors: [
          {
            code: 'TOO_MANY_REDIRECTS',
            chain: [
              't11.dnslink.dev', '2.t11.dnslink.dev', '3.t11.dnslink.dev', '4.t11.dnslink.dev', '5.t11.dnslink.dev', '6.t11.dnslink.dev', '7.t11.dnslink.dev', '8.t11.dnslink.dev', '9.t11.dnslink.dev', '10.t11.dnslink.dev',
              '11.t11.dnslink.dev', '12.t11.dnslink.dev', '13.t11.dnslink.dev', '14.t11.dnslink.dev', '15.t11.dnslink.dev', '16.t11.dnslink.dev', '17.t11.dnslink.dev', '18.t11.dnslink.dev', '19.t11.dnslink.dev', '20.t11.dnslink.dev',
              '21.t11.dnslink.dev', '22.t11.dnslink.dev', '23.t11.dnslink.dev', '24.t11.dnslink.dev', '25.t11.dnslink.dev', '26.t11.dnslink.dev', '27.t11.dnslink.dev', '28.t11.dnslink.dev', '29.t11.dnslink.dev', '30.t11.dnslink.dev',
              '31.t11.dnslink.dev', '32.t11.dnslink.dev', '33.t11.dnslink.dev'
            ]
          }
        ]
      }
    case 't12.dnslink.dev':
      return {
        found: {},
        errors: [
          { code: 'ENDLESS_REDIRECT', chain: ['t12.dnslink.dev', '1.t12.dnslink.dev', 't12.dnslink.dev'] }
        ]
      }
    case 't13.dnslink.eth':
      return {
        found: { ipfs: 'AAJK' }
      }
    case 't14.dnslink.dev':
      return {
        found: { ipns: 'AALM' },
        errors: [
          { code: 'UNUSED_ENTRY', domain: 't14.dnslink.dev', entry: 'dnslink=/ipfs/mnop' }
        ]
      }
    case 't15.dnslink.dev':
      return {
        found: { ipns: 'AANO' },
        errors: [
          { code: 'INVALID_ENTRY', domain: 't15.dnslink.dev', entry: 'dnslink=', reason: 'WRONG_START' },
          { code: 'UNUSED_ENTRY', domain: 't15.dnslink.dev', entry: 'dnslink=/ipfs/mnop' },
          { code: 'UNUSED_ENTRY', domain: '1.t15.dnslink.dev', entry: 'dnslink=/ipfs/qrst' },
          { code: 'INVALID_ENTRY', domain: '2.t15.dnslink.dev', entry: 'dnslink=/ipfs/', reason: 'NO_VALUE' },
          { code: 'UNUSED_ENTRY', domain: '2.t15.dnslink.dev', entry: 'dnslink=/ipns/uvwx' }
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
  if (!options.withErrors) {
    delete result.errors
  }
  out = JSON.stringify(result)
} catch (error) {
  out = JSON.stringify({ error: error.stack })
}
console.log(out)
