# D3.js 기반 NEXA 시스템 응용 전략

**작성일**: 2024년 12월  
**목적**: NEXA 플랫폼의 다양한 기능 영역에 D3.js를 효과적으로 적용하기 위한 전략 및 가이드  
**버전**: 1.0  
**참고 문서**: [D3 기반 다이어그램 설정 시스템 가이드](./D3_기반_다이어그램_설정_시스템_가이드.md)

---

## 📋 개요

### D3.js의 핵심 특성

D3.js는 데이터 기반 문서 조작 라이브러리로, 다음과 같은 특성을 가집니다:

1. **데이터 기반 렌더링 (Data-Driven)**
   - 데이터와 DOM 요소의 바인딩
   - 데이터 변화에 따른 자동 업데이트
   - Enter, Update, Exit 패턴

2. **강력한 레이아웃 알고리즘**
   - Force-Directed Graph: 네트워크 관계 시각화
   - Hierarchical Layout: 계층 구조 표현
   - Chart: 통계 데이터 시각화
   - 기타 다양한 레이아웃 (Tree, Sankey, Chord, Cluster, Pack)

3. **인터랙티브 기능**
   - `d3.drag()`: 커스텀 드래그 앤 드롭
   - `d3.zoom()`: 줌/팬 제스처
   - `d3.brush()`: 영역 선택
   - 이벤트 기반 상호작용

4. **유연한 렌더링 방식**
   - SVG 기반 벡터 그래픽
   - Canvas를 통한 대용량 데이터 렌더링
   - HTML 요소 조작도 가능

5. **확장 가능한 구조**
   - 모듈화된 API
   - 커스텀 레이아웃 및 전환 함수 구현 가능

### NEXA 시스템 적용 원칙

1. **기존 기능 유지**: 현재 잘 작동하는 구조는 그대로 유지
2. **보완적 활용**: D3는 새로운 뷰 모드나 추가 기능으로 활용
3. **점진적 확장**: 단계별로 기능 추가, 사용자 피드백 반영
4. **타입별 최적 선택**: 각 기능 영역의 특성에 맞는 D3 타입 선택

---

## 🔍 D3.js vs 다른 시각화 라이브러리 비교

### 주요 시각화 라이브러리 비교표

