#include "sleep_fsm.h"
#include "arm.h"

void SleepFsm::begin(ScheduleStore* sch, PresenceBed* bed, TempControl* temp,
                     Optocoupler* oc) {
  sch_ = sch;
  bed_ = bed;
  temp_ = temp;
  oc_ = oc;
  state_ = ST_IDLE;
  boilerOn_ = false;
}

void SleepFsm::setState(SleepState s) { state_ = s; }

void SleepFsm::startEntryPreheatLow() {
  if (!oc_ || !sch_ || !temp_) return;
  if (!g_arm.isArmed()) return;
  oc_->powerOn(zone_);
  boilerOn_ = true;
  float low = sch_->active().deepTargetC;
  temp_->setScheduleTargetC(low);
  temp_->clearHandOffset();
  setState(ST_IDLE);  // 예열 중·입면 전. 사람 오면 PRE_SLEEP
}

void SleepFsm::startPreheatFromSchedule() {
  if (!oc_ || !sch_ || !temp_) return;
  if (!g_arm.isArmed()) return;
  oc_->powerOn(zone_);
  boilerOn_ = true;
  float t = sch_->active().preheatTargetC;
  if (t <= 0.1f) t = sch_->active().onsetTargetC;
  temp_->setScheduleTargetC(t);
  temp_->clearHandOffset();
}

void SleepFsm::powerOffLong() {
  if (oc_ && g_arm.isArmed()) oc_->powerOff(zone_);
  boilerOn_ = false;
  temp_->clearHandOffset();
  setState(ST_IDLE);
  elapsedMin_ = 0;
}

void SleepFsm::onPersonEntered() {
  if (state_ == ST_IDLE || state_ == ST_PAUSED_ABSENCE) {
    if (state_ == ST_PAUSED_ABSENCE) {
      setState(beforePause_);
      bed_->onReturned();
    } else {
      setState(ST_PRE_SLEEP);
      bed_->resetOnset();
    }
  }
}

void SleepFsm::advanceSleep(unsigned long nowMs) {
  if (state_ == ST_PRE_SLEEP) {
    if (bed_->onsetReady()) {
      sleepStartMs_ = nowMs;
      elapsedMin_ = 0;
      bed_->resetOnset();
      setState(ST_INITIAL_SLEEP);
      temp_->clearHandOffset();
    }
    return;
  }

  if (state_ != ST_INITIAL_SLEEP && state_ != ST_DEEP_SLEEP &&
      state_ != ST_WAKE_UP_BOOST)
    return;

  elapsedMin_ = (unsigned)((nowMs - sleepStartMs_) / 60000UL);
  SleepState ph = sch_->phaseAtElapsed(elapsedMin_);
  if (ph == ST_IDLE) {
    powerOffLong();
    return;
  }
  setState(ph);
  temp_->setScheduleTargetC(sch_->targetAtElapsed(elapsedMin_));
}

void SleepFsm::service(unsigned long nowMs) {
  if (!bed_ || !sch_ || !temp_) return;

  if (bed_->inCell()) {
    if (state_ == ST_IDLE && boilerOn_) onPersonEntered();
    if (state_ == ST_PAUSED_ABSENCE) onPersonEntered();
  } else {
    if (state_ == ST_INITIAL_SLEEP || state_ == ST_DEEP_SLEEP ||
        state_ == ST_WAKE_UP_BOOST || state_ == ST_PRE_SLEEP) {
      beforePause_ = state_;
      setState(ST_PAUSED_ABSENCE);
      bed_->onLeftCell(nowMs);
    }
  }

  if (state_ == ST_PAUSED_ABSENCE && bed_->absentGraceExpired()) {
    powerOffLong();
  }

  advanceSleep(nowMs);
}
