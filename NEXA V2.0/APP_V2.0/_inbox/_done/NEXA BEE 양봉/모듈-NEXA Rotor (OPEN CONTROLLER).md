---
doc_id:
title: "모듈 — NEXA Rotor (Open Controller)"
category: "모듈"
domain: "공용 제어"
status: draft
created: 2026-10-21
updated: 2026-10-25
parent_doc:
implements_doc:
see_also: []
terms_standard: [can-bus, esp-now]
terms_nexa: [NEXA-Rotor, Open-Controller]
---

# 모듈 — NEXA Rotor (Open Controller)

![](../../../../../assets/Pasted%20image%2020261021100314.png)

터치스크린, 4 방 스위치, 메인 기판이 **노브와 한 덩어리로 강결합**되어 통째로 회전한다. 십자 짐벌·구면 조인트는 두지 않고, 중앙 고정축에 **베어링 10×20×5**와 **댐퍼 그리스**만 둔다.

- 회전 중에도 기판과 스위치의 상대 위치는 노브 몸체 안에서 고정된다. 유격이 없고, 조작감이 묵직하며, 방진·방수에 유리하다.
- 바닥 고정자 마킹은 엔코더의 **센서 0°**이다. 노브 상단 마크 (LED·로고) 는 몸체에 고정된 **절대 마킹**이다. 페어링 때 그 마크가 가리키던 방향이 **소프트웨어 0°**이다.
- 터치와 4 방 스위치의 회전 보정은 **장비마다, 입력마다** 사용자가 켠다. 기본은 터치만 소프트웨어 0, 스위치는 절대 마킹 기준 (무보정) 이다.
- 보정 이후의 동작 의미 (4 분할 버튼, 조이스틱, 스크롤) 는 컨트롤러가 정하지 않는다. **연결 장비가 자기 모드로 해석**한다.

---

## 역할 분리

| 위치                    | 담당                                                                                                                                                   | 하지 않는 일                                                                      |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **컨트롤러 (ESP32-S3)** | 터치·스위치의 **두 프레임을 모두 계산**해 보낸다. 장비별 사용자 선택 (보정 켜기/끄기) 을 패킷에 실어 NVS 에 둔다. 화면·가상 디텐트는 장비가 선언한 템플릿 | 장비 모드 분기, 버튼/조이스틱/스크롤 명령 생성, 감도·스케일 적용, 액추에이터 제어 |
| **장비 (Machine)**      | 페어링 시 모드·UI 템플릿·허용 범위 선언. 수신 입력을 **자기 모드로 연산**해 축·속도·밝기 등 자기 명령으로 변환                                         | 노브 기구학 (θ 보정) 재구현                                                        |

컨트롤러 펌웨어는 장비가 늘어도 출력 분기가 늘지 않는다. 새 장비는 자기 펌웨어와 프로필 패킷만 추가한다.

---

## 좌표계 규약

시계 방향을 \(+\). 0° 는 두 개이며, 서로 같지 않아도 된다.

| 이름                                 | 무엇이 0 인가                                                                                     | 바뀌는 시점                                                       |
| :----------------------------------- | :----------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| **센서 0°** \(\theta\_{sensor}\)     | 바닥 고정자 마킹. `MT6701` 의 진짜 절대각. 4 각 고정자는 한 면, 원형 고정자는 바깥 마킹이 이 0 이다 | 기구로 고정. 소프트웨어가 바꾸지 않는다                           |
| **소프트웨어 0°** \(\theta\_{soft}\) | 페어링 순간, 사용자가 편히 둔 **노브 상단 마크**(로고 세로축과 같은 축) 가 가리키던 방향          | 페어링이 성립할 때 자동 저장. 다시 페어링하면 그 순간 자세로 갱신 |

\[
\theta*{soft}=(\theta*{sensor}-\theta\_{pair})\bmod 360
\]

\(\theta*{pair}\) 는 페어링 직전의 센서각이다. 노브 마크를 고정자 마킹과 일치시킬 필요는 없다. 절대각 \(\theta*{sensor}\) 와 소프트웨어 0 은 항상 다를 수 있다.

## 회전 보정이 필요한 이유

