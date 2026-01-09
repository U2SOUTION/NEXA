# NEXA 플랫폼 메인 메뉴 구조와 src/ 대응 폴더 분석과 리팩토링 계획

## 리펙토링 전 현제 구조 메뉴 ↔ 폴더 매핑 (참고) , 잠재적 문제점 파악

글로벌 메뉴( HOME, NEXA BOARD, NEXA NODE 등)가 `NEXA-Platform/src/` 내부의 어느 영역과 연결되는지를 구조 파악

| 메뉴명     | 대표 파일 / 폴더                                                                                                                | 핵심 역할                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| HOME       | `src/pages/HomePage.vue`                                                                                                        | 대시보드 진입점, 메인 UX 레이아웃을 담당합니다.                        |
| NEXA BOARD | `src/pages/NexaBoardPage.vue`, `src/pages/BoardAdminPage.vue`, `src/pages/IndexBoardPage.vue`, `src/board/`, `src/block/board/` | 대시보드 생성/설정, 블럭 기반 렌더링, 윈도우/보드 상태를 관리합니다.   |
| NEXA PANEL | `src/pages/NexaPannelPage.vue`, `src/panel/`, `src/components/panel/`                                                           | 패널 전용 뷰와 관련 컴포넌트, 설정 윈도우를 포함합니다.                |
| NEXA NODE  | `src/pages/NexaNodePage.vue`, `src/components/nexa-node/`, `src/stores/nexaNodeStore.ts`, `src/diagram/`                        | 노드 편집기, D3 캔버스, 시뮬레이터, 상태 저장 로직 등을 담고 있습니다. |
| NEXA TEACH | `src/pages/NexaTeachPage.vue`                                                                                                   | 자동화된 학습/튜토리얼 콘텐츠를 보여주는 페이지입니다.                 |
| NEXA ERP   | `src/pages/NexaErpPage.vue`                                                                                                     | ERP/비즈니스 흐름을 다루는 뷰와 관련 리소스를 포함합니다.              |
| 부품관리   | `src/pages/PartsManagementPage.vue`, `src/components/parts-management/`, `src/stores/parts-management/`                         | 부품 테이블, 필터, UI/상태 관리를 위한 컴포넌트 모듈입니다.            |
| PORTFOLIO  | `src/pages/PortfolioPage.vue`, `src/components/portfolio/` _(해당 폴더는 `components` 내부 참고)_                               | 프로젝트 포트폴리오, 시각화 위젯, 요약 카드 등을 제공합니다.           |
| SYSTEM     | `src/pages/SystemPage.vue`, `src/components/settings/`, `src/settings/`                                                         | 시스템 설정/관리 화면과 글로벌 설정 초기화 로직을 포함합니다.          |
| NETWORK    | `src/pages/NetworkPage.vue`, `src/components/network` _(필요 시)_                                                               | 네트워크 관련 뷰, 노드 토폴로지, 상태 모니터링 위젯입니다.             |
| SOLUTIONS  | `src/pages/SolutionsPage.vue`, `src/components/solutions/`                                                                      | 솔루션 소개, 템플릿, 데모 컨텐츠 영역입니다.                           |
| EXTENSION  | `src/pages/ExtensionPage.vue`, `src/components/extension/`, `src/composables/extension/`                                        | 확장 기능 리스트, 설치/관리 UX, 스토어 통합 로직이 들어 있습니다.      |
| HELP       | `src/pages/HelpPage.vue`, `src/guides/`                                                                                         | 가이드, 도움말, 지원 문서를 연결하는 페이지와 컴포넌트를 포함합니다.   |
| DEV        | `src/pages/DevelopmentPage.vue`, `src/components/dev-tools/`, `src/composables/dev-tools/`                                      | 개발 도구 모음, 퍼포먼스/디버깅 UI, 실험 기능을 담고 있습니다.         |

---

### **NEXA 플랫폼의 리팩토링 철학적 설계 목적**

NEXA 파일 구조는 "중앙 관제형 도메인 중심 아키텍처"
**조화로운 중앙 통제와 자율적인 도메인 기능**
각 계층이 고유한 책임과 역할을 가지며, 이들의 유기적인 결합이 강력한 시스템을 구축

