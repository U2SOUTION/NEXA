# Quasar 사용 현황 및 디자인 전략 문서

## 목차

1. [현재 Quasar 사용 현황](#현재-quasar-사용-현황)
2. [Quasar의 장점](#quasar의-장점)
3. [Quasar의 한계 및 문제점](#quasar의-한계-및-문제점)
4. [Sass/SCSS 변수 오버라이딩을 통한 해결 방안](#sassscss-변수-오버라이딩을-통한-해결-방안)
5. [CSS 변수를 통한 테마 커스터마이징](#css-변수를-통한-테마-커스터마이징)
6. [Quasar 핵심 개념 및 활용 전략](#quasar-핵심-개념-및-활용-전략)
   - 6.1. [Quasar 디렉티브 시스템](#1-quasar-디렉티브-시스템)
     - 6.1.1. [주요 디렉티브](#주요-디렉티브)
     - 6.1.2. [디렉티브 활용 전략](#디렉티브-활용-전략)
   - 6.2. [Quasar 유틸리티 클래스 체계](#2-quasar-유틸리티-클래스-체계)
     - 6.2.1. [간격 유틸리티 (Spacing)](#간격-유틸리티-spacing)
     - 6.2.2. [텍스트 유틸리티](#텍스트-유틸리티)
     - 6.2.3. [레이아웃 유틸리티](#레이아웃-유틸리티)
     - 6.2.4. [유틸리티 클래스 활용 전략](#유틸리티-클래스-활용-전략)
   - 6.3. [Quasar 슬롯 시스템](#3-quasar-슬롯-시스템)
     - 6.3.1. [주요 슬롯 패턴](#주요-슬롯-패턴)
     - 6.3.2. [슬롯 활용 전략](#슬롯-활용-전략)
   - 6.4. [Quasar 반응형 브레이크포인트](#4-quasar-반응형-브레이크포인트)
     - 6.4.1. [브레이크포인트](#브레이크포인트)
     - 6.4.2. [반응형 그리드 사용](#반응형-그리드-사용)
     - 6.4.3. [JavaScript에서 브레이크포인트 감지](#javascript에서-브레이크포인트-감지)
   - 6.5. [Quasar 플러그인 시스템](#5-quasar-플러그인-시스템)
     - 6.5.1. [주요 플러그인](#주요-플러그인)
     - 6.5.2. [플러그인 활용 전략](#플러그인-활용-전략)
   - 6.6. [Quasar 이벤트 시스템](#6-quasar-이벤트-시스템)
     - 6.6.1. [주요 이벤트 패턴](#주요-이벤트-패턴)
   - 6.7. [Quasar 폼 유효성 검사](#7-quasar-폼-유효성-검사)
     - 6.7.1. [기본 유효성 검사](#기본-유효성-검사)
     - 6.7.2. [커스텀 유효성 검사 규칙](#커스텀-유효성-검사-규칙)
   - 6.8. [Quasar 다크 모드 관리](#8-quasar-다크-모드-관리)
     - 6.8.1. [다크 모드 설정](#다크-모드-설정)
     - 6.8.2. [다크 모드와 CSS 변수 연동](#다크-모드와-css-변수-연동)
     - 6.8.3. [다크 모드 활용 전략](#다크-모드-활용-전략)
7. [디자인 전략 및 모범 사례](#디자인-전략-및-모범-사례)
8. [Quasar 추가 상세 개념 목록](#quasar-추가-상세-개념-목록)

---

## 현재 Quasar 사용 현황

### 사용 통계

- **컴포넌트 사용량**: 17개 파일에서 **999개 이상**의 Quasar 컴포넌트 사용
- **주요 사용 컴포넌트**:
  - `q-table`: 데이터 테이블 표시 (가장 많이 사용)
  - `q-dialog`, `q-card`: 모달창 및 카드
  - `q-btn`, `q-btn-dropdown`: 버튼 및 드롭다운 메뉴
  - `q-input`, `q-select`: 폼 입력 컴포넌트
  - `q-icon`: 아이콘 표시
  - `q-list`, `q-item`: 리스트 표시
  - `q-tabs`: 탭 네비게이션
  - `q-separator`: 구분선

### 주요 활용 영역

1. **데이터 테이블 관리** (`PartClassesView.vue`, `PartModelsView.vue`, `PartSpecsView.vue`)
2. **폼 입력 및 검색** (검색 필드, 필터 셀렉트)
3. **모달 다이얼로그** (추가/수정 폼, 확인 다이얼로그)
4. **사이드바 네비게이션** (`PartsManagementSidebar.vue`)
5. **알림 시스템** (`$q.notify`)

---

## Quasar의 장점

### 1. 개발 속도 향상

- **풍부한 기본 컴포넌트**: 테이블, 폼, 모달 등 즉시 사용 가능
- **빠른 프로토타이핑**: 기본 기능을 빠르게 구현 가능
- **일관된 API**: 모든 컴포넌트가 유사한 패턴 사용

### 2. 내장 기능의 강력함

#### 데이터 테이블 (q-table)

```vue
<q-table
  :rows="filteredClasses"
  :columns="columns"
  v-model:pagination="pagination"
  :loading="loading"
  selection="single"
  @row-click="onRowClick"
></q-table>
```

- ✅ 내장 페이징, 정렬, 필터링
- ✅ `v-model:pagination` 양방향 바인딩
- ✅ `v-slot:body` 커스텀 렌더링 지원
- ✅ `loading` 상태 표시
- ✅ `selection` 다중/단일 선택 지원
- ✅ 드래그 앤 드롭 이벤트 지원

#### 알림 시스템 ($q.notify)

```javascript
$q.notify({
  type: 'negative',
  message: '데이터를 불러오는데 실패했습니다.',
  caption: error.message,
})
```

- ✅ 간단한 API (`$q.notify()`)
- ✅ 타입별 자동 스타일링 (positive, negative, warning)
- ✅ 위치 및 타이밍 제어
- ✅ 커스텀 위치 지정 가능

#### 다크 모드 지원 ($q.dark)

```javascript
const menuBackgroundColor = computed(() => {
  return $q.dark.isActive ? '#3a3a3a' : '#f5f5f5'
})
```

- ✅ `$q.dark.isActive`로 현재 모드 확인
- ✅ 전역 상태 관리
- ✅ 컴포넌트별 자동 대응

### 3. 반응형 그리드 시스템

```vue
<div class="row q-gutter-md q-mb-md items-center">
  <q-input class="col-12 col-md search-input" />
  <q-select class="col-12 col-md category-filter" />
</div>
```

- ✅ 반응형 그리드 (`col-12 col-md`)
- ✅ 간단한 마진/패딩 (`q-gutter-md`, `q-mb-md`)
- ✅ 유틸리티 클래스로 빠른 스타일링

### 4. 폼 컴포넌트의 편의성

```vue
<q-input v-model="searchText" outlined dense clearable>
  <template v-slot:prepend>
    <q-icon name="search" />
  </template>
</q-input>
```

- ✅ 다양한 스타일 옵션 (`outlined`, `dense`)
- ✅ `clearable`로 자동 초기화 버튼
- ✅ `v-slot:prepend`로 아이콘 추가
- ✅ `v-model` 양방향 바인딩

### 5. 아이콘 시스템 통합

```vue
<q-icon name="search" size="24px" color="primary" />
```

- ✅ Material Icons 통합
- ✅ 이름만으로 아이콘 사용
- ✅ 크기/색상 제어 용이

---

## Quasar의 한계 및 문제점

### 1. 모달창 커스터마이징의 어려움

**문제점**:

- `q-dialog`의 기본 스타일이 강제됨
- `no-backdrop` 옵션만으로는 부족
- 복잡한 레이아웃 커스터마이징이 어려움

**예시**:

```vue
<!-- 기본 모달은 backdrop과 기본 스타일이 강제됨 -->
<q-dialog v-model="showAddDialog" no-backdrop>
  <q-card class="add-class-dialog-card">
    <!-- 커스텀 스타일 적용이 어려움 -->
  </q-card>
</q-dialog>
```

### 2. CSS 오버라이딩의 어려움

**문제점**:

- Quasar의 내부 클래스명이 복잡함
- `!important` 남용 필요
- `:deep()` 선택자 필요
- 특정 스타일 변경이 어려움

**예시**:

```scss
// 깊은 중첩 선택자 필요
:deep(.q-table__body) {
  .q-tr {
    cursor: pointer;
    // ...
  }
}
```

### 3. 표준과 다른 동작 방식

**문제점**:

- Quasar 테이블의 `props.rowIndex`가 전체 데이터 배열 기준 인덱스
- 일반적인 페이지 내 인덱스와 다름
- 문서화가 부족하여 예상과 다른 동작

**예시**:

```javascript
// [중요-삭제금지!!!] DO NOT REMOVE
// Quasar 테이블의 props.rowIndex는 전체 데이터 배열에서의 인덱스(0-based)이므로,
// 페이지 내 인덱스가 아닌 rowIndex + 1을 사용해야 함
function getRowNumber(rowIndex) {
  return rowIndex + 1 // 전체 데이터 기준 인덱스
}
```

### 4. 커스터마이징 한계

- 테마 변수만으로는 부족한 경우가 많음
- 컴포넌트 내부 구조 변경이 어려움
- 특정 디자인 요구사항 충족이 어려움

---

## Sass/SCSS 변수 오버라이딩을 통한 해결 방안

### 1. Quasar SCSS 변수 파일 구조

프로젝트의 Quasar 변수 파일 위치:

```
src/css/quasar.variables.scss
```

### 2. 기본 변수 오버라이딩 방법

#### 색상 변수 오버라이딩

```scss
// src/css/quasar.variables.scss

// 브랜드 색상 (Brand Colors)
$primary: #0076fd;
$secondary: #00f2ff;
$accent: #ff6a00;

// 상태 색상 (Status Colors)
$positive: #21ba45;
$negative: #c10015;
$info: #31ccec;
$warning: #f2c037;

// 회색 음영 (Grey Shades)
$grey-1: #fafafa;
$grey-2: #f5f5f5;
// ... $grey-14: #000000;
```

#### 컴포넌트별 변수 오버라이딩

```scss
// 테이블 관련 변수
$table-border-color: rgba(83, 83, 83, 0.928);
$table-hover-background: rgba(255, 255, 255, 0.05);

// 버튼 관련 변수
$button-border-radius: 6px;
$button-padding: 12px 32px;

// 입력 필드 관련 변수
$input-border-color: #000000;
$input-border-radius: 4px;
```

### 3. 테마별 변수 분리

#### 라이트 테마 (`src/css/themes/light.scss`)

```scss
body:not(.dark) {
  // CSS 변수 설정
  --nexa-primary: #0076fd;
  --nexa-secondary: #00f2ff;
  --nexa-accent: #ff6a00;

  // 버튼 배경색
  --nexa-button-primary-bg: #41aadf;
  --nexa-button-primary-text: #ffffff;

  // 텍스트 색상
  --nexa-text-primary: #6f6f6f;
  --nexa-text-secondary: rgba(148, 148, 148, 0.7);

  // 배경색
  --nexa-surface: #ffffff;
  --nexa-background: #eaeaea;
}
```

#### 다크 테마 (`src/css/themes/dark.scss`)

```scss
body.dark {
  // CSS 변수 설정
  --nexa-primary: #0076fd;
  --nexa-secondary: #00f2ff;
  --nexa-accent: #ff6a00;

  // 버튼 배경색
  --nexa-button-primary-bg: #029a79;
  --nexa-button-primary-text: #ffffff;

  // 텍스트 색상
  --nexa-text-primary: #0cee81;
  --nexa-text-secondary: rgba(185, 185, 185, 0.7);

  // 배경색
  --nexa-surface: #383838;
  --nexa-background: #2d2d2d;
}
```

### 4. CSS 변수를 통한 동적 테마 적용

#### 컴포넌트에서 CSS 변수 사용

```vue
<template>
  <q-btn
    :style="{
      backgroundColor: 'var(--nexa-button-primary-bg)',
      color: 'var(--nexa-button-primary-text)',
    }"
  >
    버튼
  </q-btn>
</template>
```

#### JavaScript에서 CSS 변수 사용

```javascript
const menuBackgroundColor = computed(() => {
  return $q.dark.isActive ? '#3a3a3a' : '#f5f5f5'
})
```

### 5. 컴포넌트별 CSS 변수 정의

#### PaginationTable 예시

```scss
.custom-pagination {
  // CSS 변수 정의
  --pagination-opacity-side: 0.3;
  --pagination-opacity-select: 0.5;
  --pagination-opacity-center: 0.6;
  --pagination-opacity-hover: 0.8;
  --pagination-opacity-disabled: 0.3;
  --pagination-opacity-active: 1;

  --pagination-size-btn: 40px;
  --pagination-size-page: 30px;
  --pagination-size-icon: 25px;

  --pagination-font-size: 14px;
  --pagination-font-size-select: 13px;

  // 변수 사용
  .pagination-info {
    opacity: var(--pagination-opacity-side);
    font-size: var(--pagination-font-size);
  }
}
```

### 6. Quasar 컴포넌트 스타일 오버라이딩

#### :deep() 선택자 사용

```scss
// 테이블 스타일 오버라이딩
:deep(.q-table__body) {
  .q-tr {
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    &.q-tr--selected {
      background-color: rgba(65, 170, 223, 0.15);
      border-left: 3px solid var(--nexa-button-primary-bg);
    }
  }
}
```

#### !important 사용 (필요시)

```scss
.delete-confirmation-dialog-card {
  min-width: 600px !important;
  max-width: 90vw !important;
  width: 700px !important;
  border-radius: 8px !important;
  border: 2px solid var(--nexa-warning) !important;
}
```

---

## CSS 변수를 통한 테마 커스터마이징

### 1. 전역 CSS 변수 정의

**위치**: `src/css/themes/light.scss`, `src/css/themes/dark.scss`

**변수 네이밍 규칙**:

- `--nexa-{카테고리}-{속성}` 형식
- 예: `--nexa-button-primary-bg`, `--nexa-text-primary`

### 2. 주요 CSS 변수 카테고리

#### 색상 변수

```scss
--nexa-primary: #0076fd;
--nexa-secondary: #00f2ff;
--nexa-accent: #ff6a00;
--nexa-warning: #ce9908;
--nexa-error: #c10015;
```

#### 버튼 변수

```scss
--nexa-button-primary-bg: #41aadf;
--nexa-button-primary-text: #ffffff;
--nexa-button-secondary-bg: #5083c5;
--nexa-button-secondary-text: #ffffff;
```

#### 텍스트 변수

```scss
--nexa-text-primary: #6f6f6f;
--nexa-text-secondary: rgba(148, 148, 148, 0.7);
--nexa-ui-primary: #6f6f6f;
```

#### 배경 변수

```scss
--nexa-surface: #ffffff;
--nexa-background: #eaeaea;
--nexa-header-bg: #474747;
```

### 3. 컴포넌트에서 CSS 변수 활용

```vue
<template>
  <q-btn
    :style="{
      backgroundColor: 'var(--nexa-button-primary-bg)',
      color: 'var(--nexa-button-primary-text)',
      borderColor: 'var(--nexa-button-primary-bg)',
    }"
  >
    버튼
  </q-btn>
</template>
```

### 4. 다크 모드 자동 대응

```scss
// 라이트 테마
body:not(.dark) {
  --nexa-text-primary: #6f6f6f;
  --nexa-background: #eaeaea;
}

// 다크 테마
body.dark {
  --nexa-text-primary: #0cee81;
  --nexa-background: #2d2d2d;
}
```

---

## Quasar 핵심 개념 및 활용 전략

### 1. Quasar 디렉티브 시스템

Quasar는 다양한 디렉티브를 제공하여 사용자 경험을 향상시킵니다.

#### 주요 디렉티브

**v-close-popup**: 팝업/다이얼로그 자동 닫기

```vue
<!-- 다이얼로그 닫기 버튼 -->
<q-btn icon="close" flat round dense v-close-popup />

<!-- 리스트 아이템 클릭 시 다이얼로그 닫기 -->
<q-item clickable v-close-popup @click="handleAction">
  <q-item-section>항목</q-item-section>
</q-item>
```

**v-ripple**: Material Design 리플 효과

```vue
<!-- 버튼에 리플 효과 추가 -->
<q-btn v-ripple>클릭</q-btn>

<!-- 커스텀 색상 리플 -->
<q-btn v-ripple="{ color: 'primary' }">클릭</q-btn>
```

**v-touch-pan**: 터치/마우스 팬 제스처

```vue
<div v-touch-pan="handlePan">드래그 가능한 영역</div>
```

**v-scroll**: 스크롤 이벤트 감지

```vue
<div v-scroll="handleScroll">스크롤 가능한 영역</div>
```

#### 디렉티브 활용 전략

- **v-close-popup**: 다이얼로그 내부의 모든 닫기 액션에 일관되게 사용
- **v-ripple**: 인터랙티브 요소에 시각적 피드백 제공
- **v-touch-pan**: 모바일 친화적인 제스처 지원

### 2. Quasar 유틸리티 클래스 체계

Quasar는 Tailwind CSS와 유사한 유틸리티 클래스 시스템을 제공합니다.

#### 간격 유틸리티 (Spacing)

```vue
<!-- 패딩 -->
<div class="q-pa-xs">xs (4px)</div>
<div class="q-pa-sm">sm (8px)</div>
<div class="q-pa-md">md (16px)</div>
<div class="q-pa-lg">lg (24px)</div>
<div class="q-pa-xl">xl (32px)</div>

<!-- 마진 -->
<div class="q-mt-md">위쪽 마진</div>
<div class="q-mb-md">아래쪽 마진</div>
<div class="q-ml-md">왼쪽 마진</div>
<div class="q-mr-md">오른쪽 마진</div>
<div class="q-ma-md">모든 방향 마진</div>

<!-- 간격 (Gutter) -->
<div class="row q-gutter-md">
  <div class="col">항목 1</div>
  <div class="col">항목 2</div>
</div>
```

#### 텍스트 유틸리티

```vue
<!-- 텍스트 크기 -->
<div class="text-h1">제목 1</div>
<div class="text-h2">제목 2</div>
<div class="text-h3">제목 3</div>
<div class="text-h4">제목 4</div>
<div class="text-h5">제목 5</div>
<div class="text-h6">제목 6</div>
<div class="text-subtitle1">부제목 1</div>
<div class="text-subtitle2">부제목 2</div>
<div class="text-body1">본문 1</div>
<div class="text-body2">본문 2</div>
<div class="text-caption">캡션</div>
<div class="text-overline">오버라인</div>

<!-- 텍스트 색상 -->
<div class="text-primary">Primary 색상</div>
<div class="text-secondary">Secondary 색상</div>
<div class="text-grey-6">회색</div>
<div class="text-red">빨간색</div>

<!-- 텍스트 정렬 -->
<div class="text-left">왼쪽 정렬</div>
<div class="text-center">가운데 정렬</div>
<div class="text-right">오른쪽 정렬</div>
<div class="text-justify">양쪽 정렬</div>
```

#### 레이아웃 유틸리티

```vue
<!-- Flexbox 정렬 -->
<div class="row items-center justify-between">
  <div>항목 1</div>
  <div>항목 2</div>
</div>

<!-- Flexbox 방향 -->
<div class="row">가로 방향 (기본)</div>
<div class="column">세로 방향</div>

<!-- Flexbox 정렬 -->
<div class="items-start">시작점 정렬</div>
<div class="items-center">중앙 정렬</div>
<div class="items-end">끝점 정렬</div>
<div class="items-stretch">늘리기</div>

<!-- Flexbox 분배 -->
<div class="justify-start">시작점 분배</div>
<div class="justify-center">중앙 분배</div>
<div class="justify-end">끝점 분배</div>
<div class="justify-between">양쪽 분배</div>
<div class="justify-around">주변 분배</div>
<div class="justify-evenly">균등 분배</div>
```

#### 유틸리티 클래스 활용 전략

- **일관성**: 프로젝트 전반에 동일한 간격 유틸리티 사용
- **반응형**: `col-12 col-md-6` 같은 반응형 클래스 활용
- **조합**: 여러 유틸리티 클래스를 조합하여 빠른 스타일링

### 3. Quasar 슬롯 시스템

Quasar 컴포넌트는 다양한 슬롯을 제공하여 커스터마이징을 지원합니다.

#### 주요 슬롯 패턴

**q-input 슬롯**

```vue
<q-input v-model="text" outlined>
  <!-- 앞쪽에 아이콘 추가 -->
  <template v-slot:prepend>
    <q-icon name="search" />
  </template>
  
  <!-- 뒤쪽에 버튼 추가 -->
  <template v-slot:append>
    <q-btn flat dense round icon="clear" @click="text = ''" />
  </template>
  
  <!-- 라벨 커스터마이징 -->
  <template v-slot:label>
    <span class="text-primary">커스텀 라벨</span>
  </template>
</q-input>
```

**q-table 슬롯**

```vue
<q-table :rows="rows" :columns="columns">
  <!-- 헤더 커스터마이징 -->
  <template v-slot:header="props">
    <q-tr :props="props">
      <q-th v-for="col in props.cols" :key="col.name">
        {{ col.label }}
      </q-th>
    </q-tr>
  </template>
  
  <!-- 바디 커스터마이징 -->
  <template v-slot:body="props">
    <q-tr :props="props" @click="handleRowClick(props.row)">
      <q-td v-for="col in props.cols" :key="col.name">
        {{ col.value }}
      </q-td>
    </q-tr>
  </template>
  
  <!-- 빈 상태 표시 -->
  <template v-slot:no-data>
    <div class="text-center">데이터가 없습니다</div>
  </template>
</q-table>
```

**q-btn-dropdown 슬롯**

```vue
<q-btn-dropdown label="메뉴">
  <q-list>
    <q-item clickable v-close-popup>
      <q-item-section avatar>
        <q-icon name="edit" />
      </q-item-section>
      <q-item-section>수정</q-item-section>
    </q-item>
  </q-list>
</q-btn-dropdown>
```

#### 슬롯 활용 전략

- **일관성**: 동일한 패턴의 슬롯 사용으로 코드 일관성 유지
- **재사용성**: 슬롯을 활용한 컴포넌트 재사용성 향상
- **확장성**: 슬롯을 통한 컴포넌트 확장 용이

### 4. Quasar 반응형 브레이크포인트

Quasar는 Material Design의 브레이크포인트를 따릅니다.

#### 브레이크포인트

```javascript
// 브레이크포인트 값
xs: 0px      // 모바일 (세로)
sm: 600px    // 모바일 (가로)
md: 1024px   // 태블릿
lg: 1440px   // 데스크톱
xl: 1920px   // 대형 데스크톱
```

#### 반응형 그리드 사용

```vue
<!-- 기본: 12칸, 중간 이상: 6칸, 큰 화면: 4칸 -->
<div class="col-12 col-md-6 col-lg-4">항목</div>

<!-- 기본: 12칸, 중간 이상: 자동 크기 -->
<div class="col-12 col-md">항목</div>

<!-- 특정 브레이크포인트에서만 표시 -->
<div class="col-12 gt-xs">작은 화면에서는 숨김</div>
<div class="col-12 lt-md">중간 화면 미만에서만 표시</div>
```

#### JavaScript에서 브레이크포인트 감지

```javascript
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 현재 화면 크기 확인
const isMobile = computed(() => $q.screen.lt.sm)
const isTablet = computed(() => $q.screen.lt.md && $q.screen.gt.xs)
const isDesktop = computed(() => $q.screen.gt.md)

// 특정 브레이크포인트 이상/이하 확인
if ($q.screen.gt.sm) {
  // 작은 화면보다 큰 경우
}

if ($q.screen.lt.md) {
  // 중간 화면보다 작은 경우
}
```

### 5. Quasar 플러그인 시스템

Quasar는 전역 플러그인을 통해 기능을 제공합니다.

#### 주요 플러그인

**Notify 플러그인**: 알림 메시지 표시

```javascript
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 기본 알림
$q.notify({
  message: '작업이 완료되었습니다.',
  type: 'positive',
  position: 'top',
  timeout: 3000,
})

// 커스텀 알림
$q.notify({
  message: '커스텀 알림',
  color: 'primary',
  icon: 'check',
  actions: [{ label: '확인', color: 'white', handler: () => {} }],
})
```

**Dialog 플러그인**: 다이얼로그 표시

```javascript
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 확인 다이얼로그
$q.dialog({
  title: '확인',
  message: '정말 삭제하시겠습니까?',
  cancel: true,
  persistent: true,
})
  .onOk(() => {
    // 확인 버튼 클릭 시
  })
  .onCancel(() => {
    // 취소 버튼 클릭 시
  })
```

**Loading 플러그인**: 로딩 인디케이터 표시

```javascript
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 로딩 표시
const loading = $q.loading.show({
  message: '데이터를 불러오는 중...',
  delay: 400, // 400ms 후 표시
})

// 로딩 숨기기
loading.hide()

// 또는 간단하게
$q.loading.show()
// 작업 수행
$q.loading.hide()
```

#### 플러그인 활용 전략

- **일관성**: 프로젝트 전반에 동일한 플러그인 패턴 사용
- **에러 처리**: Notify 플러그인을 통한 일관된 에러 메시지 표시
- **사용자 경험**: Loading 플러그인으로 비동기 작업 피드백 제공

### 6. Quasar 이벤트 시스템

Quasar 컴포넌트는 다양한 이벤트를 제공합니다.

#### 주요 이벤트 패턴

**q-table 이벤트**

```vue
<q-table
  :rows="rows"
  :columns="columns"
  @row-click="handleRowClick"
  @request="handleTableRequest"
  @update:pagination="handlePaginationChange"
  @update:selected="handleSelectionChange"
/>
```

**q-input 이벤트**

```vue
<q-input
  v-model="text"
  @update:model-value="handleInputChange"
  @blur="handleBlur"
  @focus="handleFocus"
  @keyup.enter="handleEnter"
/>
```

**q-dialog 이벤트**

```vue
<q-dialog
  v-model="showDialog"
  @show="handleDialogShow"
  @hide="handleDialogHide"
  @before-show="handleBeforeShow"
>
</q-dialog>
```

### 7. Quasar 폼 유효성 검사

Quasar는 강력한 폼 유효성 검사 시스템을 제공합니다.

#### 기본 유효성 검사

```vue
<template>
  <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
    <q-input
      v-model="name"
      label="이름"
      :rules="[(val) => !!val || '이름을 입력하세요']"
      outlined
    />

    <q-input
      v-model="email"
      label="이메일"
      type="email"
      :rules="[
        (val) => !!val || '이메일을 입력하세요',
        (val) => /.+@.+\..+/.test(val) || '올바른 이메일 형식이 아닙니다',
      ]"
      outlined
    />

    <q-btn label="제출" type="submit" color="primary" />
    <q-btn label="초기화" type="reset" color="primary" flat />
  </q-form>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')

function onSubmit() {
  // 유효성 검사 통과 시 실행
}

function onReset() {
  name.value = ''
  email.value = ''
}
</script>
```

#### 커스텀 유효성 검사 규칙

```javascript
// 유틸리티 함수로 분리
const rules = {
  required: (val) => !!val || '필수 항목입니다',
  email: (val) => /.+@.+\..+/.test(val) || '올바른 이메일 형식이 아닙니다',
  minLength: (min) => (val) =>
    (val && val.length >= min) || `최소 ${min}자 이상 입력하세요`,
  maxLength: (max) => (val) =>
    (val && val.length <= max) || `최대 ${max}자까지 입력 가능합니다`,
}

// 사용
<q-input
  v-model="password"
  :rules="[rules.required, rules.minLength(8)]"
/>
```

### 8. Quasar 다크 모드 관리

Quasar는 내장 다크 모드 시스템을 제공합니다.

#### 다크 모드 설정

```javascript
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 다크 모드 활성화/비활성화
$q.dark.set(true) // 다크 모드 활성화
$q.dark.set(false) // 라이트 모드 활성화
$q.dark.toggle() // 토글

// 현재 모드 확인
const isDark = $q.dark.isActive
```

#### 다크 모드와 CSS 변수 연동

```scss
// themes/light.scss
body:not(.dark) {
  --nexa-background: #eaeaea;
  --nexa-text-primary: #6f6f6f;
}

// themes/dark.scss
body.dark {
  --nexa-background: #2d2d2d;
  --nexa-text-primary: #0cee81;
}
```

#### 다크 모드 활용 전략

- **자동 대응**: CSS 변수를 통한 자동 테마 전환
- **사용자 설정**: localStorage에 사용자 선호도 저장
- **일관성**: 모든 컴포넌트가 다크 모드를 지원하도록 설계

---

## 디자인 전략 및 모범 사례

### 1. 변수 사용 우선순위

1. **CSS 변수 (--nexa-\*)**: 테마별 동적 변경이 필요한 경우
2. **SCSS 변수 ($primary 등)**: 정적 값이 필요한 경우
3. **인라인 스타일**: 컴포넌트별 일시적 커스터마이징

### 2. 스타일 오버라이딩 전략

#### 디자인 작업 순서 (권장)

커스텀 디자인 변경이 필요할 때는 다음 순서로 진행합니다:

```
1. Quasar 프레임워크 기본 기능 최대한 활용
   ↓
2. Quasar 변수 오버라이딩 시도 (quasar.variables.scss)
   ↓
3. 테마 SCSS/CSS 변수 활용 (themes/light.scss, dark.scss)
   - 인라인 스타일
   - 자체 CSS 클래스 정의
   - JavaScript 동적 스타일
   ↓
4. Deep 오버라이딩 (:deep() 선택자 사용)
   ↓
5. 직접 임포트 (최후의 수단)
```

#### 단계별 상세 설명

**1단계: Quasar 프레임워크 기본 기능 최대한 활용**

- Quasar 컴포넌트의 기본 props와 클래스 활용
- Quasar의 유틸리티 클래스 사용 (`q-mt-md`, `q-pa-sm` 등)
- 컴포넌트 내장 기능 활용 (예: `q-table`의 내장 페이징, 정렬)

**2단계: Quasar 변수 오버라이딩 시도**

```scss
// src/css/quasar.variables.scss
// Quasar CLI Vite는 이 파일을 자동으로 인식하여 변수 오버라이딩 적용

// 브랜드 색상
$primary: #0076fd;
$secondary: #00f2ff;
$accent: #ff6a00;

// 컴포넌트별 변수
$button-border-radius: 6px;
$table-border-color: rgba(83, 83, 83, 0.928);
```

**3단계: 테마 SCSS/CSS 변수 활용**

테마별 동적 변경이 필요한 경우 CSS 변수 사용:

```scss
// themes/light.scss
body:not(.dark) {
  --nexa-primary: #0076fd;
  --nexa-button-primary-bg: #41aadf;
}

// themes/dark.scss
body.dark {
  --nexa-primary: #0076fd;
  --nexa-button-primary-bg: #029a79;
}
```

컴포넌트에서 활용:

```vue
<!-- 인라인 스타일 -->
<q-btn :style="{ backgroundColor: 'var(--nexa-button-primary-bg)' }">
  버튼
</q-btn>

<!-- 자체 CSS 클래스 정의 -->
<style scoped>
.custom-button {
  background-color: var(--nexa-button-primary-bg);
}
</style>

<!-- JavaScript 동적 스타일 -->
<script setup>
const buttonStyle = computed(() => ({
  backgroundColor: 'var(--nexa-button-primary-bg)',
}))
</script>
```

**4단계: Deep 오버라이딩**

컴포넌트 내부 스타일 변경이 필요한 경우:

```scss
// 컴포넌트 내부에서 사용
<style scoped > :deep(.q-table__body) {
  .q-tr {
    cursor: pointer;
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>

// 또는 전역 스타일에서 사용 (app.scss)
.add-class-dialog-form {
  .q-field--error {
    --q-negative: var(--nexa-warning) !important;
  }
}
```

**5단계: 직접 임포트 (최후의 수단)**

특정 Quasar 컴포넌트 스타일을 직접 임포트하여 커스터마이징:

```scss
// 특정 컴포넌트 스타일만 임포트
@import 'quasar/src/css/components/table.sass';
```

### 3. 컴포넌트별 CSS 변수 정의

커스텀 컴포넌트는 자체 CSS 변수를 정의하여 재사용성 향상:

```scss
.custom-pagination {
  // 컴포넌트 전용 변수 정의
  --pagination-opacity-side: 0.3;
  --pagination-size-btn: 40px;

  // 변수 사용
  .pagination-info {
    opacity: var(--pagination-opacity-side);
  }
}
```

### 4. 문서화 및 주석

중요한 스타일 오버라이딩은 주석으로 이유 명시:

```scss
// [중요] Quasar 기본 스타일 오버라이딩
// q-dialog의 기본 backdrop을 제거하고 커스텀 스타일 적용
.delete-confirmation-dialog-card {
  min-width: 600px !important; // Quasar 기본값 오버라이딩
}
```

### 5. 테마 일관성 유지

- 모든 색상은 CSS 변수로 정의
- 테마별로 일관된 변수명 사용
- 다크 모드 자동 대응 고려

### 6. 성능 고려사항

- CSS 변수는 런타임에 계산되므로 과도한 사용 지양
- 정적 값은 SCSS 변수 사용
- 자주 변경되는 값만 CSS 변수 사용

---

## 결론

### Quasar 사용 전략

1. **기본 컴포넌트 활용**: 테이블, 폼, 알림 등은 Quasar 기본 기능 활용
2. **변수 오버라이딩**: Sass/SCSS 변수와 CSS 변수를 통한 테마 커스터마이징
3. **선택적 커스터마이징**: 필요한 부분만 `:deep()` 또는 `!important` 사용
4. **문서화**: 중요한 오버라이딩은 주석으로 이유 명시

### 향후 개선 방향

1. **CSS 변수 체계 정립**: 모든 디자인 토큰을 CSS 변수로 정의
2. **컴포넌트별 변수 분리**: 각 컴포넌트의 커스터마이징 가능한 변수 정의
3. **테마 시스템 강화**: 라이트/다크 모드 외 추가 테마 지원 고려
4. **스타일 가이드 문서화**: 팀 내 일관된 스타일 적용을 위한 가이드 작성

---

## Quasar 추가 상세 개념 목록

### 1. Quasar 컴포넌트 상세 - 레이아웃 및 컨테이너

- **q-card**: 카드 컴포넌트 (flat, bordered, square 옵션)
- **q-card-section**: 카드 섹션 (horizontal, vertical 정렬)
- **q-card-actions**: 카드 액션 영역 (align 옵션)
- **q-space**: 공간 채우기 (flex-grow 역할)
- **q-separator**: 구분선 (spaced, inset 옵션)
- **q-toolbar**: 툴바 (inset 옵션)
- **q-bar**: 상단/하단 바
- **q-page**: 페이지 컨테이너
- **q-page-sticky**: 고정 요소
- **q-page-scroll**: 스크롤 감지

### 2. Quasar 컴포넌트 상세 - 리스트 및 메뉴

- **q-list**: 리스트 컨테이너 (bordered, separator 옵션)
- **q-item**: 리스트 아이템 (clickable, active, dense 옵션)
- **q-item-section**: 아이템 섹션 (avatar, thumbnail, side 옵션)
- **q-item-label**: 아이템 라벨 (caption, overline 옵션)
- **q-menu**: 컨텍스트 메뉴 (auto-close, anchor, self 옵션)
- **q-btn-dropdown**: 드롭다운 버튼
- **q-splitter**: 패널 분할 (horizontal, vertical)
- **q-expansion-item**: 확장 가능한 아이템
- **q-accordion**: 아코디언

### 3. Quasar 컴포넌트 상세 - 폼 입력 (고급)

- **q-checkbox**: 체크박스 (indeterminate-value, toggle-indeterminate)
- **q-radio**: 라디오 버튼
- **q-toggle**: 토글 스위치
- **q-option-group**: 옵션 그룹 (type: radio, checkbox, toggle)
- **q-slider**: 슬라이더 (label, label-always, markers)
- **q-range**: 범위 슬라이더
- **q-knob**: 노브 (최소/최대값, 단계)
- **q-rating**: 평점
- **q-time**: 시간 선택기
- **q-date**: 날짜 선택기
- **q-color**: 색상 선택기
- **q-file**: 파일 선택 (multiple, accept, max-file-size)
- **q-uploader**: 파일 업로더 (auto-upload, max-files)

### 4. Quasar 컴포넌트 상세 - 피드백 및 표시

- **q-banner**: 배너 (inline-actions, dense)
- **q-badge**: 배지 (floating, transparent, multi-line)
- **q-chip**: 칩 (removable, clickable, dense)
- **q-avatar**: 아바타 (size, font-size, color)
- **q-skeleton**: 스켈레톤 로더 (type: text, rect, circle)
- **q-spinner**: 스피너 (size, color, thickness)
- **q-linear-progress**: 선형 진행 표시줄
- **q-circular-progress**: 원형 진행 표시줄
- **q-inner-loading**: 내부 로딩 오버레이
- **q-ajax-bar**: AJAX 진행 표시줄

### 5. Quasar 컴포넌트 상세 - 테이블 고급 기능

- **q-table 고급 옵션**:
  - virtual-scroll: 가상 스크롤 (대용량 데이터)
  - infinite-scroll: 무한 스크롤
  - server-side pagination: 서버 사이드 페이징
  - custom filter: 커스텀 필터 함수
  - row-key: 고유 키 지정
  - binary-state-sort: 이진 정렬 상태
  - grid: 그리드 모드
  - card: 카드 모드
- **q-table 슬롯 상세**:
  - top, bottom: 상단/하단 영역
  - top-selection: 선택 영역
  - header-cell: 헤더 셀 커스터마이징
  - body-cell: 바디 셀 커스터마이징

### 6. Quasar 컴포넌트 상세 - 네비게이션

- **q-tabs**: 탭 (vertical, outside-arrows, mobile-arrows)
- **q-route-tab**: 라우트 탭 (Vue Router 연동)
- **q-tab-panels**: 탭 패널 (swipeable, animated)
- **q-stepper**: 스테퍼 (vertical, alternative-labels)
- **q-breadcrumbs**: breadcrumbs (separator 옵션)
- **q-pagination**: 페이지네이션 (max-pages, boundary-numbers)

### 7. Quasar 컴포넌트 스타일링 옵션

- **공통 스타일 옵션**:
  - outlined: 외곽선 스타일
  - filled: 채움 스타일
  - borderless: 테두리 없음
  - dense: 조밀한 크기
  - flat: 평면 스타일
  - round: 둥근 모서리
  - square: 직각 모서리
  - unelevated: 그림자 없음
  - glossy: 광택 효과
- **크기 옵션**:
  - xs, sm, md, lg, xl
  - size prop (픽셀, rem 등)

### 8. Quasar Auto-Import 시스템

- **자동 임포트**: 컴포넌트, 디렉티브, 플러그인 자동 임포트
- **quasar.config.js 설정**:
  - components: 수동 컴포넌트 지정
  - directives: 수동 디렉티브 지정
- **타입스크립트 지원**: 자동 임포트 타입 정의
- **트리 쉐이킹**: 사용하지 않는 컴포넌트 제외

### 9. Quasar Boot Files

- **부트 파일 개념**: 앱 시작 시 실행되는 파일
- **부트 파일 작성**:
  - 기본 구조 (export default function)
  - app, router, store 접근
- **부트 파일 활용**:
  - 플러그인 초기화
  - 전역 설정
  - 라이브러리 설정

### 10. Quasar Layout 시스템

- **q-layout**: 레이아웃 컨테이너
- **q-header**: 헤더 영역
- **q-footer**: 푸터 영역
- **q-drawer**: 사이드바 (persistent, mini, breakpoint 옵션)
- **q-page-container**: 페이지 컨테이너
- **q-page**: 페이지 컨텐츠
- **레이아웃 모드**:
  - default: 기본 레이아웃
  - left-drawer: 왼쪽 드로어
  - right-drawer: 오른쪽 드로어
  - left-right-drawer: 양쪽 드로어

### 11. Quasar Composables (Composition API)

- **useQuasar**: Quasar 인스턴스 접근
- **useDialogPluginComponent**: 다이얼로그 플러그인 컴포넌트
- **useMeta**: 메타 태그 관리
- **useFormChild**: 폼 자식 컴포넌트 등록
- **useFormData**: 폼 데이터 관리

### 12. Quasar 아이콘 시스템

- **아이콘 세트**:
  - Material Icons (기본)
  - Material Symbols
  - Font Awesome
  - Ionicons
  - MDI
  - Eva Icons
- **아이콘 사용법**:
  - q-icon 컴포넌트
  - name prop
  - size, color 옵션
- **아이콘 커스터마이징**: 커스텀 아이콘 세트 추가

### 13. Quasar 국제화 (i18n)

- **언어 팩**: quasar/lang 설정
- **언어 변경**: $q.lang.set()
- **현재 언어**: $q.lang.isoName
- **날짜/시간 포맷**: Quasar 날짜 유틸리티

### 14. Quasar 날짜 유틸리티

- **formatDate**: 날짜 포맷팅
- **date**: 날짜 객체 생성
- **isValid**: 날짜 유효성 검사
- **getDateDiff**: 날짜 차이 계산
- **addToDate**: 날짜 더하기/빼기

### 15. Quasar 색상 유틸리티

- **colors**: 색상 팔레트 접근
- **getPaletteColor**: 팔레트 색상 가져오기
- **lighten, darken**: 색상 밝기 조절
- **hexToRgb, rgbToHex**: 색상 형식 변환

### 16. Quasar 플랫폼 감지

- **$q.platform**: 플랫폼 정보
  - is.desktop, is.mobile, is.tablet
  - is.ios, is.android
  - is.electron, is.cordova, is.capacitor
- **플랫폼별 조건부 렌더링**

### 17. Quasar 성능 최적화

- **트리 쉐이킹**: 사용하지 않는 컴포넌트 제외
- **코드 스플리팅**: 동적 임포트
- **가상 스크롤**: 대용량 리스트 처리
- **지연 로딩**: 컴포넌트 지연 로딩
- **빌드 최적화**: quasar.config.js 설정

### 18. Quasar 접근성 (A11y)

- **ARIA 속성**: 자동 ARIA 지원
- **키보드 네비게이션**: 키보드 접근성
- **스크린 리더**: 스크린 리더 지원
- **포커스 관리**: 포커스 트랩

### 19. Quasar 애니메이션

- **전환 애니메이션**: q-transition 컴포넌트
- **애니메이션 설정**: quasar.config.js animations 옵션
- **커스텀 애니메이션**: CSS 애니메이션 활용

### 20. Quasar 테마 커스터마이징 (고급)

- **컴포넌트별 변수**: 각 컴포넌트의 SCSS 변수
- **테마 생성**: 커스텀 테마 생성
- **동적 테마 변경**: 런타임 테마 변경

### 21. Quasar 빌드 및 배포

- **빌드 모드**: SPA, PWA, SSR, Electron, Cordova, Capacitor
- **환경 변수**: process.env 활용
- **빌드 최적화**: 코드 분할, 압축
- **배포 설정**: publicPath, distDir

### 22. Quasar 디버깅 및 개발 도구

- **Vue DevTools**: Vue DevTools 연동
- **Quasar DevTools**: Quasar 전용 DevTools
- **소스맵**: 개발 시 소스맵 활성화
- **HMR**: Hot Module Replacement

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-12-19  
**작성자**: NEXA Platform Development Team
