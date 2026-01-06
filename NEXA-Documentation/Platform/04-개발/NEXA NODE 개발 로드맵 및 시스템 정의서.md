## ✨ NEXA NODE 개발 로드맵 및 시스템 정의서

### ✨ 1. 시스템의 목적 (Purpose)

-   \*\*IOT 장비의 원시 데이터" 를
-   **논리적 시각화**: 복잡한 자동화 규칙(Trigger → Process → Action)을 코드가 아닌 그래프로 표현하여 직관성을 극대화합니다.
-   **유연한 확장성**: 새로운 연산(Formulator)이나 데이터 입구(Panel)를 스키마 정의만으로 손쉽게 추가합니다.
-   **실시간 시뮬레이션**: 설계된 흐름을 물리적 하드웨어에 적용하기 전, 엔진을 통해 논리적 결함을 사전 검증합니다.

---

### ✨ 2. 핵심 기능 (Features)

-   **드래그 앤 드롭 팔레트**: 왼쪽 사이드바에서 노드를 선택하여 캔버스로 배치.
-   **동적 노드 연결**: 노드 사이의 입출력 단자(Ingredient)를 마우스로 연결하여 데이터 흐름 형성.
-   **실시간 인스펙터**: 선택된 노드의 설정(`settings`)을 우측 사이드바에서 실시간 수정.
-   **엔진 동기화**: UI에서 변경된 설계도(`Blueprint`)를 즉시 `flowManager`에 전달하여 결과값 산출.

---

### ✨ 3. 개발 진행 단계 (Development Steps)

| 단계      | 명칭              | 주요 작업 내용                                             | 관련 파일                              |
| --------- | ----------------- | ---------------------------------------------------------- | -------------------------------------- |
| **1단계** | **인프라 구축**   | 현재 완료된 파일 구조 생성 및 공통 레이아웃 배치           | `NexaNodePage.vue`, `sidebars/`        |
| **2단계** | **캔버스 시각화** | D3.js 연동, 그리드 배경 생성, 노드 드래그 및 줌(Zoom) 구현 | `NodeCanvas.vue`                       |
| **3단계** | **노드 렌더링**   | 스키마 데이터를 바탕으로 노드 박스와 입출력 단자 그리기    | `NodeCanvas.vue`, `FormulatorSchema`   |
| **4단계** | **연결선 로직**   | 노드 사이의 와이어(Wire) 연결 및 곡선 렌더링               | `ConnectionSchema`                     |
| **5단계** | **사이드바 연동** | 노드 리스트(Left)와 속성 편집기(Right) 기능 구현           | `NodePalette.vue`, `NodeInspector.vue` |
| **6단계** | **엔진 통합**     | 시각적 설계도를 `flowManager`에 던져 실시간 연산 결과 출력 | `evaluatorService.ts`                  |

---

## ✨ NEXA NODE 사이드바 컴포넌트 기능 확장 및 최종 파일 구조

'노드와 패널의 분리'라는 핵심 철학을 바탕으로, 노드의 다형성(Type)과 패널 삽입 시스템을 지원하기 위한 가장 고도화된 파일 구조를 설계해 드립니다. 왼쪽은 **'자산 탐색 및 공급'**, 오른쪽은 **'세부 튜닝 및 보조'**로 역할을 명확히 나누었습니다.

### ✨ 1. 확장된 파일 구조 (Final Directory Structure)

