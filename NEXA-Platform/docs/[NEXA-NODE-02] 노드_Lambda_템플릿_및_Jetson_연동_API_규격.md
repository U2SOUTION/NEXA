# [NEXA-NODE-02] 노드 Lambda 템플릿 및 Jetson 연동 API 규격

**목적**: 고성능 연산 장치(Jetson/Coral) 통합 및 하드웨어 수준 정밀 제어를 가능하게 하는 **NEXA-NODE**의 핵심 구현 스펙을 구체화한다. **[NEXA-NODE-01]** 에서 정의한 노드 카테고리·캔버스·배포 흐름에 대응하는 **노드별 C++ Lambda 템플릿**과 **Jetson 연동 API 규격**을 본 문서에서 상세 기술한다.

**상위 문서**: [NEXA-NODE-01] ESPHome YAML 제너레이터 및 웹 펌웨어 배포 기획

**적용 도메인**: `/nexa-node` (NEXA NODE)

**작성일**: 2025-03

---

## 1. 문서 범위

| 구분 | 내용 |
|------|------|
| **C++ Lambda 템플릿** | 전처리 노드(FFT·필터), 저수준 노드(레지스터·타이밍), FSM 노드(상태·전이)의 **ESPHome 호환 Lambda(C++)** 스니펫 규격 및 변환 구조. |
| **Jetson 연동 API** | 데이터 포맷(이미지 스트림·센서 JSON/gRPC), 피드백 루프(추론→액추에이터) 인증·보안, 통신 프로토콜 스택(gRPC/WebSocket) 구현 가이드라인. |

---

## 2. C++ Lambda 상세 템플릿

- [NEXA-NODE-01] §2.5 노드별 입·출력 소켓 정의, §2.2.1 전처리·§2.2.2 FSM·§2.2.6 저수준 하드웨어 노드에 대응한다.
- ESPHome `lambda:` 블록 내에서 사용 가능한 **C++ 스타일** 코드만 허용. `id(컴포넌트명)` 참조·콜백 시그니처는 ESPHome 공식 문서와 동일.

---

### 2.1 전처리 노드 (Preprocessing) — FFT·데이터 필터링

- **역할**: ESP32에서 **FFT(고속 푸리에 변환)** 또는 **데이터 필터링**을 수행하여 Jetson으로 보낼 데이터를 전처리. [NEXA-NODE-01] §2.2.1 전처리·특징 추출 노드, §6.2.1 AI 최적화와 연동.

#### 2.1.1 코드 스니펫 규격

| 항목 | 규격 |
|------|------|
| **입력** | `id(센서).state` 또는 상위 컴포넌트에서 전달되는 `float`/`int` 배열·단일 값. ADC·I2S 등으로 수집한 원시 샘플 버퍼. |
| **출력** | 전처리된 `float` 배열(FFT 크기 절반·크기 N/2) 또는 단일 특징값. 다음 노드(에지 AI 추론 입력·Data Streamer)로 전달되도록 `id(하위_컴포넌트).publish_state(...)` 또는 콜백 인자로 반환. |
| **메모리** | ESP32 RAM 제약. FFT 크기(예: 256·512·1024)는 **템플릿 매개변수**로 두고, 동적 할당 대신 **정적 버퍼** 또는 ESPHome `float[]` 유틸 사용 권장. |
| **라이브러리** | ESP-DSP 또는 경량 FFT 구현. ESPHome 컴포넌트에서 `lib_deps` 로 추가. Lambda 내에서는 `#include` 없이 이미 주입된 심볼만 사용하거나, custom component로 FFT 블록을 감싸는 구조. |

#### 2.1.2 FFT 템플릿 예시 구조

