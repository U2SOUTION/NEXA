# [NEXA-PLATFORM-TS-01] 서버·프론트 TS 마이그레이션 및 최적화 전략

**목적**: NEXA 플랫폼 전체(서버 + 프론트)에서 TypeScript(.ts)를 일관되게 사용하고, 타입 기반 품질·리팩터·도메인 경계를 명확히 하기 위한 **전략서**이다. .ts 전환 1단계(확장자 변환·실행 환경)를 전제로, **무엇을 어떻게 최적화할지** 단계별로 정리한다. **IoT 플랫폼** 특성(엣지 디바이스 다수, 보안·데이터 안정성, Zod·JSON/JSONB·AI 친화 데이터)을 반영하여 검토·적용할 항목을 포함한다.

**적용 범위**: 서버(`server/**`), 프론트(`src/**`)

**참조 문서**: [NEXA-AUTH-01] §1.4, [NEXA-AI-10] (AI 협업 TS·타입·스키마 — 별도 전략서)

**작성일**: 2025-03

---

## 1. 목표

| 목표 | 설명 |
|------|------|
| **단일 타입 언어** | 서버·프론트 모두 TS 기반으로 일관된 타입 시스템 유지. |
| **안전한 리팩터** | 타입 정보에 기반한 자동 리팩터·에러 검출. `unknown` 우선, `any` 지양. |
| **도메인 경계 명확화** | Auth, Devices, Projects, Archive, Parts 등 도메인별 타입·계약(Contract) 명시. |
| **DX 향상** | IDE 자동완성·네비게이션·린트·테스트 환경을 TS 기준으로 정리. |

---

## 2. 플랫폼 특성 반영 (IoT·보안·데이터 안정성)

NEXA는 **IoT 플랫폼**으로, 수많은 엣지 디바이스·보안·데이터 안정성 강화가 요구된다. TS 최적화 시 아래를 **검토·반영**한다.

### 2.1 Zod와 타입 단일화

| 항목 | 내용 | TS 최적화 시 검토 |
|------|------|-------------------|
| **역할** | 요청/응답 검증, 입력 검증(보안). 서버 auth 등에서 이미 사용 중. | **스키마 1회 정의 → 타입 추출**: `z.infer<typeof schema>`로 TS 타입 생성. 동일 스키마를 런타임 검증과 정적 타입에 공용. |
| **적용 경계** | API 진입(라우트), 디바이스 API(body), 인증·등록 요청. | 모든 외부 입력(웹·엣지 디바이스) 경계에 Zod 스키마 적용. 타입은 `z.infer`로 일원화. |
| **중복 제거** | 인터페이스를 따로 두고 Zod와 이중 유지하지 않음. | 스키마 우선 정의, 타입은 `z.infer` 또는 `z.output`/`z.input` 사용. |

**Zod 스키마 서버·프론트 공유**

| 구분 | 현재 구조 | 공유 권장 |
|------|-----------|-----------|
| **프론트** | `src/system/schemas/` — `common/`, `modules/`, `recipes/`, `engine/`, `storage/` (Display, Device, Blueprint, Panel 등 UI·도메인 스키마) | UI 전용 스키마는 기존 경로 유지. |
| **서버** | `server/routes/auth.routes.ts`에 인라인 `registerSchema`, `loginSchema` 등 | API 계약 스키마는 `src/system/schemas/`로 통합. |
| **공유 대상** | — | 인증(register, login, refresh, logout), 프로젝트(create, update), 디바이스(등록·업데이트) 등 **API 요청/응답 스키마**. 스키마 정의·관리는 신중하게, 수정 시 검토 필수. |

**스키마 위치(최종 — system/schemas 도메인별 통합)**:

> **선행 조건**: 서버가 `src/system/schemas/`를 참조하기 전에, **실제 배포 환경에서 경로 해석 오류가 발생하지 않도록** 서버(`server/tsconfig.json`)·프론트(루트 `tsconfig.json` 또는 `vite.config`) 양쪽의 **tsconfig `paths` 설정을 정교하게 맞추는 작업**이 선행되어야 한다. (예: 서버 빌드/실행 시 `src` 경로 해석, Docker 등 배포 환경에서 `node_modules`·루트 구조 반영)

```
src/system/schemas/
├── common/         # 기존 (display, metadata, semantic, taxonomy ...)
├── modules/        # 기존 (infra, blueprint, panel, formulator ...)
├── recipes/        # 기존
├── auth.ts         # API: registerSchema, loginSchema, refreshSchema, logoutSchema
├── devices.ts      # API: createDeviceSchema, updateDeviceSchema, list 응답 등
├── projects.ts     # API: createProjectSchema, updateProjectSchema, list 응답 등
├── errors.ts       # ApiErrorCode, ApiErrorResponse, ValidationErrorResponse (선택)
└── ai_responses.ts # AI 응답 전용 스키마 — [NEXA-AI-10] 참고
```

