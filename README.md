# dnslink-test

A language independent test harness for DNSLink implementations.

## Installation

The tests are written in javascript and published through npm. This means
for the execution of the tests `Node.js` is required.

You can run the tests "on-the-fly" using `$ npx @dnslink/test` or install
them permanently using `npm i @dnslink/test -g` and then run it using `$ dnslink-test`.

## Usage

To use this harness you need to prepare an executable, lets call it `my-impl`.

1. `my-impl` needs to be able to process command line arguments. The first argument for `my-impl` is a domain name.
2. Using the domain name as input, `my-impl` needs to output a JSON formatted object to `stdout`.
3. The output needs to have a `found` object containing all the dnslink entries found for a domain.
4. Any found dnslink entry needs to be returned in the `found`, like: `{ "found": { "foo": "bar" } }`
5. Now you can run tests using `dnslink-test -- my-impl` and it will show whether or not your implementation passes.
6. Optionally, your implementation may support error messages and/or codes for debugging why a dnslink entry can not
   found. To enable this you need to also return a `errors` object that contains all the errors and run the tests with
   the `--with-error-support` flag: `$ dnslink-test --with-error-support -- my-impl`

The list of rules that an implementation needs to cover is defined in [`./integration-tests.js`](./integration-tests.js).

## License

Published under dual-license: [MIT OR Apache-2.0](./LICENSE)
