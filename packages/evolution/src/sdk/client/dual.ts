/**
 * Dual Effect/Promise utilities.
 *
 * `dual()` wraps an `Effect<A,E,never>` in a Proxy that adds a `then` method,
 * making the result simultaneously:
 *   - An `Effect.Effect<A, E>`  — `yield*`, `.pipe()`, all Effect operators
 *   - A `PromiseLike<A>`        — `await`, `Promise.all`, `.then()`
 *
 * `dualify()` auto-derives `dual()` wrapping over an entire service interface,
 * mapping every `Effect`-returning method to a `DualEffect`.
 *
 * IMPORTANT: uses Proxy, NOT Object.assign.
 * `Object.assign(effect, { then })` mutates the Effect object. Internally,
 * `Effect.runPromiseExit` calls `Promise.resolve(effect)`, which sees `then`
 * and recurses infinitely (producing a hung process).
 * Proxy intercepts `then` at property access without touching the original,
 * so `Effect.runPromiseExit(effect)` always runs on the clean original.
 *
 * @internal
 * @module
 */

import { Cause, Effect, Exit, Stream } from "effect"

/**
 * An Effect that is also directly awaitable.
 *
 * Extends `Effect.Effect<A, E>` so all Effect operators work as normal,
 * and implements `PromiseLike<A>` so `await` resolves to the success value.
 *
 * Typed errors are preserved across the Promise boundary via `Cause.squash`,
 * so `instanceof` checks work in `catch` blocks.
 *
 * @since 2.2.0
 * @category model
 */
export type DualEffect<A, E> = Effect.Effect<A, E> & PromiseLike<A>

/**
 * Wrap an `Effect<A, E, never>` to make it directly `await`-able while
 * remaining a full `Effect`.
 *
 * @since 2.2.0
 * @category constructors
 */
export const dual = <A, E>(effect: Effect.Effect<A, E>): DualEffect<A, E> => {
  const run = () =>
    Effect.runPromiseExit(effect).then((exit) => {
      if (Exit.isFailure(exit)) throw Cause.squash(exit.cause)
      return exit.value
    })
  return new Proxy(effect, {
    get(target, prop, receiver) {
      if (prop === "then") return (onFulfilled?: any, onRejected?: any) => run().then(onFulfilled, onRejected)
      return Reflect.get(target, prop, receiver)
    },
  }) as DualEffect<A, E>
}

// ─── dualify() ────────────────────────────────────────────────────────────────

/**
 * Maps a service interface to its dualified form:
 *   - `Effect<A, E, never>` methods → `DualEffect<A, E>` (await OR yield*)
 *   - `Stream<A, E, never>` methods → `AsyncIterable<A>` (for await)
 *   - anything else → left as-is
 *
 * @since 2.2.0
 * @category model
 */
type DualifyMethod<F> =
  F extends (...args: infer A) => Effect.Effect<infer R, infer E, never>
    ? (...args: A) => DualEffect<R, E>
    : F extends (...args: infer A) => Stream.Stream<infer R, infer E, never>
      ? (...args: A) => AsyncIterable<R>
      : F

/**
 * A service interface with all Effect/Stream methods replaced by their dual forms.
 *
 * @since 2.2.0
 * @category model
 */
export type Dualified<T> = { [K in keyof T]: DualifyMethod<T[K]> }

/**
 * Auto-wraps every method of a service object:
 *   - `Effect<A, E, never>` → `DualEffect<A, E>` (await OR yield*)
 *   - `Stream<A, E, never>` → `AsyncIterable<A>` (for await)
 *   - anything else → left as-is
 *
 * @since 2.2.0
 * @category constructors
 */
export const dualify = <T extends object>(service: T): Dualified<T> => {
  const result: any = {}
  const keys = new Set<string>()
  let proto: object | null = service
  while (proto && proto !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key !== "constructor") keys.add(key)
    }
    proto = Object.getPrototypeOf(proto)
  }
  for (const key of keys) {
    const value = (service as any)[key]
    if (typeof value !== "function") {
      result[key] = value
      continue
    }
    result[key] = (...args: any[]) => {
      const out = (service as any)[key](...args)
      if (out == null) return out
      if (Effect.isEffect(out)) return dual(out as Effect.Effect<unknown, unknown, never>)
      if (Stream.StreamTypeId in out) return Stream.toAsyncIterable(out)
      return out
    }
  }
  return result
}
