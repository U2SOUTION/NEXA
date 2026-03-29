import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, shallowRef, triggerRef, watch } from 'vue'
import type { Edge, GraphEdge, GraphNode, Node } from '@vue-flow/core'
import { applyEdgeChanges, applyNodeChanges, addEdge as vfAddEdge } from '@vue-flow/core'
import type { Connection, EdgeChange, NodeChange } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'

import { useUserSettingsStore } from '@system/store/userSettingsStore'

import { isNexionFlowDebug, nxnDiag } from '../utils/nexionFlowDebug'

const LOD_ZOOM_DETAIL = 0.55

/** 뷰포트 줌이 커질수록 플로 좌표상 중첩 카드 박스도 키움 — CSS 스케일만이 아니라 실제 노드 크기 갱신 */
const ZOOM_FLOW_SIZE_BOOST_MAX = 3.2

function zoomFlowSizeBoost(zoom: number): number {
  if (!Number.isFinite(zoom) || zoom <= 0) return 1
  return Math.min(ZOOM_FLOW_SIZE_BOOST_MAX, Math.max(1, Math.sqrt(zoom / LOD_ZOOM_DETAIL)))
}

function collectSubtreeNodeIds(rootId: string, list: Node[]): Set<string> {
  const byId = new Map(list.map((n) => [n.id, n]))
  if (!byId.has(rootId)) return new Set([rootId])
  const childrenByParent = new Map<string, string[]>()
  for (const n of list) {
    if (!n.parentNode) continue
    const arr = childrenByParent.get(n.parentNode) ?? []
    arr.push(n.id)
    childrenByParent.set(n.parentNode, arr)
  }
  const out = new Set<string>()
  const q = [rootId]
  for (let i = 0; i < q.length; i++) {
    const id = q[i]
    if (out.has(id)) continue
    out.add(id)
    const ch = childrenByParent.get(id)
    if (ch) for (const c of ch) q.push(c)
  }
  return out
}

/** 그룹 자식 추가 후 패딩·최소 크기 (px) */
const GROUP_PAD = { l: 12, r: 16, t: 44, b: 16 }
const GROUP_MIN_W = 200
const GROUP_MIN_H = 160
/** 카드가 부모일 때 기본 박스 — 자식이 있으면 `fitCardParentToNestedChildren` 로 본문에 맞게 확장 */
const CARD_PARENT_W = 280
/** 헤더·중앙 추가 영역·풋터 3분할 기준 최소 높이 */
const CARD_PARENT_H = 268
/** 그룹 안 자식 카드 기본 크기 */
const CHILD_IN_GROUP_W = 168
const CHILD_IN_GROUP_H = 96
/** 카드 안 1단 자식 — 루트 카드(280×268) 본문에 맞춤 */
const CHILD_IN_CARD_W = 118
const CHILD_IN_CARD_H = 138
/** 프랙탈 깊이에서도 부모 본문에 맞출 때 유지할 최소 박스(px) — 더 작으면 노드만 한계 */
const CARD_CHILD_ABS_MIN_W = 24
const CARD_CHILD_ABS_MIN_H = 28
/** 1단 자식 선호 종횡비 (w/h) */
const CARD_CHILD_ASPECT = CHILD_IN_CARD_W / CHILD_IN_CARD_H
/** 카드 본문 안 중첩 카드 우·하단 여유(플로 px) — 부모 width/height 산출 */
const CARD_NEST_BODY_PAD_R = 8
const CARD_NEST_BODY_PAD_B = 8

function shortLinkId(): string {
  return `nxn-${uuidv4().slice(0, 8)}`
}

function parsePxFromStyle(w: unknown, fallback: number): number {
  if (typeof w !== 'string') return fallback
  const m = w.trim().match(/^([\d.]+)px$/i)
  if (!m) return fallback
  const n = Number(m[1])
  return Number.isFinite(n) ? n : fallback
}

/**
 * 카드 노드 “중앙 본문 슬롯” 인셋(플로 px) — 카드 DOM 크롬과 대응 (뷰포트 줌과 무관).
 */
function getCardContentInset(parent: Node) {
  const st =
    parent.style && typeof parent.style === 'object' && !Array.isArray(parent.style) ? parent.style : {}
  const pw = parsePxFromStyle((st as { width?: string }).width, CARD_PARENT_W)
  const ph = parsePxFromStyle((st as { height?: string }).height, CARD_PARENT_H)
  const minBody = 6

  let padX: number
  let top: number
  let bottom: number

  const proportional = ph < 132 || pw < 98
  if (proportional) {
    padX = Math.max(2, Math.min(8, Math.round(pw * 0.045)))
    top = Math.max(5, Math.round(ph * 0.26))
    bottom = Math.max(4, Math.round(ph * 0.2))
  } else {
    const small = ph <= 200 || pw <= 165
    padX = small ? 6 : 8
    top = small ? 46 : 58
    bottom = small ? 36 : 46
  }

  if (top + bottom + minBody > ph) {
    const scale = (ph - minBody) / (top + bottom)
    top = Math.max(4, Math.floor(top * scale))
    bottom = Math.max(3, Math.floor(bottom * scale))
  }
  if (2 * padX + CARD_CHILD_ABS_MIN_W > pw) {
    padX = Math.max(1, Math.floor((pw - CARD_CHILD_ABS_MIN_W) / 2))
  }

  return { top, bottom, padX, pw, ph }
}

