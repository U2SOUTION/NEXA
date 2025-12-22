# DEV 우측 사이드바 통합 개선 작업 기획서

## 📋 개요

DEV 페이지(`/dev`)의 우측 사이드바(`DevToolsPanel.vue`)에 다음 기능들을 통합하여 전체 시스템의 UX를 일관되게 개선합니다:

1. **마크다운 뷰어 표시 옵션** (논의된 기능)
2. **목차(TOC) 기능 통합**
3. **파일 액션 기능** (왼쪽 사이드바 상단 기능 일부 복사)
4. **전체 시스템 UX 통일**

---

## 🎯 목표

### 1. 기능 통합

- 우측 사이드바에서 문서 관련 모든 기능을 한 곳에서 접근 가능
- 불필요한 UI 중복 제거
- 사용자 경험 일관성 향상

### 2. UX 통일

- 왼쪽 사이드바와 우측 사이드바의 디자인 패턴 통일
- 버튼 스타일, 레이아웃, 인터랙션 패턴 일관화
- 전체 시스템의 시각적 일관성 확보

---

## 📐 현재 구조 분석

### 우측 사이드바 (DevToolsPanel.vue)

```
DevToolsPanel.vue
├─ 헤더 (Tools Panel)
├─ Push/Overlay 모드 전환
└─ 아코디언 섹션
   └─ Mermaid 차트 스타일 편집 (조건부 표시)
```

### 목차 기능 (TOCPanel.vue)

- 현재: 오버레이 패널로 표시 (우측 상단 고정)
- 위치: `src/modules/document-manager/components/TOCPanel.vue`
- 기능:
  - 목차 트리 표시
  - 전체 펼치기/접기
  - 아코디언 모드
  - 자동 닫기 옵션
  - 현재 섹션 하이라이트

### 파일 액션 기능 (DevelopmentPage.vue 헤더)

- 현재: 파일 내용 헤더에 버튼으로 표시
- 기능:
  - 이름 변경
  - 수정일 갱신
  - 업데이트
  - 휴지통
  - 편집
  - 다이어그램 편집 (Mermaid)
  - 목차

### 왼쪽 사이드바 상단 기능 (DocumentListSidebar.vue)

- 검색 및 필터
- 통계 요약
- 빠른 액션 버튼 (6개 아이콘 그리드)

---

## 🏗️ 개선 계획

### Phase 1: 마크다운 뷰어 표시 옵션 추가

#### 1.1 리스트 스타일 옵션

**위치**: `DevToolsPanel.vue` → 새 아코디언 섹션

**기능**:

- 리스트 표시 모드 선택
  - 간결 모드 (현재 방식): 점 없음, 들여쓰기 최소화
  - 상세 모드 (에디터 프리뷰 방식): 점 표시, 들여쓰기 표현
- 실시간 미리보기
- 설정 저장 (localStorage)

**UI 구성**:

```vue
<q-expansion-item icon="format_list_bulleted" label="리스트 스타일" header-class="tools-section-title">
  <DocumentViewOptionsSection />
</q-expansion-item>
```

**컴포넌트**: `DocumentViewOptionsSection.vue` 생성

- 위치: `src/modules/document-manager/components/sections/DocumentViewOptionsSection.vue`
- 기능:
  - 리스트 스타일 토글 (간결/상세)
  - 향후 확장 가능한 다른 뷰 옵션들

**CSS 적용**:

- 간결 모드: `list-style: none`, `padding-left: 0`
- 상세 모드: `list-style: disc`, `padding-left: 1.5em`

#### 1.2 향후 확장 가능한 옵션들

- 전체 레이아웃 밀도 (간격 조절)
- 코드 블록 스타일 (확장/축소)
- 링크 표시 방식
- 이미지 표시 방식
- 인용문 표시 방식

---

### Phase 2: 목차 기능 통합

#### 2.1 목차를 우측 사이드바로 이동

**현재**: 오버레이 패널 (우측 상단 고정)
**변경**: 우측 사이드바 아코디언 섹션으로 통합

**장점**:

- 오버레이 제거로 화면 공간 확보
- 사이드바에서 모든 문서 기능 접근 가능
- UX 일관성 향상

**구현**:

```vue
<q-expansion-item icon="menu" label="목차" header-class="tools-section-title" :model-value="tocExpanded" @update:model-value="onTOCExpansionChange">
  <TOCSection />
</q-expansion-item>
```

**컴포넌트**: `TOCSection.vue` 생성

- 위치: `src/modules/document-manager/components/sections/TOCSection.vue`
- 기존 `TOCPanel.vue`의 기능을 재사용하되 사이드바에 맞게 조정
- 오버레이 제거, 사이드바 내부 스크롤 영역에 통합

**기능 유지**:

- 목차 트리 표시
- 전체 펼치기/접기
- 아코디언 모드
- 자동 닫기 옵션 (사이드바에서는 의미 없으므로 제거 또는 다른 기능으로 대체)
- 현재 섹션 하이라이트

**변경 사항**:

- 오버레이 스타일 제거
- 사이드바 스크롤 영역 내부에 통합
- 헤더의 토글 버튼들 사이드바 아코디언 헤더로 이동

