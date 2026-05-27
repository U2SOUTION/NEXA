/**
 * @file BaxFocusShell.tsx
 * @role 클릭 포커스 · MAIN / ALARM 시각 피드백 shell.
 */

import type { ReactNode } from 'react'
import type { ComponentVisual } from '../types/component'

interface Props {
  id: string
  visual: ComponentVisual
  onFocus: (id: string) => void
  children: ReactNode
}

export function BaxFocusShell({ id, visual, onFocus, children }: Props) {
  if (visual.hidden) return null

  const className = [
    'bax-focus-shell',
    visual.isMainFocus && 'bax-focus-shell--main',
    visual.isAlarmTarget && 'bax-focus-shell--alarm',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      data-bax-id={id}
      style={{ gridArea: visual.gridArea, zIndex: visual.zIndex }}
      onClick={() => onFocus(id)}
      onKeyDown={(e) => e.key === 'Enter' && onFocus(id)}
      role="button"
      tabIndex={0}
      title={`클릭 → 메인 포커스: ${id}`}
    >
      {visual.isMainFocus && <span className="bax-focus-shell__badge bax-focus-shell__badge--main">MAIN</span>}
      {visual.isAlarmTarget && <span className="bax-focus-shell__badge bax-focus-shell__badge--alarm">ALARM</span>}
      {children}
    </div>
  )
}
