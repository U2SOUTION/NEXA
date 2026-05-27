/**
 * @file focusLayout.ts
 * @role main_focus · CRITICAL hero 동적 Grid 배치.
 */

import type { ComponentDeclaration } from '../../types/component'
import type { ComponentPlacement, GridTemplate } from './types'

const TEXTURE_IDS = new Set(['anchor', 'glyph-north', 'glyph-east', 'tagline'])

const TEXTURE_SLOTS: Record<string, string> = {
  anchor: '1 / 1 / 2 / 2',
  'glyph-north': '2 / 1 / 3 / 2',
  'glyph-east': '3 / 1 / 4 / 2',
  tagline: '4 / 1 / 5 / 2',
}

const SECONDARY_NORMAL = [
  '2 / 2 / 3 / 3',
  '2 / 3 / 3 / 4',
  '3 / 2 / 4 / 3',
  '3 / 3 / 4 / 4',
  '4 / 2 / 5 / 4',
]

const SECONDARY_CRITICAL = [
  '2 / 1 / 3 / 2',
  '2 / 2 / 3 / 3',
  '2 / 3 / 3 / 4',
  '3 / 1 / 4 / 4',
  '4 / 1 / 5 / 2',
  '4 / 2 / 5 / 3',
  '4 / 3 / 5 / 4',
]

export function buildFocusLayout(
  components: ComponentDeclaration[],
  heroId: string,
  isCritical: boolean,
): { gridTemplate: GridTemplate; placements: ComponentPlacement[] } {
  const ids = new Set(components.map((c) => c.id))
  const placements: ComponentPlacement[] = []
  const heroDecl = components.find((c) => c.id === heroId)

  const heroArea = isCritical ? '1 / 1 / 2 / 4' : '1 / 2 / 2 / 4'
  if (ids.has(heroId)) {
    placements.push({
      componentId: heroId,
      gridArea: heroArea,
      minWidth: heroDecl?.minWidth,
    })
  }

  const others = components
    .filter((c) => c.id !== heroId && c.layer === 'BLOCK')
    .sort((a, b) => slotOrder(a.id) - slotOrder(b.id))

  const secondarySlots = isCritical ? SECONDARY_CRITICAL : SECONDARY_NORMAL
  let slotIdx = 0

  for (const comp of others) {
    if (TEXTURE_IDS.has(comp.id) && !isCritical) {
      const area = TEXTURE_SLOTS[comp.id]
      if (area) placements.push({ componentId: comp.id, gridArea: area })
      continue
    }
    if (slotIdx < secondarySlots.length) {
      placements.push({
        componentId: comp.id,
        gridArea: secondarySlots[slotIdx++],
        minWidth: comp.minWidth,
      })
    }
  }

  return {
    gridTemplate: {
      columns: isCritical ? '1fr 1fr 1fr' : 'minmax(140px, 0.9fr) 1fr 1fr',
      rows: 'auto auto auto auto',
    },
    placements: placements.filter((p) => ids.has(p.componentId)),
  }
}

function slotOrder(id: string): number {
  const order = [
    'sentinel',
    'gauge-humidity',
    'gauge-pressure',
    'bar-load',
    'ring-status',
    'anchor',
    'glyph-north',
    'glyph-east',
    'tagline',
  ]
  return order.indexOf(id)
}

export function resolveHeroId(
  mainFocusId: string,
  alarmLevel: string,
  alarmComponentId: string | null,
): string {
  if (alarmLevel === 'CRITICAL' && alarmComponentId) return alarmComponentId
  return mainFocusId
}