- **프론트**: `import { registerSchema } from '@/system/schemas/auth'` (Vite alias)
- **서버**: `import { registerSchema, loginSchema } from '../src/system/schemas/auth.js'` (상대 경로) 또는 tsconfig `paths`: `@system/schemas/auth` 등으로 `src/system/schemas` 참조
- **의존성**: `system/schemas/`는 `zod`만 의존. 서버·프론트 각각 `zod` 설치. 한 곳에 스키마 통합하여 수정 시 일관성 유지.

### 2.2 JSON·JSONB 처리 및 AI 친화 데이터

| 항목 | 내용 | TS 최적화 시 검토 |
|------|------|-------------------|
| **DB JSONB** | `users.metadata`, `users.allowed_domains`, `device_registry.metadata`, `archive_doc.content_json`, `source_metadata` 등. | JSONB 컬럼마다 **타입 인터페이스** 정의. `any` 지양, 알 수 없는 값은 `unknown`으로 받아 Zod `.safeParse()`로 검증 후 사용 (단순 `as Metadata` 단언 지양). |
| **JSON 통일** | API 요청/응답 body, 디바이스 페이로드, AI 연동 데이터. | **공통 JSON 형태**를 타입으로 정의. 서버·프론트·(향후) 엣지 SDK에서 동일 스키마/타입 참조. |
| **AI 친화** | 구조화·일관된 JSON 형태로 AI 입력/출력 안정화. | [NEXA-AI-10] 참고. `ai_responses.ts` 스키마. |

**DB JSONB 읽기 시 검증 유틸리티**

- DB에서 꺼낸 JSONB 값에 `as Metadata`처럼 단언(Assertion)만 하면, 실제 데이터가 스키마와 어긋나도 런타임에 문제가 늦게 드러난다.
- **권장**: 해당 JSONB 스키마로 `.safeParse()`를 거치는 유틸 함수를 만들어 사용.

```ts
// 예: server/utils/parseJsonb.ts
function parseJsonb<T>(raw: unknown, schema: z.ZodType<T>): T | null {
  const result = schema.safeParse(raw)
  if (result.success) return result.data
  // 로깅 후 null 반환 또는 에러 처리
  return null
}
// 사용: const meta = parseJsonb(row.metadata, MetadataSchema) ?? defaultMetadata
```

- 검증 실패 시 `null` 반환·기본값·에러 로깅 등 정책을 한 곳에서 관리. 단언 대비 데이터 이상·마이그레이션 오류를 더 빨리 발견할 수 있다.

### 2.3 엣지 디바이스·보안

| 항목 | 내용 | TS 최적화 시 검토 |
|------|------|-------------------|
| **디바이스 API** | 등록(`POST /api/devices`), 텔레메트리, 제어 명령 등. | 디바이스 수신/송신 페이로드에 **Zod 스키마 + `z.infer` 타입** 적용. 펌웨어 버전에 따른 스키마 차이는 `z.discriminatedUnion('version', [...])`로 버전별 검증 (§7.2). |
| **입력 검증** | 모든 외부 입력 검증(Zod). | 검증 실패 시 400·에러 메시지 형식 타입화. 비즈니스 에러 코드 전체는 §2.5 참고. |
| **데이터 안정성** | 스키마 변경 시 하위 호환. | 버전드 API·옵션 필드 설계. 타입에서 `optional`·union으로 구버전 호환 표현. |

### 2.4 Branded Types (ID 혼용 방지)

UserID, ProjectID, DeviceID 등 **다양한 ID가 모두 UUID 문자열**이라, 인자 순서나 변수 할당 시 실수로 서로 혼용될 수 있다. **Branded Type**(명목 타입)을 도입하면 컴파일 단계에서 구분할 수 있다.

| 항목 | 내용 |
|------|------|
| **목적** | `userId`와 `projectId`를 같은 `string`으로 쓰지 않고, `UserID`·`ProjectID`·`DeviceID` 등 별도 타입으로 구분. `listDevicesByUserId(projectId)`처럼 잘못 넣으면 타입 에러. |
| **정의 위치** | `src/system/types/ids.ts`로 통일. 서버는 tsconfig paths로 `src/system/types` 참조. (§3.2 범위) |
| **구현 예** | `type UserID = string & { readonly __brand: 'UserId' }` 형태로 브랜드 붙이기. **`as UserId` 강제 단언 대신** Zod 기반 변환 함수(Casting Utility) 사용 권장. |

**런타임 유틸리티 — Zod 기반 변환 함수(Casting Utility)**

`as UserId`로 강제 단언하는 대신, **Zod 스키마를 거친 변환 함수**를 스키마·타입 정의 파일 근처에 두어 사용한다. UUID 형식 검증 후 브랜드 타입을 부여하므로, 잘못된 문자열이 ID로 유입되는 것을 런타임에서 차단할 수 있다.

