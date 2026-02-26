/**
 * 모델 표시명 포맷터 (채팅창 등 사용자 친화적 표시용)
 * - 설정 패널: 원본 name 유지
 * - 채팅창: 휴리스틱 파싱 + 선택적 오버라이드
 *
 * @example
 * formatModelDisplayName('llama3.2:latest')  // → 'Llama 3.2'
 * formatModelDisplayName('qwen2.5:7b')      // → 'Qwen 2.5 7B'
 * formatModelDisplayName('gemma3:latest')   // → 'Gemma 3'
 */

/** 필요 시 추가. key: 원본 name (대소문자 무시), value: 표시명 */
const DEFAULT_OVERRIDES = {
  'gpt-oss:120b-cloud': 'GPT-OSS 120B',
  'deepseek-v3.1:671b-cloud': 'Deepseek V3.1 671B',
  'deepseek-v3.1:671b': 'Deepseek V3.1 671B',
}

function findOverride(merged, rawName) {
  if (merged[rawName]) return merged[rawName]
  const lower = rawName.toLowerCase()
  const key = Object.keys(merged).find((k) => k.toLowerCase() === lower)
  return key ? merged[key] : null
}

/**
 * @param {string} rawName - Ollama 모델 식별자 (예: 'llama3.2:latest')
 * @param {Record<string,string>} [overrides] - 추가 오버라이드 맵
 * @returns {string} 사용자 친화적 표시명
 */
export function formatModelDisplayName(rawName, overrides = {}) {
  if (!rawName || typeof rawName !== 'string') return rawName || ''
  const merged = { ...DEFAULT_OVERRIDES, ...overrides }
  const override = findOverride(merged, rawName)
  if (override) return override

  const [base, tag] = rawName.split(':').map((s) => (s || '').trim())
  if (!base) return rawName

  let display = base
    .replace(/^([a-z])/, (_, c) => c.toUpperCase())
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/-r(\d)/gi, (_, n) => ` R${n}`)
  if (tag && tag !== 'latest') {
    const t = tag.replace(/^(\d+)([a-z])$/i, (_, n, u) => `${n}${u.toUpperCase()}`)
    display += ' ' + (t.charAt(0).toUpperCase() + t.slice(1))
  }
  return display.trim()
}
