/**
 * Mermaid 스타일 저장/로드 관리
 * CSS 파일을 읽고 쓰는 함수들
 */

import { getCurrentMermaidStyles } from '../config/mermaidStyles'

const CACHE_DURATION = 5000
const STORAGE_PREFIX = 'mermaid-style:'
const OLD_STORAGE_PREFIX = 'NEXA-mermaid-style:'
const MAX_STORAGE_ITEMS = 100
const STORAGE_EXPIRY_DAYS = 90

export interface StorageItem {
  content: string
  savedAt: number
  expiresAt: number
}

interface CacheEntry {
  content: string | null
  timestamp: number
  checked: boolean
}

interface StorageListItem {
  key: string
  cssPath: string
  savedAt: number
  expiresAt: number
  size: number
  data: StorageItem
}

export interface MermaidThemeStyles {
  node: { bg: string; border: string; borderWidth: number; borderRadius: number; opacity: number }
  line: { color: string; width: number; style: string; opacity: number }
  text: { color: string; size: number; weight: string; align: string }
  edgeLabel: { color: string; size: number; weight: string }
}

const loadCache = new Map<string, CacheEntry>()

function getStorageKey(cssPath: string): string {
  return `${STORAGE_PREFIX}${cssPath}`
}

function migrateStorageKeys(): void {
  try {
    const keysToMigrate: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(OLD_STORAGE_PREFIX)) keysToMigrate.push(key)
    }
    keysToMigrate.forEach((oldKey) => {
      try {
        const value = localStorage.getItem(oldKey)
        if (value) {
          const newKey = oldKey.replace(OLD_STORAGE_PREFIX, STORAGE_PREFIX)
          localStorage.setItem(newKey, value)
          localStorage.removeItem(oldKey)
          if (import.meta.env.DEV) {
            console.log(`[MermaidStyleStorage] 키 마이그레이션: ${oldKey} → ${newKey}`)
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(`[MermaidStyleStorage] 키 마이그레이션 실패: ${oldKey}`, error)
        }
      }
    })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[MermaidStyleStorage] 마이그레이션 중 오류:', error)
    }
  }
}

migrateStorageKeys()

function getAllStorageItems(): StorageListItem[] {
  const items: StorageListItem[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const value = localStorage.getItem(key)
          if (!value) continue
          const parsed = JSON.parse(value) as StorageItem
          if (parsed && typeof parsed.content === 'string' && parsed.savedAt && parsed.expiresAt) {
            items.push({
              key,
              cssPath: key.replace(STORAGE_PREFIX, ''),
              savedAt: parsed.savedAt,
              expiresAt: parsed.expiresAt,
              size: value.length,
              data: parsed,
            })
          }
        } catch {
          /* skip */
        }
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[MermaidStyleStorage] localStorage 전체 항목 읽기 실패:', error)
    }
  }
  return items
}

function cleanupExpiredItems(): void {
  try {
    const now = Date.now()
    const items = getAllStorageItems()
    let cleanedCount = 0
    for (const item of items) {
      if (item.expiresAt < now) {
        try {
          localStorage.removeItem(item.key)
          cleanedCount++
        } catch {
          /* ignore */
        }
      }
    }
    const remainingItems = getAllStorageItems()
    if (remainingItems.length > MAX_STORAGE_ITEMS) {
      remainingItems.sort((a, b) => a.savedAt - b.savedAt)
      const excessCount = remainingItems.length - MAX_STORAGE_ITEMS
      for (let i = 0; i < excessCount; i++) {
        try {
          localStorage.removeItem(remainingItems[i].key)
          cleanedCount++
        } catch {
          /* ignore */
        }
      }
    }
    if (cleanedCount > 0 && import.meta.env.DEV) {
      console.log(`[MermaidStyleStorage] ${cleanedCount}개 항목 정리 완료`)
    }
  } catch {
    /* ignore */
  }
}

function saveToLocalStorage(cssPath: string, cssContent: string): boolean {
  try {
    const storageKey = getStorageKey(cssPath)
    const now = Date.now()
    const expiresAt = now + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    const storageItem: StorageItem = { content: cssContent, savedAt: now, expiresAt }
    localStorage.setItem(storageKey, JSON.stringify(storageItem))
    setTimeout(() => cleanupExpiredItems(), 0)
    return true
  } catch (error) {
    const err = error as Error & { name?: string }
    if (err.name === 'QuotaExceededError') {
      cleanupExpiredItems()
      try {
        const storageKey = getStorageKey(cssPath)
        const now = Date.now()
        const expiresAt = now + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        const storageItem: StorageItem = { content: cssContent, savedAt: now, expiresAt }
        localStorage.setItem(storageKey, JSON.stringify(storageItem))
        return true
      } catch (retryError) {
        if (import.meta.env.DEV) {
          console.warn('[MermaidStyleStorage] localStorage 저장 실패 (용량 부족):', retryError)
        }
        return false
      }
    }
    if (import.meta.env.DEV) {
      console.warn('[MermaidStyleStorage] localStorage 저장 실패:', error)
    }
    return false
  }
}

