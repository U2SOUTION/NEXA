# [NXN] [API] NEXA Nexion API 및 통신 규약

## 1. 문서 목적·범위

- **목적:** Nexion 웹/확장 클라이언트와 백엔드 간 **JSON 계약**을 고정한다. Vue Flow·Resource Explorer·TipTap·용어 추출(Ollama)이 동일 SSOT를 본다.
- **범위:** `nexa_knowledge_*` 중 Nexion 직결 리소스(추적 경로, 동기화 상태, 노드–앵커 링크, 문서 본문 입출력). 오케스트레이션 전체(`execution_chains` 등)는 별도 SSOT.
- **비범위:** RLS 정책 SQL, 크롤러 내부 알고리즘, Ollama 설치 절차(인프라 런북).
- **용어:** URL·경로의 `project_id`는 **플랫폼 DB 테넌트 구획**(RLS·`project_members` 등)을 위한 것이며, **“Nexion = 플랫폼 프로젝트 하나”** 를 뜻하지 않는다. Nexion 정체성·확장 프로그램과의 분리는 `[NXN] [CNCP] ... 지식 OS ...` **§1.1** 참고. **필수 경로 변수와 “비즈니스 워크플로 프로젝트” 종속은 별개** — **§2.2**·CNCP **§1.2**.

### 1.1 계약 티어 — REST v1 **Core** vs **Extended**

스키마 티어(Tier A/B)와 정렬한다. Phase·순서는 `[NXN] [PRD] Nexion 기능과 작업 순서.md` **§3.2**, 티어·체크리스트는 `[NXN] NEXA Nexion 개발 순서와 체크 리스트.md` 서두, `[NXN] [SCHM] ...` **§2.2**를 본다.

- **Core(v1 Phase 1 고정 계약):** Nexion 데스크·크롤러·Late Anchoring에 **필수**인 공개 엔드포인트만 해당한다. 하위 호환 깨짐 시 버전 정책(예: `/v2`)을 검토한다.
- **Extended:** 확장 UX·플랫폼 연동·내부 서비스 계정 전용. **미구현·스펙 변경**이 Core보다 허용 폭이 넓다.

| 구분         | 본 문서 절         | 엔드포인트(패턴 예)                                                                                           |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Core**     | §4 추적 경로       | `GET .../traceability/tree`, `GET .../traceability/by-anchor/{anchor_id}` 등 §4에 기술된 공개 경로            |
| **Core**     | §5 동기화 상태     | `GET .../sync-state/{anchor_id}`, `POST .../sync-state/query` 등 §5 공개 경로                                 |
| **Core**     | §6 노드–문서 링크  | §6의 `GET`/`PUT`/`PATCH .../nexion/links` 계열                                                                |
| **Core**     | §7 문서 본문       | §7의 마크다운 읽기·쓰기 공개 경로                                                                             |
| **Extended** | §8 캔버스 레이아웃 | `GET`/`PUT .../canvas-layout` 등                                                                              |
| **Extended** | §9 용어 추출       | `POST .../engines/term-extraction/v1/extract` 등                                                              |
| **Extended** | §10 NIXIE          | **엔드포인트 추가가 아니라** §4 응답 필드 확장·클라이언트 파생 규칙(서버 정책 함수 허용) — Tier B와 함께 고정 |
| **Extended** | §11 내부 잡        | `POST /internal/nxn/v1/...` — BYPASSRLS·내부망 전용                                                           |

**연계 문서**

- `[NXN] [SCHM] NEXA Nexion 독립형 인덱스 및 자산 관리 스키마.md` — 필드·상태 열거 SSOT
- `[NXN] [DDL] NEXA Nexion 독립형 인덱스 및 자산 관리 DDL.md`
- `[NXN] [ARCH] N-PATH 보안 및 외부 자산 연동 설계서.md` — `physical_path` 상대·비 URI, 클라이언트에 실경로 비노출
- `[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약.md` — **§4.3.1 NEXA NIXIE 시각 규약**, §4.4 임계
- `[NXN] [SPEC] NEXA Nexion 확장 프로그램(Extension) 기능 명세.md` — 편집·용어 추출 UX·에러 토큰

---

## 2. 공통 규약

### 2.1 버전·베이스 URL

- **API 프리픽스:** `/api/nxn/v1`
- 예: `GET /api/nxn/v1/projects/{project_id}/traceability/tree`

### 2.2 인증·테넌트

