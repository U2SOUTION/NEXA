# NEXA TEACH (액션 녹화 및 재생 시스템)

**작성일**: 2024년  
**목적**: 넥사 플랫폼의 핵심 자동화 인프라로서, 모든 시스템을 연결하고 자동화하는 통합 자동화 플랫폼의 기반 구축  
**버전**: 1.0  
**위치**: 넥사 플랫폼 핵심 기능 (Core Feature)  
**시스템명**: NEXA TEACH  
**구현 경로**: `http://localhost:9000/#/nexa-teach`  
**구현 상태**: 계획 단계 (아직 구현되지 않음)

---

## 개요

### 핵심 개념

NEXA TEACH는 **사용자의 UI 조작 행동을 녹화하고, 사용자가 보정한 후 자동으로 처리하도록 하는 시스템**입니다. 이 시스템은 단순한 단축키 대체 기능을 넘어서, **넥사 플랫폼의 핵심 자동화 인프라**로서 역할하며, NEXA BOARD, ERP 시스템, IOT 디바이스 등 모든 시스템을 연결하고 자동화하는 통합 계층을 제공합니다.

### 사용자 워크플로우

1. **녹화 단계**: 사용자가 UI를 조작하는 모든 행동 유형을 녹화
2. **보정 단계**: 사용자가 녹화된 액션을 검토하고 필요한 부분을 보정
3. **단축키 지정**: 보정된 액션에 단축키를 지정하여 간편하게 실행
4. **자동 실행**: 이후 단축키 하나로 시스템을 자동으로 조작

### NEXA Node와의 차이점

NEXA Node도 자동화 편집 툴이지만, NEXA TEACH는 **더 편리하게 자동화를 구성하는 툴**입니다:

| 구분 | NEXA Node | NEXA TEACH |
|------|-----------|------------|
| **구성 방식** | 노드 그래프를 직접 편집 | 사용자 행동을 녹화하여 자동 생성 |
| **학습 곡선** | 노드 개념 이해 필요 | 직관적 (그냥 사용하면 됨) |
| **편의성** | 시각적 편집이지만 복잡함 | 녹화만 하면 자동으로 구성 |
| **대상 사용자** | 개발자/고급 사용자 | 모든 사용자 |
| **적용 범위** | 로직 중심 자동화 | UI 조작 중심 자동화 |

**핵심 차이**: NEXA Node는 "어떻게 자동화할지"를 직접 설계하는 도구이고, NEXA TEACH는 "사용자가 하는 것을 그대로 녹화"하여 자동화하는 도구입니다.

### 학습 방법론: Learning from Demonstration (LfD) & Programming by Demonstration (PbD)

NEXA TEACH는 로봇 공학 및 머신러닝 분야의 **Learning from Demonstration (LfD, 시연으로부터 학습)** 및 **Programming by Demonstration (PbD, 시연을 통한 프로그래밍)** 개념을 웹 애플리케이션 자동화에 적용한 시스템입니다.

#### Learning from Demonstration (LfD) - 시연으로부터 학습

LfD는 전문가의 시연을 관찰하고 학습하여 동일한 작업을 수행할 수 있도록 하는 학습 방법입니다. NEXA TEACH에서는:

- **녹화 단계**: 사용자가 직접 시스템을 조작하는 과정을 녹화
- **학습 단계**: 녹화된 액션 시퀀스를 분석하고 맥락 정보를 추출
- **재생 단계**: 학습된 액션 시퀀스를 재생하여 동일한 작업을 자동으로 수행

#### Programming by Demonstration (PbD) - 시연을 통한 프로그래밍

PbD는 코드 작성 없이 사용자의 시연을 통해 프로그램을 생성하는 방법입니다. NEXA TEACH에서는:

- **시연**: 사용자가 직접 UI를 조작하여 원하는 작업을 수행
- **프로그램 생성**: 시연 과정이 자동으로 액션 시퀀스(프로그램)로 변환
- **재사용**: 생성된 액션 시퀀스를 저장하고 재생하여 동일한 작업을 반복 수행

#### 로봇 학습과의 유사성

로봇 학습에서 물리적으로 로봇을 직접 움직여 가르치는 **Kinesthetic Teaching (운동감각적 가르침)**과 유사하게, NEXA TEACH는:

1. **녹화 시작**: 사용자가 "가르치기" 모드로 진입
2. **직접 제어**: 사용자가 마우스, 키보드 등을 통해 시스템을 직접 조작
3. **녹화 종료**: 가르치기가 완료되면 녹화 종료
4. **재생 반복**: 녹화된 액션을 재생하여 학습된 행동을 반복 수행

이러한 방식은 복잡한 프로그래밍 지식 없이도 직관적으로 시스템에 작업 방법을 "가르칠" 수 있게 해줍니다.

### 넥사 플랫폼 핵심 목적과의 부합

이 시스템은 넥사 플랫폼의 핵심 설계 원칙과 완벽하게 부합합니다:

1. **자동화 우선 원칙**: 사용자 액션을 녹화하여 자동화 매크로를 생성하고, 변수 시스템과 조건부 실행을 통해 복잡한 자동화 워크플로우를 구성할 수 있습니다.

2. **확장성 고려**: 플러그인 시스템, 커스텀 액션 타입, 맥락 정보 확장 등을 통해 무한한 확장이 가능하며, NEXA NODE, IOT 프로토콜 등 새로운 시스템과의 통합이 용이합니다.

3. **모든 것을 연결**: 라우팅, 넥사 요소(보드/패널/블럭/노드), DOM, 브라우저 환경, 애플리케이션 상태 등 모든 맥락 정보를 캡처하고, NEXA NODE, IOT 디바이스, 웹훅, MQTT 등 외부 시스템과의 연결을 제공합니다.

4. **시스템화**: 액션 시퀀스 표준화, 변수 시스템, 조건부 실행, 템플릿, 공유, 협업 기능 등을 통해 체계적인 자동화 관리가 가능합니다.

### 핵심 기능으로서의 역할

NEXA TEACH는 넥사 플랫폼의 **핵심 기능(Core Feature)**으로서 다음 역할을 수행합니다:

- **통합 자동화 플랫폼의 기반**: 단순한 단축키를 넘어 전체 워크플로우를 자동화하는 기반 인프라
- **시스템 간 연결 고리**: NEXA BOARD ↔ ERP ↔ IOT ↔ 사용자 액션을 연결하는 통합 계층
- **확장 가능한 생태계**: 새로운 기능이 추가되면 자동으로 녹화/재생이 가능한 생태계 구축
- **사용자 생산성 향상**: 반복 작업 자동화를 통해 사용자 생산성을 극대화

### 시스템 목표

1. **모든 사용자 액션 녹화**: 클릭, 입력, 네비게이션, Store 액션 등 모든 인터랙션 추적
2. **재사용 가능한 매크로 생성**: 녹화된 액션을 저장하고 재생
3. **고급 자동화 기능**: 변수 시스템, 조건부 실행, 액션 편집을 통한 동적 워크플로우 구성
4. **시스템 통합**: NEXA NODE, IOT 디바이스 등 모든 넥사 시스템과의 통합
5. **사용자 퀵메뉴 시스템**: 녹화된 액션을 퀵메뉴 항목으로 관리
6. **단축키 통합**: 퀵메뉴 항목에 단축키 부여하여 빠른 실행
7. **기존 단축키 시스템 대체**: 더 유연하고 확장 가능한 방식으로 단축키 개념 확장
8. **통합 자동화 플랫폼**: 넥사 플랫폼의 모든 기능을 연결하고 자동화하는 통합 계층 제공

---

## 넥사 플랫폼 통합 자동화 시스템

### 기존 단축키 시스템과의 관계

#### 현재 단축키 시스템의 한계

1. **정적 액션 정의**: 개발자가 미리 정의한 액션만 단축키로 사용 가능
2. **제한된 확장성**: 새로운 기능 추가 시 코드 수정 필요
3. **사용자 맞춤화 부족**: 사용자가 원하는 작업을 직접 단축키로 만들기 어려움
4. **시스템 간 연결 부족**: 각 시스템이 독립적으로 동작하여 통합 자동화 어려움

#### NEXA TEACH의 장점

1. **동적 액션 생성**: 사용자가 직접 액션을 녹화하여 단축키 생성
2. **무한 확장성**: 모든 사용자 액션을 녹화 가능
3. **완전한 사용자 맞춤화**: 사용자가 자주 사용하는 작업을 녹화하여 재사용
4. **기존 시스템 통합**: 기존 액션 레지스트리 시스템과 자연스럽게 통합
5. **시스템 간 연결**: NEXA BOARD, ERP, IOT 등 모든 시스템을 하나의 자동화 워크플로우로 통합

### 대체 가능성

NEXA TEACH가 잘 구축되면:

- **기존 단축키 시스템을 완전히 대체** 가능
- 모든 단축키를 녹화된 액션으로 관리
- 개발자가 미리 정의한 액션도 녹화 시스템을 통해 관리 가능
- 사용자와 개발자 모두 동일한 인터페이스로 액션 관리
- **넥사 플랫폼의 모든 기능을 연결하는 통합 자동화 계층** 제공

### 넥사 플랫폼 핵심 시스템과의 통합

NEXA TEACH는 넥사 플랫폼의 핵심 시스템들과 다음과 같이 통합됩니다:

#### 1. NEXA BOARD 통합

- **보드 액션 녹화**: 보드 구성, 패널 배치, 레이아웃 변경 등의 액션 녹화
- **보드 자동화**: 반복적인 보드 구성 작업을 자동화
- **패널 제어**: 패널 표시/숨김, 크기 조정 등을 자동화

#### 2. ERP 시스템 통합

- **프로젝트 워크플로우 자동화**: 프로젝트 생성, 업무 프로세스 관리 등을 자동화
- **부품 관리 자동화**: 부품 입출고, 재고 관리 등의 반복 작업 자동화
- **업무 일정 관리**: 일정 생성, 업데이트 등의 자동화

#### 3. IOT 디바이스 통합

- **디바이스 제어 자동화**: IOT 디바이스 제어 액션을 녹화하여 자동화
- **센서 데이터 기반 자동화**: 센서 데이터를 조건으로 사용하여 자동화 워크플로우 구성
- **외부 트리거 연동**: 웹훅, MQTT 등을 통한 외부 이벤트 기반 자동화

#### 4. NEXA NODE 통합

- **노드 기반 시각적 편집**: 액션 시퀀스를 노드 그래프로 변환하여 시각적으로 편집
- **양방향 동기화**: 액션 시퀀스와 노드 그래프 간 실시간 동기화
- **하이브리드 워크플로우**: 일부는 녹화, 일부는 노드로 구성하여 결합

---

## 시스템 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│              액션 녹화 엔진 (Action Recorder)            │
│  - 전역 이벤트 리스너                                    │
│  - 액션 추출 및 표준화                                   │
│  - 액션 시퀀스 저장                                      │
│  - 맥락 정보 캡처                                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│           액션 편집 시스템 (Action Editor)                │
│  - 액션 수정, 복사, 삽입                                 │
│  - 변수 시스템                                           │
│  - 조건부 실행                                           │
│  - 액션 병합/분할                                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│           액션 재생 엔진 (Action Playback)              │
│  - 액션 시퀀스 순차 실행                                 │
│  - 변수 해석                                             │
│  - 조건 평가 및 분기                                     │
│  - 컨텍스트 복원                                         │
│  - 에러 처리 및 복구                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         사용자 퀵메뉴 시스템 (Quick Menu)                │
│  - 녹화된 액션 저장/관리                                │
│  - 퀵메뉴 UI                                             │
│  - 액션 실행                                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│          단축키 시스템 (Shortcuts)                       │
│  - 퀵메뉴 항목에 단축키 부여                            │
│  - 기존 단축키 시스템과 통합                            │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│          NEXA NODE 통합 (Node Integration)               │
│  - 액션 시퀀스 ↔ 노드 그래프 변환                        │
│  - 양방향 동기화                                         │
│  - 노드 기반 시각적 편집                                 │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│          IOT 통합 (IOT Integration)                      │
│  - 외부 트리거 (웹훅, MQTT, HTTP)                       │
│  - 센서 데이터 기반 조건부 실행                          │
│  - 디바이스 제어                                         │
│  - 실시간 이벤트 스트림                                  │
└─────────────────────────────────────────────────────────┘
```

### 데이터 흐름

#### 기본 녹화 및 재생 흐름

```
사용자 액션 발생
  ↓
액션 녹화 엔진이 액션 캡처
  ↓
액션을 표준화된 형식으로 변환
  ↓
맥락 정보 캡처 (선택된 옵션에 따라)
  ↓
액션 시퀀스에 추가
  ↓
녹화 중지 시 액션 시퀀스 저장
  ↓
