# NEXA 마스터 설계 문서 v0.4

> **플랫폼 철학 (Principle Statement)**
> "사람을 단순함에서 해방시켜, 더 넓은 의식과 더 온화한 삶으로 이어주는 겸허한 공간"

---

## 변경 이력

| 버전 | 주요 변경 내용 |
|------|-------------|
| v0.3 | 5코일 · Layer 0~2 구조 · Empathy 철학 레이어 확정 |
| **v0.4** | **6코일 확정 (Compliance 추가) · Why 토큰 매핑 · 가중치 수식 · NIXIE 캔버스 · ERA 승격 · Capability ID · Low-Entropy 모드** |

---

## 목차

1. [NEXA 철학 레이어](#1-nexa-철학-레이어)
2. [HEXAGON Protocol](#2-hexagon-protocol)
3. [Sentinel / Indicator 구조](#3-sentinel--indicator-구조)
4. [UCL 5단계 프로토콜](#4-ucl-5단계-프로토콜)
5. [코일 시스템](#5-코일-시스템)
6. [충돌 해소 매트릭스](#6-충돌-해소-매트릭스)
7. [Empathy 설계](#7-empathy-설계)
8. [VOID 전환 수치화](#8-void-전환-수치화)
9. [NEXA-NIXIE 캔버스](#9-nexa-nixie-캔버스)
10. [Capability ID 체계](#10-capability-id-체계)
11. [PostgreSQL 스키마](#11-postgresql-스키마)
12. [구현 로드맵](#12-구현-로드맵)
13. [미완성 항목](#13-미완성-항목)

---

## 1. NEXA 철학 레이어

> 이 레이어는 코드가 아니라 **판단의 전제**다.
> 모든 코일·알고리즘·실행은 이 원칙을 위반할 수 없다.

### 1.1 5대 원칙

| 원칙 | 정의 | 적용 |
|------|------|------|
| **Liberation** | 단순·반복은 AI가, 판단·창조는 사람이 | 자동화 가능한 것은 확인 없이 처리 |
| **Humanity** | 사람이 소외되는 방향으로 작동하지 않는다 | Empathy 원칙과 직결 — 코일 계산 이전에 작동 |
| **Domain Fluidity** | 농업·산업·일상·예술의 경계를 구분하지 않는다 | 어댑터를 도메인 중립적으로 설계 |
| **Expansion** | 의식이 더 넓어지도록 새로운 연결을 제시한다 | 답변 후 확장 관점 제안 |
| **Humility** | 화려함보다 본질, 복잡함보다 단순함 | 불필요한 출력 제거, 핵심만 전달 |

### 1.2 Empathy — 철학 레이어에 내재된 원칙

Empathy는 코일이 아닌 **모든 코일 판단의 전제 조건**이다.
조정 가능한 가중치가 아니라 위반 시 코일 계산 자체를 멈추는 가드레일이다.

**존재 원칙 3가지 (수치화 불가 · 위반 시 즉시 차단)**

| 원칙 | 위반 감지 조건 | 발동 결과 |
|------|------------|---------|
| 비수단화 | 사람의 감정·취약성을 효율 달성 수단으로 활용 | 코일 계산 차단 + 재설계 |
| 비소외 | 판단 결과가 사람을 배제하거나 무시하는 방향 | 실행 중단 + 사람 개입 요청 |
| 비대체 | AI가 사람의 창의·판단·감정을 대신하려는 시도 | 제안으로 전환, 결정권 사람에게 |

---

## 2. HEXAGON Protocol

> AI 운영체제의 헌법. 모든 데이터 패킷의 헤더에 배치되어
> 소형 AI가 복잡한 추론 없이 **1ms 내에** 데이터의 본질과 우선순위를 판단하게 하는 지능적 인덱스.

### 2.1 6대 추상 레이어

| 레이어 | 주요 토큰 | 의미 |
|--------|---------|------|
| **Where** (Scope) | CORE · FIELD · DOMAIN | 영향 범위와 권위 |
| **When** (Tempo) | MOMENT · DURATION · ERA | 시간적 흐름과 맥락 |
| **Who** (Pulse) | WILL · ECHO · TICK · ASK + MUST · SHOULD · MAY | 동력원과 강제성 |
| **What** (Intent) | FACT · LINK · RULE | 데이터의 본질적 성질 |
| **How** (State) | FLOW · STUCK · VOID | 에너지 및 변화 상태 |
| **Why** (Causality) | CAUSE · LOGIC · TARGET | 인과관계와 추론 근거 |

### 2.2 처리 순서

```
[Where] → [When] → [Who] → [What] → [How]
공간 → 시간 → 주체 → 의도 → 상태
```

- Where·When 먼저 → 90% 불필요 데이터 즉시 필터링
- Who 권한 확인 전 What 분석 금지 (보안 원칙)

### 2.3 토큰 시너지 예시

```
WILL + MUST + MOMENT  → 사용자 즉각 강제 명령 (최우선 처리)
ECHO + MAY + DURATION → AI 장기 제안 (사용자 검토 대기)
TICK + RULE + ERA     → 시대적 절대 원칙 자동 고수
```

### 2.4 VOID 다중 상태 — 지능적 맥락 격리

VOID는 단순 삭제가 아닌 지능적 맥락 관리를 위한 다중 상태(Multi-state)
데이터 생애주기 구조다. 컨텍스트 윈도우에서 제외하되 논리적 상태로 격리하여
시스템 최적화와 환각 방지를 동시에 달성한다.

```
VOID·POTENTIAL  — 잠재 상태 (컨텍스트 제외 · 재활성 가능)
VOID·ARCHIVE    — 아카이브 (읽기 전용 보존 · TimescaleDB 압축)
VOID·PURGE      — 완전 소멸 (복구 불가 · 관리자 승인 필수)
```

**ERA 승격 경로 (v0.4 신규)**

```
VOID·ARCHIVE → ERA 격상 조건:
  - 시스템 생존과 직결된 핵심 패턴으로 판정
  - 관리자 + 사용자 이중 승인
  - ERA 격상 후 PURGE 대상에서 영구 제외
  → 데이터가 충분히 쌓이면 삭제되는 것이 아니라 헌법이 된다
```

### 2.5 권한 레이어

```
Level 0 — 시스템 절대 규칙 (수정 불가)
Level 1 — 플랫폼 운영자 규칙 (관리자만 수정)
Level 2 — 사용자 정의 규칙 (사용자 편집 가능)
Level 3 — AI 학습 제안 규칙 (사용자 승인 후 적용)

충돌 시 우선순위: Level 0 > 1 > 2 > 3
```

### 2.6 ASK → GOVERN → ERA 생애주기 (v0.4 신규)

```
ASK    → 학습 중 (불확실·위험·권한 문제로 승인 대기)
GOVERN → 운영 중 (규칙이 정식 운영 단계로 승격)
ERA    → 헌법   (시스템 생존과 직결된 절대 원칙 · 수정 불가)
```

---

## 3. Sentinel / Indicator 구조

> 말단은 민감하게 반응하고, 중앙은 현명하게 결정한다.

### 3.1 역할 분리

| 구분 | 위치 | 역할 | 담당 토큰 |
|------|------|------|---------|
| **Sentinel** | 엣지 디바이스 | 관찰과 포착 — 원재료 정제 | FIELD · MOMENT · FACT · TICK |
| **Indicator** | 플랫폼·중앙 | 분석과 조율 — 의미 부여 | CORE·DOMAIN · DURATION·ERA · WILL·ECHO·ASK · LINK·RULE · FLOW·STUCK·VOID |

### 3.2 핵심 전략

- **Why는 Indicator 독점**: 고도의 추론과 지식 증류가 필요 — 일관성 유지
- **데이터 다이어트**: Sentinel은 FACT 위주로만 전송 — 전송 효율 최대화
- **Edge-Why 예외**: 물리적 위험 직전 감지 시 Sentinel이 인디케이터 대기 없이 즉시 반사 신경 작동

### 3.3 지능적 부하 분리

```
핵심 추상화 (5W1H)  → Indicator가 즉시 읽는 담백한 팩트 문장
정황 데이터 (Extra) → 별도 분리 저장, 정밀 검증 필요 시에만 호출
```

---

## 4. UCL 5단계 프로토콜

### 4.1 전체 흐름

```
[입력]
  │
  ▼
[0단계: 철학 원칙 검사] ← Empathy 가드레일
  │ 위반 시 → 즉시 차단
  ▼
[1단계: Listen]
  5W1H JSONB 변환
  │ 변환 실패 → 재요청
  ▼
[2단계: Context Awareness]
  상태 + 선 룰 대조 · 충돌 감지
  │ Level 0 위반 → 즉시 차단
  ▼
[3단계: Decision Making]
  확신도 × 위험도 × 긴박도
  Decision Matrix 적용
  │
  ├─ 즉시 실행 ──────────────────┐
  ├─ 확인 요청 → 사용자 승인 → ─┤
  ├─ 조언·거절 → 종료            │
  └─ 긴박 모드 → ───────────────┤
                                 ▼
                       [4단계: Adapter Execution]
                       논리 명령 → 네이티브 API
                                 │
                                 ▼
                       [5단계: Feedback Loop]
                       즉각 · 단기 · 장기 피드백
```

### 4.2 1단계 — Listen: 5W1H JSONB 표준

```jsonb
{
  "who":        "사용자 ID 또는 요청 주체",
  "what":       "실행 요청 행위 (동사 + 목적어)",
  "when":       "시간 조건 또는 즉시",
  "where":      "대상 공간 또는 시스템",
  "why":        "추론된 의도 (생략 가능)",
  "how":        "방식 또는 파라미터",
  "raw":        "원본 입력 보존",
  "input_type": "text | voice | video",
  "confidence": "0.0 ~ 1.0"
}
```

### 4.3 3단계 — Decision Matrix

| 확신도 | 위험도 | 룰 충돌 | 긴박도 | 실행 모드 | 철학 원칙 |
|-------|-------|--------|-------|---------|---------|
| High | Low | 없음 | Any | ✅ 즉시 실행 | Liberation |
| High | Low | 있음 | Low | 🔔 충돌 보고 후 대기 | Humanity |
| High | Mid | 없음 | Low | 👤 사용자 확인 요청 | Humanity |
| Low | Any | Any | Low | 👤 사용자 확인 요청 | Humanity |
| Any | High | Any | Low | ❌ 조언·거절 | Humanity |
| Any | Any | Level 0 위반 | Any | 🚫 즉시 차단 + 로그 | Humility |
| Any | Any | Any | High | 🚨 긴박 모드 (룰 일부 우회) | Liberation |

### 4.4 4단계 — 어댑터 도메인

| 도메인 | 어댑터 예시 | 철학 연결 |
|--------|-----------|---------|
| 일상·IoT | 조명·온도·보안·가전 | Liberation |
| 업무 | 문서·이메일·캘린더·결제 | Liberation |
| 농업 | 센서·드론·관개 시스템 | Domain Fluidity |
| 산업 | 설비·모니터링·물류 | Domain Fluidity |
| 예술·창작 | 이미지·음악·영상 생성 | Expansion |
| 지식 | RAG 검색·문서 분석 | Expansion |

### 4.5 5단계 — 피드백 3계층

| 계층 | 범위 | 내용 |
|------|------|------|
| 즉각 피드백 | 이번 실행 | 성공·실패·부분 성공 보고 |
| 단기 학습 | 이 사용자 패턴 | 3회 이상 반복 패턴 → Level 3 룰 제안 |
| 장기 진화 | 플랫폼 전체 | 새 어댑터 필요성 감지 · 확장 방향 제시 |

> 모든 학습은 사용자 승인 후 적용 (Humanity 원칙)

---

## 5. 코일 시스템

### 5.1 설계 원칙

```
안전은 딱딱하게 (Deterministic)
지능은 유연하게 (Flexible)

코일의 수는 설계의 목적이 아니라 결과다.
필요한 것을 정의하면 숫자는 자연히 따라온다.
```

### 5.2 Source Layer — 핵심 코일 (6개 · 항상 존재)

> v0.4 변경: 5코일 → 6코일 (Compliance 추가, LIMIT 대체)

| # | 코일 | 성격 | 레이어 | 핵심 정의 |
|---|------|------|-------|---------|
| 1 | **Safety** | 생존 | 시스템 고정 | 물리적 위험·생명 보호 최우선 |
| 2 | **Stability** | 기술 | 시스템 고정 | 일관성·예측 가능성 보장 |
| 3 | **Compliance** | 윤리 | 시스템 고정 | 법적·윤리적·시스템 규범 엄격 준수 |
| 4 | **Efficiency** | 자원 | 시스템 고정 | 최소 자원·최단 경로 지향 |
| 5 | **Autonomy** | 의지 | 사용자 조정 | 자율 판단 권한의 폭 (태스크 등급 0~4) |
| 6 | **Creative** | 확장 | 사용자 조정 | 실험·창의적 시도 허용 |
| — | **Balance** | 지표 | 출력 지표 | 6코일 균형 상태 출력값 |

> **Compliance 채택 이유:**
> LIMIT은 '제약·차단'의 느낌이 강하나 코일은 가치 필터.
> Compliance는 법·윤리·규범을 가치로서 준수한다는 의미로 철학에 더 부합.

> **Harmony 제거 유지:**
> 6코일 간 균형 자체가 Harmony이므로 Balance 출력 지표로 대체.
> 오케스트레이터 역할과 중복 방지.

### 5.3 Autonomy 태스크 등급표

| 등급 | 이름 | Autonomy 허용 | 행동 방식 | 예시 |
|------|------|-------------|---------|------|
| 0 | 완전 자율 | 100% | AI가 바로 실행 | 음악·조명·볼륨 |
| 1 | 사후 보고 | 80% | 실행 후 알림 | 온도 조정·알림 미루기 |
| 2 | 사전 제안 | 50% | 제안 후 승인 대기 | 일정 변경·이메일 초안 |
| 3 | 명시적 확인 | 20% | 구체적으로 물어봄 | 결제·파일 삭제 |
| 4 | 접근 금지 | 0% | AI 접근 자체 차단 | 보안 설정·계약 |

### 5.4 Domain Layer — 도메인 코일 (4개 · 도메인 진입 시 자동 활성)

| 코일 | 적용 도메인 | 발동 조건 | Source Layer 조정 효과 |
|------|-----------|---------|----------------------|
| **Precision** | 산업·제조·농업·의료 | 물리적 장치 직접 제어 | Autonomy 최대 등급 → 2 하향 · Efficiency 양보 |
| **Privacy** | 데이터·개인정보·학습 | 개인 식별 데이터 접근 | Autonomy 최대 등급 → 1 하향 · Creative 데이터 접근 차단 |
| **Sustainability** | 농업·환경·에너지 | 자원 소비·환경 영향 발생 | Efficiency 단기 최적화 제한 · Creative 친환경 방향 유도 |
| **Resonance** | 예술·음악·감각·우주 | 감각적 경험 생성 | Efficiency 양보 · Stability 의도적 불규칙성 허용 |

### 5.5 Project Layer — 프로젝트 코일 (선택적 추가 · 무제한)

도메인 코일의 방향을 강화하거나 완화할 수 있음.
역전 및 Safety 우회는 불가. 사용자가 자유롭게 생성·삭제 가능.

예시: Collaboration · Transparency · Resilience · Curiosity · 사용자 정의

### 5.6 레이어 기반 가중치 합산 수식 (v0.4 신규)

```
W_final = W_source + f(W_domain) + f(W_project)

W_source  : Source Layer 코일 기본값 (시스템 고정)
f(W_domain): Domain Layer 오버레이 (도메인 진입 시 자동 적용)
f(W_project): Project Layer 사용자 조정값 (자유 설정)

제약 조건:
  Safety·Stability·Compliance (하드 도메인) ≥ 90% 강제 유지
  사용자가 이 하한선 이하로 낮출 수 없음
```

### 5.7 코일 → Why 토큰 정규 매핑 (v0.4 신규)

코일 가중치 조합이 HEXAGON Why 토큰을 자동 생성한다.

| 우세 코일 그룹 | Why 토큰 | 인과 해석 | GOVERN 방향 |
|-------------|---------|---------|-----------|
| Safety · Stability · Compliance | **LOGIC (타당성)** | 시스템 규범과 안전 가드레일 최우선 | GOVERN — 통제 |
| Efficiency | **TARGET (최종목표)** | 자원 최소화·최단 경로 해결 목표 | RESOLVE — 해결 |
| Creative · Autonomy | **CAUSE (근원인)** | 사용자 영감·창의적 시도를 행위 원인으로 규정 | OBSERVE — 관찰 |

### 5.8 Autonomy Threshold — 실행 게이트 (v0.4 신규)

```
사용자가 UI 슬라이더로 직접 조정: 기본 95점 ± 15% 범위

confidence_score >= user_defined_threshold → 자율 실행 (FLOW)
confidence_score <  user_defined_threshold → 승인 대기 (STUCK + ASK)

시각 피드백:
  임계값 미만 → NIXIE 캔버스 Jitter (빛이 미세하게 떨림)
```

### 5.9 코일 확장 원칙

```
기존 방식 (폐기): 6 → 12 → 24 배수 구조
확정 방식:        Source 6개 고정 + Domain·Project 필요에 따라 가변

숫자가 구조를 결정하는 것이 아니라
필요가 숫자를 결정한다.
```

---

## 6. 충돌 해소 매트릭스

### 6.1 전체 충돌 해소 순서

```
0단계 — Empathy 원칙 검사 (철학 레이어)
  비수단화·비소외·비대체 위반 여부
  → 위반 시: 코일 계산 전 즉시 차단

1단계 — Safety 검사 (Source Layer)
  Level 0 위반 여부
  → 위반 시: 즉시 차단 + 로그 + 운영자 알림

2단계 — 긴박도 확인
  응급·위험 상황 여부
  → 긴박 시: 긴박 모드 (Level 1~2 룰 우회 허용)

3단계 — 도메인 코일 확인 (Domain Layer)
  진입한 도메인 코일이 Source Layer 조정 적용

4단계 — 프로젝트 코일 확인 (Project Layer)
  Domain Layer 범위 내에서 강화·완화 적용

5단계 — 우선순위 적용
  Safety → Stability → Compliance → Efficiency → Autonomy → Creative

6단계 — MUST vs MUST 동급 충돌
  기계가 결정 불가 → 반드시 사람에게 위임 (Humanity 원칙)
```

### 6.2 코일 간 관계

**긴장 관계 (한쪽이 올라가면 다른 쪽이 내려감)**

| 쌍 | 이유 |
|----|------|
| Safety ↔ Autonomy | 안전할수록 자율성 제한 |
| Stability ↔ Creative | 안정적일수록 창의적 위험 기피 |
| Compliance ↔ Creative | 규범 준수가 강할수록 실험 제한 |
| Efficiency ↔ Autonomy | 빠를수록 자율 판단 과정 축소 |

**협력 관계 (함께 올라가는 쌍)**

| 쌍 | 이유 |
|----|------|
| Safety + Stability + Compliance | 안전·안정·준수는 함께 강화 |
| Autonomy + Efficiency | 자율적일수록 빠른 판단 |
| Creative + Resonance | 창의성과 감각적 공명은 강화 |

### 6.3 토큰 충돌 해소 (HEXAGON 연계)

**유형 1 — 권위 충돌 (CORE·WILL vs DOMAIN·RULE)**

| WILL 강도 | RULE 레벨 | 긴박도 | 결과 |
|---------|---------|------|------|
| MUST | Level 0 | Any | 🚫 차단 |
| MUST | Level 1 | HIGH | 🚨 긴박 모드 우회 |
| MUST | Level 1 | LOW | ⬆️ 에스컬레이션 |
| MUST | Level 2 | Any | 👤 WILL 우선 + 룰 수정 제안 |
| SHOULD | Level 1 | Any | 🔔 경고 후 사용자 선택 |

**유형 2 — 승격 충돌 (FACT → RULE 승격 조건)**

```
FACT → DURATION: 동일 패턴 3회 + 72시간 이내 + Confidence 0.8 이상
DURATION → Level 3 RULE 제안: 7일 이상 + 일관성 85% + 기존 RULE 충돌 없음
Level 3 → Level 2: 사용자 승인 + 30일 검증 + 위반 없음
```

**유형 3 — 소멸 충돌 (VOID 전환 조건)**
→ 8장 참조

---

## 7. Empathy 설계

### 7.1 층위 A — 감지 신호 (수치화 가능)

| 신호 | 범위 | 설명 |
|------|------|------|
| **Human Presence** | 0 / 1 | 사람 관여 여부 — 0이면 Empathy 비활성 |
| **Emotional State (ES)** | -1.0 ~ +1.0 | 감정 상태 추정 |
| **Vulnerability Index (VI)** | 0.0 ~ 1.0 | 취약성 지수 |
| **Pace Preference (PP)** | fast·normal·slow | ES·VI 연동 자동 결정 |

**ES 임계값 → 코일 조정**

```
ES -0.5 이하 → Efficiency 하향, 응답 속도 천천히
ES -0.8 이하 → Autonomy 등급 하향, 사람 확인 요청 증가
ES -1.0      → VI 1.0 강제 전환
```

**VI 임계값 → 모드 전환**

```
VI 0.6 이상 → Creative 일시 정지, 간결 응답
VI 0.9 이상 → 모든 자율 실행 중단
VI 1.0      → 철학 레이어 Empathy 즉시 발동
```

### 7.2 Low-Entropy 모드 (v0.4 신규)

```
발동 조건: VI 낮음 (피로·에너지 저하 감지)

작동 방식:
  복잡한 자원 합성 제안 중단
  로컬·안정 자원만 사용
  응답 단순화 — 핵심만 전달
  Creative·Autonomy 자동 하향

목적: 사용자가 지쳐있을 때 시스템도 함께 조용해진다
```

### 7.3 층위 B — 존재 원칙 (수치화 불가 · 가드레일)

→ 1.2절 참조

### 7.4 입력 소스 3가지

**센서 → ES 실시간 갱신**

```
음성 톤 낮아짐 + 속도 느려짐  → ES -0.3 하향
심박 상승 + 체온 변화          → VI +0.2 상향
조명 어두워짐 + 소음 증가       → PP → slow 자동 전환
```

**피드백 → 즉각 보정**

```
제안 거절 1회     → ES -0.1, 패턴 기록
제안 거절 3회 연속 → Autonomy 등급 자동 하향
"불편해" 발화      → VI +0.3 즉시 상향
"고마워" 발화      → ES +0.2, 패턴 강화
```

**패턴 → 사전 예측 (TimescaleDB)**

```
매일 오후 3시 ES 하락 패턴 → 오후 3시 이후 선제적 Efficiency 하향
월요일 아침 VI 높은 패턴   → 월요일 아침 Autonomy 선제적 하향
```

### 7.5 학습 루프 핵심 원칙

> **패턴은 예측의 도구이지 판단의 근거가 아니다.**
> 아무리 패턴이 쌓여도 사람의 명시적 피드백이 패턴을 이긴다.
>
> **학습의 목적이 사람을 예측하고 조종하는 것이 되는 순간
> 그것은 Empathy가 아니라 Manipulation이다.**

---

## 8. VOID 전환 수치화

### 8.1 데이터 유형별 전환 기준

| 전환 | 센서·IoT | 대화·태스크 | 규칙·지식 | 철학·원칙 |
|------|---------|-----------|---------|---------|
| FLOW → STUCK | 30초 | 1시간 | 30일 | 불가 |
| STUCK → POTENTIAL | 5분 | 24시간 | 90일 | 불가 |
| POTENTIAL → ARCHIVE | 24시간 | 90일 | 180일 | 불가 |
| ARCHIVE → PURGE | 30일 | 365일 | 730일 | 불가 |
| POTENTIAL → FLOW | 신호 재개 즉시 | 사용자 재접속 | 참조 발생 즉시 | — |
| ARCHIVE → ERA | — | — | 관리자+사용자 이중 승인 | 영구 보존 |

### 8.2 VOID 유형별 처리

```
VOID·POTENTIAL  → TimescaleDB 압축 대상 표시, 재활성 가능
VOID·ARCHIVE    → TimescaleDB 압축 적용, 읽기 전용
VOID·PURGE      → 물리 삭제, LINK 없음 + 관리자 승인 필수
ERA 격상        → PURGE 대상 영구 제외, 시스템 헌법으로 고정
```

### 8.3 Safety VOID (v0.4 신규)

```
발동 조건: 위험·Level 0 위반 감지
처리 방식: 즉시 무효화 → VOID 상태 강제 전환
목적: 위험한 실행 사슬을 즉각 격리
```

---

## 9. NEXA-NIXIE 캔버스 (v0.4 신규)

> HEXAGON × 6-COILS 기반 지능형 서사 시각화 캔버스.
> 데이터와 상태를 숫자가 아닌 빛·떨림·공간으로 표현한다.

### 9.1 핵심 시각 언어

| 요소 | 정의 | 코일·상태 연결 |
|------|------|-------------|
| **Lumina** | 신뢰도·상태에 따라 변하는 빛의 생명력 | confidence_score → 발광 강도 |
| **Jitter** | 불확실·긴장·오류 상황의 미세 떨림 | confidence < threshold → 떨림 |
| **Fractal Sync** | Capability ID 계층에서 폭발·함몰 전이 | Zoom In/Out → 폭발·응축 |

### 9.2 LOD (Level of Detail) — 하드웨어 프로필

| 모드 | 조건 | 연출 |
|------|------|------|
| **COLD** | 저사양·배터리 절약 | 최소 애니메이션 · 가독성 우선 |
| **WARM** | 일반 환경 | 하이브리드 연출 |
| **HOT** | 고사양·풀 퍼포먼스 | 풀 시뮬레이션 · 잔상 최대 |

### 9.3 에러 → 넥슈 표정 매핑

| 에러 코드 | 넥슈 상태 | 캔버스 연출 |
|---------|---------|----------|
| ADAPTER_TIMEOUT | 고개 갸우뚱 | 해당 도트 Jitter |
| ADAPTER_NOT_FOUND | 고개 갸우뚱 + 흐릿함 | Dim 처리 |
| ADAPTER_AUTH_DENIED | 경고 + 잠금 | 붉은 테두리 |
| ADAPTER_PARTIAL_SUCCESS | 고민 + ASK 유도 | 성공/실패 도트 구분 |
| ADAPTER_FATAL | Shocked + 차단 | 전체 경고 톤 |

### 9.4 Ambient Interface 원칙

```
카드는 작업 화면 가장자리에 작고 반투명하게 존재
막힘 감지 시 (타이핑 멈춤 30초 등) 살짝 선명해짐
클릭하면 코일 재조정 + 역방향 분해 시작
클릭 강요 없음 — 무시해도 아무 일 없음
절대 팝업·모달·알림음 없음
```

---

## 10. Capability ID 체계 (v0.4 신규)

> `nexa.*` 네임스페이스 기반 기능 자격 식별자.
> 플랫폼 전역의 권한·연결·감사 단위.

### 10.1 핵심 구조

```
nexa.{domain}.{feature}.{action}

예시:
  nexa.iot.lighting.control    → IoT 조명 제어 권한
  nexa.data.user.read          → 사용자 데이터 읽기 권한
  nexa.art.canvas.render       → 예술 캔버스 렌더링 권한
```

### 10.2 Capability 생애주기

```
registry 등록 → tier 할당 → 사용자 grant → 실행 검증 → 감사 기록
                              ↓
                    AI 제안 (capability_proposals)
                    Fit Score 기반 적합도 평가
```

### 10.3 시스템·사용자 분리 원칙

```
시스템 Capability: 코드 레지스트리 동기화 (source: registry)
사용자 Capability: 관리자 승인 (source: override)
확장 Capability:   자동 스캔 (source: extension)
```

---

## 11. PostgreSQL 스키마

### 11.1 확장 설치

```sql
CREATE EXTENSION IF NOT EXISTS vector;       -- pgvector
CREATE EXTENSION IF NOT EXISTS timescaledb;  -- TimescaleDB
```

### 11.2 핵심 테이블 목록

| 테이블 | 엔진 | 역할 |
|--------|------|------|
| users | PostgreSQL | 사용자 계정·권한 |
| orchestrators | PostgreSQL | 오케스트레이터 정의·전체 UCL |
| agents | PostgreSQL | 에이전트 정의·페르소나·모델 |
| orchestrator_agents | PostgreSQL | 오케스트레이터 ↔ 에이전트 N:M 매핑 |
| skills | PostgreSQL | 스킬 명세·도구 정의 |
| agent_skills | PostgreSQL | 에이전트 ↔ 스킬 N:M 매핑 |
| documents | PostgreSQL | 원본 문서·지식베이스 |
| document_index | PostgreSQL + pgvector | 요약·키워드·벡터 색인 (Smart RAG) |
| tasks | PostgreSQL | 태스크 정의·상태·AI 초안 |
| conversations | TimescaleDB | 대화 이력 시계열 압축 |
| token_conflicts | PostgreSQL | 충돌 이력·해소 기록 |
| empathy_signals | TimescaleDB | Empathy 실시간 신호 |
| balance_coil_definitions | PostgreSQL | 코일 항목 정의 (system/user 구분) |
| balance_coil_templates | PostgreSQL | 도메인별·사용자별 가중치 프리셋 |
| capability_definitions | PostgreSQL | Capability ID 메타데이터 |
| capability_grant_history | PostgreSQL | 발급·폐기 이력 감사 |
| project_settings | PostgreSQL | 현재 적용 template_id · threshold |
| ucl_configs | PostgreSQL | UCL 고정 설정 (Level 0) |

### 11.3 주요 DDL

```sql
-- 코일 정의 (v0.4 신규)
CREATE TABLE balance_coil_definitions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  layer       VARCHAR(20)  NOT NULL, -- source / domain / project
  origin      VARCHAR(20)  NOT NULL, -- system / user
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 코일 템플릿 (v0.4 신규)
CREATE TABLE balance_coil_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  domain       VARCHAR(100),
  weights      JSONB NOT NULL,  -- { coil_id: weight_value }
  is_system    BOOLEAN DEFAULT false,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 프로젝트 설정 (v0.4 신규)
CREATE TABLE project_settings (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id             UUID NOT NULL,
  current_template_id    UUID REFERENCES balance_coil_templates(id),
  user_defined_threshold INT DEFAULT 95,  -- Autonomy Threshold
  settings_data          JSONB DEFAULT '{}',
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 오케스트레이터
CREATE TABLE orchestrators (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  name          VARCHAR(100) NOT NULL,
  goal_prompt   TEXT,
  routing_rules JSONB,
  max_agents    INT DEFAULT 5,
  token_budget  INT DEFAULT 8000,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 에이전트
CREATE TABLE agents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  name          VARCHAR(100) NOT NULL,
  persona       TEXT,
  system_prompt TEXT,
  model_name    VARCHAR(100) DEFAULT 'llama3.1',
  temperature   FLOAT DEFAULT 0.7,
  max_tokens    INT DEFAULT 2000,
  specialty     VARCHAR(100),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 매핑 테이블 (Junction Table)
CREATE TABLE orchestrator_agents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orchestrator_id UUID REFERENCES orchestrators(id),
  agent_id        UUID REFERENCES agents(id),
  priority        INT DEFAULT 0,
  role_in_orch    VARCHAR(100),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (orchestrator_id, agent_id)
);

-- Smart RAG 핵심
CREATE TABLE document_index (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id           UUID REFERENCES documents(id),
  summary          TEXT,
  keywords         TEXT[],
  embedding        vector(768),
  importance_score FLOAT DEFAULT 0.5,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON document_index
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 대화 이력 (TimescaleDB)
CREATE TABLE conversations (
  time            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  id              UUID DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  orchestrator_id UUID REFERENCES orchestrators(id),
  agent_id        UUID REFERENCES agents(id),
  question        TEXT NOT NULL,
  answer          TEXT,
  tokens_used     INT,
  confidence_score FLOAT,
  why_chain       JSONB,
  void_state      VARCHAR(20) DEFAULT 'FLOW'
    CHECK (void_state IN ('FLOW','STUCK','POTENTIAL','ARCHIVE','PURGE')),
  void_at         TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}'
);
SELECT create_hypertable('conversations', 'time');
SELECT add_compression_policy('conversations', INTERVAL '90 days');

-- Empathy 신호 (TimescaleDB)
CREATE TABLE empathy_signals (
  time                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id             UUID REFERENCES users(id),
  session_id          UUID,
  voice_tone          FLOAT,
  voice_speed         FLOAT,
  env_noise           FLOAT,
  human_presence      SMALLINT,
  emotional_state     FLOAT,
  vulnerability_index FLOAT,
  pace_preference     VARCHAR(10),
  low_entropy_mode    BOOLEAN DEFAULT false,
  feedback_type       VARCHAR(20),
  feedback_value      FLOAT
);
SELECT create_hypertable('empathy_signals', 'time');

-- 패턴 분석 뷰
CREATE MATERIALIZED VIEW empathy_pattern AS
SELECT
  user_id,
  EXTRACT(DOW  FROM time) AS day_of_week,
  EXTRACT(HOUR FROM time) AS hour_of_day,
  AVG(emotional_state)     AS avg_es,
  AVG(vulnerability_index) AS avg_vi,
  MODE() WITHIN GROUP (ORDER BY pace_preference) AS typical_pace
FROM empathy_signals
GROUP BY user_id, day_of_week, hour_of_day;

-- 충돌 이력
CREATE TABLE token_conflicts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_type     VARCHAR(20),
  token_will        JSONB,
  token_rule        JSONB,
  resolution        VARCHAR(20),
  resolution_reason TEXT,
  user_decision     VARCHAR(20),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 보안
ALTER TABLE orchestrators          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE empathy_signals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_coil_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_settings       ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation ON orchestrators
  USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_isolation ON agents
  USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_isolation ON conversations
  USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_isolation ON empathy_signals
  USING (user_id = current_setting('app.current_user_id')::UUID);
```

---

## 12. 구현 로드맵

| 단계 | 목표 | 주요 작업 |
|------|------|---------|
| 1단계 | 기반 인프라 | PostgreSQL + pgvector + TimescaleDB · 스키마 생성 · Ollama 연동 |
| 2단계 | UCL 고정 레이어 | 철학 레이어 · Level 0 규칙 · 오케스트레이터 UCL |
| 3단계 | Smart RAG | document_index · pgvector 검색 · 원본 JOIN |
| 4단계 | 코일 시스템 | 6코일 가중치 엔진 · 도메인 코일 발동 · Compliance 검사 |
| 5단계 | Empathy 엔진 | 센서 입력 · 신호 계산 · Low-Entropy 모드 · 패턴 학습 |
| 6단계 | NIXIE 캔버스 | Lumina · Jitter · Ambient Interface · 카드 UI |
| 7단계 | 사용자 편집 개방 | Vue 페르소나·스킬·태스크·코일 편집 UI |
| 8단계 | 고도화 | 도메인 동시 진입 처리 · Capability ID · ERA 승격 |

---

## 13. 미완성 항목

| 항목 | 우선순위 | 비고 |
|------|---------|------|
| 도메인 동시 진입 처리 | 🔴 높음 | 농업 + 예술처럼 두 도메인 겹칠 때 |
| Compliance 코일 충돌 케이스 | 🔴 높음 | Compliance vs Creative 구체적 시나리오 |
| Capability ID 전체 네임스페이스 | 🟡 중간 | nexa.* 전체 트리 설계 |
| Layer 1 도메인 코일 추가 여부 | 🟡 중간 | IoT 별도 코일 필요 여부 |
| 코일 간 가중치 수치 확정 | 🟡 중간 | W_domain이 W_source를 얼마나 제한하는가 |
| NIXIE 캔버스 Vue 컴포넌트 | 🟡 중간 | Lumina·Jitter 실제 구현 |
| ERA 전환 구체적 조건 | 🟢 낮음 | 어떤 데이터가 ERA가 되는가 |
| 기존 문서 v0.4 반영 업데이트 | 🟢 낮음 | 문서 3 등 기존 문서 동기화 |

---

*NEXA Platform · Master Design Document v0.4 · 내부 설계 문서*
*최종 업데이트: 2026년 3월*
