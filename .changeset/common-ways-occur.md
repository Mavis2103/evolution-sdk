---
"@evolution-sdk/evolution": patch
---

### Native Scripts & Multi-Sig Support

- **`addSigner` operation**: Add required signers to transactions for multi-sig and script validation
- **Native script minting**: Full support for `ScriptAll`, `ScriptAny`, `ScriptNOfK`, `InvalidBefore`, `InvalidHereafter`
- **Reference scripts**: Use native scripts via `readFrom` instead of attaching them to transactions
- **Multi-sig spending**: Spend from native script addresses with multi-party signing
- **Improved fee calculation**: Accurate fee estimation for transactions with native scripts and reference scripts

### API Changes

- `UTxO.scriptRef` type changed from `ScriptRef` to `Script` for better type safety
- `PayToAddressParams.scriptRef` renamed to `script` for consistency
- Wallet `signTx` now accepts `referenceUtxos` context for native script signer detection
- Client `signTx` auto-fetches reference UTxOs when signing transactions with reference inputs
