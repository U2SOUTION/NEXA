# [NEXA-AUTH-01] 계정 생성 및 인증 시스템 기반 기획

**목적**: NEXA 플랫폼 전반의 **계정 생성·인증** 기반을 구축한다. 프로젝트·파일·채팅·엣지 디바이스 연동 등 모든 도메인은 인증된 사용자 기준으로 동작해야 하며, **device_registry·device_members** 매핑 테이블을 두어 사용자–디바이스 공유·역할 분리(owner/editor/controller/viewer)를 지원함으로써 **IoT 플랫폼의 진정한 가치 확장**을 위한 설계를 담는다. 본 문서를 사전 구현·준비하여 이후 기능이 매끄럽게 진행되도록 한다.

NEXA의 권한 모델은 **'소유'와 '참여'를 분리**한다. 이를 통해 단일 사용자의 다중 페르소나 운영(프로젝트·시스템 간 가상의 여러 역할 분리)부터 대규모 조직의 계층적 자원 관리(총관리자 → 중간급 관리자 배분)까지 유연하게 대응하며, **특히 viewer 권한의 공유만으로도 데이터 기반 협업 가치를 크게 확대**할 수 있다.

**적용 범위**: 플랫폼 전역 (AI 도메인, NEXA-Node, 업로드·파일, API 등)

**적용 환경**: Postgres 마이그레이션 완료, 서버 **Node/Express**, **Redis 필수**. **플랫폼 전체(프론트·서버) TypeScript(.ts) 적용이 원칙**이며, 프론트는 이미 TS 마이그레이션 완료, 서버는 아직 .js가 남아 있어 신규 서버 파일도 .js로 작성되는 상태. **플랫폼 전체 TS 마이그레이션 완성**이 해야 할 일로 남아 있음(§1.4). (NestJS는 참고용. 본 문서의 라이프사이클·미들웨어 설명은 Express 기준. IoT 플랫폼 특성상 디바이스 토큰 캐시·api_usage 버퍼·비밀번호 리셋 토큰·권한 무효화 등에 Redis를 **필수**로 적용.)

**하위 문서**: [NEXA-AI-09] AI 워크스페이스 웹서치 자원 전략, [NEXA-NODE-01] ESPHome YAML 제너레이터 및 웹 펌웨어 배포 기획, [NEXA-NODE-03] ESP32 베이스라인 펌웨어 및 디바이스 등록 설계 (AP 모드 + Captive Portal)

**작성일**: 2025-03

---

## 주요 용어 (참고)

본 문서에서 자주 쓰이는 기술·용어를 간단히 정리한다. 상세 스펙·사용법은 검색 또는 공식 문서를 참고한다.

| 용어 | 간단 설명 |
|------|-----------|
| **Redis** | 인메모리 키-값 저장소. **NEXA는 IoT 플랫폼 특성상 필수.** api_usage 버퍼·Device Token 검증 캐시·비밀번호 리셋 토큰(TTL)·device_members 캐시 무효화 등. |
| **JWT** | JSON Web Token. 서버가 서명한 토큰으로 사용자 식별(stateless). access/refresh 토큰. Bearer 헤더로 전달. |
| **Passport.js** | Node.js 인증 미들웨어. 로컬(이메일·비밀번호)·OAuth 등 전략으로 로그인 처리 후 JWT 발급. |
| **bcryptjs** | 비밀번호 해싱 라이브러리. 일방향 해시, 복원 불가. 로그인 시 `compare`로 검증. |
| **Zod** | 스키마 검증 라이브러리(TS/JS). 요청 body/query/params 타입·형식 검증, 실패 시 400 등 처리. |
| **Device Token** | 엣지 디바이스용 인증 토큰. 1회 발급, 해시만 DB 저장. `X-Device-Token` 헤더로 전달. |
| **SHA256** | 해시 함수. Device Token을 DB에 저장할 때 평문 대신 해시 저장용. 빠른 비교·저장에 적합. |
| **TTL** | Time To Live. Redis 키 등에 설정하는 만료 시간. 초과 시 자동 삭제. 비밀번호 리셋 토큰·캐시 만료에 사용. |
| **Soft Delete** | 행을 물리 삭제하지 않고 `deleted_at` 등 플래그로 “삭제됨” 표시. FK 유지·복구·감사에 유리. |
| **Bearer** | HTTP 인증 방식. `Authorization: Bearer <token>` 형식. JWT를 헤더로 넘길 때 사용. |
| **CORS** | Cross-Origin Resource Sharing. 브라우저가 다른 오리진 API 호출을 허용할지 서버가 응답 헤더로 명시. |
| **OAuth** | 외부 IdP(Google, GitHub 등)로 로그인 위임. **OAuth 2.0** 기준(1.0은 레거시, 현재 소셜 로그인은 대부분 2.0). 필요 시 OpenID Connect(OIDC)로 사용자 정보 연동. Passport.js의 OAuth 2.0 전략으로 구현. (본 문서 5단계 선택) |
| **Express** | NEXA API 서버 스택. 인증 미들웨어·라우트·종료 시 flush는 Express 기준으로 구현. (NestJS는 참고용) |
| **NestJS** | Node.js 프레임워크(참고용). 모듈·의존성 주입·라이프사이클 훅(onModuleDestroy 등). NEXA는 Express 사용. |

---

## 1. 현황 및 배경

### 1.1 현재 상태

| 구분 | 내용 |
|------|------|
| **인증** | 별도 계정·로그인 없음. 사용자 식별 부재 |
| **프로젝트·파일** | [NEXA-AI-09] 설계. `project_id`, `folder_id` 등 소유자(user_id) 미연결 |
| **엣지 디바이스** | [NEXA-NODE-01] ESPHome 등. 인증된 사용자에게 파일·설정 할당 불가 |
| **API** | 인증 미들웨어 없음. 인가(권한) 검증 없음 |

### 1.2 필요성

- **선행 요구사항**: 프로젝트·파일·채팅 등은 "누구의 것인가?"가 전제되어야 함. `user_id` 없이는 소유·권한 정책을 정의할 수 없음.
- **엣지 디바이스 연동**: 엣지에서 업로드·설정 요청 시 "어느 사용자 소속으로 저장할지" 식별 필요.
- **보안·공유**: 계정 단위로 격리, 추후 팀·공유 기능 확장 시 기반.

### 1.3 구현 환경 및 검토 반영 (2025-03)

| 구분 | 문서 기준 | 구현 시 참고 |
|------|-----------|--------------|
| **DB** | users, device_registry, device_members, api_usage 등 | `database/init_postgres.sql`에 인증 테이블 없음 → §4.5 DDL 보강 적용 |
| **서버** | Passport.js + JWT, bcryptjs, Zod | Express. 인증 라우트·미들웨어 신규 구현. UUID는 `server/config/uuidUtils.js`(v7) 사용 |
| **Redis** | api_usage 버퍼, Device Token 캐시, 비밀번호 리셋 토큰, device_members 캐시 무효화 | **필수**. IoT 플랫폼에서 다수 디바이스·실시간 권한 회수·TTL 필요. docker-compose·연결 설정 포함. |

### 1.4 플랫폼 전체 언어(JS vs TS) 정책

- **원칙**: **플랫폼 전체(프론트·서버)** 에 **TypeScript(.ts)** 적용이 기획 원칙이다. 서버만이 아니라 프론트·서버 모두 .ts로 마이그레이션 완성해야 한다.
- **현재 상태**: **프론트**는 이미 TS 마이그레이션 완료. **서버**는 **1단계 TS 전환 완료**(확장자 .ts, tsx 실행). 2단계(타입 정의·strict·최적화)는 추후 진행.

**결정(기록)**:

| 구분 | 결정 |
|------|------|
| **마이그레이션 시점** | **나중에 일괄 마이그레이션**. 당분간 서버는 .js로 진행하고, 전환 계획 수립 후 **플랫폼 전체 TS 마이그레이션**을 별도 태스크로 진행한다. |
| **당분간 신규 서버 파일** | **.ts 사용**. 1단계 전환 후 신규 파일은 .ts로 작성. (2단계에서 타입·strict 보강) |
| **완료 목표** | **플랫폼 전체 .ts 마이그레이션 완성** — 프론트는 완료, 서버는 전환 작업으로 .ts 적용을 완료해야 한다는 가정으로 문서에 둔다. |

**서버 TS 마이그레이션 전략 (2단계)**:

| 단계 | 내용 |
|------|------|
| **1단계** | 확장자만 일괄 **.js → .ts** 변환. tsconfig·실행 환경(ts-node/tsx 또는 tsc 빌드) 도입 후, 빌드·실행 시 발생하는 오류만 순차 대응. (`allowJs: true`로 혼재 허용 가능.) |
| **2단계** | 1단계 안정화 후, TS 취지 살리기: 인터페이스·타입 정의, `strict`(또는 `noImplicitAny`) 적용, 공통 타입 정리 등으로 **코드 최적화**. |

→ **상세 전략·서버·프론트 포함**: [NEXA-PLATFORM-TS-01] 서버_프론트_TS_마이그레이션_및_최적화_전략.md 참고.  
→ **플랫폼 특성 반영**: 동 문서 §2에 **IoT·엣지 디바이스**, **Zod 검증·타입 단일화**, **JSON/JSONB·AI 친화 데이터** 처리 등 TS 최적화 시 검토할 항목이 정리되어 있음.

---

## 2. 목표 및 범위

### 2.1 목표

| 목표 | 설명 |
|------|------|
| **계정 생성** | 이메일 또는 소셜(OAuth 2.0) 기반 회원가입 |
| **인증** | 로그인·세션/JWT 토큰 기반 사용자 식별 |
| **권한 기반** | 인증된 사용자만 API·리소스 접근. `user_id` 기준 필터 |
| **도메인 연동** | 프로젝트·파일·채팅·엣지 등 모든 도메인에 `user_id` 연결 |

