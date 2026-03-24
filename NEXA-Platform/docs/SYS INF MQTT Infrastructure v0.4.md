# NEXA MQTT 인프라 설계 문서 v0.4
## 개인 NAS + Cloudflare Tunnel 기반 IoT 통신 구축

> **목적**
> 공인 IP 없이 개인 NAS 웹서버로
> MQTT over WebSocket + Cloudflare Tunnel을 이용하여
> 안전하고 안정적인 IoT 통신 인프라를 구축한다.

---

## 변경 이력

| 버전 | 주요 변경 |
|------|---------|
| v0.1 | 기본 구조 · MQTT · Cloudflare · Docker · 보안 · NEXA 연결 |
| v0.2 | Capability ID 펌웨어 적용 · 지능적 동적 토픽 구성 · 객체 분화 설계 |
| v0.3 | 보안 강화 · 3단계 디바이스 검증 · 계정별 격리 · 사전 등록 기반 편입 · 토픽 구조 변경 |
| **v0.4** | **NODE-03 연계 · 이중 등록 경로(A·B) · OTA 베이스라인 · pending→approve→MQTT provision 흐름 · Capability ID 등록 시점 확정 · 보안 보완** |

---

## 목차

1. [핵심 개념 용어집](#1-핵심-개념-용어집)
2. [전체 아키텍처](#2-전체-아키텍처)
3. [MQTT 기초](#3-mqtt-기초)
4. [Capability ID — 펌웨어 단 적용](#4-capability-id--펌웨어-단-적용)
5. [지능적 동적 토픽 구성](#5-지능적-동적-토픽-구성)
6. [디바이스 등록 — 이중 경로 및 Capability ID 확정](#6-디바이스-등록--이중-경로-및-capability-id-확정)
7. [디바이스 보안 — 3단계 검증 및 계정 격리](#7-디바이스-보안--3단계-검증-및-계정-격리)
8. [MQTT over WebSocket](#8-mqtt-over-websocket)
9. [Cloudflare Tunnel](#9-cloudflare-tunnel)
10. [NAS 웹서버 구성](#10-nas-웹서버-구성)
11. [기술 스택 전체](#11-기술-스택-전체)
12. [구축 순서](#12-구축-순서)
13. [NEXA 플랫폼 연결](#13-nexa-플랫폼-연결)
14. [트러블슈팅 예상 항목](#14-트러블슈팅-예상-항목)

---

## 1. 핵심 개념 용어집

### MQTT
**Message Queuing Telemetry Transport**

```
IoT 표준 경량 메시지 프로토콜
1999년 IBM이 설계 · 위성 통신용으로 시작
현재 IoT 사실상 표준

특징:
  매우 가벼움 (헤더 2바이트)
  낮은 대역폭에서 동작
  불안정한 네트워크에서 신뢰성 보장
  발행(Publish) / 구독(Subscribe) 모델
```

### Publish / Subscribe (발행 / 구독)

```
기존 방식 (Request/Response):
  클라이언트 → 서버에 직접 요청
  서버 → 클라이언트에 직접 응답
  1:1 통신

MQTT 방식 (Pub/Sub):
  발행자(Publisher) → 브로커에 메시지 전송
  브로커 → 구독자(Subscriber)에게 전달
  1:N 통신 · 발행자와 구독자가 서로 모름

IoT에서 장점:
  디바이스 수백 개가 동시에 메시지 교환 가능
  디바이스가 서로 직접 연결 불필요
```

### 브로커 (Broker)

```
MQTT의 중계자
모든 메시지가 브로커를 통해 이동

역할:
  발행된 메시지 수신
  토픽에 구독한 클라이언트에게 전달
  연결 관리 · 인증 처리
  메시지 보존 (Retain)
  오프라인 클라이언트 메시지 보관 (QoS)

대표 브로커:
  Mosquitto  — 경량 · 오픈소스 · NAS에 적합
  EMQX       — 고성능 · 대규모 · 관리 UI 제공
  HiveMQ     — 엔터프라이즈급
```

### 토픽 (Topic)

```
메시지 분류 경로 · 슬래시(/)로 계층 구조

예시:
  nexa/farm/field_a/sensor/temperature
  nexa/home/living/actuator/light
  nexa/device/nexu/status

와일드카드:
  + (단일 레벨): nexa/farm/+/sensor/temperature
  # (다중 레벨): nexa/farm/#
```

### QoS (Quality of Service · 서비스 품질)

```
QoS 0 — 최대 1회 · 빠름 · 유실 가능
  적합: 센서 실시간 데이터

QoS 1 — 최소 1회 · 중복 가능
  적합: 중요 이벤트 알림

QoS 2 — 정확히 1회 · 느림
  적합: 결제 · 중요 명령
```

### Retain (보존 메시지)

```
브로커가 토픽의 마지막 메시지를 보존
새로운 구독자 접속 시 즉시 수신

IoT 활용:
  디바이스 상태를 Retain으로 발행
  → 새 클라이언트 접속 시 현재 상태 즉시 파악
```

### LWT (Last Will and Testament · 유언 메시지)

```
클라이언트 비정상 종료 시
브로커가 대신 발행하는 메시지

IoT 활용:
  연결 시 LWT 등록
  비정상 종료 → 자동으로 VOID 상태 발행
  → NEXA VOID Lifecycle과 직접 연동
```

### WebSocket

```
HTTP 위에서 동작하는 양방향 통신 프로토콜
브라우저가 기본 지원

MQTT with WebSocket:
  브라우저는 TCP 직접 접근 불가
  → MQTT를 WebSocket으로 감싸서 전송
  → 브라우저에서 MQTT 사용 가능
```

### MQTT over WebSocket

```
포트:
  일반 MQTT:     1883 (TCP)
  MQTT TLS:      8883 (TCP + TLS)
  MQTT over WS:  8083 (WebSocket)
  MQTT over WSS: 8084 (WebSocket + TLS) ← 권장

브라우저 클라이언트:
  MQTT.js 라이브러리
  wss:// 프로토콜로 연결
```

### Cloudflare Tunnel

```
공인 IP 없이 외부에서 내부 서버에 접근

기존 방식의 문제:
  공인 IP 필요 · 포트 포워딩 · 방화벽 설정

Cloudflare Tunnel 방식:
  내부 서버 → Cloudflare 아웃바운드 연결
  외부 요청 → Cloudflare → 터널 → 내부 서버
  인바운드 포트 개방 불필요
  무료 플랜 사용 가능

구성 요소:
  cloudflared — 터널 에이전트 (NAS에 설치)
  Cloudflare  — 중계 서버 (DNS + 프록시)
  도메인      — Cloudflare 등록 도메인 필요
```

### 동적 토픽 (Dynamic Topic)

```
하드코딩된 토픽이 아니라
Capability ID · 상태 · 컨텍스트에 따라
런타임에 자동으로 생성·변경되는 토픽

정적 토픽의 문제:
  "nexa/sensor/temperature" → 어떤 센서인지 모름
  디바이스 추가 시 코드 수정 필요

동적 토픽의 장점:
  Capability ID에서 자동 생성
  디바이스 추가 시 코드 수정 없음
  HEXAGON 토큰이 토픽 구조에 반영
  상태에 따라 토픽 레이어 자동 변경
```

---

## 2. 전체 아키텍처

```
[IoT 디바이스들]              [외부 접근]
  센서 · 드론                  브라우저 · 모바일
  보일러 · 조명                MQTT 클라이언트
  각각 Capability ID 보유
      |                            |
      | MQTT (TCP 1883)            | HTTPS/WSS (443)
      | 동적 토픽 자동 생성         |
      ↓                            ↓
┌──────────────────────────────────────┐
│  개인 NAS (홈 서버)                   │
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │  EMQX    │  │  NEXA 플랫폼     │  │
│  │  브로커   │  │  Node.js + Vue   │  │
│  │  :1883   │  │  :3000           │  │
│  │  :8083   │  │  Cap ID 파서     │  │
│  │  (WS)    │  │  동적 토픽 라우터 │  │
│  └──────────┘  └──────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  cloudflared (터널 에이전트)  │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
              |
              | 아웃바운드 터널
              ↓
┌──────────────────────────────────────┐
│  Cloudflare                          │
│  DNS + 프록시 + TLS                   │
│  mqtt.yourdomain.com → NAS:8083      │
│  app.yourdomain.com  → NAS:3000      │
└──────────────────────────────────────┘
```

---

## 3. MQTT 기초

### HEXAGON 패킷과 MQTT 연결

```json
{
  "topic": "nexa/farm/field_a/sensor/temperature/A1B2C3",
  "payload": {
    "cap": "nexa.farm.field_a.sensor.temperature.v1",
    "where": "FIELD",
    "when": "MOMENT",
    "who": "TICK",
    "what": "FACT",
    "how": "FLOW",
    "value": 23.5,
    "unit": "celsius",
    "vi": 0.9,
    "es": 0.8,
    "ts": 1711234567890
  },
  "qos": 0,
  "retain": false
}
```

---

## 4. Capability ID — 펌웨어 단 적용

> **핵심 원칙**
> 서버부터 센서까지 하나의 언어로 통일한다.
> Capability ID 하나가 토픽·HEXAGON·코일·VOID를 자동 결정한다.

### 4.1 Capability ID 구조

```
nexa.{domain}.{location}.{type}.{function}.{version}

예시:
  nexa.farm.field_a.sensor.temperature.v1
  nexa.farm.field_a.sensor.humidity.v1
  nexa.home.living.actuator.light.v1
  nexa.home.living.sensor.motion.v1
  nexa.industrial.line_1.motor.speed.v2
  nexa.device.nexu.system.status.v1
```

### 4.2 펌웨어용 경량화

ESP32는 RAM이 제한적이므로 내부는 압축, 통신 시에만 전체 ID 사용한다.

```cpp
// 내부 압축 코드 (2바이트)
#define CAP_CODE  0x0A1B

// 전체 Capability ID (통신용)
#define CAP_ID "nexa.farm.field_a.sensor.temperature.v1"

// MAC 주소 (디바이스 고유 식별)
#define DEVICE_MAC "A1B2C3D4E5F6"

// MQTT Client ID 자동 생성
// = Capability ID + MAC
// → "nexa.farm.field_a.sensor.temperature.v1_A1B2C3D4E5F6"
String mqttClientId = String(CAP_ID) + "_" + DEVICE_MAC;
```

### 4.3 하나의 디바이스 — 여러 Capability (객체 분화)

하나의 ESP32에 여러 Capability를 부여하여 독립 객체로 분화한다.

```
┌─────────────────────────────────────┐
│  ESP32 (스마트팜 복합 노드)           │
│                                     │
│  cap_1: nexa.farm.field_a.sensor.temperature.v1
│  cap_2: nexa.farm.field_a.sensor.humidity.v1
│  cap_3: nexa.farm.field_a.sensor.soil_moisture.v1
│  cap_4: nexa.farm.field_a.actuator.valve.v1
└─────────────────────────────────────┘

각 Capability가 독립적으로:
  별도 MQTT 토픽 사용
  별도 VI (Vitality Index · 활력 지수) 추적
  별도 VOID 전환 타이밍
  별도 QoS 수준
  별도 코일 적용

밸브(actuator)가 STUCK이어도
온도 센서는 FLOW 유지
→ 세밀한 상태 관리 가능
```

### 4.4 Capability ID가 자동으로 결정하는 것들

```
nexa.farm.field_a.sensor.temperature.v1 수신 시:

자동 결정:
  MQTT 토픽     → nexa/farm/field_a/sensor/temperature/{mac}
  HEXAGON Where → FIELD   (farm → FIELD 자동 매핑)
  HEXAGON Who   → TICK    (sensor → 자동 기록 신호)
  HEXAGON What  → FACT    (sensor → 사실 데이터)
  QoS 수준      → 0       (sensor → 실시간 유실 허용)
  VI 임계값     → 장비 Vitality Index 기준 적용
  VOID 전환     → 30초 무응답 → STUCK
  코일 레이어   → Domain Layer Precision + Sensitivity 활성
  DB 테이블     → sensor_data 자동 라우팅

서버 DB 조회 없이 1ms 내 판단 가능
→ HEXAGON Protocol 원칙 달성
```

### 4.5 ESP32 펌웨어 구현 예시

```cpp
#include <PubSubClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>

// Capability 정의
struct Capability {
  const char* id;      // 전체 Capability ID
  const char* topic;   // MQTT 토픽
  uint8_t qos;         // QoS 수준
  bool retain;         // Retain 여부
  uint16_t voidSec;    // VOID 전환 임계 (초)
};

// 이 디바이스의 Capability 목록
Capability caps[] = {
  {
    "nexa.farm.field_a.sensor.temperature.v1",
    "nexa/farm/field_a/sensor/temperature",
    0, false, 30
  },
  {
    "nexa.farm.field_a.sensor.humidity.v1",
    "nexa/farm/field_a/sensor/humidity",
    0, false, 30
  },
  {
    "nexa.farm.field_a.actuator.valve.v1",
    "nexa/farm/field_a/actuator/valve",
    1, true, 60
  }
};

// HEXAGON 패킷 자동 빌드
String buildPacket(Capability& cap, float value) {
  StaticJsonDocument<256> doc;
  doc["cap"]   = cap.id;
  doc["where"] = "FIELD";   // Capability ID에서 자동 매핑
  doc["when"]  = "MOMENT";
  doc["who"]   = "TICK";
  doc["what"]  = "FACT";
  doc["how"]   = "FLOW";
  doc["value"] = value;
  doc["vi"]    = getBatteryVI();    // Vitality Index · 활력 지수
  doc["es"]    = getEnergyES();     // Energy State · 에너지 상태
  doc["pp"]    = getPP();           // Performance Priority · 성능 우선도
  doc["ts"]    = millis();

  String result;
  serializeJson(doc, result);
  return result;
}

// LWT 등록 (VOID 자동화)
void setupLWT(PubSubClient& client, Capability& cap) {
  String lwtTopic = String(cap.topic) + "/status";
  String lwtPayload = "{\"how\":\"VOID\",\"cap\":\"" +
                      String(cap.id) + "\"}";
  // 비정상 종료 시 자동으로 VOID 발행
  client.setServer(MQTT_HOST, 1883);
  // LWT는 connect() 시 설정
}
```

---

## 5. 지능적 동적 토픽 구성

> **핵심 개념**
> 토픽은 하드코딩하지 않는다.
> Capability ID · 상태 · 컨텍스트 · 코일값에 따라
> 런타임에 자동으로 생성·변경·분기된다.

### 5.1 동적 토픽의 3가지 생성 방식

**방식 1 — Capability ID 기반 자동 생성**

```
Capability ID의 점(.)을 슬래시(/)로 변환

입력:
  nexa.farm.field_a.sensor.temperature.v1

출력 토픽:
  nexa/farm/field_a/sensor/temperature/{mac}/{v1}

규칙:
  nexa.{domain}.{location}.{type}.{function}.{version}
  → nexa/{domain}/{location}/{type}/{function}/{mac}/{version}

코드:
  String capToTopic(const char* capId, const char* mac) {
    String topic = String(capId);
    topic.replace('.', '/');
    // version 앞에 MAC 삽입
    int lastSlash = topic.lastIndexOf('/');
    topic = topic.substring(0, lastSlash)
          + "/" + mac
          + topic.substring(lastSlash);
    return topic;
  }
```

**방식 2 — VOID 상태 기반 토픽 분기**

```
같은 디바이스라도 VOID 상태에 따라 다른 토픽으로 발행

FLOW 상태:
  nexa/farm/field_a/sensor/temperature/{mac}/data

STUCK 상태:
  nexa/farm/field_a/sensor/temperature/{mac}/stuck

VOID·POTENTIAL 상태:
  nexa/farm/field_a/sensor/temperature/{mac}/void

→ 서버가 상태별 토픽을 구독하여 자동 처리
→ 정상 데이터와 이상 데이터가 토픽 단에서 분리
```

**방식 3 — 코일 기반 우선순위 토픽**

```
Safety 코일이 높을 때 → 긴급 토픽으로 자동 업그레이드

일반 발행:
  nexa/farm/field_a/sensor/temperature/{mac}/data
  QoS 0

Safety 임계 초과 시 (온도 90도 이상):
  nexa/alert/safety/temperature/{mac}
  QoS 2 (정확히 1회 보장)

코드:
  String getTopic(Capability& cap, float value) {
    // Safety 임계값 초과
    if (value > SAFETY_THRESHOLD) {
      return "nexa/alert/safety/" +
             String(cap.function) + "/" + DEVICE_MAC;
    }
    // 일반 데이터
    return String(cap.topic) + "/" + DEVICE_MAC + "/data";
  }

  uint8_t getQoS(String topic) {
    if (topic.startsWith("nexa/alert/safety")) return 2;
    if (topic.startsWith("nexa/alert"))        return 1;
    return 0;
  }
```

### 5.2 동적 토픽 트리 — 전체 구조

```
nexa/
  ├── {domain}/
  │    └── {location}/
  │         └── {type}/
  │              └── {function}/
  │                   └── {mac}/
  │                        ├── data      → 정상 데이터 (QoS 0)
  │                        ├── status    → 상태 (Retain)
  │                        ├── stuck     → STUCK 상태
  │                        ├── void      → VOID 상태
  │                        ├── command   → 명령 수신
  │                        └── response  → 명령 응답
  │
  ├── alert/
  │    ├── safety/{function}/{mac}   → Safety 코일 위반 (QoS 2)
  │    ├── vitality/{mac}            → VI 낮음 경고 (QoS 1)
  │    └── event/{type}/{mac}        → 일반 이벤트 (QoS 1)
  │
  ├── system/
  │    ├── heartbeat                 → 시스템 생존 신호
  │    └── capability/registry      → Capability 등록 브로드캐스트
  │
  └── user/{user_id}/
       ├── empathy                   → ES·VI·PP 사람 상태
       └── command                  → 사람 → 넥슈 명령
```

### 5.3 동적 구독 — 서버측 지능적 라우팅

서버는 고정 토픽이 아니라 패턴으로 구독하고 동적으로 라우팅한다.

```javascript
// NEXA 서버 — 동적 구독 및 라우팅

const SUBSCRIPTIONS = [
  { pattern: 'nexa/u/+/+/+/sensor/#',   handler: handleSensorData    },
  { pattern: 'nexa/u/+/+/+/actuator/#', handler: handleActuatorData  },
  { pattern: 'nexa/u/+/alert/safety/#', handler: handleSafetyAlert   },
  { pattern: 'nexa/u/+/alert/vitality/#', handler: handleVitalityAlert },
  { pattern: 'nexa/u/+/+/+/+/+/+/stuck', handler: handleStuck      },
  { pattern: 'nexa/u/+/+/+/+/+/+/void',  handler: handleVoid       },
  { pattern: 'nexa/u/+/system/#',       handler: handleSystem        },
]

// 모든 구독 등록
SUBSCRIPTIONS.forEach(({ pattern }) => {
  broker.subscribe(pattern, { qos: 1 })
})

// 동적 라우팅
broker.on('message', (topic, message) => {
  const packet = JSON.parse(message.toString())

  // Capability ID에서 정보 즉시 추출 (DB 조회 없음)
  const capInfo = parseCapabilityId(packet.cap)

  // HEXAGON 토큰 자동 완성
  const hexPacket = {
    ...packet,
    where: capInfo.domain === 'farm' ? 'FIELD' : 'CORE',
    who:   capInfo.type === 'sensor' ? 'TICK' : 'WILL',
    what:  'FACT',
  }

  // 상태별 자동 라우팅
  if (topic.endsWith('/stuck'))        routeToStuckHandler(hexPacket)
  else if (topic.endsWith('/void'))    routeToVoidHandler(hexPacket)
  else if (topic.includes('/safety/')) routeToSafetyHandler(hexPacket)
  else                                 routeToNormalHandler(hexPacket)

  // TimescaleDB 저장
  saveToTimescale(topic, hexPacket)

  // NEXU 캔버스 업데이트
  updateCanvas(capInfo.mac, hexPacket)
})

// Capability ID 파서
function parseCapabilityId(capId) {
  // "nexa.usr_001.farm.field_a.sensor.temperature.v1"
  const parts = capId.split('.')
  return {
    namespace: parts[0],  // nexa
    userId:    parts[1],  // usr_001
    domain:    parts[2],  // farm
    location:  parts[3],  // field_a
    type:      parts[4],  // sensor
    function:  parts[5],  // temperature
    version:   parts[6],  // v1
  }
}
```

### 5.4 동적 토픽 + VI 연동

VI (Vitality Index · 활력 지수)가 낮아질수록 토픽이 자동으로 긴급 채널로 이동한다.

```
VI 0.7 이상 (정상):
  nexa/u/{user_id}/farm/field_a/sensor/temperature/{mac}/data
  QoS 0 · 일반 처리

VI 0.4 ~ 0.7 (주의):
  nexa/u/{user_id}/farm/field_a/sensor/temperature/{mac}/data
  QoS 1로 자동 업그레이드
  서버가 더 자주 폴링

VI 0.1 ~ 0.4 (경고):
  nexa/u/{user_id}/alert/vitality/temperature/{mac}
  QoS 1 · 경고 핸들러로 라우팅
  넥슈 알림 트리거

VI 0.0 ~ 0.1 (위기):
  nexa/u/{user_id}/alert/safety/vitality/{mac}
  QoS 2 · 즉각 조치 필요
  모든 구독자에게 즉시 전달
```

### 5.5 동적 토픽 + VOID Lifecycle 연동

```
FLOW 상태:
  정상 데이터 토픽으로 발행
  LWT 등록됨 (비정상 종료 대비)

STUCK 감지 (30초 무응답):
  서버가 {mac}/stuck 토픽으로 STUCK 선언 발행
  해당 Capability의 다른 구독자에게 알림

VOID·POTENTIAL 전환:
  {mac}/void 토픽 발행
  브로커가 이 토픽의 메시지 보존 (Retain)
  나중에 재연결 시 VOID 이력 즉시 수신

FLOW 복귀:
  {mac}/data 토픽 재개
  {mac}/void 토픽에 null Retain으로 초기화
  서버가 POTENTIAL → FLOW 전환 기록
```

### 5.6 Capability Registry — 보안 기반 디바이스 편입

> **v0.3 변경:** 자동 편입 방식 폐기. 3단계 검증 기반으로 전면 재설계.
> 악의적 디바이스 위장·가짜 데이터 주입 방지.

```
구 방식 (폐기 — 보안 취약):
  누구든 registry 토픽에 발행 → 자동 편입
  → 타 계정 디바이스 위장 가능
  → 가짜 센서 데이터 주입 가능

신 방식 (3단계 검증):
  사전 등록 → 임시 토큰 → 서명 검증 → 편입
  → 자세한 내용은 6장 참조
```

---

## 6. 디바이스 등록 — 이중 경로 및 Capability ID 확정

> **NODE-03 연계 섹션 (v0.4 신규)**
> 디바이스 등록은 사용자 입장에서 첫 번째 관문이다.
> 실패하면 이후 모든 것이 무너진다.
> 이중 경로로 사용자 환경을 모두 수용하고
> 등록 시점에 Capability ID를 확정하여 MQTT 토픽이 자동 구성된다.

### 6.1 등록 방식 — 수동 vs 자동

| 방식 | 주체 | 흐름 | 현재 구현 |
|------|------|------|---------|
| **수동 등록** | 사용자 먼저 | 웹에서 디바이스 생성 → device_token 발급 → 디바이스에 입력 | ✅ 구현됨 |
| **자동 등록** | 디바이스 먼저 | 디바이스 접속 → pending 대기 → 사용자 승인 | 🔜 경로 A·B 구현 시 추가 |

### 6.2 이중 등록 경로

| 경로 | 대상 | WiFi 설정 방식 | 특징 |
|------|------|--------------|------|
| **경로 A — USB + Improv** | 개발자·dev 보드·복구 | Web Serial + Improv Wi-Fi 시리얼 전송 | AP 접속 불필요 · PC Chrome/Edge 전용 |
| **경로 B — 무선 AP** | 공장 출하 제품·모바일 | Captive Portal (192.168.4.1) | USB 불필요 · 스마트폰 가능 |

### 6.3 경로 A — USB + Serial (Improv)

```
① 회원가입·로그인
         ↓
② 기기등록 페이지 → "USB로 연결" 선택
         ↓
③ USB 연결 → 브라우저 팝업에서 시리얼 포트 선택
         ↓
④ [펌웨어 없으면] ESP Web Tools로 베이스라인 플래시
         ↓
⑤ 플랫폼 UI에서 집 WiFi SSID·비밀번호 입력
   → Improv 프로토콜로 시리얼 전송 (AP 접속 없음)
         ↓
⑥ 디바이스 STA 연결
   → POST /api/devices/register 호출 (MAC·chipId·capabilities)
   → pending_devices 테이블에 저장
         ↓
⑦ 플랫폼 "등록 대기" 목록에 표시
   → 사용자 승인·네이밍
   → Capability ID 확정 · device_secret 발급
         ↓
⑧ MQTT provision 토픽으로 자격증명 전달
   → 디바이스 NVS에 저장
         ↓
[등록 완료 → MQTT 정식 연결]

주의:
  Web Serial API → PC Chrome/Edge 전용
  Safari · Firefox · 모바일 Chrome 미지원
  카탈로그에 브라우저 요구사항 명시 필수
```

### 6.4 경로 B — 무선 AP + Captive Portal

```
① 회원가입·로그인
         ↓
② 기기등록 페이지 → "무선으로 연결" 선택
         ↓
③ WiFi 목록에서 NEXA-ESP32-{MAC 뒷6자리} 선택
         ↓
④ "디바이스 설정 열기" → 192.168.4.1 접속
   Captive Portal에서 집 WiFi SSID·비밀번호 입력
         ↓
⑤ 디바이스 STA 연결
   → POST /api/devices/register 호출
   → pending_devices 테이블에 저장
         ↓
⑥ 플랫폼 "등록 대기" 목록에 표시
   → 사용자 승인·네이밍
   → Capability ID 확정 · device_secret 발급
         ↓
⑦ MQTT provision 토픽으로 자격증명 전달
   → 디바이스 NVS에 저장
         ↓
[등록 완료 → MQTT 정식 연결]

보안 주의:
  Captive Portal은 HTTP (암호화 없음)
  → 비밀번호 입력 필드 masking 필수
  → 전송 후 즉시 AP 모드 종료
  → 전송 세션은 단발성 처리
```

### 6.5 Capability ID — 등록 시점 확정

**등록 전 (pending 단계)**

```
디바이스가 POST /api/devices/register 호출 시:
  {
    "mac": "A1B2C3D4E5F6",
    "chipId": "ESP32_ABCDEF",
    "firmwareVersion": "v0.1.0-baseline",
    "capabilities": [
      "sensor.temperature",
      "sensor.humidity",
      "actuator.valve"
    ]
  }

이 시점의 capabilities는 기능 목록만 (약식 표현)
Capability ID는 아직 확정되지 않음
```

**승인 시 (approve 단계) — Capability ID 확정**

```
사용자가 승인·네이밍 시:
  {
    "mac": "A1B2C3D4E5F6",
    "nickname": "스마트팜 A구역 센서",
    "domain": "farm",
    "location": "field_a"
  }

서버가 Capability ID 자동 생성:
  nexa.{user_id}.farm.field_a.sensor.temperature.v1
  nexa.{user_id}.farm.field_a.sensor.humidity.v1
  nexa.{user_id}.farm.field_a.actuator.valve.v1

→ MQTT 토픽 자동 결정
→ 동적 토픽 구성 즉시 활성
→ NEXU 캔버스 도트 자동 생성
```

**provision — MQTT로 전달 (폴링 대신)**

```
승인 완료 후 서버 → 디바이스:
토픽: nexa/u/{user_id}/device/{mac}/provision
QoS: 1 (정확히 전달 보장)
Retain: true (재연결 시에도 수신)

페이로드:
  {
    "device_id": "uuid",
    "device_secret": "64자 비밀키",
    "capabilities": [
      "nexa.usr_001.farm.field_a.sensor.temperature.v1",
      "nexa.usr_001.farm.field_a.sensor.humidity.v1",
      "nexa.usr_001.farm.field_a.actuator.valve.v1"
    ],
    "void_sec": 30,
    "coils": ["precision", "sensitivity"],
    "ota_url": "https://app.yourdomain.com/api/ota/firmware"
  }

디바이스:
  NVS에 저장
  이후 device_secret으로 HMAC 서명 연결
  provision 토픽 구독 해제
```

### 6.6 pending 보안 보완

```
악의적 pending 요청 방지:

Rate limiting:
  동일 IP → 분당 5회 제한
  동일 MAC → 시간당 10회 제한

TTL:
  pending 항목 10분 후 자동 삭제
  (10분 안에 승인 안 하면 재등록 필요)

중복 방지:
  같은 MAC의 pending이 이미 있으면
  기존 항목 TTL 초기화 후 재사용

보안 로그:
  비정상 요청 → security_events 기록
  동일 IP 반복 → 자동 차단 30분
```

### 6.7 OTA 베이스라인 — MQTT 연계

```
OTA 흐름:
  플랫폼에서 OTA 트리거
    → 토픽: nexa/u/{user_id}/device/{mac}/ota
    → 페이로드: {"url": "https://.../firmware.bin", "version": "v1.2.3"}

디바이스:
  토픽 구독 중 → 즉시 수신
  HTTP GET으로 바이너리 다운로드
  이중 파티션에 기록 후 재부팅
  롤백: 부팅 실패 시 이전 파티션 복귀

OTA 완료 보고:
  토픽: nexa/u/{user_id}/device/{mac}/status
  페이로드: {"how": "FLOW", "firmware": "v1.2.3", "vi": 1.0}

복구 시나리오:
  VI (Vitality Index · 활력 지수) 0.0 감지 (응답 없음)
  → 플랫폼이 "USB로 연결하면 자동 복구" 알림
  → 사용자 USB 연결 → ESP Web Tools로 베이스라인 재플래시
  → Improv로 WiFi 재설정 → 재등록
```

### 6.8 등록 관련 API 요약

| API | 메서드 | 인증 | 역할 |
|-----|--------|------|------|
| `/api/devices/register` | POST | 없음 (디바이스) | pending 저장 |
| `/api/devices/pending` | GET | JWT (사용자) | 대기 목록 조회 |
| `/api/devices/approve` | POST | JWT (사용자) | 승인·Capability ID 확정 |
| `/api/devices` | GET/PATCH/DELETE | JWT (사용자) | 등록 디바이스 관리 |
| `/api/ota/firmware` | GET | device_secret | OTA 바이너리 제공 |

---

## 7. 디바이스 보안 — 3단계 검증 및 계정 격리

### 6.1 보안의 핵심 원칙

```
1. 사전 등록 없으면 편입 불가
   → 모든 디바이스는 사용자가 미리 등록

2. 계정별 완전 격리
   → 다른 계정의 토픽·디바이스에 절대 접근 불가

3. 디바이스별 고유 자격증명
   → 디바이스마다 개별 비밀키
   → 공유 자격증명 없음

4. 임시 토큰 1회 사용
   → 최초 연결에만 사용
   → 이후 정식 자격증명으로 교체
```

### 6.2 3단계 검증 흐름

```
[1단계 — 계정 소유권 확인]
  이 Capability ID가 이 계정 소유인가?

  MQTT Client ID 형식:
    nexa.{user_id}.farm.field_a.sensor.temp.v1_{mac}
              ↑
         user_id 포함 (계정 식별)

  브로커 연결 시:
    username: {user_id}_{temp_token}
    password: {hmac_signature}

  검증:
    user_id가 DB에 존재하는 계정인가?
    → 실패 시 즉각 연결 거부

[2단계 — 사전 등록 확인]
  관리자·사용자가 미리 등록한 디바이스인가?

  pending_devices 테이블 조회:
    capability_id + mac_address 일치 여부
    temp_token 유효기간 (24시간) 확인
    이미 사용된 토큰인지 확인

  → 실패 시 연결 거부 + 보안 로그

[3단계 — 서명 검증]
  디바이스가 가진 비밀키로 서명했는가?

  디바이스가 HMAC-SHA256으로 서명:
    signature = HMAC(device_secret, timestamp + mac)
    브로커에 password로 전달

  서버가 검증:
    DB의 device_secret으로 동일 서명 계산
    일치 여부 확인
    타임스탬프 ±5분 이내 확인 (재사용 방지)

  → 실패 시 연결 거부 + 보안 알림
```

### 6.3 사전 등록 프로세스

```
[Step 1 — 사용자가 NEXA UI에서 등록]
  새 디바이스 등록 화면:
    Capability ID 입력
    MAC 주소 입력 (선택)
    디바이스 이름·메모

[Step 2 — 서버가 임시 토큰 발급]
  temp_token = 64자 랜덤 문자열
  유효기간: 24시간
  pending_devices 테이블에 저장

[Step 3 — 사용자가 디바이스에 토큰 입력]
  펌웨어 설정에 temp_token 입력
  (웹 UI · 직렬 포트 · QR 코드 등)

[Step 4 — 디바이스 최초 연결]
  temp_token으로 MQTT 연결
  3단계 검증 통과

[Step 5 — 정식 자격증명 발급]
  서버 → 디바이스:
    nexa/u/{user_id}/device/{mac}/provision
    {
      "device_secret": "새로운 64자 비밀키",
      "void_sec": 30,
      "coils": ["precision", "sensitivity"]
    }

  디바이스: 플래시에 device_secret 저장
  서버: pending → registered 상태 변경

[Step 6 — 이후 연결]
  temp_token 삭제
  device_secret으로만 연결
  HMAC 서명 방식 사용
```

### 6.4 계정별 토픽 격리

**Capability ID 구조 변경**

```
기존 (계정 구분 없음):
  nexa.farm.field_a.sensor.temperature.v1

변경 (계정 포함):
  nexa.{user_id}.farm.field_a.sensor.temperature.v1

예시:
  nexa.usr_001.farm.field_a.sensor.temperature.v1
  nexa.usr_002.home.living.sensor.motion.v1
```

**MQTT 토픽 구조 변경**

```
기존:
  nexa/{domain}/{location}/{type}/{function}/{mac}/data

변경:
  nexa/u/{user_id}/{domain}/{location}/{type}/{function}/{mac}/data

예시:
  nexa/u/usr_001/farm/field_a/sensor/temperature/A1B2C3/data
  nexa/u/usr_002/home/living/sensor/motion/D4E5F6/data

→ 다른 계정의 토픽은 물리적으로 분리
→ ACL에서 user_id 기반 자동 접근 제어
→ 와일드카드로 내 디바이스 전체 구독 가능
   nexa/u/usr_001/# → 내 모든 디바이스
```

**경보 토픽 (계정 격리 유지)**

```
Safety 경보:
  nexa/u/{user_id}/alert/safety/{function}/{mac}

VI 경보:
  nexa/u/{user_id}/alert/vitality/{mac}

시스템:
  nexa/u/{user_id}/system/heartbeat
```

### 6.5 EMQX ACL — 계정 격리 규칙

```
규칙 1 — 디바이스:
  clientId 패턴: nexa.{user_id}.*_{mac}
  허용 발행: nexa/u/{user_id}/#
  허용 구독: nexa/u/{user_id}/+/+/+/+/{mac}/command
             nexa/u/{user_id}/device/{mac}/provision

규칙 2 — 웹 클라이언트:
  username: web_{user_id}_{session}
  허용 구독: nexa/u/{user_id}/#
  허용 발행: nexa/u/{user_id}/+/+/+/+/+/command

규칙 3 — 서버:
  username: nexa_server
  허용: nexa/# 전체

규칙 4 — 기본:
  그 외 모든 접근 거부
  시도 로그 기록

핵심:
  user_id가 다르면 어떤 접근도 불가
  서버만 전체 접근 가능
```

### 6.6 보안 DB 스키마

```sql
-- 사전 등록 디바이스 (검증 대기)
CREATE TABLE pending_devices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  capability_id VARCHAR(200) NOT NULL,
  mac_address   VARCHAR(20),
  temp_token    VARCHAR(64) UNIQUE NOT NULL,
  token_expires TIMESTAMPTZ NOT NULL,  -- 24시간
  used_at       TIMESTAMPTZ,           -- 1회 사용 후 기록
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 등록 완료 디바이스 (활성)
CREATE TABLE registered_devices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  capability_id VARCHAR(200) NOT NULL,
  mac_address   VARCHAR(20) NOT NULL,
  device_secret VARCHAR(64) NOT NULL,  -- HMAC 서명용
  vi            FLOAT DEFAULT 1.0,     -- Vitality Index
  es            FLOAT DEFAULT 0.0,     -- Energy State
  pp            VARCHAR(10) DEFAULT 'normal',
  void_state    VARCHAR(20) DEFAULT 'FLOW',
  last_seen     TIMESTAMPTZ,
  firmware_ver  VARCHAR(20),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, capability_id, mac_address)
);

-- 보안 이벤트 로그
CREATE TABLE security_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  VARCHAR(50),   -- unauthorized·invalid_token·replay_attack
  client_id   VARCHAR(200),
  ip_address  VARCHAR(50),
  detail      JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: 자신의 디바이스만 조회
ALTER TABLE registered_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_devices     ENABLE ROW LEVEL SECURITY;

CREATE POLICY device_owner ON registered_devices
  USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY pending_owner ON pending_devices
  USING (user_id = current_setting('app.current_user_id')::UUID);
```

### 6.7 ESP32 보안 연결 코드

```cpp
#include <PubSubClient.h>
#include <mbedtls/md.h>  // HMAC-SHA256

// 플래시에 저장된 자격증명
const char* USER_ID       = "usr_001";
const char* DEVICE_SECRET = "저장된_64자_비밀키";
const char* DEVICE_MAC    = "A1B2C3D4E5F6";
const char* CAP_ID        = "nexa.usr_001.farm.field_a.sensor.temperature.v1";

// HMAC-SHA256 서명 생성
String generateSignature(const char* secret, String data) {
  uint8_t hmac[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx,
    mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), 1);
  mbedtls_md_hmac_starts(&ctx,
    (uint8_t*)secret, strlen(secret));
  mbedtls_md_hmac_update(&ctx,
    (uint8_t*)data.c_str(), data.length());
  mbedtls_md_hmac_finish(&ctx, hmac);
  mbedtls_md_free(&ctx);

  // 16진수 변환
  String result = "";
  for (int i = 0; i < 32; i++) {
    result += String(hmac[i], HEX);
  }
  return result;
}

// 보안 MQTT 연결
void connectMQTT(PubSubClient& client) {
  // Client ID = Capability ID + MAC
  String clientId = String(CAP_ID) + "_" + DEVICE_MAC;

  // 타임스탬프 기반 서명 (재사용 공격 방지)
  String timestamp = String(millis());
  String signData  = timestamp + "_" + DEVICE_MAC;
  String signature = generateSignature(DEVICE_SECRET, signData);

  // username: user_id_timestamp
  // password: HMAC 서명
  String username = String(USER_ID) + "_" + timestamp;

  client.connect(
    clientId.c_str(),
    username.c_str(),
    signature.c_str()
  );
}
```

---

### 연결 흐름

```
브라우저 (Vue)
  │ wss://mqtt.yourdomain.com/mqtt
  ↓
Cloudflare Tunnel
  │ ws://localhost:8083/mqtt
  ↓
EMQX 브로커 (NAS)
  │ TCP 1883
  ↓
IoT 디바이스
```

### Vue에서 MQTT 연결

```javascript
import mqtt from 'mqtt'

const client = mqtt.connect('wss://mqtt.yourdomain.com/mqtt', {
  clientId: 'nexa_web_' + Math.random().toString(16).substr(2, 8),
  username: 'nexa_user',
  password: 'your_password',
  clean: true,
  reconnectPeriod: 3000,
  connectTimeout: 10000,
  keepalive: 60,  // Cloudflare 타임아웃 방지
})

client.on('connect', () => {
  // 동적 구독 — 패턴으로 전체 수신
  // 내 계정 디바이스만 구독
  client.subscribe(`nexa/u/${userId}/#`,       { qos: 0 })
  client.subscribe(`nexa/u/${userId}/alert/#`, { qos: 1 })
})

client.on('message', (topic, message) => {
  const packet = JSON.parse(message.toString())

  // Capability ID로 즉시 판단
  if (packet.cap) {
    const capInfo = parseCapabilityId(packet.cap)
    updateNixieCanvas(capInfo, packet)
  }
})
```

### Node.js 서버에서 MQTT 연결

```javascript
import mqtt from 'mqtt'

const broker = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'nexa_server',
  username: 'nexa_server',
  password: process.env.MQTT_SERVER_PASSWORD,
})

broker.on('connect', () => {
  broker.subscribe('nexa/#', { qos: 1 })  // 서버는 전체 구독
})

broker.on('message', (topic, message) => {
  const packet = JSON.parse(message.toString())
  const capInfo = parseCapabilityId(packet.cap)

  // HEXAGON 토큰 자동 완성
  const hexPacket = autoCompleteHexagon(capInfo, packet)

  // TimescaleDB 저장
  saveToTimescale(topic, hexPacket)

  // 코일 밸런서 · VI 평가
  evaluateCoilsAndVI(hexPacket)
})
```

---

## 8. MQTT over WebSocket

→ [MQTT over WebSocket 내용은 기존 7장 보안 섹션 내 Vue·Node.js 코드 예시 참조]

---

## 9. Cloudflare Tunnel

### 설치 및 설정

**Step 1 — 계정 준비**

```
1. cloudflare.com 계정 생성
2. 도메인을 Cloudflare로 이전
3. Zero Trust 대시보드 접속
   → one.dash.cloudflare.com
```

**Step 2 — cloudflared 설치**

```bash
# Docker 방식 (권장)
docker pull cloudflare/cloudflared
```

**Step 3 — 터널 생성**

```bash
cloudflared tunnel login
cloudflared tunnel create nexa-tunnel
```

**Step 4 — 설정 파일**

```yaml
# ~/.cloudflared/config.yml
tunnel: {터널-UUID}
credentials-file: /root/.cloudflared/{터널-UUID}.json

ingress:
  - hostname: app.yourdomain.com
    service: http://localhost:3000

  - hostname: mqtt.yourdomain.com
    service: http://localhost:8083
    originRequest:
      noTLSVerify: true

  - service: http_status:404
```

**Step 5 — 실행**

```bash
cloudflared tunnel route dns nexa-tunnel app.yourdomain.com
cloudflared tunnel route dns nexa-tunnel mqtt.yourdomain.com
cloudflared tunnel run nexa-tunnel
```

### MQTT + Cloudflare 주의사항

```
1. WebSocket 활성화:
   Cloudflare 대시보드 → Network → WebSockets → ON

2. 타임아웃:
   기본 WebSocket 타임아웃 100초
   MQTT keepalive = 60 설정 필수

3. 무료 플랜:
   WebSocket 지원 ✅
   대용량 트래픽은 제한
```

---

## 10. NAS 웹서버 구성

### Docker Compose

```yaml
version: '3.8'

services:

  emqx:
    image: emqx/emqx:latest
    container_name: nexa-emqx
    restart: always
    ports:
      - "1883:1883"
      - "8083:8083"
      - "18083:18083"
    environment:
      EMQX_NAME: nexa-broker
      EMQX_ALLOW_ANONYMOUS: "false"
    volumes:
      - ./emqx/data:/opt/emqx/data
      - ./emqx/etc:/opt/emqx/etc
    networks:
      - nexa-network

  nexa-server:
    build: ./server
    container_name: nexa-server
    restart: always
    ports:
      - "3000:3000"
    environment:
      MQTT_BROKER: mqtt://emqx:1883
      DB_URL: postgresql://postgres:password@postgres:5432/nexa
    depends_on:
      - emqx
      - postgres
    networks:
      - nexa-network

  postgres:
    image: timescale/timescaledb:latest-pg16
    container_name: nexa-postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: nexa
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    volumes:
      - ./postgres/data:/var/lib/postgresql/data
    networks:
      - nexa-network

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: nexa-cloudflared
    restart: always
    command: tunnel run
    environment:
      TUNNEL_TOKEN: ${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - nexa-network

networks:
  nexa-network:
    driver: bridge
```

### EMQX 인증 설정

```
관리 대시보드: http://localhost:18083
기본 계정: admin / public → 즉시 변경

사용자 추가:
  nexa_server   → nexa/# 발행·구독 모두
  nexa_web      → nexa/# 구독만
               → nexa/+/+/+/+/+/command 발행
  {cap_id}_{mac} → 해당 Capability 토픽만
```

---

## 11. 기술 스택 전체

| 레이어 | 기술 | 역할 | 비고 |
|--------|------|------|------|
| **메시지 브로커** | EMQX | MQTT 브로커 | Docker · 관리 UI |
| **터널** | Cloudflare Tunnel | 외부 접근 | 무료 · 공인IP 불필요 |
| **백엔드** | Node.js + Express | API + 동적 라우터 | MQTT 클라이언트 내장 |
| **프론트** | Vue 3 | 웹 앱 | MQTT.js + NEXA NIXIE 연동 |
| **DB** | PostgreSQL + TimescaleDB | 시계열 저장 | IoT 데이터 최적화 |
| **컨테이너** | Docker + Compose | 서비스 관리 | NAS 호환 |
| **MQTT 클라이언트** | MQTT.js | JS용 클라이언트 | 브라우저·Node 모두 |
| **IoT 펌웨어** | ESP32 + PubSubClient | 디바이스 | Capability ID 내장 |
| **보안** | Cloudflare TLS | 암호화 | 자동 인증서 |
| **ID 체계** | Capability ID | 전 계층 통일 식별 | 동적 토픽 기반 |

### IoT 디바이스별 MQTT 라이브러리

| 플랫폼 | 라이브러리 | 비고 |
|--------|----------|------|
| ESP32 / Arduino | PubSubClient | 가장 널리 사용 |
| ESP32 | AsyncMqttClient | 비동기 처리 |
| Raspberry Pi | paho-mqtt (Python) | 안정적 |
| Python | paho-mqtt | 서버·PC용 |
| Node.js | MQTT.js | 백엔드 |
| 브라우저 | MQTT.js | WebSocket |

---

## 12. 구축 순서

### Phase 1 — 로컬 환경 구축

```
Step 1. Docker 설치 확인 (NAS)
Step 2. docker-compose.yml 작성
Step 3. EMQX 실행
  docker-compose up -d emqx
Step 4. EMQX 대시보드 접속
  http://NAS_IP:18083 · 계정 변경 · 사용자 추가
Step 5. 로컬 테스트
  mqtt.connect('ws://NAS_IP:8083/mqtt')
Step 6. Capability ID 파서 구현 및 테스트
Step 7. 동적 토픽 생성 로직 검증
```

### Phase 2 — Cloudflare Tunnel 연결

```
Step 1. Cloudflare 계정 · 도메인 준비
Step 2. cloudflared 설치 및 터널 생성
Step 3. config.yml 작성 · DNS 등록
Step 4. 터널 실행
Step 5. 외부 WSS 접속 테스트
  mqtt.connect('wss://mqtt.yourdomain.com/mqtt')
```

### Phase 3 — Capability Registry 구축

```
Step 1. Registry 토픽 핸들러 구현
Step 2. Capability ID → HEXAGON 자동 매핑 로직
Step 3. 동적 구독 패턴 라우터 구현
Step 4. VI 기반 토픽 자동 업그레이드 로직
Step 5. VOID Lifecycle 토픽 연동
```

### Phase 4 — IoT 디바이스 연결

```
Step 1. ESP32 Capability ID 정의
Step 2. 동적 토픽 생성 함수 구현
Step 3. HEXAGON 패킷 빌더 구현
Step 4. LWT 등록 (VOID 자동화)
Step 5. VI·ES·PP 자동 계산 및 발행
Step 6. Capability Registry 자동 등록
```

### Phase 5 — NEXU 캔버스 연동

```
Step 1. MQTT → NEXA NIXIE 도트 실시간 업데이트
Step 2. VI 기반 Lumina 자동 조정
Step 3. VOID 상태 도트 페이드 연동
Step 4. Safety 알림 Jitter 연동
```

---



```
1. 익명 연결 금지
   EMQX: allow_anonymous = false

2. Capability ID 기반 ACL
   {cap_id}_{mac} → 해당 Capability 토픽만 발행 가능
   다른 디바이스 토픽 발행 불가

3. TLS 암호화
   Cloudflare Tunnel 자동 처리

4. 클라이언트 ID 고유화
   {cap_id}_{mac} → 디바이스마다 유일
   중복 방지
```

---

## 13. NEXA 플랫폼 연결

### ES·VI·PP MQTT 토픽

```
디바이스 상태 발행:
  토픽: nexa/{domain}/{location}/{type}/{function}/{mac}/vitality
  페이로드:
    {
      "cap": "nexa.farm.field_a.sensor.temperature.v1",
      "es": 0.8,   // Energy State · 에너지 상태
      "vi": 0.9,   // Vitality Index · 활력 지수
      "pp": "high" // Performance Priority · 성능 우선도
    }

VI 0.4 이하 시 자동으로 알림 토픽 발행:
  nexa/alert/vitality/{mac}
```

### VOID → MQTT 자동화

```
LWT 등록 (연결 시):
  topic: nexa/{domain}/{location}/{type}/{function}/{mac}/status
  payload: {"how": "VOID", "vi": 0.0}
  retain: true

정상 연결 시:
  같은 토픽에 {"how": "FLOW", "vi": 1.0} 발행
  Retain으로 덮어쓰기

STUCK 감지 시 (서버):
  nexa/{...}/{mac}/stuck 토픽 발행
  다른 구독자에게 알림
```

---

## 14. 트러블슈팅 예상 항목

| 증상 | 원인 | 해결 |
|------|------|------|
| WebSocket 연결 안 됨 | Cloudflare WebSocket 비활성 | 대시보드 → Network → WebSocket ON |
| 연결 후 100초 끊김 | Cloudflare 타임아웃 | MQTT keepalive 60 설정 |
| 외부 접속 안 됨 | cloudflared 실행 안 됨 | docker logs nexa-cloudflared 확인 |
| 인증 실패 | ACL 설정 오류 | EMQX 대시보드 → Access Control 확인 |
| 메시지 지연 | QoS 2 과다 사용 | 실시간 데이터는 QoS 0으로 변경 |
| 동적 토픽 누락 | 구독 패턴 범위 좁음 | 와일드카드 패턴 재확인 |
| 신규 디바이스 미등록 | Registry 핸들러 오류 | nexa/system/capability/registry 구독 확인 |
| VI 알림 미발생 | VI 임계값 연동 오류 | VI 0.4 이하 조건 로직 확인 |
| 디바이스 재연결 반복 | clientId 중복 | MAC 주소 기반 고유 ID 확인 |
| 서명 검증 실패 | 타임스탬프 불일치 | 디바이스 시간 동기화 (NTP) 확인 |
| 토큰 만료 오류 | 24시간 초과 | NEXA UI에서 새 임시 토큰 발급 |
| pending 목록에 안 뜸 | register API 미호출 | 디바이스 STA 연결 여부 · 서버 로그 확인 |
| provision 미수신 | MQTT 구독 누락 | 디바이스가 provision 토픽 구독 중인지 확인 |
| Captive Portal 접속 안 됨 | AP 모드 미진입 | 디바이스 공장 초기화 후 재시도 |
| OTA 실패 후 부팅 불가 | 펌웨어 손상 | USB + ESP Web Tools로 베이스라인 재플래시 |
| 타 계정 접근 시도 | ACL 위반 | security_events 로그 확인 |

---

> **참고 문서:** [NEXA-NODE-03] ESP32 베이스라인 펌웨어 및 디바이스 등록 설계

*NEXA Platform · MQTT Infrastructure v0.2 · 내부 설계 문서*
*최종 업데이트: 2026년 3월*
*관련 문서: NEXA Master Design_v0.4.md · NEXU VISION 넥슈는 무엇이가 v0.2.md · UCL 09 REF Coil Registry v0.1.md*
