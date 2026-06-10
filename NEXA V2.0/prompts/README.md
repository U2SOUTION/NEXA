# NEXA V2.0 — 기획·TDD AI 대화 프롬프트

> **SSOT (짧은 버전)**: `_ai-dialogue-principles.md`  
> **상세 논의**: `docs/AI 와 기획서 만들때 대화 원칙.md`  
> AI는 **지식 공백**을 보지 못하고 **동조(Sycophancy)** 경향이 있습니다.  
> `_ai-dialogue-principles.md` + 아래 3종 템플릿으로 검토 후 `04 Decision Log`에 기록하세요.

## 파일 목록

| 파일 | 패턴 | 주요 적용 문서 |
| :--- | :--- | :------------- |
| `_ai-dialogue-principles.md` | 공통 원칙 (SSOT) | 모든 기획·TDD 세션 |
| `planning-01-devils-advocate.md` | ① 악마의 대변인 | 01 BRD, 03 MVP, 05 PRD, **08 TDD** |
| `planning-02-stack-compare.md` | ② 기술 비교 테이블 | **04 Decision Log**, **08 TDD** |
| `planning-03-failure-cases.md` | ③ 실패 사례 우선 | 03 MVP, **04 Decision Log**, **08 TDD** |

## 사용 순서 (권장)

```
초안 작성 → ① 비판 → ② 비교 → ③ 실패 사례 → 04 Decision Log → 08 TDD 확정
```

1. `_ai-dialogue-principles.md`의 **SYSTEM PRINCIPLES** 블록을 붙입니다 (또는 파일 전체 참조).
2. `planning-01` → `02` → `03` 순으로 `{{...}}`를 채워 실행합니다.
3. Cursor·ChatGPT 등에 **원칙 + 템플릿**을 붙여 넣습니다.
4. 출력을 `04_Decision_*` 또는 TDD 리스크 섹션에 이관합니다.
5. 옵시디언 사용 시 YAML: `dialogue_mode`, `review_completed: true`

## 플레이스홀더 규칙

| 토큰 | 설명 | 예시 |
| :--- | :--- | :--- |
| `{{TARGET}}` | 검토 대상 (스택·가정·기능) | Neo4j + LangGraph + EMQX |
| `{{SERVICE_TYPE}}` | 서비스·도메인 | IoT 온톨로지 협업 플랫폼 |
| `{{DOC_CATEGORY}}` | 11대 문서 번호 | 08_TDD |
| `{{SCALE}}` | 규모 가정 | 1인 개발, MAU 1만, 센서 5천 대 |
| `{{CONTEXT}}` | 배경·제약 (선택) | MVP 4주, 월 인프라 50만 원 한도 |