- **인증:** 세션 쿠키 또는 `Authorization: Bearer <token>`(플랫폼 표준에 맞춤).
- **프로젝트(경로 변수):** `project_id`는 **UUID**. RLS 활성화 시 요청 주체가 해당 구획의 멤버(`project_members` 등)인지 서버에서 검증한다. **제품 철학상 “Nexion 자체가 프로젝트 엔티티”는 아님** — §1 용어 참고.
- **권장 헤더(선택):** `X-NXN-Project-Id: <uuid>` — 단일 프로젝트 워크스페이스 UI에서 경로 생략 시 대체.

#### 2.2.1 개발자 고정: 테넌트 `project_id` vs 워크플로 “프로젝트”

- **`/projects/{project_id}/...`가 필수인 이유:** 통합 DB에서 Nexion 메타(`nexa_knowledge_*`)를 **행 단위로 격리**하고 RLS를 걸기 위한 **테넌트(데이터 구획) 키**다. **별도 DB·별도 사용자 체계**로 Nexion만 떼어 구현할 필요가 없다.
- **CNCP §1.1과의 정합:** Nexion은 **비즈니스 로직(워크플로)으로서의 플랫폼 프로젝트**에 종속되지 않는다. 테넌트 키가 `projects` 테이블 UUID와 같을 수는 있으나, **API·도메인 코드는 “PM 일정·산출물 워크플로” 전제를 두지 않는다**고 본다.
- **SSOT:** 이 이원례의 문장 기준은 `[NXN] [CNCP] NEXA Nexion 지식 OS 관리 및 N-PATH(지도) 설계 철학.md` **§1.2**다.

### 2.3 타임스탬프·ID

- 시각 필드는 **ISO 8601** 문자열, 타임존 **`Z` 또는 오프셋** 명시 권장.
- UUID는 **v7** 권장(DDL·SCHM과 정합). 클라이언트 생성 `node_id`도 UUID.

### 2.4 응답 래퍼(권장)

성공 시 리소스 본문을 직접 두거나, 일관 래퍼를 쓸 경우:

```json
{
  "ok": true,
  "data": {}
}
```

### 2.5 오류 응답

HTTP 상태 코드와 별도로 기계 판별용 코드를 둔다.

| 필드         | 타입    | 설명                                              |
| ------------ | ------- | ------------------------------------------------- |
| `ok`         | boolean | 실패 시 `false`                                   |
| `error_code` | string  | 아래 §2.6 및 Extension SPEC과 맞출 것             |
| `message`    | string  | 사용자 표시용(다국어는 클라이언트 키로 매핑 가능) |
| `details`    | object  | 선택. 필드 검증 오류 등                           |

**HTTP 매핑(권장):** `400` 검증 실패, `401` 미인증, `403` RLS 거부, `404` 리소스 없음, `409` 낙관적 락·충돌, `422` 비즈니스 규칙, `500` 서버 오류.

### 2.6 에러 코드(최소 집합)

Extension SPEC의 토큰과 정렬한다.

| `error_code`             | 설명                      |
| ------------------------ | ------------------------- |
| `EDITOR_OPEN_FAILED`     | 문서 열기 실패            |
| `EDITOR_SAVE_FAILED`     | 저장 실패                 |
| `OLLAMA_TIMEOUT`         | 추론 타임아웃             |
| `OLLAMA_MODEL_NOT_FOUND` | 모델 없음                 |
| `TERM_EXTRACTION_FAILED` | 용어 추출 실패            |
| `NXN_PROJECT_FORBIDDEN`  | 프로젝트 접근 거부        |
| `NXN_ANCHOR_NOT_FOUND`   | `anchor_id` 미등록        |
| `NXN_SYNC_CONFLICT`      | 해시·버전 충돌(낙관적 락) |
| `NXN_VALIDATION_ERROR`   | 입력 검증 실패            |

---

## 3. 보안·N-PATH 계약

- **실물리 경로 비노출:** 응답 JSON에 **호스트 절대 경로**를 넣지 않는다. 클라이언트는 `logical_path`, `anchor_id`, `path_id`, `title` 등만 수신한다.
- **본문 서빙:** 마크다운 읽기/쓰기는 **앵커 또는 내부 `path_id`** 기준 엔드포인트로만 수행하고, 서버가 **`DOCS_PATH`**(기본 전제: **`NEXA-Documentation/`** 루트)와 DB `physical_path`(상대)를 조합한다. 상세는 `[NXN] [ARCH] N-PATH ...` §1.1.

---

## 4. 리소스: 추적 경로(N-PATH 인덱스)

