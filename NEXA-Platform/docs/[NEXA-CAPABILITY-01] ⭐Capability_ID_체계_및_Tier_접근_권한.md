# [NEXA-CAPABILITY-01] Capability ID 체계 및 Tier 접근 권한

**목적**: Tier별 도메인·메뉴·기능 접근 제어를 위한 **Capability ID** 체계를 정의하고, DB 설계·동기화 로직을 문서화한다. Capability를 플랫폼의 **일급 객체(First-Class Object)** 로 두어, 접근 제어를 넘어 연결·확장·사용 현황·성능 최적화의 기본 단위로 활용한다.

**참조 문서**: [NEXA-ADMIN-01], [NEXA-AUTH-01]

**문서 성격**: **초안·검토용**. 설계안 정리. 구현 전 충분한 검토 권장.

**작성일**: 2025-03

---

## 0. 설계 의도 및 비전

### 0.1 배경

Tier별 접근 권한 제한은 이 체계의 **첫 번째 적용 사례**일 뿐이다. Capability를 단순한 권한 플래그가 아닌 **플랫폼의 일급 객체(First-Class Object)** 로 취급하면, 이 기능들을 하나의 객체로 연결·확장하고, 사용 현황을 관리하여 성능 최적화 자료로 활용할 수 있다는 직감에서 본 설계가 출발한다.

### 0.2 Capability를 일급 객체로 취급할 때 가능해지는 것

| 관점 | 한글 | 영문 | 설명 |
|------|------|------|------|
| **연결** | 역량 간·역량-리소스 매핑 | Linking / Association | Capability ↔ 도메인·메뉴·API·이벤트를 서로 매핑. 의존 관계·조합 관계 표현 가능 |
| **보안·우회 방어** | 세밀한 권한 검사·우회 차단 | Defense in Depth / Bypass Prevention | UI뿐 아니라 **API·라우트·액션** 전부 역량 ID로 검사 → URL 직접 입력·API 호출 우회를 동일한 규칙으로 차단. 감사 로그와 연동 시 비정상 접근 탐지 용이 |
| **외부 확장** | 플러그인·서드파티 등록 | Extensibility / Plugin | 플러그인·서드파티가 새 Capability를 선언·등록하면 기존 권한 체계에 자연스럽게 통합 |
| **사용 현황** | 역량별 접근·호출 통계 | Usage Analytics | 역량 ID별 사용 빈도·사용자·세션 추적 → 어떤 기능이 얼마나 쓰이는지 시각화 |
| **성능 자료** | 핫패스·캐시·최적화 | Performance Insights | 자주 사용되는 역량/경로 파악 → 캐시 전략·핫패스 최적화·부하 분산의 근거로 활용 |

### 0.3 확장 시나리오 예시

- **보안·우회 방어**: UI에서 버튼 숨김 + 라우트 가드 + API 미들웨어 모두 `archive.hub.export` 역량 검사 → 메뉴 우회·URL 직접 접근·API 직접 호출을 동일 규칙으로 차단. 실패 시 역량 ID 기준 감사 로그 기록
- **플러그인 등록**: 외부 모듈이 `plugin.x.report` 역량을 선언 → 동기화 후 관리자 UI에 노출 → Tier에 할당
- **사용량 대시보드**: `archive.hub` 호출 수, `parts.edit.create` 실행 빈도 시계열 차트
- **성능 최적화**: 역량별 평균 응답 시간·실패율 → 슬로우 역량 식별 후 캐싱·인덱싱 검토
- **감사·컴플라이언스**: 역량 단위로 "누가 무엇을 언제" 실행했는지 추적

### 0.4 문서 내 범위

본 문서에서는 **Capability ID 규칙·DB·동기화·Tier 매핑**까지를 구체화한다. 사용 현황 수집·성능 분석·플러그인 확장 메커니즘은 별도 문서에서 정리한다.

---

