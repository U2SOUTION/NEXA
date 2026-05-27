/**
 * @file registry.ts
 * @role ComponentDeclaration registry — 시뮬레이션용 다중 타이포·그래프·카드.
 */

import type { ComponentDeclaration } from '../types/component'

/** IoT 관제 데모 — 9종 (BLOCK 8 + OVERLAY 1) */
export const MVP_COMPONENT_DECLARATIONS: ComponentDeclaration[] = [
  // ── TEXTURE · 타이포 (좌측 축) ──
  { id: 'anchor', priority: 'TEXTURE', urgency: 'NONE', depth: 'BG', mutability: 'IMMUTABLE', layer: 'BLOCK' },
  { id: 'glyph-north', priority: 'TEXTURE', urgency: 'NONE', depth: 'MID', mutability: 'IMMUTABLE', layer: 'BLOCK' },
  { id: 'glyph-east', priority: 'TEXTURE', urgency: 'NONE', depth: 'BG', mutability: 'IMMUTABLE', layer: 'BLOCK' },
  { id: 'tagline', priority: 'TEXTURE', urgency: 'NONE', depth: 'BG', mutability: 'IMMUTABLE', layer: 'BLOCK' },

  // ── ESSENTIAL · 핵심 관제 ──
  {
    id: 'sentinel',
    priority: 'ESSENTIAL',
    urgency: 'NORMAL',
    depth: 'FG',
    mutability: 'MUTABLE',
    layer: 'BLOCK',
    minWidth: 300,
  },
  {
    id: 'gauge-humidity',
    priority: 'ESSENTIAL',
    urgency: 'NORMAL',
    depth: 'FG',
    mutability: 'MUTABLE',
    layer: 'BLOCK',
    minWidth: 180,
  },

  // ── CONTEXTUAL · 보조 그래프 ──
  { id: 'gauge-pressure', priority: 'CONTEXTUAL', urgency: 'NORMAL', depth: 'MID', mutability: 'MUTABLE', layer: 'BLOCK' },
  { id: 'bar-load', priority: 'CONTEXTUAL', urgency: 'NORMAL', depth: 'MID', mutability: 'MUTABLE', layer: 'BLOCK' },
  { id: 'ring-status', priority: 'CONTEXTUAL', urgency: 'NORMAL', depth: 'FG', mutability: 'MUTABLE', layer: 'BLOCK' },

  // ── OVERLAY ──
  { id: 'sparkline-float', priority: 'CONTEXTUAL', urgency: 'NORMAL', depth: 'FG', mutability: 'MUTABLE', layer: 'OVERLAY' },
]

export type BaxComponentId = (typeof MVP_COMPONENT_DECLARATIONS)[number]['id']

export const BLOCK_COMPONENT_IDS = MVP_COMPONENT_DECLARATIONS.filter((c) => c.layer === 'BLOCK').map(
  (c) => c.id,
)