| 라이브러리 | 타입 | 특징 | 장점 | 단점 | NEXA 적용성 | 라이선스 |
|-----------|------|------|------|------|-------------|----------|
| **D3.js** | 범용 (저수준) | 데이터 기반 DOM 조작, 완전한 커스터마이징 | ✅ 무한한 커스터마이징<br>✅ 레이아웃 알고리즘 다양<br>✅ 학습 자료 풍부<br>✅ 커뮤니티 크고 활발<br>✅ 다른 라이브러리 기반 | ⚠️ 학습 곡선 높음<br>⚠️ 초기 구현 시간 소요<br>⚠️ 보일러플레이트 코드 많음 | ✅✅✅✅✅ 매우 높음<br>(현재 사용 중) | BSD-3-Clause |
| **Chart.js** | 차트 중심 | Canvas 기반, 설정 기반 선언적 API | ✅ 사용 간단<br>✅ 반응형 기본 지원<br>✅ 애니메이션 내장<br>✅ 문서화 우수<br>✅ 가벼움 (~60KB) | ❌ 차트 타입 제한적<br>❌ 커스터마이징 제한<br>❌ 네트워크/그래프 없음<br>❌ 복잡한 상호작용 어려움 | ✅✅ 중간<br>(단순 차트용) | MIT |
| **ECharts** | 차트 중심 | Canvas 기반, 중국 바이두 개발 | ✅ 차트 타입 매우 다양<br>✅ 상호작용 기능 풍부<br>✅ 대용량 데이터 처리<br>✅ 3D 차트 지원<br>✅ 문서화 우수 (중/영) | ⚠️ 번들 크기 큼 (~700KB)<br>⚠️ 네트워크/그래프 제한<br>⚠️ 커스터마이징 제한<br>⚠️ 아시아권 중심 | ✅✅✅ 높음<br>(복잡한 차트 필요 시) | Apache-2.0 |
| **Plotly.js** | 과학/통계 | WebGL/Canvas, 과학적 시각화 특화 | ✅ 3D 시각화 강력<br>✅ 과학적 차트 다양<br>✅ 대화형 기능 풍부<br>✅ Python/R 연동 쉬움<br>✅ 상업용 지원 | ❌ 번들 크기 매우 큼 (~3MB)<br>❌ 학습 곡선 높음<br>❌ 네트워크/그래프 없음<br>❌ 일반 비즈니스 차트에 과함 | ✅ 낮음<br>(과학 시각화 필요 시만) | MIT |
| **vis.js** | 네트워크/그래프 | 네트워크, 타임라인, 그래프 특화 | ✅ 네트워크 시각화 강력<br>✅ 타임라인 기능<br>✅ 물리 시뮬레이션 내장<br>✅ 설정 기반 사용 쉬움 | ❌ 차트 타입 제한적<br>❌ 커스터마이징 제한<br>❌ 활발한 개발 중단<br>⚠️ 유지보수 우려 | ✅✅ 중간<br>(네트워크만 필요 시) | Apache-2.0 / MIT |
| **Cytoscape.js** | 네트워크 전용 | 네트워크 그래프 전문화 | ✅ 네트워크 시각화 최고<br>✅ 그래프 알고리즘 풍부<br>✅ 확장성 우수<br>✅ 성능 최적화 | ❌ 네트워크 전용<br>❌ 차트 없음<br>❌ 학습 곡선 높음<br>❌ 번들 크기 큼 (~500KB) | ✅✅✅ 높음<br>(고급 네트워크만 필요 시) | MIT |
| **Observable Plot** | 차트 중심 | D3.js 팀 개발, 선언적 API | ✅ D3.js 기반<br>✅ 사용 간단<br>✅ 현대적 API<br>✅ 작은 번들 크기 | ❌ 네트워크/그래프 없음<br>❌ 차트 타입 제한적<br>❌ 상대적으로 신규<br>❌ 커뮤니티 작음 | ✅✅ 중간<br>(D3.js 대체 고려 시) | ISC |
| **Highcharts** | 차트 중심 | 상용 라이선스, 기능 풍부 | ✅ 차트 타입 다양<br>✅ 문서화 우수<br>✅ 상업적 지원<br>✅ 안정성 높음 | ❌ 상용 라이선스 필요<br>❌ 번들 크기 큼<br>❌ 네트워크/그래프 제한<br>❌ 커스터마이징 제한 | ❌ 낮음<br>(라이선스 비용) | Commercial / CC BY-NC |
| **Recharts** | React 전용 | React 컴포넌트 기반 | ✅ React 통합 우수<br>✅ 선언적 API<br>✅ 사용 간단 | ❌ React 전용<br>❌ 차트 타입 제한<br>❌ 네트워크/그래프 없음<br>❌ 커스터마이징 제한 | ❌ 낮음<br>(React 전용) | MIT |
| **Vega/Vega-Lite** | 선언적 | JSON 기반 선언적 시각화 | ✅ 선언적 방식<br>✅ 재사용성 높음<br>✅ 데이터 변환 기능 | ❌ 학습 곡선 높음<br>❌ 복잡한 인터랙션 어려움<br>❌ 네트워크/그래프 제한<br>❌ 커뮤니티 작음 | ✅ 낮음<br>(특수 목적) | BSD-3-Clause |
| **ApexCharts** | 차트 중심 | 현대적 디자인, 반응형 | ✅ 현대적 디자인<br>✅ 반응형 우수<br>✅ 애니메이션 부드러움<br>✅ 사용 간단 | ❌ 차트 타입 제한<br>❌ 네트워크/그래프 없음<br>❌ 커스터마이징 제한<br>❌ Vue/React 전용 | ✅✅ 중간<br>(현대적 차트 필요 시) | MIT |

### NEXA 시스템에 D3.js를 선택한 이유

1. **범용성과 유연성**
   - 네트워크/그래프, 차트, 계층 구조 등 다양한 시각화 타입 지원
   - 다른 라이브러리는 특정 용도에만 특화됨

2. **완전한 커스터마이징**
   - NEXA 테마 시스템과 완벽 통합 가능
   - 브랜딩 및 디자인 시스템 준수 필수

