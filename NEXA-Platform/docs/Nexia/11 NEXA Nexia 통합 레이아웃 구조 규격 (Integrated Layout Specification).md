### 11. NEXA Nexia 통합 레이아웃 구조 규격 (Integrated Layout Specification)

## 11.1 목적과 범위

본 문서는 NEXIA UI의 통합 레이아웃 구조를 정의한다.  
대상은 `Top Bar`, `Left Drawer`, `Center Main`, `Right Drawer`와 이들 사이의 상태/이벤트 흐름이다.
우주언어 입출력 채널의 레이아웃 반영 기준은 `13 우주언어 프로토콜 개념 정리`를 참조한다.

---

## 11.2 설계 목표

- 인지 부하 최소화: 탐색, 실행, 설정 경계를 명확히 분리한다.
- 실행 연속성 보장: 탭 전환/창 분리 시 작업 맥락이 유지되어야 한다.
- 조종권 가시화: 시스템 상태, 승인 필요 상태, 오류 상태를 즉시 인지 가능하게 한다.
- 확장성 확보: 탭 수 증감(Lite/Standard/Extended)에 따라 레이아웃이 유연하게 재배치된다.

---

## 11.3 레이아웃 구성 개요

| 영역 | 핵심 책임 | 사용자 질문에 대한 즉시 답 |
| --- | --- | --- |
| Top Bar | 전역 이동/상태 | "지금 어느 도메인이고 시스템은 정상인가?" |
| Left Drawer | 자산/기록 탐색 | "무엇을 불러와서 이어서 작업할까?" |
| Center Main | 실행/생산 | "지금 무엇을 만들고 실행 중인가?" |
| Right Drawer | 설정/유틸리티 | "어떻게 조정하고 최적화할까?" |

---

## 11.4 영역별 상세 규격

### 11.4.1 Top Bar (Global Navigation)

- 기능:
  - 도메인 전환(NEXIA ↔ 타 도메인)
  - 전역 알림/헬스 상태 표시
  - 사용자 세션/권한 정보 표시
- UI 원칙:
  - 항상 고정(sticky)
  - 알림은 심각도 기준 색상 표준 사용(SEV1/2/3)
  - 도메인 전환 시 미저장 변경 여부를 사전 확인
- 실패 대응:
  - 전역 상태 수집 실패 시 `degraded` 배지 표시
  - 도메인 목록 로딩 실패 시 최근 접근 도메인 캐시 노출

### 11.4.2 Left Drawer (Nexia Intra-Navigator)

- 기능:
  - Search, Projects, Cockpit History, Assets(Docs/Media)
  - 최근 항목, 즐겨찾기, 현재 컨텍스트 추천
- UX 원칙:
  - 닫힘 상태에서 Quick Bubble로 핵심 액션 유지
  - 키보드 내비게이션(`Ctrl/Cmd + K`)으로 즉시 검색 진입
- 데이터 정책:
  - 최근 항목 정렬 기준: `lastAccessedAt desc`
  - 히스토리 보존 기간: 운영 정책 문서 기준 적용

#### 11.4.2-a Solo 채팅 리스트 규격

- 좌측에는 `Solo 채팅 리스트`를 상시 고정 노출한다.
- 기본 구성:
  - NEXIA 6개 전문 탭 채팅(Ethos, Synapse, Glos, Physis, Sense, Navis)
- 확장 구성:
  - 타 도메인 미니 채팅(사이드바/플로팅에서 생성된 채팅)을 동급 항목으로 추가
- 노출 조건:
  - 타 도메인 항목은 "해당 도메인에서 실제 채팅 시작" 이벤트가 발생한 경우에만 노출
- 동작:
  - 리스트 항목 클릭 시 `Solo 모드`로 즉시 전환
  - 현재 활성 Solo 항목은 강조 표시하고, 최근 활성 순으로 재정렬 가능

### 11.4.3 Center Main (Engine Workspace)

- 기능:
  - `0 Cockpit + 1~6 전문 탭` 실행
  - 프로파일 기반 탭 증감(Lite/Standard/Extended)
- 레이아웃 원칙:
  - 현재 활성 탭 1개, 백그라운드 실행 탭 상태 요약 제공
  - 탭 전환 시 입력 초안/스크롤/선택 상태 복원
  - 멀티윈도우 모드에서 창 간 동일 문맥 유지
- 탭 프로파일:
  - Lite: 핵심 탭만 표시(운영/모바일/경량)
  - Standard: 기본 7개 탭
  - Extended: 도메인 특화 탭 추가

#### 11.4.3-a Cockpit 레이어 권한 규칙

| 레이어 | 권한 | 설명 |
| --- | --- | --- |
| Global Flow | Read-Only | 전역 단톡 뷰, 쓰기/실행 입력 금지 |
| NEXIA Crew | Read/Write | 여러 Solo를 동시에 조율하는 통합 단톡 |
| NEXIA Solo | Read/Write | 특정 에이전트와 직접 실행 대화 |

- Crew는 다중 Solo를 병렬/순차로 지휘하고 결과를 집계한다.
- Global Flow는 관찰 전용이며, 실행 액션은 Crew/Solo에서만 허용한다.
- NIXIE는 Cockpit의 필수 시각화 계층으로 고정하며, GlobalFlow/Crew/Solo 전환과 상태 이벤트를 실시간 반영해야 한다.
- NIXIE는 장식 요소가 아니라 운영 상태(대기/처리/승인/오류)를 전달하는 UI 계층으로 취급한다.

