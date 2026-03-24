# _ 지능형 용어 관리 시스템 NEXA Glossary DB

본 문서는 Glossary 시스템의 운영 아키텍처를 정의한다.  
테이블/컬럼의 단일 기준은 `_ 지능형 용어 관리 CRUD 테이블 명세서.md`를 따른다.

---

## 1) 시스템 목적

- 용어를 문서 자산이 아닌 실행 가능한 지능 자산으로 관리
- 한국어 입력을 영문 IR로 정규화하고, 다시 한국어 응답으로 복원
- 용어-기능-Capability-문서-실행 추적 체인을 일관되게 유지

---

## 2) 핵심 구성 요소

### 2.1 Glossary Admin (`domains/admin`)
- 용어/토큰/참조 CRUD
- 변경 이력 조회
- 불변 토큰 변경 승인 처리

### 2.2 Linguistic Routing Adapter (`engines`)
- 정확 매칭 + 벡터 검색
- 문맥 기반 중의성 해소(disambiguation)
- capability 추천 및 신뢰도 점수 산출

### 2.3 Localization Adapter (`engines`)
- 영문 판단 결과를 한국어 요약으로 역변환
- `ko_label` + `definitions.vista.summary` 역참조

### 2.4 Doc Sync Crawler (`system/jobs`)
- `src/docs/` 변경 감지
- 문서 앵커 파싱
- `doc_ref_path`, `doc_anchor` 자동 동기화

### 2.5 Edge Distribution Packager (`system/jobs`)
- Nano/Micro/Vista 대상별 패키지 생성
- ESP32(Nano)용 경량 사전 OTA 배포

### 2.6 Ollama 연동(보조 엔진) — CRUD와의 관계

**Ollama는 CRUD의 저장소가 아니다.** 진실 공급원(SoT)은 **PostgreSQL**이며, Create/Update/Delete는 **Admin API → DB** 경로로만 확정된다. Ollama는 아래 **보조** 역할만 담당한다.

| 역할 | 설명 | 결과가 쌓이는 곳 |
| :--- | :--- | :--- |
| **임베딩 생성** | 용어 설명(또는 정규화 텍스트)을 고정 모델로 벡터화 | `nexa_glossary_vectors` (UPSERT) |
| **초안 제안(선택)** | `definitions` JSONB, `ko_label` 등 초안 생성 → 사람이 검토 후 저장 | 검증 통과 시에만 `nexa_glossary_definitions` 등 |
| **검색 보조** | 라우팅 단계에서 의미 유사 후보 보강(벡터 검색) | 응답 조합용, DB 원천 변경 아님 |

**운영 규칙**

- 임베딩 모델·차원은 **명세와 DDL에서 고정**(예: `nomic-embed-text`, `VECTOR(768)`). 모델 변경 시 기존 벡터는 동일 의미 공간이 아니므로 **재생성 정책**을 따른다.
- **불변 토큰**·승인 큐 대상은 Ollama 출력을 **직접 반영하지 않는다**. 초안 → `change_requests` → 승인 후 반영.
- 서버 연동 구현 참고: `server/domains/ai/ai.service.ts`(Ollama provider), 스키마·검증: `src/system/schemas/ai_responses.ts` 등 플랫폼 AI 계약.

**권장 API(예시)**

- `POST /glossary/terms/{id}/embeddings/refresh` — 해당 용어 벡터 재계산·저장
- (선택) `POST /glossary/terms/draft` — LLM 초안만 반환, 저장은 별도 `POST/PATCH`로 분리

---

## 3) 운영 데이터 흐름

1. Admin이 용어/토큰/문서참조 등록
2. Crawler가 `src/docs/` 변경을 감지해 참조 자동 갱신
3. Packager가 지능 위계별 패키지 생성 후 배포
4. Routing Adapter가 입력을 정규화하고 중의성 해소
5. Indicator가 영문 결과를 생성
6. Localization Adapter가 한국어 요약으로 출력
7. 모든 변경/승인 이벤트는 감사 로그에 적재

---

## 4) 보강된 운영 정책

### 4.1 지능 위계별 차등 배포 정책
- `nano`: `definitions.nano` + 필수 토큰만 포함한 경량 JSON/바이너리
- `micro`: `nano` + 일부 문맥 규칙/벡터 메타 포함
- `vista`: 전체 정의 + 참조 + 벡터 + 정책 정보
- Nano(ESP32)는 전체 DB 미탑재 원칙을 따른다.

### 4.2 문맥 기반 중의성 해소 정책
- 동일 `term_key`가 다중 의미를 가질 경우, 현재 헥사곤 컨텍스트를 우선 사용
- 예: `CORE`
  - `where_scope` 가중치 우세 -> 주권 의미(Where.CORE)
  - `what_intent` + 펌웨어 문맥 우세 -> Base-Core 의미

### 4.3 역방향 로컬라이제이션 정책 (EN -> KO)
- 출력 문장은 다음 순서로 생성:
  1) `term_key`별 `ko_label` 매핑
  2) `definitions.vista.summary` 문장 템플릿 적용
  3) 실행 상태/안전 조건 문구 결합
- 사용자는 한국어 설명을 보되, 내부 근거는 영문 IR을 유지한다.

### 4.4 불변 토큰 승인 정책
- `is_immutable=true` 대상 변경은 즉시 반영 금지
- 변경 요청은 `change_requests` 큐에 적재
- 승인 후에만 본 테이블 반영

---

## 5) 최소 API 계약(권장)

- `POST /glossary/terms`
- `PATCH /glossary/terms/{id}`
- `POST /glossary/terms/{id}/tokens`
- `POST /glossary/terms/{id}/references`
- `POST /glossary/search`
- `POST /glossary/localize` (EN -> KO 요약)
- `POST /glossary/change-requests` (불변 토큰 변경 요청)
- `POST /glossary/change-requests/{id}/approve`
- `POST /glossary/change-requests/{id}/reject`
- `POST /glossary/docs/sync` (crawler 실행)
- `POST /glossary/distribution/build` (배포 패키지 생성)

---

## 6) 수용 기준 (Definition of Done)

- 차등 배포 패키지가 nano/micro/vista로 분리 생성된다.
- `CORE` 같은 중의어 입력에서 컨텍스트 기반 분기가 재현된다.
- 영문 결과가 한국어 summary로 일관되게 변환된다.
- 문서 변경 시 `doc_ref_path`, `doc_anchor` 자동 동기화가 동작한다.
- 불변 토큰 변경은 승인 전 반영되지 않는다.
