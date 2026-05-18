# [NEXA-AI-08] AI 워크스페이스 단축키 및 레이아웃 기획

**목적**: AI 도메인 콘텐츠 창의 Quasar 3단 스플릿(좌·중앙·우)을 단축키로 제어하여 레이아웃 복잡도를 줄이고, 스플릿/탭 show·hide를 빠르게 할 수 있게 한다. 탭·패널 전환, 최근 닫은 항목 복구(Recently Closed Stack), Focus Stack·워크스페이스 스냅샷·Nexus Map·인과 체인 연동을 포함한다.

**작성일**: 2025-03

---

## 1. 현황

### 1.1 레이아웃 관리

- **위치**: `src/domains/ai/composables/useAiSplitLayout.ts`
- **상태**: `leftVisible`, `centerVisible`, `rightVisible`, `leftSize`, `centerSize`, `rightSize`, 패널 ID 목록·활성 인덱스
- **저장**: `localStorage` 키 `nexa-ai-split-layout`
- **UI**: `AiSplitLayout.vue` — 헤더 메뉴 "화면구성" 드롭다운 + 우측 아이콘(좌/중앙/우 표시·숨김, 레이아웃 초기화)

### 1.2 단축키 인프라

- **정의**: `src/system/composables/useGlobalShortcuts.ts`
  - `getDefaultShortcuts(handlers)`: 기본 단축키 배열 반환, 핸들러는 외부 주입
  - `registerShortcut(id, config)`, `registerShortcuts(shortcuts)`
  - 카테고리: `SHORTCUT_CATEGORIES` (navigation, sidebar, theme, utility, custom)
- **설정 UI**: `/settings` → "키보드 단축키" 탭 → `ShortcutsSettings.vue` (카테고리별 목록, 수정·추가·활성/비활성)
- **저장**: `localStorage` 키 `nexa-global-shortcuts`

### 1.3 기존 사이드바 단축키와의 관계

- 전역: `Ctrl+Left`(좌측 사이드바), `Ctrl+Right`(우측 사이드바) 등이 이미 사용 중.
- AI 콘텐츠 내부 스플릿(좌·중앙·우)은 **프레임 좌/우 사이드바와 별개**이므로, AI 전용 조합을 쓰면 충돌을 피할 수 있다.

### 1.4 [NEXA-AI-03] 연계: Focus Stack · 별도 창 띄우기

기획서 **[NEXA-AI-03] AI 협업형 멀티 에디터 플랫폼 구축**에서 다음이 정의되어 있으며, 본 단축키 기획과 연계한다.

| 항목 | [NEXA-AI-03] 내용 | 단축키 기획과의 관계 |
|------|-------------------|----------------------|
| **Layout Management** | Quasar QSplitter + Pinia로 탭·패널의 **레이아웃 상태**(위치, 비율, 표시/숨김, 열린 패널 목록, **Z-index·Focus Stack**) 관리. Focus Stack은 AI 지칭("방금 수정한 그 코드" 등) 정확도 향상에 활용 (§1.1, §5.7) | 스플릿 표시/숨김·프리셋 단축키는 이 레이아웃 상태의 일부를 제어. **탭 이전/다음**(Ctrl+Alt+좌우)·**탭 번호 직행**(Alt+1~7) 단축키로 탭 전환 시 Focus Stack 갱신 연동 |
| **Focus Stack** | 패널 포커스 순서. 오케스트레이터가 컨텍스트 구성 시 **focusStack·패널 JSON·selectionRange**를 조합해 AI가 "방금 수정한 코드" 등 지칭 해석 (§5.7 ④, §10.1) | **탭 이동** 단축키(Ctrl+Alt+Left/Right, Alt+1~7)로 전환 시 Focus Stack 갱신과 연동 |
| **창 분리·멀티 윈도우** (§7.3) | 탭·패널을 **기본 워크스테이션에서 분리하여 별도 창**으로 표시. **전역 상태(UUID 기반)**·**Global Focus Stack**(창 경계와 무관)·**창 복원 하이드레이션** 준비 | **현재 패널(또는 탭)을 별도 창으로 띄우기** 단축키를 본 기획에 포함. 멀티 윈도우 구현 시 동일한 전역 단축키 체계(`useGlobalShortcuts`·`/settings`)로 등록·설정 가능 |

