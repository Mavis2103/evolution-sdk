---
"@evolution-sdk/evolution": patch
---

Conway-era transactions encode certificates as `#6.258([+ certificate])` (CBOR tag 258, a nonempty ordered set). TransactionBody deserialization now unwraps tag 258 when present on the certificates field (key 4), and serialization wraps the array in tag 258 so round-tripped bytes match the on-chain encoding.
