# NEXA 기능 자격(Capability) ID 체계·발급·Tier 접근 권한

목적: Tier별 도메인·메뉴·기능 접근 제어를 위한 **기능 자격 ID(Capability ID)** 규칙과 DB·동기화를 문서화한다. 한글 표기는 **기능 자격**, 코드·스키마·API에서는 `Capability` 등 기존 영문 식별자를 유지한다. 기능 자격을 플랫폼 **일급 객체(First-Class Object)** 로 두어 접근 제어를 넘어 연결·확장·사용 현황·성능 최적화의 기본 단위로 쓴다.  
참조 문서: `[NEXA-ADMIN-01]`, `[NEXA-AUTH-01]`, `_KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) 운영 아키텍처.md`(용어·족보·게이트 경계)  
부록: 운영·보안·롤백 상세는 [\_\_NEXA SPEC Capability 기능 자격 운영 및 보안 부록.md](./__NEXA%20SPEC%20Capability%20기능%20자격%20운영%20및%20보안%20부록.md)  
문서 성격: 초안·검토용. 설계안 정리. 구현 전 충분한 검토 권장.  
작성일: 2025-03

---

## 0. 설계 의도 및 비전

### 0.1 배경

Tier별 접근 권한 제한은 이 체계의 첫 번째 적용 사례일 뿐이다. **기능 자격**을 단순한 권한 플래그가 아닌 일급 객체로 취급하면, 도메인·API·이벤트를 한 단위로 연결·확장하고 사용 현황·성능 자료로 활용할 수 있다는 직감에서 본 설계가 출발한다.

### 0.2 일급 객체로 취급할 때 가능해지는 것

| 관점           | 한글                          | 영문                                 | 설명                                                                                 |
| :------------- | :---------------------------- | :----------------------------------- | :----------------------------------------------------------------------------------- |
| 연결           | 기능 자격 간·기능 자격-리소스 | Linking / Association                | 기능 자격 ↔ 도메인·메뉴·API·이벤트 매핑, 의존·조합 표현                             |
| 보안·우회 방어 | 세밀한 권한 검사              | Defense in Depth / Bypass Prevention | UI·API·라우트·액션을 동일한 기능 자격 ID로 검사. URL/API 우회 차단, 감사 로그와 연동 |
| 외부 확장      | 플러그인·서드파티             | Extensibility / Plugin               | 신규 기능 자격 선언·등록 후 기존 Tier/인가 체계에 통합                               |
| 사용 현황      | 호출·접근 통계                | Usage Analytics                      | 기능 자격 ID별 빈도·세션 추적                                                        |
| 성능 자료      | 핫패스·캐시                   | Performance Insights                 | 자주 쓰이는 기능 자격/경로 → 캐시·부하 분산 근거                                     |

### 0.3 확장 시나리오 (요약)

| 시나리오  | 요점                                                                                   |
| :-------- | :------------------------------------------------------------------------------------- |
| 다층 방어 | UI + 라우트 가드 + API 미들웨어가 동일 ID(예: `nexa.platform.archive.hub.export`) 검사 |
| 플러그인  | `plugin.x.report` 선언 → 동기화 → 관리자 UI·Tier 매핑                                  |
| 관측·감사 | 호출 수, 응답·실패율, "누가·무엇을·언제" 추적                                          |

### 0.4 문서 내 범위

본 문서에서는 **기능 자격 ID** 규칙·DB·동기화·Tier 매핑까지를 구체화한다. 사용 현황 수집·성능 분석·플러그인 확장 메커니즘·운영 보안 상세는 **부록 또는 별도 문서**에서 정리한다.

---

## 1. 용어 정리

