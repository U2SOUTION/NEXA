-- 부품 파일 테이블 생성 (새로운 스키마)
-- 문서: file_upload_logic_final.md 참고
--
-- 이 스크립트는 part_files 테이블을 새로운 구조로 생성합니다.
-- 기존 테이블이 있으면 삭제 후 재생성합니다.
-- 주의: 기존 데이터는 백업 후 실행하세요!

USE nexa_parts_db;

-- ============================================
-- 기존 테이블 삭제 (주의: 데이터 손실)
-- ============================================

-- 외래키 제약조건 때문에 순서대로 삭제
DROP TABLE IF EXISTS part_files;

-- ============================================
-- 새로운 part_files 테이블 생성
-- ============================================

CREATE TABLE part_files (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- 참조 필드 (다중 참조 지원 - 하나만 NOT NULL)
  part_class_id INT NULL COMMENT '부품 분류 ID (1레벨)',
  part_model_id INT NULL COMMENT '부품 유형 ID (2레벨)',
  part_spec_id INT NULL COMMENT '개별 부품 ID (3레벨)',

  -- SKU 정보 (필요할 때 조합하여 사용)
  -- sku는 저장하지 않고, d_code + c_code로 조합
  c_code VARCHAR(10) NOT NULL COMMENT 'C Code (소분류 약어)',
  d_code VARCHAR(10) NOT NULL COMMENT '대분류 약어',

  -- 파일 정보
  file_extension VARCHAR(10) NOT NULL COMMENT '확장자 (jpg, png, pdf 등)',
  file_sequence INT NOT NULL COMMENT '순차 번호 (file_upload_count + 1)',
  file_path VARCHAR(500) NOT NULL COMMENT '상대 경로 (uploads/...)',
  original_filename VARCHAR(255) NOT NULL COMMENT '원본 파일명',
  file_type VARCHAR(50) NOT NULL COMMENT 'image, pdf, 3d_model 등',
  file_size INT COMMENT '파일 크기 (bytes)',

  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- 외래키 (하나만 NOT NULL이어야 함)
  FOREIGN KEY (part_class_id) REFERENCES part_classes(id) ON DELETE CASCADE,
  FOREIGN KEY (part_model_id) REFERENCES part_models(id) ON DELETE CASCADE,
  FOREIGN KEY (part_spec_id) REFERENCES part_specs(id) ON DELETE CASCADE,

  -- 인덱스
  INDEX idx_c_code (c_code),
  INDEX idx_d_code (d_code),
  INDEX idx_part_class_id (part_class_id),
  INDEX idx_part_model_id (part_model_id),
  INDEX idx_part_spec_id (part_spec_id),
  INDEX idx_file_type (file_type),
  INDEX idx_file_extension (file_extension),

  -- 같은 SKU, 같은 확장자 내에서 순차 번호 고유
  -- SKU는 d_code + c_code로 조합 (필요시 Table_ID 추가)
  -- 레벨별로 다른 UNIQUE 제약조건:
  -- 1레벨: (part_class_id, d_code, c_code, file_extension, file_sequence)
  -- 2레벨: (part_model_id, d_code, c_code, file_extension, file_sequence)
  -- 3레벨: (part_spec_id, d_code, c_code, file_extension, file_sequence)
  
  -- 1레벨용 UNIQUE 제약조건
  UNIQUE KEY uk_class_sku_ext_seq (part_class_id, d_code, c_code, file_extension, file_sequence),
  
  -- 2레벨용 UNIQUE 제약조건
  UNIQUE KEY uk_model_sku_ext_seq (part_model_id, d_code, c_code, file_extension, file_sequence),
  
  -- 3레벨용 UNIQUE 제약조건
  UNIQUE KEY uk_spec_sku_ext_seq (part_spec_id, d_code, c_code, file_extension, file_sequence),

  -- 하나의 참조 필드만 NOT NULL이어야 함 (체크 제약조건은 MySQL 8.0.16+)
  CONSTRAINT chk_one_reference CHECK (
    (part_class_id IS NOT NULL AND part_model_id IS NULL AND part_spec_id IS NULL) OR
    (part_class_id IS NULL AND part_model_id IS NOT NULL AND part_spec_id IS NULL) OR
    (part_class_id IS NULL AND part_model_id IS NULL AND part_spec_id IS NOT NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='부품 파일 테이블 (SKU 기반)';

-- ============================================
-- 확인 쿼리
-- ============================================

-- 테이블 구조 확인
DESCRIBE part_files;

-- 인덱스 확인
SHOW INDEX FROM part_files;

-- 테이블 생성 확인
SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'nexa_parts_db'
  AND TABLE_NAME = 'part_files';

