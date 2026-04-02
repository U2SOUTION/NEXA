# PNL RFC NEXA Market 기초 설계

> NEXA 플랫폼의 자산 유통 마켓 — Panel과 Template을 아우르는 통합 마켓 설계안
> 관련 문서: `PNL RFC NEXA Market Panel 개념 설계.md`
>            `PNL RFC NEXA Market Template 개념 설계.md`

---

## NEXA Market 정의

```
NEXA Market이란?
  NEXA 플랫폼에서 사용되는 자산을 등록, 유통, 관리하는 마켓
  누구나 자산을 선택하고 사용할 수 있으며
  누구나 자산을 제작하고 공유할 수 있는 공유 생태계
  무료를 기본으로 하되 유료도 허용
```

---

## 마켓 자산 체계

NEXA Market은 두 종류의 자산을 다룬다.

```
NEXA Market
  ├── Panel      UI 컴포넌트 자산
  │               화면에 배치되어 렌더링되는 것
  │               사용자가 직접 보고 인터랙션
  │
  └── Template   구조 데이터 자산
                  논리의 틀, 워크플로우 구조
                  화면에 렌더링되지 않음
                  작업 시작 시 선택하여 적용
```

### Panel vs Template 한눈에 비교

| 구분 | Panel | Template |
|------|-------|---------|
| 본질 | UI 컴포넌트 | 구조 데이터 |
| 렌더링 | 화면에 보임 | 화면에 보이지 않음 |
| 사용 시점 | 화면 구성 시 | 작업 시작 시 |
| 편집 도구 | 비주얼 에디터 | 문서 편집기 |
| Capability ID | 필수 | 필수 (원본 + 복사본 각각) |
| 유료/무료 | 가능 | 가능 |

---

## Capability ID 체계

모든 마켓 자산은 Capability ID를 가진다.
ID는 원본(마켓 등록)과 복사본(사용자 설치/복사) 두 층위로 관리된다.

### ID 구조

```
원본 자산 (마켓 등록)
  cap.{asset_type}.{category}.{name}.{version}

복사본 자산 (사용자 설치/복사)
  cap.{asset_type}.{category}.{name}.{version}.usr_{user_id}.{timestamp}
```

### 자산 유형별 예시

```
Panel 원본
  cap.panel.display.sensor-chart.1.0
  cap.panel.control.device-toggle.1.0
  cap.panel.ai.chat-interface.2.0

Template 원본
  cap.template.project.iot-system.1.0
  cap.template.node.device-control.1.0
  cap.template.trace.automation.1.0

복사본 (설치/복사 순간 자동 발급)
  cap.panel.display.sensor-chart.1.0.usr_abc123.20260322
  cap.template.project.iot-system.1.0.usr_abc123.20260322
```

### 두 층위 ID의 역할

```
원본 ID    마켓 접근 권한 기준 (Tier 확인)
           버전 관리 기준
           제작자 소유권 기준

복사본 ID  사용자 실행 권한 기준
           사용량 추적 기준
           원본 업데이트와 무관하게 독립 관리
           사용자가 공유 기여 시 새 원본 ID 발급 (Fork)
```

---

## Tier별 접근 권한

```
Free Tier
  Panel   기본 Display Panel, 기본 Control Panel
  Template  기본 Project Template, Doc Template

Pro Tier
  Panel   Monitor Panel, Media Panel
  Template  Node Template, Trace Template

Enterprise
  Panel   AI Panel, Composite Panel, 커스텀 Panel
  Template  AI 협업 발진 포함 Template, 커스텀 Template
```

---

## 자산 라이프사이클

### 제작자 흐름

```
자산 제작
  → 로컬 테스트
  → NEXA Market 업로드
  → 메타 정보 입력 (유형, 설명, 태그, Tier, 가격)
  → 커뮤니티 검토
  → Public 승격 또는 유료 등록
```

### 사용자 흐름

```
NEXA Market 접속
  → Panel 또는 Template 탭 선택
  → 검색 및 필터링
  → 미리보기 확인
  → 무료 설치 또는 유료 구매
  → 복사본 Capability ID 자동 발급
  → 사용 시작 (Launch)
```

### Fork 흐름

```
사용자가 복사본 커스터마이징
  → 완성도 높아짐
  → 공유 기여 선택
  → 새 원본 ID 발급
  → 커뮤니티 검토
  → Public 승격
```

---

## 공개 범위

```
Public    누구나 열람, 설치, 사용
Shared    특정 그룹만 공유
Private   본인만 사용
```

