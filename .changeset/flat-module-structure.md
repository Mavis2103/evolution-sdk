---
"@evolution-sdk/evolution": minor
---

Flatten module structure to eliminate webpack casing conflicts on case-insensitive filesystems. The wildcard export now maps PascalCase filenames directly — namespace name equals filename equals import path, removing the directory/namespace casing mismatch that caused dual module identifiers in webpack builds.

Modules previously nested in concept folders (address/, block/, transaction/, etc.) are now flat PascalCase files at the package root. Three subdirectories remain for separate domains with naming collisions: `plutus/` (on-chain script types), `cose/` (message signing protocol), and `blueprint/` (CIP-57 codegen). Deep imports into subdirectories are blocked.

- Concept-folder subpath imports like `@evolution-sdk/evolution/address` are removed. Use the root barrel (`import { Address } from "@evolution-sdk/evolution"`) or the wildcard (`import * as Address from "@evolution-sdk/evolution/Address"`).
- `MessageSigning` is renamed to `COSE` in the root barrel export.
- `./plutus`, `./cose`, and `./blueprint` are available as subpath imports with namespaced barrels.
- Blueprint barrel now uses `export * as` instead of `export *`.
