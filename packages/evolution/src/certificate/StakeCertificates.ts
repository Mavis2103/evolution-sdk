/**
 * Stake certificate types.
 *
 * @since 2.0.0
 * @module certificate/StakeCertificates
 */
import { Equal, Hash, Inspectable, Schema } from "effect"

import * as Credential from "../credential/Credential.js"
import * as PoolKeyHash from "../staking/PoolKeyHash.js"
import * as Coin from "../value/Coin.js"

/**
 * Register a stake credential (CDDL: stake_registration = 0).
 *
 * @since 2.0.0
 * @category certificate
 */
export class StakeRegistration extends Schema.TaggedClass<StakeRegistration>("StakeRegistration")("StakeRegistration", {
  stakeCredential: Credential.Credential
}) {
  toJSON() {
    return {
      _tag: "StakeRegistration" as const,
      stakeCredential: this.stakeCredential.toJSON()
    }
  }

  toString(): string {
    return Inspectable.format(this.toJSON())
  }

  [Inspectable.NodeInspectSymbol](): unknown {
    return this.toJSON()
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof StakeRegistration && Equal.equals(this.stakeCredential, that.stakeCredential)
  }

  [Hash.symbol](): number {
    return Hash.cached(this, Hash.combine(Hash.hash("StakeRegistration"))(Hash.hash(this.stakeCredential)))
  }
}

/**
 * Deregister a stake credential (CDDL: stake_deregistration = 1).
 *
 * @since 2.0.0
 * @category certificate
 */
export class StakeDeregistration extends Schema.TaggedClass<StakeDeregistration>("StakeDeregistration")(
  "StakeDeregistration",
  {
    stakeCredential: Credential.Credential
  }
) {
  toJSON() {
    return {
      _tag: "StakeDeregistration" as const,
      stakeCredential: this.stakeCredential.toJSON()
    }
  }

  toString(): string {
    return Inspectable.format(this.toJSON())
  }

  [Inspectable.NodeInspectSymbol](): unknown {
    return this.toJSON()
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof StakeDeregistration && Equal.equals(this.stakeCredential, that.stakeCredential)
  }

  [Hash.symbol](): number {
    return Hash.cached(this, Hash.combine(Hash.hash("StakeDeregistration"))(Hash.hash(this.stakeCredential)))
  }
}

/**
 * Delegate stake to a pool (CDDL: stake_delegation = 2).
 *
 * @since 2.0.0
 * @category certificate
 */
export class StakeDelegation extends Schema.TaggedClass<StakeDelegation>("StakeDelegation")("StakeDelegation", {
  stakeCredential: Credential.Credential,
  poolKeyHash: PoolKeyHash.PoolKeyHash
}) {
  toJSON() {
    return {
      _tag: "StakeDelegation" as const,
      stakeCredential: this.stakeCredential.toJSON(),
      poolKeyHash: this.poolKeyHash.toJSON()
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
      that instanceof StakeDelegation &&
      Equal.equals(this.stakeCredential, that.stakeCredential) &&
      Equal.equals(this.poolKeyHash, that.poolKeyHash)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("StakeDelegation"))(
        Hash.combine(Hash.hash(this.stakeCredential))(Hash.hash(this.poolKeyHash))
      )
    )
  }
}

/**
 * Conway-era stake registration with deposit (CDDL: reg_cert = 7).
 *
 * @since 2.0.0
 * @category certificate
 */
export class RegCert extends Schema.TaggedClass<RegCert>("RegCert")("RegCert", {
  stakeCredential: Credential.Credential,
  coin: Coin.Coin
}) {
  toJSON() {
    return {
      _tag: "RegCert" as const,
      stakeCredential: this.stakeCredential.toJSON(),
      coin: this.coin.toString()
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
      that instanceof RegCert &&
      Equal.equals(this.stakeCredential, that.stakeCredential) &&
      Equal.equals(this.coin, that.coin)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("RegCert"))(Hash.combine(Hash.hash(this.stakeCredential))(Hash.hash(this.coin)))
    )
  }
}

/**
 * Conway-era stake deregistration with deposit refund (CDDL: unreg_cert = 8).
 *
 * @since 2.0.0
 * @category certificate
 */
export class UnregCert extends Schema.TaggedClass<UnregCert>("UnregCert")("UnregCert", {
  stakeCredential: Credential.Credential,
  coin: Coin.Coin
}) {
  toJSON() {
    return {
      _tag: "UnregCert" as const,
      stakeCredential: this.stakeCredential.toJSON(),
      coin: this.coin.toString()
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
      that instanceof UnregCert &&
      Equal.equals(this.stakeCredential, that.stakeCredential) &&
      Equal.equals(this.coin, that.coin)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("UnregCert"))(Hash.combine(Hash.hash(this.stakeCredential))(Hash.hash(this.coin)))
    )
  }
}
