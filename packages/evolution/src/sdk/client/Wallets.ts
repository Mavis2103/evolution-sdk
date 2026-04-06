/**
 * Wallet constructors for the client API.
 *
 * All wallet constructors return chain-aware factories used internally by the
 * flat client assembly API.
 *
 * @since 2.1.0
 * @module
 */

import { Effect, Equal, ParseResult, Schema } from "effect"

import * as CoreAddress from "../../Address.js"
import * as Bytes from "../../Bytes.js"
import * as Ed25519Signature from "../../Ed25519Signature.js"
import * as KeyHash from "../../KeyHash.js"
import type * as NativeScripts from "../../NativeScripts.js"
import * as PoolKeyHash from "../../PoolKeyHash.js"
import * as PrivateKey from "../../PrivateKey.js"
import * as CoreRewardAccount from "../../RewardAccount.js"
import * as CoreRewardAddress from "../../RewardAddress.js"
import * as Transaction from "../../Transaction.js"
import * as TransactionHash from "../../TransactionHash.js"
import * as TransactionWitnessSet from "../../TransactionWitnessSet.js"
import { runEffectPromise } from "../../utils/effect-runtime.js"
import { hashTransaction, hashTransactionRaw } from "../../utils/Hash.js"
import * as CoreUTxO from "../../UTxO.js"
import * as VKey from "../../VKey.js"
import * as Derivation from "../wallet/Derivation.js"
import * as WalletNew from "../wallet/WalletNew.js"
import type { Chain } from "./Chain.js"

// ── Internal helpers ──────────────────────────────────────────────────────────

const extractKeyHashesFromNativeScript = (script: NativeScripts.NativeScriptVariants): Set<string> => {
  const keyHashes = new Set<string>()
  const traverse = (s: NativeScripts.NativeScriptVariants): void => {
    switch (s._tag) {
      case "ScriptPubKey":
        keyHashes.add(Bytes.toHex(s.keyHash))
        break
      case "ScriptAll":
      case "ScriptAny":
        for (const nested of s.scripts) traverse(nested)
        break
      case "ScriptNOfK":
        for (const nested of s.scripts) traverse(nested)
        break
    }
  }
  traverse(script)
  return keyHashes
}

