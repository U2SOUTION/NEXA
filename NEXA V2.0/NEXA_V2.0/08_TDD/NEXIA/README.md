# 08_TDD / NEXIA

NEXIA 도메인(`nexia`) — 7탭 셸·프로토콜·제너레이터·보안. 플랫폼 전역은 [NEXAOS](../NEXAOS/) SSOT.

**NEXA 확장 방향:** **산업 → 아트 → 일상** — [`01_BRD_NEXA_사업마스터플랜`](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md)

## 핵심 (진입점)

| 문서 | 역할 |
| :--- | :--- |
| [08_TDD_NEXIA_구조기술스택운영방침.md](./08_TDD_NEXIA_구조기술스택운영방침.md) | **Normative 진입점** — 7탭·스택·운영 |
| [08_TDD_NEXIA_7탭범위확정_v1.0.md](./08_TDD_NEXIA_7탭범위확정_v1.0.md) | **7탭 In/Out · MVP Phase · Nexaon 경계** 확정 (TDD-056) |
| [08_TDD_NEXIA_구현파일구조뼈대.md](./08_TDD_NEXIA_구현파일구조뼈대.md) | **구현 파일 트리 뼈대** — `domains/nexia/` · 백엔드 · shared |
| [08_TDD_NEXIA_외부엔진및아키텍처.md](./08_TDD_NEXIA_외부엔진및아키텍처.md) | Ollama·ComfyUI·ESPHome·API |
| [08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md](./08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) | 탭 릴레이·HEXAGON·Ethos (구 `_프로토콜`) |
| [08_TDD_NEXIA_보안및권한관리체계.md](./08_TDD_NEXIA_보안및권한관리체계.md) | Grade·RBAC·Normex·감사 |

## 워크스페이스 · 파일

| 문서 | 설명 |
| :--- | :--- |
| [08_TDD_NEXIA_드롭존첨부파일구조.md](./08_TDD_NEXIA_드롭존첨부파일구조.md) | 전역 files API · NexiaLeftNav (구 `08_TDD/AI`) |
| [08_TDD_NEXIA_Navex탐색APIFacet계약_v1.0.md](./08_TDD_NEXIA_Navex탐색APIFacet계약_v1.0.md) | **Navex** 탐색·검색 REST · facet Zod (TDD-065) |

## 도메인 규격

| 문서 | 설명 |
| :--- | :--- |
| [08_TDD_NEXIA_데이터생애주기및형상관리.md](./08_TDD_NEXIA_데이터생애주기및형상관리.md) | 데이터 생애주기·버전 |
| [08_TDD_NEXIA_에코시스템및협업규칙.md](./08_TDD_NEXIA_에코시스템및협업규칙.md) | 에코시스템·협업 |
| [08_TDD_NEXIA_예외상황처리.md](./08_TDD_NEXIA_예외상황처리.md) | 예외 처리 |
| [08_TDD_NEXIA_음성인풋자동화및확장.md](./08_TDD_NEXIA_음성인풋자동화및확장.md) | 음성 인풋 규격 |
| [08_TDD_NEXIA_음성인풋브라우저레이어.md](./08_TDD_NEXIA_음성인풋브라우저레이어.md) | 브라우저 STT/VAD 레이어 |
| [08_TDD_NEXIA_멀티윈도우DocumentPiP.md](./08_TDD_NEXIA_멀티윈도우DocumentPiP.md) | 멀티윈도우·PiP (TDD-014) |

## IoT · 데이터 라우팅

| 문서 | 설명 |
| :--- | :--- |
| [08_TDD_NEXIA_MQTT토픽데이터라우팅.md](./08_TDD_NEXIA_MQTT토픽데이터라우팅.md) | MQTT 토픽·와일드카드·OTA |
| [08_TDD_NEXIA_데이터분산처리하이브리드전략.md](./08_TDD_NEXIA_데이터분산처리하이브리드전략.md) | 3모드 AI 실행·`ai_execution_mode` |
| [08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md](./08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) | **TDD-068** — 엣지 uplink · HEXAGON · Nexaon |
| [08_TDD_NEXIA_에이전틱AI파이프라인_7탭플랫폼연계_v1.0.md](./08_TDD_NEXIA_에이전틱AI파이프라인_7탭플랫폼연계_v1.0.md) | **TDD-067** — 4단계 에이전트 · 7탭 · Yjs · downlink |

## NEXA-CELL (Twinex · 엣지)

[Cells/README](./Cells/README.md) — ESPHome YAML · Lambda · ESP32 등록 (구 `/nexa-node` 통합)

## NIXIE · ML1 Presence Shell

[Nixie/README](./Nixie/README.md) — **4 Shell 채널** (Web · Desktop · Mobile · Physical) · [`TDD-070` §3.6.2](..\..\용어집_NEXA전용_v2.0.md)

| doc_id | 문서 |
| :---: | :--- |
| TDD-061 | [Web Shell](./Nixie/08_TDD_NIXIE_WebShell_v1.0.md) |
| TDD-062 | [Desktop Shell](./Nixie/08_TDD_NIXIE_DesktopShell_v1.0.md) |
| TDD-063 | [Mobile Shell](./Nixie/08_TDD_NIXIE_MobileShell_v1.0.md) |
| TDD-064 | [Physical Shell](./Nixie/08_TDD_NIXIE_PhysicalShell_v1.0.md) |

## 제너레이터 (Phase 2+ · archived)

[Generators/README](./Generators/README.md) — AI 3D·Sound·Video·Circuit·Wasm — **MVP 7탭 P0 밖**

## archived (2026-06-13 · SSOT ✗)

| doc_id | 문서 | 대체 SSOT |
| :---: | :--- | :--- |
| TDD-015 | [멀티창 동기화 로드맵](./08_TDD_NEXIA_멀티창동기화구현로드맵.md) | **TDD-014** · **TDD-038** |
| MVP-001 | [레이아웃 · 팝아웃 MVP](../../03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md) | **UIX-004** |

## 연계 (다른 분류)

| 분류 | 문서 |
| :--- | :--- |
| UIUX | [07_UIUX_NEXIA_MainShell_레이아웃_v1.0](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) · [07_UIUX_NEXIA_컴포넌트트리뼈대](../../07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md) |
| AI | [Yjs SSOT (TDD-038)](../AI/08_TDD_AI_YjsHocuspocus협업SSOT.md) · [모델·런타임 배치 (TDD-066)](../AI/08_TDD_AI_모델·런타임·엔진배치_v1.0.md) |
| Cosmic | [CSIM · AXON](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) |
