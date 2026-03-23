# 탐색기 ↔ 미디어 탭 동기화 로직 기획

탐색기(우측 패널)와 왼쪽 드로어 미디어 탭 간 **파일 리스트 동기화 및 양방향 연동**을 위한 기획 문서다.

---

## 0. 적용 범위 (의도)

- **탐색기**: 서버 전체 파일을 도메인·경로·검색 기준으로 조회 (useGlobalFileExplorer, GET /files/explorer)
- **미디어 탭**: AI 도메인에서 사용하는 미디어만 카테고리별(갤러리/사운드/영상/문서)로 표시 (useAiAssets, GET /files/list?domain=ai)
- **목표**: 왼쪽 업로드 → 양쪽에 반영, 탐색기에서 선택한 파일 → 미디어 탭에 추가 가능

---

## 1. 배경 및 개념 정리

### 1.1 데이터 모델

| 개념 | 설명 |
|------|------|
| **files** | 물리 파일 저장 정보 (file_path, original_name, category, content_hash 등) |
| **file_references** | 도메인별 파일 참조 (file_id, domain) — 한 파일이 여러 도메인에 연결 가능 |

- **탐색기**: `files` INNER JOIN `file_references` — 어떤 도메인에라도 참조가 있는 파일 전체 표시
- **미디어 탭**: `files` INNER JOIN `file_references` WHERE domain='ai' — **AI 도메인에만** 연결된 파일 표시

### 1.2 현재 흐름

| 동작 | 경로 | 결과 |
|------|------|------|
| 왼쪽 미디어 업로드 | POST /files/upload (domain=ai) | file 생성 + file_reference(ai) 삽입 → 미디어 리스트에 표시, 탐색기에도 표시 |
| 미디어에서 제거 | DELETE /files/:id/reference?domain=ai | file_reference(ai) 삭제 → 미디어 리스트에서 사라짐, 탐색기에는 다른 도메인 참조가 있으면 계속 표시 |
| 탐색기에서 보이는 파일 | GET /files/explorer | 모든 file_references에 포함된 파일 (ai, archive, parts 등) |

### 1.3 요구사항 정리

| 요구사항 | 설명 |
|----------|------|
| **R1** | 왼쪽 미디어 탭에서 업로드 → 미디어 리스트 + 탐색기 **둘 다** 보여야 함 |
| **R2** | 미디어 탭 표시 방식: 갤러리/사운드/영상/문서 등 **카테고리별** 리스트 |
| **R3** | 탐색기에서 선택한 파일을 **미디어 리스트에 추가**할 수 있어야 함 |
| **R4** | 미디어 리스트와 탐색기 간 **실시간/갱신 동기화** 보장 |

---

## 2. 기능 플로우

### 2.1 왼쪽 미디어 탭 업로드 → 양쪽 반영

```
[FileDropZone] POST /files/upload (domain=ai)
       ↓
[서버] files INSERT + file_references INSERT (file_id, domain='ai')
       ↓
[useAiAssets] @add 콜백 → loadCategory(category) 호출 → 미디어 리스트 갱신
       ↓
[useGlobalFileExplorer] 탐색기: domain 미지정 시 전 도메인 조회 → 새 파일 포함
```

**현재 상태**: POST /files/upload는 이미 file_reference(ai)를 삽입함.  
**필요 조치**:  
1. 왼쪽 업로드 직후 useAiAssets.loadCategory() 호출 → **이미 구현됨**  
2. 탐색기 쪽: 업로드 발생 시 탐색기 `refreshList()` 호출 — **이벤트/훅 연동 필요**

### 2.2 탐색기 → 미디어 탭 추가

```
[AiExplorerPanel] 파일 선택 → "미디어에 추가" 버튼 클릭
       ↓
[새 API] POST /api/files/:id/reference (domain=ai)
       ↓
[서버] file_references INSERT (file_id, domain='ai') — 중복 시 무시
       ↓
[useAiAssets] loadCategory(해당 category) 호출 → 미디어 리스트 갱신
```

**현재 상태**: file_reference 추가 API **없음** (DELETE만 존재)  
**필요 조치**: POST /files/:id/reference 신규 추가

---

## 3. API 설계

### 3.1 신규 API: 파일 참조 추가

| 항목 | 내용 |
|------|------|
| **Method** | POST |
| **Path** | `/api/files/:id/reference` |
| **Params** | `:id` — file_id |
| **Body** | `{ domain: string }` 또는 Query `?domain=ai` |
| **Response 201** | `{ ok: true }` |
| **Response 400** | `{ code: 'MISSING_DOMAIN', error: '...' }` |
| **동작** | INSERT IGNORE INTO file_references (file_id, domain) — 이미 있으면 무시 |

### 3.2 기존 API 활용

| API | 용도 |
|-----|------|
| POST /files/upload | 왼쪽 업로드 (domain=ai) |
| GET /files/list?domain=ai&category=... | 미디어 탭 갤러리/사운드/영상/문서 목록 |
| GET /files/explorer | 탐색기 목록 |
| DELETE /files/:id/reference?domain=ai | 미디어 탭에서 제거 |