#### 1. **`project_v2/` ⎯ 시스템의 '외피'와 '생명력'**

-   **`public/` (외피):** 외부에 드러나고 정적인 요소들, 즉 플랫폼의 '얼굴' 역할을 합니다. SEO나 외부 라이브러리처럼, 시스템의 첫인상과 기반 환경을 책임지는 부분으로 읽힙니다.
-   **`src/` (생명력):** 실제 플랫폼의 모든 '생명 활동'이 일어나는 핵심 영역입니다. `assets`는 플랫폼을 구성하는 필수적인 리소스이며, 이후의 모든 디렉터리가 생명체의 '장기'나 '기관'처럼 작동하는 복잡한 내부 구조를 나타냅니다.

#### 2. **`frame/` ⎯ 플랫폼의 '골격'이자 '흐름'**

-   **`layout/`:** "전체 3단 슬롯 정의"에서 알 수 있듯이, 플랫폼의 기본적인 사용자 경험 '골격'을 책임집니다. 이곳에서 정의된 레이아웃은 모든 도메인이 따르는 공통된 틀이 되며, 사용자에게 일관된 시각적 경험을 제공 'U2BeeLayout'은 크롬 확장 프로그램이라는 특정 용도를 위한 변형으로, 유연성 확보에 예제 파일 입니다.
-   **`router/`:** "전체 라우팅 및 Infra 리다이렉션 가드"는 플랫폼의 '교통 통제'를 담당합니다. 사용자의 모든 이동 경로를 중앙에서 관리하고, 특정 조건(예: 인증, 권한)에 따라 흐름을 제어하는 강력한 관제 기능으로 작동.
-   **`registry/` (domainRegistry):** 이 부분에서 "중앙 관제"의 로서 모든 도메인이 이곳에 '등록'되어 관리한다, 도메인 간의 의존성을 최소화하면서도 전체 플랫폼 관점에서의 통합적 제어, 마치 '모든 도메인의 주소록'.

#### 3. **`engines/` ⎯ 플랫폼의 '심장'이자 '핵심 역량'**

-   "핵심 기술 엔진"이라는 설명처럼, NEXA 플랫폼의 핵심 '기능 단위'들이 이곳에 응축되어 있습니다. `NexaBlock`, `NexaBoard`, `diagram`, `sound`, `charts` 등은 플랫폼이 제공하려는 고유한 서비스와 경쟁력을 직접적으로 담당하는 기술적 '심장'으로 이들은 도메인에 종속되지 않는 범용적이고 재사용 가능한 핵심 라이브러리 역할합니다. "엔진은 말이 없을수록 강하다"는 철학처럼, 조용히 그러나 강력하게 백그라운드에서 동작 되어야 합니다.

#### 4. **`system/` ⎯ 플랫폼의 '정신'이자 '헌법' (Strict Layer!)**

-   **"전역 표준 및 강제 규칙"** 이곳은 NEXA 플랫폼의 '헌법'이자 '가치관'을 담는 곳입니다.
-   **`boot/`, `store/`, `css/`:** 플랫폼의 부팅, 전역 상태, 디자인 시스템 등 시스템 전반의 '기반과 통일성'을 강제합니다.
    특히 `schemas/`에서 "모든 데이터 모델 표준 (도메인 내 생성 금지)" 원칙은 일관성과 무결성을 확보하기 위한 강력한 철학적 결정입니다.
    이는 플랫폼 전체의 언어를 통일하고, 도메인 간 데이터 충돌을 원천 차단하고 이어서 Zod를 사용하여 코딩,오류,보안력을 배가 시킨다.
-   **`composables/`:** Vue 3의 강력한 재사용 메커니즘을 활용하여 `useDomainIntercom`, `useSystemWatcher` 등 시스템 핵심 로직을 캡슐화 하여야 하며. 이는 각 도메인이 시스템의 '표준 인터페이스'를 통해 상호작용하도록 강제함으로써, 도메인의 독립성을 지키면서도 전체 시스템의 일관된 동작을 보장 해야 합니다.
-   **`components/` & `utils/`:** 시스템 전역에서 사용되는 공통 UI 요소와 유틸리티를 한곳에 모아, 불필요한 중복과 비표준화를 철저히 방지 합니다.

