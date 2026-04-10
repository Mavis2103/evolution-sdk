import { Either as E, FastCheck, ParseResult, Schema } from "effect"

import * as Credential from "./Credential.js"
import * as CBOR from "./CBOR.js"
import * as Anchor from "./Anchor.js"
import * as DRep from "./DRep.js"
import * as EpochNo from "./EpochNo.js"
import * as UnitInterval from "./UnitInterval.js"
import * as Relay from "./Relay.js"
import * as PoolKeyHash from "./PoolKeyHash.js"
import * as PoolMetadata from "./PoolMetadata.js"
import * as PoolParams from "./PoolParams.js"
import * as Coin from "./Coin.js"
import * as Committee from "./CommitteeCertificates.js"
import * as Delegation from "./DelegationCertificates.js"
import * as DRepCerts from "./DRepCertificates.js"
import * as Pool from "./PoolCertificates.js"
import * as Stake from "./StakeCertificates.js"

/**
 * Certificate union schema based on Conway CDDL specification
 *
 * CDDL: certificate =
 *   [
 *   stake_registration
 *   // stake_deregistration
 *   // stake_delegation
 *   // pool_registration
 *   // pool_retirement
 *   // reg_cert
 *   // unreg_cert
 *   // vote_deleg_cert
 *   // stake_vote_deleg_cert
 *   // stake_reg_deleg_cert
 *   // vote_reg_deleg_cert
 *   // stake_vote_reg_deleg_cert
 *   // auth_committee_hot_cert
 *   // resign_committee_cold_cert
 *   // reg_drep_cert
 *   // unreg_drep_cert
 *   // update_drep_cert
 *   ]
 *
 * stake_registration = (0, stake_credential)
 * stake_deregistration = (1, stake_credential)
 * stake_delegation = (2, stake_credential, pool_keyhash)
 * pool_registration = (3, pool_params)
 * pool_retirement = (4, pool_keyhash, epoch_no)
 * reg_cert = (7, stake_credential, coin)
 * unreg_cert = (8, stake_credential, coin)
 * vote_deleg_cert = (9, stake_credential, drep)
 * stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
 * stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
 * vote_reg_deleg_cert = (12, stake_credential, drep, coin)
 * stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
 * auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
 * resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
 * reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
 * unreg_drep_cert = (17, drep_credential, coin)
 * update_drep_cert = (18, drep_credential, anchor/ nil)
 *
 * @since 2.0.0
 * @category schemas
 */
export const Certificate = Schema.Union(
  // 0: stake_registration = (0, stake_credential)
  Stake.StakeRegistration,
  // 1: stake_deregistration = (1, stake_credential)
  Stake.StakeDeregistration,
  // 2: stake_delegation = (2, stake_credential, pool_keyhash)
  Stake.StakeDelegation,
  // 3: pool_registration = (3, pool_params)
  Pool.PoolRegistration,
  // 4: pool_retirement = (4, pool_keyhash, epoch_no)
  Pool.PoolRetirement,
  // 7: reg_cert = (7, stake_credential, coin)
  Stake.RegCert,
  // 8: unreg_cert = (8, stake_credential, coin)
  Stake.UnregCert,
  // 9: vote_deleg_cert = (9, stake_credential, drep)
  Delegation.VoteDelegCert,
  // 10: stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
  Delegation.StakeVoteDelegCert,
  // 11: stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
  Delegation.StakeRegDelegCert,
  // 12: vote_reg_deleg_cert = (12, stake_credential, drep, coin)
  Delegation.VoteRegDelegCert,
  // 13: stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
  Delegation.StakeVoteRegDelegCert,
  // 14: auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
  Committee.AuthCommitteeHotCert,
  // 15: resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
  Committee.ResignCommitteeColdCert,
  // 16: reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
  DRepCerts.RegDrepCert,
  // 17: unreg_drep_cert = (17, drep_credential, coin)
  DRepCerts.UnregDrepCert,
  // 18: update_drep_cert = (18, drep_credential, anchor/ nil)
  DRepCerts.UpdateDrepCert
)

