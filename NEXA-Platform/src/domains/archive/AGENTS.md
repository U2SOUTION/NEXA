## Archive Domain 전용 규칙 (NEXA Platform)

> 이 문서는 `archive` 도메인에서
> **기능을 먼저 만들어도 구조가 흐트러지지 않도록**
> AI의 행동을 제한하기 위한 규칙이다.

---

## 1️⃣ Archive 도메인의 정체성 (가장 중요)

- archive 도메인은 **“사유 + 실행을 담는 컨테이너”**다.
- 단일 기능 앱이 아니라:

  - 문서
  - 지식
  - 실행
  - 연결
    을 **조합**하는 도메인이다.

👉 따라서 **빠른 완성보다 구조적 여유**를 우선한다.

---

## 2️⃣ 작업 우선순위 원칙 (기능 우선 개발 대응)

- 현재 archive는 **완성형 설계 상태가 아님**을 인정한다.
- AI는 다음을 지켜야 한다:

### 허용

- 당장 필요한 기능만 구현
- 미구현 영역은 placeholder 유지
- 확장 가능한 형태로만 구현

### 금지

- “어차피 나중에 바꿀 것”이라는 전제의 구조 결정
- 임시 구조를 전제로 한 깊은 결합
- 미래 기능을 가정한 과도한 추상화

---

## 3️⃣ 수정 가능 범위 (Archive 내부)

AI는 아래 영역만 수정 가능하다.

### ✅ 허용 영역

- `/domains/archive/views/**`
- `/domains/archive/components/**`
- `/domains/archive/store/**`
- `/domains/archive/services/**`
- `/domains/archive/integration/**`

### ❌ 금지 영역

- `/system/schemas/**`
- `/engines/**`
- 다른 도메인 디렉터리
- frame / layout 구조

---

## 4️⃣ View 계층 규칙 (left / content / right)

- `views/left`
  → **네비게이션, 선택, 범위 지정**
- `views/content`
  → **핵심 작업 영역**
- `views/right`
  → **보조 정보, 상태, 컨텍스트**

### 규칙

- content는 절대 left/right에 의존하지 않는다
- right는 항상 선택적이어야 한다
- left/right는 content 로직을 직접 호출하지 않는다

---

## 5️⃣ Editor / Block 관련 핵심 규칙

### Blocks (`components/blocks/`)

- 하나의 블록 = 하나의 책임
- 블록은 **자기 자신 외의 블록 상태를 직접 참조하지 않는다**
- 블록 간 연결은:

  - store
  - service
    를 통해서만 가능

### 금지

- 블록 간 props 체인
- 블록 내부에서 문서 전체 상태 직접 조작

---

## 6️⃣ Templates (.json) 관련 규칙 (매우 중요)

### 구조

- layouts → “뼈대”
- blocks → “부품”
- logics → “규칙”

AI는 이 삼원 구조를 **절대 섞지 않는다**.

### 금지

- json 템플릿에 실행 코드 삽입
- 로직을 blocks 템플릿에 암시적으로 포함
- UI 구조를 logic으로 표현

---

## 7️⃣ Store 사용 규칙

- `useDocStore`
  → 문서 상태의 **유일한 진실**
- `useTabStore`
  → UI 컨텍스트 전용

### 금지

- View에서 문서 데이터 직접 가공
- Service에서 store를 직접 조작 (중개 계층 필수)

---

## 8️⃣ Service 계층 규칙

- services는 **의사결정과 조합만 담당**
- 렌더링 ❌
- UI 상태 ❌
- DOM 접근 ❌

Service는:

> “지금 이 사유가
> 어떤 실행으로 이어질 수 있는가”
> 만 판단한다.

---

## 9️⃣ Integration 규칙

- 외부 시스템과의 통신은 **integration 전담**
- View / Component에서 직접 API 호출 금지
- 임시 통신 코드 금지

---

## 🔟 Archive 전용 중단 신호 (AI Stop Rule)

아래 중 하나라도 해당하면 AI는 **즉시 중단하고 질문한다**.

- “이건 hub인가 editor인가 애매하다”
- “이 로직이 block에 있어야 할지 service에 있어야 할지 모르겠다”
- “schema를 새로 정의하고 싶다”
- “engine에 직접 로직을 추가하고 싶다”

---

## 🎯 Archive AGENTS.md 핵심 문장

> **Archive는 완성형 앱이 아니라
> 계속 확장될 ‘사유의 그릇’이다.
> AI는 그릇을 바꾸지 않고,
> 안에 들어갈 것만 만든다.**

---

## 🔚 한 줄 요약

> **지금 필요한 기능은 자유롭게 만들되
> 구조를 결정하는 선택은 절대 하지 않는다**

---