SCHM §4 `nexa_knowledge_traceability_paths`에 대응.

### 4.1 트리·목록

`GET /projects/{project_id}/traceability/tree`

- **쿼리(선택):** `parent_path_id`, `depth_max`, `status`(콤마 구분: `active,moved,...`)
- **응답 `data`:** 노드 배열. 각 항목 예시 필드:

| 필드                   | 타입           | 설명                                           |
| ---------------------- | -------------- | ---------------------------------------------- |
| `path_id`              | uuid           | PK                                             |
| `parent_path_id`       | uuid \| null   |                                                |
| `depth`                | number         |                                                |
| `anchor_id`            | uuid           |                                                |
| `link_id`              | string         |                                                |
| `logical_path`         | string         | N-PATH 논리 경로                               |
| `title`                | string         |                                                |
| `status`               | string         | `active` \| `moved` \| `orphaned` \| `deleted` |
| `source_hash`          | string \| null |                                                |
| `missing_since`        | string \| null | ISO8601                                        |
| `nixie_lumina_profile` | object \| null | NIXIE 프로파일(JSON)                           |

`physical_path`는 **기본 포함하지 않음**. 관리자 전용 엔드포인트가 필요하면 별 경로·역할로 분리한다.

### 4.2 단건 조회

`GET /projects/{project_id}/traceability/by-anchor/{anchor_id}`  
`GET /projects/{project_id}/traceability/{path_id}`

---

## 5. 리소스: 동기화 상태

SCHM §6 `nexa_knowledge_doc_sync_state`.

### 5.1 앵커별 조회

`GET /projects/{project_id}/sync-state/{anchor_id}`

**응답 필드 예시:** `anchor_id`, `last_sync_status` (`ok` \| `changed` \| `missing` \| `conflict` \| `error`), `curr_source_hash`, `prev_source_hash`, `last_synced_at`, `responsible_domain`(있다면).

### 5.2 일괄 조회

`POST /projects/{project_id}/sync-state/query`

**본문:**

```json
{
  "anchor_ids": ["uuid", "..."]
}
```

**응답:** `{ "items": [ { ...동일 필드... } ] }`

---

## 6. 리소스: Nexion 노드–문서 링크

SCHM §7 `nexa_knowledge_nexion_doc_node_links`.

### 6.1 목록

`GET /projects/{project_id}/nexion/links?status=linked,orphaned`

### 6.2 연결(Upsert)

`PUT /projects/{project_id}/nexion/links`

**본문:**

```json
{
  "anchor_id": "uuid",
  "node_id": "uuid",
  "asset_type": "document",
  "status": "linked"
}
```

- `status = linked`이면 `node_id` 필수(SCHM R-LNK-1).

### 6.3 연결 해제·고아 처리

`PATCH /projects/{project_id}/nexion/links/{doc_node_link_id}`

**본문 예:** `{ "status": "orphaned", "node_id": null, "unlinked_at": "..." }`

---

## 7. 리소스: 문서 본문(프록시 입출력)

TipTap·Explorer와 정합. Extension SPEC §2.3과 호환되도록 필드명을 맞출 수 있다.

### 7.1 읽기

`GET /projects/{project_id}/documents/{anchor_id}/content`

**응답 예:**

```json
{
  "anchor_id": "uuid",
  "title": "string",
  "mime": "text/markdown",
  "body": "string",
  "source_hash": "string|null",
  "updated_at": "ISO8601"
}
```

- `file_path` 같은 **OS 경로 필드는 응답에 넣지 않는다.**

### 7.2 저장

`PUT /projects/{project_id}/documents/{anchor_id}/content`

**본문:**

```json
{
  "title": "string",
  "body": "string",
  "expected_source_hash": "string|null"
}
```

- **`expected_source_hash`:** 크롤러/타 클라이언트와의 **낙관적 락**. 불일치 시 `409` + `NXN_SYNC_CONFLICT`.
- 성공 시 `source_hash`, `updated_at` 반환. 서버는 `traceability_paths`·`doc_sync_state`를 정책에 따라 갱신한다.

---

## 8. 리소스: Vue Flow 캔버스 레이아웃(v1 제안)

SCHM에 전용 테이블이 없을 수 있으므로, v1은 **API 형태만 고정**하고 저장소는 다음 중 하나로 구현한다.

- 프로젝트 메타 JSONB 한 행, 또는
- 후속 DDL `nexa_knowledge_nexion_canvas_layouts`(권장 시 마이그레이션 문서에 추가).