export const CDDLSchema = Schema.Union(
  // 0: stake_registration = (0, stake_credential)
  Schema.Tuple(Schema.Literal(0n), Credential.CDDLSchema),
  // 1: stake_deregistration = (1, stake_credential)
  Schema.Tuple(Schema.Literal(1n), Credential.CDDLSchema),
  // 2: stake_delegation = (2, stake_credential, pool_keyhash)
  Schema.Tuple(Schema.Literal(2n), Credential.CDDLSchema, CBOR.ByteArray),
  // 3: pool_registration = (3, pool_params)
  Schema.Tuple(
    Schema.Literal(3n),
    // Flattened PoolParams.CDDLSchema
    CBOR.ByteArray, // operator (pool_keyhash as bytes)
    CBOR.ByteArray, // vrf_keyhash (as bytes)
    CBOR.Integer, // pledge (coin)
    CBOR.Integer, // cost (coin)
    UnitInterval.CDDLSchema, // margin
    CBOR.ByteArray, // reward_account (bytes)
    Schema.Array(CBOR.ByteArray), // pool_owners (array of addr_keyhash bytes)
    Schema.Array(Schema.encodedSchema(Relay.FromCDDL)), // relays
    Schema.NullOr(Schema.encodedSchema(PoolMetadata.FromCDDL)) // pool_metadata
  ),
  // 4: pool_retirement = (4, pool_keyhash, epoch_no)
  Schema.Tuple(Schema.Literal(4n), CBOR.ByteArray, CBOR.Integer),
  // 7: reg_cert = (7, stake_credential , coin)
  Schema.Tuple(Schema.Literal(7n), Credential.CDDLSchema, CBOR.Integer),
  // 8: unreg_cert = (8, stake_credential, coin)
  Schema.Tuple(Schema.Literal(8n), Credential.CDDLSchema, CBOR.Integer),
  // 9: vote_deleg_cert = (9, stake_credential, drep)
  Schema.Tuple(Schema.Literal(9n), Credential.CDDLSchema, DRep.CDDLSchema),
  // 10: stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
  Schema.Tuple(Schema.Literal(10n), Credential.CDDLSchema, CBOR.ByteArray, DRep.CDDLSchema),
  // 11: stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
  Schema.Tuple(Schema.Literal(11n), Credential.CDDLSchema, CBOR.ByteArray, CBOR.Integer),
  // 12: vote_reg_deleg_cert = (12, stake_credential, drep, coin)
  Schema.Tuple(Schema.Literal(12n), Credential.CDDLSchema, DRep.CDDLSchema, CBOR.Integer),
  // 13: stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
  Schema.Tuple(Schema.Literal(13n), Credential.CDDLSchema, CBOR.ByteArray, DRep.CDDLSchema, CBOR.Integer),
  // 14: auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
  Schema.Tuple(Schema.Literal(14n), Credential.CDDLSchema, Credential.CDDLSchema),
  // 15: resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
  Schema.Tuple(Schema.Literal(15n), Credential.CDDLSchema, Schema.NullishOr(Anchor.CDDLSchema)),
  // 16: reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
  Schema.Tuple(Schema.Literal(16n), Credential.CDDLSchema, CBOR.Integer, Schema.NullishOr(Anchor.CDDLSchema)),
  // 17: unreg_drep_cert = (17, drep_credential, coin)
  Schema.Tuple(Schema.Literal(17n), Credential.CDDLSchema, CBOR.Integer),
  // 18: update_drep_cert = (18, drep_credential, anchor/ nil)
  Schema.Tuple(Schema.Literal(18n), Credential.CDDLSchema, Schema.NullishOr(Anchor.CDDLSchema))
)

