# NEXA 코일 레지스트리 v0.1

> **목적:** N-MAP system prompt 정규화를 위한 코일 밸런서 전체 후보 목록
> **형식:** `coil_name:0-10` — 숫자값으로 주입, 기본값(5) 동일 시 주입 생략
> **원칙:** 토큰 압박 시 Project → Domain 비핵심 → Domain 핵심 순으로 제거
>          Source Layer 6코일은 절대 제거 불가

---

## N-MAP 주입 형식

```
src:{coil}={val},{coil}={val},...
dom:{coil}={val},{coil}={val},...
prj:{coil}={val},{coil}={val},...
```

**예시 — IoT 노드 편집**
```
src:safety=9,stability=8,compliance=7,efficiency=6,autonomy=3,creative=5
dom:sensitivity=8,precision=9,alertness=7,resilience=6
```

**예시 — 창작 모드**
```
src:safety=7,stability=5,compliance=6,efficiency=4,autonomy=7,creative=9
dom:aesthetics=9,expressivity=8,resonance=7,originality=8
prj:playfulness=7,serendipity=6,warmth=8
```

**토큰 절감 규칙**
```
1. 기본값(5)과 동일한 코일 → 주입 생략
2. Project Layer 전체 → 토큰 압박 시 첫 번째 제거
3. Domain 비핵심 코일 → 두 번째 제거
4. Domain 핵심 코일 → 세 번째 제거
5. Source 6코일 → 절대 제거 불가
```

---

## Layer 0. Source Layer — 시스템 고정 (6개 · 항상 존재)

> 모든 도메인·프로젝트에 항상 주입. 사용자가 제거 불가.
> 하드 도메인에서 safety·stability·compliance 최소값 90% (=9) 강제.

| 코일명 | 성격 | 값 범위 | 낮음(0) | 높음(10) |
|--------|------|--------|--------|--------|
| `safety` | 생존 | 0-10 | 위험 허용 | 위험 차단 절대 우선 |
| `stability` | 기술 | 0-10 | 변화·실험 허용 | 일관성·예측성 유지 |
| `compliance` | 윤리 | 0-10 | 규범 느슨 | 법·윤리·규범 엄격 준수 |
| `efficiency` | 자원 | 0-10 | 여유롭게 | 최소 자원·최단 경로 |
| `autonomy` | 의지 | 0-10 | 사람이 결정 | AI가 자율 판단 |
| `creative` | 확장 | 0-10 | 정해진 틀 안 | 틀 밖 실험·창의 |

---

## Layer 1. Domain Layer — 라우터 진입 시 자동 활성

> 해당 도메인 진입 시 자동 주입. 사용자가 값 조정 가능. 비활성 도메인 코일은 주입 안 함.

### 1-A. 하드·IoT 도메인
`/nexa-node` `/infra` `/network`

| 코일명 | 값 범위 | 낮음(0) | 높음(10) | 주요 라우터 |
|--------|--------|--------|--------|-----------|
| `sensitivity` | 0-10 | 둔감·여유 반응 | 즉각·민감 반응 | node·infra·network |
| `precision` | 0-10 | 오차 허용 | 수치 오차 최소화 | node·infra |
| `alertness` | 0-10 | 느슨한 감시 | 위협 즉각 반사 | infra·network·admin |
| `redundancy` | 0-10 | 단일 경로 | 다중 백업·이중화 | infra·network |
| `latency` | 0-10 | 지연 허용 | 즉각 응답 강제 | node·network |
| `resilience` | 0-10 | 수동 복구 | 자동 복구·자가 치유 | infra·node |
| `isolation` | 0-10 | 공유 허용 | 완전 격리 | infra·admin |
| `verbosity` | 0-10 | 핵심만 기록 | 모든 것 상세 기록 | node·dev |

### 1-B. 보안·감사 도메인
`/nexa-admin` `/dev`

| 코일명 | 값 범위 | 낮음(0) | 높음(10) | 주요 라우터 |
|--------|--------|--------|--------|-----------|
| `traceability` | 0-10 | 결과 요약만 | 전체 족보·이력 추적 | admin·dev·trace |
| `auditability` | 0-10 | 결과만 기록 | 과정 전체 감사 | admin·dev |
| `confidentiality` | 0-10 | 공개 허용 | 완전 기밀 보호 | admin·infra |
| `verification` | 0-10 | 신뢰 후 실행 | 검증 완료 후 실행 | admin·node |

