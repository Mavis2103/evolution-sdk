---
"@evolution-sdk/evolution": patch
---

Restructured client internals and fixed several consistency issues in the promise-based API layer.

Signing logic has been extracted from `Wallets.ts` into a dedicated `internal/Signing.ts` module, and client assembly now lives in `internal/Client.ts`. The `WalletNew` module was renamed to `Wallet`; the legacy `ClientImpl` and `dual` modules were removed.

`runEffectPromise` no longer mutates error stack traces — the `cleanErrorChain` infrastructure was removed entirely. `Cause.squash` now throws the original error object unchanged, which means `instanceof` checks and `_tag` discrimination work correctly when consumers catch errors from promise-based methods.

All 19 `Effect.runPromise` call sites in the client layer were replaced with `runEffectPromise` so errors are consistently unwrapped across `readOnlyWallet`, `cip30Wallet`, `createOfflineSignerClient`, `createReadOnlyClient`, and `createSigningClient`.

- Provider method wiring in `SigningClient` now uses spread instead of manual `.bind()` calls
- `ProviderError.cause` is now optional, matching `WalletError` and `TransactionBuilderError`
- Removed `cause: null` sentinels from all error constructors
