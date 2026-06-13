---
parent_doc: 
see_also: []
doc_id: UIX-002
title: "탐색기 UI 전략"
category: "07_UIUX"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-10
implements_doc: PRD-008
see_also: [UIX-004, PRD-001, PRD-014, TDD-056, TDD-070, TDD-065]
terms_standard: ["next-js", "rest"]
terms_nexa: ["GlobalFileExplorer", "NexiaExplorerPanel", "useGlobalFileExplorer", "explorer", "Navex", "Global-Navex", "tabId", "Global-Asset-Index", "InfraTree", "asset-origin", "navexCategory", "Project-Explorer", "Intelligent-Explorer", "Infra-Explorer", "Relational-File-View"]
tags: ["doc/cat/07-uiux", "doc/domain/nexia", "std/next-js", "std/rest", "nexa/GlobalFileExplorer", "nexa/NexiaExplorerPanel", "nexa/useGlobalFileExplorer", "nexa/explorer", "nexa/Navex", "nexa/Global-Navex", "nexa/tabId"]
---

# NEXIA · 탐색기 UI 전략

> **스택:** nexia **`apps/web` (Next.js/React)** · 컴포넌트 경로 `*.tsx` · UI **shadcn/ui**.
> **연계:** [`05_PRD_NEXIA_웹탐색기문서폴더연동`](../05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md) · [`PRD-001 NEXIA UI 기능 명세`](../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md)

웹 탐색기 ↔ 문서 폴더 연동과 AI 워크스페이스를 통합하는 **탐색기 UI 전략** 정리 문서이다.

> **이중 모드:** **`Infra-Explorer`** = 본 문서 (InfraTree·facet). **`Intelligent-Explorer`** = **[`PRD-014`](../05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)** — **Navex Search Engine** (hybrid + **Personalization Profile**) · 검색바 Hero · **기본 모드**.

---

## 1. 현황 요약

### 1.1 아키텍처 현황

| 구성요소 | 경로 | 역할 |
|----------|------|------|
| **탐색기 패널** | `NexiaExplorerPanel.tsx` | GlobalFileExplorer + 액션바 (미디어 추가, 채팅/에디터 주입 등) |
| **공통 탐색기** | `GlobalFileExplorer.tsx` | 트리 + 목록 + 뷰어 영역 (mode: embed/standalone) |
| **상태/API** | `useGlobalFileExplorer.ts` | loadTree, loadItems, selectedNode, items, 필터 |
| **파일 API** | `GET /api/files/explorer/tree`, `/api/files/explorer` | `files` 테이블 기반 도메인 트리·목록 |
| **문서 API** | `GET /api/docs/config/folders`, `/api/docs/metadata`, `/api/docs/f/{path}` | 문서 폴더 스캔·메타데이터·파일 내용 |

### 1.2 데이터 소스

| 소스 | DB 반영 | 현재 탐색기 표시 |
|------|---------|------------------|
| **업로드 폴더** (`uploads/{domain}/...`) | O (files + file_references) | O |
| **문서 폴더** (NEXA-Documentation, NEXA-Platform/docs) | X | X (미표시) |

### 1.3 워크스페이스 내 위치 (nexia MainShell 기준)

> SSOT: [`07_UIUX_NEXIA_MainShell_레이아웃_v1.0`](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) §4.5 · [`TDD-056`](../08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) §5.7

동일 탐색 엔진(`GlobalFileExplorer` · `useGlobalFileExplorer`)을 **두 표면**에 마운트한다. 명칭을 분리해 사용자 혼동을 줄인다.

| 표면 | 명칭 | 위치 | 기본 |
| :--- | :--- | :--- | :--- |
| **탭** | **Navex** | `TabWorkspace` · `tabId=navex` | **P0 기본** — 전체 화면 탐색·릴레이 |
| **플러그인** | **Global Navex** | Right Drawer **탐색 플러그인** | **P1 옵션** — `navexPlacement: 'right-drawer-plugin'` |

