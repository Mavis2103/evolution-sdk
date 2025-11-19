/**
 * Aiken CBOR Encoding Compatibility Tests
 *
 * This test suite validates that our CBOR encoding matches Aiken's cbor.serialise().
 * Test values are taken from running `aiken check` on test/spec/lib/cbor_encoding_spec.ak
 * Each test verifies that our TypeScript encoder produces identical hex output to Aiken.
 * 
 * Key Aiken encoding characteristics discovered:
 * - Lists: Indefinite-length arrays (9f...ff), except empty lists (80)
 * - Maps: Encoded as arrays of pairs, not CBOR maps
 * - Strings: Encoded as bytearrays (major type 2), not text strings
 * - Constructors: Tags 121-127 for indices 0-6, then 1280+ for 7+
 * - Tuples: Indefinite-length arrays without constructor tags
 */

import { describe, expect, it } from "vitest"

import * as CBOR from "../src/core/CBOR.js"
import * as Data from "../src/core/Data.js"

describe("Aiken CBOR Encoding Compatibility", () => {
  describe("Primitive Types", () => {
    it("encode_int_small: should encode Int 42", () => {
      const value = 42n
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("182a")
    })

    it("encode_int_zero: should encode Int 0", () => {
      const value = 0n
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("00")
    })

    it("encode_int_negative: should encode Int -1", () => {
      const value = -1n
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("20")
    })

    it("encode_int_large: should encode Int 1000000", () => {
      const value = 1000000n
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("1a000f4240")
    })

    it("encode_bytearray_empty: should encode empty ByteArray", () => {
      const value = new Uint8Array([])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("40")
    })

    it("encode_bytearray_small: should encode ByteArray #a1b2", () => {
      const value = new Uint8Array([0xa1, 0xb2])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("42a1b2")
    })

    it("encode_bytearray_long: should encode ByteArray #deadbeef", () => {
      const value = new Uint8Array([0xde, 0xad, 0xbe, 0xef])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("44deadbeef")
    })
  })

  describe("Lists", () => {
    it("encode_list_empty: should encode empty list as definite array", () => {
      const value: ReadonlyArray<Data.Data> = []
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("80")
    })

    it("encode_list_single: should encode single item list", () => {
      const value = Data.list([1n])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f01ff")
    })

    it("encode_list_multiple: should encode list [1, 2, 3]", () => {
      const value = Data.list([1n, 2n, 3n])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f010203ff")
    })

    it("encode_list_nested: should encode nested lists", () => {
      const value = Data.list([Data.list([1n, 2n]), Data.list([3n, 4n])])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f9f0102ff9f0304ffff")
    })

    it("encode_list_of_bytearrays: should encode list of bytearrays", () => {
      const value = Data.list([
        new Uint8Array([0xaa]),
        new Uint8Array([0xbb]),
        new Uint8Array([0xcc])
      ])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f41aa41bb41ccff")
    })
  })

  describe("Tuples (Pairs)", () => {
    it("encode_pair_ints: should encode pair (1, 2)", () => {
      const value = Data.list([1n, 2n])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f0102ff")
    })

    it("encode_pair_mixed: should encode pair (1, #ff)", () => {
      const value = Data.list([1n, new Uint8Array([0xff])])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f0141ffff")
    })

    it("encode_triple: should encode triple (1, #ff, 3)", () => {
      const value = Data.list([1n, new Uint8Array([0xff]), 3n])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f0141ff03ff")
    })

    it("encode_nested_pairs: should encode nested pairs", () => {
      const value = Data.list([Data.list([1n, 2n]), Data.list([3n, 4n])])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f9f0102ff9f0304ffff")
    })
  })

  describe("Maps (as arrays of pairs)", () => {
    it("encode_map_empty: should encode empty map as empty array", () => {
      const value = Data.map([])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("80")
    })

    it("encode_map_single_entry: should encode single entry map", () => {
      const value = Data.map([[1n, new Uint8Array([0xff])]])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f9f0141ffffff")
    })

    it("encode_map_int_keys: should encode map with int keys and values", () => {
      const value = Data.map([
        [1n, 100n],
        [2n, 200n]
      ])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f9f011864ff9f0218c8ffff")
    })
  })

  describe("Constructors (Option types)", () => {
    it("encode_option_some: should encode Some(42) with tag 121", () => {
      const value = Data.constr(0n, [42n])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d8799f182aff")
    })

    it("encode_option_none: should encode None with tag 122", () => {
      const value = Data.constr(1n, [])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d87a80")
    })

    it("encode_option_some_bytearray: should encode Some(#deadbeef)", () => {
      const value = Data.constr(0n, [new Uint8Array([0xde, 0xad, 0xbe, 0xef])])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d8799f44deadbeefff")
    })

    it("encode_custom_constructor_0: should encode Variant0 with tag 121", () => {
      const value = Data.constr(0n, [])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d87980")
    })

    it("encode_custom_constructor_1: should encode Variant1 with tag 122", () => {
      const value = Data.constr(1n, [])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d87a80")
    })

    it("encode_custom_constructor_2: should encode Variant2 with tag 123", () => {
      const value = Data.constr(2n, [])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d87b80")
    })

    it("encode_constructor_index_6: should encode constructor 6 with tag 127", () => {
      const value = Data.constr(6n, [])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d87f80")
    })

    it("encode_constructor_index_7: should encode constructor 7 with alternative tag 1280", () => {
      const value = Data.constr(7n, [])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d9050080")
    })
  })

  describe("Nested Structures", () => {
    it("encode_list_of_options: should encode list of options", () => {
      const value = Data.list([
        Data.constr(0n, [1n]),
        Data.constr(1n, []),
        Data.constr(0n, [2n])
      ])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9fd8799f01ffd87a80d8799f02ffff")
    })

    it("encode_option_of_list: should encode option of list", () => {
      const value = Data.constr(0n, [Data.list([1n, 2n, 3n])])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d8799f9f010203ffff")
    })

    it("encode_nested_options: should encode nested options", () => {
      const value = Data.constr(0n, [Data.constr(0n, [Data.constr(0n, [1n])])])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("d8799fd8799fd8799f01ffffff")
    })

    it("encode_deeply_nested_list: should encode deeply nested list", () => {
      const value = Data.list([Data.list([Data.list([1n])])])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f9f9f01ffffff")
    })

    it("encode_map_nested_as_value: should encode map with nested map as value", () => {
      const value = Data.map([[1n, Data.map([[2n, 3n]])]])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f9f019f9f0203ffffffff")
    })

    it("encode_empty_nested_lists: should encode empty nested lists", () => {
      const value = Data.list([Data.list([]), Data.list([]), Data.list([])])
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("9f808080ff")
    })
  })

  describe("Integer Boundaries", () => {
    it("encode_int_boundary_255: should encode 255", () => {
      const value = 255n
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("18ff")
    })

    it("encode_int_boundary_256: should encode 256", () => {
      const value = 256n
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("190100")
    })

    it("encode_int_boundary_65535: should encode 65535", () => {
      const value = 65535n
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("19ffff")
    })

    it("encode_int_boundary_65536: should encode 65536", () => {
      const value = 65536n
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("1a00010000")
    })

    it("encode_int_negative_large: should encode -1000", () => {
      const value = -1000n
      const encoded = Data.toCBORHex(value, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("3903e7")
    })
  })

  describe("ByteArray Boundaries", () => {
    it("encode_bytearray_max_inline: should encode 24 bytes with length prefix 0x18", () => {
      const bytes = new Uint8Array([
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
        0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17
      ])
      const encoded = Data.toCBORHex(bytes, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("5818000102030405060708090a0b0c0d0e0f1011121314151617")
    })

    it("encode_pkh_credential: should encode 28-byte PKH", () => {
      const bytes = new Uint8Array([
        0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef, 0x12,
        0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78, 0x90,
        0xab, 0xcd, 0xef, 0x12
      ])
      const encoded = Data.toCBORHex(bytes, CBOR.AIKEN_DEFAULT_OPTIONS)
      expect(encoded).toBe("581cabcdef1234567890abcdef1234567890abcdef1234567890abcdef12")
    })
  })
})
