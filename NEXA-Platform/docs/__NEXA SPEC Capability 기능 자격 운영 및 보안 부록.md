# SPEC: 기능 자격(Capability) 운영·보안 부록

본 문서는 [__NEXA Capability ID 체계와 발급 및 Tier 접근 권한.md](./__NEXA%20Capability%20ID%20체계와%20발급%20및%20Tier%20접근%20권한.md)에서 분리한 **5.8~5.14절** 상세 본문이다. 아래 소제목 번호(5.8, 5.9, …)는 상위 문서와 동일한 참조를 유지한다.

**표기:** 한글은 **기능 자격**, 코드·DB·API 식별자는 `Capability`·`capabilities` 등 기존 영문을 유지한다.

---

### 5.8 Defense in Depth 상세 전략

#### 5.8.1 토큰 페이로드 최적화 및 수명 전략

- JWT에는 Tier ID 중심 저장
- 기능 자격 목록은 Redis/메모리 캐시 조회
- `exp` 필수
- 세션 귀속성(session binding) 적용
- 고위험 기능 자격(중장비 제어)은 접속 시 Rotation

#### 5.8.2 API 미들웨어 자동화

라우트 메타의 `requiredCapability`를 공통 미들웨어에서 일괄 검사한다.

### 5.9 성능 및 확장성

#### 5.9.1 캐싱 전략

- hasCapability는 고빈도 검사
- Tier별 권한 목록 캐시 필수
- active 필터 필수
- 동기화/매핑 변경/status 변경 시 캐시 무효화

#### 5.9.2 오케스트레이터 풀 ID 캐시

- Full_ID(`system.user`)를 Redis 키로 캐싱
- 런타임 문자열 결합 대신 O(1) 조회

#### 5.9.3 프론트엔드 최적화

- 트리 권한을 평면 배열로 전달
- `Set`/`includes` 기반 단순 검사

### 5.10 즉시 적용 + 사후 승인 + 관리자 즉시 전파

요구사항 충돌 해소를 위해 다음 운영 모델을 확정한다.

1. **즉시 적용(임시 효력):**

   - 신규 사용자 기능 자격(User Capability)은 생성 직후 `provisional` 상태로 즉시 사용 가능
   - 단, 위험 액션은 실행 레벨에서 Guardrail 재검사

2. **사후 승인(정식 효력):**

   - `fit_score` 고득점: 자동 승인 가능
   - 모호/저득점: 관리자 수동 승인 큐로 이동

3. **거절 시 자동 무효화/롤백:**

   - `capability_proposals.status = rejected` 전환 시
     - 연관 액션/데이터를 자동 무효화(Invalidate) 또는 롤백
     - 무효화/롤백 본처리는 동기 API 트랜잭션이 아닌 **비동기 큐(Job Queue)** 에 적재하여 처리
     - 감사 로그 및 사유(`rejection_reason`) 기록

4. **관리자 수정 권한 + 즉시 전파:**

   - 관리자는 신규 발급 ID의 라벨/설명/매핑/상태를 수정 가능
   - 수정 즉시 반영 대상:
     - `capabilities` 메타데이터
     - Tier 매핑 캐시
     - 오케스트레이터 Full_ID 캐시
   - 캐시 무효화 후 재적재를 동기 트랜잭션 또는 이벤트 기반으로 즉시 수행

5. **운영 상태값 권장:**
   - `provisional` (즉시 적용 임시)
   - `approved` (정식 승인)
   - `rejected` (거절/무효화 완료)

### 5.11 자동발급-사후관리-보안 연계 모델

자동발급은 편의 기능이 아니라 보안 통제 파이프라인의 시작점으로 취급한다.

| 단계      | 보안 연결 포인트      | 통제 방식                                                      |
| :-------- | :-------------------- | :------------------------------------------------------------- |
| 요청 수집 | 입력 위변조/오남용    | 사용자 입력은 `label`, `description`, `request_context`만 허용 |
| 후보 생성 | 임의 권한 확장 차단   | 태그 클라우드 화이트리스트 외 추천 금지                        |
| ID 발급   | 시스템 영역 침범 차단 | `usr.` 접두사 강제 + 예약어 차단                               |
| 즉시 적용 | 과도 권한 전파 차단   | `provisional` 상태는 위험 액션 제한                            |
| 사후 승인 | 오판 정정/회수        | `fit_score` + 관리자 검토 + 승인/거절                          |
| 수정 전파 | 정책 불일치 제거      | 캐시 무효화/재적재로 즉시 일관성 회복                          |
| 감사 추적 | 포렌식/컴플라이언스   | 발급/수정/거절/무효화 전 이벤트 기록                           |

핵심 원칙:

