---
title: sdk/client/ClientImpl.ts
nav_order: 157
parent: Modules
---

## ClientImpl overview

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [createClient](#createclient)

---

# utils

## createClient

**Signature**

```ts
export declare function createClient(config: {
  chain?: Chain
  provider: Provider.Provider
  wallet: WalletNew.ReadOnlyWallet
}): ReadOnlyClient
export declare function createClient(config: {
  chain?: Chain
  provider: Provider.Provider
  wallet: WalletNew.SigningWallet | WalletNew.ApiWallet | WalletFactory
}): SigningClient
export declare function createClient(config: { chain?: Chain; provider: Provider.Provider }): ProviderOnlyClient
export declare function createClient(config: { chain?: Chain; wallet: WalletNew.ReadOnlyWallet }): ReadOnlyWalletClient
export declare function createClient(config: { chain?: Chain; wallet: WalletNew.ApiWallet }): ApiWalletClient
export declare function createClient(config: {
  chain?: Chain
  wallet: WalletNew.SigningWallet | WalletFactory
}): SigningWalletClient
export declare function createClient(config?: { chain?: Chain }): MinimalClient
```