#### 5. **`domains/` ⎯ 플랫폼의 '활동 영역'이자 '개성'**

-   **"메뉴별 독립 프로젝트 영역"**이라는 설명은 각 도메인이 자율적인 비즈니스 로직과 UI를 가지는 '독립 국가'로서. `infra`, `erp`, `board` 등 각각이 특화된 기능을 수행합니다.
-   **예) `infra/` (`views/` & `index.vue`):** "3단 UI 실제 구현부"와 "Frame 레이아웃에 맞춰 3단 영역을 조립하는 루트"는 각 도메인이 `frame/layout/`이 제공하는 뼈대 위에 자신의 '살'을 붙여나가는 방식 입니다. `store/`, `components/`는 도메인 내에서만 유효한 지역적인 상태 관리와 재사용 가능한 UI 요소를 의미하며, 이는 도메인 간의 간섭을 최소화하려는 Boundary Context의 철학을 충실히 따르고 있습니다.
-   "`pages/` 대신 `views/` 사용" 또한 SPA의 '화면' 개념을 넘어서는, 더 깊은 '관점(View)'을 제공하고 파일관리의 일관성을 확보 합니다. `index.vue`가 '페이지'가 아닌 '도메인 컨테이너'로서 단순히 UI를 보여주는 것을 넘어 도메인의 전체적인 컨텍스트를 담아내는 역할을 합니다.

## ✨ NEXA 플랫폼: 중앙 관제형 도메인 중심의 분리와 통합의 미학 아키텍처

이 구조는 **메인 프레임 (Frame)**, **핵심 엔진(Engines)**, **중앙 관제와 전역 표준(System)**, 그리고 **비즈니스 실행(Domains)**으로 완벽히 분리 합니다.

-   **강력한 중앙 표준(`system/`)**으로 전체 플랫폼의 일관성과 안정성을 보장하고,
-   **핵심 엔진(`engines/`)**으로 플랫폼의 고유한 기술 경쟁력을 확보하며,
-   **독립적인 도메인(`domains/`)**으로 비즈니스 요구사항에 유연하게 대응하고 확장성을 극대화했습니다.
-   **명확한 프레임워크(`frame/`)**로 사용자 경험의 통일성을 지켜냅니다.

### 📂 NEXA 프로젝트 파일구조

