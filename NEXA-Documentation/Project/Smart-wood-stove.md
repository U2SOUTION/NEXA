# 🔥 공중부양 스마트 화목난로 프로젝트

**혁신적인 천장 고정식 화목난로 + IoT 자동화 + AI 학습 시스템**

---

## 📋 프로젝트 개요

### 핵심 컨셉
- **천장 고정식 공중부양 난로**: 바닥 공간 활용 극대화
- **센서 기반 자동 제어**: ESP32 기반 실시간 모니터링 및 제어
- **AI 학습형 시스템**: 사용할수록 똑똑해지는 지능형 난로

### 주요 특징
- ✅ 천장에서 연통으로 화실 지지 (바닥 공간 확보)
- ✅ LPG 가스통 재활용 화실 (경량화)
- ✅ 외부 단열재 적용 (연소 효율 향상)
- ✅ 배기팬 + 공기팬 자동 제어
- ✅ 실내 환경 자동 관리 (온도, 습도, 공기질)
- ✅ 장작 추가 타이밍 예측
- ✅ 데이터 기반 학습 및 최적화

---

# 1단계: 공중부양 난로와 안전 환경 구성

## 1.1 구조 설계

### 1.1.1 화실 제작 (LPG 가스통 활용)

**재료:**
- 소형 LPG 가스통 (10-15kg 용)
  - 직경: 약 25-30cm
  - 높이: 약 40-50cm
  - 무게: 5-10kg

**가공 작업:**
```
[상단] 연통 연결부 (용접)
   ↓
[화실 본체] (LPG 통)
   ├─ 전면: 투입구 개방 (15cm × 20cm)
   ├─ 하단: 1차 공기 유입구 (Ø5cm)
   └─ 측면: 공기팬 연결구
   ↓
[하단] 재받이 트레이 (탈착식)
```

**주의사항:**
- ⚠️ 용접 작업은 반드시 전문가에게 의뢰
- ⚠️ 가스통 내부 완전 세척 필수
- ⚠️ 기밀성 확보 (연기 누출 방지)

---

### 1.1.2 천장 고정 시스템

**하중 계산:**
```
총 무게 = 화실(10kg) + 장작(5kg) + 연통(15kg) = 30kg
안전계수 3배 적용 → 천장 지지력 90kg 이상 필요
```

**구조:**
```
[천장 구조체 (서까래/철골)]
        ↓
[보강 철판 40×40cm × 5mm] ← 하중 분산
        ↓
[관통부 내화 처리]
        ↓
[이중벽 단열 연통 (Ø15cm)]
        ↓
[연통 고정 클램프]
        ↓
[화실 상단 용접 연결]
        ↓
[화실 본체] ← 공중 부양
        ↓
[보조 지지 케이블 × 3-4개] ← 안정성 확보
```

**천장 관통부 상세:**
```
              [천장재]
                 ↓
    ┌────────────────────────┐
    │ 규산칼슘 보드 40×40cm  │ ← 1차 내화
    │       (12mm)           │
    ├────────────────────────┤
    │   공기층 (5cm 이상)    │ ← 2차 냉각
    │  ┌──────────────┐      │
    │  │ 이중벽 연통   │      │ ← 3차 단열
    │  │ (단열재 5cm)  │      │
    │  └──────────────┘      │
    ├────────────────────────┤
    │ 스테인리스 차열판      │ ← 4차 보호
    └────────────────────────┘
```

---

### 1.1.3 연통 시스템

**구성:**
- **천장 관통부 (50cm)**: 이중벽 단열 연통 필수
- **실내 노출부 (1.3m)**: 일반 연통 또는 이중벽
- **분기 센서부 (30cm)**: 연기 센서 장착용

**연통 온도 관리:**
```
위치별 예상 온도:
├─ 화실 연결부: 350-450℃
├─ 실내 중간부: 200-300℃
├─ 천장 관통부: 150-250℃ (단열 처리 시)
└─ 외부 배출구: 100-150℃
```

**드래프트 확보:**
- 총 높이: 최소 2.5m 이상
- 수평 구간: 최소화 (드래프트 약화 방지)
- 굴곡: 최대 1-2개소
- 배기팬: 강제 드래프트 보조

---

## 1.2 안전 시스템 구축

### 1.2.1 화재 예방 설계

**천장 보호:**
```
[필수 조치]
1. 규산칼슘 보드 또는 시멘트 보드
   - 크기: 최소 40cm × 40cm
   - 두께: 12mm 이상
   
2. 공기층 확보
   - 연통과 천장재 사이: 5cm 이상
   - 열 분산 및 냉각 효과
   
3. 이중벽 단열 연통
   - 천장 관통부 전용
   - 외부 표면 온도: 50-80℃ (안전)
   
4. 온도 모니터링
   - 천장 접촉부 온도 센서 설치
   - 위험 온도 알람: 60℃ 이상
```

**크레오소트 관리:**
```
[발생 원인]
- 낮은 연소 온도 (<200℃)
- 습한 장작 (함수율 >20%)
- 불완전 연소
- 공기 부족

[예방 대책]
1. 외부 단열로 화실 온도 유지
2. 연통 온도 모니터링 (150-250℃ 유지)
3. 월 1회 연통 청소
4. 완전 건조 장작 사용
```

---

### 1.2.2 환기 및 공기질 관리

**배기 시스템:**
```
[연통 배기팬]
위치: 연통 상단 (실외)
용량: 100-200 CMH
용도:
  - 착화 시 연기 배출
  - 장작 추가 시 역류 방지
  - 드래프트 보조
```

**실내 환기:**
```
[자동 창문 개폐 시스템]
- 스텝 모터 기반
- 개방도: 0-15cm 조절
- 트리거:
  ├─ 실내 온도 >24℃
  ├─ 실내 습도 >65%
  ├─ CO 농도 >50ppm
  └─ PM2.5 >50㎍/m³
```

---

### 1.2.3 비상 대응 시스템

**다층 안전망:**
```
[Level 1: 센서 모니터링]
- 온도, 연기, 공기질 실시간 감시
- 이상 감지 시 자동 알림

[Level 2: 자동 대응]
- 과열: 공기 차단, 배기 강화
- 역류: 배기팬 최대, 창문 개방
- CO 누출: 모든 팬 OFF, 창문 전체 개방

[Level 3: 사용자 알림]
- 앱 푸시 알림
- 부저 경보
- 상황별 대응 가이드 제공

[Level 4: 물리적 안전장치]
- 수동 댐퍼 (비상 차단용)
- 소화기 비치
- 온도 퓨즈 (자동 차단)
```

---

## 1.3 단열 시스템

### 1.3.1 외부 단열 설계

**목적:**
- 화실 온도 유지 (완전연소 촉진)
- 크레오소트 축적 최소화
- 외부 표면 온도 낮춤 (안전)

