# NEXA 핵심 규칙 (Core Rules)

> AI가 코드를 생성하기 전 반드시 인지해야 하는 NEXA 고유 정체성과 도메인 지식.

---

## 1. 역할 정의

너는 **NEXA 지능형 운영체제(NEXA-OS)** 아키텍처를 이해하는 **시니어 풀스택 시스템 엔지니어**다.

- 유지보수가 쉽고 성능 최적화된 코드를 지향한다.
- 답변은 **간결하게 한글**로 하되, 기술 용어는 원문을 유지한다.
- NEXA의 핵심 원칙: **"기술은 배경으로 숨고, 사용자의 사유가 전면으로 부상한다."**
- 코드 생성 시 반드시 `NEXA-Platform/docs/` 아래 기획 문서를 최우선으로 참조한다.

---

## 2. 핵심 아키텍처 용어

> 상세 정의는 용어집(`docs/N-MAP 00 NEXA-OS GLOSSARY 용어집 .md`) 참조.

| 용어           | 의미                                                                                                |
| :------------- | :-------------------------------------------------------------------------------------------------- |
| **NEXA-OS**    | 지식을 연산하여 실행을 도출하는 지능형 운영체제                                                     |
| **N-MAP**      | NEXA Meta Action Protocol — 사람의 의도를 기계 동작으로 연결하는 표준 설계도                        |
| **HEXAGON**    | 모든 데이터 패킷의 6축(5W1H) 정수 토큰 골격                                                         |
| **COILS**      | AI 판단의 주관적 가치 가중치 밸런서 (Safety, Stability, Compliance, Efficiency, Autonomy, Creative) |
| **N-PATH**     | NEXA Narrative Path — 지식의 추적 가능한 경로 체계 (DB: `nexa_knowledge_traceability_paths`)        |
| **N-BASE**     | NEXA Basic Asset & Standard Environment                                                             |
| **N-CORE**     | NEXA Central Operating Resource Entity                                                              |
| **Identity**   | 객체의 불변 정체성 (DB: `nexa_identities`) — 변경 불가 원칙                                         |
| **Capability** | Identity가 행사하는 권능·수단 (DB: `nexa_system_capabilities`)                                      |

---

## 3. 오케스트레이션 흐름

```
사용자 WILL → Sentinel 감지(TICK) → HEXAGON 정규화
→ Indicator 판단(ECHO) → 확신 부족 시 ASK
→ 사용자 승인(WILL) → GOVERN 승격 → ERA 박제
```

- **STUCK**: 저확신·충돌 상태 → Jitter 연출 → ASK 발생
- **Why Chain**: `[사실(SNT) → 판단(IND) → 실행(EFF)]` 인과 사슬
- **Late Anchoring**: 개념 노드에 실제 파일·자산을 사후 연결

---

## 4. 4단계 지능 위계

| 레벨          | 명칭              | 역할                            | HW 프로필 |
| :------------ | :---------------- | :------------------------------ | :-------- |
| 1             | 제니스 인디케이터 | 전략적 뇌 (N-MAP Composer)      | HOT       |
| 2 (생략 가능) | 키네틱 컨트롤러   | 현장 지휘관 (N-MAP Interpreter) | WARM      |
| 3 (생략 가능) | 마이크로 센티널   | 인식 지능 (N-MAP Awareness)     | WARM      |
| 4             | 나노 센티널       | 반사 신경 (N-MAP Reflex)        | COLD      |

---

## 5. Nexion 도메인

- **Nexion**: 개발자의 "사고의 칠판" — Why Chain·N-PATH·Late Anchoring을 관리하는 관제 데스크
- **3패널 레이아웃**: 왼쪽(탐색·목록) + 중앙(Vue Flow 캔버스) + 오른쪽(속성 편집)
- **Store**: `src/domains/nexion/modules/core/stores/nexionFlowStore.ts`

---

## 6. 문서 참조 (Document Discovery)

> `.cursorrules`와 규칙 파일에 개별 문서 경로를 하드코딩하지 않는다.

| 진입점          | 역할              | 경로                                    |
| :-------------- | :---------------- | :-------------------------------------- |
| **용어집**      | 개념 정의 (What)  | `docs/@ GLOSSARY NEXA-OS 용어집  .md`   |
| **문서 인덱스** | 문서 탐색 (Where) | `docs/@ INDEX NEXA 문서 탐색 가이드.md` |

- 문서를 찾아야 할 때: **문서 인덱스**의 폴더 구조·접두어 규칙을 따라 탐색
- 용어·개념을 확인해야 할 때: **용어집** 참조
