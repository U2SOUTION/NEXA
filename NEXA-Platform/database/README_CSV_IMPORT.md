# CSV 파일 임포트 가이드

## 개요

CSV 파일의 부품 모델 데이터를 데이터베이스에 임포트하는 방법입니다.

## 단계별 가이드

### 1. 데이터베이스 스키마 업데이트

먼저 데이터베이스 테이블에 CSV 필드를 추가해야 합니다:

```bash
psql -U postgres -d nexa_db -f database/alter_part_models_for_csv.sql
```

또는 **DBeaver**에서 Postgres(nexa_db) 연결 후 SQL 에디터로 해당 스크립트를 열어 실행하세요.  
(참고: 현재 스키마는 `database/init_postgres.sql`에 정의되어 있으며, CSV 전용 컬럼이 이미 포함되어 있으면 별도 ALTER는 불필요할 수 있습니다.)

**주의**: 컬럼이 이미 존재하는 경우 오류가 발생할 수 있습니다. 이 경우 해당 컬럼 추가 명령을 건너뛰고 다음으로 진행하세요.

### 2. Node.js 패키지 설치

CSV 파싱을 위한 패키지를 설치합니다:

```bash
cd server
npm install
```

### 3. CSV 임포트

CSV 임포트 기능은 API 서버(`server/api.js`)를 통해 제공됩니다. API 엔드포인트를 사용하여 CSV 파일을 업로드하고 임포트할 수 있습니다.

## CSV 컬럼 매핑

| CSV 컬럼       | 데이터베이스 테이블/필드                 |
| -------------- | ---------------------------------------- |
| 부품 모델명    | `part_models.model_name`                 |
| 클레스 마스터  | `part_classes.name` (FK로 연결)          |
| C Code         | `part_classes.c_code`                    |
| D Code         | `part_classes.d_code`                    |
| 대분류         | `part_classes.category`                  |
| 태그 (Tags)    | `part_models.tags`                       |
| 모델 범위      | `part_models.model_range`                |
| 묶음 관리 기준 | `part_models.bundle_management_criteria` |
| 보관함 목록    | `part_models.storage_bin_list`           |
| 비고           | `part_models.notes`                      |
| 추가정보2      | `part_models.additional_info2`           |
| 추가정보3      | `part_models.additional_info3`           |
| 평가           | `part_models.evaluation`                 |
| 품질등급       | `part_models.quality_grade`              |
| 제조사         | `part_specs.manufacturer`                |
| 주요 스펙      | `part_specs.main_specs`                  |
| 단위           | `part_specs.unit`                        |
| 구매벤더       | `part_specs.purchase_vendor`             |
| 구매상태       | `part_specs.purchase_status`             |
| 안전재고       | `part_specs.safety_stock`                |
| 재고가치       | `part_specs.stock_value`                 |
| 재고수량       | `part_specs.stock_quantity`              |
| 재고알림       | `part_specs.stock_alert`                 |

## 데이터 처리 로직

1. **part_classes**: 클래스 마스터가 없으면 새로 생성, 있으면 c_code, d_code, category 업데이트
2. **part_models**: 같은 클래스 내에서 모델명이 고유해야 함. 없으면 추가, 있으면 업데이트
3. **part_specs**: part_model_id와 manufacturer_part_number 조합이 고유. 없으면 추가, 있으면 업데이트

## 트랜잭션 처리

모든 데이터는 트랜잭션으로 처리되므로, 중간에 오류가 발생하면 전체가 롤백됩니다.

## 문제 해결

### 컬럼이 이미 존재하는 오류

```sql
-- 컬럼 존재 여부 확인 (Postgres)
SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'part_models' AND column_name = 'model_range';

-- 존재하지 않는 경우에만 추가
ALTER TABLE part_models ADD COLUMN IF NOT EXISTS model_range TEXT;
```

### CSV 인코딩 문제

CSV 파일이 UTF-8 BOM으로 저장되어 있는지 확인하세요. 스크립트는 BOM을 자동으로 처리합니다.

### 외래키 제약 조건 오류

part_classes에 해당 클래스가 먼저 생성되어 있어야 합니다. 스크립트는 자동으로 처리하지만, 수동으로 확인하려면:

```sql
SELECT * FROM part_classes WHERE name = '클래스명';
```