function getCardContentInnerBox(parent: Node) {
  const { top, bottom, padX, pw, ph } = getCardContentInset(parent)
  return {
    innerW: Math.max(0, pw - 2 * padX),
    innerH: Math.max(0, ph - top - bottom),
  }
}

/** inner 직사각형 안에 들어가도록 종횡비 유지 + 여백 */
function fitChildSizeInInner(innerW: number, innerH: number, margin: number): { w: number; h: number } {
  const aw = Math.max(0, innerW - margin * 2)
  const ah = Math.max(0, innerH - margin * 2)
  if (aw < 1 || ah < 1) {
    return { w: 1, h: 1 }
  }
  let w = aw
  let h = w / CARD_CHILD_ASPECT
  if (h > ah) {
    h = ah
    w = h * CARD_CHILD_ASPECT
  }
  const wI = Math.max(1, Math.floor(w))
  const hI = Math.max(1, Math.floor(h))
  return {
    w: Math.min(aw, Math.max(Math.min(CARD_CHILD_ABS_MIN_W, aw), wI)),
    h: Math.min(ah, Math.max(Math.min(CARD_CHILD_ABS_MIN_H, ah), hI)),
  }
}

/** 캔버스 루트에 가까운 쪽부터 세는 nexionCard 단계(루트 카드=0, 그 직속 자식=1, …) */
function nexionCardNestingLevel(list: Node[], nodeId: string): number {
  let level = 0
  let cur: Node | undefined = list.find((n) => n.id === nodeId)
  while (cur?.parentNode) {
    const p = list.find((n) => n.id === cur!.parentNode)
    if (!p) break
    if (p.type === 'nexionCard') level += 1
    cur = p
  }
  return level
}

/**
 * 카드 자식 노드 픽셀 크기 — tier≥2 는 항상 부모 본문(inner)에 맞춤(프랙탈 무한 깊이).
 * tier 1 은 선호 크기이되 부모 inner 를 넘지 않음.
 */
function cardChildSizePx(parent: Node | undefined, tier: number): { w: number; h: number } {
  if (!parent || parent.type !== 'nexionCard') {
    return { w: CHILD_IN_CARD_W, h: CHILD_IN_CARD_H }
  }
  const { innerW, innerH } = getCardContentInnerBox(parent)
  const margin = tier >= 3 ? 2 : tier === 2 ? 3 : 4
  const fitted = fitChildSizeInInner(innerW, innerH, margin)

  if (tier <= 1) {
    const w = Math.min(CHILD_IN_CARD_W, fitted.w)
    const h = Math.min(CHILD_IN_CARD_H, fitted.h)
    return { w: Math.max(1, w), h: Math.max(1, h) }
  }
  return { w: Math.max(1, fitted.w), h: Math.max(1, fitted.h) }
}

/** 선택 포커스 중첩 카드: 부모 한도 안에서 1단 기본 크기에 가깝게 플로 박스를 키워 텍스트·헤더와 비율 맞춤 */
const READING_FOCUS_FLOW_W = Math.round(CHILD_IN_CARD_W * 0.9)
const READING_FOCUS_FLOW_H = Math.round(CHILD_IN_CARD_H * 0.9)

/**
 * 중첩 카드의 플로 크기 — `cardChildSizePx` 기준에 줌 부스트를 곱하고 부모 본문 안으로 클램프.
 * 구조(data.tier)는 그대로 두고 style 만 줌에 맞춰 다시 맞출 때 사용.
 */
