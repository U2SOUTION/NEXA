#pragma once
// 핀·상수는 실장 때 확정. 문서: 장비-스마트 온수 매트 해킹 제어.md
//
// ---- 필요 GPIO 수 (필수만, -1 = 미배정) ----
//   포토커플러 좌·우 A·B·SW     6
//   DS18B20 DATA                1
//   공간 온습도 I2C SDA/SCL     2
//   침대 mmWave UART            1~2  (수신만이면 RX 1)
//   합계                        약 10~11
//   (+ LED·부저 등 옵션 시 증가)
// ESP-NOW+Wi-Fi 는 라디오만 사용 (GPIO 거의 불필요).
// 보드: ESP32-C3 미니(LOLIN C3 Mini / DevKitM 등)로 진행 가능.
//       실사용 GPIO ~10개대라 필수로 거의 참. 여유 없으면 매트 로컬 LED
//       생략 — 조작·상태는 로터 FeedbackEvent + 브라우저(포털)로 충분.
//       (문서: 매트는 LED 직접 켜지 않음, 로터가 그림)

#ifndef MAT_DEVICE_ID
#define MAT_DEVICE_ID "water-mat-01"
#endif

// ---- 존 / 포토커플러 (PC817 ×6). -1 = 미배정 ----
struct ZonePins {
  int a;
  int b;
  int sw;
};

// 왼쪽 A·B·SW, 오른쪽 A·B·SW — GPIO 는 실장 시 기입
static const ZonePins ZONE_LEFT  = { -1, -1, -1 };
static const ZonePins ZONE_RIGHT = { -1, -1, -1 };

// ---- 펄스 (문서: ~5 ms, 칸 사이 ~50 ms, SW 켬 200 / 끔 3000) ----
static const unsigned PULSE_EDGE_MS   = 5;
static const unsigned PULSE_GAP_MS    = 50;
static const unsigned SW_ON_MS        = 200;
static const unsigned SW_OFF_MS       = 3000;
static const unsigned DEADTIME_MS     = 15UL * 60UL * 1000UL;  // 15~20분 → 1차 15분

// ---- 온도 샘플 ----
static const unsigned SAMPLE_MS       = 10000;
static const int      AVG_SAMPLES     = 30;   // 5분
static const float    HAND_STEP_C     = 0.5f;
static const float    TEMP_LIMIT_HI_C = 37.0f;
static const float    TEMP_LIMIT_LO_C = 32.5f;

// ---- 수면 / 재실 (침대 mmWave 전용. 로터 PRESENCE ≠ 재실) ----
static const unsigned ONSET_STILL_MIN = 10;
static const unsigned ABSENCE_GRACE_MIN = 15;
static const unsigned IDLE_SLEEP_MIN  = 15;
static const unsigned PREHEAT_REPLY_MIN = 10;

// ---- 건조 가온 ----
static const float DEW_MARGIN_C     = 2.0f;
static const float DRY_TARGET_MAX_C = 30.0f;
static const unsigned DRY_HOLD_MIN  = 30;
static const unsigned DRY_MAX_MIN   = 90;

// ---- 제어 존 인덱스: 1 전체, 2 왼쪽, 3 오른쪽 ----
enum ControlZoneIndex : int {
  ZONE_ALL   = 1,
  ZONE_L     = 2,
  ZONE_R     = 3,
  ZONE_INDEX_MAX = 3
};

enum SleepState : uint8_t {
  ST_IDLE = 0,
  ST_PRE_SLEEP,
  ST_INITIAL_SLEEP,
  ST_DEEP_SLEEP,
  ST_WAKE_UP_BOOST,
  ST_PAUSED_ABSENCE
};
