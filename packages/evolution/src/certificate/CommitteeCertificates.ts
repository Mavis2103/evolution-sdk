import { Equal, Hash, Inspectable, Schema } from "effect"

import * as Credential from "../credential/Credential.js"
import * as Anchor from "../governance/Anchor.js"

export class AuthCommitteeHotCert extends Schema.TaggedClass<AuthCommitteeHotCert>("AuthCommitteeHotCert")(
  "AuthCommitteeHotCert",
  {
    committeeColdCredential: Credential.Credential,
    committeeHotCredential: Credential.Credential
  }
) {
  toJSON() {
    return {
      _tag: "AuthCommitteeHotCert" as const,
      committeeColdCredential: this.committeeColdCredential.toJSON(),
      committeeHotCredential: this.committeeHotCredential.toJSON()
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
      that instanceof AuthCommitteeHotCert &&
      Equal.equals(this.committeeColdCredential, that.committeeColdCredential) &&
      Equal.equals(this.committeeHotCredential, that.committeeHotCredential)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("AuthCommitteeHotCert"))(
        Hash.combine(Hash.hash(this.committeeColdCredential))(Hash.hash(this.committeeHotCredential))
      )
    )
  }
}

export class ResignCommitteeColdCert extends Schema.TaggedClass<ResignCommitteeColdCert>("ResignCommitteeColdCert")(
  "ResignCommitteeColdCert",
  {
    committeeColdCredential: Credential.Credential,
    anchor: Schema.NullishOr(Anchor.Anchor)
  }
) {
  toJSON() {
    return {
      _tag: "ResignCommitteeColdCert" as const,
      committeeColdCredential: this.committeeColdCredential.toJSON(),
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
      that instanceof ResignCommitteeColdCert &&
      Equal.equals(this.committeeColdCredential, that.committeeColdCredential) &&
      Equal.equals(this.anchor, that.anchor)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(
      this,
      Hash.combine(Hash.hash("ResignCommitteeColdCert"))(
        Hash.combine(Hash.hash(this.committeeColdCredential))(Hash.hash(this.anchor))
      )
    )
  }
}