**배치 규칙**

| # | 규칙 |
| :-: | :--- |
| 1 | 설정 키 `settings.nexia.navexPlacement`: `'tab'` \| `'right-drawer-plugin'` |
| 2 | Global Navex 는 **viewport ≥1280px** 에서만 활성 — 미만 시 **강제 `tab`** (화면 파편화 방지) |
| 3 | 선택 컨텍스트·릴레이 계약은 **Navex 탭과 동일** — `activeTabId` 로 Logex·Scribx·Twinex 등에 전달 |
| 4 | 컴포넌트: `GlobalNavexPlugin.tsx` → `NexiaExplorerPanel` 래퍼 · `NexiaRightPanel` 상단 또는 `[Explore]` 세그먼트 |

**레거시 AI 플랫폼 기획서 참고** (구 `explorer` 우측 고정) — nexia 에서는 **Global Navex** 로 치환·명칭 정리.

### 1.4 Navex 탐색 범위 · 필터 · 검색 (Normative)

> SSOT 상세: [`TDD-056` §5.7](../08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) · [`TDD-065`](../08_TDD/NEXIA/08_TDD_NEXIA_Navex탐색APIFacet계약_v1.0.md) · 용어: [`TDD-070` §3.6.4](..\용어집_NEXA전용_v2.0.md)

**Global Asset Index** — Navex / Global Navex 공통:

| 원칙 | UI |
| :--- | :--- |
| **전 `domainKey`** DB 등록 파일 | InfraTree + 목록 · domain 필터 기본 **전체** |
| **code · config P0** | yaml/json/py/ts 등 — 텍스트 미리보기 |
| **edge ingest P0** | `origin=edge` · device 노드 |
| **internal / external** | [`PRD-008` §4.0](../05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md) |
| **검색 우선** | 범위 넓을 때 트리 depth 최소화 — **검색바 + facet + 프리셋** |

**필터 축 (`useGlobalFileExplorer`):**

| 키 | 값 |
| :--- | :--- |
| `origin` | upload · edge · docs · generated · web · memo · market |
| `domainKey` | registry 16 · 미지정 = 전체 |
| `navexCategory` | nx-* · documents · code · config · media · edge-ingest · firmware |
| `registration` | all · internal · external |
| `projectId` | optional |
| `tabAffinity` | optional — 릴레이 대상 힌트 |

**UI 프리셋 (초기):** `전체` · `NEXIA 산출` · `Code & Config` · `Edge` · `Docs` · `Market(설치됨)`.

**InfraTree 기본:** `origin` → `domainKey` → (edge) `device` — [`InfraTree`](..\용어집_NEXA전용_v2.0.md) SSOT.

**성능:** 목록 `@tanstack/react-virtual` + **서버 페이지네이션** · 검색 debounce.

### 1.5 Project Explorer vs Navex (역할 분리)

| | **Project Explorer** (Left Drawer) | **Navex** (`tabId=navex` · Global Navex) |
| :--- | :--- | :--- |
| **질문** | 지금 이 **프로젝트** 작업물은? | 플랫폼 **전체**에서 어디에 있나? |
| **스코프** | `project_id` (+ `folder_id`) **고정** | **고정 없음** — facet으로만 좁힘 |
| **UI** | 얕은 트리 · 채널·메모·미디어 | InfraTree · 검색 · 릴레이 |
| **데이터** | 동일 `files` SSOT | 동일 `files` SSOT |

[`PRD-010`](../05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스웹서치자원전략.md) §3.6 프로젝트 탐색기 패널 — **Navex 탭 본문과 병치 ✗** (Left Drawer 전용).

### 1.6 Infra vs Intelligent (역할)

| | **Infra-Explorer** (본 문서) | **Intelligent-Explorer** |
| :--- | :--- | :--- |
| **SSOT** | UIX-002 · TDD-065 | [`PRD-014`](../05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md) |
| **주 UI** | InfraTree · facet 목록 | 검색 · Signal 타일 · Relational File View |
| **기본 모드** | ✗ | **✓** (`navexExploreMode`) |

