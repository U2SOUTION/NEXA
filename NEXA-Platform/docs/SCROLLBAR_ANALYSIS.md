# 스크롤바 통일 작업 - 종합 분석 및 단계별 계획

## 📋 현재 상태 분석

### 1. 전역 스타일 현황 (`src/css/app.scss`)

**네이티브 스크롤바 스타일 (33-50줄)**
```scss
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--nexa-scrollbar-track);
}

::-webkit-scrollbar-thumb {
  background: var(--nexa-scrollbar-thumb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--nexa-scrollbar-thumb-hover);
}
```

**문제점:**
- `::-webkit-scrollbar`는 네이티브 브라우저 스크롤바에만 적용됨
- Quasar의 `q-scrollarea` 컴포넌트는 자체 스크롤바 시스템을 사용하므로 이 스타일이 적용되지 않음

### 2. 개별 컴포넌트 스타일 현황

#### 왼쪽 사이드바 (`DocumentListSidebar.vue`)
- **위치**: `src/components/sidebars/left/DocumentListSidebar.vue` (932-943줄)
- **스타일**: `scoped` 스타일 사용
- **스크롤바 스타일**:
  ```scss
  .file-list-scroll-area {
    :deep(.q-scrollarea__thumb) {
      width: 3px;  // ⚠️ 개별 설정
    }
    :deep(.q-scrollarea__bar) {
      width: 2px;  // ⚠️ 개별 설정
    }
  }
  ```

#### 오른쪽 사이드바 컴포넌트들

**DevToolsPanel.vue**
- **위치**: `src/components/sidebars/right/DevToolsPanel.vue` (112-139줄)
- **스타일**: 전역 스타일 (scoped 없음)
- **스크롤바 스타일**: 없음 (Quasar 기본값 사용)

**DefaultRightPanel.vue**
- **위치**: `src/components/sidebars/right/DefaultRightPanel.vue` (35-72줄)
- **스타일**: `scoped` 스타일 사용
- **스크롤바 스타일**: 없음 (Quasar 기본값 사용)

**NexaBoardToolsPanel.vue**
- **위치**: `src/components/sidebars/right/NexaBoardToolsPanel.vue` (48-82줄)
- **스타일**: 전역 스타일 (scoped 없음)
- **스크롤바 스타일**: 없음 (Quasar 기본값 사용)

### 3. 테마 변수 현황

**⚠️ 문제 발견**: 
- `app.scss`에서 `--nexa-scrollbar-track`, `--nexa-scrollbar-thumb`, `--nexa-scrollbar-thumb-hover` 변수 사용
- **하지만 테마 파일(`dark.scss`, `light.scss`)에 이 변수들이 정의되어 있지 않음**
- 모달 스크롤바 변수만 존재: `--nexa-modal-scrollbar`, `--nexa-modal-scrollbar-hover`

**결과**: 스크롤바 색상이 적용되지 않거나 기본값 사용

### 4. MainLayout.vue 스타일

- **위치**: `src/layouts/MainLayout.vue`
- **스크롤바 관련 스타일**: 없음

## 🔍 문제점 종합

### 주요 문제
1. **스타일 불일치**
   - 왼쪽 사이드바: 3px thumb, 2px bar (개별 설정)
   - 오른쪽 사이드바: Quasar 기본값 (투명하거나 다른 스타일)
   - 전역 스타일: 8px (네이티브 스크롤바용, q-scrollarea에 적용 안 됨)

2. **스타일 관리 분산**
   - 각 컴포넌트에 개별 스타일 존재
   - 전역 통일 관리 부재
   - 수정 시 여러 파일 수정 필요

3. **Quasar q-scrollarea 특성**
   - Quasar는 자체 스크롤바 시스템 사용
   - `::-webkit-scrollbar` 스타일이 적용되지 않음
   - `.q-scrollarea__thumb`, `.q-scrollarea__bar` 클래스를 사용해야 함

4. **스타일 스코프 혼재**
   - 일부는 `scoped`, 일부는 전역 스타일
   - `:deep()` 사용 패턴 불일치

