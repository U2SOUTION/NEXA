---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-06-28
updated: 2026-06-28
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# 08\_TDD\_CosmicLanguage\_ 운영시나리오


## Cosmic Language 운영 시나리오 요약

아래는 **Cosmic Language**가 실제 현장에서 작동하는 대표적인 모델입니다. 상세한 YAML 명세와 구현 절차는 **Cosmic 운영 시나리오 명세서** 문서를 참조하십시오.

### 초경량 벡터 기반 이벤트 감지

#### 목적

- 저대역폭 환경에서 이벤트를 빠르게 감지하고 의미를 상향 보고합니다.
- 저대역폭 환경에서 영상 대신 델타 벡터만을 전송하여 사건의 의미를 상향 보고합니다.

#### 흐름

1. Edge(ESP32) 가 변화량 (좌표, 크기, 진동 등) 만 추출해 델타 벡터를 생성합니다.
2. 전송층 (MQTT/WS/기타) 으로 최소 패킷을 상향 전송합니다.
3. 서버가 CSIM 좌표 매핑 후 HEXAGON 문맥을 결합합니다.
4. Zod 검증 통과 시 이벤트를 확정하고, 실패 시 VOID 처리합니다.
5. 확정 이벤트를 Digital Twin 과 운영 UI 에 동기화합니다.

#### 입력 예시

```json
{
  "id": "NEXA 기증자격 아이디",
  "pos": [120, 45],
  "size": [40, 40, 30],
  "type": "static",
  "delta": { "size_z": 5 }
}
```

#### 기대 결과

- 영상 전송 없이도 상태 이상·객체 출현·고착 이벤트를 탐지할 수 있습니다.
- 상향 트래픽과 추론 부하를 동시에 절감합니다.

#### 실제값 템플릿 (YAML)

```yaml
scenario:
  id: SCN-001
  name: gate_object_delta_detection
input_event:
  source: esp32-gate-01
  transport: mqtt
  topic: cla/edge/gate/object
  schema_version: cla.event.object-delta.v1
  payload:
    id: obj_20260506_001
    ts: '2026-05-06T10:12:00Z'
    pos: [120, 45]
    size: [40, 40, 30]
    type: static
    delta: { size_z: 5 }
validation:
  zod: ObjectDeltaEventV1
  on_fail: VOID
mapping:
  csim_cell: A3xL2
  semantic_label: POSSIBLE_DELIVERY
output:
  echo_topic: cla/echo/gate/object
  twin_channel: ws://nexa/twin/gate
```

### 직감형 확인과 근거 조회

#### 목적

- 사용자가 벡터 상태를 즉시 이해하고, 필요 시 근거 데이터를 조회하도록 합니다.
- 운영자가 3D 지도상의 벡터를 클릭하여 즉각적인 물리적 증거 (이미지/영상) 를 호출하고 검증합니다.

#### 흐름

1. UI 는 객체를 벡터 그래픽으로 표시합니다.
2. 사용자는 벡터를 클릭해 해당 이벤트의 근거 (사진/클립/스냅샷) 를 조회합니다.
3. 서버는 이벤트 ID 기준으로 시점·좌표가 정합한 근거를 반환합니다.
4. 사용자는 추론 결과와 근거를 비교해 상태를 승인/보류합니다.

#### 기대 결과

- 기본 화면은 가볍고, 검증은 필요 시에만 수행되어 운영 효율이 높아집니다.
- LLM 판단의 설명 가능성과 신뢰도가 향상됩니다.

#### 실제값 템플릿 (YAML)

```yaml
scenario:
  id: SCN-002
  name: vector_click_evidence_lookup
ui_event:
  action: click_vector
  vector_id: obj_20260506_001
  user_id: operator_01
query:
  evidence_index: cla_evidence_index_v1
  filters:
    time_window_sec: 30
    spatial_tolerance_px: 12
    confidence_min: 0.70
response:
  evidence:
    image_uri: s3://nexa-evidence/gate/2026/05/06/obj_20260506_001.jpg
    clip_uri: s3://nexa-evidence/gate/2026/05/06/obj_20260506_001.mp4
    snapshot_ts: '2026-05-06T10:11:58Z'
  llm_reason:
    label: delivery_candidate
    risk_score: 0.62
review:
  decision: pending # approve | hold | reject
```

