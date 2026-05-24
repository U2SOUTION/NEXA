# NEXA OS — `apps/desktop/` 설계 명세 (SSOT)

> **상위 문서**: [`_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략.md`](./_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략.md)  
> **관련 PRD**: [`U2BEE (인공지능 기반 투명 오버레이 쇼츠 아카이버).MD`](./U2BEE%20(인공지능%20기반%20투명%20오버레이%20쇼츠%20아카이버).MD)

---

## 1. 역할 요약

`apps/desktop/`는 **독립 Python 프로젝트**(`pyproject.toml` + `nexa_desktop/`). pnpm 워크스페이스에는 포함하지 않고, 모노레포 **형제 앱**으로만 둡니다.

| 원칙 | 내용 |
|------|------|
| **UI SSOT** | `apps/web` — U2BEE 화면은 PyQt에서 직접 그리지 않고 **QWebEngineView로 Next 라우트 렌더** |
| **데이터 SSOT** | `apps/backend` — REST·Prisma·블랙리스트·3등급 큐 |
| **Desktop 담당** | **PyQt 셸** — OS 이벤트·듀얼 웹뷰·`bridge/nestjs_client` |

---

## 2. 모노레포 내 위치 · 앱별 역할

| 앱 | 역할 |
|----|------|
| `apps/web` | U2BEE **UI 소스**(Next) — `(embed)/u2bee/*`, `U2BeeMinimalLayout` |
| `apps/backend` | REST API·Prisma·블랙리스트·3등급 큐 (Yjs/Hocuspocus **미포함**) |
| `apps/sync` | Hocuspocus 독립 프로세스 — Yjs CRDT WebSocket only |
| **`apps/desktop`** | **PyQt 셸** — OS·웹뷰·Nest 연동 |
| `apps/extension` | (선택) 동일 embed URL — Desktop이 U2BEE 메인이면 점진 축소 |

---

## 3. 폴더 구조

```yaml
apps/desktop/
├── pyproject.toml               # (또는 requirements.txt) — pnpm 워크스페이스 외부
├── README.md
├── .env.example                 # NEXA_BACKEND_URL, NEXA_WEB_URL
├── nexa_desktop/                # Python 패키지 (python -m nexa_desktop)
│   ├── __main__.py
│   ├── app.py                   # QApplication 진입
│   ├── config/
│   │   └── settings.py
│   ├── bridge/                  # ① NestJS · ② 웹뷰(Next) IPC
│   │   ├── nestjs_client.py     # REST/WS → apps/backend
│   │   ├── auth.py              # JWT 저장·갱신
│   │   ├── web_channel.py       # QWebChannel ↔ JS (nexaDesktop)
│   │   └── dto/                 # OpenAPI 생성 pydantic (shared 미러)
│   ├── webviews/
│   │   ├── base_webview.py
│   │   └── u2bee/
│   │       ├── shell.py         # 듀얼 웹뷰 Z-order·프레임리스
│   │       ├── youtube_view.py  # WebView A (youtube.com)
│   │       └── overlay_view.py  # WebView B → /embed/u2bee/overlay
│   ├── native/                  # ③ OS 통제 (PRD 핵심)
│   │   ├── input_hook.py
│   │   ├── scroll_injector.py
│   │   └── blacklist_filter.py
│   ├── products/
│   │   ├── u2bee/runner.py
│   │   └── screendraw/          # ScreenDraw 제품
│   └── tray/
│       └── tray_controller.py
├── assets/
└── scripts/
    ├── dev.ps1                  # backend+sync+web 기동 후 desktop 실행
    └── generate_client.py       # Nest OpenAPI → bridge/dto
```

**DTO 공유**: `packages/shared` TypeScript를 Python이 직접 import할 수 없음 → Nest **OpenAPI** → `scripts/generate_client.py` → `bridge/dto/` pydantic.

---

## 4. 통신 3갈래

```text
                    ┌─────────────────┐
                    │  apps/backend   │  NestJS (REST / WS)
                    └────────▲────────┘
                             │ ① HTTP/WS (JWT) — nestjs_client.py
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────┴────────┐     │     ┌────────┴────────┐
     │ apps/desktop    │     │     │ apps/web        │
     │ Python          │     │     │ (WebView B 내부) │
     └────────┬────────┘     │     └────────▲────────┘
              │ ② QWebChannel │     fetch / WS → backend
              │  web_channel  │     http://127.0.0.1:3000/embed/u2bee/overlay
              └───────────────┼──────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ QWebEngineView B  │  Next 오버레이 UI
                    └───────────────────┘
              ┌─────────────────────────┐
              │ QWebEngineView A        │  YouTube (외부)
              └─────────────────────────┘
              Python native/ — ③ 휠·우클릭·타이머·블랙리스트 RAM 필터
```

