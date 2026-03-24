# NEXA Capability ID 체계와 발급 및 Tier 접근 권한

목적: Tier별 도메인·메뉴·기능 접근 제어를 위한 Capability ID 체계를 정의하고, DB 설계·동기화 로직을 문서화한다. Capability를 플랫폼의 일급 객체(First-Class Object)로 두어, 접근 제어를 넘어 연결·확장·사용 현황·성능 최적화의 기본 단위로 활용한다.  
참조 문서: `[NEXA-ADMIN-01]`, `[NEXA-AUTH-01]`  
문서 성격: 초안·검토용. 설계안 정리. 구현 전 충분한 검토 권장.  
작성일: 2025-03

---

## 0. 설계 의도 및 비전

### 0.1 배경

Tier별 접근 권한 제한은 이 체계의 첫 번째 적용 사례일 뿐이다. Capability를 단순한 권한 플래그가 아닌 플랫폼의 일급 객체(First-Class Object)로 취급하면, 이 기능들을 하나의 객체로 연결·확장하고, 사용 현황을 관리하여 성능 최적화 자료로 활용할 수 있다는 직감에서 본 설계가 출발한다.

### 0.2 Capability를 일급 객체로 취급할 때 가능해지는 것

| 관점           | 한글                       | 영문                                 | 설명                                                                                                                                       |
| :------------- | :------------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| 연결           | 역량 간·역량-리소스 매핑   | Linking / Association                | Capability ↔ 도메인·메뉴·API·이벤트를 서로 매핑. 의존 관계·조합 관계 표현 가능                                                            |
| 보안·우회 방어 | 세밀한 권한 검사·우회 차단 | Defense in Depth / Bypass Prevention | UI뿐 아니라 API·라우트·액션 전부 역량 ID로 검사. URL 직접 입력·API 호출 우회를 동일 규칙으로 차단. 감사 로그 연동 시 비정상 접근 탐지 용이 |
| 외부 확장      | 플러그인·서드파티 등록     | Extensibility / Plugin               | 플러그인·서드파티가 새 Capability를 선언·등록하면 기존 권한 체계에 자연스럽게 통합                                                         |
| 사용 현황      | 역량별 접근·호출 통계      | Usage Analytics                      | 역량 ID별 사용 빈도·사용자·세션 추적                                                                                                       |
| 성능 자료      | 핫패스·캐시·최적화         | Performance Insights                 | 자주 사용되는 역량/경로 파악 → 캐시 전략·핫패스 최적화·부하 분산 근거                                                                      |

### 0.3 확장 시나리오 예시

- 보안·우회 방어: UI 버튼 숨김 + 라우트 가드 + API 미들웨어 모두 `nexa.platform.archive.hub.export` 검사.
- 플러그인 등록: 외부 모듈이 `plugin.x.report` 역량 선언 → 동기화 후 관리자 UI 노출 → Tier 할당.
- 사용량 대시보드: 역량 호출 수/실행 빈도 시계열 차트.
- 성능 최적화: 역량별 평균 응답 시간·실패율 분석.
- 감사·컴플라이언스: 역량 단위로 "누가 무엇을 언제" 추적.

### 0.4 문서 내 범위

본 문서에서는 Capability ID 규칙·DB·동기화·Tier 매핑까지를 구체화한다. 사용 현황 수집·성능 분석·플러그인 확장 메커니즘은 별도 문서에서 정리한다.

---

## 1. 용어 정리