```ts
// src/system/types/ids.ts (또는 src/system/schemas/ids.ts)
import { z } from 'zod'

const uuidSchema = z.string().uuid()

export type UserId = string & { readonly __brand: 'UserId' }
export const userIdSchema = uuidSchema.transform((s) => s as UserId)
export const toUserId = (id: string): UserId => userIdSchema.parse(id)
export const toUserIdSafe = (id: string): z.SafeParseReturnType<string, UserId> => userIdSchema.safeParse(id)

export type ProjectId = string & { readonly __brand: 'ProjectId' }
export const projectIdSchema = uuidSchema.transform((s) => s as ProjectId)
export const toProjectId = (id: string): ProjectId => projectIdSchema.parse(id)
// DeviceId, ArchiveId 등 동일 패턴
```

- **배치**: 스키마·타입 정의 파일과 같은 위치 또는 `src/system/schemas/ids.ts`에 ID 스키마·유틸을 함께 둔다.
- **사용**: `const uid = toUserId(row.user_id)` — 검증 실패 시 예외. `toUserIdSafe`로 실패 시 null/에러 처리 가능.

- API·DB 경계에서 문자열을 받은 뒤 `toUserId` 등 변환 함수로 한 번만 변환하고, 이후에는 `UserId`·`ProjectId` 등으로만 전달하면 혼용을 줄일 수 있다.

### 2.5 비즈니스 에러 코드 (Enum·Union 공유)

`ValidationErrorResponse` 외에도, 서버에서 반환하는 **비즈니스 에러 코드**를 **Enum 또는 Union 타입**으로 정의하고 서버·프론트가 **동일 정의를 참조**하도록 한다.

| 항목 | 내용 |
|------|------|
| **목적** | 서버 4xx·5xx 응답의 `code` 값을 프론트에서 매직 문자열 대신 타입 안전하게 처리. `if (err.code === 'UNAUTHORIZED')` 등 자동완성·리팩터 지원. |
| **정의 위치** | `src/system/schemas/errors.ts`. 서버·프론트 모두 `@/system/schemas/errors` 등으로 import. |
| **형식** | `const ApiErrorCode = { VALIDATION_ERROR: 'VALIDATION_ERROR', UNAUTHORIZED: 'UNAUTHORIZED', ... } as const` + `type ApiErrorCode = typeof ApiErrorCode[keyof typeof ApiErrorCode]` 또는 `type ApiErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | ...` union. |
| **응답 타입** | `{ code: ApiErrorCode; message: string; errors?: ValidationError[] }` 등 에러 응답 인터페이스를 한 곳에 정의. |

**예시 (공통 에러 타입 파일)**:

```ts
// src/system/schemas/errors.ts
import { z } from 'zod'

export const ApiErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  DEVICE_TOKEN_INVALID: 'DEVICE_TOKEN_INVALID',
  // AI(Ollama) 연동 시 발생하는 에러 — ApiErrorCode에 통합
  AI_MODEL_LOAD_FAILED: 'AI_MODEL_LOAD_FAILED',
  AI_TIMEOUT: 'AI_TIMEOUT',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  // ... 도메인별 코드
} as const
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode]

export interface ValidationErrorResponse {
  code: typeof ApiErrorCode.VALIDATION_ERROR
  message: string
  errors: Array<{ path: string; message: string }>
}
export interface ApiErrorResponse {
  code: ApiErrorCode
  message: string
  details?: unknown
}

// Zod 스키마 — 통합 테스트(§7.2)·런타임 응답 검증에 사용
export const apiErrorResponseSchema = z.object({
  code: z.nativeEnum(ApiErrorCode),
  message: z.string(),
  details: z.unknown().optional(),
})
```

- 프론트: `err.code`를 `ApiErrorCode`로 타입 지정 후 분기. 서버: `res.status(400).json({ code: ApiErrorCode.VALIDATION_ERROR, ... })` 형태로 일관 사용.
- **Ollama 연동 에러 통합**: 모델 로드 실패, 타임아웃, 서비스 불가 등 AI 관련 에러 코드를 `ApiErrorCode`에 포함. `AI_MODEL_LOAD_FAILED`, `AI_TIMEOUT`, `AI_SERVICE_UNAVAILABLE` 등. 동일한 `Record<ApiErrorCode, string>` 메시지 맵으로 i18n·토스트 처리.

**API 에러 코드 공유의 실무 적용 — 메시지 맵·i18n·토스트**

`ApiErrorCode`를 공유하면 프론트엔드에서 **`Record<ApiErrorCode, string>` 형태의 메시지 맵**을 만들어 사용할 수 있다. 모든 코드에 대응 메시지를 강제하므로 누락을 막고 DX를 높인다.

