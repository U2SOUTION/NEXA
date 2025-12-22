# NEXA 테마 가이드

## 📋 개요

이 문서는 NEXA 플랫폼의 테마 색상 시스템에 대한 가이드입니다.

---

## ⚠️ 중요 사항

### 테마 개발 전략

**현재 개발 방향:**

- **다크 테마 중심 개발**: 다크 테마를 기준으로 구조와 네이밍을 확정
- **라이트 테마는 색상만 조정**: 라이트 테마는 다크 테마와 동일한 변수 구조를 유지하며, 색상 값만 나중에 조정하여 완성도를 높일 예정
- **네이밍 일관성 우선**: 두 테마 간 변수명은 완전히 동일하게 유지

**이유:**

- 다크 테마를 먼저 탄탄하게 구성하여 전체 구조를 확정
- 라이트 테마는 구조가 확정된 후 색상만 조정하면 되므로 효율적
- 네이밍 일관성을 통해 코드 가독성 및 유지보수성 향상

### 브랜드 색상 (Accent) 설계 의도

**`--nexa-accent` 색상:**

- 다크 테마: `#ff7300`
- 라이트 테마: `#ff6a00`

**설계 의도:**

- 두 테마에서 의도적으로 비슷한 색상으로 설정
- 브랜드 일관성 유지 및 사용자 인지 일관성 확보

### 디자인 철학

**전체적인 디자인 원칙:**

- **시각적 안정성**: 일관된 색상 체계로 사용자에게 안정적인 시각적 경험 제공
- **통일성**: 모든 UI 요소가 동일한 디자인 언어를 따르도록 통일된 색상 시스템 유지
- **선택적 칼라 엑센트**: 꼭 필요한 곳에만 칼라 엑센트를 부여하여 시각적 피로 최소화 및 중요 요소 강조

**적용 예시:**

- 대부분의 UI 요소는 중립적이고 통일된 색상 사용
- 중요한 액션, 상태 변화, 강조가 필요한 요소에만 브랜드 색상 또는 엑센트 색상 적용
- 예: 버튼의 primary 색상, 포커스 상태, 선택된 항목 등

**참고:**

- 다크 테마의 테이블 헤더 색상 (`--nexa-table-header-bg: #ff000042`)은 의도적 실험적 색상입니다.
- 최종 디자인 완성 시 적절한 색상으로 조정될 예정입니다.

### 테이블 Striped 적용 원칙 (⚠️ 필수 준수)

> **⚠️ 중요**: 테이블 striped는 **기본적으로 비활성화**되어 있으며, **로우가 10개 이상일 때만 자동으로 적용**됩니다.

**적용 원칙:**

1. **로우가 10개 미만**: striped **절대 적용 안 함**
2. **로우가 10개 이상**: striped **자동 적용**
3. **모든 테이블 타입에 동일 적용**: 
   - `DataTableRenderer`: `rows.length >= 10`일 때 자동 적용
   - 마크다운 테이블: `dataLines.length >= 10`일 때 자동 적용

**⚠️ 주의사항:**

- **절대 기본값으로 striped를 활성화하지 말 것**: 가독성 저하 및 멀티 셀렉터 충돌 발생
- **로우 개수 체크 필수**: 새로운 테이블 컴포넌트 추가 시 반드시 로우 개수 체크 로직 포함
- **마크다운 테이블도 동일한 원칙**: 마크다운 파서에서도 로우 개수 체크 후 조건부 적용

**이유:**

- 가독성 문제: 로우가 적을 때 striped는 오히려 가독성을 떨어뜨림
- 멀티 셀렉터 충돌: 선택된 행과 striped 배경이 겹쳐 시각적 혼란 발생
- 로우가 많을 때만 유용: 많은 데이터에서 행 구분을 위해 striped가 도움됨

---

## 📁 파일 구조

```
src/css/themes/
├── dark.scss      # 다크 테마 변수 (기준)
└── light.scss     # 라이트 테마 변수 (색상만 조정 예정)
```

---

## 🎨 색상 변수 구조

### 1. 브랜드 색상 (primary, secondary, accent)

**변수명:**

- `--nexa-primary`: 주요 브랜드 색상
- `--nexa-secondary`: 보조 브랜드 색상
- `--nexa-accent`: 강조 색상 (의도적으로 비슷한 색상)

**용도:**

- 브랜드 아이덴티티 표현
- 주요 UI 요소 강조

---

### 2. 텍스트 색상 (text-\*)

**변수명:**