```text
NEXA_Platform_v2/
├── public/                          # 🔵 정적 파일
│   ├── favicon.ico                  # ✅ 파비콘
│   ├── robots.txt                   # ✅ SEO
│   ├── icons/                       # ✅ 동적 경로 아이콘
│   │   ├── esp32-01.png
│   │   └── raspberry-pi.png
│   ├── downloads/                   # ✅ 다운로드 파일
│   │   └── manual.pdf
│   ├── libs/                        # ✅ 외부 라이브러리
│   │    └── three.min.js
│   └── uploads/                     # 업로드 (일반폼, 에디터 통합)
│
└── src/
    ├── assets/                      # 🟢 앱 리소스
    │   ├── images/                  # ✅ 컴포넌트 이미지
    │   │   ├── logo.png
    │   │   └── hero-bg.jpg
    │   ├── icons/                   # ✅ SVG 아이콘
    │   │   └── check.svg
    │   └── fonts/                   # ✅ 웹폰트
    │       └── Roboto.woff2
    ├── frame/                        # 플랫폼 중앙 제어 및 프레임워크 기반
    │   ├── layout/                   #MainLayout.vue (3단 레이아웃 슬롯 정의)
    │   │   ├── components/           # 레이아웃을 구성하는 공통 부품들
    │   │   │   ├── StandardLeftHeader.vue #헤더는 버튼이 들어갈 slot이나 props만 제공
    │   │   │   └── StandardRightHeader.vue #헤더는 버튼이 들어갈 slot이나 props만 제공
    │   │   ├── MainLayout.vue        # 전체 3단 슬롯 정의 (StandardHeader들을 배치)
    │   │   └── U2BeeLayout.vue       # 크롬 확장용 레이아웃
    │   ├── router/                   # 전체 라우팅 및 Infra 리다이렉션 가드
    │   └── registry/                 # domainRegistry
    │
    ├── engines/                      # 핵심 기술 엔진 (내부 라이브러리)
    │   ├── block/                    # NexaBlock 엔진
    │   ├── board/                    # NexaBoard 렌더러
    │   ├── panel/                    # 공통 패널 시스템
    │   ├── diagram/                  # 다이어그램 엔진
    │   ├── sound/                    # 사운드 처리 엔진
    │   └── charts/                   # 차트 시각화 모듈
    │
    ├── system/                       # 전역 표준 및 강제 규칙 (Strict Layer)
    │   ├── boot/                     # 초기화 및 플러그인 설정 (⚠️ Quasar 특유: 부트 파일 : 설정 필요)
    │   ├── store/                    # eventBus, systemState 등 시스템 전체 스토어
    │   ├── css/                      # 전역 디자인 시스템 (디자인 토큰)
    │   ├── schemas/                  # 모든 데이터 모델 표준 (도메인 내 생성 금지)
    │   ├── composables/              # useDomainIntercom, useSystemWatcher  (Composition API를 활용해 상태 로직을 캡슐화하고 재사용하는 함수 ✅ Vue 3 표준)
    │   │   ├── auth/                 # frame/router/guards/ 와 연동하여
    │   │   │   └── useAuth.ts        #
    │   │   ├── communication/
    │   │   │   ├── useEventBus.ts    #
    │   │   │   └── useMQTT.ts        #
    │   │   ├── state/
    │   │   │   └── useGlobalState.ts # ✅ Vue reactive 사용
    │   │   ├── hardware/
    │   │   │    └── useDeviceConnection.ts
    │   │   └── ....
    │   │       └── ....
    │   ├── components/               # 시스템 표준 공통 UI 컴포넌트
    │   └── utils/                    # 전역 공통 유틸리티
    │
    ├── domains/                          # 메뉴별 독립 프로젝트 영역 (⚠️ pages/ 대신 viewe 사용)
    │   ├── infra/                        # 인프라 자산 및 장치 관리 도메인
    │   │   ├── my-devices/               # 하위메뉴 1: 장치 목록 및 상세 관리
    │   │   │   └── views/                # 3단 UI 실제 구현부
    │   │   │       ├── left/             # 장치 트리, 그룹 필터링
    │   │   │       ├── content/          # 등록/수정 폼, 장치 상세 제어
    │   │   │       └── right/            # 장치별 통신 로그, 실시간 센서 값
    │   │   │
    │   │   ├── physical-map/             # 하위메뉴 2: 도면 기반 자산 배치 조회
    │   │   │   └── views/
    │   │   │       ├── left/             # 맵 네비게이션 (지역/건물/층)
    │   │   │       ├── content/          # 2D/3D 맵 렌더링 컨테이너
    │   │   │       └── right/            # 선택된 자산의 시스템 상태 요약
    │   │   │
    │   │   ├── store/                    # 도메인 로컬 상태 (infra 전용 데이터 가공)
    │   │   ├── components/               # infra 내 여러 메뉴에서 재사용되는 UI
    │   │   │   ├── InfraDeviceTree.vue   # 여러 메뉴에서 공유하는 장치 트리
    │   │   │   ├── LogStreamViewer.vue   # 실시간 로그 표시용 공통 부품
    │   │   │   └── StatusBadge.vue       # 인프라 전용 장치 상태 표시 아이콘
    │   │   │
    │   │   └── index.vue                 # Frame 레이아웃에 맞춰 3단 영역을 조립하는 루트 (⚠️ 페이지가 아니라 도메인 컨테이너다.)
    │   │
    │   ├── erp/                      # 부품 관리 통합 도메인
    │   │   ├── views/                # [left, content, right] 구조 준수
    │   │   └── index.vue
    │   │
    │   ├── board/                    # Nexa Board 도메인
    │   ├── pannel/                   # Nexa Pannel 도메인
    │   ├── node/                     # Nexa Node 도메인
    │   ├── trace/                    # Nexa TRACE 도메인
    │   └── ...                       # 기타 도메인 (Network, Portfolio 등)
    │
    └── App.vue                       # 메인 진입점

```

