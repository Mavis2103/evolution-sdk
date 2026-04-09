---
title: certificate/StakeCertificates.ts
nav_order: 45
parent: Modules
---

## StakeCertificates overview

Stake certificate types.

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [certificate](#certificate)
  - [RegCert (class)](#regcert-class)
    - [toJSON (method)](#tojson-method)
    - [toString (method)](#tostring-method)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method)
    - [[Equal.symbol] (method)](#equalsymbol-method)
    - [[Hash.symbol] (method)](#hashsymbol-method)
  - [StakeDelegation (class)](#stakedelegation-class)
    - [toJSON (method)](#tojson-method-1)
    - [toString (method)](#tostring-method-1)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method-1)
    - [[Equal.symbol] (method)](#equalsymbol-method-1)
    - [[Hash.symbol] (method)](#hashsymbol-method-1)
  - [StakeDeregistration (class)](#stakederegistration-class)
    - [toJSON (method)](#tojson-method-2)
    - [toString (method)](#tostring-method-2)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method-2)
    - [[Equal.symbol] (method)](#equalsymbol-method-2)
    - [[Hash.symbol] (method)](#hashsymbol-method-2)
  - [StakeRegistration (class)](#stakeregistration-class)
    - [toJSON (method)](#tojson-method-3)
    - [toString (method)](#tostring-method-3)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method-3)
    - [[Equal.symbol] (method)](#equalsymbol-method-3)
    - [[Hash.symbol] (method)](#hashsymbol-method-3)
  - [UnregCert (class)](#unregcert-class)
    - [toJSON (method)](#tojson-method-4)
    - [toString (method)](#tostring-method-4)
    - [[Inspectable.NodeInspectSymbol] (method)](#inspectablenodeinspectsymbol-method-4)
    - [[Equal.symbol] (method)](#equalsymbol-method-4)
    - [[Hash.symbol] (method)](#hashsymbol-method-4)

---

# certificate

## RegCert (class)

Conway-era stake registration with deposit (CDDL: reg_cert = 7).

**Signature**

```ts
export declare class RegCert
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

## StakeDelegation (class)

Delegate stake to a pool (CDDL: stake_delegation = 2).

**Signature**

```ts
export declare class StakeDelegation
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

## StakeDeregistration (class)

Deregister a stake credential (CDDL: stake_deregistration = 1).

**Signature**

```ts
export declare class StakeDeregistration
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

## StakeRegistration (class)

Register a stake credential (CDDL: stake_registration = 0).

**Signature**

```ts
export declare class StakeRegistration
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

## UnregCert (class)

Conway-era stake deregistration with deposit refund (CDDL: unreg_cert = 8).

**Signature**

```ts
export declare class UnregCert
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