**재료 및 구조:**
```
      [화실 외벽 (철재)]
            ↓
      [세라믹 파이버 블랭킷]
      - 두께: 5-10cm
      - 등급: 1260℃ 이상
      - 밀도: 128kg/m³
            ↓
      [스테인리스 철망 고정]
            ↓
      [외부 보호 철판] (선택)
```

**시공 주의사항:**
- 공기층 유지 (압축 금지)
- 고온 접착제 또는 기계적 고정
- 단열재 하단 배수 고려
- 월 1회 점검 (손상 여부)

---

### 1.3.2 단열 효과

**온도 비교:**
```
[단열 전]
화실 내부: 300℃
외벽 표면: 250℃ ⚠️ 위험
연소 효율: 70%

[단열 후]
화실 내부: 350℃ ⭐ 완전연소
외벽 표면: 60-80℃ ✅ 안전
연소 효율: 85%+
```

---

## 1.4 설치 체크리스트

### 1.4.1 구조 안전 점검

```
□ 천장 하중 테스트 (모래주머니 40kg)
□ 연통 고정부 견고성 확인
□ 화실 흔들림 테스트
□ 보조 지지 케이블 장력 확인
□ 용접부 기밀 테스트 (연기 누출 확인)
```

### 1.4.2 화재 안전 점검

```
□ 천장 내화 처리 완료
□ 공기층 5cm 이상 확보
□ 이중벽 연통 설치 (관통부)
□ 온도 센서 설치 및 작동 확인
□ 연기 감지기 설치 (천장 주변 3개소)
□ 소화기 비치 (ABC 3kg 이상)
```

### 1.4.3 기능 테스트

```
□ 저연료 착화 테스트 (신문지 + 작은 나무)
□ 연기 배출 확인 (역류 없음)
□ 드래프트 확인 (손으로 흡입력 감지)
□ 배기팬 작동 테스트
□ 문 개폐 테스트 (기밀성)
□ 온도 상승 패턴 모니터링 (1시간)
□ 천장 온도 확인 (40℃ 이하 유지)
```

---

## 1.5 1단계 완료 기준

**필수 달성 항목:**
- ✅ 화실 제작 완료 및 천장 안전 고정
- ✅ 연통 설치 및 드래프트 확보
- ✅ 외부 단열 시공
- ✅ 천장 내화 처리 완료
- ✅ 수동 착화 및 2시간 이상 안전 연소 성공
- ✅ 천장 온도 50℃ 이하 유지 확인
- ✅ 연기 역류 없음 확인

**1단계 완료 시:**
→ 기본 화목난로로 사용 가능
→ 2단계 센서 및 자동화 준비

---

# 2단계: 센서 기반 자동화 펌웨어와 데이터 서버 구축

## 2.1 하드웨어 구성

### 2.1.1 센서 목록

| 번호 | 센서명 | 위치 | 역할 | 모델 예시 | 가격 |
|------|--------|------|------|----------|------|
| 1 | 화실 온도 센서 | 화실 외부 (구리 파이프 내부 연결) | 연소 상태 모니터링 | K-type 열전대 + MAX6675 | 10,000원 |
| 2 | 연통 온도 센서 | 연통 중간부 | 배기 온도 감시 | K-type 열전대 | 8,000원 |
| 3 | 연기 센서 | 연통 분기부 | 연소 효율 판단 | MQ-2 또는 광학식 | 10,000원 |
| 4 | 문 개폐 센서 | 투입구 문 | 장작 추가 감지 | 자석 리드 스위치 | 2,000원 |
| 5 | 실내 온습도 센서 | 실내 벽면 | 실내 환경 모니터링 | DHT22 또는 SHT31 | 5,000원 |
| 6 | 실내 공기질 센서 | 실내 벽면 | CO, PM2.5 감시 | MQ-7 + PMS5003 | 15,000원 |

**총 센서 비용: 약 50,000원**

---

### 2.1.2 액추에이터 목록

| 번호 | 장치명 | 위치 | 역할 | 모델 예시 | 가격 |
|------|--------|------|------|----------|------|
| 1 | 공기 강제 투입 팬 | 화실 하단 | 연소 공기 공급 | 12V DC 팬 (PWM) | 8,000원 |
| 2 | 공기 조절 서보모터 | 투입구 댐퍼 | 공기량 미세 조정 | MG996R 서보 | 5,000원 |
| 3 | 열풍 팬 | 화실 상부 | 실내 온풍 순환 | 12V DC 팬 (PWM) | 8,000원 |
| 4 | 연통 배기 팬 | 연통 상단 (실외) | 드래프트 보조 | 내열 팬 100W | 30,000원 |
| 5 | 창문 개폐 모터 | 창문 | 자동 환기 | 스텝모터 + 리니어 | 20,000원 |

**총 액추에이터 비용: 약 71,000원**

---

### 2.1.3 제어 보드 및 통신

| 항목 | 모델 | 역할 | 가격 |
|------|------|------|------|
| 메인 보드 | ESP32 DevKit | 센서 읽기, 제어, WiFi | 8,000원 |
| 릴레이 모듈 | 4채널 릴레이 | 고전력 기기 제어 | 5,000원 |
| 전원 공급 | 12V 5A 어댑터 | 시스템 전원 | 10,000원 |
| 배터리 백업 | 18650 × 3 + 홀더 | 정전 시 데이터 저장 | 15,000원 |

**총 제어 비용: 약 38,000원**

**전체 하드웨어 비용: 약 159,000원**

---

## 2.2 센서 데이터 수집 전략

### 2.2.1 샘플링 설계

```
[실시간 센서 (10초 주기)]
- 화실 온도
- 연기 농도
- 연통 온도
→ 빠른 변화 감지 필수

[중속 센서 (30초 주기)]
- 실내 공기질 (CO, PM2.5)
→ 안전 모니터링

[저속 센서 (60초 주기)]
- 실내 온습도
→ 느린 변화

[이벤트 센서 (변화 시)]
- 문 개폐
- 모드 전환
→ 상태 변화만 기록
```

---

### 2.2.2 데이터 구조

**기본 센서 로그 (10초마다):**
```json
{
  "timestamp": "2026-01-05T14:32:10Z",
  "session_id": "burn_20260105_001",
  "sensors": {
    "firebox_temp": 315,
    "flue_temp": 245,
    "smoke_density": 42,
    "door_open": false,
    "indoor_temp": 22.5,
    "indoor_humidity": 45,
    "co_ppm": 5,
    "pm25": 12
  },
  "actuators": {
    "air_fan_speed": 48,
    "servo_damper": 65,
    "exhaust_fan": true,
    "heat_fan_speed": 70,
    "window_opening": 0
  },
  "computed": {
    "temp_change_rate": -2.1,
    "smoke_change_rate": -3.5,
    "burn_efficiency": 87
  }
}
```

**이벤트 로그 (변화 시):**
```json
{
  "timestamp": "2026-01-05T14:32:45Z",
  "session_id": "burn_20260105_001",
  "event_type": "wood_addition",
  "event_data": {
    "door_opened_at": "14:32:30",
    "door_closed_at": "14:32:45",
    "duration_seconds": 15,
    "temp_before": 252,
    "smoke_before": 18
  }
}
```