cleanupExpiredItems()

function loadFromLocalStorage(cssPath: string): string | null {
  try {
    const storageKey = getStorageKey(cssPath)
    let saved = localStorage.getItem(storageKey)
    if (!saved) {
      const oldKey = `${OLD_STORAGE_PREFIX}${cssPath}`
      saved = localStorage.getItem(oldKey)
      if (saved) {
        localStorage.setItem(storageKey, saved)
        localStorage.removeItem(oldKey)
      }
    }
    if (!saved) return null
    if (!saved.startsWith('{')) {
      const now = Date.now()
      const expiresAt = now + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      const storageItem: StorageItem = { content: saved, savedAt: now, expiresAt }
      localStorage.setItem(storageKey, JSON.stringify(storageItem))
      return saved
    }
    const parsed = JSON.parse(saved) as StorageItem
    if (!parsed || typeof parsed.content !== 'string') return null
    const now = Date.now()
    if (parsed.expiresAt && parsed.expiresAt < now) {
      localStorage.removeItem(storageKey)
      return null
    }
    return parsed.content
  } catch {
    try {
      localStorage.removeItem(getStorageKey(cssPath))
    } catch {
      /* ignore */
    }
    return null
  }
}

export function getMermaidThemeStyles(): MermaidThemeStyles {
  const styles = getCurrentMermaidStyles()
  return {
    node: {
      bg: styles.nodeBg,
      border: styles.nodeBorder,
      borderWidth: styles.nodeBorderWidth,
      borderRadius: styles.nodeBorderRadius,
      opacity: styles.nodeOpacity,
    },
    line: {
      color: styles.lineColor,
      width: styles.lineWidth,
      style: styles.lineStyle,
      opacity: styles.lineOpacity,
    },
    text: {
      color: styles.nodeText,
      size: styles.textSize,
      weight: styles.textWeight,
      align: styles.textAlign,
    },
    edgeLabel: {
      color: styles.edgeText,
      size: styles.edgeLabelSize,
      weight: styles.edgeLabelWeight,
    },
  }
}

export function getDefaultMermaidCss(): string {
  const styles = getMermaidThemeStyles()
  return `
/* ============================================
   범용 노드 스타일 (모든 다이어그램 타입)
   ============================================ */
.mermaid-block svg rect,
.mermaid-block svg circle,
.mermaid-block svg ellipse,
.mermaid-block svg polygon,
.mermaid-block svg path[fill] {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

.mermaid-block svg .node rect,
.mermaid-block svg .node circle,
.mermaid-block svg .node ellipse,
.mermaid-block svg .node polygon,
.mermaid-block svg .cluster rect,
.mermaid-block svg .flowchart-label .nodeLabel rect,
.mermaid-block svg .classGroup rect,
.mermaid-block svg .classBox rect {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

.mermaid-block svg .actor rect,
.mermaid-block svg .actor circle,
.mermaid-block svg .participant rect,
.mermaid-block svg .participant circle,
.mermaid-block svg .box rect,
.mermaid-block svg .loopLine rect,
.mermaid-block svg .activation rect {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

.mermaid-block svg .class rect,
.mermaid-block svg .classBox rect,
.mermaid-block svg .classLabelBox rect,
.mermaid-block svg .relation rect {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

.mermaid-block svg .state rect,
.mermaid-block svg .state circle,
.mermaid-block svg .state ellipse,
.mermaid-block svg .stateLabel rect {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

.mermaid-block svg .entity rect,
.mermaid-block svg .entityBox rect,
.mermaid-block svg .attributeBox rect {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

.mermaid-block svg .edge path,
.mermaid-block svg .edgePath path,
.mermaid-block svg .edgePaths path,
.mermaid-block svg path[data-edge="true"],
.mermaid-block svg path.edge,
.mermaid-block svg .flowchart-link,
.mermaid-block svg .flowchart-arrow,
.mermaid-block svg path.arrowheadPath,
.mermaid-block svg path[stroke]:not([fill]),
.mermaid-block svg .path {
  stroke: ${styles.line.color} !important;
  stroke-width: ${styles.line.width}px !important;
  fill: none !important;
}

.mermaid-block svg line:not([stroke="none"]),
.mermaid-block svg polyline {
  stroke: ${styles.line.color} !important;
  stroke-width: ${styles.line.width}px !important;
  fill: none !important;
}

.mermaid-block svg .messageLine0,
.mermaid-block svg .messageLine1 {
  stroke: ${styles.line.color} !important;
  stroke-width: ${styles.line.width}px !important;
}

.mermaid-block svg .messageText {
  fill: ${styles.line.color} !important;
  color: ${styles.line.color} !important;
  stroke: none !important;
  stroke-width: 0 !important;
  font-weight: normal !important;
}

.mermaid-block svg .edge marker path,
.mermaid-block svg marker path,
.mermaid-block svg .marker path,
.mermaid-block svg marker[fill] path {
  fill: ${styles.line.color} !important;
  stroke: ${styles.line.color} !important;
}

.mermaid-block svg .nodeLabel,
.mermaid-block svg .nodeLabel text,
.mermaid-block svg .flowchart-label text,
.mermaid-block svg .label text,
.mermaid-block svg .labelText,
.mermaid-block svg .classText,
.mermaid-block svg .nodeText,
.mermaid-block svg .actor text,
.mermaid-block svg .participant text,
.mermaid-block svg .classTitle text,
.mermaid-block svg .classText text,
.mermaid-block svg .stateLabel text,
.mermaid-block svg .state-note text,
.mermaid-block svg text:not(.edgeLabel text):not(.edgeLabel span):not(.messageText) {
  fill: ${styles.text.color} !important;
  color: ${styles.text.color} !important;
  font-size: ${styles.text.size}px !important;
}

.mermaid-block svg .edgeLabel,
.mermaid-block svg .edgeLabel text,
.mermaid-block svg .edgeLabel span,
.mermaid-block svg .edgeText {
  fill: ${styles.edgeLabel.color} !important;
  color: ${styles.edgeLabel.color} !important;
  font-size: ${styles.edgeLabel.size}px !important;
}

.mermaid-block svg .edgeLabel .labelBkg {
  background: none !important;
  background-color: transparent !important;
}


`.trim()
}