---

## 2. 전략 옵션

| 전략 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **A. AI 라우트에서만 등록** | `/ai` (또는 AI 도메인) 일 때만 Workspace 스플릿 단축키를 전역에 등록. 라우트 이탈 시 해제. | 다른 페이지에서 키 충돌 없음. | 라우트 진입/이탈 시 등록·해제 로직 필요. |
| **B. 전역 등록 + 조건부 실행** | 항상 전역에 등록하되, 현재 라우트가 AI일 때만 핸들러에서 `useAiSplitLayout` 호출. 아닐 때는 no-op. | 구현 단순. 설정 UI에서 항상 노출. | AI가 아닌 페이지에서 같은 조합을 눌러도 반응 없음(사용자 혼동 가능). |
| **C. 전역 등록 + 포커스 기반** | AI 콘텐츠 영역에 포커스가 있을 때만 스플릿 단축키 처리. | 의도가 분명함. | 포커스 감지 및 이벤트 전파 제어 필요. |

**권장**: **A (AI 라우트에서만 등록)**. 기존 사이드바 단축키가 전역인 것과 구분해, "Workspace 레이아웃"은 AI 화면에 있을 때만 동작하게 하면 의미가 분명하고, `/settings` 단축키 목록에는 "AI Workspace에 있을 때만 동작"으로 안내 가능.

---

## 3. 단축키 제안

### 3.1 스플릿 영역 표시/숨김

| ID | 설명 | 기본 조합 (제안) | 동작 |
|----|------|------------------|------|
| `aiWorkspaceToggleLeft` | Workspace 좌측 영역 표시/숨김 | `Ctrl+Shift+1` | `leftVisible` 토글 |
| `aiWorkspaceToggleCenter` | Workspace 중앙 영역 표시/숨김 | `Ctrl+Shift+2` | `centerVisible` 토글 |
| `aiWorkspaceToggleRight` | Workspace 우측 영역 표시/숨김 | `Ctrl+Shift+3` | `rightVisible` 토글 |

- **대안**: `Ctrl+Alt+1/2/3`, `Ctrl+[` / `Ctrl+]`(좌/우만) 등. 기존 `Ctrl+Left`/`Ctrl+Right`와 겹치지 않도록 조합 선택.

### 3.2 레이아웃 프리셋·초기화

| ID | 설명 | 기본 조합 (제안) | 동작 |
|----|------|------------------|------|
| `aiWorkspacePresetDefault` | Workspace 기본 레이아웃 | `Ctrl+Shift+0` | `applyPreset('default')` |
| `aiWorkspacePresetCode` | Workspace 코드 중심 레이아웃 | `Ctrl+Shift+9` | `applyPreset('code')` |
| `aiWorkspaceResetSizes` | 스플릿 비율 초기화 | `Ctrl+Shift+R` (또는 `Ctrl+Alt+R`) | `resetSplitSizes()` |

- **주의**: `Ctrl+Shift+R`은 현재 "하드 리프레시"로 쓰일 수 있음. `useGlobalShortcuts` 내 `hardRefresh` 확인 후, Workspace 전용은 `Ctrl+Alt+R` 등으로 분리 권장.

### 3.3 별도 창 띄우기 ([NEXA-AI-03] §7.3 연계)

[NEXA-AI-03] §7.3에 따라 탭·패널을 **별도 창**으로 분리할 수 있도록 설계가 준비되어 있다. 단축키로 해당 동작을 트리거할 수 있도록 한다.

