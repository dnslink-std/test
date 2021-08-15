const fs = require('fs')
const which = require('which')
const { spawn } = require('child_process')
const tape = require('fresh-tape')
const createServer = require('./dns-server')
const tests = require('./integration-tests')
const { Packet } = require('dns2')
const util = require('util')
const deepEqual = require('fast-deep-equal')

function inspect (obj, depth = 7) {
  return util.inspect(obj, {
    depth,
    sorted: true,
    breakLength: Infinity,
    maxStringLength: Infinity
  })
}

const SETUP = {}
for (const [key, test] of Object.entries(tests)) {
  const subdomain = /^(t\d+):/.exec(key)[1]
  const domain = `${subdomain}.${test.domain || 'dnslink.example.com'}`
  test.targetDomain = domain

  try {
    const entriesByDomain = test.dns(domain)
    if (!entriesByDomain) {
      continue
    }
    for (const [testDomain, entries] of Object.entries(entriesByDomain)) {
      if (SETUP[testDomain]) {
        throw new Error(`Conflicting domain ${testDomain} for ${domain}`)
      }
      SETUP[testDomain] = normalizeDomainEntries(entries)
    }
  } catch (err) {
    console.error(`Error while setting up ”${domain}” for "${key}" ↓`)
    throw err
  }
}

function normalizeDomainEntries (rawEntries) {
  const result = {}
  for (const rawEntry of Array.isArray(rawEntries) ? rawEntries : [rawEntries]) {
    const entry = processEntry(rawEntry)
    const byType = result[entry.type]
    if (!byType) {
      result[entry.type] = [entry]
    } else {
      byType.push(entry)
    }
  }
  return result
}

function processEntry (rawEntry) {
  if (typeof rawEntry === 'string') {
    rawEntry = [rawEntry]
  }
  if (Array.isArray(rawEntry)) {
    rawEntry = { data: rawEntry }
  } else {
    if (typeof rawEntry.data === 'string') {
      rawEntry.data = [rawEntry.data]
    }
  }
  if (!rawEntry.type) {
    rawEntry.type = Packet.TYPE.TXT
  }
  if (!rawEntry.ttl) {
    rawEntry.ttl = 100
  }
  return rawEntry
}

async function startServer () {
  const server = await createServer(SETUP)
  const addresses = server.addresses()
  return {
    serverOpts: {
      udp: addresses.udp.port,
      tcp: addresses.tcp.port,
      doh: addresses.doh.port
    },
    close: () => server.close()
  }
}

async function getCommand (cmd, serverOpts, signal) {
  const executable = await getExecutable(cmd.shift())
  return function (domain, options) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(Error('Aborted.'))
      }
      const end = (err, data) => {
        signal.removeEventListener('abort', onAbort)
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      }
      const out = []
      const err = []
      const p = spawn(executable, [...cmd, ...toTestArgs(domain, options, serverOpts)])
      p.on('error', end)
      p.stdout.on('data', data => out.push(data))
      p.stderr.on('data', data => err.push(data))
      p.on('close', code => {
        if (code) {
          end(new Error(`Process Error [${code}]: ${Buffer.concat(err).toString()}`))
        } else {
          let json
          const txt = Buffer.concat(out).toString()
          try {
            json = JSON.parse(txt)
          } catch (error) {
            end(new Error(`Non-JSON output: ${error}: ${txt}`))
          }
          end(null, json)
        }
      })
      signal.addEventListener('abort', onAbort)
      function onAbort () {
        end(new Error('Aborted.'))
        p.kill()
      }
    })
  }
}

function toTestArgs (domain, options, serverOpts) {
  return [domain, JSON.stringify({
    ...serverOpts,
    ...options
  })]
}

function getExecutable (input) {
  return which(input)
    .catch(() => input)
    .then(cmd => fs.promises.access(cmd, fs.constants.X_OK).then(
      () => cmd,
      () => { throw new Error(`EACCES: ${cmd} is not executable.`) }
    ))
}

