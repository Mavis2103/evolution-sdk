---
title: sdk/client/dual.ts
nav_order: 158
parent: Modules
---

## dual overview

Dual Effect/Promise utilities.

`dual()` wraps an `Effect<A,E,never>` in a Proxy that adds a `then` method,
making the result simultaneously:

- An `Effect.Effect<A, E>` — `yield*`, `.pipe()`, all Effect operators
- A `PromiseLike<A>` — `await`, `Promise.all`, `.then()`

`dualify()` auto-derives `dual()` wrapping over an entire service interface,
mapping every `Effect`-returning method to a `DualEffect`.

IMPORTANT: uses Proxy, NOT Object.assign.
`Object.assign(effect, { then })` mutates the Effect object. Internally,
`Effect.runPromiseExit` calls `Promise.resolve(effect)`, which sees `then`
and recurses infinitely (producing a hung process).
Proxy intercepts `then` at property access without touching the original,
so `Effect.runPromiseExit(effect)` always runs on the clean original.

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [dual](#dual)
  - [dualify](#dualify)
- [model](#model)
  - [DualEffect (type alias)](#dualeffect-type-alias)
  - [Dualified (type alias)](#dualified-type-alias)

---

# constructors

## dual

Wrap an `Effect<A, E, never>` to make it directly `await`-able while
remaining a full `Effect`.

**Signature**

```ts
export declare const dual: <A, E>(effect: Effect.Effect<A, E>) => DualEffect<A, E>
```

Added in v2.2.0

## dualify

Auto-wraps every method of a service object:

- `Effect<A, E, never>` → `DualEffect<A, E>` (await OR yield\*)
- `Stream<A, E, never>` → `AsyncIterable<A>` (for await)
- anything else → left as-is

**Signature**

```ts
export declare const dualify: <T extends object>(service: T) => Dualified<T>
```

Added in v2.2.0

# model

## DualEffect (type alias)

An Effect that is also directly awaitable.

Extends `Effect.Effect<A, E>` so all Effect operators work as normal,
and implements `PromiseLike<A>` so `await` resolves to the success value.

Typed errors are preserved across the Promise boundary via `Cause.squash`,
so `instanceof` checks work in `catch` blocks.

**Signature**

```ts
export type DualEffect<A, E> = Effect.Effect<A, E> & PromiseLike<A>
```

Added in v2.2.0

## Dualified (type alias)

A service interface with all Effect/Stream methods replaced by their dual forms.

**Signature**

```ts
export type Dualified<T> = { [K in keyof T]: DualifyMethod<T[K]> }
```

Added in v2.2.0
