#include "optocoupler.h"

void Optocoupler::begin() {
  const ZonePins* zs[] = { &ZONE_LEFT, &ZONE_RIGHT };
  for (auto* z : zs) {
    if (z->a >= 0) pinMode(z->a, OUTPUT), digitalWrite(z->a, HIGH);
    if (z->b >= 0) pinMode(z->b, OUTPUT), digitalWrite(z->b, HIGH);
    if (z->sw >= 0) pinMode(z->sw, OUTPUT), digitalWrite(z->sw, HIGH);
  }
}

bool Optocoupler::pinsReady() const {
  return ZONE_LEFT.a >= 0 && ZONE_LEFT.b >= 0 && ZONE_LEFT.sw >= 0 &&
         ZONE_RIGHT.a >= 0 && ZONE_RIGHT.b >= 0 && ZONE_RIGHT.sw >= 0;
}

void Optocoupler::drivePin(int pin, bool /*activeLowPull*/) {
  if (pin < 0) return;
  digitalWrite(pin, LOW);  // 풀업 기판: LOW 로 접점
}

void Optocoupler::releasePin(int pin) {
  if (pin < 0) return;
  digitalWrite(pin, HIGH);
}

bool Optocoupler::stepOne(const ZonePins& z, PulseDir dir) {
  if (!g_arm.isArmed()) return false;
  if (dir == PulseDir::None) return true;
  if (dir == PulseDir::Up) {
    drivePin(z.a, true);
    delay(PULSE_EDGE_MS);
    drivePin(z.b, true);
    delay(PULSE_EDGE_MS);
    releasePin(z.a);
    delay(PULSE_EDGE_MS);
    releasePin(z.b);
  } else {
    drivePin(z.b, true);
    delay(PULSE_EDGE_MS);
    drivePin(z.a, true);
    delay(PULSE_EDGE_MS);
    releasePin(z.b);
    delay(PULSE_EDGE_MS);
    releasePin(z.a);
  }
  return true;
}

bool Optocoupler::swPulse(const ZonePins& z, unsigned ms) {
  if (!g_arm.isArmed()) return false;
  if (z.sw < 0) return false;
  drivePin(z.sw, true);
  delay(ms);
  releasePin(z.sw);
  return true;
}

bool Optocoupler::encoderStep(ControlZoneIndex zone, PulseDir dir) {
  if (!g_arm.isArmed() || dir == PulseDir::None) return false;
  bool ok = true;
  if (zone == ZONE_ALL || zone == ZONE_L) {
    ok = stepOne(ZONE_LEFT, dir) && ok;
    if (zone == ZONE_ALL) delay(PULSE_GAP_MS);
  }
  if (zone == ZONE_ALL || zone == ZONE_R) {
    ok = stepOne(ZONE_RIGHT, dir) && ok;
  }
  return ok;
}

bool Optocoupler::powerOn(ControlZoneIndex zone) {
  bool ok = true;
  if (zone == ZONE_ALL || zone == ZONE_L) ok = swPulse(ZONE_LEFT, SW_ON_MS) && ok;
  if (zone == ZONE_ALL || zone == ZONE_R) ok = swPulse(ZONE_RIGHT, SW_ON_MS) && ok;
  return ok;
}

bool Optocoupler::powerOff(ControlZoneIndex zone) {
  bool ok = true;
  if (zone == ZONE_ALL || zone == ZONE_L) ok = swPulse(ZONE_LEFT, SW_OFF_MS) && ok;
  if (zone == ZONE_ALL || zone == ZONE_R) ok = swPulse(ZONE_RIGHT, SW_OFF_MS) && ok;
  return ok;
}
