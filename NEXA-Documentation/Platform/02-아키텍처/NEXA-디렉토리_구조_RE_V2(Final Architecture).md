최종 검토 완료했습니다! 더 상세하고 명확하게 개선했습니다.

---

## **🎯 리팩토링 파일 최종 구조 (확정 v2.0)**

```
src/
├── frame/                                    # 🏗️ 플랫폼 틀 (구조적 기반)
│   │                                         # 역할: 도메인들이 올라가는 무대
│   ├── layout/                               # 레이아웃 시스템
│   │   ├── MainLayout.vue                    # 기본 3단 레이아웃 (left/content/right)
│   │   │                                     # Quasar Drawer 기반, 모든 도메인에서 사용
│   │   └── U2BeeLayout.vue                   # 크롬 확장 프로그램 전용 레이아웃
│   │                                         # iframe 임베드용, 최소화된 UI
│   │
│   ├── registry/                             # 도메인 동적 관리 시스템
│   │   └── domainRegistry.ts                 # 도메인 생명주기 관리
│   │                                         # - 도메인 동적 로딩/언로딩
│   │                                         # - 활성 도메인 추적
│   │                                         # - onInit/onDestroy 훅 실행
│   │
│   ├── router/                               # 라우팅 시스템
│   │   ├── index.ts                          # Vue Router 메인 설정
│   │   ├── dynamicRoutes.ts                  # 도메인 자동 라우트 생성
│   │   │                                     # config.ts 기반 자동 등록
│   │   └── guards.ts                         # 네비게이션 가드
│   │                                         # - Infra 첫 방문 강제 리다이렉션
│   │                                         # - 권한 체크
│   │                                         # - 방문 횟수/경험치 추적
│   │
│   └── boot/                                 # 앱 초기화
│       └── index.ts                          # 부트스트랩 로직
│                                             # - 플러그인 등록
│                                             # - 전역 설정
│                                             # - 초기 도메인 로딩
│
├── engines/                                  # 🔧 재사용 가능한 내부 엔진
│   │                                         # 역할: 독립적인 기능 모듈 (npm 패키지화 가능)
│   └── @nexa/                                # Nexa 엔진 네임스페이스
│       ├── block/                            # NexaBlock - 블록 기반 에디터
│       │   ├── index.ts                      # 메인 export
│       │   ├── BlockEngine.ts                # 코어 엔진 로직
│       │   ├── BlockRenderer.vue             # Vue 렌더러 컴포넌트
│       │   ├── types.ts                      # TypeScript 타입 정의
│       │   └── README.md                     # 사용법 문서
│       │                                     # 사용처: ERP 문서 작성, TEACH 시나리오 편집
│       │
│       ├── board/                            # NexaBoard - 대시보드 렌더러
│       │   ├── index.ts
│       │   ├── BoardEngine.ts                # 그리드 레이아웃 엔진
│       │   ├── WidgetSystem.ts               # 위젯 시스템
│       │   └── types.ts
│       │                                     # 사용처: BOARD 도메인 메인 기능
│       │
│       ├── panel/                            # NexaPanel - 패널 시스템
│       │   ├── index.ts
│       │   ├── PanelEngine.ts                # 다중 뷰 전환 엔진
│       │   ├── ViewRenderer.vue              # 뷰 렌더러
│       │   └── types.ts
│       │                                     # 사용처: PANNEL 도메인
│       │                                     # 동일 데이터 → 여러 시각화 형태
│       │
│       ├── diagram/                          # NexaDiagram - 노드 에디터
│       │   ├── index.ts
│       │   ├── DiagramEngine.ts              # 노드 기반 비주얼 프로그래밍
│       │   ├── NodeSystem.ts                 # 노드 타입 시스템
│       │   ├── ConnectionManager.ts          # 노드 간 연결 관리
│       │   └── types.ts
│       │                                     # 사용처: NODE 도메인 메인 기능
│       │                                     # IoT 장비 연결, 데이터 흐름 설계
│       │
│       ├── sound/                            # NexaSound - 사운드 처리 엔진
│       │   ├── index.ts
│       │   ├── AudioEngine.ts                # Web Audio API 래퍼
│       │   ├── SoundAnalyzer.ts              # 주파수 분석, 비트 감지
│       │   └── types.ts
│       │                                     # 사용처: 오디오 프로젝트 (One Resonance 등)
│       │
│       └── charts/                           # NexaCharts - 차트 시각화
│           ├── index.ts
│           ├── ChartEngine.ts                # 차트 렌더링 엔진
│           ├── DataTransformer.ts            # 데이터 변환
│           └── types.ts
│                                             # 사용처: 대시보드, 모니터링
│
├── system/                                   # ⚙️ 전역 표준 레이어 (Strict)
│   │                                         # 역할: 플랫폼 전체의 강제 규칙 및 공통 자산
│   │                                         # 🚫 도메인에서 중복 생성 절대 금지
│   │
│   ├── store/                                # 전역 상태 관리
│   │   ├── systemState.ts                    # 시스템 전역 상태
│   │   │                                     # - theme, language, user 정보
│   │   │                                     # - 전역 설정값
│   │   │                                     # - 모든 도메인에서 접근 가능
│   │   │
│   │   └── eventBus.ts                       # 🔴 DEPRECATED (이동됨)
│   │                                         # → system/composables/communication/useEventBus.ts
│   │                                         # (하위 호환용으로 re-export만 유지)
│   │
│   ├── css/                                  # 디자인 시스템
│   │   ├── tokens.css                        # 디자인 토큰 (색상, 간격, 폰트 등)
│   │   │                                     # CSS 변수로 정의, 테마 전환 지원
│   │   │                                     # 예: --color-primary, --spacing-md
│   │   │
│   │   └── global.css                        # 전역 스타일
│   │                                         # 리셋, 기본 타이포그래피, 유틸리티 클래스
│   │
│   ├── schemas/                              # 🔥 모든 데이터 모델 (중앙 집중)
│   │   │                                     # 🚫 domains/ 내 schemas 생성 절대 금지
│   │   │                                     # ✅ ESLint로 강제
│   │   │
│   │   ├── infra/                            # Infrastructure 도메인 모델
│   │   │   ├── Device.ts                     # 장치 (ESP32, RaspberryPi 등)
│   │   │   ├── Network.ts                    # 네트워크 설정
│   │   │   └── index.ts                      # Re-export
│   │   │
│   │   ├── erp/                              # ERP 도메인 모델
│   │   │   ├── Component.ts                  # 부품 (릴레이, 앰프 등)
│   │   │   ├── Project.ts                    # 프로젝트
│   │   │   ├── Document.ts                   # 문서
│   │   │   └── index.ts
│   │   │
│   │   ├── node/                             # Node 도메인 모델
│   │   │   ├── Node.ts                       # 노드 정의
│   │   │   ├── Connection.ts                 # 노드 간 연결
│   │   │   ├── Port.ts                       # 입출력 포트
│   │   │   └── index.ts
│   │   │
│   │   ├── board/                            # Board 도메인 모델
│   │   │   ├── Dashboard.ts                  # 대시보드
│   │   │   ├── Widget.ts                     # 위젯
│   │   │   └── index.ts
│   │   │
│   │   ├── teach/                            # Teach 도메인 모델
│   │   │   ├── Scenario.ts                   # 시나리오 (녹화된 액션)
│   │   │   ├── Action.ts                     # 개별 액션
│   │   │   └── index.ts
│   │   │
│   │   ├── common/                           # 공통 모델
│   │   │   ├── User.ts                       # 사용자
│   │   │   ├── Permission.ts                 # 권한
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                          # 전체 Re-export
│   │                                         # import { Device, Project } from '@system/schemas';
│   │
│   ├── composables/                          # 전역 Composable 함수
│   │   │                                     # Vue 3 Composition API 기반
│   │   │
│   │   ├── communication/                    # 통신 관련
│   │   │   ├── useEventBus.ts                # 🔥 이벤트 버스 (left/content/right 통신)
│   │   │   │                                 # - emit(): 이벤트 발행
│   │   │   │                                 # - on(): 이벤트 구독
│   │   │   │                                 # - off(): 구독 해제
│   │   │   │                                 # 사용처: 도메인 내부 컴포넌트 간 통신
│   │   │   │
│   │   │   ├── useDomainIntercom.ts          # 도메인 간 통신
│   │   │   │                                 # 예: NODE → PANNEL 데이터 전달
│   │   │   │
│   │   │   └── useMQTT.ts                    # MQTT 통신 (IoT 장비)
│   │   │                                     # - connect(), publish(), subscribe()
│   │   │
│   │   ├── state/                            # 상태 관리 관련
│   │   │   ├── useSystemWatcher.ts           # 시스템 상태 감시
│   │   │   │                                 # - 성능 모니터링
│   │   │   │                                 # - 에러 추적
│   │   │   │
│   │   │   └── useGlobalState.ts             # 전역 상태 접근 헬퍼
│   │   │                                     # systemState.ts 래퍼
│   │   │
│   │   ├── hardware/                         # 하드웨어 관련
│   │   │   └── useDeviceConnection.ts        # 장치 연결 관리
│   │   │                                     # - 연결 상태 추적
│   │   │                                     # - 재연결 로직
│   │   │
│   │   └── index.ts                          # 전체 Re-export
│   │
│   ├── components/                           # 시스템 공통 UI 컴포넌트
│   │   │                                     # 🎨 모든 도메인에서 사용
│   │   │                                     # Quasar 컴포넌트 래핑 + 커스터마이징
│   │   │
│   │   ├── BaseButton.vue                    # 표준 버튼
│   │   │                                     # variants: primary, secondary, danger
│   │   │
│   │   ├── BaseInput.vue                     # 표준 입력 필드
│   │   │                                     # validation, error handling 내장
│   │   │
│   │   ├── BaseCard.vue                      # 표준 카드
│   │   │                                     # 그림자, 패딩, 호버 효과
│   │   │
│   │   ├── BaseModal.vue                     # 표준 모달
│   │   ├── BaseTable.vue                     # 표준 테이블
│   │   ├── BaseTabs.vue                      # 표준 탭
│   │   │
│   │   └── index.ts                          # 전체 export
│   │
│   └── utils/                                # 전역 유틸리티 함수
│       ├── validation.ts                     # 검증 함수
│       │                                     # validateEmail, validateIP 등
│       │
│       ├── formatting.ts                     # 포맷팅 함수
│       │                                     # formatDate, formatCurrency 등
│       │
│       ├── storage.ts                        # 로컬 스토리지 헬퍼
│       ├── http.ts                           # HTTP 요청 래퍼
│       │
│       └── index.ts                          # 전체 Re-export
│
├── domains/                                  # 🎭 독립 도메인 (메뉴별 기능)
│   │                                         # 역할: 실제 비즈니스 로직 및 화면
│   │                                         # 각 도메인은 독립적으로 개발 가능
│   │
│   ├── infra/                                # 🏗️ Infrastructure (구 SYSTEM 메뉴)
│   │   │                                     # 역할: 모든 프로젝트의 시작점
│   │   │                                     # 하드웨어/네트워크 관리
│   │   │
│   │   ├── views/                            # 메뉴 화면들
│   │   │   │                                 # 🔥 반드시 left/content/right 구조
│   │   │   │
│   │   │   ├── my-devices/                   # 📱 장치 관리 메뉴
│   │   │   │   ├── left/                     # Quasar Drawer 왼쪽
│   │   │   │   │   ├── DeviceTree.vue        # 장치 트리 (계층 구조)
│   │   │   │   │   └── DeviceFilter.vue      # 필터 (타입, 상태별)
│   │   │   │   │
│   │   │   │   ├── content/                  # 중앙 메인 영역
│   │   │   │   │   └── DeviceWizard.vue      # 장치 등록 마법사
│   │   │   │   │                             # 단계별 입력 폼
│   │   │   │   │
│   │   │   │   ├── right/                    # Quasar Drawer 오른쪽
│   │   │   │   │   ├── DeviceSettings.vue    # 선택된 장치 설정
│   │   │   │   │   │                         # IP, 펌웨어 버전 등
│   │   │   │   │   │
│   │   │   │   │   └── DeviceLogs.vue        # 실시간 로그 스트림
│   │   │   │   │                             # WebSocket 기반
│   │   │   │   │
│   │   │   │   └── index.vue                 # 3단 조립
│   │   │   │                                 # MainLayout 사용, 슬롯에 배치
│   │   │   │
│   │   │   └── physical-map/                 # 🗺️ 물리적 배치도 메뉴
│   │   │       ├── left/
│   │   │       │   └── ZoneNavigator.vue     # 영역/층 네비게이션
│   │   │       │                             # 예: 1층, 2층, 창고
│   │   │       │
│   │   │       ├── content/
│   │   │       │   └── MapCanvas.vue         # 캔버스 기반 맵 렌더링
│   │   │       │                             # 드래그 앤 드롭으로 장치 배치
│   │   │       │
│   │   │       ├── right/
│   │   │       │   └── ObjectProperties.vue  # 선택된 오브젝트 속성
│   │   │       │                             # 위치, 회전, 연결 상태
│   │   │       │
│   │   │       └── index.vue
│   │   │
│   │   ├── store/                            # Infra 로컬 상태 관리
│   │   │   └── index.ts                      # Pinia 스토어
│   │   │                                     # - devices: 장치 목록
│   │   │                                     # - selectedDevice: 선택된 장치
│   │   │                                     # - filterOptions: 필터 상태
│   │   │
│   │   ├── components/                       # Infra 전용 컴포넌트
│   │   │   ├── DeviceCard.vue                # 장치 카드 UI
│   │   │   │                                 # 상태 배지, 온라인/오프라인
│   │   │   │
│   │   │   └── StatusBadge.vue               # 상태 표시 배지
│   │   │                                     # 색상: 녹색(online), 빨강(error)
│   │   │
│   │   ├── composables/                      # Infra 전용 로직
│   │   │   └── useDeviceMonitor.ts           # 장치 모니터링 로직
│   │   │                                     # 주기적 헬스 체크
│   │   │
│   │   ├── api/                              # Infra API 호출
│   │   │   └── devices.ts                    # 장치 관련 API
│   │   │                                     # GET /devices, POST /devices 등
│   │   │
│   │   ├── config.ts                         # 🔥 도메인 메타데이터
│   │   │                                     # - id, name, icon
│   │   │                                     # - menus 배열 (자동 라우팅)
│   │   │                                     # - onInit, onDestroy 훅
│   │   │
│   │   └── index.vue                         # 도메인 루트 컴포넌트
│   │                                         # router-view로 하위 메뉴 렌더링
│   │
│   ├── erp/                                  # 📊 ERP (Enterprise Resource Planning)
│   │   │                                     # 역할: 프로젝트/부품/문서 통합 관리
│   │   │
│   │   ├── views/
│   │   │   ├── components/                   # 📦 부품 관리 메뉴
│   │   │   │   ├── left/                     # 부품 카테고리 트리
│   │   │   │   ├── content/                  # 부품 목록 + 검색
│   │   │   │   ├── right/                    # 부품 상세 + 재고
│   │   │   │   └── index.vue
│   │   │   │
│   │   │   ├── projects/                     # 📁 프로젝트 관리 메뉴
│   │   │   │   ├── left/                     # 프로젝트 목록
│   │   │   │   ├── content/                  # 프로젝트 상세 (개요, 예산)
│   │   │   │   ├── right/                    # 타임라인 + 할 일
│   │   │   │   └── index.vue
│   │   │   │
│   │   │   └── documents/                    # 📄 문서 관리 메뉴
│   │   │       ├── left/                     # 폴더 구조
│   │   │       ├── content/                  # 문서 편집기 (NexaBlock 사용)
│   │   │       ├── right/                    # 버전 히스토리
│   │   │       └── index.vue
│   │   │
│   │   ├── store/
│   │   │   └── index.ts                      # components, projects 상태
│   │   │
│   │   ├── components/
│   │   │   ├── ComponentCard.vue             # 부품 카드
│   │   │   └── ProjectTimeline.vue           # 프로젝트 타임라인
│   │   │
│   │   ├── composables/
│   │   │   └── useInventory.ts               # 재고 관리 로직
│   │   │
│   │   ├── api/
│   │   │   ├── components.ts
│   │   │   ├── projects.ts
│   │   │   └── documents.ts
│   │   │
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   ├── board/                                # 📊 NexaBoard 도메인
│   │   │                                     # 역할: 커스텀 대시보드 생성
│   │   │                                     # 패널 드래그 앤 드롭, 자유 배치
│   │   │
│   │   ├── views/
│   │   │   └── dashboard/
│   │   │       ├── left/                     # 대시보드 목록
│   │   │       ├── content/                  # 그리드 에디터 (NexaBoard 엔진)
│   │   │       ├── right/                    # 위젯 라이브러리
│   │   │       └── index.vue
│   │   ├── store/
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   ├── pannel/                               # 🎨 NexaPanel 도메인
│   │   │                                     # 역할: 동일 데이터 → 다중 뷰
│   │   │                                     # 예: 온도 데이터 → 그래프/테이블/게이지
│   │   │
│   │   ├── views/
│   │   │   └── viewer/
│   │   │       ├── left/                     # 데이터 소스 선택
│   │   │       ├── content/                  # 뷰 렌더러 (NexaPanel 엔진)
│   │   │       ├── right/                    # 뷰 타입 선택 (그래프/테이블 등)
│   │   │       └── index.vue
│   │   ├── store/
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   ├── node/                                 # 🔗 NexaNode 도메인
│   │   │                                     # 역할: 비주얼 프로그래밍
│   │   │                                     # IoT 장비 연결, 데이터 흐름 설계
│   │   │
│   │   ├── views/
│   │   │   └── editor/
│   │   │       ├── left/                     # 노드 라이브러리 (입력/출력/처리)
│   │   │       ├── content/                  # 캔버스 (NexaDiagram 엔진)
│   │   │       ├── right/                    # 선택된 노드 속성
│   │   │       └── index.vue
│   │   ├── store/
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   ├── teach/                                # 🎬 NexaTeach 도메인
│   │   │                                     # 역할: 액션 녹화 → 시나리오 자동화
│   │   │                                     # UI 조작 + 하드웨어 명령 녹화
│   │   │
│   │   ├── views/
│   │   │   └── recorder/
│   │   │       ├── left/                     # 시나리오 목록
│   │   │       ├── content/                  # 타임라인 에디터
│   │   │       ├── right/                    # 녹화 컨트롤 (시작/중지/편집)
│   │   │       └── index.vue
│   │   ├── store/
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   ├── network/                              # 🌐 Network 도메인
│   │   │                                     # 역할: 네트워크 토폴로지 시각화
│   │   │                                     # MQTT, WebSocket 모니터링
│   │   ├── views/
│   │   ├── store/
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   ├── portfolio/                            # 🖼️ Portfolio 도메인
│   │   │                                     # 역할: 완성 프로젝트 갤러리
│   │   │                                     # 공개/비공개, 사진/영상 첨부
│   │   ├── views/
│   │   ├── store/
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   ├── solutions/                            # 💡 Solutions 도메인
│   │   │                                     # 역할: 아이디어 공유 + 협업
│   │   │                                     # 비전 단계 → ERP로 fork
│   │   ├── views/
│   │   ├── store/
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   ├── extension/                            # 🧩 Extension 도메인
│   │   │                                     # 역할: 플러그인 관리
│   │   │                                     # 설치/제거, 마켓플레이스
│   │   ├── views/
│   │   ├── store/
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   ├── help/                                 # ❓ Help 도메인
│   │   │                                     # 역할: 도움말, FAQ, 튜토리얼
│   │   ├── views/
│   │   ├── store/
│   │   ├── config.ts
│   │   └── index.vue
│   │
│   └── dev/                                  # 🛠️ Dev 도메인
│       │                                     # 역할: 개발자 도구
│       │                                     # - API 테스터
│       │                                     # - .md 파일 뷰어
│       │                                     # - 테마 색상 에디터
│       │                                     # - 의존성 분석
│       │                                     # - (미래) AI 코딩 어시스턴트
│       ├── views/
│       ├── store/
│       ├── config.ts
│       └── index.vue
│
└── App.vue                                   # 🚪 애플리케이션 진입점
                                              # - Vue Router 마운트
                                              # - 전역 에러 핸들링
                                              # - 초기 로딩 화면
```

