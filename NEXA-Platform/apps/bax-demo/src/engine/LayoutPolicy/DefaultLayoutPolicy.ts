/**
 * @file DefaultLayoutPolicy.ts
 * @role main_focus · Alarm hero 동적 Grid.
 */

import type { ComponentDeclaration } from '../../types/component'
import type { LayoutPolicy, ResolvedLayout } from './types'
import type { MaeContext } from '../MaeContext'
import { buildFocusLayout, resolveHeroId } from './focusLayout'

const BAND_WIDTH = { xl: 1280, md: 768, sm: 360 } as const

export class DefaultLayoutPolicy implements LayoutPolicy {
  resolve(components: ComponentDeclaration[], ctx: MaeContext): ResolvedLayout {
    const isCritical = ctx.alarmState.level === 'CRITICAL'
    const heroId = resolveHeroId(ctx.main_focus_id, ctx.alarmState.level, ctx.alarmState.component_id)
    const essentials = components.filter((c) => c.priority === 'ESSENTIAL')
    const totalMinWidth = essentials.reduce((sum, c) => sum + (c.minWidth ?? 0), 0)
    const available = BAND_WIDTH[ctx.viewport_band]

    if (totalMinWidth > available || ctx.viewport_band === 'sm') {
      return this.singleColumnFallback(components, heroId, isCritical, ctx.viewport_band === 'sm')
    }

    const { gridTemplate, placements } = buildFocusLayout(components, heroId, isCritical)
    return { gridTemplate, placements }
  }

  private singleColumnFallback(
    components: ComponentDeclaration[],
    heroId: string,
    isCritical: boolean,
    isSm: boolean,
  ): ResolvedLayout {
    const byId = Object.fromEntries(components.map((c) => [c.id, c]))
    const hero = byId[heroId]
    const rest = components.filter((c) => c.id !== heroId && c.layer === 'BLOCK')
    const rows = hero
      ? [hero, ...rest.filter((c) => (isCritical || isSm ? c.priority !== 'TEXTURE' || c.id === 'anchor' : true))]
      : components.filter((c) => c.layer === 'BLOCK')

    return {
      gridTemplate: { columns: '1fr', rows: `repeat(${Math.max(rows.length, 1)}, auto)` },
      placements: rows.map((c, i) => ({
        componentId: c.id,
        gridArea: `${i + 1} / 1`,
        minWidth: c.minWidth,
      })),
      overflowFallback: true,
    }
  }
}
