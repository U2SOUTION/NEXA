# NEXA 도메인별 코일 배정 매트릭스 v0.1

> **기준:** 플랫폼 라우터 리스트 기반
> **원칙:** Source Layer 6코일은 모든 도메인에 항상 존재. 이 표는 Domain Layer 코일만 표기.
> **표기:** ● 핵심 활성 / ○ 보조 활성 / — 해당 없음

---

## Source Layer — 모든 도메인 공통 (항상 존재)

| Safety | Stability | Compliance | Efficiency | Autonomy | Creative |
| ------ | --------- | ---------- | ---------- | -------- | -------- |
| ●      | ●         | ●          | ●          | ●        | ●        |

---

## Domain Layer — 라우터별 코일 배정

| 라우터          | 도메인명        | Sensitivity | Precision | Aesthetics | Empathy | Sustainability | Alertness | 비고                              |
| --------------- | --------------- | :---------: | :-------: | :--------: | :-----: | :------------: | :-------: | --------------------------------- |
| `/nexa-node`    | 노드 편집기     |      ●      |     ●     |     —      |    ○    |       ○        |     ○     | IoT 로직·펌웨어 · 물리 제어 핵심  |
| `/infra`        | 인프라 관리     |      ●      |     ●     |     —      |    —    |       ○        |     ●     | 디바이스 등록·상태 · 보안 중요    |
| `/network`      | 네트워크 맵     |      ●      |     ○     |     —      |    —    |       —        |     ●     | 트래픽·연결 상태 실시간 감지      |
| `/nexa-admin`   | 관리자 센터     |      —      |     ●     |     —      |    —    |       —        |     ●     | 감사·권한 · 정밀 기록 필수        |
| `/nexa-trace`   | 트레이스        |      ○      |     ●     |     —      |    ●    |       —        |     ○     | 사용자 동작 정밀 재현 + 의도 파악 |
| `/nexa-ai`      | AI 워크스페이스 |      —      |     —     |     ●      |    ●    |       —        |     —     | 창작·대화 · 넥슈 인격 핵심        |
| `/nexa-archive` | 아카이브        |      —      |     —     |     ●      |    ●    |       ●        |     —     | 장기 콘텐츠 축적 · 지식화         |
| `/portfolio`    | 포트폴리오      |      —      |     —     |     ●      |    ○    |       —        |     —     | 결과물 전시 · 시각적 완성도       |
| `/nexa-board`   | 보드            |      ○      |     —     |     ●      |    ●    |       —        |     ○     | 통합 뷰 · 사용자 첫 접점          |
| `/nexa-panel`   | 패널 마켓       |      —      |     —     |     ●      |    ○    |       —        |     —     | 위젯·컴포넌트 · 시각적 품질       |
| `/erp`          | 업무 허브       |      —      |     ○     |     —      |    ●    |       ●        |     ○     | 장기 프로젝트 · 일정·자원 관리    |
| `/my`           | 마이 페이지     |      —      |     —     |     ○      |    ●    |       —        |     —     | 개인 진입점 · 사용자 맥락         |
| `/dev`          | 개발자 도구     |      —      |     ●     |     —      |    —    |       —        |     ●     | 디버그·감사 · 정밀 로그           |
| `/help`         | 도움말·FAQ      |      —      |     —     |     —      |    ●    |       —        |     —     | 사용자 혼란 감지 · 공감 응답      |

---

## 도메인 그룹별 정리

### 하드 도메인 (Sensitivity + Precision 핵심)

`/nexa-node` `/infra` `/network` `/nexa-admin` `/dev`

- Sensitivity ● : 물리 변화·이상 신호에 즉각 반응
- Precision ● : 수치 오차 최소화 · 정밀 제어
- Alertness ● : 위협·이상 감지 즉각 대응

### 아트·창작 도메인 (Aesthetics + Empathy 핵심)

`/nexa-ai` `/portfolio` `/nexa-panel` `/nexa-board`

- Aesthetics ● : NIXIE 캔버스 발광 · 시각적 완성도
- Empathy ● : 넥슈 창작 협력자 인격 · 감성적 톤

### 지식·운영 도메인 (Sustainability + Empathy 핵심)

`/nexa-archive` `/erp` `/nexa-trace`

- Sustainability ● : 장기 데이터 유효성 · 자원 배분
- Empathy ● : 사용자 의도 장기 추적 · 배려적 보고

### 보안·감사 도메인 (Alertness + Precision 핵심)

`/nexa-admin` `/infra` `/network` `/dev`

- Alertness ● : INCIDENT 태그 속도 · 즉각 반사
- Precision ● : 감사 로그 정밀도 · 오류 추적

---

## 코일별 활성 도메인 역방향 조회

| 도메인 코일        | 핵심 활성 라우터                         | 보조 활성 라우터                               |
| ------------------ | ---------------------------------------- | ---------------------------------------------- |
| **Sensitivity**    | /nexa-node · /infra · /network           | /nexa-board · /nexa-trace                      |
| **Precision**      | /nexa-node · /infra · /nexa-admin · /dev | /network · /erp · /nexa-trace                  |
| **Aesthetics**     | /nexa-ai · /nexa-archive · /portfolio    | /nexa-board · /nexa-panel · /my                |
| **Empathy**        | /nexa-ai · /nexa-board · /erp · /help    | /nexa-archive · /nexa-trace · /my · /portfolio |
| **Sustainability** | /nexa-archive · /erp                     | /nexa-node · /infra                            |
| **Alertness**      | /infra · /network · /nexa-admin · /dev   | /nexa-node · /nexa-trace · /erp                |