### 1-C. 창작·예술 도메인
`/nexa-ai` `/portfolio` `/nexa-panel`

| 코일명 | 값 범위 | 낮음(0) | 높음(10) | 주요 라우터 |
|--------|--------|--------|--------|-----------|
| `aesthetics` | 0-10 | 기능 우선 | 미학·시각적 완성도 우선 | ai·portfolio·panel·board |
| `expressivity` | 0-10 | 간결·단순 | 풍부·화려한 표현 | ai·portfolio |
| `originality` | 0-10 | 검증된 패턴 | 독창적 새로운 시도 | ai·portfolio |
| `resonance` | 0-10 | 논리적 전달 | 감각적 공명·울림 | ai·panel·board |
| `playfulness` | 0-10 | 진지하게 | 가볍고 실험적 | ai·panel |
| `contrast` | 0-10 | 조화로운 흐름 | 극적 대비·긴장 | portfolio·panel |
| `narrative` | 0-10 | 단편적 정보 | 이야기로 연결 | ai·archive·portfolio |

### 1-D. 지식·문서 도메인
`/nexa-archive` `/nexa-ai (채팅)`

| 코일명 | 값 범위 | 낮음(0) | 높음(10) | 주요 라우터 |
|--------|--------|--------|--------|-----------|
| `sustainability` | 0-10 | 즉시 활용 집중 | 장기 축적·보존 | archive·erp·infra |
| `depth` | 0-10 | 표면적 빠른 답변 | 깊은 분석·탐구 | ai·archive |
| `connectivity` | 0-10 | 독립적 처리 | 모든 것과 연결 | archive·board |
| `accuracy` | 0-10 | 빠른 근사치 | 검증된 사실만 | ai·archive·admin |
| `curiosity` | 0-10 | 주어진 것만 처리 | 확장 탐색·연결 | ai·archive |
| `compression` | 0-10 | 원문 최대 보존 | 핵심만 압축 | archive·ai |

### 1-E. 업무·운영 도메인
`/erp` `/nexa-trace`

| 코일명 | 값 범위 | 낮음(0) | 높음(10) | 주요 라우터 |
|--------|--------|--------|--------|-----------|
| `predictability` | 0-10 | 유연한 변화 허용 | 정해진 루틴 강제 | erp·trace |
| `delegation` | 0-10 | 직접 처리 선호 | AI에게 최대 위임 | erp·ai |
| `accountability` | 0-10 | 공동 책임 | 개인 책임 명확 명시 | erp·admin |
| `priority` | 0-10 | 균등 처리 | 중요도 집중 처리 | erp·board |
| `tempo` | 0-10 | 느긋하게 처리 | 빠른 처리·속도감 | erp·trace |

### 1-F. UX·인터페이스 도메인
`/nexa-board` `/nexa-panel` `/my`

| 코일명 | 값 범위 | 낮음(0) | 높음(10) | 주요 라우터 |
|--------|--------|--------|--------|-----------|
| `empathy` | 0-10 | 기능적·사무적 | 감성적·공감적 | board·ai·erp·help·my |
| `density` | 0-10 | 여백·여유 | 촘촘한 정보 밀집 | board·panel |
| `proactivity` | 0-10 | 수동 대기 | 능동적 먼저 제안 | board·ai·erp |
| `transparency` | 0-10 | 결과만 전달 | 과정·근거 공개 | board·admin·ai |
| `adaptivity` | 0-10 | 고정 UI·패턴 | 맥락별 자동 변형 | board·my |
| `minimalism` | 0-10 | 풍부한 표현 | 극도의 간결함 | my·help |

---

## Layer 2. Project Layer — 사용자 선택 (무제한 확장)

> 사용자가 직접 추가·제거·값 조정. 토큰 압박 시 첫 번째 제거 대상.
> 기본값(5)과 동일하면 주입 생략. 시스템이 후보 목록 제공, 사용자가 선택.

### 2-A. 협업·관계

| 코일명 | 값 범위 | 낮음(0) | 높음(10) |
|--------|--------|--------|--------|
| `collaboration` | 0-10 | 독립 작업 선호 | 적극적 협업 |
| `trust` | 0-10 | 검증 후 신뢰 | 신뢰 우선 |
| `openness` | 0-10 | 비공개·선택 공유 | 완전 공개·투명 |
| `mentoring` | 0-10 | 결과만 전달 | 과정 설명·가르침 |
| `diplomacy` | 0-10 | 직접적 표현 | 부드러운 조율 |

### 2-B. 개인화·학습