4 방 스위치와 원형 터치는 노브 기판에 고정되어 있다. 노브를 돌리면 접점과 터치 0° 눈금이 **몸체와 함께** 돈다. 소프트웨어 0(페어링 때 노브 마크가 가리키던 방향) 은 그 사이 움직이지 않는다.

\(\theta\_{soft}=90^\circ\)(시계 방향) 일 때:

- 기판에서 노브 마크 쪽에 있는 스위치 (\(\phi=0\)) 는 소프트웨어 0 에서 오른쪽으로 가 있다.
- 지금 소프트웨어 0 방향에 있는 스위치는 기판의 왼쪽 스위치다.
- 터치 IC 의 로컬 0° 도 오른쪽으로 밀려 있다. 소프트웨어 0 지점을 누르면 로컬 각은 \(270^\circ(-90^\circ)\) 로 나온다.

보정을 하지 않으면 같은 곳을 눌러도 노브 각도에 따라 UP 과 터치 방위가 바뀐다. `MT6701` 과 스위치·터치는 컨트롤러에만 있으므로 이 되돌림은 컨트롤러가 한다. 장비는 노브 기구학을 다시 구현하지 않는다.

핵심은 한 가지다. 기판 프레임의 입력을 \(\theta\_{soft}\) 만큼 되돌려 소프트웨어 0 프레임으로 만드는 식을 컨트롤러가 항상 계산한다. 그 결과를 쓸지는 사용자가 터치와 스위치를 따로 정한다. 모드 (버튼, 조이스틱, 스크롤, 커서) 는 장비 몫이다.

| 기호                 | 의미                      | 프레임                                                    |
| :------------------- | :------------------------ | :-------------------------------------------------------- |
| \(\theta\_{sensor}\) | `MT6701` 읽기             | 고정자 마킹 기준                                          |
| \(\theta\_{pair}\)   | 페어링 순간 센서각        | NVS 오프셋                                                |
| \(\theta\_{soft}\)   | 출력에 쓰는 노브각        | 노브 마크를 페어링 자세로 되돌리면 0                      |
| \(\alpha\_{raw}\)    | 원형 터치 로컬 각         | 노브와 함께 도는 기판                                     |
| \(\alpha\_{fixed}\)  | 소프트웨어 0 기준 터치 각 | \(\alpha*{fixed}=(\alpha*{raw}+\theta\_{soft})\bmod 360\) |
| \(\phi_i\)           | 4 방 스위치 배치각         | 기판 기준, 90° 간격                                       |

터치 눈금과 스위치는 노브와 함께 돈다. 보정을 켜면 \(\theta*{sensor}\) 가 아니라 \(\theta*{soft}\) 를 더하거나 되돌린다. 부호를 모드마다 바꾸지 않는다.

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
X*{raw}=\sum F_i\sin\phi_i,\quad Y*{raw}=\sum F_i\cos\phi_i
\]

\(\Phi*{mark}=\operatorname{atan2}(X*{raw},\,Y\_{raw})\)

\(\Phi\_{mark}=0\) 은 노브 마크 쪽이다. 이 각을 `buttonMaskMark` 로 양자화한다. 무보정을 고르면 장비는 이 마스크를 쓴다. 마크가 가리키는 스위치가 항상 같은 버튼이다.

소프트웨어 0 을 고르면 같은 벡터를 \(\theta*{soft}\) 만큼 되돌린다. \(\phi=0\) 은 노브 마크 쪽 스위치다. 몸체가 시계 방향으로 \(\theta*{soft}\) 만큼 돌면, 기판에 고정된 힘 벡터도 그만큼 시계 방향으로 가 있다.

\[
\begin{bmatrix}X*{fixed}\\ Y*{fixed}\end{bmatrix}
=
\begin{bmatrix}\cos\theta*{soft} & \sin\theta*{soft}\\ -\sin\theta*{soft} & \cos\theta*{soft}\end{bmatrix}
\begin{bmatrix}X*{raw}\\ Y*{raw}\end{bmatrix}
\]

\[
\Phi*{soft}=\operatorname{atan2}(X*{fixed},\,Y\_{fixed})
\]

\(\Phi\_{soft}=0\) 이 소프트웨어 위이다. 이 각을 `buttonMaskSoft` 로 양자화한다. 약 90° 근처에서는 위와 오른쪽이 갈리기 쉬우므로, 그 혼선이 싫은 사용자는 스위치 보정을 끈다.

