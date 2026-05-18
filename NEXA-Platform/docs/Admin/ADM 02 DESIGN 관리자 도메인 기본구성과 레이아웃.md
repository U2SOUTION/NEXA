# [NEXA-ADMIN-01] 관리자 도메인 기본구성과 레이아웃

**목적**: 슈퍼 관리자(Super Admin) 전용 관리자 도메인을 NEXA 플랫폼의 **MainLayout** 및 **도메인 레지스트리** 구조에 맞춰 정의하고, 실제 구현 시 작업 지시서로 사용할 수 있도록 정리한다.

**적용 범위**: 프론트 `src/domains/admin/**`, 프레임 레이어 등록(domainRegistry, routes, mainMenuTabs), 서버 관리 API·DB는 별도 문서.

**참조**: [NEXA-AUTH-01] 계정·인증·권한, [NEXA-CAPABILITY-01] Capability ID 체계 및 Tier 접근 권한, [NEXA-PLATFORM-TS-01] TS 전략, 기획 초안 `[NEXA-ADMIN-01] 관리자_도메인_기획_초안.md`

**작성일**: 2025-03

---

## 1. 프레임·레이아웃 선택

- **레이아웃**: **MainLayout** 사용. (헤더 + 왼쪽 드로어 + 중앙 컨텐츠 + 오른쪽 드로어 + 푸터)
- **도메인 키**: `nexa-admin`
- **라우트 경로**: `/nexa-admin` (도메인 키와 동일하게 유지)
- **프론트 도메인 디렉터리**: `NEXA-Platform/src/domains/admin/`

다른 도메인(settings, dev, nexa-board 등)과 동일하게 **domainRegistry**에 `nexa-admin`을 등록하고, **left / content / right** 슬롯용 컴포넌트를 지정한다.

---

## 2. 배경 및 목표

플랫폼에 회원 Tier(예: free / pro / enterprise) 및 도메인·메뉴별 접근 제어, API 사용량·리미트 관리, 회원 목록·상태 관리가 필요하다. 이를 **일관된 관리자 도메인**에서 제공해 권한 정책·감사·확장을 용이하게 한다.

**목표 요약**: 관리자 도메인 추가(슈퍼 관리자 전용, 일반 회원·비회원 접근 불가), Tier별 도메인·하위 메뉴 접근 관리, API 사용 리미트 설정, 회원 목록·상태 관리, 부관리자 역할 위임, 감사 로그·공지·엣지·OTA·AI 리소스·UI/UX 테마 등 슈퍼 관리자 기능을 한곳에서 수행.

---

## 3. 접근 대상 및 역할

**슈퍼 관리자**: 플랫폼 전역의 회원·접근 정책·API 리미트·시스템 설정 등을 관리할 수 있는 최고 권한. [NEXA-AUTH-01]의 users 테이블에 역할(role) 또는 `is_super_admin` 플래그로 구분. 관리자 도메인은 **슈퍼 관리자만** 라우트·메뉴 진입 가능하며, 그 외 회원·비회원은 403 또는 리다이렉트.

**일반 회원·비회원**: 관리자 도메인 메뉴 미노출 또는 노출되더라도 진입 시 권한 검사로 차단. 회원/비회원 접근 정책은 별도 문서에서 정리 후 본 도메인과 연계.

### 3.1 슈퍼관리자 부여 및 강제 비밀번호 변경 (구현됨)