### 2.2 범위 및 작업 순서

- **1단계**: 계정·인증 기반 — 회원가입(이메일), 로그인, JWT(access/refresh) 발급·검증, `GET /api/auth/me`. **비밀번호 찾기·소셜 로그인은 5단계에서 처리.**
- **2단계**: API 인증 미들웨어 — 요청 시 `user_id` 추출, 미인증 시 401. 예외 경로: `/api/auth/register`, `/api/auth/login`, `/api/health` 등.
- **3단계**: 프로젝트·파일 등에 `user_id` 추가, 조회 시 소유자 필터. users에 role·allowed_domains, 인가(도메인·프로젝트 접근) 검사
- **4단계**: device_registry 테이블 + device_members 매핑, Device Token (user_id 1:N·추후 N:M 공유 확장), 엣지 디바이스 등록·API. **RLS 적용**: 이 단계에서 device_registry·device_members 도입 시 Postgres RLS 정책 적용 권장.
- **5단계**: (선택) 소셜 로그인(OAuth 2.0), 비밀번호 찾기, 이메일 인증, **api_usage** 수집·저장. OAuth는 **2.0** 기준으로 구현.

### 2.3 OAuth 2.0(소셜 로그인) — 연기·추후 적용

- 소셜 로그인은 **5단계 선택** 기능이며, 각 IdP(구글·카카오·네이버·페이스북 등)에서 **개발자 센터에 앱 등록 후 Client ID·Client Secret(또는 해당 플랫폼 용어) 발급**이 선행되어야 한다. 앱 등록·동의 화면·리다이렉트 URI 설정 등 초기 구성 부담이 있어 **나중에 추가**하기로 한다. 당분간 이메일·비밀번호 + JWT 인증만 사용.

