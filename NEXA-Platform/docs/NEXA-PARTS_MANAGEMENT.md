# 부품 관리 시스템 설계 문서

## 목차

1. [시스템 개요](#시스템-개요)
2. [데이터베이스 구조](#데이터베이스-구조)
3. [UI/UX 설계](#uiux-설계)
4. [핵심 기능](#핵심-기능)
5. [구현 계획](#구현-계획)
6. [향후 확장 계획](#향후-확장-계획)

---

## 시스템 개요

### 목적

ESP32 기반 IoT 플랫폼 개발을 위한 전자부품 및 기계부품의 체계적인 재고 관리 시스템

### 핵심 가치

- **시각적 관리**: 물리적 공간을 시각화하여 직관적인 부품 관리
- **정확한 추적**: 모든 입출고 이력 자동 기록 및 추적
- **효율적 배치**: 드래그 앤 드롭으로 부품함 이동 및 재배치
- **확장 가능**: 향후 바코드/RFID, ESP32 센서 연동 준비

---

## 데이터베이스 구조

### 계층 구조 개요

```
부품 계층:
part_classes (Lv1) → part_models (Lv2) → part_specs (Lv3) → part_files (Lv4)

공간 계층:
base_spaces → storage_blocks → storage_rows → bin_masters → bin_contents
```

### 1. 부품 관련 테이블

#### 1.1 part_classes (부품 분류)

- **역할**: 부품의 최상위 기능적 분류 (예: 저항, 캐패시터, MCU)
- **핵심 필드**: `id`, `name` (UNIQUE), `description`
- **주의**: `name` 변경 시 하위 모든 `part_models`에 영향

#### 1.2 part_models (부품 모델)

- **역할**: 부품의 일반적인 유형 또는 "모델" 정의 (예: 0603 저항, ESP32 모듈)
- **핵심 필드**: `id`, `part_class_id` (FK), `model_name` (UNIQUE), `tags`, `description`
- **주의**: `model_name`은 `part_class` 내에서 고유

#### 1.3 part_specs (부품 상세 스펙)

- **역할**: 개별 부품의 상세 기술 사양 저장
- **핵심 필드**:
  - `id`, `part_model_id` (FK)
  - `manufacturer_part_number` (UNIQUE) - 제조사 품번
  - `value_str` (저항값, 캐패시턴스 등)
  - `tolerance`, `voltage_rating`, `package_type`, `manufacturer`
- **주의**: `manufacturer_part_number`는 개별 부품을 고유하게 식별

#### 1.4 part_files (부품 파일)

- **역할**: 데이터시트, 3D 모델, 이미지 등 기술 파일 저장
- **핵심 필드**: `id`, `part_spec_id` (FK), `file_type`, `file_url`, `filename`, `upload_date`
- **주의**: 모든 파일은 반드시 `part_spec_id`에 연결

### 2. 물리적 공간 관리 테이블

#### 2.1 base_spaces (최상위 공간)

- **역할**: 물리적인 '룸' 또는 최상위 공간 단위 정의
- **핵심 필드**: `id`, `sku` (UNIQUE), `name`, `max_width_mm`, `max_depth_mm`, `max_height_mm`, `env_conditions`
- **예시**: "Vision Room" (VR), "Test Room" (TR)

#### 2.2 storage_blocks (저장 블록)

- **역할**: `base_spaces` 내의 주요 적재 구조물 (랙, 캐비닛, 선반 유닛)
- **핵심 필드**:
  - `id`, `base_space_id` (FK)
  - `sku` (UNIQUE), `name`
  - `storage_type` (ENUM: 'RACK', 'CABINET', 'SHELF_UNIT')
  - `max_load_kg`, `width_mm`, `depth_mm`, `height_mm`
- **예시**: "Vision Room-RACK-01" (RACK-BLUE)

#### 2.3 storage_rows (저장 행/층)

- **역할**: `storage_blocks` 내의 각 층/구역 (선반 한 칸, 랙의 한 레벨)
- **핵심 필드**:
  - `id`, `storage_block_id` (FK)
  - `sku` (UNIQUE), `name`
  - `row_identifier` (층 번호, 알파벳 등)
  - `width_mm`, `depth_mm`, `height_mm`
  - `available_volume_mm3` (자동 계산값)
  - `is_available` (BOOLEAN)
- **주의**: 실제 라벨링은 숫자로만 표기, 프로그램 관리상으로 `sku`와 `name` 사용

#### 2.4 bin_models (부품함 모델)

- **역할**: 개별 부품함의 표준 규격(타입) 정보 정의
- **핵심 필드**: `id`, `sku` (UNIQUE), `name`, `width_mm`, `depth_mm`, `height_mm`, `material`, `color`
- **예시**: "Small Tray" (BMT-01), "Large Parts Box" (BOX-2)

#### 2.5 bin_masters (부품함 인스턴스)

- **역할**: 실제 존재하는 개별 부품함 인스턴스와 물리적 위치 관리
- **핵심 필드**:
  - `id`, `bin_model_id` (FK)
  - `current_storage_row_id` (FK, NULL 가능)
  - `sku` (UNIQUE) - 영구 마킹용, 한번 발급되면 영원히 사용
  - `slot_index` (INT) - `storage_row` 내 좌우 위치 (2D 좌표계)
  - `status` (ENUM: 'IN_USE', 'EMPTY', 'MAINTENANCE')
  - `purchase_date`
- **SKU 명명 규칙**: `{bin_model_sku}-[재질약어]{일련번호}{상태약어}` (예: `BMT-01-PL001IN`, `트레이1호-P002S`)
- **주의**:
  - `slot_index`는 같은 `storage_row_id` 내에서 UNIQUE
  - 부품함 이동 시 `slot_index` 재배치 로직 필요

#### 2.6 bin_contents (부품함 내용물)

- **역할**: 특정 `bin_master` 안에 어떤 부품이 몇 개 들어 있는지 관리
- **핵심 필드**:
  - `id`, `bin_master_id` (FK)
  - `part_spec_id` (FK, NULL 가능)
  - `part_model_id` (FK, NULL 가능)
  - `quantity` (INT, > 0)
  - `date_loaded`, `last_updated`
- **제약 조건**:
  - `part_spec_id`와 `part_model_id` 중 하나는 반드시 있어야 함
  - 하나의 `bin`에 여러 `part_spec` 혼합 보관 가능
  - `bin_master_id`와 `part_spec_id`/`part_model_id` 조합은 UNIQUE
- **주의**:
  - 저항 같은 경우는 `part_model` 단위로 보관 가능
  - 현실적으로 하나의 부품함에 여러 부품 종류가 들어갈 수 있음

#### 2.7 bin_logs (입출고 로그)

- **역할**: `bin_contents`의 입/출고 등 재고 변동 이력 자동 기록
- **핵심 필드**:
  - `id`, `bin_master_id` (FK)
  - `part_spec_id` (FK, NULL 가능)
  - `part_model_id` (FK, NULL 가능)
  - `transaction_type` (ENUM: 'IN', 'OUT', 'ADJUST', 'MOVE')
  - `quantity_change` (INT, 입고면 양수, 출고면 음수)
  - `current_quantity_in_bin` (트랜잭션 후 최종 수량)
  - `transaction_date` (DATETIME)
  - `user_id` (FK to users.id)
  - `notes` (TEXT, 관리자 편집 시)
  - `is_edited` (BOOLEAN)
  - `edited_by` (FK, NULL 가능)
  - `edited_at` (DATETIME, NULL 가능)
- **주의**:
  - 웹 애플리케이션에서 재고 변경 로직 실행 시 자동으로 기록
  - 절대 수동 조작 금지 (단, 최고 관리자는 편집 가능)
  - 트랜잭션 보장: 로그 저장 실패 시 이전 작업 취소

### 3. 사용자 관리 테이블

#### 3.1 users (사용자)

- **역할**: 복수 관리자 추적 및 권한 관리
- **핵심 필드**: `id`, `username` (UNIQUE), `display_name`, `email`, `role` (ENUM: 'ADMIN', 'MANAGER', 'USER'), `is_active`, `created_at`
- **권한**:
  - ADMIN: 모든 권한 (로그 편집 포함)
  - MANAGER: 재고 관리, 부품함 이동
  - USER: 조회, 출고만

---

## UI/UX 설계

### 레벨별 접근 구조

#### 전체 → 부분 계층적 접근

```
전체 뷰 (base_spaces)
  ↓ 클릭/확장
특정 룸 (base_space)
  ↓ 클릭/확장
랙/캐비닛 목록 (storage_blocks)
  ↓ 클릭/확장
층/구역 목록 (storage_rows)
  ↓ 클릭/확장
부품함 배치 뷰 (bin_masters)
  ↓ 더블클릭
부품함 상세 (bin_contents)
```

### 주요 UI 화면

#### 1. 메인 대시보드

- **전체 공간 개요**: `base_spaces` 목록
- **빠른 검색**: 부품명, SKU, 위치 검색
- **최근 활동**: 최근 입출고 이력
- **알림**: 재고 부족, 부품함 이동 등

#### 2. 공간 시각화 뷰 (핵심 기능)

- **시각적 표현**:

  - `storage_rows`를 그리드/리스트로 표시
  - 각 `bin_master`를 카드/박스 형태로 표시
  - 부품함 상태에 따른 색상 구분 (IN_USE, EMPTY, MAINTENANCE)
  - 부품함 내 부품 개수 표시

- **드래그 앤 드롭**:

  - 부품함을 다른 `storage_row`로 이동
  - 같은 `storage_row` 내에서 `slot_index` 재배치
  - 이동 시 자동으로 `bin_logs`에 'MOVE' 기록

- **인터랙션**:
  - **더블클릭**: 부품함 상세 모달/페이지 열기
  - **우클릭**: 컨텍스트 메뉴 (이동, 상태 변경, 삭제 등)
  - **호버**: 부품함 정보 미리보기

#### 3. 부품함 상세 뷰

- **부품함 정보**:

  - SKU, 모델명, 현재 위치
  - 상태, 구매일

- **내용물 관리**:

  - 부품 목록 (part_spec 또는 part_model)
  - 각 부품의 수량 표시
  - 입고/출고 버튼

- **입출고 모달**:

  - 부품 선택 (검색 가능)
  - 수량 입력
  - 입고/출고 선택
  - 메모 입력 (선택)

- **파일 관리**:
  - 이미지 URL 입력
  - 파일 직접 업로드 (드래그 앤 드롭 또는 파일 선택)
  - 업로드된 파일 목록 표시
  - 파일 삭제/다운로드

#### 4. 부품 관리 뷰

- **부품 목록**:

  - 계층적 트리 뷰 (part_classes → part_models → part_specs)
  - 리스트 뷰 / 썸네일 뷰 전환
  - 필터링 (분류, 제조사, 패키지 타입 등)

- **부품 상세**:
  - 스펙 정보 표시
  - 재고 현황 (어떤 bin에 몇 개씩 있는지)
  - 관련 파일 (데이터시트, 3D 모델 등)

#### 5. 재고 관리 뷰

- **재고 현황**:

  - 부품별 총 재고량 (모든 bin 합산)
  - bin별 분산 현황
  - 재고 부족 알림

- **입출고 이력**:
  - `bin_logs` 기반 이력 표시
  - 필터링 (날짜, 사용자, 부품 등)
  - 관리자 편집 기능 (권한에 따라)

### UI 컴포넌트 구조

```
PartsManagementPage.vue
├── PartsDashboardView.vue          # 대시보드
├── SpaceVisualizationView.vue       # 공간 시각화 (핵심)
│   ├── StorageRowGrid.vue          # storage_row 그리드
│   ├── BinCard.vue                 # 부품함 카드
│   └── BinDragDropHandler.vue      # 드래그 앤 드롭 로직
├── BinDetailModal.vue              # 부품함 상세 모달
│   ├── BinContentsList.vue         # 내용물 목록
│   ├── InOutTransactionForm.vue    # 입출고 폼
│   └── FileUploadSection.vue       # 파일 업로드
├── PartsListView.vue                # 부품 목록
└── InventoryHistoryView.vue        # 재고 이력
```

---

## 핵심 기능

### 1. 공간 시각화 및 드래그 앤 드롭

**요구사항**:

- `storage_rows`를 시각적으로 표현
- 부품함을 드래그 앤 드롭으로 이동
- 이동 시 자동으로 위치 정보 업데이트
- 이동 이력 자동 기록

**구현 방향**:

- Vue3 + vue3-grid-layout-next 또는 커스텀 드래그 앤 드롭
- 실시간 위치 업데이트
- 이동 전/후 위치 비교 및 검증

### 2. 부품함 상세 및 입출고

**요구사항**:

- 더블클릭으로 부품함 상세 열기
- 부품 선택 및 수량 입력
- 입고/출고 처리
- 자동 로그 기록

**구현 방향**:

- 모달 또는 사이드 패널로 상세 뷰 표시
- 부품 검색 및 선택 UI
- 트랜잭션 보장 (DB 트랜잭션)

### 3. 파일 관리

**요구사항**:

- 이미지 URL 직접 입력
- 파일 직접 업로드
- 일괄 업로드 후 DB 업데이트
- 파일 삭제 및 대체

**구현 방향**:

- 클라우드 스토리지 연동 (AWS S3, Google Cloud Storage 등)
- 파일명 규칙: `{part_spec_id}_{순번}.{확장자}`
- 업로드 진행률 표시
- 기본 이미지 대체 로직

### 4. 재고 관리

**요구사항**:

- 실시간 재고 계산
- 여러 bin에 분산된 부품의 총 재고 표시
- 재고 부족 알림

**구현 방향**:

- 집계 쿼리 최적화
- 캐싱 전략 (Redis 등)
- 알림 시스템 (임계값 기반)

---

## 구현 계획

### Phase 1: UI 프로토타입 (우선 진행)

- [ ] 공간 시각화 뷰 구현 (목업 데이터 사용)
- [ ] 드래그 앤 드롭 기능 (맞교환, 하나를 옆으로 뺀 뒤 점차적으로 수정 후 뺀 것 다시 넣기)
- [ ] 더블클릭 시 모달창 및 입력폼 UI (대략적 예상)
- [ ] 기본 레이아웃 및 네비게이션

### Phase 2: 기본 구조 (Phase 1 완료 후)

- [ ] DB 스키마 최종 확정 (UI 설계 기반으로)
- [ ] 기본 CRUD API 개발
- [ ] 사용자 인증/권한 시스템
- [ ] 실제 데이터 연동

### Phase 3: 핵심 기능 (2-3주)

- [ ] 부품함 상세 뷰 (실제 데이터)
- [ ] 입출고 기능
- [ ] 자동 로그 기록

### Phase 3: 고급 기능 (2-3주)

- [ ] 파일 업로드/관리
- [ ] 부품 검색/필터링
- [ ] 재고 집계 및 리포트
- [ ] 알림 시스템

### Phase 4: 최적화 및 확장 (1-2주)

- [ ] 성능 최적화
- [ ] UI/UX 개선
- [ ] 바코드/RFID 연동 준비
- [ ] 문서화

---

## 향후 확장 계획

### 단기 확장 (3-6개월)

- **바코드 스캔**: 부품함 및 부품에 바코드 부착, 스캔으로 빠른 입출고
- **재고 알림**: 임계값 설정 및 자동 알림
- **리포트**: 입출고 통계, 재고 현황 리포트

### 중기 확장 (6-12개월)

- **RFID 연동**: ESP32 기반 RFID 리더로 자동 재고 관리
- **AI 기반 매칭**: 프로젝트 BOM과 DB 매칭 (엣지 AI 실험)
- **모바일 앱**: 스마트폰으로 부품함 스캔 및 관리

### 장기 확장 (12개월+)

- **자동화 시스템**: ESP32 센서로 부품함 위치 자동 추적
- **부품 호환성**: 부품 간 호환성/대체품 관계 관리
- **프로젝트 연동**: NEXA Platform의 프로젝트와 부품 연결

---

## 기술 스택

### 프론트엔드

- **프레임워크**: Vue 3 + Quasar Framework
- **상태 관리**: Pinia
- **드래그 앤 드롭**: vue3-grid-layout-next 또는 커스텀 구현
- **파일 업로드**: Quasar Uploader 또는 직접 구현

### 백엔드 (향후)

- **데이터베이스**: MySQL
- **API**: Node.js + Express 또는 Python + FastAPI
- **파일 스토리지**: AWS S3 또는 Google Cloud Storage
- **인증**: JWT 또는 OAuth2

---

## 주의사항 및 제약조건

### 데이터 무결성

- SKU는 한번 발급되면 변경 불가
- `bin_logs`는 자동 기록, 수동 조작 금지 (관리자 제외)
- 트랜잭션 보장 필수

### 성능 고려

- 데이터 레코드 1만개 이하 예상
- 집계 쿼리 최적화 필요
- 인덱스 전략 수립

### 확장성

- 향후 ESP32 기반 센서 연동 고려
- 바코드/RFID 스캔 연동 준비
- 클라우드 스토리지 연동

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024년  
**작성자**: NEXA Platform 개발팀
