import { describe, expect, it } from "@effect/vitest"

import { client, preprod } from "../src/index.js"

const VALID_TESTNET_ADDRESS = "addr_test1vz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzerspjrlsz"

describe("Client address assembly", () => {
  it("does not throw during assembly for invalid addresses", () => {
    expect(() => client(preprod).withAddress("not-an-address")).not.toThrow()
  })

  it("fails through the wallet error channel when address resolution executes", async () => {
    const addressClient = client(preprod).withAddress("not-an-address")

    await expect(addressClient.address()).rejects.toThrow("Invalid address format: not-an-address")
  })

  it("fails through the wallet error channel for invalid reward addresses", async () => {
    const addressClient = client(preprod).withAddress(VALID_TESTNET_ADDRESS, "not-a-reward-address")

    await expect(addressClient.rewardAddress()).rejects.toThrow("Invalid reward address format: not-a-reward-address")
  })
})