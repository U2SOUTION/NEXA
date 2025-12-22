/**
 * Mermaid 스타일 저장/로드 관리
 * CSS 파일을 읽고 쓰는 함수들
 */

import { getCurrentMermaidStyles } from 'src/modules/document-manager/config/mermaidStyles.js'

// 요청 캐시 (같은 파일에 대한 반복 요청 방지)
const loadCache = new Map() // filePath -> { content: string | null, timestamp: number, checked: boolean }
const CACHE_DURATION = 5000 // 5초 캐시

// localStorage 관리 설정
const STORAGE_PREFIX = 'mermaid-style:' // 네이밍 컨벤션: 접두어 제거
const OLD_STORAGE_PREFIX = 'NEXA-mermaid-style:' // 마이그레이션용 구형 접두어
const MAX_STORAGE_ITEMS = 100 // 최대 저장 개수
const STORAGE_EXPIRY_DAYS = 90 // 만료 기간 (90일)

/**
 * localStorage에 저장할 데이터 구조
 * @typedef {Object} StorageItem
 * @property {string} content - CSS 내용
 * @property {number} savedAt - 저장 시각 (타임스탬프)
 * @property {number} expiresAt - 만료 시각 (타임스탬프)
 */

/**
 * localStorage 키 생성
 */
function getStorageKey(cssPath) {
  return `${STORAGE_PREFIX}${cssPath}`
}

/**
 * localStorage 키 마이그레이션 (NEXA- 접두어 제거)
 * 기존 NEXA- 접두어가 있는 키를 새 키로 마이그레이션
 */