```text
src/
├── nodes/                    // [신규] 노드 타입별 독립 관리
│   ├── trigger/              // 트리거 계열 (Sensor, Timer...)
│   │   ├── SensorNode.ts     // 노드 정의 (설정 스키마, 기본값 등)
│   │   └── TimerNode.ts
│   ├── logic/                // 논리/연산 계열 (Math, Filter...)
│   │   ├── AdderNode.ts
│   │   └── ScalerNode.ts
│   └── action/               // 액션 계열 (Hardware, API...)
│       └── DeviceControl.ts
├── panels/                    // [기존] 패널 타입별 관리
│   ├── Gauge/
│   ├── Chart/
│   └── ...
├── components/
│   ├── sidebars/
│   │   ├── NexaNodeSidebar.vue           // 사이드바 메인 제어 컴포넌트
│   │   ├── left/
│   │   │   └── nexa-node/
│   │   │       ├── CanvasManage.vue      // 새 캔버스, 저장, 불러오기, 내보내기 등
│   │   │       ├── NodeLibrary.vue      // 노드 타입별 리스트 (Trigger/Math/Logic 등)
│   │   │       ├── PanelGallery.vue     // 장착 가능한 패널 검색 및 리스트 (Gauge/Chart 등)
│   │   │       └── AssetSearch.vue      // 통합 검색창 (노드 및 패널 검색)
│   │   └── right/
│   │       └── nexa-node/
│   │           ├── PropertyInspector.vue // 선택된 노드/패널의 상세 속성 편집
│   │           ├── NodeExecutionLog.vue  // 노드별 개별 실행 로그 및 상태 확인
│   │           └── DataPreview.vue      // 노드 단자에 흐르는 데이터 실시간 프리뷰
│   └── nexa-node/
│       ├── NodeCanvas.vue               // [핵심] D3.js 기반 메인 무대
│       ├── NodeFrame.vue                // 노드 공통 외형 (패널 슬롯 포함)
│       └── NodeToolbar.vue              // 상단 최소화 툴바 (저장, 스냅샷 등)

```

```text
src/
├── nodes/            // 노드의 "두뇌" (Logic & Schema)
├── panels/            // 노드에 장착될 "얼굴" (UI Modules)
├── services/engine/  // 노드들을 연결해 실행하는 "심장" (Flow Manager)
└── components/       // 이 모든 것을 화면에 그리는 "손" (Canvas, Sidebar)
```

## ✨ NEXA NODE 레이아웃과 기능과 UI 설계

캔버스는 **'시각적 흐름'**에만 집중하고, 모든 제어와 설정은 **사이드바**로 집중시켜 작업 효율을 극대화하는 구조입니다. <br>
왼쪽(생성 및 탐색)과 오른쪽(설정 및 검증)의 역할을 명확히 구분하여 기능을 확장해 보았습니다.<br>
사이드바가 풍부해짐에 따라 캔버스는 오직 아래의 동작에만 전념합니다.<br>

### NEXA MODE CAMVAS

-   **배치 (Layout):** 노드의 위치 관계 설정.
-   **연결 (Wiring):** 데이터의 흐름 경로 설정.
-   **그룹화 (Grouping):** 관련 노드들을 영역으로 묶어 가독성 확보.
-

#### 툴바

-   **View\*\*** + - / 1:1 / 꽉차기 / Grid / 줌 초기화 / 그리드 배경 토글
-   **Layout** Auto / Snap /물리 엔진 / 격자 정렬 / 선택 노드 수동이동
-   **Link** Bezier / 곡선 / 직각 /
-   **Engine** Mock / Live / 렌덤
-   **Control** ▶️ / ⏸️ / ⏭️,"시뮬레이션 실행, 일시정지, 단계별 실행"

#### 노드/패널에서 직접 표현할 요소 (즉시성)

-   I/O 데이터 값 (단자 옆): 입력/출력 단자 바로 옆에 작은 숫자로 현재 값이 떠 있어야 데이터가 흐르는 느낌이 납니다. (Live Monitor의 요약 버전)
-   노드 상태 아이콘: 정상(Green), 에러(Red), 대기(Yellow) 등의 상태를 노드 우상단에 작은 점이나 아이콘으로 표시합니다. (Status의 시각화)
-   장착된 패널: 게이지나 차트 그 자체는 노드 내부 슬롯에서 직접 작동해야 합니다.
-   간이 레이블: 노드의 이름(Label)은 당연히 노드 상단에 표시됩니다.

---

#### ⬅️ 왼쪽 사이드바 (공급 및 탐색)

주로 **리스트 형태**의 아이템을 캔버스로 던지기 위한 기능들입니다.

1.  Project Actions (기본 동작)

    -   새 캔버스 (New Canvas): 깨끗한 작업 공간 생성.
    -   캔버스 열기/불러오기 (Open/Load): 저장된 Composition 리스트에서 선택.
    -   캔버스 저장 (Save): 현재 상태를 DB 또는 파일로 저장.
    -   Export & Print (출력 및 공유)
    -   캔버스 내보내기 (Export): JSON 파일로 추출하거나 이미지(PNG/SVG)로 저장.
    -   캔버스 프린트 (Print): 현재 로직 구조를 문서화하기 위해 출력.
    -   Canvas Settings (캔버스 설정)
    -   캔버스 닫기 (Close): 작업 종료 및 초기 화면으로 복귀.