확인 예: 페어링 때 \(\theta*{sensor}=40^\circ\) 이면 \(\theta*{pair}=40^\circ\) 이다. 이후 \(\theta\_{soft}=90^\circ\) 이면 기판의 왼쪽 스위치가 소프트웨어 0 방향에 온다. 스위치 보정을 켜면 그 스위치가 UP 이고, 끄면 마크 아래 스위치가 UP 이다. 터치 보정을 켜면 소프트웨어 0 지점의 터치는 \(0^\circ\) 이다.

### 사용자가 고르는 보정

장비마다 NVS 에 둔다. 터치와 스위치는 각각 고른다. 컨트롤러는 두 프레임을 항상 계산해 보내고, `framePref` 로 어느 쪽을 쓰라고 알린다. 장비는 기구학을 다시 하지 않고 이 비트를 따른다.

| 비트                    | 1                               | 0                            |
| :---------------------- | :------------------------------ | :--------------------------- |
| `framePref` bit0 터치   | 소프트웨어 0 (`touchFixedDeg`)  | 절대 마킹 (`touchMarkDeg`)   |
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

페어링 ACK 순간에 컨트롤러가 \(\theta*{sensor}\) 를 읽어 \(\theta*{pair}\) 로 NVS 에 저장한다. 별도 롱프레스나 마크 일치 절차는 없다. 다시 페어링하면 그 순간 자세로 \(\theta\_{pair}\) 가 갱신되므로, 마크를 먼저 두고 페어링을 시작한다.

\(\theta\_{sensor}\) 는 패킷에 그대로 실어, 장비가 기구 절대각이 필요하면 소프트웨어 0 과 따로 쓸 수 있게 한다.

### 원형 터치 알고리즘

원형 터치 IC 는 평면 \((x, y)\) 가 아니라 **로컬 각 하나**를 준다. 그래서 스위치처럼 \(2\times 2\) 행렬을 쓰지 않고, 각에 \(\theta\_{soft}\) 를 더한다.

로컬 0° 눈금은 노브와 함께 시계 방향으로 \(\theta*{soft}\) 만큼 이동한다. 소프트웨어 0 위에 있는 점은 로컬 좌표에서 \(-\theta*{soft}\) 이다. 따라서 소프트웨어 0 기준 각은 로컬 각에 \(\theta\_{soft}\) 를 **더한다**.

\[
\alpha*{fixed}=(\alpha*{raw}+\theta\_{soft})\bmod 360
\]

스위치 식은 벡터를 되돌리고 터치 식은 각을 더한다. 부호가 반대처럼 보여도 같은 규칙이다. 눈금이 시계 방향으로 밀렸으면, 그 지점의 로컬 각은 그만큼 작아져 있으므로 더해야 소프트웨어 0 이 된다.

\(\theta*{soft}=90^\circ\) 이고 소프트웨어 0 지점을 누르면 \(\alpha*{raw}=270^\circ\), \(\alpha\_{fixed}=0^\circ\) 이다.

원형 터치 IC 가 \(0\sim N\) 스텝을 주면 먼저 \(0\sim 360^\circ\) 로 스케일한 뒤 \(\theta*{soft}\) 를 더한다. 함수 인자 `encoderDeg` 에는 \(\theta*{sensor}\) 가 아니라 \(\theta\_{soft}\) 를 넣는다.

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
    send(pkt);   // CAN 또는 ESP-NOW. 모드 분기 없음
    prevSensor = sensor;
    prevTouched = touched;
}
```

`rotationSensitivity`, `maxRotationRange` 는 장비 프로필에만 있고, 컨트롤러 송신 값에는 곱하지 않는다. 화면 눈금·클릭음용 가상 디텐트만 프로필의 `stepCount` 를 참조한다.

---

## 장비가 선언하는 프로필

페어링 1 회에 장비가 컨트롤러로 보낸다. 이 패킷은 장비 컨트롤 맵의 자식이다. 컨트롤러는 NVS 에 저장하고 **UI 에만** 쓴다. 제어 분기의 입력이 아니다. 기능이 되는 행은 장비 문서의 「장비 컨트롤 맵」에 둔다.

```cpp
struct __attribute__((packed)) DeviceConfigPacket {
    uint16_t deviceID;
    char     deviceName[20];
    uint8_t  touchMode;          // UI 템플릿용. 1 4분할, 2 조이스틱, 3 스크롤, 4 PC 포인터
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
J*{right} = L\cdot\sin\alpha,\quad J*{up} = L\cdot\cos\alpha
\]

