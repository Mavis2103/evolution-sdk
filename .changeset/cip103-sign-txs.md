---
"@evolution-sdk/evolution": patch
---

Add `signTxs` method to `SigningClient`, `OfflineSignerClient`, and all wallet types for batch transaction signing per CIP-103. For CIP-30 browser wallets, the implementation detects `api.cip103.signTxs`, `api.experimental.signTxs`, or direct `api.signTxs` and falls back to sequential `api.signTx` calls when no batch method is available. Seed and private key wallets delegate to per-transaction signing internally.

- `WalletApi` now accepts optional `cip103`, `experimental`, and direct `signTxs` properties
- `TransactionSignatureRequest` type exported from `Wallet` module
- `signTxsWithAutoFetch` aggregates reference inputs across all transactions in a single provider call