| 용도 | 적용 방법 |
|------|-----------|
| **메시지 맵** | `const ERROR_MESSAGES: Record<ApiErrorCode, string> = { VALIDATION_ERROR: '입력값을 확인해 주세요.', UNAUTHORIZED: '로그인이 필요합니다.', ... }` — 모든 코드에 대응 메시지 필수. |
| **다국어(i18n)** | `ERROR_MESSAGES_KO[code]`, `ERROR_MESSAGES_EN[code]` 등 로케일별 맵. `Record<ApiErrorCode, string>`로 코드 추가 시 번역 누락을 타입으로 방지. |
| **토스트·알림** | `showToast(ERROR_MESSAGES[err.code] ?? err.message)` — 공통 에러 핸들러에서 토스트 메시지 결정 시 타입 안전하게 분기. |

```ts
// 예: src/system/config/errorMessages.ts
import type { ApiErrorCode } from '@/system/schemas/errors'

export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: '입력값을 확인해 주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  CONFLICT: '충돌이 발생했습니다. 다시 시도해 주세요.',
  DEVICE_TOKEN_INVALID: '디바이스 인증에 실패했습니다.',
  AI_MODEL_LOAD_FAILED: 'AI 모델을 불러올 수 없습니다.',
  AI_TIMEOUT: 'AI 응답 시간이 초과되었습니다.',
  AI_SERVICE_UNAVAILABLE: 'AI 서비스를 사용할 수 없습니다.',
  // ApiErrorCode에 새 코드 추가 시 여기에도 필수 추가 → 타입 에러로 누락 방지
}
```

- 서버가 새 에러 코드를 추가하면, 프론트의 `Record<ApiErrorCode, string>` 맵에 해당 키가 없을 경우 **컴파일 에러**가 발생. 번역·메시지 누락을 방지하고 i18n·토스트 로직을 일관되게 유지할 수 있다.

### 2.6 AI(Ollama) 협업 — 별도 문서

AI 협업 관련 **상세 전략**(ai_responses.ts, Zod→JSON Schema 유틸, ProjectContext·DeviceContext, AiJobStatus, ApiErrorCode AI 에러 통합 등)은 별도 문서로 분리한다.

→ **[NEXA-AI-10] AI_협업_TS_타입_스키마_전략.md** 참고.

- **선행 완료**: AI 도메인 개발 전에 §2.5 비즈니스 에러 코드 공유·§2.1 API 스키마 통합 완료. `ai_responses.ts`는 `src/system/schemas/`에 추가.

### 2.7 적용 우선순위 (참고)

1. **인증·디바이스** — 이미 Zod 사용. `z.infer` 도입으로 타입 단일화.
2. **JSONB 컬럼** — `metadata`, `allowed_domains`, `content_json` 등 타입 인터페이스 정의.
3. **디바이스 전용 API** — 신규/수정 시 Zod 스키마 + 타입 from schema.
4. **AI·문서 도메인** — [NEXA-AI-10] 참고. `ai_responses.ts`·AI 전용 타입·유틸.

---

## 3. 범위 및 파일·디렉터리

### 3.1 서버 (server)

| 구분 | 경로 | 비고 |
|------|------|------|
| **진입·설정** | `server/server.ts`, `server/loadEnv.ts` | 진입점, env 로드 |
| **설정** | `server/config/*.ts` | dbConfig, redis, authConfig, upload, uuidUtils 등 |
| **미들웨어** | `server/middleware/*.ts` | auth.middleware, deviceAuth.middleware |
| **유틸** | `server/utils/*.ts` | jwtAuth, fileUpload, deviceToken, skuGenerator 등 |
| **라우트** | `server/routes/*.ts` | auth, health, files, archive, aiUserMemos 등 |
| **도메인** | `server/domains/**/*.ts` | devices, projects, archive, parts, ai, dev 등 (controller, service, routes) |

### 3.2 프론트 (src)

| 구분 | 경로 | 비고 |
|------|------|------|
| **프레임** | `src/frame/**/*.ts`, `*.vue` | layout, router, views (auth 등) |
| **시스템** | `src/system/**/*.ts`, `*.vue` | store, utils, composables, components |
| **ID 타입·스키마** | `src/system/types/ids.ts` | Branded ID(UserId, ProjectId, DeviceId 등)·Zod 변환 유틸 — §2.4 참고 |
| **도메인** | `src/domains/**/*.ts`, `*.vue` | my, archive, erp, dev, panel, network 등 |

### 3.3 비대상(별도 기획)

- **관리자 도메인**(공개/보호 API, api_usage, OAuth 등) → 별도 관리자 기획서에서 설계. TS 인프라는 본 전략서 기준 적용.

---

## 4. 현재 상태

| 구분 | 상태 | 비고 |
|------|------|------|
| **프론트** | TS 적용 완료 | .vue + .ts, Pinia·Composables·Utils 등 TS 사용 중. |
| **서버** | 1단계 전환 완료 | 확장자 .js→.ts 일괄 변환, tsconfig·tsx 도입, `server.ts` 진입. 2단계(타입·strict·최적화) 미진행. |

---

## 5. 단계별 전략

### 5.1 1단계 — 인프라·확장자 전환 (서버, 완료)

