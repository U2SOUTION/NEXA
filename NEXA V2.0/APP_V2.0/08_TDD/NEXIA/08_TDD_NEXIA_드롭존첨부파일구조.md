---
see_also: []
doc_id: TDD-013
title: "드롭존 · 첨부 파일 구조"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-11
parent_doc: TDD-010
implements_doc: PRD-005
terms_standard: ["file-upload", "multipart", "rest"]
terms_nexa: ["NEXIA", "FileDropZone", "NexiaLeftNav", "files"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/file-upload", "std/multipart", "std/rest", "nexa/NEXIA", "nexa/FileDropZone", "nexa/NexiaLeftNav", "nexa/files"]
---

# NEXIA · 드롭존·첨부 파일 구조

> **PRD:** [`05_PRD_NEXIA_드롭존첨부기능플랜`](../../05_PRD/NEXIA/05_PRD_NEXIA_드롭존첨부기능플랜.md)
> **스택:** nexia `apps/web` · `apps/backend`. 아래 `src/system`·`server/domains` 경로는 **레거시** 참고용.

---

## 1. 신규 생성 파일

### 1.1 시스템 컴포넌트 (system 계층)

```json
apps/web/src/components/ui/
├── FileDropZone.tsx      # My PC / Web Server 토글, 드롭존, 첨부 버튼
└── FileBrowserModal.tsx  # DB 연결 웹 탐색기 (서버 파일 브라우저)
```

| 파일 | 설명 |
|------|------|
| `FileDropZone.tsx` | My PC / Web Server 토글, 드롭존, 파일 선택 버튼. Props: uploadUrl, listUrl, accept, label, multiple |
| `FileBrowserModal.tsx` | virtual_path 기반 브레드크럼, 폴더/파일 리스트, " 추가 "/" 취소 " |

### 1.2 NEXIA 도메인 컴포저블

```json
apps/web/src/domains/nexia/hooks/
└── useNexiaAssets.ts        # domain='nexia' 전용 files API 래퍼 (documents, images, audio, videos)
```

### 1.3 서버 (전역 files API)

초기에는 `nexia.routes.ts` 에 마운트하되, **핸들러·서비스 함수명은 도메인 중립**으로 설계한다. 이후 archive, parts 등에서 재사용 시 전역 모듈로 분리.

```json
server/
├── domains/ai/
│   └── nexia.routes.ts      # (수정) /files/upload, /files/list 등 마운트
│   └── nexia.service.ts    # (수정) uploadFile, listFiles 등 도메인 중립 함수 추가
│
# 또는 전역 분리 시: (추후)
├── routes/
│   └── files.routes.js   # 전역 files API
└── services/
    └── files.service.js # uploadFile, listFiles, contentHash 등
```

### 1.4 DB 마이그레이션

```json
database/
└── init_postgres.sql   # files, file_references 포함 전체 스키마
```

**실행**: `psql -U 사용자 -d DB명 -f database/init_postgres.sql` (Postgres) 또는 DBeaver 에서 스크립트 실행

---

## 2. 수정 대상 파일

### 2.1 NEXIA 도메인

| 파일 | 수정 내용 |
|------|----------|
| `apps/web/src/domains/nexia/views/left/NexiaLeftNav.tsx` | 문서 아코디언: " 준비 중 " → FileDropZone 삽입. uploadUrl, listUrl, domain='nexia' |
| `apps/web/src/domains/nexia/views/left/NexiaLeftNav.tsx` | 미디어 아코디언: 갤러리/사운드/영상 각각 FileDropZone 삽입, accept 등 타입별 props |
| `apps/web/src/domains/nexia/components/NexiaEditorPanel.tsx` | uploadHandler → files API 연동 (domain 전달) |
| `apps/web/src/domains/nexia/components/NexiaChatPanel.tsx` | 클립보드 이미지 → 서버 업로드 후 URL (domain=nexia, category=images) |

### 2.2 서버

| 파일 | 수정 내용 |
|------|----------|
| `apps/backend/src/modules/nexia/nexia.routes.ts` | POST /files/upload, GET /files/list, DELETE, PATCH /files/:id/verify, POST /files/:id/reprocess 마운트 |
| `apps/backend/src/modules/nexia/nexia.service.ts` | uploadFile, listFiles, contentHash 계산, magic number 검증 |

### 2.3 기존 유틸 (확장·수정 검토)

| 파일 | 용도 |
|------|------|
| `server/utils/fileUpload.js` | partsCreateSafeFilename, partsGenerateFilename → 범용 함수 (날짜시간 +shortUuid) 추가 |
| `server/config/fileTypes.js` | category, type, maxSize, mime 확장 |

---

## 3. 물리 저장 경로 (uploads)

```json
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
예: `uploads/nexia/documents/2025-02-24/20250224143022_a1b2c3d4.pdf`

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
| `apps/web/src/components/ui/UploadProgress.tsx` | 진행률 UI |
| `apps/web/src/engines/tiptap/BaseTiptapEditor.tsx` | uploadHandler, context.source |
| `docs/database/file_upload_logic_final.md` | parts 한글 인코딩, sequence 로직 |

---

## 6. Phase 별 파일 생성·수정 순서

| Phase | 신규 | 수정 |
|-------|------|------|
| **Phase 1** | DB 마이그레이션 | server/utils, server/config |
| **Phase 2** | FileDropZone.tsx, FileBrowserModal.tsx | — |
| **Phase 3** | useNexiaAssets.ts | nexia.routes.ts, nexia.service.ts, NexiaLeftNav.tsx |
| **Phase 4** | — | NexiaEditorPanel.tsx, NexiaChatPanel.tsx, 고아 정리 |

---

## 7. AGENTS.md 준수 사항

- **system**: `/apps/web/src/components/**` 신규 추가는 **명시적 지시**에 한해 허용. FileDropZone, FileBrowserModal 은 사용자 지시로 추가.
- **domains**: `/apps/web/src/domains/nexia/**` 만 수정. 다른 도메인 (archive, parts) 교차 수정 금지.
- **No-Touch**: `/src/frame/**`, `/apps/web/src/engines/**`, `/src/assets/**`, `/public/**` 수정 금지.

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| 구현 PRD | [드롭존 및 첨부 기능 플랜 (PRD-005)](../../05_PRD/NEXIA/05_PRD_NEXIA_드롭존첨부기능플랜.md) |
| 연관 PRD | [files.source_metadata 추출 (PRD-013)](../../05_PRD/NEXIA/05_PRD_NEXIA_파일메타데이터AI추출.md) |
