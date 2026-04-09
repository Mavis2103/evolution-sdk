/**
 * Delegation certificate types.
 *
 * @since 2.0.0
 * @module certificate/DelegationCertificates
 */
import { Equal, Hash, Inspectable, Schema } from "effect"

import * as Credential from "../credential/Credential.js"
import * as DRep from "../governance/DRep.js"
import * as PoolKeyHash from "../staking/PoolKeyHash.js"
import * as Coin from "../value/Coin.js"

/**
 * Delegate voting rights to a DRep (CDDL: vote_deleg_cert = 9).
 *
 * @since 2.0.0
 * @category certificate
 */
export class VoteDelegCert extends Schema.TaggedClass<VoteDelegCert>("VoteDelegCert")("VoteDelegCert", {
  stakeCredential: Credential.Credential,
  drep: DRep.DRep
}) {
  toJSON() {
    return {
      _tag: "VoteDelegCert" as const,
      stakeCredential: this.stakeCredential.toJSON(),
      drep: this.drep.toJSON()
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
      that instanceof VoteDelegCert &&
      Equal.equals(this.stakeCredential, that.stakeCredential) &&
      Equal.equals(this.drep, that.drep)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("VoteDelegCert"))(Hash.combine(Hash.hash(this.stakeCredential))(Hash.hash(this.drep)))
    )
  }
}

/**
 * Delegate stake to a pool and voting rights to a DRep (CDDL: stake_vote_deleg_cert = 10).
 *
 * @since 2.0.0
 * @category certificate
 */
export class StakeVoteDelegCert extends Schema.TaggedClass<StakeVoteDelegCert>("StakeVoteDelegCert")(
  "StakeVoteDelegCert",
  {
    stakeCredential: Credential.Credential,
    poolKeyHash: PoolKeyHash.PoolKeyHash,
    drep: DRep.DRep
  }
) {
  toJSON() {
    return {
      _tag: "StakeVoteDelegCert" as const,
      stakeCredential: this.stakeCredential.toJSON(),
      poolKeyHash: this.poolKeyHash.toJSON(),
      drep: this.drep.toJSON()
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
      that instanceof StakeVoteDelegCert &&
      Equal.equals(this.stakeCredential, that.stakeCredential) &&
      Equal.equals(this.poolKeyHash, that.poolKeyHash) &&
      Equal.equals(this.drep, that.drep)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("StakeVoteDelegCert"))(
        Hash.combine(Hash.hash(this.stakeCredential))(Hash.combine(Hash.hash(this.poolKeyHash))(Hash.hash(this.drep)))
      )
    )
  }
}

/**
 * Register stake and delegate to a pool in one certificate (CDDL: stake_reg_deleg_cert = 11).
 *
 * @since 2.0.0
 * @category certificate
 */
export class StakeRegDelegCert extends Schema.TaggedClass<StakeRegDelegCert>("StakeRegDelegCert")("StakeRegDelegCert", {
  stakeCredential: Credential.Credential,
  poolKeyHash: PoolKeyHash.PoolKeyHash,
  coin: Coin.Coin
}) {
  toJSON() {
    return {
      _tag: "StakeRegDelegCert" as const,
      stakeCredential: this.stakeCredential.toJSON(),
      poolKeyHash: this.poolKeyHash.toJSON(),
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
      that instanceof StakeRegDelegCert &&
      Equal.equals(this.stakeCredential, that.stakeCredential) &&
      Equal.equals(this.poolKeyHash, that.poolKeyHash) &&
      Equal.equals(this.coin, that.coin)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("StakeRegDelegCert"))(
        Hash.combine(Hash.hash(this.stakeCredential))(Hash.combine(Hash.hash(this.poolKeyHash))(Hash.hash(this.coin)))
      )
    )
  }
}

/**
 * Register stake and delegate voting rights to a DRep (CDDL: vote_reg_deleg_cert = 12).
 *
 * @since 2.0.0
 * @category certificate
 */
export class VoteRegDelegCert extends Schema.TaggedClass<VoteRegDelegCert>("VoteRegDelegCert")("VoteRegDelegCert", {
  stakeCredential: Credential.Credential,
  drep: DRep.DRep,
  coin: Coin.Coin
}) {
  toJSON() {
    return {
      _tag: "VoteRegDelegCert" as const,
      stakeCredential: this.stakeCredential.toJSON(),
      drep: this.drep.toJSON(),
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
      that instanceof VoteRegDelegCert &&
      Equal.equals(this.stakeCredential, that.stakeCredential) &&
      Equal.equals(this.drep, that.drep) &&
      Equal.equals(this.coin, that.coin)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("VoteRegDelegCert"))(
        Hash.combine(Hash.hash(this.stakeCredential))(Hash.combine(Hash.hash(this.drep))(Hash.hash(this.coin)))
      )
    )
  }
}

/**
 * Register stake, delegate to a pool, and delegate voting rights to a DRep (CDDL: stake_vote_reg_deleg_cert = 13).
 *
 * @since 2.0.0
 * @category certificate
 */
export class StakeVoteRegDelegCert extends Schema.TaggedClass<StakeVoteRegDelegCert>("StakeVoteRegDelegCert")(
  "StakeVoteRegDelegCert",
  {
    stakeCredential: Credential.Credential,
    poolKeyHash: PoolKeyHash.PoolKeyHash,
    drep: DRep.DRep,
    coin: Coin.Coin
  }
) {
  toJSON() {
    return {
      _tag: "StakeVoteRegDelegCert" as const,
      stakeCredential: this.stakeCredential.toJSON(),
      poolKeyHash: this.poolKeyHash.toJSON(),
      drep: this.drep.toJSON(),
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
      that instanceof StakeVoteRegDelegCert &&
      Equal.equals(this.stakeCredential, that.stakeCredential) &&
      Equal.equals(this.poolKeyHash, that.poolKeyHash) &&
      Equal.equals(this.drep, that.drep) &&
      Equal.equals(this.coin, that.coin)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("StakeVoteRegDelegCert"))(
        Hash.combine(Hash.hash(this.stakeCredential))(
          Hash.combine(Hash.hash(this.poolKeyHash))(Hash.combine(Hash.hash(this.drep))(Hash.hash(this.coin)))
        )
      )
    )
  }
}
