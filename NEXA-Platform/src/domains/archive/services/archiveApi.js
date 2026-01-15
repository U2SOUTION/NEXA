import { getApiBaseUrl } from '@system/utils/apiBaseUrl.js'

const API_BASE = getApiBaseUrl()

// 공통 fetch 래퍼
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
  }
  return res.status === 204 ? null : res.json()
}

// 레이아웃 템플릿 목록 조회 (category=LAYOUT)
export async function fetchLayouts() {
  // 예시 엔드포인트: GET /system-templates?category=LAYOUT
  return request('/system-templates?category=LAYOUT')
}

// 아카이브 목록 조회
export async function fetchArchives() {
  return request('/archives')
}

// 아카이브 단건 조회 (본문 포함)
export async function fetchArchiveDetail(id) {
  if (!id) throw new Error('id is required')
  return request(`/archives/${id}`)
}

// 아카이브 메타 + 본문 수정
export async function updateArchiveWithContent({ archiveId, docId, title, docType, status, layoutId, contentJson, orderIdx = 0 }) {
  if (!archiveId || !title) throw new Error('archiveId and title are required')
  // 메타 업데이트
  const archive = await request(`/archives/${archiveId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title,
      doc_type: docType,
      status,
      layout_id: layoutId,
    }),
  })

  // 본문 업데이트 (docId 없으면 스킵)
  let doc = null
  if (docId) {
    doc = await request(`/archive-doc/${docId}`, {
      method: 'PUT',
      body: JSON.stringify({
        content_json: contentJson,
        order_idx: orderIdx,
      }),
    })
  }

  return { archive, doc }
}

// 아카이브 문서 생성 + 본문 저장
export async function createArchiveWithContent({ title, docType, status, layoutId, contentJson }) {
  // 1) 메타 생성
  const archive = await request('/archives', {
    method: 'POST',
    body: JSON.stringify({
      title,
      doc_type: docType,
      status,
      layout_id: layoutId,
    }),
  })

  // 2) 본문 생성 (단일 블록)
  await request('/archive-doc', {
    method: 'POST',
    body: JSON.stringify({
      archive_id: archive.id,
      content_json: contentJson,
      order_idx: 0,
    }),
  })

  return archive
}
