---
doc_id:
title: ""
category: ""
domain:
status: draft
created: 2026-10-27
updated: 2026-10-28
parent_doc:
implements_doc:
see_also: []
terms_standard: []
terms_nexa: []
---

# 코드 - 온풍 조준 — mmWave 추적 코드.md

## ✨ **HLK-LD2450 mmWave 레이더 기반 Local Tracking 및 위치 보정 핵심 알고리즘**

HLK-LD2450 레이더 모듈에서 UART 로 전달되는 $X, Y$ 좌표 데이터를 수신하여, **초기 스캐닝 파라미터 학습 (오토 캘리브레이션)** 및 **미세 구간 추적 (Local Tracking) 과 관성 보정**을 수행하는 ESP32 C++ 용 핵심 제어 코드.

### ✨ **열풍기·모터 구조 설명**

- **대상 장비**: 칸탈 코일·필름 하이브리드 난방기 (열풍기/난로). 덕트 출구의 온풍 방향을 사람 쪽으로 조준하는 것이 목적.
- **결합 구조**: HLK-LD2450 레이더와 열풍기 본체가 **강결합**되어 함께 회전. 모터 혼이 회전하면 **볼조인트를 축으로 열풍기가 원호 (arc) 를 그리며 회전**한다. 따라서 " 모터 각도 = 레이더 방향 = 열풍기 방향 " 이 성립하는 단일 자유도 회전 시스템이다.
- **모터**: 모터는 하나다. DC 로 정역과 가감속이 된다. 레이더가 내는 조준 오차의 부호로 CW/CCW 를 정한다.
- **추적 모드 (다섯)**: 보이는 사람은 `0 < y < 6000` mm 인 목표다. `|Δx|` 가 `CLUSTER_MIN_X` 이하면 한 덩어리 (클러스터) 로 보고 대표 x·y 만 남긴다. **Focus** 는 대표 타깃 하나만 계속 조준한다 (실제 1 명이든 붙은 여러 명이든 같다). **Scan** 은 정해진 호를 돌다가 사람이 멈춤 폭에 걸리면 머무름 시간만큼 선 뒤 같은 방향으로 이어서 돈다. **Centroid** 는 클러스터 대표 x 의 평균을 향한다. **Path** 는 사람이 아니라 Path 프리셋의 구동 펄스 (부호·시간) 목록을 순회하고, 점마다 머무름 시간은 그 프리셋이다. 인코더 없이 상대 각만 쓴다. **Manual** 은 레이더 조준을 쓰지 않고 직접 각만 움직인 뒤 그 각을 고정한다. 로터 조작은 컨트롤 맵 「추적」행이다. 로터 펌웨어에 분기는 없다.
- **가변 호 (arc) 크기**: 모터축에 연결된 혼과 열풍기 축의 연결 지점을 사용자가 가변적으로 조정할 수 있어, 회전 시 열풍기가 그리는 **호 (arc) 의 크기 (반경) 를 현장에서 조정** 가능하다. 호 반경 `arcRadiusMm` 은 학습 전 초기 `ms_per_mm_x` 만 정한다. 반경이 크면 같은 구동 시간에 x 가 더 많이 움직이므로 초기값은 반경에 반비례한다. 초기 탐색이 끝나면 `ms_per_mm_x` 는 측정값, 즉 구동 밀리초 ÷ 그 사이 움직인 x 로 바뀐다.
- **정지**: 제자리 원호에서는 사람까지 거리가 거의 변하지 않는다. 모터는 x 가 0 근처로 들어오면 멈춘다. 조준 정지는 X 다.
- **설계 의도**: 초기 탐색으로 기구를 맞춘 뒤, 움직일 때만 미세 조준. **사람 가까이 온풍 (효율)** 하되 **안전 바닥 안으로는 들어가지 않음** — 아래 「안전 안내」.

### ✨ **안전 안내 (문서 원칙 · 코드 미반영 유지)**

시험 전이라 **아래 C++ 본문은 이 안전을 위해 고치지 않는다.** 구현 시 히터·Path 기획을 따른다.

| 원칙 | 한 줄 |
| :--- | :--- |
| 조준 vs 안전 | 조준·정지는 **X**. 근접·급접근·컷은 **Y** (+ 접근 속도) |
| 컷 동작 | 열 **즉시 0** · 후풍 **강**(잔열 냉각, 온풍 부스트 아님) · 축 **hold** · 명령으로만 재개 |
| 효율 | 방보다 **사람 쪽**에 가깝게. 추종 거리 `D_track` ≥ 안전 바닥 `D_opt` |
| `D_brake` | 제동거리 = (레이더 확정 + 제어 + **액추에이터 정지/후퇴**)×접근속도. E-stop 과 무관 |
| `D_opt` | `D_brake` + 열·충돌 마진 |
| 단열 | 손실↓·표면 여유↑. 출구 온풍·충돌 가드를 대체하지 않음 |
| 다축 | 충돌 비중↑ → 조준 레이더 + **공간용 센서**, 스탠드오프. 사각을 메운다 |

상세: 히터 「출구 근접·효율·최적 거리」, Path 「온풍 근접·최적 거리·다축」.

### ✨ **필요 구성품**

| 구분     | 품목                                       | 요구 사항                                     |
| :------- | :----------------------------------------- | :-------------------------------------------- |
| 센서     | HLK-LD2450 mmWave 레이더                   | UART 256000 bps, X·Y 좌표 출력, 6 m 이내 유효 |
| 모터     | DC 모터 (정/역회전, 가감속 가능)           | 볼조인트 축 구동, 원호 회전                   |
| 드라이버 | H- 브리지 (L298N / BTS7960 / TB6612FNG 등) | 정/역 + PWM 가감속, 모터 정격 전류 이상       |
| MCU      | ESP32                                      | UART2 (RXD2/TXD2), PWM 출력, 3.3 V 로직       |
| 기구     | 볼조인트 + 모터 혼                         | 레이더·열풍기 강결합 마운트                   |
| 전원     | 모터용 전원 + MCU 전원                     | 모터 정격 전압, MCU 3.3 V                     |

## ✨ **온풍 조준 — mmWave 추적 코드 (기존·즉시 기동, 삭제 후보)**

`MOVE_THRESHOLD` 로 즉시 재기동한다. 적응 민감도 버전 검증 후 이 절을 삭제한다. **안전 가드·`D_brake`/`D_opt` 는 위 「안전 안내」만 보고, 시험 가능 전까지 이 절 코드는 수정하지 않는다.**

