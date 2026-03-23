# PNL RFC NEXA Market Panel 개념 설계

> NEXA Market에서 유통되는 UI 컴포넌트 자산 — Panel 개념 및 설계안
> Template 설계와 함께 읽을 것: `PNL RFC NEXA Market Template 개념 설계.md`

---

## Panel 정의

```
Panel이란?
  화면에 배치되어 렌더링되는 UI 컴포넌트 자산
  사용자가 직접 보고 인터랙션하는 단위
  NEXA Market에서 선택, 구매, 배치하는 UI 자산
  공유 자산으로 누구나 제작하고 기여 가능
```

---

## Panel vs Template 비교

| 구분 | Panel | Template |
|------|-------|---------|
| 본질 | UI 컴포넌트 | 구조 데이터 |
| 사용 방식 | 화면에 배치되어 렌더링 | 작업 시작 시 선택하여 적용 |
| 편집 도구 | 비주얼 에디터 | 문서 편집기 |
| 결과물 | 화면에 보이는 것 | 문서·체크리스트·워크플로우 |
| 유료/무료 | 가능 | 가능 |
| 적용 범위 | NEXA Board, 각 서비스 화면 | 프로젝트·노드·트레이스·문서 |

---

## Panel 유형

### 기능 기준 분류

```
Display Panel      데이터를 시각화하여 보여주는 패널
  차트, 게이지, 상태 표시, 타임라인, 맵

Control Panel      사용자가 제어·입력하는 패널
  버튼, 슬라이더, 토글, 폼, 커맨드 입력

Monitor Panel      실시간 데이터를 모니터링하는 패널
  로그 뷰어, 센서 수치, 알림 피드, 네트워크 상태

Media Panel        미디어를 다루는 패널
  이미지 뷰어, 오디오 플레이어, 비디오, 파일 브라우저

AI Panel           AI와 인터랙션하는 패널
  채팅 인터페이스, 프롬프트 빌더, 결과 뷰어

Composite Panel    여러 패널을 조합한 복합 패널
  대시보드, 워크스페이스 레이아웃
```

### 적용 Context 기준 분류

```
BRD Panel    NEXA Board 전용 위젯
NOD Panel    노드 편집기 사이드 패널
AIS Panel    AI 워크스페이스 UI 컴포넌트
INF Panel    인프라 모니터링 패널
ERP Panel    업무 허브 UI 컴포넌트
범용 Panel   어느 Context에서든 사용 가능
```

---

## Capability ID

Panel은 Capability ID가 필수예요.

### 필수인 이유

```
NEXA는 Tier별 권한 체계를 가짐
  사용자 Tier에 따라 사용 가능한 기능이 다름

Panel이 Capability ID를 가져야 하는 이유
  어떤 Tier 사용자가 이 Panel을 쓸 수 있는가 정의
  Panel 설치 및 실행 시 권한 검증 기준
  마켓에서 "이 Panel은 Pro 이상 필요" 표시 가능
  자원 소비 추적 및 과금 기준
```

### Capability ID 구조

Panel도 원본과 복사본이 각각 다른 ID를 가져요.

```
원본 Panel (마켓에 등록된 것)
  cap:panel:{category}:{name}:{version}
  제작자가 소유, 마켓 접근 권한 기준

복사본 Panel (사용자가 설치/복사한 것)
  cap:panel:{category}:{name}:{version}:usr_{user_id}:{timestamp}
  사용자가 소유, 실행 권한 및 사용량 추적 기준
```

예시:
```
원본 (마켓)
  cap.panel.display.sensor-chart.1.0
  cap.panel.control.device-toggle.1.0
  cap.panel.ai.chat-interface.2.0

복사본 (사용자)
  cap.panel.display.sensor-chart.1.0.usr_abc123.20260322
  → 설치 순간 새 ID 자동 발급
```

### Tier별 접근 권한 예시

```
Free Tier     기본 Display Panel, 기본 Control Panel
Pro Tier      Monitor Panel, Media Panel
Enterprise    AI Panel, Composite Panel, 커스텀 Panel
```

---