| 한글                 | 영문(별칭)              | 설명                                                             |
| :------------------- | :---------------------- | :--------------------------------------------------------------- |
| 일급 객체            | First-Class Object      | 값처럼 다루고, 식별·연결·확장·분석의 기본 단위로 활용되는 엔티티 |
| 기능 자격            | Capability              | 특정 기능·메뉴·액션에 대한 접근 허용 단위                        |
| 기능 자격 ID         | Capability ID           | 기능 자격을 구분하는 문자열 (예: `nexa.platform.archive.hub`)    |
| 등급                 | Tier                    | 회원의 서비스 등급 (BASIC, STANDARD 등)                          |
| 접두사 매칭          | Prefix matching         | 상위 ID에 `.*` 와일드카드 명시 시 하위 전체 허용                 |
| 와일드카드           | Wildcard                | `.*`                                                             |
| 기능 자격 레지스트리 | Capability Registry     | 코드에서 선언한 정의의 소스 오브 트루스                          |
| 동기화               | Sync                    | 코드 레지스트리 ↔ DB 메타데이터 일치 유지                       |
| 인간 친화적 라벨링   | Human-Friendly Labeling | `label`, `description` 등 의미 메타데이터                        |
| 시스템 기능 자격     | System Capability       | 관리자 발급·관리. 권한·Tier·접근 제어 기준                       |
| 사용자 기능 자격     | User Capability         | 사용자 영역. AI 협력 슬롯·페르소나·스킬·데스크 연계              |
| 태그 클라우드        | Tag Cloud               | AI 추천용 화이트리스트                                           |
| 적합성 점수          | Fit Score               | 사용자 설명과 AI 추천 기능 자격 간 부합도                        |

---

## 2. 기능 자격 ID(Capability ID) 계층 구조

### 2.0 발급 대상 및 다중 발급

- 기능 자격 ID는 엣지 디바이스뿐 아니라 플랫폼 UI·넥사패널에도 발급한다.
- 고유 ID(UUID)와 Capability ID는 분리한다.
- 하나의 엔티티에 다수 기능 자격을 부여할 수 있다.

### 2.1 계층 구조 (Hierarchy)

| depth | 계층   | 한글         | 영문          | 설명                                                  | 전체 ID에서의 위치 (예)                  |
| :---- | :----- | :----------- | :------------ | :---------------------------------------------------- | :--------------------------------------- |
| 1     | 1단계  | 네임스페이스 | Namespace     | 플랫폼 식별. 필수                                     | `nexa`                                   |
| 2     | 2단계  | 출처         | Origin        | **기능 자격 소속 최상위. 아래 표 3종 중 정확히 하나** | `nexa.「출처」.…` platform, edge, plugin |
| 3     | 3단계  | 영역/도메인  | Area          | 출처 안의 세부 영역                                   | `… .archive.hub`                         |
| 4+    | 4단계+ | 메뉴·액션    | Menu / Action | 하위 메뉴·화면·구체 액션                              | `hub`, `export`, …                       |

**2단계 출처(Origin) 3종 — 반드시 여기서 선택** (이름 그대로 ID 2번째 세그먼트에 온다)

| 2단계 값     | 한글·역할             | 언제 쓰는가                                                                                      | 전체 ID 예시                        |
| :----------- | :-------------------- | :----------------------------------------------------------------------------------------------- | :---------------------------------- |
| `platform`   | 플랫폼 내장           | 1차 제공 UI·도메인·메뉴·액션                                                                     | `nexa.platform.archive.hub`         |
| `edge`       | 엣지                  | 디바이스·현장 관측·제어 계열                                                                     | `nexa.edge.device.sensor.read`      |
| **`plugin`** | **플러그인·서드파티** | **외부 모듈·외부 API 래퍼 등록 후** 기능 자격을 붙일 때 (동기화·Tier 매핑 흐름은 0.3절·5절 참고) | **`nexa.plugin.x.report.generate`** |

> **스캔 팁:** 서드파티·연동 전용 기능 자격은 **`nexa.platform.…`가 아니라 `nexa.plugin.…`** 로 시작하는 경우가 많다. 문서·코드 검색 시 `nexa.plugin`으로 걸러 보면 한 번에 모인다.

### 2.2 ID 형식 규칙 및 발급 룰

- 네임스페이스 `nexa` 필수
- 출처(Origin) 반드시 두 번째 세그먼트
- 문자 규칙: 영문 소문자·숫자·밑줄(`_`), 구분자는 점(`.`)
- 계층 깊이: 도메인·액션은 3~4단계 권장, 전체 5~6단계 이내

출처별 예시 (2.1의 `platform` / `edge` / **`plugin`** 와 대응):

- `nexa.platform.archive.hub`
- `nexa.platform.archive.hub.export`
- `nexa.platform.panel.widget.dashboard.view`
- `nexa.platform.panel.controller.thermostat.set`
- `nexa.edge.device.sensor.read`
- **`nexa.plugin.x.report.generate`** ← 2단계가 **`plugin`**

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

