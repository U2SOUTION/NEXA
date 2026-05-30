/**
 * @file GlyphLabel.tsx
 * @role TEXTURE 타이포 — glyph-north · glyph-east · tagline.
 */

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { ComponentVisual } from '../types/component'
import { blockClass, blockHandlers, blockStyle } from '../canvas/blockRoot'
import { BlockBadges } from './BlockBadges'

interface Props {
  id: string
  visual: ComponentVisual
  primary: string
  secondary?: string
  variant?: 'hero' | 'axis' | 'caption'
  onFocus: (id: string) => void
}

const LINE_BASE: CSSProperties = {
  display: 'block',
  width: '100%',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
}

function fitsBox(el: HTMLElement): boolean {
  return el.scrollWidth <= el.clientWidth + 0.5
}

function prepPrimary(el: HTMLElement, width: number) {
  el.style.display = 'block'
  el.style.width = `${width}px`
  el.style.maxWidth = '100%'
  el.style.boxSizing = 'border-box'
  el.style.whiteSpace = 'nowrap'
  el.style.margin = '0'
  el.style.padding = '0'
}

function firstCharLeft(el: HTMLElement): number {
  const node = el.firstChild
  if (node?.nodeType === Node.TEXT_NODE && node.textContent?.length) {
    const range = document.createRange()
    range.setStart(node, 0)
    range.setEnd(node, 1)
    return range.getBoundingClientRect().left
  }
  const first = el.querySelector('[data-glyph-char]') as HTMLElement | null
  return first ? first.getBoundingClientRect().left : el.getBoundingClientRect().left
}

function fitLetterSpacing(el: HTMLElement, maxWidth: number): number {
  el.style.letterSpacing = '0px'
  if (!el.textContent || el.textContent.length <= 1) return 0

  let lo = 0
  let hi = 120
  let best = 0

  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2
    el.style.letterSpacing = `${mid}px`
    if (el.scrollWidth <= maxWidth + 0.5) {
      best = mid
      lo = mid
    } else {
      hi = mid
    }
  }

  return best
}

function fitPrimaryLine(el: HTMLElement, containerWidth: number) {
  const w = Math.floor(containerWidth)
  prepPrimary(el, w)
  el.style.fontWeight = '900'
  el.style.letterSpacing = '0px'

  let lo = 8
  let hi = 480
  let fontSize = 8

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    el.style.fontSize = `${mid}px`
    if (fitsBox(el)) {
      fontSize = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  el.style.fontSize = `${fontSize}px`
  const letterSpacing = fitLetterSpacing(el, w)
  return { fontSize, letterSpacing }
}

export function GlyphLabel({ id, visual, primary, secondary, variant = 'axis', onFocus }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLSpanElement>(null)
  const secondaryRef = useRef<HTMLDivElement>(null)

  const secondaryChars = useMemo(
    () => (secondary ? [...secondary.toUpperCase()] : []),
    [secondary],
  )

  const [primaryStyle, setPrimaryStyle] = useState<CSSProperties>({
    ...LINE_BASE,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: 'normal',
  })
  const [secondaryStyle, setSecondaryStyle] = useState<CSSProperties>({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
    letterSpacing: 'normal',
    textTransform: 'uppercase',
  })

  useLayoutEffect(() => {
    const lines = linesRef.current
    const primaryEl = primaryRef.current
    if (!lines || !primaryEl) return

    const fit = () => {
      const width = lines.clientWidth
      if (width <= 0) return

      const p = fitPrimaryLine(primaryEl, width)
      setPrimaryStyle({
        ...LINE_BASE,
        fontSize: `${p.fontSize}px`,
        fontWeight: 900,
        letterSpacing: `${p.letterSpacing}px`,
        lineHeight: 1,
      })

      const secondaryEl = secondaryRef.current
      if (!secondaryEl || secondaryChars.length === 0) {
        setSecondaryStyle((s) => ({ ...s, transform: undefined }))
        return
      }

      secondaryEl.style.paddingLeft = '0px'
      const shift = firstCharLeft(primaryEl) - firstCharLeft(secondaryEl)
      setSecondaryStyle((s) => ({
        ...s,
        paddingLeft: shift !== 0 ? `${shift}px` : undefined,
        transform: undefined,
      }))
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(lines)
    return () => ro.disconnect()
  }, [primary, secondaryChars])

  if (visual.hidden) return null

  return (
    <div
      ref={rootRef}
      className={blockClass(visual, `bax-glyph bax-glyph--${variant}`)}
      style={{ ...blockStyle(visual), width: '100%', minWidth: 0, overflow: 'hidden' }}
      {...blockHandlers(id, onFocus)}
    >
      <BlockBadges visual={visual} />
      <div ref={linesRef} className="bax-glyph__lines" style={{ width: '100%', minWidth: 0 }}>
        <span ref={primaryRef} className="bax-glyph__primary" style={primaryStyle}>
          {primary}
        </span>
        {secondaryChars.length > 0 && (
          <div ref={secondaryRef} className="bax-glyph__secondary" style={secondaryStyle}>
            {secondaryChars.map((ch, i) => (
              <span key={`${ch}-${i}`} data-glyph-char>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
