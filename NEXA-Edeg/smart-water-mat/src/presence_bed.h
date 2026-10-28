#pragma once
#include "sensors.h"
#include "config.h"

// 침대 mmWave 만. 로터 PRESENCE / 자리비움 센서와 혼용하지 않음.

class PresenceBed {
 public:
  void begin();
  void update(const BedRadarSample& s, unsigned long nowMs);

  bool inCell() const { return inCell_; }
  bool onsetReady() const;   // PRE_SLEEP → 입면
  bool absentGraceExpired() const;
  void resetOnset();
  void onLeftCell(unsigned long nowMs);
  void onReturned();

 private:
  bool inCell_ = false;
  unsigned long stillSinceMs_ = 0;
  unsigned long leftSinceMs_ = 0;
  bool leftPending_ = false;
};
