---
"@evolution-sdk/devnet": patch
"@evolution-sdk/evolution": patch
---

Migrate transaction builder and provider layer to use Core UTxO types throughout the SDK.

### New Core Types

- **`Core.UTxO`** — Schema-validated UTxO with branded types (`TransactionHash`, `Address`, `Assets`)
- **`Core.Assets`** — Enhanced with `merge`, `subtract`, `negate`, `getAsset`, `setAsset`, `hasAsset` operations
- **`Core.Time`** — New module for slot/time conversions with `SlotConfig`, `Slot`, `UnixTime`
- **`Core.Address`** — Added `getAddressDetails`, `getPaymentCredential`, `getStakingCredential` utilities

### SDK Changes

- Provider methods (`getUtxos`, `getUtxoByUnit`, `getUtxosWithUnit`) now return `Core.UTxO.UTxO[]`
- Client methods (`getWalletUtxos`, `newTx`) use Core UTxO internally
- Transaction builder accepts `Core.UTxO.UTxO[]` for `availableUtxos`
- `Genesis.calculateUtxosFromConfig` and `Genesis.queryUtxos` return Core UTxOs

### Rationale

The SDK previously used a lightweight `{ txHash, outputIndex, address, assets }` record for UTxOs, requiring constant conversions when interfacing with the Core layer (transaction building, CBOR serialization). This caused:

1. **Conversion overhead** — Every transaction build required converting SDK UTxOs to Core types
2. **Type ambiguity** — `txHash: string` vs `TransactionHash`, `address: string` vs `Address` led to runtime errors
3. **Inconsistent APIs** — Some methods returned Core types, others SDK types

By standardizing on Core UTxO:

- **Zero conversion** — UTxOs flow directly from provider → wallet → builder → transaction
- **Type safety** — Branded types prevent mixing up transaction hashes, addresses, policy IDs
- **Unified model** — Single UTxO representation across the entire SDK

### Migration

```typescript
// Before
const lovelace = Assets.getAsset(utxo.assets, "lovelace")
const txId = utxo.txHash
const idx = utxo.outputIndex
const addr = utxo.address // string

// After  
const lovelace = utxo.assets.lovelace
const txId = Core.TransactionHash.toHex(utxo.transactionId)
const idx = utxo.index // bigint
const addr = Core.Address.toBech32(utxo.address) // or use Address directly
```
