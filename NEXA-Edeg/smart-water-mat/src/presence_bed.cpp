#include "presence_bed.h"

void PresenceBed::begin() {
  inCell_ = false;
  stillSinceMs_ = 0;
  leftPending_ = false;
}

void PresenceBed::update(const BedRadarSample& s, unsigned long nowMs) {
  bool was = inCell_;
  inCell_ = s.inMatCell;

  if (inCell_ && !was) {
    leftPending_ = false;
    stillSinceMs_ = 0;
  }
  if (!inCell_ && was) onLeftCell(nowMs);

  if (inCell_) {
    if (s.largeMotion) {
      stillSinceMs_ = 0;
    } else if (s.smallMotion || !s.largeMotion) {
      // 큰 움직임 없이 유지 → 입면 후보
      if (stillSinceMs_ == 0) stillSinceMs_ = nowMs;
    }
  }
}

bool PresenceBed::onsetReady() const {
  if (!inCell_ || stillSinceMs_ == 0) return false;
  return (millis() - stillSinceMs_) >=
         (unsigned long)ONSET_STILL_MIN * 60UL * 1000UL;
}

void PresenceBed::resetOnset() { stillSinceMs_ = 0; }

void PresenceBed::onLeftCell(unsigned long nowMs) {
  leftPending_ = true;
  leftSinceMs_ = nowMs;
}

void PresenceBed::onReturned() { leftPending_ = false; }

bool PresenceBed::absentGraceExpired() const {
  if (!leftPending_) return false;
  return (millis() - leftSinceMs_) >=
         (unsigned long)ABSENCE_GRACE_MIN * 60UL * 1000UL;
}
