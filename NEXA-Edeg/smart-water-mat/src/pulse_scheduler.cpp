#include "pulse_scheduler.h"

void PulseScheduler::begin(Optocoupler* oc) { oc_ = oc; }

bool PulseScheduler::inDeadtime() const {
  if (lastPulseMs_ == 0) return false;
  return (millis() - lastPulseMs_) < DEADTIME_MS;
}

void PulseScheduler::deferMqtt(bool* deferOut) const {
  if (deferOut) *deferOut = pulsing_;
}

void PulseScheduler::requestStep(ControlZoneIndex zone, PulseDir dir) {
  if (dir == PulseDir::None) return;
  pendingZone_ = zone;
  pending_ = dir;
}

void PulseScheduler::service() {
  if (!oc_ || pulsing_) return;
  if (pending_ == PulseDir::None) return;
  if (inDeadtime()) return;  // 자동 경로; 수동 전원 SW 는 Optocoupler 직호출

  pulsing_ = true;
  PulseDir d = pending_;
  ControlZoneIndex z = pendingZone_;
  pending_ = PulseDir::None;

  oc_->encoderStep(z, d);
  lastPulseMs_ = millis();
  pulsing_ = false;
}
