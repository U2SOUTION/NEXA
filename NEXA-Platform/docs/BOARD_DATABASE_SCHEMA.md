# 넥사보드 MySQL 데이터베이스 스키마 설계

**작성일**: 2024년  
**목적**: 넥사보드 메뉴 시스템의 MySQL 데이터베이스 테이블 구조 정의  
**휴지통 기능**: 포함

---

## 1. 테이블 목록 (우선순위별 분류)

### 📊 테이블 총계

- **초기 (Phase 1)**: 11개 테이블
- **중기 (Phase 2)**: 8개 테이블
- **장기 (Phase 3+)**: 8개 테이블
- **총계**: **27개 테이블**

---

### 전체 테이블 목록

| 번호 | 테이블명                | 설명                                                         | Phase | 카테고리     |
| ---- | ----------------------- | ------------------------------------------------------------ | ----- | ------------ |
| 1    | `board_menu_nodes`      | 보드 메뉴 노드 (그룹/보드) - 계층 구조 관리                  | 1     | 보드 관련    |
| 2    | `board_windows`         | 대시보드 창(Window) 구성 정보 - 창 분할/병합 구조            | 1     | 보드 관련    |
| 3    | `board_panels`          | 패널 인스턴스 - 창에 배치된 실제 패널 (panel_instances)      | 1     | 보드 관련    |
| 4    | `board_devices`         | 보드-디바이스 연결 정보 (N-N 관계)                           | 1     | 보드 관련    |
| 5    | `devices_iot`           | IoT 디바이스 기본 정보 - 기기 등록 및 관리                   | 1     | IoT 디바이스 |
| 6    | `devices_sensors`       | 디바이스 센서 정보 - 센서 타입, 핀, 단위 등                  | 1     | IoT 디바이스 |
| 7    | `devices_telemetry`     | 디바이스 센서 데이터 (시계열) - 대용량 데이터                | 1     | IoT 디바이스 |
| 8    | `devices_commands`      | 디바이스 명령 이력 - 명령 상태 추적                          | 1     | IoT 디바이스 |
| 9    | `devices_firmware`      | 디바이스 펌웨어 버전 관리 - 펌웨어 파일, 해시                | 1     | IoT 디바이스 |
| 10   | `panel_catalog`         | 패널 카탈로그 - 패널 정보 종합 (타입, 메타데이터, 호환성 등) | 1     | 패널 관련    |
| 11   | `panel_compatibility`   | 패널 호환성 매핑 - 패널-기기/센서 호환성 규칙                | 1     | 패널 관련    |
| 12   | `users`                 | 사용자 정보 - 기본 정보 및 인증                              | 2     | 사용자/권한  |
| 13   | `shares_boards`         | 보드 공유 설정 - 권한 레벨 관리                              | 2     | 사용자/권한  |
| 14   | `shares_devices`        | 기기 공유 설정 - 권한 레벨 관리                              | 2     | 사용자/권한  |
| 15   | `api_keys`              | API 키 관리 - 권한 범위, 사용량 제한                         | 2     | API/개발자   |
| 16   | `api_usage_logs`        | API 사용 로그 - 호출 이력 및 통계                            | 2     | API/개발자   |
| 17   | `notification_rules`    | 알림 규칙 - 조건, 채널, 우선순위                             | 2     | 알림         |
| 18   | `notifications`         | 알림 이력 - 발송 기록, 읽음 상태                             | 2     | 알림         |
| 19   | `automation_rules`      | 자동화 규칙 - 트리거 조건, 실행 액션                         | 2     | 자동화       |
| 20   | `automation_executions` | 자동화 실행 이력 - 실행 결과 및 디버깅                       | 3+    | 자동화       |
| 21   | `devices_models`        | 기기 모델 정보 - 하드웨어 정보 자동 조회                     | 3+    | 기기 관리    |
| 22   | `devices_groups`        | 기기 그룹 - 일괄 관리 및 제어                                | 3+    | 기기 관리    |
| 23   | `scenarios`             | 시나리오/시퀀스 - 복잡한 시나리오 정의                       | 3+    | 시나리오     |
| 24   | `scenario_steps`        | 시나리오 단계 - 실행 순서 및 조건                            | 3+    | 시나리오     |
| 25   | `scenario_triggers`     | 시나리오 트리거 - 실행 트리거 조건                           | 3+    | 시나리오     |
| 26   | `backups`               | 백업 이력 - 보드 설정, 패널 구성 백업                        | 3+    | 백업/템플릿  |
| 27   | `ai_edge_configs`       | 엣지 AI 설정 - 디바이스 단 AI 설정 및 플랫폼 AI와 통신 설정  | 3+    | AI           |

**참고 (먼 미래):**

- `board_templates` - 보드 템플릿 (보안 대책 마련 후 검토, 템플릿 마켓플레이스용)

---

### Phase별 상세 설명