3. **확장 가능한 구조**
   - 새로운 시각화 타입 추가 용이
   - NEXA 시스템의 다양한 요구사항 대응

4. **장기적 유지보수**
   - 활발한 커뮤니티 및 지속적 업데이트
   - 표준 기술이므로 장기 지원 가능

5. **다른 라이브러리와의 호환성**
   - D3.js 기반 라이브러리 활용 가능 (dagre-d3-es 등)
   - 필요 시 다른 라이브러리와 혼용 가능

### 언제 다른 라이브러리를 고려할 수 있는가?

#### Chart.js를 고려할 시점
- **조건**: 단순한 통계 차트만 필요하고, 빠른 프로토타이핑이 우선일 때
- **예시**: 대시보드의 기본 통계 카드에 간단한 Bar/Pie 차트
- **주의**: 네트워크/그래프가 필요하면 D3.js 유지

#### ECharts를 고려할 시점
- **조건**: 복잡한 차트 타입이 많이 필요하고, 네트워크/그래프는 불필요할 때
- **예시**: 고급 통계 대시보드, 3D 차트 필요 시
- **주의**: 번들 크기가 크므로 트리 쉐이킹 필요

#### Cytoscape.js를 고려할 시점
- **조건**: 네트워크 그래프만 필요하고, 매우 복잡한 그래프 알고리즘이 필요할 때
- **예시**: 대규모 네트워크 분석, 그래프 레이아웃 알고리즘 다양성 필요
- **주의**: 차트 타입이 전혀 없으므로 차트는 D3.js 유지

#### Observable Plot을 고려할 시점
- **조건**: D3.js의 복잡도를 줄이고 싶지만 D3.js 기반을 유지하고 싶을 때
- **예시**: 단순 차트만 필요하고 D3.js 학습 곡선을 피하고 싶을 때
- **주의**: 네트워크/그래프 없음, 아직 신규 라이브러리

### 결론 및 권장사항

**NEXA 시스템에서는 D3.js 선택이 적절합니다:**

1. ✅ **다양한 시각화 타입 필요**: 네트워크, 차트, 계층 구조 모두 지원
2. ✅ **커스터마이징 필수**: NEXA 테마 시스템 통합 필요
3. ✅ **장기적 확장**: 새로운 기능 추가 지속 예정
4. ✅ **현재 구현 완료**: 이미 D3.js 기반 인프라 구축 완료

**다른 라이브러리 도입을 고려할 특수 상황:**

- **Chart.js**: 단순 통계 차트만 필요한 별도 마이크로 서비스/페이지
- **ECharts**: 복잡한 차트 전용 대시보드 (네트워크 불필요)
- **Cytoscape.js**: 네트워크 분석 전용 도구 (차트 불필요)

**일반적인 권장사항:**

- 현재 D3.js 기반 인프라가 잘 구축되어 있으므로 **D3.js 중심으로 계속 진행**
- 특수한 요구사항이 있을 때만 해당 라이브러리 추가 검토
- 혼용 시 번들 크기 관리 및 일관성 유지에 주의

---

## 🏗️ 전체 구조

### D3 적용 전략 구조도

```
NEXA 플랫폼
│
├── 기존 기능 (유지)
│   ├── Parts Management (물리 공간 그리드)
│   ├── 기타 기존 UI 컴포넌트
│   └── ...
│
└── D3 기반 새 뷰 모드 (추가)
    ├── 1. 실시간 IOT 센서 데이터
    │   └── Chart 타입 (Line, Area, Bar)
    │
    ├── 2. NEXA NODE (업무 자동화)
    │   └── Force-Directed Graph
    │
    ├── 3. NEXA TEACH (프로세스 녹화)
    │   ├── Hierarchical Layout (프로세스 플로우)
    │   └── Sankey Diagram (데이터 흐름)
    │
    ├── 4. NEXA ERP (업무 관계)
    │   ├── Hierarchical Layout (조직/업무 구조)
    │   └── Force-Directed Graph (관계 시각화)
    │
    ├── 5. 부품관리 (추가 뷰)
    │   ├── Force-Directed Graph (부품 관계 네트워크)
    │   ├── Chart 타입 (통계 대시보드)
    │   ├── Hierarchical Layout (창고 구조 계층)
    │   └── Sankey Diagram (이동 경로)
    │
    └── 6. NEXA BOARD (장비 관리)
        ├── Force-Directed Graph (장비 네트워크)
        └── Hierarchical Layout (제어 계층)
```

