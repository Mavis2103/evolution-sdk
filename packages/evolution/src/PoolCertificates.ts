/**
 * Pool certificate types.
 *
 * @since 2.0.0
 * @module certificate/PoolCertificates
 */
import { Equal, Hash, Inspectable, Schema } from "effect"

import * as EpochNo from "./EpochNo.js"
import * as PoolKeyHash from "./PoolKeyHash.js"
import * as PoolParams from "./PoolParams.js"

/**
 * Register a stake pool (CDDL: pool_registration = 3).
 *
 * @since 2.0.0
 * @category certificate
 */
export class PoolRegistration extends Schema.TaggedClass<PoolRegistration>("PoolRegistration")("PoolRegistration", {
  poolParams: PoolParams.PoolParams
}) {
  toJSON() {
    return {
      _tag: "PoolRegistration" as const,
      poolParams: this.poolParams.toJSON()
    }
  }

  toString(): string {
    return Inspectable.format(this.toJSON())
  }

  [Inspectable.NodeInspectSymbol](): unknown {
    return this.toJSON()
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof PoolRegistration && Equal.equals(this.poolParams, that.poolParams)
  }

  [Hash.symbol](): number {
    return Hash.cached(this, Hash.combine(Hash.hash("PoolRegistration"))(Hash.hash(this.poolParams)))
  }
}

/**
 * Retire a stake pool at a given epoch (CDDL: pool_retirement = 4).
 *
 * @since 2.0.0
 * @category certificate
 */
export class PoolRetirement extends Schema.TaggedClass<PoolRetirement>("PoolRetirement")("PoolRetirement", {
  poolKeyHash: PoolKeyHash.PoolKeyHash,
  epoch: EpochNo.EpochNoSchema
}) {
  toJSON() {
    return {
      _tag: "PoolRetirement" as const,
      poolKeyHash: this.poolKeyHash.toJSON(),
      epoch: this.epoch.toString()
    }
  }

  toString(): string {
    return Inspectable.format(this.toJSON())
  }

  [Inspectable.NodeInspectSymbol](): unknown {
    return this.toJSON()
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof PoolRetirement &&
      Equal.equals(this.poolKeyHash, that.poolKeyHash) &&
      Equal.equals(this.epoch, that.epoch)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("PoolRetirement"))(Hash.combine(Hash.hash(this.poolKeyHash))(Hash.hash(this.epoch)))
    )
  }
}