/**
 * CDDL schema for Certificate based on Conway specification.
 *
 * Transforms between CBOR tuple representation and Certificate union.
 * Each certificate type is encoded as [type_id, ...fields]
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCDDL = Schema.transformOrFail(CDDLSchema, Schema.typeSchema(Certificate), {
  strict: true,
  encode: (toA) =>
    E.gen(function* () {
      switch (toA._tag) {
        case "StakeRegistration": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          return [0n, credentialCDDL] as const
        }
        case "StakeDeregistration": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          return [1n, credentialCDDL] as const
        }
        case "StakeDelegation": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          const poolKeyHashBytes = yield* ParseResult.encodeEither(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          return [2n, credentialCDDL, poolKeyHashBytes] as const
        }
        case "PoolRegistration": {
          const poolParamsCDDL = yield* ParseResult.encodeEither(PoolParams.FromCDDL)(toA.poolParams)
          // Spread encoded PoolParams fields directly into the certificate tuple (flattening)
          return [3n, ...poolParamsCDDL] as const
        }
        case "PoolRetirement": {
          const poolKeyHashBytes = yield* ParseResult.encodeEither(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          return [4n, poolKeyHashBytes, BigInt(toA.epoch)] as const
        }
        case "RegCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          return [7n, credentialCDDL, toA.coin] as const
        }
        case "UnregCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          return [8n, credentialCDDL, toA.coin] as const
        }
        case "VoteDelegCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          const drepCDDL = yield* ParseResult.encodeEither(DRep.FromCDDL)(toA.drep)
          return [9n, credentialCDDL, drepCDDL] as const
        }
        case "StakeVoteDelegCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          const poolKeyHashBytes = yield* ParseResult.encodeEither(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          const drepCDDL = yield* ParseResult.encodeEither(DRep.FromCDDL)(toA.drep)
          return [10n, credentialCDDL, poolKeyHashBytes, drepCDDL] as const
        }
        case "StakeRegDelegCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          const poolKeyHashBytes = yield* ParseResult.encodeEither(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          return [11n, credentialCDDL, poolKeyHashBytes, toA.coin] as const
        }
        case "VoteRegDelegCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          const drepCDDL = yield* ParseResult.encodeEither(DRep.FromCDDL)(toA.drep)
          return [12n, credentialCDDL, drepCDDL, toA.coin] as const
        }
        case "StakeVoteRegDelegCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.stakeCredential)
          const poolKeyHashBytes = yield* ParseResult.encodeEither(PoolKeyHash.FromBytes)(toA.poolKeyHash)
          const drepCDDL = yield* ParseResult.encodeEither(DRep.FromCDDL)(toA.drep)
          return [13n, credentialCDDL, poolKeyHashBytes, drepCDDL, toA.coin] as const
        }
        case "AuthCommitteeHotCert": {
          const coldCredentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.committeeColdCredential)
          const hotCredentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.committeeHotCredential)
          return [14n, coldCredentialCDDL, hotCredentialCDDL] as const
        }
        case "ResignCommitteeColdCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.committeeColdCredential)
          const anchorCDDL = toA.anchor ? yield* ParseResult.encodeEither(Anchor.FromCDDL)(toA.anchor) : null
          return [15n, credentialCDDL, anchorCDDL] as const
        }
        case "RegDrepCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.drepCredential)
          const anchorCDDL = toA.anchor ? yield* ParseResult.encodeEither(Anchor.FromCDDL)(toA.anchor) : null
          return [16n, credentialCDDL, toA.coin, anchorCDDL] as const
        }
        case "UnregDrepCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.drepCredential)
          return [17n, credentialCDDL, toA.coin] as const
        }
        case "UpdateDrepCert": {
          const credentialCDDL = yield* ParseResult.encodeEither(Credential.FromCDDL)(toA.drepCredential)
          const anchorCDDL = toA.anchor ? yield* ParseResult.encodeEither(Anchor.FromCDDL)(toA.anchor) : null
          return [18n, credentialCDDL, anchorCDDL] as const
        }
      }
    }),
  decode: (fromA) =>
    E.gen(function* () {
      switch (fromA[0]) {
        case 0n: {
          // stake_registration = (0, stake_credential)
          const [, credentialCDDL] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          return new Stake.StakeRegistration({ stakeCredential }, { disableValidation: true })
        }
        case 1n: {
          // stake_deregistration = (1, stake_credential)
          const [, credentialCDDL] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          return new Stake.StakeDeregistration({ stakeCredential }, { disableValidation: true })
        }
        case 2n: {
          // stake_delegation = (2, stake_credential, pool_keyhash)
          const [, credentialCDDL, poolKeyHashBytes] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const poolKeyHash = yield* ParseResult.decodeEither(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          return new Stake.StakeDelegation({ stakeCredential, poolKeyHash }, { disableValidation: true })
        }
        case 3n: {
          // pool_registration = (3, ...pool_params fields flattened)
          const [
            ,
            operatorBytes,
            vrfKeyhashBytes,
            pledge,
            cost,
            marginEncoded,
            rewardAccountBytes,
            poolOwnersBytes,
            relaysEncoded,
            poolMetadataEncoded
          ] = fromA as unknown as readonly [
            3n,
            Uint8Array,
            Uint8Array,
            bigint,
            bigint,
            unknown,
            Uint8Array,
            ReadonlyArray<Uint8Array>,
            ReadonlyArray<unknown>,
            unknown | null
          ]
          const poolParams = yield* ParseResult.decodeEither(PoolParams.FromCDDL)([
            operatorBytes,
            vrfKeyhashBytes,
            pledge,
            cost,
            marginEncoded as any,
            rewardAccountBytes,
            poolOwnersBytes as any,
            relaysEncoded as any,
            poolMetadataEncoded as any
          ] as any)
          return new Pool.PoolRegistration({ poolParams }, { disableValidation: true })
        }
        case 4n: {
          // pool_retirement = (4, pool_keyhash, epoch_no)
          const [, poolKeyHashBytes, epochBigInt] = fromA
          const poolKeyHash = yield* ParseResult.decodeEither(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          const epoch = epochBigInt as EpochNo.EpochNo
          return new Pool.PoolRetirement({ poolKeyHash, epoch }, { disableValidation: true })
        }
        case 7n: {
          // reg_cert = (7, stake_credential, coin)
          const [, credentialCDDL, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const coin = yield* ParseResult.decodeEither(Schema.typeSchema(Coin.Coin))(coinBigInt)
          return new Stake.RegCert({ stakeCredential, coin }, { disableValidation: true })
        }
        case 8n: {
          // unreg_cert = (8, stake_credential, coin)
          const [, credentialCDDL, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const coin = yield* ParseResult.decodeEither(Schema.typeSchema(Coin.Coin))(coinBigInt)
          return new Stake.UnregCert({ stakeCredential, coin }, { disableValidation: true })
        }
        case 9n: {
          // vote_deleg_cert = (9, stake_credential, drep)
          const [, credentialCDDL, drepCDDL] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const drep = yield* ParseResult.decodeEither(DRep.FromCDDL)(drepCDDL)
          return new Delegation.VoteDelegCert({ stakeCredential, drep }, { disableValidation: true })
        }
        case 10n: {
          // stake_vote_deleg_cert = (10, stake_credential, pool_keyhash, drep)
          const [, credentialCDDL, poolKeyHashBytes, drepCDDL] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const poolKeyHash = yield* ParseResult.decodeEither(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          const drep = yield* ParseResult.decodeEither(DRep.FromCDDL)(drepCDDL)
          return new Delegation.StakeVoteDelegCert(
            {
              stakeCredential,
              poolKeyHash,
              drep
            },
            { disableValidation: true }
          )
        }
        case 11n: {
          // stake_reg_deleg_cert = (11, stake_credential, pool_keyhash, coin)
          const [, credentialCDDL, poolKeyHashBytes, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const poolKeyHash = yield* ParseResult.decodeEither(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          const coin = yield* ParseResult.decodeEither(Schema.typeSchema(Coin.Coin))(coinBigInt)
          return new Delegation.StakeRegDelegCert(
            {
              stakeCredential,
              poolKeyHash,
              coin
            },
            { disableValidation: true }
          )
        }
        case 12n: {
          // vote_reg_deleg_cert = (12, stake_credential, drep, coin)
          const [, credentialCDDL, drepCDDL, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const drep = yield* ParseResult.decodeEither(DRep.FromCDDL)(drepCDDL)
          const coin = yield* ParseResult.decodeEither(Schema.typeSchema(Coin.Coin))(coinBigInt)
          return new Delegation.VoteRegDelegCert({ stakeCredential, drep, coin }, { disableValidation: true })
        }
        case 13n: {
          // stake_vote_reg_deleg_cert = (13, stake_credential, pool_keyhash, drep, coin)
          const [, credentialCDDL, poolKeyHashBytes, drepCDDL, coinBigInt] = fromA
          const stakeCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const poolKeyHash = yield* ParseResult.decodeEither(PoolKeyHash.FromBytes)(poolKeyHashBytes)
          const drep = yield* ParseResult.decodeEither(DRep.FromCDDL)(drepCDDL)
          const coin = yield* ParseResult.decodeEither(Schema.typeSchema(Coin.Coin))(coinBigInt)
          return new Delegation.StakeVoteRegDelegCert(
            {
              stakeCredential,
              poolKeyHash,
              drep,
              coin
            },
            { disableValidation: true }
          )
        }
        case 14n: {
          // auth_committee_hot_cert = (14, committee_cold_credential, committee_hot_credential)
          const [, coldCredentialCDDL, hotCredentialCDDL] = fromA
          const committeeColdCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(coldCredentialCDDL)
          const committeeHotCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(hotCredentialCDDL)
          return new Committee.AuthCommitteeHotCert(
            {
              committeeColdCredential,
              committeeHotCredential
            },
            { disableValidation: true }
          )
        }
        case 15n: {
          // resign_committee_cold_cert = (15, committee_cold_credential, anchor/ nil)
          const [, credentialCDDL, anchorCDDL] = fromA
          const committeeColdCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const anchor = anchorCDDL ? yield* ParseResult.decodeEither(Anchor.FromCDDL)(anchorCDDL) : undefined
          return new Committee.ResignCommitteeColdCert(
            {
              committeeColdCredential,
              anchor
            },
            { disableValidation: true }
          )
        }
        case 16n: {
          // reg_drep_cert = (16, drep_credential, coin, anchor/ nil)
          const [, credentialCDDL, coinBigInt, anchorCDDL] = fromA
          const drepCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const coin = yield* ParseResult.decodeEither(Schema.typeSchema(Coin.Coin))(coinBigInt)
          const anchor = anchorCDDL ? yield* ParseResult.decodeEither(Anchor.FromCDDL)(anchorCDDL) : undefined
          return new DRepCerts.RegDrepCert({ drepCredential, coin, anchor }, { disableValidation: true })
        }
        case 17n: {
          // unreg_drep_cert = (17, drep_credential, coin)
          const [, credentialCDDL, coinBigInt] = fromA
          const drepCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const coin = yield* ParseResult.decodeEither(Schema.typeSchema(Coin.Coin))(coinBigInt)
          return new DRepCerts.UnregDrepCert({ drepCredential, coin }, { disableValidation: true })
        }
        case 18n: {
          // update_drep_cert = (18, drep_credential, anchor/ nil)
          const [, credentialCDDL, anchorCDDL] = fromA
          const drepCredential = yield* ParseResult.decodeEither(Credential.FromCDDL)(credentialCDDL)
          const anchor = anchorCDDL ? yield* ParseResult.decodeEither(Anchor.FromCDDL)(anchorCDDL) : undefined
          return new DRepCerts.UpdateDrepCert({ drepCredential, anchor }, { disableValidation: true })
        }
      }
    })
})

/**
 * CBOR bytes transformation schema for Certificate.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORBytes = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    CBOR.FromBytes(options), // Uint8Array → CBOR
    FromCDDL // CBOR → Certificate
  )

/**
 * CBOR hex transformation schema for Certificate.
 *
 * @since 2.0.0
 * @category schemas
 */
