# KNOWLEDGE GUIDE 시스템 구축 순서 및 로드맵

본 문서는 NEXA Knowledge OS 구축을 실제 작업 순서로 실행하기 위한 가이드다.  
**플랫폼 전체**(Knowledge 외 오케스트레이션·UI·도메인 AI) 구현 순서는 `_NEXA GUIDE 플랫폼 구현 단계 및 로드맵.md`를 본다.

기준 문서:

- `_KNOWLEDGE RULE 지식 자산 관리 표준 계약 및 규약.md` (상위 계약·**§5 안전 축**)
- `_KNOWLEDGE SPEC CRUD 테이블 및 필드 명세서.md`
- `_KNOWLEDGE DDL 통합 스키마 및 물리 설계(SSOT).md`
- `_KNOWLEDGE ARCH 지식 운영체제(K-OS) 운영 아키텍처.md` (**§0** 지식 스펙트럼 · **§1-B** 안전 요약 · **§1-C** OS적 보강 5가지 · **§1-D** AI·LLM 입문)

**범위·후속 고도화:**

> 본 GUIDE는 **Knowledge OS 스키마·Admin·라우팅 최소 루프** 구축 순서를 다룬다.
> 오케스트레이션 정책·실행 사슬·AI·도메인 추론의 본격 고도화는 `_NEXA GUIDE 플랫폼 구현 단계 및 로드맵.md` **3~5단계** 및 오케스트레이션 명세에서 진행한다.
> `_KNOWLEDGE REF *` **§1-B**에 정리된 **REF 문서의 마무리 수준(경로·경계 SSOT)**과 동일 원칙을 따른다.

---

## 0단계: 착수 전 준비

### AI 사용 설계를 처음 읽는 분께

- LLM(Ollama 등)은 **토큰 한도·추론 시간·검색 비용** 같은 **제한된 자원** 안에서 동작한다. Knowledge OS는 모델 자체를 바꾸기보다, **지식을 어떻게 나누고 찾고 검증할지**를 DB·규칙으로 고정해 그 자원을 **덜 낭비**하게 만든다.
- **“토큰만 줄인다”**로만 이해하면 일부 테이블(감사·경로·헬스)의 목적이 어긋난다. 넓게는 **속도·정확도·안전**까지 포함해 보면 된다. 요약 표는 `_KNOWLEDGE ARCH 지식 운영체제(K-OS) 운영 아키텍처.md` **§1-D**를 본다.
- OS 보강 테이블(명세 §2.9~)은 **스키마**이고, 실제로 프롬프트를 짧게 만드는 것은 **앱이 이 테이블을 읽어 적용하는 로직**과 함께 동작할 때 완성된다.

### 작업

- 환경 확인: PostgreSQL, 확장(`timescaledb`, `vector`, `pg_uuidv7`) 사용 가능 여부
- 문서 기준 확정: 위 **기준 문서 목록**을 SSOT로 고정
- DB 생성/DDL 적용 방식 확정: **DBeaver에서 직접 실행**으로 고정
- 책임 구분 확정:
  - DB/마이그레이션 담당
  - Admin UI/API 담당
  - Routing/Localization 담당
  - Crawler/Packager 담당

### 체크리스트

- [ ] 대상 DB 백업 완료
- [ ] DDL 적용 순서 합의 완료
- [ ] 롤백 스크립트 준비 완료
- [ ] 운영/스테이징 환경 분리 확인
- [ ] DBeaver 연결 프로필(대상 DB/계정/권한) 확인 완료

---

## 1단계: 데이터 모델 확정 및 마이그레이션

### 작업

- 핵심/보강 테이블 10개 생성
- 제약/인덱스/하이퍼테이블 반영
- `uuid_generate_v7()` fallback 함수 보장
- DDL은 **DBeaver SQL Editor에서 순차 실행**(블록 단위)

### 산출물

- 초기 마이그레이션 파일
- 스키마 적용 리포트(성공/실패 테이블 목록)

### 체크리스트

- [ ] `nexa_knowledge_definitions` 생성
- [ ] `nexa_term_tokens` 생성 + `layer_type` CHECK
- [ ] `nexa_knowledge_references` 생성 + `capability_id NOT NULL`
- [ ] `nexa_knowledge_vectors` 생성 + HNSW 인덱스
- [ ] `nexa_knowledge_audit_logs` 생성 + hypertable 적용
- [ ] `nexa_knowledge_error_patterns` 생성 + review_status 인덱스 적용
- [ ] 보강 테이블 3개(`distribution_profiles`, `doc_sync_state`, `change_requests`) 생성
- [ ] 필수 인덱스 생성 완료
- [ ] DBeaver에서 테이블/인덱스/제약 생성 결과 확인 완료

---

## 2단계: Admin CRUD + 승인 큐 구현

### 작업

- 용어/토큰/참조 CRUD API 및 UI 구현
- 불변 토큰 변경 요청은 즉시 반영 금지, 승인 큐로만 진입
- 승인/반려/수정 이력 감사 로그 적재

