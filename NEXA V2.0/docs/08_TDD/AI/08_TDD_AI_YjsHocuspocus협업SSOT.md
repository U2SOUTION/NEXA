---
doc_id: TDD-038
title: "Yjs · Hocuspocus 협업 SSOT"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-10
implements_doc: TDD-042
terms_standard: ["yjs", "crdt", "hocuspocus", "websocket", "postgresql"]
terms_nexa: ["apps-sync", "project_yjs_updates", "yjs_state", "SharedWorker"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/yjs", "std/crdt", "std/hocuspocus", "std/websocket", "std/postgresql", "nexa/apps-sync", "nexa/project_yjs_updates", "nexa/yjs_state", "nexa/SharedWorker"]
---
# AI · Yjs·Hocuspocus 협업 SSOT

| 항목 | 내용 |
|------|------|
| 역할 | NEXA 플랫폼 **실시간 협업(CRDT)** 의 단일 진실원 |
| 확정 (2026-05) | **Yjs 도입·안정화가 최우선** · 협업 서버는 **`apps/sync` Hocuspocus** |
| 관련 구현 | [`08_TDD_AI_협업형멀티에디터플랫폼`](./08_TDD_AI_협업형멀티에디터플랫폼.md) |
| 모노레포 SSOT | [`08_TDD_LangGraph_모노레포폴더구조`](../LangGraph/08_TDD_LangGraph_모노레포폴더구조_v1.0.md) — `apps/sync` · `packages/shared` |
| DB | `project_yjs_updates` + `yjs_state` 스냅샷 (Prisma/PostgreSQL) |

---

## 1. 확정 사항 (Decision Log)

| # | 결정 | 비고 |
|---|------|------|
| D1 | **Yjs를 먼저** 도입하고 안정화한 뒤, AI·레이아웃·오케스트레이션을 그 위에 올린다 | [협업형 멀티 에디터](./08_TDD_AI_협업형멀티에디터플랫폼.md) §2 비전 = 실행 순서와 동일 |
| D2 | **멀티 유저·서버 영속 협업** 백엔드는 **Hocuspocus** | TipTap 생태계, WebSocket·DB Hook |
| D3 | DB 영속화는 **`project_yjs_updates` + `yjs_state` 스냅샷** | 단일 `yjs_update` 컬럼 덮어쓰기 **금지** |
| D4 | **멀티 탭·멀티 창(동일 사용자)** 은 **SharedWorker + Yjs** 로 같은 Y.Doc에 연결 | 서버 없이도 가능; Hocuspocus와 병행 |
| D5 | **에디터 동기화 브릿지**(mitt LWW)는 Yjs 미적용 **임시 구간에만** 선택 사용 | 기본 경로는 Yjs 바인딩 |

---

## 2. 계층 구조 (한 눈에)

```text
[ Tiptap y-prosemirror | Monaco y-monaco | React Flow 등 ]
              ↕ Shared Types (Y.Text / Y.XmlFragment / Y.Array …)
[ Yjs Y.Doc — 클라이언트 ]
              ↕ WebSocket (y-protocol)
[ Hocuspocus Server ]
              ↕ onStoreDocument / Database Extension (Hooks)
[ PostgreSQL ]
    project_yjs_updates  ← 증분(BYTEA) 이력
    project_folders.yjs_state / project_nodes.yjs_state  ← 압축 스냅샷만
              ↕ (선택) Redis 배치·부하 완충 — DDL 명세 v5
[ SharedWorker ]  ← 동일 브라우저 프로필 내 탭·창 간 Y.Doc 릴레이 (Hocuspocus와 병행)
```

---

## 3. Yjs 적용 범위 (Scope)

### 3.1 리소스 단위 (DB와 1:1)

| `resource_type` | 대상 | 비고 |
|-----------------|------|------|
| `folder` | `project_folders` (탐색기·문서 트리) | |
| `node` | `project_nodes` (React Flow / NEXIA Twinex · NEXA-CELL) | |

패널·탭·`filePath`는 **애플리케이션 매핑 레이어**에서 `resource_id`로 연결한다. (패널 JSON의 `id` ≠ DB `resource_id`일 수 있음 — 매핑 표는 구현 시 [협업형 멀티 에디터](./08_TDD_AI_협업형멀티에디터플랫폼.md)에 보강)

### 3.2 멀티창 ydoc 스키마 (클라이언트)

[`08_TDD_NEXIA_멀티창동기화구현로드맵`](../NEXIA/08_TDD_NEXIA_멀티창동기화구현로드맵.md)의 탭별 서브맵(`cockpit:stream`, `glos:monaco`, `ethos:tiptap` …)은 **하나의 프로젝트 Y.Doc 안의 서브 구조**로 유지한다. Hocuspocus **룸(문서) 이름** = `project_id` + `resource_type` + `resource_id` 권장.

### 3.3 IoT·센서 스트림

- 고주파 센서 값은 **Y.Text 전체 반영 금지** ([협업형 멀티 에디터](./08_TDD_AI_협업형멀티에디터플랫폼.md) §5.8).
- **Device-only Region**(Yjs 블록·Map) 또는 **클라이언트 store/별 채널** + 임계치 커밋.
- MQTT/WebSocket 실시간은 `Data Flow` 문서 — Yjs와 **채널 분리**.

---

## 4. Hocuspocus 역할

| 항목 | 내용 |
|------|------|
| 프로토콜 | Yjs WebSocket provider (공식 권장 스택) |
| 책임 | Y.Doc 인메모리 병합, Awareness(커서·점유), 인증 후 룸 입장 |
| 영속화 | Extension/Hook으로 `project_yjs_updates` INSERT, 주기적으로 `yjs_state` 스냅샷 갱신 |
| AI | AI 출력은 **별도 제안 레이어(Diff)** → 승인 후 **Y.Text에 merge** (가상 Awareness 사용자 권장) |
| 배포 | **`apps/sync`** (Hocuspocus 독립 서비스) — Nest `apps/backend`와 분리 |

**사용하지 않음 (본 SSOT 기준)**

- 단독 **y-leveldb** 만으로 서버 영속화 완결 (로컬 스풀 보조는 가능)
- 문서 테이블 단일 **`yjs_update` BYTEA 덮어쓰기** (`Nexion/AI 와 Yjs … Ver 2.0` 초안 패턴)

---

## 5. 구현 로드맵 (실행 순서)

| 단계 | 내용 | 산출물 |
|------|------|--------|
| **0** | Yjs + Hocuspocus + DB Hook, Tiptap/Monaco 바인딩 POC | 동시 편집·새로고침 복구 |
| **0b** | SharedWorker Provider (`useYjsProvider`, 멀티창 로드맵) | 동일 사용자 멀티 탭 |
| **1** | EditorPanel·레이아웃 store — **상태는 Yjs에 바인딩**, 패널 JSON은 Yjs 스냅샷에서 파생 | [협업형 멀티 에디터](./08_TDD_AI_협업형멀티에디터플랫폼.md) §10.1 |
| **2** | **`apps/agent-graph`** 오케스트레이터 — **Y.Text / Awareness** 경유 반영 | [협업형 멀티 에디터](./08_TDD_AI_협업형멀티에디터플랫폼.md) §10.2 |
| **3** | 권한·노드 잠금·장비 전용 영역·IoT 스로틀 정교화 | [협업형 멀티 에디터](./08_TDD_AI_협업형멀티에디터플랫폼.md) §10.3 |

> 이전 「3단계에서 Yjs」 표현은 **본 SSOT로 대체**한다.

---

## 6. 문서 등급 (정리용)

| 등급 | 문서 | 조치 |
|------|------|------|
| **SSOT** | 본 문서, `DDL … 명세 v5`, `DDL … 스키마 v5`, `__NEXA 오케스트레이션 … v5` | 유지·갱신 |
| **실행** | [협업형 멀티 에디터](./08_TDD_AI_협업형멀티에디터플랫폼.md), [NEXIA 멀티창](../NEXIA/08_TDD_NEXIA_멀티창동기화구현로드맵.md) | 본 SSOT에 맞게 정렬됨 |
| **REF** | `NEXA 부록-협업 스택·큐·오케스트레이션 흐름·머메이드.md` | Hocuspocus·흐름 참고 |
| **LEGACY** | `Nexion/AI 와 Yjs 기반 협업 문서 제너레이터 … (Ver 2.0).md` | `yjs_update` 단일 컬럼 — **읽지 말고** DDL v5 따름 |
| **관련** | `Nexia/12`, `Nexia/00`, `rules/project-structure.md` | Yjs·Hocuspocus 언급은 본 SSOT와 일치 |

---

## 7. 충돌 해소 요약

| 이전 충돌 | 해소 |
|-----------|------|
| Yjs가 3단계(나중) vs 최우선 | **0단계 최우선** (D1) |
| Hocuspocus vs Express Y.Doc vs y-leveldb | **Hocuspocus** (D2) |
| `yjs_update` vs `project_yjs_updates` | **project_yjs_updates** (D3) |
| 브릿지 vs Yjs | 브릿지 **임시만** (D5) |
| 멀티창만 vs 서버 협업 | **SharedWorker + Hocuspocus** 병행 (D4) |

---

## 8. AI 협업 규칙 (요약)

1. AI는 **Yjs 가상 사용자**(Awareness)로 취급 — [협업형 멀티 에디터](./08_TDD_AI_협업형멀티에디터플랫폼.md) §2.
2. 대량 제안·삭제·정화는 **Diff·승인** 후 merge — GOVERN·정화 파이프라인과 정합.
3. AI 편집 구간은 **Awareness 잠금**으로 표시 (구현은 단계 3).

---

*갱신 시 [협업형 멀티 에디터](./08_TDD_AI_협업형멀티에디터플랫폼.md) §10·[08_TDD README](../README.md) AI 섹션 링크를 함께 확인한다.*
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 허브 | [협업형 멀티에디터 플랫폼 (TDD-042)](./08_TDD_AI_협업형멀티에디터플랫폼.md) |
| TS 스키마 | [TS 타입 · 스키마 전략 (TDD-037)](./08_TDD_AI_TS타입스키마전략.md) |
| 룰·프롬프트 PRD | [룰·프롬프트 통합 관리 (PRD-006)](../../05_PRD/NEXIA/05_PRD_NEXIA_룰프롬프트통합관리.md) |
