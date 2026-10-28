#pragma once
#include <Arduino.h>

// FeedbackEvent 패턴. 로터가 LED/진동을 그림. 매트는 직접 LED 안 켬.
// 패킷 바이너리는 Rotor 문서 확정 후 채움.

enum FeedbackPattern : uint8_t {
  FB_ACCEPT = 0x01,
  FB_REJECT = 0x02,
  FB_LIMIT  = 0x03,
  FB_DONE   = 0x04,
  FB_FAULT  = 0x05,
  FB_PROGRESS = 0x06
};

class FeedbackOut {
 public:
  void emit(FeedbackPattern p, uint8_t sector = 0xFF);
  // TODO: ESP-NOW 로 FeedbackEvent 송신
};
