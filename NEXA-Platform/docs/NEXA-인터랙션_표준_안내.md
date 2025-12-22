# 인터랙션 표준 (Interaction Standard)

**작성일**: 2024년  
**목적**: 컴포넌트의 제어/인터랙션 기능을 표준화하여 번역기 구현 난이도를 낮추기 위한 규격 정의  
**버전**: 1.0

---

## 개요

인터랙션 표준은 컴포넌트의 제어 및 인터랙션 기능을 `actions` 배열로 표준화하여, 번역기가 인터랙션을 예측 가능한 형식으로 읽고 변환할 수 있도록 합니다.

### 핵심 원칙

1. **표준화**: 모든 인터랙션을 `actions` 배열로 표현
2. **예측 가능성**: 번역기가 표준 형식으로 인터랙션을 파악 가능
3. **확장성**: 새로운 인터랙션 타입 추가 시에도 표준 형식 유지

---

## ActionContract 인터페이스

### 기본 구조

```typescript
interface ActionContract {
  id: string                    // 액션 ID (고유 식별자)
  type: 'control' | 'update' | 'trigger'  // 액션 타입
  target: string                // 대상 (디바이스 ID, 패널 ID 등)
  params: object                // 액션 파라미터
  enabled: boolean             // 활성화 여부
  label?: string               // 액션 라벨 (UI 표시용)
  description?: string         // 액션 설명
}
```

### 액션 타입 상세

#### 1. control (제어 액션)

**용도**: 컴포넌트나 디바이스를 제어하는 액션

**예시**:
- 패널 이동, 리사이즈
- 디바이스 제어 (조명 켜기/끄기, 온도 설정 등)
- 보드 레이아웃 변경

**params 구조**:
```typescript
{
  action: string,              // 구체적인 액션 이름 (예: 'move', 'resize', 'turnOn')
  [key: string]: any          // 액션별 추가 파라미터
}
```

#### 2. update (업데이트 액션)

**용도**: 데이터나 설정을 업데이트하는 액션

**예시**:
- 데이터 갱신
- 설정 변경
- 필터 적용

**params 구조**:
```typescript
{
  field?: string,             // 업데이트할 필드 (선택적)
  value?: any,                // 새 값
  [key: string]: any          // 업데이트별 추가 파라미터
}
```

#### 3. trigger (트리거 액션)

**용도**: 이벤트를 발생시키거나 워크플로우를 시작하는 액션

**예시**:
- 노드 실행
- 워크플로우 시작
- 알림 발송

**params 구조**:
```typescript
{
  event?: string,             // 이벤트 이름 (선택적)
  [key: string]: any          // 트리거별 추가 파라미터
}
```

---

## 컴포넌트별 인터랙션 예시

### 보드(Board) 인터랙션

#### 패널 이동

```json
{
  "id": "action-board-panel-move-001",
  "type": "control",
  "target": "panel-001",
  "params": {
    "action": "move",
    "x": 100,
    "y": 200
  },
  "enabled": true,
  "label": "패널 이동"
}
```

#### 패널 리사이즈

```json
{
  "id": "action-board-panel-resize-001",
  "type": "control",
  "target": "panel-001",
  "params": {
    "action": "resize",
    "width": 300,
    "height": 200
  },
  "enabled": true,
  "label": "패널 크기 조정"
}
```

#### 레이아웃 변경

```json
{
  "id": "action-board-layout-change-001",
  "type": "control",
  "target": "board-001",
  "params": {
    "action": "changeLayout",
    "preset": "split-lr"
  },
  "enabled": true,
  "label": "레이아웃 변경"
}
```

### 노드(Node) 인터랙션

#### 노드 실행

```json
{
  "id": "action-node-execute-001",
  "type": "trigger",
  "target": "node-001",
  "params": {
    "execute": true,
    "async": false
  },
  "enabled": true,
  "label": "노드 실행"
}
```

#### 데이터 흐름 제어

```json
{
  "id": "action-node-connection-toggle-001",
  "type": "control",
  "target": "connection-001",
  "params": {
    "action": "toggle",
    "enabled": false
  },
  "enabled": true,
  "label": "연결 활성화/비활성화"
}
```

### 차트(Chart) 인터랙션

#### 줌

```json
{
  "id": "action-chart-zoom-001",
  "type": "control",
  "target": "chart-001",
  "params": {
    "action": "zoom",
    "x": [0, 100],
    "y": [0, 50]
  },
  "enabled": true,
  "label": "차트 확대"
}
```

#### 필터 적용

```json
{
  "id": "action-chart-filter-001",
  "type": "update",
  "target": "chart-001",
  "params": {
    "filter": {
      "dateRange": {
        "start": "2024-01-01",
        "end": "2024-01-31"
      },
      "category": "temperature"
    }
  },
  "enabled": true,
  "label": "필터 적용"
}
```

### 블록(Block) 인터랙션

#### 데이터 갱신

```json
{
  "id": "action-block-refresh-001",
  "type": "update",
  "target": "block-001",
  "params": {
    "refresh": true,
    "force": false
  },
  "enabled": true,
  "label": "데이터 갱신"
}
```

### 패널(Panel) 인터랙션

#### 패널 리사이즈

```json
{
  "id": "action-panel-resize-001",
  "type": "control",
  "target": "panel-001",
  "params": {
    "action": "resize",
    "width": 400,
    "height": 300
  },
  "enabled": true,
  "label": "패널 크기 조정"
}
```

#### 패널 이동

```json
{
  "id": "action-panel-move-001",
  "type": "control",
  "target": "panel-001",
  "params": {
    "action": "move",
    "x": 150,
    "y": 250
  },
  "enabled": true,
  "label": "패널 이동"
}
```

