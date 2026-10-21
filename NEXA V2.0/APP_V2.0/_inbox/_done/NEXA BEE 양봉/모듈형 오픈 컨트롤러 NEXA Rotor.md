---
doc_id: nexa-rotor
title: "모듈 — NEXA Rotor (베이스 컨트롤러)"
category: "모듈"
domain: "공용 제어"
status: draft
created: 2026-10-21
updated: 2026-10-21
parent_doc: nexa-modular-open-controller
implements_doc: nexa-modular-open-controller
see_also:
  - 모듈형 오픈 컨트롤러(Modular Open Controller).md
  - 모듈형 오픈 컨트롤러 NEXA Deck.md
terms_standard: [can-bus, esp-now]
terms_nexa: [NEXA-Rotor, Open-Controller, Base Controller, VOICE_EXT_MIC]
---

# 모듈 — NEXA Rotor (베이스 컨트롤러)

![](../../../../../assets/Pasted%20image%2020261021100314.png)

터치 스트립, 4 방 스위치, 메인 기판이 **노브와 한 덩어리로 강결합**되어 통째로 회전한다. 십자 짐벌·구면 조인트는 두지 않고, 중앙 고정축에 **베어링 10×20×5**와 **댐퍼 그리스**만 둔다.

- 회전 중에도 기판과 스위치의 상대 위치는 노브 몸체 안에서 고정된다. 유격이 없고, 조작감이 묵직하며, 방진·방수에 유리하다.
- 바닥 고정자 마킹은 엔코더의 **센서 0°**이다. 노브 상단 마크 (LED·로고) 는 몸체에 고정된 **절대 마킹**이다. 페어링 때 그 마크가 가리키던 방향이 **소프트웨어 0°**이다.
- 터치와 4 방 스위치의 회전 보정은 **장비마다, 입력마다** 사용자가 켠다. 기본은 터치만 소프트웨어 0, 스위치는 절대 마킹 기준 (무보정) 이다.
- 보정 이후의 동작 의미 (4 분할 버튼, 조이스틱, 스크롤) 는 컨트롤러가 정하지 않는다. **연결 장비가 자기 모드로 해석**한다.
- 본체 마이크 (INMP441) 와 전용 택트를 둔다. 입 주변 확장은 플러그인 `VOICE_EXT_MIC` 다. 오디오 샘플은 제어 패킷에 넣지 않는다.

이 모듈은 [모듈형 오픈 컨트롤러](모듈형%20오픈%20컨트롤러(Modular%20Open%20Controller).md) 의 **베이스 컨트롤러**다. 형제, 로컬 서버, 표준 패킷 봉투, 세션·Arm, 비상 정지의 배치 원칙은 그 문서가 정한다. 여기에는 Rotor 의 기구와 코어 필드, 영점, 마이크만 둔다.

---

## 역할 분리

| 위치 | 담당 | 하지 않는 일 |
| :--- | :--- | :--- |
| **컨트롤러 (ESP32-S3)** | 터치·스위치의 **두 프레임을 모두 계산**해 보낸다. 장비별 사용자 선택 (보정 켜기/끄기) 을 패킷에 실어 NVS 에 둔다. 화면·가상 디텐트는 장비가 선언한 템플릿. 마이크는 청취 중에만 키워드 ID | 장비 모드 분기, 버튼/조이스틱/스크롤 명령 생성, 감도·스케일 적용, 액추에이터 제어, 오디오 스트림, 비상 정지 차단 |
| **장비 (Machine)** | 페어링 시 모드·UI 템플릿·허용 범위 선언. 수신 입력을 **자기 모드로 연산**해 축·속도·밝기 등 자기 명령으로 변환 | 노브 기구학 (θ 보정) 재구현 |

컨트롤러 펌웨어는 장비가 늘어도 출력 분기가 늘지 않는다. 새 장비는 자기 펌웨어와 프로필 패킷만 추가한다.

---

## 좌표계 규약

시계 방향을 \(+\). 0° 는 두 개이며, 서로 같지 않아도 된다.

| 이름 | 무엇이 0 인가 | 바뀌는 시점 |
| :--- | :--- | :--- |
| **센서 0°** \(\theta_{sensor}\) | 바닥 고정자 마킹. `MT6701` 의 진짜 절대각. 4 각 고정자는 한 면, 원형 고정자는 바깥 마킹이 이 0 이다 | 기구로 고정. 소프트웨어가 바꾸지 않는다 |
| **소프트웨어 0°** \(\theta_{soft}\) | 페어링 순간, 사용자가 편히 둔 **노브 상단 마크**(로고 세로축과 같은 축) 가 가리키던 방향 | 페어링이 성립할 때 자동 저장. 다시 페어링하면 그 순간 자세로 갱신 |

\[
\theta_{soft}=(\theta_{sensor}-\theta_{pair})\bmod 360
\]

\(\theta_{pair}\) 는 페어링 직전의 센서각이다. 노브 마크를 고정자 마킹과 일치시킬 필요는 없다. 절대각 \(\theta_{sensor}\) 와 소프트웨어 0 은 항상 다를 수 있다.

## 회전 보정이 필요한 이유

4 방 스위치와 원형 터치는 노브 기판에 고정되어 있다. 노브를 돌리면 접점과 터치 0° 눈금이 **몸체와 함께** 돈다. 소프트웨어 0(페어링 때 노브 마크가 가리키던 방향) 은 그 사이 움직이지 않는다.

\(\theta_{soft}=90^\circ\)(시계 방향) 일 때:

- 기판에서 노브 마크 쪽에 있는 스위치 (\(\phi=0\)) 는 소프트웨어 0 에서 오른쪽으로 가 있다.
- 지금 소프트웨어 0 방향에 있는 스위치는 기판의 왼쪽 스위치다.
- 터치 IC 의 로컬 0° 도 오른쪽으로 밀려 있다. 소프트웨어 0 지점을 누르면 로컬 각은 \(270^\circ(-90^\circ)\) 로 나온다.

