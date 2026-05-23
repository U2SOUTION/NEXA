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

---

### 📂 [NEXA-Platform] U2Bee 모노레포 폴더 구조

nexa-platform/
├── apps/
│ │
│ ├── 🐍 [통합 파이썬 엔진 - 단 하나만 존재]
│ │ └── nexa-desktop/ # Python PyQt6 (U2BEE OS 통제 + IoT 엣지 통신 통합 앱)
│ │
│ ├── 🎬 [U2BEE 웹 구역]
│ │ ├── u2bee-web/ # Next.js (투명 오버레이 UI 및 아카이브 대시보드)
│ │ └── u2bee-api/ # NestJS (Ollama, Yjs, 쇼츠 백엔드)
│ │
│ └── 🌐 [IoT 웹 구역 (미래)]
│ ├── iot-web/ # Next.js (IoT 대시보드 화면)
│ └── iot-api/ # NestJS (MQTT 및 센서 데이터 백엔드)
│
├── shared/ (모노레포 공통 소스코드)
│ ├── types/
│ │ ├── u2bee/ # U2BEE 전용 타입 (쇼츠, 메모 규격)
│ │ └── iot/ # IoT 전용 타입 (센서 데이터 규격)
│ └── tsconfig/
│
├── package.json
└── turbo.json

---

### 📂 NEXA-Platform 모노레포 파일 구조

