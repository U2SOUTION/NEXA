# [NXN] [UIUX] Nexion 기초 인터페이스 및 운영 규약 (v1.0)

| 항목 | 내용 |
| :--- | :--- |
| **SSOT (제품 구조)** | `_[NXN] NEXA Nexion 5대 지능 관리 시스템.md` — 5대 정의·파이프라인·Identity 하위 정제·경계. |
| **본 문서의 범위** | Nexion **데스크(UI 셸)** 의 공통 레이아웃·컴포넌트·운영 규약. **런타임 엔진·승인·배포** 상세는 ARCH·운영 SSOT. |
| **상호 참고** | `[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약.md`, `[NXN] [UIUX] Nexion TipTap 편집·실시간 반영 및 Ollama 연동 기획.md`, `[NXN] [UIUX] Nexion 5대 지능 — Vue Flow·Dagre·ExplorerTree 구현 정리.md`, `[NXN] [UIUX] ① Nexion Database — 스키마·ER(골격) 관리 설계.md`, `[NXN] [UIUX] ② Nexion Identity — 영혼 ID·족보 관리 설계.md`, `[NXN] [UIUX] ③ Nexion Capability — 자격·Tier·Late Anchoring 관리 설계.md`, `[NXN] [UIUX] ④ Nexion Glossary — 용어·언어 라우팅 관리 설계.md`, `[NXN] [UIUX] ⑤ Nexion Narrative — 기획·물리(저장) 관리 설계.md` |

---

## 1. 목적

NEXA Nexion(넥시온)은 Knowledge OS 관점에서 **지능 자산의 설계·거버넌스**를 다루는 **5개 관리 도구**(`Nexion Database` → `Identity` → `Capability` → `Glossary` → `Narrative`)를 한 브랜드 아래 제공한다. 본 문서는 사용자가 그 **“관제 데스크”** 를 열었을 때 공통으로 깔리는 **프레임(레이아웃·주요 컴포넌트·상호작용 원칙)** 을 정의한다.

- **정체성:** 논리 구조를 설계하고 **NFS(지능형 서사 파일 시스템)** 등과 맞물리는 **독립형 관제 데스크**이자 **사고의 칠판**.
- **핵심 원칙:** “기술은 배경으로, 사유는 전면으로” — **「Nexion + [관리 대상]」** 명명과 동일한 톤.
- **위상:** UI는 **5대 설계 레이어**에 대응하는 화면을 제공하고, **실행·오케스트레이션·공감 엔진** 등은 **5대 밖 런타임·체감 레이어**로 두되(5대 SSOT §참고), 필요 시 **피드백·링크**로만 연결한다.

---

## 2. Nexion UI와 5대의 대응

5대는 **별도 앱이 아니라** 동일 Nexion 프레임 안에서 **모드·라우트·컨텍스트**로 전환되는 것을 전제로 한다. 중앙 캔버스가 **항상** Vue Flow일 필요는 없으나, **Database·Narrative** 는 본 문서의 **Vue Flow + Dagre + ExplorerTree** 조합과 특히 잘 맞는다.

| 5대 (관리 대상) | UI에서의 일반적인 초점 | 본 문서에서 다루는 정도 |
| :--- | :--- | :--- |
| **Nexion Database** | 스키마·ER, Dry-run·승인 후 DDL | **중앙 Vue Flow**(ER)·우측 메타/제약 |
| **Nexion Identity** | 영혼 ID·족보, (일반) 발급·조회 | **목록·폼·그래프** 중심; **정제·Re-pointing** 은 **하위 모듈**(§8) |
| **Nexion Capability** | `nexa.*`·Tier·노드–기능 연결 | 설계 노드와 **Late Anchoring** 연계 UI |
| **Nexion Glossary** | 용어 원장·IR·Ollama | 우측 패널 **용어 추출·정의 연동** 등 |
| **Nexion Narrative** | NFS·앵커·크롤러·고아 | **좌 ExplorerTree + 중앙 캔버스 + 앵커** 가 핵심 무대 |

**정리·정제 툴:** 별도 “6번째 타일”이 아니라 **`Nexion Identity` 하위(운영자 전용)**. 내비게이션은 **Identity 화면 내 탭·섹션·권한**으로 분리한다(5대 SSOT·`__NEXA Identity ID 발급 및 처리 설계 v3.1.md` 「✦운영자✦」).

---

## 3. 기술 스택 (캔버스 중심 화면)

| 구성요소 | 역할 |
| :--- | :--- |
| **Vue Flow** | 중앙 **지능형 캔버스**(노드·엣지, ER 또는 서사 지도). |
| **Dagre** | 계층 레이아웃 자동 배치. |
| **ExplorerTree** | 좌측 **NFS/리소스 탐색**, DnD 소스. |

Database·Narrative 외 모드에서는 동일 3패널 **골격**을 유지하고 **중앙·우측 콘텐츠만** 테이블·에디터·위저드로 바꿀 수 있다.

---

## 4. 3패널 레이아웃 (3-Panel Layout)

NEXA 플랫폼 표준에 따라 **좌 / 중 / 우** 를 기본으로 한다.

