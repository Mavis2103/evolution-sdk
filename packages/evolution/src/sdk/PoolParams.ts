/**
 * SDK PoolParams module - user-friendly types for pool registration parameters.
 *
 * @since 2.0.0
 * @module SDK/PoolParams
 */

import { Schema } from "effect"

import * as CorePoolParams from "../core/PoolParams.js"

/**
 * User-friendly pool registration parameters type (lightweight encoded form).
 *
 * @since 2.0.0
 * @category model
 */
export type PoolParams = typeof CorePoolParams.PoolParams.Encoded

/**
 * Convert from Core PoolParams to SDK PoolParams (encode to lightweight form).
 *
 * @since 2.0.0
 * @category conversions
 */
export const fromCore = Schema.encodeSync(CorePoolParams.PoolParams)

/**
 * Convert from SDK PoolParams to Core PoolParams (decode to strict form).
 *
 * @since 2.0.0
 * @category conversions
 */
export const toCore = Schema.decodeSync(CorePoolParams.PoolParams)
