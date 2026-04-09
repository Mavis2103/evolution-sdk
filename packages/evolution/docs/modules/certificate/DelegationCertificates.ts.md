---
title: certificate/DelegationCertificates.ts
nav_order: 42
parent: Modules
---

## DelegationCertificates overview

Delegation certificate types.

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [certificate](#certificate)
  - [StakeRegDelegCert (class)](#stakeregdelegcert-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method)
    - [[Equal.symbol] (method)](#equalsymbol-method)
    - [[Hash.symbol] (method)](#hashsymbol-method)
  - [StakeVoteDelegCert (class)](#stakevotedelegcert-class)
    - [toJSON (method)](#tojson-method-1)
    - [toString (method)](#tostring-method-1)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method-1)
    - [[Equal.symbol] (method)](#equalsymbol-method-1)
    - [[Hash.symbol] (method)](#hashsymbol-method-1)
  - [StakeVoteRegDelegCert (class)](#stakevoteregdelegcert-class)
    - [toJSON (method)](#tojson-method-2)
    - [toString (method)](#tostring-method-2)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method-2)
    - [[Equal.symbol] (method)](#equalsymbol-method-2)
    - [[Hash.symbol] (method)](#hashsymbol-method-2)
  - [VoteDelegCert (class)](#votedelegcert-class)
    - [toJSON (method)](#tojson-method-3)
    - [toString (method)](#tostring-method-3)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method-3)
    - [[Equal.symbol] (method)](#equalsymbol-method-3)
    - [[Hash.symbol] (method)](#hashsymbol-method-3)
  - [VoteRegDelegCert (class)](#voteregdelegcert-class)
    - [toJSON (method)](#tojson-method-4)
    - [toString (method)](#tostring-method-4)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method-4)
    - [[Equal.symbol] (method)](#equalsymbol-method-4)
    - [[Hash.symbol] (method)](#hashsymbol-method-4)

---

# certificate

## StakeRegDelegCert (class)

Register stake and delegate to a pool in one certificate (CDDL: stake_reg_deleg_cert = 11).

**Signature**

```ts
export declare class StakeRegDelegCert
```

Added in v2.0.0

### toJSON (method)

**Signature**

```ts
toJSON()
```

### toString (method)

**Signature**

```ts
toString(): string
```

### [Inspectable.NodeInspectSymbol] (method)

**Signature**

```ts
[Inspectable.NodeInspectSymbol](): unknown
```

### [Equal.symbol] (method)

**Signature**

```ts
[Equal.symbol](that: unknown): boolean
```

### [Hash.symbol] (method)

**Signature**

```ts
[Hash.symbol](): number
```

## StakeVoteDelegCert (class)

Delegate stake to a pool and voting rights to a DRep (CDDL: stake_vote_deleg_cert = 10).

**Signature**

```ts
export declare class StakeVoteDelegCert
```

Added in v2.0.0

### toJSON (method)

**Signature**

```ts
toJSON()
```

### toString (method)

**Signature**

```ts
toString(): string
```

### [Inspectable.NodeInspectSymbol] (method)

**Signature**

```ts
[Inspectable.NodeInspectSymbol](): unknown
```

### [Equal.symbol] (method)

**Signature**

```ts
[Equal.symbol](that: unknown): boolean
```

### [Hash.symbol] (method)

**Signature**

```ts
[Hash.symbol](): number
```

## StakeVoteRegDelegCert (class)

Register stake, delegate to a pool, and delegate voting rights to a DRep (CDDL: stake_vote_reg_deleg_cert = 13).

**Signature**

```ts
export declare class StakeVoteRegDelegCert
```

Added in v2.0.0

### toJSON (method)

**Signature**

```ts
toJSON()
```

### toString (method)

**Signature**

```ts
toString(): string
```

### [Inspectable.NodeInspectSymbol] (method)

**Signature**

```ts
[Inspectable.NodeInspectSymbol](): unknown
```

### [Equal.symbol] (method)

**Signature**

```ts
[Equal.symbol](that: unknown): boolean
```

### [Hash.symbol] (method)

**Signature**

```ts
[Hash.symbol](): number
```

## VoteDelegCert (class)

Delegate voting rights to a DRep (CDDL: vote_deleg_cert = 9).

**Signature**

```ts
export declare class VoteDelegCert
```

Added in v2.0.0

### toJSON (method)

**Signature**

```ts
toJSON()
```

### toString (method)

**Signature**

```ts
toString(): string
```

### [Inspectable.NodeInspectSymbol] (method)

**Signature**

```ts
[Inspectable.NodeInspectSymbol](): unknown
```

### [Equal.symbol] (method)

**Signature**

```ts
[Equal.symbol](that: unknown): boolean
```

### [Hash.symbol] (method)

**Signature**

```ts
[Hash.symbol](): number
```

## VoteRegDelegCert (class)

Register stake and delegate voting rights to a DRep (CDDL: vote_reg_deleg_cert = 12).

**Signature**

```ts
export declare class VoteRegDelegCert
```

Added in v2.0.0

### toJSON (method)

**Signature**

```ts
toJSON()
```

### toString (method)

**Signature**

```ts
toString(): string
```

### [Inspectable.NodeInspectSymbol] (method)

**Signature**

```ts
[Inspectable.NodeInspectSymbol](): unknown
```

### [Equal.symbol] (method)

**Signature**

```ts
[Equal.symbol](that: unknown): boolean
```

### [Hash.symbol] (method)

**Signature**

```ts
[Hash.symbol](): number
```
