# KNOWLEDGE ARCH 언어적 라우팅 및 지능형 정규화

본 문서는 NEXA Knowledge OS와 Linguistic Routing의 연동 계약을 정의한다.

> 네임스페이스 원칙: 공통 지식은 `nexa_knowledge_*`, 프로젝트 생성 지식은 `project_knowledge`로 분리한다.

**맥락:** 입력은 사용자·엣지 등 **여러 출처**에서 올 수 있으나, 본 문서가 다루는 **정규화·IR·Capability 결합**은 주로 위 두 계층과 연결된 텍스트 파이프에 초점을 둔다. 플랫폼 전체의 지식 축 개괄은 `_KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) API·운영 정책 SSOT.md` **§0** 참고.

**마무리 수준·고도화:** 본 문서는 **라우팅·IR·정규화·분기의 계약**을 정의한다. **모델·랭킹·프롬프트·중의성 해소 품질**의 세부는 **AI/도메인 구현**에서 반복 고도화하며, Knowledge 경로·경계 SSOT와의 관계는 `_KNOWLEDGE REF *` **§1-B**와 동일 원칙이다.

---

## 1) 라우팅 목표

- 한국어 입력을 `term_key` 중심 영문 IR로 정규화
- 정규화 결과를 5W1H 토큰으로 매핑
- capability 추천 및 실행 상태 분기
- 최종적으로 EN 결과를 KO Summary로 복원

---

## 2) 처리 파이프라인

1. 입력 전처리
2. 용어 탐색(정확 매칭 -> 벡터 매칭)
3. 문맥 기반 중의성 해소(Disambiguation)
4. 토큰/Capability 결합
5. 신뢰도 계산
6. 정책 분기(EXECUTABLE/ASK/REJECTED)
7. 역방향 로컬라이제이션(EN -> KO)

---

## 3) 문맥 기반 중의성 해소 규약

### 3.1 입력 컨텍스트

- `where_scope`
- `when_tempo`
- `who_pulse`
- `what_intent`
- `how_state`
- `why_causality`

### 3.2 점수식(권장)

`final_score = lexical_score * 0.35 + vector_score * 0.35 + context_score * 0.30`

- `context_score`는 각 후보 의미에 대해 헥사곤 필드 가중치 합으로 계산
- 동점이면 최근 실행 이력/사용자 선택 이력을 tie-breaker로 사용

### 3.3 예시 (`SELF`)

- 후보 A: Where.SELF(주권)
- 후보 B: Base-Core(펌웨어)
- `where_scope` 관련 가중치가 높으면 A 우선
- 펌웨어 태그(`SYS`, `FW`) 문맥이 강하면 B 우선

---

## 4) 라우팅 결과 표준 객체

```json
{
  "input_text_ko": "코어 상태 보여줘",
  "context_header": {
    "where_scope": 1,
    "what_intent": 2
  },
  "normalized_terms": [
    {
      "term_id": "018f0000-0000-7000-8000-000000000001",
      "term_key": "SELF",
      "sense_key": "WHERE_SELF",
      "layer_type": 1,
      "token_value": 3
    }
  ],
  "target_capabilities": ["nexa.platform.core.status.read"],
  "confidence_score": 94,
  "routing_state": "ASK"
}
```

---

## 5) 역방향 로컬라이제이션 계약 (EN -> KO)

출력 생성 순서:

1. 영문 결과의 `term_key` 추출
2. `ko_label` 역참조
3. `definitions.zenith.summary`를 한국어 요약 템플릿에 삽입
4. 실행 상태 문구 결합

출력 예:

- EN: `Action queued for SELF validation.`
- KO: `코어(주권) 검증 작업이 대기열에 등록되었습니다.`

품질 규칙:

- 용어 원문은 일관되게 `ko_label` 사용
- 상태 표현은 표준어(`실행`, `승인 대기`, `거부`)로 통일

---

## 6) 실패/예외 처리

- 용어 미탐지: 벡터 검색 재시도 후 ASK
- 중의성 미해소: 상위 3개 의미 후보 제시
- capability 미연결: REJECTED + 관리자 보강 큐 등록
- 불변 토큰 변경 요구 포함 요청: 실행 금지 + 승인 요청 이벤트 생성