## 1. 용어 정리

| 한글 | 영문 (별칭) | 설명 |
|------|-------------|------|
| 일급 객체 | First-Class Object | 값처럼 다루고, 식별·연결·확장·분석의 기본 단위로 활용되는 엔티티 |
| 역량·권한 | Capability | 특정 기능·메뉴·액션에 대한 접근 허용 여부를 식별하는 단위. 본 문서에서는 일급 객체로 취급 |
| 역량 식별자 | Capability ID (capability identifier) | 역량을 구분하는 고유 문자열 (예: `archive.hub`) |
| 등급 | Tier | 회원의 서비스 등급 (BASIC, STANDARD 등) |
| 접두사 매칭 | Prefix matching | 상위 ID에 `.*` 와일드카드를 명시하면 하위 ID 전체 허용 (예: `archive.*`) |
| 와일드카드 | Wildcard | `.*` — 해당 역량과 그 하위 전체를 허용한다는 명시적 표기 |
| 역량 레지스트리 | Capability Registry | 코드에서 선언한 역량 정의의 소스 오브 트루스 (source of truth) |
| 동기화 | Sync (synchronization) | 코드 레지스트리 ↔ DB의 역량 메타데이터 일치 유지 |
| 인간 친화적 라벨링 | Human-Friendly Labeling | `archive.hub.export` 같은 ID 외에 label·description 등 관리자·사용자가 읽기 쉬운 메타데이터 포함 |

---

## 2. Capability ID 계층 구조

### 2.1 3단계 계층 (Hierarchy)

점(`.`) 구분 계층 구조를 사용한다. **접두사 매칭**은 `.*` 와일드카드를 명시할 때만 적용된다 (§2.3). 계층 깊이는 권고 4~5단계 이내로 유지하는 것을 권장한다 (§2.2).

| 계층 | 한글 | 영문 | depth | ID 예시 | 관리 범위 |
|------|------|------|-------|---------|-----------|
| 1단계 | 도메인 | Domain | 1 | `nexa.archive`, `nexa.parts` | 도메인 전체 접근 |
| 2단계 | 메뉴 | Menu | 2 | `nexa.archive.hub`, `nexa.parts.view` | 하위 메뉴·화면 접근 |
| 3단계 | 액션 | Action | 3~5 (권고) | `nexa.archive.hub.export`, `nexa.parts.edit.create` | 구체 기능 실행 권한 |

### 2.2 ID 형식 규칙

- **구분자**: 점(`.`) 사용
- **문자**: 영문 소문자·숫자·밑줄(`_`) 권장
- **네임스페이스 `nexa.`**: **필수 도입**. 외부 엣지·PC·다른 플랫폼 서비스와 구분하기 위해 최상위 접두사 `nexa.` 사용 (예: `nexa.archive`, `nexa.archive.hub`).
- **계층 깊이 권고**: 성능·가독성·유지보수를 위해 **최대 4~5단계**를 권장. 기술적 제한은 아니나 초과 시 검토 권장.

### 2.3 와일드카드 명시성 (Wildcard Explicitness)

현재처럼 `archive`가 `archive.hub`를 암묵적으로 포함하는 대신, **와일드카드를 명시**하여 개발자가 의도를 명확히 선택할 수 있도록 한다.

| 저장값 | 의미 | 매칭되는 요청 ID |
|--------|------|------------------|
| `nexa.archive` | 정확히 `nexa.archive`만 허용 (하위 미포함) | `nexa.archive` — **`===` 동일 비교만** |
| `nexa.archive.*` | `nexa.archive`와 그 하위 전체 허용 | `nexa.archive`, `nexa.archive.hub`, `nexa.archive.hub.export` 등 |
| `nexa.archive.hub.*` | `nexa.archive.hub`와 그 하위 전체 허용 | `nexa.archive.hub`, `nexa.archive.hub.export` 등 |

