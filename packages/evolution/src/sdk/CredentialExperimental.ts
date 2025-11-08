import { Equal, Hash, ParseResult, Schema } from "effect"


export class KeyHash {
  readonly _type = "key" as const

  private constructor(private readonly hash: Uint8Array) {}

  static readonly KeyHashFromBytes = Schema.transformOrFail(
    Schema.Uint8ArrayFromSelf,
    Schema.declare((input: unknown): input is KeyHash => input instanceof KeyHash, {
      identifier: "KeyHash"
    }),
    {
      strict: true,
      decode: (bytes, _, ast) => {
        if (bytes.length !== 28) {
          return ParseResult.fail(new ParseResult.Type(ast, bytes, `Expected 28 bytes, got ${bytes.length}`))
        }
        return ParseResult.succeed(new KeyHash(bytes))
      },
      encode: (cred) => ParseResult.succeed(cred.toBytes())
    }
  )

  static readonly KeyHashFromHex = Schema.compose(Schema.Uint8ArrayFromHex, KeyHash.KeyHashFromBytes)


  toBytes(): Uint8Array {
    return new Uint8Array(this.hash)
  }

  toHex(): string {
    return Buffer.from(this.hash).toString("hex")
  }

  // Equal protocol implementation
  [Equal.symbol](that: unknown): boolean {
    if (!(that instanceof KeyHash)) {
      return false
    }
    const thisBytes = this.hash
    const thatBytes = that.hash
    if (thisBytes.length !== thatBytes.length) {
      return false
    }
    for (let i = 0; i < thisBytes.length; i++) {
      if (thisBytes[i] !== thatBytes[i]) {
        return false
      }
    }
    return true
  }

  // Hash protocol implementation
  [Hash.symbol](): number {
    return Hash.array(Array.from(this.hash))
  }

  toString() {
    return `KeyHash("${this.toHex()}")`
  }

  // JSON serialization - returns object with type and hash
  toJSON() {
    return {
      _type: this._type,
      hash: this.toHex()
    }
  }

  // Method that uses Schema.decodeSync (throws on error)
  static readonly fromHex = Schema.decodeSync(this.KeyHashFromHex)

  static readonly fromBytes = Schema.decodeSync(this.KeyHashFromBytes)

  // Effect combinators namespace - populated after schemas are defined
  static readonly Effect = {
    fromHex: Schema.decode(KeyHash.KeyHashFromHex),
    fromBytes: Schema.decode(KeyHash.KeyHashFromBytes)
  }
}