---

## **📋 주요 규칙 요약:**

### **1. 절대 금지 사항 (ESLint 강제)**

```
❌ domains/{domain}/schemas/      # 스키마는 system/schemas/만
❌ domains/{domain}/types/         # 타입도 system/schemas/로 통합
❌ domains/{domain}/models/        # 모델도 system/schemas/로
❌ domains/{domain}/css/tokens.css # 디자인 토큰은 system/css/만
```

### **2. 필수 구조 (모든 도메인)**

```
✅ views/{menu}/left/              # Quasar Drawer 왼쪽
✅ views/{menu}/content/           # 메인 중앙 영역
✅ views/{menu}/right/             # Quasar Drawer 오른쪽
✅ views/{menu}/index.vue          # 3단 조립
✅ config.ts                       # 도메인 메타데이터
✅ index.vue                       # 도메인 루트
```

### **3. 선택 구조 (필요 시)**

```
⭕ store/                          # 도메인 로컬 상태
⭕ components/                     # 도메인 전용 컴포넌트
⭕ composables/                    # 도메인 전용 로직
⭕ api/                            # 도메인 API 호출
⭕ utils/                          # 도메인 전용 유틸
```

---

## **🔄 통신 패턴:**

### **도메인 내부 (left ↔ content ↔ right)**

