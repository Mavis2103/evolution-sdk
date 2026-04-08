import { Layer, Ref } from "effect"

import * as Ctx from "./ctx.js"
import * as BuilderResolve from "./resolve.js"
import * as BuilderState from "./state.js"

const makeBuildOptions = (config: Ctx.TxBuilderConfig, options: Ctx.BuildOptions): Ctx.BuildOptions => ({
  ...options,
  evaluator: BuilderResolve.resolveEvaluator(config, options),
  slotConfig: BuilderResolve.resolveSlotConfig(config, options)
})

/**
 * Builds the scoped runtime environment required by the main transaction build
 * pipeline.
 */
export const makeBuildRuntimeLayer = (
  config: Ctx.TxBuilderConfig,
  options: Ctx.BuildOptions = BuilderState.DEFAULT_BUILD_OPTIONS
) => {
  const buildOptions = makeBuildOptions(config, options)

  return Layer.mergeAll(
    Layer.effect(Ctx.TxContext, Ref.make(BuilderState.makeInitialTxBuilderState())),
    Layer.effect(
      Ctx.PhaseContextTag,
      Ref.make<Ctx.PhaseContext>(BuilderState.makeInitialPhaseContext(buildOptions))
    ),
    Layer.succeed(Ctx.TxBuilderConfigTag, config),
    Layer.succeed(Ctx.BuildOptionsTag, buildOptions),
    Layer.effect(Ctx.ProtocolParametersTag, BuilderResolve.resolveProtocolParameters(config, buildOptions)),
    Layer.effect(Ctx.ChangeAddressTag, BuilderResolve.resolveChangeAddress(config, buildOptions)),
    Layer.effect(Ctx.AvailableUtxosTag, BuilderResolve.resolveAvailableUtxos(config, buildOptions))
  )
}