### ✨자산관리 폴더 특성 비교표

| 기준            | `public/`           | `assets/`      |
| --------------- | ------------------- | -------------- |
| **빌드 처리**   | 그대로 복사         | 번들링/최적화  |
| **접근 방법**   | 절대 경로 (`/file`) | import         |
| **파일명 해시** | ❌ 없음             | ✅ 있음 (캐싱) |
| **최적화**      | ❌ 없음             | ✅ 있음        |
| **동적 경로**   | ✅ 가능             | ❌ 불가능      |
| **캐싱 제어**   | ❌ 어려움           | ✅ 자동        |
| **크기 제한**   | ❌ 없음             | ⚠️ 주의 필요   |
| **용도**        | 정적 파일           | 앱 리소스      |

---

### ✨ 주요 특징 및 설계 철학

-   **중앙 집중형 상태 공유:** 각 도메인은 고립되지 않습니다. `system/store`를 거울 삼아 서로의 상태를 실시간으로 감시하고 반응합니다.
-   **Infra 우선 원칙:** 플랫폼의 대부문 기능은 `infra/devices`에 기기가 등록된 후에 활성화됩니다. `frame/router`와 `systemState`가 NEXA 시스템의 목적 기능과 데이터 흐름을 이해 할 수 있도록 유도 합니다.
-   **기술(engines)과 서비스(Domain)의 분리:** 핵심 엔진은 `engines/`에서 독립적으로 발전하며, `domains/`는 이를 조립하여 사용자 가치를 만듭니다.
-   **표준의 엄격함:** `system/schemas`와 `system/css`를 통해 개발자마다 제각각인 데이터 구조와 디자인을 방지하고 일관성, 코드의 간결함을 유지합니다.

### ✨ Frame 아키텍처적

프레임워크의 역할: frame/은 "어떻게 보여줄 것인가(Type)"에 대한 옵션을 제공하고,
Layout : StandardLeftHeader/StandardRightHeader.vue 는 전역적으로 사이드바의 최소 틀을 제공 하고 각 domains/은 자신의 데이터 성격에 맞는 "옵션을 선택"하거나 "직접 주입"하는 책임을 가집니다.

### ✨ Domains 구조적 특징

각 도메인은 독립된 앱처럼 작동하면서도 NEXA 시스템 매우 긴밀하게 연결된 유기적 통합 플랫폼 의 부분체로 합류.

-   **물리적 UI 분리 (views/):** `views/` 폴더를 통해 `left-drawer`, `content`, `right-drawer`를 물리적으로 격리하여 3단 레이아웃 협업과 유동적 컨텐츠 창 최대 사용성 확보.
-   **중앙 관제 허브 (system/store):** 모든 도메인은 본인의 상태를 `system/store`에 보고하며, 이를 통해 도메인 간 상호 감시와 데이터 공유.
-   **표준 강제 (System Layer):** 데이터 구조(Schemas)와 스타일(CSS)을 전역에서 관리하여 도메인별 파편화를 원천 차단했습니다.
-

아길이님, 방향 선택 **아주 정확합니다.**
INFRA를 “교과서 도메인”으로 삼고, 그 전에 **문서화로 사고를 고정**하겠다는 판단은
이 구조에서 가장 현명한 다음 수입니다.

요청하신 대로 **“지금 파일 구조 기준에서 반드시 문서화해야 할 핵심 주의 사항”**을
👉 *실수 포인트 중심*으로 정리해드릴게요. (이건 거의 **운영 규칙 문서 초안** 수준입니다)

# 📘 도메인 기반 프레임워크 구조 – 핵심 주의 사항

## 1️⃣ 이 구조의 전제 (반드시 문서 상단에 명시)