### 산출물

- 관리자 CRUD 화면
- 승인 대기 큐 화면
- 감사 로그 조회 화면

### 체크리스트

- [ ] 용어 생성/수정/비활성 동작
- [ ] 토큰 매핑 생성/수정/비활성 동작
- [ ] 문서/Capability 참조 연결 동작
- [ ] `is_immutable=true` 변경 요청이 큐로 이동
- [ ] 승인/반려 이벤트가 감사 로그에 기록

### UI 확인 가능 시점

- **최초 확인 가능:** 2단계 중반 (기본 CRUD 화면/승인 큐 화면의 동작 확인 가능)
- **실사용 형태 확인:** 2단계 종료 시점 (관리자 CRUD + 승인 큐 + 감사 로그 조회까지 일관 흐름 확인 가능)

---

## 3단계: 라우팅 연동 + 중의성 해소

### 작업

- 정확 매칭 + 벡터 매칭 결합
- 컨텍스트 기반 의미 분기(`where_scope`, `what_intent` 등)
- `term_key -> token -> capability` 연쇄 추천

### 산출물

- 라우팅 결과 객체
- 중의성 테스트 케이스(`CORE` 등)

### 체크리스트

- [ ] 입력 텍스트에서 용어 후보 추출
- [ ] 후보별 `confidence_score` 산출
- [ ] `routing_state`(`EXECUTABLE/ASK/REJECTED`) 반환
- [ ] 다중 후보 상위 N개 제시 로직 동작

### UI 확인 가능 시점

- **관리자 관점:** 3단계 종료 시점 (후보/점수/분기 상태가 Admin 화면에서 확인 가능)
- **사용자 설명 관점:** help 도메인 연동 후(보통 4~5단계 사이)부터 라우팅 설명 UI 구성 가능

---

## 4단계: 역방향 로컬라이제이션 (EN -> KO)

### 작업

- `term_key -> ko_label` 역참조
- `definitions.vista.summary` 기반 한국어 요약 문장 생성
- 상태/안전 문구 결합 템플릿 적용

### 산출물

- 표준 한국어 Summary 생성기

### 체크리스트

- [ ] EN 결과에서 핵심 용어 추출
- [ ] KO 라벨 매핑 성공
- [ ] Summary 템플릿 적용 성공
- [ ] 상태값(`ASK`, `REJECTED` 등) 문구 일관성 확보

### UI 확인 가능 시점

- **즉시 확인 가능:** 4단계 후반 (라우팅 결과의 KO 요약 문구를 UI에서 확인 가능)
- **권장 검증 화면:** `RoutingExplainView` 또는 관리자 결과 패널

---

## 5단계: 문서 자동 동기화(Crawler)

### 작업

- `src/docs/` 해시/변경시각 기반 변경 감지
- anchor/tag 파싱
- `doc_ref_path`, `doc_anchor`, `source_hash` 자동 갱신

### 산출물

- 문서 동기화 배치/잡
- 동기화 상태 대시보드(`ok/changed/missing/conflict/error` — SPEC §2.2·SCHM §6)

### 체크리스트

- [ ] 신규/수정 문서 탐지
- [ ] 삭제·미발견 문서 감지 시 **`traceability_paths` §4.4.1** 전이(`missing_since`·`status`); 같은 패스에서 `doc_sync_state` 보조 갱신
- [ ] 앵커 파싱 정확도 검증
- [ ] 참조 테이블 자동 갱신
- [ ] 실패 시 `last_error_code`·`lock_metadata` 기록
- [ ] 삭제 문서 참조(`nexa_knowledge_references`) `status=0` 비활성화
- [ ] 삭제/복구 이벤트 감사 로그 기록 검증
- [ ] `error_token` 기록 품질 검증(누락/과다 분류 점검)

### UI 확인 가능 시점

- **운영 화면 확인 가능:** 5단계 종료 시점 (동기화 상태 대시보드 `ok/changed/missing/conflict/error` 확인 가능)
- **족보 시각화 확인 가능:** 5단계 이후 (`DependencyMap`에서 Doc-Term-Capability 연결 확인)

---

## 6단계: 지능 위계별 차등 배포

### 작업

- `nano/micro/vista` 프로파일별 추출 규칙 적용
- 하드웨어 프로파일(`COLD/WARM/HOT`)과 배포 프로파일 매핑(`nexa_knowledge_distribution_bindings`) 구성
- 경량 패키지(JSON/BIN) 생성
- OTA 채널 배포 및 버전 관리

### 산출물

- 프로파일별 배포 아티팩트
- 배포 이력

### 체크리스트

