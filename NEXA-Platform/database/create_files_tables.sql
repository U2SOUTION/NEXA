-- AI 드롭존·첨부 기능용 files 테이블
-- @see docs/AI_드롭존_첨부_기능_플랜.md

USE nexa_db;

CREATE TABLE IF NOT EXISTS files (
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
  ai_workflow_status VARCHAR(20) DEFAULT 'pending',
  ai_workflow_step TINYINT DEFAULT 0,
  ai_workflow_error TEXT NULL,
  ai_workflow_updated_at DATETIME NULL,
  ai_review_status VARCHAR(20) NULL,
  ai_reviewed_at DATETIME NULL,
  ai_reviewed_by VARCHAR(100) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_path (file_path),
  UNIQUE KEY uk_content_hash (content_hash),
  INDEX idx_user (user_id),
  INDEX idx_project (project_id),
  INDEX idx_source (source),
  INDEX idx_edge_sid (edge_sid),
  INDEX idx_ai_workflow (ai_workflow_status, ai_workflow_step),
  INDEX idx_ai_review (ai_review_status)
);

CREATE TABLE IF NOT EXISTS file_references (
  id INT PRIMARY KEY AUTO_INCREMENT,
  file_id INT NOT NULL,
  domain VARCHAR(50) NOT NULL,
  project_id VARCHAR(100) NULL,
  virtual_path VARCHAR(500) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_file_domain (file_id, domain),
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  INDEX idx_domain (domain),
  INDEX idx_project (project_id)
);