> 본 프로젝트는 **플랫폼 지향 장기 프로젝트**이며
> 각 도메인은 **독립적인 소형 애플리케이션**으로 취급한다.
> 도메인 간 결합을 최소화하기 위해 **system 레이어를 중심으로 통신한다.**

## 2️⃣ 최상위 레이어 역할 정의 (요약)

| 레이어  | 책임                      | 허용되는 것               | 금지되는 것         |
| ------- | ------------------------- | ------------------------- | ------------------- |
| frame   | 레이아웃, 라우팅, 앱 외형 | layout, router, registry  | 비즈니스 로직       |
| system  | 전역 계약, 상태 중계      | store, schema, composable | 도메인 규칙         |
| domains | 실제 기능 구현            | UI, 도메인 로직           | 타 도메인 직접 참조 |
| engines | 순수 기능 엔진            | 렌더링, 계산, 처리        | UI / 상태           |

## 3️⃣ 가장 중요한 규칙: Domain 간 접근 규칙

### 공식 규칙 (최종 문구)

> **Domain은 다른 Domain을 직접 참조하거나 import 할 수 없다.** > **Domain 간 데이터 공유 및 상태 동기화는 반드시 system 레이어를 통해 수행한다.**

## 4️⃣ Domain ↔ Domain 접근 방식 상세 표 (중요)

    ### 잘못된 예 (절대 금지)

    | 상황                                   | 이유             |
    | -------------------------------------- | ---------------- |
    | infra에서 erp/store 직접 import        | 결합도 증가      |
    | infra 컴포넌트에서 board 컴포넌트 사용 | 도메인 경계 붕괴 |
    | infra 로직에서 erp 상태를 직접 계산    | 책임 혼합        |

    ### ✅ 허용되는 올바른 패턴

    | 접근 방식         | 설명        | 예시               |
    | ----------------- | ----------- | ------------------ |
    | system/store 경유 | 상태 공유   | activeDeviceId     |
    | system/composable | 기능 계약   | useGlobalSelection |
    | system/schema     | 데이터 표준 | DeviceSchema       |
    | eventBus (system) | 느슨한 통신 | DEVICE_SELECTED    |

## 5️⃣ system 레이어의 엄격한 역할 정의 (⚠️ 매우 중요)

### system이 **해야 할 것**

| 항목         | 설명                     |
| ------------ | ------------------------ |
| 상태 중계    | 선택 상태, 활성 컨텍스트 |
| 계약 제공    | schema, interface        |
| 통신 허브    | eventBus, MQTT wrapper   |
| 공통 watcher | 로그인 상태, 연결 상태   |

### system이 **절대 하면 안 되는 것**

| 금지 항목            | 이유               |
| -------------------- | ------------------ |
| 도메인 비즈니스 판단 | 책임 침범          |
| UI 처리              | 프레임/도메인 영역 |
| 도메인별 데이터 가공 | 소유권 위반        |
| 특정 도메인 의존     | 중립성 붕괴        |

👉 **system은 ‘뇌’가 아니라 ‘신경망’이다**

## 6️⃣ Domain 내부 구조 주의 사항 (INFRA 기준)

### 📁 infra 도메인 구조 원칙

| 위치          | 책임                  |
| ------------- | --------------------- |
| views/left    | 탐색, 필터, 선택      |
| views/content | 핵심 작업, 편집       |
| views/right   | 상태, 로그, 보조 정보 |
| store/        | infra 전용 가공 상태  |
| components/   | infra 내부 공용 UI    |
| index.vue     | 레이아웃 조립만       |

### ⚠️ infra/index.vue 주의 사항

| 가능               | 불가          |
| ------------------ | ------------- |
| 레이아웃 슬롯 조립 | 데이터 계산   |
| props 전달         | API 직접 호출 |
| system 상태 구독   | 로직 판단     |

## 7️⃣ Router 관련 문서화 포인트

### Router의 역할