---

## 유료/무료 정책

```
기본 방향   무료 공개
  커뮤니티 자산으로 자유롭게 공유
  품질 향상을 위한 기여 문화 형성

유료 허용
  제작자가 유료로 등록 가능
  고품질 전문 자산에 대한 보상 구조
  플랫폼 지속 가능성 확보

무료 전환 불가 원칙
  한번 유료로 설정된 자산은 무료로 전환 시
  기존 구매자 환불 정책 필요 (미결 사항)
```

---

## 검색 및 추천

```
태그 기반 검색
  자산 유형, 기술 스택, 적용 Context, 난이도

평가 지표
  사용 횟수, 설치 수, 완료율, 사용자 평점

AI 추천
  사용자가 프로젝트 또는 작업 설명 입력
  → AI가 적합한 Panel + Template 조합 추천
  → Launch 버튼으로 즉시 발진
```

---

## NEXA 플랫폼과의 연결

NEXA Market은 특정 Context에 종속되지 않는다.
플랫폼의 모든 영역에서 Panel과 Template이 사용된다.

### 서비스 영역

```
BRD (NEXA Board)
  Panel   윈도우 프리셋에 배치하는 주 사용처
          디바이스 상태, 제어, 모니터링 Panel

NOD (노드 편집기)
  Panel   노드 로직 결과 시각화 Panel
  Template  Node Template으로 IoT 로직 구조 빠르게 시작

AIS (AI 워크스페이스)
  Panel   AI 채팅, 프롬프트 빌더, 결과 뷰어 Panel
  Template  AI 협업 발진 Template
            AI가 Template 선택 후 초기 문서 초안 자동 생성

ARC (아카이브)
  Panel   콘텐츠 관리, 검색, 뷰어 Panel
  Template  완성된 프로젝트 → Template으로 역추출 → 공유 기여

TRC (트레이스)
  Panel   자동화 로직 시각화, 실행 상태 Panel
  Template  Trace Template으로 자동화 시나리오 구조 제공

PRT (포트폴리오)
  Panel   결과물 전시 Panel, 갤러리, 뷰어
  Template  포트폴리오 구성 Template
```

### 인프라 / 시스템 영역

```
INF (인프라)
  Panel   디바이스 등록, 구성, 상태 모니터링 Panel
  Template  디바이스 등록 절차 Template

NET (네트워크 맵)
  Panel   노드 연결 시각화, 트래픽 현황 Panel

ERP (업무 허브)
  Panel   프로젝트 현황, 일정, 장비 관리 Panel
  Template  프로젝트 관리 Template, 업무 흐름 Template
```

### 관리 / 운영 영역

```
ADM (관리자 센터)
  Panel   회원 관리, 감사 로그 Panel
  Template  운영 절차 Template
  마켓 자산 심사 및 승격 관리
  Capability ID 발급 및 권한 관리
  유료 자산 결제 및 정산 관리

MYP (마이 페이지)
  Panel   개인 대시보드, 멤버십 현황 Panel
  Template  개인 작업 흐름 Template

HLP (도움말)
  Panel   FAQ, 검색, 온보딩 Panel
  Template  온보딩 가이드 Template

DEV (개발자 도구)
  Panel   API 테스트, 로그 뷰어 Panel
  Template  API 연동 Template, 개발 환경 설정 Template
```

### 하드웨어 / 특수 영역

```
NEXU (넥슈 하드웨어)
  Panel   넥슈 오버레이 UI (볼륨 제어, 상태 표시)
  Template  넥슈 하드웨어 설정 Template
            오디오 시나리오 Template

NEXU Canvas (넥슈) · NEXA NIXIE (닉시)
  Panel   NEXU Canvas 전용 시각화 Panel
          생성형 UI 컴포넌트
  Template  NEXA NIXIE 프로젝트 구조 Template
```

### 횡단 관심사

```
AUTH (인증·권한)
  Panel   로그인, 인증 상태 표시 Panel

PRJ (프로젝트 공통)
  Template  프로젝트 격리 구조 Template

N-MAP (N-MAP 엔진)
  Panel   N-MAP 실행 상태, 파이프라인 모니터링 Panel
  Template  N-MAP 로직 구조 Template
```

---

## 자산 등록 규정

### 필수 제출 항목

모든 자산(Panel, Template)은 마켓 등록 시 아래 항목을 반드시 포함해야 한다.

