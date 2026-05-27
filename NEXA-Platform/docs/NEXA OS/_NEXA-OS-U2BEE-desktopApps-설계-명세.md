## 📝 제품 요구사항 정의서 (PRD)

프로젝트명: U2BEE (인공지능 기반 투명 오버레이 쇼츠 아카이버)
기술 스택: Python (PyQt6 / QWebEngineView) + Next.js (React / TypeScript) + NestJS + Yjs / Hocuspocus + PostgreSQL (pgvector) + Ollama (로컬 임베딩)

---

## 1. 시스템 개요 및 목적 (Introduction)

## 본 프로그램은 사용자의 웹서핑 및 유튜브 쇼츠 시청 흐름을 방해하지 않으면서, 가치 있는 정보를 라디오처럼 흘려듣고 찰나의 아이디어를 투명 오버레이 UI를 통해 무손실로 수집·분류하는 데스크톱 전용 지식 아카이브 시스템이다. 과거 크롬 확장 프로그램의 브라우저 탭 제약과 유튜브 DOM 변경 취약점을 파이썬 하이브리드 웹뷰 아키텍처로 완전히 극복한다.

## 2. 시스템 아키텍처 (System Architecture)

       [ OS 단 마우스/키보드 이벤트 및 타이머 통제 ]
                           │

┌─────────────────────────▼──────────────────────────┐
│ Python (PyQt6) 백엔드 │
└─────────────┬──────────────────────────────┬───────┘
│ (IPC 통신) │ (Local API)
┌─────────────▼─────────────┐ ┌─────────────▼───────┐
│ 웹뷰 A: 유튜브 쇼츠 재생 │ │ 로컬 Ollama (bge-m3)│
└───────────────────────────┘ └─────────────┬───────┘
┌───────────────────────────┐ │ (유사도 계산)
│ 웹뷰 B: 투명 오버레이 UI │ ┌─────────────▼───────┐
│ (자체 Next.js 프로그램) │ │ 로컬 PostgreSQL DB │
└───────────────────────────┘ └─────────────────────┘

---

## 3. 핵심 기능 요구사항 (Core Features)

## ① 미니멀 투명 오버레이 쌍둥이 웹뷰 (Dual Webview)

- 프레임리스 디자인: 상단 타이틀 바 및 테두리를 완전 제거하여 화면 점유율 최소화.
- Z-Order 레이어 적층: 웹뷰 A(유튜브 쇼츠)를 하단에 깔고, 그 위에 배경이 완벽히 투명한 웹뷰 B(자체 Next.js UI)를 유령처럼 겹쳐 올림.
- 인터랙션 토글: 평소에는 쇼츠 영상만 투명하게 보이다가, 단축키나 마우스 호버 시 Next.js 메모창과 별점 슬라이더가 화면에 렌더링됨.

## ② 유튜브 정책 우회 무한 자동 재생

- 물리 스크롤 주입: 자바스크립트 DOM 제어가 아닌, 파이썬 OS 단에서 웹뷰 A에 직접 마우스 휠 스크롤 신호를 전달하여 유튜브 보안 탐지(어뷰징 봇) 완벽 우회.
- 비디오 타이머 동기화: 웹뷰 A 내부 쇼츠 영상 재생 시간(Duration)을 파이썬이 실시간 감지하여, 영상 종료 0.5초 전 자동으로 다음 쇼츠로 스크롤 전환.

## ③ 마우스 우클릭 스킵 및 인메모리 블랙리스트 채널 필터링

- 우클릭 스킵 레이어: 웹뷰 A 내부 우클릭을 파이썬이 가로채 고유의 컨텍스트 메뉴([이 쇼츠 스킵하기], [채널 차단]) 구동. 유튜브 패치와 상관없이 영구 작동.
- 인메모리 초고속 필터: 프로그램 시작 시 DB에서 비호감 채널 목록을 읽어와 파이썬 RAM(Set 구조)에 상주. 새 쇼츠가 로드되면 0.00001초 만에 업로더를 대조하여 블랙리스트 채널일 경우 인간이 인지하기 전 즉시 강제 스킵.

