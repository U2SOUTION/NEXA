#include "sensors.h"
#include "config.h"
#include <math.h>

void Sensors::begin() {
  // OneWire / I2C / UART mmWave 는 핀 확정 후 연결
  climate_.matTempOk = false;
  climate_.climateOk = false;
  bed_.inMatCell = false;
}

float Sensors::dewPoint(float tC, float rh) {
  if (rh <= 0.1f) rh = 0.1f;
  if (rh > 100.0f) rh = 100.0f;
  // Magnus 근사
  const float a = 17.62f, b = 243.12f;
  float g = (a * tC) / (b + tC) + logf(rh / 100.0f);
  return (b * g) / (a - g);
}

void Sensors::readOnce() {
  // TODO: DallasTemperature, SHT/AHT, LD 계열 침대 모듈
  // 스캐폴드: 유효하지 않은 값 유지 → 제어는 matTempOk 가드
  climate_.dewPointC =
      climate_.climateOk ? dewPoint(climate_.airTempC, climate_.rhPct) : 0.0f;
}

void Sensors::service(unsigned long nowMs) {
  if (lastSampleMs_ == 0 || (nowMs - lastSampleMs_) >= SAMPLE_MS) {
    lastSampleMs_ = nowMs;
    readOnce();
    sampleDue_ = true;
  }
}