---

## 2. 기획서에서 추출한 UI 요구사항

### 2.1 트리 UI

| 요구사항 | 출처 | 비고 |
|----------|------|------|
| DB 도메인 (files 기반) + 문서 폴더 노드 병합 표시 | 웹 _ 탐색기 기획서 §4.1, §5.1 | 클라이언트 병합 |
| 노드 구분: `source: 'db'` vs `source: 'docs'` | 웹 _ 탐색기 기획서 §4.1 | 아이콘·시각적 구분 필요 |
| 문서 폴더 노드: `folderId`, `label` 표시 | 웹 _ 탐색기 기획서 §5.1 | 예: nexa-docs, platform-docs |

### 2.2 목록 UI

| 요구사항 | 출처 | 비고 |
|----------|------|------|
| 선택 노드에 따라 API 분기 (db vs docs) | 웹 _ 탐색기 기획서 §4.2, §5.2 | 목록 항목 형식 통일 |
| internal/external 필터 (전체 \| 내부 \| 외부) | 웹 _ 탐색기 기획서 §4.0 | 선택적 구현 |
| 문서 폴더 항목: 임시 id (`doc:{folderId}:{path}`), docPath, folderId 등 | 웹 _ 탐색기 기획서 §4.2 | files 형식 호환 |

### 2.3 액션/버튼 UI (NexiaExplorerPanel)

| 액션 | 조건 | 출처 |
|------|------|------|
| 미디어에 추가 | DB 반영된 파일만 (internal) | 기존 동작 |
| 채팅에 넣기 | 이미지 등 (기존 제한) | 기존 동작 |
| 에디터에 넣기 | 지원 확장 필요 (문서 폴더) | 웹 _ 탐색기 기획서 §5.3 |
| **디비에 반영** | external(문서 폴더) 항목에만 노출 | 웹 _ 탐색기 기획서 §5.4, §6-7 |

### 2.4 뷰어 UI (UniversalViewer)

| 요구사항 | 출처 |
|----------|------|
| .md 파일 parseMarkdown + useMermaid + .markdown-content 렌더 | 웹 _ 탐색기 기획서 §7 |
| 소스별 fetch URL 분기 (업로드 vs 문서 폴더) | 웹 _ 탐색기 기획서 §7.3.2 |
| 일관된 md 표시 (문서 관리자, AI 채널, 뷰어) | 웹 _ 탐색기 기획서 §7.2 |

### 2.5 성능 (AI 플랫폼 기획서)

| 항목 | 출처 |
|------|------|
| 탐색기 파일·폴더 목록에 @tanstack/react-virtual 적용 | AI 플랫폼 기획서 §성능 |
| 대량 항목 렌더링 최적화 | 동일 |

### 2.6 데이터 정합성 및 Sync (웹 _ 탐색기 기획서 §5.6)

| 요구사항 | 출처 | 비고 |
|----------|------|------|
| **Health Check** | 웹 _ 탐색기 기획서 §5.6.2 | 물리적 파일 ↔ DB 레코드 불일치 주기적 검증·복구 |
| **Sync 로직** | 웹 _ 탐색기 기획서 §5.6.3 | 외부 문서 폴더 변경 감지 → 메타데이터 자동 갱신 |
| Sync 트리거 | 동일 | 파일시스템 감시 (fs.watch 등), 폴링, 수동 (동기화 버튼) |
| UI 연동 | 동일 | " 동기화 " 버튼, Sync 완료 시 목록·캐시 갱신 |

---

## 3. 구체화 필요 사항 (결정 포인트)

### 3.1 트리 노드 시각적 구분

| 항목 | 옵션 | 결정 필요 |
|------|------|-----------|
| DB 노드 vs 문서 폴더 노드 아이콘 | 폴더 아이콘 + 뱃지/색상 | 문서 폴더 전용 아이콘 (예: description, folder_special) |
| 문서 폴더 트리 depth | 1 단 (폴더 목록만) vs 하위 폴더 트리 | 현재 metadata API 는 플랫 structure. 하위 트리는 별도 API/클라이언트 구조화 필요 |