```C++
#include <Arduino.h> // Arduino 기본 라이브러리 (pinMode, millis 등)
// -------------------------------------------------------------------
// 핀 및 제어 파라미터 정의
// H브리지 두 입력에 PWM 을 건다. 한쪽만 켜고 다른 쪽은 0 이다.
// -------------------------------------------------------------------
#define RXD2 16
#define TXD2 17
#define MOTOR_CW_PIN 25
#define MOTOR_CCW_PIN 26
// x 는 센서 정면 기준 가로 위치(mm)다. 1 m 에서 150 mm 는 약 9 도다.
// 50 mm 대는 거리 칸보다 좁아 왕복하므로, 멈춤은 150 mm, 재시작은 300 mm 다.
const int DEAD_ZONE_X = 150;      // 정면 인정 폭(mm): 이 안이면 정지
const int MOVE_THRESHOLD = 300;   // 재시작 임계(mm): 이 밖에서만 추적 시작
const int SCAN_LEG_MS = 4000;
const int PWM_SCAN = 100;
const int PWM_SLOW = 90;
const int PWM_FAST = 180;
const float REF_ARC_MM = 150.0f;
const float REF_MS_PER_MM = 1.5f;
float arcRadiusMm = 150.0f;
float ms_per_mm_x = REF_MS_PER_MM;
enum SystemState {
  STATE_IDLE,
  STATE_INITIAL_SCAN,
  STATE_LOCAL_TRACKING,
  STATE_OVERSHOOT_CORRECT
};
SystemState currentState = STATE_INITIAL_SCAN;
const unsigned long SCAN_DWELL_MS = 8000;
const unsigned long DEFAULT_PATH_DWELL_MS = 8000;
const int CLUSTER_MIN_X = 300;   // |Δx| 이하면 한 덩어리
const int MANUAL_STEP_MS = 120;  // Manual 노브 한 칸의 구동 시간
const int PATH_MAX_POINTS = 8;
enum TrackMode {
  TRACK_FOCUS = 0,     // 대표 1타깃 집중
  TRACK_SCAN = 1,      // 호 스윕, 걸리면 머무름
  TRACK_CENTROID = 2,  // 클러스터 중심 평균
  TRACK_PATH = 3,      // 프리셋 경로 점 + 머무름
  TRACK_MANUAL = 4     // 직접 각 조절 후 고정
};
struct SeenTarget {
  int x;
  int y;
};
struct Cluster {
  int x;   // 멤버 x 평균
  int y;   // 멤버 중 최소 y(최근접)
  int n;
};
TrackMode trackMode = TRACK_FOCUS;
SeenTarget seen[3];
int seenCount = 0;
Cluster clusters[3];
int clusterCount = 0;
int focusX = 0;
bool focusLocked = false;
int scanDir = 1;                 // +1 CW, -1 CCW
bool scanDwelling = false;
unsigned long scanHoldUntil = 0;
bool scanMustLeave = false;      // 정지 직후 같은 띠 재트리거 방지
unsigned long sweepLegStart = 0;
int pathPulseMs[PATH_MAX_POINTS];  // 부호: +CW, -CCW, 크기=구동 ms
unsigned long pathDwellMs[PATH_MAX_POINTS];
int pathCount = 0;
int pathIndex = 0;
unsigned long pathHoldUntil = 0;
unsigned long pathPulseUntil = 0;
bool pathDwelling = false;
bool pathPulsing = false;
bool manualBusy = false;
unsigned long manualUntil = 0;
int manualSignedPwm = 0;
int prevSeenCount = 0;
int scanLeg = 0;
unsigned long scanLegStart = 0;
int scanXAtFirst = 0;
bool scanSaw = false;
int targetX = 0;
int targetY = 0;
bool targetDetected = false;
int overshootPhase = 0;
unsigned long overshootSettleUntil = 0;
unsigned long overshootPulseUntil = 0;
void stopMotor();
void driveToward(int signedPwm);
// 상위 비트 1 은 양수, 0 은 음수다. 크기는 하위 15 비트다. 2 의 보수가 아니다.
int16_t ld2450Axis(uint8_t lo, uint8_t hi) {
  uint16_t raw = (uint16_t)lo | ((uint16_t)hi << 8);
  if ((hi & 0x80) != 0) return (int16_t)(raw - 0x8000);
  if (raw == 0) return 0;
  return (int16_t)(-((int)raw));
}
void applyArcPrior() {
  float radius = arcRadiusMm;
  if (radius < 1.0f) radius = 1.0f;
  ms_per_mm_x = REF_MS_PER_MM * (REF_ARC_MM / radius);
}
// 클러스터 생성: seen[]을 x 오름차순 정렬 후 이웃 간 |Δx|<=CLUSTER_MIN_X면 한 덩어리로 묶음.
// 특이: 최대 3명, 클러스터 수는 1~3. 빈 입력 시 clusterCount=0.
void buildClusters() {
  clusterCount = 0;
  if (seenCount <= 0) return;
  int order[3];
  for (int i = 0; i < seenCount; i++) order[i] = i;
  for (int i = 0; i < seenCount - 1; i++) {
    for (int j = i + 1; j < seenCount; j++) {
      if (seen[order[j]].x < seen[order[i]].x) {
        int tmp = order[i];
        order[i] = order[j];
        order[j] = tmp;
      }
    }
  }
  long sumX = seen[order[0]].x;
  int bestY = seen[order[0]].y;
  int n = 1;
  int lastX = seen[order[0]].x;
  for (int k = 1; k < seenCount; k++) {
    int x = seen[order[k]].x;
    int y = seen[order[k]].y;
    if (abs(x - lastX) <= CLUSTER_MIN_X) {
      sumX += x;
      if (y < bestY) bestY = y;
      n++;
      lastX = x;
    } else {
      clusters[clusterCount].x = (int)(sumX / n);
      clusters[clusterCount].y = bestY;
      clusters[clusterCount].n = n;
      clusterCount++;
      sumX = x;
      bestY = y;
      n = 1;
      lastX = x;
    }
  }
  clusters[clusterCount].x = (int)(sumX / n);
  clusters[clusterCount].y = bestY;
  clusters[clusterCount].n = n;
  clusterCount++;
}
// 가장 가까운(최소 y) 클러스터 인덱스 반환. 없으면 -1.
int nearestClusterIndex() {
  if (clusterCount <= 0) return -1;
  int best = 0;
  for (int i = 1; i < clusterCount; i++) {
    if (clusters[i].y < clusters[best].y) best = i;
  }
  return best;
}
// Focus 모드 조준 오차: 잠금된 focusX에 가장 가까운 클러스터로 갱신. 인원 없으면 0.
// 특이: focusLocked가 false면 최근접 클러스터로 최초 잠금.
int focusErrorX() {
  if (clusterCount <= 0) {
    focusLocked = false;
    return 0;
  }
  if (!focusLocked) {
    int ni = nearestClusterIndex();
    focusX = clusters[ni].x;
    focusLocked = true;
  }
  int best = 0;
  int bestDist = abs(clusters[0].x - focusX);
  for (int i = 1; i < clusterCount; i++) {
    int d = abs(clusters[i].x - focusX);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  focusX = clusters[best].x;
  return focusX;
}
// Centroid 모드 조준 오차: 클러스터 x 평균. 인원 없으면 0.
int centroidErrorX() {
  if (clusterCount <= 0) return 0;
  long sum = 0;
  for (int i = 0; i < clusterCount; i++) sum += clusters[i].x;
  return (int)(sum / clusterCount);
}
// 모드별 조준 오차 통합 반환. MANUAL/PATH=0, SCAN=dwell 시 centroid, FOCUS=focus, CENTROID=centroid.
// 특이: Scan 스윕 중에는 0(모터는 serviceScan이 직접 구동).
int aimErrorX() {
  if (trackMode == TRACK_MANUAL || trackMode == TRACK_PATH) return 0;
  if (trackMode == TRACK_SCAN) {
    if (scanDwelling && clusterCount > 0) return centroidErrorX();
    return 0;
  }
  if (clusterCount <= 0) return 0;
  if (trackMode == TRACK_FOCUS) return focusErrorX();
  return centroidErrorX();
}
int nearestX() {
  if (seenCount <= 0) return 0;
  int bestX = seen[0].x;
  int bestY = seen[0].y;
  for (int i = 1; i < seenCount; i++) {
    if (seen[i].y < bestY) {
      bestY = seen[i].y;
      bestX = seen[i].x;
    }
  }
  return bestX;
}
// 모드 전환 시 런타임 상태 초기화. 모터 정지 포함.
void resetModeRuntime() {
  focusLocked = false;
  scanDwelling = false;
  scanHoldUntil = 0;
  scanMustLeave = false;
  sweepLegStart = 0;
  pathIndex = 0;
  pathHoldUntil = 0;
  pathPulseUntil = 0;
  pathDwelling = false;
  pathPulsing = false;
  manualBusy = false;
  stopMotor();
}
// 상위/로터가 모드를 넣을 때. 런타임 초기화 후 FOCUS/CENTROID는 즉시 추적 시도.
void setTrackMode(TrackMode mode) {
  trackMode = mode;
  resetModeRuntime();
  if (trackMode == TRACK_FOCUS || trackMode == TRACK_CENTROID) {
    if (targetDetected) {
      targetX = aimErrorX();
      if (currentState == STATE_IDLE && abs(targetX) > MOVE_THRESHOLD) {
        currentState = STATE_LOCAL_TRACKING;
      }
    }
  }
}
// 모드 대기 칸. 양수 +1, 음수 −1. Path·Manual 하위(프리셋·각)는 확정 뒤에 다른 함수가 맡는다.
int applyTrackModeKnob(int knobSteps) {
  if (knobSteps == 0) return 0;
  int dir = (knobSteps > 0) ? 1 : -1;
  int next = (int)trackMode + dir;
  if (next < (int)TRACK_FOCUS || next > (int)TRACK_MANUAL) return -1;
  setTrackMode((TrackMode)next);
  if (knobSteps > 1 || knobSteps < -1) return 2;
  return 1;
}
// Path 프리셋. pulseMs 는 부호 있는 구동 시간(ms). count 0 이면 비움. dwellMs null 이면 기본 머무름.
void setPathPreset(const int *pulseMs, const unsigned long *dwellMs, int count) {
  if (count < 0) count = 0;
  if (count > PATH_MAX_POINTS) count = PATH_MAX_POINTS;
  pathCount = count;
  for (int i = 0; i < pathCount; i++) {
    pathPulseMs[i] = pulseMs[i];
    pathDwellMs[i] = (dwellMs != 0) ? dwellMs[i] : DEFAULT_PATH_DWELL_MS;
  }
  pathIndex = 0;
  pathDwelling = false;
  pathPulsing = false;
  pathHoldUntil = 0;
  pathPulseUntil = 0;
}
// Manual: 양수 칸은 CW, 음수는 CCW. 한 칸마다 MANUAL_STEP_MS 동안 PWM_SLOW.
int applyManualKnob(int knobSteps) {
  if (trackMode != TRACK_MANUAL || knobSteps == 0) return 0;
  if (currentState == STATE_INITIAL_SCAN || currentState == STATE_OVERSHOOT_CORRECT) return 0;
  manualSignedPwm = (knobSteps > 0) ? PWM_SLOW : -PWM_SLOW;
  manualUntil = millis() + (unsigned long)MANUAL_STEP_MS * (unsigned long)abs(knobSteps);
  manualBusy = true;
  currentState = STATE_IDLE;
  return 1;
}
void serviceManual() {
  if (trackMode != TRACK_MANUAL) {
    manualBusy = false;
    return;
  }
  if (!manualBusy) {
    stopMotor();
    return;
  }
  if ((long)(millis() - manualUntil) >= 0) {
    stopMotor();
    manualBusy = false;
    return;
  }
  driveToward(manualSignedPwm);
}
// Scan: 호를 돌다 클러스터가 멈춤 폭에 들어오면 SCAN_DWELL_MS 만큼 선다.
// 정지 직후 같은 띠에 다시 걸리지 않게, 폭을 나간 뒤에만 다음 정지를 허용한다.
void serviceScan() {
  if (trackMode != TRACK_SCAN) {
    scanDwelling = false;
    return;
  }
  if (currentState == STATE_INITIAL_SCAN || currentState == STATE_OVERSHOOT_CORRECT) return;
  if (manualBusy) return;
  bool inBand = false;
  if (clusterCount > 0) {
    for (int i = 0; i < clusterCount; i++) {
      if (abs(clusters[i].x) <= DEAD_ZONE_X) {
        inBand = true;
        break;
      }
    }
  }
  if (scanDwelling) {
    stopMotor();
    if (!inBand) scanMustLeave = false;
    if ((long)(millis() - scanHoldUntil) >= 0) {
      scanDwelling = false;
      scanMustLeave = true;
    }
    return;
  }
  if (inBand && !scanMustLeave) {
    stopMotor();
    scanDwelling = true;
    scanHoldUntil = millis() + SCAN_DWELL_MS;
    currentState = STATE_IDLE;
    return;
  }
  if (!inBand) scanMustLeave = false;
  driveToward(scanDir * PWM_SCAN);
  currentState = STATE_IDLE;
  // 한 다리가 SCAN_LEG_MS 를 넘기면 방향을 뒤집는다(왕복 스윕).
  if (sweepLegStart == 0) sweepLegStart = millis();
  if (millis() - sweepLegStart >= (unsigned long)SCAN_LEG_MS) {
    scanDir = -scanDir;
    sweepLegStart = millis();
  }
}
void servicePath() {
  if (trackMode != TRACK_PATH || pathCount <= 0) {
    pathDwelling = false;
    pathPulsing = false;
    return;
  }
  if (currentState == STATE_INITIAL_SCAN || currentState == STATE_OVERSHOOT_CORRECT) return;
  currentState = STATE_IDLE;
  if (pathDwelling) {
    stopMotor();
    if ((long)(millis() - pathHoldUntil) < 0) return;
    pathDwelling = false;
    pathIndex++;
    if (pathIndex >= pathCount) pathIndex = 0;
    return;
  }
  if (!pathPulsing) {
    int pulse = pathPulseMs[pathIndex];
    if (pulse == 0) {
      pathDwelling = true;
      pathHoldUntil = millis() + pathDwellMs[pathIndex];
      stopMotor();
      return;
    }
    pathPulsing = true;
    pathPulseUntil = millis() + (unsigned long)abs(pulse);
    driveToward(pulse > 0 ? PWM_SLOW : -PWM_SLOW);
    return;
  }
  if ((long)(millis() - pathPulseUntil) < 0) {
    int pulse = pathPulseMs[pathIndex];
    driveToward(pulse > 0 ? PWM_SLOW : -PWM_SLOW);
    return;
  }
  stopMotor();
  pathPulsing = false;
  pathDwelling = true;
  pathHoldUntil = millis() + pathDwellMs[pathIndex];
}
void notePresence() {
  if (seenCount == 0) {
    focusLocked = false;
    if (prevSeenCount > 0 && currentState != STATE_INITIAL_SCAN) {
      if (trackMode == TRACK_FOCUS || trackMode == TRACK_CENTROID) {
        scanLeg = 0;
        scanSaw = false;
        currentState = STATE_INITIAL_SCAN;
      }
    }
  }
  prevSeenCount = seenCount;
}
void readRadarData() {
  // 헤더 4 + 목표 3 개×8 + 꼬리 2 = 30 바이트. 꼬리 55 CC 가 아니면 버린다.
  while (Serial2.available() >= 30) {
    if (Serial2.read() != 0xAA) continue;
    if (Serial2.read() != 0xFF) continue;
    if (Serial2.read() != 0x03) continue;
    if (Serial2.read() != 0x00) continue;
    uint8_t buffer[26];
    if (Serial2.readBytes(buffer, 26) != 26) return;
    if (buffer[24] != 0x55 || buffer[25] != 0xCC) continue;
    seenCount = 0;
    for (int i = 0; i < 3; i++) {
      int base = i * 8;
      int16_t x = ld2450Axis(buffer[base], buffer[base + 1]);
      int16_t y = ld2450Axis(buffer[base + 2], buffer[base + 3]);
      if (y <= 0 || y >= 6000) continue;
      seen[seenCount].x = x;
      seen[seenCount].y = y;
      seenCount++;
    }
    buildClusters();
    targetDetected = clusterCount > 0;
    if (currentState == STATE_INITIAL_SCAN) {
      targetX = nearestX();
    } else if (trackMode == TRACK_MANUAL || trackMode == TRACK_PATH) {
      targetX = 0;
    } else if (trackMode == TRACK_SCAN) {
      if (scanDwelling && targetDetected) targetX = aimErrorX();
      else targetX = 0;
    } else {
      targetX = aimErrorX();
    }
    if (targetDetected) {
      int ni = nearestClusterIndex();
      targetY = (ni >= 0) ? clusters[ni].y : seen[0].y;
    }
  }
}
void stopMotor() {
  ledcWrite(MOTOR_CW_PIN, 0);
  ledcWrite(MOTOR_CCW_PIN, 0);
}
// 양수 PWM 은 CW 다. 현장에서 CW 일 때 +x 가 줄어야 한다.
// 반대로 늘어나면 이 함수에 넣는 부호만 뒤집으면 된다. 핀 정의는 그대로 둔다.
void driveToward(int signedPwm) {
  if (signedPwm > 255) signedPwm = 255;
  if (signedPwm < -255) signedPwm = -255;
  if (signedPwm > 0) {
    ledcWrite(MOTOR_CCW_PIN, 0);
    ledcWrite(MOTOR_CW_PIN, signedPwm);
  } else if (signedPwm < 0) {
    ledcWrite(MOTOR_CW_PIN, 0);
    ledcWrite(MOTOR_CCW_PIN, -signedPwm);
  } else {
    stopMotor();
  }
}
int trackDuty(int absX) {
  int span = 800 - DEAD_ZONE_X;
  int x = absX;
  if (x < DEAD_ZONE_X) x = DEAD_ZONE_X;
  if (x > 800) x = 800;
  return PWM_SLOW + (PWM_FAST - PWM_SLOW) * (x - DEAD_ZONE_X) / span;
}
void enterOvershoot() {
  overshootPhase = 0;
  overshootSettleUntil = 0;
  overshootPulseUntil = 0;
  currentState = STATE_OVERSHOOT_CORRECT;
}
void processInitialScan() {
  // targetX 는 이 상태에서 가장 가까운 한 명의 x 다. 여러 명 평균으로 배우지 않는다.
  if (scanLeg == 0) {
    scanLeg = 1;
    scanLegStart = millis();
    scanSaw = false;
    driveToward(PWM_SCAN);
  }
  if (targetDetected && !scanSaw) {
    scanXAtFirst = targetX;
    scanSaw = true;
  }
  if (targetDetected && abs(targetX) <= DEAD_ZONE_X) {
    stopMotor();
    if (scanSaw) {
      int delta = abs(scanXAtFirst - targetX);
      unsigned long elapsed = millis() - scanLegStart;
      if (delta > DEAD_ZONE_X && elapsed > 0) {
        ms_per_mm_x = (float)elapsed / (float)delta;
      }
    }
    scanLeg = 0;
    scanSaw = false;
    enterOvershoot();
    return;
  }
  if (millis() - scanLegStart < SCAN_LEG_MS) return;
  if (scanLeg == 1) {
    scanLeg = 2;
    scanLegStart = millis();
    scanSaw = false;
    driveToward(-PWM_SCAN);
    return;
  }
  stopMotor();
  scanLeg = 0;
  scanSaw = false;
  currentState = STATE_IDLE;
}
void processLocalTracking() {
  // Scan·Path·Manual 은 service* 가 모터를 맡는다.
  if (trackMode == TRACK_SCAN || trackMode == TRACK_MANUAL || trackMode == TRACK_PATH) {
    stopMotor();
    currentState = STATE_IDLE;
    return;
  }
  if (!targetDetected) {
    stopMotor();
    currentState = STATE_IDLE;
    return;
  }
  if (abs(targetX) <= DEAD_ZONE_X) {
    stopMotor();
    enterOvershoot();
    return;
  }
  if (targetX > 0) driveToward(trackDuty(abs(targetX)));
  else driveToward(-trackDuty(abs(targetX)));
}
void processOvershootCorrection() {
  if (overshootPhase == 0) {
    if (overshootSettleUntil == 0) overshootSettleUntil = millis() + 100;
    if ((long)(millis() - overshootSettleUntil) < 0) return;
    overshootPhase = 1;
    if (!targetDetected || abs(targetX) <= DEAD_ZONE_X) {
      stopMotor();
      overshootPhase = 0;
      overshootSettleUntil = 0;
      currentState = STATE_IDLE;
      return;
    }
    int pulse = (int)(abs(targetX) * ms_per_mm_x);
    if (pulse < 50) pulse = 50;
    if (pulse > 200) pulse = 200;
    if (targetX > 0) driveToward(PWM_SLOW);
    else driveToward(-PWM_SLOW);
    overshootPulseUntil = millis() + (unsigned long)pulse;
    return;
  }
  if ((long)(millis() - overshootPulseUntil) >= 0) {
    stopMotor();
    overshootPhase = 0;
    overshootSettleUntil = 0;
    currentState = STATE_IDLE;
  }
}
void setup() {
  Serial.begin(115200);
  Serial2.begin(256000, SERIAL_8N1, RXD2, TXD2);
  Serial2.setTimeout(10);
  ledcAttach(MOTOR_CW_PIN, 20000, 8);
  ledcAttach(MOTOR_CCW_PIN, 20000, 8);
  applyArcPrior();
  // 예: CW 400ms → 머무름 → CCW 400ms → 머무름 → CW 800ms. 실측·프리셋으로 덮어쓴다.
  int demoPath[] = { 400, -400, 800 };
  setPathPreset(demoPath, 0, 3);
  stopMotor();
}
void loop() {
  readRadarData();
  notePresence();
  serviceManual();
  serviceScan();
  servicePath();
  switch (currentState) {
    case STATE_INITIAL_SCAN:
      processInitialScan();
      break;
    case STATE_IDLE:
      if (trackMode == TRACK_FOCUS || trackMode == TRACK_CENTROID) {
        if (targetDetected && abs(targetX) > MOVE_THRESHOLD) {
          currentState = STATE_LOCAL_TRACKING;
        }
      }
      break;
    case STATE_LOCAL_TRACKING:
      processLocalTracking();
      break;
    case STATE_OVERSHOOT_CORRECT:
      processOvershootCorrection();
      break;
  }
}
```