**세션 요약 (연소 종료 시):**
```json
{
  "session_id": "burn_20260105_001",
  "start_time": "2026-01-05T07:15:00Z",
  "end_time": "2026-01-05T16:40:00Z",
  "duration_minutes": 565,
  "wood_additions": 4,
  "avg_temp": 298,
  "max_temp": 385,
  "efficiency_score": 85,
  "anomalies": []
}
```

---

### 2.2.3 데이터 저장 아키텍처

```
┌─────────────────────────────┐
│  ESP32 (Edge)               │
│  ├─ RAM 버퍼 (최근 10분)    │
│  ├─ 센서 읽기 (10초)        │
│  └─ 실시간 제어             │
└──────────────┬──────────────┘
               ↓ WiFi/MQTT
┌─────────────────────────────┐
│  로컬 서버 (라즈베리파이)    │
│  ├─ SQLite DB (30일)        │
│  ├─ Node.js/Python 서버     │
│  ├─ MQTT Broker             │
│  └─ 웹 대시보드             │
└──────────────┬──────────────┘
               ↓ HTTP API (선택)
┌─────────────────────────────┐
│  클라우드 (선택)             │
│  ├─ PostgreSQL (장기)       │
│  ├─ 데이터 분석             │
│  └─ 모바일 앱 백엔드        │
└─────────────────────────────┘
```

---

## 2.3 제어 로직 설계

### 2.3.1 상태 머신

```
[착화 모드] (IGNITION)
    ↓
문 닫힘 + 온도 상승
    ↓
[착화 성공] (IGNITED)
    ↓
온도 200℃ 도달
    ↓
[정상 연소] (NORMAL_BURN)
    ↓
온도 하강 + 연기 감소
    ↓
[소진 경고] (LOW_FUEL)
    ↓
장작 추가 or 지속 하강
    ↓
[장작 추가] ←─────┐
    ↓              │
[부스트 모드] ─────┘
    ↓
온도 회복
    ↓
[정상 연소] (루프)

특수 모드:
- [Sleep 모드]: 사용자 활성화
- [비상 모드]: 이상 감지 시
- [종료 모드]: 연소 완전 종료
```

---

### 2.3.2 제어 로직 테이블

#### **상황 1: 착화 단계**

| 센서 상태 | 판단 | 공기팬 | 댐퍼 | 배기팬 | 열풍팬 | 창문 |
|----------|------|--------|------|--------|--------|------|
| T<100℃ + 연기無 | 착화 전 | OFF | 100% | OFF | OFF | 닫힘 |
| T=100-150℃ + 연기↑ | 착화 중 | 80% | 100% | 30% | OFF | 닫힘 |
| T=150-200℃ + 연기多 | 착화 성공 | 60% | 80% | 50% | OFF | 닫힘 |

#### **상황 2: 정상 연소**

| 화실온도 | 연기 | 실내온도 | 판단 | 공기팬 | 댐퍼 | 배기팬 | 열풍팬 |
|---------|------|---------|------|--------|------|--------|--------|
| 250-350℃ | 20-40% | <20℃ | 최적 | 45% | 60% | 30% | 80% |
| 200-250℃ | 50-70% | - | 불완전 | 60% | 80% | 40% | 50% |
| 350-400℃ | 10-30% | >22℃ | 과열 | 30% | 40% | 60% | 100% |

#### **상황 3: 장작 추가 프로세스**

| 단계 | 문상태 | 시간 | 공기팬 | 댐퍼 | 배기팬 | 목적 |
|------|--------|------|--------|------|--------|------|
| 1.감지 | 열림 | 0초 | OFF | 닫힘 | 100% | 역류 방지 |
| 2.대기 | 열림 | 0-30초 | OFF | 닫힘 | 100% | 사용자 작업 |
| 3.배출 | 닫힘 | 0-5초 | OFF | 닫힘 | 100% | 잔여 연기 |
| 4.부스트 | 닫힘 | 5-120초 | 80% | 100% | 70% | 신규 착화 |
| 5.복귀 | 닫힘 | 120초~ | 50% | 70% | 40% | 정상 모드 |

#### **상황 4: 온도 하강 대응**

| 화실온도 | 연기 | 하강률 | 판단 | 공기팬 | 알림 |
|---------|------|--------|------|--------|------|
| 300→280℃ | 60% | -3℃/min | 소진 시작 | 50% | 15분 후 |
| 280→250℃ | 40% | -5℃/min | 소진 중반 | 55% | 10분 후 |
| 250→220℃ | 20% | -5℃/min | 재만 남음 | 60% | 즉시! |
| <180℃ | 0% | -15℃/min | 불 꺼짐 | 100% 펄스 | 긴급! |

#### **상황 5: Sleep 모드**

| 목표 | 화실온도 | 공기팬 | 댐퍼 | 배기팬 | 특징 |
|------|---------|--------|------|--------|------|
| 8시간 연소 | 230-260℃ | 20-30% | 40% | OFF | 최소 소비 |
| 온도 상승 | >270℃ | 15% | 30% | OFF | 공기 감소 |
| 온도 하강 | <220℃ | 35% | 50% | 20% | 공기 증가 |

#### **상황 6: 실내 환경 관리**

| 실내온도 | 공기질 | 열풍팬 | 창문 | 목적 |
|---------|--------|--------|------|------|
| <18℃ | 좋음 | 100% | 닫힘 | 최대 난방 |
| 18-22℃ | 좋음 | 70% | 닫힘 | 적정 유지 |
| >24℃ | 좋음 | OFF | 5cm | 과열 방지 |
| - | CO↑ | OFF | 전체 | 비상 환기 |

#### **상황 7: 안전 비상 대응**

| 위험상황 | 화실온도 | 즉시조치 | 공기팬 | 댐퍼 | 배기팬 | 창문 |
|---------|---------|---------|--------|------|--------|------|
| 과열 | >450℃ | 냉각 | OFF | 닫힘 | 100% | 닫힘 |
| 실내연기 | - | 역류차단 | OFF | 닫힘 | 100% | 전체 |
| 센서고장 | - | 안전모드 | 30% | 50% | 50% | 닫힘 |

---

### 2.3.3 PID 제어 (고급)

**목표 온도 유지:**
```
목표: 300℃ 유지

오차 = 목표 - 현재온도
P (비례): 오차 × 0.5
I (적분): 누적오차 × 0.1
D (미분): 변화율 × 0.2

팬속도 = P + I + D (0-100% 클램프)

예)
현재 280℃ → 오차 +20
P = 20 × 0.5 = 10
I = 5 (누적)
D = -2 (하강 중)
→ 팬속도 = 10 + 5 - 2 = 13% 증가
```

---

## 2.4 펌웨어 개발

### 2.4.1 ESP32 코드 구조

