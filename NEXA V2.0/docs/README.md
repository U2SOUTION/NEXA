---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-06-10
updated: 2026-06-11
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# NEXA V2.0 — 개발 문서 (`docs/`)

> **체계 SSOT**: [11대 개발문서 생태계와 관리 체계.md](./11대%20개발문서%20생태계와%20관리%20체계.md)
> **파일명 규칙**: `번호_카테고리_주제_v1.0.md` 또는 `번호_카테고리_주제_240610.md`

## 폴더 역할 (3 층)

| 위치 | 역할 |
| :--- | :--- |
| **`docs/` 루트** | 체계·워크플로 **메타 SSOT** 만 (2~3 개) |
| **`_inbox/`** | 초안·AI 대화 메모 (`DRAFT_*.md`) |
| **`01_BRD` ~ `11_UserGuide`** | 정리·승격된 **확정 문서** |

```json
AI·메모 → _inbox/DRAFT_*.md → 정리·검토 → NN_폴더/NN_카테고리_주제_v1.0.md
```

상세: [_inbox/README.md](./_inbox/README.md)

---

## 폴더 구조 (11 대 분류)

| 폴더 | 카테고리 | 핵심 목적 |
| :--- | :------- | :-------- |
| [_inbox](./_inbox/) | **초안** | 분류 전 Draft Inbox |
| [01_BRD](./01_BRD/) | 사업 전략 | 비전, BM, 시장, 리스크 |
| [02_Legal](./02_Legal/) | 법무/정책 | 약관, 개인정보, PG |
| [03_MVP](./03_MVP/) | 실험 계획 | 가설, In/Out-Scope |
| [04_Decision](./04_Decision/) | 의사결정/회고 | Why, 피벗, 장애 회고 |
| [05_PRD](./05_PRD/) | 기획서 | 기능·비기능 요구, 예외 |
| [06_Analytics](./06_Analytics/) | 데이터 분석 | 이벤트, KPI 매핑 |
| [07_UIUX](./07_UIUX/) | 디자인 | 플로우, 컴포넌트, 데이터 매핑 |
| [08_TDD](./08_TDD/) | 기술 설계 | 아키텍처, API, DB |
| [09_Admin](./09_Admin/) | 운영 | CS, 어드민, 수동 DB |
| [10_QA](./10_QA/) | 검증 | 테스트 케이스, 회귀 |
| [11_UserGuide](./11_UserGuide/) | 공개 문서 | FAQ, 사용 설명, Changelog |

---

## 메타 SSOT (루트만)

| 파일 | 설명 |
| :--- | :--- |
| `개발문서 생태계와 관리 체계.md` | 11 대 분류·세부 항목·옵시디언·frontmatter 스키마 |
| `doc_id_레지스트리.md` | 확정 문서 `doc_id` 불변 식별자 SSOT (77 건) |
| `AI 와 기획서 만들때 대화 원칙.md` | AI 비판 워크플로 논의 (→ `../prompts/`) |

> 새 초안·메모는 **루트에 두지 말고** `_inbox/` 에 생성합니다.

---

## 승격 체크리스트 (요약)

1. 11 대 번호 확정
2. 파일명 `NN_카테고리_주제_v1.0.md` (또는 날짜)
3. 내용 정리 완료
4. TDD/스택 → `prompts/` 검토 → `04_Decision` (권장)
5. 해당 `NN_` 폴더로 이동

---

## 문서 흐름

```json
01 BRD → 03 MVP → 05 PRD → 07 UIUX → 08 TDD → 10 QA → 11 UserGuide
              ↘ 04 Decision (전 구간 Why 기록)
02 Legal · 06 Analytics · 09 Admin (병행)

(모든 단계) 초안은 _inbox → 정리 후 승격
```

---

## 연계

| 경로 | 용도 |
| :--- | :--- |
| `../prompts/_ai-dialogue-principles.md` | AI 대화 공통 원칙 |
| `../prompts/planning-01~03.md` | TDD·스택 비판 검토 |
