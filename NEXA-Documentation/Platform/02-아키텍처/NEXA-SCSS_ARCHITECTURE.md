# SCSS 아키텍처 평가 및 확정

## 📋 제안된 SCSS 구조

| 레벨 | 카테고리         | 파일명(예시)                                                                                                                                                                                                                                  | 역할 및 성격                                                                                           | 허용 CSS 속성                                                                   | 제한 사항                                                                   | 개발 순서 | 주의점                                                                         |
| ---- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| 1    | Quasar 변수      | `quasar.variables.scss`                                                                                                                                                                                                                       | Quasar 프레임워크 기본 변수 오버라이드<br>전역 테마 색상, 폰트 크기, 여백 등 기본 스타일 변수 정의     | **SCSS 변수만** (`$variable: value;`)                                           | 실제 CSS 속성 작성 금지                                                     | 1단계     | 직접 건드릴 경우 전체 UI에 큰 영향<br>신중한 수정 필요                         |
| 2    | 유틸리티         | `utils/_mixins.scss`<br>`utils/_functions.scss`<br>`utils/_utilities.scss`                                                                                                                                                                    | 재사용 가능한 믹스인, 함수, 유틸리티 클래스 등<br>스타일 일관성 및 간결성 지원                         | **믹스인, 함수, 유틸리티 클래스**<br>모든 CSS 속성 허용 (재사용 목적)           | 특정 컴포넌트/뷰에 종속된 스타일 금지                                       | 2단계     | 복잡한 로직 및 중복 최소화 위해 체계적으로 관리<br>과도한 의존성 주의          |
| 3    | 전역 기본 스타일 | `app.scss`                                                                                                                                                                                                                                    | 애플리케이션 전역 기본 레이아웃, 폰트, 공통 스타일 정의<br>quasar.variables.scss 기반 전역 스타일 조정 | **전역 기본 스타일만**<br>폰트, 스크롤바, 기본 레이아웃, body/html 기본 스타일  | 색상 변수 정의 금지 (레벨 4에서 관리)<br>특정 컴포넌트 스타일 금지          | 3단계     | 전역 영향 범위가 넓어, 불필요한 스타일 충돌 조심                               |
| 4    | 테마별 SCSS      | `themes/dark.scss`<br>`themes/light.scss`<br>`themes/_variables.scss` (선택사항)                                                                                                                                                              | 다크모드, 라이트모드 등 테마별 색상 및 특화 스타일 관리<br>테마 전환 시 적용되는 스타일 유지           | **CSS 변수만** (`--variable: value;`)<br>색상 관련 변수만 정의                  | 실제 CSS 속성 작성 금지<br>레이아웃, 크기, 여백 등 비색상 속성 금지         | 1단계     | 테마별 변수, 클래스 명확히 구분, 혼용시 스타일 꼬임·사이 오류 주의             |
| 5    | NEXA 시스템      | `nexa-system/nexa-system.scss` (메인)<br>`nexa-system/_variables.scss`<br>`nexa-system/_item.scss`<br>`nexa-system/_card.scss`<br>`nexa-system/_table.scss`<br>`nexa-system/_list.scss`<br>`nexa-system/_chart.scss`                          | NEXA 프로젝트 특화 전역 스타일 정의<br>브랜딩 컬러, 시스템 공통 UI, 특수 클래스 포함                   | **NEXA 특화 스타일**<br>레이아웃, 애니메이션, 특수 클래스<br>CSS 변수 참조 사용 | 색상 값 직접 정의 금지 (레벨 4 변수 사용)<br>특정 모듈에 종속된 스타일 금지 | 4단계     | 전역에 부담 주지 않도록 사이드 이펙트 최소화<br>구성원간 스타일 규칙 공유 필요 |
| 6    | 모듈별 SCSS      | `components/parts-management/PartClassesView.scss`<br>`components/common/TableFilterBar.scss`<br>`components/common/TableActionsOverlay.scss`<br>`components/common/TableEmptyState.scss`<br>`components/common/views/DataTableRenderer.scss` | 모듈/페이지/컴포넌트 특화 스타일<br>scoped 스타일과 병행 사용 권장                                     | **모듈 특화 스타일**<br>모든 CSS 속성 허용                                      | 전역 스타일과 충돌 방지<br>NEXA 시스템 변수 우선 사용                       | 5단계     | 전역 스타일과 충돌/중복 방지<br>특정 모듈 의존성 최소화                        |

---

## 📝 파일명 규칙

### SCSS 파일명 규칙

#### 1. 언더바(\_) 사용 규칙

**언더바로 시작하는 파일 (`_filename.scss`):**

-   **Sass/SCSS Partial 파일**: 언더바로 시작하는 파일은 "partial"로 인식됨
-   **직접 컴파일되지 않음**: Sass 컴파일러가 이 파일을 별도로 CSS로 변환하지 않음
-   **@import 전용**: 다른 파일에서 `@import`로만 사용됨
-   **모듈화**: 재사용 가능한 스타일을 모듈화할 때 사용

**언더바 없이 시작하는 파일 (`filename.scss`):**

-   **메인 파일**: 직접 컴파일되어 CSS로 변환됨
-   **진입점**: `quasar.config.js`에서 직접 import하는 파일
-   **독립 실행**: 단독으로 사용되는 스타일 파일

