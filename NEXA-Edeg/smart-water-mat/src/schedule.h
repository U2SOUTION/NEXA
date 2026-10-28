#pragma once
#include "config.h"

// 수면 스케줄 한 벌. AI 보정 전 = 기준 곡선. 표 편집은 포털.

struct SleepSchedule {
  char name[24];
  unsigned totalMin;       // D
  float onsetTargetC;      // ~35.5
  float deepTargetC;       // ~32.5
  float wakeTargetC;       // ~37.0
  float preheatTargetC;    // 비우면 onset
  float onsetRatio;        // 0.15
  unsigned wakeBoostMin;   // 90
  bool valid;
};

class ScheduleStore {
 public:
  void begin();
  int count() const { return n_; }
  const SleepSchedule* get(int index1based) const;
  bool select(int index1based);  // 빈 인덱스 false
  int activeIndex() const { return active_; }
  const SleepSchedule& active() const { return slots_[active_ > 0 ? active_ - 1 : 0]; }

  float targetAtElapsed(unsigned elapsedMin) const;
  SleepState phaseAtElapsed(unsigned elapsedMin) const;

 private:
  static const int kMax = 8;
  SleepSchedule slots_[kMax]{};
  int n_ = 0;
  int active_ = 0;  // 0 = 미선택 → 기본 7.5h 곡선은 slots_[1] 표준
  void loadDefaults();
};
