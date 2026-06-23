# 🏗️ NEXA 시스템 구현 로드맵 v1.1

---

## 개요

이 문서는 NEXA OS 플랫폼의 구현 단계를 **MainShell → Prototype → MVP** 순서로 정의하며, 각 단계의 완료 기준, 필수 문서, 그리고 NEXA OS 특화 아키텍처 요구사항을 포함합니다.

> **문서 버전:** v1.1 — 초기 설계(v1.0) + 아키텍처 보강 통합본  
> **적용 범위:** NEXIA 전 탭 (Omnix, Normex, Logex, Scribx, Vivex, Twinex, Navex) + Ontex 도메인

---

## 1. MainShell: 플랫폼 골격 구축 (Foundation)

단순히 폴더와 파일을 만든다고 **MainShell**이 되는 것은 아닙니다. 이는 시스템의 모든 도메인이 준수해야 할 **'인터페이스 계약'**이 완료된 상태를 의미합니다.

### 1.1 시각적 레이아웃 규격 (Physical Geometry)

- **4+1 영역 정의:** `Header, Left Drawer, Right Drawer, Main, StatusBar` 5개 핵심 영역의 물리적 위치와 점유 규칙을 확정합니다.
- **반응형 컨테이너:** 다양한 스크린 환경에서도 셸의 골격이 무너지지 않도록 하는 최소/최대 임계값(Breakpoint)을 설정합니다.

### 1.2 인터페이스 슬롯 시스템 (Plug-in Architecture)

- **컴포넌트 주입(Injection):** MainShell이 정의한 각 영역에 외부 도메인 컴포넌트를 안전하게 끼워 넣을 수 있는 '슬롯' 구조를 구현합니다.
- **포털(Portal) 매커니즘:** 레이아웃의 깊은 곳에 있더라도 셸의 특정 영역(예: StatusBar)으로 정보를 보낼 수 있는 통로를 확보합니다.
- **슬롯 계약 규격 (보강):** 각 슬롯이 수용 가능한 컴포넌트 인터페이스 타입을 명시적으로 정의합니다.
    - `DomainSlotProps` Zod 스키마로 슬롯 입력 타입을 검증합니다.
    - **슬롯 충돌 해소 규칙:** 두 도메인이 동시에 동일 슬롯(예: StatusBar)을 요청할 경우, `domainLayoutRegistry`의 우선순위 순서에 따라 선점 도메인이 결정됩니다.
    - **포털 방향성:** 포털은 기본적으로 **단방향(도메인 → 셸)**입니다. 셸이 도메인으로 역방향 신호를 보낼 경우 반드시 `useLayoutStore`의 이벤트 채널을 통해서만 허용됩니다.

### 1.3 도메인 거버넌스 및 레지스트리 (Domain Governance)

- **`domainLayoutRegistry`:** 현재 활성화된 도메인에 따라 레이아웃 구성을 동적으로 변경하는 중앙 통제실을 구축합니다.
- **라우팅 연계:** URL이나 시스템 상태에 따라 어떤 도메인이 MainShell의 주도권을 가질지 결정하는 우선순위 로직을 포함합니다.

| NEXIA 7 Facet | 슬롯 점유 허용 영역        | 우선순위 |
| ------------- | ------------------ | ---- |
| Omnix         | Header, StatusBar  | 1    |
| Normex        | Left Drawer, Main  | 2    |
| Logex         | Main, Right Drawer | 2    |
| Twinex        | StatusBar, Footer  | 3    |
| Navex         | Left Drawer        | 3    |
| Scribx, Vivex | Main               | 4    |

> 위 표는 초기 기준값이며, `domainLayoutRegistry` 명세서에서 최종 확정합니다.

> 개념 정립
- 문서/설계  →  "NEXIA는 7개의 Facet으로 구성된다"
- UI 설명    →  "사용자는 7개의 탭으로 접근한다"
- 내부 영역  →  "Omnix는 여러 Panel을 포함한다"
### 1.4 전역 상태 단일 진실 공급원 (Global SSOT)

- **Layout Store:** 드로어의 개폐 상태, 테마, 현재 활성 탭 등 셸 전체의 시각적 상태를 관리하는 단일 저장소(`useLayoutStore`)를 운영합니다.
- **이벤트 버스:** NEXNAP 규격을 준수하여 셸과 도메인 간의 비동기 신호를 주고받는 통신 기반을 마련합니다.

### 1.5 Yjs(CRDT) 레이어 통합 (보강)

NEXA OS는 Yjs를 전 탭의 실시간 동기화 기반으로 채택합니다. MainShell 단계에서 상태 관리 책임 경계를 명확히 확정해야 합니다.