#### Phase 1: 초기 구현 테이블 (핵심 기능)

**구현 시기**: 프로젝트 초기 단계

**보드 관련 테이블 (4개)**

- `board_menu_nodes`: 그룹과 보드를 계층적으로 관리하는 메뉴 노드 테이블
- `board_windows`: 보드의 대시보드에서 각 창의 분할/병합 구조 정보 관리
- `board_panels`: 패널 인스턴스 (panel_instances) - 대시보드 창에 배치된 실제 패널의 정보 (타입, 위치, 설정 등)
- `board_devices`: 보드에 연결된 디바이스 정보 (N-N 관계)

**IoT 디바이스 관련 테이블 (5개)**

- `devices_iot`: IoT 디바이스의 기본 정보 (이름, 타입, 연결 정보, MQTT 설정 등)
- `devices_sensors`: 디바이스에 연결된 센서 정보 (센서 타입, 핀 번호, 단위, 보정 정보)
- `devices_telemetry`: 센서에서 수집된 시계열 데이터 (대용량 데이터, 인덱싱 중요)
- `devices_commands`: 디바이스에 전송된 명령 이력 (상태: pending, sent, acknowledged, failed, timeout)
- `devices_firmware`: 디바이스 펌웨어 버전 정보 (펌웨어 파일, 해시, 설치 이력)

**패널 관련 테이블 (2개)**

- `panel_catalog`: 패널 카탈로그 - 패널 정보 종합 (타입, 메타데이터, 호환성 규칙 등)
- `panel_compatibility`: 패널과 기기/센서 타입의 호환성 매핑 (자동 호환성 검색용)

---

#### Phase 2: 중기 구현 테이블 (필수 확장 기능)

**구현 시기**: 핵심 기능 안정화 후

**사용자 및 권한 관련 테이블 (3개)**

- `users`: 사용자 기본 정보 및 인증 정보 (내부 협업의 핵심)
- `shares_boards`: 보드 공유 설정 및 권한 레벨 (여러 사용자가 같은 보드 공유)
- `shares_devices`: 기기 공유 설정 및 권한 레벨 (여러 사용자가 같은 기기 공유)

**API 및 개발자 관련 테이블 (2개)**

- `api_keys`: API 키 발급 및 관리 (권한 범위, 사용량 제한 등)
- `api_usage_logs`: API 호출 이력 및 사용량 통계 (API 모니터링 및 분석)

**알림 관련 테이블 (2개)**

- `notification_rules`: 알림 조건, 채널, 우선순위 정의 (임계값/시간/이벤트 기반)
- `notifications`: 발송된 알림 기록 (읽음 상태, 발송 시간 등)

**자동화 관련 테이블 (1개)**

- `automation_rules`: 규칙 정의, 트리거 조건, 실행 액션 (시간/센서/이벤트 기반)

---

#### Phase 3+: 장기 구현 테이블 (고급 기능 및 먼 미래)

**구현 시기**: 고급 기능 및 확장 기능 구현 시

**자동화 실행 이력 (1개)**

- `automation_executions`: 규칙 실행 이력 및 실행 결과 (자동화 규칙 디버깅 및 모니터링)

**기기 관리 확장 (2개)**

- `devices_models`: 기기 모델 정보 (하드웨어 정보 자동 조회용, 모델 번호 기반)
- `devices_groups`: 여러 기기를 그룹으로 묶어 일괄 관리 (그룹 단위 제어 및 모니터링)

**시나리오/시퀀스 관리 (3개)**

- `scenarios`: 여러 기기와 패널을 연동한 복잡한 시나리오 (시간/이벤트 기반 시퀀스)
- `scenario_steps`: 시나리오의 각 단계 정의 (실행 순서 및 조건)
- `scenario_triggers`: 시나리오 실행 트리거 조건 (시간/이벤트 기반)

**백업 및 템플릿 (1개)**

- `backups`: 보드 설정, 패널 구성, 자동화 규칙 백업 (자동 백업 기본 제공)

**AI 관련 (1개)**

- `ai_edge_configs`: 엣지 AI 설정 정보 (디바이스 단 AI 설정 및 플랫폼 중앙 AI와 통신 설정)

**참고: AI 아키텍처**

- **플랫폼 AI**: 서버에서 실행되는 중앙 AI 시스템
- **엣지 AI**: 디바이스에서 실행되는 엣지 AI (선택적)
- **향후 확장**: `ai_platform_*`, `ai_models`, `ai_training_data` 등 추가 예정

---

## 2. 테이블 상세 설계

### 2.1 board_menu_nodes (보드 메뉴 노드)

**설명**: 그룹과 보드를 계층적으로 관리하는 메뉴 노드 테이블

