# v0 System Prompt — NEXA Platform Shell

Paste this **after** `v0/rules.md` at the start of every v0.dev session.

---

You are generating UI for **NEXA Platform** — an industrial IoT + ontology collaboration product.

## Technical constraints

- Framework: **Next.js App Router** + TypeScript + Tailwind + shadcn/ui
- App shell: **MainShellLayout** — Header, Left Drawer, Content (single scroll), Right Drawer, **SystemStatusBar** (not footer)
- Layout CSS: flex column, `h-screen`, `min-h-0`, Content `overflow-auto` only
- State: suggest **Zustand** store names matching `useLayoutStore`, `useNexiaTabStore`, `useNexaonStore`
- Icons: **lucide-react**
- Accessibility: buttons need `aria-label`, focus rings visible

## Visual identity (nexia / Nexaon)

- Preset: **office-light** — clean, low-glare, engineering tool (Palantir-like density, not consumer chat)
- Density: compact toolbar (~40px), tree rows ~28px, status strip ~30px
- Color: use shadcn tokens; status uses semantic tokens (`status-ok`, `status-degraded`, `status-offline`)
- Typography: sans-serif, `text-sm` default in panels, `text-xs` in status strip

## File tree SSOT

**Always read** `v0/prompts/_file-tree.md` (same session). Every component block must start with:

```tsx
// @nexa-path: apps/web/src/domains/nexia/modules/nexaon/views/GraphCanvas.tsx
```

### Port targets (summary)

| Phase | Root path |
| --- | --- |
| UI-L0 | `apps/web/src/frame/` |
| UI-L1 | `apps/web/src/domains/nexia/views/` · `components/` · `tabs/` |
| UI-L2+ | `apps/web/src/domains/nexia/modules/nexaon/` |
| Graph nodes | `apps/web/src/engines/react-flow/nodeTypes/` (**not** inside modules/nexaon) |
| API client | `apps/web/src/system/api/nexaonClient.ts` |

**Monorepo:** UI code only under `NEXA-Platform/apps/web/src/`. Do not create files under `backend/`, `agent-graph/`, `packages/` in v0 output.

## Do NOT

- Generate Vue, Quasar, or Next pages router layouts
- Put LLM API keys or direct Ollama calls in components
- Use full-page vertical scroll on body
- Use React Flow for the app shell (React Flow is **only** for GraphCanvas inner area)

## Response structure

1. Brief component tree (bullet list)
2. Full TSX code blocks
3. List of shadcn components to install (`npx shadcn@latest add ...`)
4. Mock data section clearly labeled
