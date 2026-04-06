import { Effect, ParseResult } from "effect"

import * as Transaction from "../../Transaction.js"
import type * as TransactionWitnessSet from "../../TransactionWitnessSet.js"
import type * as CoreUTxO from "../../UTxO.js"
import {
  makeTxBuilder,
  type ReadOnlyTransactionBuilder,
  type SigningTransactionBuilder
} from "../builders/TransactionBuilder.js"
import * as Provider from "../provider/Provider.js"
import * as WalletNew from "../wallet/WalletNew.js"
import { type Chain, mainnet } from "./Chain.js"
import {
  type ApiWalletClient,
  type MinimalClient,
  type MinimalClientEffect,
  type ProviderOnlyClient,
  type ReadOnlyClient,
  type ReadOnlyWalletClient,
  type SigningClient,
  type SigningClientEffect,
  type SigningWalletClient
} from "./Client.js"
import {
  type AnyWallet,
  type ApiWalletFactory,
  type ReadOnlyWalletFactory,
  type SigningWalletFactory,
  type WalletFactory
} from "./Wallets.js"

type ResolvedWallet = WalletNew.ReadOnlyWallet | WalletNew.SigningWallet | WalletNew.ApiWallet

const resolveWallet = (wallet: AnyWallet, chain: Chain): ResolvedWallet =>
  typeof wallet === "function" ? wallet(chain) : wallet

/**
 * Construct a ReadOnlyWalletClient with chain metadata and combinator method.
 *
 * @since 2.0.0
 * @category constructors
 */
const createReadOnlyWalletClient = (chain: Chain, wallet: WalletNew.ReadOnlyWallet): ReadOnlyWalletClient => ({
  address: wallet.address,
  rewardAddress: wallet.rewardAddress,
  chain,
  attachProvider: (provider) => createReadOnlyClient(chain, provider, wallet),
  effect: wallet.effect
})

/**
 * Construct a ReadOnlyClient by composing a provider and a read-only wallet.
 *
 * @since 2.0.0
 * @category constructors
 */
const createReadOnlyClient = (
  chain: Chain,
  provider: Provider.Provider,
  wallet: WalletNew.ReadOnlyWallet
): ReadOnlyClient => {
  const toProviderError = (e: WalletNew.WalletError | Provider.ProviderError): Provider.ProviderError =>
    e instanceof Provider.ProviderError ? e : new Provider.ProviderError({ message: e.message, cause: e })

  const effectInterface = {
    ...provider.effect,
    ...wallet.effect,
    getWalletUtxos: () =>
      wallet.effect.address().pipe(
        Effect.flatMap((addr) => provider.effect.getUtxos(addr)),
        Effect.mapError(toProviderError)
      ),
    getWalletDelegation: () =>
      wallet.effect.rewardAddress().pipe(
        Effect.flatMap((rewardAddr) => {
          if (!rewardAddr)
            return Effect.fail(new Provider.ProviderError({ message: "No reward address configured", cause: null }))
          return provider.effect.getDelegation(rewardAddr)
        }),
        Effect.mapError(toProviderError)
      )
  }

  return {
    ...provider,
    address: wallet.address,
    rewardAddress: wallet.rewardAddress,
    getWalletUtxos: () => Effect.runPromise(effectInterface.getWalletUtxos()),
    getWalletDelegation: () => Effect.runPromise(effectInterface.getWalletDelegation()),
    newTx: (): ReadOnlyTransactionBuilder => makeTxBuilder({ wallet, provider, chain }),
    effect: effectInterface
  }
}

/**
 * Construct a SigningWalletClient with chain metadata and combinator method.
 *
 * @since 2.0.0
 * @category constructors
 */
const createSigningWalletClient = (chain: Chain, wallet: WalletNew.SigningWallet): SigningWalletClient => ({
  ...wallet,
  chain,
  attachProvider: (provider) => createSigningClient(chain, provider, wallet)
})

/**
 * Construct an ApiWalletClient with combinator method.
 *
 * @since 2.0.0
 * @category constructors
 */
const createApiWalletClient = (chain: Chain, wallet: WalletNew.ApiWallet): ApiWalletClient => ({
  ...wallet,
  chain,
  attachProvider: (provider) => createSigningClient(chain, provider, wallet)
})

/**
 * Construct a SigningClient by composing a provider and a signing or API wallet.
 *
 * @since 2.0.0
 * @category constructors
 */
