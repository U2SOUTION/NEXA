# [NEXA-ADMIN-01] 관리자 도메인 기본구성과 레이아웃

**목적**: 슈퍼 관리자(Super Admin) 전용 관리자 도메인을 NEXA 플랫폼의 **MainLayout** 및 **도메인 레지스트리** 구조에 맞춰 정의하고, 실제 구현 시 작업 지시서로 사용할 수 있도록 정리한다.

**적용 범위**: 프론트 `src/domains/admin/**`, 프레임 레이어 등록(domainRegistry, routes, mainMenuTabs), 서버 관리 API·DB는 별도 문서.

**참조**: [NEXA-AUTH-01] 계정·인증·권한, [NEXA-PLATFORM-TS-01] TS 전략, 기획 초안 `[NEXA-ADMIN-01] 관리자_도메인_기획_초안.md`

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

---

## 4. 관리자 도메인 메뉴 구성

슈퍼 관리자가 **관리자 도메인**에서 접근할 수 있는 메뉴(기능)를 구분별로 정리한다. 추후 다른 도메인으로 분리·통합할 항목은 우선순위·상세 스펙에서 정리.

### 4.1 메뉴 구조 (테이블)

| 구분 | 메뉴(기능) 명 | 비고 |
|------|---------------|------|
| **계정·권한** | 전체 회원 목록 조회 및 검색 | 가입일, 마지막 접속, Tier 등 필터·검색 |
| | 회원 강제 탈퇴(Soft Delete) 및 복구 | 복구 기능 포함 |
| | 비밀번호 수동 초기화 및 임시 비밀번호 발급 | |
| | Tier별 접근 권한 매핑 | 도메인 단위, 메뉴 단위 |
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
  도메인 루트. `q-page` 안에 중앙 컨텐츠(AdminContent)를 렌더링. `useDomainIntercom('nexa-admin')`로 활성 도메인 보고.
- **views/left/AdminLeftNav.vue**  
  관리자 도메인 **왼쪽 사이드바**. §4 메뉴 구분에 따른 네비게이션(목록/링크). StandardLeftHeader 사용 권장.
- **views/content/AdminContent.vue**  
  관리자 도메인 **중앙 컨텐츠**. 하위 라우트별로 회원 목록, Tier 접근, API 리미트 등 화면을 배치하는 컨테이너 또는 기본 대시 뷰.
- **views/right/AdminRightPanel.vue**  
  관리자 도메인 **오른쪽 패널**. 도메인별 보조 정보·필터·상세 폼 등. 없으면 프레임 기본값(DefaultRightPanel) 사용 가능.

**domainRegistry 등록**: `nexa-admin` 키에 `left` → AdminLeftNav, `content` → AdminDomain(또는 content용 뷰), `right` → AdminRightPanel(또는 null), 필요 시 `headerActions` 지정.

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

## 7. 도메인·하위 메뉴 식별 (구현 참고)

**도메인 ID**: 프론트 `domainRegistry`에 정의된 키와 1:1. 관리자 도메인은 `nexa-admin`.

**하위 메뉴**: 도메인 내 왼쪽 사이드바·라우트 단위. 예: "회원 목록", "Tier 접근", "API 리미트", "감사 로그" 등. 각 항목에 메뉴 ID 또는 라우트 경로(예: `nexa-admin/members`, `nexa-admin/tier-access`)를 부여하면 Tier별 하위 메뉴 접근 정책과 매핑 가능.

**정책 적용**: 라우트 가드·사이드바 렌더링 시 "현재 사용자 Tier + 도메인/하위 메뉴 접근 설정"을 조회해 노출·진입 허용. 서버는 API 단에서 동일 정책으로 403 처리. 접근 제어 시 DB 부하 절감을 위해 로그인 시 권한 매핑을 한 번에 내려받아 클라이언트에 캐싱하고, 백엔드는 Redis 등에 `tier_access_map`을 두어 O(1) 권한 체크 권장.

---

## 8. 선행·의존 사항

- **회원/비회원 접근 정책**: 어떤 도메인을 비회원·Tier별로 열지 확정 후, 관리자 화면에서 설정하는 값과 연계.
- **Tier·역할 정의**: [NEXA-AUTH-01] 또는 별도 문서에서 Tier(role) Enum·의미 확정. (free / pro / enterprise 등)
- **인증·인가**: JWT·미들웨어에서 `user.role` 또는 `user.is_super_admin`으로 슈퍼 관리자 여부 판단. 관리자 전용 API도 동일 조건으로 가드.
- **DB**: users 역할/Tier 컬럼, tier_domain_access·tier_domain_menu_access·api_limit_policy·audit_log 등 테이블 설계는 상세 기획 시.

---

## 9. 구현 순서 제안

1. 접근 정책·Tier 정의 확정.
2. **관리자 도메인 기본 구성**: `src/domains/admin/` 디렉터리·AdminDomain·AdminLeftNav·AdminContent·AdminRightPanel 생성, domainRegistry·domainRoutes·mainMenuTabs에 `nexa-admin` 등록, 슈퍼 관리자 라우트 가드 적용.
3. Tier별 도메인 접근 설정 화면·API·DB 구현 후, 프론트 공통에서 Tier+도메인 접근으로 메뉴 노출·라우트 가드 적용.
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
- **[NEXA-STACK-01]**: 기술 스택·용어. 관리자 도메인도 동일 스택(Vue, Quasar 등) 기준.
- **[NEXA-PLATFORM-TS-01]**: TS 전략. admin 도메인 신규 시 타입·strict 적용 원칙.
- **[NEXA-NODE-01]**: ESPHome·펌웨어 배포. 엣지·OTA 관리 메뉴와 연계.
- **[NEXA-AI-01]**: AI 도메인. 페르소나·스킬·에이전트·모델 인벤토리 관리 메뉴와 연계.
- **관리자_도메인_기획_초안.md**: 요구사항·메뉴 항목·상세 기획(§4) 참고.
