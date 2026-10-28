#pragma once
#include "config.h"
#include "schedule.h"
#include "presence_bed.h"
#include "temp_control.h"
#include "optocoupler.h"

class SleepFsm {
 public:
  void begin(ScheduleStore* sch, PresenceBed* bed, TempControl* temp,
             Optocoupler* oc);
  void service(unsigned long nowMs);

  SleepState state() const { return state_; }
  unsigned elapsedMin() const { return elapsedMin_; }
  bool boilerOn() const { return boilerOn_; }

  // 로터/포털
  void startPreheatFromSchedule();  // 스케줄 확정
  void startEntryPreheatLow();      // 입실 예약 짧은 누름
  void powerOffLong();              // SW 3000 ms
  void onPersonEntered();           // → PRE_SLEEP

 private:
  void setState(SleepState s);
  void advanceSleep(unsigned long nowMs);

  ScheduleStore* sch_ = nullptr;
  PresenceBed* bed_ = nullptr;
  TempControl* temp_ = nullptr;
  Optocoupler* oc_ = nullptr;

  SleepState state_ = ST_IDLE;
  SleepState beforePause_ = ST_IDLE;
  bool boilerOn_ = false;
  unsigned long sleepStartMs_ = 0;
  unsigned elapsedMin_ = 0;
  ControlZoneIndex zone_ = ZONE_ALL;
};