const createSigningClient = (
  chain: Chain,
  provider: Provider.Provider,
  wallet: WalletNew.SigningWallet | WalletNew.ApiWallet
): SigningClient => {
  // Enhanced signTx that auto-fetches reference UTxOs from the network.
  const signTxWithAutoFetch = (
    txOrHex: Transaction.Transaction | string,
    context?: { utxos?: ReadonlyArray<CoreUTxO.UTxO>; referenceUtxos?: ReadonlyArray<CoreUTxO.UTxO> }
  ): Effect.Effect<TransactionWitnessSet.TransactionWitnessSet, WalletNew.WalletError> =>
    Effect.gen(function* () {
      if (context?.referenceUtxos && context.referenceUtxos.length > 0) {
        return yield* wallet.effect.signTx(txOrHex, context)
      }

      const tx =
        typeof txOrHex === "string"
          ? yield* ParseResult.decodeUnknownEither(Transaction.FromCBORHex())(txOrHex).pipe(
              Effect.mapError(
                (cause) => new WalletNew.WalletError({ message: `Failed to decode transaction: ${cause}`, cause })
              )
            )
          : txOrHex

      let referenceUtxos: ReadonlyArray<CoreUTxO.UTxO> = []
      if (tx.body.referenceInputs && tx.body.referenceInputs.length > 0) {
        referenceUtxos = yield* provider.effect
          .getUtxosByOutRef(tx.body.referenceInputs)
          .pipe(
            Effect.mapError(
              (e) => new WalletNew.WalletError({ message: `Failed to fetch reference UTxOs: ${e.message}`, cause: e })
            )
          )
      }

      return yield* wallet.effect.signTx(txOrHex, { ...context, referenceUtxos })
    })

  const effectInterface: SigningClientEffect = {
    // Provider methods — explicit to avoid silent overrides if provider gains new fields
    getProtocolParameters: provider.effect.getProtocolParameters.bind(provider.effect),
    getUtxos: provider.effect.getUtxos.bind(provider.effect),
    getUtxosWithUnit: provider.effect.getUtxosWithUnit.bind(provider.effect),
    getUtxoByUnit: provider.effect.getUtxoByUnit.bind(provider.effect),
    getUtxosByOutRef: provider.effect.getUtxosByOutRef.bind(provider.effect),
    getDelegation: provider.effect.getDelegation.bind(provider.effect),
    getDatum: provider.effect.getDatum.bind(provider.effect),
    awaitTx: provider.effect.awaitTx.bind(provider.effect),
    submitTx: provider.effect.submitTx.bind(provider.effect),
    evaluateTx: provider.effect.evaluateTx.bind(provider.effect),
    // Wallet methods
    address: wallet.effect.address.bind(wallet.effect),
    rewardAddress: wallet.effect.rewardAddress.bind(wallet.effect),
    signMessage: wallet.effect.signMessage.bind(wallet.effect),
    // Composite methods
    signTx: signTxWithAutoFetch,
    getWalletUtxos: () => Effect.flatMap(wallet.effect.address(), (addr) => provider.effect.getUtxos(addr)),
    getWalletDelegation: () =>
      Effect.flatMap(wallet.effect.rewardAddress(), (rewardAddr) => {
        if (!rewardAddr)
          return Effect.fail(new Provider.ProviderError({ message: "No reward address configured", cause: null }))
        return provider.effect.getDelegation(rewardAddr)
      })
  }

  return {
    ...wallet,
    ...provider,
    signTx: (txOrHex, context) => Effect.runPromise(signTxWithAutoFetch(txOrHex, context)),
    getWalletUtxos: () => Effect.runPromise(effectInterface.getWalletUtxos()),
    getWalletDelegation: () => Effect.runPromise(effectInterface.getWalletDelegation()),
    newTx: (): SigningTransactionBuilder => makeTxBuilder({ wallet, provider, chain }),
    effect: effectInterface
  }
}

/**
 * Construct a ProviderOnlyClient with chain metadata and combinator method.
 *
 * @since 2.0.0
 * @category constructors
 */
const createProviderOnlyClient = (chain: Chain, provider: Provider.Provider): ProviderOnlyClient => {
  function attachWallet(wallet: WalletNew.ReadOnlyWallet | ReadOnlyWalletFactory): ReadOnlyClient
  function attachWallet(wallet: WalletNew.SigningWallet | WalletNew.ApiWallet | WalletFactory): SigningClient
  function attachWallet(wallet: AnyWallet): ReadOnlyClient | SigningClient
  function attachWallet(wallet: AnyWallet): ReadOnlyClient | SigningClient {
    const resolved = resolveWallet(wallet, chain)
    if (resolved.type === "read-only") return createReadOnlyClient(chain, provider, resolved)
    return createSigningClient(chain, provider, resolved)
  }

  return {
    ...provider,
    chain,
    attachWallet
  }
}