2.  **Node Library (노드 타입별 구분)** '노드 프레임' 은 공통이지만, 타입에 따라 내부 로직이 달라집니다.

        - **Standard Node:** 패널 없이 연산만 수행하는 순수 로직 노드.
        - **Trigger Type:** 시스템의 시작점 (Sensor Input, Timer, Webhook).
        - **Logic/Math Type:** 계산 및 조건 (Adder, Scaler, If-Else).
        - **Action Type:** 최종 출력 및 제어 (Hardware Control, Database Save).
        - **Visual Node:** 패널 슬롯이 활성화되어 시각화가 가능한 노드.
        - **Bridge Node:** 외부 시스템이나 하드웨어와 통신하는 인터페이스 노드.
        - **프로세스 (Processors):** MATH(연산), LOGIC(조건), FILTER, SCALER 등 `evaluatorService`가 처리할 노드 그룹.

3.  **Panel Gallery (패널 리스트)** 노드 위에 드래그하여 드롭하면 해당 노드에 패널이 **장착(Slot-in)**됨.

        - **Visualizer:** 데이터를 보여주는 패널 (Gauge, Line Chart, LED Bar).
        - **Controller:** 데이터를 입력받는 패널 (Slider, Switch, Knob).

4.  **Asset Search**

    -   수백 개의 노드와 패널 중 키워드로 즉시 필터링.

5.  **미리 정의된 레시피:**

    -   자주 사용하는 노드 뭉치(Sub-graph)를 템플릿으로 저장하여 재사용.

6.  **글로벌 변수:** 전체 설계도에서 공용으로 사용할 상수(Constant) 관리.

#### ➡️ 오른쪽 사이드바 (보조 및 조정)

캔버스에서 **선택된 대상**에 대한 정밀 제어를 담당합니다.
선택된 노드의 내장을 들여다보고 **'미세 조정'**하는 **'관제소'** 역할을 수행합니다.

1. Property Inspector (수정/설정 전용)

    - **정밀 수치 입력**: 슬라이더의 최소/최대값, 필터 계수 등 캔버스에서 직접 입력하기 힘든 상세 Form.
    - **디자인 커스터마이징**: 패널의 테마 색상, 폰트 크기, 단위(Unit) 텍스트 변경.
    - **정체성 관리**: 노드의 ID 확인, 상세 설명(Description) 작성, 메타데이터 태그 관리.

2. Advanced Monitor & Logs (분석 전용)

    - **데이터 히스토리**: 캔버스에서는 현재값만 보이지만, 사이드바에서는 최근 1분간 데이터가 어떻게 변했는지 리스트나 그래프로 확인.
    - **피드백 메시지**: evaluatorService가 뱉는 상세 에러 스택이나 경고 메시지 전문 확인.
    - **연결 무결성 리스트**: 현재 설계도 전체에서 끊어진 선이나 논리 오류가 있는 노드들을 목록으로 보여주고 클릭 시 해당 위치로 이동.

3. Dependency Viewer & Minimap (내비게이션)

    - **의존성 리스트**: 복잡하게 얽힌 선들을 따라갈 필요 없이, 표 형태로 "A노드에서 받음 / B노드로 보냄"을 정리해서 보여줌.
    - **미니맵**: 캔버스 공간이 넓으므로 전체 레이아웃을 조감하는 창.

4. 주석(Comment) 관리 노드 뭉치에 대한 설명이나 작업 메모를 사이드바에서 일괄 관리.

---

## ✨ 다음 진행을 위한 제안

이 상세 기능들은 나중에 `NodePalette.vue`와 `NodeInspector.vue`를 개발할 때 하나씩 컴포넌트로 구현하게 됩니다.
**이제 본격적으로 `src/components/nexa-node/NodeCanvas.vue`를 생성하여, 사이드바를 제외한 나머지 광활한 공간에 D3.js 무대를 설치해 볼까요?
** 줌(Zoom)과 드래그가 가능한 무한 그리드 배경부터 시작하겠습니다.