|관리 주체|관리 대상 상태|
|---|---|
|`useLayoutStore` (Zustand)|드로어 개폐, 테마, 활성 탭, UI 전환 상태|
|Yjs Y.Doc|Normex 편집 콘텐츠, Logex 플로우 그래프, 협업 커서|
|NEXNAP Envelope|도메인 간 비동기 이벤트, 명령 신호|

- **Yjs 바인딩 타이밍:** Normex(Tiptap), Logex(React Flow)는 MainShell이 해당 탭을 활성화하는 시점에 Yjs Provider와 연결됩니다. 비활성 탭은 Y.Doc을 보유하되 Provider 연결은 지연합니다.

### 1.6 MainShell 완료 정의 (Definition of Done)

- [ ] 5개 영역(Header, Footer, Left/Right Drawer, StatusBar) 물리적 배치 확정 및 Storybook 스냅샷 통과
- [ ] 슬롯 7개(NEXIA 탭 수) 전부 독립 컴포넌트 주입 성공
- [ ] `domainLayoutRegistry` 단일 진실 공급원 동작 확인 (도메인 추가 시 셸 코드 수정 불필요)
- [ ] `useLayoutStore`와 Yjs Y.Doc 관리 경계 문서화 완료
- [ ] 슬롯 충돌 시나리오 2건 이상 재현 및 우선순위 로직 검증

> **수석 아키텍트의 비평:** 이 네 가지 레이어가 결합되어야 비로소 **MainShell**은 단순한 '틀'에서 벗어나 **'도메인 수용소'**로서의 자격을 갖추게 됩니다. 특히 **슬롯 시스템**과 **레지스트리**가 핵심입니다. 이 설계가 부실하면 도메인이 늘어날 때마다 셸의 코드를 수정해야 하는 '아키텍처 부채'가 발생하게 됩니다. 슬롯 계약이 Zod 스키마로 명시되지 않으면, 도메인 개발자가 잘못된 타입의 컴포넌트를 주입해도 런타임 이전에 감지할 수 없습니다.

---

## 2. Prototype (v0): 가설 검증 (Validation)

**v0**는 기술적 불확실성을 제거하고 MainShell의 수용 능력을 테스트하는 'Steel Thread' 단계입니다.

> **v0 전략: Steel Thread (강철 실선)** 모든 기능을 얕게 만드는 것이 아니라, **외부 앱 → 브라우저 확장 → MainShell**로 이어지는 단 하나의 데이터 경로를 끊김 없이 관통시키는 데 집중합니다.

### 2.1 핵심 워크플로우 증명

- "외부 정보 포착 → MainShell 수신 → AI 가공(Mock) → 화면 출력"의 연속성 확보.

### 2.2 통신 인터페이스 검증

- UI는 최소화하되, **NEXNAP** 규격을 준수하여 **Envelope** 패킷이 경계를 넘어 도달하는지 확인합니다.

### 2.3 NEXNAP Envelope 패킷 규격 (보강)

NEXNAP의 통신 단위인 Envelope는 Prototype 단계에서 최소 필드가 확정되어야 합니다.

```typescript
// Envelope 최소 필드 정의 (Zod 스키마 기준)
const EnvelopeSchema = z.object({
  id:          z.string().uuid(),          // 추적 ID (로그 레지스트리 연결 키)
  source:      z.string(),                 // 발신 도메인 (예: "omnix", "twinex")
  target:      z.string().optional(),      // 수신 도메인 (미지정 시 broadcast)
  type:        z.enum(["command", "event", "query", "response"]),
  payload:     z.unknown(),                // 도메인별 정의
  timestamp:   z.number(),                 // Unix ms
  traceId:     z.string().uuid().optional() // 다단계 체인 추적용
});
```

- **Relay Server 라우팅 분기 로직:**
    - `target` 필드가 명시된 경우 → 해당 도메인 슬롯으로 직접 전달
    - `target`이 없는 경우 → 전체 구독자(broadcast) 전달
    - `type === "command"`인 경우 → 수신 확인(ACK) 응답 Envelope를 역방향으로 발행

### 2.4 데이터 공급 (Mock/Relay)

- 복잡한 DB 대신, 외부 신호를 프론트엔드로 전달하는 최소한의 **Relay Server**만 운영합니다.
- **인메모리 로그 레지스트리 (보강):** Relay Server에 통신 로그를 반드시 포함합니다.