이 문제는 **소프트웨어 0 을 쓸 때만** 생긴다. 공간상 같은 곳을 눌러도, 그 프레임에서 보정을 하지 않으면 노브 각도에 따라 보고되는 UP 과 터치 방위가 바뀐다. 절대 마킹 (보정 끔) 은 해당되지 않는다. 마크 아래를 누르면 노브와 함께 가므로 UP 은 바뀌지 않는다. `MT6701` 과 스위치·터치는 컨트롤러에만 있으므로, 소프트웨어 0 을 고른 입력의 되돌림은 컨트롤러가 한다. 장비는 노브 기구학을 다시 구현하지 않는다.

핵심은 한 가지다. 기판 프레임의 입력을 \(\theta_{soft}\) 만큼 되돌려 소프트웨어 0 프레임으로 만드는 식을 컨트롤러가 항상 계산한다. 그 결과를 쓸지는 사용자가 터치와 스위치를 따로 정한다. 모드 (버튼, 조이스틱, 스크롤, 커서) 는 장비 몫이다.

| 기호 | 의미 | 프레임 |
| :--- | :--- | :--- |
| \(\theta_{sensor}\) | `MT6701` 읽기 | 고정자 마킹 기준 |
| \(\theta_{pair}\) | 페어링 순간 센서각 | NVS 오프셋 |
| \(\theta_{soft}\) | 출력에 쓰는 노브각 | 노브 마크를 페어링 자세로 되돌리면 0 |
| \(\alpha_{raw}\) | 원형 터치 로컬 각 | 노브와 함께 도는 기판 |
| \(\alpha_{fixed}\) | 소프트웨어 0 기준 터치 각 | \(\alpha_{fixed}=(\alpha_{raw}+\theta_{soft})\bmod 360\) |
| \(\phi_i\) | 4 방 스위치 배치각 | 기판 기준, 90° 간격 |

터치 눈금과 스위치는 노브와 함께 돈다. 보정을 켜면 \(\theta_{sensor}\) 가 아니라 \(\theta_{soft}\) 를 더하거나 되돌린다. 부호를 모드마다 바꾸지 않는다.

보정을 켠 결과:

- **소프트웨어 0 방향에 있는 스위치**가 `buttonMaskSoft` 의 상 (UP) 이다.
- **원형 패드에서 그 방향을 누르면** `touchFixedDeg = 0°` 이다.

보정을 끈 결과:

- **노브 마크 (LED·로고) 바로 아래 스위치**가 `buttonMaskMark` 의 상 (UP) 이다. 노브가 돌아도 마크와 함께 간다.
- 터치 로컬 각 `touchMarkDeg` 도 마크와 함께 간다.

### 4 방 스위치 알고리즘

스위치는 **4 개**를 유지한다. 8 개로 나누어 둘씩 묶는 안은 보류한다.

\(0^\circ\) 는 위, \(90^\circ\) 는 오른쪽 (시계 방향) 이다. \(X\) 는 오른쪽, \(Y\) 는 위. 캡이 눌리면 인접 접점이 같이 닫힐 수 있으므로, 스위치 번호 하나를 고르지 않고 힘을 벡터로 합친다. 힘 (또는 On=1) 을 \(F_i\) 라 할 때 기판 (절대 마킹) 프레임:

\[
X_{raw}=\sum F_i\sin\phi_i,\quad Y_{raw}=\sum F_i\cos\phi_i
\]

\(\Phi_{mark}=\operatorname{atan2}(X_{raw},\,Y_{raw})\)

\(\Phi_{mark}=0\) 은 노브 마크 쪽이다. 이 각을 `buttonMaskMark` 로 양자화한다. 무보정을 고르면 장비는 이 마스크를 쓴다. 마크가 가리키는 스위치가 항상 같은 버튼이다.

소프트웨어 0 을 고르면 같은 벡터를 \(\theta_{soft}\) 만큼 되돌린다. \(\phi=0\) 은 노브 마크 쪽 스위치다. 몸체가 시계 방향으로 \(\theta_{soft}\) 만큼 돌면, 기판에 고정된 힘 벡터도 그만큼 시계 방향으로 가 있다.

\[
\begin{bmatrix}X_{fixed}\\ Y_{fixed}\end{bmatrix}
=
\begin{bmatrix}\cos\theta_{soft} & \sin\theta_{soft}\\ -\sin\theta_{soft} & \cos\theta_{soft}\end{bmatrix}
\begin{bmatrix}X_{raw}\\ Y_{raw}\end{bmatrix}
\]

\[
\Phi_{soft}=\operatorname{atan2}(X_{fixed},\,Y_{fixed})
\]

\(\Phi_{soft}=0\) 이 소프트웨어 위이다. 이 각을 `buttonMaskSoft` 로 양자화한다. 약 90° 근처에서는 위와 오른쪽이 갈리기 쉬우므로, 그 혼선이 싫은 사용자는 스위치 보정을 끈다.

확인 예: 페어링 때 \(\theta_{sensor}=40^\circ\) 이면 \(\theta_{pair}=40^\circ\) 이다. 이후 \(\theta_{soft}=90^\circ\) 이면 기판의 왼쪽 스위치가 소프트웨어 0 방향에 온다. 스위치 보정을 켜면 그 스위치가 UP 이고, 끄면 마크 아래 스위치가 UP 이다. 터치 보정을 켜면 소프트웨어 0 지점의 터치는 \(0^\circ\) 이다.

### 사용자가 고르는 보정

장비마다 NVS 에 둔다. 터치와 스위치는 각각 고른다. 컨트롤러는 두 프레임을 항상 계산해 보내고, `framePref` 로 어느 쪽을 쓰라고 알린다. 장비는 기구학을 다시 하지 않고 이 비트를 따른다.

| 비트 | 1 | 0 |
| :--- | :--- | :--- |
| `framePref` bit0 터치 | 소프트웨어 0 (`touchFixedDeg`) | 절대 마킹 (`touchMarkDeg`) |
| `framePref` bit1 스위치 | 소프트웨어 0 (`buttonMaskSoft`) | 절대 마킹 (`buttonMaskMark`) |