### 11.4.4 Right Drawer (System Utility)

- 기능:
  - Agent Intelligence Config
  - Nexnap Pulse Monitor
  - Multimodal Interface
  - Hexagon Semantic Toolkit
  - Cross-Tab Utility
  - **Time Axis Panel** (시간·이력·타임라인 — 전 탭 Cross-Tab, `00` §3.2)
- UX 원칙:
  - 아코디언 단위로 열림/닫힘 상태 기억
  - 탭별 추천 유틸리티 자동 강조
  - Pin 고정 시 탭 전환 후에도 유지
- 운영 원칙:
  - 성능 지표는 최소 1초 주기 이상 갱신
  - 고비용 모니터는 기본 접힘 상태

---

## 11.5 상태 모델

### 11.5.1 전역 상태 키

- `activeDomain`
- `activeTabId`
- `layoutProfile` (`Lite` | `Standard` | `Extended`)
- `leftDrawerState` / `rightDrawerState`
- `systemHealth` (`healthy` | `degraded` | `critical`)
- `pendingApprovals`
- `activeLayer` (`GlobalFlow` | `Crew` | `Solo`)
- `soloChatList` (NEXIA 6개 + 활성화된 타 도메인 채팅)
- `activeSoloAgentId`
- `crossDomainChats` (도메인별 미니 채팅 활성 상태)

### 11.5.2 상호작용 상태

| 상태 | 설명 | UI 반응 |
| --- | --- | --- |
| Idle | 유휴 상태 | 얇은 인디케이터 파형 유지 |
| Working | 작업/생성 진행 중 | 진행 상태 + 취소 가능 액션 제공 |
| NeedsApproval | 승인 필요 | Cockpit 상단 승인 배너 |
| Error | 오류 발생 | 영역별 오류 배지 + 복구 액션 |

- 상호작용 상태 변화는 NIXIE 시각화와 동기화되어야 하며, 상태 불일치가 발생하면 `degraded` 상태로 표기한다.

---

## 11.6 이벤트 흐름 규격

1. 사용자 액션(검색/탭전환/실행) 발생  
2. 상태 스토어 업데이트(Pinia/Yjs 연계)  
3. 레이아웃 영역별 반응 렌더링  
4. 필요 시 승인/알림/복구 액션 트리거  
5. 결과 로그 및 감사 이벤트 기록

### 필수 이벤트 타입

- `LAYOUT_PROFILE_CHANGED`
- `TAB_ACTIVATED`
- `DRAWER_TOGGLED`
- `APPROVAL_REQUIRED`
- `SYSTEM_HEALTH_CHANGED`
- `WINDOW_DETACHED` / `WINDOW_RESTORED`
- `GLOBALFLOW_LOCKED` (읽기 전용 잠금 상태 유지)
- `SOLO_LIST_UPDATED` (Solo 리스트 항목 추가/제거/정렬)
- `CROSS_DOMAIN_CHAT_ACTIVATED` (타 도메인 채팅 시작)
- `LAYER_SWITCHED` (GlobalFlow <-> Crew <-> Solo 전환)

---

## 11.7 접근성/포용성 기준

- 키보드만으로 전 영역 이동 가능
- 스크린리더용 ARIA 레이블 제공
- 색상 의존 정보에 텍스트 보조 표기 병행
- 모션 축소 모드에서 파형/애니메이션 강도 감소
- 음성/시각 피드백은 대체 채널(텍스트/아이콘) 제공

---

## 11.8 성능 기준 (Layout SLO)

| 항목 | 목표 |
| --- | --- |
| 탭 전환 체감 지연 | P95 150ms 이하 |
| 드로어 열림 반응 | P95 120ms 이하 |
| 레이아웃 복원 시간 | 2초 이하 |
| 상태 배지 반영 지연 | 평균 100ms 이하 |

---

## 11.9 실패 시 폴백 규칙

- 유틸리티 로딩 실패: Center Main 우선 유지, Utility는 재시도 큐로 전환
- 드로어 상태 손상: 기본값으로 초기화 후 복구 안내
- 레이아웃 프로파일 오류: `Standard` 자동 폴백
- 창 분리 실패: 단일 창 모드로 유지하고 사용자에게 원인 안내

---

## 11.10 구현 체크리스트

- Top/Left/Center/Right 책임 경계가 코드 구조와 일치하는가?
- 탭 증감 시 레이아웃 붕괴 없이 동작하는가?
- 승인 필요 이벤트가 Cockpit으로 일관되게 집계되는가?
- 접근성 기준(WCAG AA, 키보드, ARIA)을 만족하는가?
- 장애 시 폴백 흐름이 사용자에게 명확히 전달되는가?

---

## 11.11 연계 문서

- `00 인공지능 NEXIA 구조와 기술 스택과 운영방침.md`
- `04 사용자 경험(UX)의 포용성 및 확장 (Inclusivity & UX Expansion).md`
- `08 멀티윈도우 아키텍처 규격 (Multi-Window Architecture Specification).md`
- `09 Document PiP 운영 규격 (Document Picture-in-Picture Operations Spec).md`
