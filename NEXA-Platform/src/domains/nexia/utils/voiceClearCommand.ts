/**
 * 음성으로 "대화 비우기" 명령 판별 (입력창 타이핑 경로와 무관, Web Speech onresult/stop에서만 사용)
 */

export const DEFAULT_VOICE_CLEAR_CONVERSATION_PHRASES = ['취소'] as const

/** 쉼표·전각쉼표로 구분된 문자열 → 트리거 단어 목록 (비어 있으면 기본값) */
export function parseVoiceClearPhraseList(raw: string | undefined | null): string[] {
  if (raw == null || !String(raw).trim()) {
    return [...DEFAULT_VOICE_CLEAR_CONVERSATION_PHRASES]
  }
  const parts = String(raw)
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : [...DEFAULT_VOICE_CLEAR_CONVERSATION_PHRASES]
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 문장 끝이 공백으로 구분된 `phrase` 반복(예: …삭제 취소 취소) 또는 `phrase`만.
 * phrase는 한 단어(토큰) 단위로 끝에서 비교한다.
 */
function matchesTrailingPhraseTokens(transcript: string, phrase: string): boolean {
  const pNorm = phrase.replace(/[!?.…,，。]/g, '').trim()
  if (!pNorm) return false

  let t = transcript.trim()
  if (!t) return false
  t = t.replace(/[!?.…,，。]+$/g, '').trim()
  if (!t) return false

  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return false
  const normalized = parts.map((p) => p.replace(/[!?.…,，。]/g, ''))

  let i = normalized.length - 1
  while (i >= 0 && normalized[i] === pNorm) {
    i--
  }
  const trailing = normalized.length - 1 - i
  if (trailing >= 1) return true

  const escaped = escapeRegExp(pNorm)
  return new RegExp(`(?:^|\\s)${escaped}(\\s+${escaped})*\\s*$`, 'u').test(t)
}

/** phrases 중 하나라도 끝 패턴과 맞으면 true */
export function matchesVoiceClearCommand(transcript: string, phrases: string[]): boolean {
  const list = phrases.map((p) => p.trim()).filter(Boolean)
  const effective = list.length > 0 ? list : [...DEFAULT_VOICE_CLEAR_CONVERSATION_PHRASES]
  for (const phrase of effective) {
    if (matchesTrailingPhraseTokens(transcript, phrase)) return true
  }
  return false
}
