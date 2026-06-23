#!/usr/bin/env python3
"""일회성: 지정 문서 하단에 ## 관련 문서 섹션 추가 (없을 때만)."""
from __future__ import annotations

import re
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent
REL_HDR = "## 관련 문서"
HAS_REL = re.compile(r"^## 관련 문서\s*$", re.M)

# path (docs 기준) -> markdown table body (헤더 제외)
SECTIONS: dict[str, str] = {
    "05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| UI 레이아웃 | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| v0 프롬프트셋 | [NEXIA v0 UI 프롬프트셋 v1.0 (UIX-005)](../07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md) |
| 모노레포 구조 | [LangGraph 모노레포 폴더 구조 v1.0 (TDD-007)](../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| 온톨로지 플랫폼 | [LangGraph · 인간-LLM 협업형 IoT 온톨로지 플랫폼 (TDD-008)](../08_TDD/LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |""",
    "07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 구현 PRD | [NEXIA UI 기능 명세 — MVP Phase UI v1.0 (PRD-001)](../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| v0 프롬프트셋 | [NEXIA v0 UI 프롬프트셋 v1.0 (UIX-005)](./07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md) |
| OS SSOT | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| 도메인 구조 SSOT | [NEXA OS · 도메인 구조 통합 (TDD-071)](../08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) |
| 모노레포 구조 | [LangGraph 모노레포 폴더 구조 v1.0 (TDD-007)](../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |""",
    "07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 구현 PRD | [NEXIA UI 기능 명세 — MVP Phase UI v1.0 (PRD-001)](../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| UI 레이아웃 | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 모노레포 구조 | [LangGraph 모노레포 폴더 구조 v1.0 (TDD-007)](../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |""",
    "08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| 제품 PRD | [NEXIA UI 기능 명세 — MVP Phase UI v1.0 (PRD-001)](../../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| UI 레이아웃 | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 온톨로지 플랫폼 | [LangGraph · 인간-LLM 협업형 IoT 온톨로지 플랫폼 (TDD-008)](./08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |""",
    "08_TDD/LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| 모노레포 구조 | [LangGraph 모노레포 폴더 구조 v1.0 (TDD-007)](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| 오케스트레이션 | [LangGraph · 오케스트레이션 설계 v1.0 (TDD-058)](./08_TDD_LangGraph_오케스트레이션설계_v1.0.md) |
| 기술 스택 | [IoT·온톨로지·AI 협력 플랫폼 핵심 기술 스택 (TDD-009)](./08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md) |
| 제품 PRD | [NEXIA UI 기능 명세 — MVP Phase UI v1.0 (PRD-001)](../../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |""",
    "08_TDD/LangGraph/08_TDD_LangGraph_오케스트레이션설계_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 플랫폼 | [LangGraph · IoT 온톨로지 플랫폼 (TDD-008)](./08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
| 모노레포 · registry | [LangGraph 모노레포 폴더 구조 (TDD-007)](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| nexia 탭 | [NEXIA 구조 · 기술 스택 (TDD-010)](../NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |
| nexia 범위 | [NEXIA · 7탭 범위 확정 (TDD-056)](../NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) |
| ontex | [Ontex · 기술 스택 (TDD-057)](../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) |
| 지식 층위 | [Knowledge · 오케스트레이션 (TDD-049)](../Knowledge/08_TDD_Knowledge_지식층위와오케스트레이션.md) |""",
    "08_TDD/LangGraph/08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [LangGraph · 인간-LLM 협업형 IoT 온톨로지 플랫폼 (TDD-008)](./08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
| MQTT 라우팅 | [MQTT 토픽 · 데이터 라우팅 (TDD-022)](../NEXIA/08_TDD_NEXIA_MQTT토픽데이터라우팅.md) |
| 모노레포 구조 | [LangGraph 모노레포 폴더 구조 v1.0 (TDD-007)](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |""",
    "03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md": """| 관계 | 문서 |
| :--- | :--- |
| 레이아웃 규격 | [NEXA 통합 레이아웃 구조 규격 (UIX-006)](../07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |
| 멀티윈도우 TDD | [멀티윈도우 · Document PiP (TDD-014)](../08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) |
| 동기화 로드맵 | [멀티창 동기화 구현 로드맵 (TDD-015)](../08_TDD/NEXIA/08_TDD_NEXIA_멀티창동기화구현로드맵.md) |
| 워크스페이스 PRD | [워크스페이스 단축키 및 레이아웃 (PRD-009)](../05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스단축키레이아웃.md) |""",
    "07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md": """| 관계 | 문서 |
| :--- | :--- |
| 구현 MVP | [NEXIA 레이아웃 · 팝아웃 MVP (MVP-001)](../03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md) |
| 멀티윈도우 TDD | [멀티윈도우 · Document PiP (TDD-014)](../08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) |
| 동기화 로드맵 | [멀티창 동기화 구현 로드맵 (TDD-015)](../08_TDD/NEXIA/08_TDD_NEXIA_멀티창동기화구현로드맵.md) |
| 워크스페이스 PRD | [워크스페이스 단축키 및 레이아웃 (PRD-009)](../05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스단축키레이아웃.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 MVP | [NEXIA 레이아웃 · 팝아웃 MVP (MVP-001)](../../03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md) |
| 동기화 로드맵 | [멀티창 동기화 구현 로드맵 (TDD-015)](./08_TDD_NEXIA_멀티창동기화구현로드맵.md) |
| 레이아웃 규격 | [NEXA 통합 레이아웃 구조 규격 (UIX-006)](../../07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_멀티창동기화구현로드맵.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 MVP | [NEXIA 레이아웃 · 팝아웃 MVP (MVP-001)](../../03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md) |
| 멀티윈도우 TDD | [멀티윈도우 · Document PiP (TDD-014)](./08_TDD_NEXIA_멀티윈도우DocumentPiP.md) |
| 레이아웃 규격 | [NEXA 통합 레이아웃 구조 규격 (UIX-006)](../../07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |""",
    "05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스단축키레이아웃.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| MVP | [NEXIA 레이아웃 · 팝아웃 MVP (MVP-001)](../../03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md) |
| 레이아웃 규격 | [NEXA 통합 레이아웃 구조 규격 (UIX-006)](../../07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |
| AI 워크스페이스 | [협업형 멀티에디터 플랫폼 (TDD-042)](../../08_TDD/AI/08_TDD_AI_협업형멀티에디터플랫폼.md) |""",
    "05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| NEXIA 허브 | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../../08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |
| ESP32 등록 TDD | [CELL · ESP32 베이스라인 디바이스 등록 (TDD-024)](../../08_TDD/NEXIA/Cells/08_TDD_NEXIA_CELL_ESP32베이스라인디바이스등록.md) |
| Lambda · Jetson TDD | [CELL · Lambda 템플릿 · Jetson 연동 API (TDD-025)](../../08_TDD/NEXIA/Cells/08_TDD_NEXIA_CELL_Lambda템플릿Jetson연동API.md) |""",
    "08_TDD/NEXIA/Cells/08_TDD_NEXIA_CELL_ESP32베이스라인디바이스등록.md": """| 관계 | 문서 |
| :--- | :--- |
| 구현 PRD | [NEXA-CELL · ESPHome YAML 제너레이터 및 웹 펌웨어 (PRD-004)](../../../05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md) |
| Lambda · Jetson TDD | [CELL · Lambda 템플릿 · Jetson 연동 API (TDD-025)](./08_TDD_NEXIA_CELL_Lambda템플릿Jetson연동API.md) |
| NEXIA 허브 | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../08_TDD_NEXIA_구조기술스택운영방침.md) |""",
    "08_TDD/NEXIA/Cells/08_TDD_NEXIA_CELL_Lambda템플릿Jetson연동API.md": """| 관계 | 문서 |
| :--- | :--- |
| 구현 PRD | [NEXA-CELL · ESPHome YAML 제너레이터 및 웹 펌웨어 (PRD-004)](../../../05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md) |
| ESP32 등록 TDD | [CELL · ESP32 베이스라인 디바이스 등록 (TDD-024)](./08_TDD_NEXIA_CELL_ESP32베이스라인디바이스등록.md) |
| NEXIA 허브 | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../08_TDD_NEXIA_구조기술스택운영방침.md) |""",
    "07_UIUX/07_UIUX_NEXIA_Tiptap엔진도메인옵션.md": """| 관계 | 문서 |
| :--- | :--- |
| 구현 PRD | [NEXIA UI 기능 명세 (PRD-001)](../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| 룰 · GOVERN | [코일 밸런스 · GOVERN (TDD-041)](../08_TDD/AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |
| AI 워크스페이스 | [협업형 멀티에디터 플랫폼 (TDD-042)](../08_TDD/AI/08_TDD_AI_협업형멀티에디터플랫폼.md) |""",
    "08_TDD/AI/08_TDD_AI_5W1H_6대추상레이어규격.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 허브 | [협업형 멀티에디터 플랫폼 (TDD-042)](./08_TDD_AI_협업형멀티에디터플랫폼.md) |
| 데이터 수명 | [데이터 성격 · 수명 주기 (TDD-034)](./08_TDD_AI_데이터성격수명주기.md) |
| RAG 전략 | [RAG · 페르소나 아카이브 전략 (TDD-036)](./08_TDD_AI_RAG페르소나아카이브전략.md) |""",
    "08_TDD/AI/08_TDD_AI_데이터성격수명주기.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 허브 | [협업형 멀티에디터 플랫폼 (TDD-042)](./08_TDD_AI_협업형멀티에디터플랫폼.md) |
| 5W1H 레이어 | [5W1H · 6 대 추상 레이어 규격 (TDD-033)](./08_TDD_AI_5W1H_6대추상레이어규격.md) |
| GOVERN 규범 | [코일 밸런스 · GOVERN 운영 규범 (TDD-041)](./08_TDD_AI_코일밸런스운영규범GOVERN.md) |""",
    "08_TDD/AI/08_TDD_AI_RAG페르소나아카이브전략.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 허브 | [협업형 멀티에디터 플랫폼 (TDD-042)](./08_TDD_AI_협업형멀티에디터플랫폼.md) |
| 5W1H 레이어 | [5W1H · 6 대 추상 레이어 규격 (TDD-033)](./08_TDD_AI_5W1H_6대추상레이어규격.md) |
| Yjs 협업 | [Yjs · Hocuspocus 협업 SSOT (TDD-038)](./08_TDD_AI_YjsHocuspocus협업SSOT.md) |""",
    "08_TDD/AI/08_TDD_AI_YjsHocuspocus협업SSOT.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 허브 | [협업형 멀티에디터 플랫폼 (TDD-042)](./08_TDD_AI_협업형멀티에디터플랫폼.md) |
| TS 스키마 | [TS 타입 · 스키마 전략 (TDD-037)](./08_TDD_AI_TS타입스키마전략.md) |""",
    "08_TDD/AI/08_TDD_AI_안전대책선조치로직.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 허브 | [협업형 멀티에디터 플랫폼 (TDD-042)](./08_TDD_AI_협업형멀티에디터플랫폼.md) |
| 지능 위계 | [지능 위계 · 하드웨어 사양 (TDD-040)](./08_TDD_AI_지능위계및하드웨어사양.md) |
| GOVERN 규범 | [코일 밸런스 · GOVERN 운영 규범 (TDD-041)](./08_TDD_AI_코일밸런스운영규범GOVERN.md) |""",
    "08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 허브 | [협업형 멀티에디터 플랫폼 (TDD-042)](./08_TDD_AI_협업형멀티에디터플랫폼.md) |
| 안전 대책 | [안전 대책 · 선조치 로직 (TDD-039)](./08_TDD_AI_안전대책선조치로직.md) |
| NEXA-CELL PRD | [NEXA-CELL · ESPHome YAML 제너레이터 및 웹 펌웨어 (PRD-004)](../../05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md) |""",
    "08_TDD/AI/08_TDD_AI_코일밸런스운영규범GOVERN.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 허브 | [협업형 멀티에디터 플랫폼 (TDD-042)](./08_TDD_AI_협업형멀티에디터플랫폼.md) |
| 데이터 수명 | [데이터 성격 · 수명 주기 (TDD-034)](./08_TDD_AI_데이터성격수명주기.md) |""",
    "08_TDD/AI/08_TDD_AI_TS타입스키마전략.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| Yjs 협업 | [Yjs · Hocuspocus 협업 SSOT (TDD-038)](./08_TDD_AI_YjsHocuspocus협업SSOT.md) |
| AI 워크스페이스 | [협업형 멀티에디터 플랫폼 (TDD-042)](./08_TDD_AI_협업형멀티에디터플랫폼.md) |""",
    "05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| 탐색기 UI | [탐색기 UI 전략 (UIX-002)](../../07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md) |
| 드롭존 PRD | [드롭존 및 첨부 기능 플랜 (PRD-005)](./05_PRD_NEXIA_드롭존첨부기능플랜.md) |
| 미디어 동기화 | [탐색기 ↔ 미디어 탭 동기화 (PRD-012)](./05_PRD_NEXIA_탐색기미디어탭동기화.md) |""",
    "07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md": """| 관계 | 문서 |
| :--- | :--- |
| 구현 PRD | [웹 탐색기 ↔ 문서 폴더 연동 (PRD-008)](../05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md) |
| 메타데이터 PRD | [files.source_metadata 추출 (PRD-013)](../05_PRD/NEXIA/05_PRD_NEXIA_파일메타데이터AI추출.md) |
| 드롭존 PRD | [드롭존 및 첨부 기능 플랜 (PRD-005)](../05_PRD/NEXIA/05_PRD_NEXIA_드롭존첨부기능플랜.md) |""",
    "05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인7탭.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| NEXIA 허브 | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../../08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |
| 음성 브라우저 TDD | [음성 인풋 · 브라우저 레이어 (TDD-020)](../../08_TDD/NEXIA/08_TDD_NEXIA_음성인풋브라우저레이어.md) |
| 음성 자동화 TDD | [음성 인풋 자동화 및 확장 (TDD-021)](../../08_TDD/NEXIA/08_TDD_NEXIA_음성인풋자동화및확장.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_음성인풋브라우저레이어.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 구현 PRD | [음성·미디어 파이프라인 7탭 (PRD-007)](../../05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인7탭.md) |
| 음성 자동화 TDD | [음성 인풋 자동화 및 확장 (TDD-021)](./08_TDD_NEXIA_음성인풋자동화및확장.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_음성인풋자동화및확장.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 구현 PRD | [음성·미디어 파이프라인 7탭 (PRD-007)](../../05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인7탭.md) |
| 음성 브라우저 TDD | [음성 인풋 · 브라우저 레이어 (TDD-020)](./08_TDD_NEXIA_음성인풋브라우저레이어.md) |""",
    # --- batch 2: 나머지 허브 하위 ---
    "08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 Normative | [NEXA OS 설계 표준 · 미션 크리티컬 (TDD-001)](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| nexia 7탭 | [NEXIA · 7탭 범위 확정 (TDD-056)](../NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) |
| Ontex | [Ontex · 기술 스택 (TDD-057)](../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) |
| 오케스트레이션 | [LangGraph · 오케스트레이션 (TDD-058)](../LangGraph/08_TDD_LangGraph_오케스트레이션설계_v1.0.md) |
| UI 레이아웃 | [NEXIA MainShell (UIX-004)](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| **대체 (삭제됨)** | TDD-002 · TDD-059 → **본 문서 (TDD-071)** |""",
    "08_TDD/Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 SSOT | [NEXA OS · 도메인 구조 통합 (TDD-071)](../NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) |
| nexia 경계 | [NEXIA · 7탭 범위 확정 (TDD-056)](../NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) |
| LangGraph | [LangGraph · IoT 온톨로지 플랫폼 (TDD-008)](../LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
| 오케스트레이션 | [LangGraph · 오케스트레이션 설계 (TDD-058)](../LangGraph/08_TDD_LangGraph_오케스트레이션설계_v1.0.md) |
| 지식 층위 | [Knowledge · 지식 층위 · 오케스트레이션 (TDD-049)](../Knowledge/08_TDD_Knowledge_지식층위와오케스트레이션.md) |""",
    "08_TDD/NEXAOS/08_TDD_NEXAOS_플랫폼기술스택.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| 모노레포 구조 | [LangGraph 모노레포 폴더 구조 v1.0 (TDD-007)](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| TS 스키마 | [TS 타입 · 스키마 전략 (TDD-037)](../AI/08_TDD_AI_TS타입스키마전략.md) |""",
    "08_TDD/NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| Capability ID | [Capability ID 체계 · Tier 접근 권한 (TDD-050)](../Identity/08_TDD_NEXA_CapabilityID체계_발급및Tier접근권한.md) |
| Identity | [Identity ID 발급 및 처리 설계 (TDD-052)](../Identity/08_TDD_NEXA_IdentityID발급및처리설계.md) |""",
    "08_TDD/NEXAOS/08_TDD_NEXAOS_하드웨어프로파일러동적성능엔진.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| Admin | [NEXA SYNC 커맨드 센터 (ADM-001)](../../09_Admin/09_Admin_NEXA_SYNC커맨드센터.md) |
| 지능 위계 | [지능 위계 · 하드웨어 사양 (TDD-040)](../AI/08_TDD_AI_지능위계및하드웨어사양.md) |""",
    "05_PRD/05_PRD_U2BEE_데스크톱앱설계명세.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| OS SSOT | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| 아카이브 체크리스트 | [4 대 핵심 · 체크리스트 상세 (TDD-005)](../08_TDD/NEXAOS/08_TDD_NEXAOS_4대핵심_체크리스트상세.md) |""",
    "05_PRD/NEXIA/05_PRD_NEXIA_ASKVOID처리설계.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| NEXIA 허브 | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../../08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |
| 예외 처리 TDD | [예외 상황 처리 (TDD-018)](../../08_TDD/NEXIA/08_TDD_NEXIA_예외상황처리.md) |""",
    "05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스웹서치자원전략.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| AI 워크스페이스 | [협업형 멀티에디터 플랫폼 (TDD-042)](../../08_TDD/AI/08_TDD_AI_협업형멀티에디터플랫폼.md) |
| 워크스페이스 레이아웃 | [워크스페이스 단축키 및 레이아웃 (PRD-009)](./05_PRD_NEXIA_워크스페이스단축키레이아웃.md) |""",
    "05_PRD/NEXIA/05_PRD_NEXIA_지식그래프NexusGraph.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| 룰 · GOVERN | [코일 밸런스 · GOVERN (TDD-041)](../../08_TDD/AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |
| AI 워크스페이스 | [협업형 멀티에디터 플랫폼 (TDD-042)](../../08_TDD/AI/08_TDD_AI_협업형멀티에디터플랫폼.md) |""",
    "05_PRD/NEXIA/05_PRD_NEXIA_탐색기미디어탭동기화.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| 탐색기 연동 | [웹 탐색기 ↔ 문서 폴더 연동 (PRD-008)](./05_PRD_NEXIA_웹탐색기문서폴더연동.md) |
| 탐색기 UI | [탐색기 UI 전략 (UIX-002)](../../07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md) |
| 음성·미디어 | [음성·미디어 파이프라인 7탭 (PRD-007)](./05_PRD_NEXIA_음성미디어파이프라인7탭.md) |""",
    "07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md": """| 관계 | 문서 |
| :--- | :--- |
| 그리드 · 타이포 | [그리드 알고리즘 · 동적 타이포그래피 UI (UIX-007)](./07_UIUX_그리드알고리즘_동적타이포그래피UI.md) |
| 모노레포 경로 | [NEXA-Platform 모노레포 폴더 구조 v1.0 (TDD-007)](../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| Mission-Safe | [NEXA OS · 수직 계층 보안 (TDD-004)](../08_TDD/NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md) |
| 도메인 mount | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 구현 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |""",
    "07_UIUX/07_UIUX_그리드알고리즘_동적타이포그래피UI.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 UIX | [BAX 미학적 인터페이스 UX 아키텍처 v1.0 (UIX-003)](./07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md) |
| NEXIA 허브 | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_데이터분산처리하이브리드전략.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 외부 엔진 | [외부 엔진 및 아키텍처 (TDD-019)](./08_TDD_NEXIA_외부엔진및아키텍처.md) |
| 음성 파이프라인 | [음성·미디어 파이프라인 7탭 (PRD-007)](../../05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인7탭.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_데이터생애주기및형상관리.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 데이터 수명 | [데이터 성격 · 수명 주기 (TDD-034)](../AI/08_TDD_AI_데이터성격수명주기.md) |
| Rivet 파이프라인 | [AI 협력 제너레이터 파이프라인 (TDD-028)](./Generators/08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_보안및권한관리체계.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| OS 보안 | [NEXA OS · 수직 계층 보안 아키텍처 (TDD-004)](../NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md) |
| GOVERN | [코일 밸런스 · GOVERN 운영 규범 (TDD-041)](../AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_에코시스템및협업규칙.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| Yjs 협업 | [Yjs · Hocuspocus 협업 SSOT (TDD-038)](../AI/08_TDD_AI_YjsHocuspocus협업SSOT.md) |
| NEXA-CELL | [NEXA-CELL · ESPHome YAML 제너레이터 및 웹 펌웨어 (PRD-004)](../../05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_예외상황처리.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| ASK VOID PRD | [ASK VOID 처리 설계 (PRD-003)](../../05_PRD/NEXIA/05_PRD_NEXIA_ASKVOID처리설계.md) |
| GOVERN | [코일 밸런스 · GOVERN 운영 규범 (TDD-041)](../AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_외부엔진및아키텍처.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 제너레이터 허브 | [AI 협력 제너레이터 파이프라인 (TDD-028)](./Generators/08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |
| 하이브리드 전략 | [데이터 분산 처리 · 하이브리드 전략 (TDD-011)](./08_TDD_NEXIA_데이터분산처리하이브리드전략.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_MQTT토픽데이터라우팅.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [IoT·온톨로지·AI 협력 플랫폼 핵심 기술 스택 (TDD-009)](../LangGraph/08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md) |
| NEXA-CELL | [CELL · ESP32 베이스라인 디바이스 등록 (TDD-024)](./Cells/08_TDD_NEXIA_CELL_ESP32베이스라인디바이스등록.md) |
| NEXNAP 규약 | [NEXNAP 시스템 인터페이스 표준 규약 (TDD-023)](./08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) |""",
    "08_TDD/NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| CSIM · AXON | [CSIM · AXON 프로토콜 정본 (TDD-043)](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) |
| MQTT 라우팅 | [MQTT 토픽 · 데이터 라우팅 (TDD-022)](./08_TDD_NEXIA_MQTT토픽데이터라우팅.md) |""",
    "08_TDD/NEXIA/Generators/08_TDD_NEXIA_AI3D제네레이터.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../08_TDD_NEXIA_구조기술스택운영방침.md) |
| Blender 연동 | [AI 3D · Blender 백엔드 연동 (TDD-027)](./08_TDD_NEXIA_AI3DBlender백엔드연동.md) |
| Wasm 개요 | [WebAssembly 개요 (TDD-032)](./08_TDD_NEXIA_WebAssembly개요.md) |""",
    "08_TDD/NEXIA/Generators/08_TDD_NEXIA_AI3DBlender백엔드연동.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [AI 3D 제너레이터 (TDD-026)](./08_TDD_NEXIA_AI3D제네레이터.md) |
| 제너레이터 허브 | [AI 협력 제너레이터 파이프라인 (TDD-028)](./08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |""",
    "08_TDD/NEXIA/Generators/08_TDD_NEXIA_AI협력제네레이터파이프라인.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../08_TDD_NEXIA_구조기술스택운영방침.md) |
| 외부 엔진 | [외부 엔진 및 아키텍처 (TDD-019)](../08_TDD_NEXIA_외부엔진및아키텍처.md) |
| AI VIDEO | [AI VIDEO 제너레이터 (TDD-031)](./08_TDD_NEXIA_AIVIDEO제네레이터.md) |
| AI CIRCUIT | [AI CIRCUIT 제너레이터 (TDD-029)](./08_TDD_NEXIA_AICIRCUIT제네레이터.md) |""",
    "08_TDD/NEXIA/Generators/08_TDD_NEXIA_AICIRCUIT제네레이터.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [AI 협력 제너레이터 파이프라인 (TDD-028)](./08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |
| NEXA-CELL PRD | [NEXA-CELL · ESPHome YAML 제너레이터 및 웹 펌웨어 (PRD-004)](../../../05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md) |""",
    "08_TDD/NEXIA/Generators/08_TDD_NEXIA_AISOUND제네레이터.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [AI 협력 제너레이터 파이프라인 (TDD-028)](./08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |
| 음성 PRD | [음성·미디어 파이프라인 7탭 (PRD-007)](../../../05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인7탭.md) |""",
    "08_TDD/NEXIA/Generators/08_TDD_NEXIA_AIVIDEO제네레이터.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [AI 협력 제너레이터 파이프라인 (TDD-028)](./08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |
| 음성 PRD | [음성·미디어 파이프라인 7탭 (PRD-007)](../../../05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인7탭.md) |""",
    "08_TDD/NEXIA/Generators/08_TDD_NEXIA_WebAssembly개요.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [AI 협력 제너레이터 파이프라인 (TDD-028)](./08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |
| AI 3D | [AI 3D 제너레이터 (TDD-026)](./08_TDD_NEXIA_AI3D제네레이터.md) |""",
    "08_TDD/AI/08_TDD_AI_드롭존첨부파일구조.md": """| 관계 | 문서 |
| :--- | :--- |
| 구현 PRD | [드롭존 및 첨부 기능 플랜 (PRD-005)](../../05_PRD/NEXIA/05_PRD_NEXIA_드롭존첨부기능플랜.md) |
| 정본 TDD | [드롭존 · 첨부 파일 구조 (TDD-013)](../NEXIA/08_TDD_NEXIA_드롭존첨부파일구조.md) |""",
    "08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| Cosmic Language | [Cosmic Language · 전역 데이터 아키텍처 (TDD-044)](./08_TDD_CosmicLanguage_전역데이터아키텍처.md) |
| NEXNAP | [NEXNAP 시스템 인터페이스 표준 규약 (TDD-023)](../NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) |""",
    "08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [CSIM · AXON 프로토콜 정본 (TDD-043)](./08_TDD_CSIM_AXON프로토콜_정본.md) |
| 5W1H 레이어 | [5W1H · 6 대 추상 레이어 규격 (TDD-033)](../AI/08_TDD_AI_5W1H_6대추상레이어규격.md) |""",
    "08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| 구축 로드맵 | [시스템 구축 순서 및 로드맵 (TDD-046)](./08_TDD_Knowledge_시스템구축순서및로드맵.md) |
| 지식 운영 | [지식 운영 체제 · API 운영 정책 (TDD-048)](./08_TDD_Knowledge_지식운영체제_API운영정책.md) |""",
    "08_TDD/Knowledge/08_TDD_Knowledge_시스템구축순서및로드맵.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [디렉토리 책임 · 기획 자원 경로 (TDD-045)](./08_TDD_Knowledge_디렉토리책임및기획자원경로.md) |
| 오케스트레이션 | [지식 층위 · 오케스트레이션 (TDD-049)](./08_TDD_Knowledge_지식층위와오케스트레이션.md) |""",
    "08_TDD/Knowledge/08_TDD_Knowledge_언어적라우팅및지능형정규화.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [디렉토리 책임 · 기획 자원 경로 (TDD-045)](./08_TDD_Knowledge_디렉토리책임및기획자원경로.md) |
| RAG 전략 | [RAG · 페르소나 아카이브 전략 (TDD-036)](../AI/08_TDD_AI_RAG페르소나아카이브전략.md) |""",
    "08_TDD/Knowledge/08_TDD_Knowledge_지식운영체제_API운영정책.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [디렉토리 책임 · 기획 자원 경로 (TDD-045)](./08_TDD_Knowledge_디렉토리책임및기획자원경로.md) |
| GOVERN | [코일 밸런스 · GOVERN 운영 규범 (TDD-041)](../AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |""",
    "08_TDD/Knowledge/08_TDD_Knowledge_지식층위와오케스트레이션.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [디렉토리 책임 · 기획 자원 경로 (TDD-045)](./08_TDD_Knowledge_디렉토리책임및기획자원경로.md) |
| LangGraph | [LangGraph · 인간-LLM 협업형 IoT 온톨로지 플랫폼 (TDD-008)](../LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |""",
    "08_TDD/Identity/08_TDD_NEXA_CapabilityID체계_발급및Tier접근권한.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS · 수직 계층 보안 아키텍처 (TDD-004)](../NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md) |
| 운영 부록 | [Capability 기능 자격 · 운영 및 보안 부록 (TDD-051)](./08_TDD_NEXA_Capability기능자격_운영및보안부록.md) |""",
    "08_TDD/Identity/08_TDD_NEXA_Capability기능자격_운영및보안부록.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [Capability ID 체계 · Tier 접근 권한 (TDD-050)](./08_TDD_NEXA_CapabilityID체계_발급및Tier접근권한.md) |
| GOVERN | [코일 밸런스 · GOVERN 운영 규범 (TDD-041)](../AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |""",
    "08_TDD/Identity/08_TDD_NEXA_IdentityID발급및처리설계.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS · 수직 계층 보안 아키텍처 (TDD-004)](../NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md) |
| 신뢰도 | [데이터 무결성 · 신뢰도 점수 (TDD-053)](./08_TDD_NEXA_데이터무결성과신뢰도점수.md) |""",
    "08_TDD/Identity/08_TDD_NEXA_데이터무결성과신뢰도점수.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [Identity ID 발급 및 처리 설계 (TDD-052)](./08_TDD_NEXA_IdentityID발급및처리설계.md) |
| Knowledge | [지식 운영 체제 · API 운영 정책 (TDD-048)](../Knowledge/08_TDD_Knowledge_지식운영체제_API운영정책.md) |""",
    "09_Admin/09_Admin_NEXA_SYNC커맨드센터.md": """| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| 하드웨어 프로파일러 | [하드웨어 프로파일러 · 동적 성능 엔진 (TDD-006)](../08_TDD/NEXAOS/08_TDD_NEXAOS_하드웨어프로파일러동적성능엔진.md) |
| GOVERN | [코일 밸런스 · GOVERN 운영 규범 (TDD-041)](../08_TDD/AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |""",
}

PRD001_LEGACY = re.compile(
    r"\n## 8\. 관련 문서\n\n\| 문서.*?\n---\n",
    re.DOTALL,
)


def block(body: str) -> str:
    return f"\n---\n\n{REL_HDR}\n\n{body.rstrip()}\n"


def main() -> None:
    added, skipped = [], []
    for rel, body in SECTIONS.items():
        path = DOCS / rel
        text = path.read_text(encoding="utf-8")
        if HAS_REL.search(text):
            skipped.append(rel)
            continue
        if rel.endswith("05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md"):
            text = PRD001_LEGACY.sub("\n", text)
        path.write_text(text.rstrip() + block(body), encoding="utf-8")
        added.append(rel)
    print(f"added: {len(added)}")
    for a in added:
        print(f"  + {a}")
    if skipped:
        print(f"skipped: {len(skipped)}")
        for s in skipped:
            print(f"  - {s}")


if __name__ == "__main__":
    main()
