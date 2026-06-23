# -*- coding: utf-8 -*-
"""Transform inbox glossary to unified 12-column schema."""
from pathlib import Path

OUT = Path(r"e:\NEXA System\NEXA\NEXA V2.0\APP_V2.0\_inbox\용어집_NEXA전용_v2.0 1.md")

H = (
    "| tag | code | label_ko | label_en | fullname | category | definition | not | artifact | related | ssot | notes |\n"
    "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
)


def row(
    tag,
    code="",
    label_ko="",
    label_en="",
    fullname="",
    category="",
    definition="",
    not_="",
    artifact="",
    related="",
    ssot="",
    notes="",
):
    def esc(s):
        return (s or "").replace("|", "\\|")

    return (
        f"| `{tag}` | {esc(code)} | {esc(label_ko)} | {esc(label_en)} | {esc(fullname)} | "
        f"{esc(category)} | {esc(definition)} | {esc(not_)} | {esc(artifact)} | {esc(related)} | {esc(ssot)} | {esc(notes)} |"
    )


def block(title, intro, rows):
    lines = ["", f"### {title}", ""]
    if intro:
        lines.append(intro)
        lines.append("")
    lines.append(H)
    lines.extend(rows)
    lines.append("")
    return "\n".join(lines)


def main():
    parts = []

    parts.append(
        """---
implements_doc: 
doc_id: TDD-070
title: NEXA V2.0 전용 용어집
category: 08_TDD
domain: NEXAOS
status: draft
created: 2026-06-12
updated: 2026-06-22
parent_doc: TDD-001
see_also: [TDD-040, TDD-043, TDD-044, TDD-069, TDD-071, TDD-075, TDD-010, TDD-045, TDD-056, TDD-065, TDD-061, TDD-062, TDD-063, TDD-064, TDD-074, UIX-004, PRD-014]
terms_standard: []
terms_nexa: [glossary, terms_nexa, domainKey, tabId, DIEA, Nexaon, NIXIE, Navex, NISE, ML0, ML1, ML2, ML3, Menton, Menton-Layer, ML, Physical-Tier, Physical-Centric-Hierarchy, Core-Engine-Stack, Hub-and-Spoke, Cosmic-Layer, AXON, AXON-Stack-Layer, CSIM, APEX, HEXAGON, ACTON, NEXAVULT, ENVIRON-Shield, Galthon, Kineton, CAT, PMS, Contextual-Awareness-Timeline, Project-Management-System]
tags: [doc/cat/08-tdd, doc/domain/nexaos, nexa/glossary, nexa/terms_nexa, nexa/domainKey, nexa/tabId, nexa/DIEA, nexa/CAT, nexa/PMS]
---

# NEXA V2.0 전용 용어집

> **역할:** NEXA 플랫폼·제품·코드 전용 `terms_nexa` **사람이 읽는 SSOT**.  
> **짝 문서:** [용어집_범용_v2.0.md](용어집_범용_v2.0.md) (TDD-069) · **충돌 시:** nexia DIEA·`tabId` → **TDD-056** · Distillation·플랫폼 → **TDD-071**.

---

## 1. 사용 규칙

| scope | frontmatter_key | tag_prefix | ssot |
| :--- | :--- | :--- | :--- |
| 범용 기술 스택 | `terms_standard` | `std/` | [용어집_범용_v2.0.md](용어집_범용_v2.0.md) |
| NEXA 전용 | `terms_nexa` | `nexa/` | **본 문서** |

- 태그·배열 값은 **kebab-case**.
- **신규 전용 용어**는 본 용어집에 먼저 정의한 뒤 문서 `terms_nexa` 에 추가.
- **구 UI 라벨**(Cockpit, Ethos 등)은 **부록 A** — 신규 문서·코드 **금지**.

---

## 2. 표 스키마 (Normative)

**모든 `terms_nexa` 용어 행**은 아래 **12열**을 사용한다. 해당 없으면 **빈 칸**.

| 열 | 의미 |
| :--- | :--- |
| **tag** | `terms_nexa` · `nexa/` 태그 |
| **code** | `domainKey` · `tabId` · `PT-0` 등 런타임 코드 |
| **label_ko** | 기획·UI 한글 짧은 이름 |
| **label_en** | 영문 짧은 표기 |
| **fullname** | 풀네임·약어 풀어쓰기 |
| **category** | `platform` · `domainKey` · `tabId` · `physical-tier` · `menton-layer` · `cosmic-tier` · `axon-layer` · `ui` · `data` · `iot` · `bax` · `legacy` |
| **definition** | Normative 한 줄 정의 |
| **not** | 금지·혼동 |
| **artifact** | 산출물·URL·확장자 |
| **related** | 연관 tag |
| **ssot** | doc_id 또는 링크 |
| **notes** | 별칭·deprecated·보조 |

"""
    )
    parts.append(H)
    parts.append("\n\n**메타·집계 표**(§1 · §6 · 부록 B)만 예외.\n\n---\n\n")

    parts.append(
        """## 3. 개요 — 세 축 (서사)

NEXA OS는 **유기적 지능 생태계**이다.

1. **피지컬 티어** — **어디서** 연산하나 (PT-0~3)
2. **Menton Layer (ML0~ML3)** — **얼마나 깊게** 사고하나
3. **Axon Layer (AL1~AL7)** — **어떤 규격**으로 신호·의미·실행을 포장하나

---

## 4. NEXA V2.0 전용 용어 (`terms_nexa`)

"""
    )

    # --- 4.1 Platform ---
    platform = [
        row("NEXA", label_en="NEXA", category="platform", definition="사업·플랫폼 전체 브랜드", ssot="BRD-001"),
        row("NEXAOS", label_ko="NEXA OS", label_en="NEXA OS", category="platform", definition="OS·셸·도메인·미션크리티컬 설계층", ssot="TDD-001"),
        row("domainKey", code="domainKey", label_en="domainKey", category="platform", definition="Header 전역 메뉴 도메인 식별자 (`nexia`, `erp` …)", ssot="TDD-071"),
        row("subRoute", code="subRoute", label_en="subRoute", category="platform", definition="단일 `domainKey` 내 content 분기 (`erp/parts`)", ssot="TDD-071"),
        row("MainShell", label_en="MainShell", category="platform", definition="4 영역 + StatusBar 플랫폼 셸", ssot="UIX-004", notes="구 UIX-006 → UIX-004"),
        row("domainLayoutRegistry", label_en="domainLayoutRegistry", category="platform", definition="domainKey→슬롯 lazy import 레지스트리", ssot="TDD-071"),
        row("useLayoutStore", label_en="useLayoutStore", category="platform", definition="드로어·상태바 Zustand SSOT", ssot="UIX-004"),
        row("drawerDefaults", label_en="drawerDefaults", category="platform", definition="도메인별 L/R 드로어 open 정책", ssot="TDD-071"),
        row("SystemStatusBar", label_en="SystemStatusBar", category="platform", definition="하단 1 줄 + 확장 상태 패널 · CAT 후보 거점 (미정)", ssot="UIX-004"),
        row("AppHeader", label_en="AppHeader", category="platform", definition="상단 전역 헤더", ssot="UIX-004"),
        row("themePreset", label_en="themePreset", category="platform", definition="도메인 테마 (`office-light` 등)", ssot="TDD-071"),
        row("packages-shared", code="packages/shared", label_en="packages/shared", category="platform", definition="Zod·commands 공유 패키지", ssot="TDD-007"),
        row("agent-graph", code="apps/agent-graph", label_en="agent-graph", category="platform", definition="LLM·Embed·LangGraph 실행 앱", ssot="TDD-003"),
        row("GraphCanvas", label_en="GraphCanvas", category="platform", definition="React Flow 워크플로 UI · Yjs `.nxflow`", ssot="TDD-007", related="Nexaon"),
        row("apps-sync", code="apps/sync", label_en="apps/sync", category="platform", definition="Hocuspocus Yjs 서버", ssot="TDD-038"),
        row("embedder", label_en="embedder", category="platform", definition="in-process 임베딩 (`/v1/embed`)", ssot="TDD-003"),
        row("M.O.S.E.S.", label_ko="모세", label_en="M.O.S.E.S.", fullname="Mission-Operational Safety Engineering Standard", category="platform", definition="미션크리티컬 설계 원칙 약어", ssot="TDD-001"),
        row("Galthon", label_ko="갈톤", label_en="Galthon", category="platform", definition="NEXA 전체 신뢰성 담보 독립 감시 주체 — Why-Chain·trace 횡단 관측 · 흐름 개입 ✗", not_="≠ NEXA · ≠ Menton · ≠ Nexaon Run", ssot="TDD-074", notes="6대 핵심 축 ✗"),
    ]
    parts.append(block("4.1 플랫폼 · OS", "", platform))

    # --- domainKey ---
    domain = [
        row("nexia", code="nexia", label_en="nexia", category="domainKey", definition="플랫폼 핵심 지능 셸 · DIEA 호스트 · Distillation", not_="NEXAON 프로젝트명 · NEXIA 표기 혼동", related="DIEA, Nexaon", ssot="TDD-071"),
        row("ontex", code="ontex", label_en="Ontex", category="domainKey", definition="온톨로지·Graph RAG·pgvector (구 nexion 흡수)", ssot="TDD-071"),
        row("erp", code="erp", label_en="erp", category="domainKey", definition="ERP 메인 (구 erp-parts 통합)", ssot="TDD-071"),
        row("nexabo", code="nexabo", label_en="nexabo", category="domainKey", definition="IoT 관제·텔레메트리 (구 nexage)", ssot="TDD-071"),
        row("nexet", code="nexet", label_en="nexet", category="domainKey", definition="SW/HW 마켓 유통", ssot="TDD-071"),
        row("infra", code="infra", label_en="infra", category="domainKey", definition="장치 등록·my-devices", ssot="TDD-071"),
        row("network", code="network", label_en="network", category="domainKey", definition="WiFi·CAN·MQTT 토폴로지", ssot="TDD-071"),
        row("admin", code="admin", label_en="admin", category="domainKey", definition="슈퍼 관리 (구 nexa-admin)", ssot="TDD-071"),
    ]
    parts.append(block("4.2 domainKey (제품·업무 영역)", "> 상세 맵: [TDD-071](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md).", domain))

    # --- architecture axes ---
    intro_arch = "> **한 줄:** PT = 배치 · ML = 논리 계층 · Core Engine = 기능. SSOT: [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [TDD-075 Hub-and-Spoke](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md)."
    arch = [
        row("Physical-Tier", code="PT", label_ko="피지컬 티어", label_en="Physical Placement Tier", fullname="Physical Placement Tier", category="axis", definition="어디서 연산하나 — 4단 PT-0~3", ssot="TDD-040"),
        row("Menton-Layer", code="ML", label_ko="멘톤 레이어", label_en="Menton Intelligence Stack", category="axis", definition="소프트웨어상 역할 층 ML0~ML3", not_="≠ NEXA 브랜드 · ≠ NL0–NL3 (deprecated)", ssot="TDD-040"),
        row("Core-Engine-Stack", label_en="Core Engine Stack", category="axis", definition="Cold Path 기능 엔진 6 (가변)", ssot="TDD-075"),
        row("Hub-and-Spoke", label_en="Hub-and-Spoke", category="axis", definition="PT-3 허브 + PT-0~2·Nixie 샤드 배치", ssot="TDD-075"),
        row("PT-0", code="PT-0", label_ko="피지컬 티어 0", label_en="PT-0", category="physical-tier", definition="말단 COLD — Nano Sentinel · HEXAGON · ACTON Reflex", related="ML0", ssot="TDD-040", notes="HW: COLD"),
        row("PT-1", code="PT-1", label_ko="피지컬 티어 1", category="physical-tier", definition="WARM Micro Sentinel (선택) · Nixie ✗", ssot="TDD-040"),
        row("PT-2", code="PT-2", label_ko="피지컬 티어 2", category="physical-tier", definition="WARM Kinetic Controller (선택) · Fast Path", ssot="TDD-040"),
        row("PT-3", code="PT-3", label_ko="피지컬 티어 3", label_en="Zenith", category="physical-tier", definition="HOT 풀스택 웹 허브 · DIEA · Nexaon · Ontex", ssot="TDD-040"),
        row("ML0", code="ML0", label_en="Reflexive · Edge", category="menton-layer", definition="Sentinel · Fact·Reflex·후보고 uplink · ACTON", related="PT-0", ssot="TDD-040", notes="LangGraph Agent ✗"),
        row("ML1", code="ML1", label_en="Presence", category="menton-layer", definition="NIXIE · 4 Shell · 결과·알람·상태 Express", related="NIXIE", ssot="TDD-040"),
        row("ML2", code="ML2", label_en="Tactical · Domain", category="menton-layer", definition="nexabo/nexia 작업면 — 관제·트윈·정재 UI", ssot="TDD-040"),
        row("ML3", code="ML3", label_en="Strategic", category="menton-layer", definition="Nexaon·agent-graph·Omnix — ingest→Run→promoted", related="Nexaon", ssot="TDD-073", notes="LangGraph Agent ✓"),
    ]
    parts.append(block("4.3 아키텍처 축 — Physical · Menton · Engine", intro_arch, arch))

    # Cosmic + Axon
    cosmic = [
        row("Cosmic", label_en="Cosmic Layer", category="cosmic-tier", definition="WILL/FACT 의미 번역 축 · Tier T1–T3", related="CSIM", ssot="TDD-043"),
        row("T1", code="T1", label_en="Abstraction", category="cosmic-tier", definition="WILL/FACT → Matrix 시스템 공용어", ssot="TDD-043"),
        row("T2", code="T2", label_en="Contextualization", category="cosmic-tier", definition="Matrix+맥락 → 오해 없는 의미 토큰", ssot="TDD-043"),
        row("T3", code="T3", label_en="Concretization", category="cosmic-tier", definition="의미 → Narrative|Action · Run ✗ (Nexaon)", ssot="TDD-043"),
        row("CSIM", label_en="CSIM", fullname="Cosmic Semantic Interface Matrix", category="cosmic-tier", definition="Cosmic Layer 구현 · WILL/FACT ↔ Matrix 번역", related="Cosmic", ssot="TDD-043"),
    ]
    parts.append(block("4.4 Cosmic Layer · CSIM (T1–T3)", "", cosmic))

    axon = [
        row("AXON", label_en="AXON", category="axon-layer", definition="Axon Layer 7층 프로토콜 · AXON-AL1…AL7", ssot="TDD-043"),
        row("APEX", code="AXON-AL1", label_en="APEX Matrix", category="axon-layer", definition="3×3 의미 매트릭스 · 3상 극성", related="CSIM", ssot="TDD-043"),
        row("HEXAGON", code="AXON-AL2", label_en="HEXAGON", category="axon-layer", definition="5W1H 6축 Envelope · Zod 문법", ssot="TDD-043"),
        row("Coil-Balancer", code="AXON-AL3", label_en="Coil Balancer", category="axon-layer", definition="페르소나 Zero-sum · GOVERN", ssot="TDD-043"),
        row("NEXAON-Network", code="AXON-AL4", label_en="NEXAON Network", category="axon-layer", definition="엣지 후보고·중앙 해석", related="Nexaon", ssot="TDD-043"),
        row("NEXAVULT", code="AXON-AL5", label_en="NEXAVULT", category="axon-layer", definition="Seed·로그·벡터 이중 저장", related="Ontex", ssot="TDD-043"),
        row("ACTON", code="AXON-AL6", label_en="ACTON", category="axon-layer", definition="물리 실행 Synapse · PWM · MQTT", ssot="TDD-043"),
        row("ENVIRON-Shield", code="AXON-AL7", label_en="ENVIRON Shield", category="axon-layer", definition="환경·복지 · Jitter 차단 · Nixie triage", related="NIXIE", ssot="TDD-043"),
    ]
    parts.append(block("4.5 Axon Layer · Cosmic Language (AL1–AL7)", "", axon))

    # DIEA + tabId
    diea_intro = "> **DIEA** = Distillation Intelligence Engine Array · `nexia` 7 Facet. 구 별칭 `7Tab`/`7탭` SSOT ✗. URL: `/nexia/{tabId}`."
    tabs = [
        row("Omnix", code="omnix", label_ko="옴닉스", label_en="Omnix", category="tabId", definition="소통·허브·오케스트레이션·승인 중계", artifact=".nxchat", related="DIEA", ssot="TDD-056"),
        row("Normex", code="normex", label_ko="노멕스", label_en="Normex", category="tabId", definition="Norm·정책·Tiptap 시방서", artifact=".nxpol", related="DIEA", ssot="TDD-056"),
        row("Logex", code="logex", label_ko="로젝스", label_en="Logex", category="tabId", definition="추론·관계·React Flow 워크플로", artifact=".nxflow", related="DIEA, Nexaon", ssot="TDD-056"),
        row("Scribx", code="scribx", label_ko="스크립스", label_en="Scribx", category="tabId", definition="코드·명세·Monaco", artifact=".nxcode", related="DIEA", ssot="TDD-056"),
        row("Vivex", code="vivex", label_ko="비벡스", label_en="Vivex", category="tabId", definition="미디어·ComfyUI", artifact=".nxmedia", related="DIEA", ssot="TDD-056"),
        row("Twinex", code="twinex", label_ko="트윈엑스", label_en="Twinex", category="tabId", definition="디지털 트윈·3D·ESPHome", artifact=".nxproj .nxdev …", related="DIEA", ssot="TDD-056"),
        row("Navex", code="navex", label_ko="네이벡스", label_en="Navex", category="tabId", definition="플랫폼 전역 자산 탐색·검색·릴레이", related="DIEA, NISE", ssot="TDD-056", notes="생성 확장자 ✗"),
        row("DIEA", label_en="DIEA", fullname="Distillation Intelligence Engine Array", category="tabId", definition="nexia 7 Facet 지능 엔진 어레이", not_="≠ domainKey · ≠ Nexaon 동일시", related="Nexaon", ssot="TDD-071"),
    ]
    parts.append(block("4.6 nexia — DIEA · tabId", diea_intro, tabs))

    nexaon_rows = [
        row("Nexaon", label_en="Nexaon", category="ui", definition="Logex ontology 서브모드 · ML3 Distillation 오케스트레이터", not_="tabId ✗ · domainKey ✗ · DIEA Facet ✗", artifact="/nexia/logex/ontology/{projectId}", related="DIEA, Logex", ssot="TDD-073"),
        row("NexaonShell", label_en="NexaonShell", category="ui", definition="ExplorerTree · GraphCanvas · RunPanel 3분할", not_="MainShell ✗", related="Nexaon", ssot="TDD-056"),
        row("NEXIA", label_en="NEXIA", category="ui", definition="제품·문서 도메인 라벨 (대문자)", not_="nexia 코드키와 별도", ssot="TDD-010"),
    ]
    parts.append(block("4.7 Nexaon · 명칭 (혼동 방지)", "> Nexaon ⊂ nexia · Logex ontology. DIEA 7 Facet에 포함 ✗.", nexaon_rows))

    cat_pms = [
        row("CAT", label_ko="CAT", label_en="CAT", fullname="Contextual Awareness Timeline", category="ui", definition="nexia·MainShell 횡단 상황 인지 · LLM Read-only", not_="Omnix 채팅 ✗ · tabId ✗", related="PMS", ssot="DEV UI-Driven"),
        row("PMS", label_ko="PMS", label_en="PMS", fullname="Project Management System", category="ui", definition="WBS·Roadmap·Backlog·Asset Ledger·Validation Gate", not_="erp · 외부 PM ✗ · tabId ✗", related="CAT", ssot="DEV UI-Driven"),
        row("Contextual-Awareness-Timeline", label_en="CAT", fullname="Contextual Awareness Timeline", category="ui", definition="CAT 공식 영문 풀명 태그", notes="UI 기본 표기는 CAT"),
        row("Project-Management-System", label_en="PMS", fullname="Project Management System", category="ui", definition="PMS 공식 영문 풀명 태그", notes="UI 기본 표기는 PMS"),
    ]
    parts.append(block("4.8 확장 레이어 — CAT · PMS (7+4)", "> 7 Core tabId + Ontex·Admin·CAT·PMS. UI 배치 미정.", cat_pms))

    # UI shell - condensed key terms
    ui = [
        row("NexiaContent", label_en="NexiaContent", category="ui", definition="nexia Content 슬롯 루트 (TabBar+Workspace)", ssot="UIX-004"),
        row("NexiaWorkspace", label_en="NexiaWorkspace", category="ui", definition="L1 2-pane · L2 split · L3 PiP", ssot="UIX-004"),
        row("NexiaTabBar", label_en="NexiaTabBar", category="ui", definition="6 탭 스트립 (omnix 제외·레일)", ssot="UIX-004"),
        row("tabId", code="tabId", label_en="tabId", category="ui", definition="nexia 탭 식별자", ssot="TDD-056"),
        row("subPaneId", label_en="subPaneId", category="ui", definition="탭 내 서브패널·다중 창 ID", ssot="UIX-004"),
        row("panelId", label_en="panelId", category="ui", definition="PiP·detach 대상 패널 ID", ssot="UIX-004"),
        row("OmnixRail", label_en="OmnixRail", category="ui", definition="L1 좌측 Omnix 고정 레일", ssot="UIX-004"),
        row("Global-Navex", label_en="Global Navex", category="ui", definition="Right Drawer 플랫폼 전역 탐색", related="Navex", ssot="UIX-002"),
        row("GlobalFileExplorer", label_en="GlobalFileExplorer", category="ui", definition="Navex 공통 파일·자산 탐색 엔진", ssot="UIX-002"),
        row("Global-Asset-Index", label_en="Global Asset Index", category="ui", definition="플랫폼 전역 files 통합 인덱스 뷰", related="Navex", ssot="PRD-014"),
        row("InfraTree", label_en="InfraTree", category="ui", definition="Navex Left origin→domain→device", ssot="UIX-002"),
        row("Infra-Explorer", label_en="Infra Explorer", category="ui", definition="Navex infra 모드 · navexExploreMode: infra", ssot="UIX-002"),
        row("Intelligent-Explorer", label_en="Intelligent Explorer", category="ui", definition="NISE · 개인화 탐색", related="NISE", ssot="PRD-014"),
        row("Navex-Search-Engine", label_en="Navex Search Engine", category="ui", definition="hybrid retrieval · RRF · personal rerank", related="NISE", ssot="TDD-065"),
        row("NISE", label_en="NISE", fullname="Navex Intelligent Search Engine", category="ui", definition="Navex 검색 엔진 공식 약칭", not_="≠ Omnix · ≠ Ontex Graph RAG", related="Navex-Search-Engine", ssot="PRD-014"),
        row("Personalization-Profile", label_en="Personalization Profile", category="ui", definition="Taste·Trace·Focus·Negative ranking SSOT", ssot="PRD-014"),
        row("Left-Drawer", label_en="Left Drawer", category="ui", definition="MainShell 좌측 패널", ssot="UIX-004"),
        row("Right-Drawer", label_en="Right Drawer", category="ui", definition="MainShell 우측 패널", ssot="UIX-004"),
        row("PiP", label_en="PiP", fullname="Picture-in-Picture", category="ui", definition="패널 분리·detach", ssot="UIX-004"),
        row("UI-L0", label_en="UI-L0", category="ui", definition="MVP UI 구현 단계 (PRD-001)", notes="UI-L* 계열"),
    ]
    parts.append(block("4.9 nexia — UI 셸 · 레이아웃", "", ui))

    collab = [
        row("NIXIE", label_en="NIXIE", category="ui", definition="ML1 Presence · Canvas·BAX·전 domainKey Express", not_="Canvas/BAX 대체 ✗ · Run ✗", related="Nixie", ssot="TDD-045"),
        row("Nixie", label_en="Nixie", category="ui", definition="NIXIE 제품·UI·4 Shell 채널 표기", related="NIXIE", ssot="TDD-061"),
        row("NEXU Canvas", label_en="NEXU Canvas", category="ui", definition="온톨로지·Knowledge 페브릭 시맨틱 뷰", not_="BAX 혼용 ✗", related="BAX, NIXIE", ssot="TDD-045"),
        row("BAX", label_en="BAX", fullname="Breathing AI Experience", category="bax", definition="미적 레이아웃 · void · Grid · 전 domainKey", not_="NEXU Canvas 혼용 ✗", ssot="UIX-003"),
        row("VirtualCanvas", label_en="VirtualCanvas", category="bax", definition="BAX 레이아웃 호스트 Grid+OVERLAY", not_="NEXU Canvas ✗", related="BAX", ssot="UIX-003"),
        row("MAE", label_en="MAE", fullname="Matrix Aesthetic Engine", category="bax", definition="의미→Grid·배치", ssot="UIX-003"),
        row("ATS", label_en="ATS", fullname="Aesthetic Tuning Settings", category="bax", definition="ASR·Depth·Vibration 영속", ssot="UIX-003"),
        row("ASR", label_en="ASR", fullname="Aesthetic Space Ratio", category="bax", definition="void_ratio 하한", ssot="UIX-003"),
        row("M2P", label_en="M2P", fullname="Matrix-to-Peripheral", category="bax", definition="실시간 의지 NIXIE·Serial", ssot="UIX-003"),
        row("LayoutPolicy", label_en="LayoutPolicy", category="bax", definition="BAX BLOCK 배치 정책", ssot="UIX-003"),
        row("RuleGuard", label_en="RuleGuard", category="bax", definition="규칙 가드 · AlarmState", ssot="UIX-003"),
        row("NEXNAP", label_en="NEXNAP", category="ui", definition="시스템 인터페이스·Envelope 규약", ssot="TDD-010"),
        row("Envelope", label_en="Envelope", category="ui", definition="탭·actor·payload 표준 메시지 래퍼", ssot="TDD-010"),
        row("approval-gate", label_en="approval-gate", category="ui", definition="승인 A/B/C 게이트", ssot="TDD-008"),
        row("GOVERN", label_en="GOVERN", category="ui", definition="룰·프롬프트 거버넌스", ssot="TDD-043"),
        row("ASK", label_en="ASK", category="ui", definition="미정·보류 (PRD-003)", related="VOID"),
        row("VOID", label_en="VOID", category="ui", definition="미정·보류 (PRD-003)", related="ASK"),
        row("VOID-BOX", label_en="VOID-BOX", category="ui", definition="VOID 보관 UI", ssot="PRD-003"),
        row("DEFERRED", label_en="DEFERRED", category="ui", definition="연기된 결정 상태", ssot="PRD-003"),
    ]
    parts.append(block("4.10 Omnix · 협업 · BAX · 3층 UI", "> NEXU(What) · BAX(How sit) · NIXIE(Express). 병합 ✗.", collab))

    nixie_shell = [
        row("NixieWebShell", label_en="Nixie Web Shell", category="ui", definition="MainShell frame ML1 · PiP detach", ssot="TDD-061"),
        row("NixieDesktopShell", label_en="Nixie Desktop Shell", category="ui", definition="Python PC 독립 · WS/SSE · M2P", ssot="TDD-062"),
        row("NixieMobileShell", label_en="Nixie Mobile Shell", category="ui", definition="iOS/Android · 푸시·VAD", ssot="TDD-063"),
        row("NixiePhysicalShell", label_en="Nixie Physical Shell", category="ui", definition="ESP32/RPi 하드웨어 · M2P·Serial", ssot="TDD-064"),
    ]
    parts.append(block("4.11 NIXIE — 4 Shell 채널", "", nixie_shell))

    data = [
        row("files", label_en="files", category="data", definition="업로드 파일 DB 테이블", ssot="TDD-010"),
        row("file_references", label_en="file_references", category="data", definition="도메인·프로젝트별 파일 참조", ssot="TDD-010"),
        row("asset-origin", label_en="asset-origin", category="data", definition="Navex 출처 facet", ssot="PRD-014"),
        row("navexCategory", label_en="navexCategory", category="data", definition="Navex 종류 facet", ssot="TDD-065"),
        row("file_embeddings", label_en="file_embeddings", category="data", definition="파일 벡터 인덱스", ssot="TDD-010"),
        row("source_metadata", label_en="source_metadata", category="data", definition="AI 추출 메타 (PRD-013)", ssot="PRD-013"),
        row("nexa-docs", label_en="nexa-docs", category="data", definition="문서 폴더 노드 ID (PRD-008)", ssot="PRD-008"),
        row("identity_id", label_en="identity_id", category="data", definition="Knowledge OS identity ID", ssot="TDD-045"),
        row("nexa_identities", label_en="nexa_identities", category="data", definition="Identity 테이블", ssot="TDD-045"),
        row("anchor_id", label_en="anchor_id", category="data", definition="자산 논리 고정 주소", ssot="TDD-045"),
        row("graph_id", label_en="graph_id", category="data", definition="Nexaon·Run 그래프 ID", ssot="TDD-008"),
        row("run_id", label_en="run_id", category="data", definition="LangGraph 실행 ID", ssot="TDD-008"),
        row("project_yjs_updates", label_en="project_yjs_updates", category="data", definition="Yjs 스냅샷 persist", ssot="TDD-038"),
        row("yjs_state", label_en="yjs_state", category="data", definition="Yjs 바이너리 상태", ssot="TDD-038"),
        row("Knowledge-OS", label_en="Knowledge OS", category="data", definition="용어·벡터·감사 체계", ssot="TDD-045"),
    ]
    parts.append(block("4.12 데이터 · 파일 · Identity", "", data))

    iot = [
        row("NEXA-CELL", label_en="NEXA-CELL", category="iot", definition="ESPHome YAML·웹 펌웨어 제품", ssot="TDD-024"),
        row("Physical-AI", label_en="Physical AI", category="iot", definition="물리+AI 융합 (BRD)", ssot="BRD-001"),
        row("Physical-AI-Ops", label_en="Physical AI Ops", category="iot", definition="산업 운영 포지셔닝", ssot="BRD-001"),
        row("digital-twin", label_en="digital twin", category="iot", definition="Twinex 도메인 개념", related="Twinex", ssot="TDD-056"),
        row("edge", label_en="edge", category="iot", definition="엣지 디바이스·큐", ssot="TDD-068"),
        row("edge-device", label_en="edge-device", category="iot", definition="엣지 디바이스", ssot="TDD-068"),
        row("Lambda", label_en="Lambda", category="iot", definition="NEXA-CELL 보드 라인", ssot="TDD-024"),
        row("Kineton", label_en="Kineton", category="iot", definition="Physical Bridge · ACTON · ROS 2", ssot="TDD-072"),
    ]
    parts.append(block("4.13 IoT · 제품 모듈", "", iot))

    gen = [
        row("Generators", label_en="Generators", category="iot", definition="AI 생성기 TDD 묶음", ssot="TDD-031"),
        row("AIVIDEO", label_en="AIVIDEO", category="iot", definition="AI 비디오 생성기", ssot="TDD-031"),
        row("AI3D", label_en="AI3D", category="iot", definition="AI 3D 생성기", ssot="TDD-031"),
        row("AICIRCUIT", label_en="AICIRCUIT", category="iot", definition="AI 회로 생성기", ssot="TDD-031"),
        row("AISOUND", label_en="AISOUND", category="iot", definition="AI 사운드 생성기", ssot="TDD-031"),
    ]
    parts.append(block("4.14 Generators · 미디어", "", gen))

    legacy = [
        row("Cockpit", label_en="Cockpit", category="legacy", definition="구 UI 라벨", not_="신규 금지", related="Omnix", notes="→ Omnix"),
        row("NexiaSplitLayout", label_en="NexiaSplitLayout", category="legacy", definition="구 MVP 분할", related="NexiaWorkspace", notes="deprecated"),
        row("Nexion", label_en="Nexion", category="legacy", definition="UI 브랜드명", not_="domainKey는 ontex", ssot="TDD-057"),
        row("Nexus-Map", label_en="Nexus-Map", category="legacy", definition="레거시 AI 지식 맵", notes="deprecated"),
        row("U2BEE", label_en="U2BEE", category="legacy", definition="데스크톱 앱 (PRD-002)", ssot="PRD-002"),
        row("v0", label_en="v0", category="legacy", definition="v0 프롬프트·프로토타입", ssot="UIX-005"),
        row("nexia-shell", label_en="nexia-shell", category="legacy", definition="v0 프로토타입 셸", ssot="UIX-005"),
    ]
    parts.append(block("4.15 기타 · 레거시", "", legacy))

    # nx extensions - use unified schema
    nx = [
        row("nxchat", code="omnix", label_en=".nxchat", category="artifact", definition="Omnix 채팅·세션", artifact=".nxchat", ssot="TDD-010"),
        row("nxpol", code="normex", label_en=".nxpol", category="artifact", definition="Normex 규범·정책", artifact=".nxpol", ssot="TDD-010"),
        row("nxflow", code="logex", label_en=".nxflow", category="artifact", definition="Logex 워크플로·그래프", artifact=".nxflow", ssot="TDD-010"),
        row("nxcode", code="scribx", label_en=".nxcode", category="artifact", definition="Scribx 코드·스크립트", artifact=".nxcode", ssot="TDD-010"),
        row("nxmedia", code="vivex", label_en=".nxmedia", category="artifact", definition="Vivex 미디어 메타", artifact=".nxmedia", ssot="TDD-010"),
        row("nxproj", code="twinex", label_en=".nxproj", category="artifact", definition="Twinex 프로젝트 루트", artifact=".nxproj", ssot="TDD-010"),
        row("nxgrp", code="twinex", label_en=".nxgrp", category="artifact", definition="Twinex 그룹·토폴로지", artifact=".nxgrp", ssot="TDD-010"),
        row("nxdev", code="twinex", label_en=".nxdev", category="artifact", definition="Twinex 디바이스 바인딩", artifact=".nxdev", ssot="TDD-010"),
        row("nxdiag", code="twinex", label_en=".nxdiag", category="artifact", definition="Twinex 진단·시뮬", artifact=".nxdiag", ssot="TDD-010"),
    ]
    parts.append(block("5. `.nx*` 산출물 확장자", "> Navex: 생성 확장자 ✗ — 전 domainKey 인덱싱.", nx))

    legacy_ui = [
        row("Cockpit-legacy", code="Cockpit", label_ko="콕핏", label_en="Cockpit", category="legacy", definition="구 UI 라벨", related="Omnix", notes="부록 A"),
        row("Ethos-legacy", code="Ethos", label_ko="에토스", label_en="Ethos", category="legacy", definition="구 UI 라벨", related="Normex", notes="부록 A"),
        row("Synapse-legacy", code="Synapse", label_ko="시넵스", label_en="Synapse", category="legacy", definition="구 UI 라벨", related="Logex", notes="부록 A"),
        row("Glos-legacy", code="Glos", label_ko="글로스", label_en="Glos", category="legacy", definition="구 UI 라벨", related="Scribx", notes="부록 A"),
        row("Physis-legacy", code="Physis", label_ko="피시스", label_en="Physis", category="legacy", definition="구 UI 라벨", related="Vivex", notes="부록 A"),
        row("Sense-legacy", code="Sense", label_ko="센스", label_en="Sense", category="legacy", definition="구 UI 라벨", related="Twinex", notes="부록 A"),
        row("Navis-legacy", code="Navis", label_ko="나비스", label_en="Navis", category="legacy", definition="구 UI 라벨", related="Navex", notes="부록 A"),
    ]
    parts.append(
        block(
            "부록 A — 구 UI 라벨 (비규범)",
            "> [TDD-010 부록 B](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) 동일. **신규 금지.**",
            legacy_ui,
        )
    )

    parts.append(
        """---

## 부록 B — 전체 태그 인덱스

확정 문서 frontmatter 기준. 신규 승격 시 [`sync_terms_to_tags.py`](scripts/sync_terms_to_tags.py) 재실행.

| scope | count | lookup |
| :--- | :---: | :--- |
| `terms_standard` | 99 | [용어집_범용_v2.0.md](용어집_범용_v2.0.md) |
| `terms_nexa` | 219+ | 본 문서 §4 + [doc_id_레지스트리](doc_id_레지스트리.md) |

---

## 관련 문서

| relation | document |
| :--- | :--- |
| 범용 용어 | [용어집_범용_v2.0.md](용어집_범용_v2.0.md) (TDD-069) |
| 문서 생태계 | [개발문서 생태계와 관리 체계](<개발문서 생태계와 관리 체계.md>) |
| doc_id | [doc_id_레지스트리](doc_id_레지스트리.md) |
| 도메인 | [TDD-071](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) |
| Physical · Hub | [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [TDD-075](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) |
| Cosmic · Axon | [TDD-043](08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [TDD-044](08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md) |
| nexia 스택 | [TDD-010](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |
| nexia UI | [UIX-004](07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| BAX | [UIX-003](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md) |
| Nixie | [TDD-061~064](08_TDD/NEXIA/Nixie/) |

---

## 부록 C — 상세 서사 (이전 §3.3~3.6 요약 보존)

> **DIEA ↔ Nexaon:** DIEA = 7 Facet 작업면 · Nexaon = Cold Path Distillation 오케스트레이터 (Logex ontology). Facet 산출은 never 직접 promoted — Nexaon·승인·SHACL 경유 ([TDD-071 §2.1.2](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md)).

> **Nixie Reflex vs Nexaon Strategic:** Nixie(ML1) = Express·알림 · Nexaon(ML3) = Run·promoted. Run 트리거·Router fan-out **✗**.

> **NEXU · BAX · NIXIE 3층:** Knowledge 페브릭 → 미적 레이아웃 → ML1 Express. Canvas/BAX **혼용 ✗**.

> **Navex · NISE:** Intelligent = hybrid 검색 · Infra = InfraTree. Omnix discover → `navex_search` tool ([PRD-014](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)).

> **혼동 방지 (번호 체계):** ML0–ML3 ≠ PT-0–3 ≠ T1–T3 ≠ AXON-AL1–7 ≠ UI-L* ≠ NexiaWorkspace L* — **동일 표기 금지**.
"""
    )

    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
