# NEXA-개발 전용 파일 편집 API 가이드

> ⚠️ **중요**: 이 API는 개발 환경에서만 사용됩니다. 프로덕션 환경에서는 자동으로 비활성화됩니다.

## 📋 목차

1. [개요](#개요)
2. [API 엔드포인트](#api-엔드포인트)
3. [메타데이터 형식](#메타데이터-형식)
4. [사용 예시](#사용-예시)
5. [문법 및 주의사항](#문법-및-주의사항)
6. [보안 고려사항](#보안-고려사항)
7. [프론트엔드 연동](#프론트엔드-연동)

---

## 개요

개발 전용 파일 편집 API는 개발 환경에서 소스 파일의 메타데이터를 읽고 수정할 수 있도록 하는 범용 API입니다.

### 주요 기능

- **메타데이터 읽기/쓰기**: 파일의 메타데이터 주석을 파싱하고 업데이트
- **파일 내용 읽기/쓰기**: 파일 전체 내용을 읽고 수정
- **다양한 파일 형식 지원**: 현재 Vue 파일 지원, 향후 확장 가능
- **자동 프로덕션 차단**: 프로덕션 환경에서는 모든 요청 자동 거부

### 파일 위치

- **서버**: `server/routes/devOnlyFileEditor.js`
- **등록**: `server/api.js`에서 조건부 등록

---

## API 엔드포인트

### 기본 URL

```
http://localhost:3000/api/dev/files
```

### 1. 메타데이터 읽기

**GET** `/api/dev/files/{filePath}/metadata`

파일에서 메타데이터를 읽어옵니다.

**경로 파라미터: `{filePath}`**: 파일 경로 (예: `guides/styles/charts/bar/NexaChartBar.vue`)

**응답 예시:**
```json
{
  "success": true,
  "metadata": {
    "tags": ["charts", "styles", "데이터시각화"],
    "category": "charts",
    "description": "막대 그래프 샘플 컴포넌트"
  },
  "filePath": "guides/styles/charts/bar/NexaChartBar.vue"
}
```

**메타데이터가 없는 경우:**
```json
{
  "success": true,
  "metadata": null,
  "message": "이 파일 형식은 메타데이터를 지원하지 않습니다.",
  "filePath": "guides/styles/charts/bar/NexaChartBar.vue"
}
```

### 2. 메타데이터 업데이트

**PUT** `/api/dev/files/{filePath}/metadata`

파일의 메타데이터를 업데이트합니다.

**요청 본문:**
```json
{
  "tags": ["charts", "styles", "데이터시각화", "그래프"],
  "category": "charts",
  "description": "막대 그래프 샘플 컴포넌트"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "메타데이터가 업데이트되었습니다.",
  "filePath": "guides/styles/charts/bar/NexaChartBar.vue"
}
```

### 3. 파일 내용 읽기

**GET** `/api/dev/files/{filePath}/content`

파일 전체 내용을 읽어옵니다.

**응답 예시:**
```json
{
  "success": true,
  "content": "<template>...</template>",
  "filePath": "guides/styles/charts/bar/NexaChartBar.vue"
}
```

### 4. 파일 내용 업데이트

**PUT** `/api/dev/files/{filePath}/content`

파일 전체 내용을 업데이트합니다.

**요청 본문:**
```json
{
  "content": "<template>...</template>"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "파일이 업데이트되었습니다.",
  "filePath": "guides/styles/charts/bar/NexaChartBar.vue"
}
```

---

## 메타데이터 형식

### Vue 파일 메타데이터 형식

Vue 파일 상단에 다음과 같은 형식의 주석을 추가합니다:

```vue
<!--
  @tags: tag1, tag2, tag3
  @category: category
  @description: description
-->
<template>
  ...
</template>
```

### 형식 규칙

1. **주석 형식**: HTML 주석 (`<!-- -->`) 사용
2. **위치**: `<template>` 태그 바로 앞에 배치
3. **속성 순서**: `@tags`, `@category`, `@description` 순서 권장 (순서는 자유)
4. **태그 구분**: 쉼표(`,`)로 구분, 공백은 자동으로 제거됨

### 예시

**기본 형식:**
```vue
<!--
  @tags: charts, styles, 데이터시각화
  @category: charts
  @description: 막대 그래프 샘플 컴포넌트
-->
<template>
  ...
</template>
```

**한 줄 형식 (지원됨):**
```vue
<!-- @tags: charts, styles @category: charts @description: 막대 그래프 샘플 -->
<template>
  ...
</template>
```

### 메타데이터 속성 설명

| 속성 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `@tags` | 선택 | 태그 목록 (쉼표로 구분) | `charts, styles, 데이터시각화` |
| `@category` | 선택 | 카테고리명 | `charts` |
| `@description` | 선택 | 설명 | `막대 그래프 샘플 컴포넌트` |

---

## 사용 예시

### JavaScript/Fetch API

```javascript
// 메타데이터 읽기
async function loadMetadata(filePath) {
  const response = await fetch(`http://localhost:3000/api/dev/files/${filePath}/metadata`)
  const data = await response.json()
  return data.metadata
}

// 메타데이터 업데이트
async function saveMetadata(filePath, metadata) {
  const response = await fetch(`http://localhost:3000/api/dev/files/${filePath}/metadata`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tags: metadata.tags || [],
      category: metadata.category || '',
      description: metadata.description || '',
    }),
  })
  return await response.json()
}

// 사용 예시
await saveMetadata('guides/styles/charts/bar/NexaChartBar.vue', {
  tags: ['charts', 'styles', '데이터시각화'],
  category: 'charts',
  description: '막대 그래프 샘플 컴포넌트',
})
```

### Vue 컴포넌트에서 사용

```vue
<script setup>
import { ref } from 'vue'

const filePath = ref('guides/styles/charts/bar/NexaChartBar.vue')
const metadata = ref(null)

// 메타데이터 로드
async function loadMetadata() {
  if (!import.meta.env.DEV) return // 개발 환경에서만
  
  try {
    const response = await fetch(`http://localhost:3000/api/dev/files/${filePath.value}/metadata`)
    const data = await response.json()
    metadata.value = data.metadata
  } catch (error) {
    console.error('메타데이터 로드 실패:', error)
  }
}

// 메타데이터 저장
async function saveMetadata() {
  if (!import.meta.env.DEV) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/dev/files/${filePath.value}/metadata`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tags: metadata.value.tags || [],
        category: metadata.value.category || '',
        description: metadata.value.description || '',
      }),
    })
    
    if (!response.ok) {
      throw new Error('저장 실패')
    }
  } catch (error) {
    console.error('메타데이터 저장 실패:', error)
  }
}
</script>
```

---

## 문법 및 주의사항

### 파일 경로 규칙

1. **상대 경로**: `src/` 폴더 기준 상대 경로 사용
   - ✅ 올바른 예: `guides/styles/charts/bar/NexaChartBar.vue`
   - ❌ 잘못된 예: `/guides/styles/...` (절대 경로)
   - ❌ 잘못된 예: `../guides/...` (상위 디렉토리 참조)

2. **경로 인코딩**: URL 인코딩이 자동으로 처리됨
   - 공백, 한글 등 특수 문자 포함 가능

3. **보안 제한**:
   - `..` (상위 디렉토리) 사용 금지
   - 절대 경로 (`/`, `\`로 시작) 사용 금지

### 메타데이터 주석 규칙

1. **위치**: 반드시 `<template>` 태그 바로 앞에 배치
   ```vue
   <!-- ✅ 올바른 위치 -->
   <!--
     @tags: tag1, tag2
     @category: category
     @description: description
   -->
   <template>
     ...
   </template>
   ```

2. **형식**: HTML 주석 형식 필수
   ```vue
   <!-- ✅ 올바른 형식 -->
   <!-- @tags: tag1, tag2 @category: category -->
   
   <!-- ❌ 잘못된 형식 -->
   // @tags: tag1, tag2
   /* @tags: tag1, tag2 */
   ```

3. **속성 구분**: 속성은 공백으로 구분
   ```vue
   <!-- ✅ 올바른 형식 -->
   <!-- @tags: tag1, tag2 @category: category -->
   
   <!-- ❌ 잘못된 형식 (속성 구분자 없음) -->
   <!-- @tags: tag1, tag2@category: category -->
   ```

4. **태그 구분**: 쉼표로 구분, 공백은 자동 제거
   ```vue
   <!-- ✅ 모두 올바른 형식 -->
   <!-- @tags: tag1,tag2,tag3 -->
   <!-- @tags: tag1, tag2, tag3 -->
   <!-- @tags: tag1,  tag2,  tag3 -->
   ```

5. **기존 메타데이터**: 기존 메타데이터가 있으면 자동으로 교체됨
   - 여러 개의 메타데이터 주석이 있어도 첫 번째만 인식
   - 업데이트 시 기존 주석을 찾아 교체

### 파일 형식 지원

현재 지원하는 파일 형식:

- ✅ **Vue 파일** (`.vue`): 메타데이터 파싱 및 업데이트 지원

향후 지원 예정:

- Markdown 파일 (`.md`)
- JavaScript 파일 (`.js`)
- TypeScript 파일 (`.ts`)

---

## 보안 고려사항

### 개발 환경 전용

1. **자동 차단**: 프로덕션 환경(`NODE_ENV=production`)에서는 모든 요청이 403으로 차단됨
2. **환경 변수 체크**: 서버와 클라이언트 모두에서 환경 체크 수행
3. **프로덕션 배포**: 이 API는 프로덕션 빌드에 포함되지 않도록 주의

### 경로 보안

1. **경로 순회 방지**: `..`, `/`, `\` 사용 금지
2. **파일 경로 검증**: 모든 요청에서 경로 검증 수행
3. **파일 시스템 접근 제한**: `src/` 폴더 내부만 접근 가능

### 에러 처리

1. **파일 없음**: 404 응답
2. **권한 없음**: 403 응답 (프로덕션 환경)
3. **잘못된 요청**: 400 응답
4. **서버 오류**: 500 응답

---

## 프론트엔드 연동

### 개발 환경 체크

프론트엔드에서 API를 호출하기 전에 반드시 개발 환경인지 확인:

```javascript
// Vite 환경
if (!import.meta.env.DEV) {
  console.warn('개발 환경에서만 파일 저장이 가능합니다.')
  return
}

// 또는
if (import.meta.env.PROD) {
  return // 프로덕션에서는 실행하지 않음
}
```

### 실제 사용 예시 (DevGuidePanel.vue)

```javascript
// 파일에 메타데이터 저장
async function saveMetadataToFile() {
  if (!selectedSample.value?.componentPath) return

  // 개발 환경에서만 API 호출
  if (!import.meta.env.DEV) {
    console.warn('[DevGuidePanel] 개발 환경에서만 파일 저장이 가능합니다.')
    return
  }

  try {
    const filePath = selectedSample.value.componentPath
    const response = await fetch(`http://localhost:3000/api/dev/files/${filePath}/metadata`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: selectedSample.value.tags || [],
        category: selectedSample.value.category || '',
        description: selectedSample.value.description || '',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '메타데이터 저장 실패')
    }
  } catch (error) {
    console.error('[DevGuidePanel] 메타데이터 저장 실패:', error)
  }
}
```

---

## 주의사항

### ⚠️ 중요 사항

1. **프로덕션 배포 전 확인**
   - `NODE_ENV=production`으로 설정되어 있는지 확인
   - 프로덕션 환경에서는 API가 자동으로 차단되지만, 코드는 포함됨

2. **파일 백업**
   - 파일을 직접 수정하므로 중요한 변경 전 백업 권장
   - Git을 사용하는 경우 커밋 후 사용

3. **동시 수정 주의**
   - 여러 사용자가 동시에 같은 파일을 수정하면 충돌 가능
   - 마지막 저장이 우선 적용됨

4. **파일 형식 제한**
   - 현재는 Vue 파일만 메타데이터 파싱 지원
   - 다른 파일 형식은 `metadata: null` 반환

5. **경로 오류**
   - 파일 경로가 잘못되면 404 에러 발생
   - `componentPath`가 정확한지 확인 필요

### 권장 사항

1. **태그 관리**
   - 태그는 소문자로 통일 권장
   - 한글 태그 사용 가능
   - 태그는 쉼표로 구분, 공백은 자동 제거

2. **카테고리 관리**
   - 카테고리는 파일 경로에서 자동 추출되지만 수동으로 변경 가능
   - 일관성 유지 권장

3. **설명 작성**
   - 간결하고 명확한 설명 작성
   - 한글/영문 모두 사용 가능

---

## 문제 해결

### 404 에러

**원인**
- 라우터가 등록되지 않음
- 파일 경로가 잘못됨
- 서버가 재시작되지 않음

**해결 방법:**
1. 서버 재시작 확인
2. 서버 콘솔에서 `[DevFileEditor] 개발 전용 파일 편집 API 등록 완료` 메시지 확인
3. 파일 경로가 `src/` 기준 상대 경로인지 확인

### 403 에러

**원인**
- 프로덕션 환경에서 실행 중
- `NODE_ENV`가 `production`으로 설정됨

**해결 방법:**
1. `NODE_ENV=development`로 설정
2. `npm run dev:server`로 서버 실행

### 메타데이터가 저장되지 않음

**원인**
- 파일 형식이 지원되지 않음
- 메타데이터 형식이 잘못됨

**해결 방법:**
1. 파일 확장자가 `.vue`인지 확인
2. 메타데이터 주석 형식 확인
3. 서버 콘솔 에러 로그 확인

---

## 참고 자료

- **서버 파일**: `server/routes/devOnlyFileEditor.js`
- **등록 위치**: `server/api.js`
- **사용 예시**: `src/components/sidebars/right/dev-tools/DevGuidePanel.vue`

---

**최종 업데이트**: 2024년 12월