|항목|규격|
|---|---|
|저장 구조|`Map<traceId, EnvelopeLog[]>`|
|TTL|세션당 최대 30분 또는 서버 재시작 시 초기화|
|최대 용량|인메모리 1,000건 (초과 시 FIFO 삭제)|
|조회 인터페이스|`GET /debug/logs?traceId=xxx`|

- **검증 기준:** UI 없이 `curl`만으로 Envelope 왕복이 로그에 기록되는지 확인합니다.

### 2.5 Prototype 완료 정의 (Definition of Done)

- [ ] Envelope 왕복 추적 로그 재현 가능 (`/debug/logs` 엔드포인트에서 확인)
- [ ] UI 없이 `curl`로 NEXNAP 통신 성립 확인
- [ ] `source → Relay → target` 3-hop 경로에서 패킷 손실 0건
- [ ] Envelope 스키마 Zod 검증 통과 (잘못된 패킷 수신 시 에러 로그 기록)
- [ ] `domainLayoutRegistry`가 Mock 데이터로 도메인 전환을 처리하는 것 확인

> **수석 아키텍트의 비평:** 현재 프로토타입 설계에서 가장 위험한 점은 '데이터 휘발성'입니다. `No DB` 원칙은 좋으나, NEXNAP을 통한 통신 로그가 남지 않으면 디버깅이 불가능합니다. 인메모리 로그 레지스트리를 Relay Server에 포함시켜 데이터 흐름을 추적 가능하게 만드십시오. Envelope 규격이 이 단계에서 Zod로 고정되지 않으면 MVP에서 스키마 불일치로 인한 재작업이 발생합니다.

---

## 3. MVP (UI-L0): 가치 실현 (Realization)

사용자가 최소한의 실제 업무를 끝까지 완결할 수 있는 **'최소 가치 창출'** 단계입니다. 이 단계의 핵심은 기능 수가 아니라 **실사용 흐름의 완결성**입니다.

### 3.1 범위 및 기능 기준

- **범위:** 핵심 도메인 1개 이상이 실제 백엔드와 연결되고, 입력 → 처리 → 결과 확인까지, **CRUD(생성, 조회, 수정, 삭제)**와 하나의 업무 흐름이 끊기지 않아야 합니다.
- **기능 기준:** 더미 화면이나 목업이 아니라, 로그인·조회·편집·저장·반영 중 필요한 최소 기능이 실제 데이터와 동작합니다.

### 3.2 데이터 계약

- 도메인별 요청/응답 스키마(Envelope 포함), 상태 전이 규칙, 에러 규격이 MainShell과 Relay Server 간에 동일하게 정의되어야 합니다.

### 3.3 LangGraph 오케스트레이션 전환 기준 (보강)

MVP의 '실제 백엔드'는 LangGraph를 포함합니다. Mock AI에서 실제 LangGraph로의 전환 시점을 명확히 정의합니다.

**전환 트리거 조건 (다음 항목 모두 충족 시):**

1. Prototype DoD 전 항목 통과
2. 핵심 도메인 1개의 CRUD 흐름이 Mock 데이터로 완전 동작 확인
3. LangGraph 그래프 카탈로그에 해당 도메인 그래프 1건 이상 등록
4. Ontex(pgvector) 연결 없이 인메모리 벡터 검색으로 대체 가능한 상태

**MVP 허용 LangGraph 복잡도 상한선:**

|항목|상한|
|---|---|
|그래프 노드 수|10개 이하|
|병렬 엣지|허용하되 Fan-out 2단계 이하|
|외부 Tool 호출|도메인당 3종 이하|
|스트리밍 응답|SSE 1채널 (도메인당)|

**Ontex 범위 구분:**

- **MVP 범위:** pgvector 단순 유사도 검색, JSON-LD 기본 컨텍스트 적용
- **Post-MVP:** Graph RAG, RDF 트리플 스토어, 하이브리드 온톨로지 추론

### 3.4 UX 기준

- 사용자가 "이 제품이 무엇을 해주는지"를 즉시 이해할 수 있어야 하며, 화면 전환과 상태 피드백이 일관되어야 합니다.

### 3.5 운영 기준

- 에러 처리, 빈 상태(Empty State), 로딩 상태, 권한 경계 같은 기본 운영 시나리오가 정의되어 있어야 합니다.

### 3.6 검증 기준

- Navex 이중 탐색 모드 지능형 탐색 핵심 시나리오 재현.

### 3.7 도메인별 권한 경계 (보강)

Navex 이중 탐색 모드 검증과 연계하여 MVP 단계에서 권한 경계를 확정합니다.