### ✨ **주요 알고리즘 메커니즘 요약**

- **오토 캘리브레이션 (Initial Scan):**
    호 반경으로 초기 `ms_per_mm_x` 를 둔 뒤, CW 로 한 번, 이어서 CCW 로 한 번 원호를 찾는다. 각 방향은 4 초를 넘기지 않는다. 학습 x 는 가장 가까운 한 명이다. 그 x 가 멈춤 폭 안에 들어오면 `ms_per_mm_x` 를 구동 밀리초 ÷ 움직인 x 로 바꾼다. 둘 다 못 찾으면 모터를 끈다. Focus·Centroid 에서 사람이 모두 사라지면 이 탐색을 다시 연다.
- **클러스터:**
    `|Δx| <= CLUSTER_MIN_X`(기본 300 mm) 이면 한 덩어리로 본다. 조준·Scan 걸림·Focus 잠금은 사람 슬롯이 아니라 클러스터 대표를 쓴다.
- **Focus:**
    대표 타깃 하나만 추종한다. 잠금은 최근접으로 시작하고, 이후에는 잠근 x 에 가장 가까운 클러스터를 따른다.
- **Scan:**
    정해진 호를 왕복 스윕한다. 클러스터가 멈춤 폭에 걸리면 `SCAN_DWELL_MS`(기본 8 초) 만큼 선다. 폭을 나간 뒤에만 다음 정지를 허용한다.