```cpp
// Lambda 내부 또는 custom_sensor 등에서 호출되는 콜백
void fft_preprocess(float* samples, size_t len, float* magnitude_out) {
  // 1. 윈도우 적용 (Hamming 등)
  // 2. FFT 수행 (ESP-DSP 또는 동일 규격 함수)
  // 3. magnitude_out[0..len/2] 에 크기 스펙트럼 저장
  // 4. (선택) 특정 주파수 대역만 추출하여 하위 노드로 전달
}
```

- **규격**: `samples` = 원시 입력 버퍼, `magnitude_out` = 출력 버퍼. 길이·윈도우 타입은 **노드 속성**(YAML 또는 캔버스 폼)에서 설정하고 Lambda에는 상수로 치환.

#### 2.1.3 데이터 필터링 템플릿 예시 구조

```cpp
// 저역/고역/대역 통과 또는 이동 평균
float filter_value(float raw, float prev_out, float alpha) {
  return alpha * raw + (1.0f - alpha) * prev_out;  // 1차 IIR
}
// 또는 이동 평균: N샘플 버퍼 유지 후 평균 반환
```

- **규격**: 필터 타입(이동 평균·IIR·FIR)·계수(alpha, N)는 **노드 속성**으로 정의. Lambda는 해당 계수를 사용한 **고정 구조** 스니펫으로 생성.

---

### 2.2 저수준 노드 (Low-level) — 레지스터·마이크로초 타이밍

- **역할**: [NEXA-NODE-01] §2.2.6 Register Access·Custom Protocol 노드. **레지스터 직접 읽기/쓰기** 및 **마이크로초 단위 타이밍 제어**를 위한 C++ 템플릿.

#### 2.2.1 레지스터 읽기/쓰기 템플릿

| 항목 | 규격 |
|------|------|
| **ESP32 매크로** | `WRITE_PERI_REG(addr, val)`, `READ_PERI_REG(addr)`. 비트 마스크 적용 시 `(READ_PERI_REG(addr) & mask) \| (val << shift)` 형태. |
| **주소** | 노드 속성으로 **레지스터 주소**(16진수)·**마스크**·**시프트** 정의. Lambda 생성 시 해당 값으로 치환. 주소는 ESP32 SFR(Special Function Register) 또는 외부 장치 맵 레지스터. |
| **안전** | 잘못된 주소 쓰기는 디바이스 불안정 유발. **캔버스/노드 속성**에서 허용 주소 목록·검증 규칙을 두고, 생성되는 Lambda는 해당 범위만 사용하도록 템플릿 제한. |

**템플릿 예시 구조 (쓰기)**

```cpp
// 노드 속성: addr=0x3FF44000, mask=0xFF, shift=0
void write_reg(uint32_t addr, uint32_t val, uint32_t mask, uint8_t shift) {
  uint32_t r = READ_PERI_REG(addr);
  WRITE_PERI_REG(addr, (r & ~mask) | ((val << shift) & mask));
}
```

**템플릿 예시 구조 (읽기)**

```cpp
uint32_t read_reg(uint32_t addr, uint32_t mask, uint8_t shift) {
  return (READ_PERI_REG(addr) & mask) >> shift;
}
```

- **규격**: `addr`, `mask`, `shift`는 노드별 속성에서 오며, Lambda 생성기에서 **고정 인자**로 삽입.

#### 2.2.2 마이크로초 단위 타이밍 제어 템플릿

| 항목 | 규격 |
|------|------|
| **지연** | `delayMicroseconds(us)` 또는 고정밀: `esp_timer_get_time()`으로 이전 타임스탬프와 비교하여 루프 내 비블로킹 대기. |
| **GPIO 토글** | `digitalWrite(pin, HIGH/LOW)` + `delayMicroseconds(us)` 패턴. Custom Protocol(비트뱅잉)에서는 **패턴 시퀀스**(클럭·데이터 비트)를 배열 또는 상수 시퀀스로 정의하고, Lambda에서 순차 실행. |
| **노드 속성** | 핀 번호·주기(μs)·패턴(예: [H,L,H,L,...])·반복 횟수. Lambda 템플릿은 이 속성을 읽어 **상수**로 치환된 C++ 코드를 생성. |

