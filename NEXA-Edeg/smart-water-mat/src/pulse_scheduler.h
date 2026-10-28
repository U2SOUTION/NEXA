#pragma once
#include "optocoupler.h"

// 한 칸씩. 데드타임 중 자동 펄스 금지. 펄스 중 MQTT 유예 플래그.

class PulseScheduler {
 public:
  void begin(Optocoupler* oc);
  void requestStep(ControlZoneIndex zone, PulseDir dir);  // 큐 1칸(덮어씀)
  void service();  // loop 에서 호출

  bool busy() const { return pulsing_; }
  bool inDeadtime() const;
  void deferMqtt(bool* deferOut) const;

 private:
  Optocoupler* oc_ = nullptr;
  ControlZoneIndex pendingZone_ = ZONE_ALL;
  PulseDir pending_ = PulseDir::None;
  bool pulsing_ = false;
  unsigned long lastPulseMs_ = 0;
};
