# [NXN] [UIUX] ① Nexion Database — 스키마·ER(골격) 관리 설계

| 항목 | 내용 |
| :--- | :--- |
| **권장·정식 파일명** | `[NXN] [UIUX] ① Nexion Database — 스키마·ER(골격) 관리 설계.md` _(파일명의 ① = 5대 중 1번 Database)_ |
| **SSOT (5대)** | `_[NXN] NEXA Nexion 5대 지능 관리 시스템.md` — **1번 Nexion Database (골격 관리)** |
| **범위** | DB **스키마** 시각 설계·재구성 UI, **Dry-run → 승인 → DDL 반영** 흐름. 런타임 쿼리·배포 파이프는 ARCH·운영 SSOT. |
| **상호 참고** | `[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약.md`, `[NXN] [UIUX] Nexion 기초 인터페이스 및 운영 규약 (v1.0).md`, `_KNOWLEDGE SSOT Knowledge OS 스키마 DDL.md`(스키마 SSOT) |

---

## 목차

1. [5대 정렬](#1-5대-정렬)
2. [UI 초점: 캔버스와 승인](#2-ui-초점-캔버스와-승인)
3. [3패널에서의 역할](#3-3패널에서의-역할)
4. [워크플로: Dry-run → DDL](#4-워크플로-dry-run--ddl)
5. [다른 5대와의 경계](#5-다른-5대와의-경계)

---

## 1. 5대 정렬

| 5대 SSOT 요약 | 본 문서의 초점 |
| :--- | :--- |
| **역할** | 지능이 거주할 DB **스키마** 를 시각적으로 설계·재구성. |
| **핵심 기능** | **Vue Flow** 기반 ER Diagram, 테이블·FK, **Dry-run** 후 승인 → **DDL 반영**. |
| **비유** | 유기체가 안착할 **건물 설계도**. |

---

## 2. UI 초점: 캔버스와 승인

- **중앙:** **ER·관계 시각화**가 Narrative의 “서사 지도”와 **같은 Vue Flow 셸**을 쓸 수 있으나, **노드 의미**는 **테이블·뷰·제약**이다. 줌·LOD·엣지 규약은 `[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약.md` 와 공유한다.
- **승인·거버넌스:** DDL 반영 전 **Dry-run 결과 검토·ASK/WILL** 은 플랫폼 **승인 정책**과 정합한다. 세부는 `_KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) API·운영 정책 SSOT.md` 를 본다.

---

## 3. 3패널에서의 역할

| 슬롯 | Database 모드에서의 내용(예시) |
| :--- | :--- |
| **좌** | 스키마 네임스페이스·테이블 목록, 마이그레이션 대기 큐(팀 규칙에 따름). |
| **중앙** | ER 캔버스, FK 드래그, Dry-run 미리보기. |
| **우** | 선택 테이블·컬럼 메타, 제약·인덱스, **승인 요약**. |

---

## 4. 워크플로: Dry-run → DDL

1. 캔버스·폼에서 스키마 변경을 편집한다.
2. **Dry-run** 으로 생성 DDL·영향 범위(경고)를 확인한다.
3. **승인** 후에만 실제 **DDL 적용**(배치·트랜잭션 정책은 운영 SSOT).

---

## 5. 다른 5대와의 경계

| 구분 | 설명 |
| :--- | :--- |
| **Identity / Glossary** | 테이블 **행** 내용·용어 정의는 각각 Identity·Glossary 원장 SSOT. Database UI는 **골격(DDL)** 에 집중한다. |
| **Narrative** | 파일·폴더 **서사**는 ⑤ Narrative 문서 축. ER은 **지식 OS 테이블** 설계와 맞물릴 때 SCHM·DDL SSOT를 우선한다. |
| **Capability** | 메뉴·기능 **권한**은 ③ Capability. DB UI는 **스키마 편집 권한**(역할)만 연동한다. |
