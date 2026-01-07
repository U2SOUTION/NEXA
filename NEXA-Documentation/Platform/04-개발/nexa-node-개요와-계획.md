## ✨ NEXA NODE 구현 개요

### 1. 목적

-   시각적 노드 기반으로 IoT 자동화 규칙을 구성하여 복잡한 흐름을 직관적으로 설계하고 엔진 연동 전에 검증.
-   사이드바를 통해 자산(노드/패널/컴포지션)을 탐색하고, 중앙 캔버스에서 Blueprint를 구성하며 우측에서 상세 설정을 다루는 역할 분리.
-   D3.js 기반 다이어그램과 시뮬레이터를 결합하여 설계도+가상 하드웨어 데이터를 통합 관리.

### 2. 핵심 기술 구조 & 데이터 흐름

-   **Layout**: `NexaNodePage`가 헤더+탭+캔버스/시뮬레이터 레이아웃을 담당하며, `NexaNodeSidebar`는 자산/명령 버튼, 시물레이터 트리거 역할.
-   **Store 중심**: `nexaNodeStore` (Pinia)를 통해 `canvasNodes/links`, Blueprint 생성 함수 `createDefaultBlueprint`, `canvasReady`, 시뮬레이터 표시 여부, 시뮬레이터 상태 제어(`openSimulator/closeSimulator`)를 중앙 관리.
-   **데이터 흐름**: `[New]` 버튼 → `createDefaultBlueprint` → Blueprint(포뮬레이터+연결) 생성 → `canvasNodes/canvasLinks` 계산적 getter → `NodeCanvas` 전달 → D3 svg 렌더링. 시뮬레이터는 sidebar 버튼 → `isSimulatorVisible` flag → `VirtualCanvas` + `VirtualIotDevice` 표현.
-   **VDM/어댑터**: `VirtualDeviceManager`가 장비 등록/ID 회전/포트 변경 이벤트를 제공하고, `VirtualNodeAdapter`가 이를 D3 구조로 변환하여 `VirtualCanvas`에서 `renderForceDirected`로 다시 렌더링.

### 3. TypeScript + 스키마 현황

-   거의 모든 상태 및 로직이 TypeScript 기반: `nexaNodeStore`가 `Blueprint` 타입을 import하여 작업하며 Pinia store 내부 필드에 명시적 타입 정의.
-   `src/schemas/` 디렉토리(Zod)에는 `Blueprint`, `Formulator`, `Panel`, `Connection` 등 핵심 스키마가 정의되어 있어 store 생성 시 메타데이터와 인터페이스 정합성을 확보.
-   `virtual` 컴포넌트, D3 렌더러(`ForceDirectedDiagram.js` 등) 일부는 JS지만 store/controller와 interface로 연결되어 있기 때문에 타입 추론을 통해 안정성 확보.

### 4. 스토어 사용 현황

-   `nexaNodeStore`: `viewMode`, `activeBlueprint`, `selectedElement`, `canvasReady`, `canvasNodes/links`, `createDefaultBlueprint`, `resetBlueprint`, `isSimulatorVisible`, `openSimulator`, `closeSimulator`.
-   Pinia `storeToRefs`로 Vue 컴포넌트가 실시간 상태를 구독하며, UI 조작(헤더 클릭, New 버튼, 시뮬레이터 닫기 등)에서 직접 store 액션을 호출.
-   Blueprint는 `metadata`/`composition`/`runtime` 구조로 구성되며, `canvasNodes` getter에서 `FormulatorGroupEnum`을 기반으로 D3 위치를 임시 할당.

### 5. D3.js 사용 현황

-   `NodeCanvas`와 `VirtualCanvas` 모두 `d3.select`/`zoom`/SVG 요소를 직접 조작하여 node/link/hover 스타일링 및 마커 처리.
-   `VirtualCanvas`는 `ForceDirectedDiagram` 렌더러를 재사용하며, `diagramTypes`/`diagramSettings`에서 정의된 설정(`dependency`, `iot-network`)에 따라 force 시뮬레이션 파라미터를 조정.
-   `NexaDiagram` 컴포넌트는 여러 renderer(`renderForceDirected`, `renderFileTree` 등)를 추상화하고 이벤트(`node-click`, `loaded`)를 emit하여 상위에서 상태/히스토리를 제어할 수 있게 함.

### 6. 개선해야 할 점

-   **Blueprint 저장/복원**: 현재 기본 Blueprint만 생성되고, 캔버스 상태 저장/불러오기 로직이 미완. `flowManager` 연동 전에도 JSON persistence 확립 필요.
-   **노드 포지션 관리**: `canvasNodes` getter가 정적 x/y를 부여하므로, D3로 그려진 이후 위치 동기화가 없음. 좌표 저장/갱신 체계를 도입해야 함.
-   **D3 이벤트 추적**: 노드 클릭/드래그 이벤트가 store나 sidebar와 완전하게 연결되지 않아 연동 부족. 선택 노드 ID를 store와 sync, 인스펙터 연동 예정.
-   **시뮬레이터 데이터량**: ForceDirected 설정/thresholds는 constants; 장비 수가 늘어나면 성능 최적화(히트맵, level-of-detail) 검토 필요.
-   **TypeScript 점진 확장**: 일부 D3/VDM 파일이 JS로 남아 있어 타입 정의 부재. 점진적인 `.ts` 마이그레이션 또는 `.d.ts` 캡슐화를 권장.

### 7. 향후 방향

-   **캔버스 완성**: `NodeCanvas`는 `NodePalette`, `NodeInspector`와 연동하여 live editing/validation, wire 연결, snap grid 등 기능 추가.
-   **스토어 기반 엔진 통합**: `flowManager` 또는 evaluatorService와 Blueprint를 실시간으로 동기화하여 시뮬레이션 결과(예: 계산값, 상태 피드백)를 다시 UI에 반영.
-   **문서화 & 템플릿**: 자주 쓰는 composition을 저장/템플릿화 하고, documentation tools(GraphDoc 등)과 연계한 코드/구조 분석 기능 강화.
-   **공통 컴포넌트화**: `VirtualCanvas`/`VirtualIotDevice`처럼 D3 시각화+컨트롤 패널 팩을 재사용하여 다른 메뉴에서도 시뮬레이터 경험을 확대.

### 8. 프로그램 전체 목적 요약

-   `NEXA NODE`는 노드 기반 자동화 설계도(Blueprint)를 통해 IoT 자산/로직/시뮬레이터를 한 화면에서 구성하고, 사용자·AI·엔진 시나리오를 통합 관리하는 플랫폼입니다.
-   좌측 사이드바는 자산 탐색/액션 트리거, 오른쪽은 속성/로그/시뮬레이터, 중앙은 D3 캔버스, 스토어·스키마·D3·VDM이 데이터를 공유하며 신뢰성 높은 자동화 설계를 가능하게 합니다.
-   현재 기능은 초기 layout+simulate+store 연동 단계이며, 향후 저장/엔진/문서화 통합으로 “설계 → 검증 → 배포” 흐름을 완성하는 것이 목표입니다.
