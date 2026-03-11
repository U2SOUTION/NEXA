import type { RequestLike, ResponseLike } from '@/types/request-response.js'
import { fetchLayouts, createArchiveMeta, createArchiveDoc, listArchives, getArchiveWithDoc, updateArchiveMeta, updateArchiveDoc } from './archive.service.js'

export async function handleFetchLayouts(_req: RequestLike, res: ResponseLike) {
  try {
    const rows = await fetchLayouts()
    res.json(rows)
  } catch (err) {
    console.error('[archive] GET /system-templates', err)
    res.status(500).json({ error: 'failed to fetch templates' })
  }
}

export async function handleCreateArchive(req: RequestLike, res: ResponseLike) {
  const body = (req.body || {}) as Record<string, unknown>
  const { title, doc_type, status, layout_id } = body
  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }
  try {
    const meta = await createArchiveMeta({ title, doc_type, status, layout_id })
    res.json(meta)
  } catch (err: unknown) {
    console.error('[archive] POST /archives', err)
    res.status(500).json({ error: 'failed to create archive' })
  }
}

export async function handleCreateArchiveDoc(req: RequestLike, res: ResponseLike) {
  const body = (req.body || {}) as Record<string, unknown>
  const { archive_id, content_json, order_idx } = body
  if (!archive_id) {
    return res.status(400).json({ error: 'archive_id is required' })
  }
  try {
    const doc = await createArchiveDoc({ archive_id, content_json, order_idx })
    res.json(doc)
  } catch (err: unknown) {
    console.error('[archive] POST /archive-doc', err)
    res.status(500).json({ error: 'failed to create archive doc' })
  }
}

export async function handleListArchives(_req: RequestLike, res: ResponseLike) {
  try {
    const rows = await listArchives()
    res.json(rows)
  } catch (err: unknown) {
    console.error('[archive] GET /archives', err)
    res.status(500).json({ error: 'failed to fetch archives' })
  }
}

export async function handleGetArchive(req: RequestLike, res: ResponseLike) {
  const id = Number(req.params?.id)
  if (!id) {
    return res.status(400).json({ error: 'invalid id' })
  }
  try {
    const data = await getArchiveWithDoc(id)
    if (!data) {
      return res.status(404).json({ error: 'not found' })
    }
    res.json(data)
  } catch (err: unknown) {
    console.error('[archive] GET /archives/:id', err)
    res.status(500).json({ error: 'failed to fetch archive' })
  }
}

export async function handleUpdateArchive(req: RequestLike, res: ResponseLike) {
  const id = Number(req.params?.id)
  const body = (req.body || {}) as Record<string, unknown>
  const { title, doc_type, status, layout_id } = body
  if (!id || !title) {
    return res.status(400).json({ error: 'invalid payload' })
  }
  try {
    const meta = await updateArchiveMeta(id, { title, doc_type, status, layout_id })
    if (!meta) return res.status(404).json({ error: 'not found' })
    res.json(meta)
  } catch (err: unknown) {
    console.error('[archive] PUT /archives/:id', err)
    res.status(500).json({ error: 'failed to update archive' })
  }
}

export async function handleUpdateArchiveDoc(req: RequestLike, res: ResponseLike) {
  const id = Number(req.params?.id)
  const body = (req.body || {}) as Record<string, unknown>
  const { content_json, order_idx } = body
  if (!id) {
    return res.status(400).json({ error: 'invalid id' })
  }
  try {
    const doc = await updateArchiveDoc(id, { content_json, order_idx })
    if (!doc) return res.status(404).json({ error: 'not found' })
    res.json(doc)
  } catch (err: unknown) {
    console.error('[archive] PUT /archive-doc/:id', err)
    res.status(500).json({ error: 'failed to update archive doc' })
  }
}
