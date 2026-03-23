# PNL RFC NEXA Market Template 개념 설계

> AI 협업 프로젝트 발진을 위한 Template 시스템 및 NEXA Market 설계안
> 구 파일명: PNL RFC Launch Frame 개념 설계.md

---

## 핵심 개념 정리

### Template vs Launch

```
Template   자산의 이름 (명사)
           논리의 틀, 구조 데이터
           NEXA Market에서 선택하는 것

Launch     행위의 이름 (동사)
           Template을 선택해서 시작하는 행위
           "Template을 Launch한다"

예시
  NEXA Market에서 Template 선택
    → Launch 버튼 클릭
    → 프로젝트 발진
```

### Template의 범위

Template은 프로젝트에만 국한되지 않는다.
논리의 틀이 필요한 모든 곳에 적용 가능하다.

```
Template 유형
  ├── Project Template   프로젝트 전체 구조 틀
  ├── Node Template      NEXA Node 로직 구조 틀
  ├── Trace Template     자동화 시나리오 구조 틀
  ├── Doc Template       문서 작성 구조 틀
  └── ...                앞으로 추가될 것들
```

---

## Panel vs Template 정의

| 구분 | Panel | Template |
|------|-------|---------|
| 본질 | UI 컴포넌트 | 구조 데이터 |
| 사용 방식 | 화면에 배치되어 렌더링 | 작업 시작 시 선택하여 적용 |
| 편집 도구 | 비주얼 에디터 | 문서 편집기 (NEXA Market 내) |
| 결과물 | 화면에 보이는 것 | 문서·체크리스트·워크플로우 |
| 유료/무료 | 가능 | 가능 |
| 적용 범위 | UI 화면 | 프로젝트·노드·트레이스·문서 |

### Template이 "UI가 없다"는 의미

```
Template 자체   구조 데이터 (UI 컴포넌트 아님)
편집 행위        NEXA Market 편집기 UI를 통해 가능

비유
  Word 문서 (.docx)   구조 데이터 (Template에 해당)
  Word 프로그램        편집하는 UI (NEXA Market 편집기에 해당)

"UI가 없다" = Template 자체의 성격
편집 도구가 UI를 갖는 것은 당연하고 별개
```

---

## Template 유형별 상세

### Project Template

```
목적   프로젝트 시작 시 전체 구조 틀 제공
내용
  Context 구성 제안 (필수/선택)
  DocType 체크리스트
  AI 협업 발진 포인트
  초기 문서 초안 구조
```

프로젝트 유형 예시:
```
Web Service Template
IoT System Template
AI Application Template
Hardware Template
Art Project Template
Solo Dev Template
OSS Library Template
```

### Node Template

```
목적   NEXA Node에서 IoT 로직 작성 시 구조 틀 제공
내용
  노드 연결 패턴
  입출력 데이터 구조
  에러 처리 흐름
  펌웨어 배포 체크리스트
```

### Trace Template

```
목적   NEXA Trace에서 자동화 시나리오 작성 시 구조 틀
내용
  트리거 조건 패턴
  액션 시퀀스 구조
  조건 분기 패턴
  롤백 처리 흐름
```

### Doc Template

```
목적   문서 작성 시 구조 틀 제공
내용
  DocType별 초안 구조
  섹션 구성 가이드
  AI 협업 프롬프트 예시
```

---

## Capability ID

모든 Template은 Capability ID가 필수예요.
단, 원본과 복사본이 각각 다른 ID를 가져요.

### 두 층위의 ID

```
원본 Template (마켓에 등록된 것)
  cap:template:{type}:{name}:{version}
  제작자가 소유
  마켓 접근 권한 및 버전 관리 기준

복사본 Template (사용자가 복사한 것)
  cap:template:{type}:{name}:{version}:usr_{user_id}:{timestamp}
  사용자가 소유
  원본과 독립적으로 수정 가능
  원본 업데이트와 무관하게 유지
```

### Capability ID 구조 예시

```
원본 (마켓)
  cap.template.project.iot-system.1.0
  cap.template.node.device-control.1.0
  cap.template.trace.automation.1.0

복사본 (사용자)
  cap.template.project.iot-system.1.0.usr_abc123.20260322
  → 마켓에서 복사한 순간 새 ID 자동 발급
```

### 복사 시 ID 발급의 의미

