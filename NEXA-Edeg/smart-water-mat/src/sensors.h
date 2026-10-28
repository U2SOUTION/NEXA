#pragma once
#include <Arduino.h>

// DS18B20 = 매트/라인. 공간 온습도 = 별도 I2C(품번·핀 실장 시).
// 침대 mmWave = 거리 칸·큰/작은 움직임. 로터 PRESENCE 와 분리.

struct BedRadarSample {
  bool inMatCell;       // 매트 칸 (복도 제외)
  bool largeMotion;
  bool smallMotion;
  bool sitting;         // 거친 앉음 추정
};

struct ClimateSample {
  float matTempC;       // DS18B20
  bool matTempOk;
  float airTempC;
  float rhPct;
  float dewPointC;
  bool climateOk;
};

class Sensors {
 public:
  void begin();
  void service(unsigned long nowMs);  // 10 s 주기 내부

  const ClimateSample& climate() const { return climate_; }
  const BedRadarSample& bed() const { return bed_; }
  bool sampleDue() const { return sampleDue_; }
  void clearSampleDue() { sampleDue_ = false; }

 private:
  void readOnce();
  float dewPoint(float tC, float rh);

  ClimateSample climate_{};
  BedRadarSample bed_{};
  unsigned long lastSampleMs_ = 0;
  bool sampleDue_ = false;
};