| 컬럼명                 | 타입                                              | 제약조건                  | 기본값                                            | 설명                                 |
| ---------------------- | ------------------------------------------------- | ------------------------- | ------------------------------------------------- | ------------------------------------ |
| `id`                   | VARCHAR(36)                                       | PRIMARY KEY               | -                                                 | UUID 형식 고유 ID                    |
| `parent_id`            | VARCHAR(36)                                       | FOREIGN KEY<br/>NULL 허용 | NULL                                              | 부모 노드 ID (최상위는 NULL)         |
| `name`                 | VARCHAR(255)                                      | NOT NULL                  | -                                                 | 노드 이름                            |
| `type`                 | ENUM('group', 'board')                            | NOT NULL                  | -                                                 | 노드 타입 (그룹 또는 보드)           |
| `description`          | TEXT                                              | NULL 허용                 | NULL                                              | 노드 설명                            |
| `icon`                 | VARCHAR(50)                                       | NULL 허용                 | NULL                                              | 메뉴 표시용 아이콘 이름              |
| `color`                | VARCHAR(20)                                       | NULL 허용                 | NULL                                              | 메뉴 표시용 색상                     |
| `expanded`             | BOOLEAN                                           | -                         | FALSE                                             | UI에서 확장되었는지 여부 (그룹만)    |
| `display_order`        | INT                                               | -                         | 0                                                 | 같은 레벨에서의 표시 순서            |
| `dashboard_preset`     | ENUM('single', 'split-lr', 'l-shape', 'split-tb') | NULL 허용                 | NULL                                              | 대시보드 레이아웃 프리셋 (보드만)    |
| `is_layout_configured` | BOOLEAN                                           | -                         | FALSE                                             | 대시보드 레이아웃 설정 여부 (보드만) |
| `created_at`           | TIMESTAMP                                         | -                         | CURRENT_TIMESTAMP                                 | 생성 일시                            |
| `updated_at`           | TIMESTAMP                                         | -                         | CURRENT_TIMESTAMP<br/>ON UPDATE CURRENT_TIMESTAMP | 수정 일시                            |
| `deleted_at`           | TIMESTAMP                                         | NULL 허용                 | NULL                                              | 삭제 일시 (휴지통)                   |
| `deleted_by`           | VARCHAR(100)                                      | NULL 허용                 | NULL                                              | 삭제한 사용자 ID (선택사항)          |

**인덱스:**

- `idx_parent_id` ON `parent_id`
- `idx_type` ON `type`
- `idx_deleted_at` ON `deleted_at`
- `idx_display_order` ON `display_order`

**외래키:**

- `parent_id` → `board_menu_nodes(id)` ON DELETE CASCADE (하위 노드도 함께 삭제)

**비고:**

- `type = 'board'`인 경우에만 `dashboard_preset`, `is_layout_configured` 사용
- `deleted_at IS NULL`인 경우만 활성 노드로 간주
- `display_order`는 같은 `parent_id` 내에서의 순서

---

### 2.2 board_windows (대시보드 창 구성)

**설명**: 보드의 대시보드에서 각 창(Window)의 분할/병합 구조 정보

**핵심 개념**:

- **창 구조 관리**: 사용자가 화면을 어떻게 분할할지, 각 창의 크기는 얼마인지 정의
- **컨테이너 역할**: 패널이 배치될 수 있는 창 영역을 정의
- **패널 배치와 구분**: `board_panels`는 창 안에 배치된 패널을 관리하며, `board_windows`는 창 구조 자체를 관리

| 컬럼명           | 타입         | 제약조건                 | 기본값                                            | 설명                                                    |
| ---------------- | ------------ | ------------------------ | ------------------------------------------------- | ------------------------------------------------------- |
| `id`             | VARCHAR(36)  | PRIMARY KEY              | -                                                 | UUID 형식 고유 ID                                       |
| `board_id`       | VARCHAR(36)  | FOREIGN KEY<br/>NOT NULL | -                                                 | 보드 노드 ID                                            |
| `pane_id`        | VARCHAR(50)  | NOT NULL                 | -                                                 | 창 식별자 (예: 'mainPane', 'leftPane', 'rightTopPaneL') |
| `size`           | DECIMAL(5,2) | NULL 허용                | NULL                                              | 창 크기 비율 (0-100)                                    |
| `is_container`   | BOOLEAN      | -                        | FALSE                                             | 중첩 컨테이너 창 여부                                   |
| `parent_pane_id` | VARCHAR(50)  | NULL 허용                | NULL                                              | 부모 창 ID (중첩 구조용)                                |
| `created_at`     | TIMESTAMP    | -                        | CURRENT_TIMESTAMP                                 | 생성 일시                                               |
| `updated_at`     | TIMESTAMP    | -                        | CURRENT_TIMESTAMP<br/>ON UPDATE CURRENT_TIMESTAMP | 수정 일시                                               |
| `deleted_at`     | TIMESTAMP    | NULL 허용                | NULL                                              | 삭제 일시 (휴지통)                                      |

**인덱스:**

- `idx_board_id` ON `board_id`
- `idx_pane_id` ON `pane_id`
- `idx_deleted_at` ON `deleted_at`

