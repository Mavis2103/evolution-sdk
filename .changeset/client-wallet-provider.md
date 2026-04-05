---
"@evolution-sdk/evolution": patch
---

Introduce composable client API with Chain, Providers, and Wallets modules. Fix signMessage returning vkey instead of signature, seedWallet ignoring paymentIndex/stakeIndex, redundant RewardAddress decode in getWalletDelegation, and dualify missing prototype-chain methods. Add chain property to ProviderOnlyClient and ApiWalletClient, remove MinimalClient.attach shortcut, and align ReadOnlyClient.newTx() signature with SigningClient.