- `--nexa-text-primary`: 기본 텍스트 색상
- `--nexa-text-primary-hover`: 호버 상태 텍스트 색상
- `--nexa-text-primary-active`: 클릭 상태 텍스트 색상
- `--nexa-text-primary-focus`: 포커스 상태 텍스트 색상
- `--nexa-text-secondary`: 보조 텍스트 색상
- `--nexa-text-hint`: 힌트 텍스트 색상 (매우 흐린 색상)
- `--nexa-ui-primary`: UI 요소용 색상 (보더, 배경 등)

**경고/에러 색상:**

- `--nexa-warning`: 경고 색상
- `--nexa-error`: 에러 색상
- `--nexa-error-text`: 에러 텍스트 색상

**용도:**

- 모든 텍스트 요소의 색상 통일 관리
- 상태별 텍스트 색상 제공

---

### 3. 배경색 (background, surface)

**변수명:**

- `--nexa-background`: 기본 배경색
- `--nexa-background-upper`: 상단 배경색
- `--nexa-background-lower`: 하단 배경색
- `--nexa-background-darker`: 더 어두운 배경색 (드로어 구분선용)
- `--nexa-surface`: 표면 배경색 (컨텍스트 메뉴 등)
- `--nexa-surface-hover`: 호버 상태 표면 배경색
- `--nexa-surface-active`: 클릭 상태 표면 배경색
- `--nexa-surface-focus`: 포커스 상태 표면 배경색
- `--nexa-header-bg`: 헤더 배경색
- `--nexa-panel-header`: 패널/메뉴 헤더 배경색
- `--nexa-border-color`: 구분선 색상
- `--nexa-border-color-darker`: 더 어두운 구분선 색상

**그림자 색상 (범용 사용):**

- `--nexa-shadow-1`: 첫 번째 그림자 레이어
- `--nexa-shadow-2`: 두 번째 그림자 레이어
- `--nexa-shadow-3`: 세 번째 그림자 레이어
- 카드, 드로어, 모달 등 다양한 UI 요소에서 범용적으로 사용 가능

**테이블 색상:**

- `--nexa-table-bg`: 테이블 배경색
- `--nexa-table-header-bg`: 테이블 헤더 배경색
- `--nexa-table-header-text`: 테이블 헤더 텍스트 색상
- `--nexa-table-border`: 테이블 보더 색상
- `--nexa-table-cell-border`: 테이블 셀 보더 색상
- `--nexa-table-text`: 테이블 텍스트 색상
- `--nexa-table-row-hover-bg`: 테이블 행 호버 배경색
- `--nexa-table-row-selected-bg`: 테이블 행 선택 배경색
- `--nexa-table-row-striped-bg`: 테이블 행 스트라이프 배경색
  - ⚠️ **선택적 사용**: 기본 비활성화, 로우가 10개 이상일 때만 자동 적용
  - ⚠️ **적용 원칙**: DataTableRenderer와 마크다운 테이블 모두 동일한 원칙 적용 (로우 10개 이상)

**셀렉트 메뉴 색상:**

- `--nexa-select-menu-bg`: 드롭다운 메뉴 배경색
- `--nexa-select-menu-opacity`: 드롭다운 메뉴 투명도
- `--nexa-select-item-hover-bg`: 드롭다운 아이템 호버 배경색
- `--nexa-select-item-active-bg`: 드롭다운 아이템 선택된 배경색

**용도:**

- 모든 배경 및 표면 요소의 색상 통일 관리
- 계층 구조 표현

---

### 4. 버튼 색상 (button-\*)

**변수명:**

- `--nexa-button-primary-bg`: 주요 버튼 배경색
- `--nexa-button-primary-text`: 주요 버튼 텍스트 색상
- `--nexa-button-secondary-bg`: 보조 버튼 배경색
- `--nexa-button-secondary-text`: 보조 버튼 텍스트 색상
- `--nexa-button-save-bg`: 저장 버튼 배경색
- `--nexa-button-save-text`: 저장 버튼 텍스트 색상
- `--nexa-button-cancel-bg`: 취소 버튼 배경색
- `--nexa-button-cancel-text`: 취소 버튼 텍스트 색상
- `--nexa-button-success-bg`: 성공 버튼 배경색
- `--nexa-button-success-text`: 성공 버튼 텍스트 색상
- `--nexa-button-warning-bg`: 경고 버튼 배경색
- `--nexa-button-warning-text`: 경고 버튼 텍스트 색상
- `--nexa-button-danger-bg`: 위험 버튼 배경색
- `--nexa-button-danger-text`: 위험 버튼 텍스트 색상

**용도:**

- 모든 버튼 요소의 색상 통일 관리
- 버튼 타입별 색상 제공

---

### 5. 아이템 색상 (item-\*)

**아이템 정의:**