기본값은 bit0=1, bit1=0 이다. 터치는 화면의 위가 페어링 방향에 머물고, 스위치는 LED·로고 아래가 항상 같은 버튼이다.

노브가 돌아가면 두 기준은 어긋난다. 그것이 혼선이면 **둘을 같은 값으로** 둔다. 둘 다 1 이면 터치와 스위치가 소프트웨어 0 에 맞고, 둘 다 0 이면 둘 다 노브 마크를 따른다.

```cpp
struct UserFramePref {
    uint8_t touchSoft;    // 1 소프트웨어 0, 0 절대 마킹
    uint8_t switchSoft;   // 1 소프트웨어 0, 0 절대 마킹
}; // deviceID 마다 NVS. 기본 {1, 0}
```

### 영점 — 페어링 때 자동

사용자가 페어링 **전에** 노브 마크 (상단 점, 로고 세로축) 를 자기가 위로 쓸 방향에 둔다. 고정자 마킹과 맞출 필요는 없다.

페어링 ACK 순간에 컨트롤러가 \(\theta_{sensor}\) 를 읽어 \(\theta_{pair}\) 로 NVS 에 저장한다. 별도 롱프레스나 마크 일치 절차는 없다. 다시 페어링하면 그 순간 자세로 \(\theta_{pair}\) 가 갱신되므로, 마크를 먼저 두고 페어링을 시작한다.

\(\theta_{sensor}\) 는 패킷에 그대로 실어, 장비가 기구 절대각이 필요하면 소프트웨어 0 과 따로 쓸 수 있게 한다.

### 원형 터치 알고리즘

원형 터치 IC 는 평면 \((x, y)\) 가 아니라 **로컬 각 하나**를 준다. 그래서 스위치처럼 \(2\times 2\) 행렬을 쓰지 않고, 각에 \(\theta_{soft}\) 를 더한다.

로컬 0° 눈금은 노브와 함께 시계 방향으로 \(\theta_{soft}\) 만큼 이동한다. 소프트웨어 0 위에 있는 점은 로컬 좌표에서 \(-\theta_{soft}\) 이다. 따라서 소프트웨어 0 기준 각은 로컬 각에 \(\theta_{soft}\) 를 **더한다**.

\[
\alpha_{fixed}=(\alpha_{raw}+\theta_{soft})\bmod 360
\]

스위치 식은 벡터를 되돌리고 터치 식은 각을 더한다. 부호가 반대처럼 보여도 같은 규칙이다. 눈금이 시계 방향으로 밀렸으면, 그 지점의 로컬 각은 그만큼 작아져 있으므로 더해야 소프트웨어 0 이 된다.

\(\theta_{soft}=90^\circ\) 이고 소프트웨어 0 지점을 누르면 \(\alpha_{raw}=270^\circ\), \(\alpha_{fixed}=0^\circ\) 이다.

원형 터치 IC 가 \(0\sim N\) 스텝을 주면 먼저 \(0\sim 360^\circ\) 로 스케일한 뒤 \(\theta_{soft}\) 를 더한다. 함수 인자 `encoderDeg` 에는 \(\theta_{sensor}\) 가 아니라 \(\theta_{soft}\) 를 넣는다.

```cpp
float getFixedTouchAngle(float rawTouchStep, float encoderDeg, float rawMax) {
    float rawDeg = (rawTouchStep / rawMax) * 360.0f;
    float fixed = rawDeg + encoderDeg;
    while (fixed >= 360.0f) fixed -= 360.0f;
    while (fixed < 0.0f)    fixed += 360.0f;
    return fixed;
}
```

컨트롤러는 여기서 멈춘다. 4 분할, 조이스틱 벡터, 스크롤 \(\Delta\), 손가락 수에 따른 커서·휠 분기를 만들지 않는다. 접촉 개수는 터치 IC 가 보고한 값만 전달한다.

---

## 컨트롤러 출력 — 모드와 무관한 정규화 패킷

유선 CAN, 무선 ESP-NOW 가 **같은 페이로드**를 쓴다. 패킷에 모드 번호나 해석된 명령을 넣지 않는다.

```cpp
struct __attribute__((packed)) ControllerOutputPacket {
    uint16_t deviceID;
    float    knobAngleDeg;     // θ_soft. 페어링 때 둔 노브 마크 방향이 0. 감도 미적용
    float    sensorAngleDeg;   // θ_sensor. 고정자 마킹이 0인 진짜 절대각
    int16_t  knobDeltaStep;    // 직전 샘플 대비 엔코더 증분 (감도 미적용)
    uint8_t  framePref;        // bit0 터치 1=소프트웨어 0, bit1 스위치 1=소프트웨어 0. 기본 0x01
    uint8_t  buttonMaskSoft;  // 소프트웨어 0 기준 4방. bit0 상, bit1 우, bit2 하, bit3 좌
    uint8_t  buttonMaskMark;  // 노브 절대 마킹 기준 4방. 마크 아래가 상
    uint8_t  touchState;       // 0 뗌, 1 누름, 2 접촉 유지
    uint8_t  touchCount;       // 터치 IC가 보고한 접촉 수. 0, 1, 2 이상. touchLevel로 추정하지 않음
    float    touchFixedDeg;    // α_fixed. 소프트웨어 0. 접촉이 둘 이상이면 대표각
    float    touchMarkDeg;     // α_raw 를 0~360으로 맞춘 값. 절대 마킹과 함께 돈다
    uint8_t  touchLevel;       // 접촉 면적 또는 강도 0~255. 크기용 원시값. 손가락 수가 아님
    uint32_t timeMs;           // 컨트롤러 시각. 장비의 Δt·제로크로스 판단용
};
```

이 구조체는 표준 패킷의 **베이스 코어**다. `knobAngleDeg`·`sensorAngleDeg` 는 `0x20`, `knobDeltaStep` 은 `0x21`, 두 마스크와 `framePref` 는 `0x22`, 터치 필드는 `0x26` 이다. `framePref` 기본값은 `0x01` (터치만 소프트웨어 0, 스위치는 절대 마킹) 이다. 헤더 (`controller_id`, `dest_id`, `seq`, `msg_type`) 와 CRC 는 플랫폼 문서 §2 다. 마이크 키워드와 청취 상태는 이 구조체에 넣지 않고 `0x2B` / `0x2E` 이벤트로 따로 보낸다.