- **설계 원칙**: `.*`가 없으면 **반드시 `===` (동일 객체 비교)**. 하위 포함 없음. `.*`가 있으면 접두사 매칭 적용.
- **개발자 선택**: Tier 설정 시 "도메인 전체 허용" → `nexa.archive.*` 저장, "해당 메뉴만" → `nexa.archive.hub` 저장.
- **내부 처리**: `hasCapability` 등에서 `.*` 유무에 따라 매칭 로직 분기. 암묵 규칙 없이 코드상 명시적 처리.

#### 2.3.1 UI에서의 와일드카드 선택

권한 부여 시 **라디오 버튼** 또는 **체크박스**로 다음 두 옵션을 명확히 구분한다. UI가 선택에 따라 `.*`를 자동으로 붙여 저장하여, 운영 실수를 줄인다.

| 옵션 | 저장값 예시 | 설명 |
|------|-------------|------|
| **이 메뉴만 허용** | `nexa.archive.hub` | 해당 역량만. 하위 미포함. |
| **이 메뉴 및 모든 하위 기능 허용** | `nexa.archive.hub.*` | 해당 역량과 하위 전체. UI가 `.*` 자동 추가. |

- 관리자가 `.*` 문자열을 직접 입력하지 않고, **의도에 맞는 옵션만 선택**하도록 설계. "이 메뉴만" 선택 시 → `capability_id` 그대로 저장, "하위 전체 허용" 선택 시 → `capability_id + '.*'` 저장.

---

## 3. DB 스키마 설계

### 3.1 설계 원칙

- **역량 정의(Capability Definition)**: 코드 레지스트리가 소스 오브 트루스. DB는 관리자 편의용 메타데이터·캐시 역할.
- **Tier 매핑(Tier Mapping)**: DB에 저장. `tier_allowed_capabilities`가 Tier별 허용 역량 ID 목록 보관.
- **Capability ID FK**: `tier_allowed_capabilities.capability_id`를 `capabilities.capability_id`에 **FK로 연결**. 데이터 무결성을 유지하고, 삭제·변경된 역량이 Tier 설정에 남아 있어 발생하는 런타임 오류를 방지. 와일드카드(`archive.*`) 허용 시 해당 ID도 `capabilities`에 존재해야 함(동기화 시 추가).

### 3.2 테이블 구성

#### 3.2.1 tiers (등급)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID |
| code | VARCHAR(50) UNIQUE | Tier 코드 (예: BASIC, STANDARD) |
| name | VARCHAR(100) | 표시명 |
| sort_order | INT | 정렬 순서 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### 3.2.2 capabilities (역량 메타데이터)

코드 레지스트리와 동기화되는 메타데이터. **인간 친화적 라벨링(Human-Friendly Labeling)** 필수: `archive.hub.export` 같은 ID만으로는 관리자·사용자가 의미를 파악하기 어려우므로, `label`·`description`을 반드시 포함한다. 관리자 UI·감사·라벨 표시·툴팁용.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID |
| capability_id | VARCHAR(200) UNIQUE | Capability ID (예: `archive.hub.export`) |
| label | VARCHAR(100) | 표시 라벨 (예: "아카이브 허브 내보내기") |
| description | VARCHAR(500) | 상세 설명 (예: "엑셀 다운로드 권한") |
| type | VARCHAR(20) | domain / menu / action |
| parent_id | VARCHAR(36) FK | 부모 capability (계층 표현) |
| source | VARCHAR(50) | `registry` (코드 동기화) / `manual` (수동 추가, §3.3 참고) |
| status | VARCHAR(20) | `active` / `inactive`. 동기화 상태값(Sync State). Soft Delete용 |
| sync_at | TIMESTAMPTZ | 마지막 동기화 시각 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### 3.2.3 tier_allowed_capabilities (Tier별 허용 역량)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| tier_id | VARCHAR(36) PK,FK | tiers.id |
| capability_id | VARCHAR(200) PK,FK | capabilities.capability_id 참조. 와일드카드 `.*` 포함 가능 (예: `archive.*`, `archive.hub`) |