## ④ 임베딩 점수 기반 카테고리 진화 시스템 (AI 태깅)

- 정보량 한계 극복: 부실한 '유튜브 제목'과 사용자가 작성한 'MEMO'를 백엔드에서 강제 합성하## 📁 [NEXA-Platform] 통합 모노레포 아키텍처 및 파일 구조

기존의 Vue + Quasar 레거시 구조를 완전히 폐기하고, AI 기반 자율 코딩 및 고도화된 아키텍처 안정성을 위해 **TypeScript 기반 단일 모노레포(Monorepo)** 구조로 새롭게 재구성합니다.
이 일환의 첫 단계로 **U2Bee(인공지능 기반 투명 오버레이 쇼츠 아카이버)** 엔진이 메인 서비스 도메인으로 통합 구성됩니다.

### 🛠️ 플랫폼 통합 기술 스택

- **패키지 매니저**: pnpm (워크스페이스 모노레포 관리 최적화)
- **프론트엔드 (Apps)**: Next.js (App Router, TypeScript) + Tailwind CSS + Shadcn UI + Zustand (상태 관리) + Yjs
- **메인 백엔드 (Apps)**: NestJS (TypeScript) + Prisma ORM + PostgreSQL (pgvector 확장 모듈 내장)
- **동기화 서버 (Apps/Modules)**: Node.js 기반 Hocuspocus Server (실시간 CRDT 중계)
- **공유 라이브러리 (Packages)**: `shared/` (프론트-백엔드 간 DTO 및 전역 타입 공유 패키지)

# NEXA OS — `apps/desktop/` 설계 명세 (SSOT)

> **상위 문서**: [`_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략.md`](./_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략.md)

---

## 1. 역할 요약

`apps/desktop/`는 **독립 Python 프로젝트**(`pyproject.toml` + `nexa_desktop/`). pnpm 워크스페이스에는 포함하지 않고, 모노레포 **형제 앱**으로만 둡니다.

| 원칙             | 내용                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **UI SSOT**      | `apps/web` — U2BEE 화면은 PyQt에서 직접 그리지 않고 **QWebEngineView로 Next 라우트 렌더** |
| **데이터 SSOT**  | `apps/backend` — REST·Prisma·블랙리스트·3등급 큐                                          |
| **Desktop 담당** | **PyQt 셸** — OS 이벤트·듀얼 웹뷰·`bridge/nestjs_client`                                  |

---

## 2. 모노레포 내 위치 · 앱별 역할

| 앱                 | 역할                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `apps/web`         | U2BEE **UI 소스**(Next) — `(embed)/u2bee/*`, `U2BeeMinimalLayout` |
| `apps/backend`     | REST API·Prisma·블랙리스트·3등급 큐 (Yjs/Hocuspocus **미포함**)   |
| `apps/sync`        | Hocuspocus 독립 프로세스 — Yjs CRDT WebSocket only                |
| **`apps/desktop`** | **PyQt 셸** — OS·웹뷰·Nest 연동                                   |
| `apps/extension`   | (선택) 동일 embed URL — Desktop이 U2BEE 메인이면 점진 축소        |

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

| 채널                       | 경로                      | 담당                                                                    |
| -------------------------- | ------------------------- | ----------------------------------------------------------------------- |
| **① Python ↔ NestJS**     | `bridge/nestjs_client.py` | 블랙리스트 Pull, 3등급 Edge Pull(현장), Ollama 트리거, 헬스             |
| **② Python ↔ 웹뷰(Next)** | `bridge/web_channel.py`   | OS 제어·토큰·테마·Safety 알림. 비즈니스 API는 웹뷰 B가 Nest 호출 가능   |
| **③ OS 네이티브**          | `native/*`                | 휠 주입, 우클릭 스킵, 0.5초 전 전환, 채널 차단 메뉴 — **반드시 Python** |