- **Centroid:**
    클러스터 대표 x 의 평균이 멈춤 폭 안이면 선다. 다시 도는 문턱은 300 mm, 멈춤은 150 mm 다.
- **Path:**
    프리셋 구동 펄스 (부호·ms) 목록을 순회한다. 각 펄스 뒤 `pathDwellMs` 만큼 머문다. `setPathPreset` 으로 넣는다. 인코더·사람 좌표 없이 상대 각만 쓴다.
- **Manual:**
    레이더로 각을 끌어가지 않는다. `applyManualKnob` 한 칸마다 짧게 정역한 뒤 그 각을 고정 (Hold) 한다.
- **관성 오버슛 보정 (Overshoot Correction):**
    Focus·Centroid·초기 탐색 정지 뒤에 100 ms 를 기다리고, 그때도 x 가 멈춤 폭 밖이면 같은 방향으로 50~200 ms 만 더 돌린다. `delay` 는 쓰지 않는다. 난방 안전 루프가 이 대기 중에도 돈다.
- **로터:**
    컨트롤 맵 「추적」과 같다. 노브 1~5 대기 후 1 번으로 모드 확정. Path 는 확정 뒤 노브로 Path 프리셋 선택·1 번 적용. Manual 은 확정 뒤 노브로 각. 1 번 길게 (또는 더블) 는 재탐색. API 는 `setTrackMode` / `applyTrackModeKnob` / `applyManualKnob` / `setPathPreset`.

---

## ✨ **온풍 조준 — mmWave 추적 코드 (적응 민감도 버전)**

아래는 기존 즉시 기동 (`MOVE_THRESHOLD`) 대신, **움직임 빈도 → 내부 민감도 → 관찰 시간 → 기동 후 X→0** 을 쓰는 별도 구현이다. Focus·Centroid 에만 적용한다. Scan·Path·Manual 은 같다. 검증 후 기존 코드를 이 버전으로 교체한다.

**설정**

| 변수명                | 역할                                                      | 기본 |
| :-------------------- | :-------------------------------------------------------- | :--- |
| `DEAD_ZONE_X`         | 기동 후 수렴·정지 폭 (mm)                                 | 150  |
| `ERROR_MIN_X`         | 이보다 큰 abs(x) 만 이탈로 누적 (mm)                      | 80   |
| `MOTION_DELTA_MIN`    | 빈도에 넣을 최소 abs(Δx) (mm)                             | 40   |
| `FREQUENCY_WINDOW_MS` | 빈도 집계 창 (ms)                                         | 8000 |
| `SENSITIVITY_MIN`     | 빈도 높을 때 민감도                                       | 0.15 |
| `SENSITIVITY_MAX`     | 빈도 낮을 때 민감도                                       | 1.0  |
| `CONFIRM_TIME_MIN_MS` | 민감도 최대 시 필요 관찰 (ms)                             | 800  |
| `CONFIRM_TIME_MAX_MS` | 민감도 최소 시 필요 관찰 (ms)                             | 3500 |
| `FRAME_GAP_RESET_MS`  | 레이더 프레임 공백이 이 값 이상이면 이탈 타이머 리셋 (ms) | 2000 |

**런타임:** `MOTION_FREQUENCY`, `SENSITIVITY_NOW`, `OUTSIDE_TIME_MS`, `CONFIRM_TIME_NEED_MS`, `HAD_TARGET_LAST`, `LAST_FRAME_MS`

근접·`D_brake`/`D_opt`·단열·다축 센서는 코드에 넣지 않는다 → 위 「안전 안내」.