| 옵션                           | 저장값 예시                   | 설명                          |
| :----------------------------- | :---------------------------- | :---------------------------- |
| 이 메뉴만 허용                 | `nexa.platform.archive.hub`   | 해당 기능 자격만, 하위 미포함 |
| 이 메뉴 및 모든 하위 기능 허용 | `nexa.platform.archive.hub.*` | 해당 기능 자격 + 하위 전체    |

### 2.4 기능 자격 = 자격증 시각 및 Admin 도구

#### 2.4.1 자격증 시각

| 관점 | 설명                                  |
| :--- | :------------------------------------ |
| 발급 | 대상(Tier/엔티티)에 기능 자격 부여    |
| 폐기 | 엔티티는 유지, 기능 자격만 회수       |
| 이력 | 누가·언제·무엇을 발급/폐기했는지 추적 |

#### 2.4.2 Admin 기능 자격 도구

| 기능 | 한글           | 설명                          | DDL/API 관점               |
| :--- | :------------- | :---------------------------- | :------------------------- |
| 발급 | 기능 자격 부여 | 대상에 Capability ID 부여     | INSERT                     |
| 폐기 | 기능 자격 회수 | 대상에서 기능 자격 제거       | DELETE 또는 Soft Delete    |
| 조회 | 목록·소유 현황 | 대상별 보유·ID별 부여 현황    | SELECT, JOIN               |
| 이력 | 발급·폐기 이력 | 누가/언제/대상/기능 자격 추적 | `capability_grant_history` |

#### 2.4.3 DDL 반영 요구사항 요약

- 발급·폐기 저장소: `tier_allowed_capabilities`
- 이력 보존: `capability_grant_history` 또는 감사 컬럼
- 고유 ID 분리: 발급 대상과 Capability ID 별도 컬럼
- 조회 성능: 인덱스 + Tier 캐시

### 2.5 시스템 기능 자격 vs 사용자 기능 자격

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

#### 2.5.3 사용자 기능 자격(User Capability) 발급 워크플로우

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

기능 자격(무엇을 할 수 있는지)과 AI 사용 정책(어떻게 사용할지)을 분리한다.

#### 2.5.7 발급 주도권: 시스템 강제 원칙 (중요)

본 문서의 사용자 기능 자격(User Capability)은 "사용자 생성"이 아니라 **시스템 발급**이다.

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

- 기능 자격 정의: 코드 레지스트리 SoT
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
-- 사용자 기능 자격(User Capability) 전용 테이블 예시
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

기능 자격 정의의 SoT. 구현체는 `capabilityRegistry` 등 코드 상수·트리 구조.

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

| 메서드 | 경로                                | 설명                     |
| :----- | :---------------------------------- | :----------------------- |
| POST   | `/api/admin/capabilities/sync`      | 동기화 실행              |
| GET    | `/api/admin/capabilities`           | 기능 자격 목록 조회      |
| GET    | `/api/admin/tiers/:id/capabilities` | Tier 허용 기능 자격 조회 |

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

### 5.8 운영·보안 상세 (부록으로 분리)

JWT·캐시·미들웨어, `provisional` / `approved` 라이프사이클, 대량 발급 방어, 샌드박스, 제안 거절 시 롤백·지식 격리·UI **`JITTER`** 신호(프로포절 무효 맥락) 등은 길이상 아래 부록에 둔다.

- **부록:** [\_\_NEXA SPEC Capability 기능 자격 운영 및 보안 부록.md](./__NEXA%20SPEC%20Capability%20기능%20자격%20운영%20및%20보안%20부록.md)

**Knowledge OS 문서와의 구분:** `_KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) 운영 아키텍처.md` **4.8절**의 Lumina/Jitter는 주로 **문서 참조·파서 신뢰도**(`nexa_knowledge_references` 등) 게이트다. 부록 **5.14절**의 `JITTER`는 **기능 자격 제안 거절·STUCK** 등 **인가** 게이트에서 쓰인다. UI 은유는 같을 수 있으나 **판정 주체·저장 위치가 다르다.**

#### 5.8.1 본편 요약 표