| 한글               | 영문(별칭)              | 설명                                                             |
| :----------------- | :---------------------- | :--------------------------------------------------------------- |
| 일급 객체          | First-Class Object      | 값처럼 다루고, 식별·연결·확장·분석의 기본 단위로 활용되는 엔티티 |
| 역량·권한·자격증   | Capability              | 특정 기능·메뉴·액션에 대한 접근 허용 단위                        |
| 역량 식별자        | Capability ID           | 역량을 구분하는 문자열 (예: `nexa.platform.archive.hub`)         |
| 등급               | Tier                    | 회원의 서비스 등급 (BASIC, STANDARD 등)                          |
| 접두사 매칭        | Prefix matching         | 상위 ID에 `.*` 와일드카드 명시 시 하위 전체 허용                 |
| 와일드카드         | Wildcard                | `.*`                                                             |
| 역량 레지스트리    | Capability Registry     | 코드에서 선언한 역량 정의의 소스 오브 트루스                     |
| 동기화             | Sync                    | 코드 레지스트리 ↔ DB 역량 메타데이터 일치 유지                  |
| 인간 친화적 라벨링 | Human-Friendly Labeling | `label`, `description` 등 의미 메타데이터                        |
| 시스템 역량        | System Capability       | 관리자 발급·관리. 권한·Tier·접근 제어 기준                       |
| 사용자 역량        | User Capability         | 사용자 정의. AI 협력 슬롯·페르소나·스킬·데스크 연계              |
| 태그 클라우드      | Tag Cloud               | AI 추천용 화이트리스트                                           |
| 적합성 점수        | Fit Score               | 사용자 설명과 AI 추천 역량 간 부합도                             |

---

## 2. Capability ID 계층 구조

### 2.0 발급 대상 및 다중 발급

- Capability ID는 엣지 디바이스뿐 아니라 플랫폼 UI·넥사패널에도 발급한다.
- 고유 ID(UUID)와 Capability ID는 분리한다.
- 하나의 엔티티에 다수 Capability를 부여할 수 있다.

### 2.1 계층 구조 (Hierarchy)

| depth | 계층   | 한글         | 영문          | 설명                     | ID 예시                           |
| :---- | :----- | :----------- | :------------ | :----------------------- | :-------------------------------- |
| 1     | 1단계  | 네임스페이스 | Namespace     | 플랫폼 식별. 필수        | `nexa`                            |
| 2     | 2단계  | 출처         | Origin        | 역량 소속 최상위. 필수   | `platform`, `edge`, `plugin`      |
| 3     | 3단계  | 영역/도메인  | Area          | 출처 내 세부 영역        | `panel`, `archive`, `parts`       |
| 4+    | 4단계+ | 메뉴·액션    | Menu / Action | 하위 메뉴·화면·구체 액션 | `hub`, `export`, `view`, `create` |

출처(Origin) 예시:

- `platform`(플랫폼 전체)
- `edge`(엣지 디바이스)
- `plugin`(플러그인·서드파티)

### 2.2 ID 형식 규칙 및 발급 룰

- 네임스페이스 `nexa` 필수
- 출처(Origin) 반드시 두 번째 세그먼트
- 문자 규칙: 영문 소문자·숫자·밑줄(`_`), 구분자는 점(`.`)
- 계층 깊이: 도메인·액션은 3~4단계 권장, 전체 5~6단계 이내

출처별 예시:

- `nexa.platform.archive.hub`
- `nexa.platform.archive.hub.export`
- `nexa.platform.panel.widget.dashboard.view`
- `nexa.platform.panel.controller.thermostat.set`
- `nexa.edge.device.sensor.read`
- `nexa.plugin.x.report.generate`

### 2.3 와일드카드 명시성 (Wildcard Explicitness)

| 저장값                        | 의미                               | 매칭되는 요청 ID                            |
| :---------------------------- | :--------------------------------- | :------------------------------------------ |
| `nexa.platform.archive`       | 정확히 해당 ID만 허용(하위 미포함) | `nexa.platform.archive`                     |
| `nexa.platform.archive.*`     | 해당 ID와 하위 전체 허용           | `nexa.platform.archive.hub`, `...export` 등 |
| `nexa.platform.archive.hub.*` | hub 및 하위 전체 허용              | `nexa.platform.archive.hub`, `...export` 등 |

설계 원칙:

