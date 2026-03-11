# [NEXA-AI-09] AI 워크스페이스 웹 서치 자원 전략

**목적**: AI 도메인 왼쪽 드로어에 **웹자료** 탭을 추가하고, 통합 검색 폼에 **Web** 분기를 도입하여 외부 웹 검색 결과를 수집·저장·활용할 수 있게 한다. **프로젝트**를 작업 분류의 단위로 두어 검색 결과·패널 작업 결과 등을 저장·불러오기한다. **Workspace**는 UI 상의 개념(도메인별 작업 공간, 예: AI 워크스페이스, BORDE 워크스페이스)이며 DB 테이블은 두지 않고, **Project** 테이블만 유지한다. 대부분 도메인은 프로젝트와 밀접하게 연동하며, 일부 도메인은 워크스페이스 개념을 쓰지 않아도 된다. 데이터는 **JSON 표준**으로 운용하며, `metadata` JSON 필드(MySQL JSON 타입)로 확장 속성을 수용한다.

**적용 도메인**: `/ai` (AI 도메인) 및 **플랫폼 전역** (Project)

**상위 문서**: [NEXA-AI-03] AI 협업형 멀티 에디터 플랫폼 구축

**선행 문서**: [NEXA-AUTH-01] 계정 생성 및 인증 시스템 기반 기획 — **인증·권한**(사용자별 프로젝트 접근·소유권 규칙)은 별도 기획. **인증 시스템 구현 완료 후** 본 기획서(NEXA-AI-09) 단계별 진행.

**작성일**: 2025-03

---

## 1. 현황 및 배경

### 1.1 현재 왼쪽 드로어 구조

| 구분 | 내용 |
|------|------|
| **위치** | `src/domains/ai/views/left/AiLeftNav.vue` |
| **탭** | 채팅, 노트, 미디어 (3개) |
| **통합 검색 폼** | `useAiUnifiedSearch` — 타겟: 채팅, 노트, 미디어, 파일 (4개) |
| **타겟별 분기** | chat: 채널·대화, note: 메모, media: 미디어, files: 파일 탐색기 |

### 1.2 필요성

- **저장·분류 단위 부재**: **프로젝트** 개념이 없어 저장·분류·불러오기가 어렵다. 웹서치·패널 작업 결과를 프로젝트 단위로 저장하기 위해 **프로젝트를 먼저** 도입한다.
- **웹 검색 결과 활용**: 프로젝트 기반이 마련된 후, AI 오케스트레이터·채팅에서 외부 웹 자료를 참조할 수 있도록 한다.
- **자원 통합**: 채팅·노트·미디어·파일·웹자료를 프로젝트 단위로 관리·검색 가능해야 한다.

---

## 2. 목표 및 범위

### 2.1 목표

| 목표 | 설명 |
|------|------|
| **웹자료 탭 추가** | 왼쪽 드로어에 채팅·노트·미디어와 동등한 **웹자료** 탭 추가 |
| **검색 Web 분기** | 통합 검색 폼의 select에 **Web** 타겟 추가 → Web 선택 시 외부 API로 검색, 결과를 아코디언에 출력 |
| **저장** | 검색 결과 또는 URL만 프로젝트 단위로 저장 |
| **프로젝트 도입** | **프로젝트** 단위로 저장·분류·불러오기 지원. 추후 필요 시 프로젝트 하위 폴더 확장 검토 |

### 2.2 범위 및 작업 순서

- **1단계**: **프로젝트** 개념 도입 — 프로젝트 생성·선택·관리(저장·분류·불러오기)
- **2단계**: 웹자료 탭 UI, 검색 Web 분기, Tavily API 연동, 결과 아코디언 출력, 검색 결과·URL 프로젝트에 저장
- **3단계**: 사용자가 검색 API(Tavily·Google 등) 선택 가능한 옵션
- **4단계**: **채팅·노트 DB 이전 및 폴더 연동** — 채팅 localStorage → ai_channels·ai_chats DB 이전(project_id, folder_id), 노트 → files(source='memo') 통합, 프로젝트·폴더 전환 시 채팅·노트·미디어·웹자료 리스트 일괄 전환

---

## 3. UI·UX 설계

### 3.1 웹자료 탭

- **추가 위치**: `AiLeftNav.vue` `q-tabs`에 `name="web"` 탭 추가
- **아이콘·라벨**: `icon="language"` 또는 `icon="public"`, `label="웹자료"`

### 3.2 검색 폼 Web 분기

- **SEARCH_TARGET_OPTIONS**에 추가: `{ value: 'web', icon: 'public', label: '웹' }`
- **Web 선택 시**:
  - 검색 폼 입력 시 **자동 검색**(또는 엔터·버튼 트리거)
  - 검색 대상: 외부 웹 (Tavily API 등)
- **필터 행**: Web 선택 시 검색 API 선택(Tavily / Google 등), 검색 깊이(depth) 등 옵션 표시 (2단계 이후)

