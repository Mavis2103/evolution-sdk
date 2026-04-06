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
import type {
  AddressClient,
  AddressClientEffect,
  ClientAssembly,
  OfflineSignerClient,
  OfflineSignerClientEffect,
  ReadClient,
  ReadOnlyClient,
  ReadOnlyClientEffect,
  SigningClient,
  SigningClientEffect
} from "./Client.js"
import { blockfrost, koios, kupmios, maestro } from "./internal/Providers.js"
import { cip30Wallet, privateKeyWallet, readOnlyWallet, seedWallet } from "./internal/Wallets.js"

type ResolvedSignerWallet = WalletNew.SigningWallet | WalletNew.ApiWallet

const createAddressClient = (chain: Chain, wallet: WalletNew.ReadOnlyWallet): AddressClient => ({
  address: wallet.address,
  rewardAddress: wallet.rewardAddress,
  chain,
  withBlockfrost: (config) => createReadOnlyClient(chain, blockfrost(config), wallet),
  withKoios: (config) => createReadOnlyClient(chain, koios(config), wallet),
  withKupmios: (config) => createReadOnlyClient(chain, kupmios(config), wallet),
  withMaestro: (config) => createReadOnlyClient(chain, maestro(config), wallet),
  effect: wallet.effect satisfies AddressClientEffect
})

const createOfflineSignerEffect = (wallet: ResolvedSignerWallet): OfflineSignerClientEffect => ({
  address: wallet.effect.address.bind(wallet.effect),
  rewardAddress: wallet.effect.rewardAddress.bind(wallet.effect),
  signTx: (txOrHex, context) =>
    wallet.type === "api"
      ? wallet.effect.signTx(txOrHex, context ? { utxos: context.utxos } : undefined)
      : wallet.effect.signTx(txOrHex, context),
  signMessage: wallet.effect.signMessage.bind(wallet.effect)
})

const createOfflineSignerClient = (chain: Chain, wallet: ResolvedSignerWallet): OfflineSignerClient => {
  const effectInterface = createOfflineSignerEffect(wallet)

  return {
    address: () => Effect.runPromise(effectInterface.address()),
    rewardAddress: () => Effect.runPromise(effectInterface.rewardAddress()),
    signTx: (txOrHex, context) => Effect.runPromise(effectInterface.signTx(txOrHex, context)),
    signMessage: (address, payload) => Effect.runPromise(effectInterface.signMessage(address, payload)),
    chain,
    withBlockfrost: (config) => createSigningClient(chain, blockfrost(config), wallet),
    withKoios: (config) => createSigningClient(chain, koios(config), wallet),
    withKupmios: (config) => createSigningClient(chain, kupmios(config), wallet),
    withMaestro: (config) => createSigningClient(chain, maestro(config), wallet),
    effect: effectInterface
  }
}