```cpp
// main.cpp 개요

#include <WiFi.h>
#include <PubSubClient.h>  // MQTT
#include <ArduinoJson.h>

// 전역 변수
struct SensorData {
  float firebox_temp;
  float flue_temp;
  float smoke_density;
  bool door_open;
  // ...
};

struct ControlState {
  int air_fan_speed;  // 0-255
  int servo_damper;   // 0-180
  bool exhaust_fan;
  // ...
};

enum BurnState {
  IDLE,
  IGNITION,
  NORMAL_BURN,
  LOW_FUEL,
  SLEEP_MODE,
  EMERGENCY
};

BurnState currentState = IDLE;
SensorData sensors;
ControlState controls;

void setup() {
  // 센서 초기화
  initSensors();
  
  // 액추에이터 초기화
  initActuators();
  
  // WiFi 연결
  connectWiFi();
  
  // MQTT 연결
  connectMQTT();
}

void loop() {
  // 1. 센서 읽기 (10초마다)
  if (millis() - lastSensorRead > 10000) {
    readAllSensors();
    lastSensorRead = millis();
  }
  
  // 2. 상태 판단
  updateState();
  
  // 3. 제어 로직 실행
  executeControl();
  
  // 4. 데이터 전송
  sendDataToServer();
  
  // 5. 명령 수신
  checkCommands();
  
  delay(100);
}

void readAllSensors() {
  sensors.firebox_temp = readThermocouple(FIREBOX_PIN);
  sensors.smoke_density = readSmokeSensor(SMOKE_PIN);
  sensors.door_open = digitalRead(DOOR_PIN);
  // ...
}

void updateState() {
  switch (currentState) {
    case IDLE:
      if (sensors.firebox_temp > 100) {
        currentState = IGNITION;
      }
      break;
      
    case IGNITION:
      if (sensors.firebox_temp > 200) {
        currentState = NORMAL_BURN;
      }
      break;
      
    case NORMAL_BURN:
      if (sensors.firebox_temp < 220 && 
          sensors.smoke_density < 20) {
        currentState = LOW_FUEL;
      }
      break;
      
    // ...
  }
}

void executeControl() {
  switch (currentState) {
    case IGNITION:
      controls.air_fan_speed = 200;  // 80%
      controls.servo_damper = 180;   // 100%
      controls.exhaust_fan = true;
      break;
      
    case NORMAL_BURN:
      // PID 제어 또는 규칙 기반
      controls.air_fan_speed = calculateAirSpeed();
      break;
      
    // ...
  }
  
  applyControls();
}

void applyControls() {
  ledcWrite(AIR_FAN_CHANNEL, controls.air_fan_speed);
  servo.write(controls.servo_damper);
  digitalWrite(EXHAUST_FAN_PIN, controls.exhaust_fan);
}
```

---

### 2.4.2 통신 프로토콜

**MQTT 토픽 구조:**
```
stove/
  ├─ sensors/data        (센서 데이터 발행)
  ├─ sensors/events      (이벤트 발행)
  ├─ control/commands    (명령 구독)
  ├─ control/status      (상태 발행)
  ├─ alerts/warnings     (경고 발행)
  └─ alerts/emergency    (긴급 발행)
```

**메시지 예시:**
```json
// sensors/data
{
  "timestamp": 1704462730,
  "firebox_temp": 315,
  "smoke": 42,
  "state": "NORMAL_BURN"
}

// control/commands (수신)
{
  "command": "set_mode",
  "mode": "SLEEP",
  "target_temp": 250
}

// alerts/warnings (발행)
{
  "level": "warning",
  "message": "Wood addition needed in 10 minutes",
  "timestamp": 1704462730
}
```

---

## 2.5 로컬 서버 구축

### 2.5.1 라즈베리파이 설정

**하드웨어:**
- Raspberry Pi 4 (2GB 이상)
- 32GB MicroSD 카드
- 5V 3A 전원

**소프트웨어 스택:**
```
OS: Raspberry Pi OS Lite (64-bit)
├─ Mosquitto (MQTT Broker)
├─ Node.js 18+ (백엔드 서버)
├─ SQLite (로컬 DB)
├─ Nginx (웹 서버)
└─ PM2 (프로세스 관리)
```

---

### 2.5.2 데이터베이스 스키마

```sql
-- 센서 데이터 테이블
CREATE TABLE sensor_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  firebox_temp REAL,
  flue_temp REAL,
  smoke_density REAL,
  door_open INTEGER,
  indoor_temp REAL,
  indoor_humidity REAL,
  co_ppm REAL,
  pm25 REAL,
  air_fan_speed INTEGER,
  servo_damper INTEGER,
  exhaust_fan INTEGER,
  heat_fan_speed INTEGER,
  window_opening INTEGER
);

-- 이벤트 테이블
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT,  -- JSON
  labels TEXT       -- JSON (사용자 라벨링)
);

-- 세션 테이블
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  duration_minutes INTEGER,
  wood_additions INTEGER,
  avg_temp REAL,
  max_temp REAL,
  efficiency_score REAL,
  user_rating INTEGER,  -- 1-5
  notes TEXT
);

-- 인덱스 생성
CREATE INDEX idx_timestamp ON sensor_logs(timestamp);
CREATE INDEX idx_session ON sensor_logs(session_id);
CREATE INDEX idx_event_type ON events(event_type);
```

---

### 2.5.3 백엔드 API

**Node.js Express 서버:**

```javascript
// server.js 개요

const express = require('express');
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database('./stove.db');
const mqttClient = mqtt.connect('mqtt://localhost');

// MQTT 구독
mqttClient.on('connect', () => {
  mqttClient.subscribe('stove/sensors/#');
  mqttClient.subscribe('stove/alerts/#');
});

mqttClient.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  
  if (topic === 'stove/sensors/data') {
    saveSensorData(data);
  } else if (topic === 'stove/sensors/events') {
    saveEvent(data);
  }
});

// REST API 엔드포인트

// 실시간 데이터 조회
app.get('/api/current', (req, res) => {
  db.get('SELECT * FROM sensor_logs ORDER BY timestamp DESC LIMIT 1',
    (err, row) => {
      res.json(row);
    });
});

// 시계열 데이터 조회
app.get('/api/history', (req, res) => {
  const hours = req.query.hours || 24;
  const since = Date.now() - (hours * 3600 * 1000);
  
  db.all('SELECT * FROM sensor_logs WHERE timestamp > ? ORDER BY timestamp',
    [since],
    (err, rows) => {
      res.json(rows);
    });
});

// 제어 명령 전송
app.post('/api/control', (req, res) => {
  const command = req.body;
  mqttClient.publish('stove/control/commands', JSON.stringify(command));
  res.json({ success: true });
});

// 세션 목록
app.get('/api/sessions', (req, res) => {
  db.all('SELECT * FROM sessions ORDER BY start_time DESC LIMIT 50',
    (err, rows) => {
      res.json(rows);
    });
});

app.listen(3000);
```

