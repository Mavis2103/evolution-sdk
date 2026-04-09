---
"@evolution-sdk/evolution": minor
---

Reorganize flat module structure into semantic concept folders.

- Move ~130 flat root-level files into 24 concept folders following Effect v4 conventions (camelCase folders, PascalCase files)
- New folders: `address/`, `assets/`, `block/`, `blueprint/`, `bytes/`, `certificate/`, `credential/`, `data/`, `encoding/`, `governance/`, `messageSigning/`, `metadata/`, `network/`, `numeric/`, `plutus/`, `primitives/`, `relay/`, `script/`, `staking/`, `time/`, `transaction/`, `uplc/`, `value/`
- Merge `datum/` into `data/` (DatumHash, DatumOption, InlineDatum alongside Data, TSchema, DataJson)
- Extract `certificate/` from `governance/` (StakeCertificates and PoolCertificates have zero governance dependencies)
- Move byte primitives (Bytes, Bytes4–448, BoundedBytes) from `primitives/` to `bytes/`
- Move numeric types (Numeric, Natural, NonZeroInt64, UnitInterval) from `primitives/` to `numeric/`
- Move CBOR and Codec from root to `encoding/`
- Dissolve `utils/` anti-pattern: move hash functions to input-type modules via `to` pattern (TransactionBody.toHash, Data.toDatumHash, etc.)
- Delete dead code: `Combinator.ts` (zero consumers, contained a bug), `FormatError.ts` (zero consumers), `NativeScriptsOLD.ts`, `Function.ts`
- Rename non-conforming folders: `Assets/` → `assets/`, `Time/` → `time/`, `message-signing/` → `messageSigning/`
- All public API exports preserved via barrel files and package.json exports map
