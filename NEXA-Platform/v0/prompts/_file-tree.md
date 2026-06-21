# v0 File Tree SSOT — apps/web (nexia UI)

Paste with `_system.md`. Generated components **must use these paths** in comments and export structure.

> SSOT: `NEXA V2.0/docs/08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md` · `NEXA V2.0/docs/07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md`

---

## Monorepo context (do not generate code here)

```text
NEXA-Platform/                    # pnpm workspace root
├── apps/web/                     # ★ v0 output ports HERE only (UI phase)
├── apps/backend/                 # Nest — no UI code in v0
├── apps/sync/                    # Hocuspocus — no UI
├── apps/agent-graph/             # Python LangGraph — no UI
├── packages/shared/              # Zod types — import types only, no duplicate schemas
└── v0/                           # prompts · history (not runtime)
```

---

## App Router

```text
apps/web/src/app/
├── layout.tsx
├── (auth)/login/ · register/
└── (shell)/
    ├── layout.tsx                # MainShellLayout
    └── nexia/
        ├── layout.tsx            # optional NexiaProvider
        ├── page.tsx
        └── [tabId]/
            └── page.tsx          # /nexia/logex · /nexia/omnix …
        └── logex/
            └── ontology/
                └── [[...projectId]]/page.tsx   # /nexia/logex/ontology/{projectId}
```

---

## frame/ — platform shell (UI-L0)

```text
apps/web/src/frame/
├── navigation/globalMenu.ts
├── registry/
│   ├── domainLayoutRegistry.ts   # nexia slot lazy imports
│   └── layoutRegistry.ts
├── layouts/MainShellLayout.tsx
├── drawers/LeftDrawer.tsx · RightDrawer.tsx · DrawerResizeHandle.tsx
├── header/AppHeader.tsx · GlobalMainMenu.tsx · GlobalNavbarRight.tsx
├── status/SystemStatusBar.tsx · StatusPanelHost.tsx · panels/*
└── views/common/DefaultRightPanel.tsx · DefaultStatusPanel.tsx
```

**Rule:** `frame/` has **no business logic** — hosts registry slots only.

---

## domains/nexia/ — domain shell (UI-L1)

```text
apps/web/src/domains/nexia/
├── config/nexiaTabs.ts           # 7 tabId SSOT
├── components/
│   ├── NexiaHeaderActions.tsx
│   └── NexiaTabBar.tsx
├── views/
│   ├── left/NexiaLeftNav.tsx
│   ├── content/NexiaContent.tsx
│   ├── right/NexiaRightPanel.tsx
│   └── status/NexiaStatusBar.tsx · NexiaStatusPanel.tsx
├── tabs/
│   ├── omnix/OmnixTab.tsx
│   ├── normex/NormexTab.tsx
│   ├── logex/
│   │   ├── LogexTab.tsx
│   │   └── NexaonEntry.tsx       # mounts NexaonShell when subMode=ontology
│   ├── scribx/ · vivex/ · twinex/ · navex/
├── hooks/useNexiaTab.ts · useNexiaContext.ts
└── store/useNexiaTabStore.ts     # activeTabId · logexSubMode
```

**Rule:** `domainKey` stays **`nexia`** — **Nexaon** (`modules/nexaon/`) is **module**, not a separate domain.

---

## modules/nexaon/ — ontology workspace (UI-L2~)

```text
apps/web/src/domains/nexia/modules/nexaon/
├── NexaonShell.tsx               # Toolbar + split layout host
├── index.ts
├── views/
│   ├── NexaonToolbar.tsx
│   ├── GraphCanvas.tsx           # @xyflow/react host ONLY
│   ├── SpecsPreview.tsx
│   ├── RunPanel.tsx
│   ├── DiffOverlay.tsx
│   └── EsphomeDeploy.tsx
├── panels/
│   ├── ExplorerTree.tsx          # used inside NexiaLeftNav when Nexaon (ontology)
│   ├── NodePropertiesPanel.tsx
│   ├── RunChatPanel.tsx
│   ├── ApprovalGatePanel.tsx
│   ├── ShaclViolationsPanel.tsx
│   └── DeployPanel.tsx
├── hooks/
│   ├── useNexaonYjs.ts
│   ├── useNexaonGraph.ts
│   ├── useNexaonRun.ts
│   └── useNexaonWikilink.ts
└── store/useNexaonStore.ts
```

**Rule:** React Flow **nodeTypes/edgeTypes** live in `engines/`, not here:

```text
apps/web/src/engines/react-flow/
├── nodeTypes/                    # ClassNode.tsx · AssetNode.tsx · PinNode.tsx …
├── edgeTypes/
└── layout/dagreLayout.ts
```

---

## engines/ · system/ — shared client (import only)

```text
apps/web/src/engines/
├── react-flow/                   # ★ graph primitives — NO domain UI
├── tiptap/
├── hocuspocus/useOntologyRoom.ts
├── web-serial.ts
└── api-client.ts

apps/web/src/system/
├── api/nexaonClient.ts           # Nest REST · POST /nexaon/runs
└── styles/tokens/                # semantic.css · presets/office-light.css
```

**Import rule:** `domains/*` → `engines/*` ✅ · `engines/*` → `domains/*` ❌

---

## packages/shared (types reference only in v0)

```text
packages/shared/src/schemas/nexaon/ontology-node.schema.ts
packages/shared/src/schemas/agent-graph/run-request.schema.ts
packages/shared/src/yjs/nexaon.keys.ts    # ontology:draft · run:timeline
```

v0: duplicate types inline with comment `// align with @nexa/shared/schemas/nexaon`

---

## Component → file mapping (v0 must comment on each file)

| Component | Output path |
| --- | --- |
| MainShellLayout | `frame/layouts/MainShellLayout.tsx` |
| NexiaTabBar | `domains/nexia/components/NexiaTabBar.tsx` |
| NexaonShell | `domains/nexia/modules/nexaon/NexaonShell.tsx` |
| GraphCanvas | `domains/nexia/modules/nexaon/views/GraphCanvas.tsx` |
| ClassNode | `engines/react-flow/nodeTypes/ClassNode.tsx` |
| useNexaonStore | `domains/nexia/modules/nexaon/store/useNexaonStore.ts` |

---

## URL · state

- Route: `/nexia/logex/ontology/{projectId}`
- Yjs room (later): `project:{projectId}:ontology:draft`
- API (later): `system/api/nexaonClient.ts` → Nest → agent-graph