```C++
#include <Arduino.h>
#define RXD2 16
#define TXD2 17
#define MOTOR_CW_PIN 25
#define MOTOR_CCW_PIN 26
// ---- 적응 민감도 설정 (모두 대문자·언더바) ----
int DEAD_ZONE_X = 150;
int ERROR_MIN_X = 80;
int MOTION_DELTA_MIN = 40;
unsigned long FREQUENCY_WINDOW_MS = 8000;
float SENSITIVITY_MIN = 0.15f;
float SENSITIVITY_MAX = 1.0f;
unsigned long CONFIRM_TIME_MIN_MS = 800;
unsigned long CONFIRM_TIME_MAX_MS = 3500;
unsigned long FRAME_GAP_RESET_MS = 2000;
const int SCAN_LEG_MS = 4000;
const int PWM_SCAN = 100;
const int PWM_SLOW = 90;
const int PWM_FAST = 180;
const float REF_ARC_MM = 150.0f;
const float REF_MS_PER_MM = 1.5f;
float arcRadiusMm = 150.0f;
float ms_per_mm_x = REF_MS_PER_MM;
enum SystemState {
  STATE_IDLE,
  STATE_INITIAL_SCAN,
  STATE_LOCAL_TRACKING,
  STATE_OVERSHOOT_CORRECT
};
SystemState currentState = STATE_INITIAL_SCAN;
const unsigned long SCAN_DWELL_MS = 8000;
const unsigned long DEFAULT_PATH_DWELL_MS = 8000;
const int CLUSTER_MIN_X = 300;
const int MANUAL_STEP_MS = 120;
const int PATH_MAX_POINTS = 8;
const int FREQ_SLOT_COUNT = 40;
enum TrackMode {
  TRACK_FOCUS = 0,
  TRACK_SCAN = 1,
  TRACK_CENTROID = 2,
  TRACK_PATH = 3,
  TRACK_MANUAL = 4
};
struct SeenTarget {
  int x;
  int y;
};
struct Cluster {
  int x;
  int y;
  int n;
};
TrackMode trackMode = TRACK_FOCUS;
SeenTarget seen[3];
int seenCount = 0;
Cluster clusters[3];
int clusterCount = 0;
int focusX = 0;
bool focusLocked = false;
int scanDir = 1;
bool scanDwelling = false;
unsigned long scanHoldUntil = 0;
bool scanMustLeave = false;
unsigned long sweepLegStart = 0;
int pathPulseMs[PATH_MAX_POINTS];
unsigned long pathDwellMs[PATH_MAX_POINTS];
int pathCount = 0;
int pathIndex = 0;
unsigned long pathHoldUntil = 0;
unsigned long pathPulseUntil = 0;
bool pathDwelling = false;
bool pathPulsing = false;
bool manualBusy = false;
unsigned long manualUntil = 0;
int manualSignedPwm = 0;
int prevSeenCount = 0;
int scanLeg = 0;
unsigned long scanLegStart = 0;
int scanXAtFirst = 0;
bool scanSaw = false;
int targetX = 0;
int targetY = 0;
bool targetDetected = false;
int overshootPhase = 0;
unsigned long overshootSettleUntil = 0;
unsigned long overshootPulseUntil = 0;
// 적응 민감도 런타임
float MOTION_FREQUENCY = 0.0f;
float SENSITIVITY_NOW = 1.0f;
unsigned long OUTSIDE_TIME_MS = 0;
unsigned long CONFIRM_TIME_NEED_MS = 800;
int prevMonitorX = 0;
bool prevMonitorValid = false;
unsigned long outsideSinceMs = 0;
bool outsideActive = false;
bool HAD_TARGET_LAST = false;
unsigned long LAST_FRAME_MS = 0;
uint8_t freqSlots[FREQ_SLOT_COUNT];
int freqSlotIndex = 0;
unsigned long freqSlotPeriodMs = 200;
unsigned long freqSlotLastMs = 0;
int freqSlotMotionAcc = 0;
int freqSlotSamples = 0;
void stopMotor();
void driveToward(int signedPwm);
void clearOutsideTimer() {
  outsideActive = false;
  outsideSinceMs = 0;
  OUTSIDE_TIME_MS = 0;
}
int16_t ld2450Axis(uint8_t lo, uint8_t hi) {
  uint16_t raw = (uint16_t)lo | ((uint16_t)hi << 8);
  if ((hi & 0x80) != 0) return (int16_t)(raw - 0x8000);
  if (raw == 0) return 0;
  return (int16_t)(-((int)raw));
}
void applyArcPrior() {
  float radius = arcRadiusMm;
  if (radius < 1.0f) radius = 1.0f;
  ms_per_mm_x = REF_MS_PER_MM * (REF_ARC_MM / radius);
}
void buildClusters() {
  clusterCount = 0;
  if (seenCount <= 0) return;
  int order[3];
  for (int i = 0; i < seenCount; i++) order[i] = i;
  for (int i = 0; i < seenCount - 1; i++) {
    for (int j = i + 1; j < seenCount; j++) {
      if (seen[order[j]].x < seen[order[i]].x) {
        int tmp = order[i];
        order[i] = order[j];
        order[j] = tmp;
      }
    }
  }
  long sumX = seen[order[0]].x;
  int bestY = seen[order[0]].y;
  int n = 1;
  int lastX = seen[order[0]].x;
  for (int k = 1; k < seenCount; k++) {
    int x = seen[order[k]].x;
    int y = seen[order[k]].y;
    if (abs(x - lastX) <= CLUSTER_MIN_X) {
      sumX += x;
      if (y < bestY) bestY = y;
      n++;
      lastX = x;
    } else {
      clusters[clusterCount].x = (int)(sumX / n);
      clusters[clusterCount].y = bestY;
      clusters[clusterCount].n = n;
      clusterCount++;
      sumX = x;
      bestY = y;
      n = 1;
      lastX = x;
    }
  }
  clusters[clusterCount].x = (int)(sumX / n);
  clusters[clusterCount].y = bestY;
  clusters[clusterCount].n = n;
  clusterCount++;
}
int nearestClusterIndex() {
  if (clusterCount <= 0) return -1;
  int best = 0;
  for (int i = 1; i < clusterCount; i++) {
    if (clusters[i].y < clusters[best].y) best = i;
  }
  return best;
}
int focusErrorX() {
  if (clusterCount <= 0) {
    focusLocked = false;
    return 0;
  }
  if (!focusLocked) {
    int ni = nearestClusterIndex();
    focusX = clusters[ni].x;
    focusLocked = true;
  }
  int best = 0;
  int bestDist = abs(clusters[0].x - focusX);
  for (int i = 1; i < clusterCount; i++) {
    int d = abs(clusters[i].x - focusX);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  focusX = clusters[best].x;
  return focusX;
}
int centroidErrorX() {
  if (clusterCount <= 0) return 0;
  long sum = 0;
  for (int i = 0; i < clusterCount; i++) sum += clusters[i].x;
  return (int)(sum / clusterCount);
}
int aimErrorX() {
  if (trackMode == TRACK_MANUAL || trackMode == TRACK_PATH) return 0;
  if (trackMode == TRACK_SCAN) {
    if (scanDwelling && clusterCount > 0) return centroidErrorX();
    return 0;
  }
  if (clusterCount <= 0) return 0;
  if (trackMode == TRACK_FOCUS) return focusErrorX();
  return centroidErrorX();
}
int nearestX() {
  if (seenCount <= 0) return 0;
  int bestX = seen[0].x;
  int bestY = seen[0].y;
  for (int i = 1; i < seenCount; i++) {
    if (seen[i].y < bestY) {
      bestY = seen[i].y;
      bestX = seen[i].x;
    }
  }
  return bestX;
}
void resetAdaptiveRuntime() {
  MOTION_FREQUENCY = 0.0f;
  SENSITIVITY_NOW = SENSITIVITY_MAX;
  CONFIRM_TIME_NEED_MS = CONFIRM_TIME_MIN_MS;
  prevMonitorValid = false;
  clearOutsideTimer();
  HAD_TARGET_LAST = false;
  LAST_FRAME_MS = millis();
  freqSlotIndex = 0;
  freqSlotMotionAcc = 0;
  freqSlotSamples = 0;
  freqSlotLastMs = millis();
  for (int i = 0; i < FREQ_SLOT_COUNT; i++) freqSlots[i] = 0;
  if (FREQUENCY_WINDOW_MS < (unsigned long)FREQ_SLOT_COUNT) {
    freqSlotPeriodMs = 1;
  } else {
    freqSlotPeriodMs = FREQUENCY_WINDOW_MS / (unsigned long)FREQ_SLOT_COUNT;
  }
}
// UART 공백이 FRAME_GAP_RESET_MS 이상이면 이탈 누적을 버린다. loop 와 프레임 수신 양쪽에서 호출.
void serviceAdaptiveFrameGap() {
  if (trackMode != TRACK_FOCUS && trackMode != TRACK_CENTROID) return;
  if (LAST_FRAME_MS == 0) return;
  unsigned long now = millis();
  if ((long)(now - LAST_FRAME_MS) >= (long)FRAME_GAP_RESET_MS) {
    clearOutsideTimer();
    prevMonitorValid = false;
  }
}
void refreshSensitivityFromFrequency() {
  // 빈도 높을수록 민감도 하락
  float a = MOTION_FREQUENCY;
  if (a < 0.0f) a = 0.0f;
  if (a > 1.0f) a = 1.0f;
  SENSITIVITY_NOW = SENSITIVITY_MAX + (SENSITIVITY_MIN - SENSITIVITY_MAX) * a;
  float span = SENSITIVITY_MAX - SENSITIVITY_MIN;
  float u = 0.0f;
  if (span > 0.0001f) {
    u = (SENSITIVITY_NOW - SENSITIVITY_MIN) / span;
  }
  if (u < 0.0f) u = 0.0f;
  if (u > 1.0f) u = 1.0f;
  // 민감도 높을수록 필요 관찰 시간 짧음
  CONFIRM_TIME_NEED_MS = CONFIRM_TIME_MAX_MS
      - (unsigned long)((float)(CONFIRM_TIME_MAX_MS - CONFIRM_TIME_MIN_MS) * u);
}
void commitFreqSlot(uint8_t moved) {
  freqSlots[freqSlotIndex] = moved;
  freqSlotIndex++;
  if (freqSlotIndex >= FREQ_SLOT_COUNT) freqSlotIndex = 0;
  int sum = 0;
  for (int i = 0; i < FREQ_SLOT_COUNT; i++) sum += freqSlots[i];
  MOTION_FREQUENCY = (float)sum / (float)FREQ_SLOT_COUNT;
  refreshSensitivityFromFrequency();
}
// Focus·Centroid: 항상 감시. 기동은 관찰 충족 후에만. 기동 중에도 빈도는 갱신.
// 재등장(없음→있음) 시 이탈 타이머 재시작. 프레임 공백은 serviceAdaptiveFrameGap.
void updateAdaptiveMonitor(int monitorX, bool haveTarget) {
  unsigned long now = millis();
  if (trackMode != TRACK_FOCUS && trackMode != TRACK_CENTROID) {
    clearOutsideTimer();
    HAD_TARGET_LAST = haveTarget;
    LAST_FRAME_MS = now;
    return;
  }
  // 수신 직 공백이면 먼저 리셋한 뒤 이번 프레임을 새 기준으로 둔다.
  if (LAST_FRAME_MS != 0
      && (long)(now - LAST_FRAME_MS) >= (long)FRAME_GAP_RESET_MS) {
    clearOutsideTimer();
    prevMonitorValid = false;
  }
  LAST_FRAME_MS = now;
  if (!haveTarget) {
    clearOutsideTimer();
    prevMonitorValid = false;
    HAD_TARGET_LAST = false;
    return;
  }
  // 없음 → 있음: stale OUTSIDE_TIME_MS 로 즉시 engage 되지 않게 관찰을 다시 시작한다.
  if (!HAD_TARGET_LAST) {
    clearOutsideTimer();
    outsideActive = false;
    outsideSinceMs = now;
    prevMonitorValid = false;
  }
  HAD_TARGET_LAST = true;
  int moved = 0;
  if (prevMonitorValid && abs(monitorX - prevMonitorX) > MOTION_DELTA_MIN) moved = 1;
  prevMonitorX = monitorX;
  prevMonitorValid = true;
  freqSlotMotionAcc += moved;
  freqSlotSamples++;
  if ((long)(now - freqSlotLastMs) >= (long)freqSlotPeriodMs) {
    uint8_t slotMoved = (freqSlotMotionAcc > 0) ? 1 : 0;
    commitFreqSlot(slotMoved);
    freqSlotMotionAcc = 0;
    freqSlotSamples = 0;
    freqSlotLastMs = now;
  }
  int absX = abs(monitorX);
  if (absX > ERROR_MIN_X) {
    if (!outsideActive) {
      outsideActive = true;
      outsideSinceMs = now;
    }
    OUTSIDE_TIME_MS = now - outsideSinceMs;
  } else {
    clearOutsideTimer();
  }
}
bool adaptiveEngageReady() {
  if (trackMode != TRACK_FOCUS && trackMode != TRACK_CENTROID) return false;
  if (!targetDetected) return false;
  if (currentState == STATE_LOCAL_TRACKING || currentState == STATE_OVERSHOOT_CORRECT) {
    return false;
  }
  if (currentState == STATE_INITIAL_SCAN) return false;
  return OUTSIDE_TIME_MS >= CONFIRM_TIME_NEED_MS && abs(targetX) > DEAD_ZONE_X;
}
void resetModeRuntime() {
  focusLocked = false;
  scanDwelling = false;
  scanHoldUntil = 0;
  scanMustLeave = false;
  sweepLegStart = 0;
  pathIndex = 0;
  pathHoldUntil = 0;
  pathPulseUntil = 0;
  pathDwelling = false;
  pathPulsing = false;
  manualBusy = false;
  resetAdaptiveRuntime();
  stopMotor();
}
void setTrackMode(TrackMode mode) {
  trackMode = mode;
  resetModeRuntime();
  if (trackMode == TRACK_FOCUS || trackMode == TRACK_CENTROID) {
    if (targetDetected) targetX = aimErrorX();
  }
}
int applyTrackModeKnob(int knobSteps) {
  if (knobSteps == 0) return 0;
  int dir = (knobSteps > 0) ? 1 : -1;
  int next = (int)trackMode + dir;
  if (next < (int)TRACK_FOCUS || next > (int)TRACK_MANUAL) return -1;
  setTrackMode((TrackMode)next);
  if (knobSteps > 1 || knobSteps < -1) return 2;
  return 1;
}
void setPathPreset(const int *pulseMs, const unsigned long *dwellMs, int count) {
  if (count < 0) count = 0;
  if (count > PATH_MAX_POINTS) count = PATH_MAX_POINTS;
  pathCount = count;
  for (int i = 0; i < pathCount; i++) {
    pathPulseMs[i] = pulseMs[i];
    pathDwellMs[i] = (dwellMs != 0) ? dwellMs[i] : DEFAULT_PATH_DWELL_MS;
  }
  pathIndex = 0;
  pathDwelling = false;
  pathPulsing = false;
  pathHoldUntil = 0;
  pathPulseUntil = 0;
}
int applyManualKnob(int knobSteps) {
  if (trackMode != TRACK_MANUAL || knobSteps == 0) return 0;
  if (currentState == STATE_INITIAL_SCAN || currentState == STATE_OVERSHOOT_CORRECT) return 0;
  manualSignedPwm = (knobSteps > 0) ? PWM_SLOW : -PWM_SLOW;
  manualUntil = millis() + (unsigned long)MANUAL_STEP_MS * (unsigned long)abs(knobSteps);
  manualBusy = true;
  currentState = STATE_IDLE;
  return 1;
}
void serviceManual() {
  if (trackMode != TRACK_MANUAL) {
    manualBusy = false;
    return;
  }
  if (!manualBusy) {
    stopMotor();
    return;
  }
  if ((long)(millis() - manualUntil) >= 0) {
    stopMotor();
    manualBusy = false;
    return;
  }
  driveToward(manualSignedPwm);
}
void serviceScan() {
  if (trackMode != TRACK_SCAN) {
    scanDwelling = false;
    return;
  }
  if (currentState == STATE_INITIAL_SCAN || currentState == STATE_OVERSHOOT_CORRECT) return;
  if (manualBusy) return;
  bool inBand = false;
  if (clusterCount > 0) {
    for (int i = 0; i < clusterCount; i++) {
      if (abs(clusters[i].x) <= DEAD_ZONE_X) {
        inBand = true;
        break;
      }
    }
  }
  if (scanDwelling) {
    stopMotor();
    if (!inBand) scanMustLeave = false;
    if ((long)(millis() - scanHoldUntil) >= 0) {
      scanDwelling = false;
      scanMustLeave = true;
    }
    return;
  }
  if (inBand && !scanMustLeave) {
    stopMotor();
    scanDwelling = true;
    scanHoldUntil = millis() + SCAN_DWELL_MS;
    currentState = STATE_IDLE;
    return;
  }
  if (!inBand) scanMustLeave = false;
  driveToward(scanDir * PWM_SCAN);
  currentState = STATE_IDLE;
  if (sweepLegStart == 0) sweepLegStart = millis();
  if (millis() - sweepLegStart >= (unsigned long)SCAN_LEG_MS) {
    scanDir = -scanDir;
    sweepLegStart = millis();
  }
}
void servicePath() {
  if (trackMode != TRACK_PATH || pathCount <= 0) {
    pathDwelling = false;
    pathPulsing = false;
    return;
  }
  if (currentState == STATE_INITIAL_SCAN || currentState == STATE_OVERSHOOT_CORRECT) return;
  currentState = STATE_IDLE;
  if (pathDwelling) {
    stopMotor();
    if ((long)(millis() - pathHoldUntil) < 0) return;
    pathDwelling = false;
    pathIndex++;
    if (pathIndex >= pathCount) pathIndex = 0;
    return;
  }
  if (!pathPulsing) {
    int pulse = pathPulseMs[pathIndex];
    if (pulse == 0) {
      pathDwelling = true;
      pathHoldUntil = millis() + pathDwellMs[pathIndex];
      stopMotor();
      return;
    }
    pathPulsing = true;
    pathPulseUntil = millis() + (unsigned long)abs(pulse);
    driveToward(pulse > 0 ? PWM_SLOW : -PWM_SLOW);
    return;
  }
  if ((long)(millis() - pathPulseUntil) < 0) {
    int pulse = pathPulseMs[pathIndex];
    driveToward(pulse > 0 ? PWM_SLOW : -PWM_SLOW);
    return;
  }
  stopMotor();
  pathPulsing = false;
  pathDwelling = true;
  pathHoldUntil = millis() + pathDwellMs[pathIndex];
}
void notePresence() {
  if (seenCount == 0) {
    focusLocked = false;
    if (prevSeenCount > 0 && currentState != STATE_INITIAL_SCAN) {
      if (trackMode == TRACK_FOCUS || trackMode == TRACK_CENTROID) {
        scanLeg = 0;
        scanSaw = false;
        currentState = STATE_INITIAL_SCAN;
      }
    }
  }
  prevSeenCount = seenCount;
}
// 로터 1 번 길게/더블에서 호출. 모드를 유지한 채 초기 탐색만 다시 연다.
void requestRescan() {
  if (currentState == STATE_INITIAL_SCAN) return;
  scanLeg = 0;
  scanSaw = false;
  resetAdaptiveRuntime();
  stopMotor();
  currentState = STATE_INITIAL_SCAN;
}
void readRadarData() {
  while (Serial2.available() >= 30) {
    if (Serial2.read() != 0xAA) continue;
    if (Serial2.read() != 0xFF) continue;
    if (Serial2.read() != 0x03) continue;
    if (Serial2.read() != 0x00) continue;
    uint8_t buffer[26];
    if (Serial2.readBytes(buffer, 26) != 26) return;
    if (buffer[24] != 0x55 || buffer[25] != 0xCC) continue;
    seenCount = 0;
    for (int i = 0; i < 3; i++) {
      int base = i * 8;
      int16_t x = ld2450Axis(buffer[base], buffer[base + 1]);
      int16_t y = ld2450Axis(buffer[base + 2], buffer[base + 3]);
      if (y <= 0 || y >= 6000) continue;
      seen[seenCount].x = x;
      seen[seenCount].y = y;
      seenCount++;
    }
    buildClusters();
    targetDetected = clusterCount > 0;
    if (currentState == STATE_INITIAL_SCAN) {
      targetX = nearestX();
    } else if (trackMode == TRACK_MANUAL || trackMode == TRACK_PATH) {
      targetX = 0;
    } else if (trackMode == TRACK_SCAN) {
      if (scanDwelling && targetDetected) targetX = aimErrorX();
      else targetX = 0;
    } else {
      targetX = aimErrorX();
    }
    if (targetDetected) {
      int ni = nearestClusterIndex();
      targetY = (ni >= 0) ? clusters[ni].y : seen[0].y;
    }
    if (trackMode == TRACK_FOCUS || trackMode == TRACK_CENTROID) {
      updateAdaptiveMonitor(targetX, targetDetected);
    }
  }
}
void stopMotor() {
  ledcWrite(MOTOR_CW_PIN, 0);
  ledcWrite(MOTOR_CCW_PIN, 0);
}
void driveToward(int signedPwm) {
  if (signedPwm > 255) signedPwm = 255;
  if (signedPwm < -255) signedPwm = -255;
  if (signedPwm > 0) {
    ledcWrite(MOTOR_CCW_PIN, 0);
    ledcWrite(MOTOR_CW_PIN, signedPwm);
  } else if (signedPwm < 0) {
    ledcWrite(MOTOR_CW_PIN, 0);
    ledcWrite(MOTOR_CCW_PIN, -signedPwm);
  } else {
    stopMotor();
  }
}
int trackDuty(int absX) {
  int span = 800 - DEAD_ZONE_X;
  if (span < 1) span = 1;
  int x = absX;
  if (x < DEAD_ZONE_X) x = DEAD_ZONE_X;
  if (x > 800) x = 800;
  return PWM_SLOW + (PWM_FAST - PWM_SLOW) * (x - DEAD_ZONE_X) / span;
}
void enterOvershoot() {
  overshootPhase = 0;
  overshootSettleUntil = 0;
  overshootPulseUntil = 0;
  currentState = STATE_OVERSHOOT_CORRECT;
}
void processInitialScan() {
  if (scanLeg == 0) {
    scanLeg = 1;
    scanLegStart = millis();
    scanSaw = false;
    driveToward(PWM_SCAN);
  }
  if (targetDetected && !scanSaw) {
    scanXAtFirst = targetX;
    scanSaw = true;
  }
  if (targetDetected && abs(targetX) <= DEAD_ZONE_X) {
    stopMotor();
    if (scanSaw) {
      int delta = abs(scanXAtFirst - targetX);
      unsigned long elapsed = millis() - scanLegStart;
      if (delta > DEAD_ZONE_X && elapsed > 0) {
        ms_per_mm_x = (float)elapsed / (float)delta;
      }
    }
    scanLeg = 0;
    scanSaw = false;
    resetAdaptiveRuntime();
    enterOvershoot();
    return;
  }
  if (millis() - scanLegStart < SCAN_LEG_MS) return;
  if (scanLeg == 1) {
    scanLeg = 2;
    scanLegStart = millis();
    scanSaw = false;
    driveToward(-PWM_SCAN);
    return;
  }
  stopMotor();
  scanLeg = 0;
  scanSaw = false;
  resetAdaptiveRuntime();
  currentState = STATE_IDLE;
}
void processLocalTracking() {
  if (trackMode == TRACK_SCAN || trackMode == TRACK_MANUAL || trackMode == TRACK_PATH) {
    stopMotor();
    currentState = STATE_IDLE;
    return;
  }
  if (!targetDetected) {
    stopMotor();
    currentState = STATE_IDLE;
    return;
  }
  // 기동 후에는 민감도와 무관하게 DEAD_ZONE_X(≈0) 까지 수렴
  if (abs(targetX) <= DEAD_ZONE_X) {
    stopMotor();
    outsideActive = false;
    OUTSIDE_TIME_MS = 0;
    enterOvershoot();
    return;
  }
  if (targetX > 0) driveToward(trackDuty(abs(targetX)));
  else driveToward(-trackDuty(abs(targetX)));
}
void processOvershootCorrection() {
  if (overshootPhase == 0) {
    if (overshootSettleUntil == 0) overshootSettleUntil = millis() + 100;
    if ((long)(millis() - overshootSettleUntil) < 0) return;
    overshootPhase = 1;
    if (!targetDetected || abs(targetX) <= DEAD_ZONE_X) {
      stopMotor();
      overshootPhase = 0;
      overshootSettleUntil = 0;
      currentState = STATE_IDLE;
      return;
    }
    int pulse = (int)(abs(targetX) * ms_per_mm_x);
    if (pulse < 50) pulse = 50;
    if (pulse > 200) pulse = 200;
    if (targetX > 0) driveToward(PWM_SLOW);
    else driveToward(-PWM_SLOW);
    overshootPulseUntil = millis() + (unsigned long)pulse;
    return;
  }
  if ((long)(millis() - overshootPulseUntil) >= 0) {
    stopMotor();
    overshootPhase = 0;
    overshootSettleUntil = 0;
    currentState = STATE_IDLE;
  }
}
void setup() {
  Serial.begin(115200);
  Serial2.begin(256000, SERIAL_8N1, RXD2, TXD2);
  Serial2.setTimeout(10);
  ledcAttach(MOTOR_CW_PIN, 20000, 8);
  ledcAttach(MOTOR_CCW_PIN, 20000, 8);
  applyArcPrior();
  resetAdaptiveRuntime();
  int demoPath[] = { 400, -400, 800 };
  setPathPreset(demoPath, 0, 3);
  stopMotor();
}
void loop() {
  readRadarData();
  serviceAdaptiveFrameGap();
  notePresence();
  serviceManual();
  serviceScan();
  servicePath();
  switch (currentState) {
    case STATE_INITIAL_SCAN:
      processInitialScan();
      break;
    case STATE_IDLE:
      // MOVE_THRESHOLD 즉시 기동 없음. 적응 관찰이 충족될 때만 Focus·Centroid 기동.
      if (adaptiveEngageReady()) {
        currentState = STATE_LOCAL_TRACKING;
      }
      break;
    case STATE_LOCAL_TRACKING:
      processLocalTracking();
      break;
    case STATE_OVERSHOOT_CORRECT:
      processOvershootCorrection();
      break;
  }
}
```