### 능동 대응 및 성찰적 학습

#### 목적

- 위험 상황에 선제 대응하고, 누적 데이터를 통해 판단 임계값을 개선합니다.
- 위험 임계값 초과 시 자동 보호 동작을 수행하고, 결과를 학습 레이어에 환류하여 지능을 고도화합니다.

#### 흐름

1. 서버가 CSIM 문맥과 외부 신호 (예: 기상, 시간대, 패턴 이탈) 를 결합해 위험도를 산정합니다.
2. 정책 임계값을 초과하면 액추에이터 명령을 발행합니다 (예: 보호 동작, 경고 신호).
3. 실행 결과 (ECHO) 와 사용자 확정 라벨 (정상/오탐) 을 이벤트 로그로 적재합니다.
4. 주기적 학습으로 임계값·가중치를 재보정합니다.

#### 기대 결과

- 즉시 대응 (안전) 과 장기 최적화 (정확도) 가 동시에 달성됩니다.
- 하드코딩 의존도를 줄이고 운영 데이터 기반 의사결정이 강화됩니다.

#### 실제값 템플릿 (YAML)

```yaml
scenario:
  id: SCN-003
  name: proactive_response_and_reflective_learning
risk_assessment:
  inputs:
    csim_cell: A4xL4
    weather_forecast_rain_prob: 0.86
    object_present: true
    time_band: evening
  risk_score: 0.84
policy:
  threshold_high: 0.80
  action_on_high: extend_awning
command:
  transport: mqtt
  topic: cla/cmd/gate/awning
  payload:
    command: EXTEND
    duration_sec: 120
    reason: rain_protection_for_detected_object
echo:
  topic: cla/echo/gate/awning
  result: success
learning:
  log_store: cla_event_log_v2
  label_from_user: true_positive
  update:
    parameter: rain_object_protection_weight
    old: 0.58
    new: 0.63
```

### 3D 지도 기반 상황 디스플레이

#### 목적

- NEXA-Platform 의 3D 지도를 기준 좌표계로 사용해 이벤트를 공간적으로 표시하고, 운영자가 현황을 즉시 파악하도록 합니다.
- 3D 지도는 단일 전역 지도가 아니라 도메인별 (예: 로봇, 건축, 산업) 및 프로젝트별로 분리된 지도를 사용합니다.
- 모든 이벤트를 도메인별 고정밀 3D 좌표계에 투영하여 직관적인 공간 관제를 실현합니다.

#### 흐름

1. 서버는 검증 완료 이벤트를 `world_frame` 좌표로 정규화합니다.
2. Digital Twin 서비스는 물리 지도 (Reality Map) 와 추상/의미 지도 (Operation/Semantic Map) 를 동시에 갱신합니다.
3. 운영자가 객체를 클릭하면 증거 데이터 (이미지/클립) 와 CSIM 해석 결과를 오버레이로 표시합니다.
4. 운영자가 승인/보류/반려를 선택하면 결과를 이벤트 로그와 학습 레이어에 반영합니다.

#### 기대 결과

- 텍스트 로그 중심 관제를 공간 관제 중심으로 전환할 수 있습니다.
- 같은 이벤트를 " 위치 + 상태 + 근거 " 로 한 화면에서 확인해 대응 시간을 단축합니다.

#### 실제값 템플릿 (YAML)

```yaml
scenario:
  id: SCN-004
  name: twin_3d_situation_display
twin:
  domain: robot
  project_id: skyten-gate
  map_id: skytengate_v3
  map_namespace: robot/skyten-gate
  frame: world
  render_channel: ws://nexa/twin/gate
  refresh_hz: 10
  map_layers:
    reality_map: galvo_scan_v3
    operation_map: ops_zone_map_v1
    semantic_map: csim_relation_map_v1
event_binding:
  source_topic: cla/echo/gate/object
  projection:
    pos_xy_to_world: true
    z_policy: ground_clamp
  style:
    risk_low: '#3CB371'
    risk_mid: '#F4C542'
    risk_high: '#E63946'
interaction:
  on_click:
    open_panel: evidence_and_reason
    fetch:
      evidence_index: cla_evidence_index_v1
      reason_topic: cla/reason/gate/object
review:
  decision_actions: [approve, hold, reject]
  writeback_topic: cla/review/gate/object
  audit_stream: kafka://cla.audit.review
