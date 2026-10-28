# smart-water-mat

듀얼존 온수 매트 ESP32 펌웨어 기초.  
스펙: `NEXA V2.0/APP_V2.0/_inbox/_done/NEXA BEE 양봉/장비-스마트 온수 매트 해킹 제어.md`

## 모듈

| 파일 | 역할 |
| :--- | :--- |
| `arm` | 무장 게이트 (포토커플러 전제) |
| `optocoupler` | A/B/SW 펄스·전원 쇼트 |
| `pulse_scheduler` | 1칸 큐 + 데드타임 + MQTT 유예 |
| `sensors` | DS18B20·기후·침대 mmWave 자리 |
| `temp_control` | 5분 평균·손 오프셋·자동 ±1 |
| `schedule` | 수면 벌·기준 곡선 |
| `presence_bed` | 침대 재실 (≠ PRESENCE) |
| `sleep_fsm` | IDLE…WAKE / 이탈 유예 |
| `feature_map` | 로터 링 1–4 해석 |
| `feedback` | ACCEPT/REJECT/… 스텁 |
| `mqtt_portal` | poll·telemetry 스텁 |

## 다음 작업

1. `config.h` 에 좌/우 GPIO 기입  
2. DS18B20·온습도·침대 레이더 드라이버  
3. ESP-NOW 표준 패킷 → `FeatureMap`  
4. TLS MQTT nonce poll  
5. 입실 예약 만료·건조 가온·음악 알림  

로터 펌웨어에 매트 분기를 넣지 않는다.
