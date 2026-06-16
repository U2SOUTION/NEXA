---
doc_id: TDD-073
title: "Nexaon · Distillation 오케스트레이터 v1.0"
category: "08_TDD"
domain: NEXIA
status: draft
created: 2026-06-13
updated: 2026-06-13
parent_doc: TDD-008
see_also: [TDD-056, TDD-068, TDD-057, TDD-071, TDD-070, TDD-043, TDD-044, TDD-072]
terms_standard: ["langgraph", "yjs", "react-flow", "shacl", "sse"]
terms_nexa: [Nexaon, NexaonShell, nexia, DIEA, Logex, ontology, Omnix, Ontex, agent-graph, promoted, CSIM, HEXAGON, ML3, Menton]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/langgraph", "std/yjs", "std/shacl", "nexa/Nexaon"]
---

# Nexaon · Distillation 오케스트레이터 v1.0

> **한 줄:** **`Nexaon`** 은 `nexia` · **DIEA** Distillation **Cold Path** 의 **ML3 오케스트레이터** — ingest · LangGraph Run · Human 승인 · SHACL → **`Ontex` promoted** 전 단계 **소유**. Logex **`ontology` 서브모드** · **NexaonShell** UI.
>
> **기술 ID:** **`NL`** · **엣지 uplink·파이프라인** = [TDD-068](../08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) · **물리 집행** = [TDD-072](../Kineton/08_TDD_Kineton_PhysicalBridge_ACTON_ROS2_v1.0.md)

**Normative 진입점:** Nexaon 정체·경계·ingest·Run·승인·promoted. Facet MVP 표 = TDD-056 · LangGraph 런타임 = TDD-008.

---

## 1. 목적과 범위

### 1.1 Nexaon 이 담당하는 것

| 축 | 내용 |
| :--- | :--- |
| **오케스트레이션** | `stateBus` · DIEA Facet 산출 → **정재 루프** (ingest → Run → 승인) |
| **LangGraph Run** | `apps/agent-graph` · `graph_diff` · SSE |
| **승인 전 단계** | Yjs `ontology:draft` · SHACL · **promoted 후보** |
| **CSIM T3R** | Run **입력 정렬** — **번역·Run 소유** (CSIM 「사고 토대」✗) |

### 1.2 Nexaon 이 담지 않는 것

| 대상 | 소유 |
| :--- | :--- |
| **HEXAGON Envelope 작성** | **`Axon`** (TDD-043 §11) |
| **CSIM T1·T2** | **`Cosmic`** (TDD-043 §13) |
| **DIEA Facet 산출·Hot Path ERP** | **DIEA** · Facet별 domain |
| **promoted 고착·Graph RAG** | **`Ontex`** (TDD-057) |
| **물리 집행** | **`Kineton`** (TDD-072) |
| **ML1 표현·TTS** | **Nixie** |

### 1.3 명칭 · 호스트

| 항목 | 내용 |
| :--- | :--- |
| **호스트** | `nexia` · `domains/nexia/modules/nexaon/` |
| **`tabId`** | **없음** — canonical `/nexia/logex/ontology/{projectId}` |
| **DIEA** | Facet **✗** · 8번째 탭 **✗** — Facet 산출 **정재 루프**만 |
| **혼동 ✗** | NEXAON(프로토콜) · Nexion(`ontex` canvas UI) |

---

## 2. 아키텍처 위치

```text
nexia (domainKey)
  ├── DIEA (7 Facet 작업면)
  └── Nexaon (Logex ontology) — ingest · Run · promoted
```

| Path | Nexaon 관여 |
| :--- | :--- |
| **Slow · Distillation** | **전 구간 소유** (ingest → SHACL) |
| **Hot Path** | **✗** — DIEA Normex·Logex → `erp` |
| **Fast · Reflex** | **✗** — Kineton ML0 ACTON |

상세 엣지→플랫폼 단계: [TDD-068 §5–7](../08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) · 확장 다이어그램 = [_inbox/Nexaon.md](../../_inbox/Nexaon.md) §4.1 _(참고)_.

---

## 3. NexaonShell UI

| 영역 | 컴포넌트 | 역할 |
| :--- | :--- | :--- |
| Left | `ExplorerTree` | Classes · Assets · PinMaps |
| Center | `GraphCanvas` | React Flow · Yjs `ontology:draft` |
| Right | RunPanel · SHACL · Approvals | LangGraph SSE |
| URL | `/nexia/logex/ontology/{projectId}` | 북마크·SSR SSOT |