- **tsconfig.json** (서버): `module: "NodeNext"`, `allowJs: true`, `noEmit: true` 등.
- **실행**: `tsx server.ts` (dev/start 스크립트).
- **확장자**: 서버 내 `.js` → `.ts` 일괄 변경.
- **의존성**: `typescript`, `tsx`, `@types/node`, `@types/express`.

> 이 단계는 “기존 JS를 TS로 감싸서 그대로 도는 상태” 확보가 목표였고, **이미 달성됨**.

---

### 5.2 2단계 — 타입 정리 및 최소 strict 강화

**목표**: “타입이 전혀 없는 TS” 상태를 벗어나, **핵심 경계에만이라도 타입을 붙이는 것**.

#### 서버

1. **공통 기본 타입**
   - `server/types/common.ts` (신규): `UUID`, `Timestamp`, 공용 별칭. **Branded ID**: `UserId`, `ProjectId`, `DeviceId` 등 (§2.4). 서비스 시그니처에서 `userId: UserId`, `projectId: ProjectId`로 구분해 혼용 방지.
   - 도메인 공용 인터페이스: `AuthUser`, `Device`, `Project` 등 (프론트 타입과 정렬).

2. **도메인별 타입 파일**
   - 예: `server/domains/devices/device.types.ts`, `server/domains/projects/project.types.ts`.
   - DB Row / API 응답 / 요청 body: `DeviceRow`, `DeviceResponse`, `CreateDevicePayload`, `ProjectRow`, `ProjectResponse`, `CreateProjectPayload` 등.
   - **JSONB 컬럼**: `metadata`, `allowed_domains`, `content_json` 등에 대응하는 타입 인터페이스 정의 (§2.2 참고).

3. **라우트·서비스에 타입 적용**
   - `req`, `res`: `express.Request`, `express.Response` 사용.
   - 서비스: `listDevicesByUserId(userId: UserId): Promise<DeviceRow[]>`, `createProject(userId: UserId, payload: CreateProjectPayload): Promise<ProjectRow>` 등 (Branded ID 사용 시).

4. **tsconfig**
   - 당분간 `strict: false`, `noImplicitAny: false` 유지.
   - 새로 작성·수정하는 함수는 **반환 타입·인자 타입** 명시 권장.

#### 프론트

1. **공통 타입 정렬**
   - `src/system/types/` 또는 기존 `store`·`utils` 내 타입을 정리.
   - 서버 API 응답·요청 타입과 **동일한 이름·구조**로 맞추기 (예: `AuthUser`, `Project`, `Device`).

2. **API 계약 타입**
   - `GET/POST /api/projects` 등 응답·요청 타입을 한 곳에 정의 (예: `src/system/types/api.ts` 또는 도메인별 `*.types.ts`).
   - `authStore`, `projectStore` 등에서 해당 타입 사용.

3. **Vue 컴포넌트**
   - `defineProps`/`defineEmits`에 타입 명시, `ref`/`computed` 제네릭 활용.
   - 필요 시 `lang="ts"` 일관 적용.

---

### 5.3 3단계 — strict 강화 및 리팩터

**조건**: 2단계 타입 붙이기가 어느 정도 진행된 뒤.

#### 서버

1. **tsconfig**
   - `strict: true`, `noImplicitAny: true` 단계적 적용.
   - `noUnusedLocals`, `noUnusedParameters` 등 선택 적용.

2. **도메인별 정리 순서**
   - auth → devices → projects → archive / parts / ai 순 권장.

3. **리팩터 포인트**
   - 매직 문자열 → union/enum: `role: 'owner' | 'editor' | 'viewer'`, `tier: 'BASIC' | 'STANDARD'`.
   - **Zod 스키마와 타입 단일화**: 요청/응답·디바이스 페이로드에 스키마 1회 정의 후 `z.infer<typeof schema>` 사용 (§2.1). **비즈니스 에러**: `ApiErrorCode`·`ValidationErrorResponse`·`ApiErrorResponse` 등 `src/system/schemas/errors.ts`에 정의 후 서버·프론트 공유 (§2.5).
   - **JSONB 읽기/쓰기**: 타입 인터페이스 또는 Zod로 파싱 후 사용. `any` 지양, `unknown` + Zod 검증 (§2.2).
   - **Express.Request 확장**: `req.user`, `req.device` 등을 전역 타입으로 주입하여 라우터 로직 수정이 원활하도록 설정 (아래 5.3.1 참고).

**5.3.1 Express.Request 확장 — req.user / req.device 전역 타입 주입**

`express.Request`를 확장하여 `req.user`·`req.device` 타입을 **전역적으로 주입**해 두면, 라우터·컨트롤러에서 매번 단언(`req.user as AuthUser`) 없이 `req.user?.id` 등으로 타입 안전하게 사용할 수 있다. 한 번 설정해 두면 라우터 로직 수정이 원활해진다.