```typescript
// useEventBus 사용
import { useEventBus } from '@system/composables/communication/useEventBus';

// left → content
eventBus.emit('filter:changed', { type: 'online' });

// content 에서 구독
eventBus.on('filter:changed', (filter) => { ... });
```

### **도메인 간 (infra ↔ node)**

```typescript
// useDomainIntercom 사용
import { useDomainIntercom } from "@system/composables/communication/useDomainIntercom";

// infra → node로 장치 데이터 전달
domainIntercom.send("node", "device:selected", deviceData);
```

---

## **🎯 경로 별칭:**

```json
{
    "paths": {
        "@/*": ["src/*"],
        "@frame/*": ["src/frame/*"],
        "@engines/*": ["src/engines/*"],
        "@system/*": ["src/system/*"],
        "@domains/*": ["src/domains/*"]
    }
}
```

---

## **✅ 최종 검증 체크리스트:**

-   [x] `frame/` 폴더명 확정
-   [x] `eventBus` 위치 명확화 (system/composables/communication/)
-   [x] `domainRegistry` 위치 명확화 (frame/registry/)
-   [x] 모든 도메인 views/ 하위 구조 명시
-   [x] 각 폴더 역할 및 사용처 주석 추가
-   [x] 금지/필수/선택 구조 명확화
-   [x] 통신 패턴 예시 추가
-   [x] U2BeeLayout.vue 용도 명시 (크롬 확장)

