import * as Data from "../data/Data.js"
import * as TSchema from "../data/TSchema.js"
import * as Credential from "./Credential.js"

/**
 * Plutus Address - Contains payment credential and optional stake credential
 */
export const Address = TSchema.Struct({
  payment_credential: Credential.PaymentCredential,
  stake_credential: TSchema.UndefinedOr(Credential.StakeCredential)
})

// Export codec object with all conversion functions
export const Codec = Data.withSchema(Address)

// Type export
export type Address = typeof Address.Type
