# Log Codes used by DNSLink implementations

DNSLink implementations can return log statements that include information on the state
of TXT entries. They may be helpful to figure out why dnslink is not behaving like you expect.

Depending on the warnings code the errors may have additional `entry` property that holds
the problematic TXT entry.

An optional `reason` property may contain an additional reason for that error to occur.

| Code          | Meaning                                                                       | Additional properties |
|---------------|-------------------------------------------------------------------------------|-----------------------|
| FALLBACK      | No `_dnslink.` prefixed domain was found. Falling back to the regular domain. |                       |
| INVALID_ENTRY | A TXT entry with `dnslink=` prefix has formatting errors.                     | `entry`, `reason`     |

| Reason            | Meaning                                                                               |
|-------------------|---------------------------------------------------------------------------------------|
| WRONG_START       | A DNSLink entry needs to start with a `/`.                                            |
| NAMESPACE_MISSING | A DNSLink entry needs to have a `namespace`, like: `dnslink=/namespace/...`.          |
| NO_IDENTIFIER     | A DNSLink entry needs to have an `identifier`, like: `dnslink=/namespace/identifier`. |
| INVALID_CHARACTER | A DNSLink entry may only contain ascii characters.                                    |
