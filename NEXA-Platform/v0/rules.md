# NEXA v0 — Semantic Layer Rules (SSOT for AI UI generation)

> v0.dev · Cursor · 기타 UI 생성 AI에 **최우선 주입**.  
> 충돌 시: [`08_TDD_NEXAOS_설계표준_미션크리티컬전략`](../../NEXA%20V2.0/docs/08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) §Theme · [`07_UIUX_NEXIA_MainShell_레이아웃_v1.0`](../../NEXA%20V2.0/docs/07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) 우선.

---

## 1. Stack (fixed)

- **Next.js 14+** App Router · **TypeScript** · **React 18+**
- **Tailwind CSS** + **shadcn/ui** (Radix)
- **@xyflow/react** for graph canvas only — not for app shell layout
- **No** Vue · Quasar · pages router · inline `style={{}}` for layout shell

---

## 2. Layout — MainShell 5 rules

1. `body` / root: **no page scroll** — `h-screen overflow-hidden`
2. **Content** slot only: `flex-1 min-h-0 overflow-auto`
3. Left/Right drawers: **internal** `overflow-y-auto`
4. **No global `<footer>`** — bottom = `SystemStatusBar` (~30px)
5. Drawer open/width: **Zustand** `useLayoutStore` — not local useState only

---

## 3. Theme — 3 layers

| Layer | Rule |
| --- | --- |
| **① Semantic** | `--status-ok`, `--safety-critical`, `--status-degraded`, `--status-offline` — **never override** with `bg-primary` |
| **② Surface** | shadcn `bg-background`, `border`, `text-foreground` |
| **③ Preset** | nexia → `office-light` · nexage → `power-grid` |

**SHACL violation** → `ring-2 ring-destructive` or semantic `--command-failed`  
**AI draft node** → dashed border · `border-dashed`  
**SYNC offline** → `text-status-offline` in status strip

---

## 4. Import boundaries (generated code)

- UI may import: `@/components/ui/*`, `@/lib/utils`, lucide-react
- Domain: `@/domains/nexia/...` · `@/frame/...`
- Graph primitives: `@/engines/react-flow/nodeTypes/*` — **only from** `modules/nexaon/views/GraphCanvas.tsx`
- API (later): `@/system/api/nexaonClient` — **never** fetch Ollama/vLLM/agent-graph from browser
- Types (later): `@nexa/shared/schemas/nexaon` — v0 may inline types with `// align shared`
- **Do not** import `@prisma/client` · neo4j · `apps/backend` · `apps/agent-graph`
- **engines/ → domains/** reverse import **forbidden**
- Mock data OK — mark `// @v0-mock`
- Every file: **`// @nexa-path: apps/web/src/...`** header (see `_file-tree.md`)

---

## 5. Output format (v0)

- Single file or small component tree with **"use client"** where needed
- Use **placeholder data** — no backend required in v0 pass
- Include **responsive notes** as comments — MVP desktop ≥1280px first
- Korean UI labels OK · code/comments English preferred

---

## 6. Adoption workflow

```text
v0 output → v0/history/ (URL + snapshot)
         → manual port → apps/web/src/frame/ | domains/nexia/
         → delete @v0-mock → wire real hooks
```

**Never** auto-merge v0 output into `apps/web` without review.