- `.*`가 없으면 반드시 `===` 동일 비교
- `.*`가 있으면 접두사 매칭 적용

### 2.3.1 UI에서의 와일드카드 선택

| 옵션                           | 저장값 예시                   | 설명                     |
| :----------------------------- | :---------------------------- | :----------------------- |
| 이 메뉴만 허용                 | `nexa.platform.archive.hub`   | 해당 역량만, 하위 미포함 |
| 이 메뉴 및 모든 하위 기능 허용 | `nexa.platform.archive.hub.*` | 해당 역량 + 하위 전체    |

### 2.4 Capability 자격증 관점 및 Admin Capability Tool

#### 2.4.1 Capability = 자격증 시각

| 관점 | 설명                                  |
| :--- | :------------------------------------ |
| 발급 | 대상(Tier/엔티티)에 Capability 부여   |
| 폐기 | 엔티티는 유지, Capability만 회수      |
| 이력 | 누가·언제·무엇을 발급/폐기했는지 추적 |

#### 2.4.2 Admin Capability Tool 목적 및 기능

| 기능 | 한글                | 설명                         | DDL/API 관점               |
| :--- | :------------------ | :--------------------------- | :------------------------- |
| 발급 | 역량 부여           | 대상에 Capability ID 부여    | INSERT                     |
| 폐기 | 역량 회수           | 대상에서 Capability 제거     | DELETE 또는 Soft Delete    |
| 조회 | 역량 목록·소유 현황 | 대상별 보유/역량별 부여 현황 | SELECT, JOIN               |
| 이력 | 발급·폐기 이력      | 누가/언제/대상/역량 추적     | `capability_grant_history` |

#### 2.4.3 DDL 반영 요구사항 요약

- 발급·폐기 저장소: `tier_allowed_capabilities`
- 이력 보존: `capability_grant_history` 또는 감사 컬럼
- 고유 ID 분리: 발급 대상과 Capability ID 별도 컬럼
- 조회 성능: 인덱스 + Tier 캐시

### 2.5 시스템 역량 vs 사용자 역량 전략

#### 2.5.1 상하 관계 및 가시성

| 구분      | System Capability        | User Capability                      |
| :-------- | :----------------------- | :----------------------------------- |
| 발급 주체 | 시스템(관리자)           | 사용자                               |
| 가시성    | 사용자는 알 수 없음      | 사용자만 정의·관리                   |
| 용도      | 권한·Tier·접근 제어      | AI 협력 슬롯, 페르소나, 스킬, 데스크 |
| 조합      | 관리자 승인 시 조합 유효 | 즉시 적용 후 사후 승인               |

저장 원칙:

- `system_capability_id`, `user_capability_id` 별도 저장
- 풀 ID는 런타임 조합

#### 2.5.2 AI 협력 슬롯

사용자 정의 ID는 AI 협력 기반 슬롯으로 사용된다. 사용자 확정 시 우선 즉시 적용하고, 관리자 승인은 사후 워크플로로 수행한다.

#### 2.5.3 사용자 Capability 발급 워크플로우

| 단계 | 필드/행위        | 내용                                 |
| :--- | :--------------- | :----------------------------------- |
| 1    | ID 필드          | Read-only, 사용자 직접 입력 금지     |
| 2    | 사용자 설명 필드 | 목적·의도·상황 자연어 입력           |
| 3    | AI 제시          | 태그 클라우드 내 후보만 추천         |
| 4    | 선택·입력·확정   | 사용자 확정                          |
| 5    | 즉시 적용        | 관리자 승인 없이 우선 반영           |
| 6    | 관리자 페이지    | 승인 대기 목록 관리                  |
| 7    | 적합성 점수 처리 | 높으면 자동 승인, 모호하면 수동 검토 |

#### 2.5.4 보안: 사용자 ID 검증