### ✨ **적응 민감도 버전 — 메커니즘 요약**

- **안전:** 이 코드 블록에 미포함. 「안전 안내」·히터·Path 문서.
- **항상 감시:** Focus·Centroid 는 `ERROR_MIN_X` 밖의 \|x\| 와 `MOTION_DELTA_MIN` 이상의 Δx 를 매 프레임 본다. 모터는 바로 안 돈다.
- **빈도 → 민감도:** `FREQUENCY_WINDOW_MS` 창의 `MOTION_FREQUENCY` 가 높을수록 `SENSITIVITY_NOW` 가 `SENSITIVITY_MIN` 쪽으로 내려간다 (잦은 소진폭 → 참고).
- **민감도 → 관찰 시간:** `SENSITIVITY_NOW` 가 높을수록 `CONFIRM_TIME_NEED_MS` 가 `CONFIRM_TIME_MIN_MS` 에 가깝다 (조용하면 작아도 기동하기 쉬움).
- **기동:** `OUTSIDE_TIME_MS >= CONFIRM_TIME_NEED_MS` 이고 아직 멈춤 폭 밖이면 `STATE_LOCAL_TRACKING` 으로 들어가 **DEAD_ZONE_X 까지 수렴**(X≈0).
- **stale 방지:** 타겟 없음→있음 이면 이탈 타이머 재시작 (`HAD_TARGET_LAST`). 프레임 공백이 `FRAME_GAP_RESET_MS`(기본 2 s) 이상이면 `serviceAdaptiveFrameGap` / 수신 시 이탈 누적 리셋.
- **Scan / Path / Manual:** 기존과 동일. `requestRescan()` 은 로터 재탐색용.
- **제거:** `MOVE_THRESHOLD` 즉시 재기동. 검증 후 위 기존 코드 절을 이 버전으로 바꾸면 된다.