아래 세 타입도 이 구조체 밖에 둔다. 100 Hz `STREAM` 에 실지 않는다.

| 타입 | 언제 | 필드 |
| :--- | :--- | :--- |
| `0x2A` `POWER` | 기본 장착. `STREAM` 과 매 `HEARTBEAT` 에는 넣지 않음 | `batt_pct`, `charging`. 보내는 때는 아래 전원 절 |
| `0x2C` `CONTROLLER_STATUS` | 매 `HEARTBEAT`. 1 차부터 | `fault`, `link_q` (링크 품질), arm 요청 힌트. 값이 바뀌면 `FAULT` (`0x05`) 이벤트를 한 번 더 보낸다. 헤더 `link` 는 USB / CAN / ESP-NOW 같은 **물리 종류**일 뿐 `link_q` 가 아니다. 비상 접점 알림은 `ESTOP_REQUEST` (`0x01`) 로 남기고 이 필드에 넣지 않는다 |
| `0x2D` `CAPABILITY` | 페어링 직후 `SNAPSHOT` 에 반드시. 비트가 바뀔 때만 다시 | 아래 비트맵 |

`CAPABILITY` 비트. 1 차에는 장착 입력만 채우고 형제 비트는 0 이다. 2 차에서 형제가 붙거나 떨어지면 `SIBLING_ATTACH` / `SIBLING_DETACH` 와 함께 이 타입을 다시 보낸다.

| 필드 | 비트 | 1 차 |
| :--- | :--- | :--- |
| `inputBits` | bit0 노브, bit1 4 방, bit2 원형 터치, bit3 본체 마이크, bit4 `VOICE_EXT_MIC` 장착 | 달린 입력만 1 |
| `siblingBits` | bit0 스마트폰 형제. 나머지 예약 | 0 |

```cpp
struct __attribute__((packed)) CapabilityBits {
    uint8_t inputBits;    // bit0 knob, bit1 dir4, bit2 touch, bit3 mic, bit4 extMic
    uint8_t siblingBits;  // 1차 0. 2차 bit0 = phone
};
```

연속 조작 중 코어는 `STREAM` 으로 상한 100 Hz. 생존은 `HEARTBEAT` 1~5 Hz 를 항상 보낸다. 홀드 중에도 절대각 스트림은 반복할 수 있다. 스트림이 잠시 비고 하트비트가 살아 있으면 장비는 마지막 절대각을 유지하고, 마지막 속도는 유지하지 않는다. 하트비트가 끊기면 출력 0 이다.

```cpp
void loop() {
    float sensor = MT6701.readAngle();            // 고정자 마킹 기준 절대각
    float thetaSoft = wrap360(sensor - thetaPair);
    uint8_t touchCount = TouchStrip.touchCount(); // IC 미지원이면 0 또는 1만. 면적으로 올리지 않음
    bool touched = touchCount > 0;
    float touchFixed = getFixedTouchAngle(
        TouchStrip.readRaw(), thetaSoft, TOUCH_RAW_MAX);
    float touchMark = getFixedTouchAngle(
        TouchStrip.readRaw(), 0.0f, TOUCH_RAW_MAX);
    uint8_t buttonsSoft = mapSwitchesToWorld(thetaSoft);
    uint8_t buttonsMark = mapSwitchesToWorld(0.0f); // 절대 마킹. 마크 아래 = 상
    int16_t dStep = encoderDelta(sensor, prevSensor);

    ControllerOutputPacket pkt = {
        boundDeviceID, thetaSoft, sensor, dStep, framePref,
        buttonsSoft, buttonsMark,
        touchState(touched, prevTouched), touchCount,
        touchFixed, touchMark, TouchStrip.level(), millis()
    };
    send(pkt);   // 표준 패킷 STREAM 또는 CAN/ESP-NOW 세그먼트. 모드 분기 없음
    prevSensor = sensor;
    prevTouched = touched;
}
```

`rotationSensitivity`, `maxRotationRange` 는 장비 프로필에만 있고, 컨트롤러 송신 값에는 곱하지 않는다. 화면 눈금·클릭음용 가상 디텐트만 프로필의 `stepCount` 를 참조한다.

---

## 장비가 선언하는 프로필

페어링 1 회에 장비가 컨트롤러로 보낸다. 컨트롤러는 NVS 에 저장하고 **UI 에만** 쓴다. 제어 분기의 입력이 아니다.

```cpp
struct __attribute__((packed)) DeviceConfigPacket {
    uint16_t deviceID;
    char     deviceName[20];
    uint8_t  touchMode;          // UI 템플릿 번호. 1 4분할, 2 조이스틱, 3 스크롤, 4 PC 포인터. 본체 사이드 Mode 스위치가 아님
    uint8_t  uiTemplateID;
    float    maxRotationRange;   // 장비가 쓰는 출력 스케일의 상한 (장비 내부용 선언)
    float    defaultSensitivity; // 장비 기본 감도 (장비 내부용 선언)
    uint16_t stepCount;          // 컨트롤러 화면·클릭 에뮬레이션 눈금 수
};
```

장비가 런타임에 모드를 바꾸면 같은 패킷을 다시 보낸다. 컨트롤러는 화면만 바꾸고, 출력 패킷 형식은 유지한다.

---

## 연결 장비의 터치 해석

모드 1~3 과 PC 포인터는 **같은 `ControllerOutputPacket` 을 장비가 다르게 읽는 방식**이다. 터치 각과 스위치 마스크는 `framePref` 가 가리키는 프레임을 쓴다.

```cpp
float touchDeg(const ControllerOutputPacket& in) {
    return (in.framePref & 0x01) ? in.touchFixedDeg : in.touchMarkDeg;
}
uint8_t buttons(const ControllerOutputPacket& in) {
    return (in.framePref & 0x02) ? in.buttonMaskSoft : in.buttonMaskMark;
}
```

