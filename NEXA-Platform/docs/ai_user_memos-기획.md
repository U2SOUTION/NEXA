# ai_user_memos 기획

사용자가 AI 채팅 응답에서 저장한 메모를 **ai_user_memos** 테이블로 관리하고, 이후 **정식 문서로 승격** 시 files 테이블에 저장·탐색기 표시까지 지원하기 위한 기획 문서다.

---

## 0. 적용 범위

- **Phase 1 (현재)**: 메모만 저장 — ai_user_memos 테이블 기반, localStorage → DB 마이그레이션
- **Phase 2 (나중)**: 문서로 승격 — 메모를 정식 파일로 저장, 탐색기·미디어 문서 리스트 표시

---

## 1. 관련 테이블 스키마

### 1.1 기존 테이블 (참조용)

#### files
```sql
CREATE TABLE files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  file_path VARCHAR(500) NOT NULL,
  virtual_path VARCHAR(500) NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NULL,
  mime_type VARCHAR(100) NULL,
  file_size BIGINT NULL,
  category VARCHAR(50) NULL,
  user_id VARCHAR(100) DEFAULT 'developer',
  content_hash VARCHAR(64) NOT NULL,
  project_id VARCHAR(100) NULL,
  source VARCHAR(50) NULL,
  edge_sid INT NULL,
  source_metadata JSON NULL,
  -- ... (ai_workflow_status, ai_review 등)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,  -- 선택: 소프트 삭제
  UNIQUE KEY uk_path (file_path),
  UNIQUE KEY uk_content_hash (content_hash),
  INDEX idx_deleted_at (deleted_at)
);
```

#### file_references
```sql
CREATE TABLE file_references (
  id INT PRIMARY KEY AUTO_INCREMENT,
  file_id INT NOT NULL,
  domain VARCHAR(50) NOT NULL,
  `usage` VARCHAR(50) NULL DEFAULT 'default',  -- 선택: 사용처 세분화
  project_id VARCHAR(100) NULL,
  virtual_path VARCHAR(500) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_file_domain (file_id, domain),
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  INDEX idx_domain (domain)
);
```

### 1.2 신규 테이블: ai_user_memos

```sql
CREATE TABLE ai_user_memos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  source VARCHAR(50) DEFAULT 'chat',
  channel_id VARCHAR(100) NULL,
  chat_id VARCHAR(100) NULL,
  user_id VARCHAR(100) DEFAULT 'developer',
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  promoted_file_id INT NULL,
  INDEX idx_source (source),
  INDEX idx_channel_chat (channel_id, chat_id),
  INDEX idx_created (created_at),
  INDEX idx_promoted (promoted_file_id),
  FOREIGN KEY (promoted_file_id) REFERENCES files(id) ON DELETE SET NULL
);
```

| 필드 | 설명 |
|------|------|
| content | 메모 텍스트 (Tiptap HTML/마크다운 등) |
| source | 'chat' (채팅 응답에서 저장), 'editor' 등 확장 가능 |
| channel_id | 출처 채널 ID (useAiChannels의 channel.id) |
| chat_id | 출처 대화 ID (chat.id) |
| sort_order | 정렬 순서 (moveMemoUp/Down용) |
| promoted_file_id | 문서로 승격 시 files.id 참조 (Phase 2) |

---

## 2. Phase 1: 메모만 저장 (현재 우선)

### 2.1 흐름

```
[채팅 우클릭] "메모로 추가"
       ↓
[useAiMemos] addMemo(content, source) → POST /api/ai-user-memos
       ↓
[서버] ai_user_memos INSERT
       ↓
[왼쪽 드로어] 노트 > 메모 리스트 갱신

[메모 클릭]
       ↓
[에디터] Tiptap 에디터에 content 로딩

[에디터 저장]
       ↓
[useAiMemos] updateMemo(id, content) → PATCH /api/ai-user-memos/:id
       ↓
[서버] ai_user_memos UPDATE
```

### 2.2 API (Phase 1)

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/ai-user-memos | 목록 조회 (정렬: sort_order, created_at DESC) |
| POST | /api/ai-user-memos | 생성 (content, source, channel_id, chat_id) |
| PATCH | /api/ai-user-memos/:id | 업데이트 (content, sort_order) |
| DELETE | /api/ai-user-memos/:id | 삭제 |
| PATCH | /api/ai-user-memos/:id/move | 순서 변경 (direction: up | down) |

### 2.3 useAiMemos 변경

- `loadFromStorage()` → `GET /api/ai-user-memos` 호출
- `saveToStorage()` → 각 작업 후 API 호출
- `addMemo(content, source, channelId?, chatId?)` → POST
- `updateMemo(id, content)` → PATCH
- `removeMemo(id)` → DELETE
- `moveMemoUp/Down(id)` → PATCH /move

### 2.4 AiChatPanel 연동

- "메모로 추가" 클릭 시 `addMemo(content, 'chat', selectedChannelId, selectedChatId)` 호출

### 2.5 마이그레이션

- 기존 `localStorage['nexa-ai-memos']` 데이터 읽기
- POST /api/ai-user-memos로 일괄 등록 (channel_id, chat_id는 NULL)

---

## 3. Phase 2: 문서로 승격 (나중)

### 3.1 흐름

```
[메모 선택] [문서로 저장] 버튼 클릭
       ↓
[서버] content를 .md 파일로 저장
       - uploads/ai/documents/{YYYYMMDD}_{uuid}.md
       - files INSERT (file_path, original_name, content_hash, category='documents')
       - file_references INSERT (file_id, domain='ai')
       ↓
[서버] ai_user_memos UPDATE (promoted_file_id = files.id)
       ↓
[탐색기] GET /files/explorer → 새 파일 표시
[노트 > 문서] GET /files/list?domain=ai&category=documents → 표시
```

### 3.2 API (Phase 2)

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/ai-user-memos/:id/promote | 메모를 정식 문서(.md)로 승격 |

**요청**: `{ title?: string }` — 파일명 기본값: `메모_{id}.md` 또는 첫 줄

**응답**: `{ file_id, file_path, url }`

### 3.3 files 테이블 활용

- content를 파일로 저장: `fs.writeFile(uploads/ai/documents/xxx.md, content)`
- content_hash: SHA256(content)
- file_path: `uploads/ai/documents/{YYYYMMDD}_{shortUuid}.md`
- original_name: `메모_{id}.md` 또는 사용자 지정
- category: `documents`
- file_type: `document`

---

## 4. 정리

| 항목 | Phase 1 (현재) | Phase 2 (나중) |
|------|----------------|----------------|
| 저장소 | ai_user_memos | ai_user_memos + files |
| 메모 추가 | POST ai_user_memos | 동일 |
| 메모 편집 | PATCH ai_user_memos | 동일 |
| 메모 삭제 | DELETE ai_user_memos | 동일 |
| 문서 승격 | — | POST promote → files INSERT |
| 탐색기 표시 | — | 승격된 파일만 |
| 노트 > 문서 표시 | — | 승격된 파일만 |

### 4.1 구현 순서

1. ai_user_memos 테이블 생성 (DB)
2. memos API 라우트 추가 (GET, POST, PATCH, DELETE, move)
3. useAiMemos를 API 호출로 전환
4. localStorage 마이그레이션 유틸 (초기 1회)
5. (Phase 2) promote API 및 UI