- 자동발급 결과는 기본적으로 "제한된 권한"으로 시작한다.
- 승인 전에는 고위험 기능 자격과 결합할 수 없다.
- 승인/거절/수정 이벤트는 모두 감사 테이블에 남긴다.

### 5.12 악의적 대량 발급 대응 전략

대량 생성·봇 호출·권한 위장 시도를 아래 다층 전략으로 방어한다.

#### 5.12.1 발급 전 차단 (Pre-Issue)

- 요청 속도 제한(Rate Limit): 사용자/세션/IP 단위 분당 발급 요청 상한
- 쿨다운(Cooldown): 동일 사용자의 연속 발급 간 최소 간격 강제
- 동시 처리 제한: 사용자별 `pending` 건수 상한 (예: 3개)
- 템플릿 기반 요청만 허용: 자유 문자열 신규 ID 생성 경로 차단

#### 5.12.2 발급 중 제약 (In-Issue)

- `fit_score` 하한 미달 시 자동 반려 또는 관리자 강제 검토 큐 이동
- 유사 ID 중복 감지: 동일/유사 라벨·설명 반복 생성 차단
- 고위험 도메인 차단: `provisional` 상태에서 제어/배포/삭제 계열 기능 자격 사용 불가

#### 5.12.3 발급 후 감시 (Post-Issue)

- 이상 탐지 지표:
  - 단시간 대량 생성 수
  - 승인 거절률 급증
  - 특정 사용자/테넌트 편중
  - 동일 패턴 반복 요청
- 임계치 초과 시 자동 조치:
  - 사용자 발급 기능 일시 정지
  - 신규 `provisional` 일괄 비활성
  - 관리자 보안 알림 생성

#### 5.12.4 복구/사후 조치 (Recovery)

- 자동 무효화(Invalidate): 거절된 proposal 연계 자격 즉시 차단
- 롤백: 해당 자격으로 생성된 실행/데이터를 복구 정책에 따라 회수
- 블랙리스트/위험도 점수: 반복 악용 주체의 추가 요청 사전 차단

#### 5.12.5 운영 파라미터(권장 기본값)

| 항목                | 권장값(초안)              |
| :------------------ | :------------------------ |
| 사용자 발급 요청    | 분당 5건 이하             |
| `pending` 동시 건수 | 사용자당 최대 3건         |
| 자동 승인 하한      | `fit_score >= 90`         |
| 수동 검토 구간      | `70 <= fit_score < 90`    |
| 자동 거절 구간      | `fit_score < 70`          |
| 임시 권한 TTL       | `provisional` 24시간 만료 |

### 5.13 미승인 사용자 기능 자격(User Capability)의 샌드박스 한정 유효성

정식 승인 전 사용자 기능 자격(User Capability)은 운영 영역에서 직접 실행되지 않고, 샌드박스 컨텍스트에서만 유효하도록 강제할 수 있다.

#### 5.13.1 상태-실행영역 매핑 규칙

| 상태          | 실행 가능 영역          | 비고                         |
| :------------ | :---------------------- | :--------------------------- |
| `provisional` | `sandbox`만 허용        | 운영/실장치/관리 액션 금지   |
| `approved`    | `sandbox`, `production` | 정책에 따라 단계적 확장 가능 |
| `rejected`    | 없음                    | 즉시 무효화                  |

#### 5.13.2 인가 미들웨어 강제 로직

인가 시점에 `capability_status`와 `execution_context`를 함께 검사한다.

```ts
function canExecute(capabilityStatus: 'provisional' | 'approved' | 'rejected', executionContext: 'sandbox' | 'production'): boolean {
  if (capabilityStatus === 'rejected') return false
  if (capabilityStatus === 'provisional') return executionContext === 'sandbox'
  return true // approved
}
```

추가 가드:

- `provisional` 상태는 고위험 액션(`device.write`, `archive.delete`, `admin.*`) 항상 차단
- `provisional` + TTL 만료 시 자동 비활성

#### 5.13.3 DB/캐시 반영 포인트

- `capability_proposals.status`: `provisional`/`approved`/`rejected`
- `capability_proposals.scope`: 기본값 `sandbox_only`
- `capabilities.activation_scope`: `sandbox_only` 또는 `production`
- `approved_at`, `approved_by` 감사 필드 유지

승인 이벤트 발생 시 즉시 전파:

1. `status`를 `approved`로 전환
2. 샌드박스 전용 매핑 정책 갱신
3. 운영 매핑(`tier_allowed_capabilities` 등) 추가
4. Tier 캐시/Full_ID 캐시 무효화 후 재적재

#### 5.13.4 샌드박스 연동 권장

- `sandbox_profile_capabilities`에 `provisional` 상태 기능 자격만 연결
- 오케스트레이터는 실행 전 프로필별 허용 기능 자격 조회
- 샌드박스 외 컨텍스트에서 `provisional` 기능 자격 발견 시 즉시 403 차단 + 보안 로그 기록