## 📝 단계별 해결 계획

### ✅ 1단계: 현재 상태 정확히 파악 (완료)
- [x] 모든 `q-scrollarea` 사용 위치 확인
  - 왼쪽: `DocumentListSidebar.vue`
  - 오른쪽: `DevToolsPanel.vue`, `DefaultRightPanel.vue`, `NexaBoardToolsPanel.vue`
- [x] 각 컴포넌트의 스크롤바 스타일 현황 문서화
- [x] 테마 변수 정의 확인
  - **문제**: `--nexa-scrollbar-*` 변수가 테마 파일에 없음
- [x] Quasar 기본 스크롤바 스타일 확인

### ✅ 2단계: 목표 스타일 정의
- [ ] 통일된 스크롤바 크기 결정
  - 현재 왼쪽: thumb 3px, bar 2px
  - 제안: thumb 1px, bar 1px (또는 사용자 확인)
- [ ] 테마 변수 추가 (`dark.scss`, `light.scss`)
  - `--nexa-scrollbar-track`
  - `--nexa-scrollbar-thumb`
  - `--nexa-scrollbar-thumb-hover`
- [ ] 호버 효과 정의

### ✅ 3단계: 테마 변수 추가
- [ ] `dark.scss`에 스크롤바 변수 추가
- [ ] `light.scss`에 스크롤바 변수 추가
- [ ] 기존 모달 스크롤바 변수와 일관성 유지

### ✅ 4단계: 전역 스타일 추가 (`app.scss`)
- [ ] `q-scrollarea` 전역 스타일 추가
- [ ] 모든 선택자 패턴 커버
  - `.q-scrollarea` (하이픈 없음)
  - `.q-scroll-area` (하이픈 있음)
  - 하위 요소: `.q-scrollarea__thumb`, `.q-scrollarea__bar`
- [ ] 테마 변수 사용
- [ ] `!important` 사용 최소화 (필요시만)
- [ ] 가시성 보장 (`opacity: 1`, `visibility: visible`)

### ✅ 5단계: 개별 컴포넌트 스타일 정리
- [ ] 왼쪽 사이드바 개별 스타일 제거
  - `DocumentListSidebar.vue`의 `:deep(.q-scrollarea__thumb)`, `:deep(.q-scrollarea__bar)` 제거
- [ ] 오른쪽 사이드바 개별 스타일 확인
  - 현재 개별 스크롤바 스타일 없음 (OK)
- [ ] 전역 스타일이 우선 적용되도록 확인

### ✅ 6단계: 테스트 및 검증
- [ ] 왼쪽 사이드바 스크롤바 확인
- [ ] 오른쪽 사이드바 스크롤바 확인
- [ ] 컨텐츠 영역 스크롤바 확인
- [ ] 다크/라이트 테마 모두 확인
- [ ] 스크롤바 가시성 확인
- [ ] 스크롤바 크기 일관성 확인

### ✅ 7단계: 문서화
- [ ] 변경 사항 문서화
- [ ] 스타일 가이드 업데이트

## 🎯 목표

1. **통일성**: 모든 사이드바와 컨텐츠 영역의 스크롤바가 동일한 스타일
2. **유지보수성**: 전역 스타일에서 한 곳에서 관리
3. **테마 지원**: 다크/라이트 테마 모두 지원
4. **가시성**: 스크롤바가 명확히 보이도록 설정

## ⚠️ 주의사항

1. **Quasar 클래스명**: `q-scrollarea` (하이픈 없음)와 `q-scroll-area` (하이픈 있음) 모두 사용 가능
2. **스타일 우선순위**: 전역 스타일 > 개별 컴포넌트 스타일
3. **`:deep()` 사용**: scoped 스타일에서 자식 컴포넌트 스타일링 시 필요
4. **테마 변수**: 모든 색상은 테마 변수 사용 필수

## 📌 다음 단계

1단계부터 순차적으로 진행하여 문제를 체계적으로 해결합니다.