**외래키:**

- `board_id` → `board_menu_nodes(id)` ON DELETE CASCADE

**비고:**

- `board_id`는 `type = 'board'`인 노드만 참조
- `deleted_at IS NULL`인 경우만 활성 창으로 간주

---

### 2.3 board_panels (패널 인스턴스)

**설명**: 대시보드 창에 배치된 패널 인스턴스 (panel_instances)

**참고**:

- **패널 인스턴스 (panel_instances)**: 개념적 용어로, 패널 템플릿에서 실제로 생성되어 보드에 배치된 패널을 의미
- **`board_panels`**: 실제 데이터베이스 테이블명으로, 패널 인스턴스가 저장되는 테이블

**패널 배치 프로세스**:

1. 개발자가 패널을 컴포넌트/모듈로 개발
2. 개발된 패널을 `panel_catalog`에 등록 (패널 정보 종합)
3. 사용자가 `panel_catalog`에서 검색/선택
4. 선택한 패널을 `board_windows`의 창에 배치하여 `board_panels`에 저장 (인스턴스 생성)

| 컬럼명          | 타입         | 제약조건                 | 기본값                                            | 설명                                             |
| --------------- | ------------ | ------------------------ | ------------------------------------------------- | ------------------------------------------------ |
| `id`            | VARCHAR(36)  | PRIMARY KEY              | -                                                 | UUID 형식 고유 ID                                |
| `board_id`      | VARCHAR(36)  | FOREIGN KEY<br/>NOT NULL | -                                                 | 보드 노드 ID                                     |
| `pane_id`       | VARCHAR(50)  | NOT NULL                 | -                                                 | 속한 창 식별자                                   |
| `panel_type`    | VARCHAR(50)  | NOT NULL                 | -                                                 | 패널 타입 (예: 'chart', 'table', 'card', 'list') |
| `title`         | VARCHAR(255) | NOT NULL                 | '새 패널'                                         | 패널 제목                                        |
| `content`       | TEXT         | NULL 허용                | NULL                                              | 패널 내용 (JSON 또는 텍스트)                     |
| `config`        | JSON         | NULL 허용                | NULL                                              | 패널 설정 정보 (JSON 형식)                       |
| `grid_x`        | INT          | -                        | 0                                                 | 그리드 X 위치                                    |
| `grid_y`        | INT          | -                        | 0                                                 | 그리드 Y 위치                                    |
| `grid_w`        | INT          | -                        | 4                                                 | 그리드 너비                                      |
| `grid_h`        | INT          | -                        | 5                                                 | 그리드 높이                                      |
| `grid_i`        | VARCHAR(36)  | NOT NULL                 | -                                                 | 그리드 아이템 고유 키                            |
| `display_order` | INT          | -                        | 0                                                 | 같은 창 내에서의 표시 순서                       |
| `created_at`    | TIMESTAMP    | -                        | CURRENT_TIMESTAMP                                 | 생성 일시                                        |
| `updated_at`    | TIMESTAMP    | -                        | CURRENT_TIMESTAMP<br/>ON UPDATE CURRENT_TIMESTAMP | 수정 일시                                        |
| `deleted_at`    | TIMESTAMP    | NULL 허용                | NULL                                              | 삭제 일시 (휴지통)                               |

**인덱스:**

- `idx_board_id` ON `board_id`
- `idx_pane_id` ON `pane_id`
- `idx_panel_type` ON `panel_type`
- `idx_deleted_at` ON `deleted_at`
- `idx_grid_i` ON `grid_i`

**외래키:**

- `board_id` → `board_menu_nodes(id)` ON DELETE CASCADE

**비고:**

- `config` 필드는 패널 타입별 설정을 JSON으로 저장 (예: 차트 타입, 데이터 소스 등)
- `grid_i`는 vue-grid-layout에서 사용하는 고유 키
- `deleted_at IS NULL`인 경우만 활성 패널로 간주

---

### 2.4 board_devices (보드-디바이스 연결)

**설명**: 보드에 연결된 디바이스 정보

| 컬럼명              | 타입         | 제약조건                 | 기본값                                            | 설명                                    |
| ------------------- | ------------ | ------------------------ | ------------------------------------------------- | --------------------------------------- |
| `id`                | VARCHAR(36)  | PRIMARY KEY              | -                                                 | UUID 형식 고유 ID                       |
| `board_id`          | VARCHAR(36)  | FOREIGN KEY<br/>NOT NULL | -                                                 | 보드 노드 ID                            |
| `device_id`         | VARCHAR(36)  | NOT NULL                 | -                                                 | 디바이스 ID (외부 디바이스 테이블 참조) |
| `device_name`       | VARCHAR(255) | NULL 허용                | NULL                                              | 디바이스 이름 (캐시용)                  |
| `connection_config` | JSON         | NULL 허용                | NULL                                              | 디바이스 연결 설정 (JSON 형식)          |
| `display_order`     | INT          | -                        | 0                                                 | 보드 내에서의 표시 순서                 |
| `is_active`         | BOOLEAN      | -                        | TRUE                                              | 활성 연결 여부                          |
| `created_at`        | TIMESTAMP    | -                        | CURRENT_TIMESTAMP                                 | 생성 일시                               |
| `updated_at`        | TIMESTAMP    | -                        | CURRENT_TIMESTAMP<br/>ON UPDATE CURRENT_TIMESTAMP | 수정 일시                               |
| `deleted_at`        | TIMESTAMP    | NULL 허용                | NULL                                              | 삭제 일시 (휴지통)                      |

