/**
 * Provider constructors for the client API.
 *
 * Each constructor returns a `Provider` instance directly — usable standalone
 * or passed to `createClient({ provider: blockfrost(...) })`.
 *
 * @since 2.1.0
 * @module
 */

import * as Blockfrost from "../provider/Blockfrost.js"
import * as Koios from "../provider/Koios.js"
import * as Kupmios from "../provider/Kupmios.js"
import * as Maestro from "../provider/Maestro.js"
import type { Provider } from "../provider/Provider.js"

// ── Blockfrost ────────────────────────────────────────────────────────────────

/**
 * Configuration for the Blockfrost provider.
 *
 * @since 2.1.0
 * @category model
 */
export interface BlockfrostConfig {
  readonly baseUrl: string
  readonly projectId?: string
}

/**
 * Blockfrost provider constructor.
 *
 * @since 2.1.0
 * @category constructors
 */
export const blockfrost = (config: BlockfrostConfig): Provider => Blockfrost.custom(config.baseUrl, config.projectId)

// ── Koios ─────────────────────────────────────────────────────────────────────

/**
 * Configuration for the Koios provider.
 *
 * @since 2.1.0
 * @category model
 */
export interface KoiosConfig {
  readonly baseUrl: string
  readonly token?: string
}

/**
 * Koios provider constructor.
 *
 * @since 2.1.0
 * @category constructors
 */
export const koios = (config: KoiosConfig): Provider => new Koios.Koios(config.baseUrl, config.token)

// ── Kupmios ───────────────────────────────────────────────────────────────────

/**
 * Configuration for the Kupmios provider (Kupo + Ogmios).
 *
 * @since 2.1.0
 * @category model
 */
export interface KupmiosConfig {
  readonly kupoUrl: string
  readonly ogmiosUrl: string
  readonly headers?: {
    readonly ogmiosHeader?: Record<string, string>
    readonly kupoHeader?: Record<string, string>
  }
}

/**
 * Kupmios provider constructor.
 *
 * @since 2.1.0
 * @category constructors
 */
export const kupmios = (config: KupmiosConfig): Provider =>
  new Kupmios.KupmiosProvider(config.kupoUrl, config.ogmiosUrl, config.headers)

// ── Maestro ───────────────────────────────────────────────────────────────────

/**
 * Configuration for the Maestro provider.
 *
 * @since 2.1.0
 * @category model
 */
export interface MaestroConfig {
  readonly baseUrl: string
  readonly apiKey: string
  readonly turboSubmit?: boolean
}

/**
 * Maestro provider constructor.
 *
 * @since 2.1.0
 * @category constructors
 */
export const maestro = (config: MaestroConfig): Provider =>
  new Maestro.MaestroProvider(config.baseUrl, config.apiKey, config.turboSubmit)