### 3.2 필터 UI (internal/external)

| 항목 | 옵션 | 결정 필요 |
|------|------|-----------|
| 필터 위치 | 트리 상단 탭 / 목록 상단 버튼 / 툴바 | UX 일관성 |
| 필터 레이블 | 전체 \| 내부 \| 외부 vs 전체 \| internal \| external | 한글 권장 (웹 _ 탐색기 기획서) |
| 기본값 | 전체 | 명시 |

### 3.3 " 디비에 반영 " 버튼 노출 정책

| 조건 | 노출 |
|------|------|
| `source === 'docs'` && 선택된 항목이 문서 폴더 파일 | O |
| `source === 'db'` 또는 이미 DB 등록된 파일 | 숨김 또는 비활성 |

- **액션바 vs 컨텍스트 메뉴**: 액션바에 조건부 노출 + 컨텍스트 메뉴에도 동일 항목 추가 권장.

### 3.4 문서 폴더 목록 하위 폴더

- `/api/docs/metadata` 결과는 **플랫 목록** (relativePath 포함).
- **목록 UI**: 현재 경로 (path) 기준 필터링 vs 폴더 뷰 (트리 확장) 중 선택.
- 권장: 1 단계는 **선택 노드 = 폴더 루트**, 해당 folderId 의 metadata 에서 relativePath prefix 로 필터링하여 " 현재 폴더 " 만 표시. 하위 폴더 진입은 별도 Phase.

### 3.5 @tanstack/react-virtual 적용 시점

- 목록 구조 변경 (문서 폴더 병합) 후 **목록 데이터 구조가 확정**된 뒤 적용 권장.
- 트리와 목록 중 **목록** 우선 적용 (항목 수가 많을 가능성).

### 3.6 트리 뷰 모드 분석 및 제안 (마이그레이션 시 UI 보완)

#### 3.6.1 현재 구현 (코드 기준)

| 위치 | 동작 |
|------|------|
| **useGlobalFileExplorer.ts** | `GET /api/files/explorer/tree` → `buildFileTreeFromApiResponse` |
| **fileExplorer.ts** | 트리 = **도메인 (출처)** 1 단계 → 그 아래 **경로 (path)** 계층. 즉 `domain → path[]` 구조. |
| **GlobalFileExplorer.tsx** | 좌측: `scopeDomain`(도메인 필터) + **ExplorerTree**. 우측: viewMode = 목록/테이블/카드, 목록은 `filterCategory`(이미지·문서·오디오·영상) 로 필터. |

- **트리**: 출처 (도메인) 기준 1 단계, 그 아래 **폴더 경로**가 이미 있음. 단, 데이터는 **files 테이블 기준** 경로만 있어 **문서 폴더 (물리 디렉터리)** 는 아직 트리에 없음.
- **목록**: 선택 노드 (domain + path) 에 따라 `GET /api/files/explorer` 호출. **파일 타입별** 구분은 트리가 아니라 **목록 필터 (filterCategory)** 로만 적용됨.

#### 3.6.2 마이그레이션 시 부족한 부분

- **문서 폴더 노드 병합** 후 트리에는 “DB 도메인 + 문서 폴더”가 함께 오므로, **어떤 축으로 트리를 볼지**가 중요해짐.
- 현재는 **출처 (도메인) → 경로 (path)** 한 가지 구조만 있음. 사용자 요구:
  - **현재 방식 유지**: 출처 기반 + (목록에서) 파일 타입별 필터.
  - **추가 요구**: **폴더 단위 트리 모드** — Infra-Explorer처럼 **폴더 계층**으로만 탐색할 수 있는 모드.
    → **DB 기준 출력**(업로드 도메인·경로) 과 **신규 파일 디렉터리**(문서 폴더) 기준 탐색을 모두 지원하려면, “출처/타입 중심 뷰”와 “폴더 구조 중심 뷰”를 전환할 수 있어야 함.