**인덱스:**

- `idx_board_id` ON `board_id`
- `idx_device_id` ON `device_id`
- `idx_deleted_at` ON `deleted_at`
- UNIQUE `idx_board_device` ON (`board_id`, `device_id`, `deleted_at`)

**외래키:**

- `board_id` → `board_menu_nodes(id)` ON DELETE CASCADE
- `device_id` → `devices_iot(id)` ON DELETE CASCADE

**비고:**

- `device_id`는 `devices_iot` 테이블 참조
- `deleted_at IS NULL`인 경우만 활성 연결로 간주
- 같은 보드에 같은 디바이스를 중복 연결 방지 (UNIQUE 인덱스)
- **N-N 관계**: 하나의 보드에 여러 기기 연결 가능, 하나의 기기를 여러 보드에 연결 가능

---

## 3. 휴지통 기능

### 3.1 Soft Delete (논리 삭제)

모든 테이블에 `deleted_at` 컬럼을 두어 논리 삭제를 구현합니다.

**삭제 프로세스:**

1. `deleted_at`에 현재 타임스탬프 저장
2. `deleted_by`에 사용자 ID 저장 (선택사항)
3. 데이터는 물리적으로 삭제하지 않음

**복원 프로세스:**

1. `deleted_at`을 NULL로 설정
2. 관련 하위 데이터도 함께 복원 (옵션)

**영구 삭제 프로세스:**

1. `deleted_at IS NOT NULL`인 데이터 중 30일 이상 경과한 데이터 조회
2. 물리적 DELETE 실행
3. 또는 수동으로 영구 삭제 실행

### 3.2 쿼리 예시

**활성 노드만 조회:**

```sql
SELECT * FROM board_menu_nodes
WHERE deleted_at IS NULL;
```

**휴지통 조회:**

```sql
SELECT * FROM board_menu_nodes
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
```

**복원:**

```sql
UPDATE board_menu_nodes
SET deleted_at = NULL, deleted_by = NULL
WHERE id = ?;
```

**영구 삭제 (30일 경과):**

```sql
DELETE FROM board_menu_nodes
WHERE deleted_at IS NOT NULL
AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 4. 관계도

```
board_menu_nodes (그룹/보드)
    ├── board_windows (창 구성) [1:N]
    │       └── board_panels (패널) [1:N]
    └── board_devices (디바이스 연결) [1:N]
            └── devices_iot (IoT 디바이스) [N:1]
                    ├── devices_sensors (센서 정보) [1:N]
                    │       └── devices_telemetry (센서 데이터) [1:N]
                    ├── devices_commands (명령 이력) [1:N]
                    └── devices_firmware (펌웨어 버전) [1:N]
```

**계층 구조:**

- `board_menu_nodes`는 자기 참조로 계층 구조 형성 (`parent_id`)
- 그룹은 여러 하위 그룹/보드를 가질 수 있음
- 보드는 여러 창(Window)을 가질 수 있음
- 각 창은 여러 패널을 가질 수 있음
- 보드는 여러 디바이스와 연결 가능 (`board_devices`)
- IoT 디바이스는 여러 센서를 가질 수 있음
- 각 센서는 시계열 데이터를 생성 (`devices_telemetry`)
- 디바이스 명령 및 펌웨어 버전 관리

---

## 5. 데이터 마이그레이션 고려사항

### 5.1 기존 localStorage 데이터 마이그레이션

현재 `localStorage`에 저장된 데이터를 MySQL로 마이그레이션할 때:

1. **board_menu_nodes**: `boardMenuDataNexa`의 각 노드를 INSERT
2. **board_windows**: `dashboardPanesConfig`를 파싱하여 각 window 정보 INSERT
3. **board_panels**: 각 window의 `nexaPanels` 배열을 파싱하여 INSERT
4. **board_devices**: 각 보드의 `devices` 배열을 파싱하여 INSERT

### 5.2 마이그레이션 스크립트 예시

```javascript
// 1. board_menu_nodes 마이그레이션
const nodes = JSON.parse(localStorage.getItem('boardMenuDataNexa'))
nodes.forEach(node => {
  if (!node.deleted_at) { // 활성 노드만
    INSERT INTO board_menu_nodes (id, parent_id, name, type, ...)
    VALUES (node.id, node.parentId, node.name, node.type, ...)
  }
})

