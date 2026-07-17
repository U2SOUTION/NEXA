---
doc_id: 
updated: 2026-07-07
implements_doc: 
terms_standard: []
terms_nexa: []
title: "Heating CNC — 시스템 모듈 인덱스"
category: "IoT / Manufacturing"
domain: controller
status: draft
created: 2026-07-07
parent_doc: "00-Vision-Overview.md"
see_also:
  - "00-Vision-Overview.md"
---

# Heating CNC — 시스템 모듈 인덱스

Hot-Blade Turning Machine(4 축 핫 블레이드 터닝 머신) 설계의 **기술 스펙 진입점**입니다.
제품 비전·MVP 전략: [00 Vision & Overview](00-Vision-Overview.md)

| # | 모듈 | 파일 | 내용 |
| :---: | :--- | :--- | :--- |
| 00 | **Vision & Overview** | [**`00-Vision-Overview.md`**](00-Vision-Overview.md) | 제품 비전, MVP vs Phase 2 전략 |
| 01 | **Hardware & Motion** | [**`01-Hardware-Motion.md`**](01-Hardware-Motion.md) | 4 축 좌표계, DLC32 MAX, **AP 스위치·SD 연장**, StallGuard |
| 02 | **Thermal Engine & Sensing** | [**`02-Thermal-Engine-Sensing.md`**](02-Thermal-Engine-Sensing.md) | ThermalCutterEngine, INA219/K-Type, 인터록 S1~S9, `/thermal-lab` |
| **03** | **Software & Protocol** | [**`03-Software-Protocol.md`**](03-Software-Protocol.md) | Cloudflare, **연결 모드**, **Sync-Handshake**, Tri-Link, SD 오프라인 |
| 04 | **Data & Operations** | [**`04-Data-Operations.md`**](04-Data-Operations.md) | D1, UI·**Manual Overdrive**, 열선 PM, 현장 운영 |
| **05** | **G-code & CAM Pipeline** | [**`05-GCode-CAM-Pipeline.md`**](05-GCode-CAM-Pipeline.md) | HFS, Profile/Taper, **Edge Case CAM** (Scan · 이원화 편심 · 대칭 수렴), Kerf·Wire Z |
| **06** | **Auth & Security** | [**`06-Auth-Security.md`**](06-Auth-Security.md) | 장비 등록, **RBAC**, **Take-control**, JWT·Provisioning |
| **07** | **Mechanical Specs** | [**`07-Mechanical-Specs.md`**](07-Mechanical-Specs.md) | 4축 구동계, **Mechanical Alignment**, SHB 열선 헤드 |
| **08** | **Project Structure** | [**`08-Project-Structure.md`**](08-Project-Structure.md) | **NEXA 모노레포** 파일 배치 · `_ref` 이식 지도 |
| **09** | **Implementation Roadmap** | [**`09-Implementation-Roadmap.md`**](09-Implementation-Roadmap.md) | **전체 구현 순서** · Phase 0–7 · 마일스톤 · Critical Path |

### Edge Case CAM — 문서 간 로직 요약