- **정의 위치**: `server/types/express.d.ts`. `tsconfig`의 `include`에 포함.
- **방법**: `declare global`로 `Express` 네임스페이스의 `Request` 인터페이스에 `user`·`device` 필드 추가.

```ts
// server/types/express.d.ts
import type { AuthUser } from './common'
import type { DeviceRow } from '../domains/devices/device.types'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      device?: DeviceRow  // deviceAuth 미들웨어 통과 시
    }
  }
}
export {}
```

- **효과**: `auth.middleware`·`deviceAuth.middleware`를 거친 라우트 핸들러에서 `req.user`, `req.device`가 자동으로 올바른 타입으로 추론됨. 타입 체크·리팩터 시 안전성 향상.

#### 프론트

1. **strict·린트**
   - `vue-tsc --noEmit`, ESLint TS 규칙 점검.
   - `strict: true` 등 이미 적용된 경우, 서버와 네이밍·타입 정의만 정렬.

2. **도메인별 타입**
   - `src/domains/my/`, `src/domains/archive/` 등에 `*.types.ts` 또는 store 내 타입 정리.
   - 서버와 공유할 타입은 `src/system/types/` 등 한 곳에서 re-export 고려.

3. **API·Store 타입 일치**
   - 서버 응답 타입과 프론트 store/컴포넌트 타입이 **동일한 인터페이스**를 참조하도록 정리.

---

## 6. 개발 흐름·규칙

### 6.1 unknown vs any

- **`any` 사용 지양, `unknown` 우선 사용**을 원칙으로 한다.
- 타입을 모르는 값(외부 입력, JSON 파싱 결과 등)은 `unknown`으로 받고, 타입 가드·Zod `.safeParse()` 등으로 검증 후 사용.
- 부득이 `any`를 쓸 때는 사유 주석 필수.

### 6.2 신규 코드

| 구분 | 규칙 |
|------|------|
| **서버** | 신규 파일은 `.ts`. 함수 인자·반환 타입 지정 권장. `unknown` 우선, `any` 지양. |
| **프론트** | 신규 파일은 `.ts` 또는 `.vue`(script에 `lang="ts"`). API 연동 시 서버와 동일한 타입/인터페이스 사용. `unknown` 우선, `any` 지양. |

### 6.3 점진적 적용

- **서버**: 수정·추가하는 파일부터 해당 파일 내 타입 정리. 큰 도메인은 서브 모듈 단위로 진행.
- **프론트**: 새 API 연동 시 해당 도메인 타입 정의·store 타입 정리부터 적용.

---

## 7. 검증·품질

### 7.1 정적 검증 (로컬·CI)

| 구분 | 방법 |
|------|------|
| **서버** | `cd server && npx tsc --noEmit` (또는 `npm run typecheck`). `npm run dev` 기동 확인. |
| **프론트** | `npm run typecheck` (vue-tsc), ESLint. |
| **공통** | 서버·프론트 타입 정의가 API 계약(요청/응답)과 일치하는지 주기적 점검. |

### 7.2 통합 테스트 — API 요청/응답 타입 검증

**목적**: 실제 HTTP 호출 결과가 기대하는 응답 타입·스키마와 일치하는지 **런타임에 검증**하여, 서버 변경 시 계약 이탈을 빨리 발견한다.

| 항목 | 내용 |
|------|------|
| **검증 방식** | `src/system/schemas/`의 공유 Zod 스키마로 응답 body를 `.safeParse()` 또는 `.parse()`. 실패 시 테스트 실패. |
| **테스트 대상** | `GET /api/projects`, `POST /api/auth/login` 등 주요 API. 성공·에러 응답 모두 스키마 검증 가능. |
| **실행 환경** | 서버 기동 후 `fetch`/`supertest` 등으로 실제 요청. 또는 MSW 등으로 모킹하되, **응답 JSON을 스키마로 검증**하는 로직은 동일 적용. |

**예시 (통합 테스트에서 응답 타입 검증)**:

```ts
// tests/integration/api.projects.test.ts (또는 server/__tests__/api.projects.test.ts)
import { describe, it, expect, beforeAll } from 'vitest'
import { projectsResponseSchema } from '@/system/schemas/projects'
import { apiErrorResponseSchema } from '@/system/schemas/errors'

const BASE = 'http://localhost:3001'

describe('GET /api/projects', () => {
  it('returns valid ProjectsResponse shape when authenticated', async () => {
    const res = await fetch(`${BASE}/api/projects`, { headers: { Authorization: `Bearer ${token}` } })
    const body = await res.json()
    const result = projectsResponseSchema.safeParse(body)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projects).toBeInstanceOf(Array)
      // 추가 어설션
    }
  })

  it('returns valid ApiErrorResponse shape when unauthorized', async () => {
    const res = await fetch(`${BASE}/api/projects`)
    const body = await res.json()
    const result = apiErrorResponseSchema.safeParse(body)
    expect(result.success).toBe(true)
    if (result.success) expect(body.code).toBe('UNAUTHORIZED')
  })
})
```