export function getMermaidStylePath(filePath: string | null): string | null {
  if (!filePath) return null
  if (filePath.endsWith('.md')) {
    return filePath.replace(/\.md$/, '.mermaid.css')
  }
  return `${filePath}.mermaid.css`
}

export async function loadMermaidStyle(filePath: string | null): Promise<string | null> {
  if (!filePath) return null
  const cached = loadCache.get(filePath)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.content
  }
  try {
    const cssPath = getMermaidStylePath(filePath)
    let result: string | null = null
    try {
      if (cssPath) {
        const saved = loadFromLocalStorage(cssPath)
        if (saved) {
          result = saved
          loadCache.set(filePath, { content: result, timestamp: Date.now(), checked: true })
          return result
        }
      }
    } catch {
      /* ignore */
    }
    loadCache.set(filePath, { content: null, timestamp: Date.now(), checked: true })
    return null
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[MermaidStyleStorage] 스타일 파일 로드 실패:', error)
    }
    loadCache.set(filePath, { content: null, timestamp: Date.now(), checked: true })
    return null
  }
}

export async function saveMermaidStyle(
  filePath: string | null,
  cssContent: string | null,
): Promise<boolean> {
  if (!filePath || !cssContent) {
    console.warn('[MermaidStyleStorage] 파일 경로 또는 CSS 내용이 없습니다.', {
      filePath,
      hasCss: !!cssContent,
    })
    return false
  }
  try {
    const cssPath = getMermaidStylePath(filePath)
    if (!cssPath) return false
    const saved = saveToLocalStorage(cssPath, cssContent)
    if (saved) {
      loadCache.set(filePath, { content: cssContent, timestamp: Date.now(), checked: true })
      return true
    }
    return false
  } catch (error) {
    console.error('[MermaidStyleStorage] 스타일 파일 저장 실패:', error)
    return false
  }
}

export async function loadMermaidBlockStyle(
  filePath: string | null,
  mermaidId: string | null,
): Promise<string | null> {
  if (!filePath || !mermaidId) return null
  try {
    const fullCss = await loadMermaidStyle(filePath)
    if (!fullCss) return null
    const escaped = mermaidId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const blockPattern = new RegExp(`#${escaped}[\\s\\S]*?}`, 'g')
    const matches = fullCss.match(blockPattern)
    if (matches && matches.length > 0) return matches.join('\n')
    return null
  } catch (error) {
    console.error('[MermaidStyleStorage] 블록 스타일 로드 실패:', error)
    return null
  }
}

export async function saveMermaidBlockStyle(
  filePath: string | null,
  mermaidId: string | null,
  blockCss: string | null,
): Promise<boolean> {
  if (!filePath || !mermaidId || !blockCss) {
    console.warn('[MermaidStyleStorage] 필수 파라미터가 없습니다.')
    return false
  }
  try {
    let fullCss = (await loadMermaidStyle(filePath)) || ''
    const escaped = mermaidId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const blockPattern = new RegExp(`#${escaped}[\\s\\S]*?}`, 'g')
    fullCss = fullCss.replace(blockPattern, '').trim()
    fullCss = fullCss ? `${fullCss}\n\n${blockCss}` : blockCss
    return await saveMermaidStyle(filePath, fullCss)
  } catch (error) {
    console.error('[MermaidStyleStorage] 블록 스타일 저장 실패:', error)
    return false
  }
}