### 구현 접근 방식

#### 모드 1: 뷰 전환 방식 (기본 추천)

```
[기존 뷰] ←→ [D3 뷰]
  (유지)      (새로 추가)
```

- 사용자가 뷰를 전환할 수 있도록 탭/버튼 제공
- 기존 기능은 완전히 유지, D3 뷰는 별도 컴포넌트로 구현
- 예: "그리드 뷰" / "네트워크 뷰" / "통계 뷰" 전환

#### 모드 2: 사이드바 패널 방식

```
[메인 뷰]
  └── [사이드바]
      └── [D3 시각화 패널]
```

- 기존 뷰는 메인으로 유지
- 사이드바에 D3 기반 시각화 패널 추가
- 예: 부품관리 메인 화면 + 사이드바에 "부품 관계 네트워크" 패널

#### 모드 3: 대시보드 통합 방식

```
[대시보드]
  ├── [기존 카드/그리드]
  └── [D3 차트/다이어그램 영역]
```

- 기존 UI 요소와 D3 시각화를 같은 화면에 배치
- 예: 통계 대시보드에 D3 Chart 타입 추가

---

## 📊 구체적인 적용 사례

### 1. 실시간 IOT 센서 데이터 그래픽 표현 및 조작 UI

#### 적용 타입
- **Chart 타입 (Line Chart, Area Chart, Bar Chart)**
- 순수 D3.js 직접 구현

#### 구현 방안

**기존 구조 유지:**
- 현재 IOT 데이터 수집/저장 시스템은 그대로 유지

**D3 추가 기능:**
```
[IOT 대시보드]
  ├── 기존 데이터 테이블/카드 (유지)
  └── D3 Chart 뷰 (새로 추가)
      ├── Line Chart: 시간대별 센서 값 추이
      ├── Area Chart: 누적 데이터 시각화
      ├── Bar Chart: 센서별 비교
      └── Scatter Plot: 센서 간 상관관계
```

**구체적 기능:**
- 실시간 데이터 스트리밍 (WebSocket → D3 업데이트)
- 다중 센서 동시 모니터링 (멀티 라인 차트)
- 브러싱 (Brush)을 통한 시간 범위 선택
- 줌/팬으로 상세 분석
- 호버 인터랙션으로 정확한 값 확인

**구현 컴포넌트:**
- `IotSensorChartView.vue`: D3 Chart 뷰 컴포넌트
- `charts/line/LineChart.js`: 실시간 라인 차트 렌더링
- 데이터 스트리밍 어댑터: WebSocket → D3 데이터 포맷 변환

**우선순위**: ⭐⭐⭐⭐⭐ (가장 높음)

---

### 2. NEXA NODE: 업무 자동화 로직 편집, 믹싱 툴

#### 적용 타입
- **Force-Directed Graph** (노드-엣지 구조)
- **Hierarchical Layout** (워크플로우 표현)

#### 구현 방안

**기존 구조 유지:**
- 현재 노드 에디터 UI는 그대로 유지 (향후 개선 시 고려)

**D3 추가 기능:**
```
[NEXA NODE 에디터]
  ├── 기존 노드 편집 UI (유지)
  └── D3 네트워크 뷰 (새로 추가)
      ├── Force-Directed Graph: 노드 관계 시각화
      └── Hierarchical Layout: 워크플로우 플로우차트
```

**구체적 기능:**
- 노드 간 연결 관계를 Force-Directed Graph로 시각화
- 노드 드래그로 레이아웃 조정 (기존 고정 노드 기능 활용)
- 노드 호버 시 연결된 노드 하이라이트
- 워크플로우를 Hierarchical Layout으로 계층형 표현
- 노드 클릭 시 기존 편집 UI로 전환