**권장 패턴**:
- 응답 스키마를 `src/system/schemas/`에 두고, 테스트·서버·프론트가 동일 스키마 참조.
- 요청 body 검증: `createProjectSchema.safeParse(reqBody)`로 요청 예제가 스키마를 통과하는지 별도 테스트.
- `ApiErrorResponse`·`ValidationErrorResponse` 스키마로 에러 응답 형태도 검증.

**통합 테스트 시 스키마 버전 관리 — 디바이스 페이로드·하위 호환성**

IoT 플랫폼 특성상 **엣지 디바이스의 펌웨어 버전**에 따라 페이로드 스키마가 달라질 수 있다. 구버전 디바이스와 신버전 API 간 하위 호환성을 보장하려면 `devices.ts` 스키마 정의 시 **버전별 스키마 검증**을 수행해야 한다.

| 항목 | 내용 |
|------|------|
| **목적** | 구버전·신버전 디바이스 페이로드를 모두 유효로 인식. 통합 테스트에서 버전별 페이로드 검증 가능. |
| **도구** | `z.discriminatedUnion('version', [...])` 활용. `version` 필드로 구분 후 버전별 스키마 적용. |
| **위치** | `src/system/schemas/devices.ts`. 디바이스 수신 페이로드(텔레메트리·등록 요청 등) 스키마 정의. |

```ts
// 예: src/system/schemas/devices.ts
import { z } from 'zod'

const devicePayloadV1 = z.object({ version: z.literal('1'), sensor_id: z.string(), value: z.number() })
const devicePayloadV2 = z.object({ version: z.literal('2'), sensorId: z.string(), value: z.number(), unit: z.string().optional() })
export const devicePayloadSchema = z.discriminatedUnion('version', [
  devicePayloadV1,
  devicePayloadV2,
])
export type DevicePayload = z.infer<typeof devicePayloadSchema>
```

- **통합 테스트 활용**: `devicePayloadSchema.safeParse(v1Style)`·`devicePayloadSchema.safeParse(v2Style)` 각각 검증하여 구버전·신버전 페이로드 모두 유효한지 확인. 향후 하위 호환성 회귀를 조기에 발견할 수 있다.

---

## 8. 서버·프론트 타입 정렬 (공유 타입)

- **이름·구조 통일**: 예) `AuthUser`, `Project`, `Device` 등을 서버·프론트에서 **동일한 필드**로 사용. **ID 타입**: `UserId`, `ProjectId`, `DeviceId` 등 Branded Type 공통 정의 (§2.4). **에러 코드**: `ApiErrorCode` 등 비즈니스 에러를 Enum·Union으로 정의하고 서버·프론트가 공유 (§2.5).
- **정의 위치**:
  - **서버**: `server/types/common.ts`, `server/domains/*/**.types.ts`. ID 브랜드 타입은 `src/system/types/ids.ts` 또는 `server/types/common.ts`에 두고 공용.
  - **프론트**: `src/system/types/` 또는 `src/domains/*/types.ts`. ID 타입은 서버와 동일한 정의 참조 또는 복사.
- **API 계약**: REST 응답/요청 body를 한 번 타입으로 정의하고, 서버(controller·service)·프론트(store·api 호출)가 동일 타입을 참조하도록 유지.

---

## 9. 체크리스트 (참고)

**최종 업데이트**: 2025-03 — typecheck·unknown vs any·strict·DB row 타입 적용 반영 (dbConfig QueryResult, partFiles DbRow, pg/redis/uuid 호환)