- [ ] `nano` 패키지 크기 제한 준수
- [ ] `COLD` 대상은 `nano`만 매핑됨
- [ ] `COLD` 대상 패키지는 `include_vectors=false`, `required_tokens_only=true`, `max_payload_kb < 10` 충족
- [ ] `WARM` 대상 패키지는 `max_payload_kb <= 256` 충족
- [ ] `HOT` 대상 패키지는 `max_payload_kb <= 4096` 충족
- [ ] `micro`/`vista` 데이터 포함 범위 검증
- [ ] OTA 채널별 배포 성공
- [ ] `version_tag` 증가 규칙 적용

### UI 확인 가능 시점

- **관리 UI 확인 가능:** 6단계 종료 시점 (프로파일별 배포 이력/버전 상태 확인 가능)
- **최종 사용자 체감 확인:** 실제 배포 채널 반영 후 (nano/micro/vista별 응답/표현 차이 검증)

---

## 6-1단계: 자가 회복 피드백 루프

### 작업

- 오류 로그(`nexa_knowledge_audit_logs`)에서 `error_token`/`error_signature` 집계
- `nexa_knowledge_error_patterns` 업데이트 배치 구성
- AI 규칙 수정 제안(`suggested_rule_patch`) -> 승인 큐(`nexa_knowledge_change_requests`) 연동

### 산출물

- 오류 패턴 집계 잡
- 관리자 검토 대시보드(패턴별 발생/영향/제안안)
- 규칙 제안 승인 워크플로

### 체크리스트

- [ ] `error_token` 분류 기준 문서화
- [ ] 반복 패턴 Top-N 집계 정확도 검증
- [ ] AI 제안이 승인 없이 반영되지 않음(강제)
- [ ] 승인/반려 결과가 `nexa_knowledge_error_patterns.review_status`에 반영

---

## 6-2단계: ES/VI 기반 응답 정책 분리

### 작업

- `nexa_knowledge_response_policies` 테이블 생성 및 기본 정책 시드
- ES/VI 입력값으로 `output_mode`(`easy/normal/expert`) 결정 로직 연동
- `easy` 모드에서 `easy_summary` 우선 출력 규칙 적용

### 산출물

- 응답 정책 테이블 + 기본 정책행(global)
- 모드 결정 API(`POST /knowledge/response/resolve-mode`)
- 정책 적용 테스트 리포트

### 체크리스트

- [ ] 임계값(ES/VI) 조정 시 DB 값만으로 동작 전환
- [ ] `definitions` JSONB에는 임계값을 저장하지 않음
- [ ] `Low-Entropy`에서 쉬운 요약 우선 출력 검증

---

## 6-3단계: Self 공통 자산 계층 구축 (`nexa_self_*`)

### 작업

- `nexa_self_profiles`/`nexa_self_facets`/`nexa_self_states` 테이블 구축
- `nexa_self_explosions`로 역방향 분해 맵(Explosion) 규칙 구성
- `nexa_self_knowledge_map` + `nexa_self_capability_links` 브리지 구축
- NEXU 경로/직접 경로 모두 동일 Self 해석 로직 적용

### 산출물

- Self 공통 자산 테이블 세트
- Self 해석/전개 API (`POST /self/resolve`, `POST /self/explosions/resolve`)
- 채널 독립형 Self 라우팅 검증 리포트

### 체크리스트

- [ ] `nexa_self_knowledge_map`은 원본 지식 저장이 아닌 브리지 역할만 수행
- [ ] NEXU 경유/직접 경로에서 동일 Self 규칙 결과 재현
- [ ] `Empty` 상태 포함 Self 전환 시나리오 테스트 완료

## 7단계: 운영 안정화

### 작업

- 실사용 로그 기반 사전 보강(동의어/예시/불용어)
- 임계값 및 점수 튜닝
- 거절/오탐 사례 분석 후 정책 보정

### 산출물

- 운영 튜닝 리포트
- 품질 지표 대시보드

### 체크리스트

- [ ] 오탐/미탐 사례 수집 체계 마련
- [ ] 승인 반려 사유 유형화
- [ ] 튜닝 전/후 품질 지표 비교
- [ ] 운영 가이드 문서 최신화

---

## 8단계: 최종 인수 기준 (Definition of Done)

- [ ] DDL과 CRUD 명세서가 1:1로 일치
- [ ] 10개 필수 테이블 생성 및 제약/인덱스 정상
- [ ] Admin CRUD/승인 큐/감사 로그 동작 확인
- [ ] 라우팅 + 중의성 해소 + KO Summary 재현 가능
- [ ] 문서 동기화 자동화 정상
- [ ] 차등 배포 프로파일(`nano/micro/vista`) 정상
- [ ] 운영 안정화 지표(정확도/승인율/오탐율) 확보

---

## 부록) UI 시연 가능 일정(권장)

- **첫 UI 데모:** 2단계 중반 (관리자 CRUD + 승인 큐 기본 흐름)
- **핵심 기능 데모:** 4단계 종료 (라우팅 결과 + KO 요약까지 확인)
- **운영 시나리오 데모:** 5단계 종료 (문서 동기화 + 의존성 맵)
- **최종 데모:** 6~7단계 종료 (배포 프로파일 + 운영 튜닝 반영)