- **FK**: `capability_id` → `capabilities.capability_id`. 삭제/비활성된 역량이 Tier에 남지 않도록 무결성 유지. 와일드카드 사용 시 해당 ID도 `capabilities`에 존재해야 함.

#### 3.2.4 확장 포인트: 사용 현황 수집 (추후)

§0.2 사용 현황(Usage Analytics) 활용을 위해, 추후 `capability_usage` 또는 이벤트 로그 테이블을 추가할 수 있다.

| 컬럼 (예시) | 타입 | 설명 |
|-------------|------|------|
| capability_id | VARCHAR(200) | 사용된 역량 ID |
| user_id | VARCHAR(36) | 사용자 (선택) |
| session_id | VARCHAR(64) | 세션 (선택) |
| occurred_at | TIMESTAMPTZ | 발생 시각 |
| duration_ms | INT | 소요 시간 (선택, 성능 분석용) |

- 집계·보관 정책(리텐션), 샘플링 여부는 별도 정리.

### 3.3 동기화 상태(Status) 및 Soft Delete

- **`status` 컬럼**: `active` / `inactive`. 코드에서 삭제된 역량을 **즉시 DELETE하지 않고** `status='inactive'`로 전환(Soft Delete).
- **관리자 확인 후 정리**: 비활성 역량을 관리자 UI에서 확인한 뒤, 의도적 삭제·복구 여부 결정.
- **부모 삭제 시 하위 자식 전체 삭제**: 부모 역량을 삭제(또는 비활성)하면 **하위 자식 역량도 모두 삭제(또는 비활성)**. `parent_id` FK에 ON DELETE CASCADE 또는 동기화 로직에서 재귀 처리.

#### 3.3.1 Soft Delete와 FK의 충돌

- **DELETE + CASCADE**: 부모 레코드를 실제 DELETE하면 `tier_allowed_capabilities`의 FK CASCADE로 해당 매핑도 삭제됨.
- **UPDATE status='inactive'** (Soft Delete)만 할 경우: FK는 **삭제되지 않음**. `tier_allowed_capabilities`에는 비활성 역량에 대한 참조가 그대로 남아 있음.
- **해결**: `hasCapability` 로직에서 **`capabilities.status='active'`인 역량만 유효**로 간주. `tier_allowed_capabilities`에서 Tier의 capability_id 목록을 가져올 때, `capabilities`와 JOIN하여 `status='active'`인 것만 필터링. 이 필터링은 **서버 메모리 캐싱 단계**에서 반드시 수행 (§5.9.1 참고).

### 3.4 Manual Source의 위험성

- **`source='manual'`**: 관리자가 코드에 없는 역량을 DB에 수동 추가할 수 있는 기능. **시스템 혼란 위험** — 코드가 뒷받침하지 않는 권한이 DB에 존재하면 허용 체크·감사·Tier 설정에서 일관성이 깨질 수 있음.
- **권장**: 수동 추가는 **가급적 지양**하거나, 플러그인·특수 이벤트 등 **아주 제한적인 용도**로만 허용. 허용 시 관리자 UI에 경고 표시 및 사용 가이드 제공.

---

## 4. 코드 레지스트리 (Capability Registry)

### 4.1 역할

- **소스 오브 트루스(Source of Truth)**: 실제 존재하는 역량의 정의
- 각 도메인·메뉴·기능이 **선언(Declaration)** 방식으로 자신을 등록
- `domainRegistry` 확장 또는 별도 `capabilityRegistry`로 구성

### 4.2 선언 예시 및 인간 친화적 라벨링

`capability_id` 외에 **label**, **description**을 필수로 포함한다. 관리자 UI·Tier 설정 화면에서 사용자가 의미를 이해할 수 있도록 한다.

