---
title: sdk/client/Client.ts
nav_order: 156
parent: Modules
---

## Client overview

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [ApiWalletClient (type alias)](#apiwalletclient-type-alias)
  - [MinimalClient (interface)](#minimalclient-interface)
  - [MinimalClientEffect (interface)](#minimalclienteffect-interface)
  - [ProviderOnlyClient (type alias)](#provideronlyclient-type-alias)
  - [ReadOnlyClient (type alias)](#readonlyclient-type-alias)
  - [ReadOnlyClientEffect (interface)](#readonlyclienteffect-interface)
  - [ReadOnlyWalletClient (type alias)](#readonlywalletclient-type-alias)
  - [SigningClient (type alias)](#signingclient-type-alias)
  - [SigningClientEffect (interface)](#signingclienteffect-interface)
  - [SigningWalletClient (type alias)](#signingwalletclient-type-alias)

---

# model

## ApiWalletClient (type alias)

ApiWalletClient - CIP-30 wallet signing and submission without blockchain queries.
Requires attachProvider() to access blockchain data.

**Signature**

```ts
export type ApiWalletClient = EffectToPromiseAPI<WalletNew.ApiWalletEffect> & {
  readonly chain: Chain
  readonly attachProvider: (provider: Provider.Provider) => SigningClient
  readonly effect: WalletNew.ApiWalletEffect
}
```

Added in v2.0.0

## MinimalClient (interface)

MinimalClient - network context with combinator methods to attach provider and/or wallet.

**Signature**

```ts
export interface MinimalClient {
  readonly chain: Chain
  readonly attachProvider: (provider: Provider.Provider) => ProviderOnlyClient
  readonly attachWallet: <T extends AnyWallet>(
    wallet: T
  ) => T extends WalletNew.ReadOnlyWallet
    ? ReadOnlyWalletClient
    : T extends WalletNew.ApiWallet
      ? ApiWalletClient
      : SigningWalletClient
  readonly effect: MinimalClientEffect
}
```

Added in v2.0.0

## MinimalClientEffect (interface)

MinimalClient Effect - holds chain context.

**Signature**

```ts
export interface MinimalClientEffect {
  readonly chain: Chain
}
```

Added in v2.0.0

## ProviderOnlyClient (type alias)

ProviderOnlyClient - blockchain queries and transaction submission.

**Signature**

```ts
export type ProviderOnlyClient = EffectToPromiseAPI<Provider.ProviderEffect> & {
  readonly chain: Chain
  readonly attachWallet: <T extends AnyWallet>(
    wallet: T
  ) => T extends WalletNew.ReadOnlyWallet ? ReadOnlyClient : SigningClient
  readonly effect: Provider.ProviderEffect
}
```

Added in v2.0.0

## ReadOnlyClient (type alias)

ReadOnlyClient - blockchain queries and wallet address operations without signing.
Use newTx() to build unsigned transactions.

**Signature**

```ts
export type ReadOnlyClient = Omit<EffectToPromiseAPI<ReadOnlyClientEffect>, "newTx"> & {
  readonly newTx: () => ReadOnlyTransactionBuilder
  readonly effect: ReadOnlyClientEffect
}
```

Added in v2.0.0

## ReadOnlyClientEffect (interface)

ReadOnlyClient Effect - provider, read-only wallet, and utility methods.

**Signature**

```ts
export interface ReadOnlyClientEffect extends Provider.ProviderEffect, WalletNew.ReadOnlyWalletEffect {
  readonly getWalletUtxos: () => Effect.Effect<ReadonlyArray<CoreUTxO.UTxO>, Provider.ProviderError>
  readonly getWalletDelegation: () => Effect.Effect<Provider.Delegation, Provider.ProviderError>
  readonly newTx: () => ReadOnlyTransactionBuilder
}
```

Added in v2.0.0

## ReadOnlyWalletClient (type alias)

ReadOnlyWalletClient - wallet address access without signing or blockchain queries.
Requires attachProvider() to access blockchain data.

**Signature**

```ts
export type ReadOnlyWalletClient = EffectToPromiseAPI<WalletNew.ReadOnlyWalletEffect> & {
  readonly chain: Chain
  readonly attachProvider: (provider: Provider.Provider) => ReadOnlyClient
  readonly effect: WalletNew.ReadOnlyWalletEffect
}
```

Added in v2.0.0

## SigningClient (type alias)

SigningClient - full functionality: blockchain queries, transaction signing, and submission.
Use newTx() to build, sign, and submit transactions.

**Signature**

```ts
export type SigningClient = Omit<EffectToPromiseAPI<SigningClientEffect>, "newTx"> & {
  readonly newTx: () => SigningTransactionBuilder
  readonly effect: SigningClientEffect
}
```

Added in v2.0.0

## SigningClientEffect (interface)

SigningClient Effect - provider, signing wallet, and utility methods.

**Signature**

```ts
export interface SigningClientEffect extends Provider.ProviderEffect, WalletNew.SigningWalletEffect {
  readonly getWalletUtxos: () => Effect.Effect<
    ReadonlyArray<CoreUTxO.UTxO>,
    WalletNew.WalletError | Provider.ProviderError
  >
  readonly getWalletDelegation: () => Effect.Effect<Provider.Delegation, WalletNew.WalletError | Provider.ProviderError>
  readonly newTx: () => SigningTransactionBuilder
}
```

Added in v2.0.0

## SigningWalletClient (type alias)

SigningWalletClient - transaction signing without blockchain queries.
Requires attachProvider() to access blockchain data.

**Signature**

```ts
export type SigningWalletClient = EffectToPromiseAPI<WalletNew.SigningWalletEffect> & {
  readonly chain: Chain
  readonly attachProvider: (provider: Provider.Provider) => SigningClient
  readonly effect: WalletNew.SigningWalletEffect
}
```

Added in v2.0.0