```text
nexa-platform/
├── apps/
│   ├── frontend/                       # 🖥️ [Next.js] 통합 프론트엔드 앱
│   │   ├── .v0/                        # 🤖 v0.dev 등 외부 AI 생성 툴과의 연동 히스토리
│   │   ├── src/
│   │   │   ├── app/                    # 🌐 Next.js App Router
│   │   │   │   ├── layout.tsx          # 전역 레이아웃 및 테마/폰트 바인딩
│   │   │   │   ├── page.tsx            # NEXA 통합 메인 관제 대시보드
│   │   │   │   ├── shorts/             # 📺 [U2Bee] 유튜브 쇼츠 투명 오버레이 제어 페이지
│   │   │   │   │   └── page.tsx
│   │   │   │   └── archive/            # 📚 [U2Bee] 지식 아카이브 및 플레이박스 관리 페이지
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── components/             # 🎨 [UI 컴포넌트 레이어]
│   │   │   │   ├── ui/                 # ✨ Shadcn UI 원자(Atomic) 컴포넌트
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   └── slider.tsx
│   │   │   │   ├── dashboard/          # 대시보드 위젯 컴포넌트
│   │   │   │   ├── shorts/             # 📺 [U2Bee] 쇼츠용 투명 오버레이 및 제어 컴포넌트
│   │   │   │   │   ├── TransparentMemo.tsx
│   │   │   │   │   └── RatingSlider.tsx
│   │   │   │   └── archive/            # 📚 [U2Bee] 아카이브 및 플레이박스 관리 컴포넌트
│   │   │   │       ├── PlayboxQueue.tsx
│   │   │   │       └── KnowledgeList.tsx
│   │   │   │
│   │   │   ├── hooks/                  # 🎣 공통 커스텀 훅
│   │   │   │   ├── useHocuspocus.ts    # Hocuspocus 실시간 문서 동기화 연결 훅
│   │   │   │   └── useYjsSync.ts       # Yjs 데이터 변경 이벤트 바인딩 훅
│   │   │   │
│   │   │   ├── store/                  # 🎯 [Zustand] 화면 제어 스토어
│   │   │   │   ├── useUiStore.ts       # 다크모드, 레이아웃 등 순수 로컬 UI 상태 스토어
│   │   │   │   ├── useShortsStore.ts   # 쇼츠 재생 상태, 일시정지, 블랙리스트 로컬 스토어
│   │   │   │   └── useArchiveStore.ts  # 아카이브 리스트, 플레이박스 큐 임시 버퍼 스토어
│   │   │   │
│   │   │   └── lib/                    # 공통 유틸리티 (`utils.ts`)
│   │   │
│   │   ├── tailwind.config.ts          # 테마 및 일관된 스타일링 규격
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/                        # ⚙️ [NestJS] 통합 메인 백엔드 앱
│       ├── src/
│       │   ├── app.module.ts           # 🧠 백엔드 전체 모듈 총괄 관제탑
│       │   ├── main.ts                 # NestJS 서버 및 WebSocket 시작점
│       │   │
│       │   ├── modules/                # 🧩 도메인 단위 독립 모듈
│       │   │   ├── hocuspocus/         # 🔄 Yjs 실시간 충돌 문서 중계 모듈
│       │   │   │   ├── hocuspocus.module.ts
│       │   │   │   ├── hocuspocus.server.ts # 실시간 문서 동기화 코어 서버
│       │   │   │   └── hocuspocus.service.ts # 1등급 JWT ReadOnly 권한 검증 및 제어
│       │   │   │
│       │   │   ├── ai-agent/           # 🤖 Ollama 로컬 임베딩 및 카테고리 자율 진화 모듈
│       │   │   │   ├── ai-agent.module.ts
│       │   │   │   └── ai-agent.service.ts # bge-m3 임베딩 코사인 유사도 분석 (임계치 0.7 제어)
│       │   │   │
│       │   │   ├── shorts/             # 📺 [U2Bee] 쇼츠 제어 및 OS 물리 입력 큐 관리 모듈
│       │   │   │   ├── shorts.module.ts
│       │   │   │   ├── shorts.controller.ts
│       │   │   │   └── shorts.service.ts   # 인메모리(RAM) 블랙리스트 필터링 및 3등급 큐 적재
│       │   │   │
│       │   │   └── archive/            # 📚 [U2Bee] 지식 DB CRUD 및 플레이박스 관리 모듈
│       │   │       ├── archive.module.ts
│       │   │       ├── archive.controller.ts
│       │   │       └── archive.service.ts  # pgvector 저장 및 백업용 JSON 파일 I/O
│       │   │
│       │   ├── common/                 # 🛡️ 공통 보안 및 미들웨어
│       │   │   ├── guards/             # 2등급 소프트 제어 접근용 MFA Guard
│       │   │   └── interceptors/       # 2등급 소프트 제어용 Audit Log Interceptor
│       │   │
│       │   └── database/               # 🗄️ PostgreSQL 연결 및 마이그레이션
│       │       ├── prisma/
│       │       └── schema.prisma       # pgvector 확장 테이블 및 DDL 스키마
│       │
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                           # 📦 공유 패키지 레이어 (앞뒤 데이터 싱크용)
│   └── shared/
│       ├── src/
│       │   ├── types/                  # 🤝 프론트-백엔드 공동 사용 데이터 타입
│       │   │   ├── shorts.dto.ts       # 쇼츠 메타데이터 및 스킵/차단 구조 정의
│       │   │   ├── archive.dto.ts      # 아카이빙 메모, 평점 점수, 벡터 구조 정의
│       │   │   └── command.dto.ts      # 제어 명령 등급 정의 및 마우스 물리 좌표 구조 정의
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── pnpm-workspace.yaml                 # pnpm 모노레포 워크스페이스 정의
├── docker-compose.yml                  # 로컬 PostgreSQL, pgvector, Ollama 등 통합 구동 환경
├── tsconfig.json                       # 전역 엄격한 컴파일 규칙
└── package.json                        # 루트 의존성 설정
```

### 💡 AI 플랫폼 통제를 위한 최종 구조 설계 포인트