// 2. board_windows, board_panels 마이그레이션
// dashboardPanesConfig 파싱하여 INSERT
```

---

## 6. 테이블 네이밍 규칙

### 6.1 네이밍 패턴

넥사보드 데이터베이스는 엔티티 중심과 기능 중심의 두 가지 네이밍 패턴을 사용합니다.

#### 엔티티 중심 테이블 (소유 관계)

엔티티의 속성이나 하위 엔티티를 표현하는 테이블:

- **`board_*`**: 보드 관련 엔티티

  - `board_menu_nodes`: 보드 메뉴 노드
  - `board_windows`: 보드의 창 구조
  - `board_panels`: 보드의 패널 인스턴스
  - `board_devices`: 보드-디바이스 연결

- **`devices_*`**: 디바이스 관련 엔티티

  - `devices_iot`: IoT 디바이스 기본 정보
  - `devices_sensors`: 디바이스의 센서 정보
  - `devices_telemetry`: 디바이스의 센서 데이터
  - `devices_commands`: 디바이스의 명령 이력
  - `devices_firmware`: 디바이스의 펌웨어 정보

- **`panel_*`**: 패널 관련 엔티티
  - `panel_catalog`: 패널 카탈로그
  - `panel_compatibility`: 패널 호환성 매핑

#### 기능 중심 테이블 (기능/관계)

특정 기능이나 관계를 표현하는 테이블:

- **`shares_*`**: 협력/공유 기능 (핵심 도메인)

  - `shares_boards`: 보드 공유 설정
  - `shares_devices`: 기기 공유 설정
  - 향후 확장: `shares_workspaces`, `shares_projects` 등

- **`api_*`**: API 관련 기능

  - `api_keys`: API 키 관리
  - `api_usage_logs`: API 사용 로그

- **`notification_*`**: 알림 기능

  - `notification_rules`: 알림 규칙
  - `notifications`: 알림 이력

- **`automation_*`**: 자동화 기능

  - `automation_rules`: 자동화 규칙
  - `automation_executions`: 자동화 실행 이력

- **`ai_*`**: AI 관련 기능 (핵심 확장 영역)
  - `ai_edge_configs`: 엣지 AI 설정 (현재)
  - 향후 확장: `ai_platform_configs`, `ai_models`, `ai_training_data`, `ai_predictions`, `ai_analytics` 등

### 6.2 네이밍 원칙

1. **일관성**: 같은 패턴의 테이블은 동일한 접두어 사용
2. **명확성**: 테이블명만 봐도 역할을 알 수 있어야 함
3. **그룹화**: 관련 테이블은 접두어로 그룹화하여 탐색 용이
4. **확장성**: 향후 추가될 테이블도 일관된 패턴 유지

### 6.3 선택 기준

**엔티티 중심 (`board_*`, `devices_*`, `panel_*`)을 사용하는 경우:**

- 특정 엔티티의 속성이나 하위 엔티티를 표현
- 소유 관계가 명확한 경우
- 예: `board_windows` (보드가 소유하는 창)

**기능 중심 (`shares_*`, `api_*`, `notification_*`, `ai_*`)을 사용하는 경우:**

- 독립적인 기능 도메인을 표현
- 여러 엔티티에 걸친 관계를 표현
- 협력, 공유, 알림, AI 등 기능 중심의 개념
- 예: `shares_boards` (보드 공유 기능), `ai_edge_configs` (AI 기능)

**AI 관련 테이블 네이밍 (`ai_*` 패턴):**

- **플랫폼 AI**: `ai_platform_*` (서버에서 실행되는 중앙 AI)
  - 예: `ai_platform_configs`, `ai_platform_models`
- **엣지 AI**: `ai_edge_*` (디바이스에서 실행되는 엣지 AI)
  - 예: `ai_edge_configs`, `ai_edge_models`
- **공통 AI**: `ai_*` (플랫폼/엣지 공통)
  - 예: `ai_models`, `ai_training_data`, `ai_predictions`, `ai_analytics`

---

## 7. 추가 고려사항

### 7.1 성능 최적화

- 자주 조회되는 쿼리에 인덱스 추가
- `deleted_at IS NULL` 조건을 항상 포함하여 활성 데이터만 조회
- 계층 구조 조회 시 재귀 CTE 또는 애플리케이션 레벨에서 처리

### 7.2 데이터 무결성

- 외래키 제약조건으로 참조 무결성 보장
- `ON DELETE CASCADE`로 보드 삭제 시 관련 데이터 자동 삭제
- 트랜잭션으로 일관성 보장

### 7.3 확장성

- 향후 사용자별 권한 관리 추가 시 `user_id` 컬럼 추가 가능
- 디바이스 관리 테이블과 연동 시 `device_id` 외래키 추가
- 패널 타입별 추가 설정은 `config` JSON 필드 활용

### 7.4 AI 친화적인 데이터 수집 구조 설계 (향후 AI 적용 고려)

**⚠️ 중요: 향후 AI 기능 적용을 위해 초기 설계 단계부터 고려 필요**

**AI 학습 및 분석에 적합한 데이터 수집 구조:**

1. **타임스탬프 일관성**

   - 모든 데이터에 정확한 타임스탬프 필드 포함 (`timestamp`, `created_at`)
   - 센서 데이터는 수집 시간(`timestamp`)과 수신 시간(`received_at`) 구분 저장
   - 시계 동기화를 통한 시간 정합성 유지

2. **데이터 품질 관리**

   - `devices_telemetry` 테이블의 `quality` 필드 활용 (`good`, `warning`, `error`, `unknown`)
   - 이상치(outlier) 표시 및 필터링을 위한 메타데이터 저장
   - 센서 오작동, 통신 끊김 등의 상태 정보 포함

3. **메타데이터 풍부성**

   - 센서 타입, 단위, 범위 정보 (`devices_sensors` 테이블)
   - 기기 정보, 위치 정보, 환경 정보 연결
   - 사용자 행동 패턴 (패널 조작, 자동화 규칙 실행 등)

4. **계층 구조 활용**

   - 보드 그룹 구조를 통한 공간적/논리적 그룹핑
   - 그룹 단위 패턴 분석 및 예측 가능

5. **이벤트 로깅**

   - 자동화 규칙 실행 이력 (`automation_executions`)
   - 명령 전송 이력 (`devices_commands`)
   - 사용자 인터랙션 로그 (향후 추가)

6. **시계열 데이터 최적화**

   - `devices_telemetry` 테이블의 인덱스 전략 (`device_id`, `sensor_id`, `timestamp`)
   - 시간 범위 기반 쿼리 최적화
   - 데이터 보관 기간 정책 (AI 학습용 장기 보관 vs 실시간 모니터링용 단기 보관)

7. **정규화된 데이터 구조**
   - 센서별 데이터를 개별 레코드로 저장 (AI 학습 시 특징 추출 용이)
   - JSON 필드 활용은 설정 정보에만 제한 (쿼리 및 분석 용이성)

**향후 AI 적용 시 추가 테이블 예상:**

- `ai_training_data`: 학습용 데이터셋 (원본 데이터 참조 + 라벨링 정보)
- `ai_features`: 추출된 특징 벡터 (전처리된 데이터)
- `ai_models`: 학습된 모델 정보 및 버전 관리
- `ai_predictions`: 예측 결과 저장 (실시간 예측 vs 배치 예측)
- `ai_analytics`: 분석 결과 저장 (패턴 분석, 이상 징후 등)

**데이터 수집 시 고려사항:**

- **주기적 수집**: 센서 데이터 수집 주기 설정 가능 (`devices_iot`의 설정)
- **이벤트 기반 수집**: 임계값 초과, 상태 변경 시 즉시 수집
- **샘플링 전략**: AI 학습을 위한 효율적인 샘플링 (중요 구간 집중 샘플링)
- **데이터 압축**: 장기 보관 시 효율적인 압축 전략

---

## 8. SQL 생성 스크립트 예시

````sql
-- 1. board_menu_nodes 테이블 생성
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
  INDEX `idx_display_order` (`display_order`),
  FOREIGN KEY (`parent_id`) REFERENCES `board_menu_nodes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. board_windows 테이블 생성
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

