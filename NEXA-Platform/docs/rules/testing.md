# NEXA 테스트 및 검증 규칙 (Testing & Validation)

> 타입·스키마·도메인 무결성 검증. 일반 코딩 규칙은 `coding-style.md`, 워크플로우는 `workflow.md` 참조.

---

## 1. TypeScript 강화 규칙

- **Strict Interface**: 모든 데이터 구조는 `interface` 또는 `type`으로 명시. API 응답과 Props는 생략 불가
- **타입 단언 최소화**: `as` 키워드 사용을 최소화하고, 사용 시 사유 주석 필수
- **타입 가드 우선**: `unknown` + 타입 가드로 런타임 안전성 확보

---

## 2. Zod 스키마 검증

- **Single Source of Truth**: 모든 외부 데이터(API, LocalStorage, Form)는 Zod 스키마로 검증
- **Infer Types**: `z.infer<typeof schema>`로 타입 추출. 수동 타입 정의 금지
- **Fail Fast**: 데이터 입구에서 `safeParse()` 수행. 실패 시 NEXA 에러 토큰 반환
- **스키마 배치**: 도메인별 `types/` 또는 `schemas/` 디렉터리에 스키마 파일 분리

---

## 3. NEXA 도메인 무결성 검증

- **HEXAGON 패킷**: Nexnap 패킷이 6축(5W1H) 구조를 갖추었는지 Zod 스키마로 검증
- **Identity 불변성**: `nexa_identities` 레코드의 변경 시도를 차단하는 검증 로직 필수
- **N-PATH 정합성**: 경로 참조가 유효한 `path_id`를 가리키는지 확인

---

## 4. 자동 검증 명령

코드 수정 후 순차 실행:

1. `npx tsc --noEmit` — 타입 에러 확인
2. `npm run lint` — 코딩 컨벤션 확인
3. 새 Zod 스키마 작성 시 — 유효/무효 데이터 양방향 테스트 수행