- **최초 가입자 role=first**: 회원가입 시 활성 사용자가 0명이면 `role = 'first'`, `password_must_change = true` 부여. 그 외는 `role = 'user'`.
- **가입 시 비밀번호 정책**: 모든 가입자는 **일반 비밀번호**(8자 이상)만 적용. 첫 가입자도 가입 시점에는 강한 비밀번호 불필요.
- **강한 비밀번호**: `role = 'first'`인 사용자는 비밀번호 변경 시에만 **강한 비밀번호** 적용. 정책: 최소 10자, 영문·숫자·특수문자 각 1자 이상. `server/utils/passwordPolicy.ts`의 `validateStrongPassword()`로 검사.
- **비밀번호 변경 → admin 부여**: `/change-password` 페이지(nexa-admin 외부)에서 강한 비밀번호로 변경 성공 시 `role = 'admin'`, `password_must_change = false`로 업데이트. 이후 nexa-admin 진입 가능.
- **로그인 후 리다이렉트**: `role = 'first'` 또는 `password_must_change === true`인 사용자는 로그인·가입 성공 시 `/change-password`로 자동 리다이렉트.
- **nexa-admin 가드**: `role = 'first'`는 nexa-admin 진입 불가, `/change-password`로 리다이렉트. `role = 'admin'`만 nexa-admin 진입 허용.
- **비밀번호 변경 API**: `POST /api/auth/change-password` (JWT 필수). `role = 'first'`인 경우 강한 비밀번호 적용 후 admin 부여. 기타(예: 기존 admin의 password_must_change)는 강한 비밀번호로 갱신 후 `user` 반환.

**관련 파일·구조**는 §5·§5.1 참고.

---

## 4. 관리자 도메인 메뉴 구성

슈퍼 관리자가 **관리자 도메인**에서 접근할 수 있는 메뉴(기능)를 구분별로 정리한다. 추후 다른 도메인으로 분리·통합할 항목은 우선순위·상세 스펙에서 정리.

### 4.1 메뉴 구조 (테이블)

| 구분 | 메뉴(기능) 명 | 비고 |
|------|---------------|------|
| **계정·권한** | 전체 회원 목록 조회 및 검색 | 가입일, 마지막 접속, Tier 등 필터·검색 |
| | 회원 강제 탈퇴(Soft Delete) 및 복구 | 복구 기능 포함 |
| | 비밀번호 수동 초기화 및 임시 비밀번호 발급 | |
| | Tier별 접근 권한 매핑 | Capability ID 기반. 도메인·메뉴·액션 단위. [NEXA-CAPABILITY-01] 참고. |
| | 관리자 역할 위임 | 운영자, 고객지원 등 부관리자 설정 |
| | 회원별 메모 | 특이사항 기록용 |
| | 사용자 페르소나 미리보기 (Impersonation) | 로그인 대행으로 해당 회원 화면 대리 확인 |
| **리소스·API** | API 호출 한도(Quota) 설정 및 실시간 사용량 모니터링 | Tier/회원별, 위험군·임계치 알림 포함 |
| | 특정 API 경로 일시 차단/해제 | 예: Anthropic 클라우드 API 등 |
| | 외부 API 키 통합 관리 및 잔액 확인 | |
| | Redis/DB 캐시 강제 삭제(Flush) | 데이터 정합성 이슈 시 |
| | 사용량 초과 사용자 대상 푸시/메일 알림 발송 설정 | |
| **엣지·OTA** | 펌웨어 저장소 | 바이너리·버전·Changelog, 기기 종류별 구분 |
| | 배포 그룹 관리 | 베타/모델/지역별 기기 묶음, 기기-그룹 매핑 |
| | 배포 캠페인 | 펌웨어·그룹·방식(강제/자율/승인)·스케줄 정의 |
| | OTA 실시간 로그 | 진행 중 기기 수, 성공/실패율, 에러 코드 통계 |
| | (선택) 비정상 기기 원격 재부팅, 기기 소유권·등록 해제 | |
| **시스템·알림** | 플랫폼 전체 공지사항 배너 관리 | 로그인·대시보드 상단 등 |
| | 시스템 점검 모드 전환 | 일반 사용자 차단·안내 페이지 |
| | Audit Log(감사 로그) 조회 | 관리자 설정 변경 추적 |
| | 메일/알림 템플릿 편집기 | 가입 환영, 비밀번호 재설정 등 |
| | 시스템 상태 대시보드 | CPU, Memory, Redis, Postgres, Ollama 등 |
| **정책·기능** | 특정 기능(Function) 단위 On/Off | 도메인/메뉴 내 개별 기능 예: 이미지 생성 |
| | 정책 변경 예약 설정 | 반영 예약 일시 지정 후 자동 교체 |
| **AI 협력·리소스** | 모델 인벤토리 | Ollama·클라우드 모델 상태, Tier별 접근 매핑 |
| | 페르소나 빌더 | 말투, 성격, System Prompt 템플릿 |
| | 스킬(Tools) 라이브러리 | 웹 검색, DB 조회, 엣지 제어 등 Function Calling |
| | 에이전트/태스크 설계 | 코드 리뷰, 로그 분석 등 워크플로우 템플릿 |
| | 오케스트레이터 설정 | 에이전트 협업 규칙·우선순위 |
| | AI 추론 모니터링 | 토큰 사용량, Latency, 추론 비용 시각화(LLMOps) |
| **UI/UX·테마** | 글로벌 테마 설정 | 브랜드 컬러, 다크모드 기본값, 폰트 |
| | 컴포넌트 라이브러리 제어 | UI 컴포넌트 사용 여부·버전 |
| | 대시보드 레이아웃 템플릿 | Tier/도메인별 위젯 배치 |
| | 다국어 및 문구 관리 (i18n) | 레이블, 버튼, 에러 메시지 편집·현지화 |
| | 런처/사이드바 구성 | 도메인 아이콘, 메뉴 순서, 그룹화 |
| | 사용자 가이드/온보딩 | 툴팁, 가이드 팝업 시나리오·노출 로직 |