```
원본 Template이 업데이트돼도
  → 사용자 복사본에 영향 없음
  → 각자의 ID로 독립 관리

사용자가 복사본을 마켓에 공유하면
  → 새 원본 Template ID 발급
  → Fork 개념과 일치

Capability 권한 검증
  원본 ID    → 마켓 접근 권한 (Tier 확인)
  복사본 ID  → 사용자 실행 권한 (사용량 추적)
```

### Tier별 접근 권한 예시

```
Free Tier     기본 Project Template, Doc Template
Pro Tier      Node Template, Trace Template
Enterprise    AI 협업 발진 포함 Template, 커스텀 Template
```

---

## Template 구성 요소

```
Template 하나의 구조
  ├── 메타 정보
  │     유형, 설명, 태그, 제작자, 버전, 적용 대상
  │
  ├── 구조 정의
  │     Context 구성 (Project Template)
  │     노드 패턴 (Node Template)
  │     시나리오 패턴 (Trace Template)
  │
  ├── 체크리스트
  │     단계별 작업 목록
  │     필수 / 권장 / 선택 구분
  │
  ├── AI 협업 포인트
  │     어느 단계에서 AI와 협업을 시작하면 좋은가
  │     추천 프롬프트 예시
  │
  └── 초기 컨텐츠
        첫 문서·노드·시나리오의 초안 구조
```

---

## NEXA Market 구조

### 마켓 네이밍 확정

```
NEXA Market

이유
  Panel + Template 모두를 자연스럽게 포함
  사용자 입장에서 선명하게 인식
  무료 기본, 유료 허용
```

### 자산 구조

```
NEXA Market
  ├── Panel      UI 컴포넌트 (위젯, 화면 요소)
  └── Template   구조 데이터 (논리의 틀)
        ├── Project Template
        ├── Node Template
        ├── Trace Template
        └── Doc Template
```

### 유료/무료 정책

```
기본 방향   무료 공개
  커뮤니티 자산으로 자유롭게 공유
  품질 향상을 위한 기여 문화 형성

유료 허용
  제작자가 유료로 등록 가능
  고품질 전문 Template/Panel에 대한 보상 구조
  플랫폼 지속 가능성 확보
```

### 공개 범위

```
Public    누구나 열람, 복사, 사용
Shared    특정 그룹 공유
Private   본인만 사용
```

### 기여 흐름

```
사용자가 Template 선택
  → 프로젝트에 맞게 커스터마이징
  → 완성도가 높아지면 공유 기여
  → 커뮤니티 검토 → Public 승격

버전 관리
  Template v1.0 → v1.1 → v2.0
  변경 이력 보존
  Fork 가능 (다른 사용자가 기반으로 새 Template 생성)
```

### 검색 및 선택

```
태그 기반 검색
  유형, 기술 스택, 난이도, 팀 규모

평가 지표
  사용 횟수, 완료율, 사용자 평점

AI 추천
  사용자가 프로젝트 설명 입력
  → AI가 적합한 Template 추천
  → Launch 버튼으로 발진
```

---

## NEXA 플랫폼과의 연결

```
PNL (NEXA Market)
  Panel + Template 통합 마켓

AIS (AI 워크스페이스)
  Template 선택 후 AI가 초기 문서 초안 자동 생성
  AI와 대화하며 Template 커스터마이징

NOD (노드 편집기)
  Node Template으로 IoT 로직 구조 빠르게 시작
  Template의 노드 패턴을 편집기에서 바로 적용

TRC (트레이스)
  Trace Template으로 자동화 시나리오 구조 제공

ARC (아카이브)
  완성된 프로젝트 → Template으로 역추출
  공유 자산으로 기여
```

---

## 왜 문서(기획)로 시작해야 하는가

```
프로젝트 시작 = 문서 작성 시작

이유
  복잡한 시스템일수록 기술 제약을 먼저 파악해야 함
  AI 협업은 맥락(문서)이 있어야 방향을 잡을 수 있음
  코드 먼저 시작하면 나중에 뒤엎는 비용이 큼

예외 — SPIKE
  "이게 가능한가"를 먼저 확인해야 할 때
  코드를 먼저 써도 되는 유일한 단계
  결과를 문서로 남기면 기획의 시작점이 됨

Template의 역할
  복잡한 시작점을 단순하게 만들어 줌
  "무엇부터 해야 하는가"를 Template이 안내
  AI가 Template을 읽고 협업 방향을 즉시 파악
```

---

## 확장 예제 — 출판 프로젝트 Template