액션 편집 (선택적)
  - 변수 추가/수정
  - 조건부 실행 추가
  - 액션 수정/삭제/재배열
  ↓
사용자 퀵메뉴 항목으로 등록
  ↓
단축키 부여 또는 IOT 트리거 설정 (선택)
  ↓
단축키 실행 / 퀵메뉴 실행 / IOT 트리거 실행
  ↓
변수 해석 및 조건 평가
  ↓
액션 재생 엔진이 액션 시퀀스 재생
  ↓
맥락 정보 검증 및 환경 복원
  ↓
액션 순차 실행
```

#### NEXA NODE 연동 흐름

```
액션 시퀀스
  ↓
노드 그래프로 변환
  ↓
NEXA NODE에서 시각적 편집
  ↓
노드 그래프를 액션 시퀀스로 변환
  ↓
액션 재생 엔진 실행
```

#### IOT 트리거 흐름

```
IOT 이벤트 발생 (웹훅/MQTT/센서)
  ↓
트리거 조건 평가
  ↓
조건 만족 시 액션 시퀀스 선택
  ↓
이벤트 데이터를 변수로 주입
  ↓
액션 재생 엔진 실행
  ↓
IOT 디바이스 제어 (필요 시)
```

---

## 맥락 정보 (Context Information) 개요

### 중요성

액션 녹화 시 **맥락 정보**는 재생 시 정확한 환경 복원을 위해 매우 중요합니다. 특히 넥사 시스템의 경우 패널, 블럭, 노드, 보드 등의 복잡한 구조와 관계를 추적해야 하므로, 맥락 정보 없이는 정확한 재생이 어렵습니다.

### 맥락 정보 분류 요약

1. **라우팅 정보**: URL, 라우트 경로, 파라미터, 쿼리
2. **넥사 핵심 요소**: 보드, 패널, 블럭, 노드의 구성, 관계, 목적
3. **DOM 구조**: 요소 경로, 계층 구조, 뷰포트 정보
4. **브라우저 환경**: User Agent, 뷰포트 크기, 디바이스 픽셀 비율
5. **애플리케이션 상태**: Store 상태, localStorage, 테마, 레이아웃
6. **사용자 세션**: 세션 ID (보안 고려하여 선택적)

### 녹화 옵션

사용자는 녹화 시작 전 맥락 정보 옵션을 선택할 수 있습니다:

- **최소**: 필수 맥락 정보만 (빠른 녹화, 작은 파일 크기)
- **권장**: 일반적인 사용에 적합 (기본값)
- **전체**: 모든 맥락 정보 포함 (디버깅, 복잡한 시나리오)
- **사용자 정의**: 개별 옵션 선택

자세한 내용은 아래 "액션 녹화 엔진 설계" 섹션의 "2.1 맥락 정보"를 참조하세요.

---

## 액션 녹화 엔진 설계

### 1. 녹화 가능한 액션 타입

```typescript
type RecordableActionType =
  | 'click' // 마우스 클릭
  | 'input' // 입력 필드 변경
  | 'navigation' // 라우터 네비게이션
  | 'store-action' // Pinia store 액션
  | 'panel-action' // 패널 액션
  | 'keyboard' // 키보드 입력
  | 'drag-drop' // 드래그 앤 드롭
  | 'scroll' // 스크롤
  | 'focus' // 포커스 변경
  | 'custom' // 커스텀 액션
```

### 2. 액션 데이터 구조

```typescript
interface RecordedAction {
  id: string // 액션 고유 ID
  type: RecordableActionType // 액션 타입
  timestamp: number // 액션 발생 시각 (상대 시간)
  target: {
    // 액션 대상
    selector?: string // CSS 셀렉터
    componentId?: string // 컴포넌트 ID
    storeName?: string // Store 이름
    actionName?: string // Store 액션 이름
  }
  params: Record<string, any> // 액션 파라미터
  context: ContextInfo // 컨텍스트 정보 (맥락 정보)
  metadata?: {
    // 메타데이터
    description?: string
    icon?: string
  }
}

interface ActionSequence {
  id: string // 시퀀스 고유 ID
  name: string // 시퀀스 이름
  description?: string // 설명
  actions: RecordedAction[] // 액션 배열
  contextOptions: ContextOptions // 녹화 시 선택된 맥락 정보 옵션
  createdAt: string // 생성일시
  updatedAt: string // 수정일시
  version: string // 버전
}
```

### 2.1 맥락 정보 (Context Information)

액션 녹화 시 맥락 정보는 재생 시 정확한 환경 복원을 위해 매우 중요합니다. 맥락 정보는 다음과 같이 분류됩니다:

#### 2.1.1 맥락 정보 분류

```typescript
interface ContextInfo {
  // 1. 라우팅 정보 (Routing Context)
  routing?: {
    currentUrl: string // 현재 전체 URL
    routePath: string // 라우트 경로 (예: '/dev', '/settings')
    routeName?: string // 라우트 이름
    routeParams?: Record<string, any> // 라우트 파라미터
    routeQuery?: Record<string, any> // 쿼리 파라미터
    routeHash?: string // 해시 값
  }

  // 2. 넥사 핵심 요소 구조 (Nexa Core Elements)
  nexaStructure?: {
    // 보드 (Board)
    board?: {
      id?: string // 보드 ID
      name?: string // 보드 이름
      layout?: string // 레이아웃 타입
      panels?: PanelInfo[] // 보드 내 패널 목록
    }

    // 패널 (Panel)
    panel?: {
      id?: string // 패널 ID
      type?: string // 패널 타입 (예: 'mermaid-style', 'toc', 'dev-tools')
      name?: string // 패널 이름
      position?: { x: number; y: number } // 패널 위치
      size?: { width: number; height: number } // 패널 크기
      visible?: boolean // 표시 여부
      parent?: string // 부모 요소 ID (보드 또는 다른 패널)
    }

    // 블럭 (Block)
    block?: {
      id?: string // 블럭 ID
      type?: string // 블럭 타입
      content?: string // 블럭 내용
      position?: { x: number; y: number } // 블럭 위치
      parent?: string // 부모 요소 ID (패널 또는 보드)
    }

    // 노드 (Node)
    node?: {
      id?: string // 노드 ID
      type?: string // 노드 타입
      label?: string // 노드 라벨
      position?: { x: number; y: number } // 노드 위치
      connections?: string[] // 연결된 노드 ID 목록
      parent?: string // 부모 요소 ID (블럭 또는 패널)
    }

    // 요소 간 관계 (Relationships)
    relationships?: {
      type: 'parent-child' | 'sibling' | 'connection' | 'dependency'
      from: string // 출발 요소 ID
      to: string // 도착 요소 ID
      metadata?: Record<string, any> // 관계 메타데이터
    }[]
  }

  // 3. DOM 구조 (DOM Structure)
  dom?: {
    elementPath?: string[] // 요소 경로 (부모부터 자식까지)
    elementHierarchy?: {
      tagName: string
      id?: string
      className?: string
      attributes?: Record<string, string>
    }[] // DOM 계층 구조
    viewport?: {
      width: number
      height: number
      scrollX: number
      scrollY: number
    } // 뷰포트 정보
  }

  // 4. 브라우저 환경 (Browser Environment)
  browser?: {
    userAgent?: string // User Agent
    viewportSize?: { width: number; height: number } // 뷰포트 크기
    windowSize?: { width: number; height: number } // 창 크기
    devicePixelRatio?: number // 디바이스 픽셀 비율
    timezone?: string // 타임존
    language?: string // 언어 설정
  }

  // 5. 애플리케이션 상태 (Application State)
  appState?: {
    stores?: Record<string, any> // Pinia Store 상태 스냅샷
    localStorage?: Record<string, any> // localStorage 상태
    sessionStorage?: Record<string, any> // sessionStorage 상태
    theme?: string // 현재 테마
    layout?: string // 현재 레이아웃 설정
  }

  // 6. 사용자 세션 (User Session)
  session?: {
    userId?: string // 사용자 ID
    sessionId?: string // 세션 ID
    timestamp: number // 맥락 캡처 시각
  }
}

interface PanelInfo {
  id: string
  type: string
  name: string
  visible: boolean
  position?: { x: number; y: number }
  size?: { width: number; height: number }
}
```

#### 2.1.2 맥락 정보 선택 옵션

녹화 시 사용자가 선택할 수 있는 맥락 정보 옵션:

```typescript
interface ContextOptions {
  // 라우팅 정보
  includeRouting: boolean // 기본: true
  includeRouteParams: boolean // 기본: true
  includeRouteQuery: boolean // 기본: true

  // 넥사 핵심 요소
  includeNexaStructure: boolean // 기본: true
  includeBoard: boolean // 기본: true
  includePanel: boolean // 기본: true
  includeBlock: boolean // 기본: true
  includeNode: boolean // 기본: true
  includeRelationships: boolean // 기본: true

  // DOM 구조
  includeDOM: boolean // 기본: false (성능 고려)
  includeElementPath: boolean // 기본: true
  includeElementHierarchy: boolean // 기본: false
  includeViewport: boolean // 기본: true

  // 브라우저 환경
  includeBrowser: boolean // 기본: false
  includeUserAgent: boolean // 기본: false
  includeViewportSize: boolean // 기본: true
  includeWindowSize: boolean // 기본: false
  includeDevicePixelRatio: boolean // 기본: false

  // 애플리케이션 상태
  includeAppState: boolean // 기본: false (데이터 크기 고려)
  includeStores: boolean // 기본: false
  includeLocalStorage: boolean // 기본: false
  includeSessionStorage: boolean // 기본: false
  includeTheme: boolean // 기본: true
  includeLayout: boolean // 기본: true

  // 사용자 세션
  includeSession: boolean // 기본: false (보안 고려)
}
```

#### 2.1.3 기본 맥락 정보 설정

```typescript
// 최소 필수 맥락 정보 (항상 포함)
const MINIMAL_CONTEXT_OPTIONS: ContextOptions = {
  includeRouting: true,
  includeRouteParams: true,
  includeRouteQuery: false,
  includeNexaStructure: true,
  includeBoard: true,
  includePanel: true,
  includeBlock: false,
  includeNode: false,
  includeRelationships: false,
  includeDOM: false,
  includeElementPath: true,
  includeElementHierarchy: false,
  includeViewport: true,
  includeBrowser: false,
  includeUserAgent: false,
  includeViewportSize: true,
  includeWindowSize: false,
  includeDevicePixelRatio: false,
  includeAppState: false,
  includeStores: false,
  includeLocalStorage: false,
  includeSessionStorage: false,
  includeTheme: true,
  includeLayout: true,
  includeSession: false,
}

// 권장 맥락 정보 설정 (일반적인 사용)
const RECOMMENDED_CONTEXT_OPTIONS: ContextOptions = {
  ...MINIMAL_CONTEXT_OPTIONS,
  includeRouteQuery: true,
  includeBlock: true,
  includeNode: true,
  includeRelationships: true,
  includeElementHierarchy: true,
  includeViewportSize: true,
  includeWindowSize: true,
}

// 전체 맥락 정보 설정 (디버깅 및 복잡한 시나리오)
const FULL_CONTEXT_OPTIONS: ContextOptions = {
  includeRouting: true,
  includeRouteParams: true,
  includeRouteQuery: true,
  includeNexaStructure: true,
  includeBoard: true,
  includePanel: true,
  includeBlock: true,
  includeNode: true,
  includeRelationships: true,
  includeDOM: true,
  includeElementPath: true,
  includeElementHierarchy: true,
  includeViewport: true,
  includeBrowser: true,
  includeUserAgent: true,
  includeViewportSize: true,
  includeWindowSize: true,
  includeDevicePixelRatio: true,
  includeAppState: true,
  includeStores: true,
  includeLocalStorage: true,
  includeSessionStorage: true,
  includeTheme: true,
  includeLayout: true,
  includeSession: false, // 보안상 기본값은 false
}
```

### 3. 녹화 엔진 핵심 기능

#### 3.1 전역 이벤트 리스너

```javascript
// 모든 사용자 인터랙션을 추적
function setupGlobalEventListeners() {
  // 마우스 이벤트
  document.addEventListener('click', captureClick, true)
  document.addEventListener('dblclick', captureDoubleClick, true)

  // 키보드 이벤트
  document.addEventListener('keydown', captureKeyDown, true)
  document.addEventListener('keyup', captureKeyUp, true)

  // 입력 이벤트
  document.addEventListener('input', captureInput, true)
  document.addEventListener('change', captureChange, true)

  // 포커스 이벤트
  document.addEventListener('focus', captureFocus, true)
  document.addEventListener('blur', captureBlur, true)

  // 드래그 앤 드롭
  document.addEventListener('dragstart', captureDragStart, true)
  document.addEventListener('drop', captureDrop, true)
}
```

#### 3.2 액션 추출 및 표준화

```javascript
function captureClick(event) {
  if (!isRecording) return

  // 맥락 정보 캡처 (선택된 옵션에 따라)
  const context = captureContext(contextOptions)

  const action = {
    id: generateActionId(),
    type: 'click',
    timestamp: Date.now() - recordingStartTime,
    target: {
      selector: getElementSelector(event.target),
      componentId: getComponentId(event.target),
      // 넥사 요소 정보 추가
      nexaElementId: getNexaElementId(event.target),
      nexaElementType: getNexaElementType(event.target), // 'panel', 'block', 'node', etc.
    },
    params: {
      button: event.button,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    },
    context: context, // 캡처된 맥락 정보
  }

  addToActionSequence(action)
}