### 3.3 웹자료 탭 패널 구성

- **상단**: 통합 검색 폼 (Web 타겟 선택 시 이 탭과 연동)
- **아코디언 영역**: 검색 결과 아이템을 **3가지 구분**으로 표시·관리 (데이터 과대 저장 방지 목적)

| 구분 | DB 저장 | 왼쪽 리스트 | AI 참조 | 설명 |
|------|---------|-------------|---------|------|
| **검색 결과** | 없음 | 없음 | 없음 | API 응답만 표시. 단순 조회용 |
| **선택한 아이템** | 임시 저장 (자동 파기 대상) | O | **최우선** | "선택" 버튼. 세션 연속성 위해 files에 저장, 추후 파기 |
| **저장한 아이템** | 영구 저장 | O | 참조 | "저장" 버튼. files에 영구 보관 |

- **버튼**: 검색 결과 항목마다 **선택** / **저장** 제공
- **저장 옵션** (저장 시): 전체(제목·URL·스니펫·콘텐츠) 또는 URL만

### 3.4 선택 아이템 파기 전략 (추천 방향)

| 단계 | 방식 | 설명 |
|------|------|------|
| **1단계** | **TMP 벳지 + 수동 파기** | 선택한 아이템에 TMP 벳지 표시, "파기" 버튼으로 사용자가 직접 삭제 유도. 구현 단순, "임시" 인지 용이 |
| **2단계** (추후) | **프로젝트 종료 시 파기** 또는 **사용자 설정 TTL** | 프로젝트 종료(워크스페이스 닫기 등) 시 선택 아이템 일괄 파기. 또는 TTL(1h·24h·7일) 사용자 설정으로 자동 만료 |

- **metadata** (선택 아이템): `{ webSaveType: 'selected', tmpBadge: true, expiresAt?: ISO }` — 2단계 TTL 시 `expiresAt` 활용

### 3.5 Workspace·프로젝트 개념 (플랫폼 전역)

- **Workspace**: **UI 개념**만 사용. 도메인당 최상위 작업 공간으로 표시 (예: AI 워크스페이스, BORDE 워크스페이스). "AI 워크스페이스에서 작업하세요"처럼 안내 가능. **DB 테이블 없음**. 일부 도메인은 워크스페이스 개념을 쓰지 않아도 됨.
- **Project**: **DB 테이블 유지**. 작업 분류 단위. 대부분 도메인과 밀접 연동.
- **계층**: UI 상 Workspace(도메인별) → 프로젝트 선택. 저장 시 **현재 선택된 프로젝트**에 소속.
- **패널**: 여러 파일 보기·편집 후 저장 시, 저장된 콘텐츠가 **프로젝트 소속**이 됨.
- **조회 흐름 (다른 도메인 포함)**: 프로젝트 선택 → 해당 프로젝트에 저장된 데이터(웹자료, 문서 등) 조회.
- **추후 확장**: 프로젝트 하위 **폴더** 기능 — 프로젝트 탐색기에서 폴더 추가/삭제로 자원 분류 (§3.6 참조).

### 3.6 탐색기 탭 하위 패널 (파일 탐색기 · 프로젝트 탐색기)

- **탭**: Explorer(탐색기) 탭 하나. **미디어 탭**처럼 탭 하위에 패널을 두어 구분.
- **하위 패널**:
  - **파일 탐색기 패널**: 기존 파일/도메인 트리·목록. [NEXA-AI-01] 탐색기 체계.
  - **프로젝트 탐색기 패널**: 프로젝트 목록·선택·하위 폴더 관리.
- **표시**: 두 패널 모두 탐색기 탭 하위에서 동시에 보이도록 배치.

#### 3.6.0 패널 탭 구분 및 커스텀 (탭 계층 정리)

- **현재 문제**: 메인 메뉴(q-tabs), 워크스페이스 7개 항목(q-tabs), 하위 패널(q-tabs) 모두 동일한 탭 컴포넌트 사용 → 계층·역할 구분 어려움.
- **패널용 탭**: q-tabs 기반이되 **상단 탭과 시각적으로 구분**된 커스텀 UI. VS Code 에디터 탭처럼 **무한 생성·닫기·저장·보기** 등 지원.
- **탐색기 통일**: 파일 탐색기 패널·프로젝트 탐색기 패널도 동일한 패널 탭 구조 사용. 전체 UI 일관성 유지.
- **프로젝트 하위 폴더**: 프로젝트별로 폴더 추가/삭제하여 자원을 분류·관리.
- **왼쪽 헤더**: 프로젝트 이름 표시. 프로젝트 아이콘 클릭 시 우측 컨텐츠(탐색기 탭)로 포커스 이동.
- **헤더 아래 경로 표시**: 프로젝트 선택 시, 헤더 아래에 **하위 경로를 포함한 경로** 출력 (예: `프로젝트A` 또는 `프로젝트A / 폴더1`).
- **하위 폴더 선택 시 리로드**: 하위 폴더를 선택하면 채팅·노트·미디어·웹자료 등 왼쪽 드로어 리스트가 **해당 하위 폴더에 속한 아이템만**으로 리로드.
- **추후**: 프로젝트 리스트 전용 뷰어·관리 탭이 필요해지면 Sense 모드 분기 또는 별도 탭으로 확장. 탭 복잡도 경험 후 결정.