### 모드 1 — 고정 방위 4 분할 버튼

메뉴, CNC 축 선택처럼 노브를 돌려 두어도 **페어링 때 잡아 둔 소프트웨어 상·우·하·좌**가 버튼이어야 할 때.

- 입력: `touchState`, `touchDeg()` (스위치 버튼이면 `buttons()`)
- 장비 연산: \(315^\circ\sim 45^\circ\) 상, \(45\sim 135\) 우, \(135\sim 225\) 하, \(225\sim 315\) 좌
- 노브 각 `knobAngleDeg` 는 이 모드에서도 별도 축 (값 증감) 으로 쓸 수 있다. 컨트롤러는 둘을 묶지 않는다.

### 모드 2 — 가상 조이스틱

정밀 타겟, 속도 미세 조정.

- 방향: `touchDeg()` 가 돌려 준 각. 터치 보정이 켜져 있으면 소프트웨어 0, 꺼져 있으면 노브 마크 기준이다.
- 크기: `touchLevel` (또는 장비 정책으로 누름 시간을 크기에 매핑)
- 장비 연산: \(\alpha\) 는 `touchDeg()` 의 반환값이다. 소프트웨어 0 이면 `touchFixedDeg`, 절대 마킹이면 `touchMarkDeg` 이다.

\[
J_{right} = L\cdot\sin\alpha,\quad J_{up} = L\cdot\cos\alpha
\]

\(\alpha=0^\circ\) 이면 그 프레임의 위이고 \((J_{right}, J_{up})=(0, L)\) 이다. \(L\) 은 `touchLevel` 을 장비가 정규화한 값. 미접촉이면 영벡터.

### 모드 3 — 터치 스크롤 휠

수치 입력, 볼륨·디밍. 물리 노브 회전과 별개의 손가락 쓸기.

- 장비 연산: `touchDeg()` 가 고른 각의 연속 샘플만 사용. 터치 보정을 끄면 마크와 함께 도는 각의 차이이다.

\[
\Delta = \alpha_{fixed,now}-\alpha_{fixed,prev}
\]

\(\Delta>180\) 이면 \(\Delta-=360\), \(\Delta<-180\) 이면 \(\Delta+=360\) (0° 경계). 감도 `defaultSensitivity` 는 여기서 곱한다.

노브 자체의 `knobDeltaStep` 과 터치 \(\Delta\) 를 더하지 않는다. 두 입력은 독립 채널이다.

원형 스트립에는 평면 \(XY\) 가 없다. 모드 3 을 마우스 포인터로 바꾸지 않는다. 포인터가 필요하면 아래 시나리오처럼 장비 (PC) 가 같은 패킷을 조합한다.

### 터치 액션 시나리오

해석은 전부 장비 쪽이다. 컨트롤러는 제스처 이름을 붙이지 않는다. `touchCount` 는 터치 IC 의 접촉 수이고, `touchLevel` 로 손가락 수를 추정하지 않는다. IC 가 개수를 못 내면 `touchCount` 는 0 또는 1 만 두고, 두 손가락 스크롤은 켜지 않는다.

| 시나리오 | 보는 값 | 장비 해석 |
| :--- | :--- | :--- |
| **탭** | `touchCount == 1`, 접촉이 짧고 \(\Delta\) 가 작다 | 모드 1 이면 그 방위의 버튼 한 번. \(315^\circ\sim45^\circ\) 상, \(45\sim135\) 우, \(135\sim225\) 하, \(225\sim315\) 좌 |
| **한 손가락 유지** | `touchCount == 1`, 거의 고정 | 모드 2 면 그 방향의 조이스틱. 크기는 `touchLevel` |
| **한 손가락 링 드래그** | `touchCount == 1`, \(\Delta\) 가 이어짐 | 모드 3 이면 스크롤. PC 포인터 시나리오에서는 스크롤이 아니라 커서 |
| **두 손가락 이상** | `touchCount >= 2`, 대표각의 \(\Delta\) | 스크롤. \(\Delta>180\) 이면 \(\Delta-=360\), \(\Delta<-180\) 이면 \(\Delta+=360\) |
| **4 방 스위치** | `buttons()` | 모드 1 의 버튼, 또는 PC 에서 클릭. 보정은 `framePref` bit1. 좌·우 클릭 배정은 PC 드라이버가 정한다 |
| **노브 회전** | `knobAngleDeg`, `knobDeltaStep` | 터치와 합치지 않는 별도 축. PC 가 필요하면 휠로 재배정할 수 있으나 기본은 두 손가락이 휠 |

**PC 포인터 (touchMode 4, UI 템플릿만 컨트롤러에 알림)**

- 한 손가락: 선택된 터치 각 방향으로 커서를 움직이고, 속도는 `touchLevel` 에 비례한다. 링 위의 각도는 평면 좌표가 아니므로 터치패드처럼 손가락 위치를 화면 위치로 옮기지 않는다.
- 두 손가락 이상: 대표각의 \(\Delta\) 를 휠로 쓴다.
- 스위치: 클릭.
- 모드 3 은 그대로 둔다. PC 시나리오는 모드 3 을 대체하지 않고, 손가락 수로 커서와 휠을 가른다.

### 장비 측 루프

```cpp
void onControllerPacket(const ControllerOutputPacket& in) {
    applyKnob(in.knobAngleDeg, in.knobDeltaStep * profile.defaultSensitivity);

    switch (profile.touchMode) {
        case 1: {
            int section = touchedSection4(in.touchState, touchDeg(in));
            onButton(section, buttons(in));
            break;
        }
        case 2: {
            float L = in.touchState ? in.touchLevel / 255.0f : 0.0f;
            float rad = touchDeg(in) * DEG2RAD;
            onJoystick(L * sinf(rad), L * cosf(rad)); // x=오른쪽, y=위. 0°=위
            break;
        }
        case 3: {
            float d = touchScrollDelta(in);   // 제로크로스 보정, 접촉 중만
            onScroll(d * profile.defaultSensitivity);
            break;
        }
        case 4: // PC 드라이버. Rotor 펌웨어가 커서를 만들지 않음
            if (in.touchCount >= 2) onScroll(touchScrollDelta(in));
            else if (in.touchCount == 1) onCursor(touchDeg(in), in.touchLevel);
            onClick(buttons(in));
            break;
    }
}
```