**예시:**

```scss
// ✅ Partial 파일 (언더바 사용)
// _variables.scss - 다른 파일에서 import만 함
@import "variables"; // 언더바와 확장자 생략 가능

// ✅ 메인 파일 (언더바 없음)
// app.scss - quasar.config.js에서 직접 import
```

#### 2. 파일명 네이밍 컨벤션

**권장 규칙:**

1. **소문자 + 하이픈** (일반적 관례)

    - ✅ `quasar.variables.scss`
    - ✅ `nexa-system.scss`
    - ✅ `table-filter-bar.scss`

2. **대문자 시작** (프로젝트 내 일관성 유지 시 허용)

    - ✅ `PartClassesView.scss` (Vue 컴포넌트명과 일치)
    - ✅ `TableFilterBar.scss` (Vue 컴포넌트명과 일치)
    - ⚠️ 프로젝트 전체에서 일관성 유지 필요

3. **언더바 사용** (Partial 파일만)
    - ✅ `_variables.scss` (Partial)
    - ✅ `_mixins.scss` (Partial)
    - ✅ `_item.scss` (Partial)
    - ❌ `variables.scss` (Partial이 아닌 경우 언더바 불필요)

#### 3. 레벨별 파일명 규칙

| 레벨       | 파일명 패턴                                        | 예시                                           | 설명                                         |
| ---------- | -------------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| **레벨 1** | `quasar.variables.scss`                            | `quasar.variables.scss`                        | Quasar 변수 파일, 직접 import                |
| **레벨 2** | `_filename.scss`                                   | `_mixins.scss`, `_functions.scss`              | Partial 파일, import 전용                    |
| **레벨 3** | `app.scss`                                         | `app.scss`                                     | 메인 전역 파일, 직접 import                  |
| **레벨 4** | `theme-name.scss` 또는 `_variables.scss`           | `dark.scss`, `light.scss`, `_variables.scss`   | 테마 파일은 직접 import, 공통 변수는 partial |
| **레벨 5** | `nexa-system.scss` (메인), `_filename.scss` (부분) | `nexa-system.scss`, `_item.scss`, `_card.scss` | 메인은 직접 import, 부분은 partial           |
| **레벨 6** | `ComponentName.scss` 또는 `component-name.scss`    | `PartClassesView.scss`, `TableFilterBar.scss`  | Vue 컴포넌트명과 일치 권장                   |

#### 4. 대문자 사용에 대한 권장사항

**대문자 사용의 장점:**

-   ✅ **가독성 향상**: 파일명이 더 명확하게 구분됨
-   ✅ **Vue 컴포넌트와 일치**: `PartClassesView.vue` ↔ `PartClassesView.scss`
-   ✅ **IDE 자동완성**: 컴포넌트명과 일치하여 찾기 쉬움

**대문자 사용 시 주의사항:**

-   ⚠️ **일관성 유지**: 프로젝트 전체에서 동일한 규칙 적용 필요
-   ⚠️ **대소문자 구분**: 일부 운영체제/서버에서 대소문자 구분 (Linux)
-   ⚠️ **일반 관례와 다름**: CSS/SCSS는 보통 소문자+하이픈 사용

**권장 접근법:**

-   **레벨 1-5**: 소문자 + 하이픈 사용 (일반 관례)
-   **레벨 6**: Vue 컴포넌트명과 일치시키기 위해 대문자 시작 허용
    -   예: `PartClassesView.vue` → `PartClassesView.scss`
    -   예: `TableFilterBar.vue` → `TableFilterBar.scss`

#### 5. 파일명 규칙 요약

**Partial 파일 (언더바 사용):**

```
_변수명.scss
_mixins.scss
_functions.scss
_item.scss
_card.scss
```

**메인 파일 (언더바 없음):**

```
quasar.variables.scss
app.scss
dark.scss
light.scss
nexa-system.scss
```

**컴포넌트 파일 (Vue 컴포넌트명과 일치):**

```
PartClassesView.scss
TableFilterBar.scss
TableActionsOverlay.scss
DataTableRenderer.scss
```

**디렉토리 구조 예시:**

```
src/system/css/
├── quasar.variables.scss          (레벨 1: 메인)
├── utils/
│   ├── _mixins.scss               (레벨 2: Partial)
│   ├── _functions.scss            (레벨 2: Partial)
│   └── _utilities.scss            (레벨 2: Partial)
├── app.scss                       (레벨 3: 메인)
├── themes/
│   ├── dark.scss                  (레벨 4: 메인)
│   ├── light.scss                 (레벨 4: 메인)
│   └── _variables.scss            (레벨 4: Partial, 선택사항)
└── nexa-system/
    ├── nexa-system.scss           (레벨 5: 메인)
    ├── _variables.scss            (레벨 5: Partial)
    ├── _item.scss                 (레벨 5: Partial)
    ├── _card.scss                 (레벨 5: Partial)
    ├── _table.scss                (레벨 5: Partial)
    ├── _list.scss                 (레벨 5: Partial)
    └── _chart.scss                (레벨 5: Partial)

src/components/
├── parts-management/
│   └── PartClassesView.scss       (레벨 6: 컴포넌트명 일치)
└── common/
    ├── TableFilterBar.scss        (레벨 6: 컴포넌트명 일치)
    └── TableActionsOverlay.scss   (레벨 6: 컴포넌트명 일치)
```