function migrateStorageKeys() {
  try {
    const keysToMigrate = []
    // localStorage에서 NEXA- 접두어가 있는 모든 키 찾기
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(OLD_STORAGE_PREFIX)) {
        keysToMigrate.push(key)
      }
    }

    // 마이그레이션 실행
    keysToMigrate.forEach((oldKey) => {
      try {
        const value = localStorage.getItem(oldKey)
        if (value) {
          // NEXA- 접두어 제거
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

// 모듈 로드 시 마이그레이션 실행
migrateStorageKeys()

/**
 * localStorage에 저장된 모든 Mermaid 스타일 항목 가져오기
 */
function getAllStorageItems() {
  const items = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const value = localStorage.getItem(key)
          const parsed = JSON.parse(value)
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
          // 파싱 실패한 항목은 건너뛰기
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

/**
 * 오래된 항목 자동 정리 (만료된 항목 및 오래된 항목 삭제)
 */
function cleanupExpiredItems() {
  try {
    const now = Date.now()
    const items = getAllStorageItems()
    let cleanedCount = 0

    // 만료된 항목 삭제
    for (const item of items) {
      if (item.expiresAt < now) {
        try {
          localStorage.removeItem(item.key)
          cleanedCount++
        } catch {
          // 삭제 실패는 무시
        }
      }
    }

    // 저장 개수가 제한을 초과하면 오래된 순으로 삭제
    const remainingItems = getAllStorageItems()
    if (remainingItems.length > MAX_STORAGE_ITEMS) {
      // savedAt 기준으로 정렬 (오래된 것부터)
      remainingItems.sort((a, b) => a.savedAt - b.savedAt)

      // 제한을 초과하는 항목 삭제
      const excessCount = remainingItems.length - MAX_STORAGE_ITEMS
      for (let i = 0; i < excessCount; i++) {
        try {
          localStorage.removeItem(remainingItems[i].key)
          cleanedCount++
        } catch {
          // 삭제 실패는 무시
        }
      }
    }

    if (cleanedCount > 0 && import.meta.env.DEV) {
      console.log(`[MermaidStyleStorage] ${cleanedCount}개 항목 정리 완료`)
    }
  } catch {
    // 정리 작업 실패는 조용히 처리
  }
}

/**
 * localStorage에 저장 (만료 날짜 포함)
 */
function saveToLocalStorage(cssPath, cssContent) {
  try {
    const storageKey = getStorageKey(cssPath)
    const now = Date.now()
    const expiresAt = now + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000 // 90일 후

    const storageItem = {
      content: cssContent,
      savedAt: now,
      expiresAt: expiresAt,
    }

    const jsonString = JSON.stringify(storageItem)
    localStorage.setItem(storageKey, jsonString)

    // 저장 후 정리 작업 실행 (비동기, 블로킹 안 함)
    setTimeout(() => cleanupExpiredItems(), 0)

    return true
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // 용량 초과 시 정리 후 재시도
      cleanupExpiredItems()
      try {
        const storageKey = getStorageKey(cssPath)
        const now = Date.now()
        const expiresAt = now + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        const storageItem = {
          content: cssContent,
          savedAt: now,
          expiresAt: expiresAt,
        }
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

/**
 * 초기화 시 정리 작업 실행 (모듈 로드 시 자동 실행)
 */
cleanupExpiredItems()

/**
 * localStorage에서 로드 (만료 확인)
 */
function loadFromLocalStorage(cssPath) {
  try {
    const storageKey = getStorageKey(cssPath)
    let saved = localStorage.getItem(storageKey)
    
    // 새 키에 없으면 구형 키에서 확인 (하위 호환성)
    if (!saved) {
      const oldKey = `${OLD_STORAGE_PREFIX}${cssPath}`
      saved = localStorage.getItem(oldKey)
      // 구형 키에서 찾았으면 새 키로 마이그레이션
      if (saved) {
        localStorage.setItem(storageKey, saved)
        localStorage.removeItem(oldKey)
      }
    }
    
    if (!saved) return null

    // 기존 형식 호환성 (단순 문자열인 경우)
    if (!saved.startsWith('{')) {
      // 기존 단순 문자열 형식이면 새 형식으로 마이그레이션
      const now = Date.now()
      const expiresAt = now + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      const storageItem = {
        content: saved,
        savedAt: now,
        expiresAt: expiresAt,
      }
      localStorage.setItem(storageKey, JSON.stringify(storageItem))
      return saved
    }

    // 새 형식 (JSON)
    const parsed = JSON.parse(saved)
    if (!parsed || typeof parsed.content !== 'string') return null

    // 만료 확인
    const now = Date.now()
    if (parsed.expiresAt && parsed.expiresAt < now) {
      // 만료된 항목 삭제
      localStorage.removeItem(storageKey)
      return null
    }

    return parsed.content
  } catch {
    // 파싱 실패 시 해당 항목 삭제
    try {
      const storageKey = getStorageKey(cssPath)
      localStorage.removeItem(storageKey)
    } catch {
      // 삭제 실패는 무시
    }
    return null
  }
}

/**
 * 중앙 색상 관리 모듈에서 Mermaid 기본 스타일 가져오기
 * 테마에 따라 자동으로 변경됨
 */
function getMermaidThemeStyles() {
  // 중앙 스타일 관리 모듈에서 스타일 가져오기
  const styles = getCurrentMermaidStyles()
  return {
    node: {
      bg: styles.nodeBg, // 노드 배경색 (중앙 모듈: mermaidStyles.js 참조)
      border: styles.nodeBorder, // 노드 테두리 색상 (중앙 모듈: mermaidStyles.js 참조)
      borderWidth: styles.nodeBorderWidth, // 노드 테두리 두께 (px) (중앙 모듈: mermaidStyles.js 참조)
      borderRadius: styles.nodeBorderRadius, // 노드 모서리 반경 (px) (중앙 모듈: mermaidStyles.js 참조)
      opacity: styles.nodeOpacity, // 노드 투명도 (중앙 모듈: mermaidStyles.js 참조)
    },
    line: {
      color: styles.lineColor, // 라인 색상 (중앙 모듈: mermaidStyles.js 참조)
      width: styles.lineWidth, // 라인 두께 (px) (중앙 모듈: mermaidStyles.js 참조)
      style: styles.lineStyle, // 라인 스타일 (solid, dashed, dotted) (중앙 모듈: mermaidStyles.js 참조)
      opacity: styles.lineOpacity, // 라인 투명도 (중앙 모듈: mermaidStyles.js 참조)
    },
    text: {
      color: styles.nodeText, // 노드 텍스트 색상 (중앙 모듈: mermaidStyles.js 참조)
      size: styles.textSize, // 텍스트 크기 (px) (중앙 모듈: mermaidStyles.js 참조)
      weight: styles.textWeight, // 텍스트 굵기 (중앙 모듈: mermaidStyles.js 참조)
      align: styles.textAlign, // 텍스트 정렬 (중앙 모듈: mermaidStyles.js 참조)
    },
    edgeLabel: {
      color: styles.edgeText, // 엣지 라벨 텍스트 색상 (중앙 모듈: mermaidStyles.js 참조)
      size: styles.edgeLabelSize, // 엣지 라벨 텍스트 크기 (px) (중앙 모듈: mermaidStyles.js 참조)
      weight: styles.edgeLabelWeight, // 엣지 라벨 텍스트 굵기 (중앙 모듈: mermaidStyles.js 참조)
    },
  }
}

// getMermaidThemeStyles 함수를 export (다른 파일에서 사용 가능하도록)
export { getMermaidThemeStyles }

/**
 * 기본 Mermaid CSS 생성
 * 중앙 색상 관리 모듈에서 실제 값을 읽어서 적용 (SVG에서 CSS 변수는 작동하지 않으므로 실제 값으로 치환)
 * @returns {string} 기본 CSS 문자열
 */
export function getDefaultMermaidCss() {
  // 중앙 스타일 관리 모듈에서 실제 스타일 값 가져오기 (mermaidStyles.js)
  const styles = getMermaidThemeStyles()

  // Mermaid SVG 내부 요소를 강제로 스타일링하기 위해 높은 특이성과 !important 사용
  // SVG 내부의 인라인 스타일과 기본 팔레트를 오버라이드
  return `
/* ============================================
   범용 노드 스타일 (모든 다이어그램 타입)
   ============================================ */
/* 기본 도형 요소들 */
.mermaid-block svg rect,
.mermaid-block svg circle,
.mermaid-block svg ellipse,
.mermaid-block svg polygon,
.mermaid-block svg path[fill] {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

/* 클래스/노드 영역 */
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

/* ============================================
   시퀀스 다이어그램 (Sequence Diagram) 특화
   ============================================ */
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

/* ============================================
   클래스 다이어그램 (Class Diagram) 특화
   ============================================ */
.mermaid-block svg .class rect,
.mermaid-block svg .classBox rect,
.mermaid-block svg .classLabelBox rect,
.mermaid-block svg .relation rect {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

/* ============================================
   상태 다이어그램 (State Diagram) 특화
   ============================================ */
.mermaid-block svg .state rect,
.mermaid-block svg .state circle,
.mermaid-block svg .state ellipse,
.mermaid-block svg .stateLabel rect {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

/* ============================================
   엔티티 관계도 (ER Diagram) 특화
   ============================================ */
.mermaid-block svg .entity rect,
.mermaid-block svg .entityBox rect,
.mermaid-block svg .attributeBox rect {
  fill: ${styles.node.bg} !important;
  stroke: ${styles.node.border} !important;
  stroke-width: ${styles.node.borderWidth}px !important;
}

/* ============================================
   연결선/엣지 스타일 (모든 다이어그램)
   ============================================ */
/* 경로 기반 연결선 */
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

/* 선형 연결선 */
.mermaid-block svg line:not([stroke="none"]),
.mermaid-block svg polyline {
  stroke: ${styles.line.color} !important;
  stroke-width: ${styles.line.width}px !important;
  fill: none !important;
}

/* 시퀀스 다이어그램 메시지선 */
.mermaid-block svg .messageLine0,
.mermaid-block svg .messageLine1 {
  stroke: ${styles.line.color} !important;
  stroke-width: ${styles.line.width}px !important;
}

/* 시퀀스 다이어그램 메시지 텍스트 - 라인 색상 사용 */
.mermaid-block svg .messageText {
  fill: ${styles.line.color} !important; /* 라인 색상 (중앙 모듈: mermaidStyles.js) */
  color: ${styles.line.color} !important;
  stroke: none !important; /* stroke 제거로 글씨 두께 정상화 */
  stroke-width: 0 !important;
  font-weight: normal !important; /* 글씨 두께 정상화 */
}

/* 엣지 마커(화살표) 스타일 */
.mermaid-block svg .edge marker path,
.mermaid-block svg marker path,
.mermaid-block svg .marker path,
.mermaid-block svg marker[fill] path {
  fill: ${styles.line.color} !important;
  stroke: ${styles.line.color} !important;
}

/* ============================================
   텍스트 스타일 (모든 다이어그램)
   ============================================ */
/* 노드 라벨 텍스트 - 모든 다이어그램 타입 커버 */
.mermaid-block svg .nodeLabel,
.mermaid-block svg .nodeLabel text,
.mermaid-block svg .flowchart-label text,
.mermaid-block svg .label text,
.mermaid-block svg .labelText,
.mermaid-block svg .classText,
.mermaid-block svg .nodeText,
/* 시퀀스 다이어그램 특화 (messageText는 제외 - line-color 사용) */
.mermaid-block svg .actor text,
.mermaid-block svg .participant text,
/* 클래스 다이어그램 */
.mermaid-block svg .classTitle text,
.mermaid-block svg .classText text,
/* 상태 다이어그램 */
.mermaid-block svg .stateLabel text,
.mermaid-block svg .state-note text,
/* 노드 내부 텍스트 (엣지 라벨 제외) */
.mermaid-block svg text:not(.edgeLabel text):not(.edgeLabel span):not(.messageText) {
  fill: ${styles.text.color} !important; /* 노드 텍스트 색상 (중앙 모듈: mermaidStyles.js) */
  color: ${styles.text.color} !important;
  font-size: ${styles.text.size}px !important;
}

/* 엣지 라벨 텍스트 (별도 색상 적용) */
.mermaid-block svg .edgeLabel,
.mermaid-block svg .edgeLabel text,
.mermaid-block svg .edgeLabel span,
.mermaid-block svg .edgeText {
  fill: ${styles.edgeLabel.color} !important; /* 엣지 라벨 텍스트 색상 (중앙 모듈: mermaidStyles.js) */
  color: ${styles.edgeLabel.color} !important;
  font-size: ${styles.edgeLabel.size}px !important;
}

/* ============================================
   엣지 라벨 배경 제거 (단순 접근)
   ============================================ */
/* ER 다이어그램 엣지 라벨 배경 제거 (공식 API 미지원 - ER만 CSS로 처리) */
.mermaid-block svg .edgeLabel .labelBkg {
  background: none !important;
  background-color: transparent !important;
}


`.trim()
}

/**
 * 파일 경로에서 Mermaid CSS 파일 경로 생성
 * @param {string} filePath - 원본 파일 경로 (예: "docs/Mermaid_차트_샘플.md")
 * @returns {string} CSS 파일 경로 (예: "docs/Mermaid_차트_샘플.mermaid.css")
 */
export function getMermaidStylePath(filePath) {
  if (!filePath) return null
  // .md 확장자를 .mermaid.css로 변경
  if (filePath.endsWith('.md')) {
    return filePath.replace(/\.md$/, '.mermaid.css')
  }
  // 확장자가 없거나 다른 경우 .mermaid.css 추가
  return `${filePath}.mermaid.css`
}

/**
 * Mermaid 스타일 파일 로드 (파일 레벨)
 * @param {string} filePath - 원본 파일 경로
 * @returns {Promise<string|null>} CSS 문자열 또는 null
 */
export async function loadMermaidStyle(filePath) {
  if (!filePath) return null

  // 캐시 확인 (캐시가 있으면 바로 반환 - localStorage 요청 없음)
  const cached = loadCache.get(filePath)
  if (cached) {
    // 캐시가 오래되지 않았으면 바로 반환
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.content
    }
  }

  try {
    const cssPath = getMermaidStylePath(filePath)
    let result = null

    // localStorage만 확인 (네트워크 요청 완전히 제거 - 404 에러 근본 해결)
    try {
      const saved = loadFromLocalStorage(cssPath)
      if (saved) {
        result = saved
        // 캐시 업데이트
        loadCache.set(filePath, { content: result, timestamp: Date.now(), checked: true })
        return result
      }
    } catch {
      // localStorage 읽기 실패는 무시
    }

    // localStorage에 없으면 null 반환 (HEAD 요청 안 함 - 404 에러 없음)
    // 사용자가 스타일을 저장하면 localStorage에 저장되므로, 다음부터는 사용 가능
    loadCache.set(filePath, { content: null, timestamp: Date.now(), checked: true })
    return null
  } catch (error) {
    // 예상치 못한 에러만 로깅
    if (import.meta.env.DEV) {
      console.error('[MermaidStyleStorage] 스타일 파일 로드 실패:', error)
    }
    // 캐시 업데이트
    loadCache.set(filePath, { content: null, timestamp: Date.now(), checked: true })
    return null
  }
}

/**
 * Mermaid 스타일 파일 저장 (파일 레벨)
 * @param {string} filePath - 원본 파일 경로
 * @param {string} cssContent - 저장할 CSS 문자열
 * @returns {Promise<boolean>} 성공 여부
 */
export async function saveMermaidStyle(filePath, cssContent) {
  if (!filePath || !cssContent) {
    console.warn('[MermaidStyleStorage] 파일 경로 또는 CSS 내용이 없습니다.', { filePath, hasCss: !!cssContent })
    return false
  }

  try {
    const cssPath = getMermaidStylePath(filePath)

    // localStorage에만 저장 (서버 저장 제거 - localStorage만 사용)
    const saved = saveToLocalStorage(cssPath, cssContent)
    if (saved) {
        // 캐시 업데이트
      loadCache.set(filePath, { content: cssContent, timestamp: Date.now(), checked: true })
        return true
      }

    return false
  } catch (error) {
    console.error('[MermaidStyleStorage] 스타일 파일 저장 실패:', error)
    return false
  }
}

/**
 * 블록별 Mermaid 스타일 로드
 * @param {string} filePath - 원본 파일 경로
 * @param {string} mermaidId - Mermaid 블록 ID (예: "mermaid-1234567890-0")
 * @returns {Promise<string|null>} 블록별 CSS 문자열 또는 null
 */
export async function loadMermaidBlockStyle(filePath, mermaidId) {
  if (!filePath || !mermaidId) return null

  try {
    const fullCss = await loadMermaidStyle(filePath)

    if (!fullCss) return null

    // 블록 ID로 시작하는 CSS 블록 추출
    // 예: #mermaid-1234567890-0 { ... }
    const blockPattern = new RegExp(`#${mermaidId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?}`, 'g')
    const matches = fullCss.match(blockPattern)

    if (matches && matches.length > 0) {
      return matches.join('\n')
    }

    return null
  } catch (error) {
    console.error('[MermaidStyleStorage] 블록 스타일 로드 실패:', error)
    return null
  }
}

/**
 * 블록별 Mermaid 스타일 추가/업데이트
 * @param {string} filePath - 원본 파일 경로
 * @param {string} mermaidId - Mermaid 블록 ID
 * @param {string} blockCss - 블록별 CSS 문자열
 * @returns {Promise<boolean>} 성공 여부
 */
export async function saveMermaidBlockStyle(filePath, mermaidId, blockCss) {
  if (!filePath || !mermaidId || !blockCss) {
    console.warn('[MermaidStyleStorage] 필수 파라미터가 없습니다.')
    return false
  }

  try {
    let fullCss = (await loadMermaidStyle(filePath)) || ''

    // 기존 블록 스타일 제거 (있으면)
    const blockPattern = new RegExp(`#${mermaidId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?}`, 'g')
    fullCss = fullCss.replace(blockPattern, '').trim()

    // 새 블록 스타일 추가
    if (fullCss) {
      fullCss = `${fullCss}\n\n${blockCss}`
    } else {
      fullCss = blockCss
    }

    // 전체 CSS 저장
    return await saveMermaidStyle(filePath, fullCss)
  } catch (error) {
    console.error('[MermaidStyleStorage] 블록 스타일 저장 실패:', error)
    return false
  }
}
