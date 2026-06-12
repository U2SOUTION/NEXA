---
doc_id: TDD-065
title: "Navex · 탐색 API · Facet 계약 v1.0"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-13
parent_doc: TDD-056
implements_doc: PRD-008
see_also: [TDD-013, TDD-037, TDD-056, TDD-060, UIX-002, PRD-001, PRD-010, PRD-014]
terms_standard: ["rest", "zod", "typescript"]
terms_nexa: ["Navex", "GlobalFileExplorer", "useGlobalFileExplorer", "Global-Asset-Index", "InfraTree", "asset-origin", "navexCategory", "files", "file_references"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/rest", "std/zod", "std/typescript", "nexa/Navex", "nexa/GlobalFileExplorer", "nexa/useGlobalFileExplorer", "nexa/Global-Asset-Index", "nexa/InfraTree", "nexa/asset-origin", "nexa/navexCategory", "nexa/files", "nexa/file_references"]
---

# Navex · 탐색 API · Facet 계약 v1.0

> **한 줄:** Navex / Global Navex 가 호출하는 **REST 탐색·검색 API**의 **쿼리 facet · Zod 계약 · 응답 SSOT**를 정의한다.

**상위 Normative:** [`TDD-056` §5.7](./08_TDD_NEXIA_7탭범위확정_v1.0.md) · [`TDD-060` §3.6.4](../../../용어집_v1.0.md) · [`UIX-002` §1.4~1.5](../../07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md)

**스택:** Nest `apps/backend` · Zod **`packages/shared`** · 클라이언트 `useGlobalFileExplorer`

---

## 1. 범위 · 원칙

| 항목 | 내용 |
| :--- | :--- |
| **소비자** | `GlobalFileExplorer` · `useGlobalFileExplorer` · Navex · Global Navex |
| **데이터 SSOT** | `files` · `file_references` · (병합) docs API · (P1) nexet 설치 manifest |
| **전역** | `domain` 미지정 = **전 `domainKey`** — nexia-only **✗** |
| **Project Explorer** | 동일 API · **`projectId` 필수** 고정 — Left Drawer 전용 뷰 |
| **검증** | 요청·응답 **Zod** — [`TDD-037`](../AI/08_TDD_AI_TS타입스키마전략.md) |

**금지:** 브라우저 → DB 직접 · facet 없이 전 테이블 full scan (Grade·PoLP — [`TDD-016`](./08_TDD_NEXIA_보안및권한관리체계.md))

---

## 2. 엔드포인트 개요

| Method | Path | Phase | 역할 |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/files/explorer/tree` | P0 | InfraTree 노드 (origin → domain → path/device) |
| `GET` | `/api/v1/files/explorer` | P0 | 노드 하위 **목록** (facet + pagination) |
| `GET` | `/api/v1/files/explorer/search` | P0 | **전역 검색** (트리 선택 없이 facet + `q`) |
| `GET` | `/api/docs/config/folders` | P0 | external docs 루트 (클라이언트 병합) |
| `GET` | `/api/docs/metadata` | P0 | docs 노드 목록 |
| `POST` | `/api/v1/files/explorer/register-docs` | P0 | external → internal ([`PRD-008`](../../05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md) §4.3) |
| `GET` | `/api/v1/nexet/installed/assets` | P1 | nexet **설치본** manifest 목록 |
| `GET` | `/api/v1/nexet/catalog/search` | P2 | 원격 catalog — **검색 전용** |

> **하위 호환:** MVP 구현 전 `/api/files/explorer*` (v0) 와 **동일 쿼리** 유지 · v1 prefix 는 점진 이전.

---

## 3. Facet · Enum SSOT

### 3.1 `asset-origin`

[`TDD-056` §5.7.3](./08_TDD_NEXIA_7탭범위확정_v1.0.md) · DB 매핑:

| 값 | `files.source` / 판별 | 비고 |
| :--- | :--- | :--- |
| `upload` | `source IN ('upload', NULL)` · `uploads/` | 기본 업로드 |
| `edge` | `source = 'edge'` · `metadata.device_id` | ESP32/RPi ingest |
| `docs` | `source = 'docs'` 또는 docs API 노드 | internal/external 별도 축 |
| `generated` | `.nx*` 또는 `metadata.generated = true` | 파이프라인 산출 |
| `web` | `source = 'web'` | P1 |
| `memo` | `source = 'memo'` | P1 |
| `market` | nexet installed manifest | P1 · DB `files` 또는 side table |
| `market-remote` | catalog API only | P2 · **tree ✗** |

### 3.2 `navexCategory`

서버는 `category` · `file_type` · 확장자로 **derive**. 클라이언트 preset ↔ API `category` 1:1.

| 값 | derive 규칙 (우선순위) |
| :--- | :--- |
| `nx-*` | `original_name` ends with `.nxchat` … `.nxdiag` |
| `documents` | `category = documents` 또는 `.md` `.pdf` `.txt` … |
| `code` | `category = code` 또는 `.js` `.ts` `.py` `.sh` … |
| `config` | `category = config` 또는 `.yaml` `.json` `.cfg` … |
| `media` | `images` · `audio` · `video` · `category = media` |
| `edge-ingest` | `origin = edge` (category 와 **AND** 가능) |
| `firmware` | `.bin` `.hex` · `category = firmware` |

### 3.3 `registration`

| 값 | 의미 |
| :--- | :--- |
| `all` | internal + external (기본) |
| `internal` | `files.id` 존재 · DB 등록됨 |
| `external` | docs scan only · DB **✗** |

### 3.4 `tabAffinity`

릴레이 힌트 — [`TDD-010` §3.3](./08_TDD_NEXIA_구조기술스택운영방침.md) 확장자 매핑:

| 값 | 매칭 |
| :--- | :--- |
| `omnix` | `.nxchat` |
| `normex` | `.nxpol` |
| `logex` | `.nxflow` · `.yaml` workflow |
| `scribx` | `.nxcode` · code |
| `vivex` | `.nxmedia` · media |
| `twinex` | `.nxproj` `.nxdev` `.nxdiag` · edge config |

---

## 4. Zod 스키마 (`packages/shared`)

**경로 (To-Be):** `packages/shared/src/files/explorer/`

### 4.1 Facet 쿼리 (공통)

```typescript
import { z } from 'zod'

export const assetOriginSchema = z.enum([
  'upload', 'edge', 'docs', 'generated', 'web', 'memo', 'market', 'market-remote',
])

export const navexCategorySchema = z.enum([
  'nx-*', 'documents', 'code', 'config', 'media', 'edge-ingest', 'firmware',
])

export const registrationSchema = z.enum(['all', 'internal', 'external'])

export const tabAffinitySchema = z.enum([
  'omnix', 'normex', 'logex', 'scribx', 'vivex', 'twinex',
])

/** 목록·검색 공통 facet */
export const explorerFacetQuerySchema = z.object({
  domain: z.string().min(1).optional(),       // domainKey · omit = 전체
  path: z.string().optional(),                // uploads 하위 prefix
  origin: assetOriginSchema.optional(),
  category: navexCategorySchema.optional(),
  registration: registrationSchema.default('all'),
  projectId: z.string().uuid().optional(),
  folderId: z.string().uuid().optional(),
  deviceId: z.string().optional(),            // edge
  tabAffinity: tabAffinitySchema.optional(),
  q: z.string().max(500).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(['name', 'created_at', 'updated_at']).default('updated_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export type ExplorerFacetQuery = z.infer<typeof explorerFacetQuerySchema>
```

### 4.2 InfraTree 쿼리

```typescript
export const explorerTreeQuerySchema = z.object({
  axis: z.enum(['origin', 'domain']).default('origin'),
  origin: assetOriginSchema.optional(),
  domain: z.string().optional(),
  registration: registrationSchema.default('all'),
  maxDepth: z.coerce.number().int().min(1).max(6).default(4),
})

export type ExplorerTreeQuery = z.infer<typeof explorerTreeQuerySchema>
```

### 4.3 ExplorerItem (목록·검색 공통)

```typescript
export const explorerItemSchema = z.object({
  id: z.string().nullable(),                  // null = external docs 임시
  file_path: z.string(),
  original_name: z.string(),
  file_type: z.string().nullable(),
  category: z.string().nullable(),
  navexCategory: navexCategorySchema.optional(),
  origin: assetOriginSchema,
  domain: z.string().nullable(),
  url: z.string().nullable(),
  registration: registrationSchema.exclude(['all']),
  projectId: z.string().uuid().nullable().optional(),
  folderId: z.string().uuid().nullable().optional(),
  deviceId: z.string().nullable().optional(),
  tabAffinity: tabAffinitySchema.nullable().optional(),
  sizeBytes: z.number().int().nonnegative().nullable().optional(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  // docs external
  docPath: z.string().optional(),
  folderId_docs: z.string().optional(),       // nexa-docs folderId
  displayPath: z.string().optional(),
})

export const explorerListResponseSchema = z.object({
  items: z.array(explorerItemSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int(),
  offset: z.number().int(),
  facets: z.object({
    applied: explorerFacetQuerySchema.partial(),
  }).optional(),
})

export type ExplorerItem = z.infer<typeof explorerItemSchema>
export type ExplorerListResponse = z.infer<typeof explorerListResponseSchema>
```

### 4.4 InfraTreeNode

```typescript
export const infraTreeNodeSchema: z.ZodType<InfraTreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string(),
    nodeKind: z.enum(['origin', 'domain', 'path', 'device', 'docs-root', 'docs-folder']),
    origin: assetOriginSchema.optional(),
    domain: z.string().optional(),
    path: z.string().nullable().optional(),
    deviceId: z.string().optional(),
    folderId: z.string().optional(),
    source: z.enum(['db', 'docs', 'market']),
    registration: registrationSchema.optional(),
    childCount: z.number().int().nonnegative().optional(),
    children: z.array(infraTreeNodeSchema).optional(),
  })
)

export interface InfraTreeNode extends z.infer<typeof infraTreeNodeSchema> {
  children?: InfraTreeNode[]
}

export const explorerTreeResponseSchema = z.object({
  axis: z.enum(['origin', 'domain']),
  nodes: z.array(infraTreeNodeSchema),
})
```

### 4.5 UI 프리셋 → facet (클라이언트)

`useGlobalFileExplorer` — **서버 전송 전** preset → partial facet:

| presetId | facet |
| :--- | :--- |
| `all` | `{}` |
| `nx-artifacts` | `{ category: 'nx-*' }` |
| `code-config` | `{ category: 'code' }` 또는 2 회 호출 merge · **권장:** 서버 `categoryIn=code,config` P1 |
| `edge` | `{ origin: 'edge' }` |
| `docs` | `{ origin: 'docs' }` |
| `market-installed` | `{ origin: 'market' }` |

**P1 확장:** `categoryIn: z.string()` — comma-separated navexCategory.

---

## 5. API 상세

### 5.1 `GET /api/v1/files/explorer/tree`

**Query:** `explorerTreeQuerySchema`

**동작 (P0 · `axis=origin` 기본):**

```text
origin (upload | edge | docs | generated …)
  └─ domainKey (nexia | parts | archive …)
       └─ path segments (uploads/{domain}/…)
       └─ device (edge only · deviceId label)
docs-root (병합 · source=docs)
  └─ folderId (nexa-docs | platform-docs)
```

**응답:** `explorerTreeResponseSchema`

**RBAC:** Grade 1+ read — domain 별 필터는 [`TDD-016`](./08_TDD_NEXIA_보안및권한관리체계.md) · Navex index read all.

### 5.2 `GET /api/v1/files/explorer`

**Query:** `explorerFacetQuerySchema` + **트리 컨텍스트**

| 트리 `nodeKind` | 필수 query | API |
| :--- | :--- | :--- |
| `domain` / `path` | `domain`, `path?` | files SQL |
| `device` | `deviceId` | `metadata->>'device_id'` |
| `docs-root` / `docs-folder` | `folderId`, `path?` | `/api/docs/metadata` 프록시 또는 클라 merge |
| (없음) | facet only | `/explorer/search` 와 동일 |

**응답:** `explorerListResponseSchema`

**SQL 개요 (internal):**

```sql
-- pseudo
SELECT f.*, fr.domain, fr.project_id, fr.folder_id
FROM files f
LEFT JOIN file_references fr ON fr.file_id = f.id
WHERE (:domain IS NULL OR fr.domain = :domain)
  AND (:origin IS NULL OR f.source = :origin)
  AND (:projectId IS NULL OR fr.project_id = :projectId)
  AND (:deviceId IS NULL OR f.metadata->>'device_id' = :deviceId)
  AND (:q IS NULL OR f.original_name ILIKE :q OR f.file_path ILIKE :q)
ORDER BY f.updated_at DESC
LIMIT :limit OFFSET :offset;
```

`navexCategory` · `tabAffinity` 는 **서 vice layer derive** 후 WHERE.

### 5.3 `GET /api/v1/files/explorer/search`

**Query:** `explorerFacetQuerySchema` — **`path` 생략** = 전역.

| 필드 | P0 검색 대상 |
| :--- | :--- |
| `q` | `original_name` · `file_path` |
| (P1) | `file_tags.tag` · `file_ai_metadata.summary` |
| (P1) | `metadata.device_id` |
| (P2) | nexet `cap.id` |

**응답:** `explorerListResponseSchema` — items 에 **breadcrumb** (`origin/domain/path`) optional P1.

### 5.4 Edge ingest (파일 등록)

엣지 업로드 시 **Normative** `files` 행:

| 필드 | 값 |
| :--- | :--- |
| `source` | `'edge'` |
| `file_path` | `uploads/edge/{deviceId}/{YYYY-MM-DD}/{filename}` |
| `metadata` | `{ device_id, ingest_topic?, firmware_version? }` |
| `file_references.domain` | `nexia` 또는 `infra` (정책) |

Twinex · MQTT ingest pipeline — [`TDD-022`](./08_TDD_NEXIA_MQTT토픽데이터라우팅.md) · [`TDD-024`](./Cells/08_TDD_NEXIA_CELL_ESP32베이스라인디바이스등록.md).

### 5.5 nexet (P1/P2)

| Phase | API | Navex 표현 |
| :--- | :--- | :--- |
| P1 | `GET /api/v1/nexet/installed/assets` | `origin=market` · `registration=internal` |
| P2 | `GET /api/v1/nexet/catalog/search?q=` | `origin=market-remote` · **검색 결과만** |

목록 item 은 `explorerItemSchema` 호환 — `file_path` = `market://{capId}/{version}/...`.

---

## 6. 릴레이 컨텍스트 (Navex → 탭)

선택 item → `useNexiaTabStore` / Envelope:

```typescript
export const navexSelectionContextSchema = z.object({
  tabId: z.literal('navex'),
  item: explorerItemSchema,
  relayTargetTabId: tabAffinitySchema.optional(),
  readonly: z.boolean().default(true),
})

export type NavexSelectionContext = z.infer<typeof navexSelectionContextSchema>
```

**규칙:** Navex 는 **readonly default** — 편집은 relay 대상 탭에서 [`TDD-010` §3.3](./08_TDD_NEXIA_구조기술스택운영방침.md).

---

## 7. 클라이언트 · 백엔드 배치

| 레이어 | 경로 (To-Be) |
| :--- | :--- |
| **Zod SSOT** | `packages/shared/src/files/explorer/*.ts` |
| **Nest module** | `apps/backend/src/modules/files/explorer/` |
| **Routes** | `explorer.controller.ts` — v1 prefix |
| **Service** | `explorer.service.ts` — facet SQL · category derive |
| **Hook** | `apps/web/src/domains/nexia/hooks/useGlobalFileExplorer.ts` |
| **UI** | `GlobalFileExplorer.tsx` · `NaveiaExplorerPanel.tsx` |

**Project Explorer:** 동일 hook · `projectId` **required** prop — Navex 는 omit.

---

## 8. Phase · 구현 체크리스트

| Phase | 항목 |
| :---: | :--- |
| **P0** | Zod export · tree `axis=origin` · facet list · search · code/config category · edge `deviceId` |
| **P0** | docs 병합 · internal/external · pagination · sort |
| **P1** | `categoryIn` · tag/AI metadata search · nexet installed · `projectId`/`folderId` |
| **P1** | Global Navex 동일 hook |
| **P2** | market-remote search · OPFS cache index |

---

## 9. Navex Search Engine API (PRD-014 · TDD-066 예정)

> **Normative:** [`PRD-014` §3·§8](../../05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md) · intelligent 모드 **primary**. 본 문서 §5.3 `GET .../explorer/search` = **Infra-Explorer lexical subset**.

| Method | Path | 역할 |
| :--- | :--- | :---: |
| `POST` | `/api/v1/navex/search` | hybrid query + facet + **personal rerank** |
| `POST` | `/api/v1/navex/search/zero-query` | **개인화 -only** L0 feed |
| `POST` | `/api/v1/navex/search/related` | hub pivot · graph+vector |
| `POST` | `/api/v1/navex/search/similar` | more-like-this |
| `GET` | `/api/v1/navex/personalization/profile` | Personalization Profile |
| `POST` | `/api/v1/navex/personalization/events` | trace ingest |

**Omnix tool (PRD-014 §2.3.2):** Discover intent → `navex_search` — 동일 `POST .../search` · ranking **재계산 ✗** · trace `source: omnix`.

**응답 확장 (`ExplorerItem`):**

```typescript
matchReason: z.enum(['lexical', 'semantic', 'structured', 'relational', 'personal', 'signal'])
matchScore: z.number().min(0).max(1).optional()
personalizationBoost: z.number().optional()
```

상세 파이프라인·Zod — **TDD-066** (Navex Search Engine 계약).

---

## 10. 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| Normative 범위 | [`TDD-056` §5.7](./08_TDD_NEXIA_7탭범위확정_v1.0.md) · [`PRD-014` §3·§5·§8](../../05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md) |
| UI | [`UIX-002` §1.4](../../07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md) |
| PRD | [`PRD-008`](../../05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md) · [`PRD-001` §3.9](../../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| 용어 | [`TDD-060` §3.6.4](../../../용어집_v1.0.md) |
| files DB | [`TDD-013`](./08_TDD_NEXIA_드롭존첨부파일구조.md) |
| Zod | [`TDD-037`](../AI/08_TDD_AI_TS타입스키마전략.md) |
