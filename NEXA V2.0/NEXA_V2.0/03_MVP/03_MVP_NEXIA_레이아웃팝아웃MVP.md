---
parent_doc: 
implements_doc: 
see_also: []
doc_id: MVP-001
title: "NEXIA 레이아웃 · 팝아웃 MVP"
category: "03_MVP"
domain: NEXIA
status: archived
created: 2026-06-10
updated: 2026-06-13
terms_standard: ["next-js", "zustand", "broadcast-channel", "app-router"]
terms_nexa: ["NEXIA", "NexiaSplitLayout", "nexiaPanelRegistry", "useNexiaSplitLayout", "panelId", "detach"]
tags: ["doc/cat/03-mvp", "doc/domain/nexia", "std/next-js", "std/zustand", "std/broadcast-channel", "std/app-router", "nexa/NEXIA", "nexa/NexiaSplitLayout", "nexa/nexiaPanelRegistry", "nexa/useNexiaSplitLayout", "nexa/panelId", "nexa/detach"]
---

# NEXIA · 레이아웃 팝아웃 MVP 계획

> **⛔ archived (2026-06-13):** `NexiaSplitLayout` 시대 MVP · **SSOT ✗**
> **대체:** [UIX-004 NEXIA MainShell](../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) · [TDD-014 Document PiP](../08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md)


## 1. 지금 맞닥뜨린 문제 (한 줄)

`NexiaSplitLayout` 중심으로 **Top / Left / Center(다중 패널) / Right**가 한 화면에 얽혀 있어, 스크롤·`transform`·포털 (메뉴 등) 까지 겹치면 **인지 부하·이벤트·클립보드** 같은 부수 이슈가 함께 커진다.

## 2. 먼저 풀고 싶은 것 (우선순위 1)

**탭 (패널) 을 메인 레이아웃에서 분리해 별도 창으로 연다 (팝아웃 / detach).**
복잡한 단일 레이아웃을 “한 번에 다 보기”에서 **“필요한 패널만 창으로 빼기”**로 완화하는 첫 단계다.

- 전체 레이아웃 엔진을 당장 단순화하지 않아도, **팝아웃만 성공**하면 집중 작업·듀얼 모니터 UX 가 바로 좋아진다.
- 이후 Sense 우클릭·채팅 첨부 등은 **팝아웃된 창** 또는 **메인** 어디에 붙일지 정하기 쉬워진다.

## 3. 작업 순서 (권장)

| 단계 | 내용 | 산출 |
| --- | --- | --- |
| **0** | **용어·ID 고정** — `nexiaPanelRegistry` 의 `panelId` 와 UI 라벨 (7 탭 규격) 을 기준으로 “팝아웃 대상 목록” 문서화 | 분리 가능한 패널 목록 1 장 |
| **1** | **상태 단일 소스** — “어느 패널이 메인에 있고 / 어느 패널이 외부 창에 있는지”를 Zustand(`useNexiaSplitLayout` 확장) 에 `panelId → 'embedded' \| 'detached'` | 최소 스키마 |
| **2** | **MVP: `window.open` + 전용 라우트** — 예: `/nexia/detach?sense=1` 처럼 **패널 1 개만 그리는 얇은 페이지** (동일 앱 번들·스토어) | 첫 팝아웃 성공 |
| **3** | **메인에서 패널 숨김** — 팝아웃 시 해당 `panelId` 는 center 슬롯에서 렌더하지 않거나 placeholder | “빠진 자리” UX |
| **4** | **닫기·복귀** — 자식 창 닫힘 (`beforeunload` / `window.closed` 폴링) 시 `embedded` 로 복귀 | 단일 창으로 되돌리기 |
| **5** | **창 간 동기 (필요 시)** — 채널·선택 파일 등 최소 이벤트만 `BroadcastChannel` 또는 `localStorage` `storage` 이벤트 (전량 Yjs 는 후순위) | 08 규격으로 확장 가능한 버스 |
| **6** | **레이아웃 본체 리팩터** — `NexiaSplitLayout` 분할, `transform` 최소화, 포털/스크롤 책임 분리 | 복잡도 구조적 감소 |

**원칙:** 0~4 까지가 **MVP**이고, 5~6 은 팝아웃이 검증된 뒤 진행한다.

## 4. 기술 스택 (MVP 기준 · To-Be)

| 구분 | 선택 | 비고 |
| --- | --- | --- |
| UI | **Next.js** (`apps/web`) + Tailwind/shadcn | — |
| 라우팅 | **App Router** | detach 전용 라우트 또는 query 기반 단일 라우트 |
| 팝아웃 | **`window.open(url, '_blank', 'popup=1,width=...,height=...')`** | 브라우저 팝업 정책·사용자 허용 고려 |
| 상태 | **Zustand** (`useNexiaSplitLayout` 확장) | “분리됨” 플래그만 먼저 |
| 동기 (선택) | **`BroadcastChannel`** | 같은 origin 창 간 경량 이벤트 |
| 이후 확장 | **Yjs / Hocuspocus** | [08_TDD_NEXIA_멀티윈도우DocumentPiP](../08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) — MVP 에 필수 아님 |

## 5. 기존 문서와의 관계

- **[08_TDD_NEXIA_멀티윈도우DocumentPiP](../08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md)**: 창 매니저·Sync Bus·MW/PiP 선택 **상위 표준**.
- **본 문서**: 그 전에 할 **최소 실험·MVP 순서**. Yjs 풀 동기는 **팝아웃 MVP 이후**.

**PRD:** [05_PRD_NEXIA_워크스페이스단축키레이아웃](../05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스단축키레이아웃.md)

## 6. 하지 않기로 두는 것 (MVP 동안)

- Sense 전용 우클릭 메뉴·채팅 첨부 연동 전부
- `UniversalViewer` 파일명/경로 대규모 리네임 (팝아웃 라우트가 어느 컴포넌트를 로드할지 정해진 뒤)

---

**한 줄 결론:** **① 패널 detach MVP(라우트 + window.open + 상태)** 로 창 분리 경험을 먼저 검증하고, **② 창 간 동기 → ③ 레이아웃 본체 분할** 순으로 간다.
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 레이아웃 규격 | [NEXA 통합 레이아웃 구조 규격 (UIX-006)](../07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |
| 멀티윈도우 TDD | [멀티윈도우 · Document PiP (TDD-014)](../08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) |
| 동기화 로드맵 | [멀티창 동기화 구현 로드맵 (TDD-015)](../08_TDD/NEXIA/08_TDD_NEXIA_멀티창동기화구현로드맵.md) |
| 워크스페이스 PRD | [워크스페이스 단축키 및 레이아웃 (PRD-009)](../05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스단축키레이아웃.md) |