```
기본 정보
  이름          명확하고 검색 가능한 이름
  설명          한 줄 요약 + 상세 설명
  유형          Panel 또는 Template (세부 유형 포함)
  버전          v{major}.{minor} 형식
  제작자        Notion 계정 또는 익명
  태그          최소 2개, 최대 10개
  적용 Context  적용 가능한 Context 목록 (복수 선택)
  Tier          Free / Pro / Enterprise 중 선택
  가격          무료 또는 유료 (유료 시 금액 필수)

사용법 문서
  목적          이 자산이 어떤 문제를 해결하는가
  사용 방법     단계별 사용 가이드
  입력/출력     데이터 연결 방식 (Panel) 또는 적용 결과 (Template)
  주의사항      의존성, 제약 조건, 알려진 이슈

체험 수단       아래 체험 정책 참조 (필수)
라이선스        오픈소스 또는 상업적 사용 여부
```

### 권장 제출 항목

```
스크린샷        최소 1장 이상
변경 이력       버전별 변경 내용
관련 자산       함께 사용하면 좋은 Panel 또는 Template
FAQ             자주 묻는 질문
```

---

## 체험 정책

유료 자산이라도 사용자가 구매 전 충분히 검증할 수 있도록 체험 수단을 제공해야 한다.
제작자는 아래 세 가지 중 하나 이상을 반드시 제공해야 한다.

### 체험 수단 세 가지

**1. 무료 체험판 (Trial)**
```
유효 기간     제작자가 설정 (7일 / 14일 / 30일)
기능 제한     제작자 설정에 따라 전체 또는 일부 기능
재체험        동일 사용자 1회 한정

만료 후 처리 — Soft Gate 전략

  핵심 원칙
    기능을 강제 차단하지 않는다
    사용자가 자연스럽게 구매 필요성을 느끼도록 유도
    제작자 설정에 따라 Hard Gate / Soft Gate 선택 가능

  Panel — Soft Gate (기본 권장)
    기능 계속 작동
    하단 고정 Sticky Banner
      작고 비침해적인 구매 유도 바
      "체험이 종료되었습니다 · 계속 사용하려면 구매하세요" + CTA 버튼
      사용자가 닫을 수 있으나 일정 주기로 재노출
    데이터 연결 유지 여부   미결 (별도 정책 필요)

  Panel — Hard Gate (제작자 선택)
    Paywall Overlay 표시
      반투명 블러 처리 (Content Blur)
      구매 CTA 버튼 오버레이 노출
      기능 차단

  Template — Soft Gate (기본 권장)
    파일 열람 및 편집 계속 가능
    Launch 버튼 위에 작은 만료 안내 배지 (Expiry Badge)
    첫 실행 시 1회 Soft Modal 표시
      "체험이 종료되었습니다"
      구매 / 나중에 선택 제공 (강제 아님)
    파일 접근 가능 여부   미결 (별도 정책 필요)

  Template — Hard Gate (제작자 선택)
    Gating Modal 표시
      Launch 버튼 비활성화 (Disabled State)
      구매 또는 제거 선택 강제

공통
    만료 D-3, D-1 사전 알림 (Expiry Notification)
    만료 후 데이터 삭제 없음 (구매 시 즉시 복원)
    복사본 Capability ID는 Expired 상태로 전환 (구매 시 Active 복원)
    제작자 기본값   Soft Gate 권장 (전환율 우선)
```

**2. 데모 모드 (Demo)**
```
성격          실제 설치 없이 마켓 내에서 미리 체험
Panel 데모    샘플 데이터로 렌더링된 인터랙티브 미리보기
Template 데모 구조 및 체크리스트 전체 열람 가능
제약          실제 NEXA 데이터 연결 불가
              설치 없이 화면에서만 동작
```

**3. 라이트 버전 (Lite)**
```
성격          핵심 기능만 담은 영구 무료 버전
제작자 선택   유료 자산의 경량 버전을 별도 등록
목적          기능 검증 후 유료 업그레이드 유도
```

### 체험 정책 요약

| 수단 | 기간 | 기능 | 데이터 연결 | 필수 여부 |
|------|------|------|------------|---------|
| Trial | 제작자 설정 | 전체 또는 일부 | 가능 | 셋 중 하나 |
| Demo | 무제한 | 샘플 데이터만 | 불가 | 셋 중 하나 |
| Lite | 영구 | 핵심 기능만 | 가능 | 셋 중 하나 |

### 무료 자산의 체험

