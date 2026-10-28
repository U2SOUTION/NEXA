/**
 * Smart water mat — foundation
 * Spec: 장비-스마트 온수 매트 해킹 제어.md
 *
 * 구현 순서: 존IO·펄스·무장 → 온도루프 → sleep FSM·침대 mmWave
 *           → ESP-NOW 기능맵 → MQTT poll/telemetry
 * 로터 FW 에 매트 분기 없음. PRESENCE ≠ 침대 재실.
 */

#include <Arduino.h>
#include "config.h"
#include "arm.h"
#include "optocoupler.h"
#include "pulse_scheduler.h"
#include "sensors.h"
#include "temp_control.h"
#include "schedule.h"
#include "presence_bed.h"
#include "sleep_fsm.h"
#include "feedback.h"
#include "feature_map.h"
#include "mqtt_portal.h"

static Optocoupler oc;
static PulseScheduler pulses;
static Sensors sensors;
static TempControl temp;
static ScheduleStore schedules;
static PresenceBed bed;
static SleepFsm fsm;
static FeedbackOut feedback;
static FeatureMap features;
static MqttPortal portal;

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.printf("[water-mat] foundation id=%s\n", MAT_DEVICE_ID);

  oc.begin();
  pulses.begin(&oc);
  sensors.begin();
  temp.begin();
  schedules.begin();
  bed.begin();
  fsm.begin(&schedules, &bed, &temp, &oc);
  features.begin(&schedules, &temp, &fsm, &oc, &feedback);
  portal.begin();

  // 개발: 로컬 무장. 현장은 포털 원격 무장 확인 후 g_arm.setArmed(true)
  g_arm.setArmed(false);

  if (!oc.pinsReady()) {
    Serial.println("[water-mat] WARN: ZONE_* GPIO 미배정 — config.h 실장 후 기입");
  }
}

void loop() {
  unsigned long now = millis();

  sensors.service(now);
  if (sensors.sampleDue()) {
    sensors.clearSampleDue();
    const ClimateSample& c = sensors.climate();
    temp.pushSample(c.matTempC, c.matTempOk);
    bed.update(sensors.bed(), now);
  }

  fsm.service(now);

  // 자동 펄스: PRE_SLEEP / PAUSED 제외. 데드타임은 PulseScheduler
  SleepState st = fsm.state();
  if (fsm.boilerOn() && st != ST_PRE_SLEEP && st != ST_PAUSED_ABSENCE &&
      st != ST_IDLE) {
    PulseDir d = temp.evaluateAuto(features.zoneIndex());
    if (d != PulseDir::None) pulses.requestStep(features.zoneIndex(), d);
  } else if (fsm.boilerOn() && st == ST_IDLE) {
    // 예열(입실/스케줄) 중 IDLE 에서도 목표 추종
    PulseDir d = temp.evaluateAuto(features.zoneIndex());
    if (d != PulseDir::None) pulses.requestStep(features.zoneIndex(), d);
  }

  pulses.service();

  bool deferMqtt = false;
  pulses.deferMqtt(&deferMqtt);
  portal.service(deferMqtt);
  portal.publishTelemetryStub(temp.averageOk() ? temp.averageC() : -127.0f,
                              (uint8_t)fsm.state(), fsm.elapsedMin());

  // ESP-NOW 수신 → features.onRing* 는 패킷 계층 붙일 때 연결
  delay(5);
}
