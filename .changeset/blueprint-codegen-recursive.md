---
"@evolution-sdk/evolution": patch
---

Blueprint codegen now supports recursive type schemas — Plutus types that reference themselves
directly or through an intermediate type (e.g. `MultiSig` containing a `List<MultiSig>` field).
Cyclic references are emitted as typed `Schema.suspend` thunks where the encoded type `I` is
inferred by recursively walking the blueprint definition graph rather than hardcoded to `Data.Constr`:
`list` → `readonly ItemEncoded[]`, `map` → `globalThis.Map<Data.Data, Data.Data>`,
`bytes` → `Uint8Array`, `integer` → `bigint`, `constructor` and union → `Data.Constr`,
`$ref` followed transitively up to depth 10. The previous hardcoded `Data.Constr` caused a
TypeScript invariance error for any recursive field referencing a list type.

Several other codegen correctness and API improvements ship in the same release:

- **Namespace emission ordering** — the group-by-namespace emitter is replaced by a streaming emitter
  that walks a global topological sort and opens/closes namespace blocks on demand. TypeScript namespace
  merging handles split declarations transparently. This fixes cases where a type was emitted before
  its cross-namespace dependency (e.g. `Option.OfStakeCredential` appearing before `Cardano.Address.StakeCredential`).

- **Cyclic type emit pattern** — cyclic types now emit a `export type X = ...` / `export const X = ...`
  pair with no outer `Schema.suspend` wrapper and no `as` cast. Only the inner field references that
  close the cycle use typed thunks: `Schema.suspend((): Schema.Schema<T, I> => T)`.

- **`unionStyle` config** — `CodegenConfig` gains `unionStyle: "Variant" | "Struct" | "TaggedStruct"`
  in place of the removed `forceVariant` and `useSuspend` fields. `Struct` emits
  `TSchema.Struct({ Tag: TSchema.Struct({...}, { flatFields: true }) }, { flatInUnion: true })`,
  `TaggedStruct` emits `TSchema.TaggedStruct("Tag", {...}, { flatInUnion: true })`,
  and `Variant` emits `TSchema.Variant({ Tag: {...} })`.

- **Import hygiene** — generated files emit `import { Schema } from "@evolution-sdk/evolution"`
  only when cyclic types are present, rather than always importing from `effect` directly.
  `CodegenConfig.imports.effect` is replaced by `imports.schema`.