| ID | 설명 | 기본 조합 (제안) | 동작 |
|----|------|------------------|------|
| `aiWorkspacePopoutPanel` | 현재 포커스 패널을 별도 창으로 띄우기 | `Ctrl+Shift+W` | 활성 패널(또는 현재 탭)을 새 창으로 분리. UUID 전역 상태·Global Focus Stack 유지 (§7.3) |
| `aiWorkspacePopoutTab` | 현재 탭 전체를 별도 창으로 띄우기 | `Ctrl+Alt+W` | 현재 중앙(또는 해당) 탭 전체를 새 창으로 분리. (구현 시 탭 단위 vs 패널 단위 정책 확정) |

- 멀티 윈도우 기능이 도입되기 전까지는 위 단축키는 **비활성(no-op)** 또는 설정에서 숨김 처리. 도입 시 동일한 `useGlobalShortcuts`·설정 UI에 등록.

### 3.4 탭 이전/다음 이동 (Focus Stack 연동)

탭 순서대로 이전/다음으로 이동. [NEXA-AI-03]의 Focus Stack과 연동 시 포커스·컨텍스트 갱신. `Ctrl+Tab`/`Ctrl+Shift+Tab`은 **브라우저 탭 전환**에 사용되므로 사용하지 않고, **Ctrl+Alt+좌우**로 한다.

| ID | 설명 | 기본 조합 | 동작 |
|----|------|-----------|------|
| `aiWorkspaceTabPrev` | 이전 탭으로 이동 | `Ctrl+Alt+Left` | 이전 탭으로 전환, Focus Stack 갱신 |
| `aiWorkspaceTabNext` | 다음 탭으로 이동 | `Ctrl+Alt+Right` | 다음 탭으로 전환, Focus Stack 갱신 |

### 3.5 탭 번호로 직접 이동

중앙(또는 해당) 영역의 **탭 인덱스를 숫자로 지정**해 바로 이동. 탭 순서 1~7에 직결.

| ID | 설명 | 기본 조합 | 동작 |
|----|------|-----------|------|
| `aiWorkspaceTab1` | 1번 탭으로 이동 | `Alt+1` | 해당 영역 1번째 탭 활성화 |
| `aiWorkspaceTab2` | 2번 탭으로 이동 | `Alt+2` | 2번째 탭 활성화 |
| `aiWorkspaceTab3` | 3번 탭으로 이동 | `Alt+3` | 3번째 탭 활성화 |
| `aiWorkspaceTab4` | 4번 탭으로 이동 | `Alt+4` | 4번째 탭 활성화 |
| `aiWorkspaceTab5` | 5번 탭으로 이동 | `Alt+5` | 5번째 탭 활성화 |
| `aiWorkspaceTab6` | 6번 탭으로 이동 | `Alt+6` | 6번째 탭 활성화 |
| `aiWorkspaceTab7` | 7번 탭으로 이동 | `Alt+7` | 7번째 탭 활성화 |

- 탭이 7개 미만이면 해당 번호만 유효. (예: 탭 5개일 때 Alt+6, Alt+7은 no-op 또는 무시)

### 3.6 패널 컨트롤 (아이디어)

**탭**은 영역 내 "Narrative, Logic, Media…" 같은 **종류**이고, **패널**은 한 탭 안에서 열린 **파일/인스턴스 하나하나**(예: 코드 탭에 file1.ts, file2.ts → 패널 2개). [NEXA-AI-03]의 Focus Stack은 **패널 단위 포커스 순서**이므로, 패널 전환 단축키와 연동하면 "방금 수정한 그 코드" 지칭 정확도에 도움이 된다.

탭 단축키와 겹치지 않게 구분: **탭 = Alt+숫자, Ctrl+Alt+좌우** / **패널 = Ctrl+Alt+상하, Ctrl+숫자(또는 Ctrl+Alt+숫자)**.