```ts
// capabilityRegistry.ts 또는 domainRegistry 확장
export const capabilityRegistry = {
  archive: {
    capabilityId: 'nexa.archive',
    label: '아카이브',
    description: '아카이브 도메인 전체 접근',
    type: 'domain',
    submenus: [
      { capabilityId: 'nexa.archive.hub', label: '아카이브 허브', description: '허브 화면 접근', route: 'NexaArchiveHub' },
      { capabilityId: 'nexa.archive.studio', label: '아카이브 스튜디오', description: '스튜디오 화면 접근', route: 'NexaArchiveStudio' },
      {
        capabilityId: 'nexa.archive.hub.export',
        label: '아카이브 허브 내보내기',
        description: '엑셀 다운로드 권한',
        type: 'action',
      },
    ],
  },
  parts: { ... },
}
```

- **추출(Extraction) 불필요**: 도메인이 스스로 선언 → LeftNav 렌더링과 관리자 설정 UI가 동일 소스 사용

---

## 5. 동기화 로직 (Sync Logic)

### 5.1 소스: 서버 메모리 상의 CapabilityRegistry

- **서버 기동 시**: CapabilityRegistry 객체를 로드하여 **메모리에 보관**. 이후 동기화·허용 체크는 이 메모리 객체를 기준으로 한다.
- **소스 오브 트루스**: 코드(레지스트리)가 빌드에 반영된 시점의 정의가 서버 프로세스 메모리에 있으므로, 동기화는 "메모리 ↔ DB" 비교로 수행한다.

### 5.2 동기화 실행 흐름

관리자가 **동기화** 버튼을 누르면(또는 §5.6에 따른 트리거 발생 시) 백엔드에서 다음 순서로 진행한다.

1. **메모리에서 ID·메타데이터 추출**  
   `Object.keys(capabilityRegistry)` 및 재귀 순회로 **현재 프로세스 메모리에 있는 모든 capability_id**와 **인간 친화적 메타데이터(label, description, type, parent 등)** 리스트를 만든다.  
   - 예: `collectFromRegistry(capabilityRegistry)` → `[{ capabilityId: 'archive.hub.export', label: '아카이브 허브 내보내기', description: '엑셀 다운로드 권한', type: 'action' }, ...]`

2. **DB에서 현재 목록 조회**  
   `capabilities` 테이블에서 `capability_id`, `label`, `description`, `type`, `source` 등을 조회한다.

3. **두 리스트 Diff**  
   - **메모리에는 있는데 DB에는 없음** → **신규(추가 대상)**. INSERT 시 label, description, type 모두 포함, `source='registry'`.  
   - **DB에는 있는데 메모리에는 없음** → **삭제된 기능**. `source='registry'`이면 `status='inactive'`로 전환(Soft Delete); `source='manual'`이면 유지(관리자 수동 추가분, §3.4 참고).  
   - **둘 다 있는데 메타데이터(label, description, type 등)가 다름** → **수정 대상**. UPDATE로 label, description, type, parent_id, sync_at 등을 갱신(`source='registry'`인 행만).

4. **결과 반영**  
   INSERT/UPDATE/status='inactive' 전환을 트랜잭션으로 수행하고, 필요 시 동기화 결과 요약(추가 N건, 수정 N건, 비활성 N건)을 응답에 포함한다.

### 5.3 Diff 결과 정리

| 구분 | 메모리 | DB | 처리 |
|------|--------|-----|------|
| 신규 | 있음 | 없음 | INSERT (source='registry') |
| 삭제/비활성 | 없음 | 있음 (source=registry) | `status='inactive'` 전환 (Soft Delete) |
| 수정 | 있음 | 있음, 메타 다름 | UPDATE (label, description, type 등) |
| 유지 | 없음 | 있음 (source=manual) | 변경 없음 (수동 추가분) |

