/**
 * @file BlockBadges.tsx
 * @role MAIN / ALARM 배지 — BLOCK 루트 내부에만 삽입.
 */

import type { ComponentVisual } from '../types/component'

export function BlockBadges({ visual }: { visual: ComponentVisual }) {
  return (
    <>
      {visual.isMainFocus && <span className="bax-block__badge bax-block__badge--main">MAIN</span>}
      {visual.isAlarmTarget && <span className="bax-block__badge bax-block__badge--alarm">ALARM</span>}
    </>
  )
}