| 항목                  | 설명                |
| --------------------- | ------------------- |
| URL → 상태            | 진입점 정의         |
| Layout 결정           | MainLayout / Drawer |
| 초기 system 상태 세팅 | drawer open 여부    |
| 공유 가능한 상태 제공 | deep link           |

👉 **라우터는 “페이지 이동기”가 아니라 “상태 진입 정의서”**

---

## 8️⃣ Drawer / Layout 상태 제어 규칙

| 항목             | 처리 주체        |
| ---------------- | ---------------- |
| drawer 열림/닫힘 | system/store     |
| 기본 상태        | router           |
| 토글 UI          | layout component |
| 도메인 로직      | ❌               |

---

## 9️⃣ CSS / UI 오버라이딩 관련 주의 사항

| 레벨            | 책임          |
| --------------- | ------------- |
| system/css      | 디자인 토큰   |
| frame/layout    | 구조 스타일   |
| domain          | 최소한의 보정 |
| quasar override | 최후 수단     |

👉 **“이길 수 없는 CSS와 싸우지 말 것”**

---

## 🔟 초보자 실수 방지 체크리스트 (중요)

| 체크 항목                     | Yes / No |
| ----------------------------- | -------- |
| 다른 domain import 했는가     | ❌       |
| system에 로직을 넣었는가      | ❌       |
| index.vue에 계산이 있는가     | ❌       |
| router를 단순 path로만 쓰는가 | ❌       |
| engine에서 UI를 다루는가      | ❌       |

---

## 1️⃣ 한 줄 요약 (문서 마지막에 추천)

> **도메인은 독립적으로 존재하고,
> system은 그들 사이의 규칙과 흐름만을 관리한다.**

---

# Refactoring Plan

## 리팩토링 주요 목표

-   명확한 폴더 구조와 쉬운 확장성
-   TypeScript + Zod 도입
-   도메인 독립성 확보와 NEXA 시스템과의 유기적 결합

## 리팩토링 가이드 & 절대원칙

1. 플렛폼 코드를 통체로 백업 하고 기존(v1) src/는 읽기 전용 (참고만)
2. NEW 버전에서는 기존 설정(수정한) 파일등과 server/ 코드는 복제하고 src/에서 처음부터 깨끗하게 v1 을 참고하여 시작
3. v1 에서 완성도 작은 하나 골라 완전한 구조를 완성 후 이 기준으로 v1의 진행된 프로그램을 TypeScript + Zod 도입 적용

-   **[CSS] 도메인 내부 CSS 최소화:** 디자인 수정이 필요하면 `system/css`의 변수를 먼저 확인하세요. 도메인 전용 CSS는 레이아웃 조정 수준으로 제한합니다.
-   **[Schemas] 도메인 내 생성 금지:** 새로운 데이터 구조가 필요하면 무조건 `system/schemas`에 먼저 등록해야 합니다. 이는 도메인 간 데이터 교환 시 오해를 없애줍니다.
-   **[Composables] 보고 체계 준수:** 도메인 내부에서 일어나는 중요한 변화는 반드시 `system/composables/useDomainIntercom`을 통해 중앙으로 보고해야 합니다.
-   **[Layout] 3단 구조 유지:** 모든 도메인은 `left-drawer`, `content`, `right-drawer` 구조를 기본으로 하며, 이들 간의 데이터 흐름은 도메인 내부 스토어를 활용합니다.

## 일정

-   Week 1: 기초 (frame, system)
-   Week 2-3: Infra 도메인
-   Week 4-5: ERP 도메인

```text

project/
├── server/
│ └── ... (기존것 그대로 복사, 안정화 후 재검토)
│
└── src/ # 🟢 1. 디랙토리 생성
├── frame/ # 🟢 2. 기초적인 작업 전역 메인 메뉴 구성
├── engines/
├── system/ # 🟢 3. 기초적인 작업
└── domains/ # 🟢 4. 가장 작업 안된것 하나 선택후 최적화된 샘플 구성

```

# Domain Checklist

## Infra

-   [ ] config.ts 작성
-   [ ] schemas 정의 (Device, Network)
-   [ ] views/my-devices
    -   [ ] left/ (DeviceTree)
    -   [ ] content/ (DeviceList)
    -   [ ] right/ (DeviceDetails)
