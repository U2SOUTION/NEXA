import { getApiBaseUrl } from '@system/utils/apiBaseUrl'

async function request(
  path: string,
  options: Parameters<typeof fetch>[1] & { headers?: Record<string, string> } = {},
): Promise<unknown> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
  }
  return res.status === 204 ? null : res.json()
}

export async function fetchLayouts(): Promise<unknown> {
  return request('/system-templates?category=LAYOUT')
}

export async function fetchArchives(): Promise<unknown> {
  return request('/archives')
}

export async function fetchArchiveDetail(id: string): Promise<unknown> {
  if (!id) throw new Error('id is required')
  return request(`/archives/${id}`)
}

export type UpdateArchiveWithContentParams = {
  archiveId: string
  docId?: string | null
  title: string
  docType?: string | null
  status?: string | null
  layoutId?: string | number | null
  contentJson?: unknown
  orderIdx?: number
}

export async function updateArchiveWithContent(params: UpdateArchiveWithContentParams): Promise<{ archive: unknown; doc: unknown }> {
  const { archiveId, docId, title, docType, status, layoutId, contentJson, orderIdx = 0 } = params
  if (!archiveId || !title) throw new Error('archiveId and title are required')

  const archive = await request(`/archives/${archiveId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title,
      doc_type: docType,
      status,
      layout_id: layoutId,
    }),
  })

  let doc: unknown = null
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

export type CreateArchiveWithContentParams = {
  title: string
  docType?: string | null
  status?: string | null
  layoutId?: string | number | null
  contentJson?: unknown
}

export async function createArchiveWithContent(params: CreateArchiveWithContentParams): Promise<unknown> {
  const { title, docType, status, layoutId, contentJson } = params

  const archive = await request('/archives', {
    method: 'POST',
    body: JSON.stringify({
      title,
      doc_type: docType,
      status,
      layout_id: layoutId,
    }),
  }) as { id: number }

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
