# 인터랙션 표준 (Interaction Standard)

**작성일**: 2024년  
**목적**: NEXA Platform의 핵심 모듈(패널, 노드, 티치 등) 간 통신과 응용을 쉽게 하기 위한 표준 규칙 정의  
**버전**: 1.0 (초안)

---

## 개요

인터랙션 표준은 NEXA Platform의 핵심 모듈(패널, 노드, 티치, 보드, 차트, 블록 등) 간 통신과 응용을 쉽게 하기 위한 표준 규칙입니다. 이 표준을 TypeScript 구조로 구현하여, 각 모듈이 서로 통신할 때 번역기를 통하지 않고도 직접 통신할 수 있도록 하는 것이 목표입니다.

### 현재 상태

⚠️ **초안 단계**: 현재 각 모듈의 패턴과 실제 응용 방법이 구체화되지 않아 TypeScript 틀을 아직 만들지 못한 상태입니다. 향후 각 모듈의 패턴이 완성되면 이 표준도 TypeScript 구조로 구체화할 예정입니다.

### 번역기 시스템과의 관계

- **이상적인 경우**: 이 표준을 따르면 번역기를 통하지 않고도 모듈 간 직접 통신이 가능합니다.
- **현실적인 대응**: 완벽하지 않거나 표준을 따르지 않는 경우, [번역기 시스템](./NEXA-번역기_시스템.md)을 통해 통신을 중계합니다.

### 핵심 원칙

1. **표준화**: 모든 인터랙션을 `actions` 배열로 표현
2. **직접 통신**: 번역기를 통하지 않고도 모듈 간 통신 가능
3. **예측 가능성**: 표준 형식으로 인터랙션을 파악 가능
4. **확장성**: 새로운 인터랙션 타입 추가 시에도 표준 형식 유지

---

## ActionContract 인터페이스 (제안)

> **참고**: 아래 인터페이스는 향후 TypeScript 구조로 구현할 때의 제안 사항입니다. 현재는 각 모듈의 패턴이 완성되지 않아 구체적인 구현은 보류 상태입니다.

### 기본 구조

```typescript
interface ActionContract {
  id: string // 액션 ID (고유 식별자)
  type: 'control' | 'update' | 'trigger' // 액션 타입
  target: string // 대상 (디바이스 ID, 패널 ID 등)
  params: object // 액션 파라미터
  enabled: boolean // 활성화 여부
  label?: string // 액션 라벨 (UI 표시용)
  description?: string // 액션 설명
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

## 향후 구현 계획

### TypeScript 구조 구현

각 모듈의 패턴이 완성되면 다음 단계로 진행할 예정입니다:

1. **모듈별 패턴 분석**: 패널, 노드, 티치, 보드, 차트, 블록 각 모듈의 실제 통신 패턴 파악
2. **공통 인터페이스 정의**: 모듈 간 공통으로 사용할 수 있는 TypeScript 인터페이스 정의
3. **타입 시스템 구축**: TypeScript 타입을 활용한 통신 규칙 강제
4. **검증 시스템**: 표준을 따르지 않는 통신 시도 시 경고 또는 자동 변환

### 번역기 시스템과의 통합

표준을 완벽하게 따르지 못하는 경우, 번역기 시스템이 자동으로 중계합니다:

- **표준 준수 모듈**: 직접 통신 (번역기 우회)
- **표준 미준수 모듈**: 번역기를 통한 통신 (자동 변환)

---

## 번역기에서의 활용 (참고)

> **참고**: 아래 내용은 번역기 시스템이 표준을 따르지 않는 모듈 간 통신을 중계할 때의 예시입니다.

### 보드 → 문서 번역 시

**원본 (보드)**:

```json
{
  "actions": [
    {
      "id": "action-board-panel-move-001",
      "type": "control",
      "target": "panel-001",
      "params": { "action": "move", "x": 100, "y": 200 },
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
      "params": { "action": "move", "x": 100, "y": 200 },
      "enabled": false, // 문서에서는 비활성화
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
      "params": { "execute": true },
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
      "target": "panel-node-001", // 패널 ID로 변환
      "params": { "execute": true, "source": "node-001" },
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
          { "action": "move", "target": "panel-001", "params": { "x": 100, "y": 200 } },
          { "action": "resize", "target": "panel-001", "params": { "width": 300, "height": 200 } },
          { "action": "refresh", "target": "panel-001" }
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
          "then": { "action": "turnOn", "target": "device-fan-001" },
          "else": { "action": "turnOff", "target": "device-fan-001" }
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
      "params": { "action": "emergencyStop" },
      "enabled": true,
      "priority": 1, // 높은 우선순위
      "label": "긴급 정지"
    },
    {
      "id": "action-priority-low-001",
      "type": "update",
      "target": "device-001",
      "params": { "action": "updateSettings" },
      "enabled": true,
      "priority": 10, // 낮은 우선순위
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

## 관련 문서

- **[NEXA-번역기\_시스템.md](./NEXA-번역기_시스템.md)** ⭐ - 핵심 컴포넌트 간 통신을 위한 번역기 시스템 (표준을 따르지 못할 때의 대안)
- [NEXA-컴포넌트*표준*계약.md](../04-개발/NEXA-컴포넌트_표준_계약.md): 표준 계약 전체 구조
- [NEXA-컴포넌트*재사용*가이드.md](../04-개발/NEXA-컴포넌트_재사용_가이드.md): 컴포넌트 재사용 가이드

---

## 개발 가이드

### 현재 개발 시 주의사항

1. **표준 준수 노력**: 가능한 한 이 문서의 표준을 따르도록 개발하세요.
2. **번역기 활용**: 표준을 따르기 어려운 경우, 번역기 시스템을 활용하세요.
3. **패턴 문서화**: 각 모듈의 통신 패턴을 문서화하여 향후 표준 구체화에 기여하세요.

### 향후 TypeScript 구현 시

각 모듈의 패턴이 완성되면, 이 문서의 내용을 바탕으로 TypeScript 타입 시스템을 구축하여 개발 시 자동으로 표준을 강제할 수 있도록 할 예정입니다.