| 주제             | 한 줄 요약                                                                                                   |
| :--------------- | :----------------------------------------------------------------------------------------------------------- |
| Defense in Depth | JWT는 Tier 중심으로 가볍게; 기능 자격 목록은 Redis 등 캐시; 라우트는 `requiredCapability` 미들웨어 일괄 검사 |
| 성능             | Tier별 허용 목록·Full_ID 캐시; 동기화·매핑 변경 시 무효화                                                    |
| 발급 운영        | `provisional` 즉시(제한) → `fit_score`/관리자로 `approved`/`rejected`                                        |
| 남용 방어        | Rate limit, pending 상한, 고위험 기능 자격 차단                                                              |
| 미승인           | (선택) 샌드박스에서만 실행 허용                                                                              |
| 거절 시          | 비동기 큐로 로그·지식·실행 체인 정리, RAG 제외 마킹                                                          |

---

## 6. 적용 사례

| 사용처       | 한글                  | 용도                             |
| :----------- | :-------------------- | :------------------------------- |
| Tier 설정    | 등급별 기능 자격 매핑 | `tier_allowed_capabilities` 저장 |
| 라우트 가드  | 라우트 진입 전 검사   | URL 직접 입력 차단               |
| 컴포넌트     | 조건부 렌더링         | 버튼·메뉴 노출 제어              |
| API 미들웨어 | 엔드포인트 권한       | API 직접 호출 차단               |
| 감사 로그    | 행위 기록             | 비정상 접근 탐지 근거            |

### 6.1 단일 기능 자격 매칭 (와일드카드 반영)

```ts
function matchesCapability(userAllowed: string, required: string): boolean {
  if (userAllowed.endsWith('.*')) {
    const prefix = userAllowed.slice(0, -2)
    return required === prefix || required.startsWith(prefix + '.')
  }
  return required === userAllowed
}
```

### 6.2 다중 기능 자격 조건 (OR/AND)

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

1. 기능 자격 ID 규칙·레지스트리 구조 문서화 + 초안 코드
2. `tiers`, `tier_allowed_capabilities` + CRUD API
3. `capabilities` + 동기화 API
4. 동기화 로직 구현
5. 관리자 UI Tier별 기능 자격 선택/저장
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
| 시스템/사용자 기능 자격                  | 별도 컬럼 저장, 풀 ID는 오케스트레이션만 사용              |
| 사용자 ID 검증                           | 예약어 블록리스트 + 전용 네임스페이스                      |
| 유통 시 보호                             | 암호화 또는 불투명 토큰                                    |
| 사용자 기능 자격 발급                    | Read-only ID, 태그 클라우드 내 추천, 즉시 적용 + 사후 승인 |
| 대량 발급 방어                           | Rate Limit, pending 상한, 이상 탐지, 자동 정지/무효화      |
| 오케스트레이터 캐시                      | 미리 조합된 Full_ID Redis 키 조회                          |
| 토큰 수명                                | exp/세션 귀속 필수, 고위험 기능 자격 Rotation              |

---

## 9. 확장 도메인 (추후 문서화)

- 사용 현황 수집·분석(`capability_usage`)
- 성능 인사이트(응답 시간/실패율/핫패스)
- 플러그인 확장(등록·검증·네임스페이스)
- 사용자 기능 자격 상세(승인 워크플로·레지스트리)
- IoT 가상 시뮬레이션 도메인 및 샌드박스(V8 Isolate 후보)

---

## 10. DDL 반영 검토

- `[NEXA-DDL-01]`에 `tiers`, `capabilities`, `tier_allowed_capabilities` 추가 필요
- Admin 기능 자격 도구 요구사항 반영:
  - 발급/폐기/조회/이력
  - `capability_grant_history`, 감사 컬럼
- 시스템/사용자 기능 자격 분리 컬럼:
  - `system_capability_id`
  - `user_capability_id`
- 유통 암호화·토큰화는 API/미들웨어 레이어 처리

---

## 11. 관련 문서

- `[NEXA-ADMIN-01]` 관리자 도메인 기본 구성과 레이아웃
- `[NEXA-ADMIN-01]` 관리자 도메인 기획 초안
- `[NEXA-AUTH-01]` 계정·인증·권한
- `_KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) 운영 아키텍처.md` — 기능 자격·용어·족보·지식 게이트(ASK/STUCK 등) 경계
- [기능 자격 운영·보안 부록](./__NEXA%20SPEC%20Capability%20기능%20자격%20운영%20및%20보안%20부록.md)