**구현 컴포넌트:**
- `NodeNetworkView.vue`: Force-Directed Graph 뷰
- `NodeWorkflowView.vue`: Hierarchical Layout 뷰
- 노드 데이터 어댑터: NEXA NODE 데이터 → D3 그래프 포맷

**D3 타입 선택 기준:**
- **Force-Directed Graph**: 복잡한 네트워크 관계, 자유로운 레이아웃
- **Hierarchical Layout**: 순차적 워크플로우, 명확한 계층 구조

**우선순위**: ⭐⭐⭐⭐⭐ (매우 높음, 노드 기반 에디터 특성상 자연스러움)

---

### 3. NEXA TEACH: 업무 프로세스 녹화 → 편집 → 재사용

#### 적용 타입
- **Hierarchical Layout** (프로세스 플로우)
- **Sankey Diagram** (데이터 흐름)
- **Tree Layout** (액션 시퀀스 계층)

#### 구현 방안

**기존 구조 유지:**
- 액션 녹화 및 재생 시스템은 그대로 유지

**D3 추가 기능:**
```
[NEXA TEACH]
  ├── 기존 액션 시퀀스 편집 UI (유지)
  └── D3 프로세스 뷰 (새로 추가)
      ├── Hierarchical Layout: 프로세스 플로우차트
      ├── Sankey Diagram: 데이터/변수 흐름
      └── Tree Layout: 액션 시퀀스 계층 구조
```

**구체적 기능:**
- 녹화된 액션 시퀀스를 Hierarchical Layout으로 시각화
- 변수 흐름을 Sankey Diagram으로 표현
- 조건부 실행, 반복 구조를 Tree Layout으로 계층화
- 프로세스 노드 클릭 시 해당 액션 편집 UI로 이동
- 프로세스 플로우 드래그로 순서 변경

**구현 컴포넌트:**
- `TeachProcessFlowView.vue`: Hierarchical Layout 뷰
- `TeachDataFlowView.vue`: Sankey Diagram 뷰
- `TeachSequenceTreeView.vue`: Tree Layout 뷰
- 액션 시퀀스 어댑터: 액션 데이터 → D3 그래프 포맷

**D3 타입 선택 기준:**
- **Hierarchical Layout (dagre)**: 순차적 프로세스, 명확한 방향성
- **Sankey Diagram**: 데이터 흐름량 표현, 변수 전달 시각화
- **Tree Layout**: 중첩된 구조, 조건/반복 블록 표현

**우선순위**: ⭐⭐⭐⭐ (높음, 프로세스 시각화에 매우 적합)

---

### 4. NEXA ERP: 업무 관계 렌더링, 문서작성 템플릿

#### 적용 타입
- **Hierarchical Layout** (조직/업무 구조)
- **Force-Directed Graph** (업무 간 관계)

#### 구현 방안

**기존 구조 유지:**
- ERP 문서 관리 및 템플릿 시스템은 그대로 유지

**D3 추가 기능:**
```
[NEXA ERP]
  ├── 기존 문서/템플릿 관리 UI (유지)
  └── D3 관계 뷰 (새로 추가)
      ├── Hierarchical Layout: 조직 구조도
      ├── Hierarchical Layout: 문서 템플릿 구조
      └── Force-Directed Graph: 업무 간 관계 네트워크
```

**구체적 기능:**
- 조직도를 Hierarchical Layout으로 표현
- 문서 템플릿의 계층 구조를 시각화
- 업무 간 의존성/관계를 Force-Directed Graph로 표현
- 노드 클릭 시 해당 문서/업무로 이동
- 관계 필터링 (특정 업무와 관련된 것만 표시)

**구현 컴포넌트:**
- `ErpOrgChartView.vue`: 조직도 Hierarchical Layout
- `ErpTemplateStructureView.vue`: 템플릿 구조 시각화
- `ErpWorkRelationView.vue`: 업무 관계 Force-Directed Graph
- ERP 데이터 어댑터: ERP 데이터 → D3 그래프 포맷

**D3 타입 선택 기준:**
- **Hierarchical Layout**: 명확한 계층 구조 (조직, 템플릿)
- **Force-Directed Graph**: 복잡한 관계망 (업무 간 의존성)

**우선순위**: ⭐⭐⭐⭐ (높음, 업무 관계 시각화에 유용)