function nestedCardFlowBoxPx(
  parent: Node | undefined,
  tier: number,
  zoom: number,
  flowCtx?: { nodeId: string; readingFocusId: string | null },
): { w: number; h: number } {
  const base = cardChildSizePx(parent, tier)
  const boost = zoomFlowSizeBoost(zoom)
  if (!parent || parent.type !== 'nexionCard') {
    return {
      w: Math.max(CARD_CHILD_ABS_MIN_W, Math.round(base.w * boost)),
      h: Math.max(CARD_CHILD_ABS_MIN_H, Math.round(base.h * boost)),
    }
  }
  const margin = tier >= 3 ? 2 : tier === 2 ? 3 : 4
  const { innerW, innerH } = getCardContentInnerBox(parent)
  const maxW = Math.max(CARD_CHILD_ABS_MIN_W, innerW - margin * 2)
  const maxH = Math.max(CARD_CHILD_ABS_MIN_H, innerH - margin * 2)
  let w = Math.round(base.w * boost)
  let h = Math.round(base.h * boost)
  w = Math.min(maxW, Math.max(CARD_CHILD_ABS_MIN_W, w))
  h = Math.min(maxH, Math.max(CARD_CHILD_ABS_MIN_H, h))
  if (
    flowCtx?.readingFocusId &&
    flowCtx.nodeId === flowCtx.readingFocusId &&
    flowCtx.readingFocusId.length > 0
  ) {
    w = Math.min(maxW, Math.max(w, READING_FOCUS_FLOW_W))
    h = Math.min(maxH, Math.max(h, READING_FOCUS_FLOW_H))
  }
  return { w, h }
}

/**
 * 모든 `nestedInCard` 노드의 width/height 를 현재 줌 기준으로 재계산(부모→자식 연쇄 반영).
 * `readingFocusId`: 해당 중첩 카드 선택 시 플로 박스 읽기용 하한.
 */
function rebakeNestedCardFlowSizesFromZoom(
  list: Node[],
  zoom: number,
  readingFocusId: string | null = null,
): { list: Node[]; changed: boolean } {
  let cur = list
  let any = false
  for (let pass = 0; pass < 20; pass++) {
    const byId = new Map(cur.map((n) => [n.id, n]))
    let passChanged = false
    const mapped = cur.map((n) => {
      if (n.type !== 'nexionCard') return n
      const d = (n.data || {}) as Record<string, unknown>
      if (!d.nestedInCard || !n.parentNode) return n
      const parent = byId.get(n.parentNode)
      if (!parent || parent.type !== 'nexionCard') return n
      const tier = typeof d.nexionCardTier === 'number' ? d.nexionCardTier : 1
      const { w, h } = nestedCardFlowBoxPx(parent, tier, zoom, {
        nodeId: n.id,
        readingFocusId,
      })
      const st = n.style && typeof n.style === 'object' && !Array.isArray(n.style) ? { ...n.style } : {}
      const curW = parsePxFromStyle((st as { width?: string }).width, w)
      const curH = parsePxFromStyle((st as { height?: string }).height, h)
      if (curW === w && curH === h) return n
      passChanged = true
      return {
        ...n,
        style: { ...st, width: `${w}px`, height: `${h}px` },
      }
    })
    if (!passChanged) break
    any = true
    cur = clampAllNexionCardChildren(mapped)
  }
  return { list: cur, changed: any }
}

function clampChildPositionInCardParent(child: Node, parent: Node) {
  const { top, bottom, padX, pw, ph } = getCardContentInset(parent)
  const st =
    child.style && typeof child.style === 'object' && !Array.isArray(child.style) ? child.style : {}
  const cw = parsePxFromStyle((st as { width?: string }).width, CARD_CHILD_ABS_MIN_W)
  const ch = parsePxFromStyle((st as { height?: string }).height, CARD_CHILD_ABS_MIN_H)
  const maxX = Math.max(padX, pw - padX - cw)
  const maxY = Math.max(top, ph - bottom - ch)
  const x = Math.min(Math.max(padX, child.position.x), maxX)
  const y = Math.min(Math.max(top, child.position.y), maxY)
  return { x, y }
}

function clampAllNexionCardChildren(list: Node[]): Node[] {
  const byId = new Map(list.map((n) => [n.id, n]))
  return list.map((n) => {
    if (!n.parentNode) return n
    const p = byId.get(n.parentNode)
    if (!p || p.type !== 'nexionCard') return n
    const pos = clampChildPositionInCardParent(n, p)
    if (pos.x === n.position.x && pos.y === n.position.y) return n
    return { ...n, position: pos }
  })
}

/**
 * `nexionCard` 부모 플로 크기를 직접 자식 중첩 카드 바운딩 + 헤더·풋터 인셋에 맞게 키움(줄이지 않음).
 * 인셋이 pw/ph에 의존하므로 소수 회 반복.
 */