**템플릿 예시 구조 (비트뱅잉 송신)**

```cpp
// pin, bit_timings_us[] 는 노드 속성에서 치환
void send_bits(uint8_t pin, const uint32_t* timings_us, size_t n) {
  for (size_t i = 0; i < n; i++) {
    digitalWrite(pin, (i % 2) ? LOW : HIGH);
    delayMicroseconds(timings_us[i]);
  }
}
```

---

### 2.3 FSM 노드 (Finite State Machine) — 상태·전이 구조

- **역할**: [NEXA-NODE-01] §2.2.2·§2.2.5. **상태(State)** 와 **전이(Transition)** 로직을 C++ **switch-case** 또는 **상태 패턴**으로 변환하는 구조를 정의.

#### 2.3.1 변환 구조

| 방식 | 설명 |
|------|------|
| **switch-case** | `enum` 상태값 + `switch(current_state)` + `case STATE_A: ... break;`. 전이 조건은 `if (trigger) current_state = STATE_B;`. 캔버스에서 정의한 상태 수가 적을 때(예: 5~10개) 권장. |
| **상태 패턴** | 각 상태를 `struct` 또는 함수 포인터로 두고, `on_enter`/`on_exit`/`on_tick` 콜백. 전이는 테이블(현재 상태 × 이벤트 → 다음 상태)로 매핑. 상태 수가 많거나 전이 규칙이 복잡할 때 확장 용이. |

#### 2.3.2 템플릿 규격

| 항목 | 규격 |
|------|------|
| **상태 정의** | 캔버스 또는 FSM 전용 UI에서 정의한 **상태 ID**(예: IDLE, RUN, STOP) → C++ `enum State { ... };`. |
| **전이 조건** | "이벤트 E 발생" 또는 "값 V가 범위 [a,b] 안" → `if` 조건. 조건 식은 노드 속성(이벤트 ID·센서 id·범위)에서 생성. |
| **진입/퇴출 액션** | 상태 진입 시 `id(릴레이).turn_on()` 등, 퇴출 시 `id(릴레이).turn_off()` 등. Lambda 내에서 `case STATE_X: ... on_enter_X(); break;` 형태로 삽입. |
| **저장** | `current_state`는 `static` 또는 전역 변수(ESPHome에서는 컴포넌트 멤버로 유지). 재부팅 시 초기 상태는 노드 속성(초기 상태 ID). |

**switch-case 템플릿 예시 구조**

```cpp
enum State { IDLE, RUN, STOP, FAULT };
static State s = IDLE;

void loop() {
  float val = id(sensor).state;
  switch (s) {
    case IDLE:
      if (val > 30.0f) { s = RUN; id(relay).turn_on(); }
      break;
    case RUN:
      if (val < 25.0f) { s = IDLE; id(relay).turn_off(); }
      if (id(button).state) { s = STOP; /* 안전 정지 */ }
      break;
    case STOP:
      if (id(ack).state) s = IDLE;
      break;
    case FAULT:
      // 복구 로직
      break;
  }
}
```

- **규격**: 상태 이름·전이 조건(임계값·이벤트)·진입/퇴출 액션은 **캔버스 FSM 그래프** 또는 AI 생성 결과에서 추출한 **메타데이터**로 Lambda 생성기가 위 구조에 끼워 넣는다.

---

## 3. Jetson 연동 API 상세 규격

- Jetson Orin Nano를 **에지 서버**로 두고, ESP32는 **클라이언트**(센서·스트림 전송, 제어 명령 수신). [NEXA-NODE-01] §2.2.1·§2.2.3·§2.9와 연동.

---

### 3.1 데이터 포맷 — 이미지 스트림·센서 데이터

#### 3.1.1 이미지 스트림 (RTSP / WebRTC)