const computeRequiredKeyHashesSync = (params: {
  paymentKhHex?: string
  rewardAddress?: CoreRewardAddress.RewardAddress | null
  stakeKhHex?: string
  tx: Transaction.Transaction
  utxos: ReadonlyArray<CoreUTxO.UTxO>
  referenceUtxos?: ReadonlyArray<CoreUTxO.UTxO>
}): Set<string> => {
  const required = new Set<string>()

  if (params.tx.body.requiredSigners) {
    for (const kh of params.tx.body.requiredSigners) required.add(KeyHash.toHex(kh))
  }

  if (params.tx.witnessSet.nativeScripts) {
    for (const nativeScript of params.tx.witnessSet.nativeScripts) {
      const scriptKeyHashes = extractKeyHashesFromNativeScript(nativeScript.script)
      for (const kh of scriptKeyHashes) required.add(kh)
    }
  }

  if (params.referenceUtxos) {
    for (const utxo of params.referenceUtxos) {
      if (utxo.scriptRef && utxo.scriptRef._tag === "NativeScript") {
        const scriptKeyHashes = extractKeyHashesFromNativeScript(utxo.scriptRef.script)
        for (const kh of scriptKeyHashes) required.add(kh)
      }
    }
  }

  const ownedRefs = new Set<string>(params.utxos.map((u) => CoreUTxO.toOutRefString(u)))
  const checkInputs = (inputs?: ReadonlyArray<Transaction.Transaction["body"]["inputs"][number]>) => {
    if (!inputs || !params.paymentKhHex) return
    for (const input of inputs) {
      const txIdHex = TransactionHash.toHex(input.transactionId)
      const key = `${txIdHex}#${Number(input.index)}`
      if (ownedRefs.has(key)) required.add(params.paymentKhHex)
    }
  }
  checkInputs(params.tx.body.inputs)
  if (params.tx.body.collateralInputs) checkInputs(params.tx.body.collateralInputs)

  if (params.tx.body.withdrawals && params.rewardAddress && params.stakeKhHex) {
    const ourReward = Schema.decodeSync(CoreRewardAccount.FromBech32)(params.rewardAddress)
    for (const [rewardAcc] of params.tx.body.withdrawals.withdrawals.entries()) {
      if (Equal.equals(ourReward, rewardAcc)) {
        required.add(params.stakeKhHex)
        break
      }
    }
  }

  if (params.tx.body.certificates && (params.stakeKhHex || params.paymentKhHex)) {
    for (const cert of params.tx.body.certificates) {
      // Stake credential certs — require stake key
      if (params.stakeKhHex) {
        const stakeCred =
          cert._tag === "StakeRegistration" ||
          cert._tag === "StakeDeregistration" ||
          cert._tag === "StakeDelegation" ||
          cert._tag === "RegCert" ||
          cert._tag === "UnregCert" ||
          cert._tag === "StakeVoteDelegCert" ||
          cert._tag === "StakeRegDelegCert" ||
          cert._tag === "StakeVoteRegDelegCert" ||
          cert._tag === "VoteDelegCert" ||
          cert._tag === "VoteRegDelegCert"
            ? cert.stakeCredential
            : undefined
        if (stakeCred && stakeCred._tag === "KeyHash") {
          const khHex = KeyHash.toHex(stakeCred)
          if (khHex === params.stakeKhHex) required.add(params.stakeKhHex)
        }

        // DRep credential certs — DRep key is typically the stake key
        const drepCred =
          cert._tag === "RegDrepCert" || cert._tag === "UnregDrepCert" || cert._tag === "UpdateDrepCert"
            ? cert.drepCredential
            : undefined
        if (drepCred && drepCred._tag === "KeyHash") {
          const khHex = KeyHash.toHex(drepCred)
          if (khHex === params.stakeKhHex) required.add(params.stakeKhHex)
        }

        // Committee cold credential certs — cold key is typically the stake key
        const committeeColdCred =
          cert._tag === "AuthCommitteeHotCert" || cert._tag === "ResignCommitteeColdCert"
            ? cert.committeeColdCredential
            : undefined
        if (committeeColdCred && committeeColdCred._tag === "KeyHash") {
          const khHex = KeyHash.toHex(committeeColdCred)
          if (khHex === params.stakeKhHex) required.add(params.stakeKhHex)
        }
      }

      // Pool certs — pool operator key is typically the payment key
      if (params.paymentKhHex) {
        if (cert._tag === "PoolRegistration") {
          const operatorHex = PoolKeyHash.toHex(cert.poolParams.operator)
          if (operatorHex === params.paymentKhHex) required.add(params.paymentKhHex)
        }
        if (cert._tag === "PoolRetirement") {
          const poolKhHex = PoolKeyHash.toHex(cert.poolKeyHash)
          if (poolKhHex === params.paymentKhHex) required.add(params.paymentKhHex)
        }
      }
    }
  }

  return required
}

const validateRewardAddressNetwork = (
  rewardAddress: CoreRewardAddress.RewardAddress | null,
  chain: Chain
): Effect.Effect<CoreRewardAddress.RewardAddress | null, WalletNew.WalletError> => {
  if (rewardAddress === null) return Effect.succeed(null)

  return Effect.try({
    try: () => {
      const rewardAccount = CoreRewardAccount.fromBech32(rewardAddress)
      if (rewardAccount.networkId !== chain.id) {
        throw new WalletNew.WalletError({
          message: `Reward address network mismatch: reward address is for network ${rewardAccount.networkId} but chain id is ${chain.id}`
        })
      }
      return rewardAddress
    },
    catch: (cause) =>
      cause instanceof WalletNew.WalletError
        ? cause
        : new WalletNew.WalletError({ message: `Invalid reward address format: ${rewardAddress}`, cause })
  })
}