OTA 배포 방식은 **Push(강제) / Pull(자율) / User-consented(승인)** 세 가지를 모두 지원하도록 설계. 상세는 [NEXA-NODE-01] 및 기획 초안 §4 참고.

---

## 5. 도메인 디렉터리 및 컴포넌트 구조

다른 도메인 뷰와 동일한 구조로 둔다.

**경로**: `NEXA-Platform/src/domains/admin/`

- **AdminDomain.vue**  
  도메인 루트. `user.role === 'admin' && user.password_must_change`이면 **AdminChangePassword**만 표시, 아니면 **AdminContent** 표시. `role = 'first'`는 라우트 가드에서 `/change-password`로 리다이렉트되어 이 컴포넌트에 진입 불가.
- **views/AdminChangePassword.vue**  
  [NEXA-ADMIN-01] 슈퍼관리자 **강제 비밀번호 변경** 화면. 현재 비밀번호·새 비밀번호(강도 정책 안내)·확인 입력. `authStore.changePassword()` 호출 후 성공 시 store의 `user` 갱신되어 본 메뉴(AdminContent)로 전환.
- **views/left/AdminLeftNav.vue**  
  관리자 도메인 **왼쪽 사이드바**. §4 메뉴 구분에 따른 네비게이션(목록/링크). StandardLeftHeader 사용 권장.
- **views/content/AdminContent.vue**  
  관리자 도메인 **중앙 컨텐츠**. 하위 라우트별로 회원 목록, Tier 접근, API 리미트 등 화면을 배치하는 컨테이너 또는 기본 대시 뷰.
- **views/right/AdminRightPanel.vue**  
  관리자 도메인 **오른쪽 패널**. 도메인별 보조 정보·필터·상세 폼 등. 없으면 프레임 기본값(DefaultRightPanel) 사용 가능.
- **store/adminStore.ts**  
  관리자 도메인 UI 상태(activeSection, searchQuery, searchScope 등).

**domainRegistry 등록**: `nexa-admin` 키에 `left` → AdminLeftNav, `content` → AdminDomain(또는 content용 뷰), `right` → AdminRightPanel(또는 null), 필요 시 `headerActions` 지정.

### 5.1 슈퍼관리자·비밀번호 정책 관련 파일 (서버·공통)

