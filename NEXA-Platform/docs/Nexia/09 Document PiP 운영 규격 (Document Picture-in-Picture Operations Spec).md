### 9. Document PiP 운영 규격 (Document Picture-in-Picture Operations Spec)

## 9.1 목적과 범위

본 문서는 NEXIA의 상시 보조 인터페이스를 위한 Document PiP 운용 기준을 정의한다.  
PiP는 메인 창을 대체하지 않고 `보조 제어/상태 가시성`을 제공한다.

## 9.2 핵심 특성

- 메인 문서 종속 창: 메인 탭 종료 시 PiP도 종료된다.
- 항상 위 보조 인터페이스: 짧은 명령/상태 확인에 최적화된다.
- 경량 상호작용: 핵심 제어만 제공하고 복잡 편집은 메인 창에서 수행한다.

## 9.3 적용 시나리오

- 다른 앱 작업 중 음성 대기/빠른 명령 입력
- 실시간 마이크 상태와 AI 처리 상태 모니터링
- 장시간 보조 비서 UI 유지

## 9.4 상태 및 제어권 모델

| 상태 | 메인 창 | PiP 창 | 설명 |
| --- | --- | --- | --- |
| MainMaster | Active | Passive | 메인이 제어권 보유 |
| PiPMaster | Passive | Active | PiP가 음성 제어권 보유 |
| ProcessingLock | Locked | Locked | LLM 처리 중 입력 잠금 |
| PrivacyMute | Muted | Muted | 전역 음성 차단 |

- 공통 레이어 키: `activeLayer` (`GlobalFlow` | `Crew` | `Solo`)
- 전환 이벤트: `PIP_OPEN`, `PIP_CLOSE`, `MASTER_SWITCH`, `LAYER_SWITCHED`, `PRIVACY_MUTE`, `RESUME`.

## 9.5 동기화 채널 규칙

- 채널: `BroadcastChannel('nexia.pip.sync.v1')`
- 필수 메시지: `type`, `source`, `target`, `requestId`, `timestamp`, `payload`.
- 중복 처리 방지: `requestId` 기반 idempotency 적용.

### 9.5.1 공통 이벤트 정합(07/11)

| 이벤트 | 목적 |
| --- | --- |
| `LAYER_SWITCHED` | GlobalFlow/Crew/Solo 전환 동기화 |
| `MASTER_SWITCH` | 음성 제어권(PiP/메인) 이양 |
| `SOLO_LIST_UPDATED` | Solo 채팅 리스트 변경 반영 |
| `CROSS_DOMAIN_CHAT_ACTIVATED` | 타 도메인 채팅 시작 이벤트 반영 |
| `PRIVACY_MUTE` | 전역 음성 차단 |
| `RESUME` | 음성 루프 재개 |

## 9.6 제어권 중심 운영 규칙

- PiP가 Master일 때 메인 음성 루프는 Pause.
- PiP 닫힘 시 제어권은 즉시 메인으로 반환한다.
- 응답 생성 중 입력 잠금 상태를 강제한다.
- STT/TTS 기능 동작 자체는 `07` 문서 규격을 참조한다.
- `activeLayer=GlobalFlow` 상태에서는 읽기 전용 원칙을 유지한다.

## 9.7 UI/프라이버시 운영 규칙

- 필수 표시는 `Listening`, `Muted`, `Processing`.
- 권장 색상: Listening(적색), Muted(회색), Processing(청색).
- 파형은 수집 상태만 표시하고 원시 오디오는 저장하지 않는다.
- 메인/ PiP 모두에서 마이크 상태가 동일하게 보여야 한다.
- UI 표현 상세 규격은 `04`, 음성 엔진 동작 규격은 `07`을 따른다.

## 9.8 생명주기 및 폴백

- PiP 닫힘 이벤트: 제어권을 즉시 메인으로 반환.
- 메인 탭 닫힘 이벤트: PiP 종료 전 사용자 경고(선택) 가능.
- PiP 미지원 브라우저: 플로팅 모달/미니 패널로 폴백.

## 9.9 장애 대응

- 채널 단절: 로컬 안전 모드(PrivacyMute) 진입 후 재연결 시도.
- 권한 박탈(마이크): 즉시 Muted 전환 + 재권한 요청.
- 제어권 충돌: 마지막 유효 승인 이벤트 기준으로 단일화.

## 9.10 KPI

| 항목 | 기준 |
| --- | --- |
| PiP 제어권 전환 지연 | 평균 100ms 이하 |
| 상태 불일치율(메인/PiP) | 0.5% 이하 |
| 음성 루프 재개 성공률 | 99% 이상 |
| 오인식 명령률 | 2% 이하 목표 |

## 9.11 연계 문서

- `07 음성 인풋 자동화 및 확장 로직 (Voice Input Automation & Expansion).md`
- `04 사용자 경험(UX)의 포용성 및 확장 (Inclusivity & UX Expansion).md`
- `06 예외 상황 처리 (Exception Handling).md`
- `08 멀티윈도우 아키텍처 규격 (Multi-Window Architecture Specification).md`
- `11 NEXA Nexia 통합 레이아웃 구조 규격 (Integrated Layout Specification).md`