---

### 2.5.4 웹 대시보드

**주요 화면:**

```
┌──────────────────────────────────┐
│  🔥 스마트 화목난로 대시보드      │
├──────────────────────────────────┤
│  현재 상태: 정상 연소 중          │
│  화실 온도: 315℃                 │
│  연기 농도: 42%                  │
│  실내 온도: 22.5℃                │
│                                  │
│  [📊 온도 그래프]                │
│   (실시간 차트)                  │
│                                  │
│  예상 연소 시간: 2시간 15분       │
│  ⏰ 다음 장작 추가: 2시간 후      │
│                                  │
│  제어:                           │
│  공기팬: [▂▃▅▆▇ 48%]             │
│  열풍팬: [▂▃▅▆▇▇ 70%]            │
│                                  │
│  [Sleep 모드]  [긴급 정지]       │
└──────────────────────────────────┘
```

**기술 스택:**
- React.js 또는 Vue.js
- Chart.js (그래프)
- Socket.io (실시간 업데이트)
- Tailwind CSS (스타일링)

---

## 2.6 모바일 앱 (선택)

### 2.6.1 주요 기능

```
홈 화면:
- 현재 상태 한눈에 보기
- 온도/연기 게이지
- 예상 연소 시간

알림:
- 장작 추가 타이밍
- 이상 감지 경고
- 과열/역류 비상

제어:
- 모드 전환 (정상/Sleep)
- 팬 속도 조절
- 창문 개폐

히스토리:
- 일별/주별 통계
- 장작 소비량
- 효율 그래프

설정:
- 알림 설정
- 목표 온도
- 센서 캘리브레이션
```

---

## 2.7 2단계 완료 기준

**필수 달성 항목:**
- ✅ 모든 센서 설치 및 작동 확인
- ✅ ESP32 펌웨어 업로드 및 테스트
- ✅ 자동 제어 로직 작동 (장작 추가 감지, 공기 조절)
- ✅ 로컬 서버 설치 및 데이터 수집 확인
- ✅ 웹 대시보드 접속 및 실시간 모니터링 가능
- ✅ 최소 1주일 연속 운영 성공
- ✅ 데이터 로그 1,000개 이상 수집

**2단계 완료 시:**
→ 완전 자동화 난로 사용 가능
→ 데이터 기반 최적화 준비 완료
→ 3단계 AI 학습 준비 완료

---

# 3단계: 인공지능 자동화를 위한 데이터 라벨링과 AI 접목

## 3.1 데이터 라벨링 전략

### 3.1.1 라벨링 시스템 설계

**목표:**
AI가 "온도 하강"의 의미를 이해하도록 사람이 가르침

**라벨 종류:**
```
[연소 상태 라벨]
1. "정상_연소" - 잘 타고 있음
2. "장작_소진_시작" - 15-20분 후 추가 필요
3. "장작_소진_중반" - 5-10분 후 추가 필요
4. "재만_남음" - 즉시 추가 필요
5. "불_꺼짐_위험" - 긴급 개입 필요
6. "공기_부족" - 질식 상태
7. "과열" - 온도 너무 높음
8. "불완전_연소" - 연기 많음

[장작 종류 라벨]
- "참나무" / "소나무" / "혼합" / "기타"
- "매우_건조" / "건조" / "약간습함" / "습함"

[날씨 라벨]
- "맑음" / "흐림" / "비" / "눈"
- "고온" / "적정" / "저온" / "한파"
- "바람_강함" / "바람_약함"

[사용자 평가]
- 효율: 1-5점
- 만족도: 1-5점
- 메모: 자유 입력
```

---

### 3.1.2 라벨링 인터페이스

**앱 알림 기반:**

```
┌────────────────────────────────┐
│ 🤖 AI 학습 도와주세요!         │
├────────────────────────────────┤
│ 현재 상황:                     │
│ • 화실 온도: 270℃ (하강 중)   │
│ • 연기 농도: 25%               │
│ • 온도 변화: -5℃/분           │
│                                │
│ AI 판단: "장작 소진 중반"      │
│ 신뢰도: 78%                    │
│                                │
│ 맞나요?                        │
│ [✅ 맞아요]  [❌ 틀렸어요]     │
│                                │
│ (틀렸다면 아래 선택)            │
│ [ ] 정상 연소 중               │
│ [ ] 막 소진 시작했어요         │
│ [ ] 재만 남았어요              │
│ [ ] 공기가 부족해요            │
└────────────────────────────────┘
```

**라벨링 시점:**
1. **이벤트 발생 시** (장작 추가, 모드 전환)
2. **AI 불확실 시** (신뢰도 <80%)
3. **주기적 요청** (하루 1-2회)
4. **사용자 자발적** (앱에서 언제든 라벨 추가)

---

### 3.1.3 게이미피케이션

**라벨링 인센티브:**

```
🏆 난로 마스터 레벨업!

Level 1: 견습생 (0-50 라벨)
  보상: 기본 통계 해제
  AI 정확도: 70%

Level 2: 숙련가 (51-200 라벨)
  보상: 고급 차트 해제
  AI 정확도: 85%

Level 3: 전문가 (201-500 라벨)
  보상: 예측 기능 해제
  AI 정확도: 92%

Level 4: 마스터 (501+ 라벨)
  보상: 커뮤니티 공유 기능
  AI 정확도: 95%+

현재 당신의 기여:
━━━━━━━━━━ 85%
170 / 200 라벨

다음 레벨까지 30개 남음!
```

---

### 3.1.4 효율적 라벨링 (Active Learning)

**스마트 샘플링:**

```
[우선순위 High - 반드시 라벨 요청]
✅ 새로운 패턴 (처음 보는 상황)
✅ AI 불확실 (신뢰도 <70%)
✅ 중요 이벤트 (과열, 꺼짐 위험)
✅ 사용자 개입 직후

[우선순위 Low - 자동 처리]
⏭️ 반복 패턴 (이미 학습)
⏭️ 고신뢰도 예측 (>95%)
⏭️ 정상 연소 (변화 없음)

결과:
전체 데이터의 10%만 라벨링으로
90% 정확도 달성 가능!
```

---

## 3.2 머신러닝 모델 구축

### 3.2.1 문제 정의

**Task 1: 연소 상태 분류**
- 입력: 센서 데이터 (온도, 연기, 변화율)
- 출력: 8가지 상태 중 1개 + 신뢰도
- 모델: Random Forest 또는 XGBoost

**Task 2: 장작 추가 시점 예측**
- 입력: 최근 30분 시계열 데이터
- 출력: N분 후 추가 필요 (회귀)
- 모델: LSTM 또는 GRU

**Task 3: 이상 감지**
- 입력: 센서 패턴
- 출력: 정상/이상 (이진 분류)
- 모델: Isolation Forest 또는 AutoEncoder

---

### 3.2.2 특징 엔지니어링