---

### 5. 부품관리: 그래픽 기반 조작 및 상태 렌더링

#### 적용 타입
- **Force-Directed Graph** (부품 관계 네트워크)
- **Chart 타입** (통계 대시보드)
- **Hierarchical Layout** (창고 구조 계층)
- **Sankey Diagram** (부품 이동 경로)

#### 구현 방안

**기존 구조 유지:**
- StorageBlockGrid.vue의 그리드 뷰는 그대로 유지
- 물리 공간 관리 기능은 변경 없음

**D3 추가 기능:**
```
[부품관리]
  ├── 기존 물리 공간 그리드 (유지)
  └── D3 시각화 뷰 모드 (새로 추가)
      ├── Force-Directed Graph: 부품 간 관계 네트워크
      ├── Chart 타입: 통계 대시보드 (Bar, Pie, Line)
      ├── Hierarchical Layout: 창고 구조 계층도
      └── Sankey Diagram: 부품 이동 경로
```

**구체적 기능:**

**1) 부품 관계 네트워크 (Force-Directed Graph)**
- 부품 간 호환성, 대체 가능성 관계 시각화
- 부품 클러스터 자동 감지 (유사 부품 그룹)
- 노드 크기로 재고량 표현, 색상으로 상태 표현
- 노드 드래그로 레이아웃 조정

**2) 통계 대시보드 (Chart 타입)**
- Bar Chart: 부품 분류별 재고량 비교
- Pie Chart: 공간 활용률 분포
- Line Chart: 시간대별 입출고 추이
- Scatter Plot: 부품 가격 vs 재고량 관계

**3) 창고 구조 계층도 (Hierarchical Layout)**
- 전체 창고 → 블록 → 층 → 빈 계층 구조 시각화
- 계층 노드 클릭 시 해당 위치로 네비게이션
- 각 레벨의 통계 정보 표시 (재고량, 활용률)

**4) 부품 이동 경로 (Sankey Diagram)**
- 입고 → 창고 → 출고 흐름 시각화
- 이동량을 링크 두께로 표현
- 경로별 통계 정보 (이동 시간, 비용)

**구현 컴포넌트:**
- `PartsRelationNetworkView.vue`: Force-Directed Graph 뷰
- `PartsStatisticsDashboard.vue`: Chart 타입 대시보드
- `PartsWarehouseHierarchyView.vue`: Hierarchical Layout 뷰
- `PartsMovementFlowView.vue`: Sankey Diagram 뷰
- 부품 데이터 어댑터: partsManagementStore → D3 포맷

**뷰 전환 방식:**
```vue
<q-tabs>
  <q-tab label="그리드 뷰" icon="grid_on" />
  <q-tab label="관계 네트워크" icon="account_tree" />
  <q-tab label="통계 대시보드" icon="bar_chart" />
  <q-tab label="창고 구조" icon="account_tree" />
  <q-tab label="이동 경로" icon="swap_horiz" />
</q-tabs>
```

**우선순위**: ⭐⭐⭐⭐ (높음, 다양한 시각화 가능)

---

### 6. NEXA BOARD: 장비 관리 및 제어 패널 레이아웃 후 관계 형성

#### 적용 타입
- **Force-Directed Graph** (장비 네트워크)
- **Hierarchical Layout** (제어 계층)

#### 구현 방안

**기존 구조 유지:**
- 현재 보드 레이아웃 시스템은 그대로 유지

**D3 추가 기능:**
```
[NEXA BOARD]
  ├── 기존 보드 레이아웃 UI (유지)
  └── D3 네트워크 뷰 (새로 추가)
      ├── Force-Directed Graph: 장비 간 연결 네트워크
      └── Hierarchical Layout: 제어 계층 구조
```

**구체적 기능:**
- 장비 간 물리적/논리적 연결을 Force-Directed Graph로 시각화
- 제어 계층 (센서 → 컨트롤러 → 게이트웨이)을 Hierarchical Layout으로 표현
- 장비 상태를 노드 색상으로 표현 (정상/경고/오류)
- 장비 클릭 시 해당 보드로 네비게이션
- 연결 라인 클릭 시 연결 상세 정보 표시
- 네트워크 필터링 (특정 타입/상태만 표시)