| 플랫폼 | 개발자 센터 링크 | 비고 |
|--------|------------------|------|
| 구글 | [Google Cloud Console](https://console.cloud.google.com/) | Client ID, Client Secret. OAuth 2.0 클라이언트 생성·리다이렉트 URI 등록. |
| 카카오 | [Kakao Developers](https://developers.kakao.com/) | REST API 키 또는 Client ID/Secret. 카카오 로그인 활성화·Redirect URI 등록. |
| 네이버 | [Naver Developers](https://developers.naver.com/) | Client ID, Client Secret. 네이버 로그인 API 신청·Callback URL 등록. |
| 페이스북 | [Meta for Developers](https://developers.facebook.com/) | App ID, App Secret. Facebook Login 제품 추가·Valid OAuth Redirect URI 등록. |

- **추가 시점**: 필요 시 위 플랫폼별로 하나씩 연동. 백엔드(Passport OAuth 전략·콜백 라우트·JWT 발급) + 프론트(로그인/회원가입 페이지에 "Google로 로그인" 등 버튼·콜백 후 토큰 저장) 구현.

---

## 3. 인증 시스템 구성 (JWT + Passport.js + Device Token)

- **일반 사용자(웹)**: **Passport.js** → 로그인 처리 → **JWT**(access·refresh 토큰) 발급. API 요청 시 `Authorization: Bearer <access_token>` 검증.
- **엣지 디바이스**: **Device Token** 발급. API 요청 시 `X-Device-Token` 검증 → `user_id` 추출. **한 사용자(user_id)에 여러 디바이스 1:N 관계**.
- **역할 분리**:
  - Passport.js: 로그인 전략(로컬·OAuth 2.0)·세션 없이 JWT 발급
  - JWT: 웹 사용자 인증·세션 대체
  - Device Token: 디바이스 인증. 디바이스별 토큰 → user_id 매핑
- **API 사용량·자원 배분**: users.tier + api_usage. **현재** 자원 적절 배분·성능·부하 검증용 집계. (유료 서비스 여부는 미정, 추후 tier별 한도·유료화 확장 가능.)
- **비밀번호 저장: bcryptjs** — 일방향 해시. 원문 복원 불가. DB 유출·관리자도 비밀번호 직접 확인 불가. 분실 시 **재설정(새 비밀번호 발급)**만 가능. 로그인 시 `bcrypt.compare(입력, DB해시)`로 비교.

---

## 4. 데이터 모델

### 4.1 users (플랫폼 전역)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID v7 |
| email | VARCHAR(255) UNIQUE | 로그인용 이메일 |
| password_hash | VARCHAR(255) | bcryptjs 해시. 소셜 전용 시 nullable |
| display_name | VARCHAR(100) | 표시 이름 |
| **role** | VARCHAR(20) | `admin` \| `user` \| `viewer`. 기본 `user` |
| **allowed_domains** | JSON | 허용 도메인 목록. 예: `["ai","nexa-node"]`. admin이면 무시(전체 허용) |
| **tier** | VARCHAR(20) | **시스템·기능 수준**을 나타내는 중립 코드. §4.1.0 참고. 예: `BASIC` \| `STANDARD` (추후 `PRO` 등 확장). free/paid가 아님. |
| created_at | TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | 수정 시각 |
| **deleted_at** | TIMESTAMP NULL | 탈퇴 시각. Soft Delete용. NULL이면 활성 계정 |
| metadata | JSON | 확장 속성 |

- **role**: admin=전 도메인·전 프로젝트, user=일반 접근, viewer=조회만.
- **allowed_domains**: role이 user/viewer일 때 적용. `null` 또는 `[]`이면 기본 도메인만. 도메인별·프로젝트별 접근 제어로 관리 용이·보안 강화.
- **tier**: **자원 배분·회원별 사용량 파악**으로 이후 기획·유료화 전환에 대비. 값은 **free/paid가 아닌 시스템 수준 코드**(BASIC, STANDARD 등) 사용. 상세는 §4.1.0.
- **추후**: `user_groups`, `project_members`(프로젝트 공유) 테이블 확장 검토.

#### 4.1.0 Tier 명명·표시 전략 (논의)

- **배경**: `free`/`paid`처럼 과금을 전제로 한 이름은 (1) “나중에 무료도 유료화되나?” 같은 불안을 주고 (2) 실제로 쓸 만한 건 유료 아닌가 하는 인상을 줄 수 있음. 한편 클라우드 AI API·무거운 서비스 특성상 무한정 오픈은 어렵고, **회원별 사용량 파악**은 필수이며, 기능이 고도화된 뒤 **약간의 수정으로 유료화 전환**이 가능한 구조가 바람직함.
- **방향**: tier 값은 **시스템의 상태·기능 수준**을 나타내는 **중립 코드**만 사용. 과금 여부는 tier와 분리해, 나중에 “이 tier는 유료 플랜과 매핑”처럼 정책만 붙이면 됨.
- **tier 코드(DB·API)**  
  - 예: `BASIC`, `STANDARD`. (추후) `PRO`, `ENTERPRISE` 등 확장.  
  - 신규 가입 기본값: `BASIC`.  
  - 상한(디바이스 수, API 호출 등)은 설정/정책 테이블 또는 상수에서 tier 코드별로 관리.
- **UI 표기(사람이 보는 이름)**  
  - tier 코드와 1:1 매핑된 **별도 표기** 사용. 예: `BASIC` → “베타 테스터”, `STANDARD` → “정회원”.  
  - UI에는 “무료/유료” 대신 위와 같은 중립·역할 느낌의 문구를 쓰면, 나중에 유료 플랜을 도입해도 같은 tier 체계 위에 “STANDARD = 유료 월 구독” 등만 매핑하면 됨.
- **유료화 전환 시**: tier 값(BASIC, STANDARD 등)은 유지. 새 tier 추가 또는 기존 tier에 “과금 플랜 연결”만 하면 되어, 스키마·클라이언트 노출 용어를 크게 바꿀 필요 없음.

#### 비밀번호 재설정(forgot-password) 토큰

- **경로**: `/my/forgot-password`(이메일 입력 → 리셋 링크 발송) → `/my/reset-password?token=...`(새 비밀번호 설정).
- **토큰 저장**: 발급된 **비밀번호 리셋 토큰**은 **Redis**에 저장(**필수**). TTL 짧게(예: 1시간) 설정. `SET key token EX 3600` 등. 키 예: `pwd_reset:{token_hash}` 또는 `pwd_reset:{user_id}:{random}`. 감사·복구 필요 시 DB 테이블(`password_reset_tokens`) 보조 저장은 선택.
- **사용 후 폐기**: `/my/reset-password`에서 새 비밀번호로 정상 처리되면 해당 토큰을 **즉시 무효화**(DB 삭제 또는 Redis DEL). 일회용으로만 사용.
- **보안**: 토큰은 추측 불가능한 랜덤 값(예: crypto.randomBytes). 이메일과 1:1 매핑·user_id 연결해 검증 시 대조.

#### 탈퇴(Soft Delete)

- **목적**: 계정 탈퇴 시 **물리 삭제 대신 Soft Delete**로 데이터를 남겨 FK·참조 무결성·감사·복구 가능성을 유지하고, 전체 시스템 안정화에 도움.
- **구조**: `users.deleted_at`에 탈퇴 시각 기록. `deleted_at IS NULL`이면 활성 계정.
- **로직**: (1) 로그인·JWT 발급·비밀번호 재설정 등 **모든 인증 시** `deleted_at IS NOT NULL`이면 거부(401 또는 "탈퇴한 계정" 메시지). (2) API 인증 미들웨어에서 `req.user` 조회 시 `deleted_at` 조건 포함해 탈퇴 계정은 미인증 처리. (3) 디바이스·프로젝트 등 FK는 유지되나, 해당 user는 접근 불가.
- **조회**: 관리·통계용 조회 시 `WHERE deleted_at IS NULL` 기본 적용. 필요 시 admin만 탈퇴 계정 조회.

- **동일 이메일 재가입 시 유니크 충돌 대응**: Soft Delete 사용 시 탈퇴한 행도 `email` 값을 유지하므로, `email`에 일반 `UNIQUE` 제약을 걸면 **동일 이메일로 재가입 시 유니크 위반**이 발생한다. **대응**: `email`에는 컬럼 단위 `UNIQUE`를 걸지 않고, **부분 유니크 인덱스(Partial Unique Index)**만 사용한다.  
  - **Postgres 예**: `CREATE UNIQUE INDEX uk_users_email_active ON users (email) WHERE deleted_at IS NULL;`  
  - **의미**: “활성 계정(deleted_at IS NULL)만 보았을 때 email이 유일”하다. 탈퇴한 행(deleted_at IS NOT NULL)은 이 인덱스에 포함되지 않으므로, 같은 이메일로 새 행을 INSERT(deleted_at NULL)하면 기존 탈퇴 행과 충돌하지 않는다.  
  - **재가입 흐름**: 동일 이메일로 회원가입 시 새 `id`(UUID v7)로 **새 행 INSERT**. 기존 탈퇴 행은 그대로 두어 이력·감사 유지.  
  - **구현 시**: users 테이블 DDL에서 `email` 컬럼에 `UNIQUE`를 붙이지 않고, 위 부분 유니크 인덱스만 생성한다.

#### 4.1.1 Tier 기본 할당 및 전환 로직

- **기본 할당**: 신규 회원가입 시 `tier = 'BASIC'`으로 설정. (§4.1.0: free/paid가 아닌 시스템 수준 코드. UI 표기는 예: BASIC → “베타 테스터”.) tier별 상한(디바이스 수, API 호출 한도 등)은 설정/정책 테이블 또는 상수로 관리.
- **티어 상향(Upgrade)**: 사용자 또는 admin이 상위 tier로 변경. 변경 즉시 새 상한 적용. 기존 리소스(디바이스 수, 사용량)가 새 상한 이하면 별도 조치 없음.
- **티어 하향(Downgrade)**  
  - **원칙**: 새 tier의 상한을 초과하는 리소스가 있으면, 전환 완료 전에 **초과분 정리**가 선행되어야 함.  
  - **디바이스 수 축소 예**: 상한이 10 → 3으로 줄어들 때, 활성 디바이스가 3개 초과면 **초과 디바이스에 대해 비활성화(is_active = false) 또는 사용자 선택 후 정리** 필요.  
    - **권장**: 전환 시점에 "유지할 디바이스 N개 선택" UI 제공 → 선택된 N개만 `is_active` 유지, 나머지는 `is_active = false` 처리. 선택하지 않으면 **last_seen 최신순**으로 상한만큼 유지, 나머지 비활성화 등 정책 하나로 고정.  
  - **API 한도**: 해당 기간(일/월) 사용량이 새 상한을 이미 초과한 경우, 전환 시점부터 새 상한 적용·초과분은 차단. 이전 사용량은 되돌리지 않음(다음 주기부터만 새 한도).
- **전환 시점 처리**  
  - **즉시 반영**: tier 컬럼 갱신 즉시 적용. 한도 검사·디바이스 상한 검사는 다음 API 호출/다음 요청부터 새 tier 기준.  
  - **(선택) 유료 구독 시**: 결제 주기 말에 갱신·하향 시 "다음 결제일부터" 적용 등 정책은 추후 과금 모듈과 연동하여 정의.

#### 4.1.2 api_usage (API 사용량 집계 — 자원 배분·성능 검증)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| user_id | VARCHAR(36) FK | users.id |
| api_name | VARCHAR(50) | `tavily`, `ollama`, `openai`, `anthropic`, `upload`, `ai_chat` 등 서버·외부 리소스 구분 |
| period | VARCHAR(10) | `YYYY-MM`(월) 또는 `YYYY-MM-DD`(일) |
| period_type | VARCHAR(10) | `daily` \| `monthly` |
| count | INT | 호출 횟수. 또는 tokens·credits 등 단위(api_name별 정책) |
| updated_at | TIMESTAMP | 마지막 갱신 시각 |

- **목적(우선)**: **현재 자원 적절 배분** — 동일 인프라(Ollama·업로드·AI 채널 등)를 여러 사용자가 쓸 때 user_id별 사용량을 집계해 부하 분포·이상 사용 파악. **성능·부하 검증** — 일/월 단위 통계로 확장성·한도 정책 설계 근거 확보. (유료화는 미정, 필요 시 tier·상한과 연동.)
- **수집 대상 예**: 로컬 Ollama 호출, Tavily(웹 검색), 클라우드 AI(OpenAI 등), 업로드 건수, AI 채팅/채널 호출 등. 도입 단계에서는 핵심 경로만 먼저 계측 후 점진 확대.
- **흐름**: 인증 후 `req.user`로 user_id 확보 → 호출 전(선택) 한도 검사 → 호출 후 count 증가. 상한 미적용 시에도 **집계만** 수행해 대시보드·모니터링·성능 검증에 활용.
- **이원화 전략(Redis 유실 대비)**: 서버 비정상 종료 시 Redis에만 있던 사용량이 사라지는 문제를 막기 위해, **저장 방식**을 api 성격에 따라 나눈다.
  - **실시간 업데이트(원칙)**: **중요·유료 API**(OpenAI, Anthropic 등 클라우드 AI, Tavily 등 비용 발생 외부 API) — 호출 직후 Redis 증가 + **즉시 DB 반영**(또는 짧은 버퍼 후 일괄 flush). 유실 시 과금·한도 오차가 커지므로 DB를 원천으로 유지.
  - **배치 방식**: **상대적으로 가벼운 로컬·로그성 통계**(로컬 Ollama 호출 횟수, 업로드 건수, ai_chat 호출 수 등) — Redis에만 증가 시키고, 주기적(예: 분/5분 단위) 또는 임계치 도달 시 DB 동기화. 부하·디스크 I/O 절감, 소량 유실은 통계·성능 검증 용도에서 허용.
- **캐시**: Redis에 `user_id:api_name:period` → count. 조회 시 Redis 우선. 실시간 대상은 위 전략에 따라 DB까지 반영 후 Redis 갱신.
- **종료 시 flush(유실 최소화)**: Redis·메모리 버퍼에서 DB로 일괄 flush 할 때, **서버 재시작·종료 시점**에 남은 데이터를 DB에 쓴 뒤 종료하도록 설계. **NEXA 서버(Express)** 는 `process.on('SIGTERM'/'SIGINT')`에서 잔여 api_usage 버퍼를 DB에 flush 후 프로세스 종료. (NestJS 사용 시에는 `onModuleDestroy`·`beforeApplicationShutdown` 활용.) 비정상 종료(kill -9 등)는 방어 불가하나, 정상 재시작·배포 시 유실을 최소화.
- **운영**: admin/운영용으로 사용량 조회 API 또는 내부 대시보드 권장. 이상 구간(특정 user 급증 등) 알림·로그 연동은 추후.

### 4.2 device_registry (엣지 디바이스, **신규**)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID v7 |
| **user_id** | VARCHAR(36) FK | users.id. **소유자(등록자)**. 접근 권한·공유 목록은 **device_members**에서 관리 |
| **token_hash** | VARCHAR(64) UNIQUE | device_token의 해시(SHA256). 평문 저장 금지. API 요청 시 해시 비교 |
| **mac_address** | VARCHAR(17) | MAC 주소. 디바이스가 매 API 요청 시 전송. 서버가 수신 시마다 갱신. 사용자 직접 수정 불가 |
| name | VARCHAR(100) | 디바이스 식별명 (사용자 지정) |
| device_type | VARCHAR(50) | esp32, esp8266 등 |
| created_at | TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | 수정 시각 |
| **last_seen** | TIMESTAMP | 마지막 접속 시각. 인증 성공 시마다 갱신. 죽은 디바이스 관리용 |
| **is_online** | BOOLEAN | 현재 연결 여부. `true`=살아있음. API heartbeat 또는 MQTT 연결 상태로 갱신. viewer가 "이 기기가 지금 살아있는지" 즉시 확인 가능 → 협업 가치 증대 |
| **ip_address** | VARCHAR(45) | 최근 접속 IP. 요청마다 변경 가능. 보안·추적용 |
| **is_active** | BOOLEAN | 디바이스 활성 여부. `false` 시 토큰 검증 거부. 분실·이상 동작 시 즉시 비활성화 |
| metadata | JSON | 확장 속성 |

- **관계**: `users` ↔ `device_registry`는 **device_members** 매핑 테이블로 연결. 당장은 1:N(디바이스당 소유자 1명), 추후 한 디바이스를 여러 유저가 공유·데이터 연동할 수 있도록 확장 대비.
- **device_token 저장 방식**: 토큰을 **해시(SHA256)**하여 저장. 발급 시 토큰은 한 번만 노출, 이후 복원 불가. DB 유출 시에도 권한 탈취 방지. API 요청 시 `sha256(전달된 토큰)` → DB `token_hash`와 비교.
- **해시 선택**: bcrypt는 의도적 지연으로 요청마다 부담 큼. SHA256은 빠름(마이크로초). 토큰은 고엔트로피라 무차별 대입 비현실적 → **SHA256 권장**.
- **mac_address**: 디바이스가 **매 API 요청 시** 전송. 서버는 수신 시마다 덮어써서 갱신. **펌웨어가 원천(Single Source of Truth)** — 하드웨어 교체·MAC 변경 시 다음 요청에 반영. 사용자는 직접 수정 불가. **대시보드 "새로고침"** → `GET /api/devices` 재조회로 최신 표시. 중복 등록 방지·재등록 검증·토큰 탈취 시 MAC 변경 감지(보조). MAC 스푸핑 가능 → 참고용. (추후) 운영상 수동 덮어쓰기 필요 시 `mac_address_override` + admin 전용 수정으로 확장 검토.
- **last_seen**: 인증 성공 시마다 갱신. 죽은 디바이스(N일 미접속) 알림·비활성화·삭제 후보. UI "마지막 접속: N분 전" 표시.
- **is_online**: API 요청 또는 MQTT 연결(keepalive) 수신 시 `true`, 일정 시간(예: 2~5분) 미수신 시 `false`. viewer 등 공유 사용자가 과거 데이터뿐 아니라 **"현재 이 기기가 살아있는지"**를 즉시 알 수 있어 협업 가치가 높아짐.
- **ip_address**: 인증 성공 시 `req.ip` 등으로 갱신. 의심 IP·지역 변경 감지, 네트워크 이슈 추적. IP는 개인정보일 수 있음 → 보관·보유 기간 정책 고려.
- **is_active**: 기본 `true`. 분실·도난·이상 동작 감지 시 웹 대시보드에서 즉시 `false`로 전환 → 해당 토큰 검증 거부. 토큰 노출 리스크 완화.
- **(추후) MQTT 연동 시**: 브로커 클라이언트 식별·연결 상태 등이 필요하면 **device_registry**에 `mqtt_client_id`, `mqtt_last_connected_at` 등 컬럼 확장 검토. 토픽·브로커 설정 상세는 MQTT 전용 설계 문서에서 정의.

#### 4.2.0 device_members (사용자–디바이스 멤버십·접근 권한)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID v7 |
| user_id | VARCHAR(36) FK | users.id |
| device_id | VARCHAR(36) FK | device_registry.id |
| **role** | VARCHAR(20) | `owner` \| `editor` \| `controller` \| `viewer`. 소유자=owner, 공유 시 editor/controller/viewer 부여 |
| created_at | TIMESTAMP | 매핑 생성 시각 |

- **제약**: (user_id, device_id) 유일. 동일 유저가 동일 디바이스에 중복 매핑 방지.
- **인덱스**: (user_id, device_id) 유일 인덱스(제약 동시). **역방향 조회**용으로 (device_id, user_id) 복합 인덱스 추가 권장 — "이 디바이스에 접근 가능한 사용자 목록" 조회 최적화.
- **역할 우선순위**: owner > editor > controller > viewer. "이상의 역할이 하나라도 있으면 허용" 등 인가 로직에서 참고.
- **역할 매트릭스** (액션 × 역할):

| 액션 | owner | editor | controller | viewer |
|------|:-----:|:------:|:----------:|:------:|
| 멤버 관리·디바이스 삭제·소유권 이전 | O | X | X | X |
| 설정·로직 편집 (이름, 토픽, 임계값 등) | O | O | X | X |
| 실시간 제어 (릴레이, OTA 트리거 등) | O | X | O | X |
| 조회·모니터링 (데이터, 상태) | O | O | O | O |

- **역할 4종**: **owner** = 멤버 관리·디바이스 삭제·소유권 이전 + 설정 편집 + 실시간 제어 + 조회. **editor** = 설정·로직 편집(이름, 토픽, 임계값 등) + 조회. **controller** = 실시간 제어(릴레이, OTA 트리거 등) + 조회. **viewer** = 조회·모니터링만. editor는 설정만, controller는 제어만 허용해 owner 권한과 구분.
- **목적**: 사용자와 디바이스의 **접근 권한**을 명시. 한 디바이스에 여러 유저가 연결되는 **N:M** 확장 가능. 데이터 공유·공유 디바이스 제어 시 이 테이블·role 기준으로 인가.
- **초기 동작**: 디바이스 등록 시 `device_registry.user_id` 설정 + **device_members**에 `(user_id, device_id, role='owner')` 1건 삽입. "내 디바이스 목록" 등 조회 시 **device_members**에서 해당 user_id의 device_id 목록 사용. 인가 시 "이 user가 이 device에 어떤 행위가 가능한가?"는 **device_members.role**로 판단.
- **추후**: 공유 시 `(공유받는_user_id, device_id, role='editor'|'controller'|'viewer')` 추가. 설정만 열어주려면 editor, 제어만 열어주려면 controller, 보기만 하려면 viewer 부여.
- **소유권 이전 흐름**: **요청** → **대기** → **수락** → **사후조정**. (1) 요청: 현 owner가 양수인에게 이전 요청. (2) 대기: 수락 전까지 **제어권·책임은 현 owner 유지**. (3) 수락: 양수인이 수락 시 **즉시 이양** — device_registry.user_id·device_members의 owner 교체. (4) 사후조정: 변심 등으로 되돌려야 할 경우 **audit_log** 이력을 근거로 시스템 총관리자(admin)가 수동 조정.
- **MQTT·토픽 구독·발행 인가(추후)**: 플랫폼에서 MQTT를 사용할 경우, 토픽이 **device_id** 단위(예: `nexa/devices/{device_id}/stat`, `.../cmnd`)라면 서버·브로커에서 **device_members.role**로 허용 여부 판단. (1) **stat(상태)** 토픽 — `viewer` 이상이면 구독 허용. viewer는 stat 구독으로 데이터 조회 가능. (2) **cmnd(제어)** 토픽 — `controller` 또는 `owner`만 구독·발행 허용. `viewer`·`editor`는 cmnd 구독·발행 시 **device_members.role** 조회 후 서버 레벨에서 차단. 디바이스(엣지) 발행 인증은 Device Token·브로커 클라이언트 인증으로 별도 처리.
- **device_members 캐시**: 구독·API 인가마다 role 조회가 잦을 경우 **Redis** 등에 `user_id` → `{ device_id: role }` 매핑 캐시. 조회 시 캐시 우선. **이벤트 기반 무효화** — device_members 테이블 변경(멤버 추가·역할 변경·삭제) 시 해당 user_id의 캐시·해당 device_id 관련 캐시를 즉시 무효화하고, 해당 사용자의 활성 세션(WebSocket·API)·MQTT 구독 세션을 끊는 로직을 트리거. Device Token 검증 캐시와 별도 관리.

#### 4.2.1 mac_address 갱신 시점·변경 이력(검토, 부담 최소)

- **갱신 시점**: 현재 행의 `updated_at`이 `last_seen`·`mac_address`·`ip_address` 갱신 시 함께 갱신되므로 "마지막 수정 시각"은 이미 제공됨. **mac_address만**의 갱신 시점이 필요하면 `mac_address_updated_at` 컬럼 하나 추가(선택, 가벼움).
- **변경 이력·로그**: MAC 변경 이력을 남기려면 별도 테이블(예: `device_mac_log`) 또는 audit 로그가 필요하나, 요구 가능성은 작고 **매 API 요청마다** 갱신 시 insert하면 부하가 커짐. **성능 부담 없이** 하려면: (1) 당장은 이력 테이블 없이 `updated_at`(또는 선택적 `mac_address_updated_at`)만 사용, (2) 추후 필요 시 **값이 바뀔 때만** 이전 MAC·변경 시각을 1건 insert하는 방식(변경 시에만 기록)으로 검토. 당장은 컬럼 수준만 권장.

#### 4.2.2 Device Token 검증 시 DB 부하 대책

- **상황**: 특정 아트 프로젝트 등 수백~수천 대 동시 전원 ON 시 토큰 검증 요청 집중 → DB 부하 급증.
- **대책**:
  1. **캐시(Redis, 필수)**: `token_hash` → `{ user_id, is_active }` 매핑 캐시. 검증 시 Redis 우선 조회, 미스 시 DB 조회 후 Redis 저장. TTL 예: 1시간~24시간. IoT에서 다수 디바이스 동시 인증 시 DB 부하 완화.
  2. **캐시 무효화**: 디바이스 `is_active` 변경·삭제 시 해당 token_hash 캐시 무효화. 실시간 비활성화 반영.
  3. **인덱스**: `token_hash` UNIQUE 인덱스 유지.
  4. **선택**: DB read replica, Connection pool 튜닝.
  5. **RLS(Row-Level Security)** (**필수 적용**): Postgres 등 **실제 DB 수준**에서 device_registry·device_members 등에 RLS 정책을 적용하면, 애플리케이션 버그(인가 로직 누락, 쿼리 실수 등)로 인해 **다른 사용자의 디바이스 정보가 유출되는 사고를 원천 차단**할 수 있다. "해당 user_id가 device_members에 있는 device만 접근 가능"을 DB가 강제하므로, 애플리케이션 방어선 실패 시에도 DB가 마지막 방어선 역할을 수행한다. **적용 시점**: 인증 2단계(API 인증 미들웨어 적용) 이후, device_registry·device_members 도입 시점에 **RLS 필수 적용**. **캐시 오염 대응**: Redis 등 캐시에는 행 단위 보안이 없음. 캐시 키에 `user_id`(또는 권한 컨텍스트)를 반드시 포함하고, device_members·project_members 등 RLS 관련 테이블 변경 시 해당 user_id·device_id 관련 캐시를 **즉시 무효화**하여 타 사용자 데이터 유출·폐기된 권한 반영 누락을 방지한다.

**RLS 정책(Policy) 예시**: 요청별로 DB 세션에 `app.current_user_id`를 설정한 뒤, 정책에서 해당 값을 사용한다. (1) **device_registry** — 소유자만 자신의 행 조회·수정 허용. `ALTER TABLE device_registry ENABLE ROW LEVEL SECURITY;` 후 예: `CREATE POLICY device_registry_select ON device_registry FOR SELECT USING (user_id = current_setting('app.current_user_id', true));`, `CREATE POLICY device_registry_all ON device_registry FOR ALL USING (user_id = current_setting('app.current_user_id', true));` (2) **device_members** — 본인 행만 접근. `CREATE POLICY device_members_access ON device_members FOR ALL USING (user_id = current_setting('app.current_user_id', true));` (3) **애플리케이션** — 인증 직후 커넥션/트랜잭션에서 `SET LOCAL app.current_user_id = 'uuid';` 실행. admin 등 예외는 `BYPASSRLS` 역할 또는 별도 정책으로 처리.

### 4.3 기존 테이블 확장 (user_id 추가)

| 테이블 | 추가 컬럼 | 설명 |
|--------|-----------|------|
| projects | user_id VARCHAR(36) FK | 프로젝트 소유자 |
| project_folders | (project → user_id로 파생) | project 소유자와 동일 |
| files | (file_references 등으로 user_id 파생 가능) | project_id 경유 또는 직접 |
| ai_channels | (project 소유자 파생) | project_id 경유 |
| ai_chats | (channel → project → user_id) | channel 경유 |

- **정책**: 프로젝트가 `user_id` 소유. 하위 폴더·파일·채널·채팅은 `project_id`로 소유자 파생.

#### 4.3.1 project_members (프로젝트 공유, **추후**)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| project_id | VARCHAR(36) FK | projects.id |
| user_id | VARCHAR(36) FK | users.id |
| role | VARCHAR(20) | `owner` \| `editor` \| `viewer` |

- **용도**: 프로젝트별 공유. 소유자 외 사용자에게 접근 권한 부여. 추후 구현.

#### 4.3.2 user_groups (그룹·팀, **추후**)

- **groups**(또는 user_groups): `id`, `name`, `parent_group_id`(상위 그룹, 계층 구조). **group_members**: `user_id`, `group_id`, `role`. 총관리자 → 중간급 관리자 배분 시 그룹 단위로 권한 범위 부여. 추후 확장.

#### 4.3.3 audit_log (권한·접근 이력, **선택**)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID v7 |
| user_id | VARCHAR(36) FK | users.id (행위자) |
| action | VARCHAR(50) | `device_member_add`, `device_member_remove`, `device_delete`, `login`, `login_fail` 등 |
| resource_type | VARCHAR(30) | `device`, `device_member`, `project`, `user` 등 |
| resource_id | VARCHAR(36) | 대상 리소스 id |
| details | JSON | 추가 정보(변경 전후 값, ip 등) |
| ip_address | VARCHAR(45) | 요청 IP |
| created_at | TIMESTAMP | 발생 시각 |

- **용도**: 권한 변경·접근·실패 이력 기록. 계층적 관리·책임 추적·감사용. 선택 구현.

#### 4.3.4 invitations (공유 초대, **선택**)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID v7 |
| resource_type | VARCHAR(20) | `device` \| `project` |
| resource_id | VARCHAR(36) FK | device_registry.id 또는 projects.id |
| invited_email | VARCHAR(255) | 초대 대상 이메일 (미가입 시) |
| invited_user_id | VARCHAR(36) FK NULL | users.id (가입자일 경우) |
| role | VARCHAR(20) | 부여할 역할 (viewer, editor, controller 등) |
| invited_by | VARCHAR(36) FK | users.id (초대자) |
| status | VARCHAR(20) | `pending` \| `accepted` \| `expired` \| `revoked` |
| token | VARCHAR(64) | 초대 링크용 토큰 (일회용) |
| expires_at | TIMESTAMP | 만료 시각 |
| created_at | TIMESTAMP | 생성 시각 |

- **용도**: "viewer로 공유 초대" → 이메일 발송 → 수락 시 device_members(또는 project_members)에 행 추가. 초대·수락 흐름 지원. 선택 구현. (추후) 플랫폼 접속자가 **직접 메시지로 초대·수락**해 신속히 진행하려면 WebSocket 기반 실시간 채팅 기능 또는 전용 SNS에 초대 흐름을 포함·연동할 수 있다.

### 4.4 세션·토큰 (선택 저장소)

| 구분 | 방식 | 설명 |
|------|------|------|
| **JWT** | stateless | access_token + refresh_token. 서버에 저장 안 함. 검증만 |
| **세션** | stateful | 세션 저장소(Redis 등). 서버에서 세션 id로 user_id 조회 |

- **추천 1단계**: JWT. 구현 단순, 세션 저장소 불필요.

### 4.5 구현 시 DDL 보강 (인증 테이블)

현재 `database/init_postgres.sql`에는 part_*, files, archives 등만 있고 **인증용 테이블은 없음**. 구현 시 아래를 추가한다.

| 순서 | 테이블 | § | 비고 |
|------|--------|---|------|
| 1 | **users** | 4.1 | id(UUID v7), email(UNIQUE 아님), password_hash, display_name, role, allowed_domains(JSONB), tier, created_at, updated_at, deleted_at, metadata(JSONB). 앱에서 id 생성. **email 유일**: 부분 유니크 인덱스 `UNIQUE (email) WHERE deleted_at IS NULL` (§4.1 탈퇴·재가입 대응). |
| 2 | **password_reset_tokens** | 4.1 | (선택) 비밀번호 리셋 토큰은 **Redis 필수**. 감사·복구용으로 DB에 남길 때만 추가. id, user_id FK, token_hash, expires_at, used_at 등. |
| 3 | **api_usage** | 4.1.2 | user_id FK, api_name, period, period_type, count, updated_at. (user_id, api_name, period) 유일. TimescaleDB 사용 시 하이퍼테이블 검토. |
| 4 | **device_registry** | 4.2 | id, user_id FK users(id), token_hash UNIQUE, mac_address, name, device_type, last_seen, is_online, ip_address, is_active, metadata(JSONB) 등. |
| 5 | **device_members** | 4.2.0 | id, user_id FK, device_id FK device_registry(id), role, created_at. (user_id, device_id) UNIQUE. (device_id, user_id) 복합 인덱스 권장. |

**기존 테이블 정합성**: `files.user_id`, `ai_user_memos.user_id`는 현재 VARCHAR(100) 등. users 도입 후 **VARCHAR(36)** 로 통일하거나 users.id에 FK 추가. `projects` 테이블은 init_postgres.sql에 없으면 AI 도메인에서 별도 정의 시 `user_id` FK 추가(§4.3).

---

## 5. API 설계

### 5.1 인증 API

| API | 역할 |
|-----|------|
| `POST /api/auth/register` | 회원가입 (email, password, display_name) |
| `POST /api/auth/login` | 로그인 (email, password) → access_token, refresh_token 반환 |
| `POST /api/auth/refresh` | refresh_token으로 access_token 재발급 |
| `POST /api/auth/logout` | (선택) refresh_token 무효화 |
| `GET /api/auth/me` | 현재 사용자 정보 조회 |

### 5.2 디바이스 API

| API | 역할 |
|-----|------|
| `POST /api/devices` | 디바이스 등록 (인증 필요). device_token 1회 발급(해시만 DB 저장). mac_address·last_seen·ip_address는 최초 API 호출 시 자동 채움 |
| `GET /api/devices` | 접근 가능 디바이스 목록 (**device_members**에 해당 user_id 행이 있는 device_id 조회. role별 owner/editor/controller/viewer 권한 적용) |
| `PATCH /api/devices/:id` | 디바이스 수정. `is_active: false`로 즉시 비활성화. 캐시 무효화 |
| `DELETE /api/devices/:id` | 디바이스 삭제·토큰 폐기 |

### 5.3 인증 미들웨어

- **웹 사용자**: `Authorization: Bearer <access_token>` → JWT 검증 → `user_id` → `req.user`
- **엣지 디바이스**: `X-Device-Token: <raw_token>`, `X-Device-MAC` 등 기기정보 전송 → 캐시 또는 DB에서 `token_hash` 조회 → `is_active=true` 확인 → `user_id` → `req.user`. `is_active=false`면 401. 응답 전 **mac_address·last_seen·ip_address** 수신값으로 갱신. JWT 없을 때 Device Token 시도.
- **미인증 시**: 401 반환.
- **예외 경로**: `/api/auth/register`, `/api/auth/login`, `/api/health` 등

#### 5.3.1 임시 인증 예외 (관리자 UI 기획 후 전환)

로그인 UI 적용 전까지 **부품관리·아카이브·문서·AI 등 기존 데이터 API**는 인증 없이 접근 가능하도록 임시 예외 처리되어 있다.

- **구현 위치**: `server/middleware/auth.middleware.js` — `AUTH_SKIP_PREFIXES` 배열(현재 하드코딩)
- **현재 예외 prefix**: `/api/part-classes`, `/api/part-models`, `/api/part-specs`, `/api/part-files`, `/api/archives`, `/api/archive-doc`, `/api/system-templates`, `/api/docs`, `/api/files`, `/api/db`, `/api/dev/`, `/api/package-json`, `/api/ai/`, `/api/ai-user-memos`
- **전환 방침**: **하드코딩으로 제거하지 않음**. 별도 **기획서 작성 후**, **관리자 UI**에서 공개/보호 API 경로를 쉽게 관리할 수 있도록 한 뒤, 그에 맞춰 AUTH_SKIP_PREFIXES를 설정 기반(DB·설정 파일 등)으로 전환한다. 당분간은 위 하드코딩 목록 유지.

#### 5.3.2 "AUTH_SKIP_PREFIXES 제거"란?

**AUTH_SKIP_PREFIXES**는 JWT 인증 미들웨어에서 **"이 경로들은 토큰 없이 통과"**시키기 위한 **임시 허용 목록**이다.

| 구분 | 설명 |
|------|------|
| **지금 동작** | `/api/part-classes`, `/api/archives`, `/api/docs` 등이 이 목록에 있어서, **로그인하지 않아도** 부품관리·아카이브·문서 API가 200을 반환한다. |
| **제거 시 동작** | 위 목록을 **삭제(또는 비움)** 하면, 해당 API들도 **JWT 필수**가 된다. 토큰 없이 요청하면 **401**이 반환되고, 프론트는 로그인 페이지로 보내거나 refresh 후 재시도해야 한다. |
| **왜 있었나** | 로그인/회원가입 UI가 없을 때, 부품관리 등 화면이 "데이터 없음"으로 보이지 않도록 하기 위해 넣은 **임시 예외**이다. |
| **제거 시 해야 할 일** | (1) **서버**: `auth.middleware.js`에서 `AUTH_SKIP_PREFIXES` 배열을 제거하거나 빈 배열로 둠. (2) **클라이언트**: 부품·아카이브·문서 등을 호출하는 곳에서 `fetch` 대신 `useAuthenticatedFetch().authFetch()` 사용(또는 요청 시 `Authorization: Bearer <token>` 첨부), 401이면 refresh 후 재시도 또는 `/login`으로 이동. |

**정리**: "AUTH_SKIP_PREFIXES 제거" = **데이터 API까지 로그인 필수로 만드는 것**. 선택 사항이며, 공개로 쓸 API는 제거 후에도 예외 경로로 남겨 둘 수 있다.

#### 5.3.3 공개 API vs 인증 필수 API — 관리자 도메인에서 통합 관리 예정

- **결정 시점**: 어떤 API를 비회원에게 공개할지(인증 예외로 둘지)는 **나중에 결정**한다. 현재는 임시로 `AUTH_SKIP_PREFIXES` 하드코딩으로 처리 중.
- **관리 방식**: 하드코딩이 아닌 **관리자 UI에서 쉽게 관리**하는 것을 목표로 한다. **별도 기획서 작성 후** 진행하며, **AUTH_SKIP_PREFIXES** 제거·전환도 해당 기획에 포함한다.
- **배치**: **관리자 도메인**(수퍼 관리자 전용)을 별도 할당한 뒤, **공개/보호 API 정책·관리**와 **api_usage**(5단계)를 함께 해당 도메인에 배치한다. 즉, 수퍼 관리자만 접근 가능한 설정 화면에서 경로별 공개/인증 필수 설정·API 사용량 조회 등을 수행한다.
- **문서 위치**: 본 절(§5.3.3). 나중에 결정 사항은 §12.2에도 등재.

### 5.4 보안 데이터 흐름 (구체화)

#### 사용자 ↔ 웹 서버

| 단계 | 위치 | 역할 | Zod·커스텀 |
|------|------|------|------------|
| 1 | **클라이언트** | 회원가입·로그인 폼 입력, `Authorization: Bearer` 첨부 | (선택) Zod로 폼 검증 |
| 2 | **HTTPS** | 전송 구간 암호화 | — |
| 3 | **서버 진입** | CORS, body parser | — |
| 4 | **요청 검증** | body·query·params 스키마 검증 | **Zod**: shape·타입·길이 검증. 여기서 실패 시 400 |
| 5 | **커스텀 보안** | (차후) Rate limit, IP 제한. **api_usage** 집계(자원 배분·성능 검증), 필요 시 tier 기반 한도 | **커스텀 로직** 삽입 지점 |
| 6 | **인증** | JWT 검증 → `req.user` | Passport.js + JWT |
| 7 | **인가** | `user.role`·`allowed_domains`·project 소유/공유 검사 | **커스텀 로직** 삽입 지점 |
| 8 | **핸들러** | 비즈니스 로직 | — |

#### 엣지 디바이스 ↔ 웹 서버

| 단계 | 위치 | 역할 | Zod·커스텀 |
|------|------|------|------------|
| 1 | **엣지 펌웨어** | `X-Device-Token`, body 전송 | UUID v7 등 사전 생성 ID |
| 2 | **HTTPS** | 전송 구간 암호화 | — |
| 3 | **서버 진입** | CORS, body parser | — |
| 4 | **요청 검증** | body·query 스키마 검증 | **Zod**: 페이로드 shape·타입 검증. 실패 시 400 |
| 5 | **커스텀 보안** | (차후) 디바이스별 Rate limit. **api_usage** 집계(자원·성능 검증), 필요 시 tier 기반 한도 | **커스텀 로직** 삽입 지점 |
| 6 | **인증** | `X-Device-Token` 검증 → device_registry 조회 → `req.user` | Device Token 미들웨어 |
| 7 | **인가** | 리소스별 `user_id`·`role`·`allowed_domains` 확인 | **커스텀 로직** 삽입 지점 |
| 8 | **핸들러** | 비즈니스 로직 | — |

- **Zod 적용 위치**: 인증 미들웨어 **직전** (또는 라우트 핸들러 진입 시). 입력 스키마 검증 → 비정상 요청 조기 차단.
- **에러 코드 유틸리티**: Zod 검증 실패 시 응답 형식·코드 통일을 위해 **별도 유틸** 구성 권장. `parseResult.error` → 에러 코드·메시지 매핑 → 400 응답 body 표준화. 예: `VALIDATION_ERROR`, `INVALID_EMAIL` 등.
- **Zod 검증 실패 시 응답 예**:
  - **HTTP**: `400 Bad Request`
  - **Body** (JSON):
    ```json
    {
      "code": "VALIDATION_ERROR",
      "message": "입력값 검증 실패",
      "errors": [
        { "path": "email", "message": "유효한 이메일 형식이 아닙니다" },
        { "path": "password", "message": "8자 이상 필요" }
      ]
    }
    ```
  - `errors`: Zod `error.issues`에서 `path`·`message`만 추출해 노출. 내부 스키마·상세는 노출하지 않음.
- **커스텀 보안 로직**: Zod 직후·인증 직전(4→5) 또는 인증 직후·핸들러 직전(7→8)에 삽입. 정책에 따라 단계별로 확장.

---

## 6. 클라이언트 연동

### 6.1 토큰 저장

- **access_token**: 메모리 또는 short-lived cookie. XSS 노출 최소화.
- **refresh_token**: HttpOnly cookie 또는 secure storage. access 만료 시 refresh로 갱신.

### 6.2 API 호출 시

- **웹**: 모든 인증 필요 API 요청에 `Authorization: Bearer <access_token>` 첨부.
- 401 응답 시 refresh 시도 → 실패 시 로그인 페이지로 리다이렉트.

### 6.3 라우트 가드

- 인증 필요 라우트: `beforeEach` 등에서 토큰 유무 확인. 없으면 로그인/회원가입 페이지로 이동.

### 6.4 UI·라우트 배치 (my/ 도메인)

- **위치**: 별도 도메인 없이 **my/** 에서 회원가입·로그인·비밀번호 찾기·설정 등 모든 인증·계정 UI 처리.
- **경로 예시**:

| 경로 | 역할 |
|------|------|
| `/my/login` | 로그인 |
| `/my/register` | 회원가입 |
| `/my/forgot-password` | 비밀번호 찾기 (이메일 입력 → 리셋 토큰 발급·링크 발송. 토큰은 **Redis** 저장, TTL 예: 1시간, 사용 후 즉시 폐기) |
| `/my/reset-password?token=...` | 비밀번호 재설정 (토큰 검증 후 새 비밀번호 설정. 성공 시 토큰 무효화) |
| `/my/settings` | 프로필·비밀번호 변경·계정 설정·**탈퇴(Soft Delete)** (로그인 후) |

- **트리거**: 비인증 사용자가 보호된 페이지 진입 시 → 라우트 가드에서 `/my/login?redirect=/ai/...` 등으로 리다이렉트.
- **헤더**: "로그인"·"회원가입" 링크 → `/my/login`, `/my/register` 연결. 로그인 후 "설정" → `/my/settings`.

---

## 7. 엣지 디바이스 연동

- **관계**: `users` ↔ `device_registry`는 **device_members** 매핑 테이블로 연결. 한 사용자에 여러 디바이스, 추후 한 디바이스에 여러 사용자(공유) 확장.
- **인증**: Device Token. 디바이스별 토큰 → device_registry 조회 후 해당 device에 대한 접근 권한은 device_members로 확인.
- **흐름**: 사용자가 웹에서 디바이스 등록 → 서버가 device_token 1회 발급(해시만 DB 저장) → 엣지 펌웨어가 `X-Device-Token`, `X-Device-MAC` 등으로 API 호출. 요청마다 token_hash 비교, **mac_address·last_seen·ip_address** 펌웨어 전송값으로 갱신. 사용자 "새로고침" → 대시보드 목록 최신 표시.
- **토큰 입력 방식**: 엣지 디바이스는 키보드·붙여넣기 불가. **[NEXA-NODE-03]** 경로 B(AP 모드 + Captive Portal) — 디바이스가 WiFi AP 생성 → 사용자가 스마트폰/PC로 접속 → 192.168.4.1 설정 페이지에서 **SSID·비밀번호·device_token** 입력(붙여넣기). 토큰을 디바이스에 직접 입력하지 않고 설정 페이지 폼에 붙여넣기.
- **목적**: 엣지 → 서버 업로드·설정 요청 시 해당 디바이스의 user_id로 소유자 식별.
- **토큰 노출 대응**: 웹 대시보드에서 `PATCH /api/devices/:id` → `is_active: false`로 즉시 비활성화. 분실·도난·이상 동작 시 토큰 무효화. 캐시 무효화로 즉시 반영.

---

## 8. 보안 고려사항

| 항목 | 권장 |
|------|------|
| 비밀번호 | bcryptjs 해시 저장. 최소 길이·복잡도 정책. 분실 시 재설정만 가능(복원 불가) |
| HTTPS | 프로덕션 필수 |
| 토큰 만료 | JWT access: 15분~1시간, refresh: 7일~30일. Device Token: 장기(폐기 시까지). 엣지 부담 감소 |
| CORS | 허용 오리진 명시 |

### 8.1 권한 충돌 및 최소 권한의 원칙(Least Privilege)

- **상황**: 한 사용자가 특정 프로젝트의 viewer이면서 동시에 특정 디바이스의 owner인 등, **권한이 프로젝트·디바이스 등 리소스별로 중첩**될 수 있다.
- **우선순위 정책**: (1) **리소스 단위로 판단** — 프로젝트 접근 시 project_members·project 소유자 기준, 디바이스 접근 시 device_members 기준. 서로 독립. (2) **동일 리소스 내에서는 최고 권한 적용** — 예: device_members에 (user_id, device_id, owner)와 (user_id, device_id, viewer)가 동시에 존재하지 않음(유일 제약). 한 리소스에 한 사용자는 하나의 역할만. (3) **최소 권한의 원칙** — 필요한 최소 권한만 부여. 예: "보기만 필요"하면 viewer, 설정 수정이 필요하면 editor, 제어까지 필요하면 controller. owner는 신중히 부여.

### 8.2 실시간 권한 회수(Instant Revocation)

- **상황**: 중간 관리자 해임, 초대받은 viewer가 그룹·디바이스 접근을 나갈 때 등, **권한 회수 즉시 기존 연결을 끊어야** 한다. 캐시에 남은 권한으로 계속 접근되는 것을 방지.
- **정책**: (1) **Redis 캐시** — device_members·project_members·group_members 변경 시 해당 user_id(또는 device_id·project_id) 관련 캐시를 **즉시 무효화**. (2) **MQTT 세션** — 해당 사용자가 해당 디바이스·프로젝트에 대해 구독 중인 MQTT 연결을 **즉시 끊기**. stat/cmnd 구독 해제, 브로커에서 클라이언트 연결 종료. (3) **이벤트 기반 무효화** — device_members(또는 project_members 등) 테이블 변경을 이벤트로 발행하고, 구독 중인 서비스가 캐시 무효화·세션 종료·MQTT 연결 해제를 수행. 권한 회수 후 다음 요청에서 DB 재조회 시 이미 제거된 권한이 반영되도록 보장.

---

## 9. 로드맵

| 단계 | 내용 |
|------|------|
| **1** | users 테이블, Passport.js + JWT, 회원가입·로그인 API, 클라이언트 로그인/회원가입 UI |
| **2** | API 인증 미들웨어(JWT 검증), 401 처리, 라우트 가드 |
| **3** | projects 등에 user_id 추가, 조회 시 소유자 필터. users에 role·allowed_domains 추가, 인가 미들웨어 |
| **4** | **device_registry** + **device_members**, Device Token 발급·검증, is_active 비활성화, 토큰 검증 캐시(Redis). device_members 캐시·역할 매트릭스·인덱스 적용. 엣지 디바이스 등록 시 device_members에 owner 1건 추가 |
| **5** | **api_usage** 수집·저장(자원 배분·성능 검증). (선택) tier 기반 상한, project_members, 소셜 로그인, user_groups, **audit_log**, **invitations** |

---

## 10. 참고 문서

- **[NEXA-AI-09]** AI 워크스페이스 웹서치 자원 전략 — 프로젝트·파일·폴더, UUID v7
- **[NEXA-NODE-01]** ESPHome YAML 제너레이터 및 웹 펌웨어 배포 — 엣지 디바이스 연동
- **[NEXA-NODE-03]** ESP32 베이스라인 펌웨어 및 디바이스 등록 설계 — **AP 모드 + Captive Portal**(192.168.4.1)에서 SSID·비밀번호·토큰 입력. device_token 붙여넣기 방식

---

## 11. 구현 체크리스트 (Express 기준)

구현 시 아래를 순서대로 점검한다.

| 구분 | 항목 | 상태 |
|------|------|------|
| **의존성** | server/package.json: `passport`, `passport-local`, `passport-jwt`, `jsonwebtoken`, `bcryptjs`, `zod`(서버 검증 시) | ✅ |
| **Redis** | **필수**. Device Token 캐시, api_usage 버퍼, 비밀번호 리셋 토큰(TTL), device_members 캐시 무효화. docker-compose·환경 변수 포함. | ✅ 연동 |
| **DDL** | users, device_registry, device_members (필수). api_usage (5단계). password_reset_tokens (감사용 선택). §4.5 참고. | ✅ users, projects. device_registry·device_members 스크립트 준비(init_*.sql) |
| **인증 라우트** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me` (§5.1) | ✅ |
| **미들웨어** | JWT 검증 → `req.user` (user_id, role 등). 미인증 시 401. 예외: auth·health + 임시 데이터 API(§5.3.1) | ✅ |
| **회원가입** | email 중복 검사, bcryptjs 해시 저장, id는 `server/config/uuidUtils.js`의 `generateUuidV7()` | ✅ |
| **로그인** | `deleted_at IS NULL` 체크, bcrypt.compare, JWT 발급 | ✅ |
| **검증** | Zod로 회원가입/로그인 body 스키마 검증. 실패 시 400 + §5.4 형식(errors 배열) | ✅ |
| **종료 시** | api_usage 사용 시 `process.on('SIGTERM')`, `process.on('SIGINT')`에서 Redis 버퍼 → DB flush | 5단계 |

### 11.1 실제 구현 시 점검 체크리스트

구현하면서 단계별로 체크할 수 있는 항목이다. `[ ]` → 완료 시 `[x]`로 표시하면 된다.

**현재 상태 (2025-03 기준)**  
- **완료**: 1·2단계 백엔드 + 클라이언트 로그인/회원가입 UI. **3단계**: projects 테이블·API(GET/POST/PATCH/DELETE /api/projects), MY 페이지 "내 프로젝트" 탭, **전역 projectStore**·**ProjectSelector**(도메인 공용). **4단계**: device_registry·device_members DDL 스크립트, Device Token API(POST/GET/PATCH/DELETE /api/devices), Redis 캐시·X-Device-Token 인증, MY "등록한 디바이스" 탭(목록·등록·token 1회 표시). tier UI(BASIC→베타 테스터, STANDARD→정회원). 부품/아카이브 등 데이터 API는 임시 인증 예외(§5.3.1).  
- **다음**: (1) **Redis 영속화**(RDB 최소 활성화), (2) **서버 JS→TS 마이그레이션**(§1.4). (3) AUTH_SKIP_PREFIXES·api_usage·공개/보호 API 정책은 **관리자 도메인(수퍼 관리자 전용)** 기획서 작성 후 별도 진행. OAuth 2.0은 **한참 나중**으로 미룸.

#### 준비 (환경·의존성)

- [x] Postgres 연결 확인 (`GET /api/health/ready` 등)
- [x] Redis 컨테이너/서비스 기동, 연결 설정(.env: `REDIS_URL` 등)
- [x] Redis 영속화: RDB 최소 활성화 — docker-compose.yml·docker-dev-compose.yml에 Redis 서비스 추가, `redis-server --save 60 1`, volume(redis_data)으로 /data 영속화. (로컬 Redis 단독 사용 시 redis.conf에서 save 설정)
- [x] server/package.json에 의존성 추가: `passport`, `passport-local`, `passport-jwt`, `jsonwebtoken`, `bcryptjs`, `zod`
- [x] JWT 비밀/키 환경 변수 설정(예: `JWT_SECRET`, `JWT_REFRESH_SECRET`)

#### DDL (DB 스키마)

- [x] users 테이블 생성 (id UUID v7, email, password_hash, display_name, role, allowed_domains, tier, deleted_at 등) — `database/init_auth.sql`
- [x] email 유일: `UNIQUE (email)` 컬럼 제약 없음, **부분 유니크 인덱스** `CREATE UNIQUE INDEX uk_users_email_active ON users (email) WHERE deleted_at IS NULL;` 만 생성
- [x] users.updated_at 트리거 또는 앱 레벨 갱신
- [x] (3단계) projects 테이블 생성 (user_id FK) — `database/init_projects.sql`
- [x] (4단계) device_registry 테이블 생성 — `database/init_device_registry.sql` 적용 완료
- [x] (4단계) device_members 테이블 생성, (user_id, device_id) UNIQUE, (device_id, user_id) 인덱스 — 동일 스크립트 내
- [x] (4단계) device_registry·device_members RLS 정책 적용 (필수) — 동일 스크립트 내
- [ ] (5단계) api_usage 테이블 생성 (선택 시점)

#### 1단계 — 회원가입·로그인·me

- [x] `POST /api/auth/register`: body 검증(Zod), email 중복 검사(활성만: `deleted_at IS NULL`), password bcrypt 해시, id = generateUuidV7(), tier = 'BASIC'
- [x] `POST /api/auth/login`: body 검증, **deleted_at IS NULL** 조건으로 사용자 조회, bcrypt.compare, JWT 발급(access 1h, refresh 7d)
- [x] `POST /api/auth/refresh`: refresh_token 검증, Redis 블랙리스트 확인, access_token 재발급
- [x] `GET /api/auth/me`: JWT 검증 후 req.user 기반으로 사용자 정보 반환(비밀번호 제외)
- [x] (선택) `POST /api/auth/logout`: refresh_token jti를 Redis `refresh_blacklist:{jti}` 에 TTL로 저장
- [x] Zod 검증 실패 시 400 + §5.4 형식(errors 배열) 응답
- [x] 비밀번호 최소 8자 검증

#### 2단계 — 인증 미들웨어

- [x] JWT 검증 미들웨어: Bearer 토큰 추출 → 검증 → req.user (user_id, role 등) 설정
- [x] 미인증 시 401 반환
- [x] 예외 경로 등록: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/health` 등 (인증 없이 접근 가능)
- [x] 로그인/me 응답 시 deleted_at IS NULL 사용자만 허용(이미 조회 조건에 포함되면 생략)
- [ ] **AUTH_SKIP_PREFIXES** — 하드코딩 제거하지 않음. **별도 기획서 작성 후** 관리자 UI에서 공개/보호 API 경로를 관리하도록 전환 (§5.3.1, §5.3.3. 관리자 도메인에 배치 예정)

#### 3단계 — projects·user_id

- [x] (3단계) projects 테이블·API: GET/POST /api/projects, GET/PATCH/DELETE /api/projects/:id. 소유자 req.user.id 기준 목록·생성·조회·수정·삭제
- [x] (3단계) 클라이언트: MY 페이지 "내 프로젝트" 탭(목록·추가 다이얼로그), 전역 projectStore(fetchProjects·createProject·setCurrentProject·currentProject), ProjectSelector 컴포넌트(도메인 공용). 로그아웃 시 projectStore.clear()
- [ ] (3단계) role·allowed_domains 인가(프로젝트별 확장) — 추후

#### 4단계 — Device Token·device_registry

- [x] (4단계) Device Token 발급·검증, Redis 캐시(token_hash → user_id, is_active), is_active 비활성화 시 캐시 무효화. POST/GET/PATCH/DELETE /api/devices
- [x] (4단계) device_members 조회(목록에 role 포함). RLS 정책은 init_device_registry.sql에 포함
- [x] (4단계) device_registry·device_members 테이블 DB 적용 — init_device_registry.sql 적용 완료

#### 5단계 (선택)

- [ ] (5단계) api_usage 집계·Redis 버퍼·종료 시 flush (`process.on('SIGTERM'/'SIGINT')`)

#### 클라이언트·운영

- [x] CORS: 개발 `*` (현재 app.use(cors())). 프로덕션 환경 변수 도메인은 미적용
- [x] (클라이언트) 로그인/회원가입 페이지 (`/login`, `/register`), 토큰 저장(access/refresh)·복원(authStore), API 호출 시 Bearer 첨부·401 시 refresh 후 재시도/리다이렉트 (`useAuthenticatedFetch`, `authenticatedFetch.ts`)
- [x] (클라이언트) tier UI 표기: `authStore.getTierLabel` (BASIC → "베타 테스터", STANDARD → "정회원"). MY 페이지 등에서 사용 가능
- [x] (클라이언트) MY 페이지: 내 정보, **내 프로젝트**(projectStore 연동·추가 다이얼로그), **등록한 디바이스**(목록·등록·device_token 1회 표시·복사), 등록한 제작 장비, 내 기기 설정, 로그아웃. 로그아웃 시 projectStore.clear()
- [x] (클라이언트) 전역 projectStore(`src/system/store/projectStore.ts`), ProjectSelector(`src/system/components/ui/ProjectSelector.vue`). 각 도메인에서 목록·생성·현재 프로젝트 선택 공용

**클라이언트 구현 위치 (참고)**
- 인증 스토어: `src/system/store/authStore.ts`
- **전역 프로젝트 스토어**: `src/system/store/projectStore.ts` — 목록·현재 선택·fetchProjects·createProject·setCurrentProject. MY·아카이브·ERP 등 **어느 도메인에서나** 동일 스토어 사용.
- **프로젝트 선택 UI(도메인 공용)**: `src/system/components/ui/ProjectSelector.vue` — 드롭다운 + "새 프로젝트" 추가. 각 도메인에서 `<ProjectSelector />` 또는 `useProjectStore()`로 목록 조회·생성·현재 프로젝트 표시.
- 인증 API 래퍼(Bearer·401 처리): `src/system/utils/authenticatedFetch.ts`, `src/system/composables/useAuthenticatedFetch.ts`
- 로그인/회원가입 페이지: `src/frame/views/auth/LoginPage.vue`, `RegisterPage.vue`
- 인증 레이아웃: `src/frame/layout/AuthLayout.vue`
- 헤더 로그인/로그아웃: `src/frame/layout/components/GlobalNavbarRight.vue`

#### 현재 남은 작업 (인증·인프라·플랫폼)

| 순서 | 작업 | 구분 | 비고 |
|------|------|------|------|
| 1 | **Redis 영속화** | 인프라 | ✅ Docker Compose에 Redis 서비스 추가·RDB(save 60 1)·volume 적용. (§12.1) |
| 2 | **서버 JS→TS 마이그레이션** | 플랫폼 | ✅ **1단계 완료**: 확장자 .js→.ts 일괄 변환, server/tsconfig.json·tsx 도입, 진입점 server.ts·스크립트 연동. Express Router import 수정(health·auth). 2단계(타입·strict·최적화)는 추후. (§1.4) |

위 두 가지가 **당장 진행 가능한** 남은 작업이다. 아래는 별도 기획·관리자 도메인 이후 진행.

#### 다음 작업 제안 (우선순위)

| 순서 | 작업 | 구분 | 비고 |
|------|------|------|------|
| — | **관리자 도메인(수퍼 관리자 전용) 기획** | 기획·구현 | 별도 기획서 작성 후 진행. **공개/보호 API 정책·관리**(AUTH_SKIP_PREFIXES 대체)·**api_usage** 조회·설정을 관리자 UI에서 통합. 하드코딩 제거하지 않음. (§5.3.1, §5.3.3) |
| — | **MY 페이지 전체 정보 표시** | 클라이언트 | ✅ 완료. |
| — | **3단계: projects·user_id** | 백엔드·클라이언트 | ✅ 완료. |
| — | **4단계: device_registry·device_members** | 백엔드·클라이언트 | ✅ 완료. |
| — | **5단계: OAuth 2.0** | 백엔드·클라이언트 | **한참 나중**으로 미룸. (§2.3) api_usage·비밀번호 찾기는 관리자 도메인·별도 기획 시 함께 검토 가능. |

---

## 12. 미결정·선택 사항 정리

구현 전·중에 결정이 필요한 항목을 **당장 결정할 사항**과 **나중에 결정해도 되는 사항**으로 구분한다.

### 12.1 당장 결정할 사항 (1~2단계 구현 시) — **결정 고정**

아래는 1~2단계 구현에 필요한 항목으로 **결정된 값**이다. 구현 시 이 값을 적용한다.

| 번호 | 항목 | 문서 위치 | 결정값 |
|------|------|-----------|--------|
| 1 | **tier 기본값** | §4.1, §4.1.0, §4.1.1 | 신규 가입 시 `tier = 'BASIC'`. UI 표기: BASIC → “베타 테스터”, STANDARD → “정회원”. (free/paid 아님.) |
| 2 | **JWT 만료 시간** | §8 | **access_token 1시간**, **refresh_token 7일**. |
| 3 | **비밀번호 정책** | §8 | **최소 8자 이상**. 복잡도(대소문자·숫자·특수문자)는 2단계에서 강화 검토. |
| 4 | **CORS 허용 오리진** | §8 | **개발**: `*`. **프로덕션**: 환경 변수로 지정한 도메인만 허용. |
| 5 | **Device Token 캐시 TTL** | §4.2.2 | **1시간**. 비활성화 반영 지연 최소화. |
| 6 | **POST /api/auth/logout** | §5.1 | refresh_token 무효화 시 **Redis에 블랙리스트 저장**. 키: `refresh_blacklist:{jti}`, TTL은 refresh_token 남은 만료 시간과 동일. |
| 7 | **Redis 영속화** | 인프라 | **최소 RDB 활성화**. 재기동 시 데이터 복구. (AOF는 선택.) |

### 12.2 나중에 결정해도 되는 사항

| 번호 | 항목 | 문서 위치 | 비고 |
|------|------|-----------|------|
| 1 | **유료화·tier 상한** | §4.1, §4.1.0, §4.1.2 | tier는 BASIC/STANDARD 등 유지. 상한·과금만 tier별 정책으로 매핑. 5단계 이후 정책 수립. |
| 2 | **Rate limit 구체값** | §5.4 | IP·사용자별 요청 제한 수치. 운영 중 조정. |
| 3 | **audit_log 구현** | §4.3.3 | 권한·접근 이력. 보안·감사 요구 시 도입. |
| 4 | **invitations 구현** | §4.3.4 | 공유 초대 플로우. project_members·device_members 공유 확장 시. |
| 5 | **project_members·user_groups** | §4.3.1, §4.3.2 | 프로젝트 공유·팀. 3~4단계 이후. |
| 6 | **소셜 로그인(OAuth 2.0)** | §2.2, §2.3, §5단계 | 구글·카카오·네이버·페이스북 등. **한참 나중**으로 미룸. (§2.3에 플랫폼별 개발자 센터 링크 정리) |
| 7 | **공개 API vs 인증 필수 API 정책** | §5.3.1, §5.3.3 | **관리자 도메인(수퍼 관리자 전용)** 기획서 작성 후, 관리자 UI에서 경로별 공개/보호 설정. api_usage와 함께 해당 도메인에 배치. AUTH_SKIP_PREFIXES는 하드코딩 제거하지 않고 위 기획 후 전환. |
| 8 | **MQTT 연동·토픽 인가** | §4.2, §4.2.0 | device_registry 확장, stat/cmnd 구독. MQTT 도입 시. |
| 9 | **is_online 미수신 기준** | §4.2 | 2~5분 미수신 시 `false`. 디바이스·heartbeat 설계 후 확정. |
| 10 | **mac_address_updated_at** | §4.2.1 | MAC 변경 시점만 필요 시 컬럼 추가. |
| 11 | **tier 하향 시 디바이스 정리** | §4.1.1 | last_seen 최신순 유지 vs 사용자 선택. 유료화 시 정책 정의. |