| 구분 | 제안 조합 | 비고 |
|------|-----------|------|
| **이전/다음 패널** (현재 탭 내) | `Ctrl+Alt+Up` / `Ctrl+Alt+Down` | 탭은 좌우, 패널은 상하로 구분. Focus Stack 갱신 연동 |
| **N번째 패널로 이동** (현재 탭 내) | `Ctrl+1` ~ `Ctrl+9` | VS Code 등에서 에디터 그룹 전환에 많이 사용. 탭 직행(Alt+1~7)과 구분됨 |
| **현재 패널 닫기** | `Ctrl+F4` 또는 `Ctrl+W` | `Ctrl+W`는 브라우저 "탭 닫기"와 충돌 가능. `Ctrl+F4`가 IDE "창/패널 닫기" 관례에 가까움 |
| **방금 닫은 패널 다시 열기** | `Ctrl+Shift+T` | 브라우저 "탭 복원"과 충돌 가능. 도입 시 전역 단축키와 우선순위 정리 필요 |

**선택·추가 아이디어**

- **패널 분할**(가로/세로): `Ctrl+\`, `Ctrl+Shift+\` 등 — 레이아웃이 복잡해지므로 2단계 이후 검토.
- **패널만 별도 창으로 띄우기**: §3.3 `aiWorkspacePopoutPanel`(Ctrl+Shift+W)와 동일 동작; 패널 컨텍스트에서 쓰이면 "현재 패널 팝아웃"으로 이해 가능.

| ID | 설명 | 기본 조합 (제안) | 동작 |
|----|------|------------------|------|
| `aiWorkspacePanelPrev` | 이전 패널 (현재 탭 내) | `Ctrl+Alt+Up` | 해당 영역 내 이전 패널로 전환, Focus Stack 갱신 |
| `aiWorkspacePanelNext` | 다음 패널 (현재 탭 내) | `Ctrl+Alt+Down` | 해당 영역 내 다음 패널로 전환, Focus Stack 갱신 |
| `aiWorkspacePanel1`~`aiWorkspacePanel9` | 1~9번 패널로 직행 | `Ctrl+1` ~ `Ctrl+9` | 해당 영역 N번째 패널 활성화 |
| `aiWorkspacePanelClose` | 현재 패널 닫기 | `Ctrl+F4` | 포커스 패널 닫기 (Dirty 시 확인 다이얼로그) |
| `aiWorkspacePanelReopen` | 방금 닫은 패널 다시 열기 | `Ctrl+Shift+T` | (선택) 브라우저 탭 복원과 충돌 검토 |

구현 시 **현재 포커스가 어느 영역(좌/중앙/우)인지**에 따라 "이전/다음 패널"의 적용 범위(해당 영역의 `leftPanelIds`/`centerPanelIds`/`rightPanelIds` 내 인덱스)를 정하면 된다.

### 3.7 최근 닫은 탭/패널 복구 (Recently Closed Stack)

활성 탭 또는 패널을 닫을 때 **해당 인덱스/항목을 기억**해 두고, 단축키 또는 UI로 **다시 열 수 있게** 한다. [NEXA-AI-03]의 **Focus Stack**, **워크스페이스 스냅샷**(§8.7), **Nexus Map**(§8.6), [NEXA-AI-06]의 **Causality Chain(인과 체인)** 과 연계해 설계한다.

#### 3.7.1 Recently Closed Stack (Pinia)

- **저장소**: Pinia 스토어에 **닫힌 항목 스택**을 둔다. 각 항목은 예: `{ panelId, filePath, tabId, closedAt?, focusedDuration?, area?: 'left'|'center'|'right', tabIndex?, panelIndex? }` 형태.
  - `panelId`: 패널 고유 ID (UUID/ULID). Nexus Map·Focus Stack 식별과 동일.
  - `filePath`: 파일 경로 (있을 경우). 복구 시 같은 파일을 다시 연다.
  - `tabId`: 탭 ID (dialogue, narrative, logic, media 등). 복구 시 해당 탭으로 열기.
  - `closedAt`: 닫은 시각. TTL·신선도 계산에 사용.
  - **`focusedDuration` (Dwell Time / 체류 시간)**: 패널이 **닫히기 전까지 얼마나 오래 활성(포커스) 상태였는지** 기록(예: 초 단위 또는 ms). "오랫동안 고심하며 수정했던 파일"을 나중에 AI가 **더 중요한 맥락**으로 판단하는 근거로 활용. 포커스 진입 시각을 저장해 두고, 닫을 때 `closedAt - focusEnteredAt` 등으로 계산하여 항목에 넣는다.
- **동작**: 사용자가 **탭** 또는 **패널**을 닫을 때(메뉴/단축키/닫기 버튼) 해당 항목을 스택 **맨 앞**에 push. 복구 시 스택에서 pop 또는 N번째 항목 선택해 해당 탭/패널을 다시 연다.
- **정책**:
  - **최대 보관 개수**: 예) 20~50개. 초과 시 **가장 오래된 항목**부터 제거 (FIFO). 구현 시 설정 가능하게 둘 수 있음.
  - **유효 기간(TTL)**: 예) 24시간 또는 7일. `closedAt` 기준으로 만료된 항목은 목록에서 제거하거나 표시하지 않음. 구현 시 TTL 값 설정 옵션.

#### 3.7.2 Focus Stack·신선도(Freshness) 연동

- **다시 열린 패널의 맥락 반영**: 닫힌 패널을 Recently Closed에서 복구해 다시 열면, 해당 패널을 **Focus Stack 상단**에 두고 **신선도(Freshness) 가중치**를 부여한다 ([NEXA-AI-03] §5.7 컨텍스트 우선순위·신선도). AI가 "방금 다시 연 그 코드/문서"를 **즉시 중요한 맥락**으로 인식해 지칭 해석·컨텍스트 구성에 반영되도록 한다.
- **연동 포인트**: 오케스트레이터(useAiOrchestrator)의 컨텍스트 구성(④)에서 Focus Stack·패널 JSON을 읽을 때, "최근 복구된 패널"에 대한 타임스탬프 또는 플래그를 두어 신선도 보정 가능.
- **Dwell Time(`focusedDuration`) 활용**: 스택 항목의 **체류 시간(focusedDuration)** 을 오케스트레이터에 전달하면, "해당 패널에서 오래 머문 편집"을 **중요도 보정**에 사용할 수 있다. 예: `focusedDuration`이 긴 패널(오랫동안 고심하며 수정했던 파일)에 더 높은 컨텍스트 가중치를 부여해, AI가 지칭·요약·비교 시 해당 문서를 우선 반영하도록 한다.

#### 3.7.3 워크스페이스 스냅샷·Nexus Map·Causality Chain 연계

| 연계 대상 | 연계 내용 |
|----------|-----------|
| **워크스페이스 스냅샷** ([NEXA-AI-03] §8.7) | 스냅샷 저장 시점의 **탭·패널 구조**가 JSON으로 저장됨. Recently Closed는 "닫기" **이벤트 시점**의 패널 메타를 스택에 넣음. 추후 **특정 스냅샷 시점에서 닫혔던 패널**을 인과 이력과 함께 복구하는 시나리오 확장 가능. |
| **Nexus Map** (§8.6) | 닫힌 패널 = **배경 노드**, 열린 패널 = **활성 노드**. Recently Closed에서 항목을 다시 열면 해당 노드를 **활성 노드**로 복원하고, Nexus Map UI에서도 상태 갱신. 반대로 Nexus Map에서 "배경 노드"를 더블클릭해 다시 열 때도 Recently Closed 스택과 일관되게 처리할 수 있음. |
| **Causality Chain / 인과 체인** ([NEXA-AI-06], [NEXA-AI-03] §8.7) | "패널/탭 닫기"를 **이벤트**로 기록하면 인과 체인에 포함 가능. 예: "A 패널 닫음 → B 패널 포커스" 시퀀스. 나중에 **과거·현재 비교**나 **스냅샷 기반 분석** 시 "그 시점에서 닫힌 항목"을 참조할 수 있음. |

#### 3.7.4 UI 피드백

- **"최근 닫은 항목" 리스트**:
  - **위치 후보**: (1) **Explorer(탐색기)** 탭 하단 — 7개 탭 중 Explorer 하단에 접이식 패널 또는 목록으로 표시. (2) **전용 메뉴** — 상단 메뉴에 "최근 닫은 항목" 드롭다운.
  - **동작**: 리스트 항목 클릭 시 해당 탭/패널을 다시 연다. 단축키(`Ctrl+Shift+T` 등)는 "가장 최근에 닫은 항목 1개" 복구.
- **상단 메인 메뉴 > 화면구성**: **"화면구성"** 메뉴(드롭다운) 안에 **"최근 닫은 항목"** 하위 항목 또는 서브메뉴를 포함한다. 사용자가 단축키 없이도 마우스로 "화면구성 → 최근 닫은 항목 → (목록에서 선택)"으로 복구할 수 있도록 언급.
- **표시 내용**: 각 항목에 `filePath`(파일명) 또는 `tabId`(탭 이름)+요약 표시. `closedAt`이 TTL 내인지에 따라 비활성/흐리게 표시할지 구현 시 결정.

#### 3.7.5 정책 요약

| 항목 | 제안 (구현 시 조정) |
|------|---------------------|
| **최대 보관 개수** | 예) 20~50개. 초과 시 FIFO 제거. 설정 UI에서 변경 가능하게 할 수 있음. |
| **유효 기간(TTL)** | 예) 24시간 또는 7일. `closedAt` 기준 만료 항목 제거/비표시. 설정에서 TTL 값 선택. |

### 3.8 요약 (기본값 제안)

**스플릿·레이아웃 (우선 구현)**

```
Ctrl+Shift+1  좌측 영역 표시/숨김
Ctrl+Shift+2  중앙 영역 표시/숨김
Ctrl+Shift+3  우측 영역 표시/숨김
Ctrl+Shift+0  기본 레이아웃
Ctrl+Shift+9  코드 중심 레이아웃
Ctrl+Alt+R    스플릿 비율 초기화
```

**별도 창 띄우기 ([NEXA-AI-03] §7.3, 멀티 윈도우 도입 시)**

```
Ctrl+Shift+W  현재 패널을 별도 창으로 띄우기
Ctrl+Alt+W    현재 탭 전체를 별도 창으로 띄우기
```

**탭 이전/다음 (Focus Stack 연동)**

```
Ctrl+Alt+Left   이전 탭
Ctrl+Alt+Right   다음 탭
```

**탭 번호로 직접 이동**

```
Alt+1 ~ Alt+7   1번~7번 탭으로 직행
```

**패널 컨트롤 (아이디어, 확장)**

```
Ctrl+Alt+Up     이전 패널 (현재 탭 내)
Ctrl+Alt+Down   다음 패널 (현재 탭 내)
Ctrl+1 ~ Ctrl+9 1~9번 패널로 직행 (현재 탭 내)
Ctrl+F4         현재 패널 닫기
Ctrl+Shift+T   방금 닫은 탭/패널 다시 열기 (Recently Closed Stack, §3.7)
```

**최근 닫은 탭/패널 복구** (§3.7): Pinia Recently Closed Stack, 최대 보관 개수·TTL 설정. Explorer 하단 또는 **화면구성** 메뉴에 "최근 닫은 항목" 리스트. Focus Stack·스냅샷·Nexus Map·인과 체인 연동.

### 3.9 비동기 큐 가시성 (백그라운드 분석 피드백)

[NEXA-AI-07] 등에서 정의한 **비동기 큐**(씬 감지·썸네일 Vision 분석·미디어 메타 추출 등)에 올라간 작업은 백그라운드에서 수행된다. 사용자가 **단축키로 탭을 이동**할 때, 해당 탭에 **진행 중인 분석**이 있으면 상태를 바로 알아볼 수 있도록 피드백을 강화한다.

| 항목 | 내용 |
|------|------|
| **탭 아이콘 표시** | 해당 탭(또는 탭 내 패널)에 **비동기 분석이 진행 중**이면, 탭 아이콘 옆 또는 위에 **"분석 중" 상태**를 작게 표시. 예: 스피너(로딩 아이콘), 진행률 점, 펄스 등. 단축키(Alt+1~7, Ctrl+Alt+좌우)로 탭 전환 후에도 **어느 탭이 현재 분석 중인지** 한눈에 구분 가능. |
| **적용 범위** | 미디어·오디오·영상 관련 탭(Media 등)에서 FFmpeg·Whisper·Vision 모델 등 **백그라운드 큐**에 올라간 작업이 있을 때. 큐 상태(대기/진행 중/완료/실패)를 탭 또는 패널 단위로 구독해 표시. |
| **구현 연동** | 비동기 큐 상태 스토어(Pinia 또는 기존 큐 모듈)와 탭 UI 바인딩. "이 탭(또는 이 탭의 열린 파일)에 대한 분석 작업이 진행 중인가?"를 boolean 또는 enum으로 노출하고, 탭 헤더/아이콘에 스피너 등으로 반영. |

---

## 4. 구현 방향

### 4.1 단축키 정의 추가

- **파일**: `useGlobalShortcuts.ts`
  - `SHORTCUT_CATEGORIES`에 카테고리 추가. 예: `name: 'aiWorkspace'`, `title: 'AI Workspace'`, `ids`: 스플릿 6개 + 별도 창 2개 + 탭 이동 2개 + 탭 번호 7개 + **패널 컨트롤** `aiWorkspacePanelPrev`, `aiWorkspacePanelNext`, `aiWorkspacePanel1`~`aiWorkspacePanel9`, `aiWorkspacePanelClose`, (선택) `aiWorkspacePanelReopen`.
  - `getDefaultShortcuts(handlers)`에 위 항목 추가. `handler`는 `handlers.aiWorkspaceToggleLeft` 등으로 주입. **별도 창** 단축키는 멀티 윈도우 준비 후 구현. **탭 이전/다음·탭 번호** 단축키는 `useAiSplitLayout`의 탭(centerActiveIndex 등)과 연동.

### 4.2 핸들러 주입

- **옵션 1**: AI 도메인 루트(예: AI 라우트를 렌더하는 상위 컴포넌트)에서 `useGlobalShortcuts().registerShortcuts(getDefaultShortcuts({ ...existing, ...aiWorkspaceHandlers }))` 호출. AI 라우트 마운트 시에만 등록하고, 비활성 라우트에서는 해당 6개를 `unregisterShortcut` 하거나, 라우트 가드에서 "AI일 때만 이 6개 등록" 로직 수행.
- **옵션 2**: `modalSystemStore`(또는 전역 단축키를 등록하는 곳)에서 `getDefaultShortcuts`에 넘기는 `handlers` 객체에, "현재 라우트가 /ai일 때만 동작하는 래퍼"를 넣어서 no-op 아웃 시 호출만 하지 않게 함.

### 4.3 useAiSplitLayout 연동

- 핸들러 내부에서:
  - `leftVisible.value = !leftVisible.value` (토글)
  - `applyPreset('default' | 'code')`, `resetSplitSizes()` 호출
- `useAiSplitLayout`은 컴포넌트 트리 상단에서 한 번만 사용되므로, 단축키 쪽에서 동일 composable을 import 해서 ref를 토글/호출하면 됨.

### 4.4 설정 UI

- `/settings` → 키보드 단축키 탭은 이미 `getCategorizedShortcuts()`로 카테고리·목록을 그리므로, 새 카테고리와 6개 id만 추가하면 자동으로 표시·수정 가능.

---

## 5. 체크리스트 (구현 시)

- [ ] `useGlobalShortcuts`에 `aiWorkspace` 카테고리 및 스플릿 6개 단축키 정의 추가
- [ ] 기존 전역 단축키와 조합 충돌 여부 확인 (특히 `Ctrl+Shift+R`, `Ctrl+Shift+0`, `Ctrl+Shift+W` 등)
- [ ] AI 라우트 활성 시에만 등록할지, 전역 등록+조건부 실행할지 결정 후 핸들러 주입 위치 결정
- [ ] `useAiSplitLayout`의 `leftVisible`/`centerVisible`/`rightVisible`/`applyPreset`/`resetSplitSizes`와 단축키 핸들러 연결
- [ ] 설정 UI에서 "AI Workspace" 카테고리 및 설명 노출 확인
- [ ] (선택) 툴팁 또는 헤더 메뉴 "화면구성" 옆에 단축키 힌트 표기
- [ ] **[NEXA-AI-03] §7.3 연계**: 별도 창 띄우기(`aiWorkspacePopoutPanel`, `aiWorkspacePopoutTab`) — 멀티 윈도우 도입 전까지 no-op 또는 설정에서 비활성/숨김. 도입 시 UUID 전역 상태·Global Focus Stack 유지하며 핸들러 연결
- [ ] **탭 이동**: `aiWorkspaceTabPrev`/`aiWorkspaceTabNext`(Ctrl+Alt+Left/Right), `aiWorkspaceTab1`~`aiWorkspaceTab7`(Alt+1~7) — 중앙(또는 해당) 영역 탭 인덱스와 연동, Focus Stack 갱신
- [ ] **패널 컨트롤**: `aiWorkspacePanelPrev`/`aiWorkspacePanelNext`(Ctrl+Alt+Up/Down), `aiWorkspacePanel1`~`aiWorkspacePanel9`(Ctrl+1~9), `aiWorkspacePanelClose`(Ctrl+F4) — 포커스 영역의 패널 목록·활성 인덱스와 연동, Focus Stack 갱신
- [ ] **Recently Closed Stack** (§3.7): Pinia 스토어에 `panelId`, `filePath`, `tabId`, `closedAt`, **`focusedDuration`(체류 시간)** 등 담는 스택. 닫을 때 포커스 체류 시간 기록 → 오케스트레이터에서 "오래 편집한 파일" 중요도 보정에 활용. 최대 보관 개수·TTL 설정. 복구 시 Focus Stack·신선도 부여. Explorer 하단 또는 전용 메뉴·**상단 메뉴 > 화면구성**에 "최근 닫은 항목" 리스트 노출
- [ ] **비동기 큐 가시성** (§3.9): 백그라운드 미디어 분석 중인 탭에 탭 아이콘 옆 **"분석 중"(스피너 등)** 표시. 단축키로 탭 이동 시에도 해당 탭의 큐 상태 피드백 유지. [NEXA-AI-07] 비동기 큐 상태와 탭 UI 바인딩

---

## 6. 참고

- **Layout Management**: Quasar `QSplitter` + Pinia 대신 현재는 `useAiSplitLayout`(ref + localStorage)로 상태 관리. 단축키는 이 상태만 토글/적용하면 됨.
- **[NEXA-AI-03] AI 협업형 멀티 에디터 플랫폼 구축**
  - §1.1 배치 관리(Layout Management)·Focus Stack 정의
  - §5.7 오케스트레이터 컨텍스트 구성(Focus Stack·패널 JSON·selectionRange)·신선도(Freshness)
  - §7.3 창 분리·멀티 윈도우(별도 창 띄우기, UUID 전역 상태·Global Focus Stack·창 복원 하이드레이션)
  - §8.6 Nexus Map(배경 컨텍스트·활성/배경 노드)
  - §8.7 Snapshot·시점 관리(워크스페이스 스냅샷·인과관계·과거·현재 비교)
  - §10.1 패널 JSON·focusStack
- **[NEXA-AI-06] 지식 그래프 및 관계 추론 Nexus Graph**: Causality(인과)·Nexus Map 연동
- **[NEXA-AI-07] 음성·미디어 파이프라인 및 7탭 활용**: 비동기 큐·재시도 로직. §3.9 탭 "분석 중" 피드백과 큐 상태 연동
- **관련 파일**
  - `src/system/composables/useGlobalShortcuts.ts`
  - `src/domains/ai/composables/useAiSplitLayout.ts`
  - `src/domains/ai/views/content/AiSplitLayout.vue`
  - `src/domains/settings/components/ShortcutsSettings.vue`
  - `src/domains/settings/views/content/SettingsContent.vue` (shortcuts 탭)