/**
 * Construct a MinimalClient holding chain metadata and combinator methods.
 *
 * @since 2.0.0
 * @category constructors
 */
const createMinimalClient = (chain: Chain = mainnet): MinimalClient => {
  const effectInterface: MinimalClientEffect = { chain }

  function attachWallet(wallet: WalletNew.ReadOnlyWallet | ReadOnlyWalletFactory): ReadOnlyWalletClient
  function attachWallet(wallet: WalletNew.ApiWallet | ApiWalletFactory): ApiWalletClient
  function attachWallet(wallet: WalletNew.SigningWallet | SigningWalletFactory): SigningWalletClient
  function attachWallet(wallet: WalletFactory): SigningWalletClient | ApiWalletClient
  function attachWallet(wallet: AnyWallet): ReadOnlyWalletClient | ApiWalletClient | SigningWalletClient
  function attachWallet(wallet: AnyWallet): ReadOnlyWalletClient | ApiWalletClient | SigningWalletClient {
    const resolved = resolveWallet(wallet, chain)
    if (resolved.type === "read-only") return createReadOnlyWalletClient(chain, resolved)
    if (resolved.type === "api") return createApiWalletClient(chain, resolved)
    return createSigningWalletClient(chain, resolved)
  }

  return {
    chain,
    attachProvider: (provider) => createProviderOnlyClient(chain, provider),
    attachWallet,
    effect: effectInterface
  }
}

// ── createClient overloads ────────────────────────────────────────────────────

// Provider + ReadOnly Wallet or Factory → ReadOnlyClient
export function createClient(config: {
  chain?: Chain
  provider: Provider.Provider
  wallet: WalletNew.ReadOnlyWallet | ReadOnlyWalletFactory
}): ReadOnlyClient

// Provider + Signing/API Wallet or Factory → SigningClient
export function createClient(config: {
  chain?: Chain
  provider: Provider.Provider
  wallet: WalletNew.SigningWallet | WalletNew.ApiWallet | WalletFactory
}): SigningClient

// Provider only → ProviderOnlyClient
export function createClient(config: { chain?: Chain; provider: Provider.Provider }): ProviderOnlyClient

// ReadOnly Wallet or Factory only → ReadOnlyWalletClient
export function createClient(config: {
  chain?: Chain
  wallet: WalletNew.ReadOnlyWallet | ReadOnlyWalletFactory
}): ReadOnlyWalletClient

// API Wallet only → ApiWalletClient
export function createClient(config: {
  chain?: Chain
  wallet: WalletNew.ApiWallet | ApiWalletFactory
}): ApiWalletClient

// Signing Wallet or Factory only → SigningWalletClient
export function createClient(config: {
  chain?: Chain
  wallet: WalletNew.SigningWallet | SigningWalletFactory
}): SigningWalletClient

// Generic WalletFactory only → wallet-only client shape depends on the factory kind
export function createClient(config: { chain?: Chain; wallet: WalletFactory }): SigningWalletClient | ApiWalletClient

// Chain only or minimal → MinimalClient
export function createClient(config?: { chain?: Chain }): MinimalClient

// Implementation
export function createClient(config?: {
  chain?: Chain
  provider?: Provider.Provider
  wallet?: AnyWallet
}):
  | MinimalClient
  | ReadOnlyClient
  | SigningClient
  | ProviderOnlyClient
  | ReadOnlyWalletClient
  | SigningWalletClient
  | ApiWalletClient {
  const chain = config?.chain ?? mainnet

  if (config?.provider && config?.wallet) {
    const wallet = resolveWallet(config.wallet, chain)
    if (wallet.type === "read-only") return createReadOnlyClient(chain, config.provider, wallet)
    return createSigningClient(chain, config.provider, wallet)
  }

  if (config?.wallet) {
    const wallet = resolveWallet(config.wallet, chain)
    if (wallet.type === "read-only") return createReadOnlyWalletClient(chain, wallet)
    if (wallet.type === "api") return createApiWalletClient(chain, wallet)
    return createSigningWalletClient(chain, wallet)
  }

  if (config?.provider) {
    return createProviderOnlyClient(chain, config.provider)
  }

  return createMinimalClient(chain)
}