| 구분 | 경로 | 역할 |
|------|------|------|
| **DB** | `database/init_auth.sql` | `users.password_must_change`, role CHECK에 `first` 포함. |
| **DB 마이그레이션** | `database/migrations/001_add_password_must_change.sql`, `002_add_role_first.sql` | 기존 DB에 컬럼·role 추가 시 실행. |
| **비밀번호 정책** | `server/utils/passwordPolicy.ts` | `validateStrongPassword()` — 10자 이상, 영문·숫자·특수문자 각 1자 이상. |
| **인증 스키마** | `src/system/schemas/auth.ts` | `changePasswordSchema` (current_password, new_password). |
| **인증 API** | `server/routes/auth.routes.ts` | 가입 시 최초 사용자 role=first·일반 비밀번호; `POST /auth/change-password`에서 role=first이면 강한 비밀번호 검사 후 role=admin 부여. |
| **인증 미들웨어** | `server/middleware/auth.middleware.ts` | `/api/admin` 인증 예외 없음. SELECT에 `password_must_change` 포함, `toUserResponse`에 반영. |
| **관리자 API** | `server/routes/admin.routes.ts` | JWT 필수, `role === 'admin'`만 허용(403 그 외). **마운트**: `app.use('/api/admin', adminRouter)` (§5.2). `GET /api/admin/members` 등. |
| **라우트** | `src/frame/router/routes.ts` | `/change-password`: AuthLayout, 인증 필수. role=first·password_must_change 사용자 전용. |
| **라우트 가드** | `src/frame/router/domainRoutes.ts` | `nexa-admin`의 `beforeEnter`: 미로그인 → `/login`, role=first → `/change-password`, role!==admin → `/`. |
| **인증 스토어** | `src/system/store/authStore.ts` | `user.password_must_change` 저장·노출, `changePassword(current, new)` 호출 및 성공 시 user 갱신. |
| **타입** | `server/types/common.ts`, `src/system/types/common/auth.ts` | `AuthUser.password_must_change?: boolean`. |

### 5.2 서버 라우터 마운트 경로 — 403 원인 사례 (참고)

**발생**: 부품 관리(parts-management) 등 다른 도메인에서 `GET /api/part-classes`, `/api/part-models`, `/api/part-specs` 호출 시 **403 Forbidden** 발생.

**원인**: 관리자 API 라우터(adminRouter)를 `app.use('/api', adminRouter)`로 마운트했기 때문. Express에서는 마운트 경로에 붙은 라우터가 **해당 경로 접두사로 들어오는 모든 요청**을 받는다. 따라서 `/api/*` 요청이 **순서상 admin 라우터에 먼저 도달**했고, admin 라우터 상단의 `router.use(...)`(role=admin 검사)가 **모든 요청**에 대해 실행됨. part-classes 등은 인증 예외(AUTH_SKIP_PREFIXES)로 `req.user`가 설정되지 않은 상태였고, 미설정·비관리자로 간주되어 403 반환.

**수정**:
- `server/server.ts`: `app.use('/api', adminRouter)` → **`app.use('/api/admin', adminRouter)`**. 관리자 API만 `/api/admin/*`으로 한정.
- **등록 순서**: `app.use('/api/admin', adminRouter)`를 **`app.use('/api', authRouter)`보다 먼저** 등록. 이렇게 해야 `/api/auth/register`, `/api/auth/login` 등이 admin 라우터로 넘어가지 않음.
- `server/routes/admin.routes.ts`: 경로를 `router.get('/admin/members', ...)` → **`router.get('/members', ...)`** 로 변경. 마운트가 `/api/admin`이므로 실제 경로는 동일하게 **`/api/admin/members`** 유지.

**교훈**: 권한 검사 미들웨어를 둔 라우터는 **해당 API 접두사로만** 마운트해야 한다. `/api`에 마운트하면 같은 접두사를 쓰는 다른 API까지 모두 해당 라우터로 들어가 오동작·403을 유발할 수 있음.

### 5.3 보안·검토 체크리스트

구현·배포 전에 아래를 점검할 것. 신규 관리자 API 추가 시에도 동일 기준 적용.

