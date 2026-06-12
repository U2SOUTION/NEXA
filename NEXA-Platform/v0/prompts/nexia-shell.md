# v0 Task — NEXIA Domain Shell (7 tabs)

**Phase:** UI-L1  
**Port target:** `apps/web/src/domains/nexia/` — see `_file-tree.md` §domains/nexia/

---

## Prompt (copy to v0)

Build the **NEXIA domain content shell** inside an existing MainShell (drawers already exist).

### NexiaTabBar

- 7 tabs with `tabId`: `omnix` | `normex` | `logex` | `scribx` | `vivex` | `twinex` | `navex`
- Labels: Omnix, Normex, Logex, Scribx, Vivex, Twinex, Navex
- Active tab underline + `aria-selected`
- URL pattern comment: `/nexia/[tabId]`

### NexiaContent

- Renders TabBar at top (sticky within Content)
- Below: placeholder panel per tab (single line + icon)
- **logex** tab shows extra sub-mode toggle: `Logic` | `Ontology (Nexaon)` — Ontology selected shows badge "Nexaon"

### NexiaLeftNav (left drawer content)

- Changes by active tab (mock `activeTabId` prop)
- **logex + ontology**: ExplorerTree placeholder — sections Project, Classes, Assets, PinMaps, Specs, Runs
- Other tabs: simple 5-item nav list

### NexiaRightPanel (right drawer content)

- Segment control: Props | Chat | Approve | SHACL | Deploy
- Show **Props** by default with empty form fields (label, kind select)

### NexiaStatusBar (bottom strip, 30px)

- Mock: `SYNC 42ms` · `room: ontology:draft` · `nodes: 0`

Use shadcn: Tabs, ScrollArea, Separator, Badge, Button, Select, Input, Resizable (if split).

Mock stores:

```ts
const tabs = ['omnix','normex','logex','scribx','vivex','twinex','navex'] as const
```

Korean tooltips optional. Desktop width 1440px.

### Required output files (`// @nexa-path:` on each)

- `domains/nexia/config/nexiaTabs.ts`
- `domains/nexia/components/NexiaTabBar.tsx` · `NexiaHeaderActions.tsx`
- `domains/nexia/views/content/NexiaContent.tsx`
- `domains/nexia/views/left/NexiaLeftNav.tsx`
- `domains/nexia/views/right/NexiaRightPanel.tsx`
- `domains/nexia/views/status/NexiaStatusBar.tsx`
- `domains/nexia/tabs/logex/LogexTab.tsx` · `NexaonEntry.tsx` (stub import NexaonShell)
- `domains/nexia/store/useNexiaTabStore.ts`
