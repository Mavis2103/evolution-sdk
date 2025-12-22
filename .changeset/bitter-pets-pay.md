---
"@evolution-sdk/evolution": patch
"@evolution-sdk/devnet": patch
---

### Added: Redeemer Labels for Script Debugging

Added optional `label` property to redeemer operations (`collectFrom`, `withdraw`, `mint`, and stake operations) to help identify which script failed during evaluation.

```typescript
client.newTx()
  .collectFrom({
    inputs: [utxo],
    redeemer: makeSpendRedeemer(999n),
    label: "coordinator-spend-utxo"  // Shows in failure output
  })
  .withdraw({
    stakeCredential,
    amount: 0n,
    redeemer: makeWithdrawRedeemer([999n]),
    label: "coordinator-withdrawal"
  })
```

When scripts fail, the `EvaluationError` now includes a structured `failures` array:

```typescript
interface ScriptFailure {
  purpose: "spend" | "mint" | "withdraw" | "cert"
  index: number
  label?: string           // User-provided label
  redeemerKey: string      // e.g., "spend:0", "withdraw:0"
  utxoRef?: string         // For spend failures
  credential?: string      // For withdraw/cert failures
  policyId?: string        // For mint failures
  validationError: string
  traces: string[]
}
```

### Added: Stake Operations

Full support for Conway-era stake operations:

- `registerStake` - Register stake credential (RegCert)
- `deregisterStake` - Deregister stake credential (UnregCert)
- `delegateTo` - Delegate to pool and/or DRep (StakeDelegation, VoteDelegCert, StakeVoteDelegCert)
- `registerAndDelegateTo` - Combined registration + delegation (StakeRegDelegCert, VoteRegDelegCert, StakeVoteRegDelegCert)
- `withdraw` - Withdraw staking rewards (supports coordinator pattern with amount: 0n)

All operations support script-controlled credentials with RedeemerBuilder for deferred redeemer resolution.