**원시 센서 데이터:**
```python
raw_features = [
  'firebox_temp',      # 화실 온도
  'flue_temp',         # 연통 온도
  'smoke_density',     # 연기 농도
  'indoor_temp',       # 실내 온도
  # ...
]
```

**파생 특징 (Derived Features):**
```python
derived_features = [
  'temp_change_rate',          # 온도 변화율
  'temp_change_acceleration',  # 가속도
  'smoke_change_rate',         # 연기 변화율
  'temp_smoke_ratio',          # 온도/연기 비율
  'time_since_wood_added',     # 장작 추가 후 경과
  'moving_avg_temp_5min',      # 5분 이동평균
  'moving_avg_smoke_5min',     # 5분 이동평균
  'temp_std_10min',            # 10분 표준편차
  'peak_temp_last_hour',       # 최근 1시간 최고온도
  # ...
]
```

**시간 특징:**
```python
time_features = [
  'hour_of_day',       # 0-23
  'day_of_week',       # 0-6
  'is_weekend',        # 0/1
  'session_duration',  # 연소 시작 후 분
  # ...
]
```

---

### 3.2.3 모델 훈련 파이프라인

```python
# 개요 코드 (실제 구현 시 확장)

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# 1. 데이터 로드
df = pd.read_sql("SELECT * FROM sensor_logs", db)
labels = pd.read_sql("SELECT * FROM events WHERE labels IS NOT NULL", db)

# 2. 특징 생성
df['temp_change_rate'] = df['firebox_temp'].diff() / 10  # 10초당
df['smoke_change_rate'] = df['smoke_density'].diff() / 10

# 3. 라벨 병합
df_labeled = df.merge(labels, on=['timestamp', 'session_id'])

# 4. 학습/테스트 분할
X = df_labeled[feature_columns]
y = df_labeled['label']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# 5. 모델 훈련
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# 6. 평가
accuracy = model.score(X_test, y_test)
print(f"Accuracy: {accuracy:.2%}")

# 7. 모델 저장
import joblib
joblib.dump(model, 'stove_model.pkl')
```

---

### 3.2.4 시계열 예측 모델

```python
# LSTM for time-series prediction

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# 1. 시계열 데이터 준비
def create_sequences(data, seq_length=18):  # 18 × 10초 = 3분
    X, y = [], []
    for i in range(len(data) - seq_length - 36):
        X.append(data[i:i+seq_length])
        # 예측: 36스텝(6분) 후 온도
        y.append(data[i+seq_length+36]['firebox_temp'])
    return np.array(X), np.array(y)

X_seq, y_seq = create_sequences(sensor_data)

# 2. LSTM 모델
model = Sequential([
    LSTM(64, input_shape=(18, n_features), return_sequences=True),
    LSTM(32),
    Dense(16, activation='relu'),
    Dense(1)  # 온도 예측
])

model.compile(optimizer='adam', loss='mse')
model.fit(X_seq, y_seq, epochs=50, batch_size=32)

# 3. 예측
future_temp = model.predict(current_sequence)
print(f"6분 후 예상 온도: {future_temp[0][0]:.1f}℃")
```

---

## 3.3 엣지 AI 배포

### 3.3.1 모델 경량화

**방법 1: TensorFlow Lite 변환**
```python
import tensorflow as tf

# Keras 모델을 TFLite로 변환
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# 저장
with open('model.tflite', 'wb') as f:
    f.write(tflite_model)

# 크기 비교
# 원본: 50MB → TFLite: 5MB
```

**방법 2: 모델 프루닝**
```python
# 중요도 낮은 가중치 제거
import tensorflow_model_optimization as tfmot

pruning_params = {
    'pruning_schedule': tfmot.sparsity.keras.PolynomialDecay(
        initial_sparsity=0.0,
        final_sparsity=0.5,
        begin_step=0,
        end_step=1000
    )
}

model_pruned = tfmot.sparsity.keras.prune_low_magnitude(
    model, **pruning_params
)
```

---

### 3.3.2 라즈베리파이에서 추론

```python
# inference.py

import tflite_runtime.interpreter as tflite
import numpy as np

class StoveAI:
    def __init__(self, model_path):
        self.interpreter = tflite.Interpreter(model_path)
        self.interpreter.allocate_tensors()
        
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()
    
    def predict_state(self, sensor_data):
        # 특징 추출
        features = self.extract_features(sensor_data)
        
        # 입력 설정
        self.interpreter.set_tensor(
            self.input_details[0]['index'],
            features.astype(np.float32)
        )
        
        # 추론 실행
        self.interpreter.invoke()
        
        # 결과 가져오기
        output = self.interpreter.get_tensor(
            self.output_details[0]['index']
        )
        
        # 클래스와 신뢰도
        class_id = np.argmax(output[0])
        confidence = output[0][class_id]
        
        states = ['정상_연소', '장작_소진_시작', '장작_소진_중반', ...]
        
        return {
            'state': states[class_id],
            'confidence': float(confidence),
            'raw_scores': output[0].tolist()
        }
    
    def extract_features(self, sensor_data):
        # 30분 윈도우 특징 계산
        temp_array = np.array([d['firebox_temp'] for d in sensor_data])
        smoke_array = np.array([d['smoke_density'] for d in sensor_data])
        
        features = [
            temp_array[-1],  # 현재 온도
            np.mean(temp_array[-18:]),  # 3분 평균
            np.gradient(temp_array)[-1],  # 변화율
            smoke_array[-1],  # 현재 연기
            np.mean(smoke_array[-18:]),  # 3분 평균
            # ... 더 많은 특징
        ]
        
        return np.array([features])

# 사용
ai = StoveAI('model.tflite')
prediction = ai.predict_state(recent_sensor_data)
print(f"상태: {prediction['state']} ({prediction['confidence']:.0%})")
```

---

## 3.4 전이 학습 전략

### 3.4.1 범용 모델 → 개인화

```
[Phase 0: 제조사 범용 모델]
- 100가구 데이터로 사전 학습
- 기본 패턴 인식 가능
- 정확도: 75%
- 모든 신규 설치 시 기본 탑재

↓ 사용자 설치

[Phase 1: 파인튜닝 (1-2주)]
- 사용자 50-100 라벨
- 마지막 레이어만 재학습
- 사용자 환경 적응
- 정확도: 85%

↓ 지속 사용

[Phase 2: 완전 개인화 (1-3개월)]
- 사용자 200-500 라벨
- 전체 모델 미세 조정
- 사용자 패턴 완전 학습
- 정확도: 92-95%

↓ 선택적

[Phase 3: 커뮤니티 기여]
- 익명 데이터 공유
- 범용 모델 개선
- 다른 사용자에게 혜택
```

---

### 3.4.2 전이 학습 코드

