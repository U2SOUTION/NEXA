# v0/history — 생성 이력 아카이브

> CI·pnpm workspace **미포함**. v0.dev paste · export 스냅샷 · 채택 여부만 기록.

## 기록 규칙

| 필드 | 필수 |
| --- | --- |
| 날짜 | `YYYY-MM-DD` |
| Phase | UI-L0 ~ UI-L7 |
| 프롬프트 | `v0/prompts/{file}.md` 링크 |
| v0 URL | v0.dev 공유 링크 |
| 채택 | `yes` / `partial` / `no` |
| 이식 경로 | `apps/web/src/...` |

## 파일命名

```text
history/YYYY-MM/YYYY-MM-DD_UI-L2_nexaon-graph.md
history/YYYY-MM/snapshots/YYYY-MM-DD_nexaon-shell.tsx.txt
```

## 템플릿

```markdown
# 2026-06-04 — UI-L2 nexaon-graph-workspace

- **URL:** https://v0.dev/chat/...
- **Prompt:** v0/prompts/nexaon-graph-workspace.md
- **Adopted:** partial — GraphCanvas only → modules/nexaon/views/GraphCanvas.tsx
- **Notes:** RunPanel layout tweaked for ResizablePanelGroup
```
