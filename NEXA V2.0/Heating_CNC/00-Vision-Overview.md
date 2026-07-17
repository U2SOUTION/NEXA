---
doc_id: 
parent_doc: 
implements_doc: 
terms_standard: []
terms_nexa: []
title: "Heating CNC — Vision & Overview"
category: "IoT / Manufacturing"
domain: controller
status: draft
created: 2026-07-06
updated: 2026-07-07
see_also:
  - "README.md"
  - "01-Hardware-Motion.md"
  - "02-Thermal-Engine-Sensing.md"
  - "03-Software-Protocol.md"
  - "04-Data-Operations.md"
  - "05-GCode-CAM-Pipeline.md"
---

# Hot-Blade Turning Machine — Vision & Overview

본 장비는 소재를 열로 녹여 가공하는 **데이터 중심의 지능형 정밀 제조 솔루션**입니다.
기획 단계의 데이터를 손실 없이 현장 컨트롤러로 연결하며, 가공을 넘어 후공정 마감까지 단일 시스템에서 완결하는 것을 목적으로 합니다.
기술적 상세 정의는 **모듈 인덱스**의 개별 문서를 참조하십시오.

## 통합 데이터 체인 (Integrated Data Chain)

* **기획 - 실행 동기화**: **NEXIA** 기획서의 데이터가 별도 변환 없이 현장 **컨트롤러 UI**로 즉시 동기화되어 제조 사이클의 효율을 극대화합니다.
* **디지털 트윈 이력**: 가공 중 발생한 열량, 속도, 보정 데이터 및 후공정의 RPM, 시간 등을 제품별 고유 ID 에 기록하여 완벽한 품질 이력을 구축합니다.

## 지능형 정밀 제어 및 자율 보정 (Intelligent Precision & Correction)

* **형태 스캔 및 편심 보정**: 자재 장착 시 발생하는 물리적 오차를 **Scan Pass**로 탐지하고, 각도별 Z 축 오프셋을 실시간 주입하여 하드웨어 한계를 데이터로 극복합니다.
* **대칭 수렴 알고리즘**: 가공이 진행됨에 따라 편심이 사라지는 시점을 스스로 감지하여 보정 로직을 최적화하고 최종 정밀도를 확보합니다.
* **열 - 속도 동기화 엔진 (HFS)**: 소재 밀도와 실시간 보간 속도에 맞춰 PWM 출력을 정밀 조절함으로써 과용융을 방지하고 일정한 절삭 품질을 유지합니다.

## 올인원 생산 및 후공정 워크플로우 (All-in-One Workflow)

* **후공정 유틸리티 (Manual Overdrive)**: 가공 완료 후 장비 이동 없이 샌딩, 테이핑, 에폭시, FRP, 도색 작업을 위해 A 축 RPM 연속 회전 및 정밀 인덱싱 기능을 제공합니다.
* **공정 중심 프리셋**: 각 작업에 최적화된 RPM, 가속도, 안전 설정을 패키지화하여 원터치로 호출함으로써 생산성을 극대화하고 인적 오류를 차단합니다.
* **제어권 핸드셰이크**: 수동 조작 시 G-code 실행기를 잠금 (**Resource Locking**) 하고 좌표계를 보존하여 작업 안전과 좌표계 무결성을 동시에 달성합니다.

## 핵심 강점 및 안전 전략 (Key Strengths & Safety)

* **극대화된 안전성 (Tri-Link Fail-safe)**: UI- 서버 - 장치 간 3 방향 하트비트를 감시하여 통신 단절 시 3 초 이내에 자동 정지합니다.
* **공정별 인터록**: 후공정 모드 진입 시 열선 전원을 물리적으로 차단하여 작업자의 화상 및 화재 위험을 원천 봉쇄합니다.
* **예지 보전 (PM)**: 열선의 저항 변화와 모터 누적 사용량을 분석하여 사고 발생 전 미리 교체 알림을 제공합니다.

> " 본 아키텍처는 단순한 가공기를 넘어, 소프트웨어 지능과 하드웨어 안전 로직이 결합된 **차세대 스마트 제조 스테이션**으로서의 경쟁력을 갖추고 있습니다."




---
# MVP v0.1 vs Phase 2

| 구분 | 명칭 | 목표 | 핵심 스택 | 완료 기준 |
| :--- | :--- | :--- | :--- | :--- |
| **MVP v0.1** | Cloudflare 조기 운영 | **실제 가공기 기동·현장 운영** | Next.js 단일 + Cloudflare 무료 플랜 | 스마트폰 START/E-STOP, 레시피 가공, 텔레메트리 |
| **Phase 2** | NEXA 본 플랫폼 확장 | MES, AI, 멀티디바이스, NEXIA 연동 | Next.js + NestJS + AI 서버 | 정식 웹서버 오픈, D1→PostgreSQL 이전 |

> **MVP v0.1** 은 프로토타입이 아니라 **현장에서 돌아가는 최소 운영 버전**입니다. NestJS·AI·NEXIA 도메인 연동은 Phase 2 에서 본격 도입합니다.

## 기능 범위 한눈에 보기

