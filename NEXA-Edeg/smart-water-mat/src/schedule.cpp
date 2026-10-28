#include "schedule.h"
#include <string.h>

void ScheduleStore::loadDefaults() {
  n_ = 3;
  // 숏 6.0h
  strncpy(slots_[0].name, "short", sizeof(slots_[0].name));
  slots_[0].totalMin = 360;
  slots_[0].onsetTargetC = 35.5f;
  slots_[0].deepTargetC = 32.5f;
  slots_[0].wakeTargetC = 37.0f;
  slots_[0].preheatTargetC = 32.5f;
  slots_[0].onsetRatio = 0.15f;
  slots_[0].wakeBoostMin = 90;
  slots_[0].valid = true;
  // 표준 7.5h
  strncpy(slots_[1].name, "standard", sizeof(slots_[1].name));
  slots_[1] = slots_[0];
  strncpy(slots_[1].name, "standard", sizeof(slots_[1].name));
  slots_[1].totalMin = 450;
  // 롱 9.0h
  slots_[2] = slots_[1];
  strncpy(slots_[2].name, "long", sizeof(slots_[2].name));
  slots_[2].totalMin = 540;
  for (int i = 3; i < kMax; i++) slots_[i].valid = false;
  active_ = 2;  // 미선택 시 표준 인덱스(1-based 2) — 문서: 미선택 기본 7.5h
}

void ScheduleStore::begin() { loadDefaults(); }

const SleepSchedule* ScheduleStore::get(int index1based) const {
  if (index1based < 1 || index1based > n_) return nullptr;
  const SleepSchedule* s = &slots_[index1based - 1];
  return s->valid ? s : nullptr;
}

bool ScheduleStore::select(int index1based) {
  const SleepSchedule* s = get(index1based);
  if (!s) return false;
  active_ = index1based;
  return true;
}

float ScheduleStore::targetAtElapsed(unsigned elapsedMin) const {
  const SleepSchedule& s = active();
  unsigned D = s.totalMin;
  unsigned onsetEnd = (unsigned)(D * s.onsetRatio);
  unsigned wakeStart = (D > s.wakeBoostMin) ? (D - s.wakeBoostMin) : 0;
  if (elapsedMin < onsetEnd) return s.onsetTargetC;
  if (elapsedMin < wakeStart) return s.deepTargetC;
  if (elapsedMin < D) return s.wakeTargetC;
  return s.deepTargetC;
}

SleepState ScheduleStore::phaseAtElapsed(unsigned elapsedMin) const {
  const SleepSchedule& s = active();
  unsigned D = s.totalMin;
  unsigned onsetEnd = (unsigned)(D * s.onsetRatio);
  unsigned wakeStart = (D > s.wakeBoostMin) ? (D - s.wakeBoostMin) : 0;
  if (elapsedMin < onsetEnd) return ST_INITIAL_SLEEP;
  if (elapsedMin < wakeStart) return ST_DEEP_SLEEP;
  if (elapsedMin < D) return ST_WAKE_UP_BOOST;
  return ST_IDLE;
}