## see_also

- Path 템플릿 (SVG·키프레임·온·풍·스킵·JSON→G 방언): [[기획-NEXA Path 템플릿 — SVG 키프레임·JSON·G방언]]

---

## 연구 과제 — 거리 (Y) 에 따른 목표 온도·블로어 오프셋

**근접 컷·`D_brake`/`D_opt`·단열은 「안전 안내」·히터 문서.** 아래는 **별건**(체감·풍량 Y 오프셋 연구) 이다. 조준·정지는 X. 보이는 사람 판별·초기 탐색 최근접 외에, 확정 목표·풍량 단을 Y 로 약하게 가감하는 규칙은 **실행에 넣지 않는다**.

### 가설

- 가까우면 취출·복사가 세다. 같은 체감 목표라도 공기 목표를 조금 낮추면 국소 과열을 줄일 수 있다.
- 멀면 닿는 온풍이 약하다. 공기 목표를 조금 올리거나, 그보다 안전하게 팬 단을 조금 올려 도달을 도울 수 있다.
- 팬 단을 Y 에 묶어 크게 흔들면 소음·`T_duct`·SSR 냉각·`COIL_MAX` 와 충돌하기 쉽다. 온도 오프셋보다 팬 가감은 더 좁게 둔다.

### 제안 범위 (실측 전 가정)