**구현 컴포넌트:**
- `BoardDeviceNetworkView.vue`: Force-Directed Graph 뷰
- `BoardControlHierarchyView.vue`: Hierarchical Layout 뷰
- 장비 데이터 어댑터: NEXA BOARD 데이터 → D3 그래프 포맷

**D3 타입 선택 기준:**
- **Force-Directed Graph**: 복잡한 장비 연결망, 자유로운 레이아웃
- **Hierarchical Layout**: 명확한 제어 계층, 순차적 흐름

**우선순위**: ⭐⭐⭐⭐⭐ (매우 높음, 네트워크 시각화에 매우 적합)

---

## 🎯 구현 방향 및 로드맵

### Phase 1: 기반 구축 (현재 완료)
- ✅ D3 다이어그램 설정 시스템 가이드 작성
- ✅ 타입별 D3 API 이해 및 분류
- ✅ NexaDiagram.vue 범용 컴포넌트 구현
- ✅ 기본 다이어그램 타입 구현 (Force-Directed, Hierarchical, Chart)

### Phase 2: 우선순위 높은 기능 (단기)
1. **실시간 IOT 센서 데이터** (Chart 타입)
   - 구현 난이도: 중
   - 예상 소요 시간: 2-3주
   - 의존성: WebSocket 연동, 실시간 데이터 스트리밍

2. **NEXA NODE 네트워크 뷰** (Force-Directed Graph)
   - 구현 난이도: 중-높음
   - 예상 소요 시간: 3-4주
   - 의존성: NEXA NODE 데이터 구조 정의

### Phase 3: 중간 우선순위 기능 (중기)
3. **NEXA BOARD 장비 네트워크** (Force-Directed Graph, Hierarchical)
   - 구현 난이도: 중
   - 예상 소요 시간: 2-3주

4. **부품관리 통계 대시보드** (Chart 타입)
   - 구현 난이도: 낮음-중
   - 예상 소요 시간: 1-2주

### Phase 4: 추가 기능 (장기)
5. **NEXA TEACH 프로세스 뷰** (Hierarchical, Sankey)
   - 구현 난이도: 높음
   - 예상 소요 시간: 4-5주
   - 의존성: NEXA TEACH 시스템 구현 완료 필요

6. **NEXA ERP 관계 뷰** (Hierarchical, Force-Directed)
   - 구현 난이도: 중-높음
   - 예상 소요 시간: 3-4주

7. **부품관리 추가 뷰** (관계 네트워크, 계층도, 이동 경로)
   - 구현 난이도: 중-높음
   - 예상 소요 시간: 각 2-3주씩

---

## 📐 구현 패턴 및 베스트 프랙티스

### 1. 컴포넌트 구조 패턴

```vue
<!-- [Feature]NetworkView.vue -->
<template>
  <div class="network-view-container">
    <!-- 뷰 전환 탭 (필요 시) -->
    <q-tabs v-model="viewMode">
      <q-tab label="기존 뷰" name="default" />
      <q-tab label="네트워크 뷰" name="network" />
    </q-tabs>

    <!-- 기존 뷰 (유지) -->
    <div v-if="viewMode === 'default'">
      <ExistingView />
    </div>

    <!-- D3 뷰 (새로 추가) -->
    <div v-else-if="viewMode === 'network'" class="d3-view-container">
      <NexaDiagram 
        type="network" 
        :data="diagramData" 
        :options="diagramOptions"
        @node-click="handleNodeClick"
        @node-hover="handleNodeHover"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NexaDiagram from 'src/diagram/NexaDiagram.vue'
import { adaptDataToDiagramFormat } from './adapters/dataAdapter'

const props = defineProps({
  // 기존 데이터 props
})

// 데이터 어댑터: 기존 데이터 → D3 포맷
const diagramData = computed(() => {
  return adaptDataToDiagramFormat(props.data)
})

// 다이어그램 옵션
const diagramOptions = computed(() => ({
  // D3 다이어그램 설정
}))

// 이벤트 핸들러
function handleNodeClick(nodeId, nodeData) {
  // 기존 UI로 네비게이션 또는 상세 정보 표시
}

function handleNodeHover(nodeId, nodeData) {
  // 호버 피드백
}
</script>
```

