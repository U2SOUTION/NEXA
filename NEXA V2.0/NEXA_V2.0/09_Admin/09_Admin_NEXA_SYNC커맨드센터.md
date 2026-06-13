---
implements_doc: 
see_also: [TDD-033, TDD-034, TDD-036, TDD-039, TDD-041, TDD-056, TDD-059]
doc_id: ADM-001
title: NEXA SYNC 커맨드 센터
category: 09_Admin
domain: NEXAOS
status: published
created: 2026-06-10
updated: 2026-06-12
parent_doc: TDD-001
terms_standard:
  - sse
  - websocket
terms_nexa:
  - NEXA-SYNC
  - nexabo
  - Omnix
  - Normex
  - Sentinel
  - GOVERN
  - 5W1H
  - Traceability-Map
tags: ["doc/cat/09-admin", "doc/domain/nexaos", "nexa/NEXA-SYNC", "nexa/nexabo", "nexa/Omnix", "nexa/Normex", "nexa/GOVERN", "nexa/5W1H"]
fileClass: global
---

# NEXA-SYNC · 커맨드 센터 (Command Center)

> **레거시 출처:** `NEXA-Platform/docs/AI/tmp_NEXA-SYNC 커맨드 센터.md` → **본 문서(ADM-001)가 정본**.

NEXA-SYNC 구현 과정의 **지능적 서사**를 운영·모니터링하기 위한 **어드민 UI** 기능 도메인과 하위 메뉴 구성.

> **연계 TDD:** [GOVERN (TDD-041)](../08_TDD/AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) · [5W1H · HEXAGON (TDD-033)](../08_TDD/AI/08_TDD_AI_5W1H_6대추상레이어규격.md) · [데이터 수명 (TDD-034)](../08_TDD/AI/08_TDD_AI_데이터성격수명주기.md) · [안전 Reflex (TDD-039)](../08_TDD/AI/08_TDD_AI_안전대책선조치로직.md)

**V2.0 UI 배치:** 관제·Live Feed = **`nexabo`** · 승인 strip = **Omnix** · RULE·GOVERN 편집 = **Normex** · 추적 그래프 = **ontex** trace (후보).

---

## V2.0 메뉴 ↔ domainKey (요약)

| § 도메인 | 하위 메뉴 | V2.0 담당 |
| :--- | :--- | :--- |
| 1 서사 모니터링 | 팩트 스트림 | **nexabo** · MQTT 후보고 수신 ([TDD-068 · IoT §4](../08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md)) |
| 1 | 인디케이터 인사이트 | **Omnix** · `apps/agent-graph` · COILS (TDD-041) |
| 1 | 추적 지도 | **ontex** trace · EFF→IND→SNT ID 체인 |
| 2 거버넌스 | 코일 콘솔 | TDD-041 · Omnix 시뮬레이션 |
| 2 | GOVERN | **Normex** · 승인 후 GOVERN 태그 |
| 2 | Safety Reflex | TDD-039 · Twinex · 엣지 ACTON |
| 3 아카이브 | Intent / RAG / Lifecycle | TDD-034 · TDD-036 · pgvector |
| 4 인터랙션 | Summary · Effector | Omnix TTS · **Twinex** / infra |
| 5 Evolution | VIRTUAL · Analytics | TDD-034 VIRTUAL · Feedback → GOVERN |

**용어:** 구 「4대 추상 레이어」→ **HEXAGON 6축** (TDD-033). 구 Cockpit/Ethos → **Omnix/Normex**.

---

## **1. 도메인: 서사 모니터링 (Narrative Monitoring)**

넥사 프로토콜의 핵심인 실시간 데이터 흐름과 인과관계를 추적하는 영역입니다.

- **하위 메뉴: 팩트 스트림 (Sentinel Fact Stream)**
  - **주요 기능:** 나노/마이크로 센티널이 생성한 **5W1H 기반 사실 문장**을 실시간 피드로 출력. 로우 데이터가 **담백한 FACT**로 요약되는 과정 모니터링.
    - 그래픽: 엣지 디바이스를 점으로, 센티널 활동 시 하이라이트, 플랫폼 허브와 라인 연결
    - 좌측: 엣지 디바이스 리스트 · 클릭 시 해당 디바이스만 필터
    - 우측: 실시간 메시지 · 시간순 자동 스크롤
- **하위 메뉴: 인디케이터 인사이트 (Indicator Insight View)**
  - **주요 기능:** 센티널 FACT에 **맥락·Why**를 부여한 결과 시각화. **HEXAGON** 토큰으로 사건 중요도 즉시 파악.
    - 6 COILS 실시간 조정 · 결과 미리보기
    - 도메인별·커스텀 코일 프로필 A/B 테스트
- **하위 메뉴: 추적 지도 (Traceability Map)**
  - **주요 기능:** **ID 참조 사슬 (EFF→IND→SNT)** 그래프 · 타임라인 역추적.

## **2. 도메인: 거버넌스 및 가치 설정 (Governance & Values)**

코일·운영 규범 **전략실**.

- **하위 메뉴: 코일 벨런서 대시보드 (COILS Console)**
  - Safety·Efficiency 등 **가중치** 실시간 조정 · ECHO 반영 시뮬레이션
- **하위 메뉴: 규범 관리자 (Policy Manager — GOVERN)**
  - **GOVERN** 태그 정의 · 인디케이터 제안 규칙 검토·반영 (**Omnix** 승인)
- **하위 메뉴: 세이프티 가드 (Safety Reflex Config)**
  - **Local Bypass** · 긴급 정지 · STUCK 조건 (TDD-039)

## **3. 도메인: 지능형 아카이브 (Intelligent Archive)**

페르소나·장기 기억.

- **하위 메뉴: 의지 아톰 (Intent Atomizer)** — INTENT → Atom 영구 보존
- **하위 메뉴: RAG 메모리 라이브러리** — 5W1H 필터 · pgvector
- **하위 메뉴: 수명 주기 관리** — Nature Tag · ROUTINE 압축 / INCIDENT·INTENT 박제

## **4. 도메인: 인터랙션 및 환경 (Interaction & Experience)**

- **피드백 요약 (Interaction Summary)** — Summary · TTS · English Kernel–Multilingual Shell
- **이펙터 컨트롤 (Device Effector Hub)** — 실행 장치 상태 · IND-ID → Result

## **5. 도메인: 시스템 진화 및 테스트 (Evolution & Lab)**

- **시나리오 랩 (VIRTUAL)** — VIRTUAL 태그 시뮬레이션
- **학습 분석** — Feedback Loop · GOVERN 안착률

---

NEXA-SYNC는 **편안함·쉬움**을 위해 백엔드에 복잡 로직을 두고, UI에는 **5W1H 서사 기반 직관 인터페이스**를 제공한다.

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 (TDD-001)](../08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| GOVERN | [TDD-041](../08_TDD/AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |
| 엣지·후보고 | [TDD-068 · IoT 파이프라인](../08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) |
| 에이전트 파이프라인 | [TDD-067 · 에이전틱 파이프라인](../08_TDD/NEXIA/08_TDD_NEXIA_에이전틱AI파이프라인_7탭플랫폼연계_v1.0.md) |
| 도메인 맵 | [TDD-059](../08_TDD/NEXAOS/08_TDD_NEXAOS_도메인마스터맵_v1.0.md) · **nexabo** |
| 레거시 stub | `NEXA-Platform/docs/AI/tmp_NEXA-SYNC …` (삭제 예정) |
