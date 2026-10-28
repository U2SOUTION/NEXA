#include "mqtt_portal.h"

void MqttPortal::begin() {
  // Wi-Fi + TLS 클라이언트는 자격·브로커 확정 후
}

void MqttPortal::service(bool deferBecausePulse) {
  if (deferBecausePulse) return;
  unsigned long now = millis();
  // IDLE 15분 잠과 맞출 주기 — 스캐폴드는 60 s 폴 자리만
  if (lastPollMs_ == 0 || (now - lastPollMs_) > 60000UL) {
    lastPollMs_ = now;
    // TODO: nonce 요청 / 응답 검증 / 스케줄·목표 적용
  }
}

void MqttPortal::publishTelemetryStub(float avgC, uint8_t sleepState,
                                      unsigned elapsedMin) {
  unsigned long now = millis();
  if (lastTelemMs_ != 0 && (now - lastTelemMs_) < 30000UL) return;
  lastTelemMs_ = now;
  Serial.printf("[telem] avg=%.2f state=%u elapsed=%u\n", avgC,
                (unsigned)sleepState, elapsedMin);
}