```python
# 범용 모델 로드
base_model = tf.keras.models.load_model('universal_model.h5')

# 마지막 레이어 제거
base_model.pop()

# 새 출력 레이어 추가 (개인화)
x = base_model.output
x = Dense(32, activation='relu')(x)
predictions = Dense(num_classes, activation='softmax')(x)

# 새 모델 생성
personalized_model = Model(inputs=base_model.input, outputs=predictions)

# 초기 레이어 동결 (범용 지식 유지)
for layer in base_model.layers[:-5]:
    layer.trainable = False

# 마지막 5개 레이어만 재학습
personalized_model.compile(
    optimizer=tf.keras.optimizers.Adam(lr=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# 사용자 데이터로 파인튜닝
personalized_model.fit(user_X, user_y, epochs=20)

# 저장
personalized_model.save('my_stove_model.h5')
```

---

## 3.5 비전 AI (선택적 고급 기능)

### 3.5.1 카메라 설치

**하드웨어:**
- Raspberry Pi Camera Module V2 (8MP)
- 또는 USB 웹캠
- 내열 케이스 (투입구 옆 설치)
- IR 조명 (야간 촬영)

**위치:**
```
[투입구 문]
     ↓
   [카메라] ← 화실 내부 촬영
     ↓
  (화실 내부 보임)
```

---

### 3.5.2 비전 태스크

**Task 1: 불꽃 색상 분류**
```
입력: 640×480 이미지
출력: ["파란불", "노란불", "붉은불", "꺼짐"]
의미:
  - 파란불: 완전연소 ⭐
  - 노란불: 정상
  - 붉은불: 산소 부족
  - 꺼짐: 불 없음
```

**Task 2: 장작 개수 추정**
```
입력: 이미지
출력: 장작 개수 (1-5개)
활용: 연소 시간 예측
```

**Task 3: 재 축적량**
```
입력: 이미지
출력: 재 비율 (0-100%)
활용: 청소 알림
```

---

### 3.5.3 비전 모델 훈련

```python
# MobileNetV3 전이 학습 (경량화)

from tensorflow.keras.applications import MobileNetV3Small
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# 데이터 증강
datagen = ImageDataGenerator(
    rotation_range=10,
    width_shift_range=0.1,
    height_shift_range=0.1,
    brightness_range=[0.8, 1.2],
    validation_split=0.2
)

train_gen = datagen.flow_from_directory(
    'flame_images/',  # 라벨별 폴더
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='training'
)

# 베이스 모델 (사전 학습 가중치)
base = MobileNetV3Small(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)

# 커스텀 헤드
x = base.output
x = GlobalAveragePooling2D()(x)
x = Dense(64, activation='relu')(x)
predictions = Dense(4, activation='softmax')(x)  # 4 classes

model = Model(inputs=base.input, outputs=predictions)

# 훈련
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.fit(train_gen, epochs=30)

# TFLite 변환
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
```

---

### 3.5.4 실시간 비전 추론

```python
# vision_ai.py

import cv2
import tflite_runtime.interpreter as tflite

class FlameAnalyzer:
    def __init__(self, model_path):
        self.interpreter = tflite.Interpreter(model_path)
        self.interpreter.allocate_tensors()
        self.camera = cv2.VideoCapture(0)
    
    def analyze_flame(self):
        # 카메라에서 프레임 읽기
        ret, frame = self.camera.read()
        if not ret:
            return None
        
        # 전처리
        img = cv2.resize(frame, (224, 224))
        img = img / 255.0
        img = np.expand_dims(img, axis=0).astype(np.float32)
        
        # 추론
        self.interpreter.set_tensor(
            self.input_details[0]['index'],
            img
        )
        self.interpreter.invoke()
        
        output = self.interpreter.get_tensor(
            self.output_details[0]['index']
        )
        
        classes = ['파란불', '노란불', '붉은불', '꺼짐']
        class_id = np.argmax(output[0])
        confidence = output[0][class_id]
        
        return {
            'flame_color': classes[class_id],
            'confidence': float(confidence)
        }

# 사용
analyzer = FlameAnalyzer('flame_model.tflite')
result = analyzer.analyze_flame()

if result['flame_color'] == '파란불':
    print("완전연소 중! ⭐")
elif result['flame_color'] == '붉은불':
    print("산소 부족 - 공기팬 증가")
```

---

## 3.6 강화학습 (최고급 옵션)

### 3.6.1 개념

```
목표: "가장 오래 타면서 실내 온도 유지"

에이전트: ESP32 제어 시스템
환경: 화목난로 + 실내
행동: 공기팬 속도, 댐퍼 각도 조절
보상: (연소시간 × 2) + (실내쾌적도 × 3) - (연료소비 × 1)

에이전트가 수천 번 시행착오를 거쳐
최적 제어 전략을 스스로 발견
```

---

### 3.6.2 시뮬레이터 필요

**문제:**
실제 난로로 학습하면 위험 + 시간 소모

**해결:**
디지털 트윈 (가상 난로) 구축
```python
class StoveSimulator:
    def __init__(self):
        self.temp = 20
        self.wood_amount = 0
        self.air_flow = 0
    
    def step(self, action):
        # action = [air_fan_speed, damper_angle]
        
        # 물리 시뮬레이션 (간단한 모델)
        self.temp += (
            self.wood_amount * 0.1 +
            action[0] * 0.05 -
            (self.temp - 20) * 0.01
        )
        
        self.wood_amount -= 0.01  # 연료 소비
        
        # 보상 계산
        reward = 0
        if 250 < self.temp < 350:
            reward += 10  # 적정 온도
        if self.wood_amount < 0.1:
            reward -= 50  # 연료 소진
        
        done = self.wood_amount <= 0
        
        return self.get_state(), reward, done
```

---

### 3.6.3 강화학습 알고리즘

```python
# DQN (Deep Q-Network) 예시

import torch
import torch.nn as nn

class DQN(nn.Module):
    def __init__(self, state_size, action_size):
        super().__init__()
        self.fc1 = nn.Linear(state_size, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, action_size)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

# 훈련 루프
env = StoveSimulator()
agent = DQN(state_size=10, action_size=20)

for episode in range(10000):
    state = env.reset()
    total_reward = 0
    
    for step in range(1000):
        # 행동 선택
        action = agent.select_action(state)
        
        # 환경 스텝
        next_state, reward, done = env.step(action)
        
        # 학습
        agent.learn(state, action, reward, next_state, done)
        
        state = next_state
        total_reward += reward
        
        if done:
            break
    
    print(f"Episode {episode}: Reward {total_reward}")

# 학습된 정책 실제 난로에 적용
```

---

## 3.7 커뮤니티 학습

### 3.7.1 데이터 공유 플랫폼

```
[중앙 서버]
    ↑ 익명 데이터 업로드
┌───┴───┬───────┬───────┐
│ 집A   │ 집B   │ 집C   │
└───────┴───────┴───────┘

각 집의 난로 데이터를 모아
범용 모델 지속 개선

프라이버시:
- 개인정보 제거
- 집 위치 익명화
- 선택적 참여
```

---

### 3.7.2 벤치마킹