const makeSigningWalletEffect = (
  rawDerivationEffect: Effect.Effect<Derivation.SeedDerivationResult, WalletNew.WalletError>
): WalletNew.SigningWallet => {
  // Cache the derivation so PBKDF2 and BIP32 key derivation only run once on
  // first wallet method call — consistent with the cip30Wallet caching strategy.
  const derivationEffect = Effect.runSync(Effect.cached(rawDerivationEffect))
  const effectInterface: WalletNew.SigningWalletEffect = {
    address: () => Effect.map(derivationEffect, (d) => d.address),
    rewardAddress: () => Effect.map(derivationEffect, (d) => d.rewardAddress ?? null),
    signTx: (
      txOrHex: Transaction.Transaction | string,
      context?: { utxos?: ReadonlyArray<CoreUTxO.UTxO>; referenceUtxos?: ReadonlyArray<CoreUTxO.UTxO> }
    ) =>
      Effect.gen(function* () {
        const derivation = yield* derivationEffect
        const tx =
          typeof txOrHex === "string"
            ? yield* ParseResult.decodeUnknownEither(Transaction.FromCBORHex())(txOrHex).pipe(
                Effect.mapError(
                  (cause) => new WalletNew.WalletError({ message: `Failed to decode transaction: ${cause}`, cause })
                )
              )
            : txOrHex
        const utxos = context?.utxos ?? []
        const referenceUtxos = context?.referenceUtxos ?? []
        const required = computeRequiredKeyHashesSync({
          paymentKhHex: derivation.paymentKhHex,
          rewardAddress: derivation.rewardAddress ?? null,
          stakeKhHex: derivation.stakeKhHex,
          tx,
          utxos,
          referenceUtxos
        })
        const txHash =
          typeof txOrHex === "string"
            ? hashTransactionRaw(Transaction.extractBodyBytes(Bytes.fromHex(txOrHex)))
            : hashTransaction(tx.body)
        const msg = txHash.hash
        const witnesses: Array<TransactionWitnessSet.VKeyWitness> = []
        const seenVKeys = new Set<string>()
        for (const khHex of required) {
          const sk = derivation.keyStore.get(khHex)
          if (!sk) continue
          const sig = PrivateKey.sign(sk, msg)
          const vk = VKey.fromPrivateKey(sk)
          const vkHex = VKey.toHex(vk)
          if (seenVKeys.has(vkHex)) continue
          seenVKeys.add(vkHex)
          witnesses.push(new TransactionWitnessSet.VKeyWitness({ vkey: vk, signature: sig }))
        }
        return witnesses.length > 0 ? TransactionWitnessSet.fromVKeyWitnesses(witnesses) : TransactionWitnessSet.empty()
      }),
    signMessage: (address: CoreAddress.Address | CoreRewardAddress.RewardAddress, payload: WalletNew.Payload) =>
      Effect.gen(function* () {
        const derivation = yield* derivationEffect
        // Use stake key when signing for a reward address, payment key otherwise.
        // Reward addresses require the stake credential key per CIP-0008.
        const useStakeKey =
          typeof address === "string" && // RewardAddress is a branded string
          derivation.stakeKey !== undefined
        const sk = useStakeKey
          ? PrivateKey.fromBech32(derivation.stakeKey!)
          : PrivateKey.fromBech32(derivation.paymentKey)
        const bytes = typeof payload === "string" ? new TextEncoder().encode(payload) : payload
        const sig = PrivateKey.sign(sk, bytes)
        return { payload, signature: Ed25519Signature.toHex(sig) }
      })
  }
  return {
    type: "signing",
    address: () => runEffectPromise(effectInterface.address()),
    rewardAddress: () => runEffectPromise(effectInterface.rewardAddress()),
    signTx: (txOrHex, context) => runEffectPromise(effectInterface.signTx(txOrHex, context)),
    signMessage: (address, payload) => runEffectPromise(effectInterface.signMessage(address, payload)),
    effect: effectInterface
  }
}

// ── Public wallet types ───────────────────────────────────────────────────────

/**
 * A chain-aware signing wallet factory — receives chain context at client construction time.
 * Returned by `seedWallet` and `privateKeyWallet`.
 *
 * @since 2.1.0
 * @category model
 */
export type SigningWalletFactory = (chain: Chain) => WalletNew.SigningWallet

/**
 * A chain-aware API wallet factory — receives chain context at client construction time.
 * Returned by `cip30Wallet`.
 *
 * @since 2.1.0
 * @category model
 */
export type ApiWalletFactory = (chain: Chain) => WalletNew.ApiWallet

/**
 * A chain-aware signing or API wallet factory — receives chain context at client construction time.
 * Returned by wallet constructors that need chain injection.
 *
 * @since 2.1.0
 * @category model
 */
export type WalletFactory = SigningWalletFactory | ApiWalletFactory

/**
 * A chain-aware read-only wallet factory — receives chain context at client construction time.
 * Returned by `readOnlyWallet`.
 *
 * @since 2.1.0
 * @category model
 */
export type ReadOnlyWalletFactory = (chain: Chain) => WalletNew.ReadOnlyWallet

/**
 * Any wallet instance or factory accepted internally by the client assembly implementation.
 *
 * @since 2.1.0
 * @category model
 */
export type AnyWallet =
  | WalletNew.ReadOnlyWallet
  | WalletNew.SigningWallet
  | WalletNew.ApiWallet
  | SigningWalletFactory
  | ApiWalletFactory
  | WalletFactory
  | ReadOnlyWalletFactory

// ── Config types ──────────────────────────────────────────────────────────────

