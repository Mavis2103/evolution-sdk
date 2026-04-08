---
"@evolution-sdk/evolution": patch
---

Restructure transaction builder internals for maintainability.

- Extract monolithic `TxBuilderImpl.ts` into focused internal modules (`build.ts`, `ctx.ts`, `factory.ts`, `layers.ts`, `resolve.ts`, `state.ts`, `txBuilder.ts`)
- Rename internal modules from PascalCase to camelCase per Effect conventions
- Add `Address.isScript` predicate and `UTxO.totalAssets`/`UTxO.toInputs` utilities to core modules
- Remove unnecessary Effect wrappers from pure functions (`makeTxOutput`, `calculateTransactionSize`)
- Fix `Unfrack.ts` ScriptRef encoding to use `fromHexStrings` instead of `fromUnit`
- Fix `Stake.ts` withdraw to use dependency injection for `TxBuilderConfig`