#### 3.6.1 프로젝트 미선택 시 모달

- **트리거**: 프로젝트 미선택 상태에서 저장·조회 등 프로젝트가 필요한 작업 시도 시
- **UI**: **모달** 사용. 왼쪽 드로어 대신 모달로 처리 — 흐름 집중, 최근 프로젝트·탐색기 이동 등을 한 화면에 배치 가능
- **모달 구성**:
  - **상단**: "프로젝트를 선택하거나 새로 만드세요" 안내 문구
  - **중앙**: "새 프로젝트 만들기" 버튼, "프로젝트 탐색기에서 선택" 링크(탐색기 탭으로 이동)
  - **하단**: **최근 프로젝트** 리스트 (최대 10개) — 클릭 시 해당 프로젝트 선택 후 모달 닫힘
- **최근 프로젝트**: `nexa-current-project` 선택 이력 또는 별도 `nexa-recent-projects` 배열(최근 10개 id) 기반 표시

### 3.7 프로젝트·하위 폴더 전환 시 왼쪽 드로어 리스트 일괄 전환

- **목표**: 프로젝트(또는 하위 폴더)를 전환하면 채팅·노트·미디어·웹자료 탭의 리스트가 **해당 컨텍스트 데이터로 자동 전환**된다.
- **전제**: 모든 탭 데이터가 **서버 DB**에 저장되고, `files`·`file_references`·`ai_channels`에 `project_id` 및 **`folder_id`**(신규)가 있어 필터 가능해야 함.
- **하위 폴더 선택 시**: 해당 폴더에 속한 아이템만 리로드. 헤더 아래 경로에 `프로젝트 / 하위폴더` 형태로 표시.
- **현재**: 채팅은 localStorage, 노트는 `ai_user_memos`(project_id 없음). → 아래 §5.2·로드맵에 따라 **채팅 DB 이전(ai_channels)**, **노트는 files(source='memo')로 통합** 후 프로젝트 전환 시 일괄 리로드.

### 3.8 리로드 대상·부하 및 대책

#### 3.8.1 프로젝트/하위 폴더 선택 시 리로드 대상

| 탭 | 리로드 대상 | 테이블/소스 | 쿼리 조건 |
|----|-------------|-------------|-----------|
| **채팅** | 채널 목록 + (채널별 대화 목록) | ai_channels, ai_chats(또는 metadata) | project_id, folder_id |
| **노트** | 메모 목록 | files + file_references (source='memo') | project_id, folder_id |
| **미디어** | 파일 목록 | files + file_references | project_id, folder_id |
| **웹자료** | 웹 저장/선택 아이템 | files + file_references (source='web') | project_id, folder_id |

- **채널 포함 여부**: **채널(ai_channels)도 리로드 대상**에 포함. project_id·folder_id로 필터하여 해당 프로젝트(·폴더)의 채널만 조회.

#### 3.8.2 현재 채널 DB 구조 검토

- **현재**: 채널·대화가 **localStorage**에 저장 (`useAiChannels`, `nexa-ai-channels`). DB 테이블 없음.
- **목표 구조**: `ai_channels` (project_id, folder_id) + **대화(채팅 메시지)** 저장 위치 필요.
  - **옵션 A**: ai_channels.metadata에 chats 배열 포함 → 채널 1건 로드 시 대화 전체 포함. **부하 큼**.
  - **옵션 B**: `ai_chats` 테이블 분리 (channel_id, title, messages 등) → 채널 목록만 먼저 로드, 대화는 **선택 시 lazy load**. **권장**.

#### 3.8.3 부하(Load) 대책

| 구분 | 부하 원인 | 대책 |
|------|-----------|------|
| **채널** | 채널+대화 한꺼번에 로드 시 페이로드 커짐 | **채널 목록만** 프로젝트/폴더 전환 시 로드. **ai_chats** 별도 테이블 두고, 채널 확장·대화 선택 시 **lazy load** |
| **노트** | 보통 소량. 부하 적음 | 필요 시 limit/offset 페이징 |
| **미디어** | 파일 수 많을 수 있음 | **페이징** (limit, offset). 또는 가상 스크롤 + 페이지네이션 |
| **웹자료** | 보통 소량~중간 | 필요 시 페이징 |

- **총정리**: 프로젝트/폴더 전환 시 **채널 목록·노트·미디어·웹자료 목록**만 로드. 채널 내 **대화(메시지)**는 채널/채팅 선택 시 별도 API로 lazy load. 미디어·웹자료는 데이터 양에 따라 페이징 적용.

### 3.9 API 실패 시 UI·재시도 정책

