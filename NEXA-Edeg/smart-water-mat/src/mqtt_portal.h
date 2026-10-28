#pragma once
#include <Arduino.h>

// 명령 구독 상시 열지 않음. 물어보기(nonce) → 응답만.
// 펄스 중 요청 유예. 가열 명령 retain 금지. 설정(스케줄 표)만 retain 개념.

class MqttPortal {
 public:
  void begin();
  void service(bool deferBecausePulse);

  void publishTelemetryStub(float avgC, uint8_t sleepState, unsigned elapsedMin);

 private:
  unsigned long lastPollMs_ = 0;
  unsigned long lastTelemMs_ = 0;
};