`applyKnob` 이 모터·밸브를 어떻게 움직일지는 장비 고유 로직이다. Rotor 펌웨어에 두지 않는다.

---

## 페어링

주소, 세션, Arm, 허용 목록, HMAC 은 플랫폼 문서 §1, §6, §11 을 따른다. 이 절이 더하는 것은 **소프트웨어 0°** 와 페어링 모드에 들어가는 손동작뿐이다.

유선은 **CAN**, 무선은 **ESP-NOW**. 코어 필드는 같고, 봉투는 표준 패킷이다.

```text
[Rotor ESP32-S3]                              [장비]
      │                                         │
      ├── 1. 페어링 모드 ───────────────────────▶│  4방 상+하 3초, 또는 유선 확정
      │◀── 2. DeviceConfigPacket ───────────────┤  UI 템플릿·눈금. 제어 분기 아님
      │                                         │
      │  허용 목록·세션은 플랫폼 규약            │  최초 응답 MAC 만으로 잠그지 않음
      │                                         │
      ├── 3. ACK ──────────────────────────────▶│  Arm 전제는 장비 DISARM
      │                                         │
      │  θ_sensor 를 θ_pair 로 NVS 저장          │  노브 마크가 놓인 방향 = 소프트웨어 0
      │                                         │
      │  HEARTBEAT 1~5 Hz                        │
      │  연속 조작 중 STREAM ≤ 100 Hz            │  장비가 코어 필드를 자기 모드로 해석
```

4 방의 상 + 하 3 초는 페어링 **모드 진입**이다. 보안 경계는 `allowed_controller_id` 와 Arm 이다. 브로드캐스트 뒤 처음 대답한 MAC 을 장비로 확정하지 않는다. 옆 장비가 먼저 대답하면 그대로 묶이기 때문이다.

### CAN

- `controller_id` 와 `dest_id` 는 표준 패킷 헤더의 값이다. CAN 식별자에 어떻게 실을지는 구현 항목이고, 고정 마스터 `0x01` / 장비 `0x10~` 만으로 허용 목록을 대신하지 않는다.
- 클래식 CAN 페이로드는 8 바이트이므로 코어와 `DeviceConfigPacket` 은 멀티프레임이다. CAN FD(최대 64 바이트) 면 코어 한 프레임에 가깝게 넣을 수 있다. 어느 쪽이든 필드 의미는 이 문서의 구조체와 같다.
- `STREAM` 상한은 10 ms(100 Hz) 다. `HEARTBEAT` 는 그와 별도로 1~5 Hz 다. 스트림 주기를 장비마다 바꾸려면 `DeviceConfigPacket` 에 `reportPeriodMs` 를 추가한다.

### ESP-NOW

- 장비 MAC 은 무선 주소일 뿐, 허용 목록이 아니다.
- 목표 지연은 10 ms 미만. 연결 유지용으로 페어링을 반복하지 않고, 생존은 하트비트가 담당한다.

하트비트가 N 초 끊기면 장비는 **출력 0** 이고 직전 속도를 유지하지 않는다. 스트림만 잠시 비고 하트비트가 살아 있으면 **마지막 절대각**을 유지한다. Rotor 는 링크 단절을 화면으로 알린다.

---

## 기구 제약과 보완

### 틸트 축이 없는 이유와 대체

축은 베어링에 고정되어 기울지 않는다. 방향 입력은 다음으로 대체한다.

1. **상단 4 방 스위치.** 캡 가장자리를 누르면 판스프링·실리콘이 눌리며 `SW` 가 클릭된다. 방향은 `framePref` bit1 이 고른 마스크이다. 8 개 배치는 보류한다.
2. **`ICM-20948` 미세 피치·롤 (선택).** 패널·오링의 미세 변형·충격 가속도를 틸트 이벤트로 쓸 수 있다. 채택 시에도 결과는 스위치 마스크의 확장 비트가 아니라 **별도 원시 필드**로 보내고, 이벤트 의미는 장비가 정한다. 기본 패킷에는 넣지 않는다. 센서 융합이 확정되면 패킷 버전을 올린다.

### 비상 정지

비상 정지는 노브 안에 넣지 않고, Rotor 패킷으로 차단을 만들지 않는다. MCU 가 멈추거나 무선이 끊겨도 구동이 멈춰야 하므로, 적색 버섯 스위치는 전원 또는 액추에이터 릴레이에 **하드와이어 직렬**이다. 스위치를 누르면 그 회로가 열린다.

배치는 둘 중 하나다. 회로는 같다.

| 배치 | 내용 | 기본 |
| :--- | :--- | :--- |
| **장비 기본 장착** | 버섯 스위치를 장비 하우징에 둔다 | 기본 |
| **안전 모듈** | 같은 스위치를 독립 모듈로 두고 장비 안전 회로에 직렬로 꽂는다. 형제 컨트롤러도, 마이크 플러그인도 아니다 | 장비에 자리를 두기 어려울 때 |

접점을 장비가 읽어 DISARM 과 로그에 남길 수 있다. 그 알림이 표준 패킷의 `ESTOP_REQUEST` 다. 알림이 죽어도 하드와이어는 끊긴 채로 남는다. 4 방 스위치를 동시에 눌러 비상 정지를 만들지 않는다. 상 + 하 장누르기는 페어링 모드 진입에만 쓴다.

### 연산량

ESP32-S3 하드웨어 FPU 로 `sin` / `cos` / `atan2` 를 100Hz 루프에 둔다. 터치 보정은 덧셈과 나머지뿐이라 행렬보다 가볍다. 스위치는 접점이 동시에 눌릴 때만 행렬을 쓴다.