---

## 넥슈 인격 도메인별 변화

Empathy 코일값에 따라 넥슈의 말걸기 빈도·톤·깊이가 달라진다.

| 라우터          | Empathy 강도 | 넥슈 인격     | 말투 예시                                    |
| --------------- | ------------ | ------------- | -------------------------------------------- |
| `/nexa-node`    | 낮음         | 기술 전문가   | "온도 87도. 냉각 권고."                      |
| `/infra`        | 낮음         | 시스템 관리자 | "디바이스 3번 응답 없음. 점검 필요."         |
| `/nexa-ai`      | 높음         | 창작 협력자   | "흥미로운 방향이네요. 이쪽으로 더 가볼까요?" |
| `/erp`          | 중간         | 배려하는 비서 | "오늘 마감 3건 있어요. 조정해드릴까요?"      |
| `/nexa-archive` | 중간         | 지식 큐레이터 | "관련 아카이브 2건 발견했어요."              |
| `/help`         | 높음         | 따뜻한 안내자 | "헷갈리실 수 있어요. 단계별로 같이 볼게요."  |
| `/nexa-admin`   | 낮음         | 감사 시스템   | "권한 위반 감지. 로그 기록 완료."            |

---

## >>>>>>> 미확정 항목

| 항목               | 내용                                              |
| ------------------ | ------------------------------------------------- |
| `/my` 하위 도메인  | my/resources · my/membership 등 세분화 필요       |
| Project Layer 코일 | 각 라우터별 사용자 정의 코일 후보 미정            |
| 도메인 동시 진입   | /nexa-ai + /nexa-node 동시 사용 시 코일 충돌 처리 |
| Empathy 강도 수치  | 낮음·중간·높음의 실제 슬라이더값 미정             |

### 현재 코일 주입 시 토큰 추정

```
헤더 선언:
coil_range:0-10                          → 약 5토큰

Source Layer (6개 · 항상):
src:safety=9,stability=7,compliance=8,
efficiency=6,autonomy=4,creative=7       → 약 20토큰

Domain Layer (활성 코일만 · 평균 4개):
dom:sensitivity=8,precision=9,
alertness=7,resilience=6                 → 약 15토큰

Project Layer (사용자 선택 · 평균 3개):
prj:warmth=7,depth=8,curiosity=6         → 약 10토큰

합계: 약 50토큰
```

코일 자체는 생각보다 적습니다. **50토큰 이하**입니다.

---

### 500토큰 예산 배분 현실

문제는 코일이 아니다.

```
항목                          토큰 추정
────────────────────────────────────
페르소나 (간결 버전)            50~80
코일 밸런서                     50
선 룰 (Level 0 핵심)            50~80
현재 태스크·컨텍스트            100~150
대화 이력 (최근 2~3턴)         100~200
────────────────────────────────────
합계                           350~560
```

**대화 이력이 가장 큰 변수**입니다. 2턴만 넘어가도 200토큰을 넘깁니다.

---

### Ollama 모델별 현실적 전략

| 모델        | 컨텍스트 | system prompt 권장 상한    |
| ----------- | -------- | -------------------------- |
| llama3.2 3B | 8K       | **300토큰 이하** 엄격 관리 |
| llama3.1 8B | 128K     | 500토큰 여유               |
| mistral 7B  | 32K      | 400토큰 권장               |
| qwen2.5 7B  | 128K     | 500토큰 여유               |

3B 모델 기준이면 500토큰도 빠듯합니다.

---

### 500토큰 이하 달성 전략

```
1. 코일 — 기본값(5) 생략
   src:safety=9,autonomy=4,creative=7
   (기본값인 stability=5, compliance=5, efficiency=5 생략)
   → 20토큰 → 12토큰으로 절감

2. 페르소나 — 1~2문장 압축
   "role:iot-assistant,tone:technical,lang:ko"
   → 자연어 50토큰 → 10토큰

3. 선 룰 — 핵심 ID만 참조
   "rules:L0-001,L0-002,L0-003"
   → 실제 룰은 DB에서 조회
   → 100토큰 → 10토큰

4. 대화 이력 — 슬라이딩 윈도우
   최근 1턴만 유지 (모델 성능 따라 조정)
   → 200토큰 → 50토큰

5. 컨텍스트 — 핵심만
   "task:iot-control,device:boiler-01,state:FLOW"
   → 100토큰 → 15토큰
```

---

### 최적화 후 예산

```
항목                    최적화 전    최적화 후
────────────────────────────────────────
페르소나                 80          10
코일 밸런서              50          15
선 룰 참조               80          10
태스크·컨텍스트          150          15
대화 이력                200          50
여유분                    —           400
────────────────────────────────────────
합계                     560         100토큰
```

> **100토큰으로도 충분히 가능합니다.**
> 핵심은 자연어를 구조화된 키:값으로 바꾸는 것입니다.

---

### 한 줄 요약

> 코일 자체는 문제가 아닙니다.
> **페르소나와 선 룰을 자연어에서 키:값 참조 방식으로 바꾸는 것**이 500토큰 목표의 핵심입니다. 🎯
