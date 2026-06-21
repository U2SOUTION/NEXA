---
parent_doc: 
see_also: []
doc_id: UIX-005
title: "NEXIA v0 UI 프롬프트셋 v1.0"
category: "07_UIUX"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-11
implements_doc: PRD-001
terms_standard: ["next-js", "shadcn-ui", "react-flow"]
terms_nexa: ["nexia", "v0", "UI-L0", "nexia-shell", "nexaon-graph-workspace", "NexaonShell"]
tags: ["doc/cat/07-uiux", "doc/domain/nexia", "std/next-js", "std/shadcn-ui", "std/react-flow", "nexa/nexia", "nexa/v0", "nexa/UI-L0", "nexa/nexia-shell", "nexa/nexaon-graph-workspace", "nexa/NexaonShell"]
---

# v0 UI 프롬프트셋 — NEXIA

> **지금 구성 가능:** UI-L0~L4 프롬프트 SSOT 완료. 백엔드·Yjs 없이 v0 **목업 UI** 생성 → 수동 이식.
> **물리 경로:** `NEXA-Platform/v0/` (V2.1 §모노레포 — CI 제외)
> **명칭:** v0 대상 **`domainKey` = `nexia`**. UI-L2~L4 의 `nexaon-graph-workspace` 는 Logex **`ontology` 서브모드**(`modules/nexaon/`) 전용 — 별도 도메인 UI 가 아님.

---

## 1. 한 세션 주입 순서

v0.dev **Custom Instructions** 또는 첫 메시지에 **아래 순서로 붙여넣기**:

```text
1. v0/rules.md                    ← semantic · layout 금지
2. v0/prompts/_file-tree.md       ← ★ apps/web 경로 SSOT (필수)
3. v0/prompts/_system.md          ← NEXA 공통
4. v0/prompts/{task}.md           ← Phase별 작업
```

> v0 가 **파일 구조를 이해**하려면 **`_file-tree.md` 를 반드시 포함**한다. 이전 버전 (3 단계) 만 쓰면 경로가 3 줄 요약 수준으로만 전달됨.

---

## 2. Phase ↔ 프롬프트 매핑

| Phase | 프롬프트 파일 | 산출물 | 이식 경로 |
| --- | --- | --- | --- |
| **UI-L0** | [`UI-L0-main-shell.md`](../../../NEXA-Platform/v0/prompts/UI-L0-main-shell.md) | MainShell · drawers · status bar | `apps/web/src/frame/` |
| **UI-L1** | [`nexia-shell.md`](../../../NEXA-Platform/v0/prompts/nexia-shell.md) | 7 탭 · Left/Right 슬롯 | `domains/nexia/views/` |
| **UI-L2~L4** | [`nexaon-graph-workspace.md`](../../../NEXA-Platform/v0/prompts/nexaon-graph-workspace.md) | NexaonShell · React Flow (Logex·ontology) | `domains/nexia/modules/nexaon/` |
| **UI-L5~** | (후속) `nexaon-run-panel.md` | SSE 타임라인 | TBD |

---

## 3. 원클릭 번들 (UI-L2 예시)

아래 블록 전체를 v0 에 붙여넣기:

<details>
<summary>UI-L2 Nexaon Graph (Logex·ontology) — rules + system + task (펼치기)</summary>

`v0/rules.md` · `_system.md` · `nexaon-graph-workspace.md` 내용을 v0 세션마다 수동 병합하거나,
로컬에서:

```powershell
Get-Content "NEXA-Platform/v0/rules.md",
            "NEXA-Platform/v0/prompts/_file-tree.md",
            "NEXA-Platform/v0/prompts/_system.md",
            "NEXA-Platform/v0/prompts/nexaon-graph-workspace.md" |
  Set-Clipboard
```

</details>

---

## 4. shadcn 사전 설치 (권장)

```bash
npx shadcn@latest add button tabs scroll-area separator badge
npx shadcn@latest add select input resizable sheet tooltip
npm install @xyflow/react
```

---

## 5. 이식 체크리스트

- [ ] `@v0-mock` 데이터 → hooks/store 로 교체
- [ ] 경로 alias `@/domains/nexia/...` 맞춤
- [ ] Content 단일 scroll 규칙 유지
- [ ] semantic color — violation 은 `ring-destructive` / status 토큰
- [ ] `v0/history/YYYY-MM/` 에 URL · 채택 기록

---

## 6. 아직 v0 로 하지 않는 것

| 항목 | 이유 |
| --- | --- |
| Yjs · Hocuspocus | v0 mock → **UI-L3** 코드 이식 후 직접 wiring |
| SSE · Nest API | **UI-L5** — MSW 또는 실 API |
| Zod runtime parse | `packages/shared` — codegen 후 연결 |
| ESPHome · Web Serial | **UI-L7** — 브라우저 API 검증 필요 |

---

## 7. 관련 문서

| 문서 |
| --- |
| [`07_UIUX NEXIA MainShell 레이아웃`](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| [`05_PRD NEXIA UI 기능 명세`](../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| [`08_TDD 모노레포 폴더 구조`](../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |

---

**결론:** **지금 바로** UI-L0 → UI-L1 → UI-L2 순으로 v0 세션을 돌릴 수 있다. 생성물은 `v0/history/` 에 기록한 뒤 `apps/web` 의 **`domains/nexia/`** 에 **수동 이식**한다.

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 구현 PRD | [NEXIA UI 기능 명세 — MVP Phase UI v1.0 (PRD-001)](../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| UI 레이아웃 | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 모노레포 구조 | [LangGraph 모노레포 폴더 구조 v1.0 (TDD-007)](../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