function fitCardParentToNestedChildren(list: Node[], cardId: string): Node[] {
  const parent = list.find((n) => n.id === cardId)
  if (!parent || parent.type !== 'nexionCard') return list

  const children = list.filter((n) => {
    if (n.parentNode !== cardId || n.type !== 'nexionCard') return false
    const d = (n.data || {}) as Record<string, unknown>
    return !!d.nestedInCard
  })
  if (!children.length) return list

  const st0 =
    parent.style && typeof parent.style === 'object' && !Array.isArray(parent.style)
      ? { ...(parent.style as Record<string, string>) }
      : {}
  let pw = parsePxFromStyle(st0.width, CARD_PARENT_W)
  let ph = parsePxFromStyle(st0.height, CARD_PARENT_H)

  for (let iter = 0; iter < 8; iter++) {
    const synthetic = {
      ...parent,
      style: { ...st0, width: `${pw}px`, height: `${ph}px` },
    } as Node
    const inset = getCardContentInset(synthetic)
    let maxR = 0
    let maxB = 0
    for (const c of children) {
      const st = c.style && typeof c.style === 'object' && !Array.isArray(c.style) ? c.style : {}
      const cw = parsePxFromStyle((st as { width?: string }).width, CHILD_IN_CARD_W)
      const ch = parsePxFromStyle((st as { height?: string }).height, CHILD_IN_CARD_H)
      maxR = Math.max(maxR, c.position.x + cw)
      maxB = Math.max(maxB, c.position.y + ch)
    }
    const needW = Math.max(CARD_PARENT_W, Math.ceil(maxR + inset.padX + CARD_NEST_BODY_PAD_R))
    const needH = Math.max(CARD_PARENT_H, Math.ceil(maxB + inset.bottom + CARD_NEST_BODY_PAD_B))
    if (needW === pw && needH === ph) break
    pw = needW
    ph = needH
  }

  const curW = parsePxFromStyle(st0.width, CARD_PARENT_W)
  const curH = parsePxFromStyle(st0.height, CARD_PARENT_H)
  if (curW === pw && curH === ph) return list

  return list.map((n) =>
    n.id === cardId ? { ...n, style: { ...st0, width: `${pw}px`, height: `${ph}px` } } : n,
  )
}

/** 중첩 카드 한 장부터 조상 `nexionCard`까지 안쪽 부모부터 순서대로 맞춤 */
function bubbleFitCardParentsFromNestedNode(list: Node[], nestedNodeId: string): Node[] {
  const node = list.find((n) => n.id === nestedNodeId)
  let pid: string | undefined = node?.parentNode
  const chain: string[] = []
  while (pid) {
    const p = list.find((x) => x.id === pid)
    if (!p || p.type !== 'nexionCard') break
    chain.push(pid)
    pid = p.parentNode
  }
  let out = list
  for (const id of chain) {
    out = fitCardParentToNestedChildren(out, id)
    out = clampAllNexionCardChildren(out)
  }
  return out
}

/** 줌 리베이크 후 자식 크기가 바뀌면 모든 `nexionCard` 부모를 깊은 쪽부터 다시 맞춤 */
function fitAllCardParentsToNestedChildren(list: Node[]): Node[] {
  const parentIds = new Set<string>()
  for (const n of list) {
    if (n.type !== 'nexionCard') continue
    const d = (n.data || {}) as Record<string, unknown>
    if (d.nestedInCard && n.parentNode) parentIds.add(n.parentNode)
  }
  if (!parentIds.size) return list
  const order = [...parentIds].sort(
    (a, b) => nexionCardNestingLevel(list, b) - nexionCardNestingLevel(list, a),
  )
  let out = list
  for (const pid of order) {
    out = fitCardParentToNestedChildren(out, pid)
    out = clampAllNexionCardChildren(out)
  }
  return out
}

/** 플로 좌표상 카드 짧은 변 — 스타일 없으면 루트/중첩 기본 */
function cardFlowMinDimensionPx(n: Node): number {
  const st = n.style && typeof n.style === 'object' && !Array.isArray(n.style) ? n.style : {}
  let w = parsePxFromStyle((st as { width?: string }).width, 0)
  let h = parsePxFromStyle((st as { height?: string }).height, 0)
  if (w <= 0 || h <= 0) {
    const d = (n.data || {}) as Record<string, unknown>
    const nested = !!d.nestedInCard
    w = w || (nested ? CHILD_IN_CARD_W : CARD_PARENT_W)
    h = h || (nested ? CHILD_IN_CARD_H : CARD_PARENT_H)
  }
  return Math.min(w, h)
}

/** 화면상 짧은 변 대략치(px) ≈ 플로 크기 × 글로벌 뷰포트 줌 — 시맨틱 줌에 사용 */
function cardScreenMinDim(n: Node, zoom: number): number {
  return cardFlowMinDimensionPx(n) * zoom
}

/** 티어가 깊을수록 조금 더 큰 화면 크기를 요구 */
const LOD_SCREEN_MIN_T1 = 46
const LOD_SCREEN_PER_TIER = 18

function minScreenShortEdgeForLodTier(tier: number): number {
  if (tier <= 0) return 0
  return LOD_SCREEN_MIN_T1 + (tier - 1) * LOD_SCREEN_PER_TIER
}

