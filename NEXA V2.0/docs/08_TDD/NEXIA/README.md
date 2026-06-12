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

## 도메인 규격

| 문서 | 설명 |
| :--- | :--- |
| [08_TDD_NEXIA_데이터생애주기및형상관리.md](./08_TDD_NEXIA_데이터생애주기및형상관리.md) | 데이터 생애주기·버전 |
| [08_TDD_NEXIA_에코시스템및협업규칙.md](./08_TDD_NEXIA_에코시스템및협업규칙.md) | 에코시스템·협업 |
| [08_TDD_NEXIA_예외상황처리.md](./08_TDD_NEXIA_예외상황처리.md) | 예외 처리 |
| [08_TDD_NEXIA_음성인풋자동화및확장.md](./08_TDD_NEXIA_음성인풋자동화및확장.md) | 음성 인풋 규격 |
| [08_TDD_NEXIA_음성인풋브라우저레이어.md](./08_TDD_NEXIA_음성인풋브라우저레이어.md) | 브라우저 STT/VAD 레이어 |
| [08_TDD_NEXIA_멀티윈도우DocumentPiP.md](./08_TDD_NEXIA_멀티윈도우DocumentPiP.md) | 멀티윈도우·PiP |
| [08_TDD_NEXIA_멀티창동기화구현로드맵.md](./08_TDD_NEXIA_멀티창동기화구현로드맵.md) | 멀티창 Yjs 동기화 |

## IoT · 데이터 라우팅

| 문서 | 설명 |
| :--- | :--- |
| [08_TDD_NEXIA_MQTT토픽데이터라우팅.md](./08_TDD_NEXIA_MQTT토픽데이터라우팅.md) | MQTT 토픽·와일드카드·OTA |
| [08_TDD_NEXIA_데이터분산처리하이브리드전략.md](./08_TDD_NEXIA_데이터분산처리하이브리드전략.md) | 3모드 AI 실행·`ai_execution_mode` |

## NEXA-CELL (Twinex · 엣지)

[Cells/README](./Cells/README.md) — ESPHome YAML · Lambda · ESP32 등록 (구 `/nexa-node` 통합)

## 제너레이터

[Generators/README](./Generators/README.md) — AI 3D·Sound·Video·Circuit·Wasm 파이프라인

## 연계 (다른 분류)

| 분류 | 문서 |
| :--- | :--- |
| UIUX | [07_UIUX_NEXA_통합레이아웃구조규격](../../07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) · [07_UIUX_NEXIA_MainShell_레이아웃_v1.0](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) · [07_UIUX_NEXIA_컴포넌트트리뼈대](../../07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md) |
| MVP | [03_MVP_NEXIA_레이아웃팝아웃MVP](../../03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md) |
| Cosmic | [CSIM · AXON](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) |
