# 05_PRD / NEXIA

NEXIA 도메인(`nexia`) 제품 요건. TDD SSOT는 [08_TDD/NEXIA](../../08_TDD/NEXIA/README.md).

> 구 `05_PRD/AI/` 워크스페이스 PRD는 **NEXIA 도메인**으로 통합·이관 (2026-06-10).

## 워크스페이스 · 협업 UI

| 문서 | 설명 |
| :--- | :--- |
| [05_PRD_NEXIA_드롭존첨부기능플랜](./05_PRD_NEXIA_드롭존첨부기능플랜.md) | 전역 파일 업로드 · NexiaLeftNav 연동 |
| [05_PRD_NEXIA_파일메타데이터AI추출](./05_PRD_NEXIA_파일메타데이터AI추출.md) | `source_metadata` · AI 추출 파이프라인 |
| [05_PRD_NEXIA_룰프롬프트통합관리](./05_PRD_NEXIA_룰프롬프트통합관리.md) | Rule Manager · instruction SSOT |
| [05_PRD_NEXIA_워크스페이스웹서치자원전략](./05_PRD_NEXIA_워크스페이스웹서치자원전략.md) | 웹자료 탭 · Project · 통합 검색 |
| [05_PRD_NEXIA_워크스페이스단축키레이아웃](./05_PRD_NEXIA_워크스페이스단축키레이아웃.md) | 스플릿·탭 단축키 · Focus Stack |
| [05_PRD_NEXIA_웹탐색기문서폴더연동](./05_PRD_NEXIA_웹탐색기문서폴더연동.md) | 탐색기 ↔ 문서 폴더 |
| [05_PRD_NEXIA_탐색기미디어탭동기화](./05_PRD_NEXIA_탐색기미디어탭동기화.md) | Explorer ↔ 미디어 탭 |
| [05_PRD_NEXIA_음성미디어파이프라인7탭](./05_PRD_NEXIA_음성미디어파이프라인7탭.md) | STT · FFmpeg · 7탭 매핑 |
| [05_PRD_NEXIA_지식그래프NexusGraph](./05_PRD_NEXIA_지식그래프NexusGraph.md) | Nexus Graph · 관계 추론 PRD |
| [05_PRD_NEXIA_ASKVOID처리설계](./05_PRD_NEXIA_ASKVOID처리설계.md) | ASK / VOID 처리 RFC |

**TDD:** [08_TDD_NEXIA_드롭존첨부파일구조](../../08_TDD/NEXIA/08_TDD_NEXIA_드롭존첨부파일구조.md) · [08_TDD_AI_협업형멀티에디터플랫폼](../../08_TDD/AI/08_TDD_AI_협업형멀티에디터플랫폼.md) (플랫폼 공통)

## NEXA-CELL (Twinex · 엣지·펌웨어)

> 구 `/nexa-node` → **NEXIA Twinex** 통합. 그래프 UI = **React Flow**.

| 문서 | 설명 |
| :--- | :--- |
| [05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어](./05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md) | ESPHome YAML 시각 편집 · 웹 OTA/USB |

**TDD:** [08_TDD/NEXIA/Cells](../../08_TDD/NEXIA/Cells/README.md)