### 2. 데이터 어댑터 패턴

```javascript
// adapters/dataAdapter.js
/**
 * 기존 데이터를 D3 다이어그램 포맷으로 변환
 */
export function adaptDataToDiagramFormat(sourceData) {
  const nodes = sourceData.items.map(item => ({
    id: item.id,
    name: item.name,
    // D3 노드 속성 추가
    radius: calculateNodeRadius(item),
    color: getNodeColor(item.status),
    // ...
  }))

  const links = sourceData.relationships.map(rel => ({
    source: rel.sourceId,
    target: rel.targetId,
    // D3 링크 속성 추가
    strength: rel.weight || 0.5,
    // ...
  }))

  return { nodes, links }
}
```

### 3. 설정 통합 패턴

```javascript
// 다이어그램 설정을 기존 설정 시스템과 통합
import { loadDiagramSettings } from 'src/diagram/config/diagramSettings'
import { diagramTypes } from 'src/diagram/config/diagramMetadata'

const diagramOptions = computed(() => {
  const baseSettings = loadDiagramSettings(diagramTypes.NETWORK)
  
  return {
    ...baseSettings,
    // 기능별 커스텀 설정
    nodeSize: {
      ...baseSettings.nodeSize,
      // 기능별 특화 설정
    },
  }
})
```

### 4. 기존 기능과의 통합

```javascript
// 기존 store/API와 연동
import { usePartsManagementStore } from 'src/stores/partsManagementStore'

const partsStore = usePartsManagementStore()

// D3 뷰에서 선택한 노드 → 기존 store 상태 업데이트
function handleNodeClick(nodeId, nodeData) {
  // 기존 store 메서드 활용
  partsStore.setSelectedStorageBlock(nodeData.blockId)
  
  // 기존 뷰로 전환 (선택적)
  // viewMode.value = 'default'
}
```

---

## 🎨 사용자 경험 고려사항

### 1. 뷰 전환 UX
- **명확한 전환 버튼/탭**: 사용자가 뷰를 쉽게 전환할 수 있도록
- **상태 유지**: 뷰 전환 시 선택 상태, 필터 등 유지
- **로딩 피드백**: 대용량 데이터 처리 시 로딩 표시

### 2. 인터랙션 일관성
- **호버 피드백**: 노드/링크 호버 시 시각적 피드백
- **클릭 액션**: 노드 클릭 시 기존 UI로 자연스러운 이동
- **드래그 제스처**: Force-Directed Graph에서 노드 드래그 가능

### 3. 성능 최적화
- **데이터 필터링**: 대용량 데이터 시 필요한 부분만 렌더링
- **가상화**: 화면에 보이는 부분만 렌더링 (필요 시)
- **애니메이션 최적화**: 불필요한 애니메이션 제거 또는 최적화

---

## 📝 결론 및 다음 단계

### 핵심 전략 요약

1. **기존 기능 유지**: 현재 잘 작동하는 구조는 변경하지 않음
2. **보완적 활용**: D3는 새로운 뷰 모드나 추가 기능으로 활용
3. **점진적 확장**: 우선순위에 따라 단계적으로 구현
4. **타입별 최적 선택**: 각 기능 영역의 특성에 맞는 D3 타입 선택

### 즉시 시작 가능한 항목

1. **부품관리 통계 대시보드** (Chart 타입)
   - 구현 난이도가 낮고, 즉시 활용 가능
   - 기존 데이터 구조를 그대로 활용 가능

2. **실시간 IOT 센서 데이터** (Chart 타입)
   - 실용성이 높고, 사용자 요구가 많을 것으로 예상
   - WebSocket 연동만 추가하면 구현 가능

### 장기 비전

모든 NEXA 시스템의 주요 기능 영역에 D3 기반 시각화가 통합되어, 사용자가 데이터와 관계를 직관적으로 이해하고 조작할 수 있는 통합 플랫폼으로 발전.

---

**작성일**: 2024년 12월  
**작성자**: AI Assistant  
**버전**: 1.0  
**다음 검토 예정**: 각 Phase별 구현 완료 후