- DB 레코드에 해당하는 데이터 단위
- 테이블 로우, 카드, 타임라인 타임 등 모든 뷰에서 동일하게 적용

**기본 상태:**

- `--nexa-item-bg`: 기본 배경색
- `--nexa-item-border`: 기본 테두리 색상

**텍스트 색상:**

- `--nexa-item-text-title`: 제목 텍스트 색상
- `--nexa-item-text-label`: 라벨 텍스트 색상
- `--nexa-item-text-value`: 값 텍스트 색상

**호버 상태:**

- `--nexa-item-hover-bg`: 호버 배경색
- `--nexa-item-hover-border`: 호버 테두리 색상

**클릭 상태:**

- `--nexa-item-click-bg`: 클릭 배경색 (선택된 색상과 동일)

**선택 상태 (멀티 셀렉터):**

- `--nexa-item-selected-bg`: 선택된 배경색
- `--nexa-item-selected-text`: 선택된 텍스트 색상
- `--nexa-item-selected-hover-bg`: 선택된 상태에서 호버 배경색

**롱프레스 상태:**

- `--nexa-item-longpress-border`: 롱프레스 테두리 색상

**드래그 오버 상태 (드래그앤드롭 전용):**

- `--nexa-item-dragover-bg`: 드래그 오버 배경색
- `--nexa-item-dragover-border`: 드래그 오버 테두리 색상

**비활성 상태:**

- `--nexa-item-inactive-opacity`: 비활성 투명도

**용도:**

- 모든 뷰에서 공통으로 사용되는 아이템 색상 통일 관리
- 상태별 아이템 색상 제공

---

### 6. 폼 컨트롤 색상 (form-\*)

**변수명:**

- `--nexa-form-track-color`: 트랙/배경 색상
- `--nexa-form-indicator-color`: 기본 표시기 색상 (비활성/비선택)
- `--nexa-form-indicator-active-color`: 활성 표시기 색상 (활성/선택 상태)

**Quasar 오버라이드:**

- `--q-primary`: Quasar 기본 primary 색상 변수 오버라이드 (라디오 버튼 등에 사용)
- `--q-primary-rgb`: RGB 값 (rgba() 사용 시 필요)
- `--q-negative`: Quasar 기본 negative 색상 변수 오버라이드 (필수 필드 등에 사용)

**용도:**

- 슬라이더, 토글, 체크박스, 라디오 버튼 등 폼 컨트롤 색상 통일 관리
- Quasar 컴포넌트와의 색상 통일

---

### 7. 모달 색상 (modal-\*)

**변수명:**

- `--nexa-modal-bg`: 모달 배경색
- `--nexa-modal-surface`: 모달 내부 표면 배경색
- `--nexa-modal-header-hover-bg`: 모달 헤더 호버 배경색
- `--nexa-modal-accordion-expanded-bg`: 아코디언 펼쳐진 상태 헤더 배경색
- `--nexa-modal-scrollbar`: 모달 스크롤바 색상
- `--nexa-modal-scrollbar-hover`: 모달 스크롤바 호버 색상

**리사이즈 핸들:**

- `--nexa-resize-handle-bg`: 리사이즈 핸들 배경색
- `--nexa-resize-handle-bg-hover`: 리사이즈 핸들 호버 배경색
- `--nexa-resize-handle-pattern`: 리사이즈 핸들 패턴 색상
- `--nexa-resize-handle-pattern-hover`: 리사이즈 핸들 호버 패턴 색상

**용도:**

- 모달 및 관련 UI 요소의 색상 통일 관리

---

## 🔧 사용 방법

### CSS에서 사용

```scss
.my-component {
  background-color: var(--nexa-background);
  color: var(--nexa-text-primary);
  border: 1px solid var(--nexa-border-color);
}
```

### JavaScript/Vue에서 사용

```javascript
const element = document.querySelector('.my-element')
element.style.backgroundColor = 'var(--nexa-button-primary-bg)'
element.style.color = 'var(--nexa-button-primary-text)'
```

### Vue Template에서 사용

```vue
<template>
  <div :style="{ backgroundColor: 'var(--nexa-surface)' }">
    <p :style="{ color: 'var(--nexa-text-primary)' }">텍스트</p>
  </div>
</template>
```

### 테이블 Striped (선택적 사용)

> ⚠️ **중요 원칙**: 테이블 striped는 **기본적으로 비활성화**되어 있으며, **로우가 10개 이상일 때만 자동으로 적용**됩니다.

**기본 정책:**

- **기본적으로 striped 비활성화**: 가독성 문제 및 멀티 셀렉터와의 충돌 방지
- **자동 적용 조건**: 로우가 **10개 이상**일 때만 자동으로 striped 적용
  - DataTableRenderer: `rows.length >= 10`일 때 자동 적용
  - 마크다운 테이블: `dataLines.length >= 10`일 때 자동 적용
