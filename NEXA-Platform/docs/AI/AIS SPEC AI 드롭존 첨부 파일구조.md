# AI 드롭존·첨부 기능 — 파일 구조

> 본 문서는 `AI_드롭존_첨부_기능_플랜.md` 구현 시 생성·수정되는 파일 및 디렉터리 구조를 정리한다.

---

## 1. 신규 생성 파일

### 1.1 시스템 컴포넌트 (system 계층)

```
src/system/components/ui/
├── FileDropZone.vue      # My PC / Web Server 토글, 드롭존, 첨부 버튼
└── FileBrowserModal.vue  # DB 연결 웹 탐색기 (서버 파일 브라우저)
```

| 파일 | 설명 |
|------|------|
| `FileDropZone.vue` | My PC / Web Server 토글, 드롭존, 파일 선택 버튼. Props: uploadUrl, listUrl, accept, label, multiple |
| `FileBrowserModal.vue` | virtual_path 기반 브레드크럼, 폴더/파일 리스트, "추가"/"취소" |

### 1.2 AI 도메인 컴포저블

```
src/domains/ai/composables/
└── useAiAssets.js        # domain='ai' 전용 files API 래퍼 (documents, images, audio, videos)
```

### 1.3 서버 (전역 files API)

초기에는 `ai.routes.js`에 마운트하되, **핸들러·서비스 함수명은 도메인 중립**으로 설계한다. 이후 archive, parts 등에서 재사용 시 전역 모듈로 분리.

```
server/
├── domains/ai/
│   └── ai.routes.js      # (수정) /files/upload, /files/list 등 마운트
│   └── ai.service.js    # (수정) uploadFile, listFiles 등 도메인 중립 함수 추가
│
# 또는 전역 분리 시: (추후)
├── routes/
│   └── files.routes.js   # 전역 files API
└── services/
    └── files.service.js # uploadFile, listFiles, contentHash 등
```

### 1.4 DB 마이그레이션

```
database/
└── init_postgres.sql   # files, file_references 포함 전체 스키마
```

**실행**: `psql -U 사용자 -d DB명 -f database/init_postgres.sql` (Postgres) 또는 DBeaver에서 스크립트 실행

---

## 2. 수정 대상 파일

### 2.1 AI 도메인

| 파일 | 수정 내용 |
|------|----------|
| `src/domains/ai/views/left/AiLeftNav.vue` | 문서 아코디언: "준비 중" → FileDropZone 삽입. uploadUrl, listUrl, domain='ai' |
| `src/domains/ai/views/left/AiLeftNav.vue` | 미디어 아코디언: 갤러리/사운드/영상 각각 FileDropZone 삽입, accept 등 타입별 props |
| `src/domains/ai/components/AiEditorPanel.vue` | uploadHandler → files API 연동 (domain 전달) |
| `src/domains/ai/components/AiChatPanel.vue` | 클립보드 이미지 → 서버 업로드 후 URL (domain=ai, category=images) |

### 2.2 서버

| 파일 | 수정 내용 |
|------|----------|
| `server/domains/ai/ai.routes.js` | POST /files/upload, GET /files/list, DELETE, PATCH /files/:id/verify, POST /files/:id/reprocess 마운트 |
| `server/domains/ai/ai.service.js` | uploadFile, listFiles, contentHash 계산, magic number 검증 |

### 2.3 기존 유틸 (확장·수정 검토)

| 파일 | 용도 |
|------|------|
| `server/utils/fileUpload.js` | partsCreateSafeFilename, partsGenerateFilename → 범용 함수(날짜시간+shortUuid) 추가 |
| `server/config/fileTypes.js` | category, type, maxSize, mime 확장 |

---

## 3. 물리 저장 경로 (uploads)

```
uploads/
├── ai/
│   ├── documents/
│   │   └── [YYYY-MM-DD]/    # 날짜 분리 시 (섹션 5.2)
│   ├── images/
│   ├── audio/
│   └── video/
├── archive/
│   └── ...
└── parts/
    └── ...
```

**파일명 규칙**: `{YYYYMMDDHHmmss}_{shortUuid}.{ext}`  
예: `uploads/ai/documents/2025-02-24/20250224143022_a1b2c3d4.pdf`

---

## 4. DB 테이블

| 테이블 | 용도 |
|--------|------|
| `files` | 물리 파일 메타데이터, content_hash, ai_workflow_*, ai_review_*, source_metadata |
| `file_references` | 도메인별 파일 참조 (domain, project_id, virtual_path) |
| `file_ai_metadata` | AI 추출 텍스트, 키워드, 요약 |
| `file_tags` | AI/사람 태그 (tag, score, source) |
| `file_embeddings` | 벡터 임베딩 (BLOB). 부담 시 벡터 DB 이전 검토 |
| `file_action_log` | AI·사람 행동 이력 (감사·추적용) |
| `edge_device` | 엣지/IOT 기기 등록 (업로드 화이트리스트·인증) |

---

## 5. 참고 파일 (수정 없음)

| 파일 | 용도 |
|------|------|
| `server/domains/parts/partFiles.routes.js` | multer, FormData 업로드 패턴 참고 |
| `server/config/fileTypes.js` | category, type, maxSize, mime |
| `server/utils/fileUpload.js` | partsCreateSafeFilename, partsGenerateFilename (부품 전용), generateFolderPath, generateTimestampFilename, computeContentHash (범용) |
| `src/system/components/ui/UploadProgress.vue` | 진행률 UI |
| `src/engines/tiptap/BaseTiptapEditor.vue` | uploadHandler, context.source |
| `docs/database/file_upload_logic_final.md` | parts 한글 인코딩, sequence 로직 |

---

## 6. Phase별 파일 생성·수정 순서

| Phase | 신규 | 수정 |
|-------|------|------|
| **Phase 1** | DB 마이그레이션 | server/utils, server/config |
| **Phase 2** | FileDropZone.vue, FileBrowserModal.vue | — |
| **Phase 3** | useAiAssets.js | ai.routes.js, ai.service.js, AiLeftNav.vue |
| **Phase 4** | — | AiEditorPanel.vue, AiChatPanel.vue, 고아 정리 |

---

## 7. AGENTS.md 준수 사항

- **system**: `/src/system/**` 신규 추가는 **명시적 지시**에 한해 허용. FileDropZone, FileBrowserModal은 사용자 지시로 추가.
- **domains**: `/src/domains/ai/**`만 수정. 다른 도메인(archive, parts) 교차 수정 금지.
- **No-Touch**: `/src/frame/**`, `/src/engines/**`, `/src/assets/**`, `/public/**` 수정 금지.