```
무료 자산은 별도 체험 수단 불필요
설치 즉시 전체 기능 사용 가능
```

---

## 수수료 정책

### 기본 구조

```
무료 자산      수수료 없음
유료 자산      판매액의 일정 % NEXA 플랫폼 수수료 공제 후 제작자 정산
```

### 수수료율 (초안)

| 구분 | 플랫폼 수수료 | 제작자 수익 | 비고 |
|------|-------------|-----------|------|
| 일반 제작자 | 30% | 70% | 기본 |
| 인증 제작자 | 20% | 80% | 일정 판매량 달성 시 |
| 파트너 제작자 | 10% | 90% | 공식 파트너 계약 |

> 수수료율은 미확정, 업계 표준 참고 (Apple App Store 30%, Unity Asset Store 30%, Unreal Marketplace 12%)

### 가격대와 Soft Gate 연계 정책

```
낮은 가격 (예: $1 ~ $5)
  Soft Gate 기본 적용 권장
  강한 차단 없이 자연스러운 전환 유도
  충동 구매가 발생할 정도의 낮은 마찰

중간 가격 (예: $5 ~ $20)
  Soft Gate 또는 Hard Gate 제작자 선택
  Trial 기간 제공 권장

높은 가격 (예: $20 이상)
  Hard Gate 또는 Trial 필수 권장
  구매 전 충분한 검증 기회 보장
```

### 정산 주기

```
월 1회 정산 (기본)
최소 정산 금액 미달 시 다음 달로 이월
환불 발생 시 제작자 수익에서 차감
```

---

## 초기 생태계 전략 (Seed Content)

```
마켓 론칭 초기
  자산이 없으면 사용자 유입이 없음
  플랫폼 운영자가 직접 고품질 자산을 무료로 제공하여
  생태계의 첫 씨앗을 심는 전략 → Seed Content

NEXA의 강점
  실제 NEXA 플랫폼 기획 과정에서 나온 Template
  → 직접 써본 것이라 완성도가 높음
  → 오늘 만든 문서들이 Template 원본이 될 수 있음

  직접 제작한 Panel
  → 넥슈 오디오 제어 UI
  → IoT 디바이스 모니터링
  → AI 워크스페이스 컴포넌트

목표
  론칭 시 최소 20개 이상의 무료 자산 확보
  사용자가 "쓸 게 있네" → "나도 만들어볼까" 선순환 유도
```

---

## 미결 사항

- [ ] Panel 기술 스택 확정 (React 단독 vs Web Component 병행)
- [ ] Template 유형 목록 최종 확정
- [ ] Capability ID 네이밍 컨벤션 확정
- [ ] Tier별 자산 접근 권한 매트릭스 설계
- [ ] 자산 심사 기준 및 검토 프로세스 설계
- [ ] 유료 결제 및 라이선스 정책 설계
- [ ] 무료→유료 전환 및 환불 정책 설계
- [ ] Fork 시 원저작자 표기 및 수익 분배 정책
- [ ] Panel 샌드박스 보안 실행 환경 설계
- [ ] AI 추천 엔진 설계 (AIS 연동)
- [ ] 마켓 UI 설계 (BRD Context와 연동)
- [ ] Trial 만료 시 Panel Soft Gate Sticky Banner UI 디자인
- [ ] Trial 만료 시 Panel Hard Gate Paywall Overlay UI 디자인
- [ ] Trial 만료 시 Template Soft Gate Expiry Badge + Soft Modal UI 디자인
- [ ] Trial 만료 시 Template Hard Gate Gating Modal UI 디자인
- [ ] Soft Gate 재노출 주기 정책 결정
- [ ] 수수료율 최종 확정
- [ ] 인증 제작자 기준 및 승격 조건 설계
- [ ] 최소 정산 금액 기준 결정
- [ ] 환불 정책 및 분쟁 처리 절차 설계
- [ ] 가격대별 Soft Gate / Hard Gate 기본값 정책 확정
- [ ] Trial 만료 후 Panel 데이터 연결 유지 여부 결정
- [ ] Trial 만료 후 Template 파일 접근 가능 여부 결정
- [ ] Trial 만료 후 데이터 보존 기간 정책
- [ ] Demo 모드 샌드박스 환경 설계
- [ ] Lite 버전과 유료 버전 간 업그레이드 흐름 설계
- [ ] 자산 등록 심사 자동화 기준 설계 (AI 검토 포함)

---

*최초 작성: 2026-03-22*
*상태: RFC (검토 중)*