| 항목 | 확인 내용 |
|------|-----------|
| **라우터 마운트** | admin 라우터는 **반드시** `app.use('/api/admin', adminRouter)` 로만 마운트. `/api`에 마운트 금지 (§5.2). |
| **인증 예외** | `auth.middleware`의 AUTH_SKIP_PREFIXES에 **`/api/admin`을 포함하지 않음**. 관리자 API는 JWT 필수. |
| **역할 검사 순서** | JWT 미들웨어로 `req.user` 설정 후, admin 라우터 내부에서 `role === 'admin'` 검사. 비관리자·미인증 시 403. |
| **서버 측 강제** | 프론트 라우트 가드(beforeEnter)만으로는 부족. **모든 관리자 API는 서버에서 role 검사**로 차단해야 함. |
| **신규 엔드포인트** | 관리자 전용 API는 모두 **`/api/admin/*`** 하위에 두고, 동일 admin 라우터(동일 `router.use` 검사)를 타도록 구성. |
| **디바이스 토큰** | X-Device-Token으로 인증된 요청이 `/api/admin`에 오면 `req.user`는 디바이스 소유자. role이 'user'면 403 정상 동작. |
| **비밀번호 변경** | `POST /api/auth/change-password`는 JWT 필수. role=first인 경우에만 강한 비밀번호 후 admin 부여; 기타는 password_must_change 해제용. |
| **최초 가입자** | 활성 사용자 0명일 때 가입 시 role=first 부여. `/change-password`에서 강한 비밀번호 변경 후 role=admin으로 전환. |

추가로, 프로덕션에서는 JWT 시크릿·비밀번호 정책·감사 로그(관리자 API 호출 이력) 등을 정책에 맞게 점검할 것.

---

## 6. 프레임 레이어 등록 (작업 지시)

다음 세 곳을 수정·추가한다.

**6.1 domainRegistry.ts**  
`domainConfigs`에 `nexa-admin` 항목 추가. `left`: `@domains/admin/views/left/AdminLeftNav.vue`, `content`: `@domains/admin/AdminDomain.vue`, `right`: `@domains/admin/views/right/AdminRightPanel.vue` (또는 null). 필요 시 `headerActions` 추가.

**6.2 domainRoutes.ts**  
`path: 'nexa-admin'`, `name: 'NexaAdmin'`, `component`: AdminDomain. children에는 하위 메뉴별 라우트(예: 회원 목록, Tier 접근, API 리미트 등)를 추가. `beforeEnter`에서 슈퍼 관리자 여부 검사 후 미권한 시 403 또는 리다이렉트.

**6.3 MainLayout.vue의 mainMenuTabs**  
`mainMenuTabs` 배열에 관리자 탭 추가. `name: 'nexa-admin'`, `label: 'NEXA ADMIN'`, `displayLabel: 'ADMIN'`, `icon: 'admin_panel_settings'`(또는 동일 계열), `route: '/nexa-admin'`, `exact: false`, `nexaPrefix: true`. **노출 조건**: 슈퍼 관리자일 때만 탭 표시하거나, 라우트 가드만 두고 탭은 항상 표시 후 진입 시 차단할 수 있음(정책 확정 후 결정).

---

## 7. 도메인·하위 메뉴 식별 및 Capability 연동

**도메인 ID**: 프론트 `domainRegistry`에 정의된 키와 1:1. 관리자 도메인은 `nexa-admin`.

**하위 메뉴**: 도메인 내 왼쪽 사이드바·라우트 단위. 예: "회원 목록", "Tier 접근", "API 리미트", "감사 로그" 등. 각 항목에 메뉴 ID 또는 라우트 경로(예: `nexa-admin/members`, `nexa-admin/tier-access`)를 부여하면 Tier별 하위 메뉴 접근 정책과 매핑 가능.

**Capability ID 체계**: Tier별 접근 제어는 **[NEXA-CAPABILITY-01] Capability ID 체계**를 따른다. `nexa.archive`, `nexa.archive.hub` 등 계층적 ID, 와일드카드(`nexa.archive.*`), OR/AND 조건, `tiers`·`capabilities`·`tier_allowed_capabilities` 테이블, 동기화·캐싱·우회 방어 전략이 해당 문서에 정리되어 있음. 관리자 화면의 "Tier별 접근 권한 매핑" 메뉴 구현 시 반드시 참고.