canonical 상세: [05 § Edge Case](05-GCode-CAM-Pipeline.md#edge-case-cam--비정형-자재--편심-보정-mvp-v01-필수) · 스텁: [`_ref/edge-case-cam.ts`](_ref/edge-case-cam.ts)

| 단계 | 로직 | 관련 문서 |
| :--- | :--- | :--- |
| **0 Scan** | StallGuard 부하 맵 → `irregularity_index` · `F_adj` | [01](01-Hardware-Motion.md#scan-pass-연동-edge-case-cam) · [04 UI](04-Data-Operations.md#scan-pass-카드-ui-와이어프레임-mvp-v01-필수) |
| **편심 분해** | `e_mount`(4점 간극·장착) + `e_shape`(scan 잔차·비정형) | [07 정렬](07-Mechanical-Specs.md#a축-z축열선-중심-정렬) → mount · [05 §2](05-GCode-CAM-Pipeline.md#편심eccentricity--lead-in-거리-보정) |
| **다패스 수렴** | `e_shape×(1−s)^α` 감쇠 · `e_mount` 유지 · `F` 복원 | [05 §3](05-GCode-CAM-Pipeline.md#3-symmetry-convergence--패스별-대칭-수렴-mvp-v01-필수) |
| **런타임** | `scan_pass_*` WS · `job_logs.scan_result_json` | [03](03-Software-Protocol.md#websocket-메시지--통합-명세-canonical) · [04 D1](04-Data-Operations.md#recipes--material_density_factor-mvp-v01) |

### Manual Overdrive — 문서 간 로직 요약

canonical: [04 §G](04-Data-Operations.md#섹션-g-manual-overdrive--후가공-mvp-v01-필수) · [03 Manual Overdrive](03-Software-Protocol.md#manual-overdrive--후가공-세션-mvp-v01-필수)

| 항목 | 로직 | 관련 문서 |
| :--- | :--- | :--- |
| **제어권** | Control Handshake · G-code Executor **LOCKED** | [03 Handshake](03-Software-Protocol.md#제어권-전환-안전-핸드셰이크-control-handshake-mvp-v01-필수) |
| **세션** | `post_process_session_id` · Soft-Lock Zero · Jog Ledger | [03 좌표 규약](03-Software-Protocol.md#후공정-좌표계-유지-규약-mvp-v01-필수) |
| **4축 조작** | Jog · Goto · 발 스위치 (양손 자유) | [04 §G](04-Data-Operations.md#섹션-g-manual-overdrive--후가공-mvp-v01-필수) |
| **A RPM** | S-Curve · 축 격리 · `utility_presets` | [03 A축](03-Software-Protocol.md#a축-특화-프로토콜--rpm--인덱싱-mvp-v01-필수) |
| **A 인덱싱** | 각도 휠 · 90° 스냅 | [03 A축 프로토콜](03-Software-Protocol.md#a축-특화-프로토콜--rpm--인덱싱-mvp-v01-필수) |
| **안전** | S12 릴레이 · E-Stop **≤0.1s** · 탈조→Homing | [02 S12](02-Thermal-Engine-Sensing.md#s12--post-process-interlock--열선-릴레이-차단-mvp-v01-필수) |
| **Phase 2** | 음성 제어 | NEXA 플랫폼 |

## 참조 구현 (`_ref/`)

MVP 구현 전 **TypeScript·UI 스텁** — Workers·Next.js 이식 시 출발점.

| 파일 | 배포 목표 | 내용 |
| :--- | :--- | :--- |
| [`_ref/edge-case-cam.ts`](_ref/edge-case-cam.ts) | `packages/heating-cnc/src/cam/` | `decomposeEccentricity`, `buildPassFeedPlan`, `runEdgeCaseCam` |
| [`_ref/ScanPassCard.tsx`](_ref/ScanPassCard.tsx) | `apps/heating-cnc-mvp/…` · Phase2 `domains/heating-cnc/` | Scan Pass 카드 UI — [08 구조](08-Project-Structure.md#6-_ref-이식표) |

## 읽는 순서 (MVP v0.1)

0. [00 Vision & Overview](00-Vision-Overview.md) — 비전·단계 전략
1. [03 Software & Protocol](03-Software-Protocol.md) — 통신·시뮬 모드·Fail-safe
2. [06 Auth & Security](06-Auth-Security.md) — 장비 등록·권한·WSS 인증 *(현장 기동 전)*
3. [07 Mechanical Specs](07-Mechanical-Specs.md) — 조립·**A↔Z 정렬**·GT2 장력·열선 헤드 *(하드웨어 조립 시)*
4. [01 Hardware & Motion](01-Hardware-Motion.md) — 좌표·모터·배선·StallGuard
5. [02 Thermal Engine & Sensing](02-Thermal-Engine-Sensing.md) — 열선·센서·인터록
6. [05 G-code & CAM Pipeline](05-GCode-CAM-Pipeline.md) — HFS·헬리컬·Material_Aware_CAM·**Edge Case CAM**·시각화
7. [04 Data & Operations](04-Data-Operations.md) — DB·작업 일지·UI·현장 운영