#### 3.6.3 트리 뷰 모드 정리 (제안)

| 모드 | 설명 | 용도 |
|------|------|------|
| **출처·타입 뷰 (현재 유지)** | 1 단계: 출처 (도메인 + 문서 폴더 라벨), 하위: 경로. 목록에서 파일 타입 필터. | “어디 소스에서 / 어떤 타입인지”로 보고 싶을 때. |
| **폴더 뷰 (추가)** | 트리만 **폴더 계층** 구조. DB 도메인별 경로 트리 + 문서 폴더별 디렉터리 트리. | “폴더 단위로 둘러보기”, DB 경로 vs 문서 폴더 경로를 동일한 UX 로 탐색. |

- **구현 방향**: 상단에 **트리 뷰 전환** (예: `출처·타입 | 폴더`) 토글/탭을 두고,
  - **출처·타입**: 기존과 동일하게 `treeNodes` = 도메인 + (병합된 문서 폴더 노드) → 경로.
  - **폴더**: 같은 데이터를 **폴더 경로 기준**으로만 재구성. 문서 폴더는 `metadata` 의 `relativePath` 를 쪼개어 하위 폴더 노드를 만들고, DB 쪽은 기존 path 트리 유지.

---

### 3.7 추가 뷰 모드 제안 (트리·목록 관점)

사용자 제안 (출처 유지 + 폴더 모드 추가) 외에, 아래 뷰 모드를 선택적으로 도입할 수 있음.

| 뷰 모드 | 설명 | 장점 |
|---------|------|------|
| **소스 분리 뷰** | 트리 1 단계를 **업로드 (DB)** / **문서 폴더** 두 그룹으로만 구분. 그 아래 도메인·폴더. | internal/external 구분을 트리 최상단에서 명확히. |
| **파일 타입별 뷰** | 트리 1 단계 = **이미지 / 문서 / 오디오 / 영상**. 그 아래 도메인 → 경로. | “문서만 보고 싶다” 등 타입 우선 탐색에 유리. (목록이 아닌 트리에서 타입 구분.) |
| **통합 폴더 뷰** | 하나의 트리에서 “ai”, “nexa-docs” 등을 같은 레벨에 두고, 각각 하위에 폴더만 표시. 출처는 아이콘/뱃지로만 구분. | 단일 폴더 트리로 모든 소스를 동일하게 탐색. |
| **플랫 리스트 뷰** | 좌측 트리 비우거나 최소화. 필터 (도메인, 소스, 파일 타입) 만으로 목록만 넓게 표시. | 트리보다 “검색·필터로 찾기”에 집중할 때. |
| **북마크/즐겨찾기 뷰** | 트리 상단에 “자주 쓰는 폴더” 또는 “최근 연 폴더” 고정. 클릭 시 해당 경로로 이동. | 반복 접근 경로를 빠르게 열기. |

- **우선순위 제안**:
  1) **폴더 뷰 모드** (사용자 요청)
  2) (선택) **소스 분리 뷰** — 기획서의 internal/external 와 대응
  3) 나머지는 사용 패턴 수집 후 단계적 도입.

---

### 3.8 " 전체 " 뷰와 왼쪽 트리 구성 (DB + 문서 폴더 함께 볼 때)

#### 3.8.1 기획서에 있는 " 전체 "

- **전체**는 별도 " 전체 뷰 " 가 아니라 **필터**다.
  기획서 §4.0: **`전체 | 내부 | 외부`** 버튼/탭으로, **어떤 소스를 트리·목록에 포함할지**만 바꾼다.
- **전체** 선택 시: internal(DB 도메인) + external(문서 폴더) **둘 다** 트리에 노출.
  **내부**만: DB 도메인만. **외부**만: 문서 폴더만.