\(\alpha=0^\circ\) 이면 그 프레임의 위이고 \((J*{right}, J*{up})=(0, L)\) 이다. \(L\) 은 `touchLevel` 을 장비가 정규화한 값. 미접촉이면 영벡터.

### 모드 3 — 터치 스크롤 휠

수치 입력, 볼륨·디밍. 물리 노브 회전과 별개의 손가락 쓸기.

- 장비 연산: `touchDeg()` 가 고른 각의 연속 샘플만 사용. 터치 보정을 끄면 마크와 함께 도는 각의 차이이다.

\[
\Delta = \alpha*{fixed,now}-\alpha*{fixed,prev}
\]

\(\Delta>180\) 이면 \(\Delta-=360\), \(\Delta<-180\) 이면 \(\Delta+=360\) (0° 경계). 감도 `defaultSensitivity` 는 여기서 곱한다.

노브 자체의 `knobDeltaStep` 과 터치 \(\Delta\) 를 더하지 않는다. 두 입력은 독립 채널이다.

원형 스트립에는 평면 \(XY\) 가 없다. 모드 3 을 마우스 포인터로 바꾸지 않는다. 포인터가 필요하면 아래 시나리오처럼 장비 (PC) 가 같은 패킷을 조합한다.

### 터치 액션 시나리오

해석은 전부 장비 쪽이다. 컨트롤러는 제스처 이름을 붙이지 않는다. `touchCount` 는 터치 IC 의 접촉 수이고, `touchLevel` 로 손가락 수를 추정하지 않는다. IC 가 개수를 못 내면 `touchCount` 는 0 또는 1 만 두고, 두 손가락 스크롤은 켜지 않는다.

| 시나리오                | 보는 값                                          | 장비 해석                                                                                                             |
| :---------------------- | :----------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **탭**                  | `touchCount == 1`, 접촉이 짧고 \(\Delta\) 가 작다 | 모드 1 이면 그 방위의 버튼 한 번. \(315^\circ\sim45^\circ\) 상, \(45\sim135\) 우, \(135\sim225\) 하, \(225\sim315\) 좌 |
| **한 손가락 유지**      | `touchCount == 1`, 거의 고정                     | 모드 2 면 그 방향의 조이스틱. 크기는 `touchLevel`                                                                      |
| **한 손가락 링 드래그** | `touchCount == 1`, \(\Delta\) 가 이어짐           | 모드 3 이면 스크롤. PC 포인터 시나리오에서는 스크롤이 아니라 커서                                                      |
| **두 손가락 이상**      | `touchCount >= 2`, 대표각의 \(\Delta\)           | 스크롤. \(\Delta>180\) 이면 \(\Delta-=360\), \(\Delta<-180\) 이면 \(\Delta+=360\)                                       |
| **4 방 스위치**          | `buttons()`                                      | 모드 1 의 버튼, 또는 PC 에서 클릭. 보정은 `framePref` bit1. 좌·우 클릭 배정은 PC 드라이버가 정한다                      |
| **노브 회전**           | `knobAngleDeg`, `knobDeltaStep`                  | 터치와 합치지 않는 별도 축. PC 가 필요하면 휠로 재배정할 수 있으나 기본은 두 손가락이 휠                               |

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

유선은 **CAN**, 무선은 **ESP-NOW**. 핸드셰이크 순서는 같다.

```text
[Rotor ESP32-S3]                              [장비]
      │                                         │
      ├── 1. 연결 요청 ─────────────────────────▶│  CAN ID 또는 ESP-NOW 브로드캐스트
      │◀── 2. DeviceConfigPacket ───────────────┤  ID, touchMode, UI, 범위, 감도
      │                                         │
      │  NVS에 없으면 등록, 있으면 바인딩        │
      │                                         │
      ├── 3. ACK ──────────────────────────────▶│
      │                                         │
      │  θ_sensor 를 θ_pair 로 NVS 저장          │  노브 마크가 놓인 방향 = 소프트웨어 0
      │  (마크를 고정자와 맞추지 않음)            │
      │                                         │
      │  이후 ControllerOutputPacket 주기 송신   │  장비가 touchMode로 해석
```

