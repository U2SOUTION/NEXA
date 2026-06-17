---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-06-10
updated: 2026-06-12
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# _inbox — 문서 초안 (Draft Inbox)

> **역할**: AI 대화·메모·붙여넣기 **초안**만 둡니다.
> 정리·분류·파일명 확정 후 → `01_BRD` ~ `11_UserGuide` 로 **승격 (이동)** 합니다.

---

## 초안 작성 규칙

| 규칙 | 설명 |
| :--- | :--- |
| **위치** | 반드시 `_inbox/` 안에만 생성 |
| **파일명** | `DRAFT_주제.md` 또는 `DRAFT_주제_240610.md` (번호 접두 **붙이지 않음**) |
| **상태** | 확정 전까지 `status: draft` (옵시디언 YAML) |

**예시**

```json
_inbox/DRAFT_결제플로우_아이디어.md
_inbox/DRAFT_LangGraph_노드구성_240610.md
```

---

## 승격 (이동) 체크리스트

아래를 모두 충족하면 해당 번호 폴더로 옮깁니다.

- [ ] **11 대 분류 번호** 확정 (애매하면 `04_Decision` 또는 `_inbox` 유지)
- [ ] **파일명** 변경: `NN_카테고리_주제_v1.0.md` 또는 `NN_카테고리_주제_240610.md`
- [ ] 대화체·중복 제거, **참고 문서** 형태로 정리 완료
- [ ] `08_TDD` · 스택 결정 → `../prompts/` 01→02→03 검토 권장 → `04_Decision` 기록
- [ ] 옵시디언: `status: published`, `category: "08_TDD"` 등 갱신

**승격 예시**

```json
_inbox/DRAFT_IoT기술스택정리.md
    → 정리 후
08_TDD/LangGraph/08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md
```

---

## 승격 절차 (요약)

```json
1. _inbox/ 에서 초안 작성·AI 협업
2. 내용 정리 (대화체 제거, 표·목차 구조화)
3. (선택) prompts 비판·비교·실패 사례
4. 체크리스트 확인
5. 파일명 변경 + 01~11 폴더로 이동
6. _inbox 에서 원본 삭제 (또는 _inbox/_done/ 으로 보관)
```

---

## `_inbox/_done/` (선택)

승격한 초안의 **이력**을 남기고 싶을 때만 **잠시** 사용합니다.
**정본 승격 후** V1·중복 초안은 (1) 정본에 고유 내용 흡수 여부 확인 → (2) 흡수 완료 시 **삭제**. 장기 보관하지 않습니다.

> 예: `ARCHIVE_NEXA_AIS_코일밸런스GOVERN_v1` → `08_TDD_AI_코일밸런스운영규범GOVERN` §5.1 흡수 후 삭제.

---

## 하지 말 것

- 확정 문서를 `_inbox` 에 장기 보관
- `_inbox` 파일에 `01_` ~ `11_` 번호 접두 사용 (승격 시에만)
- 메타 SSOT (`11대…`, `AI 대화 원칙`) 를 `_inbox` 에 넣기 — **docs 루트**에 유지

---

## 최근 정리

### 2026-06-13 — inbox 승격 (2건)

| `_inbox` 초안 | 정본 | 처리 |
| :--- | :--- | :--- |
| `Draft-NEXA 전역 아키텍처 표준 (Global Architecture Standard).md` | [TDD-075](../08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) | **승격** → `08_TDD/NEXAOS/` |
| `NEXA Identity Manifesto.md` | [01_BRD_NEXA_IdentityManifesto_v0.md](../01_BRD/01_BRD_NEXA_IdentityManifesto_v0.md) | **승격** → `01_BRD/` _(draft)_ |

`_inbox` 잔여: `Draft-브랜드 스토리` · CES archive 스텁(선택) · README.

### 2026-06-13 — 파이프라인 DRAFT 3건 승격

| `_inbox` 초안 | 정본 (`doc_id`) | 처리 |
| :--- | :--- | :--- |
| `08_TDD_AI_모델·런타임·엔진배치_v1.0.md` | [TDD-066](../08_TDD/AI/08_TDD_AI_모델·런타임·엔진배치_v1.0.md) | **승격** → `08_TDD/AI/` |
| `DRAFT_에이전틱AI파이프라인_NEXIA7탭플랫폼Yjs연계.md` | [TDD-067](../08_TDD/NEXIA/08_TDD_NEXIA_에이전틱AI파이프라인_7탭플랫폼연계_v1.0.md) | **승격** → `08_TDD/NEXIA/` |
| `DRAFT_IoT엣지데이터파이프라인_HEXAGON선처리_Nexaon지식화연계.md` | [TDD-068](../08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) | **승격** → `08_TDD/NEXIA/` |

현재 `_inbox`: **README + `_done/` 만**.

### 2026-06-12 — NEXA AIS 승격 확인 · `_inbox` 최종 정리

**분석:** NEXA AIS 6 종 본문은 **`08_TDD/AI/` TDD-033~041** 에 **이미 published**. 추가 승격·본문 초안 **불필요**.

| 처리 | 파일 |
| :--- | :--- |
| **삭제** | `NEXA AIS *.md` 레거시 6 건 · `DRAFT_NEXA_AIS_*` 브리지 7 건 |
| **삭제** | `DRAFT_REF_AIS6종_08TDD승격매핑.md` — [08_TDD/AI/README](../08_TDD/AI/README.md) 로 통합 |
| **삭제** | `08 멀티윈도우…` · `AI VIDEO…` · `NEXIA 외부 엔진…` — TDD-014/031/019 중복 |
| **Platform stub** | `NEXA-Platform/…/tmp_NEXA-SYNC…` → **ADM-001** 리다이렉트 |

### 2026-06-12 — 승격

| `_inbox` 초안 | 정본 (`doc_id`) | 처리 |
| :--- | :--- | :--- |
| `NEXA_OS_MASTER_MAP.md` | [TDD-071](../08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) | **승격 완료** → TDD-071 통합본 |

### 2026-06-10 (이전)

| 처리 | 건수 | 비고 |
| :--- | :--- | :--- |
| **승격 → `05_PRD/NEXIA`** | 10 | `05_PRD_AI_*` → `05_PRD_NEXIA_*` |
| **승격 → `08_TDD/NEXIA`** | 3 | 드롭존 · MQTT · 데이터 분산처리 |
| **복구** | 1 | `03_MVP_NEXIA_레이아웃팝아웃MVP` |