---

## ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨

#### **1. `frame/` - 플랫폼 뼈대**

```
frame/
├── layout/       - Quasar Drawer 3단 레이아웃 (왼쪽 네비, 중앙 컨텐츠, 오른쪽 상세)
├── registry/     - 도메인 동적 관리 (domainRegistry)
├── router/       - 전체 라우팅 + Infra 리다이렉션
└── boot/         - 앱 초기화
```

**Infra 리다이렉션 가드:**

```javascript
// frame/router/guards.ts
router.beforeEach((to, from, next) => {
    // 방문 횟수/경험치 기반 Infra 유도
    if (to.path === "/" || !store.state.infraCompleted) {
        if (to.name !== "infra") {
            return next({ name: "infra" });
        }
    }
    next();
});
```

---

#### **2. `engines/` - 재사용 가능한 엔진**

```
engines/@nexa/
├── block/      - Notion 스타일 블록 빌더
├── board/      - 대시보드 렌더러
├── panel/      - 패널 시스템
├── diagram/    - 노드 에디터
├── sound/      - 사운드 처리
└── charts/     - 차트 시각화
```

**나중에 npm 패키지 분리 가능:**

```bash
npm install @nexa/block-engine
npm install @nexa/diagram-engine
```

---

#### **3. `system/` - 전역 표준 (Strict Layer)**