### 5.14 승인 거절 시 롤백·격리 실행 규약 (Traceability 연동)

`capability_proposals.status = rejected` 전환 시, 단순 권한 회수에 그치지 않고 연관 데이터/실행 체인을 함께 정리한다.

성능 원칙:

- `rejected` 전환 API는 빠르게 상태만 저장하고 즉시 응답한다.
- 실제 무효화/롤백/격리 작업은 `capability_invalidation_queue`(이벤트/잡 큐)에서 비동기로 처리한다.
- 큐 작업은 idempotent(재시도 안전)하게 구현한다.

#### 5.14.1 참조 사슬 추적(Traceability Link) 규약

모든 사용자 데이터는 생성 시점의 proposal 식별자를 함께 기록한다.

- `project_logs.extra_data.capability_proposal_id`
- `project_knowledge.metadata.capability_proposal_id`
- 실행 상태 스냅샷은 `post_state_snapshot`(JSON)로 저장

식별 규칙:

1. `rejected`된 `proposal_id` 조회
2. 해당 `proposal_id`를 큐에 enqueue (`job_type = capability_rejection_invalidation`)
3. 워커가 `project_logs`, `project_knowledge`, 실행 체인 레코드를 일괄 식별
4. 식별 대상에 대해 상태 전이/롤백/격리 순서로 처리

#### 5.14.2 Nature Tag 기반 상태 전이 규약

승인 거절 시 데이터 성격에 따라 상태를 강제 전이한다.

- `INTENT` 성격 데이터: `VOID.PURGE`로 전이
- 실행 중(`FLOW`) 체인: `STUCK`으로 전이 후 권한 부족 알림

SQL 예시(문서 규약):

```sql
-- A) INTENT -> VOID.PURGE (지식 레이어)
UPDATE project_knowledge
SET
  how_state = 3, -- VOID
  extra_data = COALESCE(extra_data, '{}'::jsonb)
    || '{"void_stage":"PURGE","invalid_reason":"proposal_rejected"}'::jsonb
WHERE metadata->>'capability_proposal_id' = :proposal_id
  AND nature_tag = 'INTENT';

-- B) FLOW -> STUCK (실행/로그 레이어)
UPDATE project_logs
SET
  how_state = 2, -- STUCK
  extra_data = COALESCE(extra_data, '{}'::jsonb)
    || format('{"stuck_reason":"proposal_rejected","capability_proposal_id":"%s","ui_signal":"JITTER"}', :proposal_id)::jsonb
WHERE extra_data->>'capability_proposal_id' = :proposal_id
  AND how_state = 1; -- FLOW
```

#### 5.14.3 물리적 롤백 및 지능적 격리 규약

1. **데이터 롤백**

   - `post_state_snapshot`을 기준으로 변경 전 안전 상태로 원복
   - 장치/설정 변경은 snapshot 기반 롤백 실행 Job으로 처리

2. **지능적 격리**
   - 삭제 불가 기록은 `invalidated_by_proposal_id = :proposal_id`로 마킹
   - RAG 검색 대상에서 제외 (`invalidated_by_proposal_id IS NULL` 조건)

SQL 예시(격리):

```sql
-- C) 삭제 불가 레코드 격리 마킹
UPDATE project_knowledge
SET
  metadata = COALESCE(metadata, '{}'::jsonb)
    || format('{"invalidated_by_proposal_id":"%s","invalidated_at":"%s"}', :proposal_id, now())::jsonb
WHERE metadata->>'capability_proposal_id' = :proposal_id;
```

RAG 조회 규칙:

- 기본 검색 쿼리에 `invalidated_by_proposal_id`가 없는 데이터만 포함
- 예: `WHERE COALESCE(metadata->>'invalidated_by_proposal_id','') = ''`

#### 5.14.4 처리 순서(권장)

1. proposal 상태 `rejected` 전환
2. `capability_invalidation_queue`에 작업 enqueue (`proposal_id`, `requested_at`, `retry_count`)
3. 워커가 참조 사슬 식별(로그/지식/실행 체인)
4. 실행 체인 `FLOW -> STUCK`
5. snapshot 롤백 실행
6. 삭제 불가 데이터 격리 마킹
7. 캐시 무효화(권한/Full_ID/RAG 인덱스 캐시)
8. 감사 로그 및 사용자 알림(Jitter + 메시지)

큐 운영 권장:

- 우선순위 큐: `high`(실행 체인 중단), `normal`(지식 격리), `low`(통계 후처리)
- 재시도: 지수 백오프 + 최대 재시도 횟수 제한
- DLQ(Dead Letter Queue): 반복 실패 건 격리 후 관리자 경고