|역할|접근 가능 도메인|불가 도메인|
|---|---|---|
|Admin|전체|—|
|Editor|Omnix, Normex, Logex, Scribx, Vivex|Twinex(쓰기), Navex(관리)|
|Viewer|Omnix(읽기), Vivex|나머지|
|IoT Operator|Twinex|Scribx, Logex|

> 위 표는 MVP 최소 기준이며, 도메인별 권한 경계 명세서에서 세분화합니다.

### 3.8 MVP 완료 정의 (Definition of Done)

- [ ] 비개발자 시연 5분 이내 완료 (사전 설명 없이 핵심 흐름 완주)
- [ ] 실데이터 CRUD 전 사이클 무에러 (에러 발생 시 사용자에게 의미 있는 메시지 표시)
- [ ] LangGraph 그래프 1건 이상 실제 실행 확인 (Mock 아님)
- [ ] 빈 상태 / 로딩 상태 / 에러 상태 화면 전부 구현
- [ ] 권한 경계 시나리오 3건 이상 QA 통과
- [ ] Navex 이중 탐색 모드 핵심 시나리오 재현 성공

> **수석 아키텍트의 비평:** 이 세 단계는 **'골조(MainShell) → 가설(Prototype) → 입주(MVP)'**로 이어지는 건축 과정과 같습니다. UI-L0은 "보여줄 수 있는 화면"이 아니라 **업무가 실제로 돌아가는 최소 제품**을 뜻합니다. LangGraph 전환 기준이 없으면 MVP라는 이름의 Mock 시연으로 전락할 위험이 있습니다.

---

## 4. 단계별 표준 문서 최소 리스트

범용적인 앱 개발 프로젝트에서 논리적 파편화를 방지하고 아키텍처의 일관성을 유지하기 위해 필요한 단계별 표준 문서 최소 리스트입니다. 모든 도메인이 이 규격을 준수할 때 시스템은 비로소 예측 가능한 확장이 가능해집니다.

### Foundation: 구조적 설계 단계 (Architecture & Contract)

단순한 아이디어를 공학적인 '설계도'로 변환하는 단계입니다. 이 문서들이 없으면 코드는 모래 위에 성을 쌓는 것과 같습니다.

|문서|내용|NEXA 특화 여부|
|---|---|---|
|제품 요구사항 정의서 (PRD)|"왜(Why)" 존재하는지와 해결하려는 페인 포인트|—|
|시스템 아키텍처 설계서|전체 컴포넌트 구조, 데이터 흐름도, 외부 접점 시각화|—|
|모노레포 구조 및 워크스페이스 명세서|앱, 패키지, 공유 라이브러리 배치와 의존성 방향|—|
|API 및 인터페이스 명세서|모듈 간 데이터 교환 규약(Protocol)|—|
|**`domainLayoutRegistry` 명세서**|도메인-슬롯 매핑 테이블, 충돌 해소 규칙, 슬롯 계약 Zod 스키마|✅ NEXA 특화|
|**NEXNAP 통신 프로토콜 명세서**|Envelope 필드 정의, 라우팅 규칙, ACK 정책|✅ NEXA 특화|

> **아키텍트의 관점** 이 단계에서 가장 중요한 문서는 **인터페이스 명세서**입니다. NEXA OS에서는 여기에 더해 `domainLayoutRegistry`와 `NEXNAP 프로토콜 명세`가 동등한 위상을 가집니다. 이 세 문서가 없으면 도메인 개발자가 각자 다른 규약으로 셸과 통신하게 되어 전체 시스템이 붕괴됩니다. 모노레포에서 **파일 구조**는 단순한 폴더 정리가 아니라 **의존성 그래프의 시각화**입니다.

### Prototype: 핵심 가치 검증 단계 (Steel Thread & Logic)

가장 얇지만 단단한 '강철 실선'을 구축하여 가설을 증명하는 단계입니다.

|문서|내용|NEXA 특화 여부|
|---|---|---|
|사용자 흐름도 (User Flow)|사용자 진입부터 목적 달성까지의 논리적 경로|—|
|핵심 데이터 모델링 (ERD)|데이터 구조와 관계 정의|—|
|핵심 시나리오 검증 계획서|프로토타입 성공 판단 기준|—|
|**Yjs 상태 분리 설계서**|CRDT 관리 범위, Zustand vs Yjs 경계 정의, 탭별 바인딩 타이밍|✅ NEXA 특화|

> **논리적 비평** 많은 개발자가 이 단계에서 문서화를 생략하고 코드부터 작성합니다. NEXA OS에서는 추가로 **Yjs 상태 분리 설계서**가 선행되지 않으면 MVP 단계에서 Zustand와 Yjs 간의 상태 이중화로 인한 '동기화 버그'가 발생합니다. 데이터 모델링과 함께 이 문서가 반드시 먼저 작성되어야 합니다.

