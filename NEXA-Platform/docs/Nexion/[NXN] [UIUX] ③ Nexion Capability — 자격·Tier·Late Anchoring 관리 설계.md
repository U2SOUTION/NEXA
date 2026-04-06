# [NXN] [UIUX] ③ Nexion Capability — 자격·Tier·Late Anchoring 관리 설계

| 항목 | 내용 |
| :--- | :--- |
| **권장·정식 파일명** | `[NXN] [UIUX] ③ Nexion Capability — 자격·Tier·Late Anchoring 관리 설계.md` _(파일명의 ③ = 5대 중 3번 Capability)_ |
| **SSOT (5대)** | `_[NXN] NEXA Nexion 5대 지능 관리 시스템.md` — **3번 Nexion Capability (자격 관리)** |
| **범위** | **`nexa.*` 계층**, **Tier**, 설계 노드와 기능 연결 **Late Anchoring** 게이트웨이 UI. |
| **상호 참고** | `__NEXA Capability ID 체계와 발급 및 Tier 접근 권한.md`, `[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약.md`, `[NXN] [UIUX] Nexion 기초 인터페이스 및 운영 규약 (v1.0).md` |

---

## 목차

1. [5대 정렬](#1-5대-정렬)
2. [UI 초점: 열쇠와 게이트](#2-ui-초점-열쇠와-게이트)
3. [캔버스·노드와의 연결](#3-캔버스노드와의-연결)
4. [Tier·검증 표시](#4-tier검증-표시)
5. [다른 5대와의 경계](#5-다른-5대와의-경계)

---

## 1. 5대 정렬

| 5대 SSOT 요약 | 본 문서의 초점 |
| :--- | :--- |
| **역할** | **Capability ID** 위계 — 기능 **자격**·Tier. |
| **핵심 기능** | `nexa.*` 계층 좌표, Tier별 권한, **Late Anchoring** 으로 노드–기능 연결. |
| **비유** | **열쇠·자격증** — 어떤 문을 열 수 있는지. |

---

## 2. UI 초점: 열쇠와 게이트

- **브라우저·에디터:** 트리 또는 그래프로 `nexa.*` 네임스페이스 탐색, Tier 할당, 역할·프로젝트 스코프.
- **Late Anchoring:** 설계 캔버스의 **노드**에 “이 기능을 쓸 수 있다”는 **게이트**를 붙이는 UX — 세부 상호작용은 Nexion 도메인 구현과 `[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약.md` 에 맞춘다.

---

## 3. 캔버스·노드와의 연결

| 요소 | 설명 |
| :--- | :--- |
| **Capability Node** | 캔버스에서 `nexa.*` 계층을 도트·블록으로 표현(시각 규약은 Vue Flow UI 문서 §7.3 등). |
| **게이트웨이** | 노드 선택 시 우측 패널에서 **허용 Capability·Tier** 를 연결·해제. |

---

## 4. Tier·검증 표시

- Tier는 **역할·환경·배포 채널**과 정합해야 한다 — 수치·이름은 `__NEXA Capability ID 체계와 발급 및 Tier 접근 권한.md` SSOT.
- UI에서는 **불충족 시** 비활성·툴팁·ASK 로 이유를 드러낸다(구체 카피는 제품 팀 규칙).

---

## 5. 다른 5대와의 경계

| 구분 | 설명 |
| :--- | :--- |
| **Identity** | “누구인가”는 영혼 ID. Capability는 “**무엇을 할 수 있는가**”. |
| **Glossary** | 의미·용어는 ④. Capability는 **기능 좌표·권한**. |
| **Database** | 스키마·DDL은 ①. Capability UI는 **애플리케이션 권한 모델** 에 대응한다. |
| **Narrative** | 파일·서사 연결은 ⑤. Late Anchoring은 **노드–기능** 을 잇는다. |