#### 2.2 DevelopmentPage.vue 수정

- 목차 버튼 제거 또는 우측 사이드바 토글로 변경
- `TOCPanel` 컴포넌트 제거
- 목차 관련 로직은 유지 (store 연동)

---

### Phase 3: 파일 액션 기능 통합

#### 3.1 파일 액션 섹션 추가

**위치**: `DevToolsPanel.vue` → 새 아코디언 섹션

**기능**: DevelopmentPage 헤더의 파일 액션 버튼들을 사이드바로 이동

**UI 구성**:

```vue
<q-expansion-item icon="description" label="파일 액션" header-class="tools-section-title" default-opened>
  <FileActionsSection />
</q-expansion-item>
```

**컴포넌트**: `FileActionsSection.vue` 생성

- 위치: `src/modules/document-manager/components/sections/FileActionsSection.vue`
- 기능:
  - 파일명 표시 (읽기 전용 또는 편집 가능)
  - 파일 경로 표시
  - 액션 버튼 그리드:
    - 이름 변경
    - 수정일 갱신
    - 업데이트
    - 휴지통
    - 편집
    - 다이어그램 편집 (Mermaid, 조건부 표시)
  - 파일 통계 (진행률, 완료/미완료 수)

**디자인**:

- 왼쪽 사이드바의 아이콘 그리드 패턴 참고
- 버튼 스타일 통일
- 통계는 왼쪽 사이드바와 동일한 스타일

#### 3.2 DevelopmentPage.vue 수정

- 파일 헤더의 액션 버튼 제거
- 파일명과 통계는 유지 (간소화)
- 파일 액션은 우측 사이드바에서만 접근

---

### Phase 4: UX 통일 및 개선

#### 4.1 디자인 패턴 통일

**아코디언 헤더 스타일**:

- 왼쪽 사이드바와 동일한 색상, 폰트, 간격
- 아이콘 + 레이블 패턴 통일

**버튼 스타일**:

- 왼쪽 사이드바의 `btn-nexa-primary`, `btn-nexa-secondary` 패턴 적용
- 아이콘 그리드 레이아웃 통일

**색상 및 간격**:

- CSS 변수 사용 (`--nexa-*`)
- 간격 통일 (q-pa-sm, q-mb-md 등)

#### 4.2 인터랙션 패턴 통일

**아코디언 동작**:

- 기본 펼침/접힘 상태 저장 (localStorage)
- 애니메이션 일관성

**버튼 피드백**:

- 호버 효과 통일
- 클릭 피드백 통일
- 툴팁 스타일 통일

#### 4.3 반응형 처리

- 모바일에서 사이드바 접기/펼치기
- 작은 화면에서 아코디언 자동 접기

---

## 📁 파일 구조

### 새로 생성할 파일

```
src/modules/document-manager/components/sections/
├─ DocumentViewOptionsSection.vue      # 마크다운 뷰어 옵션
├─ TOCSection.vue                      # 목차 섹션 (TOCPanel 기반)
└─ FileActionsSection.vue              # 파일 액션 섹션
```

### 수정할 파일

```
src/components/sidebars/right/
└─ DevToolsPanel.vue                    # 우측 사이드바 메인 컴포넌트

src/pages/
└─ DevelopmentPage.vue                  # 파일 헤더 간소화, 목차 버튼 제거

src/stores/
└─ documentManagerStore.js              # 목차 관련 상태 관리 (필요시)
```

### 제거/비활성화할 파일

```
src/modules/document-manager/components/
└─ TOCPanel.vue                         # 오버레이 패널 (기능은 TOCSection으로 이동)
```

---

## 🔧 구현 세부사항

### 1. DocumentViewOptionsSection.vue

**기능**:

- 리스트 스타일 토글 (간결/상세)
- 설정 저장/로드 (localStorage)
- 실시간 CSS 클래스 적용

**Props**:

- 없음 (store에서 직접 접근)

**Events**:

- 없음 (store에 직접 저장)

**스타일 적용**:

```scss
.markdown-content {
  &.list-compact {
    ul,
    ol {
      list-style: none;
      padding-left: 0;
    }
  }

  &.list-detailed {
    ul,
    ol {
      list-style: disc;
      padding-left: 1.5em;
    }
  }
}
```

### 2. TOCSection.vue

**기능**:

- 기존 `TOCPanel.vue`의 목차 트리 표시 기능 재사용
- 오버레이 제거, 사이드바 내부에 통합
- 아코디언 모드, 전체 펼치기/접기 유지

**Props**:

- `items`: 목차 항목 배열
- `expandedMap`: 확장 상태 맵
- `currentSectionId`: 현재 섹션 ID
- `autoCollapse`: 아코디언 모드

**Events**:

- `toggle`: 항목 토글
- `scroll-to`: 섹션으로 스크롤

**스타일**:

- 오버레이 스타일 제거
- 사이드바 스크롤 영역 내부 스타일
- 최대 높이 제한 (스크롤 가능)

### 3. FileActionsSection.vue

