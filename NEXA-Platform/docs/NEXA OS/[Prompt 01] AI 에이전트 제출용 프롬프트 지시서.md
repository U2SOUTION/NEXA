## 📝 AI 에이전트 제출용 프롬프트 지시서 (복사하여 사용)

> 아래 **「복사용 전체 프롬프트」** 블록을 통째로 에이전트에 붙여 넣으면 됩니다.  
> 상세 폴더 트리는 본 문서 하단 **「NEXA OS V2.1」** 섹션을 SSOT로 참조하도록 명시되어 있습니다.

### 복사용 전체 프롬프트

```markdown
## 프로젝트

**이름**: 하이브리드 망 분리 구조의 실시간 IoT 관제 플랫폼 (NEXA OS)

**목표**: TypeScript 모노레포 — Next.js + NestJS + **독립 Hocuspocus(`apps/sync`)** + 공유 DTO

**작업 순서**: Implementation Plan을 먼저 제시한 뒤, 승인 없이도 1단계 골격 코드 생성 가능. 단, 폴더 구조는 아래 규격을 따를 것.

---

## 1. 기술 스택

| 계층           | 스택                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| Frontend       | Next.js (App Router, TypeScript), Tailwind CSS, Shadcn UI                                     |
| Frontend State | Zustand + Yjs (`yjs`, `@hocuspocus/provider`) — **에디터↔Yjs 양방향, IoT/UI→Zustand 단방향** |
| Backend        | NestJS (TypeScript) — REST only, **Hocuspocus 금지**                                          |
| Realtime Sync  | `@hocuspocus/server` — **`apps/sync/` 독립 Node.js 프로세스** (Nest 내부 통합 금지)           |
| 공유 타입      | `packages/shared` — web · backend · sync 공통 (DTO, commands, yjs/map-keys)                   |
| DB             | Prisma + PostgreSQL (pgvector 확장 자리)                                                      |

---

## 2. 모노레포 골격 (필수 경로)
```

apps/web/ # Next.js
apps/backend/ # NestJS (REST · Prisma)
apps/sync/ # Hocuspocus — 순수 Node.js (Yjs WebSocket)
apps/desktop/ # Python(PyQt) — `_NEXA-OS-apps-desktop-설계-명세.md`
packages/shared/ # web · backend · sync 공통 타입
database/ # schema.prisma, docker