- 예약 접두사/세그먼트 금지: `nexa`, `platform`, `panel`, `edge`, `plugin`, `admin`, `sys`, `system`
- 사용자 전용 네임스페이스 강제: `usr.`, `custom.`, `u.{userId}.`
- 허용 문자 제한
- 접근 제어는 `system_capability_id` 기준

#### 2.5.5 유통 시 암호화·토큰화

- 적용 구간: 클라이언트↔서버, 서비스 간 메시지, 클라이언트 저장
- 후보: 불투명 토큰, AES, HMAC
- 검사 시점: 서버 내부 평문 검사, 외부 유통은 보호 처리

#### 2.5.6 AI 사용 정책 (사용자 설정 영역)

- 로컬 AI 과금
- 무료 한도 배분
- 외부 클라우드 AI 사용 정책

Capability(무엇을 할 수 있는지)와 AI 사용 정책(어떻게 사용할지)을 분리한다.

#### 2.5.7 발급 주도권: 시스템 강제 원칙 (중요)

본 문서의 사용자 Capability는 "사용자 생성"이 아니라 "시스템 발급"이다.

- **ID 필드 Read-only:** 사용자는 Capability ID 문자열을 직접 입력/수정할 수 없다.
- **태그 클라우드 제한:** AI 추천은 관리자 등록 화이트리스트(Tag Cloud) 내부 후보로만 제한한다.
- **시스템 명명 규칙:** 사용자는 라벨/설명/의도 입력만 담당하며, 실제 ID는 시스템이 생성한다.
- **전용 네임스페이스 강제:** 사용자 계열은 `usr.` 접두사만 허용한다.
- **템플릿 구독형 발급:** 사용자 요청은 "새 ID 자유 생성"이 아니라 "시스템 제공 스킬 템플릿 구독/활성화"로 제한한다.

사용자 역할은 ID 설계가 아니라 의도 전달이다.

- 자연어 설명 입력
- AI 추천 후보 선택
- 라벨/설명 확정
- 즉시 사용

---

## 3. DB 스키마 설계

### 3.1 설계 원칙

- 역량 정의: 코드 레지스트리 SoT
- Tier 매핑: DB 저장
- FK: `tier_allowed_capabilities.capability_id -> capabilities.capability_id`

### 3.2 테이블 구성

#### 3.2.1 `tiers`

| 컬럼       | 타입               | 설명            |
| :--------- | :----------------- | :-------------- |
| id         | VARCHAR(36) PK     | UUID            |
| code       | VARCHAR(50) UNIQUE | BASIC, STANDARD |
| name       | VARCHAR(100)       | 표시명          |
| sort_order | INT                | 정렬 순서       |
| created_at | TIMESTAMPTZ        | 생성            |
| updated_at | TIMESTAMPTZ        | 수정            |

#### 3.2.2 `capabilities`

| 컬럼          | 타입                | 설명                                   |
| :------------ | :------------------ | :------------------------------------- |
| id            | VARCHAR(36) PK      | UUID                                   |
| capability_id | VARCHAR(200) UNIQUE | 예: `nexa.platform.archive.hub.export` |
| label         | VARCHAR(100)        | 표시 라벨                              |
| description   | VARCHAR(500)        | 상세 설명                              |
| type          | VARCHAR(20)         | domain/menu/action                     |
| parent_id     | VARCHAR(36) FK      | 부모 capability                        |
| source        | VARCHAR(50)         | registry/manual                        |
| status        | VARCHAR(20)         | active/inactive                        |
| sync_at       | TIMESTAMPTZ         | 마지막 동기화 시각                     |
| created_at    | TIMESTAMPTZ         | 생성                                   |
| updated_at    | TIMESTAMPTZ         | 수정                                   |

#### 3.2.3 `tier_allowed_capabilities`

| 컬럼          | 타입               | 설명                                                |
| :------------ | :----------------- | :-------------------------------------------------- |
| tier_id       | VARCHAR(36) PK,FK  | `tiers.id`                                          |
| capability_id | VARCHAR(200) PK,FK | `capabilities.capability_id` (와일드카드 포함 가능) |

