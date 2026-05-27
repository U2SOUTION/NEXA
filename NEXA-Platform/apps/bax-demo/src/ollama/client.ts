/**
 * @file client.ts
 * @role AestheticTuner Ollama client — Phase2 fine_tune JSON generate. timeout 3s · FR-07 fallback.
 *       클라우드 API 금지 (MVP).
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §5.2 · §5.3
 */

export interface FineTuneDecision {
  phase: 'fine_tune'
  target_component: string
  void_ratio_delta: number
  focus_blur_scale: number
}

const OLLAMA_URL = 'http://localhost:11434/api/generate'

export async function evaluateWithOllama(
  prompt: string,
  options: { timeoutMs?: number } = {},
): Promise<FineTuneDecision | null> {
  const { timeoutMs = 3000 } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3', format: 'json', stream: false, prompt }),
      signal: controller.signal,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { response?: string }
    return data.response ? (JSON.parse(data.response) as FineTuneDecision) : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