### MVP: 기능 실현 및 운영 단계 (Functional & Reliable)

사용자에게 비즈니스 가치를 전달하고, 지속 가능한 운영이 가능한 상태를 만드는 단계입니다.

|문서|내용|NEXA 특화 여부|
|---|---|---|
|기능 상세 명세서 (Functional Spec)|예외 처리, 에러 케이스, 빈 상태 포함 전체 기능 동작|—|
|테스트 케이스 및 품질 검토서 (QA)|기능 결함 없는 동작 확인 체크리스트|—|
|배포 및 운영 가이드|환경 변수, 배포 절차, 장애 복구 전략|—|
|**LangGraph 그래프 카탈로그**|실제 배포된 그래프 목록, 진입 조건, 허용 복잡도|✅ NEXA 특화|
|**도메인별 권한 경계 명세**|역할-도메인 접근 매트릭스, Navex 탐색 모드 연계 규칙|✅ NEXA 특화|

> **운영의 핵심** MVP는 '대충 만든 제품'이 아니라 **'핵심 기능이 완벽하게 동작하는 제품'**입니다. 특히 **기능 상세 명세서**에서 에러 처리 로직이 누락되어 있다면, 그것은 제품이 아니라 '버그 제조기'에 불과합니다. LangGraph 그래프 카탈로그 없이 배포하면 운영 중 어떤 그래프가 어떤 도메인 요청을 처리하는지 추적할 수 없게 됩니다.

---

## 5. 단계별 완료 정의 요약 (DoD Checklist)

### MainShell DoD

- [ ] 슬롯 7개 전부 독립 컴포넌트 주입 성공
- [ ] `domainLayoutRegistry` 단일 진실 공급원 확인 (셸 코드 수정 없이 도메인 추가 가능)
- [ ] `DomainSlotProps` Zod 스키마 검증 통과
- [ ] 슬롯 충돌 시나리오 2건 이상 우선순위 로직 검증
- [ ] `useLayoutStore` vs Yjs Y.Doc 관리 경계 문서화 완료
- [ ] Storybook 스냅샷 전 영역 통과

### Prototype DoD

- [ ] Envelope 왕복 추적 로그 재현 가능 (`/debug/logs` 확인)
- [ ] UI 없이 `curl`로 NEXNAP 통신 성립 확인
- [ ] `source → Relay → target` 3-hop 패킷 손실 0건
- [ ] Envelope Zod 스키마 검증 (잘못된 패킷 수신 시 에러 로그 기록)
- [ ] `domainLayoutRegistry`가 Mock 데이터로 도메인 전환 처리 확인

### MVP DoD

- [ ] 비개발자 시연 5분 이내 완료
- [ ] 실데이터 CRUD 전 사이클 무에러
- [ ] LangGraph 그래프 1건 이상 실제 실행 확인 (Mock 아님)
- [ ] 빈 상태 / 로딩 상태 / 에러 상태 전부 구현
- [ ] 권한 경계 시나리오 3건 이상 QA 통과
- [ ] Navex 이중 탐색 모드 핵심 시나리오 재현 성공

---

## 부록: 보강 내용 출처 요약

|보강 항목|적용 단계|보강 이유|
|---|---|---|
|슬롯 계약 규격 (Zod, 충돌 해소)|MainShell|7개 이상 도메인 확장 시 슬롯 충돌 리스크 예방|
|포털 방향성 명시|MainShell|단방향/양방향 미정의 시 도메인이 셸 상태를 무단 변경 가능|
|Yjs vs Zustand 경계 정의|MainShell, Prototype|상태 이중화 버그 및 MVP 전환 시 CRDT 통합 비용 최소화|
|NEXNAP Envelope 최소 필드 정의|Prototype|디버깅 가능성 확보 및 스키마 불일치 조기 감지|
|인메모리 로그 레지스트리 규격|Prototype|통신 로그 부재 시 디버깅 불가능 리스크 해소|
|LangGraph 전환 트리거 조건|MVP|Mock 시연으로 전락하는 MVP 방지|
|LangGraph 복잡도 상한선|MVP|운영 안정성 및 예측 가능한 성능 보장|
|Ontex MVP/Post-MVP 구분|MVP|범위 명확화로 인한 집중력 확보|
|도메인별 권한 경계 매트릭스|MVP|Navex 이중 탐색 모드 검증 연계 및 보안 경계 확정|
|단계별 DoD 체크리스트|전 단계|완료 기준의 서술적 모호함 제거|