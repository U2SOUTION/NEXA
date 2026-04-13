# [NXN] [SPEC] NEXA Nexion 확장 프로그램(Extension) 기능 명세

## 1. 문서 목적

**Nexion 코어와는 별도 제품·배포 단위**이며, 추가·교체 가능하다(정체성 분리는 `[NXN] [CNCP] ... 지식 OS ...` §1.1).  
초기 범위는 아래 2개 기능으로 고정한다.

1. 좌측 드로어 문서 아이템 클릭 → TipTap 에디터 열기 → 편집/저장
2. 현재 문서 기준 Ollama 모델로 핵심 용어 + 설명 추출

**TipTap 실시간 반영 vs Ollama 트리거 경계(기획):** `[NXN] [UIUX] Nexion TipTap 편집·실시간 반영 및 Ollama 연동 기획.md` — 본 SPEC의 흐름과 API 계약을 UX·정책 측에서 보강한다.

---

## 2. 기능 1: 좌측 드로어 문서 클릭 기반 TipTap 편집/저장

### 2.1 사용자 흐름

1. 사용자가 좌측 드로어(Resource Explorer)에서 문서 파일 아이템을 클릭한다.
2. 중앙 작업 영역에 TipTap 에디터 탭이 열린다.
3. 사용자가 문서를 편집한다.
4. 저장 액션(Ctrl+S 또는 저장 버튼) 시 파일 시스템에 반영된다.
5. 저장 성공 시 드로어/캔버스 메타 상태(`updated_at`, `source_hash`)가 동기화된다.

### 2.2 동작 규칙

- 편집 대상은 `.md`를 기본으로 한다.
- 동일 파일 재클릭 시 기존 탭을 활성화하고 중복 탭은 만들지 않는다.
- 미저장 변경이 있을 때 탭 닫기/이동 시 확인 모달을 표시한다.
- 저장 실패(권한/경로 오류) 시 토스트 + 에러 로그를 남긴다.

### 2.3 최소 데이터 계약

- 입력: `doc_id`, `file_path`, `title`
- 출력: `saved=true|false`, `source_hash`, `updated_at`, `error_code|null`

---

## 3. 기능 2: 현재 문서 기반 Ollama 핵심 용어/설명 추출 (전역 엔진)

핵심 용어 추출은 Nexion 전용 로직으로 고정하지 않고, **전역 엔진(Global Term Extraction Engine)**으로 분리하여 모든 도메인에서 재사용 가능하게 설계한다.  
호출 주체는 Nexion 확장이지만, 엔진 계약은 NEXA 문서군 전체(NXN/Nexnap/KNOWLEDGE/AI 등)에서 공통으로 사용한다.

### 3.1 사용자 흐름

1. 사용자가 편집 중인 문서에서 "핵심 용어 추출" 버튼을 누른다.
2. 확장 프로그램은 현재 문서 본문을 Ollama 추론 요청으로 전송한다.
3. 모델이 핵심 용어 목록과 각 용어의 설명을 반환한다.
4. 우측 패널(Terms Inspector)에 결과를 표시한다.
5. 사용자는 항목을 선택해 문서에 삽입하거나 별도 노트로 저장한다.

### 3.2 출력 형식(권장 JSON)

```json
{
  "terms": [
    {
      "term": "Why Chain",
      "description": "사실(SNT)에서 판단(IND), 실행(EFF)으로 이어지는 인과 사슬"
    }
  ]
}
```

### 3.3 품질 규칙

- 용어는 중복 제거 후 중요도 순으로 정렬한다.
- 설명은 1~2문장, 문서 맥락 중심으로 작성한다.
- 근거가 약한 항목은 `confidence`를 낮게 표시하거나 제외한다.
- 모델 실패/타임아웃 시 재시도 1회 후 사용자에게 ASK 메시지를 띄운다.

### 3.4 보안/성능 규칙

- 기본은 로컬 Ollama 호출(외부 전송 금지).
- 문서 길이가 임계값을 넘으면 청크 분할 후 병합 요약한다.
- 추출 결과는 문서 저장과 분리된 비파괴 워크플로로 유지한다.

### 3.5 전역 엔진 재사용 규약

- 엔진 식별자(기능 중심): `global.engine.term_extraction.v1`
- 공급자/런타임 식별(분리 필드): `provider` (`ollama`, `openai`, `local-llm` 등), `model`
- 공통 입력 계약: `domain`, `doc_id`, `title`, `content`, `locale`, `provider`, `model`
- 공통 출력 계약: `terms[]`, `confidence`, `provider`, `model`, `elapsed_ms`
- 도메인별 프롬프트는 분리하되(예: NXN/Nexnap), 엔진 인터페이스는 단일 계약으로 유지한다.
- Nexion UI는 전역 엔진의 소비자(consumer) 중 하나이며, 다른 도메인 UI에서도 동일 계약으로 호출 가능해야 한다.
- 네이밍 원칙: 엔진 ID에는 특정 벤더명을 넣지 않고, 벤더/모델은 메타데이터 필드로 관리한다.

---

## 4. UI 배치 규약

- 좌측: Resource Explorer(문서 트리/필터)
- 중앙: Vue Flow + TipTap 탭 워크스페이스
- 우측: Terms Inspector(Ollama 추출 결과, 삽입 액션)

---

## 5. 에러 토큰 가이드(확장 프로그램 레벨)

- `EDITOR_OPEN_FAILED`
- `EDITOR_SAVE_FAILED`
- `OLLAMA_TIMEOUT`
- `OLLAMA_MODEL_NOT_FOUND`
- `TERM_EXTRACTION_FAILED`

모든 오류는 사용자 메시지와 함께 내부 로그에 기록하고, 필요 시 Nexnap 표준 `error_token` 매핑 레이어로 전달한다.

---

## 6. 수용 기준(Acceptance Criteria)

1. 좌측 문서 클릭 후 200ms 내 TipTap 탭이 열린다.
2. 편집 후 저장 시 실제 파일이 갱신되고 해시가 변경된다.
3. "핵심 용어 추출" 실행 시 용어와 설명이 구조화되어 표시된다.
4. 추출 결과는 사용자가 선택적으로 삽입할 수 있으며 원문을 자동 덮어쓰지 않는다.
5. 실패 시 명확한 에러 코드와 재시도 동작이 보장된다.

---

## 7. 구현 우선순위

- P1: 문서 클릭 → TipTap 열기/저장
- P2: Ollama 용어 추출 + 우측 패널 표시
- P3: 용어 삽입 템플릿/히스토리/즐겨찾기

HTTP·JSON 계약은 **`[NXN] [API] NEXA Nexion API 및 통신 규약.md`** 를 따른다. 본 SPEC은 확장·UI 흐름의 1차 근거로 둔다.