### 5.4 삭제·비활성화 정책 (Soft Delete)

- 메모리에 없는 `capability_id`는 **레지스트리에서 제거된 기능**으로 간주. `source='registry'`인 행은 **즉시 DELETE하지 않고** `status='inactive'`로 전환. 관리자가 확인 후 영구 삭제·복구 여부 결정.
- `status='inactive'`인 역량은 허용 체크 시 제외. FK로 `tier_allowed_capabilities`를 참조할 경우, 비활성 역량에 대한 Tier 매핑은 ON DELETE 정책 또는 별도 정리 로직으로 처리.
- 관리자 UI: 비활성 역량은 회색 처리 및 "레지스트리에 없음" 경고 표시.

### 5.5 API 엔드포인트 (제안)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/admin/capabilities/sync | 역량 동기화 실행. 메모리 ↔ DB Diff 후 INSERT/UPDATE/status=inactive 전환 수행. 응답에 추가/수정/비활성 건수 포함 권장. |
| GET | /api/admin/capabilities | 역량 목록 (DB 기준 또는 메모리+DB 병합). |
| GET | /api/admin/tiers/:id/capabilities | 특정 Tier의 허용 역량 목록. |

### 5.6 동기화 트리거 전략 (확정)

| 트리거 | 시점 | 용도 |
|--------|------|------|
| **관리자 버튼** | 관리자가 "동기화" 클릭 시 | 배포 후 의도적 반영. 감사 로그 연동. |
| **서버 부팅 시 1회** | 프로세스 기동 직후 | 배포 재시작 시 자동 갱신. |

**확정 조합**: **수동(관리자 버튼) + 부팅 시 자동** 둘 다 적용. Cron·이벤트는 요구 시 추가.

### 5.7 메모리 추출 의사 코드 (레지스트리 → 플랫 리스트)

CapabilityRegistry는 중첩 구조이므로, `Object.keys(registry)` 및 `submenus` 등 재귀 순회로 **모든 capability_id와 인간 친화적 메타(label, description, type)** 를 플랫 리스트로 수집한다. `label`, `description`은 필수 포함.

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

- 실제 레지스트리 스키마에 맞게 `walk`를 조정. 결과는 DB와 Diff 시 사용하는 플랫 리스트.

### 5.8 Defense in Depth 상세 전략

우회 방어·보안 강화를 위한 구체적 설계.

#### 5.8.1 토큰 페이로드 최적화 (Token Payload Optimization)

- **문제**: 사용자의 모든 Capability ID를 JWT 페이로드에 담으면 토큰 크기가 커지고, 갱신·해제 시에도 불리함.
- **대안**: 토큰에는 **Tier ID만** 담고, **서버 메모리(Redis 등)** 에서 해당 Tier의 `tier_allowed_capabilities` 리스트를 캐싱하여 대조.
- **흐름**: 요청 수신 → JWT에서 `tier_id` 추출 → Redis/메모리에서 `tier_id`에 해당하는 capability_id[] 조회(없으면 DB 조회 후 캐시) → `hasCapability(capabilityIds, required)` 검사.

#### 5.8.2 API 미들웨어 자동화 (Middleware Automation)

- **문제**: 각 API 엔드포인트마다 수동으로 `requireCapability('archive.hub.export')`를 호출하면 누락·중복·유지보수 부담이 발생.
- **대안**: 라우터 정의 시 **Capability ID를 메타데이터(meta)** 로 주입하고, **공통 미들웨어**에서 일괄 처리.
- **예시**:
  ```ts
  // 라우터 정의
  router.get('/archive/hub/export', handler, { meta: { requiredCapability: 'archive.hub.export' } })
  // 또는 Express 등에서 route metadata로 등록
  ```
- 미들웨어: 요청의 `route.meta.requiredCapability`를 읽어 `hasCapability(userCapabilities, meta.requiredCapability)` 검사. 없으면 403 반환.