---

## 디바이스 제어 인터랙션

### 조명 제어

```json
{
  "id": "action-device-light-turnon-001",
  "type": "control",
  "target": "device-light-001",
  "params": {
    "action": "turnOn",
    "brightness": 80,
    "color": "#FFFFFF"
  },
  "enabled": true,
  "label": "조명 켜기"
}
```

### 온도 설정

```json
{
  "id": "action-device-thermostat-set-001",
  "type": "control",
  "target": "device-thermostat-001",
  "params": {
    "action": "setTemperature",
    "temperature": 22,
    "unit": "celsius"
  },
  "enabled": true,
  "label": "온도 설정"
}
```

### 센서 데이터 읽기

```json
{
  "id": "action-device-sensor-read-001",
  "type": "trigger",
  "target": "device-sensor-001",
  "params": {
    "action": "read",
    "sensorType": "temperature",
    "interval": 1000
  },
  "enabled": true,
  "label": "센서 데이터 읽기"
}
```

---

## 번역기에서의 활용

### 보드 → 문서 번역 시

**원본 (보드)**:
```json
{
  "actions": [
    {
      "id": "action-board-panel-move-001",
      "type": "control",
      "target": "panel-001",
      "params": {"action": "move", "x": 100, "y": 200},
      "enabled": true
    }
  ]
}
```

**변환 (문서, 읽기 전용)**:
```json
{
  "actions": [
    {
      "id": "action-board-panel-move-001",
      "type": "control",
      "target": "panel-001",
      "params": {"action": "move", "x": 100, "y": 200},
      "enabled": false,  // 문서에서는 비활성화
      "label": "패널 이동 (읽기 전용)"
    }
  ]
}
```

### 노드 → 보드 번역 시

**원본 (노드)**:
```json
{
  "actions": [
    {
      "id": "action-node-execute-001",
      "type": "trigger",
      "target": "node-001",
      "params": {"execute": true},
      "enabled": true
    }
  ]
}
```

**변환 (보드 패널)**:
```json
{
  "actions": [
    {
      "id": "action-node-execute-001",
      "type": "trigger",
      "target": "panel-node-001",  // 패널 ID로 변환
      "params": {"execute": true, "source": "node-001"},
      "enabled": true,
      "label": "노드 실행"
    }
  ]
}
```

---

## 액션 그룹화

여러 액션을 그룹화하여 복합 인터랙션을 표현할 수 있습니다.

### 예시: 패널 이동 및 리사이즈

```json
{
  "actions": [
    {
      "id": "action-panel-move-resize-001",
      "type": "control",
      "target": "panel-001",
      "params": {
        "action": "moveAndResize",
        "x": 100,
        "y": 200,
        "width": 300,
        "height": 200
      },
      "enabled": true,
      "label": "패널 이동 및 크기 조정"
    }
  ]
}
```

---

## 액션 체이닝

여러 액션을 순차적으로 실행하는 경우:

```json
{
  "actions": [
    {
      "id": "action-chain-001",
      "type": "trigger",
      "target": "workflow-001",
      "params": {
        "chain": [
          {"action": "move", "target": "panel-001", "params": {"x": 100, "y": 200}},
          {"action": "resize", "target": "panel-001", "params": {"width": 300, "height": 200}},
          {"action": "refresh", "target": "panel-001"}
        ]
      },
      "enabled": true,
      "label": "패널 이동 → 리사이즈 → 갱신"
    }
  ]
}
```

---

## 액션 조건부 실행

조건에 따라 액션을 실행하는 경우:

```json
{
  "actions": [
    {
      "id": "action-conditional-001",
      "type": "trigger",
      "target": "node-001",
      "params": {
        "condition": {
          "type": "if",
          "check": "device-sensor-001.temperature > 25",
          "then": {"action": "turnOn", "target": "device-fan-001"},
          "else": {"action": "turnOff", "target": "device-fan-001"}
        }
      },
      "enabled": true,
      "label": "조건부 팬 제어"
    }
  ]
}
```

---

## 액션 우선순위

여러 액션이 동시에 실행될 때 우선순위를 지정:

```json
{
  "actions": [
    {
      "id": "action-priority-high-001",
      "type": "control",
      "target": "device-001",
      "params": {"action": "emergencyStop"},
      "enabled": true,
      "priority": 1,  // 높은 우선순위
      "label": "긴급 정지"
    },
    {
      "id": "action-priority-low-001",
      "type": "update",
      "target": "device-001",
      "params": {"action": "updateSettings"},
      "enabled": true,
      "priority": 10,  // 낮은 우선순위
      "label": "설정 업데이트"
    }
  ]
}
```

---

## 액션 실행 결과

액션 실행 후 결과를 반환하는 경우:

```json
{
  "actions": [
    {
      "id": "action-with-result-001",
      "type": "trigger",
      "target": "node-001",
      "params": {"execute": true},
      "enabled": true,
      "label": "노드 실행",
      "result": {
        "status": "success",
        "data": {...},
        "timestamp": "2024-01-01T00:00:00Z"
      }
    }
  ]
}
```

---

## 참고 문서

- [NEXA-컴포넌트_표준_계약.md](./NEXA-컴포넌트_표준_계약.md): 표준 계약 전체 구조
- [NEXA-번역기_시스템.md](./NEXA-번역기_시스템.md): 번역기 시스템에서의 활용
- [NEXA-컴포넌트_재사용_가이드.md](./NEXA-컴포넌트_재사용_가이드.md): 컴포넌트 재사용 가이드