#### 6. Import 규칙

**Partial 파일 import:**

```scss
// 언더바와 확장자 생략
@import "utils/mixins"; // _mixins.scss
@import "nexa-system/item"; // _item.scss
@import "themes/variables"; // _variables.scss
```

**메인 파일 import:**

```scss
// quasar.config.js에서
css:
  [ 'app.scss',
  // 직접 import
  'themes/light.scss',
  // 직접 import
  'themes/dark.scss',
  // 직접 import] // 다른 SCSS 파일에서
  @import 'nexa-system/nexa-system'; // nexa-system.scss (메인)
```

---

## 🚀 SCSS 개발 순서 및 원칙

### 개발 순서

SCSS 스타일 시스템을 구축할 때는 다음 순서를 따르는 것이 중요합니다:

#### 1단계: 변수 정의 (레벨 1, 4)

**프로젝트 시작 시 가장 먼저 설정**

-   **레벨 1**: `quasar.variables.scss`에서 Quasar 기본 변수 오버라이드
    -   폰트 크기, 여백, 기본 색상 등
-   **레벨 4**: `themes/dark.scss`, `themes/light.scss`에서 테마별 CSS 변수 정의
    -   색상 관련 변수만 정의
    -   모든 스타일의 기반이 되는 변수 설정

**이유:**

-   다른 모든 스타일이 이 변수들을 참조하므로 먼저 정의해야 함
-   변수가 없으면 스타일 작성 시 하드코딩하게 됨

**예시:**

```scss
// 레벨 1: quasar.variables.scss
$primary: #0076fd;
$font-size-base: 14px;

// 레벨 4: themes/dark.scss
body.dark {
    --nexa-primary: #00d4ff;
    --nexa-background: #1e1e1e;
    --nexa-text-primary: #ffffff;
}
```

#### 2단계: 도구 개발 (레벨 2)

**공통으로 사용될 믹스인, 함수, 유틸리티 클래스 개발**

-   `utils/_mixins.scss`: 재사용 가능한 믹스인
-   `utils/_functions.scss`: SCSS 함수
-   `utils/_utilities.scss`: 유틸리티 클래스

**이유:**

-   반복되는 스타일 패턴을 도구로 만들어 재사용
-   코드 중복 최소화 및 일관성 유지

**예시:**

```scss
// utils/_mixins.scss
@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

@mixin nexa-card-base {
    border-radius: 6px;
    box-shadow: none;
    transition: background-color 0.1s ease, border-color 0.2s ease;
}
```

#### 3단계: 전역 기반 마련 (레벨 3)

**애플리케이션의 뼈대와 기본 스타일 설정**

-   `app.scss`에서 전역 기본 스타일 정의
-   폰트, 스크롤바, body/html 기본 스타일
-   레벨 1, 4의 변수를 활용

**이유:**

-   모든 페이지와 컴포넌트에 적용되는 기본 스타일
-   일관된 사용자 경험 제공

**예시:**

```scss
// app.scss
body {
    font-family: "Pretendard", sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--nexa-background);
    color: var(--nexa-text-primary);
}

::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
```

#### 4단계: 브랜딩 확립 (레벨 5)

**NEXA 시스템 고유의 디자인 언어 적용**

-   `nexa-system/` 디렉토리에서 NEXA 특화 스타일 정의
-   레벨 4의 CSS 변수를 참조하여 사용
-   레이아웃, 애니메이션, 특수 클래스 등

**이유:**

-   프로젝트 고유의 디자인 시스템 구축
-   전역적으로 사용되는 NEXA 스타일 정의

**예시:**

```scss
// nexa-system/_item.scss
.nexa-item {
    background-color: var(--nexa-item-bg);
    border: 1px solid var(--nexa-item-border);
    transition: background-color 0.2s ease;

    &:hover {
        background-color: var(--nexa-item-hover-bg);
    }
}
```

#### 5단계: 컴포넌트 개발 (레벨 6)

**각 Vue 컴포넌트의 특화 스타일 적용**

-   `.vue` 파일 내 `<style scoped>` 사용
-   필요시 `::v-deep` 활용
-   모듈별 전용 SCSS 파일 사용

**이유:**

-   컴포넌트별 특화 스타일 적용
-   전역 스타일과의 충돌 방지

**예시:**

```vue
<template>
    <div class="my-component">...</div>
</template>

<style scoped>
.my-component {
    display: flex;
    flex-direction: column;

    // NEXA 변수 우선 사용
    background-color: var(--nexa-background);

    // 필요시 ::v-deep 사용 (신중하게)
    ::v-deep(.q-btn) {
        // Quasar 컴포넌트 내부 스타일 조정
    }
}
</style>
```

### 개발 원칙

#### 원칙 1: 전역 오버라이드 최소화

**Quasar 컴포넌트 스타일 조절 방법 우선순위:**

1. **Props 사용** (최우선)

    ```vue
    <q-btn color="primary" size="lg" />
    ```

2. **Slots 사용**

    ```vue
    <q-btn>
      <template #default>커스텀 내용</template>
    </q-btn>
    ```

