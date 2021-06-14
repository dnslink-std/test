const fs = require('fs')
const which = require('which')
const { spawn } = require('child_process')
const tape = require('fresh-tape')
const createServer = require('./dns-server')
const tests = require('./integration-tests')
const { Packet } = require('dns2')
const util = require('util')
const deepEqual = require('fast-deep-equal')

function inspect (obj) {
  return util.inspect(obj, {
    sorted: true,
    breakLength: Infinity,
    maxStringLength: Infinity
  })
}

const SETUP = {}
for (const [key, test] of Object.entries(tests)) {
  const subdomain = /^(t\d+)[:|\s]/.exec(key)[1]
  const domain = `${subdomain}.${test.domain || 'dnslink.dev'}`
  test.targetDomain = domain

  try {
    const entriesByDomain = test.dns(domain)
    if (!entriesByDomain) {
      continue
    }
    for (const [domain, txtEntries] of Object.entries(entriesByDomain)) {
      SETUP[domain] = {
        [Packet.TYPE.TXT]: { data: txtEntries }
      }
    }
  } catch (err) {
    console.error(`Error while setting up ”${domain}” for "${key}" ↓`)
    throw err
  }
}

async function getCommand (cmd, signal) {
  const [executable, server] = await Promise.all([
    getExecutable(cmd.shift()),
    createServer(SETUP)
  ])
  const { close } = server
  const serverOpts = {
    udp: server.udp.address.port,
    tcp: server.tcp.address.port,
    doh: server.doh.address.port
  }
  return {
    cmd (domain, options) {
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
    },
    close
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

function runTests (cmd, flags = {}) {
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
    test(`${name} (${targetDomain})`, async t => {
      if (flag && !flags[flag]) {
        t.pass(`Skipped. Enable "${flag}" flag for this test to run.`)
        return
      }
      t.dnslink = dnslink
      await run(t, _cmd, targetDomain)
      function dnslink (actual, expected) {
        if (!actual) {
          t.fail('Result is empty')
          return
        }
        t.deepEquals(excludeErrors(actual), excludeErrors(expected))
        const errorSet = new Set(actual.errors)
        if (flags.error && expected.errors) {
          for (const expectedError of expected.errors) {
            let found
            for (const actualError of errorSet) {
              if (deepEqual(expectedError, actualError)) {
                errorSet.delete(actualError)
                found = actualError
                break
              }
            }
            if (found) {
              t.pass('Expected error returned: ' + inspect(expectedError))
            } else {
              t.fail('Error missing: ' + inspect(expectedError))
            }
          }
        }
        for (const error of errorSet) {
          t.fail('Unexpected error: ' + inspect(error))
        }
      }
    })
  })
  return test
}

function excludeErrors (obj) {
  obj = { ...obj }
  delete obj.errors
  return obj
}

module.exports = {
  getCommand,
  runTests,
  tests
}