#### 3.8.2 DB 파일 + 문서 폴더를 모두 함께 볼 때 왼쪽 트리 구성

**필터가 " 전체 " 일 때**의 기본 트리 구조는 다음과 같다.

- **1 단계 (루트 레벨)**: 출처 단위 노드가 **한 트리에서 나란히** 나열된다.
  - **DB 쪽**: `GET /api/files/explorer/tree` 결과 → 도메인별 노드 (예: `ai`, `parts`, …). 각 노드 `source: 'db'`, `domain`, `path`(null 또는 경로).
  - **문서 폴더 쪽**: `GET /api/docs/config/folders` 결과 → 폴더별 노드 (예: `nexa-docs`, `platform-docs`). 각 노드 `source: 'docs'`, `folderId`, `label`.
- **2 단계 이하**:
  - **도메인 (DB) 노드를 선택·펼치면**: `file_path` 에서 추출한 **경로 (path)** 계층이 트리로 표시된다. 업로드 구조에 따라 **생성·추가 날짜**(예: 2024/01), **프로젝트**, 기타 사용자 정의 폴더 등으로 구분된 형태로 보인다.
  - **문서 폴더 노드를 선택·펼치면**: 해당 폴더의 **하위 디렉토리**가 트리로 표현된다. `relativePath` 기준으로 물리 디렉터리 구조가 그대로 노드로 나온다. (1 단계에서는 폴더 루트만 두고 클릭 시 목록만 보여주고, Phase2 에서 하위 디렉토리 트리 확장.)

**정리**: 전체 뷰일 때 **도메인 선택 → 날짜/프로젝트 등 경로 기준 구분**, **폴더 선택 → 하위 디렉토리 표현**.

**예시 (전체 선택 시 왼쪽 트리)**

```json
├─ ai                    ← DB 도메인 (source: db)
│   ├─ 2024
│   │   └─ 01
│   └─ 프로젝트
├─ parts                 ← DB 도메인
│   └─ ...
├─ nexa-docs             ← 문서 폴더 (source: docs, folderId)
└─ platform-docs         ← 문서 폴더
```

- **정리**: "DB 에 있는 파일 + 특정 폴더 (문서 폴더) 를 모두 함께 보는 뷰 " = **필터 " 전체 "** 이고, 왼쪽 트리는 **하나의 통합 트리**에서 1 단계에 DB 도메인 노드와 문서 폴더 노드를 같이 두고, 각각 아래에 경로/하위만 붙이는 구조다. 별도의 " 전체 전용 뷰 " 는 기획에 없고, **전체 = 필터 값**이다.

---

### 3.9 내부 필터 시 표시 방식과 경우수 조합

#### 3.9.1 내부만 필터했을 때

- **내부** 선택 시: 트리에는 **DB 도메인만** 노출되고, 각 도메인 아래에는 여전히 **경로 (path)** 계층 (날짜·프로젝트 등) 이 있다. 목록은 선택한 노드 (도메인 또는 도메인 + 경로) 아래 파일만 보여 준다.
- **파일 종류 (타입)** 구분은 **목록 쪽 필터**(이미지/문서/오디오/영상) 로 적용된다. 즉 “내부 = 파일 종류로만 보인다”가 아니라, **트리 (도메인→경로) + 목록 필터 (타입)** 가 함께 쓰인다. 다만 트리를 펼치지 않고 도메인 루트만 선택하면, 해당 도메인 전체가 목록에 나오고, 여기에 타입 필터를 걸면 “그 도메인 전체 중 이미지만” 같은 식으로 **파일 종류로만** 좁혀 보는 형태가 된다.

#### 3.9.2 파일 수량이 많을 때의 문제와 경우수 조합

- 내부 파일만 보더라도, **목록에서 파일 종류 (타입) 하나만**으로 좁히면 항목 수가 많을 때 스크롤·성능·찾기 모두 불리해진다. 그래서 **여러 축을 조합**해 점진적으로 좁혀갈 수 있어야 한다.
- 필요한 **경우수 조합** 예시는 아래와 같다.