// 통합 맥락 정보 캡처 함수
function captureContext(options) {
  const context = {}

  // 라우팅 정보
  if (options.includeRouting) {
    context.routing = captureRoutingContext()
    if (!options.includeRouteParams) {
      delete context.routing.routeParams
    }
    if (!options.includeRouteQuery) {
      delete context.routing.routeQuery
    }
  }

  // 넥사 핵심 요소 구조
  if (options.includeNexaStructure) {
    context.nexaStructure = captureNexaStructure(options)
  }

  // DOM 구조
  if (options.includeDOM) {
    context.dom = captureDOMContext(options)
  }

  // 브라우저 환경
  if (options.includeBrowser) {
    context.browser = captureBrowserContext(options)
  }

  // 애플리케이션 상태
  if (options.includeAppState) {
    context.appState = captureAppState(options)
  }

  // 사용자 세션
  if (options.includeSession) {
    context.session = {
      sessionId: getSessionId(),
      timestamp: Date.now(),
    }
  }

  return context
}
```

#### 3.3 Store 액션 추적

```javascript
// Pinia store 액션을 추적하기 위한 래퍼
function wrapStoreActions(store) {
  const originalActions = { ...store.$actions }

  Object.keys(originalActions).forEach((actionName) => {
    store[actionName] = function (...args) {
      if (isRecording) {
        recordStoreAction(store.$id, actionName, args)
      }
      return originalActions[actionName].apply(this, args)
    }
  })
}
```

#### 3.4 라우터 네비게이션 추적

```javascript
// Vue Router 네비게이션 추적
router.beforeEach((to, from, next) => {
  if (isRecording) {
    recordNavigationAction(from.path, to.path)
  }
  next()
})
```

### 4. 녹화 제어

```javascript
// 녹화 시작
function startRecording(options = {}) {
  isRecording = true
  recordingStartTime = Date.now()
  actionSequence = []

  // 액션 타입 녹화 옵션
  recordingOptions = {
    includeMouse: options.includeMouse ?? true,
    includeKeyboard: options.includeKeyboard ?? true,
    includeInput: options.includeInput ?? true,
    includeNavigation: options.includeNavigation ?? true,
    includeStoreActions: options.includeStoreActions ?? true,
    ...options,
  }

  // 맥락 정보 옵션 (기본값: RECOMMENDED_CONTEXT_OPTIONS)
  contextOptions = {
    ...RECOMMENDED_CONTEXT_OPTIONS,
    ...(options.contextOptions || {}),
  }

  setupGlobalEventListeners()
  setupContextCapture(contextOptions)
  notifyRecordingStarted()
}

// 맥락 정보 캡처 설정
function setupContextCapture(options) {
  // 선택된 옵션에 따라 맥락 정보 캡처 함수 등록
  if (options.includeRouting) {
    captureRoutingContext()
  }
  if (options.includeNexaStructure) {
    captureNexaStructure(options)
  }
  if (options.includeDOM) {
    captureDOMContext(options)
  }
  if (options.includeBrowser) {
    captureBrowserContext(options)
  }
  if (options.includeAppState) {
    captureAppState(options)
  }
}

// 맥락 정보 캡처 함수들
function captureRoutingContext() {
  const route = router.currentRoute.value
  return {
    currentUrl: window.location.href,
    routePath: route.path,
    routeName: route.name,
    routeParams: route.params,
    routeQuery: route.query,
    routeHash: route.hash,
  }
}

function captureNexaStructure(options) {
  const structure = {}

  if (options.includeBoard) {
    structure.board = getBoardInfo()
  }
  if (options.includePanel) {
    structure.panel = getPanelInfo()
  }
  if (options.includeBlock) {
    structure.block = getBlockInfo()
  }
  if (options.includeNode) {
    structure.node = getNodeInfo()
  }
  if (options.includeRelationships) {
    structure.relationships = getRelationships()
  }

  return structure
}

function captureDOMContext(options) {
  const context = {}

  if (options.includeViewport) {
    context.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    }
  }

  return context
}

