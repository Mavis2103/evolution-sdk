/**
 * Time utilities for Cardano blockchain time operations.
 * Provides type-safe conversions between slots and Unix time.
 *
 * @module Time
 * @since 2.0.0
 */

import type * as Network from "../Network.js"
import type * as Slot from "./Slot.js"
import * as SlotConfig from "./SlotConfig.js"
import * as UnixTime from "./UnixTime.js"

export * as Slot from "./Slot.js"
export * as SlotConfig from "./SlotConfig.js"
export * as UnixTime from "./UnixTime.js"

/**
 * Convert a slot number to Unix time (in milliseconds).
 *
 * @param slot - The slot number to convert
 * @param slotConfig - The network's slot configuration
 * @returns Unix timestamp in milliseconds
 *
 * @category Conversion
 * @since 2.0.0
 *
 * @example
 * ```typescript
 * import * as Time from "@evolution-sdk/core/Time"
 *
 * const slot = 12345678n
 * const config = Time.SlotConfig.SLOT_CONFIG_NETWORK.Mainnet
 * const unixTime = Time.slotToUnixTime(slot, config)
 * console.log(unixTime) // Unix time in milliseconds
 * ```
 */
export const slotToUnixTime = (slot: Slot.Slot, slotConfig: SlotConfig.SlotConfig): UnixTime.UnixTime => {
  const msAfterBegin = (slot - slotConfig.zeroSlot) * BigInt(slotConfig.slotLength)
  return slotConfig.zeroTime + msAfterBegin
}

/**
 * Convert Unix time (in milliseconds) to the enclosing slot number.
 * Uses floor division to find the slot that contains the given time.
 *
 * @param unixTime - Unix timestamp in milliseconds
 * @param slotConfig - The network's slot configuration
 * @returns The slot number that contains this Unix time
 *
 * @category Conversion
 * @since 2.0.0
 *
 * @example
 * ```typescript
 * import * as Time from "@evolution-sdk/core/Time"
 *
 * const unixTime = 1596059091000n // Mainnet Shelley start
 * const config = Time.SlotConfig.SLOT_CONFIG_NETWORK.Mainnet
 * const slot = Time.unixTimeToSlot(unixTime, config)
 * console.log(slot) // 4492800n
 * ```
 */
export const unixTimeToSlot = (unixTime: UnixTime.UnixTime, slotConfig: SlotConfig.SlotConfig): Slot.Slot => {
  const timePassed = unixTime - slotConfig.zeroTime
  const slotsPassed = timePassed / BigInt(slotConfig.slotLength)
  return slotsPassed + slotConfig.zeroSlot
}

/**
 * Get the current slot number for a network.
 *
 * @param network - The network to get current slot for
 * @returns Current slot number
 *
 * @category Utility
 * @since 2.0.0
 *
 * @example
 * ```typescript
 * import * as Time from "@evolution-sdk/core/Time"
 *
 * const currentSlot = Time.getCurrentSlot("Mainnet")
 * console.log(currentSlot) // Current mainnet slot
 * ```
 */
export const getCurrentSlot = (network: Network.Network): Slot.Slot => {
  const config = SlotConfig.SLOT_CONFIG_NETWORK[network]
  const now = UnixTime.now()
  return unixTimeToSlot(now, config)
}

/**
 * Check if a slot is in the future relative to current time.
 *
 * @param slot - The slot to check
 * @param slotConfig - The network's slot configuration
 * @returns True if the slot is in the future
 *
 * @category Utility
 * @since 2.0.0
 */
export const isSlotInFuture = (slot: Slot.Slot, slotConfig: SlotConfig.SlotConfig): boolean => {
  const now = UnixTime.now()
  const slotTime = slotToUnixTime(slot, slotConfig)
  return slotTime > now
}

/**
 * Check if a slot is in the past relative to current time.
 *
 * @param slot - The slot to check
 * @param slotConfig - The network's slot configuration
 * @returns True if the slot is in the past
 *
 * @category Utility
 * @since 2.0.0
 */
export const isSlotInPast = (slot: Slot.Slot, slotConfig: SlotConfig.SlotConfig): boolean => {
  const now = UnixTime.now()
  const slotTime = slotToUnixTime(slot, slotConfig)
  return slotTime < now
}

/**
 * Get the slot at a specific offset from now (in milliseconds).
 *
 * @param offsetMs - Offset in milliseconds (positive for future, negative for past)
 * @param network - The network
 * @returns Slot number at the offset time
 *
 * @category Utility
 * @since 2.0.0
 *
 * @example
 * ```typescript
 * import * as Time from "@evolution-sdk/core/Time"
 *
 * // Get slot 5 minutes from now
 * const futureSlot = Time.getSlotAt(5 * 60 * 1000, "Mainnet")
 *
 * // Get slot 10 minutes ago
 * const pastSlot = Time.getSlotAt(-10 * 60 * 1000, "Mainnet")
 * ```
 */
export const getSlotAt = (offsetMs: number, network: Network.Network): Slot.Slot => {
  const config = SlotConfig.SLOT_CONFIG_NETWORK[network]
  const targetTime = UnixTime.now() + BigInt(offsetMs)
  return unixTimeToSlot(targetTime, config)
}
