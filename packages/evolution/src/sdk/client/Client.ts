import { type Effect } from "effect"

import type * as CoreUTxO from "../../UTxO.js"
import type { ReadOnlyTransactionBuilder, SigningTransactionBuilder } from "../builders/TransactionBuilder.js"
import type * as Provider from "../provider/Provider.js"
import type { EffectToPromiseAPI } from "../Type.js"
import type * as WalletNew from "../wallet/WalletNew.js"
import type { Chain } from "./Chain.js"
import type { BlockfrostConfig, KoiosConfig, KupmiosConfig, MaestroConfig } from "./Providers.js"
import type { PrivateKeyWalletConfig, SeedWalletConfig } from "./Wallets.js"

/**
 * Address capability Effect surface.
 *
 * @since 2.1.0
 * @category model
 */
export interface AddressClientEffect extends WalletNew.ReadOnlyWalletEffect {}

/**
 * Offline signing capability Effect surface.
 *
 * @since 2.1.0
 * @category model
 */
export interface OfflineSignerClientEffect extends AddressClientEffect {
  readonly signTx: (
    tx: Parameters<WalletNew.SigningWalletEffect["signTx"]>[0],
    context?: Parameters<WalletNew.SigningWalletEffect["signTx"]>[1]
  ) => ReturnType<WalletNew.SigningWalletEffect["signTx"]>
  readonly signMessage: WalletNew.SigningWalletEffect["signMessage"]
}

/**
 * Read-only client Effect surface.
 *
 * @since 2.1.0
 * @category model
 */
export interface ReadOnlyClientEffect extends Provider.ProviderEffect, AddressClientEffect {
  readonly getWalletUtxos: () => Effect.Effect<ReadonlyArray<CoreUTxO.UTxO>, Provider.ProviderError>
  readonly getWalletDelegation: () => Effect.Effect<Provider.Delegation, Provider.ProviderError>
}

/**
 * Signing client Effect surface.
 *
 * @since 2.1.0
 * @category model
 */
export interface SigningClientEffect extends Provider.ProviderEffect, OfflineSignerClientEffect {
  readonly getWalletUtxos: () => Effect.Effect<
    ReadonlyArray<CoreUTxO.UTxO>,
    WalletNew.WalletError | Provider.ProviderError
  >
  readonly getWalletDelegation: () => Effect.Effect<Provider.Delegation, WalletNew.WalletError | Provider.ProviderError>
}

/**
 * Client assembly stage scoped to a chain.
 *
 * @since 2.1.0
 * @category model
 */
export interface ClientAssembly {
  readonly chain: Chain
  readonly withBlockfrost: (config: BlockfrostConfig) => ReadClient
  readonly withKoios: (config: KoiosConfig) => ReadClient
  readonly withKupmios: (config: KupmiosConfig) => ReadClient
  readonly withMaestro: (config: MaestroConfig) => ReadClient
  readonly withAddress: (address: string, rewardAddress?: string) => AddressClient
  readonly withSeed: (config: SeedWalletConfig) => OfflineSignerClient
  readonly withPrivateKey: (config: PrivateKeyWalletConfig) => OfflineSignerClient
  readonly withCip30: (api: WalletNew.WalletApi) => OfflineSignerClient
}

/**
 * Read-capable client.
 *
 * @since 2.1.0
 * @category model
 */
export type ReadClient = EffectToPromiseAPI<Provider.ProviderEffect> & {
  readonly chain: Chain
  readonly withAddress: (address: string, rewardAddress?: string) => ReadOnlyClient
  readonly withSeed: (config: SeedWalletConfig) => SigningClient
  readonly withPrivateKey: (config: PrivateKeyWalletConfig) => SigningClient
  readonly withCip30: (api: WalletNew.WalletApi) => SigningClient
  readonly newTx: () => ReadOnlyTransactionBuilder
  readonly effect: Provider.ProviderEffect
}

/**
 * Address-capable client.
 *
 * @since 2.1.0
 * @category model
 */
export type AddressClient = EffectToPromiseAPI<AddressClientEffect> & {
  readonly chain: Chain
  readonly withBlockfrost: (config: BlockfrostConfig) => ReadOnlyClient
  readonly withKoios: (config: KoiosConfig) => ReadOnlyClient
  readonly withKupmios: (config: KupmiosConfig) => ReadOnlyClient
  readonly withMaestro: (config: MaestroConfig) => ReadOnlyClient
  readonly effect: AddressClientEffect
}

/**
 * Signing-capable client without read capability.
 *
 * @since 2.1.0
 * @category model
 */
export type OfflineSignerClient = EffectToPromiseAPI<OfflineSignerClientEffect> & {
  readonly chain: Chain
  readonly withBlockfrost: (config: BlockfrostConfig) => SigningClient
  readonly withKoios: (config: KoiosConfig) => SigningClient
  readonly withKupmios: (config: KupmiosConfig) => SigningClient
  readonly withMaestro: (config: MaestroConfig) => SigningClient
  readonly effect: OfflineSignerClientEffect
}

/**
 * Read-capable client with address resolution.
 *
 * @since 2.1.0
 * @category model
 */
export type ReadOnlyClient = EffectToPromiseAPI<ReadOnlyClientEffect> & {
  readonly chain: Chain
  readonly newTx: () => ReadOnlyTransactionBuilder
  readonly effect: ReadOnlyClientEffect
}

/**
 * Full signing client.
 *
 * @since 2.1.0
 * @category model
 */
export type SigningClient = EffectToPromiseAPI<SigningClientEffect> & {
  readonly chain: Chain
  readonly newTx: () => SigningTransactionBuilder
  readonly effect: SigningClientEffect
}