function runTests (cmd, flags = {}, filter = {}) {
  const test = tape.createHarness()
  const _cmd = (domain, options) => cmd(domain, {
    flags,
    ...options
  })
  test('Enabled Flags', t => {
    let oneFound = false
    for (const key in flags) {
      oneFound = true
      t.pass(`"${key}" enabled.`)
    }
    if (!oneFound) {
      t.pass('No flags enabled.')
    }
    t.end()
  })
  Object.entries(tests).forEach(([name, { run, targetDomain, flag }]) => {
    const key = /^(t\d.)?\s?/.exec(name)[1]
    let skip
    if (flag && !flags[flag]) {
      skip = ` (Enable "${flag}" flag for this test to run.)`
    } else if (filter.only && !filter.only.includes(key)) {
      skip = ' (Disabled by --only)'
    } else if (filter.skip && filter.skip.includes(key)) {
      skip = ' (Disabled by --skip)'
    }
    test(`${name} (${targetDomain})${skip || ''}`, {
      skip: skip !== undefined
    }, async t => {
      t.dnslink = dnslink.bind(null, flags, t)
      await run(t, _cmd, targetDomain)
    })
  })
  return test
}

function dnslink (flags, t, actual, expected) {
  if (!actual) {
    t.fail('Result is empty')
    return
  }
  if (expected.error) {
    if (!actual.error) {
      t.fail(`Missing error ${expected.error.code}: ${JSON.stringify(actual)}`)
    } else {
      t.equals(actual.error.code, expected.error.code, `Expected error ${actual.error.code} == ${expected.error.code} of ${JSON.stringify(actual.error)}`)
    }
    return
  }
  t.deepEquals(excludeSpecial(actual), excludeSpecial(expected), inspect(expected))
  if (actual.txtEntries) {
    t.deepEquals(actual.txtEntries, compileTxtEntries(expected.links), 'Support for TXT entries')
  }
  if (flags.log && expected.log) {
    let log = []
    if (Array.isArray(actual.log)) {
      log = actual.log
    } else {
      t.fail('No log given.')
    }
    const logSet = new Set(log)
    for (const [expectedIndex, expectedEntry] of Object.entries(expected.log)) {
      let foundIndex
      for (const [actualIndex, actualEntry] of Object.entries(log)) {
        if (deepEqual(expectedEntry, actualEntry)) {
          logSet.delete(actualEntry)
          foundIndex = actualIndex
          break
        }
      }
      if (foundIndex !== undefined) {
        // Note: Redirect entries need to come in order but the entries inbetween may be shuffled.
        if (foundIndex !== expectedIndex && expectedEntry.code === 'REDIRECT') {
          t.fail('Expected log entry found, but at wrong index. actual=' + foundIndex + ' != expected=' + expectedIndex + ': ' + inspect(expectedEntry))
        } else {
          t.pass('Expected log entry returned: ' + inspect(expectedEntry))
        }
      } else {
        t.fail('Log entry missing: ' + inspect(expectedEntry))
      }
    }
    for (const logEntry of logSet) {
      t.fail('Unexpected log entry: ' + inspect(logEntry))
    }
  }
}

function excludeSpecial (obj) {
  obj = { ...obj }
  delete obj.log
  delete obj.txtEntries
  return obj
}

function compileTxtEntries (links) {
  const txtEntries = []
  for (const ns of Object.keys(links).sort()) {
    const linksByNS = links[ns]
    for (const { identifier, ttl } of linksByNS.sort(sortByID)) {
      txtEntries.push({ value: `/${ns}/${identifier}`, ttl })
    }
  }
  return txtEntries
}

function sortByID (a, b) {
  if (a.identifier > b.identifier) return 1
  if (a.identifier < b.identifier) return -1
  return 0
}

module.exports = {
  getCommand,
  startServer,
  runTests,
  SETUP,
  tests
}