- **UI**: 실패 시 토스트 또는 인라인 에러 메시지 표시. "재시도" 버튼 노출.
- **재시도 정책**:
  - **일시적 오류** (5xx, 네트워크 끊김, 타임아웃): 최대 2~3회 자동 재시도. 지수 백오프(1초 → 2초 → 4초) 또는 간격 2~3초.
  - **클라이언트 오류** (4xx): 자동 재시도 없음. 사용자 액션(입력 수정·재시도 버튼) 유도.
  - **저장·등록 API**: 멱등성(UUID v7 사전 생성) 적용 시 동일 ID로 재시도해도 중복 저장 방지.
- **로딩 표시**: 요청 중 스피너 또는 스켈레톤. 중복 요청(더블 클릭 등) 방지용 버튼 비활성화.
- **범위**: 프로젝트 CRUD, 웹 검색(Tavily), 파일 저장·조회, 채널·채팅 등 API 호출 전반에 공통 적용.

---

## 4. 웹 검색 API 전략

### 4.1 1단계: Tavily 우선

| 항목 | 내용 |
|------|------|
| **서비스** | [Tavily Search API](https://docs.tavily.com/) — AI·RAG용 검색 엔진 |
| **특징** | 최대 20개 결과/요청, AI 기반 랭킹·스코어, Extract/Crawl 등 추가 API |
| **검색 depth** | advanced / basic / fast / ultra-fast (1단계: basic 권장) |
| **가격** | 무료 1,000 credits/월 (basic: 1 credit/요청) |
| **인증** | API Key. `server/config/*.env`에 저장 (아래 §4.3) |
| **Tavily 선택 이유** | **JSON 응답 출력** — NEXA 플랫폼의 **JSON 데이터 표준**과 부합. 추가 속성·스키마 확장에 유리. |

### 4.2 2단계 이후: 검색 API 선택 옵션

| 옵션 | 설명 |
|------|------|
| **Tavily** | 기본. AI·RAG 최적화, 무료 티어 |
| **Google Custom Search API** | 사용자가 API 키·CX 설정 시 선택 가능 |
| **기타** | Serper, Bing 등 확장 검토 |

- **설정 UI**: `/settings` 또는 AI 도메인 설정에서 "웹 검색 API" → Tavily / Google / … 선택
- **저장**: `localStorage` 또는 사용자 설정 DB

### 4.3 외부 API 키 저장 규칙 (플랫폼 전역)

외부 의존성 API 키(Tavily, Google 등)는 아래 규칙으로 **일원화**하여 관리한다.

| 항목 | 내용 |
|------|------|
| **위치** | `NEXA-Platform/server/config/` |
| **파일** | `*.env` (예: `apiKeys.env`, `secrets.env`) |
| **제외** | `.gitignore`, `.cursorignore` 등에 등록하여 Git·Cursor 등에서 제외 |
| **범위** | 추후 추가되는 모든 외부 API 키는 동일 경로에 저장 |

- **이유**: API 키를 코드·문서에 섞지 않고 한 곳에서 관리, 유출·커밋 방지.

---

## 5. 데이터 모델 및 DB 구성 (장기 목표)

### 5.1 설계 원칙

- **플랫폼 전역**: Project는 **전 도메인**에서 공통 사용. Workspace는 DB 없이 UI 개념만 사용.
- **모든 탭 데이터 서버 DB 저장**: 채팅(채널·대화)·노트(메모)·미디어·웹자료는 **localStorage 대신 서버 DB**에 저장. 프로젝트 전환 시 일괄 리로드 가능.
- **자원·파일 관리 일원화**: 업로드·문서·웹자료·**메모** 등 모든 자원을 **[NEXA-AI-01]** 설계에 맞춰 **`files`** 테이블로 통합. 메모도 자원으로 간주하여 `source='memo'`로 저장.
- **프로젝트·폴더 연결**: 각 컨텐츠에 `project_id` 및 `folder_id`(nullable)를 두고, 프로젝트 최상위 선택 시 전체 조회, 폴더 선택 시 해당 폴더만 필터.
- **JSON 표준**: `metadata` JSON 필드로 확장 속성 수용.

#### 5.1.1 ID 생성 (UUID v7)

- **사용 이유**: 전역 고유성, 엣지 디바이스 대량 파일 생성 시 서버 없이 사전 생성 가능. INT 대비 분산·병합 시 충돌 없음. **멱등성(Idempotency) 보장** — 엣지에서 생성한 ID로 서버 저장 시 동일 요청 재전송해도 중복 파일 저장 방지.
- **UUID v7 선택**: 48bit Unix timestamp 포함 — **시간순 정렬** 가능, B-tree 인덱스 효율적. 랜덤 UUID(v4) 대비 기능·성능 모두 유리.
- **UUID v7과 타임스탬프**: 상위 48bit가 Unix ms 기반 타임스탬프라 ID 문자열 자체로 생성 시각 대략 추정 가능. 별도 `created_at` 없이도 정렬·범위 조회에 활용 가능.
- **ID와 파일명 분리**: UUID v7은 **엔티티 ID**용. 파일명(original_name, file_path 등)과는 별개. 파일명에는 `YYYYMMDD_HHMM_SS` 접두어 등 자유롭게 넣을 수 있음. ID 내장 타임스탬프와 혼동하지 않도록 구분.
- **위치**: `src/system/utils/generateId.ts` — `generateId()` 함수. `import { generateId } from '@system/utils/generateId'`
- **엣지 디바이스**: ESPHome 등 펌웨어에서도 **동일한 UUID v7 형식**으로 ID 생성. 플랫폼과 ID 호환 유지. 이 문서를 참고하여 펌웨어 단에서 동일 구조 구현.

### 5.2 DB 스키마 (장기)

#### projects (플랫폼 전역)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID |
| name | VARCHAR(255) | 프로젝트 이름 |
| created_at | TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | 수정 시각 |
| **metadata** | **JSON** | 추가 속성 (MySQL JSON 타입). 도메인별 확장 용도 |

- **참고**: Workspace는 DB 테이블 없음. 프로젝트-도메인 관계는 각 컨텐츠의 `project_id`로 파생.

#### project_folders (플랫폼 전역, **신규 테이블**)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID |
| project_id | VARCHAR(36) FK | projects.id |
| parent_id | VARCHAR(36) FK | project_folders.id (nullable. 최상위는 null) |
| name | VARCHAR(255) | 폴더 이름 |
| sort_order | INT | 정렬 순서 |
| created_at | TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | 수정 시각 |

- **용도**: 프로젝트 하위 폴더 계층. 프로젝트 선택 시 폴더 트리 표시, 폴더 선택 시 해당 폴더 아이템만 필터.

#### files (탐색기·플랫폼 전역, [NEXA-AI-01] 확장)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID |
| file_path | VARCHAR(500) | 경로. 예: `uploads/{domain}/...`, `docs/{folderId}/...`, `web/{project_id}/{uuid}` |
| source | VARCHAR(20) | `'upload'` \| `'docs'` \| `'web'` \| `'memo'` |
| original_name | VARCHAR(255) | 파일명 또는 제목 |
| file_type | VARCHAR(50) | document, web_resource 등 |
| category | VARCHAR(50) | documents, web 등 |
| created_at | TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | 수정 시각 |
| **metadata** | **JSON** | 확장 속성. source='web' 시 url, snippet, content, tavilyScore 등 |
| **folder_id** | **VARCHAR(36) FK** | **신규**. project_folders.id (nullable). 프로젝트 최상위 선택 시 null 포함 모두, 폴더 선택 시 해당 폴더만 필터 |

- **웹자료(source='web')**: `file_path = 'web/{project_id}/{uuid}'`, `metadata`에 url, snippet, content, Tavily 응답 원본 등 저장.
- **메모(source='memo')**: `file_path = 'memos/{project_id}/{uuid}'`, `metadata`에 content, channelId, chatId, sortOrder, source 등 저장. 기존 `ai_user_memos`를 files로 통합.
- **조회**: 프로젝트 최상위 선택 → `WHERE project_id = ?` (folder_id 무관). 폴더 선택 → `WHERE project_id = ? AND folder_id = ?`.

#### file_references ([NEXA-AI-01] 확장)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| file_id | VARCHAR(36) FK | files.id |
| domain | VARCHAR(50) | ai, nexa-node 등 |
| **project_id** | **VARCHAR(36) FK** | projects.id (nullable). 프로젝트 연결 시 사용 |
| **folder_id** | **VARCHAR(36) FK** | **신규**. project_folders.id (nullable). 폴더 구분. 프로젝트 최상위면 null, 폴더 소속 시 값 설정 |

- 기존 `(file_id, domain)` + **project_id** + **folder_id**(신규). 프로젝트 최상위 → `WHERE project_id = ?`. 폴더 선택 → `WHERE project_id = ? AND folder_id = ?`.

#### ai_channels (AI 도메인, 채팅 localStorage → DB 이전)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID |
| **project_id** | **VARCHAR(36) FK** | projects.id. 프로젝트별 채널 구분 |
| **folder_id** | **VARCHAR(36) FK** | **신규**. project_folders.id (nullable). 프로젝트 최상위 선택 시 전체, 폴더 선택 시 해당 폴더 채널만 필터 |
| name | VARCHAR(255) | 채널 이름 |
| system_instruction | TEXT | 시스템 지시 (nullable) |
| sort_order | INT | 정렬 순서 |
| created_at | TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | 수정 시각 |
| **metadata** | **JSON** | 확장 속성 (채널 메타만. 대화는 ai_chats로 분리 권장) |

- **현재**: 채널·대화가 localStorage(`nexa-ai-channels`)에 저장. **목표**: DB 이전 후 `project_id`·`folder_id`로 프로젝트/폴더별 필터.
- **조회**: 프로젝트 최상위 → `WHERE project_id = ?`. 폴더 선택 → `WHERE project_id = ? AND folder_id = ?`.
- **부하 대책**: 대화(채팅 메시지)는 **ai_chats** 별도 테이블로 두고, 채널 목록만 프로젝트/폴더 전환 시 로드. 대화는 채널/채팅 선택 시 lazy load (§3.8 참조).

#### ai_chats (AI 도메인, **신규 테이블** — 부하 분산용)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(36) PK | UUID |
| channel_id | VARCHAR(36) FK | ai_channels.id |
| title | VARCHAR(255) | 대화 제목 |
| sort_order | INT | 정렬 순서 |
| created_at | TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | 수정 시각 |
| **messages** | **JSON** | 대화 메시지 배열 (또는 별도 ai_chat_messages 테이블) |

- **용도**: 채널 내 대화(채팅) 저장. 채널 목록 로드 시 제외하고, 채널/채팅 선택 시 **lazy load**하여 부하 분산.

- **메모**: 별도 `ai_user_memos` 테이블 유지하지 않고 **`files`**에 `source='memo'`로 통합. `file_references`에 `(file_id, domain, project_id, folder_id)` 등록.

#### 신규 추가 항목 요약 (기존 대비)

| 대상 | 신규 항목 | 설명 |
|------|-----------|------|
| **project_folders** | **테이블 전체** | 프로젝트 하위 폴더 계층 저장. 신규 테이블 |
| **files** | **folder_id** | project_folders.id (nullable). 폴더별 필터 |
| **file_references** | **folder_id** | project_folders.id (nullable). 폴더별 필터 |
| **ai_channels** | **folder_id** | project_folders.id (nullable). 폴더별 필터 |
| **ai_chats** | **테이블 전체** | 채널 내 대화 저장. lazy load로 부하 분산 |

- **조회 규칙**: 프로젝트 **최상위** 선택 → `folder_id` 무관 전체 조회. **폴더** 선택 → `WHERE folder_id = ?` 해당 폴더만.

### 5.3 프로젝트 (TypeScript 인터페이스)

```ts
interface Project {
  id: string
  name: string
  createdAt: number
  updatedAt?: number
  metadata: Record<string, unknown>
}
```

### 5.4 웹자료·메모 저장 (files 통합)

- **웹자료**: 웹 검색 결과 **선택** 또는 **저장** 시 **`files`**에 `source='web'`으로 행 추가, **`file_references`**에 `(file_id, domain, project_id, folder_id)` 등록. 현재 선택된 폴더가 있으면 `folder_id` 설정.
- `file_path`: `web/{project_id}/{uuid}`
- `metadata`:
  - **저장한 아이템**: `{ url, snippet, content, tavilyScore, type: 'full'|'url_only', webSaveType: 'saved', ... }`
  - **선택한 아이템**: `{ url, snippet, content, tavilyScore, webSaveType: 'selected', tmpBadge: true, expiresAt?: ISO, ... }`
- 탐색기 트리에 `source: 'web'` 노드 추가 시, `files` 기반 목록으로 표시. [NEXA-AI-01] internal/external·소스별 분기와 동일 패턴.

- **메모**: "메모로 추가" 시 **`files`**에 `source='memo'`로 행 추가, **`file_references`**에 `(file_id, domain, project_id, folder_id)` 등록. `file_path = 'memos/{project_id}/{uuid}'`, `metadata = { content, channelId, chatId, sortOrder, source }`. 현재 선택된 폴더가 있으면 `folder_id` 설정.

### 5.5 검색 결과 (Tavily 응답)

- Tavily API 응답: `results[]` — title, url, content, score 등
- 아코디언에 표시 후, **선택** 버튼 → files 임시 저장 (webSaveType: 'selected'), **저장** 버튼 → files 영구 저장 (webSaveType: 'saved') + file_references 등록

---

## 6. 기술 구현

### 6.1 플랫폼 공용 useProjects 설계

- **위치**: `src/system/composables/useProjects.ts`
- **역할**: 전 도메인에서 프로젝트·폴더 상태·CRUD 공유. 프로젝트 선택·폴더 선택 상태는 localStorage(nexa-current-project, nexa-current-folder)에 persist.
- **사용**: `import { useProjects } from '@system/composables/useProjects'`

#### 6.1.1 반환 인터페이스

```ts
// src/system/composables/useProjects.ts

interface ProjectFolder {
  id: string
  projectId: string
  parentId: string | null
  name: string
  sortOrder: number
}

interface UseProjectsReturn {
  projects: Ref<Project[]>
  currentProject: Ref<Project | null>
  folders: Ref<ProjectFolder[]>
  currentFolder: Ref<ProjectFolder | null>
  loadProjects: () => Promise<void>
  loadFolders: (projectId: string) => Promise<void>
  createProject: (name: string, metadata?: object) => Promise<Project>
  updateProject: (id: string, payload: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  selectProject: (id: string | null) => void
  selectFolder: (id: string | null) => void
  isLoading: Ref<boolean>
}
```

#### 6.1.2 저장·복원

- **currentProject**, **currentFolder** 선택 상태는 `localStorage`에 저장
  - `nexa-current-project`: 선택된 프로젝트 id
  - `nexa-current-folder`: 선택된 폴더 id (nullable. 프로젝트 최상위 선택 시 null)
- useProjects는 위 키를 **persist 백엔드**로 사용. `nexa-current-project`는 별도 개념이 아니라 useProjects 내부에서 쓰는 저장소 키.
- 앱 진입 시 복원하여 마지막 작업 컨텍스트 유지
- **추후**: 장치 간 동기화 필요 시 서버 API(`GET/PATCH /api/users/me/last-context`)로 이전 가능

#### 6.1.3 API 호출

- `GET /api/projects` → 목록 조회
- `POST /api/projects` → 생성
- `PATCH /api/projects/:id` → 수정
- `DELETE /api/projects/:id` → 삭제

#### 6.1.4 AI 도메인 연동

- AI 도메인에서 `useProjects()`로 `currentProject`, `currentFolder` 구독
- 웹자료 저장·패널 저장·채널·메모 등은 **저장 시점**에 `currentProject.id`, `currentFolder?.id`로 프로젝트(·폴더)에 연결
- **프로젝트 전환 시**: `selectProject(id)` 호출 후 `loadFolders(id)`, `selectFolder(null)` (또는 복원). 채팅·노트·미디어·웹자료 탭 모두 `project_id` 기준으로 리로드
- **폴더 선택 시**: `selectFolder(id)` 호출 후, 해당 폴더에 속한 아이템만 리로드 (`folder_id` 필터)

### 6.2 수정 대상

| 파일 | 수정 내용 | 단계 |
|------|-----------|------|
| (신규) `src/system/composables/useProjects.ts` | 플랫폼 공용 프로젝트 CRUD, 현재 선택 상태 | **1** |
| (신규) 프로젝트 탐색기 패널 | 탐색기 탭 하위 패널. 프로젝트 목록·선택·하위 폴더 추가/삭제. useProjects 연동 | **1** |
| `AiLeftNav.vue` | `q-tab` 웹자료 추가, `q-tab-panel` 웹자료 패널 추가 | 2 |
| `useAiUnifiedSearch.ts` | `SEARCH_TARGET_OPTIONS`에 `web` 추가, Web 분기 처리 | 2 |
| (신규) `useAiWebSearch.ts` | Tavily API 호출, 검색 결과 상태, 저장 로직 | 2 |
| (신규) `AiWebResourcesPanel.vue` | 웹자료 탭 패널 — 아코디언, 저장 버튼 | 2 |

### 6.3 API·백엔드

- **Project API**: 플랫폼 전역이므로 `/api/projects` 경로 권장.

| API | 역할 | 단계 |
|-----|------|------|
| `GET /api/projects` | 프로젝트 목록 조회 | **1** |
| `POST /api/projects` | 프로젝트 생성 | **1** |
| `PATCH /api/projects/:id` | 프로젝트 수정 | **1** |
| `DELETE /api/projects/:id` | 프로젝트 삭제 | **1** |
| `GET /api/projects/:id/folders` | 프로젝트 하위 폴더 목록 조회 | **1** |
| `POST /api/projects/:id/folders` | 폴더 생성 | **1** |
| `PATCH /api/projects/:projectId/folders/:folderId` | 폴더 수정 | **1** |
| `DELETE /api/projects/:projectId/folders/:folderId` | 폴더 삭제 | **1** |
| `GET /api/ai/channels` | 채널 목록 조회 (projectId, folderId 파라미터) | 4 |
| `POST /api/ai/channels` | 채널 생성 | 4 |
| `PATCH /api/ai/channels/:id` | 채널 수정 | 4 |
| `DELETE /api/ai/channels/:id` | 채널 삭제 | 4 |
| `GET /api/ai/channels/:id/chats` | 채널 내 대화(채팅) 목록 — lazy load | 4 |
| `POST /api/ai/web-search` | Tavily API 프록시 (API 키 서버 보관, CORS 회피) | 2 |
| `POST /api/files/register-web` | 웹 검색 결과를 files에 저장 (source='web'), file_references에 project_id 등록 | 2 |
| `POST /api/files/register-memo` | 메모를 files에 저장 (source='memo'), file_references에 project_id 등록 | 4 |
| `GET /api/files/explorer` | projectId·source·folderId(선택) 파라미터로 해당 프로젝트(·폴더) 웹자료·메모·파일 조회. folderId 없으면 프로젝트 전체, 있으면 해당 폴더만 | 2 |

- **folderId 설계 의도**: 프로젝트 트리에서 폴더 선택 시 파일 탐색기가 해당 폴더에 속한 파일만 표시. 필요 범위는 추후 확정 가능하나, API 설계 단계에서 파라미터 포함.
- **1단계**: 클라이언트에서 Tavily 직접 호출 가능 시 클라이언트만 구현. API 키 노출 우려 시 백엔드 프록시 필수.

### 6.4 Tavily 연동

- **SDK**: `@tavily/core` (JavaScript) 또는 REST API 직접 호출
- **엔드포인트**: `https://api.tavily.com/search`
- **파라미터**: query, api_key, search_depth, max_results 등

---

## 7. 사용자 시나리오

### 7.1 프로젝트 관리 (1단계)

1. 사용자가 **탐색기 탭** → **프로젝트 탐색기** 패널 진입 (왼쪽 헤더 프로젝트 아이콘 클릭 시 동일 영역으로 포커스)
2. 프로젝트 탐색기에서 새 프로젝트 생성 → 이름 입력 → 저장
3. 프로젝트 선택 → 현재 작업 중인 프로젝트로 설정. 프로젝트 하위에 폴더 추가/삭제로 분류 가능
4. 이후 검색 결과 저장·패널 작업 후 저장 시 **현재 선택된 프로젝트**에 소속됨

### 7.2 웹 검색·선택·저장 (2단계)

1. 사용자가 왼쪽 드로어에서 **웹자료** 탭 선택
2. 검색 폼에서 타겟을 **Web**으로 선택 (또는 웹자료 탭 진입 시 자동 Web 선택)
3. 검색어 입력 후 검색 실행
4. 아코디언에 검색 결과 표시 (제목·URL·스니펫)
5. **선택**: 현재 세션 AI 참조용 → 선택한 아이템으로 왼쪽 리스트에 추가, TMP 벳지, 수동 파기 가능
6. **저장**: 영구 보관 → 저장한 아이템으로 왼쪽 리스트에 추가, files에 영구 저장
7. 저장 옵션: **전체** (제목·URL·스니펫·콘텐츠) 또는 **URL만**

### 7.3 프로젝트·웹자료 불러오기 (2단계, 다른 도메인 포함)

1. **프로젝트 선택**
2. 해당 프로젝트에 저장된 웹자료·문서 등 조회
3. 항목 클릭 시 미리보기 또는 채팅·에디터에 삽입

### 7.4 프로젝트·하위 폴더 전환 시 왼쪽 드로어 일괄 전환 (4단계)

1. 사용자가 **프로젝트 A** → **프로젝트 B** (또는 **프로젝트 B / 하위 폴더**)로 전환
2. **헤더 아래 경로 표시**: 선택한 경로가 `프로젝트B` 또는 `프로젝트B / 폴더1` 형태로 출력
3. 왼쪽 드로어 모든 탭 리스트가 **해당 컨텍스트** 데이터로 자동 갱신
   - 프로젝트만 선택: 해당 프로젝트 전체 자원
   - 하위 폴더 선택: **해당 하위 폴더에 속한 아이템만** 리로드
   - **채팅**: 해당 프로젝트(·폴더)의 채널·대화
   - **노트**: 해당 프로젝트(·폴더)의 메모
   - **미디어**: 해당 프로젝트(·폴더)의 파일
   - **웹자료**: 해당 프로젝트(·폴더)의 웹 검색 저장/선택 아이템

---

## 8. 단계별 로드맵

| 단계 | 내용 |
|------|------|
| **1** | **프로젝트** 도입: `src/system/composables/useProjects.ts`, 프로젝트 CRUD·선택, UI(드롭다운/트리). 저장·분류·불러오기 기반 구축 |
| **2** | 웹자료 탭 추가, SEARCH_TARGET_OPTIONS에 Web 추가, Tavily API 연동, 검색 결과 3구분(검색/선택/저장) UI, TMP 벳지·수동 파기, files·file_references 저장 |
| **3** | 검색 API 선택 옵션 (Tavily / Google), 설정 UI |
| **4** | **채팅·노트 서버 DB 저장 및 프로젝트 전환 연동**: 채팅 localStorage → ai_channels·ai_chats DB 이전(project_id, folder_id), 채널 목록만 리로드·대화는 lazy load, 노트 → files(source='memo') 통합, 프로젝트/폴더 전환 시 채팅·노트·미디어·웹자료 리스트 일괄 전환 |

---

## 9. 참고 문서

- **[NEXA-AUTH-01]** 계정 생성 및 인증 시스템 기반 기획 — 인증·권한, user_id 기반 프로젝트 소유권. 본 기획 선행 구현 권장.
- **[NEXA-AI-01]** 웹 탐색기 ↔ 문서 폴더 연동 기획 — files·file_references 체계, internal/external, 소스별 분기
- **[NEXA-AI-03]** AI 협업형 멀티 에디터 플랫폼 구축 — Focus Stack, Nexus Map
- **[NEXA-AI-08]** AI 워크스페이스 단축키 및 레이아웃 기획 — Workspace 구조
- **Tavily Docs**: https://docs.tavily.com/