#### 3.2.4 확장 포인트(추후): 사용 현황 수집

`capability_usage` 또는 이벤트 로그 테이블 추가 가능.

### 3.3 동기화 상태(Status) 및 Soft Delete

- `status`: active/inactive
- registry 삭제 감지 시 즉시 DELETE 대신 inactive 전환
- 관리자 확인 후 정리/복구

### 3.3.1 Soft Delete와 FK 충돌

- DELETE + CASCADE: 매핑 삭제됨
- UPDATE inactive: FK는 남음
- 해결: 권한 검사 시 active만 필터링 (캐시 구축 단계에서 필수)

### 3.4 Manual Source 위험성

`source='manual'`은 코드와 불일치 위험이 있어 제한적으로만 허용 권장.

### 3.5 사용자 ID 생성 통제용 DB 제약 (필수 반영)

사용자 영역 ID가 시스템 영역(`nexa.*`)을 침범하지 않도록 DB에서 강제한다.

- `user_capability_registry`(또는 동등 테이블)의 `user_capability_id`는 `usr.` 접두사 필수
- 예약어/시스템 접두사(`nexa.`, `platform.`, `edge.`, `plugin.` 등) 차단
- ID 생성 경로는 API 한 곳으로 고정(직접 INSERT 금지)

DDL 예시:

```sql
-- 사용자 Capability 전용 테이블 예시
-- 실제 테이블명은 구현안에 맞춰 조정 가능
ALTER TABLE user_capability_registry
ADD CONSTRAINT chk_user_capability_prefix
CHECK (user_capability_id LIKE 'usr.%');

-- 필요 시 예약어 차단 규칙 강화(예시)
ALTER TABLE user_capability_registry
ADD CONSTRAINT chk_user_capability_reserved_block
CHECK (
  user_capability_id NOT LIKE 'nexa.%'
  AND user_capability_id NOT LIKE 'platform.%'
  AND user_capability_id NOT LIKE 'edge.%'
  AND user_capability_id NOT LIKE 'plugin.%'
);
```

권장 운영:

- 사용자 입력값은 `label`, `description`, `request_context`만 받는다.
- `user_capability_id`는 서버에서만 생성한다.

---

## 4. 코드 레지스트리 (Capability Registry)

### 4.1 역할

- SoT
- 도메인·메뉴·기능 선언
- `domainRegistry` 확장 또는 별도 `capabilityRegistry`

### 4.2 선언 예시 및 라벨링

```ts
export const capabilityRegistry = {
  archive: {
    capabilityId: 'nexa.platform.archive',
    label: '아카이브',
    description: '플랫폼 아카이브 도메인 전체 접근',
    type: 'domain',
    submenus: [
      { capabilityId: 'nexa.platform.archive.hub', label: '아카이브 허브', description: '허브 화면 접근', route: 'NexaArchiveHub' },
      { capabilityId: 'nexa.platform.archive.studio', label: '아카이브 스튜디오', description: '스튜디오 화면 접근', route: 'NexaArchiveStudio' },
      {
        capabilityId: 'nexa.platform.archive.hub.export',
        label: '아카이브 허브 내보내기',
        description: '엑셀 다운로드 권한',
        type: 'action',
      },
    ],
  },
  parts: {
    /* ... */
  },
}
```

---

## 5. 동기화 로직 (Sync Logic)

### 5.1 소스

서버 기동 시 레지스트리를 메모리에 로드하고, 동기화/허용 체크는 메모리 객체 기준으로 수행한다.

### 5.2 실행 흐름

1. 레지스트리 재귀 순회로 플랫 리스트 추출
2. DB 현재 목록 조회
3. Diff 처리
   - 메모리 있음/DB 없음: INSERT (`source='registry'`)
   - 메모리 없음/DB 있음 + registry: `status='inactive'`
   - 메모리/DB 모두 있음 + 메타 다름: UPDATE
   - 메모리 없음/DB 있음 + manual: 유지
