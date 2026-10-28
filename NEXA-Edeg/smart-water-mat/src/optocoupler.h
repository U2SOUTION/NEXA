#pragma once
#include "config.h"
#include "arm.h"

// 보일러 엔코더 A·B·SW 를 포토커플러로 쇼트. 디스플레이 숫자는 읽지 않음.

enum class PulseDir : int8_t { Down = -1, None = 0, Up = 1 };

class Optocoupler {
 public:
  void begin();
  bool pinsReady() const;

  bool encoderStep(ControlZoneIndex zone, PulseDir dir);
  bool powerOn(ControlZoneIndex zone);
  bool powerOff(ControlZoneIndex zone);

 private:
  void drivePin(int pin, bool activeLowPull);
  void releasePin(int pin);
  bool stepOne(const ZonePins& z, PulseDir dir);
  bool swPulse(const ZonePins& z, unsigned ms);
};
