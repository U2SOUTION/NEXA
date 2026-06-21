# 08_TDD / AI

AI 워크스페이스·협업·지능 위계·GOVERN·데이터 프로토콜. 플랫폼 스택은 [LangGraph](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) SSOT.

## 핵심 (진입점)

| 문서 | 역할 |
| :--- | :--- |
| [08_TDD_AI_YjsHocuspocus협업SSOT](./08_TDD_AI_YjsHocuspocus협업SSOT.md) | **CRDT SSOT** — Yjs · `apps/sync` |
| [08_TDD_AI_TS타입스키마전략](./08_TDD_AI_TS타입스키마전략.md) | Zod · `packages/shared` 계약 |
| [08_TDD_AI_코일밸런스운영규범GOVERN](./08_TDD_AI_코일밸런스운영규범GOVERN.md) | COILS · 안전·지능 가중치 |

## 지능·데이터·안전

| 문서 | 설명 |
| :--- | :--- |
| [08_TDD_AI_지능위계및하드웨어사양](./08_TDD_AI_지능위계및하드웨어사양.md) | Sentinel · Indicator 하드웨어 위계 |
| [08_TDD_AI_5W1H_6대추상레이어규격](./08_TDD_AI_5W1H_6대추상레이어규격.md) | 5W1H · 6대 추상 레이어 프로토콜 |
| [08_TDD_AI_데이터성격수명주기](./08_TDD_AI_데이터성격수명주기.md) | Nature Tag · Lifecycle |
| [08_TDD_AI_RAG페르소나아카이브전략](./08_TDD_AI_RAG페르소나아카이브전략.md) | RAG · 페르소나 Atom |
| [08_TDD_AI_안전대책선조치로직](./08_TDD_AI_안전대책선조치로직.md) | Safety Reflex · Bypass |
| [08_TDD_AI_모델·런타임·엔진배치_v1.0](./08_TDD_AI_모델·런타임·엔진배치_v1.0.md) | **TDD-066** — Capability Level · Ollama/vLLM · 외부 엔진 배치 |
| [08_TDD_NEXIA_드롭존첨부파일구조](../NEXIA/08_TDD_NEXIA_드롭존첨부파일구조.md) | 드롭존 구현 (→ NEXIA 이관) |

## NEXA AIS · Admin — 레거시 승격 완료

> 레거시 **「NEXA AIS …」** · **`tmp_NEXA-SYNC …`** 초안은 아래 **정본**에 흡수됨. `_inbox` 에 매핑 stub **두지 않음**.

| 레거시 | `doc_id` | 정본 |
| :--- | :---: | :--- |
| 5W1H · Data Protocol | TDD-033 | [5W1H · 6대 추상 레이어](./08_TDD_AI_5W1H_6대추상레이어규격.md) |
| Data Lifecycle | TDD-034 | [데이터 성격 · 수명 주기](./08_TDD_AI_데이터성격수명주기.md) |
| RAG · Persona Strategy | TDD-036 | [RAG · 페르소나 아카이브](./08_TDD_AI_RAG페르소나아카이브전략.md) |
| Safety Reflex & Bypass | TDD-039 | [안전 · 선조치](./08_TDD_AI_안전대책선조치로직.md) |
| Intelligence Hierarchy | TDD-040 | [지능 위계 · 하드웨어](./08_TDD_AI_지능위계및하드웨어사양.md) |
| GOVERN V2 | TDD-041 | [코일 밸런스 · GOVERN](./08_TDD_AI_코일밸런스운영규범GOVERN.md) |
| NEXA-SYNC Command Center | ADM-001 | [09_Admin_NEXA_SYNC커맨드센터](../../09_Admin/09_Admin_NEXA_SYNC커맨드센터.md) |

## archived (2026-06-13 · SSOT ✗)

| doc_id | 문서 | 대체 SSOT |
| :---: | :--- | :--- |
| TDD-042 | [협업형 멀티에디터 플랫폼](./08_TDD_AI_협업형멀티에디터플랫폼.md) | [PRD-001](../../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) · **TDD-038** · **TDD-041** |

## 파이프라인 · NEXIA 연계 (TDD-066~068)

| doc_id | 문서 | 역할 |
| :---: | :--- | :--- |
| TDD-066 | [모델 · 런타임 · 엔진 배치](./08_TDD_AI_모델·런타임·엔진배치_v1.0.md) | L1~L4 · Ollama/vLLM · ComfyUI·ESPHome 배치 |
| TDD-067 | [에이전틱 AI · 7탭 · Yjs](../NEXIA/08_TDD_NEXIA_에이전틱AI파이프라인_7탭플랫폼연계_v1.0.md) | 4 단계 · Human·LLM · downlink |
| TDD-068 | [IoT 엣지 · HEXAGON · Nexaon](../NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) | uplink · Event Router · 지식 정재 |

## 연계 (다른 분류)

| 분류 | 문서 |
| :--- | :--- |
| PRD | [05_PRD/NEXIA/README](../../05_PRD/NEXIA/README.md) — 워크스페이스 PRD |
| UIUX | [07_UIUX_NEXIA_탐색기UI전략](../../07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md) · [07_UIUX_NEXIA_Tiptap엔진도메인옵션](../../07_UIUX/07_UIUX_NEXIA_Tiptap엔진도메인옵션.md) |
| Admin | [09_Admin_NEXA_SYNC커맨드센터](../../09_Admin/09_Admin_NEXA_SYNC커맨드센터.md) |
| NEXIA | [멀티윈도우 PiP (TDD-014)](../NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) · **TDD-038** Yjs |