| 조합 축 | 설명 | 비고 |
|---------|------|------|
| **소스** | 전체 / 내부 / 외부 | 기획서 §4.0 필터. |
| **도메인** | ai, parts 등 | 트리 1 단계 선택. |
| **경로 (폴더)** | 도메인 아래 2024/01, 프로젝트 등 | 트리 2 단계 이하 선택. |
| **파일 타입** | 이미지 / 문서 / 오디오 / 영상 | 목록 필터 (기존 filterCategory). |
| **검색 (q)** | 키워드로 목록 추가 필터 | 기존 검색 연동. |
| **정렬** | 최신순, 이름순 등 | 목록 정렬. |

- **사용 시나리오 예**: “내부” 선택 → 트리에서 **도메인 (ai)** 선택 → **경로 (2024/01)** 선택 → 목록에서 **문서** 타입 필터 → 필요 시 **검색**까지 조합. 이렇게 **소스 + 도메인 + 경로 + 타입 + 검색**을 함께 쓰면, 파일 수가 많아도 원하는 구간만 볼 수 있다.
- **정리**: 내부 필터일 때 “파일 종류로만” 보이는 건 **트리를 쓰지 않고 목록 타입 필터만 쓸 때**의 한 경우고, 파일 수가 커지면 **트리 (도메인·경로) + 목록 필터 (타입) + 검색** 등 **경우수 조합**을 지원하는 것이 필요하다. 구현 시 트리 선택 (도메인/경로) 과 목록 필터 (타입)·검색이 항상 동시에 적용되도록 하면 된다.

---

## 4. UI 컴포넌트별 전략

### 4.1 GlobalFileExplorer

| 영역 | 변경 전략 |
|------|-----------|
| **트리** | loadTree 시 `/api/docs/config/folders` 병합. 노드 타입 `source`, `folderId` 추가. |
| **트리 뷰 모드** | (신규) 상단에 `출처·타입 \| 폴더` 전환. 출처·타입 = 기존 구조 유지, 폴더 = 폴더 계층만 표시 (DB 경로 + 문서 폴더 디렉터리). |
| **목록** | selectNode 분기. `source === 'docs'` → `/api/docs/metadata` 호출 후 files 형식 변환. |
| **필터** | (선택) 트리 상단 또는 목록 상단에 `전체 \| 내부 \| 외부` 버튼 그룹. |
| **뷰어** | UniversalViewer 에 md 분기 + fetch URL 분기 (문서 폴더용 getDocFileUrl). |

### 4.2 NexiaExplorerPanel

| 영역 | 변경 전략 |
|------|-----------|
| **액션바** | " 디비에 반영 " 버튼 조건부 노출 (`isExternalSelected`). (선택) " 동기화 " 버튼 — Sync API 호출 후 목록·캐시 갱신 (§2.6). |
| **컨텍스트 메뉴** | " 디비에 반영 " 메뉴 항목 추가 (동일 조건). |
| **미디어에 추가** | external 선택 시 " 먼저 디비에 반영해주세요 " 안내 또는 자동 등록 흐름 연동. |
| **채팅/에디터 주입** | 문서 폴더 파일도 getDocFileUrl 로 fetch 후 주입 가능하도록 확장. |

### 4.3 useGlobalFileExplorer

| 상태/함수 | 변경 전략 |
|-----------|-----------|
| `treeNodes` | buildFileTreeFromApiResponse + docs 폴더 노드 병합. |
| `selectedNode` | `{ domain, path }` + `{ source, folderId }` 확장. |
| `loadItems` | selectedNode.source 분기. docs 일 때 metadata API 호출. |
| `filterInternalExternal` | (선택) filterCategory 와 유사하게 `filterSource: 'all' | 'internal' | 'external'` 추가. |

### 4.4 UniversalViewer