3. **변수 사용** (레벨 1, 4)

    ```scss
    // quasar.variables.scss
    $primary: #0076fd;

    // themes/dark.scss
    body.dark {
        --nexa-primary: #00d4ff;
    }
    ```

4. **NEXA 시스템 변수** (레벨 5)

    ```scss
    // nexa-system/_variables.scss
    --nexa-button-primary-bg: var(--nexa-primary);
    ```

5. **직접 오버라이드** (최후의 수단)
    ```scss
    // ❌ 가능한 피하기
    .q-btn {
        background-color: #0076fd !important;
    }
    ```

**이유:**

-   Quasar 컴포넌트의 `.q-*` 클래스를 직접 오버라이드하면:
    -   Quasar 업데이트 시 스타일 깨짐 위험
    -   유지보수 어려움
    -   일관성 저하

#### 원칙 2: 변수 우선 사용

**색상, 크기, 여백 등은 변수로 관리**

```scss
// ✅ 좋은 예
.nexa-item {
    background-color: var(--nexa-item-bg);
    padding: var(--nexa-spacing-medium);
    border-radius: var(--nexa-border-radius);
}

// ❌ 나쁜 예
.nexa-item {
    background-color: #3d3d3d;
    padding: 16px;
    border-radius: 8px;
}
```

**이유:**

-   테마 전환 시 자동 적용
-   일관성 유지
-   유지보수 용이

#### 원칙 3: 레벨별 책임 분리

**각 레벨은 자신의 역할만 수행**

```scss
// ✅ 레벨 4: 색상 변수만 정의
body.dark {
    --nexa-primary: #00d4ff;
}

// ✅ 레벨 5: 변수 사용하여 스타일 정의
.nexa-item {
    background-color: var(--nexa-item-bg);
    padding: 16px; // 레이아웃은 레벨 5에서
}

// ❌ 레벨 4에서 레이아웃 정의 금지
body.dark {
    --nexa-primary: #00d4ff;
    padding: 16px; // ❌ 금지
}
```

#### 원칙 4: Scoped 스타일 우선

**컴포넌트 스타일은 scoped 사용**

```vue
<template>
    <div class="my-component">...</div>
</template>

<style scoped>
.my-component {
    // 컴포넌트 특화 스타일
}
</style>
```

**이유:**

-   전역 스타일과의 충돌 방지
-   컴포넌트 독립성 유지

#### 원칙 5: ::v-deep 신중 사용

**필요시에만 사용, 최소한으로**

```vue
<style scoped>
// ✅ 필요한 경우만
.my-component ::v-deep(.q-btn) {
    // Quasar 컴포넌트 내부 스타일 조정
}

// ❌ 가능한 피하기
.my-component ::v-deep(*) {
    // 모든 하위 요소에 적용
}
</style>
```

**이유:**

-   `::v-deep`는 스타일 캡슐화를 깨뜨림
-   과도한 사용 시 유지보수 어려움

### 개발 체크리스트

**프로젝트 시작 시:**

-   [ ] 레벨 1: `quasar.variables.scss` 기본 변수 설정
-   [ ] 레벨 4: `themes/dark.scss`, `themes/light.scss` 색상 변수 정의
-   [ ] 레벨 2: 공통 믹스인, 함수, 유틸리티 개발
-   [ ] 레벨 3: `app.scss` 전역 기본 스타일 설정
-   [ ] 레벨 5: NEXA 시스템 스타일 정의

**컴포넌트 개발 시:**

-   [ ] Props로 스타일 조절 가능한지 확인
-   [ ] Slots로 커스터마이징 가능한지 확인
-   [ ] 변수로 해결 가능한지 확인
-   [ ] Scoped 스타일 사용
-   [ ] NEXA 시스템 변수 우선 사용
-   [ ] 전역 오버라이드 최소화

---

## 📐 CSS 속성 제한 규정 상세

### 레벨별 허용/제한 매트릭스

| CSS 속성 카테고리                      | 레벨 1 | 레벨 2 | 레벨 3 | 레벨 4 | 레벨 5 | 레벨 6 |
| -------------------------------------- | ------ | ------ | ------ | ------ | ------ | ------ |
| **SCSS 변수** (`$var`)                 | ✅     | ✅     | ❌     | ❌     | ❌     | ✅     |
| **CSS 변수** (`--var`)                 | ❌     | ❌     | ❌     | ✅     | ✅     | ✅     |
| **색상 값** (직접 정의)                | ❌     | ✅\*   | ❌     | ❌     | ❌     | ✅     |
| **색상 값** (변수 사용)                | ❌     | ✅     | ✅     | ❌     | ✅     | ✅     |
| **레이아웃** (display, flex, grid 등)  | ❌     | ✅     | ✅     | ❌     | ✅     | ✅     |
| **크기** (width, height, font-size 등) | ✅\*   | ✅     | ✅     | ❌     | ✅     | ✅     |
| **여백** (margin, padding)             | ✅\*   | ✅     | ✅     | ❌     | ✅     | ✅     |
| **애니메이션** (transition, animation) | ❌     | ✅     | ✅     | ❌     | ✅     | ✅     |
| **전역 기본 스타일** (body, html 등)   | ❌     | ❌     | ✅     | ❌     | ❌     | ❌     |
| **특정 컴포넌트 스타일**               | ❌     | ❌     | ❌     | ❌     | ❌     | ✅     |

