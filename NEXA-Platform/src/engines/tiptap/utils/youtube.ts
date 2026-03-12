export function extractYouTubeId(url: string | null | undefined) {
  if (!url) return null
  const trimmed = url.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/, /youtube\.com\/watch\?.*v=([^&\n?#]+)/]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

export default extractYouTubeId