1.  src/components/ui/Base\* 컨벤션의 영구 장착:
    Next.js 프론트엔드 내부의 components/ui/ 폴더 안에는 오직 Shadcn UI 기반의 뼈대 양식만 들어갑니다. AI 생성 툴인 v0.dev가 코드를 짜줄 때 이 방에 있는 Base 파일들을 참고하라고 하면, 퀘이사 시절의 오버라이딩 지옥 없이 완벽히 정제된 일관성 있는 화면을 얻을 수 있습니다.
2.  src/engines/ 와 NestJS Modules 의 1:1 데이터 매핑:
    프론트엔드의 engines/shorts/는 백엔드의 modules/shorts/와만 통신합니다. 이로 인해 데이터 타입(DTO)의 싱크가 칼같이 맞아떨어지며 반수동 개발 시 디버깅 공수가 90% 이상 절감됩니다.
3.  Yjs + Hocuspocus의 백엔드 중앙 통제:
    실시간 문서 충돌 방지 인프라를 NestJS의 독립 모듈(modules/hocuspocus/)로 내장시킴으로써, 향후 자체 NAS 서버로 통째로 마이그레이션할 때 도커 컨테이너 하나로 가볍게 말아서 복사-붙여넣기 할 수 있는 완벽한 이식성을 확보했습니다.

이 구조대로 새 폴더를 개설하고 안티그래비티 에이전트 가동을 준비하시는 것을 추천합니다.
하루 동안 이 깔끔하게 분리된 프론트와 백엔드의 지도(Map)를 곰곰이 읽어보시면서 의견을 주세요.
이 설계 아키텍처에 100% 확신이 서셨다면, 다음 단계로 안티그래비티에게 내릴 첫 번째 실제 구현 명령인 '1단계: frontend/ 와 backend/ 기본 환경 폴더 셋업 및 패키지 설치 스크립트 빌드'를 조심스럽게 진행해 보겠습니다. 이 구조로 확정하고 출발해 볼까요?

---

### 참고 표준 파일구조 형태

iot-platform/
├── apps/
│ ├── frontend/ # 🖥️ [Next.js] 프론트엔드 앱
│ │ ├── src/
│ │ │ ├── app/ # Next.js App Router (페이지/레이아웃)
│ │ │ │ ├── layout.tsx # 전역 레이아웃
│ │ │ │ ├── page.tsx # 메인 랜딩 페이지
│ │ │ │ └── dashboard/ # 관제 대시보드 페이지 (/dashboard)
│ │ │ │ └── page.tsx
│ │ │ ├── components/ # UI 컴포넌트 (Shadcn UI & Custom)
│ │ │ │ ├── ui/ # Shadcn UI 기본 소자들 (button, dialog 등)
│ │ │ │ ├── dashboard/ # 대시보드 전용 위젯
│ │ │ │ │ ├── DeviceCard.tsx # 장비 요약 카드
│ │ │ │ │ └── RealtimeChart.tsx # 실시간 센서 차트
│ │ │ │ └── editor/ # Tiptap 에디터 관련 컴포넌트
│ │ │ │ └── TiptapController.tsx # 제어 기능이 내장된 에디터
│ │ │ ├── hooks/ # 커스텀 훅 (Yjs 이벤트 바인딩)
│ │ │ │ └── useYjsSync.ts # Yjs와 Zustand 스토어를 중계하는 핵심 훅
│ │ │ └── store/ # 🎯 [Zustand] 브라우저 화면 제어 스토어
│ │ │ ├── useDeviceStore.ts # 장비 상태 및 실시간 센서 데이터 스토어
│ │ │ └── useUiStore.ts # 다크모드, 사이드바 등 로컬 UI 스토어
│ │ ├── tailwind.config.js # Tailwind CSS 설정
│ │ └── package.json
│ │
│ └── backend/ # ⚙️ [NestJS + Hocuspocus] 통합 백엔드 앱
│ ├── src/
│ │ ├── app.module.ts # 최상위 메인 모듈
│ │ ├── main.ts # 백엔드 진입점 (NestJS & Hocuspocus 동시 구동)
│ │ ├── hocuspocus/ # ⚡ [Hocuspocus] 실시간 동기화 모듈
│ │ │ ├── hocuspocus.module.ts
│ │ │ ├── hocuspocus.server.ts # Hocuspocus 서버 인스턴스 및 훅 세팅
│ │ │ └── hocuspocus.service.ts# 온오센티케이트 인증 및 데이터 검증 비즈니스 로직
│ │ ├── devices/ # 🟢 장비 메타데이터 및 상태 조회 모듈 (1등급)
│ │ │ ├── devices.controller.ts
│ │ │ └── devices.service.ts
│ │ ├── control/ # 🟡 원격 제어 명령 및 2차인증 모듈 (2등급)
│ │ │ ├── control.controller.ts # MFA 검증 및 감사로그 인터셉터 적용
│ │ │ └── control.service.ts
│ │ ├── edge-queue/ # 🔴 현장 폐쇄망 명령 적재/폴링 큐 모듈 (3등급)
│ │ │ ├── edge-queue.controller.ts # 내부망 에지가 명령을 Pull 해가는 API
│ │ │ └── edge-queue.service.ts
│ │ └── common/ # 공통 가드, 인터셉터, 보안 로직
│ │ ├── guards/auth.guard.ts # JWT 검증 가드
│ │ └── interceptors/audit.interceptor.ts # 2등급 감사로그 저장 인터셉터
│ └── package.json
│
└── packages/ # 📦 공유 패키지 레이어 (앞뒤 데이터 싱크용)
└── shared/
├── index.ts
└── types/ # 🤝 프론트-백엔드가 공동으로 사용할 타입 정의
├── device.dto.ts # 장비 데이터 구조 표준 (센서 데이터 포맷)
└── control.dto.ts # 제어 명령 패킷 구조 표준