| 항목              | 방향                                              | 상한 가정       | 비고                                                                          |
| :---------------- | :------------------------------------------------ | :-------------- | :---------------------------------------------------------------------------- |
| 공기 목표 오프셋  | Y 작을수록 낮춤, 클수록 올림 (또는 올림은 최소화) | 대략 ±0.5~1 °C  | 「열 모델」 복사 보정 안의 가감으로 둔다. 체감 확정값을 직접 덮어쓰지 않는다  |
| 블로어 단 오프셋  | Y 클수록 단↑, 작을수록 단↓                        | 대략 ±1 단      | 브라우저·로터가 정한 단을 기준으로 가감. `T_duct` 강제 100 %·홀트가 우선      |
| 기준 거리         | 실측                                              | 미정            | 기준 Y 와 mm 당 °C·단 기울기는 설치 각도·취출에 맞춰 정한다                   |

### 지켜야 할 경계

- 안전 가드가 열을 0 으로 두면 Y 오프셋은 적용하지 않는다.
- 난방 본루프의 주인은 실내 공기 센서와 「열 모델」이다. Y 오프셋은 그 위에 얹는 국소 가감이다.
- Y 로 코일·필름 듀티를 직접 가산하지 않는다.
- Centroid·Focus 에서 클러스터마다 Y 가 다르면, 조준 대표 (Focus 잠금 또는 최근접 클러스터) 의 Y 만 쓴다. 규칙은 실측 전에 하나로 고정한다.
- Scan 머무름 중 가감만 허용할지, Path·Manual 에서는 끌지 않을지는 실측으로 정한다.
- 공기 하한·상한, 체감 상한·하한, `COIL_MAX_PCT`, 팬 최소 기동, SSR·`T_duct` 홀트는 이 오프셋보다 위다. 가감 결과가 경계를 넘으면 경계에 둔다.
- 레이더 Y 잡음·다중 경로에 대비해 짧은 이동평균 또는 히스테리시스를 둔 뒤에만 목표·단에 반영한다.

### 닫기 조건

1. 기준 거리와 °C/단 기울기를 현장 실측으로 확정한다.
2. 복사 보정과의 역할 분담 (중복·상쇄) 을 「열 모델」 문장으로 고정한다.
3. Focus·Centroid·Scan 각각에서 어느 클러스터의 Y 를 쓸지 한 줄로 적는다.
4. 텔레메트리에 체감 목표, 공기 목표, Y 오프셋, 기준 단, 팬 오프셋 단을 구분해 올린다.
5. 위가 끝나면 본문의 실행 규칙으로 옮기고, 이 절은 닫거나 「아직 실행으로 닫지 않은 것」으로 돌린다.

---

## 응용

이 알고리즘은 **벌을 쫓는 용도가 아닙니다.** LD2450 은 사람 (또는 사람 크기 물체) 용이라, 양봉카에서는 **작업자·침입자·작업 공간 조준**에 쓰는 편이 맞습니다.

## 어디에 잘 맞나 (우선순)

| 우선 | 프로젝트 위치                                 | 어떻게                                                                                                                          |
| :--- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| 1    | **칸탈·필름 하이브리드 난방 / ThermoFlux**    | 조준 + 안전은 히터·「안전 안내」. **Scan+ 적응 민감도** 주력, Focus 는 “한 사람만 데울 때”                                          |
| 2    | **레일캠 GRC · 말벌 레이저의 Person Lockout** | 비전과 별도로 **사람 유무·대략 방위**. 레이저 `FIRE_OK` 전에 “사람 쪽이면 금지”. Focus/Centroid 가 조준이 아니라 **인터록 입력** |
| 3    | **양봉카 작업면·열융착/타포린 작업**          | 작업자가 서는 쪽만 온풍·조명·흡기. Scan 또는 Path(작업 구간 왕복)                                                               |
| 4    | **하이브리드 챔버 / 내검 가습·온간**          | 조준보다 **재실 (사람 내검 중)** → 모드 유지·안전. 추적 모터 없이 `PRESENCE` 식 활용도 가능                                       |
| 5    | **리프팅·레일 이송**                          | Path = 저장 구간 순회, Manual = 눈으로 맞춰 통전/차단. 사람 추종 Focus 는 비추천 (안전)                                           |

## 모드별로 양봉카에 옮기면

| 모드            | 양봉카에서의 의미                                                                           |
| :-------------- | :------------------------------------------------------------------------------------------ |
| **Scan**        | 내검대·소문 전면·작업 통로를 천천히 훑다 사람 있으면 머무름 → 온풍/조명/경고 LED            |
| **Focus**       | 양봉가 한 명만 따라 온풍 (차 안·간이 작업실)                                                |
| **Centroid**    | Dual 작업자 있을 때 중간 방향                                                               |
| **Path**        | 레일·호 위의 고정 웨이포인트 (벌통 열·작업대 구간). GRC 순찰각과 개념 공유                  |
| **Manual**      | 로터로 각 고정 — 현장에서 가장 먼저 쓸 모드                                                 |
| **적응 민감도** | 내검 때 손·몸 미세 움직임이 잦음 → **참고했다가** 자리 옮기면 따라감. 양봉 현장에 특히 맞음 |

## 일부러 안 쓰는 곳

- **개별 꿀벌·말벌 추적** → 레일캠 OpenCV·레이저 문서 쪽. mmWave 해상도·목적 불일치
- **벌통 내부 군세** → 음향·진동·온도. 레이더 조준 알고리즘과 무관

## 실무적으로 추천하는 적용 순서

1. **난방/ThermoFlux + Scan/Manual**로 차·작업실에서 검증 (지금 문서 그대로)
2. 같은 펌웨어 뼈대를 **GRC “사람 잠금”**에 연결 (조준 모터 없이 클러스터·재실만)
3. 레일/호가 있는 장비에 **Path** 이식

정리하면, 양봉카에서는 **사람 쪽 온풍 조준 + (문서상) 근접·`D_brake`/`D_opt` 안전**이 첫 응용이고, 다음은 보안·레이저 회피, 레일 Path 순이 자연스럽다.