4. 트랜잭션 반영 + 결과 요약

### 5.3 Diff 결과 요약

| 구분        | 메모리 | DB                | 처리          |
| :---------- | :----- | :---------------- | :------------ |
| 신규        | 있음   | 없음              | INSERT        |
| 삭제/비활성 | 없음   | 있음(registry)    | inactive 전환 |
| 수정        | 있음   | 있음(메타 불일치) | UPDATE        |
| 유지        | 없음   | 있음(manual)      | 변경 없음     |

### 5.4 Soft Delete 정책

- registry 제거 감지 시 inactive
- inactive는 권한 검사 제외
- 관리자 UI 경고 표기

### 5.5 API 엔드포인트(제안)

| 메서드 | 경로                                | 설명                |
| :----- | :---------------------------------- | :------------------ |
| POST   | `/api/admin/capabilities/sync`      | 동기화 실행         |
| GET    | `/api/admin/capabilities`           | 역량 목록 조회      |
| GET    | `/api/admin/tiers/:id/capabilities` | Tier 허용 역량 조회 |

### 5.6 동기화 트리거(확정)

- 관리자 버튼(수동)
- 서버 부팅 시 1회(자동)

### 5.7 메모리 추출 의사 코드

```ts
interface FlatCapabilityEntry {
  capabilityId: string
  label: string
  description?: string
  type: string
}

function collectFromRegistry(registry: CapabilityRegistry): FlatCapabilityEntry[] {
  const out: FlatCapabilityEntry[] = []
  function walk(entry: { capabilityId: string; label?: string; description?: string; type?: string; submenus?: unknown[] }) {
    out.push({
      capabilityId: entry.capabilityId,
      label: entry.label ?? entry.capabilityId,
      description: entry.description ?? '',
      type: entry.type ?? 'menu',
    })
    entry.submenus?.forEach((s: { capabilityId: string; label?: string; description?: string; type?: string; submenus?: unknown[] }) => walk(s))
  }
  Object.values(registry).forEach(walk)
  return out
}
```

### 5.8 Defense in Depth 상세 전략

#### 5.8.1 토큰 페이로드 최적화 및 수명 전략

- JWT에는 Tier ID 중심 저장
- Capability 목록은 Redis/메모리 캐시 조회
- `exp` 필수
- 세션 귀속성(session binding) 적용
- 고위험 역량(중장비 제어)은 접속 시 Rotation

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

   - 신규 사용자 Capability는 생성 직후 `provisional` 상태로 즉시 사용 가능
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
- 승인 전에는 고위험 Capability와 결합할 수 없다.
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
- 고위험 도메인 차단: `provisional` 상태에서 제어/배포/삭제 계열 Capability 사용 불가

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

### 5.13 미승인 사용자 Capability의 샌드박스 한정 유효성

정식 승인 전 사용자 Capability는 운영 영역에서 직접 실행되지 않고, 샌드박스 컨텍스트에서만 유효하도록 강제할 수 있다.

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

- `sandbox_profile_capabilities`에 provisional Capability만 연결
- 오케스트레이터는 실행 전 프로필별 허용 Capability 조회
- 샌드박스 외 컨텍스트에서 provisional Capability 발견 시 즉시 403 차단 + 보안 로그 기록

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

---

## 6. 적용 사례

| 사용처       | 한글                | 용도                             |
| :----------- | :------------------ | :------------------------------- |
| Tier 설정    | 등급별 역량 매핑    | `tier_allowed_capabilities` 저장 |
| 라우트 가드  | 라우트 진입 전 검사 | URL 직접 입력 차단               |
| 컴포넌트     | 조건부 렌더링       | 버튼·메뉴 노출 제어              |
| API 미들웨어 | 엔드포인트 권한     | API 직접 호출 차단               |
| 감사 로그    | 행위 기록           | 비정상 접근 탐지 근거            |

