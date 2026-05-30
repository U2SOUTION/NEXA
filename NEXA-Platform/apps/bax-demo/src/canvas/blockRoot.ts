/**
 * @file blockRoot.ts
 * @role BLOCK 루트 — grid·visual·포커스를 단일 div에 병합 (래퍼 제거).
 */

import type { CSSProperties, KeyboardEvent } from 'react'
import type { ComponentVisual } from '../types/component'

export function blockClass(visual: ComponentVisual, base: string, extra?: string): string {
  return [
    base,
    'bax-block',
    visual.isMainFocus && 'bax-block--main',
    visual.isAlarmTarget && 'bax-block--alarm',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}

export function blockStyle(visual: ComponentVisual, extra?: CSSProperties): CSSProperties {
  return {
    gridArea: visual.gridArea,
    zIndex: visual.zIndex,
    opacity: visual.opacity,
    filter: visual.blurPx ? `blur(${visual.blurPx}px)` : undefined,
    ...extra,
  }
}

export function blockHandlers(id: string, onFocus: (id: string) => void) {
  return {
    'data-bax-id': id,
    onClick: () => onFocus(id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter') onFocus(id)
    },
    role: 'button' as const,
    tabIndex: 0,
    title: `클릭 → 메인 포커스: ${id}`,
  }
}