/**
 * Configuration for the seed phrase wallet.
 *
 * @since 2.1.0
 * @category model
 */
export interface SeedWalletConfig {
  readonly mnemonic: string
  readonly accountIndex?: number
  readonly paymentIndex?: number
  readonly stakeIndex?: number
  readonly addressType?: "Base" | "Enterprise"
  readonly password?: string
}

/**
 * Configuration for the private key wallet.
 *
 * @since 2.1.0
 * @category model
 */
export interface PrivateKeyWalletConfig {
  readonly paymentKey: string
  readonly stakeKey?: string
  readonly addressType?: "Base" | "Enterprise"
}

// ── Constructors ──────────────────────────────────────────────────────────────

/**
 * Read-only wallet — no signing capability.
 * Chain context validates that the address network matches the configured chain.
 *
 * @since 2.1.0
 * @category constructors
 */
export const readOnlyWallet =
  (address: string, rewardAddress?: string): ReadOnlyWalletFactory =>
  (chain: Chain): WalletNew.ReadOnlyWallet => {
    const coreAddress = CoreAddress.fromBech32(address)
    const coreRewardAddress = rewardAddress ? Schema.decodeSync(CoreRewardAddress.RewardAddress)(rewardAddress) : null
    const networkId = CoreAddress.getNetworkId(coreAddress)
    const addressEffect: Effect.Effect<CoreAddress.Address, WalletNew.WalletError> =
      networkId !== chain.id
        ? Effect.fail(
            new WalletNew.WalletError({
              message: `Address network mismatch: address is for network ${networkId} but chain id is ${chain.id}`
            })
          )
        : Effect.succeed(coreAddress)
    const rewardAddressEffect = validateRewardAddressNetwork(coreRewardAddress, chain)
    const effectInterface: WalletNew.ReadOnlyWalletEffect = {
      address: () => addressEffect,
      rewardAddress: () => rewardAddressEffect
    }
    return {
      type: "read-only",
      address: () => Effect.runPromise(addressEffect),
      rewardAddress: () => Effect.runPromise(rewardAddressEffect),
      effect: effectInterface
    }
  }

/**
 * Seed phrase wallet — returns a chain-aware factory.
 * Chain context (networkId) is injected automatically by `client(chain).withSeed(...)`.
 *
 * @since 2.1.0
 * @category constructors
 */
export const seedWallet =
  (config: SeedWalletConfig): SigningWalletFactory =>
  (chain: Chain): WalletNew.SigningWallet => {
    const network: WalletNew.Network = chain.id === 1 ? "Mainnet" : "Testnet"
    const derivationEffect = Derivation.walletFromSeed(config.mnemonic, {
      addressType: config.addressType ?? "Base",
      accountIndex: config.accountIndex ?? 0,
      paymentIndex: config.paymentIndex ?? 0,
      stakeIndex: config.stakeIndex ?? 0,
      password: config.password,
      network
    }).pipe(Effect.mapError((cause) => new WalletNew.WalletError({ message: cause.message, cause })))
    return makeSigningWalletEffect(derivationEffect)
  }

/**
 * Private key wallet — returns a chain-aware factory.
 * Chain context (networkId) is injected automatically by `client(chain).withPrivateKey(...)`.
 *
 * @since 2.1.0
 * @category constructors
 */
export const privateKeyWallet =
  (config: PrivateKeyWalletConfig): SigningWalletFactory =>
  (chain: Chain): WalletNew.SigningWallet => {
    const network: WalletNew.Network = chain.id === 1 ? "Mainnet" : "Testnet"
    const derivationEffect = Derivation.walletFromPrivateKey(config.paymentKey, {
      stakeKeyBech32: config.stakeKey,
      addressType: config.addressType ?? (config.stakeKey ? "Base" : "Enterprise"),
      network
    }).pipe(Effect.mapError((cause) => new WalletNew.WalletError({ message: cause.message, cause })))
    return makeSigningWalletEffect(derivationEffect)
  }

/**
 * CIP-30 browser wallet — wraps a wallet API (e.g. from `window.cardano.nami.enable()`).
 *
 * @since 2.1.0
 * @category constructors
 */