**"도메인 내 schemas 생성 금지"**

```
system/
├── css/
├── schemas/              ⭐ 모든 데이터 모델 (도메인 생성 금지)
│   ├── infra/
│   ├── erp/
│   └── node/
├── store/                ⭐ 전역 상태
│   └── systemState.ts
├── composables/
│   ├── communication/
│   │   ├── useEventBus.ts    ⭐ left/content/right 통신
│   │   ├── useDomainIntercom.ts
│   │   └── useMQTT.ts
│   ├── state/
│   └── hardware/
├── components/           # 시스템 공통 UI
└── utils/
```

**예시:**

```typescript
// system/schemas/infra/Device.ts
export interface Device {
    id: string;
    name: string;
    type: "esp32" | "raspberry-pi" | "amp";
    status: "online" | "offline" | "error";
    ip: string;
    lastSeen: Date;
}

// ❌ 금지: domains/infra/schemas/Device.ts
// ✅ 강제: import { Device } from '@system/schemas/infra';
```

**ESLint 강제:**

```javascript
// .eslintrc.js
rules: {
  'no-restricted-imports': ['error', {
    patterns: [{
      group: ['**/domains/*/schemas/*'],
      message: '❌ 도메인 내 schemas 생성 금지! @system/schemas 사용하세요.'
    }]
  }]
}
```

