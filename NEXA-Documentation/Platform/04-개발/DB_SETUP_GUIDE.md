# 넥사보드 DB 구성 가이드

**작성일**: 2024년  
**목적**: 내일 넥사보드 DB 구성 시 참고 가이드  
**전제**: 기존 부품 관리 시스템(`nexa_parts_db`)이 이미 구축되어 있음

---

## 1. DB 구성 전략

### 권장: 같은 데이터베이스에 테이블 추가

**현재 상태:**

```
데이터베이스: nexa_parts_db
├── 부품 관리 테이블 (이미 존재)
│   ├── part_classes
│   ├── part_models
│   ├── part_specs
│   ├── part_files
│   ├── base_spaces
│   ├── storage_blocks
│   └── ...
│
└── 넥사보드 테이블 (추가 예정)
    ├── board_menu_nodes
    ├── board_windows
    ├── board_panels
    ├── board_devices
    ├── devices_iot
    └── ...
```

**장점:**

- 기존 서버 설정(`server/api.js`) 재사용 가능
- 연결 관리 단순화
- 향후 통합 쿼리 가능 (예: 보드에서 부품 데이터 조회)

---

## 2. DB 연결 설정 확인

### 현재 설정 (`server/api.js`)

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123412341234',
  database: 'nexa_parts_db', // ← 이 DB에 추가
  charset: 'utf8mb4',
}
```

**변경 불필요**: 같은 DB에 테이블만 추가하면 됨

---

## 3. 테이블 생성 순서

### Phase 1: 핵심 테이블 (우선 구현)

**1단계: 보드 관련 테이블**

```sql
-- 1. board_menu_nodes (보드 메뉴 노드 - 최상위)
CREATE TABLE `board_menu_nodes` (
  `id` VARCHAR(36) PRIMARY KEY,
  `parent_id` VARCHAR(36) NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('group', 'board') NOT NULL,
  `description` TEXT NULL,
  `icon` VARCHAR(50) NULL,
  `color` VARCHAR(20) NULL,
  `expanded` BOOLEAN DEFAULT FALSE,
  `display_order` INT DEFAULT 0,
  `dashboard_preset` ENUM('single', 'split-lr', 'l-shape', 'split-tb') NULL,
  `is_layout_configured` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `deleted_by` VARCHAR(100) NULL,
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_deleted_at` (`deleted_at`),
  FOREIGN KEY (`parent_id`) REFERENCES `board_menu_nodes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. board_windows (대시보드 창 구조)
CREATE TABLE `board_windows` (
  `id` VARCHAR(36) PRIMARY KEY,
  `board_id` VARCHAR(36) NOT NULL,
  `pane_id` VARCHAR(50) NOT NULL,
  `size` DECIMAL(5,2) NULL,
  `is_container` BOOLEAN DEFAULT FALSE,
  `parent_pane_id` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_board_id` (`board_id`),
  INDEX `idx_pane_id` (`pane_id`),
  INDEX `idx_deleted_at` (`deleted_at`),
  FOREIGN KEY (`board_id`) REFERENCES `board_menu_nodes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. board_panels (패널 인스턴스)
CREATE TABLE `board_panels` (
  `id` VARCHAR(36) PRIMARY KEY,
  `board_id` VARCHAR(36) NOT NULL,
  `pane_id` VARCHAR(50) NOT NULL,
  `panel_type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL DEFAULT '새 패널',
  `content` TEXT NULL,
  `config` JSON NULL,
  `grid_x` INT DEFAULT 0,
  `grid_y` INT DEFAULT 0,
  `grid_w` INT DEFAULT 4,
  `grid_h` INT DEFAULT 5,
  `grid_i` VARCHAR(36) NOT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_board_id` (`board_id`),
  INDEX `idx_pane_id` (`pane_id`),
  INDEX `idx_panel_type` (`panel_type`),
  INDEX `idx_deleted_at` (`deleted_at`),
  INDEX `idx_grid_i` (`grid_i`),
  FOREIGN KEY (`board_id`) REFERENCES `board_menu_nodes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. board_devices (보드-디바이스 연결, N-N 관계)
CREATE TABLE `board_devices` (
  `id` VARCHAR(36) PRIMARY KEY,
  `board_id` VARCHAR(36) NOT NULL,
  `device_id` VARCHAR(36) NOT NULL,
  `device_name` VARCHAR(255) NULL,
  `connection_config` JSON NULL,
  `display_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_board_id` (`board_id`),
  INDEX `idx_device_id` (`device_id`),
  INDEX `idx_deleted_at` (`deleted_at`),
  UNIQUE INDEX `idx_board_device` (`board_id`, `device_id`, `deleted_at`),
  FOREIGN KEY (`board_id`) REFERENCES `board_menu_nodes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**2단계: 디바이스 관련 테이블 (기본만)**

```sql
-- 5. devices_iot (IoT 디바이스 기본 정보)
CREATE TABLE `devices_iot` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `device_type` VARCHAR(50) NOT NULL,
  `model_number` VARCHAR(100) NULL,
  `serial_number` VARCHAR(100) NULL,
  `mac_address` VARCHAR(17) NULL,
  `ip_address` VARCHAR(45) NULL,
  `mqtt_topic` VARCHAR(255) NULL,
  `mqtt_config` JSON NULL,
  `status` ENUM('online', 'offline', 'error', 'maintenance') NOT NULL DEFAULT 'offline',
  `last_seen_at` TIMESTAMP NULL,
  `firmware_version` VARCHAR(50) NULL,
  `api_key` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `location` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  `deleted_by` VARCHAR(100) NULL,
  INDEX `idx_device_type` (`device_type`),
  INDEX `idx_mac_address` (`mac_address`),
  INDEX `idx_ip_address` (`ip_address`),
  INDEX `idx_status` (`status`),
  INDEX `idx_last_seen_at` (`last_seen_at`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. devices_sensors (디바이스 센서 정보)
CREATE TABLE `devices_sensors` (
  `id` VARCHAR(36) PRIMARY KEY,
  `device_id` VARCHAR(36) NOT NULL,
  `sensor_name` VARCHAR(255) NOT NULL,
  `sensor_type` VARCHAR(50) NOT NULL,
  `sensor_pin` INT NULL,
  `unit` VARCHAR(20) NULL,
  `min_value` DECIMAL(10,2) NULL,
  `max_value` DECIMAL(10,2) NULL,
  `calibration` JSON NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_device_id` (`device_id`),
  INDEX `idx_sensor_type` (`sensor_type`),
  INDEX `idx_deleted_at` (`deleted_at`),
  FOREIGN KEY (`device_id`) REFERENCES `devices_iot`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**3단계: 외래키 수정**

`board_devices` 테이블의 `device_id` 외래키 추가:

```sql
ALTER TABLE `board_devices`
ADD FOREIGN KEY (`device_id`) REFERENCES `devices_iot`(`id`) ON DELETE CASCADE;
```

---

## 4. 스크립트 실행 방법

### 방법 1: MySQL Workbench 또는 클라이언트 사용

1. MySQL에 접속
2. `nexa_parts_db` 데이터베이스 선택
3. 위 SQL 스크립트 순서대로 실행

### 방법 2: SQL 파일로 저장 후 실행

```bash
# SQL 파일 생성
# board_phase1_tables.sql

# MySQL 실행
mysql -u root -p nexa_parts_db < board_phase1_tables.sql
```

### 방법 3: Node.js 스크립트 실행 (권장)

```javascript
// server/scripts/create-board-tables.js
import mysql from 'mysql2/promise'
import fs from 'fs/promises'

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123412341234',
  database: 'nexa_parts_db',
  charset: 'utf8mb4',
  multipleStatements: true, // 여러 SQL 문 실행 허용
}

async function createTables() {
  const connection = await mysql.createConnection(dbConfig)

  try {
    // SQL 파일 읽기
    const sql = await fs.readFile('./board_phase1_tables.sql', 'utf8')

    // 실행
    await connection.query(sql)

    console.log('✅ 테이블 생성 완료!')
  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error)
  } finally {
    await connection.end()
  }
}

createTables()
```

---

## 5. 테이블 생성 확인

```sql
-- 테이블 목록 확인
SHOW TABLES LIKE 'board_%';
SHOW TABLES LIKE 'devices_%';

-- 테이블 구조 확인
DESCRIBE board_menu_nodes;
DESCRIBE board_windows;
DESCRIBE board_panels;
DESCRIBE board_devices;
DESCRIBE devices_iot;
DESCRIBE devices_sensors;

-- 인덱스 확인
SHOW INDEX FROM board_menu_nodes;
```

---

## 6. 주의사항

### 기존 부품 관리 테이블과의 충돌 방지

- 테이블명이 겹치지 않도록 `board_*`, `devices_*` 접두어 사용
- 기존 테이블명 확인:
  ```sql
  SHOW TABLES;
  ```

### 문자셋 통일

- 모든 테이블에 `CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` 사용
- 한글 및 이모지 지원

### 외래키 제약조건

- `ON DELETE CASCADE`로 보드 삭제 시 관련 데이터 자동 삭제
- 순서대로 테이블 생성 (부모 테이블 먼저)

---

## 7. 다음 단계 (테이블 생성 후)

1. **API 엔드포인트 추가** (`server/api.js`)

   - `/api/boards` 엔드포인트 추가
   - CRUD 기본 작업

2. **프론트엔드 Store 연동**

   - `boardMenuStore.js`에서 API 호출
   - 로컬 스토리지 폴백 구현

3. **테스트 데이터 생성**
   ```sql
   -- 테스트용 그룹 및 보드 추가
   INSERT INTO board_menu_nodes (id, name, type, display_order)
   VALUES
     (UUID(), '테스트 그룹', 'group', 1),
     (UUID(), '테스트 보드', 'board', 2);
   ```

---

## 8. 참고 문서

- **전체 스키마 설계**: `docs/BOARD_DATABASE_SCHEMA.md`
- **테이블 상세 설계**: `docs/BOARD_DATABASE_SCHEMA.md` 2장
- **SQL 생성 스크립트**: `docs/BOARD_DATABASE_SCHEMA.md` 8장
- **구현 전략**: `docs/IMPLEMENTATION_STRATEGY.md`

---

**작성일**: 2024년  
**최종 업데이트**: 2024년  
**다음 단계**: 테이블 생성 → API 구현 → 프론트엔드 연동