\* 레벨 1: SCSS 변수로만 정의, 레벨 2: 믹스인/함수 내에서 허용

### 규정 적용 예시

#### ✅ 올바른 예시

```scss
// 레벨 1: quasar.variables.scss
$primary: #0076fd; // ✅ SCSS 변수만

// 레벨 4: themes/dark.scss
body.dark {
    --nexa-primary: #00d4ff; // ✅ CSS 변수만 (색상)
}

// 레벨 5: nexa-system/_item.scss
.nexa-item {
    background-color: var(--nexa-item-bg); // ✅ 레벨 4 변수 사용
    padding: 8px; // ✅ 레이아웃 속성
    transition: background-color 0.2s ease; // ✅ 애니메이션
}

// 레벨 6: components/MyComponent.scss
.my-component {
    display: flex; // ✅ 모듈 특화 스타일
    background-color: var(--nexa-primary); // ✅ NEXA 변수 사용 권장
}
```

#### ❌ 잘못된 예시

```scss
// 레벨 1: quasar.variables.scss
body {
    color: #0076fd; // ❌ 실제 CSS 속성 금지
}

// 레벨 4: themes/dark.scss
body.dark {
    background-color: #1e1e1e; // ❌ 실제 CSS 속성 금지
    font-size: 14px; // ❌ 비색상 속성 금지
    --nexa-padding: 16px; // ❌ 색상이 아닌 변수 금지
}

// 레벨 5: nexa-system/_item.scss
.nexa-item {
    background-color: #3d3d3d; // ❌ 직접 색상 정의 금지 (변수 사용)
}

// 레벨 3: app.scss
body {
    --nexa-primary: #0076fd; // ❌ 색상 변수는 레벨 4에서
}
```

### 규정의 장점

1. **명확한 책임 분리**

    - 각 레벨의 역할이 명확해짐
    - 실수로 잘못된 위치에 스타일 작성 방지

2. **유지보수성 향상**

    - 색상 변경 시 레벨 4만 수정하면 됨
    - 레이아웃 변경 시 해당 레벨만 수정

3. **일관성 보장**

    - 모든 개발자가 동일한 규칙 따름
    - 코드 리뷰 시 규정 위반 쉽게 발견

4. **테마 전환 안정성**
    - 레벨 4에서만 색상 관리
    - 테마 전환 시 충돌 최소화

---

## 🔍 현재 프로젝트 구조 분석

### 현재 파일 구조

```
src/css/
├── quasar.variables.scss          ✅ 레벨 1
├── app.scss                       ✅ 레벨 3
├── themes/
│   ├── dark.scss                  ✅ 레벨 4
│   └── light.scss                 ✅ 레벨 4
├── nexa-item.scss                 ⚠️ 레벨 5 (분산)
├── nexa-card-features.scss         ⚠️ 레벨 5 (분산)
├── nexa-table-features.scss        ⚠️ 레벨 5 (분산)
└── nexa-list-features.scss        ⚠️ 레벨 5 (분산)

src/components/
├── parts-management/
│   └── PartClassesView.scss       ✅ 레벨 6
└── common/
    ├── TableFilterBar.scss         ✅ 레벨 6
    └── TableActionsOverlay.scss    ✅ 레벨 6
```

### 현재 구조의 문제점

1. **레벨 2 부재**: `utils.scss`, `mixins.scss`가 없음

    - 재사용 가능한 믹스인과 함수가 각 파일에 분산
    - 중복 코드 발생 가능성

2. **레벨 5 분산**: NEXA 특화 스타일이 여러 파일로 분산

    - `nexa-item.scss`: 아이템 공통 스타일
    - `nexa-card-features.scss`: 카드 뷰 특화
    - `nexa-table-features.scss`: 테이블 뷰 특화
    - `nexa-list-features.scss`: 리스트 뷰 특화
    - 통합 관리 어려움

3. **의존성 관리**: `@import` 사용으로 인한 순환 참조 위험
    - `nexa-card-features.scss` → `nexa-item.scss`
    - `nexa-table-features.scss` → `nexa-item.scss`

---

## ✅ 제안된 구조 평가

### 장점

1. **명확한 계층 구조**

    - 각 레벨의 역할이 명확히 구분됨
    - 유지보수 및 확장이 용이

2. **재사용성 향상**

    - 레벨 2 (utils, mixins)로 공통 로직 중앙화
    - 코드 중복 최소화

3. **테마 관리 개선**

    - 레벨 4에서 테마별 스타일 명확히 분리
    - 테마 전환 시 충돌 최소화

4. **모듈화**
    - 레벨 6에서 모듈별 스타일 독립 관리
    - 전역 스타일과의 충돌 방지

### 개선 제안

#### 1. 레벨 2 추가 (utils.scss, mixins.scss)

**필요성:** ⭐⭐⭐⭐⭐ (매우 높음)

**추가할 내용:**

-   믹스인: 반응형 브레이크포인트, 플렉스 레이아웃, 트랜지션 등
-   함수: 색상 조작, 단위 변환 등
-   유틸리티 클래스: 공통으로 사용되는 유틸리티