-   [ ] views/physical-map
-   [ ] store 구현
-   [ ] API 연동
-   [ ] 테스트

## ERP

-   [ ] config.ts
-   [ ] schemas (Component, Project)
-   [ ] ...

---

## ✨ NEXA 플랫폼 리팩토링 및 마이그레이션 단계별 가이드

현재 논의된 **INFRA** 중심의 중앙 관제 아키텍처와 **3단 레이아웃** 구조를 실현하기 위한 리팩토링 순서를 정리해 드립니다.
가장 중요한 원칙은 "기반(Core/System)을 먼저 다지고, 도메인을 하나씩 이주(Migration)시키는 것"입니다.

### 1단계: 프레임워크 기반 및 중앙 관제소 구축 (Core & System)

-   1. 물리적인 백업
-   2. 가장 먼저 전체 플랫폼의 뼈대와 소통 창구를 만들어야 합니다.

*   **Core Layout 구현:** `frame/layout/`에 3단 슬롯(Left, Content, Right)을 가진 전역 레이아웃 컴포넌트를 작성합니다.
*   **중앙 스토어 설정:** `system/store/`에 `systemState`(기기 등록 상태 등)와 `eventBus`(도메인 간 통신)를 생성합니다.
*   **표준 규격 정의:** `system/schemas/`에 디바이스, 부품, 사용자 등 도메인 간 공유될 데이터의 표준 모델을 정의합니다.
*   **라우터 가드 설정:** `frame/router/`에서 기기 미등록 시 **INFRA** 메뉴로 강제 이동시키는 로직을 배치합니다.

### 2단계: 핵심 엔진 격리 (engines/SDK)

기존에 여기저기 흩어져 있던 핵심 기술 로직을 깨끗한 환경으로 옮깁니다.

-   **엔진 이주:** 차트, 보드 렌더러, 다이어그램 로직을 `engines/` 폴더로 옮기고, 어떤 도메인에서도 독립적으로 불러올 수 있게 패키지화합니다.
-   **의존성 정리:** SDK 내부 코드에서 특정 도메인(예: ERP)을 참조하던 코드를 제거하고, 순수하게 기능만 수행하도록 정제합니다.

### 3단계: 시작 도메인 구축 (INFRA)

사용자가 가장 먼저 마주할 **INFRA** 도메인을 새로운 구조에 맞춰 생성합니다.

-   **폴더 구조 생성:** `domains/infra/my-devices/` 하위에 `left-drawer`, `content`, `right-drawer` 폴더를 만듭니다.
-   **기기 등록 로직 구현:** 기기를 등록하면 `system/store/systemState`의 값을 변경하여 플랫폼 전체의 '잠금'을 해제하는 이벤트를 발행합니다.
-   **하위 메뉴 확장:** `physical-map`, `system-status` 등의 빈 폴더를 만들어 향후 확장 구조를 확립합니다.

### 4단계: 기존 도메인 이주 및 통합 (ERP & Others)

기존 기능을 새로운 폴더 구조로 하나씩 옮기며 최적화합니다.

-   **ERP 통합:** 기존의 '부품관리' 메뉴를 `domains/erp/parts/` 하위의 3단 구조로 이식합니다.
-   **도메인 인터콤 연결:** 각 도메인이 시작될 때 `useDomainIntercom`을 통해 중앙 관제소에 자신을 등록하도록 수정합니다.
-   **UI 파편화 정리:** 각 도메인 내부에 직접 적힌 스타일을 `system/css/`의 전역 변수로 교체합니다.

### 5단계: 통합 테스트 및 모니터링 활성화

모든 도메인이 연결된 후 유기적으로 작동하는지 확인합니다.

-   **상태 공유 점검:** **INFRA**에서 장치를 추가했을 때 **BOARD**나 **NODE**에서 즉시 반영되는지 확인합니다.
-   **중앙 모니터링:** `frame/registry/domainRegistry`를 통해 현재 활성화된 도메인들의 상태가 실시간으로 집계되는지 검증합니다.

---
