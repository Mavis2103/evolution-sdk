---
"@evolution-sdk/evolution": patch
---

Fixed `getUtxos` and `getUtxosWithUnit` in the Kupmios provider producing invalid Kupo URLs when called with a `Credential` instead of an `Address`. The credential hash (a `Uint8Array`) was being interpolated directly into the URL pattern, resulting in a comma-separated list of byte values instead of the expected hex string. Both call sites now convert the hash to hex with `Bytes.toHex` before building the URL.
