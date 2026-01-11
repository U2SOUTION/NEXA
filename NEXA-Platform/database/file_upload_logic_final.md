# 파일 업로드 기본 로직 최종 논의 문서

## 목차

1. [개요](#개요)
2. [SKU 구조](#sku-구조)
3. [폴더 구조](#폴더-구조)
4. [파일명 규칙](#파일명-규칙)
5. [데이터베이스 설계](#데이터베이스-설계)
6. [업로드 플로우](#업로드-플로우)
7. [대분류 약어 관리](#대분류-약어-관리)
8. [주의사항 및 제약사항](#주의사항-및-제약사항)

---

## 개요

부품 관리 시스템의 파일 업로드 기능은 SKU(Stock Keeping Unit) 기반으로 파일을 관리합니다.
C Code를 기준으로 폴더를 구성하고, SKU를 기반으로 파일명을 생성하여 데이터베이스 없이도 파일 탐색 및 매칭이 가능하도록 설계되었습니다.

### 핵심 원칙

- **C Code 기반 폴더 구조**: 같은 C Code를 가진 모든 파일은 동일 폴더에 저장
- **SKU 기반 파일명**: 파일명에 SKU를 포함하여 소유자 식별 가능
- **순차 번호 관리**: DB의 `file_upload_count` 필드를 사용하여 순차 번호 생성
- **번호 건너뛰기**: 파일 삭제 시 번호 재사용하지 않음 (중복 방지)

---

## SKU 구조

SKU는 부품 계층 구조에 따라 레벨별로 다른 형식을 가집니다.

### 1레벨: 부품 분류 (part_classes)

```
형식: {대분류약어}-{C코드}
예시: RES-R001, CAP-C002
```

### 2레벨: 부품 유형 (part_models)

```
형식: {대분류약어}-{C코드}-{Table_ID}
예시: RES-R001-123, CAP-C002-456
```

- `Table_ID`: `part_models` 테이블의 `id` 값

### 3레벨: 개별 부품 (part_specs)

```
형식: {대분류약어}-{C코드}-{Table_ID}-{Table_ID}
예시: RES-R001-123-789, CAP-C002-456-101
```

- 첫 번째 `Table_ID`: `part_models` 테이블의 `id` 값
- 두 번째 `Table_ID`: `part_specs` 테이블의 `id` 값

### SKU 생성 규칙

- **SKU는 저장하지 않고 필요할 때 조합하여 사용**
- `d_code` (대분류약어) + `c_code` (소분류약어) = SKU
- 확장성 향상: 약어 변경 시 일괄 업데이트 불필요
- 데이터 중복 제거: SKU 컬럼 불필요
- 일관성 보장: 항상 최신 약어로 조합

---

## 폴더 구조

파일은 C Code를 기준으로 폴더에 저장됩니다.

### 폴더 경로 형식

```
uploads/
  └── {대분류약어}-{C코드}/
      └── {SKU}_{순차번호}.{확장자}
```

### 예시

```
uploads/
  └── RES-R001/
      ├── RES-R001_0001.jpg          (1레벨 파일)
      ├── RES-R001_0002.jpg
      ├── RES-R001-123_0001.jpg      (2레벨 파일)
      ├── RES-R001-123_0002.png
      ├── RES-R001-123-789_0001.jpg  (3레벨 파일)
      └── RES-R001-123-789_0002.pdf
```

### 폴더 구조의 장점

- **탐색 용이**: C Code별로 자연스럽게 분리되어 파일 탐색이 쉬움
- **이전/매칭 용이**: 폴더 단위로 파일 이동 및 다른 시스템과의 연동이 간단
- **확장성**: C Code별로 자동 분산되어 폴더당 파일 수 제한 문제 완화

---

## 파일명 규칙

### 파일명 형식

```
{SKU}_{순차번호}.{확장자}
```

### 순차 번호 규칙

- **범위**: 같은 SKU, 같은 확장자 내에서만 유효
- **생성 방식**: `file_upload_count + 1`
- **패딩**: 4자리 숫자 (예: `0001`, `0002`, `0010`, `0100`)
- **삭제 처리**: 파일 삭제 시 번호는 건너뛰기 (재사용하지 않음)

### 예시

```
RES-R001_0001.jpg      (첫 번째 업로드)
RES-R001_0002.jpg      (두 번째 업로드)
RES-R001_0001.pdf      (다른 확장자, 첫 번째 업로드)
RES-R001_0003.jpg      (세 번째 업로드, 0002는 삭제됨)
```

---

## 데이터베이스 설계

### 테이블 수정 사항

#### 1. part_classes 테이블

```sql
-- 카테고리 약어 컬럼 추가 (확장성을 위해 별도 컬럼으로 관리)
ALTER TABLE part_classes
ADD COLUMN d_code VARCHAR(10) COMMENT '대분류 약어 (예: ACP, PAS, CTL 등)',
ADD COLUMN file_upload_count INT DEFAULT 0 COMMENT '파일 업로드 수량';

-- 인덱스 추가
ALTER TABLE part_classes
ADD INDEX idx_d_code (d_code);

-- 주의: sku 컬럼은 저장하지 않음 (필요할 때 d_code + c_code 조합)
```

#### 2. part_models 테이블

```sql
ALTER TABLE part_models
ADD COLUMN file_upload_count INT DEFAULT 0 COMMENT '파일 업로드 수량';

-- 주의: sku 컬럼은 저장하지 않음 (필요할 때 조합)
-- SKU 형식: {대분류약어}-{C코드}-{Table_ID}
-- 대분류약어(d_code)는 part_classes에서 JOIN하여 가져옴
```

#### 3. part_specs 테이블

```sql
ALTER TABLE part_specs
ADD COLUMN file_upload_count INT DEFAULT 0 COMMENT '파일 업로드 수량';

-- 주의: sku 컬럼은 저장하지 않음 (필요할 때 조합)
-- SKU 형식: {대분류약어}-{C코드}-{Table_ID}-{Table_ID}
-- 대분류약어(d_code)는 part_classes에서 JOIN하여 가져옴
```

### part_files 테이블 구조

```sql
CREATE TABLE IF NOT EXISTS part_files (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- 참조 필드 (다중 참조 지원)
  part_class_id INT NULL,
  part_model_id INT NULL,
  part_spec_id INT NULL,

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

  -- 외래키 (하나만 NOT NULL)
  FOREIGN KEY (part_class_id) REFERENCES part_classes(id) ON DELETE CASCADE,
  FOREIGN KEY (part_model_id) REFERENCES part_models(id) ON DELETE CASCADE,
  FOREIGN KEY (part_spec_id) REFERENCES part_specs(id) ON DELETE CASCADE,

  -- 인덱스
  INDEX idx_c_code (c_code),
  INDEX idx_d_code (d_code),
  INDEX idx_part_class_id (part_class_id),
  INDEX idx_part_model_id (part_model_id),
  INDEX idx_part_spec_id (part_spec_id),

  -- 같은 SKU, 같은 확장자 내에서 순차 번호 고유
  -- SKU는 d_code + c_code로 조합 (필요시 Table_ID 추가)
  -- 레벨별로 다른 UNIQUE 제약조건:
  -- 1레벨: (d_code, c_code, file_extension, file_sequence)
  -- 2레벨: (d_code, c_code, part_model_id, file_extension, file_sequence)
  -- 3레벨: (d_code, c_code, part_model_id, part_spec_id, file_extension, file_sequence)

  -- 1레벨용 UNIQUE 제약조건
  UNIQUE KEY uk_class_sku_ext_seq (part_class_id, d_code, c_code, file_extension, file_sequence),

  -- 2레벨용 UNIQUE 제약조건
  UNIQUE KEY uk_model_sku_ext_seq (part_model_id, d_code, c_code, file_extension, file_sequence),

  -- 3레벨용 UNIQUE 제약조건
  UNIQUE KEY uk_spec_sku_ext_seq (part_spec_id, d_code, c_code, file_extension, file_sequence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 업로드 플로우

### 1. 파일 업로드 요청

- 클라이언트에서 파일과 함께 `part_class_id`, `part_model_id`, `part_spec_id` 중 하나를 전달
- 파일 확장자 추출

### 2. SKU 조합 (저장하지 않음)

- 대분류 약어 가져오기 (`d_code` 컬럼 또는 `category` → 약어 매핑)
- C Code 가져오기 (`c_code` 컬럼)
- Table_ID 가져오기 (레벨에 따라)
- SKU 조합: `{d_code}-{c_code}` (+ Table_ID들)
- **SKU는 저장하지 않고 필요할 때만 조합하여 사용**

### 3. 순차 번호 생성

- 트랜잭션 시작
- 해당 레코드의 `file_upload_count` 조회
- 다음 순차 번호 계산: `file_upload_count + 1`
- 같은 SKU (조합된 값), 같은 확장자 내에서 중복 확인
- SKU는 `d_code + c_code` (+ Table_ID들)로 조합하여 확인

### 4. 파일명 생성

- 형식: `{SKU}_{순차번호:04d}.{확장자}`
- 예: `RES-R001-123-789_0001.jpg`

### 5. 폴더 경로 생성

- 형식: `uploads/{대분류약어}-{C코드}/`
- 예: `uploads/RES-R001/`
- 폴더가 없으면 자동 생성

### 6. 파일 저장

- 파일을 생성된 경로에 저장
- 파일명: 생성된 파일명 사용

### 7. 데이터베이스 저장

- `part_files` 테이블에 레코드 삽입
- 해당 레코드의 `file_upload_count` 증가
- 트랜잭션 커밋

### 8. 응답 반환

- 파일 경로, 파일명, SKU, 순차 번호 반환

---

## 대분류 약어 관리

### 관리 방식

- **전역 상수 파일**: `src/constants/categories.js`
- 하드코딩 방식으로 관리 (DB 테이블 없음)
- 향후 필요 시 DB 테이블로 전환 가능

### 현재 구조

```javascript
// src/constants/categories.js
// 기본 대분류 목록 (띄어쓰기 없이 통일)
export const DEFAULT_CATEGORIES = [
  '능동소자',
  '수동소자',
  '제어소자',
  '모듈보드',
  '하드웨어',
  '전원전압',
  '통신저장',
  '출력구동',
  '센서입력',
  '공구/소모품',
]

// 대분류 약어 매핑
export const CATEGORY_ABBREVIATIONS = {
  능동소자: 'ACP', // Active Component Parts (ACT 대신 사용, C Code와 겹침 방지)
  수동소자: 'PAS', // Passive Components
  제어소자: 'CTL', // Control Components
  모듈보드: 'MOD', // Module Board
  하드웨어: 'HWD', // Hardware
  전원전압: 'PWR', // Power
  통신저장: 'COM', // Communication Storage
  출력구동: 'OUT', // Output Drive
  센서입력: 'SEN', // Sensor Input
  '공구/소모품': 'TOL', // Tools/Consumables
}
```

### 약어 매핑 규칙

- 대분류명을 약어로 변환하는 함수 필요
- 약어는 3-4자 영문 대문자 권장
- 약어는 UNIQUE해야 함

---

## 주의사항 및 제약사항

### 1. 동시 업로드 처리

- **문제**: 여러 사용자가 동시에 같은 SKU에 파일을 업로드할 경우 순차 번호 충돌 가능
- **해결**: 트랜잭션과 SELECT FOR UPDATE 사용하여 동시성 제어
- **구현**:
  ```sql
  SELECT file_upload_count FROM part_specs WHERE id = ? FOR UPDATE;
  UPDATE part_specs SET file_upload_count = file_upload_count + 1 WHERE id = ?;
  ```

### 2. 파일 삭제 시 번호 관리

- **정책**: 파일 삭제 시 번호는 건너뛰기 (재사용하지 않음)
- **이유**:
  - 데이터 무결성 유지
  - 감사 추적 가능
  - 중복 방지
- **영향**: `file_upload_count`는 감소하지 않음

### 3. SKU 고유성

- **제약**: SKU는 조합된 값이므로 각 레벨에서 고유해야 함
- **검증**: 파일 업로드 시 조합된 SKU로 중복 확인 필요
- **장점**: 약어 변경 시 일괄 업데이트 불필요 (항상 최신 값으로 조합)

### 4. 파일명 길이 제한

- **Windows**: 경로 포함 260자 제한
- **Linux**: 파일명 255바이트 제한
- **대응**: SKU 길이와 순차 번호 길이를 고려하여 설계

### 5. 확장자 대소문자

- **정책**: 확장자는 소문자로 통일
- **처리**: 업로드 시 `.toLowerCase()` 적용

### 6. 파일 경로 보안

- **정책**: 상대 경로만 저장 (절대 경로 사용 금지)
- **검증**: 파일 경로에 `..` 또는 절대 경로 포함 시 거부

### 7. 물리 공간 테이블

- **참고**: 물리 공간 관련 테이블은 별도의 SKU 체계 사용
- **영향**: 부품 데이터 파일 업로드 로직과는 독립적

---

## 구현 우선순위

### Phase 1: 기본 구조

1. ✅ 대분류 카테고리 전역 상수화
2. ⏳ 대분류 약어 매핑 추가
3. ⏳ 데이터베이스 스키마 수정 (SKU, file_upload_count 필드 추가)
4. ⏳ SKU 자동 생성 로직 구현

### Phase 2: 파일 업로드 기능

1. ⏳ 파일 업로드 API 엔드포인트 구현
2. ⏳ 순차 번호 생성 로직 구현
3. ⏳ 파일 저장 로직 구현
4. ⏳ 동시 업로드 처리 구현

### Phase 3: 파일 관리 기능

1. ⏳ 파일 목록 조회 API
2. ⏳ 파일 삭제 API
3. ⏳ 파일 다운로드 API
4. ⏳ 파일 미리보기 기능

---

## 참고 사항

### 파일 타입 분류

- **image**: jpg, jpeg, png, gif, webp, svg
- **pdf**: pdf
- **3d_model**: stl, obj, step, iges
- **other**: 기타 확장자

### 성능 고려사항

- 폴더당 파일 수: 1,000개 이상 시 성능 저하 가능
- 해결책: C Code별로 자동 분산되어 문제 완화
- 향후: 파일이 10,000개 이상이면 해시 기반 서브폴더 고려

### 확장 가능성

- 향후 외부 스토리지(S3, Cloud Storage) 연동 가능
- CDN 연동을 통한 정적 파일 서빙 가능
- 썸네일 자동 생성 기능 추가 가능

---

## 문서 버전

- **버전**: 1.0
- **작성일**: 2024-12-19
- **최종 수정일**: 2024-12-19
- **작성자**: NEXA Platform Development Team

파일 업로드 기능 구현을 위한 파일 목록 정리 중입니다.

[3 tools called]

파일 업로드 기능 구현을 위한 파일 목록입니다.

## 구현 파일 목록

### Phase 1: 데이터베이스 스키마

1. `database/add_sku_and_file_upload_count.sql` (신규)

   - part_classes, part_models, part_specs 테이블에 sku, file_upload_count 컬럼 추가

2. `database/create_part_files_table.sql` (신규)
   - part_files 테이블 생성

### Phase 2: 서버 API

3. `server/api.js` (수정)

   - 파일 업로드 엔드포인트 추가 (`POST /api/part-files/upload`)
   - 파일 목록 조회 엔드포인트 (`GET /api/part-files`)
   - 파일 삭제 엔드포인트 (`DELETE /api/part-files/:id`)
   - SKU 생성 헬퍼 함수 추가

4. `server/utils/skuGenerator.js` (신규)

   - SKU 생성 로직
   - 대분류 약어 매핑 함수

5. `server/utils/fileUpload.js` (신규)
   - 파일 저장 로직
   - 파일명 생성 로직
   - 폴더 생성 로직

### Phase 3: 클라이언트 Store

6. `src/stores/partsDataStore.js` (수정)
   - 파일 업로드 함수 추가 (`uploadPartFile`)
   - 파일 목록 조회 함수 추가 (`fetchPartFiles`)
   - 파일 삭제 함수 추가 (`deletePartFile`)

### Phase 4: 유틸리티 함수

7. `src/utils/skuGenerator.js` (신규)

   - 클라이언트 측 SKU 생성 헬퍼 (필요 시)

8. `src/constants/categories.js` (이미 완료)
   - CATEGORY_ABBREVIATIONS 활성화 확인

### Phase 5: 클라이언트 컴포넌트

9. `src/domains/parts/components/PartFilesView.vue` (수정 또는 신규)

   - 파일 목록 표시
   - 파일 업로드 UI
   - 파일 삭제 기능

10. `src/domains/parts/components/FileUploadDialog.vue` (신규)

    - 파일 업로드 모달/다이얼로그

11. `src/domains/parts/components/FileList.vue` (신규)
    - 파일 목록 컴포넌트 (재사용 가능)

## 구현 순서 추천

1. 데이터베이스 스키마 (SQL 파일 2개)
2. 서버 유틸리티 함수 (skuGenerator.js, fileUpload.js)
3. 서버 API 엔드포인트 (api.js 수정)
4. 클라이언트 Store (partsDataStore.js 수정)
5. 클라이언트 컴포넌트 (UI 컴포넌트)

이 순서로 진행하면 됩니다.
