# [설계서] Ollama AI 기반 IoT 플랫폼용 MQTT 토픽 및 데이터 라우팅 아키텍처

## 1. 아키텍처 개요 (Overview)

본 아키텍처는 NestJS(메인 제어/관제탑), Vue 3(실시간 대시보드), 그리고 Ollama 기반 Python 서버(AI 에이전트/무거운 연산)가 대규모 IoT 디바이스(ESP32, 라즈베리 파이)와 효율적으로 통신하기 위한 데이터 분기 구조를 정의한다.
디바이스 단의 코드를 최소화하고, 서버의 확장성을 극대화하기 위해 MQTT Pub/Sub 체제와 와일드카드 기능을 핵심 엔진으로 사용한다.

## 2. MQTT 토픽 네이밍 컨벤션 (Topic Naming Convention)

모든 디바이스는 다음과 같은 계층형 구조로 토픽을 발행(Publish) 및 구독(Subscribe)한다.

[Group/Company]/[Location/Factory]/[Device_ID]/[DataType]/[SubTopic]

- Example: myiot/factory-a/esp32-001/sensor/temperature

## 3. 와일드카드를 활용한 데이터 라우팅 전략 (Data Routing)

디바이스는 주소 변경 없이 데이터 상태(Normal/Critical)에 따라 토픽 끝자리만 바꿔 발행하며, 이를 서버단에서 와일드카드로 수신하여 처리 주체를 분기한다.

[ IoT Device ] ──► (Publish) ──► [ MQTT Broker ]
│
┌──────────────────────────┴──────────────────────────┐
▼ (Subscribe) ▼ (Subscribe)
[ NestJS 메인 웹 서버 ] [ Python AI 에어전트 ]

- Topic: myiot/+/+/sensor/# - Topic: myiot/+/+/sensor/+/critical
- 역할: 실시간 DB 저장 및 Vue 3 웹소켓 전송 - 역할: Ollama LLM / 이상 감지 추론

## 3.1 메인 웹 서버 (NestJS) 구독 레이어

- 구독 토픽: myiot/+/+/sensor/#
- 설명: 위치와 기기 ID에 관계없이 발생하는 모든 센서 데이터를 수집한다.
- 비즈니스 로직: 수집된 데이터를 PostgreSQL에 영구 저장하고, Socket.io를 통해 Vue 3 실시간 대시보드로 브로드캐스팅하여 사용자 화면을 초고속 갱신한다.

## 3.2 AI 에이전트 서버 (Python / Ollama) 구독 레이어

- 구독 토픽: myiot/+/+/sensor/+/critical
- 설명: 디바이스 펌웨어 단 혹은 1차 필터링에서 critical(위험/이상 징후)로 분류되어 들어오는 데이터만 수집한다.
- 비즈니스 로직: NestJS를 거치지 않고 다이렉트로 데이터를 가로채, Ollama(로컬 LLM) 및 파이썬 데이터 과학 라이브러리를 구동하여 장비 고정 예측 및 자율 판단 연산을 비동기로 수행한다. 분석 결과는 중앙 PostgreSQL에 직접 기록한다.

## 4. Vue 3 및 NestJS 연동 OTA(무선 업데이트) 제어 아키텍처

수백 대의 장비를 Vue 3 화면에서 일괄 또는 그룹별로 제어하기 위해 MQTT 하향(Downlink) 제어 토픽을 설계한다.

## 4.1 OTA 제어 토픽 구조

myiot/[Location/Factory]/[Device_ID]/cmd/ota

- 특정 기기 제어: myiot/factory-a/esp32-001/cmd/ota
- 공장별 일괄 제어 (그룹 배포): myiot/factory-a/+/cmd/ota (디바이스가 부팅 시 와일드카드 채널을 함께 구독하도록 펌웨어 설계)

## 4.2 OTA 제어 페이로드(Payload) 규격 (JSON Contract)

NestJS가 브로커를 통해 디바이스로 송신하는 표준 메시지 규격이다. 디바이스의 데이터 오염 방지를 위해 체크섬 검증을 포함한다.

```json
{
  "cmd": "START_OTA",
  "version": "v1.2.0",
  "firmware_url": "https://myplatform.com",
  "checksum": "a1b2c3d4e5f6g7h8..."
}
```

## 4.3 데이터 흐름 (Vue 3 ↔ NestJS ↔ MQTT ↔ Device)

1.  관리자 트리거: 사용자가 Vue 3 대시보드에서 특정 공장 필터를 걸고 [펌웨어 일괄 배포] 버튼을 클릭한다.
2.  자산 업로드: NestJS가 .bin 펌웨어 파일을 클라우드 저장소에 업로드하고 고유 URL을 생성한다.
3.  명령 발행: NestJS가 생성된 URL과 체크섬을 담아 와일드카드 토픽(myiot/factory-a/+/cmd/ota)으로 MQTT 메시지를 발행한다.
4.  장비 다운로드: 해당 공장의 모든 ESP32/라즈베리 파이가 메시지를 동시에 수신, URL에서 파일을 다운로드한 뒤 자가 검증 후 재부팅(OTA 완료)한다.
5.  상태 보고: 장비가 재부팅되면서 자신의 상태 토픽(.../status)으로 새로운 버전(v1.2.0)을 발행하면, NestJS를 거쳐 Vue 3 화면의 진행률/완료 상태가 실시간 갱신된다.

## 5. 아키텍처적 기대 효과 (Benefits)

1.  Ollama 연산 최적화: 무거운 LLM 추론이 필요한 데이터만 MQTT 토픽 분기로 걸러내어 웹서버와 별도의 파이썬 서버로 보내므로, 올라마 서버의 리소스 낭비가 전혀 없다.
2.  완벽한 논블로킹(Non-blocking): 파이썬의 Ollama 에이전트가 프롬프트를 해석하고 추론하는 동안(수 초 소요)에도, NestJS 메인 서버와 Vue 3 대시보드는 멈춤 없이 정상 작동한다.
3.  하드웨어 경량화: ESP32는 복잡한 라우팅 대상(어느 서버로 보낼지)을 알 필요가 없다. 오직 상황에 맞는 '토픽 스트링'만 붙여서 쏘면 인프라가 알아서 배달한다.

---

## 과재 아키텍처 설계 추가 사항

- 올라마(Ollama) 에이전트가 처리할 구체적인 AI 임무 (예: 센서 로그를 보고 자연어로 경고 리포트 작성, 자연어 명령으로 IoT 기기 제어 등)
- NestJS 단에서 올라마로 넘겨줄 프롬프트 템플릿 관리 패키지(packages/ai-prompts) 설계
- 올라마의 응답 속도를 고려한 비동기 메시지 응답 처리(MQTT 응답 토픽 패턴)