네, 정확하게 모던 웹 개발의 정석이자, 특히 AI 바이브 코딩(Antigravity/Claude) 환경에서 생산성을 극대화하는 최고의 워크플로우입니다!
전체 프레임(뼈대)을 먼저 잡고, 가상 데이터(Mock Data)를 주입해 화면을 보면서 컴포넌트의 디테일을 다듬는 방식을 '상향식(Bottom-up) 컴포넌트 구동 개발'이라고 합니다.
실시간 트래픽이 휘몰아치는 IoT 플랫폼 관점에서 가상 데이터를 뿌려주고 UI를 다듬으려면, 다음과 같은 3단계 구조로 가상 데이터 시스템을 세팅하는 것이 가장 이상적입니다.

---

### 🧱 1단계: 가상 데이터(Mock Data) 구조 설계 (Shared 레이어)

앞서 우리가 짠 파일 구조 중 packages/shared/types/device.dto.ts에 정의될 실제 데이터 스펙과 완벽히 일치하는 가상 데이터를 자바스크립트 객체 배열로 만듭니다.

// frontend/src/store/mockData.tsimport { DeviceDto } from '@iot/shared'
export const MOCK_DEVICES: Record<string, DeviceDto> = {
"DEV-001": {
id: "DEV-001",
name: "A동 메인 프레스 모터",
isOnline: true,
temperature: 42.5,
voltage: 220,
lastUpdated: new Date().toISOString()
},
"DEV-002": {
id: "DEV-002",
name: "B동 3번 압축 밸브",
isOnline: false, // 🔴 일부러 연결 끊김 상태도 만들어 둠
temperature: 18.0,
voltage: 0,
lastUpdated: new Date().toISOString()
}
}

---

### 🎯 2단계: Zustand 스토어에 '초기 가상 데이터' 주입

Zustand 스토어를 만들 때, 처음부터 빈 상태로 두지 않고 위에서 만든 MOCK_DEVICES를 초기값(initialState)으로 넣어둡니다. 이렇게 하면 백엔드(NestJS) 서버를 아직 한 줄도 짜지 않았더라도 프론트엔드 대시보드 화면에 장비들이 즉시 나타납니다.