| 항목 | 규격 |
|------|------|
| **RTSP** | ESP32-CAM 등에서 **RTSP 서버** 구동 시 Jetson은 **RTSP 클라이언트**로 `rtsp://<esp32_ip>/stream` 수신. 비디오 코덱(H.264/H.265)·해상도·프레임률은 노드 속성(Data Streamer)에서 설정. 페이로드는 **RTP over RTSP** 표준. |
| **WebRTC** | 저지연이 필요할 때. ESP32 → **WebRTC offer/answer** 교환 후 **미디어 스트림** 전송. Jetson 측은 브라우저 또는 GStreamer WebRTC 빈 사용. 시그널링은 **WebSocket** 또는 **HTTP**로 사전 협상. |
| **스키마** | 스트림 자체는 바이너리. **메타데이터**는 SDP(Session Description Protocol) 또는 노드 속성에 해상도·코덱·URL 저장. NEXA-NODE 캔버스의 Data Streamer 노드 속성과 1:1 매핑. |

#### 3.1.2 센서 데이터 (JSON / gRPC)

| 항목 | 규격 |
|------|------|
| **JSON (REST/WebSocket)** | ESP32 → Jetson 전송 시 **페이로드 스키마** 예: `{ "device_id": string, "ts_us": number, "sensors": { "temperature": float, "humidity": float, ... }, "event?": string }`. 타임스탬프·디바이스 ID·센서 키는 노드 속성(센서 목록)에서 생성. |
| **gRPC** | **.proto** 정의: `message SensorPayload { string device_id = 1; int64 ts_us = 2; map<string, float> sensors = 3; string event = 4; }`. `service EdgeIngest { rpc PushSensors(SensorPayload) returns (Ack); }`. ESP32에서는 NanoPB 등으로 직렬화. |
| **상세 페이로드 스키마 (JSON 예시)** | `device_id`: 디바이스 고유 ID. `ts_us`: 마이크로초 단위 Unix 타임스탬프. `sensors`: 키=센서 이름(예: "temp", "humidity"), 값=float. `event`: 선택, 이벤트 타입(예: "motion", "button"). |

---

### 3.2 피드백 루프 — 추론 결과 → ESP32 액추에이터 제어

- Jetson에서 **추론 결과**(분류·확률·좌표)를 바탕으로 **ESP32 액추에이터**(서보·릴레이)에 **제어 명령**을 내리는 구간. [NEXA-NODE-01] §2.2.3 피드백 루프 시각화와 대응.

#### 3.2.1 인증 및 보안 규격

| 항목 | 규격 |
|------|------|
| **인증** | **ESP32 → Jetson** 전송: 디바이스별 **토큰**(API Key 또는 JWT)을 헤더 또는 쿼리 파라미터로 포함. Jetson은 토큰 검증 후 수신 처리. **Jetson → ESP32** 제어: **서명된 명령**(HMAC-SHA256 또는 Ed25519). ESP32는 공유 시크릿 또는 공개키로 서명 검증 후에만 액추에이터 제어 실행. |
| **보안** | 제어 채널은 **TLS(HTTPS/WSS)** 권장. 내부망만 사용 시 사설 인증서. **명령 화이트리스트**: 허용된 명령 집합(예: `servo_angle`, `relay_on`, `relay_off`)만 파싱·실행. 그 외 필드는 무시 또는 에러. |
| **규격 요약** | 요청: `Authorization: Bearer <token>` 또는 `X-Device-Token: <token>`. 제어 명령: `{ "cmd": "servo_angle", "params": { "angle": 90 }, "signature": "<base64>" }`. ESP32는 `signature` 검증 후 `cmd`·`params` 실행. |

#### 3.2.2 제어 명령 페이로드 스키마