| 채널 | 경로 | 담당 |
|------|------|------|
| **① Python ↔ NestJS** | `bridge/nestjs_client.py` | 블랙리스트 Pull, 3등급 Edge Pull(현장), Ollama 트리거, 헬스 |
| **② Python ↔ 웹뷰(Next)** | `bridge/web_channel.py` | OS 제어·토큰·테마·Safety 알림. 비즈니스 API는 웹뷰 B가 Nest 호출 가능 |
| **③ OS 네이티브** | `native/*` | 휠 주입, 우클릭 스킵, 0.5초 전 전환, 채널 차단 메뉴 — **반드시 Python** |

**Grade3**: Desktop이 외부망에서 장비에 MQTT Push하지 않음. 3등급은 **`edge-queue` Pull**만 (`nestjs_client` 경로 분리).

---

## 5. U2BEE — Python vs Next 분담

| 기능 | 담당 |
|------|------|
| 투명 메모·별점·아카이브 UI | **Next** — `(embed)/u2bee/overlay`, `archive` |
| Tiptap / Yjs 아카이브 | 웹뷰 B → **NestJS** |
| 유튜브 휠·0.5초 전 전환 | **Python** → WebView A |
| 우클릭 스킵·채널 차단 | **Python** (`native/input_hook.py`) |
| 블랙리스트 Set | 시작 시 ① Nest Pull → `blacklist_filter.py` |
| Ollama 임베딩 | Nest 또는 Python 로컬 (`ai/ollama/`) |

### WebView B 로드 URL

```text
개발:   http://127.0.0.1:3000/embed/u2bee/overlay?mode=desktop
프로덕션: NEXA_WEB_URL + 동일 경로 (?embed=1 — 헤더·드로어·상태바 숨김)
```

`apps/web`의 `U2BeeMinimalLayout` + `app/(embed)/u2bee/layout.tsx`가 **프레임리스·투명 배경**을 보장합니다. 브라우저 관제용 `(shell)/u2bee/`와 **경로 분리**합니다.

### `apps/web` 측 필수 (Desktop 연동)

| 경로 | 역할 |
|------|------|
| `app/(embed)/u2bee/layout.tsx` | `U2BeeMinimalLayout` |
| `app/(embed)/u2bee/overlay/page.tsx` | WebView B — 투명 오버레이 |
| `app/(embed)/u2bee/archive/page.tsx` | 아카이브·Tiptap (선택) |

---

## 6. QWebChannel IPC (②) 최소 계약

| 방향 | 이벤트 예 |
|------|-----------|
| JS → Python | `overlayReady`, `requestSkip`, `openArchive` |
| Python → JS | `theme`, `safetyAlert`, `commandTracker` 상태, `blacklistUpdated` |

`QWebChannel` + `QWebEnginePage`에 `nexaDesktop` 객체 노출.

---

## 7. 로컬 개발 순서

1. `apps/backend` + `apps/sync` + `apps/web` 기동  
2. `.env`: `NEXA_BACKEND_URL`, `NEXA_WEB_URL`  
3. `apps/desktop/scripts/dev.ps1` → `python -m nexa_desktop` (제품: `products/u2bee/runner.py`)

---

## 8. 체크리스트 (Desktop · U2BEE)

| 구분 | 필수 경로 | 누락 시 |
|------|-----------|---------|
| Nest 연동 | `nexa_desktop/bridge/nestjs_client.py` | 블랙리스트·인증·3등급 Pull 불가 |
| 웹뷰 UI | `apps/web/.../(embed)/u2bee/overlay` + `U2BeeMinimalLayout` | WebView B 로드할 Next UI 없음 |
| OS 통제 | `nexa_desktop/native/` | PRD 휠·스킵·타이머 웹만으로 불가 |
| IPC | `bridge/web_channel.py` | Python↔오버레이 상태·스킵 연동 끊김 |

---

## 9. 산출물 (구현 순서)

1. `pyproject.toml` + `nexa_desktop` 패키지 골격  
2. `bridge/nestjs_client.py` + `generate_client.py` (OpenAPI → pydantic)  
3. `webviews/u2bee/` — 듀얼 WebView + `overlay_view` URL 연동  
4. `native/` — input_hook · scroll_injector · blacklist_filter  
5. `products/u2bee/runner.py` + `scripts/dev.ps1`