**예시:**

```scss
// src/css/utils/_mixins.scss
@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

@mixin nexa-card-base {
    border-radius: 6px;
    box-shadow: none;
    transition: background-color 0.1s ease, border-color 0.2s ease;
}

// src/css/utils/_functions.scss
@function nexa-color($color-name, $opacity: 1) {
    @return rgba(var(--nexa-#{$color-name}), $opacity);
}
```

#### 2. 레벨 5 통합 전략

**옵션 A: 단일 파일 통합** (권장하지 않음)

-   모든 NEXA 스타일을 `nexa-system.scss` 하나로 통합
-   파일이 너무 커질 수 있음
-   유지보수 어려움

**옵션 B: 기능별 분리 유지** (권장)

-   현재 구조 유지하되, 명확한 네이밍과 구조화
-   `nexa-system/` 디렉토리로 그룹화
-   각 파일의 역할 명확히 정의

**제안 구조:**

```
src/css/nexa-system/
├── _variables.scss        // NEXA CSS 변수 정의
├── _item.scss             // 아이템 공통 스타일
├── _card.scss             // 카드 뷰 특화
├── _table.scss            // 테이블 뷰 특화
├── _list.scss             // 리스트 뷰 특화
└── nexa-system.scss       // 메인 파일 (모든 파일 import)
```

#### 3. Import 순서 및 의존성 관리

**권장 Import 순서:**

```scss
// 1. Quasar 변수
@import "quasar.variables";

// 2. Utils (믹스인, 함수)
@import "utils/mixins";
@import "utils/functions";

// 3. 테마 변수
@import "themes/light";
@import "themes/dark";

// 4. NEXA 시스템
@import "nexa-system/nexa-system";

// 5. 전역 스타일
@import "app";
```

---

## 🎯 최종 확정 구조

### 디렉토리 구조

```
src/css/
├── quasar.variables.scss          // 레벨 1: Quasar 변수 오버라이드
├── utils/                         // 레벨 2: 재사용 가능한 유틸리티
│   ├── _mixins.scss
│   ├── _functions.scss
│   └── _utilities.scss
├── app.scss                       // 레벨 3: 전역 기본 스타일
├── themes/                        // 레벨 4: 테마별 스타일
│   ├── _variables.scss            // 공통 테마 변수 (선택사항)
│   ├── light.scss
│   └── dark.scss
├── nexa-system/                   // 레벨 5: NEXA 프로젝트 특화
│   ├── _variables.scss            // NEXA CSS 변수 정의
│   ├── _item.scss                 // 아이템 공통 스타일
│   ├── _card.scss                 // 카드 뷰 특화
│   ├── _table.scss                // 테이블 뷰 특화
│   ├── _list.scss                 // 리스트 뷰 특화
│   ├── _chart.scss                // 차트 뷰 특화 (신규)
│   └── nexa-system.scss           // 메인 파일 (모든 파일 import)
└── modules/                       // 레벨 6: 모듈별 전용 (선택사항)
    └── (컴포넌트별 SCSS는 컴포넌트 디렉토리에 위치)
```

### 파일 역할 정의

#### 레벨 1: `quasar.variables.scss`

-   **역할**: Quasar 프레임워크 기본 변수 오버라이드
-   **허용**: SCSS 변수만 (`$variable: value;`)
-   **제한**: 실제 CSS 속성 작성 금지
-   **수정 원칙**: 최소한의 변경만, 전체 UI 영향 고려

**예시:**

```scss
// ✅ 허용
$primary: #0076fd;
$secondary: #00f2ff;
$font-size-base: 14px;

// ❌ 금지
body {
    color: #0076fd; // 실제 CSS 속성은 레벨 3에서
}
```

#### 레벨 2: `utils/`

-   **역할**: 재사용 가능한 믹스인, 함수, 유틸리티 클래스
-   **허용**: 모든 CSS 속성 (재사용 목적)
-   **제한**: 특정 컴포넌트/뷰에 종속된 스타일 금지

-   **`_mixins.scss`**: 재사용 가능한 믹스인
    -   레이아웃 믹스인 (flex-center, grid-layout 등)
    -   애니메이션 믹스인 (fade-in, slide 등)
    -   반응형 믹스인 (breakpoint 등)
-   **`_functions.scss`**: SCSS 함수
    -   색상 조작 함수
    -   단위 변환 함수
-   **`_utilities.scss`**: 유틸리티 클래스
    -   공통으로 사용되는 유틸리티 클래스

**예시:**

```scss
// ✅ 허용
@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

// ❌ 금지
.my-specific-component {
    // 특정 컴포넌트 스타일은 레벨 6에서
}
```

#### 레벨 3: `app.scss`

-   **역할**: 애플리케이션 전역 기본 스타일
-   **허용**: 전역 기본 스타일만
    -   폰트, 스크롤바, 기본 레이아웃
    -   body/html 기본 스타일
-   **제한**:
    -   색상 변수 정의 금지 (레벨 4에서 관리)
    -   특정 컴포넌트 스타일 금지
-   **주의**: 전역 영향 범위가 넓으므로 신중하게 수정

**예시:**