| cmd | params | 설명 |
|-----|--------|------|
| `servo_angle` | `{ "angle": float }` | 서보 목표 각도. |
| `relay_on` / `relay_off` | `{ "channel?": int }` | 릴레이 on/off. 채널 생략 시 0. |
| `pwm_set` | `{ "duty": float, "channel?": int }` | PWM 듀티 (0.0~1.0). |
| `raw` | `{ "payload": base64 }` | (선택) Lambda에서 파싱하는 커스텀 페이로드. |

- **규격**: 위 테이블을 **스키마 문서**로 고정하고, Jetson 추론 파이프라인 출력과 ESP32 노드(출력·구동) 입력을 이 스키마로 매핑.

---

### 3.3 통신 프로토콜 스택 — gRPC / WebSocket 구현 가이드라인

- **고대역폭 스트리밍**(이미지·오디오·대량 센서)을 위한 프로토콜 선택 및 구현 시 유의사항.

#### 3.3.1 gRPC

| 항목 | 가이드라인 |
|------|------------|
| **역할** | 스트리밍·양방향 RPC. **서버: Jetson**, **클라이언트: ESP32** 또는 **클라이언트: Jetson**, **서버: ESP32**(수신 전용) 구성 가능. |
| **스트리밍** | `rpc StreamSensors(stream SensorChunk) returns (Ack);` — ESP32가 센서 청크를 스트리밍. 또는 `rpc StreamInferenceResult(stream Result) returns (Ack);` — Jetson이 추론 결과를 스트리밍. |
| **구현** | ESP32: **NanoPB** + **gRPC over HTTP/2** 클라이언트(제한적) 또는 **일반 HTTP/2 + 프로토버프**로 대체. Jetson: **gRPC C++/Python** 서버. |
| **가이드라인** | ESP32 리소스가 작으므로 **단방향 스트리밍** 우선. 양방향이 필요하면 WebSocket이 부담이 적을 수 있음. |

#### 3.3.2 WebSocket

| 항목 | 가이드라인 |
|------|------------|
| **역할** | **양방향** 텍스트/바이너리 프레임. Jetson에 **WebSocket 서버** 두고, ESP32가 **클라이언트**로 접속. 또는 반대. |
| **메시지 포맷** | 텍스트: JSON(센서·제어 명령). 바이너리: 이미지 프레임(JPEG 스냅)·직렬화된 프로토버프. **프레임 타입** 필드(1바이트) + 페이로드로 구분 권장. |
| **구현** | ESP32: **ESP-IDF WebSocket 클라이언트** 또는 **Arduino WebSockets** 라이브러리. Jetson: **Python asyncio websockets** 또는 **C++ Boost.Beast** 등. |
| **가이드라인** | 연결 유지·핑/퐁으로 타임아웃 방지. 재연결 정책(백오프) 필수. 대용량 바이너리는 **청크 단위** 전송하여 메모리 피크 완화. |

#### 3.3.3 선택 가이드

| 사용 사례 | 권장 |
|-----------|------|
| **센서 주기 전송** (소량 JSON) | REST 폴링 또는 WebSocket 텍스트. |
| **이미지/오디오 스트리밍** | RTSP(카메라) 또는 WebSocket 바이너리/청크. gRPC 스트리밍은 Jetson↔ESP32 간 구현 가능 시 선택. |
| **추론 결과 → 제어 명령** | WebSocket 또는 gRPC 단방향 스트림. 인증·서명은 §3.2 적용. |

---

## 4. 참고

- **[NEXA-NODE-01]**: 전체 아키텍처, 노드 카테고리, 소켓 타입, 배치 배포, 버전 관리, AI 협업, 전처리·FSM·저수준 노드 정의.
- **ESPHome Lambda**: 공식 Lambda 문법·`id()` 참조·콜백 생명주기.
- **ESP32 SFR**: `WRITE_PERI_REG`/`READ_PERI_REG` — ESP-IDF 레지스터 접근.
- **gRPC / Protocol Buffers**: 언어 중립 RPC·직렬화.
- **WebSocket**: RFC 6455, ESP32 WebSocket 클라이언트 예제.