export const FromCBORHex = (options: CBOR.CodecOptions = CBOR.CML_DEFAULT_OPTIONS) =>
  Schema.compose(
    Schema.Uint8ArrayFromHex, // string → Uint8Array
    FromCBORBytes(options) // Uint8Array → Certificate
  )

/**
 * Type alias for Certificate.
 *
 * @since 2.0.0
 * @category model
 */
export type Certificate = typeof Certificate.Type

/**
 * Check if the given value is a valid Certificate.
 *
 * @since 2.0.0
 * @category predicates
 */
export const is = Schema.is(Certificate)

/**
 * FastCheck arbitrary for Certificate instances.
 *
 * @since 2.0.0
 * @category testing
 */
export const arbitrary = FastCheck.oneof(
  Credential.arbitrary.map((stakeCredential) => new Stake.StakeRegistration({ stakeCredential })),
  Credential.arbitrary.map((stakeCredential) => new Stake.StakeDeregistration({ stakeCredential })),
  FastCheck.tuple(Credential.arbitrary, PoolKeyHash.arbitrary).map(
    ([stakeCredential, poolKeyHash]) => new Stake.StakeDelegation({ stakeCredential, poolKeyHash })
  ),
  PoolParams.arbitrary.map((poolParams) => new Pool.PoolRegistration({ poolParams })),
  FastCheck.tuple(PoolKeyHash.arbitrary, EpochNo.generator).map(
    ([poolKeyHash, epoch]) => new Pool.PoolRetirement({ poolKeyHash, epoch: epoch as EpochNo.EpochNo })
  ),
  FastCheck.tuple(Credential.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, coin]) => new Stake.RegCert({ stakeCredential, coin })
  ),
  FastCheck.tuple(Credential.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, coin]) => new Stake.UnregCert({ stakeCredential, coin })
  ),
  FastCheck.tuple(Credential.arbitrary, DRep.arbitrary).map(
    ([stakeCredential, drep]) => new Delegation.VoteDelegCert({ stakeCredential, drep })
  ),
  FastCheck.tuple(Credential.arbitrary, PoolKeyHash.arbitrary, DRep.arbitrary).map(
    ([stakeCredential, poolKeyHash, drep]) =>
      new Delegation.StakeVoteDelegCert({ stakeCredential, poolKeyHash, drep })
  ),
  FastCheck.tuple(Credential.arbitrary, PoolKeyHash.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, poolKeyHash, coin]) =>
      new Delegation.StakeRegDelegCert({ stakeCredential, poolKeyHash, coin })
  ),
  FastCheck.tuple(Credential.arbitrary, DRep.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, drep, coin]) => new Delegation.VoteRegDelegCert({ stakeCredential, drep, coin })
  ),
  FastCheck.tuple(Credential.arbitrary, PoolKeyHash.arbitrary, DRep.arbitrary, Coin.arbitrary).map(
    ([stakeCredential, poolKeyHash, drep, coin]) =>
      new Delegation.StakeVoteRegDelegCert({ stakeCredential, poolKeyHash, drep, coin })
  ),
  FastCheck.tuple(Credential.arbitrary, Credential.arbitrary).map(
    ([committeeColdCredential, committeeHotCredential]) =>
      new Committee.AuthCommitteeHotCert({ committeeColdCredential, committeeHotCredential })
  ),
  FastCheck.tuple(Credential.arbitrary, FastCheck.option(Anchor.arbitrary, { nil: undefined })).map(
    ([committeeColdCredential, anchor]) =>
      new Committee.ResignCommitteeColdCert({ committeeColdCredential, anchor })
  ),
  FastCheck.tuple(Credential.arbitrary, Coin.arbitrary, FastCheck.option(Anchor.arbitrary, { nil: undefined })).map(
    ([drepCredential, coin, anchor]) => new DRepCerts.RegDrepCert({ drepCredential, coin, anchor })
  ),
  FastCheck.tuple(Credential.arbitrary, Coin.arbitrary).map(
    ([drepCredential, coin]) => new DRepCerts.UnregDrepCert({ drepCredential, coin })
  ),
  FastCheck.tuple(Credential.arbitrary, FastCheck.option(Anchor.arbitrary, { nil: undefined })).map(
    ([drepCredential, anchor]) => new DRepCerts.UpdateDrepCert({ drepCredential, anchor })
  )
)

/**
 * Parse a Certificate from CBOR bytes.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORBytes = (bytes: Uint8Array, options?: CBOR.CodecOptions): Certificate =>
  Schema.decodeSync(FromCBORBytes(options))(bytes)

/**
 * Parse a Certificate from CBOR hex string.
 *
 * @since 2.0.0
 * @category parsing
 */
export const fromCBORHex = (hex: string, options?: CBOR.CodecOptions): Certificate =>
  Schema.decodeSync(FromCBORHex(options))(hex)

/**
 * Convert a Certificate to CBOR bytes.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORBytes = (certificate: Certificate, options?: CBOR.CodecOptions): Uint8Array =>
  Schema.encodeSync(FromCBORBytes(options))(certificate)

/**
 * Convert a Certificate to CBOR hex string.
 *
 * @since 2.0.0
 * @category encoding
 */
export const toCBORHex = (certificate: Certificate, options?: CBOR.CodecOptions): string =>
  Schema.encodeSync(FromCBORHex(options))(certificate)