export const cip30Wallet =
  (api: WalletNew.WalletApi): ApiWalletFactory =>
  (chain: Chain): WalletNew.ApiWallet => {
  const fetchAddress = Effect.gen(function* () {
    const used = yield* Effect.tryPromise({
      try: () => api.getUsedAddresses(),
      catch: (e) => new WalletNew.WalletError({ message: "Failed to fetch used addresses", cause: e as Error })
    })
    const unused = yield* Effect.tryPromise({
      try: () => api.getUnusedAddresses(),
      catch: (e) => new WalletNew.WalletError({ message: "Failed to fetch unused addresses", cause: e as Error })
    })
    const addrStr = used[0] ?? unused[0]
    if (!addrStr) return yield* Effect.fail(new WalletNew.WalletError({ message: "Wallet API returned no addresses", cause: null }))
    const resolvedAddress = yield* Effect.orElse(
      Effect.try({ try: () => CoreAddress.fromBech32(addrStr), catch: () => addrStr }),
      () =>
        Effect.try({
          try: () => CoreAddress.fromHex(addrStr),
          catch: (e) => new WalletNew.WalletError({ message: `Invalid address format from wallet: ${addrStr}`, cause: e as Error })
        })
    )
    const networkId = CoreAddress.getNetworkId(resolvedAddress)
    if (networkId !== chain.id) {
      return yield* Effect.fail(
        new WalletNew.WalletError({
          message: `Wallet network mismatch: wallet is on network ${networkId} but chain id is ${chain.id}`
        })
      )
    }
    return resolvedAddress
  })

  const fetchRewardAddress = Effect.gen(function* () {
    const rewards = yield* Effect.tryPromise({
      try: () => api.getRewardAddresses(),
      catch: (e) => new WalletNew.WalletError({ message: "Failed to fetch reward addresses", cause: e as Error })
    })
    if (!rewards[0]) return null
    const rewardAddress = yield* Schema.decodeUnknown(CoreRewardAddress.RewardAddress)(rewards[0]).pipe(
      Effect.mapError((e) => new WalletNew.WalletError({ message: `Invalid reward address from wallet`, cause: e }))
    )
    return yield* validateRewardAddressNetwork(rewardAddress, chain)
  })

  const effectInterface: WalletNew.ApiWalletEffect = {
    address: () => fetchAddress,
    rewardAddress: () => fetchRewardAddress,
    signTx: (txOrHex: Transaction.Transaction | string, _context?: { utxos?: ReadonlyArray<CoreUTxO.UTxO> }) =>
      Effect.gen(function* () {
        const cbor = typeof txOrHex === "string" ? txOrHex : Transaction.toCBORHex(txOrHex)
        const witnessHex = yield* Effect.tryPromise({
          try: () => api.signTx(cbor, true),
          catch: (cause) =>
            new WalletNew.WalletError({
              message: `Failed to sign transaction: ${(cause as Error).message ?? cause}`,
              cause
            })
        })
        return yield* ParseResult.decodeUnknownEither(TransactionWitnessSet.FromCBORHex())(witnessHex).pipe(
          Effect.mapError(
            (cause) => new WalletNew.WalletError({ message: `Failed to decode witness set: ${cause}`, cause })
          )
        )
      }),
    signMessage: (address: CoreAddress.Address | CoreRewardAddress.RewardAddress, payload: WalletNew.Payload) =>
      Effect.gen(function* () {
        const addressHex =
          address instanceof CoreAddress.Address
            ? CoreAddress.toHex(address)
            : CoreRewardAccount.toHex(CoreRewardAccount.fromBech32(address))
        const result = yield* Effect.tryPromise({
          try: () => api.signData(addressHex, payload),
          catch: (cause) => new WalletNew.WalletError({ message: "User rejected message signing", cause })
        })
        return { payload, signature: result.signature }
      }),
    submitTx: (txOrHex: Transaction.Transaction | string) =>
      Effect.gen(function* () {
        const cbor = typeof txOrHex === "string" ? txOrHex : Transaction.toCBORHex(txOrHex)
        const txHashHex = yield* Effect.tryPromise({
          try: () => api.submitTx(cbor),
          catch: (cause) => new WalletNew.WalletError({ message: (cause as Error).message, cause: cause as Error })
        })
        return Schema.decodeSync(TransactionHash.FromHex)(txHashHex)
      })
  }

  return {
    type: "api" as const,
    api,
    address: () => Effect.runPromise(effectInterface.address()),
    rewardAddress: () => Effect.runPromise(effectInterface.rewardAddress()),
    signTx: (txOrHex, context) => Effect.runPromise(effectInterface.signTx(txOrHex, context)),
    signMessage: (address, payload) => Effect.runPromise(effectInterface.signMessage(address, payload)),
    submitTx: (txOrHex) => Effect.runPromise(effectInterface.submitTx(txOrHex)),
    effect: effectInterface
  }
}