const createReadOnlyClient = (
  chain: Chain,
  provider: Provider.Provider,
  wallet: WalletNew.ReadOnlyWallet
): ReadOnlyClient => {
  const toProviderError = (error: WalletNew.WalletError | Provider.ProviderError): Provider.ProviderError =>
    error instanceof Provider.ProviderError ? error : new Provider.ProviderError({ message: error.message, cause: error })

  const effectInterface: ReadOnlyClientEffect = {
    ...provider.effect,
    ...wallet.effect,
    getWalletUtxos: () =>
      wallet.effect.address().pipe(
        Effect.flatMap((address) => provider.effect.getUtxos(address)),
        Effect.mapError(toProviderError)
      ),
    getWalletDelegation: () =>
      wallet.effect.rewardAddress().pipe(
        Effect.flatMap((rewardAddress) => {
          if (!rewardAddress) {
            return Effect.fail(new Provider.ProviderError({ message: "No reward address configured", cause: null }))
          }
          return provider.effect.getDelegation(rewardAddress)
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
    chain,
    newTx: (): ReadOnlyTransactionBuilder => makeTxBuilder({ wallet, provider, chain }),
    effect: effectInterface
  }
}

const createSigningClient = (
  chain: Chain,
  provider: Provider.Provider,
  wallet: ResolvedSignerWallet
): SigningClient => {
  const signTxWithAutoFetch = (
    txOrHex: Transaction.Transaction | string,
    context?: { utxos?: ReadonlyArray<CoreUTxO.UTxO>; referenceUtxos?: ReadonlyArray<CoreUTxO.UTxO> }
  ): Effect.Effect<TransactionWitnessSet.TransactionWitnessSet, WalletNew.WalletError> =>
    Effect.gen(function*() {
      if (wallet.type === "api") {
        return yield* wallet.effect.signTx(txOrHex, context ? { utxos: context.utxos } : undefined)
      }

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
        referenceUtxos = yield* provider.effect.getUtxosByOutRef(tx.body.referenceInputs).pipe(
          Effect.mapError(
            (error) =>
              new WalletNew.WalletError({
                message: `Failed to fetch reference UTxOs: ${error.message}`,
                cause: error
              })
          )
        )
      }

      return yield* wallet.effect.signTx(txOrHex, { ...context, referenceUtxos })
    })

  const effectInterface: SigningClientEffect = {
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
    address: wallet.effect.address.bind(wallet.effect),
    rewardAddress: wallet.effect.rewardAddress.bind(wallet.effect),
    signMessage: wallet.effect.signMessage.bind(wallet.effect),
    signTx: signTxWithAutoFetch,
    getWalletUtxos: () => Effect.flatMap(wallet.effect.address(), (address) => provider.effect.getUtxos(address)),
    getWalletDelegation: () =>
      Effect.flatMap(wallet.effect.rewardAddress(), (rewardAddress) => {
        if (!rewardAddress) {
          return Effect.fail(new Provider.ProviderError({ message: "No reward address configured", cause: null }))
        }
        return provider.effect.getDelegation(rewardAddress)
      })
  }

  return {
    ...provider,
    address: () => Effect.runPromise(effectInterface.address()),
    rewardAddress: () => Effect.runPromise(effectInterface.rewardAddress()),
    signMessage: (address, payload) => Effect.runPromise(effectInterface.signMessage(address, payload)),
    signTx: (txOrHex, context) => Effect.runPromise(effectInterface.signTx(txOrHex, context)),
    getWalletUtxos: () => Effect.runPromise(effectInterface.getWalletUtxos()),
    getWalletDelegation: () => Effect.runPromise(effectInterface.getWalletDelegation()),
    chain,
    newTx: (): SigningTransactionBuilder => makeTxBuilder({ wallet, provider, chain }),
    effect: effectInterface
  }
}

const createReadClient = (chain: Chain, provider: Provider.Provider): ReadClient => ({
  ...provider,
  chain,
  withAddress: (address, rewardAddress) => createReadOnlyClient(chain, provider, readOnlyWallet(address, rewardAddress)(chain)),
  withSeed: (config) => createSigningClient(chain, provider, seedWallet(config)(chain)),
  withPrivateKey: (config) => createSigningClient(chain, provider, privateKeyWallet(config)(chain)),
  withCip30: (api) => createSigningClient(chain, provider, cip30Wallet(api)(chain)),
  newTx: (): ReadOnlyTransactionBuilder => makeTxBuilder({ provider, chain }),
  effect: provider.effect
})

/**
 * Construct a chain-scoped client assembly stage.
 *
 * @since 2.1.0
 * @category constructors
 */
export const client = (chain: Chain = mainnet): ClientAssembly => ({
  chain,
  withBlockfrost: (config) => createReadClient(chain, blockfrost(config)),
  withKoios: (config) => createReadClient(chain, koios(config)),
  withKupmios: (config) => createReadClient(chain, kupmios(config)),
  withMaestro: (config) => createReadClient(chain, maestro(config)),
  withAddress: (address, rewardAddress) => createAddressClient(chain, readOnlyWallet(address, rewardAddress)(chain)),
  withSeed: (config) => createOfflineSignerClient(chain, seedWallet(config)(chain)),
  withPrivateKey: (config) => createOfflineSignerClient(chain, privateKeyWallet(config)(chain)),
  withCip30: (api) => createOfflineSignerClient(chain, cip30Wallet(api)(chain))
})