| 항목 | 변경 전략 |
|------|-----------|
| isMarkdown | file_type/category/확장자로 md 감지. |
| fetch | folderId+relativePath → getDocFileUrl, file_path → getUploadDisplayUrl. |
| 렌더 | parseMarkdown + .markdown-content + useMermaid. |

---

## 5. 상태 모델 (요약)

```json
selectedNode = {
  domain?: string | null
  path?: string | null
  id?: string
  source?: 'db' | 'docs'   // 신규
  folderId?: string        // source === 'docs'일 때
}

listItem (목록 항목) = {
  id: string | number      // DB id 또는 'doc:{folderId}:{relativePath}'
  file_path: string
  original_name: string
  file_type: string
  category: string
  url?: string
  folderId?: string        // 문서 폴더일 때
  docPath?: string         // relativePath (문서 폴더)
  displayPath?: string
  _source?: 'db' | 'docs'  // 내부 구분용 (선택)
}
```

---

## 6. 구현 순서 (전략 반영)

| 순서 | 작업 | UI 영향 |
|------|------|---------|
| 1 | 트리: docs 폴더 노드 병합 (useGlobalFileExplorer, GlobalFileExplorer) | 트리 노드 추가 |
| 2 | **트리 뷰 모드**: 출처·타입 (유지) / 폴더 뷰 전환 (토글·탭) | 좌측 트리 두 가지 구조 전환 (§3.6) |
| 3 | 목록: source===docs 분기, metadata → items 변환 | 목록에 문서 폴더 파일 표시 |
| 4 | 뷰어: md fetch/렌더 분기 (UniversalViewer) | md 미리보기 |
| 5 | 디비에 반영 API + 서빙 매핑 | 백엔드 |
| 6 | 액션바/컨텍스트: " 디비에 반영 " 버튼·메뉴 | NexiaExplorerPanel |
| 7 | (선택) internal/external 필터 UI | GlobalFileExplorer |
| 8 | (선택) @tanstack/react-virtual | 목록 성능 |
| 9 | **Health Check** (물리↔DB 불일치 검증·복구) | 백엔드, Cron/수동 |
| 10 | **Sync 로직** (외부 문서 폴더 변경 감지 → 메타 갱신) + " 동기화 " 버튼 | 백엔드, NexiaExplorerPanel |
| 11 | **Global Navex** Right 플러그인 · ≥1280px 게이트 · 설정 persist | `GlobalNavexPlugin.tsx` · UI-L6 |

---

## 7. 다음 단계

1. **§3 결정 포인트**에 대한 팀/기획 결정 수렴.
2. **§4 컴포넌트별 전략**을 바탕으로 상세 스펙 (예: 트리 노드 스키마, 목록 변환 함수 시그니처) 작성.
3. **§6 구현 순서**대로 작업 착수.

---

## 8. 참고 문서

| 문서 | 경로 |
|------|------|
| 웹 탐색기 ↔ 문서 폴더 연동 | [05_PRD_NEXIA_웹탐색기문서폴더연동](../05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md) |
| AI 협업 · UI | [PRD-001 NEXIA UI 기능 명세](../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| 탐색기 ↔ 미디어 탭 동기화 | [05_PRD_NEXIA_탐색기미디어탭동기화](../05_PRD/NEXIA/05_PRD_NEXIA_탐색기미디어탭동기화.md) |

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 구현 PRD | [웹 탐색기 ↔ 문서 폴더 연동 (PRD-008)](../05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md) |
| MainShell · Global Navex | [NEXIA MainShell 레이아웃 v1.0 (UIX-004)](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) §4.5 |
| MVP UI PRD | [NEXIA UI 기능 명세 (PRD-001)](../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) §3.9 |
| 메타데이터 PRD | [files.source_metadata 추출 (PRD-013)](../05_PRD/NEXIA/05_PRD_NEXIA_파일메타데이터AI추출.md) |
| 드롭존 PRD | [드롭존 및 첨부 기능 플랜 (PRD-005)](../05_PRD/NEXIA/05_PRD_NEXIA_드롭존첨부기능플랜.md) |
