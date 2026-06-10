# v0 Task — MainShellLayout (UI-L0)

**Phase:** UI-L0  
**Port target:** `apps/web/src/frame/` — see `_file-tree.md` §frame/

---

## Prompt (copy to v0)

Create **MainShellLayout** for NEXA Platform — IDE-style app shell.

### Structure

```tsx
// h-screen flex flex-col overflow-hidden
<AppHeader />           // fixed height ~56px
<div flex-1 min-h-0 flex>
  <LeftDrawer />        // resizable width 240-400px, internal scroll
  <main flex-1 min-h-0 flex flex-col>
    <Content />         // flex-1 overflow-auto — ONLY scroll here
    <SystemStatusBar /> // ~30px compact strip
  </main>
  <RightDrawer />       // resizable 280-480px
</div>
```

### AppHeader

- Left: logo "NEXA" + GlobalMainMenu tabs: Home | Nexia | Nexage | U2BEE (mock, Nexia active)
- Right: theme toggle (light/dark surface only), user avatar, drawer toggle icons

### LeftDrawer / RightDrawer

- Header with title + close button
- `ScrollArea` body with `{children}` slot
- Right edge drag handle (visual only OK)

### SystemStatusBar

- Compact row 30px: Connection dot green, "SYNC 42ms", "REST 18ms", expand chevron
- Click expand → panel 300px with placeholder metrics grid (4 MetricCards)

### useLayoutStore (Zustand sketch)

```ts
leftOpen, rightOpen, leftWidth, rightWidth,
statusBarExpanded, statusBarDetailHeight
```

### DefaultRightPanel

- Simple placeholder: "Select an item"

Use shadcn: Sheet optional for mobile — desktop first.

**Critical:** document.body must not scroll. Add comment block explaining 5 layout rules.

Mock domain content in Content: centered card "Domain content slot".

### Required output files (one TSX block each, with `// @nexa-path:` header)

- `frame/layouts/MainShellLayout.tsx`
- `frame/drawers/LeftDrawer.tsx` · `RightDrawer.tsx`
- `frame/header/AppHeader.tsx`
- `frame/status/SystemStatusBar.tsx`
- `store/useLayoutStore.ts` → suggest `apps/web/src/store/useLayoutStore.ts`