### CAN

- 컨트롤러 마스터 ID 예: `0x01`. 장비 ID 예: `0x10`~.
- 클래식 CAN 페이로드는 8 바이트이므로 `DeviceConfigPacket` 은 멀티프레임으로 받고, 제어 패킷은 필드 우선순위로 분할한다. CAN FD(최대 64 바이트) 면 `ControllerOutputPacket` 한 프레임이 가능하다.
- 주기 송신은 장비 제어 주기에 맞춘다. 문서의 기본 루프는 10ms(100Hz) 를 상한으로 두고, 장비 프로필에 수신 주기를 적는다. (주기 필드가 필요해지면 `DeviceConfigPacket` 에 `reportPeriodMs` 를 추가한다. 현재는 컨트롤러 고정 100Hz.)

### ESP-NOW

- 장비 MAC 이 무선 식별자.
- 4 방 스위치의 지정 조합 (예: 상 + 하 3 초) 으로 페어링 모드. 브로드캐스트 `FF:FF:FF:FF:FF:FF` 후 **최초 응답 MAC**을 NVS 에 잠근다. 다음 부팅은 그 MAC 으로 바로 송신.
- 목표 지연은 10ms 미만. 연결 유지용 재페어링 핸드셰이크는 두지 않는다.

패킷이 끊기면 장비는 **자기 안전 상태**(출력 0, 직전 속도 유지 금지 등) 로 들어간다. 그 정책은 장비 책임이다. 컨트롤러는 링크 단절을 화면으로만 알린다.

---

## 기구 제약과 보완

### 틸트 축이 없는 이유와 대체

축은 베어링에 고정되어 기울지 않는다. 방향 입력은 다음으로 대체한다.

1. **상단 4 방 스위치.** 캡 가장자리를 누르면 판스프링·실리콘이 눌리며 `SW` 가 클릭된다. 방향은 `framePref` bit1 이 고른 마스크이다. 8 개 배치는 보류한다.
2. **`ICM-20948` 미세 피치·롤 (선택).** 패널·오링의 미세 변형·충격 가속도를 틸트 이벤트로 쓸 수 있다. 채택 시에도 결과는 스위치 마스크의 확장 비트가 아니라 **별도 원시 필드**로 보내고, 이벤트 의미는 장비가 정한다. 기본 패킷에는 넣지 않는다. 센서 융합이 확정되면 패킷 버전을 올린다.

### 비상 정지

비상 정지는 노브 안에 넣지 않는다. MCU 정지·ESP-NOW 단절과 무관하게 끊겨야 하므로 **별도 하우징의 적색 버섯 스위치**를 장비 전원 또는 액추에이터 릴레이에 **하드와이어 직렬**로 둔다. Rotor 패킷으로 비상 정지를 구현하지 않는다.

### 연산량

ESP32-S3 하드웨어 FPU 로 `sin` / `cos` / `atan2` 를 100Hz 루프에 둔다. 터치 보정은 덧셈과 나머지뿐이라 행렬보다 가볍다. 스위치는 접점이 동시에 눌릴 때만 행렬을 쓴다.

### 가상 디텐트

노브는 무한 회전이다. `stepCount` 만큼 화면 눈금과 클릭음을 낸다. 클릭은 조작 피드백일 뿐, `knobDeltaStep` 을 양자화해 패킷을 바꾸지 않는다. 양자화가 필요하면 장비가 한다.

---

## 확장

- 기구·컨트롤러 펌웨어는 한 벌. 장비 추가는 그 장비 문서의 「장비 컨트롤 맵」과 장비 측 `onControllerPacket` 으로 끝난다. `DeviceConfigPacket` 은 그 맵의 자식이고, 페어링 때 UI 템플릿·눈금만 싣는다.
- UI 템플릿 번호만 맞으면 화면 가이드를 장비별로 바꿀 수 있다. 템플릿이 제어 분기를 대신하지 않는다.
- 공장 장비, 가전, 로봇 중 CAN 또는 ESP32 를 가진 노드는 같은 출력 패킷을 구독할 수 있다.
