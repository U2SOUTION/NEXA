#include "temp_control.h"
#include <math.h>

void TempControl::begin() {
  bufN_ = 0;
  bufI_ = 0;
  avgOk_ = false;
  handOffsetC_ = 0;
  hitLimit_ = false;
}

void TempControl::pushSample(float matTempC, bool ok) {
  if (!ok) return;
  buf_[bufI_] = matTempC;
  bufI_ = (bufI_ + 1) % AVG_SAMPLES;
  if (bufN_ < AVG_SAMPLES) bufN_++;
  float s = 0;
  for (int i = 0; i < bufN_; i++) s += buf_[i];
  avgC_ = s / (float)bufN_;
  avgOk_ = (bufN_ >= AVG_SAMPLES);  // 5분 채워진 뒤부터 자동 펄스 신뢰
}

float TempControl::execTargetC() const {
  float t = scheduleTargetC_ + handOffsetC_;
  if (t > TEMP_LIMIT_HI_C) t = TEMP_LIMIT_HI_C;
  if (t < TEMP_LIMIT_LO_C) t = TEMP_LIMIT_LO_C;
  return t;
}

void TempControl::addHandOffsetHalfStep(int signedSteps, ControlZoneIndex /*zone*/) {
  // zone 별 오프셋은 이후. 1차는 현재 존에 동일 필드.
  handOffsetC_ += HAND_STEP_C * (float)signedSteps;
  float raw = scheduleTargetC_ + handOffsetC_;
  hitLimit_ = false;
  if (raw > TEMP_LIMIT_HI_C) {
    handOffsetC_ = TEMP_LIMIT_HI_C - scheduleTargetC_;
    hitLimit_ = true;
  } else if (raw < TEMP_LIMIT_LO_C) {
    handOffsetC_ = TEMP_LIMIT_LO_C - scheduleTargetC_;
    hitLimit_ = true;
  }
}

void TempControl::clearHandOffset() { handOffsetC_ = 0; hitLimit_ = false; }

PulseDir TempControl::evaluateAuto(ControlZoneIndex /*zone*/) {
  if (!avgOk_) return PulseDir::None;
  float t = execTargetC();
  // 히스테리시스는 실측 전 없음 — 문서: 낮으면 올림, 충분히 높으면 내림
  if (avgC_ < t - 0.15f) return PulseDir::Up;
  if (avgC_ > t + 0.35f) return PulseDir::Down;
  return PulseDir::None;
}