### 가상 디텐트

노브는 무한 회전이다. `stepCount` 만큼 화면 눈금과 클릭음을 낸다. 클릭은 조작 피드백일 뿐, `knobDeltaStep` 을 양자화해 패킷을 바꾸지 않는다. 양자화가 필요하면 장비가 한다.

---

## 마이크

본체 마이크는 Rotor 의 입력이다. 1 차 성공 문장 (노브·스위치·비상) 의 필수 증명은 아니고, 하드웨어와 패킷 자리는 지금 고정한다. 음성은 보조 입력이다. 조향은 노브, 시작·정지는 4 방, 차단은 장비 또는 안전 모듈이다.

기본은 비활성 (`LISTEN_OFF`) 이다. **마이크 전용 택트 1 개** (`BTN_MIC`) 로 클릭 / 더블클릭 / 롱클릭을 구분한다. 4 방 스위치와 겸용하지 않는다.

### 물리

| 항목 | 권장 |
| :--- | :--- |
| 소자 | INMP441. 기성 모듈 약 14×14×2.5 mm |
| 위치 | 상단 LED 근처 핀홀. 말하는 방향과 손잡이를 분리 |
| 실링 | 고어텍스 벤트 + 실리콘 가스켓. 본체 진동과 플로팅 |
| 택트 | `BTN_MIC` 전용 1 개. 리세스 |
| 피드백 | 단발은 단색, 상시 청취는 점멸, PTT 는 누르는 동안만 점등 |
| 차단 | `LISTEN_OFF` 이면 I2S 또는 마이크 전원을 끊는 것을 권장 |

### 택트 → 청취 모드

| 제스처 | 모드 | 동작 |
| :--- | :--- | :--- |
| **클릭** | `LISTEN_ONESHOT` | 청취 ON. 명령 수락 직후 OFF, 또는 무음·무명령 시간이 지나면 OFF |
| **더블클릭** | `LISTEN_HOLD` | 수동으로 끌 때까지 유지. 다시 클릭 또는 더블클릭으로 OFF |
| **롱클릭** | `LISTEN_PTT` | 누르는 동안만 ON. 손을 떼면 즉시 OFF |

```text
                    ┌─ 클릭 ──────► LISTEN_ONESHOT ──(명령|무음타임아웃)──► OFF
LISTEN_OFF ─ BTN_MIC┤─ 더블클릭 ──► LISTEN_HOLD ────(클릭/더블로 해제)───► OFF
                    └─ 롱클릭(홀드)► LISTEN_PTT ────(릴리즈 즉시)────────► OFF
```

| 상태 | 동작 |
| :--- | :--- |
| `LISTEN_OFF` | 인식 안 함. 가능하면 마이크 전원 OFF. `VOICE_KEYWORD` 미송신 |
| `LISTEN_ONESHOT` | 한 번 말하기. 명령 후 또는 무음 타이머로 OFF |
| `LISTEN_HOLD` | 상시 청취. LED 점멸 |
| `LISTEN_PTT` | 홀드 중만. 소음 현장에서 우선 |

ONESHOT 은 화이트리스트 키워드를 보낸 직후, 또는 `VOICE_SILENCE_TIMEOUT_MS` 동안 유효 음성이 없으면 OFF 다. 과대 소음이면 ON 을 거부할 수 있다. HOLD 는 클릭 또는 더블클릭으로 끈다. 부팅·페어링·세션 revoke 때는 무조건 `LISTEN_OFF` 로 리셋한다.

| 환경 | 권장 |
| :--- | :--- |
| 조용함 | 클릭 (ONESHOT) 또는 더블클릭 (HOLD) |
| 소음·열융착 | 롱클릭 PTT. HOLD 는 가능하면 피한다 |
| 이동·한 손 | PTT |

| 변수 | 권장 기본 | 설명 |
| :--- | :--- | :--- |
| `VOICE_DEFAULT_STATE` | `LISTEN_OFF` | 부팅·페어링 직후 |
| `MIC_MULTI_CLICK_MS` | 250~300 | 더블클릭 창 |
| `MIC_LONG_PRESS_MS` | 400~500 | 이 이상 홀드가 PTT. 그 미만 릴리즈는 클릭 후보 |
| `VOICE_SILENCE_TIMEOUT_MS` | 3000~5000 | ONESHOT 자동 OFF |
| `VOICE_POST_CMD_MUTE` | `true` | ONESHOT 은 명령 수락 후 즉시 OFF |
| `VOICE_CONFIDENCE_MIN` | (튜닝) | 미만은 폐기 |
| `VOICE_NOISE_GATE_DB` | (튜닝) | 초과 시 ONESHOT/HOLD 제한. PTT 는 유지 가능 |
| `VOICE_KEYWORD_WHITELIST` | 최소 집합 | 예: Left / Right / Center |

`0x2B VOICE_KEYWORD` 는 청취 ON 이고 화이트리스트와 confidence 를 통과할 때만 보낸다. `0x2E MIC_LISTEN` 은 모드와 ON/OFF 사유를 담는다. 100 Hz 코어 스트림과 섞지 않는다.

마이크는 플러그인 스테레오와 본체 마이크의 두 겹이다. 본체는 Rotor 와 Deck 모두 둘 수 있다. 플러그인 `VOICE_EXT_MIC` 은 유선으로 한 컨트롤러에 꽂혀 그 클럭을 공유한다. 컨트롤러끼리 유선으로 샘플 클럭을 공유하면 그 본체 마이크 사이에도 스테레오가 동작하고, 빔·구역 같은 기능을 연다. 무선만이면 각 컨트롤러는 키워드만 보낸다.

### 플러그인 `VOICE_EXT_MIC`

본체 INMP441 에 유선 미니 마이크를 꽂아 SNR 을 올린다. 조작 UI 가 없으므로 형제가 아니다. 택트 제스처는 그대로이고, 플러그인은 어느 채널을 쓸지만 고른다.