## Panel 구성 요소

```
Panel 하나의 구조
  ├── 메타 정보
  │     이름, 설명, 태그, 제작자, 버전
  │     적용 가능 Context, 최소 크기, 의존성
  │
  ├── Capability ID         ← 필수
  │     cap:panel:{category}:{name}:{version}
  │     Tier 접근 권한 정의
  │
  ├── UI 컴포넌트
  │     렌더링되는 실제 화면 요소
  │     React / Web Component 기반
  │
  ├── 데이터 연결 인터페이스
  │     입력 데이터 스키마 정의
  │     출력 이벤트 정의
  │     NEXA 데이터 소스 연결 방식
  │
  ├── 설정 옵션
  │     사용자가 커스터마이징 가능한 속성
  │     색상, 크기, 데이터 소스, 갱신 주기 등
  │
  └── 미리보기
        마켓에서 보이는 정적 스크린샷
        인터랙티브 데모 (선택)
```

---

## Panel 제작 기준

### 필수 조건

```
독립성       다른 Panel에 의존하지 않고 단독 동작 가능
반응형       다양한 크기의 윈도우 프리셋에 적응
데이터 분리  UI와 데이터 로직 분리
접근성       WCAG 기준 준수
성능         초기 렌더링 200ms 이하
```

### 권장 조건

```
다크모드 지원
다국어 지원 (i18n)
오프라인 대응
에러 상태 UI 포함
로딩 상태 UI 포함
```

---

## NEXA Market 내 Panel 흐름

### 사용자 흐름

```
NEXA Market 접속
  → Panel 탭 선택
  → 유형/태그/평점으로 검색 및 필터
  → 미리보기 확인
  → 무료 설치 또는 유료 구매
  → NEXA Board에 배치
  → 데이터 소스 연결
  → 설정 커스터마이징
```

### 제작자 흐름

```
Panel 개발 (React / Web Component)
  → 로컬 테스트
  → NEXA Market 업로드
  → 메타 정보 입력
  → 커뮤니티 검토
  → Public 승격 또는 유료 등록
```

---

## 공유 자산 구조

### 공개 범위

```
Public    누구나 열람, 설치, 사용
Shared    특정 그룹 공유
Private   본인만 사용
```

### 버전 관리

```
Panel v1.0 → v1.1 → v2.0
변경 이력 보존
하위 호환성 유지 원칙
Fork 가능 (다른 제작자가 기반으로 새 Panel 생성)
```

### 유료/무료 정책

```
기본 방향   무료 공개
  커뮤니티 자산으로 자유롭게 공유

유료 허용
  제작자가 유료로 등록 가능
  고품질 전문 Panel에 대한 보상 구조
  플랫폼 지속 가능성 확보
```

---

## NEXA 플랫폼과의 연결

```
BRD (NEXA Board)
  Panel을 윈도우 프리셋에 배치하는 주 사용처
  드래그 앤 드롭으로 Panel 배치

PNL (NEXA Market)
  Panel 유통 및 관리 허브
  Template과 함께 마켓 구성

AIS (AI 워크스페이스)
  AI Panel 유형의 주 사용처
  AI가 Panel 조합을 추천하거나 자동 배치

NOD (노드 편집기)
  노드 로직 결과를 Panel로 시각화
  Node Template + Panel 연계

INF (인프라)
  디바이스 상태를 Monitor Panel로 표시
  실시간 센서 데이터 시각화
```

---

## 미결 사항

- [ ] Panel 기술 스택 확정 (React 단독 vs Web Component 병행)
- [ ] 데이터 연결 인터페이스 표준 설계
- [ ] Panel 샌드박스 실행 환경 설계 (보안)
- [ ] 유료 결제 및 라이선스 정책 설계
- [ ] Panel 심사 기준 및 검토 프로세스 설계
- [ ] NEXA Board와의 배치 인터페이스 설계
- [ ] Capability ID 네이밍 컨벤션 확정
- [ ] Tier별 Panel 접근 권한 매트릭스 설계

---

*최초 작성: 2026-03-22*
*상태: RFC (검토 중)*