---

#### **4. `domains/` - 독립 프로젝트 구조**

**3단 레이아웃 강제:**

```
domains/{메인메뉴}/
├── views/
│   └── {서브메뉴}/
│       ├── left/       # Quasar Drawer 왼쪽 (네비게이션)
│       ├── content/    # 중앙 메인 영역
│       └── right/      # Quasar Drawer 오른쪽 (상세)
├── store/              # 도메인 로컬 상태
├── components/
├── composables/
├── config.ts           ⭐ 도메인 메타데이터
└── index.vue
```

**left/content/right 간 통신:**

```typescript
// ⭐ 이벤트 통신
import { eventBus } from "@system/composables/communication/useEventBus";

// left/ → content/
eventBus.emit("filter:changed", filterData);

// content/ → right/
eventBus.emit("device:selected", deviceData);
```

**`config.ts` 예시:**

```typescript
// domains/infra/config.ts
export default {
    id: "infra",
    name: "Infrastructure",
    icon: "settings",
    menus: [
        { id: "my-devices", name: "My Devices", path: "/infra/devices" },
        { id: "physical-map", name: "Physical Map", path: "/infra/map" },
    ],
    requiredExtensions: [],
    permissions: ["admin"],
};
```

---

#### **5. 동적 로딩 구조**

**자동 라우팅:**

```javascript
const domainModules = import.meta.glob("@/domains/*/config.ts", { eager: true });

const routes = Object.entries(domainModules).map(([path, module]) => {
    const config = module.default;
    return {
        path: `/${config.id}`,
        name: config.id,
        component: () => import(`@/domains/${config.id}/index.vue`),
        meta: {
            title: config.name,
            icon: config.icon,
            permissions: config.permissions,
        },
        children: config.menus.map((menu) => ({
            path: menu.id,
            name: `${config.id}-${menu.id}`,
            component: () => import(`@/domains/${config.id}/views/${menu.id}/index.vue`),
        })),
    };
});

export default routes;
```

**장점:**

-   ✅ 새 도메인 추가 시 `config.ts`만 작성 → 자동 등록
-   ✅ 라우터 수동 수정 불필요

---

#### **6. domainRegistry 상세 구조**