**공통·인프라**
- [x] **unknown vs any**: `any` 지양, `unknown` 우선 사용 (§6.1). Zod 스키마 `z.any()`→`z.unknown()`, JSDoc·Express 타입 `any`→`unknown`/구체 타입 적용
- [x] 서버: `server/types/common.ts` 생성, UUID·Timestamp·공용 인터페이스 정의. **Branded ID** (`UserId`, `ProjectId`, `DeviceId`, `ArchiveId`) — `src/system/types/ids.ts`에 정의. `toUserId` 등 Zod 기반 변환 함수 배치
- [x] 서버: 도메인별 `*.types.ts` (devices: `device.types.ts`, projects: `project.types.ts`) 추가. auth는 `src/system/schemas/auth.ts`에서 스키마·타입
- [x] 서버: 라우트·서비스에 인자/반환 타입 적용 (auth, devices, projects 완료)
- [x] 서버: `Express.Request` 확장(`req.user`, `req.device`, `req.file`, `req.files`) — `server/types/express.d.ts`에 전역 타입 주입. `req.file`·`req.files`는 Multer 타입 적용. Express `Router`·Multer ESM/NodeNext 타입은 `server/types/express-export.d.ts`, `multer.d.ts`로 보강
- [x] 프론트: API 응답/요청 타입을 서버와 동일한 이름·구조로 정리 — `AuthUser`, `Project`, `Device`를 `src/system/types/common/`에 정의, authStore·projectStore·MyView에서 사용
- [x] 프론트: store·composables·뷰 컴포넌트(MyView 등)에서 `AuthUser`, `Project`, `Device` 타입 사용. SFC에 `lang="ts"` 적용
- [x] 서버: `tsconfig.strict.json` 추가 (strict: true, noImplicitAny: true). `npm run typecheck:strict`로 점진적 검증. 기본 typecheck는 기존 설정 유지
- [x] 서버·프론트: `npm run typecheck` 스크립트 추가. 서버: `server/tsconfig.typecheck.json` 사용, `typecheck:server`, `typecheck:all`. 프론트: `vue-tsc --noEmit`. 루트 tsconfig에서 server 제외하여 프론트 typecheck는 `src/`만 검사
- [x] **DB query 결과 타입**: `server/config/dbConfig.ts`에 `QueryResult<T>`(rows, rowCount) 정의. pg Pool/Client는 require + PoolLike 인터페이스로 NodeNext 호환. 도메인별 `DbRow`(=`Record<string, unknown>`) 타입 단언 적용 — partFiles.routes 등. `result.rowCount`, `row.id` 등 속성 접근 시 `(row as DbRow).id` 또는 `(result.rowCount ?? 0)` 패턴
- [x] **통합 테스트**: `src/system/tests/api.integration.spec.ts` — GET /api/projects, /api/health 응답을 공유 Zod 스키마로 검증 (서버 기동 시)

**플랫폼 특성 (§2 반영)**
- [x] **tsconfig paths 선행**: 서버 `@system/*` → `../src/system/*`, `@/*` → `./*` 설정. 서버 내부 import는 `@/config/...`, `@/utils/...` 등으로 통일. NodeNext 사용 시 import 경로에 `.js` 확장자 필수 ([NEXA-PLATFORM-TS-02])
- [x] **Zod 스키마 통합**: `src/system/schemas/`에 auth.ts·errors.ts·devices.ts·projects.ts·jsonb.ts 추가. ai_responses.ts는 [NEXA-AI-10] 참고
- [x] API 경계(인증·디바이스·프로젝트): Zod 스키마 1회 정의, 서버 라우트·컨트롤러에서 검증. `@system/schemas/*.js` import
- [x] JSONB 컬럼: `src/system/schemas/jsonb.ts`에 `allowedDomainsSchema`, `archiveContentJsonSchema`, `deviceMetadataSchema` 정의 (Zod v3 호환: `passthrough()` 미사용). auth.routes·auth.middleware·deviceAuth.middleware(`allowed_domains`), archive.service(`content_json`)에서 parseJsonb 적용
- [x] DB JSONB 읽기: `server/utils/parseJsonb.ts` 유틸 도입 (Zod v4 nullable 스키마 호환). auth·archive·deviceAuth에서 parseJsonb 적용
- [x] **pg·redis·uuid 타입 호환**: NodeNext 모듈 해석 이슈 대응. pg·uuid는 require + 타입 단언. redis는 require + module-stubs. `server/types/module-stubs.d.ts`로 cors·ioredis·http-errors·jsonwebtoken·@opentelemetry/api 스텁 적용
- [x] 디바이스 API 요청/응답: 공유 Zod 스키마(`devices.ts`) + 타입. 버전별 페이로드 `devicePayloadSchema`에 `z.discriminatedUnion('version', [v1, v2])` 적용 (§7.2)
- [x] **AI 협업**: [NEXA-AI-10] 완료. `ai_responses.ts`, `ai.types.ts`(ProjectContext, DeviceContext, AiJobStatus), `zodToPromptSchema.ts`. ApiErrorCode AI 코드·메시지 맵 기존 적용
- [x] **비즈니스 에러 코드**: `ApiErrorCode`·`ApiErrorCodeType`·`ValidationErrorResponse`·`ApiErrorResponse`를 `src/system/schemas/errors.ts`에 정의. 서버 라우트·컨트롤러에서 사용
- [x] **에러 메시지 맵**: 프론트 `src/system/config/errorMessages.ts`에 `Record<ApiErrorCodeType, string>` 정의. i18n·토스트에 활용

---

## 10. 참고 문서

| 문서 | 내용 |
|------|------|
| **[NEXA-AUTH-01]** | §1.4 플랫폼 전체 언어(JS vs TS) 정책, 서버 TS 마이그레이션 2단계 전략 |
| **[NEXA-PLATFORM-TS-02]** | 서버 `@system/*` 경로 해석 가이드, `.js` 확장자 사용 규칙 |
| **[NEXA-AI-10]** | AI 협업 TS·타입·스키마 전략 — ai_responses, 컨텍스트 타입, Zod→JSON Schema 유틸 등 |
| **관리자 도메인 기획(예정)** | 공개/보호 API, api_usage 등 — TS 인프라는 본 전략서 기준 적용 |
