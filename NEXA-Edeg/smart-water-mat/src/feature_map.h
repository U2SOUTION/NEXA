#pragma once
#include "config.h"
#include "schedule.h"
#include "temp_control.h"
#include "sleep_fsm.h"
#include "optocoupler.h"
#include "feedback.h"

// 로터는 칸·노브만 보냄. 매트가 해석. 로터 FW 에 매트 분기 없음.
// 1 입실예약 2 수면스케줄 3 제어존 4 온도

enum RotorFeature : uint8_t {
  FEAT_NONE = 0,
  FEAT_ENTRY = 1,
  FEAT_SCHEDULE = 2,
  FEAT_ZONE = 3,
  FEAT_TEMP = 4
};

class FeatureMap {
 public:
  void begin(ScheduleStore* sch, TempControl* temp, SleepFsm* fsm,
             Optocoupler* oc, FeedbackOut* fb);

  void onRingSelect(uint8_t ring1to8);     // 기능 진입
  void onKnobDelta(int8_t steps);          // 확정 전/후 상세
  void onRingConfirm();                    // 같은 칸 재누름 = 확정
  void onRingLongPress();                  // 1번 긴 누름 = 끔
  void onCenterTap(bool boilerOn);         // 매트 슬롯 중앙 → 온도 진입

  RotorFeature active() const { return feat_; }
  ControlZoneIndex zoneIndex() const { return zoneIdx_; }

 private:
  ScheduleStore* sch_ = nullptr;
  TempControl* temp_ = nullptr;
  SleepFsm* fsm_ = nullptr;
  Optocoupler* oc_ = nullptr;
  FeedbackOut* fb_ = nullptr;

  RotorFeature feat_ = FEAT_NONE;
  int schedulePick_ = 2;
  ControlZoneIndex zoneIdx_ = ZONE_ALL;
  int entryMinutes_ = 0;
  bool entryPicking_ = false;
};