### 5.9 성능 및 확장성 (Performance & Scalability)

#### 5.9.1 캐싱 전략 (Caching Strategy)

- `hasCapability` 검사는 **매 요청마다** 발생하므로 매우 빈번함.
- Tier별 권한 목록은 반드시 **인메모리 캐시(또는 Redis)** 로 유지하여 DB 조회를 피해야 함.
- **`status='active'` 필터링 필수**: `tier_allowed_capabilities`와 `capabilities`를 JOIN하여, **`capabilities.status='active'`인 capability_id만** 캐시에 포함. Soft Delete(§3.3.1) 시 FK는 유지되므로 비활성 역량 참조가 Tier 매핑에 남아 있을 수 있음. 캐시 구축 단계에서 `status='active'` 필터를 적용하지 않으면 비활성 역량까지 허용되어 버림.
- 캐시 무효화: 동기화 실행 시, Tier-Capability 매핑 변경 시, `capabilities.status` 변경 시 해당 Tier 캐시 갱신.

#### 5.9.2 프론트엔드 최적화 (Frontend Optimization)

- UI 렌더링 시 권한 체크 로직이 복잡해지면 성능에 영향을 줄 수 있음.
- **트리 구조의 권한 데이터를 평면화(Flatten)** 하여 클라이언트에 전달. 예: `['archive', 'archive.hub', 'archive.hub.export']` 배열 형태.
- 클라이언트는 `Set` 또는 배열 `includes`로 O(1)~O(n) 검사. 계층 재귀 없이 단순 비교만 수행.

---

## 6. 적용 사례

Capability ID는 아래 여러 지점에서 **동일한 역량 ID**로 검사한다. UI·라우트·API를 한 규칙으로 통일하면 **우회 방어(Bypass Prevention)** 가 일관되게 동작한다.

| 사용처 | 한글 | 용도 |
|--------|------|------|
| Tier 설정 | 등급별 역량 매핑 | `tier_allowed_capabilities` 저장 |
| 라우트 가드 | 라우트 진입 전 검사 | `meta.requiredCapability` (string 또는 OR/AND 객체) — URL 직접 입력 차단 |
| 컴포넌트 | 조건부 렌더링 | `v-if="hasCapability(userCaps, 'archive.hub.export')"` — 버튼·메뉴 노출 제어. OR/AND 조건 지원 (§6.2) |
| API 미들웨어 | 엔드포인트 권한 | 라우트 meta에 `requiredCapability` 주입 후 공통 미들웨어에서 검사 (§5.8.2) — API 직접 호출 차단 |
| 감사 로그 | 행위 기록 | `capabilityUsed: 'archive.hub.export'` — 비정상 접근 탐지 근거 |

### 6.1 단일 역량 매칭 (와일드카드 반영)

```ts
function matchesCapability(userAllowed: string, required: string): boolean {
  if (userAllowed.endsWith('.*')) {
    const prefix = userAllowed.slice(0, -2)  // 'archive.*' → 'archive'
    return required === prefix || required.startsWith(prefix + '.')
  }
  return required === userAllowed
}
```

- `userAllowed`: `tier_allowed_capabilities`에 저장된 값 (`nexa.archive` 또는 `nexa.archive.*`)
- `required`: 요청 중인 역량 ID

### 6.2 다중 역량 조건 (OR/AND)

특정 메뉴가 **두 개 이상의 역량을 모두** 요구하거나, **둘 중 하나만** 있어도 접근 가능한 경우를 지원한다. `hasCapability`는 `required` 인자에 단일 ID뿐 아니라 조건 객체를 받는다.

| 조건 | 형태 | 예시 | 의미 |
|------|------|------|------|
| 단일 | `string` | `'archive.hub'` | 해당 역량 보유 시 허용 |
| OR (하나라도) | `{ any: string[] }` | `{ any: ['archive.hub', 'archive.studio'] }` | 둘 중 하나만 있어도 허용 |
| AND (전부) | `{ all: string[] }` | `{ all: ['archive.hub', 'archive.hub.export'] }` | 모두 있어야 허용 |

