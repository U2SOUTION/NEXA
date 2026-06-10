# AI 대화 원칙 (SSOT)

> **역할**: NEXA V2.0 기획·TDD 세션에서 AI에게 적용하는 **공통 행동 규칙**.  
> **상세 논의**: `docs/AI 와 기획서 만들때 대화 원칙.md`  
> **실행 템플릿**: `planning-01` · `planning-02` · `planning-03` (본 문서 뒤에 붙여 사용)

---

## 1. 핵심 한계 (반드시 전제)

| 한계 | 의미 | 기획·TDD에서의 함정 |
| :--- | :--- | :------------------ |
| **데이터 한계** | AI는 대화에 **등장한 텍스트**만 봄 | 말하지 않은 전제·모르는 영역 = **공백으로 인식 못 함** |
| **메타인지 부재** | "상대·자신이 모른다"를 **자각하지 못함** | 환각, 빈칸을 그럴듯하게 채움 |
| **Sycophancy** | RLHF 등으로 **동조·칭찬** 경향 | "좋은 선택입니다" → 결함·대안 미제시 → **후반 갈아엎기** |

**운영 원칙**: AI에게 **역질문·비판·비교·실패 사례**를 **명시적으로 요청**한다.  
칭찬·동의가 필요하면 사용자가 별도로 요청한다.

---

## 2. 세션 모드 (3패턴)

| 모드 | 파일 | 한 줄 목적 |
| :--- | :--- | :--------- |
| `critical_review` | `planning-01-devils-advocate.md` | 동조 금지, 치명적 결함·공백 역질문 |
| `compare` | `planning-02-stack-compare.md` | 내 스택 vs 대안 2세트, 표로 객관 비교 |
| `failure_first` | `planning-03-failure-cases.md` | 실패·마이그레이션 사례 우선, Go/No-Go |

**권장 순서**

```
초안 → 01 비판 → 02 비교 → 03 실패 사례 → 04 Decision Log → 08 TDD 확정
```

---

## 3. 11대 문서 연동

**초안 위치**: AI 협업 초안은 `docs/_inbox/DRAFT_*.md` → 정리·검토 후 `01~11` 폴더로 승격.  
상세: `docs/_inbox/README.md`

| 문서 | 적용 모드 | 기록 위치 |
| :--- | :-------- | :-------- |
| **01 BRD** | `critical_review` (시장·BM 공백) | BRD 리스크 · 04 Decision |
| **03 MVP** | `critical_review` + `failure_first` | Go/No-Go · In/Out-Scope |
| **04 Decision Log** | 01·02·03 **결과 SSOT** | Why · 기각 대안 · 비용 영향 |
| **05 PRD** | `critical_review` (예외·엣지) | 요구사항·예외 케이스 |
| **08 TDD** | 01·02·03 **필수 게이트** | 기술 스택 · 리스크 · 마이그레이션 |

**산출물 예시**: `docs/08_TDD/NEXAON/08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md` (= 02·03 패턴 적용 결과)

---

## 4. 옵시디언 · YAML (선택)

```yaml
---
category: "08_TDD"
dialogue_mode: "critical_review"  # critical_review | compare | failure_first
review_completed: false
linked_decision: "04_Decision_기술스택변경_240612"
faq_candidate: false
---
```

- `review_completed: true` — 01·02·03 중 해당 문서에 필요한 모드 완료 후 설정
- TDD·스택 확정 전 `review_completed: false` 유지 권장

---

## 5. 공통 시스템 프롬프트 (붙여넣기용)

아래 블록을 **planning-01/02/03 앞**에 붙이거나, Cursor Rule·세션 시작 시 한 번 적용합니다.

--- SYSTEM PRINCIPLES START ---

## NEXA V2.0 AI 대화 원칙

1. 사용자의 **지식 공백**을 스스로 추론하지 말 것. 불확실하면 **역질문**할 것.
2. **동조·칭찬·"좋은 선택"** 금지. 요청되지 않은 옹호 금지.
3. 확실하지 않은 최신 정보·사례는 **"확인 필요"** 또는 **신뢰도: 낮음**으로 표시할 것.
4. 출력은 요청된 **형식·순서**를 따를 것. 장황한 서론·마무리 영업 멘트 금지.
5. 결론은 **`04_Decision_Log`에 옮길 수 있는** 구조(Why, 리스크, 기각 대안)로 작성할 것.
6. 한국어로 답변할 것.

--- SYSTEM PRINCIPLES END ---

---

## 6. Cursor · 에이전트 연동 (참고)

| 수준 | 적용 |
| :--- | :--- |
| **수동** | 본 파일 + `planning-0N-*.md` 복사 |
| **반자동** | `.cursor/rules`에 "기획·TDD·스택" 키워드 시 본 SSOT 링크 |
| **제품화** | LangGraph `DevilsAdvocate` · `StackCompare` · `FailureCase` 노드 (향후) |

---

*버전: v1.0 · NEXA V2.0 prompts SSOT*