```

`apps/web/src` 내부 레이어:

- `app/` — 라우트만 (얇게)
- `frame/` — 레이아웃 셸, 전역 메뉴, 드로어, domainLayoutRegistry
- `domains/{domain}/views/{left,content,right}/` — 도메인 UI
- `domains/{domain}/components/` — 도메인 전용 컴포넌트
- `components/ui/` — Shadcn 원자 컴포넌트만 (도메인 무관)
- `workers/telemetryProcessor.ts` — 일반 Telemetry Web Worker
- `engines/` — websocket, **socketEmitter**, **commandTracker**, **healthWatchdog**
- `packages/shared/src/time-sync.ts` — 감사·명령 타임스탬프 SSOT
- `hooks/` — useHocuspocus, useYjsSync, useDomainLayout
- `store/` — useSafetyStore, useTelemetryStore, useLayoutStore, useUiStore
- `guards/authGuard.ts` — 2등급 MFA 등

---

## 3. UI 레이아웃 (반드시 준수)

1. **Header — 전역 내비**: `frame/navigation/globalMenu.ts` + `GlobalMainMenu` — Home / Nexia / Dashboard 등 **도메인 전환 탭**
2. **Header — 우측**: 드로어 토글, 테마, `domainLayoutRegistry.headerActions` 슬롯
3. **Left Drawer**: 전역 메뉴가 아님. **현재 도메인**의 서브 내비 (`domains/*/views/left/*LeftNav`)
4. **Right Drawer**: **현재 도메인** 넥셋·속성 패널 (`domains/*/views/right/*RightPanel`)
5. **Content**: `domains/*/views/content/*`
6. `domainLayoutRegistry`: `domainKey → { left, content, right, headerActions, statusBar?, statusPanel? }`
7. **시스템 상태바**: `SystemStatusBar` — 평상시 **30px**, 상세 **≥300px** (`useLayoutStore`, Footer 없음)

---

## 4. 데이터·상태 역할 분리

### Yjs vs Zustand (무한 루프 방지)

| 계층 | 대상 | 흐름 |
|------|------|------|
| **에디터** | Tiptap, Monaco, Rivet | **Yjs ↔ 에디터** 양방향 직접 바인딩 (Zustand 금지) |
| **일반 UI·IoT** | 차트, Safety/Telemetry, 드로어·테마 | **Yjs → observe → Zustand** 단방향만 |

- **Yjs**: `Y.Doc` CRDT·Awareness. 일반 React UI 직접 렌더 금지.
- **Zustand**: `ydoc.getMap(...).observe` → `ingest` → 선택적 re-render. **Zustand→Y.Doc 역쓰기 금지.**
- **`useYjsSync`**: IoT `telemetry`/`safety` 맵만 — **에디터 CRDT에 사용 금지.**

### IoT Mission-Critical (본 문서 §미션 크리티컬 참고)

- 긴급·안전·제어: `useSafetyStore` + `engines/socketEmitter.ts` (렌더 우회)
- **채널 B** 일반 텔레메트리: `engines/websocket.ts` → `workers/telemetryProcessor.ts` → `useTelemetryStore` → `useTransition`(200~500ms 버퍼) — **메인 스레드에서 WS onmessage 직접 처리 금지**
- **채널 A** Y.Map: `hooks/useYjsSync.ts` → Safety / Telemetry 스토어 **단방향**

---

## 5. 보안 — 제어 명령 3등급

| 등급 | 예 | 구현 요구 |
|------|-----|-----------|
| 🟢 1등급 | 조회, Tiptap 편집, 레이아웃 | **`apps/sync`** `onAuthenticate` JWT + ReadOnly 스코프 |
| 🟡 2등급 | 원격 재부팅, 알림 임계치 | `guards/authGuard` MFA + `audit-log.interceptor` |
| 🔴 3등급 | 전원 차단, 밸브 | Yjs/외부 WS로 직접 하달 불가. Edge **Pull** 큐 API만 (`edge-queue` 모듈) |

추가: **`apps/sync`** `onStoreDocument` XSS·스키마 검증 훅. JWT 검증은 `apps/backend/modules/auth` REST 호출.

---

## 6. 산출물 (순서대로)

1. 모노레포 폴더 트리 + `pnpm-workspace.yaml` (web · backend · sync · shared)
2. `packages/shared` — `commands/`, `dtos/`, `yjs/map-keys` (등급·DTO·Y.Map 키 SSOT)
3. `apps/sync` — Hocuspocus `server.ts`, `onAuthenticate`, `onStoreDocument` (Nest **미사용**)
4. `apps/backend` — modules: `auth`, `devices`, `control`, `edge-queue`, `common/guards`, `common/interceptors`
5. `apps/web` — `MainShellLayout`, `globalMenu`, `domainLayoutRegistry`, `LeftDrawer`/`RightDrawer`
6. Worker + `useSafetyStore` / `useTelemetryStore` + `useYjsSync`(IoT 맵 단방향) + Tiptap Yjs binding 예시
7. NestJS 1·2·3등급 Guard/Interceptor 분기 뼈대
8. `apps/desktop` — [`_NEXA-OS-apps-desktop-설계-명세.md`](./_NEXA-OS-apps-desktop-설계-명세.md) §9 산출물 순서
9. `apps/web` — `app/(embed)/u2bee/overlay` + `U2BeeMinimalLayout` (Desktop·Extension 공용)

**타입**: web · backend · sync는 `packages/shared`만 import하여 DTO 공유. Desktop은 **OpenAPI 생성 pydantic**. 도메인 간 cross-import 금지. **Nest에 `@hocuspocus/server` 임베드 금지.**

코딩 전 **Implementation Plan**을 먼저 출력하라.
```