---

## 4. UI 설계

### 4.1 미디어 탭 리스트 표시 방식

| 카테고리 | 표시 방식 |
|----------|-----------|
| **갤러리** | 이미지 그리드 또는 썸네일 리스트 |
| **사운드** | 오디오 아이템 리스트 (아이콘 + 파일명) |
| **영상** | 비디오 아이템 리스트 (썸네일 또는 아이콘 + 파일명) |
| **문서** | 문서 아이템 리스트 (아이콘 + 파일명) |

*현재 AiLeftNav.vue는 q-expansion-item으로 갤러리/사운드/영상 구분. 기존 구조 유지 가능.*

### 4.2 탐색기 액션 바

AiExplorerPanel.vue의 action-bar에 **"미디어에 추가"** 버튼 추가:

| 버튼 | 설명 |
|------|------|
| 채팅에 넣기 | 기존 |
| 에디터에 넣기 | 기존 |
| 이미지 편집 | 기존 |
| 음원 편집 | 기존 |
| 영상 편집 | 기존 |
| **미디어에 추가** | 선택 파일을 AI 미디어 리스트에 추가 (file_reference 추가) |

- 미디어에 추가 시:
  - 이미 ai 도메인에 참조가 있으면 → "이미 미디어에 있습니다" 토스트
  - 성공 시 → useAiAssets.loadCategory() 호출 + 토스트

---

## 5. 클라이언트 로직

### 5.1 useAiAssets 확장

| 함수 | 역할 |
|------|------|
| `addAsset(payload)` | 기존 — PC 업로드 / 서버 선택 시 미디어 추가 |
| **addFileToMedia(file)** | 신규 — file_id + category로 기존 파일을 미디어에 추가 (POST /files/:id/reference 호출 후 loadCategory) |

### 5.2 업로드 → 탐색기 갱신

방법 A: **이벤트 버스**  
- FileDropZone 또는 handleMediaAdd에서 `upload-complete` 이벤트 발생  
- useGlobalFileExplorer에서 리스닝 → loadItems(false) 호출  

방법 B: **shared state / composable**  
- useAiAssets.uploadFile 성공 시, useGlobalFileExplorer.refreshList() 호출 (의존성 주입 또는 provide/inject)  

방법 C: **탐색기 주기적 새로고침**  
- 사용자가 새로고침 버튼 클릭 시에만 — 최소 구현  

**권장**: 1단계에서는 방법 C(수동 새로고침)로 충족. 이후 방법 A/B로 자동 갱신 확장.

### 5.3 탐색기 → 미디어 추가 플로우

```
AiExplorerPanel.vue
  - "미디어에 추가" 클릭
  - useAiAssets.addFileToMedia(selectedFile) 호출
  - selectedFile: { id, category, original_name, ... }
```

---

## 6. 서버 구현

### 6.1 POST /files/:id/reference

```js
// files.routes.js
router.post('/files/:id/reference', async (req, res) => {
  const fileId = parseInt(req.params.id, 10)
  const domain = req.body?.domain || req.query.domain
  if (!domain || isNaN(fileId)) {
    return res.status(400).json({ code: 'INVALID_PARAMS', error: 'file id와 domain이 필요합니다.' })
  }
  const [existing] = await pool.execute(
    'SELECT 1 FROM files WHERE id = ?',
    [fileId]
  )
  if (existing.length === 0) {
    return res.status(404).json({ code: 'NOT_FOUND', error: '파일을 찾을 수 없습니다.' })
  }
  await pool.execute(
    'INSERT IGNORE INTO file_references (file_id, domain) VALUES (?, ?)',
    [fileId, domain]
  )
  res.status(201).json({ ok: true })
})
```

---

## 7. 구현 순서

| Phase | 내용 |
|-------|------|
| **1** | POST /files/:id/reference API 추가 |
| **2** | useAiAssets.addFileToMedia() 구현 |
| **3** | AiExplorerPanel에 "미디어에 추가" 버튼 추가 |
| **4** | 왼쪽 업로드 시 탐색기 갱신 (이벤트 또는 수동 새로고침 안내) |
| **5** | 이미 미디어에 있는 파일인 경우 UX 처리 (토스트, 버튼 비활성화 등) |

---

## 8. 정리

| 항목 | 내용 |
|------|------|
| **탐색기** | 서버 전체 파일 (file_references 기준) 표시 |
| **미디어 탭** | domain=ai인 파일만 카테고리별(갤러리/사운드/영상/문서) 표시 |
| **왼쪽 업로드** | file + file_reference(ai) 생성 → 미디어·탐색기 둘 다 반영 |
| **탐색기 → 미디어** | POST /files/:id/reference (신규 API)로 file_reference(ai) 추가 |
| **참조** | files.routes.js, useAiAssets.ts, useGlobalFileExplorer.ts, AiLeftNav.vue, AiExplorerPanel.vue |
