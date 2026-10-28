#pragma once
#include "config.h"
#include "pulse_scheduler.h"
#include "sensors.h"

class TempControl {
 public:
  void begin();
  void pushSample(float matTempC, bool ok);
  float averageC() const { return avgOk_ ? avgC_ : NAN; }
  bool averageOk() const { return avgOk_; }

  void setScheduleTargetC(float c) { scheduleTargetC_ = c; }
  void addHandOffsetHalfStep(int signedSteps, ControlZoneIndex zone);
  void clearHandOffset();
  float handOffsetC() const { return handOffsetC_; }
  float execTargetC() const;

  // 자동 ±1칸 요청. PRE_SLEEP / PAUSED 에서는 호출측에서 스킵.
  PulseDir evaluateAuto(ControlZoneIndex zone);

  bool hitLimit() const { return hitLimit_; }

 private:
  float buf_[AVG_SAMPLES]{};
  int bufN_ = 0;
  int bufI_ = 0;
  float avgC_ = 0;
  bool avgOk_ = false;
  float scheduleTargetC_ = 32.5f;
  float handOffsetC_ = 0;
  bool hitLimit_ = false;
};