-- 3. board_panels 테이블 생성
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

-- 4. board_devices 테이블 생성
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
  FOREIGN KEY (`board_id`) REFERENCES `board_menu_nodes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`device_id`) REFERENCES `devices_iot`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. devices_iot 테이블 생성
CREATE TABLE `devices_iot` (
  `id` VARCHAR(36) PRIMARY KEY,
  `device_name` VARCHAR(255) NOT NULL,
  `device_type` VARCHAR(50) NOT NULL DEFAULT 'ESP32',
  `mac_address` VARCHAR(17) UNIQUE NULL,
  `ip_address` VARCHAR(45) NULL,
  `serial_number` VARCHAR(100) UNIQUE NULL,
  `firmware_version` VARCHAR(50) NULL,
  `hardware_version` VARCHAR(50) NULL,
  `connection_type` ENUM('wifi', 'ethernet', 'bluetooth', 'serial') NOT NULL DEFAULT 'wifi',
  `connection_config` JSON NULL,
  `mqtt_topic` VARCHAR(255) NULL,
  `mqtt_config` JSON NULL,
  `status` ENUM('online', 'offline', 'error', 'maintenance') NOT NULL DEFAULT 'offline',
  `last_seen_at` TIMESTAMP NULL,
  `location` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
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

**비고:**

- `mac_address` 또는 `serial_number`로 디바이스 고유 식별
- `status`는 실시간 연결 상태 추적
- `last_seen_at`은 하트비트 또는 데이터 수신 시 업데이트
- `deleted_at IS NULL`인 경우만 활성 디바이스로 간주
- **초기 등록**: 모델 번호와 API 키만으로 등록 가능, 나머지 정보는 자동 처리
- **자동 디바이스 발견**: 기기가 서버 모드로 작동하여 플랫폼으로 정보 전달, API 키 발급

**통신 프로토콜:**

- **MQTT 통신**: `mqtt_topic`, `mqtt_config` 필드로 MQTT 통신 설정 관리
- **MQTT 선택 이유**: 토픽 기반 권한 관리 기능이 웹소켓 통신에서 MQTT로 결정하게 된 중요한 계기
  - 토픽별 세밀한 접근 제어 가능
  - 디바이스/사용자별 구독/발행 권한 관리
  - 보안 및 협업 시나리오에 적합
- **초기 구축**: Node.js 서버에서 웹소켓 포트를 이용하여 MQTT 우회 구축
- **향후 업그레이드**: 호스팅 업그레이드 후 정식 MQTT 포트(1883/8883) 적용
- `mqtt_config` JSON 구조 예시:
  ```json
  {
    "broker_url": "ws://platform.example.com/mqtt",
    "port": 8080,
    "username": "device_id",
    "password": "api_key",
    "client_id": "device_xxx",
    "qos": 1,
    "retain": false,
    "will_topic": "devices/xxx/status",
    "will_message": "offline"
  }
