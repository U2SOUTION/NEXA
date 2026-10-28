#include "feedback.h"

void FeedbackOut::emit(FeedbackPattern p, uint8_t sector) {
  Serial.printf("[fb] pattern=0x%02X sector=%u\n", (unsigned)p, (unsigned)sector);
}
