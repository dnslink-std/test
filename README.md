# dnslink-test

A language independent test harness for DNSLink implementations such as [dnslink-std/js](https://github.com/dnslink-std/js/) or [dnslink-std/go](https://github.com/dnslink-std/go/).

- [Installation](#installation)
- [Usage](#usage)
  - [Built-in DNS server](#built-in-dns-server) 

## Installation

The tests are written in javascript and published through npm. This means
for the execution of the tests `Node.js` is required.

You can run the tests "on-the-fly" using `$ npx @dnslink/test` or install
them permanently using `npm i @dnslink/test -g` and then run it using `$ dnslink-test`.

## Usage

To use this harness you need to prepare an executable, lets call it `my-impl`.

1. `my-impl` needs to be able to process command line arguments. The first argument for `my-impl` is a domain name.
2. Using the domain name as input, `my-impl` needs to output a JSON formatted object to `stdout`.
3. The output needs to have a `found` object containing all the DNSLink entries found for a domain.
4. Any found DNSLink entry needs to be returned in the `found`, like: `{ "links": { "foo": "bar" } }`, if redirects
    happen with deep linking, the `path` property needs to be set like
    `..."path": [{ "pathname": "/dir/name", "search": { "foo": ["bar"] }}]`
5. Now you can run tests using `dnslink-test -- my-impl` and it will show whether or not your implementation passes.
6. Optionally, your implementation may support standard log messages and/or codes for debugging why a DNSLink entry
    can not found. To enable this you need to also return a `log` object that contains all the log entries and run
    the tests with the `--enable log` flag: `$ dnslink-test --enable log -- my-impl`.
7. While developing you can use `--skip` or `--only` to disable/enable specific tests in order to make development
    more comfortable.

The list of rules that an implementation needs to cover is defined in [`./integration-tests.js`](./integration-tests.js).

### Built-in DNS server

`dnslink-test` comes automatically with a DNS server that is run on the localhost's UDP and TCP ports, as well as
a DNS-over-HTTPS compatible endpoint (thought it is a regular HTTP endpoint).

The implementation tested receives a second argument which contains a JSON object. Looking like this:

```json
{
  "udp": 2345,
  "tcp": 2346,
  "doh": 2347,
  "flags": {}
}
```

The `udp`, `tpc` and `doh` numbers are ports on which the local server are listening for the duration of the
tests. They contain the DNS TXT entries for all known domains.

_Note:_ The `flags` objects contains any flags that you may have passed in.

One can also run the DNS server in a standalone mode (for debug, or in custom CI setups): 

```console
$ dnslink-test --server-only
{
  "udp": 49953,
  "tcp": 37755,
  "doh": 39427
}
```

## License

Published under dual-license: [MIT OR Apache-2.0](./LICENSE)