// frontend/src/store/useDeviceStore.tsimport { create } from 'zustand'import { MOCK_DEVICES } from './mockData'
export const useDeviceStore = create((set) => ({
devices: MOCK_DEVICES, // ⚡ 가상 데이터로 시작!

// 실시간 데이터 수신 시 업데이트할 함수 (추후 웹소켓/Yjs와 연결될 곳)
updateDevice: (id, newData) => set((state) => ({
devices: { ...state.devices, [id]: { ...state.devices[id], ...newData } }
}))
}))

---

### ⏱️ 3단계: IoT 맞춤형 '실시간 가상 스트리밍 엔진' 추가 (핵심 ✨)

IoT 플랫폼 화면을 테스트할 때는 멈춰있는 데이터만 보면 재미가 없고, 실시간으로 온도가 변하거나 장비가 죽고 사는 연출(시뮬레이션)이 필요합니다.
프론트엔드 최상위 레이어(layout.tsx 등)에 1초마다 가상 데이터를 무작위로 변경해서 Zustand 스토어에 쏴주는 '시뮬레이터 컴포넌트'를 하나 심어둡니다.

// frontend/src/components/ui/DeviceSimulator.tsximport { useEffect } from 'react'import { useDeviceStore } from '@/store/useDeviceStore'
export default function DeviceSimulator() {
const updateDevice = useDeviceStore((state) => state.updateDevice)

useEffect(() => {
// 1초마다 무한 반복하는 타이머 가동
const interval = setInterval(() => {
// DEV-001 모터의 온도를 40도 ~ 45도 사이로 무작위 변경
const nextTemp = +(40 + Math.random() \* 5).toFixed(1)

      updateDevice("DEV-001", {
        temperature: nextTemp,
        lastUpdated: new Date().toISOString()
      })
    }, 1000)

    return () => clearInterval(interval)

}, [updateDevice])

return null // 화면에 아무것도 안 그리는 순수 로직 컴포넌트
}

---

### 🚀 이렇게 구조를 잡았을 때의 AI 바이브 코딩 시나리오

안티그래비티 환경에서 이 가상 데이터 구조를 가동하면, 개발 속도가 말도 안 되게 빨라집니다.

1.  지시: "클로드, 1초마다 온도가 변하는 DeviceSimulator를 켜줘."
2.  UI 확인: 화면을 켜면 백엔드 없이도 숫자가 실시간으로 계속 출렁이는 IoT 대시보드가 브라우저에 연출됩니다.
3.  컴포넌트 빌드 및 피드백: 실시간 숫자가 변하는 걸 눈으로 보면서 AI에게 디테일을 주문합니다.

- "어, 지금 온도가 44도를 넘어가니까 글씨가 너무 튀네. 44도 넘으면 텍스트가 빨간색으로 변하고 animate-pulse(깜빡임) 효과가 적용되도록 DeviceCard.tsx 내부의 Tailwind 코드를 수정해줘."

4.  전역 반영: AI가 베이스 컴포넌트를 손보면 화면에 실시간 붉은 알림이 즉시 연출됩니다.

---

### 🏁 최종 개발 로드맵 요약

1.  [프레임 잡기] Next.js 전역 레이아웃 및 뼈대 제작 (Shadcn UI 활용)
2.  [가상 데이터 세팅] Zustand 스토어에 MOCK_DEVICES 주입 + DeviceSimulator 가동
3.  [UI 무한 튜닝] AI와 함께 쿵짝을 맞추며 베이스 컴포넌트(DeviceCard, Chart) 완성도 끌어올리기
4.  [스위치 전환] 화면이 200% 만족스럽게 완성되면, Zustand 스토어의 데이터 소스를 가상 데이터에서 실제 Hocuspocus/Yjs 웹소켓 연결로 한 줄만 교체 (백엔드 연동 끝)