| **Grade3**: Desktop이 외부망에서 장비에 MQTT Push하지 않음. 3등급은 **`edge-queue` `edge-pull-sse`** 우선 · GET pull fallback (`nestjs_client` · httpx-sse).

---

## 5. U2BEE — Python vs Next 분담

| 기능                       | 담당                                          |
| -------------------------- | --------------------------------------------- |
| 투명 메모·별점·아카이브 UI | **Next** — `(embed)/u2bee/overlay`, `archive` |
| Tiptap / Yjs 아카이브      | 웹뷰 B → **NestJS**                           |
| 유튜브 휠·0.5초 전 전환    | **Python** → WebView A                        |
| 우클릭 스킵·채널 차단      | **Python** (`native/input_hook.py`)           |
| 블랙리스트 Set             | 시작 시 ① Nest Pull → `blacklist_filter.py`   |
| Ollama 임베딩              | Nest 또는 Python 로컬 (`ai/ollama/`)          |

### WebView B 로드 URL

```text
개발:   http://127.0.0.1:3000/embed/u2bee/overlay?mode=desktop
프로덕션: NEXA_WEB_URL + 동일 경로 (?embed=1 — 헤더·드로어·상태바 숨김)
```

`apps/web`의 `U2BeeMinimalLayout` + `app/(embed)/u2bee/layout.tsx`가 **프레임리스·투명 배경**을 보장합니다. 브라우저 관제용 `(shell)/u2bee/`와 **경로 분리**합니다.

### `apps/web` 측 필수 (Desktop 연동)

| 경로                                 | 역할                      |
| ------------------------------------ | ------------------------- |
| `app/(embed)/u2bee/layout.tsx`       | `U2BeeMinimalLayout`      |
| `app/(embed)/u2bee/overlay/page.tsx` | WebView B — 투명 오버레이 |
| `app/(embed)/u2bee/archive/page.tsx` | 아카이브·Tiptap (선택)    |

---

## 6. QWebChannel IPC (②) 최소 계약

| 방향        | 이벤트 예                                                         |
| ----------- | ----------------------------------------------------------------- |
| JS → Python | `overlayReady`, `requestSkip`, `openArchive`                      |
| Python → JS | `theme`, `safetyAlert`, `commandTracker` 상태, `blacklistUpdated` |

`QWebChannel` + `QWebEnginePage`에 `nexaDesktop` 객체 노출.

---

## 7. 로컬 개발 순서

1. `apps/backend` + `apps/sync` + `apps/web` 기동
2. `.env`: `NEXA_BACKEND_URL`, `NEXA_WEB_URL`
3. `apps/desktop/scripts/dev.ps1` → `python -m nexa_desktop` (제품: `products/u2bee/runner.py`)

---

## 8. 체크리스트 (Desktop · U2BEE)

| 구분      | 필수 경로                                                   | 누락 시                              |
| --------- | ----------------------------------------------------------- | ------------------------------------ |
| Nest 연동 | `nexa_desktop/bridge/nestjs_client.py`                      | 블랙리스트·인증·3등급 Pull 불가      |
| 웹뷰 UI   | `apps/web/.../(embed)/u2bee/overlay` + `U2BeeMinimalLayout` | WebView B 로드할 Next UI 없음        |
| OS 통제   | `nexa_desktop/native/`                                      | PRD 휠·스킵·타이머 웹만으로 불가     |
| IPC       | `bridge/web_channel.py`                                     | Python↔오버레이 상태·스킵 연동 끊김 |

---

## 9. 산출물 (구현 순서)

1. `pyproject.toml` + `nexa_desktop` 패키지 골격
2. `bridge/nestjs_client.py` + `generate_client.py` (OpenAPI → pydantic)
3. `webviews/u2bee/` — 듀얼 WebView + `overlay_view` URL 연동
4. `native/` — input_hook · scroll_injector · blacklist_filter
5. `products/u2bee/runner.py` + `scripts/dev.ps1`