| 시나리오 | 본체 | 플러그인 | 비고 |
| :--- | :--- | :--- | :--- |
| 포켓 + 입 | 호주머니의 본체 | 입 주변 클립 | 실무 기본 후보 |
| 입만 | OFF | 입 주변만 ON | 소음 현장 |
| 둘 다 외부 | 고정/거치 | 고정/거치 | 방향 추정 |
| 본체만 | ON | 미연결 | 플러그인 없음 |

| 모드 | 동작 | 우선 사용 |
| :--- | :--- | :--- |
| `MOUTH_ONLY` | 플러그인만 인식 | 소음·열융착 |
| `STEREO_BF` | 두 채널. 본체를 노이즈 참조 | 조용~중간 |
| `BASE_ONLY` | 본체만 | 미연결·단선 폴백 |
| `DUAL_RAW` | 두 채널 원시 | 캘리브·실험 |

링크는 유선이고, 같은 I2S 클럭을 권장한다. 플러그인이 빠지면 `BASE_ONLY` 로 돌아간다. 인식 결과만 `VOICE_KEYWORD` 로 보내고, 오디오 스트림은 표준 패킷에 넣지 않는다.

두 마이크의 목적은 스튜디오 스테레오가 아니라 명령어 SNR 이다. TDOA·레벨차로 좌·우 구역을 추정할 수 있다. cm 급 XYZ 좌표 추적은 제품 목표가 아니다.

간격이 바뀌므로 방향을 쓰려면 기하가 필요하다. 현장 캘리브 (`FREE`) 는 발화로 `baseline_mm` 과 축을 저장한다. 장비 브래킷에 간격이 고정이면 `equipment_id → mic_geometry` 를 서버에서 읽어 캘리브를 생략한다 (`FIXED_DB`).

| 변수 | 설명 |
| :--- | :--- |
| `VOICE_CH_MODE` | `MOUTH_ONLY` / `STEREO_BF` / `BASE_ONLY` |
| `VOICE_GEOMETRY_SOURCE` | `FIXED_DB` / `FREE` |
| `VOICE_BASELINE_MM` | 캘리브 또는 DB 값 |
| `VOICE_PLUGIN_PRESENT` | 플러그인 검출 |

구현 순서는 유선 입주변 + `MOUTH_ONLY` + PTT, 그다음 노이즈 참조, 장비 DB 기하, TDOA, 그리고 3D 좌표는 비목표다.

---

## 전원·BOM

본체 배터리와 잔량 모니터는 **기본 장착**이다. 셀 용량, 무선충전, 회전 기판을 넘는 급전 경로는 기구가 정한다. 잔량을 읽는 기능 자체는 빼지 않는다. 충전 코일과 MT6701 의 자기 간섭은 충전 on/off 각도 오차로 실측한다. AS5600 포켓 휠의 본체·서브 듀얼 배터리 배치는 쓰지 않는다. 추가 전원 팩은 플랫폼 문서의 액세서리다.

`batt_pct` (0~100) 와 `charging` 은 `0x2A` 로만 보낸다. `ControllerOutputPacket` 과 100 Hz `STREAM`, 1~5 Hz `HEARTBEAT` 에는 넣지 않는다. 하트비트 헤더의 `flags.low_batt` 는 저전력인지 여부 1 비트만 둔다. 퍼센트는 싣지 않는다.

| 조건 | 전송 |
| :--- | :--- |
| 페어링 직후 | `SNAPSHOT` 에 `0x2A` 1 회 |
| `charging` 이 바뀜 | `EVENT` 로 `0x2A` |
| `batt_pct` 가 마지막 송신값보다 `POWER_STEP_PCT` 이상 변함 | `EVENT` 로 `0x2A` |
| 잔량이 `POWER_LOW_PCT` 를 내려 넘음 | `LOW_BATTERY` (`0x0A`) 와 `0x2A` 를 함께 |
| 위 변화가 없어도 `POWER_REFRESH_S` 가 지남 | `EVENT` 로 `0x2A` 1 회. 놓친 이벤트를 메운다 |

세 상수의 기본값은 패밀리 문서 §2.0-B 가 기준이다. 이 절은 그 이름을 언제 쓰는지와 기본 장착만 정한다.

문턱 안에서 흔들리는 1% 미만은 보내지 않는다. 장비가 요청하면 `SNAPSHOT` 으로 한 번 더 보낼 수 있다.

| 부품 | 수량 | 역할 |
| :--- | ---: | :--- |
| 본체 배터리 | 1 | 기본 전원. 용량은 기구가 정한다 |
| 잔량 모니터 | 1 | `batt_pct`, `charging`. 기본 장착. 게이지 또는 셀 전압 |
| ESP32-S3 | 1 | 코어 계산·링크. 기판은 노브와 함께 회전 |
| MT6701 | 1 | 센서 0° 절대각 |
| 원형 터치 IC | 1 | 로컬 각 하나. 평면 XY 아님 |
| 4 방 스위치 | 4 | 방향. 8 개 배치는 보류 |
| `BTN_MIC` | 1 | 청취 제스처 전용 |
| INMP441 | 1 | 본체 마이크 |
| `VOICE_EXT_MIC` | 0~1 | 유선 플러그인. 형제 아님 |
| ICM-20948 | 0~1 | 미세 피치·롤. 기본 패킷 제외 |
| 베어링 10×20×5 | 1 | 고정축. 예: 68002RS |
| 화면·LED | 1 식 | 템플릿, 청취 상태, 링크 |

적색 버섯 스위치는 이 표에 없다. 장비 기본 장착이거나 안전 모듈이다.

---

## 확장

- 기구·컨트롤러 펌웨어는 한 벌. 장비 추가는 `DeviceConfigPacket` 과 장비 측 `onControllerPacket` 구현으로 끝난다.
- UI 템플릿 번호만 맞으면 화면 가이드를 장비별로 바꿀 수 있다. 템플릿이 제어 분기를 대신하지 않는다.
- 공장 장비, 가전, 로봇 중 CAN 또는 ESP32 를 가진 노드는 같은 표준 패킷을 구독한다. Rotor 코어 필드는 그 패킷의 베이스 타입이다.