````

-- 6. devices_sensors 테이블 생성
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

-- 7. devices_telemetry 테이블 생성
CREATE TABLE `devices_telemetry` (
`id` BIGINT PRIMARY KEY AUTO_INCREMENT,
`device_id` VARCHAR(36) NOT NULL,
`sensor_id` VARCHAR(36) NOT NULL,
`value` DECIMAL(15,4) NOT NULL,
`raw_value` VARCHAR(100) NULL,
`quality` ENUM('good', 'warning', 'error', 'unknown') NOT NULL DEFAULT 'unknown',
`timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
`received_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`metadata` JSON NULL,
INDEX `idx_device_id` (`device_id`),
INDEX `idx_sensor_id` (`sensor_id`),
INDEX `idx_timestamp` (`timestamp`),
INDEX `idx_received_at` (`received_at`),
INDEX `idx_device_timestamp` (`device_id`, `timestamp`),
INDEX `idx_sensor_timestamp` (`sensor_id`, `timestamp`),
FOREIGN KEY (`device_id`) REFERENCES `devices_iot`(`id`) ON DELETE CASCADE,
FOREIGN KEY (`sensor_id`) REFERENCES `devices_sensors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. devices_commands 테이블 생성
CREATE TABLE `devices_commands` (
`id` VARCHAR(36) PRIMARY KEY,
`device_id` VARCHAR(36) NOT NULL,
`command_type` VARCHAR(50) NOT NULL,
`command_data` JSON NULL,
`status` ENUM('pending', 'sent', 'acknowledged', 'failed', 'timeout') NOT NULL DEFAULT 'pending',
`response_data` JSON NULL,
`sent_at` TIMESTAMP NULL,
`acknowledged_at` TIMESTAMP NULL,
`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
`created_by` VARCHAR(100) NULL,
INDEX `idx_device_id` (`device_id`),
INDEX `idx_command_type` (`command_type`),
INDEX `idx_status` (`status`),
INDEX `idx_sent_at` (`sent_at`),
INDEX `idx_created_at` (`created_at`),
FOREIGN KEY (`device_id`) REFERENCES `devices_iot`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. devices_firmware 테이블 생성
CREATE TABLE `devices_firmware` (
`id` VARCHAR(36) PRIMARY KEY,
`device_id` VARCHAR(36) NOT NULL,
`firmware_version` VARCHAR(50) NOT NULL,
`firmware_file` VARCHAR(255) NULL,
`firmware_hash` VARCHAR(64) NULL,
`release_notes` TEXT NULL,
`is_current` BOOLEAN DEFAULT FALSE,
`installed_at` TIMESTAMP NULL,
`installed_by` VARCHAR(100) NULL,
`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
`deleted_at` TIMESTAMP NULL,
INDEX `idx_device_id` (`device_id`),
INDEX `idx_firmware_version` (`firmware_version`),
INDEX `idx_is_current` (`is_current`),
INDEX `idx_deleted_at` (`deleted_at`),
FOREIGN KEY (`device_id`) REFERENCES `devices_iot`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

```

---

**참고**: 이 스키마는 현재 localStorage 기반 구조를 MySQL로 마이그레이션하기 위한 설계입니다. 실제 구현 시 추가 요구사항에 따라 수정이 필요할 수 있습니다.

**관련 문서:**

- `docs/BOARD_FEATURE_SPECIFICATION.md` - 넥사보드 기능 명세서
```
