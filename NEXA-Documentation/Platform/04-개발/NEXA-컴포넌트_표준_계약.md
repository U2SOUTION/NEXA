# 컴포넌트 표준 계약 (Component Standard Contract)

**작성일**: 2024년  
**목적**: 모든 컴포넌트(노드, 보드, 차트, 블록, 패널, 다이어그램)가 따라야 하는 최소한의 공통 규약 정의  
**버전**: 1.0

---

## 개요

표준 계약은 각 컴포넌트가 자신의 성격에 맞게 최적화된 구조를 가지되, 번역기 시스템이 변환할 때 예측 가능한 구조를 보장하기 위한 공통 규약입니다.

### 핵심 원칙

1. **자율성**: 각 컴포넌트는 자신의 책임에 충실하게 최적화된 구조를 가짐
2. **표준 준수**: 공통 인터페이스나 규약을 따름
3. **예측 가능성**: 번역기가 표준 필드를 통해 컴포넌트 구조를 예측 가능

---

## 표준 계약 인터페이스

### 기본 구조

```typescript
interface ComponentContract {
    // 필수 필드
    id: string; // 고유 식별자 (UUID 권장)
    type: string; // 컴포넌트 타입 (예: 'board', 'node', 'chart', 'block', 'panel', 'diagram')
    version: string; // 버전 정보 (예: '1.0', '2.1')

    // 메타데이터 (표준)
    metadata: MetadataContract;

    // 직렬화 메서드 (표준)
    toJSON(): object; // 표준 JSON 형식으로 변환

    // 인터랙션 표준 (제어 기능이 있는 경우)
    actions?: ActionContract[]; // 표준화된 액션 정의

    // 데이터 소스 표준
    dataSource?: DataSourceContract; // 데이터 소스 정보
}
```

### 메타데이터 계약

```typescript
interface MetadataContract {
    createdAt: string; // 생성일시 (ISO 8601 형식)
    updatedAt: string; // 수정일시 (ISO 8601 형식)
    author?: string; // 작성자 ID
    tags?: string[]; // 태그 배열
    description?: string; // 설명
}
```

### 인터랙션 계약

```typescript
interface ActionContract {
    id: string; // 액션 ID (고유 식별자)
    type: "control" | "update" | "trigger"; // 액션 타입
    target: string; // 대상 (디바이스 ID, 패널 ID 등)
    params: object; // 액션 파라미터
    enabled: boolean; // 활성화 여부
    label?: string; // 액션 라벨 (UI 표시용)
}
```

**액션 타입 설명**:

-   `control`: 제어 액션 (예: 디바이스 제어, 패널 이동)
-   `update`: 업데이트 액션 (예: 데이터 갱신, 설정 변경)
-   `trigger`: 트리거 액션 (예: 이벤트 발생, 워크플로우 시작)

### 데이터 소스 계약

```typescript
interface DataSourceContract {
    type: "db" | "api" | "device" | "static"; // 데이터 소스 타입
    connection: string; // 연결 정보 (DB 연결 문자열, API URL 등)
    query?: object; // 쿼리 정보 (SQL 쿼리, API 파라미터 등)
    refreshInterval?: number; // 갱신 주기 (밀리초, 선택적)
}
```

---

## 각 컴포넌트별 표준 계약 적용

### 보드(Board)

**표준 계약 필수 필드**:

-   `id`: 보드 고유 ID
-   `type`: `"board"`
-   `version`: 보드 버전
-   `metadata`: 생성일시, 수정일시, 작성자 등

**자율적 구조** (보드 특화):

-   `preset`: 레이아웃 프리셋 (single, split-lr, l-shape, split-tb)
-   `panes`: 창(Pane) 구조 및 패널 배열
-   `devices`: 연결된 디바이스 ID 배열

**인터랙션 표준화**:

-   패널 이동 → `actions: [{type: 'control', target: 'panel-1', params: {action: 'move', x: 100, y: 200}}]`
-   패널 리사이즈 → `actions: [{type: 'control', target: 'panel-1', params: {action: 'resize', width: 300, height: 200}}]`

**예시**:

```json
{
  "id": "board-001",
  "type": "board",
  "version": "1.0",
  "metadata": {
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z",
    "author": "user-123",
    "tags": ["대시보드", "모니터링"]
  },
  "preset": "split-lr",
  "panes": [...],
  "devices": ["device-001", "device-002"],
  "actions": [
    {
      "id": "action-001",
      "type": "control",
      "target": "panel-001",
      "params": {"action": "move", "x": 100, "y": 200},
      "enabled": true
    }
  ]
}
```

### 노드(Node)

**표준 계약 필수 필드**:

-   `id`: 노드 고유 ID
-   `type`: `"node"`
-   `version`: 노드 버전
-   `metadata`: 생성일시, 수정일시, 작성자 등

**자율적 구조** (노드 특화):

-   `nodes`: 노드 배열 (트리거, 처리, 액션)
-   `connections`: 노드 간 연결 정보 (소켓 연결)
-   `dataFlow`: 데이터 흐름 정의

**인터랙션 표준화**:

-   노드 실행 → `actions: [{type: 'trigger', target: 'node-001', params: {execute: true}}]`
-   데이터 흐름 제어 → `actions: [{type: 'control', target: 'connection-001', params: {enabled: false}}]`

### 차트(Chart)

**표준 계약 필수 필드**:

-   `id`: 차트 고유 ID
-   `type`: `"chart"`
-   `version`: 차트 버전
-   `metadata`: 생성일시, 수정일시, 작성자 등

**자율적 구조** (차트 특화):

-   `chartType`: 차트 타입 (line, bar, pie 등)
-   `data`: 시각화 데이터
-   `options`: 차트 옵션 (스케일, 색상 등)

**데이터 소스 표준화**:

-   `dataSource`: `{type: 'db', connection: 'mysql://...', query: {...}}`

**인터랙션 표준화** (선택적):

-   줌 → `actions: [{type: 'control', target: 'chart-001', params: {action: 'zoom', x: [0, 100]}}]`
-   필터 → `actions: [{type: 'update', target: 'chart-001', params: {filter: {...}}}]`

### 블록(Block)

**표준 계약 필수 필드**:

-   `id`: 블록 고유 ID
-   `type`: `"block"`
-   `version`: 블록 버전
-   `metadata`: 생성일시, 수정일시, 작성자 등

**자율적 구조** (블록 특화):

-   `blockType`: 블록 타입 (time, weather, chart 등)
-   `config`: 블록 설정

**데이터 소스 표준화**:

-   `dataSource`: `{type: 'api', connection: 'https://api.example.com/weather', refreshInterval: 60000}`

### 패널(Panel)

**표준 계약 필수 필드**:

-   `id`: 패널 고유 ID
-   `type`: `"panel"`
-   `version`: 패널 버전
-   `metadata`: 생성일시, 수정일시, 작성자 등

**자율적 구조** (패널 특화):

-   `panelType`: 패널 타입
-   `grid`: 그리드 위치/크기 (x, y, w, h)
-   `content`: 패널 내용

**인터랙션 표준화**:

-   리사이즈 → `actions: [{type: 'control', target: 'panel-001', params: {action: 'resize', width: 300, height: 200}}]`
-   이동 → `actions: [{type: 'control', target: 'panel-001', params: {action: 'move', x: 100, y: 200}}]`

---

## toJSON() 메서드 구현

모든 컴포넌트는 표준 JSON 형식으로 직렬화할 수 있는 `toJSON()` 메서드를 구현해야 합니다.

### 구현 예시

```javascript
// 보드 컴포넌트 예시
class Board {
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            version: this.version,
            metadata: this.metadata,
            preset: this.preset,
            panes: this.panes,
            devices: this.devices,
            actions: this.actions || [],
            dataSource: this.dataSource || null,
        };
    }
}
```

---

## 표준 계약의 이점

### 1. 예측 가능성

-   번역기가 표준 필드를 통해 컴포넌트 구조를 예측 가능
-   `id`, `type`, `version`으로 기본 정보 파악
-   `metadata`로 생성일시, 수정일시 등 공통 정보 접근

### 2. 인터랙션 처리 용이

-   제어/인터랙션 기능을 `actions` 배열로 표준화
-   번역기가 인터랙션을 표준 형식으로 읽고 변환 가능
-   복잡한 인터랙션도 표준 형식으로 표현 가능

### 3. 데이터 소스 통일

-   `dataSource` 표준으로 데이터 연결 정보 변환 용이
-   DB, API, 디바이스 등 다양한 소스를 표준 형식으로 표현

### 4. 버전 관리

-   `version` 필드로 호환성 관리
-   번역기가 버전에 따라 다른 변환 로직 적용 가능

### 5. 확장성

-   새로운 컴포넌트 타입 추가 시 표준 계약만 준수하면 됨
-   번역기가 새로운 컴포넌트도 자동으로 처리 가능

---

## DB 스키마 적용

### 표준 필드 포함 테이블 구조

```sql
-- 모든 컴포넌트 테이블의 공통 구조 예시
CREATE TABLE component_base (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  metadata JSON NOT NULL,      -- {createdAt, updatedAt, author, tags}
  actions JSON NULL,            -- [{id, type, target, params, enabled}]
  data_source JSON NULL,        -- {type, connection, query}
  -- 컴포넌트별 자율적 필드들...
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 각 컴포넌트 테이블 예시

```sql
-- 보드 테이블
CREATE TABLE boards (
  id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'board',
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  metadata JSON NOT NULL,
  actions JSON NULL,
  data_source JSON NULL,
  -- 보드 자율적 필드
  preset VARCHAR(20) NOT NULL,
  panes JSON NOT NULL,
  devices JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 마이그레이션 가이드

기존 컴포넌트에 표준 계약을 적용하는 방법:

1. **표준 필드 추가**: `id`, `type`, `version`, `metadata` 필드 추가
2. **toJSON() 메서드 구현**: 표준 JSON 형식으로 직렬화
3. **인터랙션 표준화**: 제어 기능을 `actions` 배열로 변환
4. **데이터 소스 표준화**: 데이터 연결 정보를 `dataSource` 객체로 변환
5. **DB 스키마 업데이트**: 테이블에 표준 필드 추가

---

## 참고 문서

-   [NEXA-인터랙션*표준*안내.md](../02-아키텍처/NEXA-인터랙션_표준_안내.md): 인터랙션 표준 상세 규격
-   [NEXA-번역기\_시스템.md](../02-아키텍처/NEXA-번역기_시스템.md): 번역기 시스템 설계
-   [NEXA-컴포넌트*재사용*가이드.md](./NEXA-컴포넌트_재사용_가이드.md): 컴포넌트 재사용 가이드