```
[내 난로]
연소 효율: 87%
장작 소비: 3kg/시간
완전연소율: 82%

[커뮤니티 평균]
연소 효율: 85%
장작 소비: 3.2kg/시간
완전연소율: 80%

→ "상위 15%입니다! 🎉"

[비슷한 환경 (같은 지역, 비슷한 장작)]
상위 5% 사용자의 설정:
- 공기팬: 평균 42%
- Sleep 모드 온도: 245℃
- 장작 추가 간격: 2.5시간

→ "이 설정을 시도해보세요?"
```

---

## 3.8 3단계 완료 기준

**필수 달성 항목:**
- ✅ 최소 200개 라벨 수집 (사용자 입력)
- ✅ AI 모델 훈련 및 85% 이상 정확도 달성
- ✅ 라즈베리파이에서 실시간 AI 추론 작동
- ✅ 장작 추가 예측 기능 작동 (±10분 오차 이내)
- ✅ 이상 감지 시스템 작동 (과열, 역류 등)
- ✅ 1개월 이상 AI 자동 운영 성공

**선택 달성 항목:**
- ⭐ 비전 AI 구현 (불꽃 색상 분석)
- ⭐ 강화학습 최적화
- ⭐ 커뮤니티 데이터 공유

**3단계 완료 시:**
→ 완전 자율 지능형 난로 완성
→ 사용자 개입 최소화
→ 계속 진화하는 시스템

---

# 부록

## A. 전체 BOM (Bill of Materials)

| 카테고리 | 항목 | 수량 | 예상 가격 |
|---------|------|------|----------|
| **1단계: 구조** | | | |
| 화실 | LPG 가스통 (중고) | 1 | 10,000원 |
| 연통 | 일반 연통 Ø15cm × 1.3m | 1 | 50,000원 |
| 연통 | 이중벽 단열 연통 × 0.5m | 1 | 80,000원 |
| 단열재 | 세라믹 파이버 블랭킷 5cm × 2m² | 1 | 40,000원 |
| 천장 | 규산칼슘 보드 40×40cm | 1 | 15,000원 |
| 고정 | 철판, 클램프, 케이블 | - | 30,000원 |
| 기타 | 문, 경첩, 손잡이, 용접 | - | 50,000원 |
| **2단계: 센서/제어** | | | |
| 센서 | 온도, 연기, 문, 환경 | 6종 | 50,000원 |
| 액추에이터 | 팬, 모터, 서보 | 5종 | 71,000원 |
| 제어 | ESP32, 릴레이, 전원 | - | 38,000원 |
| 서버 | 라즈베리파이 4 (2GB) + SD | 1 | 60,000원 |
| **3단계: AI (선택)** | | | |
| 카메라 | Pi Camera V2 | 1 | 30,000원 |
| **총계** | | | **약 524,000원** |

---

## B. 개발 타임라인

```
Month 1: 1단계 (구조)
  Week 1-2: 화실 제작, 용접
  Week 3: 천장 고정, 연통 설치
  Week 4: 단열, 테스트 연소

Month 2: 2단계 (자동화)
  Week 1: 센서 설치
  Week 2: ESP32 펌웨어 개발
  Week 3: 로컬 서버 구축
  Week 4: 통합 테스트

Month 3-4: 데이터 수집
  - 일상적 사용
  - 라벨링 시작
  - 최소 200개 수집

Month 5: 3단계 (AI)
  Week 1-2: 모델 훈련
  Week 3: 엣지 배포
  Week 4: 파인튜닝

Month 6+: 최적화
  - 지속 학습
  - 비전 AI (선택)
  - 커뮤니티 공유
```

---

## C. 안전 수칙

```
⚠️ 필수 안전 수칙

1. 설치 전:
   □ 천장 구조 전문가 상담
   □ 지역 건축법규 확인
   □ 화재 보험 가능 여부 확인

2. 운영 중:
   □ 첫 1개월은 30분마다 점검
   □ 천장 온도 수시 확인 (손으로)
   □ 연통 청소 월 1회 필수
   □ 소화기 항상 준비

3. 긴급 상황:
   □ 과열 시 즉시 공기 차단
   □ 역류 시 배기팬 최대 + 창문 개방
   □ 화재 시 소화기 사용 + 119

4. 정기 점검:
   □ 주 1회: 센서 작동 확인
   □ 월 1회: 연통 청소, 구조 점검
   □ 시즌 전: 전문가 안전 점검
```

---

## D. 트러블슈팅

**문제 1: 불이 자꾸 꺼진다**
```
원인:
- 공기 부족
- 습한 장작
- 드래프트 약함

해결:
- 공기팬 속도 증가
- 장작 건조 (함수율 20% 이하)
- 배기팬 작동
- 연통 청소
```

**문제 2: 연기가 실내로 역류**
```
원인:
- 드래프트 부족
- 바람 강함 (실외)
- 연통 막힘

해결:
- 배기팬 즉시 100%
- 창문 개방
- 문 개방 금지
- 연통 점검
```

**문제 3: 센서 값이 이상함**
```
원인:
- 센서 고장
- 연결 불량
- 케이블 손상

해결:
- 센서 재시작
- 연결 확인
- 센서 교체
- 안전 모드로 전환
```

**문제 4: AI 예측이 부정확**
```
원인:
- 라벨 부족
- 환경 변화 (새 장작 종류 등)
- 모델 미학습 패턴

해결:
- 더 많은 라벨링 (50개+)
- 모델 재훈련
- 수동 모드로 임시 전환
```

---

## E. 참고 자료

**화목난로 기초:**
- [네이버 카페] 화목난로 매니아
- [유튜브] 화목난로 DIY 채널

**IoT 개발:**
- ESP32 공식 문서: https://docs.espressif.com
- MQTT 프로토콜: https://mqtt.org
- Node-RED (비주얼 프로그래밍)

**머신러닝:**
- TensorFlow Lite: https://tensorflow.org/lite
- Scikit-learn: https://scikit-learn.org
- Edge AI 튜토리얼

**안전:**
- NFPA (National Fire Protection Association)
- 소방청 화재예방 자료

---

## F. 라이선스 및 면책

```
이 문서는 교육 및 연구 목적으로 작성되었습니다.

⚠️ 중요 고지:
1. 실제 제작 시 전문가 상담 필수
2. 지역 법규 준수 필수
3. 안전사고 책임은 제작자에게 있음
4. 화재 위험이 있는 프로젝트임을 인지

이 문서 작성자는 실제 구현으로 인한
어떠한 사고나 손해에 대해서도 책임지지 않습니다.
```

---

# 프로젝트 완료!

**🔥 세계 최초 공중부양 AI 화목난로**

- ✅ 혁신적 구조 설계
- ✅ 완전 자동화 시스템
- ✅ 지능형 학습 AI
- ✅ 안전 최우선 설계

**이제 따뜻하고 똑똑한 겨울을 보내세요!** 🏡🔥🤖

---

*문서 버전: 1.0*  
*작성일: 2026-01-05*  
*최종 수정: 2026-01-05*