| 코일명 | 값 범위 | 낮음(0) | 높음(10) |
|--------|--------|--------|--------|
| `personalization` | 0-10 | 범용 처리 | 개인 패턴 최적화 |
| `memory` | 0-10 | 매번 새로 시작 | 이전 맥락 최대 활용 |
| `growth` | 0-10 | 현재 수준 유지 | 점진적 확장 추구 |
| `pattern` | 0-10 | 패턴 무시 | 패턴 강하게 반영 |
| `feedback` | 0-10 | 피드백 최소 | 적극적 피드백 요청 |

### 2-C. 창의 확장

| 코일명 | 값 범위 | 낮음(0) | 높음(10) |
|--------|--------|--------|--------|
| `experimentation` | 0-10 | 검증된 방법만 | 적극적 실험 시도 |
| `divergence` | 0-10 | 수렴·결론 집중 | 발산·다양성 탐색 |
| `serendipity` | 0-10 | 예측 가능한 흐름 | 우연·발견 허용 |
| `ambiguity` | 0-10 | 명확한 답만 | 모호함 허용·탐색 |
| `metaphor` | 0-10 | 직접적 표현 | 은유·비유 활용 |

### 2-D. 절약·최적화

| 코일명 | 값 범위 | 낮음(0) | 높음(10) |
|--------|--------|--------|--------|
| `frugality` | 0-10 | 자원 풍부하게 | 최소 자원 극한 절약 |
| `focus` | 0-10 | 넓게 다양하게 | 하나에 극도 집중 |
| `simplicity` | 0-10 | 복잡·풍부하게 | 단순·핵심만 |
| `batch` | 0-10 | 즉각 처리 | 모아서 일괄 처리 |

### 2-E. 감성·경험

| 코일명 | 값 범위 | 낮음(0) | 높음(10) |
|--------|--------|--------|--------|
| `warmth` | 0-10 | 차갑고 중립적 | 따뜻하고 친근하게 |
| `humor` | 0-10 | 진지하게 | 유머·위트 포함 |
| `formality` | 0-10 | 격식 없이 편하게 | 격식체·공식적으로 |
| `intimacy` | 0-10 | 거리 유지 | 가깝고 친밀하게 |
| `distance` | 0-10 | 밀착 지원 | 거리 두고 독립 |

### 2-F. 시간·흐름

| 코일명 | 값 범위 | 낮음(0) | 높음(10) |
|--------|--------|--------|--------|
| `urgency` | 0-10 | 여유·천천히 | 긴박·즉각 처리 |
| `patience` | 0-10 | 빠른 결론 | 충분히 기다림 |
| `rhythm` | 0-10 | 불규칙·자유 | 일정한 리듬·박자 |
| `momentum` | 0-10 | 멈춤·재고 허용 | 흐름 유지·가속 |

### 2-G. 사용자 직접 정의

```
custom_01:"{label}"=0-10
custom_02:"{label}"=0-10
custom_03:"{label}"=0-10
...무제한
```

---

## 전체 코일 수 요약

| 레이어 | 그룹 | 코일 수 |
|--------|------|--------|
| Source | — | 6 |
| Domain | 하드·IoT | 8 |
| Domain | 보안·감사 | 4 |
| Domain | 창작·예술 | 7 |
| Domain | 지식·문서 | 6 |
| Domain | 업무·운영 | 5 |
| Domain | UX·인터페이스 | 6 |
| Project | 협업·관계 | 5 |
| Project | 개인화·학습 | 5 |
| Project | 창의 확장 | 5 |
| Project | 절약·최적화 | 4 |
| Project | 감성·경험 | 5 |
| Project | 시간·흐름 | 4 |
| Project | 사용자 정의 | 무제한 |
| **합계** | | **70개 + 무제한** |

---

## 시나리오 검토 시 통합·제거 기준

```
제거 후보:
  - 다른 코일로 이미 커버 가능한 것
  - 슬라이더 낮음↔높음 방향이 직관적이지 않은 것
  - Source Layer 코일과 의미 중복인 것

통합 후보:
  - 방향이 반대인 쌍 (urgency ↔ patience → 하나로 통합)
  - 의미가 90% 겹치는 것 (focus ↔ simplicity)
  - 같은 레이어에서 항상 함께 움직이는 것
```

---

*NEXA Platform · Coil Registry v0.1 · 내부 설계 문서*
*최종 업데이트: 2026년 3월*
*다음 단계: 시나리오 검토 → 통합·제거 → v0.2 확정*