### 8.1 조회

`GET /projects/{project_id}/canvas-layout`

**응답 예:**

```json
{
  "revision": 12,
  "nodes": [
    {
      "id": "uuid",
      "type": "doc",
      "position": { "x": 0, "y": 0 },
      "data": { "label": "string", "anchor_id": "uuid|null" }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "uuid",
      "target": "uuid",
      "data": { "kind": "confirmed|draft" }
    }
  ],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

### 8.2 저장

`PUT /projects/{project_id}/canvas-layout`

- **본문:** 위와 동일 구조 + **`expected_revision`**(선택). 불일치 시 `409`로 동시 편집 방지.
- 서버는 `node_id`가 링크 테이블과 모순되지 않게 검증할 수 있다.

---

## 9. 리소스: 전역 용어 추출 엔진(Ollama 등)

`[NXN] [SPEC] Extension ...` §3·§3.5와 동일 계약.

### 9.1 호출

`POST /engines/term-extraction/v1/extract`

**본문:**

```json
{
  "domain": "nxn",
  "doc_id": "uuid",
  "anchor_id": "uuid",
  "title": "string",
  "content": "string",
  "locale": "ko-KR",
  "provider": "ollama",
  "model": "string"
}
```

- `doc_id`는 클라이언트 상관 ID로 쓰고, 서버 권위는 `anchor_id`·`project_id`(헤더/세션 컨텍스트)로 맞춘다.

**응답:**

```json
{
  "terms": [{ "term": "string", "description": "string", "confidence": 0.0 }],
  "confidence": 0.0,
  "provider": "ollama",
  "model": "string",
  "elapsed_ms": 0
}
```

- 실패 시 §2.5·Extension 에러 코드.

---

## 10. UI 신뢰도·NIXIE와의 매핑

**표현 주체 SSOT:** Lumina·Jitter 등 비언어 시각 피드백은 **NEXA NIXIE**가 연출하고, NEXU Canvas는 **표면**이다 — UIUX **§4.3.1**. DB 자산 메타는 **`nixie_lumina_profile`**(SCHM §4).

- UIUX의 **신뢰도 점수·NIXIE 연출**은 단일 DB 컬럼에 고정되어 있지 않을 수 있다. v1 권장:
  - **파일 실종·유예·삭제(데이터 1순위):** SCHM **§4.4.1** — `traceability_paths.status`·`missing_since`(유예: `active`+`missing_since`; 확정: `deleted`). **“실종”에 대한 NIXIE 연출 입력은 이 조합을 우선**한다.
  - **보조 헬스:** `doc_sync_state.last_sync_status`(`ok`/`changed`/`missing`/`conflict`/`error`)는 대시보드·스케줄·다도메인용; **NIXIE Jitter 단독 트리거로 쓰지 않는다**(§6.2·SPEC §2.2).
  - **세부 강도:** `nixie_lumina_profile`(traceability)와 위 신호를 병합해 클라이언트가 `confidence_score`(0~100)를 **파생**한다.
- 서버가 `GET .../traceability/tree` 등에 **`confidence_score`를 포함**시키도록 정책 함수를 두는 것을 허용한다(파생 규칙은 구현 문서에 명시).

---

## 11. 크롤러·내부 잡(선택 공개)

백엔드 전용 역할(BYPASSRLS 서비스 계정)으로만 호출한다.

- 예: `POST /internal/nxn/v1/crawl/report` — 스캔 결과 배치 적용.
- 공개 API와 경로 분리, mTLS 또는 내부 네트워크만.

상세 페이로드는 크롤러 구현과 함께 `[NXN] [ARCH] N-PATH ...` §3을 따른다.

---

## 12. 페이지네이션·제한

- 목록 API: `cursor` 또는 `offset`/`limit` 중 하나를 문서화된 방식으로 통일.
- 기본 `limit` 상한(예: 500)을 서버에서 강제.

---

## 13. 변경 이력(문서)

| 버전 | 날짜       | 요약                                                                 |
| ---- | ---------- | -------------------------------------------------------------------- |
| v0.1 | 2026-03-28 | 초안 — REST v1, N-PATH·링크·본문·캔버스·용어 추출                    |
| v0.2 | 2026-03-28 | §1.1 Core vs Extended 계약 티어 명시(SCHM Tier A/B·개발 순서와 정렬) |

---

이 명세는 구현 시 OpenAPI 3.x로 기계 생성할 수 있다. 필드 추가는 **하위 호환**(optional 필드)을 우선한다.
