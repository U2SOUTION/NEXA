/**
 * Zod → JSON Schema 변환 유틸 — [NEXA-AI-10] §3
 * 프롬프트에 "다음 JSON Schema에 맞게 응답하라" 형태로 주입.
 * ai_responses 스키마에 한정된 단순 구현. 복잡 스키마는 zod-to-json-schema 패키지 고려.
 */
import type { z } from 'zod'

type JsonSchema = Record<string, unknown>

/** Zod 스키마를 JSON Schema로 변환 (프롬프트용) */
export function toJsonSchemaForPrompt(schema: z.ZodTypeAny): JsonSchema {
  return visit(schema) as JsonSchema
}

function visit(schema: z.ZodTypeAny): unknown {
  const def = (schema as { _def?: { typeName?: string } })._def
  const typeName = def?.typeName ?? 'ZodUnknown'

  switch (typeName) {
    case 'ZodObject': {
      const shape = (def as { shape?: Record<string, z.ZodTypeAny> }).shape
      const props: Record<string, unknown> = {}
      const required: string[] = []
      if (shape) {
        for (const [key, sub] of Object.entries(shape)) {
          const subSchema = visit(sub)
          if (subSchema && typeof subSchema === 'object') {
            props[key] = subSchema
            const subDef = (sub as { _def?: { typeName?: string } })._def
            if (subDef?.typeName !== 'ZodOptional' && subDef?.typeName !== 'ZodDefault') {
              required.push(key)
            }
          }
        }
      }
      const result: JsonSchema = { type: 'object', properties: props }
      if (required.length > 0) result.required = required
      return result
    }
    case 'ZodString':
      return { type: 'string' }
    case 'ZodNumber':
      return { type: 'number' }
    case 'ZodBoolean':
      return { type: 'boolean' }
    case 'ZodArray': {
      const items = (def as { type?: z.ZodTypeAny }).type
      return { type: 'array', items: items ? visit(items) : {} }
    }
    case 'ZodOptional':
    case 'ZodDefault': {
      const inner = (def as { innerType?: z.ZodTypeAny }).innerType ?? (def as { type?: z.ZodTypeAny }).type
      return inner ? visit(inner) : {}
    }
    case 'ZodRecord': {
      const valueType = (def as { valueType?: z.ZodTypeAny }).valueType
      return { type: 'object', additionalProperties: valueType ? visit(valueType) : true }
    }
    case 'ZodEnum': {
      const values = (def as { values?: string[] }).values
      return values ? { type: 'string', enum: values } : { type: 'string' }
    }
    default:
      return { type: 'object' }
  }
}

/** JSON Schema를 프롬프트용 문자열로 직렬화 */
export function toPromptSchemaString(schema: z.ZodTypeAny): string {
  const json = toJsonSchemaForPrompt(schema)
  return JSON.stringify(json, null, 2)
}