```typescript
// frame/registry/domainRegistry.ts  ⭐ 경로 수정
import { eventBus } from '@system/composables/communication/useEventBus';  ⭐ import 추가

interface DomainState {
  loaded: boolean;
  active: boolean;
  config: DomainConfig;
  store?: any;
}

export const domainRegistry = {
  domains: new Map<string, DomainState>(),

  async loadDomain(domainId: string) {
    if (this.domains.has(domainId)) return;

    // 1. config 로드
    const config = await import(`@/domains/${domainId}/config.ts`);

    // 2. store 로드 (있으면)
    let store;
    try {
      store = await import(`@/domains/${domainId}/store/index.ts`);
    } catch {}

    // 3. 등록
    this.domains.set(domainId, {
      loaded: true,
      active: false,
      config: config.default,
      store: store?.default
    });
  },

  activateDomain(domainId: string) {
    // 이전 활성 도메인 비활성화
    for (const [id, state] of this.domains) {
      state.active = (id === domainId);
    }

    // 이벤트 발행
    eventBus.emit('domain:activated', domainId);
  }
};
```

---

### **🎯 핵심 원칙 요약:**

#### **1. 철저한 분리**

```
frame/     - 플랫폼 틀 (변경 최소화)
engines/   - 재사용 엔진 (독립적)
system/    - 전역 표준 (강제)
domains/   - 독립 프로젝트 (자유도 높음)
```

#### **2. 강제 규칙**

```
✅ 모든 스키마: system/schemas/
✅ 도메인 내 schemas/ 생성 금지
✅ 3단 Quasar Drawer 레이아웃 (left/content/right) 준수
✅ left/content/right 간 통신:
   - 이벤트: useEventBus
   - 상태: systemState (전역) 또는 domain/store (로컬)
✅ config.ts로 도메인 메타데이터 정의
```

#### **3. 자동화**

```
✅ 도메인 자동 로딩 (config.ts 기반)
✅ 라우터 자동 생성
✅ 메뉴 자동 등록
```

### **📝 체크리스트 (리팩토링 시):**

```
[ ] ESLint 규칙 추가 (도메인 내 schemas 생성 금지)
[ ] TypeScript 경로 별칭 설정
    @/core, @/engines, @/system, @/domains
[ ] config.ts 템플릿 작성
[ ] 동적 라우팅 구현
[ ] domainRegistry 구현
[ ] 기존 코드 마이그레이션 계획
[ ] 문서 작성 (CONTRIBUTING.md, STRUCTURE.md)
```

---

## ✨**추가 적인 체크 리스트** ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨

---

## ** 실전 가이드 (리팩토링 체크리스트):**

### **Step 1: 기본 구조 생성**

```bash
# 폴더 생성 스크립트
mkdir -p src/{frame,engines,system,domains}
mkdir -p src/frame/{layout,registry,router,boot}
mkdir -p src/engines/@nexa/{block,board,panel,diagram,sound,charts}
mkdir -p src/system/{css,schemas,store,composables,components,utils}
mkdir -p src/domains/{infra,erp,board,pannel,node,teach}
```

### **Step 2: TypeScript 경로 별칭 설정**

```json
// tsconfig.json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"],
            "@frame/*": ["src/frame/*"],
            "@engines/*": ["src/engines/*"],
            "@system/*": ["src/system/*"],
            "@domains/*": ["src/domains/*"]
        }
    }
}
```

### **Step 3: ESLint 규칙 추가**

```javascript
// .eslintrc.js
module.exports = {
    rules: {
        // ❌ 도메인 내 schemas 생성 금지
        "no-restricted-imports": [
            "error",
            {
                patterns: [
                    {
                        group: ["**/domains/*/schemas/*", "**/domains/*/*/schemas/*"],
                        message: "❌ 도메인 내 schemas 생성 금지! @system/schemas를 사용하세요.",
                    },
                ],
            },
        ],

        // ⚠️ system/ 외부에서 system/schemas import 시 경고
        "import/no-restricted-paths": [
            "warn",
            {
                zones: [
                    {
                        target: "./src/domains",
                        from: "./src/system/schemas",
                        message: "✅ @system/schemas에서 import하세요 (절대경로 권장)",
                    },
                ],
            },
        ],
    },
};
```

### **Step 4: 도메인 config.ts 템플릿**

```typescript
// domains/infra/config.ts
export default {
    id: "infra",
    name: "Infrastructure",
    icon: "settings",
    description: "하드웨어 및 네트워크 관리",

    // 하위 메뉴 정의 (자동 라우팅)
    menus: [
        {
            id: "my-devices",
            name: "My Devices",
            path: "/infra/devices",
            icon: "device_hub",
        },
        {
            id: "physical-map",
            name: "Physical Map",
            path: "/infra/map",
            icon: "map",
        },
    ],

    // 의존성
    requiredExtensions: [], // 필요한 Extension
    requiredEngines: ["@nexa/diagram"], // 필요한 Engine

    // 권한
    permissions: ["admin", "developer"],

    // 초기화 훅
    async onInit() {
        console.log("Infra domain initialized");
    },

    // 정리 훅
    async onDestroy() {
        console.log("Infra domain destroyed");
    },
};
```

### **Step 5: 동적 라우팅 구현**