**기능**:

- 파일 정보 표시 (이름, 경로)
- 액션 버튼 그리드 (6개)
- 파일 통계 표시

**Props**:

- 없음 (store에서 직접 접근)

**Events**:

- 없음 (기존 함수 재사용)

**버튼 그리드 레이아웃**:

```
[이름 변경] [수정일 갱신] [업데이트]
[휴지통]    [편집]        [다이어그램 편집]
```

**통계 표시**:

- 진행률 바
- 완료/미완료/전체 수

---

## 🎨 디자인 가이드

### 색상

- Primary: `var(--q-primary)`
- Background: `var(--nexa-background)`
- Surface: `var(--nexa-surface)`
- Border: `var(--nexa-border-color)`
- Text Primary: `var(--nexa-text-primary)`
- Text Secondary: `var(--nexa-text-secondary)`

### 간격

- 섹션 간격: `q-mb-md` (16px)
- 내부 패딩: `q-pa-sm` (8px)
- 버튼 간격: `q-gutter-xs` (4px)

### 타이포그래피

- 섹션 제목: `text-subtitle2` (14px, bold)
- 레이블: `text-caption` (12px)
- 버튼 텍스트: `text-body2` (14px)

---

## 📊 작업 우선순위

### High Priority

1. ✅ **Phase 1**: 마크다운 뷰어 표시 옵션 (리스트 스타일)
2. ✅ **Phase 2**: 목차 기능 통합
3. ✅ **Phase 3**: 파일 액션 기능 통합

### Medium Priority

4. **Phase 4**: UX 통일 및 개선
5. 추가 뷰 옵션 (레이아웃 밀도, 코드 블록 스타일 등)

### Low Priority

6. 반응형 개선
7. 애니메이션 추가
8. 접근성 개선

---

## 🧪 테스트 계획

### 기능 테스트

- [ ] 리스트 스타일 토글이 정상 작동하는가?
- [ ] 목차가 사이드바에 정상 표시되는가?
- [ ] 파일 액션이 정상 작동하는가?
- [ ] 설정이 localStorage에 저장되는가?

### UI 테스트

- [ ] 왼쪽 사이드바와 스타일이 일관되는가?
- [ ] 아코디언이 정상 작동하는가?
- [ ] 스크롤이 정상 작동하는가?
- [ ] 반응형 레이아웃이 정상 작동하는가?

### 통합 테스트

- [ ] 기존 기능이 정상 작동하는가?
- [ ] Mermaid 편집 기능이 정상 작동하는가?
- [ ] 목차 스크롤이 정상 작동하는가?

---

## 📝 참고사항

### 기존 컴포넌트 재사용

- `TOCPanel.vue`의 로직을 `TOCSection.vue`에서 재사용
- `TOCItem.vue`는 그대로 사용
- `useTOC.js` composable 재사용

### Store 연동

- `documentManagerStore`에서 상태 관리
- 목차 관련 상태는 기존 store 유지
- 뷰 옵션 설정은 localStorage에 저장

### 마이그레이션

- 기존 TOC 오버레이 사용자: 자동으로 사이드바로 전환
- 기존 설정은 localStorage에서 자동 로드

---

## 🚀 배포 계획

### Step 1: Phase 1 구현 (리스트 스타일 옵션)

- `DocumentViewOptionsSection.vue` 생성
- `DevToolsPanel.vue`에 섹션 추가
- CSS 클래스 적용
- 테스트 및 검증

### Step 2: Phase 2 구현 (목차 통합)

- `TOCSection.vue` 생성
- `DevToolsPanel.vue`에 섹션 추가
- `DevelopmentPage.vue`에서 오버레이 제거
- 테스트 및 검증

### Step 3: Phase 3 구현 (파일 액션 통합)

- `FileActionsSection.vue` 생성
- `DevToolsPanel.vue`에 섹션 추가
- `DevelopmentPage.vue` 헤더 간소화
- 테스트 및 검증

### Step 4: Phase 4 구현 (UX 통일)

- 스타일 통일 작업
- 반응형 개선
- 최종 테스트 및 검증

---

## 📌 체크리스트

### 개발 전

- [ ] 기획서 검토 및 승인
- [ ] 디자인 시안 확인 (필요시)
- [ ] 작업 환경 준비

### 개발 중

- [ ] Phase 1 완료
- [ ] Phase 2 완료
- [ ] Phase 3 완료
- [ ] Phase 4 완료

### 개발 후

- [ ] 기능 테스트 완료
- [ ] UI 테스트 완료
- [ ] 통합 테스트 완료
- [ ] 문서 업데이트
- [ ] 코드 리뷰
- [ ] 배포

---

## 📚 관련 문서

- [사이드바 아키텍처 가이드](./사이드바_아키텍처_가이드%20---%20프로그램%20재수정.md)
- [Mermaid 스타일 커스터마이징 계획](./MERMAID_STYLE_CUSTOMIZATION_PLAN.md)
- [마크다운 파서 최적화](./markdownParser.js)

---

**작성일**: 2025-01-XX
**작성자**: AI Assistant
**버전**: 1.0