function captureBrowserContext(options) {
  const context = {}

  if (options.includeUserAgent) {
    context.userAgent = navigator.userAgent
  }
  if (options.includeViewportSize) {
    context.viewportSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }
  if (options.includeWindowSize) {
    context.windowSize = {
      width: window.outerWidth,
      height: window.outerHeight,
    }
  }
  if (options.includeDevicePixelRatio) {
    context.devicePixelRatio = window.devicePixelRatio
  }
  if (options.includeTimezone) {
    context.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  if (options.includeLanguage) {
    context.language = navigator.language
  }

  return context
}

function captureAppState(options) {
  const state = {}

  if (options.includeTheme) {
    state.theme = getCurrentTheme()
  }
  if (options.includeLayout) {
    state.layout = getCurrentLayout()
  }
  if (options.includeStores) {
    state.stores = captureStoreSnapshots()
  }
  if (options.includeLocalStorage) {
    state.localStorage = { ...localStorage }
  }
  if (options.includeSessionStorage) {
    state.sessionStorage = { ...sessionStorage }
  }

  return state
}
```

// 녹화 중지
function stopRecording() {
isRecording = false
cleanupGlobalEventListeners()

const sequence = {
id: generateSequenceId(),
name: `녹화된 액션 ${new Date().toLocaleString()}`,
actions: actionSequence,
createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString(),
version: '1.0',
}

notifyRecordingStopped(sequence)
return sequence
}

// 녹화 일시 중지/재개
function pauseRecording() {
isRecording = false
}

function resumeRecording() {
isRecording = true
}

````

---

## 액션 재생 엔진 설계

### 1. 재생 전략

#### 1.1 순차 재생

- 액션을 타임스탬프 순서대로 재생
- 각 액션 사이에 적절한 지연 시간 추가

#### 1.2 컨텍스트 복원

- 재생 시작 시점의 상태 저장
- 재생 중 에러 발생 시 상태 복원 가능
- 녹화 시 캡처된 맥락 정보를 기반으로 환경 복원
  - 라우팅 정보 확인 및 필요 시 네비게이션
  - 넥사 요소 구조 확인 및 검증
  - DOM 구조 일치 여부 확인
  - 브라우저 환경 호환성 확인
  - 애플리케이션 상태 복원 (선택적)

#### 1.3 에러 처리

- 액션 재생 실패 시 다음 액션으로 진행 또는 중단
- 재생 로그 기록

### 2. 재생 엔진 구현

```javascript
async function replayActionSequence(sequence, options = {}) {
  const {
    speed = 1.0, // 재생 속도 (1.0 = 정상 속도)
    stopOnError = false, // 에러 발생 시 중단 여부
    restoreContext = true, // 컨텍스트 복원 여부
    validateContext = true, // 맥락 정보 검증 여부
  } = options

  // 현재 컨텍스트 저장 (복원용)
  const currentContext = restoreContext ? saveContext() : null

  // 녹화 시 맥락 정보 검증 및 복원
  if (validateContext && sequence.contextOptions) {
    const validationResult = await validateAndRestoreContext(
      sequence.actions[0]?.context,
      sequence.contextOptions
    )

    if (!validationResult.success) {
      if (stopOnError) {
        throw new Error(`Context validation failed: ${validationResult.error}`)
      } else {
        console.warn('Context validation warning:', validationResult.error)
      }
    }
  }

  try {
    for (const action of sequence.actions) {
      // 액션 재생 전 맥락 정보 확인 (필요 시)
      if (validateContext && action.context) {
        await ensureContextMatch(action.context, sequence.contextOptions)
      }

      // 액션 재생
      await replayAction(action, { speed })

      // 다음 액션까지 대기 (타임스탬프 기반)
      if (action.timestamp) {
        const delay = calculateDelay(action, sequence.actions, speed)
        await sleep(delay)
      }
    }
  } catch (error) {
    if (stopOnError) {
      // 컨텍스트 복원
      if (restoreContext && currentContext) {
        restoreContext(currentContext)
      }
      throw error
    } else {
      console.warn('Action replay error:', error)
      // 다음 액션으로 계속 진행
    }
  }
}

// 맥락 정보 검증 및 복원
async function validateAndRestoreContext(recordedContext, contextOptions) {
  const result = { success: true, warnings: [] }

  // 라우팅 정보 검증
  if (contextOptions.includeRouting && recordedContext.routing) {
    const currentRoute = router.currentRoute.value
    if (currentRoute.path !== recordedContext.routing.routePath) {
      // 라우트가 다르면 복원 시도
      await router.push(recordedContext.routing.routePath)
      result.warnings.push('Route restored to match recording context')
    }
  }

  // 넥사 요소 구조 검증
  if (contextOptions.includeNexaStructure && recordedContext.nexaStructure) {
    const validation = await validateNexaStructure(
      recordedContext.nexaStructure,
      contextOptions
    )
    if (!validation.success) {
      result.success = false
      result.error = `Nexa structure mismatch: ${validation.error}`
    } else {
      result.warnings.push(...validation.warnings)
    }
  }

  // DOM 구조 검증 (선택적)
  if (contextOptions.includeDOM && recordedContext.dom) {
    const domValidation = validateDOMStructure(recordedContext.dom)
    if (!domValidation.success) {
      result.warnings.push(`DOM structure mismatch: ${domValidation.error}`)
    }
  }

  // 브라우저 환경 검증
  if (contextOptions.includeBrowser && recordedContext.browser) {
    const browserValidation = validateBrowserEnvironment(recordedContext.browser)
    if (!browserValidation.success) {
      result.warnings.push(`Browser environment mismatch: ${browserValidation.error}`)
    }
  }

  return result
}

// 넥사 요소 구조 검증
async function validateNexaStructure(recordedStructure, options) {
  const result = { success: true, warnings: [] }

  // 보드 검증
  if (options.includeBoard && recordedStructure.board) {
    const currentBoard = getCurrentBoard()
    if (!currentBoard || currentBoard.id !== recordedStructure.board.id) {
      result.warnings.push('Board context may have changed')
    }
  }

  // 패널 검증
  if (options.includePanel && recordedStructure.panel) {
    const panel = findPanel(recordedStructure.panel.id)
    if (!panel) {
      result.success = false
      result.error = `Panel not found: ${recordedStructure.panel.id}`
      return result
    }
    if (!panel.visible && recordedStructure.panel.visible) {
      result.warnings.push('Panel is not visible but was visible during recording')
    }
  }

  // 블럭/노드 검증
  if (options.includeBlock && recordedStructure.block) {
    const block = findBlock(recordedStructure.block.id)
    if (!block) {
      result.warnings.push(`Block not found: ${recordedStructure.block.id}`)
    }
  }

  if (options.includeNode && recordedStructure.node) {
    const node = findNode(recordedStructure.node.id)
    if (!node) {
      result.warnings.push(`Node not found: ${recordedStructure.node.id}`)
    }
  }

  return result
}

// 컨텍스트 일치 확인
async function ensureContextMatch(actionContext, contextOptions) {
  // 라우팅 확인
  if (contextOptions.includeRouting && actionContext.routing) {
    const currentRoute = router.currentRoute.value
    if (currentRoute.path !== actionContext.routing.routePath) {
      // 라우트가 다르면 경고 (필요 시 복원)
      console.warn(
        `Route mismatch: expected ${actionContext.routing.routePath}, got ${currentRoute.path}`
      )
    }
  }

  // 넥사 요소 확인
  if (contextOptions.includeNexaStructure && actionContext.nexaStructure) {
    // 패널, 블럭, 노드 존재 여부 확인
    if (actionContext.nexaStructure.panel) {
      const panel = findPanel(actionContext.nexaStructure.panel.id)
      if (!panel) {
        throw new Error(`Panel not found: ${actionContext.nexaStructure.panel.id}`)
      }
    }
  }
}

async function replayAction(action, options) {
  switch (action.type) {
    case 'click':
      await replayClickAction(action)
      break
    case 'input':
      await replayInputAction(action)
      break
    case 'navigation':
      await replayNavigationAction(action)
      break
    case 'store-action':
      await replayStoreAction(action)
      break
    case 'panel-action':
      await replayPanelAction(action)
      break
    // ... 기타 액션 타입
  }
}
````

### 3. 액션별 재생 로직

#### 3.1 클릭 액션 재생

```javascript
async function replayClickAction(action) {
  const element = findElement(action.target)
  if (!element) {
    throw new Error(`Element not found: ${action.target.selector}`)
  }

  // 요소가 보이는지 확인
  await waitForElementVisible(element)

  // 클릭 이벤트 발생
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    button: action.params.button,
    ctrlKey: action.params.ctrlKey,
    shiftKey: action.params.shiftKey,
    altKey: action.params.altKey,
  })

  element.dispatchEvent(event)
}
```

#### 3.2 입력 액션 재생

```javascript
async function replayInputAction(action) {
  const element = findElement(action.target)
  if (!element) {
    throw new Error(`Element not found: ${action.target.selector}`)
  }

  // 포커스 설정
  element.focus()
  await sleep(50) // 포커스 안정화 대기

  // 값 설정
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    element.value = action.params.value
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
  }
}
```

#### 3.3 Store 액션 재생

```javascript
async function replayStoreAction(action) {
  const store = getStore(action.target.storeName)
  if (!store) {
    throw new Error(`Store not found: ${action.target.storeName}`)
  }

  const actionName = action.target.actionName
  if (!store[actionName]) {
    throw new Error(`Action not found: ${actionName}`)
  }

  // Store 액션 실행
  await store[actionName](...action.params.args)
}
```

---

## 시스템 업데이트 및 호환성 관리

### 개요

시스템이 업데이트되어 UI가 변경되거나 맥락 정보가 변경되었을 때, 녹화된 액션 시퀀스가 여전히 정상적으로 작동하도록 보장하는 것이 중요합니다. 이 섹션에서는 버전 관리, 요소 찾기 전략, 자동 마이그레이션, 호환성 검사 등의 메커니즘을 설명합니다.

### 1. 버전 관리 시스템

#### 1.1 액션 시퀀스 버전 관리

```typescript
interface ActionSequence {
  id: string
  name: string
  description?: string
  actions: RecordedAction[]
  contextOptions: ContextOptions
  version: string // 버전 정보 (예: '1.0.0')
  systemVersion: string // 녹화 시 시스템 버전
  createdAt: string
  updatedAt: string
  migrationHistory?: MigrationRecord[] // 마이그레이션 이력
}

interface MigrationRecord {
  fromVersion: string
  toVersion: string
  migratedAt: string
  changes: string[] // 변경 사항 목록
  success: boolean
}
```

#### 1.2 시스템 버전 추적

```javascript
// 시스템 버전 정보
const SYSTEM_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  build: Date.now(), // 빌드 타임스탬프
  toString: () => `${SYSTEM_VERSION.major}.${SYSTEM_VERSION.minor}.${SYSTEM_VERSION.patch}`,
}

// 액션 시퀀스 생성 시 시스템 버전 저장
function createActionSequence(actions, contextOptions) {
  return {
    id: generateSequenceId(),
    name: `녹화된 액션 ${new Date().toLocaleString()}`,
    actions,
    contextOptions,
    version: '1.0.0',
    systemVersion: SYSTEM_VERSION.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
```

#### 1.3 버전 호환성 검사

```javascript
// 버전 호환성 검사
function checkVersionCompatibility(sequence) {
  const recordedVersion = parseVersion(sequence.systemVersion)
  const currentVersion = SYSTEM_VERSION

  // 메이저 버전이 다르면 호환되지 않음
  if (recordedVersion.major !== currentVersion.major) {
    return {
      compatible: false,
      level: 'major',
      message: `메이저 버전 불일치: 녹화 시 ${sequence.systemVersion}, 현재 ${SYSTEM_VERSION.toString()}`,
    }
  }

  // 마이너 버전이 다르면 부분 호환
  if (recordedVersion.minor !== currentVersion.minor) {
    return {
      compatible: 'partial',
      level: 'minor',
      message: `마이너 버전 불일치: 녹화 시 ${sequence.systemVersion}, 현재 ${SYSTEM_VERSION.toString()}`,
      warnings: ['일부 기능이 변경되었을 수 있습니다'],
    }
  }

  // 패치 버전이 다르면 호환됨 (하위 호환성 유지)
  return {
    compatible: true,
    level: 'patch',
    message: '호환 가능',
  }
}
```

### 2. 요소 찾기 전략 (다중 폴백)

UI가 변경되어 원본 셀렉터로 요소를 찾을 수 없을 때, 여러 전략을 순차적으로 시도합니다.

#### 2.1 요소 찾기 전략 우선순위

```javascript
// 요소 찾기 (다중 폴백 전략)
async function findElementWithFallback(action) {
  const strategies = [
    // 1차: 원본 셀렉터/ID로 찾기
    () => findElementByOriginalSelector(action.target),

    // 2차: 대체 셀렉터 (data-* 속성, 텍스트 내용)
    () => findElementByAlternativeSelector(action.target),

    // 3차: 관계 기반 찾기 (부모/형제 요소)
    () => findElementByRelationship(action.target, action.context),

    // 4차: 의미 기반 찾기 (역할, 라벨, 아이콘)
    () => findElementBySemanticMeaning(action.target, action.context),

    // 5차: Store 액션으로 대체 (DOM 요소 대신 Store 액션 사용)
    () => findStoreActionAlternative(action),
  ]

  for (const strategy of strategies) {
    try {
      const element = await strategy()
      if (element) {
        return {
          element,
          strategy: strategy.name,
          confidence: calculateConfidence(element, action),
        }
      }
    } catch (error) {
      console.warn(`Strategy ${strategy.name} failed:`, error)
      continue
    }
  }

  // 모든 전략 실패 시 사용자 개입 요청
  return {
    element: null,
    strategy: 'user-intervention',
    requiresUserAction: true,
    message: '요소를 찾을 수 없습니다. 수동으로 매핑해주세요.',
  }
}
```

#### 2.2 원본 셀렉터로 찾기

```javascript
function findElementByOriginalSelector(target) {
  if (target.selector) {
    const element = document.querySelector(target.selector)
    if (element) return element
  }

  if (target.componentId) {
    const element = document.querySelector(`[data-component-id="${target.componentId}"]`)
    if (element) return element
  }

  if (target.nexaElementId) {
    const element = findNexaElement(target.nexaElementId, target.nexaElementType)
    if (element) return element
  }

  return null
}
```

#### 2.3 대체 셀렉터로 찾기

```javascript
function findElementByAlternativeSelector(target) {
  // data-action-id 같은 안정적인 속성으로 찾기
  if (target.metadata?.actionId) {
    const element = document.querySelector(`[data-action-id="${target.metadata.actionId}"]`)
    if (element) return element
  }

  // 아이콘 이름으로 찾기
  if (target.metadata?.icon) {
    const elements = document.querySelectorAll(`[class*="${target.metadata.icon}"]`)
    // 가장 가까운 요소 찾기
    return findClosestElement(elements, target.context?.dom?.elementPath)
  }

  // 텍스트 내용으로 찾기
  if (target.metadata?.text) {
    const elements = Array.from(document.querySelectorAll('*')).filter((el) => el.textContent?.trim() === target.metadata.text)
    return findClosestElement(elements, target.context?.dom?.elementPath)
  }

  return null
}
```

#### 2.4 관계 기반 찾기

```javascript
function findElementByRelationship(target, context) {
  if (!context?.dom?.elementPath || !context?.nexaStructure) return null

  // 부모 요소 경로를 이용하여 찾기
  const parentPath = context.dom.elementPath.slice(0, -1)
  const parentElement = findElementByPath(parentPath)

  if (parentElement) {
    // 부모 요소 내에서 유사한 요소 찾기
    const similarElements = findSimilarElementsInParent(parentElement, target, context)
    return similarElements[0] || null
  }

  // 넥사 요소 관계를 이용하여 찾기
  if (context.nexaStructure.panel) {
    const panel = findPanel(context.nexaStructure.panel.id)
    if (panel) {
      return findElementInPanel(panel, target)
    }
  }

  return null
}
```

#### 2.5 의미 기반 찾기

```javascript
function findElementBySemanticMeaning(target, context) {
  // 역할(role) 기반 찾기
  if (target.metadata?.role) {
    const elements = document.querySelectorAll(`[role="${target.metadata.role}"]`)
    return findClosestElement(elements, context?.dom?.elementPath)
  }

  // 라벨(aria-label) 기반 찾기
  if (target.metadata?.label) {
    const elements = document.querySelectorAll(`[aria-label="${target.metadata.label}"]`)
    return findClosestElement(elements, context?.dom?.elementPath)
  }

  // 기능적 의미 기반 찾기 (예: "업데이트" 버튼)
  if (target.metadata?.semanticMeaning) {
    return findElementBySemanticMeaning(target.metadata.semanticMeaning, context)
  }

  return null
}
```

#### 2.6 Store 액션 대체

```javascript
function findStoreActionAlternative(action) {
  // DOM 요소를 찾을 수 없을 때, Store 액션으로 대체
  if (action.type === 'click' && action.target.metadata?.storeAction) {
    return {
      type: 'store-action',
      target: {
        storeName: action.target.metadata.storeAction.storeName,
        actionName: action.target.metadata.storeAction.actionName,
      },
      params: action.target.metadata.storeAction.params,
    }
  }

  return null
}
```

### 3. 자동 마이그레이션

#### 3.1 마이그레이션 감지 및 실행

```javascript
// 액션 시퀀스 자동 마이그레이션
async function migrateActionSequence(sequence) {
  const compatibility = checkVersionCompatibility(sequence)

  if (compatibility.compatible === true) {
    return sequence // 마이그레이션 불필요
  }

  // 마이그레이션 필요
  const migrationResult = {
    fromVersion: sequence.version,
    toVersion: SYSTEM_VERSION.toString(),
    migratedAt: new Date().toISOString(),
    changes: [],
    success: false,
  }

  try {
    // 각 액션에 대해 마이그레이션 시도
    const migratedActions = []
    for (const action of sequence.actions) {
      const migratedAction = await migrateAction(action, compatibility)
      if (migratedAction.changed) {
        migrationResult.changes.push(`Action ${action.id}: ${migratedAction.changes.join(', ')}`)
      }
      migratedActions.push(migratedAction.action)
    }

    // 마이그레이션된 시퀀스 생성
    const migratedSequence = {
      ...sequence,
      actions: migratedActions,
      version: SYSTEM_VERSION.toString(),
      systemVersion: SYSTEM_VERSION.toString(),
      updatedAt: new Date().toISOString(),
      migrationHistory: [...(sequence.migrationHistory || []), { ...migrationResult, success: true }],
    }

    return migratedSequence
  } catch (error) {
    migrationResult.success = false
    migrationResult.error = error.message
    return {
      ...sequence,
      migrationHistory: [...(sequence.migrationHistory || []), migrationResult],
      migrationError: error.message,
    }
  }
}
```

#### 3.2 액션 마이그레이션

```javascript
async function migrateAction(action, compatibility) {
  const result = {
    action: { ...action },
    changed: false,
    changes: [],
  }

  // 요소 찾기 전략 업데이트
  if (action.target.selector) {
    const element = await findElementWithFallback(action)
    if (element.strategy !== 'original') {
      // 대체 전략으로 요소를 찾았으면 타겟 정보 업데이트
      result.action.target = {
        ...result.action.target,
        selector: element.element ? getElementSelector(element.element) : action.target.selector,
        fallbackStrategy: element.strategy,
        confidence: element.confidence,
      }
      result.changed = true
      result.changes.push(`요소 찾기 전략 변경: ${element.strategy}`)
    }
  }

  // Store 액션 이름 변경 처리
  if (action.type === 'store-action') {
    const store = getStore(action.target.storeName)
    if (store) {
      // 액션 이름이 변경되었는지 확인
      if (!store[action.target.actionName]) {
        const alternativeAction = findAlternativeStoreAction(store, action.target.actionName)
        if (alternativeAction) {
          result.action.target.actionName = alternativeAction
          result.changed = true
          result.changes.push(`Store 액션 이름 변경: ${action.target.actionName} → ${alternativeAction}`)
        }
      }
    }
  }

  // 라우트 경로 변경 처리
  if (action.context?.routing?.routePath) {
    const newRoute = findAlternativeRoute(action.context.routing.routePath)
    if (newRoute && newRoute !== action.context.routing.routePath) {
      result.action.context.routing.routePath = newRoute
      result.changed = true
      result.changes.push(`라우트 경로 변경: ${action.context.routing.routePath} → ${newRoute}`)
    }
  }

  return result
}
```

### 4. 호환성 검사 및 알림

#### 4.1 재생 전 호환성 검사

```javascript
// 재생 전 호환성 검사 및 알림
async function checkCompatibilityBeforeReplay(sequence) {
  const compatibility = checkVersionCompatibility(sequence)
  const elementChecks = []

  // 각 액션의 요소 존재 여부 확인
  for (const action of sequence.actions) {
    if (action.type === 'click' || action.type === 'input') {
      const elementCheck = await checkElementAvailability(action)
      elementChecks.push({
        actionId: action.id,
        available: elementCheck.available,
        strategy: elementCheck.strategy,
        confidence: elementCheck.confidence,
      })
    }
  }

  const issues = elementChecks.filter((check) => !check.available || check.confidence < 0.7)

  return {
    compatible: compatibility.compatible,
    compatibility,
    elementChecks,
    issues,
    requiresMigration: issues.length > 0 || !compatibility.compatible,
    warnings: [...(compatibility.warnings || []), ...issues.map((issue) => `Action ${issue.actionId}: 요소를 찾을 수 없거나 신뢰도가 낮습니다`)],
  }
}
```

#### 4.2 호환성 알림 UI

```javascript
// 호환성 문제 알림 및 사용자 선택
async function showCompatibilityWarning(checkResult) {
  if (!checkResult.requiresMigration) {
    return true // 문제 없음, 계속 진행
  }

  return new Promise((resolve) => {
    $q.dialog({
      title: '호환성 경고',
      message: `
        이 액션 시퀀스는 현재 시스템 버전과 호환되지 않을 수 있습니다.
        
        문제:
        - ${checkResult.compatibility.message}
        - ${checkResult.issues.length}개의 액션에서 요소를 찾을 수 없습니다
        
        옵션:
        1. 자동 마이그레이션 시도
        2. 수동으로 업데이트
        3. 그대로 실행 (위험)
      `,
      options: {
        type: 'radio',
        model: 'auto-migrate',
        items: [
          { label: '자동 마이그레이션 시도', value: 'auto-migrate' },
          { label: '수동으로 업데이트', value: 'manual-update' },
          { label: '그대로 실행', value: 'continue' },
        ],
      },
      persistent: true,
      ok: {
        label: '확인',
        color: 'primary',
      },
      cancel: {
        label: '취소',
        flat: true,
      },
    })
      .onOk((selected) => {
        resolve(selected)
      })
      .onCancel(() => {
        resolve(null)
      })
  })
}
```

### 5. 수동 업데이트 UI

#### 5.1 액션 시퀀스 편집 및 업데이트

```javascript
// 액션 시퀀스 수동 업데이트
function updateActionSequenceManually(sequenceId) {
  const sequence = getActionSequence(sequenceId)
  const editor = openActionEditor(sequence)

  // 호환성 문제가 있는 액션 강조 표시
  editor.highlightIssues(sequence.actions)

  // 요소 재매핑 도구 제공
  editor.enableElementRemapping((action) => {
    return openElementRemappingDialog(action)
  })

  // 맥락 정보 업데이트 도구 제공
  editor.enableContextUpdate((action) => {
    return openContextUpdateDialog(action)
  })
}
```

#### 5.2 요소 재매핑 UI

```javascript
// 요소 재매핑 다이얼로그
function openElementRemappingDialog(action) {
  return new Promise((resolve) => {
    $q.dialog({
      title: '요소 재매핑',
      message: `
        원본 요소를 찾을 수 없습니다.
        새로운 요소를 선택해주세요.
        
        원본 정보:
        - 셀렉터: ${action.target.selector}
        - 컴포넌트 ID: ${action.target.componentId}
        - 의미: ${action.metadata?.description || '알 수 없음'}
      `,
      component: ElementRemappingDialog,
      componentProps: {
        originalAction: action,
        onElementSelected: (newElement) => {
          const newTarget = {
            selector: getElementSelector(newElement),
            componentId: getComponentId(newElement),
            nexaElementId: getNexaElementId(newElement),
            nexaElementType: getNexaElementType(newElement),
          }
          resolve({
            ...action,
            target: newTarget,
            updatedAt: new Date().toISOString(),
          })
        },
      },
    })
  })
}
```

#### 5.3 맥락 정보 업데이트 UI

```javascript
// 맥락 정보 업데이트 다이얼로그
function openContextUpdateDialog(action) {
  return new Promise((resolve) => {
    $q.dialog({
      title: '맥락 정보 업데이트',
      message: '변경된 맥락 정보를 업데이트해주세요.',
      component: ContextUpdateDialog,
      componentProps: {
        originalContext: action.context,
        onContextUpdated: (newContext) => {
          resolve({
            ...action,
            context: newContext,
            updatedAt: new Date().toISOString(),
          })
        },
      },
    })
  })
}
```

### 6. 업데이트 감지 및 자동 처리

#### 6.1 시스템 업데이트 감지

```javascript
// 시스템 업데이트 감지
function detectSystemUpdate() {
  const lastKnownVersion = localStorage.getItem('lastSystemVersion')
  const currentVersion = SYSTEM_VERSION.toString()

  if (lastKnownVersion && lastKnownVersion !== currentVersion) {
    // 시스템이 업데이트됨
    return {
      updated: true,
      fromVersion: lastKnownVersion,
      toVersion: currentVersion,
    }
  }

  return { updated: false }
}

// 앱 시작 시 업데이트 감지 및 처리
function handleSystemUpdate() {
  const updateInfo = detectSystemUpdate()
  if (updateInfo.updated) {
    // 모든 액션 시퀀스 호환성 검사
    const sequences = loadAllActionSequences()
    const incompatibleSequences = sequences.filter((seq) => !checkVersionCompatibility(seq).compatible)

    if (incompatibleSequences.length > 0) {
      // 사용자에게 알림
      showUpdateNotification(incompatibleSequences.length)
    }

    // 현재 버전 저장
    localStorage.setItem('lastSystemVersion', SYSTEM_VERSION.toString())
  }
}
```

#### 6.2 배치 마이그레이션

```javascript
// 모든 액션 시퀀스 배치 마이그레이션
async function batchMigrateActionSequences() {
  const sequences = loadAllActionSequences()
  const results = []

  for (const sequence of sequences) {
    const compatibility = checkVersionCompatibility(sequence)
    if (!compatibility.compatible) {
      try {
        const migrated = await migrateActionSequence(sequence)
        saveActionSequence(migrated)
        results.push({
          sequenceId: sequence.id,
          success: true,
          changes: migrated.migrationHistory?.[migrated.migrationHistory.length - 1]?.changes || [],
        })
      } catch (error) {
        results.push({
          sequenceId: sequence.id,
          success: false,
          error: error.message,
        })
      }
    }
  }

  return results
}
```

### 7. 사용 시나리오 예시

#### 시나리오: 업데이트 버튼 클릭 액션

```javascript
// 녹화 시 (시스템 버전 1.0.0)
const recordedAction = {
  id: 'action-1',
  type: 'click',
  target: {
    selector: '.refresh-btn',
    componentId: 'DevelopmentPage',
  },
  context: {
    routing: {
      routePath: '/dev',
    },
    nexaStructure: {
      panel: {
        rightSidebar: { visible: true },
      },
    },
  },
  systemVersion: '1.0.0',
}

// 시스템 업데이트 후 (시스템 버전 1.1.0)
// 버튼 클래스가 .refresh-btn에서 .file-update-btn으로 변경됨

// 재생 시 자동 처리:
// 1. 원본 셀렉터로 찾기 시도 → 실패
// 2. 대체 전략으로 찾기:
//    - 아이콘 이름('cached')으로 찾기 → 성공
//    - 또는 의미 기반 찾기('업데이트' 버튼) → 성공
// 3. 찾은 요소의 새 셀렉터로 액션 업데이트
// 4. 마이그레이션 이력 기록
```

---

## 사용자 퀵메뉴 시스템

### 1. 퀵메뉴 항목 구조

```typescript
interface QuickMenuItem {
  id: string // 항목 고유 ID
  name: string // 항목 이름
  description?: string // 설명
  icon?: string // 아이콘
  category?: string // 카테고리
  actionSequence: ActionSequence // 녹화된 액션 시퀀스
  shortcut?: {
    // 단축키 (선택)
    combo: string // 키 조합 (예: 'ctrl+b')
    enabled: boolean // 활성화 여부
  }
  metadata: {
    createdAt: string
    updatedAt: string
    usageCount: number // 사용 횟수
    lastUsed?: string // 마지막 사용 시각
  }
}
```

### 2. 퀵메뉴 관리

```javascript
// 퀵메뉴 항목 저장
function saveQuickMenuItem(item) {
  const items = loadQuickMenuItems()
  items.push(item)
  saveQuickMenuItems(items)
}

// 퀵메뉴 항목 실행
async function executeQuickMenuItem(itemId) {
  const item = getQuickMenuItem(itemId)
  if (!item) {
    throw new Error(`Quick menu item not found: ${itemId}`)
  }

  // 사용 횟수 증가
  item.metadata.usageCount++
  item.metadata.lastUsed = new Date().toISOString()
  updateQuickMenuItem(item)

  // 액션 시퀀스 재생
  await replayActionSequence(item.actionSequence)
}
```

### 3. 퀵메뉴 UI

- **퀵메뉴 목록**: 저장된 모든 퀵메뉴 항목 표시
- **녹화 버튼**: 새 액션 녹화 시작
  - 녹화 시작 전 맥락 정보 옵션 선택 다이얼로그 표시
  - 프리셋 선택 (최소/권장/전체) 또는 사용자 정의 옵션
- **실행 버튼**: 퀵메뉴 항목 실행
- **편집 기능**: 퀵메뉴 항목 이름, 설명, 단축키 수정
- **삭제 기능**: 퀵메뉴 항목 삭제
- **맥락 정보 보기**: 녹화된 맥락 정보 확인 (디버깅용)

### 3.1 맥락 정보 옵션 선택 UI

녹화 시작 시 사용자가 맥락 정보 옵션을 선택할 수 있는 UI:

```typescript
interface ContextOptionsUI {
  // 프리셋 선택
  preset: 'minimal' | 'recommended' | 'full' | 'custom'

  // 카테고리별 옵션
  categories: {
    routing: {
      enabled: boolean
      includeParams: boolean
      includeQuery: boolean
    }
    nexaStructure: {
      enabled: boolean
      includeBoard: boolean
      includePanel: boolean
      includeBlock: boolean
      includeNode: boolean
      includeRelationships: boolean
    }
    dom: {
      enabled: boolean
      includeElementPath: boolean
      includeElementHierarchy: boolean
      includeViewport: boolean
    }
    browser: {
      enabled: boolean
      includeUserAgent: boolean
      includeViewportSize: boolean
      includeWindowSize: boolean
    }
    appState: {
      enabled: boolean
      includeStores: boolean
      includeLocalStorage: boolean
      includeTheme: boolean
      includeLayout: boolean
    }
  }

  // 고급 옵션
  advanced: {
    includeSession: boolean // 보안 경고 표시
    compressContext: boolean // 맥락 정보 압축
  }
}
```

#### UI 구성 요소

1. **프리셋 선택 탭**

   - 최소: 필수 맥락 정보만 (빠른 녹화, 작은 파일 크기)
   - 권장: 일반적인 사용에 적합 (기본값)
   - 전체: 모든 맥락 정보 포함 (디버깅, 복잡한 시나리오)
   - 사용자 정의: 개별 옵션 선택

2. **카테고리별 옵션 패널**

   - 라우팅 정보
   - 넥사 핵심 요소 구조
   - DOM 구조
   - 브라우저 환경
   - 애플리케이션 상태

3. **고급 옵션**

   - 세션 정보 포함 (보안 경고)
   - 맥락 정보 압축 (파일 크기 최적화)

4. **예상 데이터 크기 표시**
   - 선택한 옵션에 따른 예상 파일 크기
   - 성능 영향 경고

---

## 단축키 통합

### 1. 퀵메뉴 항목에 단축키 부여

```javascript
// 퀵메뉴 항목에 단축키 등록
function registerQuickMenuShortcut(itemId, combo) {
  const item = getQuickMenuItem(itemId)
  if (!item) return

  // 단축키 등록
  registerShortcut(`quickmenu:${itemId}`, {
    combo,
    description: item.name,
    handler: () => executeQuickMenuItem(itemId),
  })

  // 퀵메뉴 항목에 단축키 정보 저장
  item.shortcut = { combo, enabled: true }
  updateQuickMenuItem(item)
}
```

### 2. 기존 단축키 시스템과의 통합

- 기존 단축키도 NEXA TEACH를 통해 관리 가능
- 개발자가 정의한 액션도 녹화 형식으로 변환하여 저장
- 단일 인터페이스로 모든 단축키 관리

---

## 기술적 고려사항

### 1. 성능 최적화

- **이벤트 리스너 최적화**: 녹화 중에만 이벤트 리스너 활성화
- **액션 필터링**: 불필요한 액션(예: 마우스 이동) 필터링
- **데이터 압축**: 액션 시퀀스 데이터 압축 저장
- **맥락 정보 선택적 캡처**: 필요한 맥락 정보만 선택하여 성능 영향 최소화
- **맥락 정보 지연 캡처**: 액션 발생 시점이 아닌 필요 시점에만 캡처
- **맥락 정보 압축**: 직렬화 시 압축 알고리즘 적용
- **증분 맥락 정보**: 변경된 맥락 정보만 저장 (전체 스냅샷 대신)

### 2. 안정성

- **요소 찾기 실패 처리**: DOM 변경으로 요소를 찾을 수 없는 경우 처리
- **비동기 작업 처리**: API 호출, 타이머 등 비동기 작업 재생
- **상태 동기화**: 재생 중 상태 변경 감지 및 처리
- **맥락 정보 검증**: 재생 전 맥락 정보 일치 여부 확인
- **넥사 요소 존재 확인**: 패널, 블럭, 노드 등이 존재하는지 확인
- **라우팅 복원**: 녹화 시 라우트와 현재 라우트가 다를 경우 자동 복원
- **요소 대체 전략**: 요소를 찾을 수 없을 때 대체 방법 시도 (ID → 셀렉터 → 관계 기반)

### 3. 보안

- **민감한 정보 필터링**: 비밀번호, 토큰 등 민감한 정보 녹화 방지
- **액션 검증**: 재생 전 액션 시퀀스 검증
- **권한 관리**: 특정 액션의 녹화/재생 권한 제어
- **맥락 정보 필터링**: localStorage, sessionStorage의 민감한 정보 제외
- **세션 정보 제외**: 기본적으로 세션 정보는 녹화하지 않음 (옵션으로만 제공)
- **Store 상태 필터링**: 민감한 Store 상태는 선택적으로 제외
- **맥락 정보 암호화**: 필요 시 맥락 정보 암호화 저장

### 4. 확장성

- **플러그인 시스템**: 커스텀 액션 타입 추가 가능
- **액션 변환**: 다른 형식(예: Selenium 스크립트)으로 변환 가능
- **클라우드 동기화**: 퀵메뉴 항목 클라우드 저장 및 동기화
- **맥락 정보 확장**: 새로운 맥락 정보 타입 추가 가능
- **넥사 요소 확장**: 새로운 넥사 요소 타입(예: 위젯, 플러그인) 자동 추적
- **맥락 정보 플러그인**: 커스텀 맥락 정보 캡처 로직 추가 가능
- **변수 시스템 확장**: 커스텀 변수 타입 및 해석 로직 추가
- **조건 시스템 확장**: 커스텀 조건 연산자 추가
- **IOT 프로토콜 확장**: 새로운 IOT 프로토콜 플러그인 추가

### 5. 액션 편집 및 변수 시스템

- **변수 해석 성능**: 대규모 변수 스코프에서의 해석 성능 최적화
- **변수 타입 안정성**: 타입 검증 및 자동 변환 메커니즘
- **조건 평가 최적화**: 복잡한 조건식의 효율적인 평가
- **액션 편집 충돌 해결**: 동시 편집 시 충돌 해결 전략
- **변수 의존성 추적**: 변수 간 의존성 그래프 구축 및 순환 참조 방지

### 6. NEXA NODE 연동

- **변환 정확도**: 액션 시퀀스 ↔ 노드 그래프 변환의 정확도 보장
- **양방향 동기화**: 실시간 동기화 시 성능 및 충돌 처리
- **노드 타입 확장**: 새로운 노드 타입 추가 시 자동 매핑
- **그래프 최적화**: 노드 그래프 구조 최적화 알고리즘

### 7. IOT 연동

- **연결 안정성**: IOT 디바이스 연결 끊김 시 재연결 및 복구
- **실시간 처리**: 대량의 센서 데이터 실시간 처리 성능
- **보안**: IOT 디바이스 인증 및 암호화 통신
- **프로토콜 호환성**: 다양한 IOT 프로토콜 지원 및 변환
- **에러 처리**: 디바이스 오류 시 대체 전략 및 알림

### 8. 시스템 업데이트 및 호환성 관리

- **버전 관리**: 액션 시퀀스 버전 및 시스템 버전 추적
- **요소 찾기 전략**: 다중 폴백 전략으로 UI 변경에 대응
- **자동 마이그레이션**: 시스템 업데이트 감지 및 자동 마이그레이션
- **호환성 검사**: 재생 전 호환성 검사 및 사용자 알림
- **마이그레이션 안정성**: 마이그레이션 실패 시 롤백 및 복구
- **성능 최적화**: 대량 액션 시퀀스 배치 마이그레이션 성능
- **사용자 경험**: 자동 마이그레이션 vs 수동 업데이트 선택권 제공

---

## 구현 단계

### 단계 1: 액션 녹화 기본 구조

- 전역 이벤트 리스너 설정
- 기본 액션 타입 (click, input) 녹화
- 액션 시퀀스 저장
- 맥락 정보 기본 구조 정의
- 최소 맥락 정보 캡처 (라우팅, 넥사 패널)

### 단계 2: 액션 재생 엔진

- 기본 액션 재생 (click, input)
- 에러 처리
- 컨텍스트 관리
- 맥락 정보 검증 및 복원
- 라우팅 정보 기반 환경 복원

### 단계 3: 고급 액션 지원

- Store 액션 녹화/재생
- 라우터 네비게이션 녹화/재생
- 패널 액션 녹화/재생
- 넥사 요소 구조 완전 추적 (보드, 패널, 블럭, 노드, 관계)
- DOM 구조 캡처 및 검증
- 브라우저 환경 정보 캡처

### 단계 4: 사용자 퀵메뉴 시스템

- 퀵메뉴 UI 구현
- 퀵메뉴 항목 저장/로드
- 퀵메뉴 실행
- 맥락 정보 옵션 선택 UI
- 프리셋 관리 (최소/권장/전체)
- 맥락 정보 보기 및 편집 기능

### 단계 5: 단축키 통합

- 퀵메뉴 항목에 단축키 부여
- 기존 단축키 시스템과 통합

### 단계 6: 고급 기능

- 액션 편집 (수동 수정)
- 액션 병합/분할
- 액션 템플릿
- 액션 공유
- 변수 시스템
- 조건부 실행
- 액션 복사 및 부분 요소 삽입

### 단계 7: NEXA NODE 연동

- NEXA NODE와의 통합 인터페이스
- 액션 시퀀스를 노드 그래프로 변환
- 노드 그래프를 액션 시퀀스로 변환
- 노드 기반 자동화 워크플로우 통합

### 단계 8: IOT 연동

- 외부 트리거 연동 (웹훅, MQTT, HTTP API)
- 센서 데이터 기반 조건부 실행
- IOT 디바이스 제어 액션
- 실시간 이벤트 스트림 처리

### 단계 9: 시스템 업데이트 및 호환성 관리

- 버전 관리 시스템 (액션 시퀀스 버전, 시스템 버전 추적)
- 요소 찾기 전략 (다중 폴백: 원본 → 대체 셀렉터 → 관계 기반 → 의미 기반 → Store 액션)
- 자동 마이그레이션 (시스템 업데이트 감지 및 자동 마이그레이션)
- 호환성 검사 및 알림 (재생 전 호환성 검사, 사용자 알림)
- 수동 업데이트 UI (요소 재매핑, 맥락 정보 업데이트)
- 배치 마이그레이션 (모든 액션 시퀀스 일괄 업데이트)

---

## 액션 편집 및 고급 자동화 기능

### 1. 액션 편집 기능

녹화된 액션 시퀀스를 수동으로 편집하여 더 정확하고 유연한 자동화를 구성할 수 있습니다.

#### 1.1 액션 편집 UI

```typescript
interface ActionEditor {
  // 액션 시퀀스 시각화
  sequenceView: {
    timeline: boolean // 타임라인 뷰
    list: boolean // 리스트 뷰
    graph: boolean // 그래프 뷰 (조건, 반복 등)
  }

  // 편집 기능
  editActions: {
    add: boolean // 액션 추가
    remove: boolean // 액션 삭제
    modify: boolean // 액션 수정
    reorder: boolean // 순서 변경 (드래그 앤 드롭)
    duplicate: boolean // 복제
    copy: boolean // 복사
    paste: boolean // 붙여넣기
    insert: boolean // 다른 시퀀스의 부분 요소 삽입
  }

  // 검증 및 디버깅
  validation: {
    checkContext: boolean // 맥락 정보 검증
    checkElements: boolean // 요소 존재 확인
    simulate: boolean // 시뮬레이션 모드
  }
}
```

#### 1.2 액션 수정

```javascript
// 액션 파라미터 수정
function editAction(actionId, modifications) {
  const action = findAction(actionId)

  // 타겟 수정
  if (modifications.target) {
    action.target = { ...action.target, ...modifications.target }
  }

  // 파라미터 수정
  if (modifications.params) {
    action.params = { ...action.params, ...modifications.params }
  }

  // 맥락 정보 수정
  if (modifications.context) {
    action.context = { ...action.context, ...modifications.context }
  }

  // 변수 참조 추가
  if (modifications.variables) {
    action.variables = modifications.variables
  }

  return action
}
```

#### 1.3 액션 복사 및 부분 요소 삽입

```javascript
// 액션 시퀀스 복사
function copyActionSequence(sequenceId, startIndex, endIndex) {
  const sequence = getActionSequence(sequenceId)
  const actions = sequence.actions.slice(startIndex, endIndex)

  return {
    id: generateSequenceId(),
    name: `복사된 액션 (${sequence.name})`,
    actions: actions.map((action) => ({
      ...action,
      id: generateActionId(), // 새 ID 생성
    })),
    contextOptions: sequence.contextOptions,
  }
}

// 다른 시퀀스의 부분 요소 삽입
function insertActionSequence(targetSequenceId, insertIndex, sourceSequenceId, startIndex, endIndex) {
  const targetSequence = getActionSequence(targetSequenceId)
  const sourceSequence = getActionSequence(sourceSequenceId)
  const actionsToInsert = sourceSequence.actions.slice(startIndex, endIndex)

  // 타임스탬프 조정
  const baseTimestamp = targetSequence.actions[insertIndex]?.timestamp || 0
  const adjustedActions = actionsToInsert.map((action, index) => ({
    ...action,
    id: generateActionId(),
    timestamp: baseTimestamp + (action.timestamp - actionsToInsert[0].timestamp),
  }))

  // 삽입
  targetSequence.actions.splice(insertIndex, 0, ...adjustedActions)

  // 타임스탬프 재조정
  adjustTimestamps(targetSequence)

  return targetSequence
}
```

### 2. 변수 시스템

액션 시퀀스에 변수를 도입하여 동적이고 재사용 가능한 자동화를 구성할 수 있습니다.

#### 2.1 변수 타입

```typescript
type VariableType =
  | 'string' // 문자열
  | 'number' // 숫자
  | 'boolean' // 불린
  | 'array' // 배열
  | 'object' // 객체
  | 'element' // DOM 요소
  | 'nexa-element' // 넥사 요소 (패널, 블럭, 노드)
  | 'store-state' // Store 상태
  | 'context' // 맥락 정보
  | 'computed' // 계산된 값

interface Variable {
  id: string // 변수 ID
  name: string // 변수 이름
  type: VariableType // 변수 타입
  defaultValue?: any // 기본값
  description?: string // 설명
  scope: 'global' | 'sequence' | 'action' // 변수 스코프
}
```

#### 2.2 변수 사용

```javascript
// 액션에서 변수 참조
const actionWithVariable = {
  id: 'action-1',
  type: 'click',
  target: {
    selector: '{{buttonSelector}}', // 변수 참조
  },
  params: {
    value: '{{userName}}', // 변수 참조
  },
  variables: {
    buttonSelector: {
      type: 'string',
      value: '#submit-button',
    },
    userName: {
      type: 'string',
      value: '{{context.user.name}}', // 다른 변수 또는 맥락 정보 참조
    },
  },
}

// 변수 해석
function resolveVariables(action, variableScope) {
  const resolved = { ...action }

  // 타겟의 변수 해석
  if (resolved.target.selector) {
    resolved.target.selector = interpolate(resolved.target.selector, variableScope)
  }

  // 파라미터의 변수 해석
  resolved.params = resolveObjectVariables(resolved.params, variableScope)

  return resolved
}

// 변수 보간 함수
function interpolate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName]?.value ?? match
  })
}
```

#### 2.3 변수 편집 UI

- **변수 목록**: 시퀀스에서 사용되는 모든 변수 표시
- **변수 추가/수정/삭제**: 변수 관리
- **변수 바인딩**: 액션 파라미터에 변수 바인딩
- **변수 미리보기**: 변수 값 미리보기 및 테스트
- **변수 스코프 관리**: 전역/시퀀스/액션별 변수 관리

### 3. 조건부 실행

조건문을 사용하여 동적인 워크플로우를 구성할 수 있습니다.

#### 3.1 조건 타입

```typescript
type ConditionOperator =
  | 'equals' // 같음
  | 'not-equals' // 다름
  | 'greater-than' // 크다
  | 'less-than' // 작다
  | 'contains' // 포함
  | 'not-contains' // 포함하지 않음
  | 'exists' // 존재
  | 'not-exists' // 존재하지 않음
  | 'regex' // 정규식 매칭

interface Condition {
  id: string // 조건 ID
  type: 'if' | 'else-if' | 'else' | 'while' | 'for' // 조건 타입
  operator: ConditionOperator // 연산자
  leftOperand: string | Variable // 왼쪽 피연산자
  rightOperand: string | Variable | any // 오른쪽 피연산자
  actions: RecordedAction[] // 조건이 참일 때 실행할 액션
  elseActions?: RecordedAction[] // 조건이 거짓일 때 실행할 액션
}
```

#### 3.2 조건부 실행 구현

```javascript
// 조건 평가
function evaluateCondition(condition, variableScope) {
  const left = resolveOperand(condition.leftOperand, variableScope)
  const right = resolveOperand(condition.rightOperand, variableScope)

  switch (condition.operator) {
    case 'equals':
      return left === right
    case 'not-equals':
      return left !== right
    case 'greater-than':
      return Number(left) > Number(right)
    case 'less-than':
      return Number(left) < Number(right)
    case 'contains':
      return String(left).includes(String(right))
    case 'not-contains':
      return !String(left).includes(String(right))
    case 'exists':
      return left !== undefined && left !== null
    case 'not-exists':
      return left === undefined || left === null
    case 'regex':
      return new RegExp(right).test(String(left))
    default:
      return false
  }
}

// 조건부 액션 실행
async function executeConditionalActions(condition, variableScope) {
  const conditionResult = evaluateCondition(condition, variableScope)

  if (conditionResult) {
    // 조건이 참이면 actions 실행
    for (const action of condition.actions) {
      const resolvedAction = resolveVariables(action, variableScope)
      await replayAction(resolvedAction)
    }
  } else if (condition.elseActions) {
    // 조건이 거짓이고 elseActions가 있으면 실행
    for (const action of condition.elseActions) {
      const resolvedAction = resolveVariables(action, variableScope)
      await replayAction(resolvedAction)
    }
  }
}
```

#### 3.3 조건 편집 UI

- **조건 추가**: 액션 시퀀스에 조건문 추가
- **조건 빌더**: 시각적 조건 빌더 (드래그 앤 드롭)
- **조건 중첩**: 여러 조건을 AND/OR로 결합
- **조건 테스트**: 조건 평가 결과 미리보기

### 4. 액션 병합 및 분할

```javascript
// 여러 액션 시퀀스 병합
function mergeActionSequences(sequences, mergeStrategy = 'sequential') {
  const merged = {
    id: generateSequenceId(),
    name: '병합된 액션 시퀀스',
    actions: [],
    contextOptions: {},
  }

  sequences.forEach((sequence, index) => {
    const actions = sequence.actions.map((action) => ({
      ...action,
      id: generateActionId(),
      timestamp: mergeStrategy === 'sequential' ? calculateSequentialTimestamp(merged.actions, action.timestamp) : action.timestamp,
    }))

    merged.actions.push(...actions)
  })

  return merged
}

// 액션 시퀀스 분할
function splitActionSequence(sequenceId, splitIndex) {
  const sequence = getActionSequence(sequenceId)

  const firstPart = {
    ...sequence,
    id: generateSequenceId(),
    name: `${sequence.name} (Part 1)`,
    actions: sequence.actions.slice(0, splitIndex),
  }

  const secondPart = {
    ...sequence,
    id: generateSequenceId(),
    name: `${sequence.name} (Part 2)`,
    actions: sequence.actions.slice(splitIndex),
  }

  // 타임스탬프 재조정
  adjustTimestamps(firstPart)
  adjustTimestamps(secondPart, sequence.actions[splitIndex].timestamp)

  return [firstPart, secondPart]
}
```

---

## NEXA NODE 연동

### 1. 개요

NEXA NODE는 노드 기반 자동화 시스템으로, NEXA TEACH와 연동하여 더욱 유연하고 강력한 자동화 워크플로우를 구성할 수 있습니다.

### 2. 통합 아키텍처

```
┌─────────────────────────────────────────┐
│      액션 녹화 및 재생 시스템            │
│  - 액션 시퀀스                           │
│  - 변수 시스템                           │
│  - 조건부 실행                           │
└─────────────────────────────────────────┘
              ↕ 변환 인터페이스
┌─────────────────────────────────────────┐
│          NEXA NODE 시스템                │
│  - 노드 그래프                           │
│  - 노드 간 연결                           │
│  - 데이터 플로우                         │
└─────────────────────────────────────────┘
```

### 3. 액션 시퀀스 → 노드 그래프 변환

```javascript
// 액션 시퀀스를 노드 그래프로 변환
function convertSequenceToNodeGraph(actionSequence) {
  const nodes = []
  const edges = []

  actionSequence.actions.forEach((action, index) => {
    // 액션을 노드로 변환
    const node = {
      id: `node-${action.id}`,
      type: mapActionTypeToNodeType(action.type),
      data: {
        label: action.type,
        action: action,
        variables: action.variables || {},
      },
      position: calculateNodePosition(index),
    }
    nodes.push(node)

    // 이전 노드와 연결
    if (index > 0) {
      edges.push({
        id: `edge-${index}`,
        source: nodes[index - 1].id,
        target: node.id,
      })
    }
  })

  // 조건부 실행을 노드로 변환
  actionSequence.actions.forEach((action, index) => {
    if (action.condition) {
      const conditionNode = {
        id: `condition-${action.id}`,
        type: 'condition',
        data: {
          label: '조건',
          condition: action.condition,
        },
        position: calculateNodePosition(index, true),
      }
      nodes.push(conditionNode)

      // 조건 노드 연결
      edges.push({
        id: `edge-condition-${index}`,
        source: nodes[index - 1]?.id,
        target: conditionNode.id,
      })

      // 참/거짓 분기
      edges.push({
        id: `edge-true-${index}`,
        source: conditionNode.id,
        target: nodes[index].id,
        label: 'true',
      })

      if (action.condition.elseActions) {
        // else 노드 추가 및 연결
        // ...
      }
    }
  })

  return {
    nodes,
    edges,
    variables: extractVariables(actionSequence),
  }
}

// 액션 타입을 노드 타입으로 매핑
function mapActionTypeToNodeType(actionType) {
  const mapping = {
    click: 'action-click',
    input: 'action-input',
    navigation: 'action-navigation',
    'store-action': 'action-store',
    'panel-action': 'action-panel',
    keyboard: 'action-keyboard',
  }
  return mapping[actionType] || 'action-generic'
}
```

### 4. 노드 그래프 → 액션 시퀀스 변환

```javascript
// 노드 그래프를 액션 시퀀스로 변환
function convertNodeGraphToSequence(nodeGraph) {
  const actions = []
  const variableScope = {}

  // 노드를 액션으로 변환
  nodeGraph.nodes.forEach((node) => {
    if (node.type.startsWith('action-')) {
      const action = {
        id: generateActionId(),
        type: mapNodeTypeToActionType(node.type),
        timestamp: calculateTimestamp(node),
        target: node.data.action?.target || {},
        params: node.data.action?.params || {},
        context: node.data.action?.context || {},
        variables: node.data.variables || {},
      }
      actions.push(action)
    }

    // 조건 노드 처리
    if (node.type === 'condition') {
      const condition = {
        id: generateActionId(),
        type: 'conditional',
        condition: node.data.condition,
        actions: extractActionsFromNode(node, 'true'),
        elseActions: extractActionsFromNode(node, 'false'),
      }
      actions.push(condition)
    }

    // 변수 추출
    if (node.data.variables) {
      Object.assign(variableScope, node.data.variables)
    }
  })

  return {
    id: generateSequenceId(),
    name: nodeGraph.name || '노드 그래프에서 변환',
    actions,
    contextOptions: nodeGraph.contextOptions || RECOMMENDED_CONTEXT_OPTIONS,
    variables: variableScope,
  }
}
```

### 5. 양방향 동기화

```javascript
// NEXA NODE와 NEXA TEACH 간 실시간 동기화
function syncWithNexaNode(actionSequenceId, nodeGraphId) {
  // 액션 시퀀스 변경 감지
  watchActionSequence(actionSequenceId, (sequence) => {
    const nodeGraph = convertSequenceToNodeGraph(sequence)
    updateNexaNodeGraph(nodeGraphId, nodeGraph)
  })

  // 노드 그래프 변경 감지
  watchNodeGraph(nodeGraphId, (nodeGraph) => {
    const sequence = convertNodeGraphToSequence(nodeGraph)
    updateActionSequence(actionSequenceId, sequence)
  })
}
```

### 6. 통합 워크플로우

1. **녹화 → 노드 편집**: 액션을 녹화한 후 NEXA NODE에서 시각적으로 편집
2. **노드 구성 → 실행**: NEXA NODE에서 노드 그래프를 구성한 후 액션 시퀀스로 변환하여 실행
3. **하이브리드**: 일부는 녹화, 일부는 노드로 구성하여 결합

---

## IOT 연동

### 1. 개요

IOT 디바이스와 연동하여 외부 트리거, 센서 데이터 기반 조건부 실행, 디바이스 제어 등을 지원합니다.

### 2. IOT 트리거 타입

```typescript
type IOTTriggerType =
  | 'webhook' // 웹훅 (HTTP POST)
  | 'mqtt' // MQTT 메시지
  | 'http-api' // HTTP API 폴링
  | 'websocket' // WebSocket 메시지
  | 'sensor-data' // 센서 데이터
  | 'device-event' // 디바이스 이벤트
  | 'schedule' // 스케줄 (시간 기반)
  | 'condition' // 조건 기반 (센서 값 임계값)

interface IOTTrigger {
  id: string // 트리거 ID
  type: IOTTriggerType // 트리거 타입
  config: {
    endpoint?: string // 엔드포인트 URL
    topic?: string // MQTT 토픽
    deviceId?: string // 디바이스 ID
    sensorId?: string // 센서 ID
    condition?: Condition // 조건 (센서 데이터용)
    schedule?: string // 스케줄 (cron 형식)
  }
  actionSequenceId: string // 실행할 액션 시퀀스 ID
  enabled: boolean // 활성화 여부
}
```

### 3. 웹훅 트리거

```javascript
// 웹훅 트리거 설정
function setupWebhookTrigger(trigger) {
  const endpoint = `/api/iot/webhook/${trigger.id}`

  // 백엔드에 웹훅 엔드포인트 등록
  registerWebhookEndpoint(endpoint, async (request) => {
    if (trigger.enabled) {
      const actionSequence = getActionSequence(trigger.actionSequenceId)

      // 웹훅 데이터를 변수로 주입
      const variables = {
        webhookData: {
          type: 'object',
          value: request.body,
        },
        webhookHeaders: {
          type: 'object',
          value: request.headers,
        },
      }

      // 액션 시퀀스 실행
      await replayActionSequence(actionSequence, {
        variables,
      })
    }
  })

  return endpoint
}
```

### 4. MQTT 트리거

```javascript
// MQTT 트리거 설정
function setupMQTTTrigger(trigger) {
  const mqttClient = getMQTTClient()

  mqttClient.subscribe(trigger.config.topic, (message) => {
    if (trigger.enabled) {
      const actionSequence = getActionSequence(trigger.actionSequenceId)

      // MQTT 메시지를 변수로 주입
      const variables = {
        mqttTopic: {
          type: 'string',
          value: trigger.config.topic,
        },
        mqttMessage: {
          type: 'object',
          value: JSON.parse(message.toString()),
        },
      }

      // 액션 시퀀스 실행
      await replayActionSequence(actionSequence, {
        variables,
      })
    }
  })
}
```

### 5. 센서 데이터 기반 조건부 실행

```javascript
// 센서 데이터 모니터링 및 조건부 실행
function setupSensorTrigger(trigger) {
  const sensorMonitor = getSensorMonitor()

  sensorMonitor.watch(trigger.config.deviceId, trigger.config.sensorId, (data) => {
    if (trigger.enabled && trigger.config.condition) {
      // 조건 평가
      const condition = {
        ...trigger.config.condition,
        leftOperand: {
          type: 'sensor-data',
          value: data.value,
        },
      }

      const conditionResult = evaluateCondition(condition, {})

      if (conditionResult) {
        const actionSequence = getActionSequence(trigger.actionSequenceId)

        // 센서 데이터를 변수로 주입
        const variables = {
          sensorValue: {
            type: 'number',
            value: data.value,
          },
          sensorTimestamp: {
            type: 'number',
            value: data.timestamp,
          },
          sensorUnit: {
            type: 'string',
            value: data.unit,
          },
        }

        // 액션 시퀀스 실행
        await replayActionSequence(actionSequence, {
          variables,
        })
      }
    }
  })
}
```

### 6. IOT 디바이스 제어 액션

```javascript
// IOT 디바이스 제어를 위한 액션 타입 추가
type RecordableActionType =
  | 'click'
  | 'input'
  | // ... 기존 타입들
  | 'iot-control' // IOT 디바이스 제어

interface IOTControlAction extends RecordedAction {
  type: 'iot-control'
  target: {
    deviceId: string // 디바이스 ID
    deviceType: string // 디바이스 타입
  }
  params: {
    command: string // 제어 명령
    value?: any // 제어 값
  }
}

// IOT 제어 액션 재생
async function replayIOTControlAction(action) {
  const iotClient = getIOTClient()

  await iotClient.sendCommand(action.target.deviceId, {
    command: action.params.command,
    value: action.params.value,
  })
}
```

### 7. 실시간 이벤트 스트림 처리

```javascript
// 실시간 이벤트 스트림 처리
function setupEventStream(streamConfig) {
  const eventStream = getEventStream(streamConfig.endpoint)

  eventStream.on('event', async (event) => {
    // 이벤트 타입에 따라 다른 액션 시퀀스 실행
    const trigger = findTriggerByEventType(event.type)

    if (trigger && trigger.enabled) {
      const actionSequence = getActionSequence(trigger.actionSequenceId)

      // 이벤트 데이터를 변수로 주입
      const variables = {
        eventType: {
          type: 'string',
          value: event.type,
        },
        eventData: {
          type: 'object',
          value: event.data,
        },
        eventTimestamp: {
          type: 'number',
          value: event.timestamp,
        },
      }

      // 액션 시퀀스 실행
      await replayActionSequence(actionSequence, {
        variables,
      })
    }
  })
}
```

### 8. IOT 통합 UI

- **트리거 관리**: IOT 트리거 목록, 추가, 수정, 삭제
- **디바이스 목록**: 연결된 IOT 디바이스 목록 및 상태
- **센서 모니터링**: 실시간 센서 데이터 표시 및 그래프
- **트리거 테스트**: 트리거 수동 실행 및 테스트
- **로그 및 모니터링**: 트리거 실행 로그 및 통계

---

## 파일 구조

```
src/
├── composables/
│   ├── useActionRecorder.js      # 액션 녹화 엔진
│   ├── useActionPlayback.js      # 액션 재생 엔진
│   ├── useActionEditor.js        # 액션 편집 기능
│   ├── useVariableSystem.js      # 변수 시스템
│   ├── useConditionalExecution.js # 조건부 실행
│   ├── useQuickMenu.js           # 퀵메뉴 관리
│   ├── useContextCapture.js     # 맥락 정보 캡처
│   ├── useContextValidation.js   # 맥락 정보 검증
│   ├── useNexaNodeIntegration.js # NEXA NODE 연동
│   ├── useIOTIntegration.js      # IOT 연동
│   └── useGlobalShortcuts.js     # 단축키 시스템 (수정)
├── stores/
│   ├── quickMenuStore.js         # 퀵메뉴 상태 관리
│   ├── variableStore.js          # 변수 상태 관리
│   └── iotTriggerStore.js        # IOT 트리거 상태 관리
├── utils/
│   ├── contextOptions.js          # 맥락 정보 옵션 정의 및 프리셋
│   ├── nexaStructureTracker.js   # 넥사 요소 구조 추적
│   ├── contextSerializer.js       # 맥락 정보 직렬화/압축
│   ├── actionConverter.js        # 액션 시퀀스 ↔ 노드 그래프 변환
│   ├── variableResolver.js       # 변수 해석
│   ├── conditionEvaluator.js     # 조건 평가
│   ├── versionManager.js          # 버전 관리 및 호환성 검사
│   ├── elementFinder.js          # 요소 찾기 (다중 폴백 전략)
│   └── actionMigrator.js         # 액션 시퀀스 마이그레이션
├── services/
│   ├── iotWebhookService.js      # 웹훅 서비스
│   ├── iotMQTTService.js         # MQTT 서비스
│   ├── iotSensorService.js        # 센서 데이터 서비스
│   └── iotDeviceService.js        # 디바이스 제어 서비스
└── components/
    ├── ActionRecorder.vue         # 녹화 UI
    ├── ActionEditor.vue          # 액션 편집 UI
    ├── VariableEditor.vue         # 변수 편집 UI
    ├── ConditionBuilder.vue       # 조건 빌더 UI
    ├── ContextOptionsDialog.vue   # 맥락 정보 옵션 선택 다이얼로그
    ├── QuickMenuManager.vue       # 퀵메뉴 관리 UI
    ├── QuickMenuPanel.vue         # 퀵메뉴 실행 패널
    ├── NexaNodeIntegration.vue   # NEXA NODE 연동 UI
    ├── IOTTriggerManager.vue      # IOT 트리거 관리 UI
    ├── IOTDeviceMonitor.vue      # IOT 디바이스 모니터링 UI
    ├── CompatibilityChecker.vue   # 호환성 검사 및 알림 UI
    ├── ElementRemappingDialog.vue # 요소 재매핑 다이얼로그
    └── ContextUpdateDialog.vue    # 맥락 정보 업데이트 다이얼로그
```

---

## 녹화 엔진 상세 설계 (추가 연구 필요)

### 현재 고려 사항

1. **이벤트 캡처 전략**

   - Capture phase vs Bubble phase
   - 이벤트 버블링 처리
   - 이벤트 취소 처리

2. **요소 식별 전략**

   - CSS 셀렉터 생성 알고리즘
   - 컴포넌트 ID 추적
   - 동적 요소 처리
   - 넥사 요소 ID 추적 (패널, 블럭, 노드, 보드)

3. **타이밍 처리**

   - 상대 시간 vs 절대 시간
   - 비동기 작업 대기
   - 애니메이션 완료 대기

4. **상태 관리**

   - Store 상태 스냅샷
   - DOM 상태 스냅샷
   - 컨텍스트 복원 전략

5. **에러 복구**

   - 재시도 메커니즘
   - 대체 액션
   - 부분 재생

6. **맥락 정보 관리**

   - 맥락 정보 캡처 성능 최적화
   - 맥락 정보 데이터 크기 관리
   - 맥락 정보 선택적 캡처 전략
   - 넥사 요소 구조 추적 알고리즘
   - 요소 간 관계 그래프 구축
   - 맥락 정보 압축 및 직렬화
   - 재생 시 맥락 정보 검증 및 복원

---

## 기대 효과

### 사용자 관점

1. **사용자 생산성 향상**: 반복 작업 자동화를 통해 업무 효율 극대화
2. **시스템 유연성**: 모든 액션을 단축키로 변환 가능하여 완전한 사용자 맞춤화
3. **사용자 경험 개선**: 개인 맞춤형 워크플로우 구성으로 직관적인 작업 환경
4. **학습 곡선 최소화**: 녹화 기반 자동화로 복잡한 스크립팅 지식 없이도 고급 자동화 구성

### 기술적 관점

5. **고급 자동화**: 변수, 조건부 실행을 통한 동적 워크플로우 구성
6. **시각적 편집**: NEXA NODE 연동을 통한 노드 기반 시각적 편집
7. **IOT 통합**: 외부 디바이스 및 센서와의 연동으로 확장된 자동화
8. **재사용성**: 액션 복사, 부분 삽입, 템플릿을 통한 높은 재사용성
9. **확장성**: 플러그인 시스템을 통한 무한한 확장 가능성
10. **개발 효율성**: 테스트 자동화, 데모 시나리오 생성 등에 활용

### 넥사 플랫폼 관점

11. **통합 자동화 플랫폼**: NEXA 플랫폼의 모든 기능을 연결하는 통합 자동화 계층
12. **시스템 간 연결**: NEXA BOARD ↔ ERP ↔ IOT ↔ 사용자 액션을 하나의 워크플로우로 통합
13. **핵심 인프라**: 넥사 플랫폼의 자동화 생태계를 구축하는 핵심 인프라 역할
14. **확장 가능한 생태계**: 새로운 기능이 추가되면 자동으로 녹화/재생이 가능한 생태계
15. **플랫폼 차별화**: 넥사 플랫폼을 다른 플랫폼과 차별화하는 핵심 기능

### 비즈니스 관점

16. **운영 효율성**: 반복 작업 자동화로 운영 비용 절감
17. **사용자 만족도**: 개인 맞춤형 자동화로 사용자 만족도 향상
18. **시스템 통합**: 여러 시스템을 하나의 자동화 플랫폼으로 통합하여 관리 효율성 향상
19. **미래 확장성**: 새로운 시스템 추가 시 자동으로 통합 가능한 확장 가능한 구조

---

## 향후 연구 과제

### AI 접목 계획 (고도화 단계)

NEXA TEACH의 고도화를 위해 AI를 접목하여 다음과 같은 기능을 제공할 예정입니다:

#### 1. 컨텍스트 파악 및 자동 보정

- **의도 파악**: 녹화된 액션의 의도를 AI가 분석하여 사용자가 놓친 부분을 자동으로 보완
- **컨텍스트 이해**: UI 상태, 데이터 흐름, 사용자 목표 등을 종합적으로 분석
- **자동 최적화**: 불필요한 액션 제거, 액션 순서 최적화, 대기 시간 조정 등

#### 2. 에러 대응 및 복구

- **예외 상황 감지**: 녹화 시와 다른 환경에서 발생하는 예외 상황 자동 감지
- **자동 복구**: 에러 발생 시 대안 경로를 찾아 자동으로 복구
- **적응형 실행**: 환경 변화에 따라 액션을 동적으로 조정하여 실행

#### 3. 지능형 액션 생성

- **패턴 학습**: 사용자의 반복적인 작업 패턴을 학습하여 자동으로 액션 시퀀스 제안
- **컨텍스트 기반 추론**: 현재 상황을 분석하여 다음에 수행할 액션을 예측
- **자동 완성**: 부분적으로 녹화된 액션을 AI가 완성

#### 4. 사용자 맞춤화

- **개인화된 자동화**: 사용자별 작업 패턴을 학습하여 개인화된 자동화 제안
- **학습 곡선 최소화**: 초보자도 쉽게 사용할 수 있도록 AI가 가이드 제공

### 기술적 연구 과제

1. **녹화 엔진 성숙화**: 더 정확하고 안정적인 액션 캡처
2. **재생 엔진 개선**: 복잡한 시나리오 처리 능력 향상
3. **협업 기능**: 퀵메뉴 항목 공유 및 협업
5. **액션 편집 고도화**:
   - 시각적 액션 편집기 (드래그 앤 드롭)
   - 액션 템플릿 라이브러리
   - 액션 검증 및 최적화 자동화
6. **변수 시스템 확장**:
   - 동적 변수 (런타임 계산)
   - 변수 상속 및 스코프 체인
   - 변수 타입 검증 및 자동 변환
7. **조건부 실행 고도화**:
   - 복잡한 조건식 (AND/OR/NOT 조합)
   - 반복문 (for, while)
   - 예외 처리 (try-catch)
8. **NEXA NODE 통합 심화**:
   - 실시간 양방향 동기화
   - 노드 커스텀 타입 확장
   - 노드 그래프 최적화
9. **IOT 연동 확장**:
   - 더 많은 IOT 프로토콜 지원 (CoAP, Zigbee 등)
   - 디바이스 자동 발견 및 등록
   - IOT 디바이스 페어링 및 인증
   - 엣지 컴퓨팅 지원
10. **클라우드 통합**:
    - 액션 시퀀스 클라우드 저장 및 동기화
    - 멀티 디바이스 실행
    - 원격 트리거 및 모니터링
11. **보안 강화**:
    - 액션 시퀀스 서명 및 검증
    - 암호화된 액션 저장
    - 권한 기반 액션 실행 제어
12. **성능 최적화**:
    - 대규모 액션 시퀀스 처리
    - 병렬 액션 실행
    - 액션 캐싱 및 재사용
13. **시스템 업데이트 및 호환성 관리 고도화**:
    - AI 기반 요소 매핑 (머신러닝을 통한 자동 요소 찾기)
    - 시맨틱 매칭 개선 (의미 기반 요소 찾기 정확도 향상)
    - 자동 마이그레이션 정확도 향상
    - 버전별 마이그레이션 규칙 데이터베이스
    - 사용자 피드백 기반 마이그레이션 개선
