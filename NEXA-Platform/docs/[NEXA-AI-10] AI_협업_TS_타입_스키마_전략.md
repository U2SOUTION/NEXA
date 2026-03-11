# [NEXA-AI-10] AI 협업 TS·타입·스키마 전략

**목적**: Ollama 등 LLM과 협업 시 **Zod 스키마·타입·에러 코드**를 일관되게 적용하여 AI 응답 검증·프롬프트 가이드·에러 처리를 타입 안전하게 수행하기 위한 **도메인 전략서**이다. [NEXA-PLATFORM-TS-01]의 공통 패턴(auth, devices, projects, errors 스키마 통합)을 전제로, **AI 도메인에 특화된** 스키마·타입·유틸을 정리한다.

**적용 범위**: `server/domains/ai/**`, `src/system/schemas/ai_responses.ts`

**참조 문서**: [NEXA-PLATFORM-TS-01] (서버·프론트 TS 마이그레이션 및 최적화 전략)

**작성일**: 2025-03

---

## 1. 선행 완료 사항

AI 협업 기능을 개발하기 **전에** 아래를 먼저 완료한다.

| 선행 항목 | 문서 | 내용 |
|----------|------|------|
| **비즈니스 에러 코드 공유** | [NEXA-PLATFORM-TS-01] §2.5 | `ApiErrorCode`·`Record<ApiErrorCode, string>` 메시지 맵 정의. AI 관련 에러(`AI_MODEL_LOAD_FAILED`, `AI_TIMEOUT`, `AI_SERVICE_UNAVAILABLE`) 포함. |
| **API 스키마 통합** | [NEXA-PLATFORM-TS-01] §2.1 | `src/system/schemas/`(auth, devices, projects, errors) 통합. tsconfig paths 정교 설정. |

---

## 2. AI 응답 스키마 — ai_responses.ts

AI(LLM, 예: Ollama)가 반환해야 할 **JSON 구조**를 Zod 스키마로 정의하고, 이를 바탕으로 **프롬프트를 생성**하면, 서버에서 AI 응답을 받는 즉시 `.parse()` 또는 `.safeParse()`로 검증하여 **타입 안전하게 처리**할 수 있다.

| 항목 | 내용 |
|------|------|
| **정의 위치** | `src/system/schemas/ai_responses.ts` |
| **흐름** | (1) 스키마 정의 → (2) 스키마 구조를 프롬프트에 반영 → (3) AI raw 출력을 `aiResponseSchema.parse(json)`로 검증 → (4) `z.infer` 타입으로 처리. |

```ts
// 예: src/system/schemas/ai_responses.ts
import { z } from 'zod'

export const summaryResponseSchema = z.object({
  summary: z.string(),
  keywords: z.array(z.string()),
  confidence: z.number().min(0).max(1).optional(),
})
export type SummaryResponse = z.infer<typeof summaryResponseSchema>
// 활용: const result = summaryResponseSchema.parse(JSON.parse(aiRawOutput))
```

- 도메인별로 `summaryResponseSchema`, `extractionResponseSchema` 등을 분리하여 두고, 각 AI 기능에 맞는 스키마를 선택해 사용한다.

---

## 3. Zod 스키마 → JSON Schema 프롬프트 주입 유틸리티

Zod 스키마에 `.description()`을 활용해 필드별 설명을 부여하고, 이를 **자동으로 추출**하여 **JSON Schema** 형태로 변환한 뒤 Ollama 프롬프트에 가이드로 주입하는 유틸리티를 둔다.

| 항목 | 내용 |
|------|------|
| **위치** | `server/domains/ai/utils/zodToPromptSchema.ts`. `zod-to-json-schema` 패키지 또는 직접 변환. |
| **흐름** | (1) 스키마에 `.description()` 추가 → (2) 유틸로 Zod → JSON Schema 변환 → (3) 프롬프트에 "다음 JSON Schema에 맞게 응답하라" 형태로 주입. |

```ts
// 예: 스키마에 description 추가
const summaryResponseSchema = z.object({
  summary: z.string().description('문서의 핵심 요약, 1~2문장'),
  keywords: z.array(z.string()).description('핵심 키워드 목록, 3~5개'),
  confidence: z.number().min(0).max(1).optional().description('신뢰도 0~1'),
})
// 유틸: toJsonSchemaForPrompt(schema) → JSON Schema 문자열 반환 → 프롬프트에 주입
```

---

## 4. AI 컨텍스트 타입 — ProjectContext, DeviceContext

프롬프트에 주입하는 컨텍스트(프로젝트·디바이스 정보 등)를 타입으로 정의한다.

| 항목 | 내용 |
|------|------|
| **정의 위치** | `server/domains/ai/ai.types.ts` |
| **타입 예** | `ProjectContext`, `DeviceContext` — AI가 필요한 메타데이터 필드만 선별. |

```ts
// 예: server/domains/ai/ai.types.ts
export interface ProjectContext {
  id: string
  name: string
  description: string | null
}
export interface DeviceContext {
  id: string
  name: string
  projectId: string
  metadata?: Record<string, unknown>
}
```

---

## 5. AI 작업 상태 — AiJobStatus

비동기 AI 작업의 상태를 Union 타입으로 정의한다.

```ts
// server/domains/ai/ai.types.ts
export type AiJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
```

- AI 작업 큐·폴링·UI 상태 표시 시 `AiJobStatus`를 사용.

---

## 6. ApiErrorCode에 AI 에러 통합

Ollama 연동 시 발생하는 에러(모델 로드 실패, 타임아웃 등)를 [NEXA-PLATFORM-TS-01] §2.5의 `ApiErrorCode`에 통합한다.

| 코드 | 용도 |
|------|------|
| `AI_MODEL_LOAD_FAILED` | 모델 로드 실패 |
| `AI_TIMEOUT` | 응답 타임아웃 |
| `AI_SERVICE_UNAVAILABLE` | AI 서비스 불가 |

- `src/system/schemas/errors.ts`에 추가. 동일한 `Record<ApiErrorCode, string>` 메시지 맵으로 i18n·토스트 처리.

---

## 7. 체크리스트

- [ ] §1 선행 완료: 비즈니스 에러 코드 공유·API 스키마 통합
- [ ] `src/system/schemas/ai_responses.ts` 정의. 도메인별 스키마(`summaryResponseSchema` 등)
- [ ] `server/domains/ai/utils/zodToPromptSchema.ts` — Zod → JSON Schema 변환 유틸
- [ ] `server/domains/ai/ai.types.ts` — `ProjectContext`, `DeviceContext`, `AiJobStatus` 정의
- [ ] `ApiErrorCode`에 AI 관련 코드 추가 (errors.ts). 메시지 맵에 대응 문구 추가

---

## 8. 참고 문서

| 문서 | 내용 |
|------|------|
| **[NEXA-PLATFORM-TS-01]** | TS 마이그레이션·스키마 통합·에러 코드·Zod 패턴. AI 도메인은 본 문서에서 상세 정의. |
| **[NEXA-AI-03]** | AI 협업형 멀티 에디터 플랫폼 — 오케스트레이터·Focus Stack |
| **[NEXA-AI-07]** | 음성·미디어 파이프라인 — 비동기 큐·재시도 |