### 6.1 단일 역량 매칭 (와일드카드 반영)

```ts
function matchesCapability(userAllowed: string, required: string): boolean {
  if (userAllowed.endsWith('.*')) {
    const prefix = userAllowed.slice(0, -2)
    return required === prefix || required.startsWith(prefix + '.')
  }
  return required === userAllowed
}
```

### 6.2 다중 역량 조건 (OR/AND)

```ts
type RequiredCapability = string | { any: string[] } | { all: string[] }

function hasCapability(userCapabilities: string[], required: RequiredCapability): boolean {
  const matchOne = (req: string) => userCapabilities.some((allowed) => matchesCapability(allowed, req))

  if (typeof required === 'string') return matchOne(required)
  if ('any' in required) return required.any.some(matchOne)
  if ('all' in required) return required.all.every(matchOne)
  return false
}
```

---

## 7. 구현 순서 제안

1. Capability ID 규칙·레지스트리 구조 문서화 + 초안 코드
2. `tiers`, `tier_allowed_capabilities` + CRUD API
3. `capabilities` + 동기화 API
4. 동기화 로직 구현
5. 관리자 UI Tier별 역량 선택/저장
6. 라우트 가드·API 미들웨어 적용

### 7.1 적용 전략

- 권장: 점진적 적용(신규/수정 시 반영)
- 전면 적용 필요 조건: 보안·컴플라이언스 즉시 강제 요구

---

## 8. 확정 사항 (검토 완료)

| 항목                                     | 결정                                                       |
| :--------------------------------------- | :--------------------------------------------------------- |
| 와일드카드 없음(`nexa.platform.archive`) | `===` 동일 비교만                                          |
| 부모 삭제                                | 하위 자식 모두 삭제/비활성                                 |
| 동기화 트리거                            | 수동 + 부팅 시 자동                                        |
| 네임스페이스                             | `nexa.` 필수                                               |
| 시스템/사용자 역량                       | 별도 컬럼 저장, 풀 ID는 오케스트레이션만 사용              |
| 사용자 ID 검증                           | 예약어 블록리스트 + 전용 네임스페이스                      |
| 유통 시 보호                             | 암호화 또는 불투명 토큰                                    |
| 사용자 Capability 발급                   | Read-only ID, 태그 클라우드 내 추천, 즉시 적용 + 사후 승인 |
| 대량 발급 방어                           | Rate Limit, pending 상한, 이상 탐지, 자동 정지/무효화      |
| 오케스트레이터 캐시                      | 미리 조합된 Full_ID Redis 키 조회                          |
| 토큰 수명                                | exp/세션 귀속 필수, 고위험 역량 Rotation                   |

---

## 9. 확장 도메인 (추후 문서화)

- 사용 현황 수집·분석(`capability_usage`)
- 성능 인사이트(응답 시간/실패율/핫패스)
- 플러그인 확장(등록·검증·네임스페이스)
- 사용자 Capability 상세(승인 워크플로·레지스트리)
- IoT 가상 시뮬레이션 도메인 및 샌드박스(V8 Isolate 후보)

---

## 10. DDL 반영 검토

- `[NEXA-DDL-01]`에 `tiers`, `capabilities`, `tier_allowed_capabilities` 추가 필요
- Admin Capability Tool 요구사항 반영:
  - 발급/폐기/조회/이력
  - `capability_grant_history`, 감사 컬럼
- 시스템/사용자 역량 분리 컬럼:
  - `system_capability_id`
  - `user_capability_id`
- 유통 암호화·토큰화는 API/미들웨어 레이어 처리

---

## 11. 관련 문서

- `[NEXA-ADMIN-01]` 관리자 도메인 기본 구성과 레이아웃
- `[NEXA-ADMIN-01]` 관리자 도메인 기획 초안
- `[NEXA-AUTH-01]` 계정·인증·권한