```scss
// ✅ 허용
body {
    font-family: "Pretendard", sans-serif;
    margin: 0;
    padding: 0;
}

::-webkit-scrollbar {
    width: 8px;
}

// ❌ 금지
body {
    background-color: #1e1e1e; // 색상은 레벨 4 CSS 변수 사용
}

.my-component {
    // 특정 컴포넌트는 레벨 6에서
}
```

---

### ⚠️ **중요 주의사항: 프레임워크 특성 이해**

#### 🔴 **Quasar 모달(Dialog) CSS 셀렉터**

**핵심 사항:**

-   Quasar의 `q-dialog`는 **포털(Portal) 렌더링**으로 `body`의 직접 자식으로 배치됨
-   전역 스타일(`app.scss`)에서는 일반 선택자로도 모달 내부 요소에 자동 적용됨
-   컴포넌트의 scoped 스타일은 모달 내부에 적용되지 않을 수 있음

**실제 경험:**

-   초기에는 `body .q-dialog` 선택자를 사용했지만, 전역 스타일이므로 불필요
-   실제 DOM 구조를 확인하여 정확한 클래스명 사용
-   점진적 단순화: 복잡한 선택자로 시작 → 테스트 → 단순화

**예시:**

```scss
// app.scss (레벨 3) - 전역 스타일이므로 모달 내부에도 자동 적용
.q-checkbox__bg {
    background: transparent !important;
}

.q-slider__text {
    color: var(--nexa-text-primary) !important;
}
```

**주의사항:**

-   브라우저 개발자 도구로 실제 DOM 구조 확인 필수
-   프레임워크 문서의 클래스명과 실제 DOM이 다를 수 있음
-   `!important`는 Quasar 기본 스타일 오버라이드를 위해 필요

---

#### 레벨 4: `themes/`

-   **역할**: 테마별 색상 변수 정의
-   **허용**: CSS 변수만 (`--variable: value;`)
    -   색상 관련 변수만 정의
-   **제한**:
    -   실제 CSS 속성 작성 금지
    -   레이아웃, 크기, 여백 등 비색상 속성 금지
-   **주의**: 테마별 변수 명확히 구분, 혼용 금지

-   **`light.scss`**: 라이트 테마 CSS 변수 정의
-   **`dark.scss`**: 다크 테마 CSS 변수 정의
-   **`_variables.scss`**: 공통 테마 변수 (선택사항)

**예시:**

```scss
// ✅ 허용
body.dark {
    --nexa-primary: #00d4ff;
    --nexa-background: #1e1e1e;
    --nexa-text-primary: #ffffff;
}

// ❌ 금지
body.dark {
    background-color: #1e1e1e; // 실제 CSS 속성은 레벨 3, 5에서
    font-size: 14px; // 크기는 레벨 1, 3에서
    padding: 16px; // 여백은 레벨 3, 5에서
}
```

#### 레벨 5: `nexa-system/`

-   **역할**: NEXA 프로젝트 특화 전역 스타일
-   **허용**: NEXA 특화 스타일
    -   레이아웃, 애니메이션, 특수 클래스
    -   CSS 변수 참조 사용 (`var(--nexa-*)`)
-   **제한**:

    -   색상 값 직접 정의 금지 (레벨 4 변수 사용)
    -   특정 모듈에 종속된 스타일 금지

-   **`_variables.scss`**: NEXA CSS 변수 정의 (테마 파일에서 사용)
-   **`_item.scss`**: 모든 뷰에서 공통으로 사용하는 아이템 스타일
-   **`_card.scss`**: 카드 뷰 특화 스타일 (레이아웃, 애니메이션 등)
-   **`_table.scss`**: 테이블 뷰 특화 스타일
-   **`_list.scss`**: 리스트 뷰 특화 스타일
-   **`_chart.scss`**: 차트 뷰 특화 스타일 (신규, D3.js 차트용)
-   **`nexa-system.scss`**: 메인 파일, 모든 파일을 순서대로 import

**예시:**

```scss
// ✅ 허용
.nexa-item {
    background-color: var(--nexa-item-bg); // 레벨 4 변수 사용
    border: 1px solid var(--nexa-item-border);
    transition: background-color 0.2s ease;
}

// ❌ 금지
.nexa-item {
    background-color: #3d3d3d; // 직접 색상 정의 금지
}

.my-specific-module {
    // 특정 모듈 스타일은 레벨 6에서
}
```

#### 레벨 6: 모듈별 전용 SCSS

-   **역할**: 모듈/페이지/컴포넌트 특화 스타일
-   **허용**: 모듈 특화 스타일, 모든 CSS 속성 허용
-   **제한**:
    -   전역 스타일과 충돌 방지
    -   NEXA 시스템 변수 우선 사용
-   **위치**: 컴포넌트 디렉토리에 위치 (`src/components/**/*.scss`)
-   **주의**: scoped 스타일과 병행 사용, 전역 스타일과 충돌 방지

**예시:**

```scss
// ✅ 허용
.parts-management-view {
    // 모듈 특화 레이아웃
    display: flex;
    flex-direction: column;

    .custom-button {
        // 모듈 특화 버튼 스타일
        background-color: var(--nexa-primary); // NEXA 변수 사용 권장
    }
}
```

---

## 📝 마이그레이션 계획

