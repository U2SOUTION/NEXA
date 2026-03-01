-- ai_user_memos 테이블
-- 사용자가 AI 채팅 응답에서 저장한 메모 (Phase 1: 메모만 저장, Phase 2: 문서로 승격 지원)
-- @see docs/ai_user_memos-기획.md

USE nexa_db;

CREATE TABLE IF NOT EXISTS ai_user_memos (
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
  INDEX idx_promoted (promoted_file_id)
);

-- promoted_file_id FK: Phase 2 문서 승격 시 files.id 참조
-- files 테이블 존재 시에만 실행
-- ALTER TABLE ai_user_memos ADD CONSTRAINT fk_promoted_file FOREIGN KEY (promoted_file_id) REFERENCES files(id) ON DELETE SET NULL;
