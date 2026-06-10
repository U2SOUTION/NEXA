# v0 UI 프롬프트셋 — NEXAON

> **지금 구성 가능:** UI-L0~L4 프롬프트 SSOT 완료. 백엔드·Yjs 없이 v0 **목업 UI** 생성 → 수동 이식.  
> **물리 경로:** `NEXA-Platform/v0/` (V2.1 §모노레포 — CI 제외)

---

## 1. 한 세션 주입 순서

v0.dev **Custom Instructions** 또는 첫 메시지에 **아래 순서로 붙여넣기**:

```text
1. v0/rules.md                    ← semantic · layout 금지
2. v0/prompts/_file-tree.md       ← ★ apps/web 경로 SSOT (필수)
3. v0/prompts/_system.md          ← NEXA 공통
4. v0/prompts/{task}.md           ← Phase별 작업
```

> v0가 **파일 구조를 이해**하려면 **`_file-tree.md`를 반드시 포함**한다. 이전 버전(3단계)만 쓰면 경로가 3줄 요약 수준으로만 전달됨.

---

## 2. Phase ↔ 프롬프트 매핑

| Phase | 프롬프트 파일 | 산출물 | 이식 경로 |
| --- | --- | --- | --- |
| **UI-L0** | [`UI-L0-main-shell.md`](../../../NEXA-Platform/v0/prompts/UI-L0-main-shell.md) | MainShell · drawers · status bar | `apps/web/src/frame/` |
| **UI-L1** | [`nexia-shell.md`](../../../NEXA-Platform/v0/prompts/nexia-shell.md) | 7탭 · Left/Right 슬롯 | `domains/nexia/views/` |
| **UI-L2~L4** | [`nexaon-graph-workspace.md`](../../../NEXA-Platform/v0/prompts/nexaon-graph-workspace.md) | NexaonShell · React Flow | `domains/nexia/modules/nexaon/` |
| **UI-L5~** | (후속) `nexaon-run-panel.md` | SSE 타임라인 | TBD |

---

## 3. 원클릭 번들 (UI-L2 예시)

아래 블록 전체를 v0에 붙여넣기:

<details>
<summary>UI-L2 NEXAON Graph — rules + system + task (펼치기)</summary>

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

- [ ] `@v0-mock` 데이터 → hooks/store로 교체
- [ ] 경로 alias `@/domains/nexia/...` 맞춤
- [ ] Content 단일 scroll 규칙 유지
- [ ] semantic color — violation은 `ring-destructive` / status 토큰
- [ ] `v0/history/YYYY-MM/` 에 URL · 채택 기록

---

## 6. 아직 v0로 하지 않는 것

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
| [`07_UIUX NEXAON 레이아웃`](./07_UIUX_NEXAON_MainShell_domains_nexia_레이아웃_v1.0.md) |
| [`05_PRD NEXAON UI 기능 명세`](../05_PRD/05_PRD_NEXAON_UI기능명세_MVPPhaseUI_v1.0.md) |
| [`08_TDD 모노레포 폴더 구조`](../08_TDD/NEXAON/08_TDD_NEXAON_모노레포폴더구조_v1.0.md) |

---

**결론:** **지금 바로** UI-L0 → UI-L1 → UI-L2 순으로 v0 세션을 돌릴 수 있다. 생성물은 `v0/history/`에 기록한 뒤 `apps/web`에 **수동 이식**한다.