NEXA Market Template이 특정 산업에 어떻게 적용되는지 보여주는 실제 확장 사례.

### 출판 프로젝트 유형별 Template

책의 성격에 따라 필요한 구조 틀이 완전히 달라진다.

**논픽션 / 기술서 Template**
```
목적   현장 취재, 인터뷰, 자료조사, 저자 생각을 구조화
체크리스트
  [ ] 주제 및 독자 정의 (VISION)
  [ ] 챕터 구성 초안 (ARCH)
  [ ] 자료조사 목록 및 출처 관리 (REF)
  [ ] 인터뷰 대상 및 질문지 (SPEC)
  [ ] 챕터별 초고 작성 (DESIGN)
  [ ] 교정·교열 (REVIEW)
  [ ] 인쇄 사양 체크리스트 (GUIDE)
AI 협업 포인트
  챕터 구성 초안 단계에서 AI와 협업
  인터뷰 질문지 생성 자동화
  초고 교정 및 보완 제안
```

**소설 Template**
```
목적   세계관, 인물, 플롯, 챕터 구성 구조화
체크리스트
  [ ] 세계관 설정 (CONCEPT)
  [ ] 주요 인물 시트 (SCHEMA)
  [ ] 전체 플롯 타임라인 (FLOW)
  [ ] 복선 및 떡밥 관리 목록 (LOG)
  [ ] 챕터별 초고 (DESIGN)
  [ ] 베타 리더 피드백 (REVIEW)
AI 협업 포인트
  인물 관계도 생성
  플롯 일관성 검토
  문체 교정
```

**시집 Template**
```
목적   시 초안, 주제 묶음, 배열 순서 구조화
체크리스트
  [ ] 시집 전체 톤 및 주제 정의 (VISION)
  [ ] 시 초안 목록 (NOTE × N)
  [ ] 주제별 묶음 분류 (ARCH)
  [ ] 배열 순서 결정 (DESIGN)
  [ ] 표지 컨셉 (CONCEPT)
AI 협업 포인트
  주제별 분류 제안
  배열 순서 흐름 검토
```

**아트북 Template**
```
목적   스케치, 사진, 글, 개념 흐름의 시각적 구조화
체크리스트
  [ ] 아트북 컨셉 및 철학 정의 (VISION)
  [ ] 시각 자료 목록 및 분류 (SCHEMA)
  [ ] 텍스트와 이미지 배치 흐름 (DESIGN)
  [ ] 인쇄 사양 결정 (SPEC)
        용지 종류, 제본 방식, 후가공
  [ ] 표지 컨셉 설계 (DESIGN)
  [ ] 교정쇄 확인 (REVIEW)
  [ ] 최종 PDF 납품 체크리스트 (GUIDE)
AI 협업 포인트
  텍스트 흐름 교정
  인쇄 사양 자동 체크
```

### 사용자 유형별 활용 방식

```
입문자 (첫 책 쓰는 사람)
  Template 그대로 따라가면 결과물 나옴
  빈칸 채우기 방식
  AI가 각 단계에서 다음 할 일 안내

숙련자 (출간 경험 있는 저자)
  Template을 시작점으로만 사용
  구조를 자유롭게 변형
  자신만의 커스텀 Template 완성

출판사 / 전문 편집자
  기관 전용 커스텀 Template 제작
  NEXA Market에 유료 등록
  브랜드 Template으로 수익화
  예: "○○ 출판사 공식 원고 Template"
```

### Seed Content 연결

```
NEXA Market 론칭 초기
  출판 프로젝트 Template이 첫 번째 자산 후보
  실제 아트북 제작 과정에서 검증된 Template
  → 직접 써봤으니 완성도가 높음
  → 지인 출판사와 협업 시 "공식 Template" 가능성
```

---

## 미결 사항

- [ ] Template 유형 목록 최종 확정
- [ ] Template 최소 구성 요소 확정
- [ ] Node Template 구체적 패턴 설계
- [ ] Trace Template 구체적 패턴 설계
- [ ] 공유 기여 검토 프로세스 설계
- [ ] AI 협업 발진 포인트 구체화
- [ ] Template 버전 관리 및 Fork 정책 설계

---

*최초 작성: 2026-03-22 (구 파일명: PNL RFC Launch Frame 개념 설계.md)*
*최종 수정: 2026-03-22 (C안 반영 — Template/Launch 분리, 유형 확장)*
*상태: RFC (검토 중)*