| 슬롯 | 컴포넌트 | 주요 역할 (5대와의 연결) |
| :--- | :--- | :--- |
| **왼쪽** | **ExplorerTree** | **Narrative:** 실제 파일 트리·**고아(Orphaned)** 필터·캔버스 DnD. **Database** 시에는 스키마 객체·네임스페이스 트리 등으로 치환 가능. |
| **중앙** | **Vue Flow** (또는 해당 모드 주 무대) | **Database:** ER·관계 시각화. **Narrative:** 논리 지도·문서 탭(TipTap). **Capability:** 노드–권한 연결 시각화 등. |
| **오른쪽** | **Attribute Panel** | 선택 대상 메타데이터, **Link ID**, **Late Anchoring**, **Glossary** 쪽 Ollama·용어 연동(Extended) 등 모드별 패널. |

---

## 5. 핵심 컴포넌트 운영 규약

### 5.1 ExplorerTree (왼쪽 패널)

- **물리–논리:** Narrative 맥락에서 파일 시스템 구조를 투영하고, **고아 자산** 을 드러내 **Late Anchoring** 을 유도한다.
- **인터랙션:** 항목을 중앙으로 DnD 하면 **앵커 기반 노드** 생성(세부는 모드별).

### 5.2 Vue Flow & Dagre (중앙 패널)

- **Dagre:** 계층·depth 기반 자동 배치.
- **접기/펼치기:** 캔버스 비대화 방지(프랙탈 줌 대안).
- **엣지 연출 (예시):**
  - **실선:** 확정된 인과·관계 (**WILL** 등 확정 상태).
  - **점선:** AI 제안·검토 중 (**VOID/ECHO** 등 비확정).

---

## 6. 핵심 UX 워크플로우: 선 설계, 후 연결 (Late Anchoring)

**주 적용:** **Nexion Narrative** 및 **Capability** 와 맞닿는 “노드–자산–권한” 연결. **Nexion Database** 는 ER 편집·Dry-run·승인 흐름이 중심이 된다.

1. 캔버스에서 논리 뼈대(노드)를 먼저 둔다.
2. ExplorerTree에서 파일(또는 리소스)을 노드로 드래그해 연결한다.
3. 시스템은 **`anchor_id`** 로 노드와 물리 자산을 매핑하고, 정책에 따라 물리 이동(mv)·동기화를 수행한다.

### Inode식 위치 추적

- 외부에서 이름·경로가 바뀌어도 **앵커(`anchor_id`)** 로 정체성을 유지한다.
- 동기화 불일치 시 **ASK**·재배치 승인 등으로 정합을 맞춘다(Doc Sync Crawler·5대 Narrative SSOT와 정합).

---

## 7. 시각적 피드밵 (NIXIE 연동, 참고)

노드·엣지는 신뢰도·동기화 상태에 따라 **비언어적 신호**를 줄 수 있다. 이는 **5대 밖** 체감·시각화 레이어(NIXIE 등)와 연동할 때의 **규약 예시**이며, 수치·필드 매핑은 별도 UI/제품 SSOT에서 단정한다.

| 신호 | 의미 (예시) |
| :--- | :--- |
| **Lumina** | 신뢰도 상위 구간에서 안정적 표시. |
| **Jitter** | 신뢰도 하한·동기화 불일치 등 → 사용자 개입(ASK) 유도. |
| **Reddish** | 보안·치명 오류 → 차단·즉시 알림. |

---

## 8. Nexion Identity UI: 일반 vs 운영자(정제)

| 구분 | 설명 |
| :--- | :--- |
| **일반** | 발급·조회·족보·메타 편집(정책 허용 범위). |
| **운영자(슈퍼 관리자)** | **지능 자산 정제 툴** — Re-pointing, `domain_tags` 재매핑, (전제 충족 시) 구 행 DELETE, **ASK → WILL**. **별도 6번째 제품명이 아니라 Identity 내 모듈.** |

화면 설계 시 **권한·탭·감사 로그** 로 분리하고, 용어는 5대 SSOT 및 Identity v3.1 「✦운영자✦」와 동일하게 유지한다.

---

## 9. 구현 로드맵 (Phase 1 ~ 4)

| Phase | 내용 |
| :--- | :--- |
| **1** | Vue Flow 기반 3패널·DnD 프로토타입. |
| **2** | Tier A 추적 테이블·API 연동(경로·노드 링크 등). |
| **3** | Doc Sync Crawler(파일 시스템 변경 감지). |
| **4** | 고아 자산·카드 이동·물리 mv 동기화 정합. |

---

## 10. 한 줄 요약

Nexion UI는 **`_[NXN] NEXA Nexion 5대 지능 관리 시스템.md`** 가 정의한 **5대 파이프라인**을 한 데스크에서 다루기 위한 **공통 프레임**이며, 본 문서의 **ExplorerTree + Vue Flow + 속성 패널** 은 그중 **Database / Narrative / (일부) Capability·Glossary** 와 직접 맞물리는 **캔버스형 경험의 기준선**이다. 사용자가 **생각의 설계가 물리 자산·스키마·영혼 ID와 어떻게 맞물리는지** 를 한눈에 보게 하는 것이 목표다.