| 영역 | MVP v0.1 | Phase 2 |
| :--- | :--- | :--- |
| 서버 | Cloudflare Pages + Workers + D1/KV | 자체 웹서버 + NestJS + AI |
| 대상 장비 | **4 축 터닝 머신 1 대** (X/Y/Z/A) | 다기계 (가공기·환기팬 등) |
| G-code | 10 종 레시피 CAM + **Edge Case**(Scan · `e_mount`/`e_shape` · 대칭 수렴) + `.gcode` | DXF AI 분석, 3D 시뮬레이션 |
| UI | 섹션 B·C·**G**(후가공), D 기본, F 일부, `/thermal-lab` | 섹션 E (3D DXF), NIXIE, NEXIA, **스마트폰 웹캠** ([아이디어 메모](#phase-2-아이디어-메모--스마트폰-웹캠)) |
| 데이터 | D1 작업 일지·열선 센서 이력 | PostgreSQL MES, NEXIA 동기화 |
| 안전 | ESP32 E-Stop + **Tri-Link Fail-safe** + INA219/K-Type 인터록 | Dead-man, WebRTC, 가스 인터록 |

---

## Phase 2 아이디어 메모 — 스마트폰 웹캠 `[검토 대기 · 상세 미정]`

> **범위**: Phase 2 탐색 아이디어. 구현·스펙은 **후속 검토**. NIXIE 음성·대화 UI 와 **별도 축**.

모바일 브라우저 **WebRTC `getUserMedia`** 로 스마트폰 후면 카메라를 활용합니다. 별도 비전 하드웨어 없이, 장비 위 거치대에 폰을 고정하는 전제.

### ① 작업자 모션 인식 (Operator Motion)

| 아이디어 | 설명 |
| :--- | :--- |
| **제스처 → 명령** | 손·팔 동작으로 PAUSE, Jog 방향, 후공정 RPM 등 **터치 없는 조작** |
| **지능적 대처** | 이상 자세·장비 접근 거리·시야 이탈 감지 → 경고·자동 감속·Tri-Link 연동 |
| **NIXIE 와 분리** | NIXIE = 대화·음성·서사 UI / 모션 = **비언어·즉각 반사** 제어 채널 |

기술 후보: MediaPipe Pose·Hands, TensorFlow.js (브라우저 온디바이스). MVP 후공정 **발 스위치**·양손 작업과 상호 보완.

### ② 모재 비전 스캔 (Vision Scan Pass)

현재 MVP **Scan Pass**는 A 축 회전 + StallGuard **기계적 부하 맵** ([05](05-GCode-CAM-Pipeline.md#scan-pass--비정형-외경-인식--f-자동-감속)). Phase 2 에서 **카메라 기반 외형 인식**을 추가 검토합니다.

| 아이디어 | 설명 |
| :--- | :--- |
| **고정 촬영 스캔** | 특정 모드에서 폰을 장비 위에 거치 → 모재 **전체 외형을 1~N 장** 촬영 → 윤곽·편심·비정형 지수 추정 |
| **속도·복잡도** | 기계 스캔 (8~12 점·회전 대기) 보다 **빠른 1 차 형상 파악** · 복잡 단면·요철에 유리 |
| **하이브리드** | **비전 예측** → `irregularity_index`·`e_shape` 초안 → 기존 **Scan Pass 로 물리 검증** (사진 예상 + StallGuard 실측) |
| **AR / VR 확장** | 촬영 결과를 장비 좌표에 **오버레이** · Lead-in·편심 방향 시각화 · 원격 감독·교육용 |

데이터 흐름 (초안):

```text
[Vision Scan 모드]
  스마트폰 거치 → 촬영(들) → edge/segment (클라이언트 또는 AI 서버)
      → vision_scan_json { outline, e_shape_est, irregularity_est }
      → CAM pre-fill → (선택) 기계 Scan Pass 검증 → 본 가공
```

관련 스키마 확장 후보: `job_logs.vision_scan_json`, `scan_result_json` 과 병합·교차 검증 필드.

### 구현 배치 (참고)

→ [08 Project Structure · vision/](08-Project-Structure.md#phase-2-아이디어--vision-모듈) · UI [04 섹션 F](04-Data-Operations.md#섹션-f-운영-모드--안전-ux--phase-2-확장)

---

# 모듈 문서 (canonical)

| # | 문서 | 내용 |
| :---: | :--- | :--- |
| — | [**README**](README.md) | 모듈 인덱스 · 읽는 순서 |
| 01 | [Hardware & Motion](01-Hardware-Motion.md) | 4 축·DLC32·TMC2209·배선 |
| 02 | [Thermal Engine & Sensing](02-Thermal-Engine-Sensing.md) | 열선·센서·인터록 |
| 03 | [Software & Protocol](03-Software-Protocol.md) | WebSocket·운영 모드·**Manual Overdrive**·Fail-safe |
| 04 | [Data & Operations](04-Data-Operations.md) | D1·UI·**후가공 (Manual Overdrive)**·현장 운영 |
| 05 | [G-code & CAM Pipeline](05-GCode-CAM-Pipeline.md) | Edge Case CAM · HFS · 헬리컬 |
| 06 | [Auth & Security](06-Auth-Security.md) | 장비 등록 · RBAC · Provisioning |
| 07 | [Mechanical Specs](07-Mechanical-Specs.md) | 4 축 구동계 · Mechanical Alignment |
| 08 | [Project Structure](08-Project-Structure.md) | **NEXA 모노레포** 배치 · 패키지·앱·Edge |