**Logex 2층:** `default` = `.nxflow` · `ontology` = **Nexaon**.

---

## 4. 정재 루프 (Normative)

| 단계 | 주체 | 산출 |
| :---: | :--- | :--- |
| ① | `stateBus` · DIEA | Envelope · Facet 맥락 |
| ② | `nexaon_ingest` | Yjs draft · staging |
| ③ | `agent-graph` Run | `graph_diff` |
| ④ | Human · Normex 참조 | 편집·검수 |
| ⑤ | Omnix | Diff accept · ASK/VOID |
| ⑥ | SHACL | PASS → promoted 후보 |
| ⑦ | `Ontex` | Neo4j **promoted** |

**never 직접 promoted:** Facet·raw → Nexaon 루프·승인·SHACL **경유 필수**.

### 4.1 입력 게이트

| 허용 | 금지 |
| :--- | :--- |
| `CSIM` T1·T2 **정렬 토큰** | 레지스터 raw · GPIO 스트림 |
| `nexaon_ingest` 큐 Envelope | Nixie ML1 payload |
| Human 편집 · DIEA correlate | Ethos FAIL payload |

> **HEXAGON vs CSIM vs Nexaon:** [TDD-043 §2.3 · §13](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [TDD-044 §2.3](../Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md)

---

## 5. ingest 모드

| 모드 | 조건 | 동작 |
| :--- | :--- | :--- |
| **Auto** | `critical` · STUCK · 정책 | Router → `nexaon_ingest` |
| **Queue** | Normal 후보고 | staging → nexabo/Nixie 알림 → Human 「정재 열기」 |
| **Buffer** | 고빈도 TICK | Live Feed · Run 배치 |

---

## 6. 협업 주체 경계

| 주체 | 관계 | Nexaon 이 안 함 |
| :--- | :--- | :--- |
| **DIEA** | 산출 → 정재 | promoted 직접 쓰기 |
| **Omnix** | 승인 게이트 | 온톨로지 UI 대체 |
| **Ontex** | promoted 수신 | 초안·Run UI |
| **Nixie** | 표현·「정재 열기」 | Run · ingest 소유 |
| **Kineton** | Hot Path 집행 | SHACL · promoted |
| **Event Router** | fan-out 대상 | Reflex 대체 |

**Nixie → Nexaon:** 데이터 파이프 **✗** · `trace_id`·UI 진입만 ([TDD-068 §1.4](../08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md)).

---

## 7. 백엔드 · 저장 순서

| 경로 | 역할 |
| :--- | :--- |
| `modules/nexaon/` | NexaonShell · 클라이언트 |
| `apps/backend/.../nexaon/` | ingest API |
| `apps/agent-graph/` | LangGraph SSE |
| `apps/sync/` | Yjs `ontology:draft` |

**Normative 순서:** Yjs Draft → Audit → SHACL PASS → Neo4j promoted → `ontex` 동기화 ([TDD-057 §7](../../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md)).

---

## 8. 구현 체크리스트 (초안)

- [ ] `nexaon_ingest` · Event Router 연동
- [ ] CSIM T2 PASS Envelope 만 ingest
- [ ] Omnix · SHACL · promoted 파이프라인
- [ ] Deep link `?from=nexabo|nixie|twinex&trace_id=`
- [ ] Hot Path · Kineton 과 **경로 분리** 검증

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| **엣지·파이프라인** | [TDD-068](../08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) |
| **LangGraph** | [TDD-008](../../LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
| **7 탭·Facet** | [TDD-056](../08_TDD_NEXIA_7탭범위확정_v1.0.md) |
| **고착** | [TDD-057](../../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) |
| **Axon · Cosmic** | [TDD-043](../../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [TDD-044](../../Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md) |
| **물리 집행** | [TDD-072](../Kineton/08_TDD_Kineton_PhysicalBridge_ACTON_ROS2_v1.0.md) |
| **용어 · ML3** | [TDD-070 §3.2.1](../../용어집_NEXA전용_v2.0.md) |
| **참고 다이어그램** | [_inbox/Nexaon.md](../../_inbox/Nexaon.md) _(archive 예정)_ |
