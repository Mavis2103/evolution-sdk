---
"@evolution-sdk/evolution": patch
---

Add `Address.fromSeed()` for synchronous address derivation from a BIP-39 seed phrase. This enables deriving addresses without constructing a `Client` or `Chain` instance — useful for devnet genesis funding where the address must be known before the cluster starts.

The `Derivation` module now accepts a numeric `networkId` (0 = testnet, 1 = mainnet) instead of a `network` string (`"Mainnet" | "Testnet" | "Custom"`). The default changed from mainnet (1) to testnet (0). If you call `walletFromSeed`, `addressFromSeed`, `walletFromBip32`, or `walletFromPrivateKey` with the old `network` option, replace it with `networkId`:

- `network: "Mainnet"` → `networkId: 1`
- `network: "Testnet"` or `network: "Custom"` → `networkId: 0` (or omit, since 0 is the default)