```ts
type RequiredCapability = string | { any: string[] } | { all: string[] }

function hasCapability(userCapabilities: string[], required: RequiredCapability): boolean {
  const matchOne = (req: string) =>
    userCapabilities.some(allowed => matchesCapability(allowed, req))

  if (typeof required === 'string') return matchOne(required)
  if ('any' in required) return required.any.some(matchOne)
  if ('all' in required) return required.all.every(matchOne)
  return false
}
```

- **라우트 meta 예시**: `requiredCapability: { any: ['archive.hub', 'archive.studio'] }` — Hub 또는 Studio 접근 권한 중 하나 있으면 진입
- **API 예시**: `requireCapability({ all: ['parts.edit', 'parts.edit.create'] })` — 편집 권한과 생성 권한 모두 필요

---

## 7. 구현 순서 제안

1. **1단계**: Capability ID 규칙·레지스트리 구조 문서화 및 코드에 `capabilityRegistry` 초안 추가
2. **2단계**: `tiers`, `tier_allowed_capabilities` 테이블 및 기본 CRUD API
3. **3단계**: `capabilities` 테이블 및 동기화 API (`POST /api/admin/capabilities/sync`)
4. **4단계**: 동기화 로직 구현 (레지스트리 → DB)
5. **5단계**: 관리자 UI에서 Tier별 역량 선택·저장
6. **6단계**: 라우트 가드·API 미들웨어에 `hasCapability` 적용

### 7.1 적용 전략 (점진적 vs 전체 검토)

**권장: 점진적 적용.** 전체 코드를 한 번에 검토·수정하지 않고, 새로 추가할 때만 적용하고 기존 코드는 수정 시에만 보강한다.

| 시점 | 접근 |
|------|------|
| **신규 기능** | Capability 체계를 그대로 적용. API·라우트·메뉴에 `requiredCapability` 지정, `capabilityRegistry` 선언. |
| **기존 코드** | 수정·리팩터 시에만 보강. 예: 해당 API를 손댈 때 `requiredCapability` 추가, 도메인 변경 시 레지스트리 등록. |

**전체 검토가 필요한 경우**: 보안·컴플라이언스로 Capability 미적용 접근이 허용되지 않을 때, Tier 기반 접근 제한을 즉시 적용해야 할 때.

**선행 작업**: `capabilityRegistry`, `tiers`, `capabilities`, `tier_allowed_capabilities` 기반을 먼저 구축한 뒤, 신규·수정 시점에 점진 적용.

---

## 8. 확정 사항 (검토 완료)

| 항목 | 결정 |
|------|------|
| 와일드카드 없음 (`nexa.archive`) | **`===` 동일 비교만**. 하위 포함 없음. |
| 부모 삭제 | **하위 자식 모두 삭제/비활성** (CASCADE 또는 재귀 처리). |
| 동기화 트리거 | **수동(관리자 버튼) + 부팅 시 자동**. |
| 네임스페이스 | **`nexa.` 필수**. 외부 엣지·PC·다른 플랫폼과 구분. |

---

## 9. 확장 도메인 (추후 문서화)

- **사용 현황 수집·분석**: capability_usage 테이블 설계, 집계·리텐션, 대시보드
- **성능 인사이트**: 역량별 응답 시간·실패율, 핫패스 식별
- **플러그인 확장**: 서드파티 Capability 등록·네임스페이스·검증

---

## 10. 관련 문서

- [NEXA-ADMIN-01] 관리자 도메인 기본구성과 레이아웃
- [NEXA-ADMIN-01] 관리자_도메인_기획_초안
- [NEXA-AUTH-01] 계정·인증·권한