```typescript
// frame/router/dynamicRoutes.ts
import type { RouteRecordRaw } from "vue-router";

// Vite의 glob import로 모든 도메인 config 로드
const domainConfigs = import.meta.glob<{ default: DomainConfig }>("@/domains/*/config.ts", { eager: true });

export function generateDomainRoutes(): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = [];

    for (const [path, module] of Object.entries(domainConfigs)) {
        const config = module.default;
        const domainId = config.id;

        // 도메인 루트 라우트
        const domainRoute: RouteRecordRaw = {
            path: `/${domainId}`,
            name: domainId,
            component: () => import(`@/domains/${domainId}/index.vue`),
            meta: {
                title: config.name,
                icon: config.icon,
                permissions: config.permissions,
            },
            children: [],
        };

        // 하위 메뉴 라우트 자동 생성
        for (const menu of config.menus) {
            domainRoute.children!.push({
                path: menu.id,
                name: `${domainId}-${menu.id}`,
                component: () => import(`@/domains/${domainId}/views/${menu.id}/index.vue`),
                meta: {
                    title: menu.name,
                    icon: menu.icon,
                },
            });
        }

        routes.push(domainRoute);
    }

    return routes;
}
```

### **Step 6: domainRegistry 구현**

```typescript
// frame/registry/domainRegistry.ts
import { reactive } from "vue";
import { eventBus } from "@system/composables/communication/useEventBus";
import type { DomainConfig } from "@/types";

interface DomainState {
    loaded: boolean;
    active: boolean;
    config: DomainConfig;
    store?: any;
}

export const domainRegistry = reactive({
    domains: new Map<string, DomainState>(),

    async loadDomain(domainId: string) {
        if (this.domains.has(domainId)) return;

        // 1. config 로드
        const configModule = await import(`@/domains/${domainId}/config.ts`);
        const config = configModule.default;

        // 2. store 로드 (있으면)
        let store;
        try {
            const storeModule = await import(`@/domains/${domainId}/store/index.ts`);
            store = storeModule.default;
        } catch {
            // store 없음 (optional)
        }

        // 3. 초기화 훅 실행
        if (config.onInit) {
            await config.onInit();
        }

        // 4. 등록
        this.domains.set(domainId, {
            loaded: true,
            active: false,
            config,
            store,
        });

        console.log(`✅ Domain loaded: ${domainId}`);
    },

    activateDomain(domainId: string) {
        // 이전 활성 도메인 비활성화
        for (const [id, state] of this.domains) {
            state.active = id === domainId;
        }

        // 이벤트 발행
        eventBus.emit("domain:activated", domainId);
    },

    async unloadDomain(domainId: string) {
        const state = this.domains.get(domainId);
        if (!state) return;

        // 정리 훅 실행
        if (state.config.onDestroy) {
            await state.config.onDestroy();
        }

        this.domains.delete(domainId);
        console.log(`🗑️ Domain unloaded: ${domainId}`);
    },
});
```

### **Step 7: README 템플릿**

```markdown
<!-- domains/infra/README.md -->

# Infra Domain

> 하드웨어 및 네트워크 인프라 관리 도메인

## 📁 구조

### views/ (메뉴 화면)

각 메뉴는 **반드시** `left/`, `content/`, `right/` 3단 구조:

-   `my-devices/` - 장치 등록 및 관리
-   `physical-map/` - 물리적 배치도

### store/ (상태 관리)

Infra 도메인 전용 상태 관리

### components/ (재사용 컴포넌트)

Infra 도메인 내에서만 사용되는 컴포넌트

### composables/ (로직)

Infra 도메인 전용 Composable 함수

### api/ (API 호출)

백엔드 통신 로직

## 🚫 금지사항

-   ❌ `schemas/` 폴더 생성 금지 → `@system/schemas` 사용
-   ❌ 메뉴 폴더에 `left/`, `content/`, `right/` 외 파일 직접 배치 금지

## 📝 새 메뉴 추가 방법

1. `views/{menu-name}/` 폴더 생성
2. `left/`, `content/`, `right/` 하위 폴더 생성
3. `index.vue` 생성 (3단 조립)
4. `config.ts`의 `menus` 배열에 추가

→ 자동으로 라우팅 생성됨!
```

---

## **마이그레이션 순서 (기존 코드):**

### **Phase 1: 뼈대 먼저**

```
1. frame/ 구조 생성
2. system/ 구조 생성
3. 기존 전역 파일 이동 (layouts, utils, components)
```

### **Phase 2: 도메인 하나씩**

```
1. infra/ 완전히 이동 및 리팩토링
2. 테스트
3. erp/ 이동
4. 테스트
5. ...반복
```

### **Phase 3: 정리**

```
1. 사용 안 하는 파일 정리
2. import 경로 일괄 변경 (절대경로로)
3. ESLint 에러 수정
```

---
