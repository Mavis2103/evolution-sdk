import { Equal, Hash, Inspectable, Schema } from "effect"

import * as Credential from "../credential/Credential.js"
import * as Anchor from "../governance/Anchor.js"
import * as Coin from "../value/Coin.js"

export class RegDrepCert extends Schema.TaggedClass<RegDrepCert>("RegDrepCert")("RegDrepCert", {
  drepCredential: Credential.Credential,
  coin: Coin.Coin,
  anchor: Schema.NullishOr(Anchor.Anchor)
}) {
  toJSON() {
    return {
      _tag: "RegDrepCert" as const,
      drepCredential: this.drepCredential.toJSON(),
      coin: this.coin.toString(),
      anchor: this.anchor
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
      that instanceof RegDrepCert &&
      Equal.equals(this.drepCredential, that.drepCredential) &&
      Equal.equals(this.coin, that.coin) &&
      Equal.equals(this.anchor, that.anchor)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("RegDrepCert"))(
        Hash.combine(Hash.hash(this.drepCredential))(Hash.combine(Hash.hash(this.coin))(Hash.hash(this.anchor)))
      )
    )
  }
}

export class UnregDrepCert extends Schema.TaggedClass<UnregDrepCert>("UnregDrepCert")("UnregDrepCert", {
  drepCredential: Credential.Credential,
  coin: Coin.Coin
}) {
  toJSON() {
    return {
      _tag: "UnregDrepCert" as const,
      drepCredential: this.drepCredential.toJSON(),
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
      that instanceof UnregDrepCert &&
      Equal.equals(this.drepCredential, that.drepCredential) &&
      Equal.equals(this.coin, that.coin)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("UnregDrepCert"))(Hash.combine(Hash.hash(this.drepCredential))(Hash.hash(this.coin)))
    )
  }
}

export class UpdateDrepCert extends Schema.TaggedClass<UpdateDrepCert>("UpdateDrepCert")("UpdateDrepCert", {
  drepCredential: Credential.Credential,
  anchor: Schema.NullishOr(Anchor.Anchor)
}) {
  toJSON() {
    return {
      _tag: "UpdateDrepCert" as const,
      drepCredential: this.drepCredential.toJSON(),
      anchor: this.anchor
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
      that instanceof UpdateDrepCert &&
      Equal.equals(this.drepCredential, that.drepCredential) &&
      Equal.equals(this.anchor, that.anchor)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("UpdateDrepCert"))(Hash.combine(Hash.hash(this.drepCredential))(Hash.hash(this.anchor)))
    )
  }
}