/** 부모 카드가 LOD로 숨겨지면 자손 카드도 숨김 */
function computeNexionCardLodHidden(
  n: Node,
  byId: Map<string, Node>,
  zoom: number,
  memo: Map<string, boolean>,
): boolean {
  if (n.type !== 'nexionCard') return false
  if (memo.has(n.id)) return memo.get(n.id)!
  const d = (n.data || {}) as Record<string, unknown>
  const tier =
    typeof d.nexionCardTier === 'number'
      ? d.nexionCardTier
      : d.nestedInCard
        ? 1
        : 0
  const sm = cardScreenMinDim(n, zoom)
  let hide = tier > 0 && sm < minScreenShortEdgeForLodTier(tier)
  if (!hide && n.parentNode) {
    const p = byId.get(n.parentNode)
    if (p?.type === 'nexionCard' && computeNexionCardLodHidden(p, byId, zoom, memo)) hide = true
  }
  memo.set(n.id, hide)
  return hide
}

const NXN_LOG = import.meta.env.DEV

function nxnLog(...args: unknown[]) {
  if (NXN_LOG) console.log('[NexionFlow]', ...args)
}

export const useNexionFlowStore = defineStore('nexionFlow', () => {
  const userSettings = useUserSettingsStore()
  const { settings: userSettingsRef } = storeToRefs(userSettings)

  const defaultEdgeOptions = computed(() => ({
    type: 'smoothstep' as const,
    /** `stroke`은 인라인으로 넣지 않음 — CSS `--nxn-edge-stroke`·선택 스타일이 먹도록 */
    style: {
      strokeWidth: userSettingsRef.value.nexionFlow.edgeStrokeWidth,
    },
  }))

  const nodes = shallowRef<Node[]>([])
  /** 연결 반영은 v-model·addEdge 모두 새 배열 할당 — shallowRef만으로는 뷰 갱신이 약할 때 triggerRef 보강 */
  const edges = shallowRef<Edge[]>([])

  function fitGroupToChildren(groupId: string) {
    const group = nodes.value.find((n) => n.id === groupId)
    if (!group || group.type !== 'nexionGroup') return
    const children = nodes.value.filter((n) => n.parentNode === groupId)
    if (!children.length) return
    let maxR = 0
    let maxB = 0
    for (const c of children) {
      const cw = parsePxFromStyle(
        c.style && typeof c.style === 'object' ? (c.style as { width?: string }).width : undefined,
        CHILD_IN_GROUP_W,
      )
      const ch = parsePxFromStyle(
        c.style && typeof c.style === 'object' ? (c.style as { height?: string }).height : undefined,
        CHILD_IN_GROUP_H,
      )
      maxR = Math.max(maxR, c.position.x + cw)
      maxB = Math.max(maxB, c.position.y + ch)
    }
    const st =
      group.style && typeof group.style === 'object' && !Array.isArray(group.style) ? group.style : {}
    const curW = parsePxFromStyle((st as { width?: string }).width, GROUP_MIN_W)
    const curH = parsePxFromStyle((st as { height?: string }).height, GROUP_MIN_H)
    const gw = Math.max(curW, maxR + GROUP_PAD.r)
    const gh = Math.max(curH, maxB + GROUP_PAD.b)
    nodes.value = nodes.value.map((n) =>
      n.id === groupId ? { ...n, style: { ...st, width: `${gw}px`, height: `${gh}px` } } : n,
    )
    triggerRef(nodes)
  }

  function ensureCardParentBounds(parentId: string) {
    const parent = nodes.value.find((x) => x.id === parentId)
    if (!parent || parent.type !== 'nexionCard') return
    const st =
      parent.style && typeof parent.style === 'object' && !Array.isArray(parent.style) ? { ...parent.style } : {}
    const hasW = typeof st.width === 'string' && st.width.length > 0
    const hasH = typeof st.height === 'string' && st.height.length > 0
    if (hasW && hasH) return
    nodes.value = nodes.value.map((n) =>
      n.id === parentId
        ? {
            ...n,
            style: {
              ...st,
              width: hasW ? st.width : `${CARD_PARENT_W}px`,
              height: hasH ? st.height : `${CARD_PARENT_H}px`,
            },
          }
        : n,
    )
    triggerRef(nodes)
  }
  const selectedNodeId = ref<string | null>(null)
  /** 우측 패널·버튼용 — 캔버스에서 연결선 클릭 시 설정 */
  const selectedEdgeId = ref<string | null>(null)

  watch(
    edges,
    (list) => {
      if (selectedEdgeId.value != null && !list.some((e) => e.id === selectedEdgeId.value)) {
        selectedEdgeId.value = null
      }
    },
    { deep: true },
  )

  /**
   * 엣지 생성 시 스타일이 객체로 박히면 CSS 변수보다 우선해 색/두께 변경이 캔버스에 안 보임.
   * 사용자 설정 변경 시 모든 엣지 `style`을 다시 맞춘다.
   */
  function syncAllEdgesStyleFromNexionUi() {
    const { edgeStrokeWidth } = userSettingsRef.value.nexionFlow
    const list = edges.value
    if (!list.length) return
    edges.value = list.map((e) => {
      const prev =
        e.style && typeof e.style === 'object' && !Array.isArray(e.style) ? { ...e.style } : {}
      delete (prev as { stroke?: unknown }).stroke
      return {
        ...e,
        style: {
          ...prev,
          strokeWidth: edgeStrokeWidth,
        },
      }
    })
    triggerRef(edges)
  }

  watch(
    () => [
      userSettingsRef.value.nexionFlow.edgeStrokeColor,
      userSettingsRef.value.nexionFlow.edgeStrokeWidth,
    ] as const,
    () => {
      syncAllEdgesStyleFromNexionUi()
    },
    { flush: 'post', immediate: true },
  )
  const viewportZoom = ref(1)
  /** 뷰 중앙(플로 좌표) — 좌측 패널 “중앙에 추가”에 사용, FlowHooks가 갱신 */
  const spawnFlowPosition = ref({ x: 240, y: 200 })
  const pendingFitNodeId = ref<string | null>(null)

  function setViewportZoom(z: number) {
    viewportZoom.value = z
  }

  function setSpawnFlowPosition(p: { x: number; y: number }) {
    spawnFlowPosition.value = p
  }

  function requestFitView(nodeId: string) {
    pendingFitNodeId.value = nodeId
  }

  function consumePendingFitView(): string | null {
    const id = pendingFitNodeId.value
    pendingFitNodeId.value = null
    return id
  }

  function showNodeDetail(zoom: number): boolean {
    return zoom >= LOD_ZOOM_DETAIL
  }

  /** Link ID 풋터: 화면에서 카드가 충분히 크면 줌 수치와 무관하게 전체 줄 표시 */
  function showCardFooterDetail(nodeId: string, zoom: number): boolean {
    const n = nodes.value.find((x) => x.id === nodeId)
    if (!n || n.type !== 'nexionCard') return showNodeDetail(zoom)
    const sm = cardScreenMinDim(n, zoom)
    if (sm >= 84) return true
    return showNodeDetail(zoom)
  }

  /**
   * 뷰포트 줌에 따라 중첩 카드에 `hidden` 설정 — 줌 아웃 시 깊은 카드는 숨기고,
   * 부모가 숨겨지면 자손 카드도 숨김.
   */
  function applyLodHiddenFlags(zoom: number) {
    const list = nodes.value
    const byId = new Map(list.map((x) => [x.id, x]))
    const memo = new Map<string, boolean>()
    let changed = false
    const next = list.map((n) => {
      if (n.type !== 'nexionCard') return n
      const hide = computeNexionCardLodHidden(n, byId, zoom, memo)
      if (!!n.hidden !== hide) {
        changed = true
        return { ...n, hidden: hide }
      }
      return n
    })
    if (changed) {
      nodes.value = next
      triggerRef(nodes)
    }
  }

  /**
   * Pinia `nodes` 안의 중첩 카드 style 크기를 현재 뷰포트 줌에 맞게 다시 계산.
   * (로컬 스토리지와 무관 — 논리 그래프는 동일, 플로 좌표 박스만 갱신)
   */
  function rebakeNestedCardFlowSizes(zoom?: number) {
    const z = zoom ?? viewportZoom.value
    const sid = selectedNodeId.value
    const readingFocus =
      sid != null && nodes.value.some((x) => x.id === sid && x.type === 'nexionCard') ? sid : null
    const { list, changed } = rebakeNestedCardFlowSizesFromZoom(nodes.value, z, readingFocus)
    if (!changed) return
    nodes.value = fitAllCardParentsToNestedChildren(list)
    triggerRef(nodes)
  }

  /** Vue Flow `apply-default="false"` + `@nodes-change` — 드래그 후 카드 자식 위치 클램프 · 부모 카드 본문에 맞게 확장 */
  function onNodesChange(changes: NodeChange[]) {
    let next = applyNodeChanges(changes, nodes.value as unknown as GraphNode[]) as Node[]
    next = clampAllNexionCardChildren(next)
    nodes.value = next

    if (changes.some((c) => c.type === 'add' || c.type === 'remove')) {
      rebakeNestedCardFlowSizes(viewportZoom.value)
      applyLodHiddenFlags(viewportZoom.value)
    }

    const touchedNested = new Set<string>()
    for (const ch of changes) {
      if (ch.type === 'position' || ch.type === 'dimensions') {
        const node = nodes.value.find((n) => n.id === ch.id)
        const d = node?.data as Record<string, unknown> | undefined
        if (node?.parentNode && d?.nestedInCard) touchedNested.add(node.id)
      }
      if (ch.type === 'add' && 'item' in ch) {
        const item = ch.item as Node
        const d = item.data as Record<string, unknown> | undefined
        if (item.type === 'nexionCard' && item.parentNode && d?.nestedInCard) {
          touchedNested.add(item.id)
        }
      }
    }
    if (touchedNested.size > 0) {
      let list = nodes.value
      for (const nid of touchedNested) {
        list = bubbleFitCardParentsFromNestedNode(list, nid)
      }
      nodes.value = clampAllNexionCardChildren(list)
      triggerRef(nodes)
    }
  }

  function selectNode(id: string | null) {
    selectedNodeId.value = id
    if (id != null) selectedEdgeId.value = null
  }

  function selectEdge(id: string | null) {
    selectedEdgeId.value = id
    if (id != null) selectedNodeId.value = null
  }

  /** 빈 판 클릭 등 — 우측 패널·선택 상태만 초기화(Vue Flow 자체 선택은 내부 동작 따름) */
  function clearUiSelection() {
    selectedNodeId.value = null
    selectedEdgeId.value = null
  }

  function removeEdge(edgeId: string) {
    const next = edges.value.filter((e) => e.id !== edgeId)
    if (next.length === edges.value.length) return
    edges.value = next
    triggerRef(edges)
    if (selectedEdgeId.value === edgeId) selectedEdgeId.value = null
  }

  function onEdgesChange(changes: EdgeChange[]) {
    edges.value = applyEdgeChanges(changes, edges.value as unknown as GraphEdge[]) as Edge[]
  }

  function onConnect(conn: Connection) {
    nxnLog('onConnect payload', { ...conn })
    if (!conn.source || !conn.target) {
      nxnLog('onConnect skipped: missing source or target')
      return
    }
    const dup = edges.value.some((e) => e.source === conn.source && e.target === conn.target)
    if (dup) {
      nxnLog('onConnect skipped: duplicate source→target', conn.source, '→', conn.target)
      return
    }
    const before = edges.value.length
    // source/target/sourceHandle/targetHandle는 conn이 최종 우선(스프레드 순서)
    const next = vfAddEdge(
      {
        ...defaultEdgeOptions.value,
        id: `e-${conn.source}-${conn.target}-${uuidv4().slice(0, 6)}`,
        ...conn,
        // setEdges → createGraphEdges 재검증 시 핸들이 비면 엣지가 통째로 제거될 수 있어 명시 보정
        sourceHandle: conn.sourceHandle ?? 'out',
        targetHandle: conn.targetHandle ?? 'in',
      },
      edges.value,
    ) as Edge[]
    edges.value = next
    triggerRef(edges)
    nxnLog('onConnect applied addEdge', { before, after: next.length, lastEdge: next[next.length - 1] })
    if (isNexionFlowDebug()) {
      const le = next[next.length - 1]
      nxnDiag('onConnect 직후 마지막 엣지(필드)', {
        id: le?.id,
        source: le?.source,
        target: le?.target,
        sourceHandle: le?.sourceHandle,
        targetHandle: le?.targetHandle,
        type: le?.type,
      })
    }
  }

  function addDocNodeAtSpawn() {
    const p = spawnFlowPosition.value
    return addDocNode({ x: p.x + (Math.random() - 0.5) * 24, y: p.y + (Math.random() - 0.5) * 24 })
  }

  function addGroupAtSpawn() {
    const p = spawnFlowPosition.value
    return addGroupNode({ x: p.x - 100, y: p.y - 80 })
  }

  type AddDocNodeOpts = {
    /** 그룹 자식 기본 박스 */
    groupChild?: boolean
    /** 카드 안 자식 — 작은 박스, nestedInCard */
    cardChild?: boolean
  }

  function addDocNode(flowPosition: { x: number; y: number }, parentId?: string, opts?: AddDocNodeOpts) {
    const id = `node-${uuidv4().slice(0, 8)}`
    const linkId = shortLinkId()
    const parent = parentId ? nodes.value.find((x) => x.id === parentId) : undefined

    const data: Record<string, unknown> = { label: '새 카드', linkId }
    let style: Record<string, string> | undefined
    if (opts?.cardChild && parentId) {
      const parentLv = nexionCardNestingLevel(nodes.value, parentId)
      const tier = parentLv + 1
      data.nestedInCard = true
      data.nexionCardTier = tier
      const { w, h } = nestedCardFlowBoxPx(parent, tier, viewportZoom.value, {
        nodeId: id,
        readingFocusId: null,
      })
      style = { width: `${w}px`, height: `${h}px` }
    } else if (opts?.groupChild) {
      style = { width: `${CHILD_IN_GROUP_W}px`, height: `${CHILD_IN_GROUP_H}px` }
    } else if (!parentId) {
      /** 부모 없음 — 스타일 없으면 플로 노드 래퍼가 0에 가까워져 핸들·엣지만 보임 */
      style = { width: `${CARD_PARENT_W}px`, height: `${CARD_PARENT_H}px` }
    }

    const n: Node = {
      id,
      type: 'nexionCard',
      position: flowPosition,
      data: data as Node['data'],
      ...(style ? { style } : {}),
      ...(parentId && parent
        ? {
            parentNode: parentId,
            /**
             * 커스텀 extent 튜플은 플로 절대좌표로 해석되는 경우가 있어 부모-상대 드래그가 깨짐.
             * `parent` + onNodesChange 클램프로 본문 안만 유지.
             */
            extent: 'parent' as const,
            /** 그룹: Vue Flow 부모 확장. 카드: 스토어에서 `bubbleFitCardParentsFromNestedNode` 로 플로 크기 조정 */
            expandParent: parent.type === 'nexionGroup',
          }
        : {}),
    }
    nodes.value = [...nodes.value, n]
    if (parent?.type === 'nexionCard' && opts?.cardChild) {
      nodes.value = clampAllNexionCardChildren(nodes.value)
    }
    selectNode(id)
    rebakeNestedCardFlowSizes(viewportZoom.value)
    applyLodHiddenFlags(viewportZoom.value)
    if (parent?.type === 'nexionCard' && opts?.cardChild) {
      nodes.value = bubbleFitCardParentsFromNestedNode(nodes.value, id)
      nodes.value = clampAllNexionCardChildren(nodes.value)
      triggerRef(nodes)
    }
    return id
  }

  function addGroupNode(flowPosition: { x: number; y: number }) {
    const id = `group-${uuidv4().slice(0, 8)}`
    const n: Node = {
      id,
      type: 'nexionGroup',
      position: flowPosition,
      data: { label: '그룹', linkId: shortLinkId() },
      style: { width: '320px', height: '240px' },
    }
    nodes.value = [...nodes.value, n]
    selectNode(id)
    applyLodHiddenFlags(viewportZoom.value)
    return id
  }

  function addChildCard(parentId: string) {
    const parent = nodes.value.find((x) => x.id === parentId)
    if (!parent || (parent.type !== 'nexionGroup' && parent.type !== 'nexionCard')) return null

    if (parent.type === 'nexionCard') {
      ensureCardParentBounds(parentId)
      const p2 = nodes.value.find((x) => x.id === parentId)
      if (!p2) return null
      const inset = getCardContentInset(p2)
      const parentLv = nexionCardNestingLevel(nodes.value, parentId)
      const { w: cw, h: ch } = nestedCardFlowBoxPx(p2, parentLv + 1, viewportZoom.value)
      const innerW = inset.pw - 2 * inset.padX
      const innerH = inset.ph - inset.top - inset.bottom
      const x = inset.padX + Math.max(0, (innerW - cw) / 2)
      const y = inset.top + Math.max(0, (innerH - ch) / 2)
      return addDocNode({ x, y }, parentId, { cardChild: true })
    }

    const id = addDocNode({ x: 20, y: 52 }, parentId, { groupChild: true })
    fitGroupToChildren(parentId)
    return id
  }

  function removeNode(id: string) {
    const removeIds = collectSubtreeNodeIds(id, nodes.value)
    nodes.value = nodes.value.filter((n) => !removeIds.has(n.id))
    edges.value = edges.value.filter((e) => !removeIds.has(e.source) && !removeIds.has(e.target))
    if (selectedNodeId.value != null && removeIds.has(selectedNodeId.value)) {
      selectedNodeId.value = null
    }
    triggerRef(edges)
    rebakeNestedCardFlowSizes(viewportZoom.value)
    applyLodHiddenFlags(viewportZoom.value)
  }

  function setNodeLabel(id: string, label: string) {
    nodes.value = nodes.value.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label } } : n,
    )
  }

  function resetPrototype() {
    nodes.value = []
    edges.value = []
    selectedNodeId.value = null
    selectedEdgeId.value = null
  }

  return {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    viewportZoom,
    spawnFlowPosition,
    pendingFitNodeId,
    defaultEdgeOptions,
    syncAllEdgesStyleFromNexionUi,
    LOD_ZOOM_DETAIL,
    setViewportZoom,
    showNodeDetail,
    showCardFooterDetail,
    applyLodHiddenFlags,
    rebakeNestedCardFlowSizes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addDocNode,
    addDocNodeAtSpawn,
    addGroupAtSpawn,
    addGroupNode,
    addChildCard,
    removeNode,
    setNodeLabel,
    resetPrototype,
    selectNode,
    selectEdge,
    removeEdge,
    clearUiSelection,
    setSpawnFlowPosition,
    requestFitView,
    consumePendingFitView,
  }
})
