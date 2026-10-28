#pragma once
#include <Arduino.h>

// 무장 전에 포토커플러 구동 금지. 원격 무장은 포털 확인 후.

class ArmGate {
 public:
  void setArmed(bool on) { armed_ = on; }
  bool isArmed() const { return armed_; }

 private:
  bool armed_ = false;
};

extern ArmGate g_arm;