**정책 적용**: 라우트 가드·사이드바 렌더링 시 `hasCapability(userCapabilities, required)`로 검사. 서버는 API 단에서 동일 Capability 검사로 403 처리. Tier별 capability 목록은 JWT에 담지 않고 서버 메모리(Redis) 캐싱 후 대조. 상세는 [NEXA-CAPABILITY-01] §5.8, §5.9 참고.

---

## 8. 선행·의존 사항

- **회원/비회원 접근 정책**: 어떤 도메인을 비회원·Tier별로 열지 확정 후, 관리자 화면에서 설정하는 값과 연계.
- **Tier·역할 정의**: [NEXA-AUTH-01] 또는 별도 문서에서 Tier(role) Enum·의미 확정. (free / pro / enterprise 등)
- **인증·인가**: JWT·미들웨어에서 `user.role` 또는 `user.is_super_admin`으로 슈퍼 관리자 여부 판단. 관리자 전용 API도 동일 조건으로 가드.
- **DB**: users 역할/Tier 컬럼. **Capability 관련** `tiers`, `capabilities`, `tier_allowed_capabilities` 등은 [NEXA-CAPABILITY-01] §3 참고. 그 외 tier_domain_access·api_limit_policy·audit_log 등은 상세 기획 시.

---

## 9. 구현 순서 제안

1. 접근 정책·Tier 정의 확정.
2. **관리자 도메인 기본 구성**: `src/domains/admin/` 디렉터리·AdminDomain·AdminLeftNav·AdminContent·AdminRightPanel 생성, domainRegistry·domainRoutes·mainMenuTabs에 `nexa-admin` 등록, 슈퍼 관리자 라우트 가드 적용.
3. **Capability 체계**([NEXA-CAPABILITY-01]) 기반으로 Tier별 역량 매핑 테이블·동기화·캐싱 구현 후, 관리자 UI "Tier별 접근 권한 매핑" 화면 및 프론트 `hasCapability`·라우트 가드 적용.
4. 도메인 내 하위 메뉴 접근 확장(도메인·메뉴 키 정의 후 동일 패턴).
5. API 리미트 정책·설정 화면·미들웨어 연동, 쿼터 시각화·위험군·알림.
6. 회원 목록·관리 화면·API(강제 탈퇴·복구, 비밀번호 초기화, 메모, Impersonation).
7. 부관리자 역할 위임(필요 시).
8. 엣지·OTA 관리는 [NEXA-NODE-01] 연계 후 별도 도메인 또는 본 도메인 내 메뉴로 구현.
9. AI 협력·리소스 관리는 [NEXA-AI-01] 연계.
10. UI/UX·테마 관리(글로벌 테마, 컴포넌트 제어, 대시보드 레이아웃, i18n, 런처/사이드바, 온보딩).
11. 감사 로그·공지·점검 모드·템플릿 편집기·시스템 상태 등 필요 시 순차 추가.

---

## 10. 관련 문서

- **[NEXA-AUTH-01]**: 계정·인증·권한, api_usage, device_members, JWT·Redis. Tier/역할 확장 시 정합 유지.
- **[NEXA-CAPABILITY-01] ⭐**: Capability ID 체계, Tier 접근 권한, DB·동기화·캐싱·우회 방어. **전역 참고 문서**. 관리자 도메인 Tier별 접근 매핑 구현 시 필수 참고.
- **[NEXA-STACK-01]**: 기술 스택·용어. 관리자 도메인도 동일 스택(Vue, Quasar 등) 기준.
- **[NEXA-PLATFORM-TS-01]**: TS 전략. admin 도메인 신규 시 타입·strict 적용 원칙.
- **[NEXA-NODE-01]**: ESPHome·펌웨어 배포. 엣지·OTA 관리 메뉴와 연계.
- **[NEXA-AI-01]**: AI 도메인. 페르소나·스킬·에이전트·모델 인벤토리 관리 메뉴와 연계.
- **관리자_도메인_기획_초안.md**: 요구사항·메뉴 항목·상세 기획(§4) 참고.
