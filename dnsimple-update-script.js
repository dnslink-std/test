#!/usr/bin/env node
//
// Script to update the dns TXT entries of "dnslink.dev" subdomains needed for the tests
// To use this script you need to set the following environment variables:
//   DNSIMPLE_ACCESS_TOKEN: <your access token>
//   DNSIMPLE_BASE_URL (optional): set to https://api.sandbox.dnsimple.com if you would like to use the sandbox
//
const dnsimple = require('dnsimple')
const { tests } = require('.')
const pmapImport = import('p-map')
const util = require('util')

;(async function main () {
  const credentials = {
    baseUrl: process.env.DNSIMPLE_BASE_URL,
    accessToken: process.env.DNSIMPLE_ACCESS_TOKEN
  }
  let client
  try {
    client = dnsimple(credentials)
    await client.identity.whoami()
  } catch (e) {
    if (e.message === 'Authentication failed') {
      throw new Error(`Authentication failed, did you set the DNSIMPLE_BASE_URL and DNSIMPLE_ACCESS_TOKEN environment variables?\n${util.inspect(credentials)}`)
    }
    throw e
  }

  const domain = 'dnslink.dev'
  const suffix = `.${domain}`

  const { default: pmap } = await pmapImport
  const { zone, account } = await findAccountForDomain(client, domain)

  const txtEntries = txtEntriesForTests(tests, suffix)
  const knownSubDomains = new Set(Object.keys(txtEntries))
  const operations = (await client.zones.allZoneRecords(account.id, zone.id, { type: 'TXT' }))
    .filter(record => knownSubDomains.has(record.name))
    .map(record => {
      const perDomain = txtEntries[record.name]
      const content = record.content.trim()
      const log = `${record.name}${suffix} TXT ${record.content}`
      if (perDomain.has(content)) {
        perDomain.delete(content)
        return () => console.log(`~ ${log}`)
      }
      return async () => {
        try {
          await client.zones.deleteZoneRecord(account.id, zone.id, record.id)
          console.log(`- ${log}`)
        } catch (error) {
          renderError(`e- Error while removing: ${log}`, error)
        }
      }
    })

  for (const [name, domainEntries] of Object.entries(txtEntries)) {
    for (const content of domainEntries) {
      const log = `${name}${suffix} TXT ${content}`
      const entry = { name, type: 'TXT', content }
      operations.push(async () => {
        try {
          await client.zones.createZoneRecord(account.id, zone.id, entry)
          console.log(`+ ${log}`)
        } catch (error) {
          renderError(`e+ Error while adding: ${log}`, error)
        }
      })
    }
  }
  await pmap(operations, op => op(), { concurrency: 10 })
})().catch(error => {
  console.error(error)
  process.exit(1)
})

function txtEntriesForTests (tests, suffix) {
  const txtEntries = {}
  for (const test of Object.values(tests)) {
    const raw = test.dns(test.targetDomain)
    for (const key in raw) {
      if (key.endsWith(suffix)) {
        const subDomain = key.substr(0, key.length - suffix.length)
        txtEntries[subDomain] = new Set(raw[key].map(entry => entry.trim()))
      }
    }
  }
  return txtEntries
}

function renderError (message, error) {
  const errorString = error.stack ? error.stack : util.inspect(error, true, Infinity)
  console.log(`${message}\n    ${errorString.split('\n').join('\n    ')}`)
}

// Get the list of accounts available to this token.
async function findAccounts (client) {
  const res = await client.accounts.listAccounts()
  return res.data
}

async function findAccountForDomain (client, domain) {
  const accounts = await findAccounts(client)
  for (const account of accounts) {
    const zone = await findZoneOrNull(client, account.id, domain)
    if (zone) {
      return {
        zone,
        account
      }
    }
  }
  throw new Error(`Failed to find zone record for ${domain} with the token provided. Did you use the wrong token?`)
}

// Try and fetch a zone record for the domain.
async function findZoneOrNull (client, accountId, domain) {
  try {
    const zone = await client.zones.getZone(accountId, domain)
    return zone.data
  } catch (err) {
    if (err.description === 'Not found') {
      return null
    }
    throw err
  }
}