### Phase 1: 레벨 2 추가 (차트 뷰 전)

1. `src/css/utils/` 디렉토리 생성
2. `_mixins.scss` 생성 및 공통 믹스인 이동/추가
3. `_functions.scss` 생성 및 공통 함수 추가
4. `_utilities.scss` 생성 (필요 시)

### Phase 2: 레벨 5 재구조화 (차트 뷰 전)

1. `src/css/nexa-system/` 디렉토리 생성
2. 기존 `nexa-*.scss` 파일들을 `nexa-system/`으로 이동 및 리네임
3. `nexa-system.scss` 메인 파일 생성 및 import 순서 정의
4. `quasar.config.js`에서 import 경로 업데이트

### Phase 3: 차트 뷰 스타일 추가

1. `nexa-system/_chart.scss` 생성
2. D3.js 차트용 스타일 정의
3. `nexa-system.scss`에 import 추가

### Phase 4: 기존 파일 정리 (선택사항)

1. 중복 코드 제거
2. import 순서 최적화
3. 문서화

---

## 🎨 차트 뷰 스타일 전략

### D3.js 차트용 스타일 구조

```scss
// src/css/nexa-system/_chart.scss

// ============================================
// D3.js 차트 공통 스타일
// ============================================

// 차트 컨테이너
.nexa-chart-container {
    width: 100%;
    height: 100%;
    background: var(--nexa-background);
    border-radius: 8px;
    padding: 16px;
}

// 차트 SVG 스타일
.nexa-chart-svg {
    background: var(--nexa-background);
    border-radius: 8px;
}

// 차트 그리드 스타일
.nexa-chart-grid {
    stroke: var(--nexa-surface);
    stroke-width: 1;
    stroke-dasharray: 3, 3;
    opacity: 0.5;
}

// 차트 축 스타일
.nexa-chart-axis {
    color: var(--nexa-text-secondary);
    font-size: 12px;
    font-family: "Roboto", sans-serif;
}

// 차트 툴팁 스타일
.nexa-chart-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: var(--nexa-text-primary);
    padding: 8px 12px;
    border-radius: 4px;
    pointer-events: none;
    font-size: 12px;
    z-index: 1000;
}

// 차트 범례 스타일
.nexa-chart-legend {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: var(--nexa-surface);
    border-radius: 0 0 8px 8px;
}

.nexa-chart-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
}

.nexa-chart-legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}
```

### 차트 뷰 테마 변수 추가

```scss
// src/css/themes/dark.scss에 추가
body.dark {
    // ... 기존 변수들 ...

    // 차트 뷰 색상
    --nexa-chart-primary: #00d4ff;
    --nexa-chart-secondary: #7b68ee;
    --nexa-chart-accent: #ff6b6b;
    --nexa-chart-grid: #2a2a2a;
    --nexa-chart-text: #ffffff;
    --nexa-chart-text-secondary: #b0b0b0;
}

// src/css/themes/light.scss에 추가
body:not(.dark) {
    // ... 기존 변수들 ...

    // 차트 뷰 색상
    --nexa-chart-primary: #0076fd;
    --nexa-chart-secondary: #00f2ff;
    --nexa-chart-accent: #ff6a00;
    --nexa-chart-grid: #e0e0e0;
    --nexa-chart-text: #6f6f6f;
    --nexa-chart-text-secondary: #949494;
}
```

---

## ✅ 최종 평가 및 확정

### 평가 결과

| 항목            | 평가       | 비고                             |
| --------------- | ---------- | -------------------------------- |
| **구조 명확성** | ⭐⭐⭐⭐⭐ | 각 레벨의 역할이 명확히 구분됨   |
| **확장성**      | ⭐⭐⭐⭐⭐ | 새로운 뷰/모듈 추가가 용이함     |
| **유지보수성**  | ⭐⭐⭐⭐⭐ | 체계적인 구조로 유지보수 용이    |
| **재사용성**    | ⭐⭐⭐⭐   | 레벨 2 추가 시 재사용성 향상     |
| **성능**        | ⭐⭐⭐⭐   | 적절한 import 순서로 최적화 가능 |

### 확정 사항

1. ✅ **6단계 레벨 구조 채택**
2. ✅ **레벨 2 (utils) 추가** - 차트 뷰 전에 구현
3. ✅ **레벨 5 (nexa-system) 재구조화** - 기능별 분리 유지, 디렉토리로 그룹화
4. ✅ **차트 뷰 스타일** - `nexa-system/_chart.scss`로 추가
5. ✅ **Import 순서 정의** - 의존성 관리 명확화

### 다음 단계

1. **레벨 2 추가** (차트 뷰 전)

    - `src/css/utils/` 디렉토리 생성
    - 기본 믹스인 및 함수 추가

2. **레벨 5 재구조화** (차트 뷰 전)

    - `src/css/nexa-system/` 디렉토리 생성
    - 기존 파일 이동 및 리네임

3. **차트 뷰 스타일 추가**
    - `nexa-system/_chart.scss` 생성
    - D3.js 차트용 스타일 정의

---

**작성일:** 차트 뷰 구현 전  
**목적:** SCSS 아키텍처 평가 및 확정  
**다음 단계:** 레벨 2 추가 및 레벨 5 재구조화
