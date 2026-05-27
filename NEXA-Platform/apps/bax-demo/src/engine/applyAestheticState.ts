/**
 * @file applyAestheticState.ts
 * @role MAE 파이프라인 orchestrator.
 */

import type { ComponentDeclaration } from '../types/component'
import type { MaeContext } from './MaeContext'
import type { MaeRenderState } from './renderState'
import { createEmptyRenderState } from './renderState'
import { DefaultLayoutPolicy } from './LayoutPolicy/DefaultLayoutPolicy'
import { DefaultDepthProfile, mapAlarmToUrgency } from './DepthProfile/DefaultDepthProfile'
import { resolveAsrBase, clampVoidRatio } from './guardrails/asrPolicy'
import { shouldDisableVibration } from './guardrails/vibrationGate'
import { VIEWPORT_SCALE } from './viewportScale'

const layoutPolicy = new DefaultLayoutPolicy()
const depthProfile = new DefaultDepthProfile()

export interface MaeDecision {
  phase?: 'urgent' | 'fine_tune'
  void_ratio_delta?: number
  focus_blur_scale?: number
}

export function syncComponentUrgency(
  components: ComponentDeclaration[],
  targetId: string | null,
  alarmLevel: MaeContext['alarmState']['level'],
): ComponentDeclaration[] {
  return components.map((c) => {
    if (c.id !== targetId) {
      const base = c.priority === 'TEXTURE' ? 'NONE' : 'NORMAL'
      return { ...c, urgency: base }
    }
    if (alarmLevel === 'CRITICAL') return { ...c, urgency: 'CRITICAL' }
    if (alarmLevel === 'HIGH') return { ...c, urgency: 'HIGH' }
    return { ...c, urgency: c.priority === 'TEXTURE' ? 'NONE' : 'NORMAL' }
  })
}

export function computeAestheticState(
  ctx: MaeContext,
  decision: MaeDecision = {},
): MaeRenderState {
  const state = createEmptyRenderState()
  let voidRatio = ctx.void_ratio
  let focusBlur = ctx.focus_blur_scale

  if (decision.void_ratio_delta != null) {
    const floor = resolveAsrBase(ctx.bax_mode, ctx.viewport_band, ctx.aesthetic_tuning.asrPreferenceOffset)
    voidRatio = clampVoidRatio(voidRatio + decision.void_ratio_delta, floor)
  }
  if (decision.focus_blur_scale != null) {
    focusBlur = Math.min(1, Math.max(0, decision.focus_blur_scale))
  }
  if (ctx.alarmState.level === 'CRITICAL') {
    focusBlur = 1
  }

  const synced = syncComponentUrgency(ctx.components, ctx.alarmState.component_id, ctx.alarmState.level)
  const blocks = synced.filter((c) => c.layer === 'BLOCK')
  const overlays = synced.filter((c) => c.layer === 'OVERLAY')

  const layout = layoutPolicy.resolve(blocks, ctx)
  const bandScale = VIEWPORT_SCALE[ctx.viewport_band]

  state.gridTemplateColumns = layout.gridTemplate.columns
  state.gridTemplateRows = layout.gridTemplate.rows
  state.void_ratio = voidRatio
  state.canvas_scale = bandScale.canvas_scale
  state.focus_blur_scale = focusBlur
  state.light_source_x = ctx.light_source_x
  state.light_source_y = ctx.light_source_y
  state.overflowFallback = layout.overflowFallback ?? false
  state.asrOverride = ctx.asrOverride ?? false

  const vibrationOff = shouldDisableVibration(ctx.circuit_state, 30)
  const vib = ctx.aesthetic_tuning.vibrationProfile
  state.sparklineVisible =
    !vibrationOff && vib.sparklineEnabled && vib.sparklineIntensity > 0

  for (const p of layout.placements) {
    const decl = blocks.find((c) => c.id === p.componentId)
    if (!decl) continue
    const urgency = mapAlarmToUrgency(ctx.alarmState.level, decl.urgency)
    const visual = depthProfile.resolve(
      decl.depth,
      urgency,
      ctx.bax_mode,
      focusBlur * bandScale.blur_scale,
      ctx.aesthetic_tuning.depthProfileTuning,
    )
    state.visuals[decl.id] = {
      ...visual,
      gridArea: p.gridArea,
      isMainFocus: decl.id === ctx.main_focus_id,
      isAlarmTarget: decl.id === ctx.alarmState.component_id && ctx.alarmState.level !== 'NONE',
      hidden:
        ctx.viewport_band === 'sm' &&
        decl.priority === 'TEXTURE' &&
        ctx.alarmState.level !== 'CRITICAL' &&
        decl.id !== 'anchor',
    }
  }

  for (const decl of overlays) {
    const urgency = mapAlarmToUrgency(ctx.alarmState.level, decl.urgency)
    const visual = depthProfile.resolve(
      decl.depth,
      urgency,
      ctx.bax_mode,
      focusBlur * bandScale.blur_scale,
      ctx.aesthetic_tuning.depthProfileTuning,
    )
    const overlayHidden = decl.id === 'sparkline-float' ? !state.sparklineVisible : false
    state.visuals[decl.id] = { ...visual, hidden: overlayHidden }
  }

  return state
}
