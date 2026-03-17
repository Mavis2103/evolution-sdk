---
"@evolution-sdk/evolution": patch
---

Fix Blockfrost evaluateTx failing on multi-asset UTxOs by correcting the value format sent to the Ogmios endpoint. Standardize error handling across all providers with consistent catchAll + wrapError pattern. Add JSONWSP fault detection to Blockfrost evaluation responses. Accept both CBOR tag-258 and plain array encodings in TransactionBody decoding.
