#include "feature_map.h"

void FeatureMap::begin(ScheduleStore* sch, TempControl* temp, SleepFsm* fsm,
                       Optocoupler* oc, FeedbackOut* fb) {
  sch_ = sch;
  temp_ = temp;
  fsm_ = fsm;
  oc_ = oc;
  fb_ = fb;
}

void FeatureMap::onRingSelect(uint8_t ring1to8) {
  if (ring1to8 < 1 || ring1to8 > 4) {
    feat_ = FEAT_NONE;
    return;
  }
  feat_ = (RotorFeature)ring1to8;
  entryPicking_ = false;
  if (feat_ == FEAT_ZONE && fb_) {
    fb_->emit(FB_PROGRESS, (uint8_t)(zoneIdx_ - 1));
  }
}

void FeatureMap::onKnobDelta(int8_t steps) {
  if (steps == 0 || feat_ == FEAT_NONE) return;

  switch (feat_) {
    case FEAT_ENTRY:
      entryPicking_ = true;
      entryMinutes_ += (int)steps;  // 기본 1분/칸
      if (entryMinutes_ < 0) entryMinutes_ = 0;
      break;
    case FEAT_SCHEDULE:
      schedulePick_ += (int)steps;
      if (schedulePick_ < 1) schedulePick_ = 1;
      if (schedulePick_ > sch_->count()) schedulePick_ = sch_->count();
      break;
    case FEAT_ZONE: {
      int z = (int)zoneIdx_ + (int)steps;
      if (z < ZONE_ALL) {
        z = ZONE_ALL;
        if (fb_) fb_->emit(FB_LIMIT, 0);
      } else if (z > ZONE_INDEX_MAX) {
        z = ZONE_INDEX_MAX;
        if (fb_) fb_->emit(FB_LIMIT, (uint8_t)(ZONE_INDEX_MAX - 1));
      } else if (fb_) {
        fb_->emit(FB_PROGRESS, (uint8_t)(z - 1));
      }
      zoneIdx_ = (ControlZoneIndex)z;
      break;
    }
    case FEAT_TEMP:
      if (!fsm_->boilerOn()) {
        if (fb_) fb_->emit(FB_REJECT);
        break;
      }
      temp_->addHandOffsetHalfStep((int)steps, zoneIdx_);
      if (temp_->hitLimit()) {
        if (fb_) fb_->emit(FB_LIMIT);
      } else if (fb_) {
        fb_->emit(FB_ACCEPT);
      }
      break;
    default:
      break;
  }
}

void FeatureMap::onRingConfirm() {
  switch (feat_) {
    case FEAT_ENTRY:
      // 짧은 재누름: 분 확정(기록은 포털 연동 TODO). 노브 없으면 낮은 예열만.
      fsm_->startEntryPreheatLow();
      if (fb_) fb_->emit(FB_DONE);
      feat_ = FEAT_NONE;
      break;
    case FEAT_SCHEDULE:
      if (!sch_->select(schedulePick_)) {
        if (fb_) fb_->emit(FB_REJECT);
      } else {
        fsm_->startPreheatFromSchedule();
        temp_->clearHandOffset();
        if (fb_) fb_->emit(FB_DONE);
      }
      feat_ = FEAT_NONE;
      break;
    case FEAT_ZONE: {
      // 빠진 존 SW off 는 이전 인덱스와 비교 후 (무장 시)
      if (fb_) fb_->emit(FB_DONE);
      feat_ = FEAT_NONE;
      break;
    }
    case FEAT_TEMP:
      feat_ = FEAT_NONE;  // 120 s 닫힘은 상위에서
      break;
    default:
      break;
  }
}

void FeatureMap::onRingLongPress() {
  if (feat_ == FEAT_ENTRY || feat_ == FEAT_NONE) {
    fsm_->powerOffLong();
    if (fb_) fb_->emit(FB_DONE);
    feat_ = FEAT_NONE;
  }
}

void FeatureMap::onCenterTap(bool boilerOn) {
  if (!boilerOn) {
    if (fb_) fb_->emit(FB_REJECT);
    return;
  }
  feat_ = FEAT_TEMP;
  if (fb_) fb_->emit(FB_ACCEPT);
}