- **수동 활성화**: 로우가 10개 미만이어도 필요시 수동으로 활성화 가능

**⚠️ 적용 원칙 (반드시 준수):**

1. **로우가 10개 미만**: striped **절대 적용 안 함**
2. **로우가 10개 이상**: striped **자동 적용**
3. **모든 테이블 타입에 동일 적용**: DataTableRenderer, 마크다운 테이블 모두 동일한 원칙

**DataTableRenderer에서 사용:**

```vue
<template>
  <!-- 기본 (로우가 10개 미만이면 striped 없음, 10개 이상이면 자동 적용) -->
  <DataTableRenderer 
    :rows="rows" 
    :columns="columns" 
  />

  <!-- 수동 활성화 (로우가 10개 미만이어도 강제로 활성화) -->
  <DataTableRenderer 
    :rows="rows" 
    :columns="columns" 
    :striped="true"
  />
</template>
```

**마크다운 테이블:**

- 마크다운 파서(`markdownParser.js`)에서 자동으로 로우 개수를 체크
- 로우가 10개 이상일 때만 `table-striped` 클래스 자동 추가
- 개발자가 별도로 설정할 필요 없음

**CSS에서 직접 사용:**

```scss
// .table-striped 클래스가 있을 때만 스트라이프 적용
.parts-table.table-striped .q-table tbody tr:nth-child(even),
.markdown-table.table-striped tbody tr:nth-child(even) {
  background-color: var(--nexa-table-row-striped-bg);
}
```

**⚠️ 주의사항:**

- **절대 기본값으로 striped를 활성화하지 말 것**: 가독성 저하 및 멀티 셀렉터 충돌 발생
- **로우 개수 체크 필수**: 새로운 테이블 컴포넌트 추가 시 반드시 로우 개수 체크 로직 포함
- **마크다운 테이블도 동일한 원칙**: 마크다운 파서에서도 로우 개수 체크 후 조건부 적용

**참고:**

- `--nexa-table-row-striped-bg` 변수는 테마에 정의되어 있지만, 기본적으로는 적용되지 않음
- 로우가 10개 이상일 때만 자동으로 활성화되거나, 필요시 수동으로 활성화하여 사용

---

## 📝 네이밍 규칙

### 변수명 형식

```
--nexa-{카테고리}-{속성}-{상태?}
```

**예시:**

- `--nexa-button-primary-bg`: 버튼 카테고리의 주요 배경색
- `--nexa-item-hover-bg`: 아이템 카테고리의 호버 배경색
- `--nexa-text-primary`: 텍스트 카테고리의 주요 색상

### 카테고리 구분

1. **브랜드 색상**: `primary`, `secondary`, `accent`
2. **텍스트 색상**: `text-*`
3. **배경색**: `background-*`, `surface-*`, `border-*`
4. **버튼 색상**: `button-*`
5. **아이템 색상**: `item-*`
6. **폼 컨트롤 색상**: `form-*`
7. **모달 색상**: `modal-*`

---

## 🎯 개발 우선순위

### Phase 1: 다크 테마 완성 (현재 진행 중)

- [x] 변수 구조 확정
- [x] 네이밍 규칙 확정
- [x] 카테고리별 분류 완료
- [ ] 색상 값 최적화
- [ ] 접근성 검증 (WCAG 준수)

### Phase 2: 라이트 테마 색상 조정 (예정)

- [ ] 다크 테마 구조 기반으로 색상 값만 조정
- [ ] 가독성 검증
- [ ] 접근성 검증 (WCAG 준수)

---

## 📚 참고 문서

- [테마 색상 평가 보고서](./THEME_COLOR_EVALUATION.md)
- [SCSS 아키텍처 문서](./NEXA-SCSS_ARCHITECTURE.md)

---

## 🔄 업데이트 이력

- **2024년**: 초기 문서 작성
  - 테마 개발 전략 명시
  - 브랜드 색상 설계 의도 문서화
  - 변수 구조 및 사용 방법 정리
- **2024년**: 테이블 Striped 선택적 사용 정책 추가
  - 기본적으로 striped 비활성화 (가독성 및 멀티 셀렉터 충돌 방지)
  - 선택적 사용 가이드 추가 (인터랙티브 불필요한 데이터, 로우가 많은 데이터)
  - 테이블 색상 변수 확장 (hover, selected, striped, header-text, cell-border)

---

**작성자**: NEXA 개발팀  
**최종 수정일**: 2024년 (테이블 Striped 정책 추가)
