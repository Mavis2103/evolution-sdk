---
"@evolution-sdk/evolution": patch
---

`Transaction.fromCBORHex` and `Transaction.fromCBORBytes` now preserve the original CBOR encoding format (e.g. indefinite-length arrays) through round-trips. Previously, decoding via the default path normalised indefinite-length markers (`0x9f`) to definite-length (`0x81`), which silently broke `scriptDataHash` validation when the transaction contained non-canonical PlutusData in redeemers.

The fix caches the CBOR format tree in a WeakMap on decode and re-applies it on encode, making the default `fromCBOR → toCBOR` path lossless with no API surface change. `addVKeyWitnesses` transfers the cached format to the resulting transaction.
