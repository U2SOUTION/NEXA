# v0 Task — NEXAON Graph Workspace (React Flow)

**Phase:** UI-L2 ~ UI-L4  
**Port target:** `apps/web/src/domains/nexia/modules/nexaon/` + `engines/react-flow/` — see `_file-tree.md`

---

## Prompt (copy to v0)

Build **NexaonShell** — the ontology digital twin workspace (Logex → NEXAON sub-mode).

### Layout (inside Content area, full height, no body scroll)

```text
┌ NexaonToolbar ─────────────────────────────────────────┐
├ GraphCanvas (flex-1) ────────┬ SpecsPreview (32%) ────┤
├ RunPanel (collapsible 180px) ────────────────────────┤
```

Use **ResizablePanelGroup** (horizontal + vertical) or CSS grid with drag handles.

### NexaonToolbar

- Left: Select · Connect · Delete (icon buttons, disabled when no selection)
- Center: graph selector dropdown — `nexaon_ingest`, `nexaon_refine`, `nexaon_export`
- Right: Auto-layout, Fit view, **Run ▶** (primary), Stop

### GraphCanvas (@xyflow/react)

- Install: `@xyflow/react`
- Custom node types (minimal card UI):
  - `class` — blue header
  - `asset` — green
  - `pin` — amber, show `GPIO: 12` subtitle
  - `port` · `sensor` — neutral
- Custom edge: labeled `hasPin`, `connectedTo`
- Background: Dots · Controls · MiniMap (toggle)
- **Mock 6 nodes, 5 edges** — factory IoT example (Motor, ESP32, GPIO4, TempSensor)
- Node with `shaclStatus: 'violation'` → red ring
- Node with `draftSource: 'ai'` → dashed border
- Pan/zoom must NOT scroll the outer Content (use React Flow `preventScrolling`)

### SpecsPreview (right split, collapsible)

- Card with TipTap-like placeholder (textarea styled as rich doc)
- Title: "Normex / Specs preview"
- Collapse button

### RunPanel (bottom)

- Collapsible header: "Run timeline" + chevron
- Mock SSE events list (scroll):
  - `run_started` · `step: extract` · `token: ...` · `shacl_violation` · `run_completed`
- Click violation row → comment `{ focusNodeId }`

### Right drawer panels (separate small components OK)

- **ApprovalGatePanel**: buttons 승인 A (Draft→Audit), 승인 B (→Promoted), 승인 C (ESPHome) — B disabled until SHACL OK mock
- **ShaclViolationsPanel**: 2 mock violations with jump links

Types:

```ts
type NexaonNodeData = {
  label: string
  kind: 'class' | 'asset' | 'pin' | 'port' | 'sensor'
  pinMap?: { gpio: number; mode: string }
  shaclStatus?: 'ok' | 'violation' | 'unknown'
  draftSource?: 'human' | 'ai' | 'import'
}
```

Style: office-light, engineering density, Palantir-inspired. Korean labels for approval buttons.

Do not wire real Yjs or SSE — use React state + mock arrays tagged `// @v0-mock`.

### Required output files (`// @nexa-path:` on each)

**modules/nexaon/**

- `NexaonShell.tsx`
- `views/NexaonToolbar.tsx` · `GraphCanvas.tsx` · `SpecsPreview.tsx` · `RunPanel.tsx`
- `panels/ApprovalGatePanel.tsx` · `ShaclViolationsPanel.tsx` · `NodePropertiesPanel.tsx`
- `store/useNexaonStore.ts`

**engines/react-flow/** (imported by GraphCanvas)

- `nodeTypes/ClassNode.tsx` · `AssetNode.tsx` · `PinNode.tsx`
- `layout/dagreLayout.ts` (stub)

GraphCanvas imports nodeTypes from `@/engines/react-flow/nodeTypes/*` — **do not** define nodeTypes inside GraphCanvas.tsx.
