# 15 Navis 스플릿 반응형·컴팩트 네비게이션 테스크

## 1. 배경 (논의 요약)

- **Navis**(패널 ID `explorer`, `NexiaExplorerPanel` → `GlobalFileExplorer` embed)는 **트리 + 리스트(또는 상세) 내부 스플릿**과 `$q.splitter` 기반 UX가 겹쳐, 좁은 영역에서 **가로 스크롤·포커스·인지 부하**를 키운다.
- **전체 창 너비**가 아니라 **Navis가 실제로 쓰는 가로 공간(패널 콘텐츠 너비)**만 기준으로 “넓은 모드 / 좁은 모드”를 나누는 것이 맞다. (`NexiaSplitLayout`의 `rightAreaRef` 등 **영역**도 참고하되, 최종 기준은 **Navis 루트 또는 embed 컨테이너**의 `ResizeObserver` 측정값으로 통일.)
- **14번 문서(탭 팝아웃 MVP)**와 별개로, **동일 앱·동일 창** 안에서 레이아웃 복잡도를 먼저 낮출 수 있는 작업이다.

## 2. 목표

1. **Navis 패널 콘텐츠 가로 너비**가 설정한 **임계값 미만**이면, **왼쪽 트리(폴더 트리) 전용 스플릿 칸**을 숨기거나 비중을 0에 가깝게 접는다(구현 팀이 “숨김 / 접힘 + 토글” 중 선택).
2. 같은 조건에서 **오른쪽(또는 메인 리스트) 쪽 상단**에 **검색 필드**와 **트리·경로를 대체하는 셀렉트(또는 breadcrumb + 셀렉트 조합)**를 두어, 좁은 폭에서도 **현재 위치·이동·검색**이 가능하다.
3. **넓은 모드로 돌아오면** 기존처럼 **트리 + 리스트** 조합이 복원되며, **동일한 선택/경로 상태**를 유지한다(분기마다 서로 다른 소스 of truth를 두지 않는다).

## 3. 범위

| 포함 | 제외(이번 테스크 밖) |
| --- | --- |
| `NexiaExplorerPanel` / `GlobalFileExplorer` 내부 반응형 | `NexiaSplitLayout` 전체 3분할을 없애는 대개편 |
| Navis 전용 `ResizeObserver` + 임계값 상수 | 7탭 전역 디자인 시스템 전면 개편 |
| 경로/선택 상태 싱크 | 탭 팝아웃(14번) 구현·SharedWorker·Yjs |

## 4. 기술 정리

| 항목 | 권장 |
| --- | --- |
| **폭 측정** | `GlobalFileExplorer` 루트(`.global-file-explorer`)에 `ResizeObserver` — Navis **패널 콘텐츠** 너비 기준 |
| **임계값** | `useNexiaSettings().navisCompactMaxWidthPx` (localStorage `nexia-settings` 키, 기본 480, 범위 200~2000). 추후 설정 UI에서 사용자 변경. |
| **UI** | Quasar: `q-input` 검색, `q-select` / `q-btn-dropdown` 경로, 필요 시 `q-breadcrumbs` |
| **상태** | `currentFolder` / `selectedFile` / 트리 확장 노드 등 **기존 `useFileSelection`·익스플로러 API**를 그대로 쓰고, “표현만” 트리↔컴팩트 전환 |
| **접근성** | 좁은 모드에서도 키보드 포커스 순서·`aria-label`을 트리 모드와 맞출지 정한다. |

## 5. 테스크 목록 (순서)

1. **스펙 고정** — “트리를 완전히 제거”가 아니라 “**Navis 콘텐츠 폭 기준**으로 **컴팩트 모드**에서 트리 영역 숨김 + 상단 검색·경로 UI”로 한 줄 정의(본 문서로 충분 시 링크만 `00`에 추가 검토).
2. **관측 지점 구현** — `NexiaExplorerPanel` 또는 `GlobalFileExplorer`에 `ref` + `ResizeObserver` + `onBeforeUnmount` 정리, `isCompact` 반응형 ref.
3. **레이아웃 분기** — `isCompact === true`일 때 트리 컬럼(또는 `tree-width` 0) + 리스트 상단에 **검색 + 경로 셀렉트(초기에는 더미·최소 동작)**.
4. **상태 연동** — 폴더 이동·선택이 트리 클릭 / 컴팩트 UI **양쪽**에서 동일하게 갱신되는지 확인(단일 소스).
5. **UX 마감** — 임계값 부근 **히스테리시스**(깜빡임 방지, `minWidth` 2-step) 여부, 트리 복원 시 스크롤.
6. **검색 동작** — “현재 폴더 필터” vs “전체 검색” 중 MVP 하나만 명시하고 라벨 구분.
7. **회귀** — `explorerTreeWidth` 저장, 컨텍스트 메뉴, `mode="embed"` 뷰 모드 전환.

## 6. 수용 기준 (완료 정의)

- [ ] Navis **패널만** 수동으로 아주 좁혀도(또는 devtools로 너비 축소) **컴팩트 UI**로 전환된다.
- [ ] 다시 넓히면 **트리 모드**로 돌아오고, **현재 폴더/선택**이 유지된다(또는 복원 규칙이 문서·코멘트에 적혀 있다).
- [ ] 전체 창 너비와 무관하게, **다른 스플릿이 넓을 때** Navis만 좁은 경우에도 올바르게 동작한다.
- [ ] 14번(탭 팝아웃)과 **같은 파일**에서 **충돌 없이** 머지 가능한 수준의 변경 범위로 끝낸다.

## 7. 연계 문서

- `11 NEXA Nexia 통합 레이아웃 구조 규격` — Top/Left/Center/Right 역할
- `14 레이아웃 복잡도 완화 및 탭(패널) 창 분리 MVP 계획` — 병행 시 순서 조율
- (구현 시) `nexiaPanelRegistry` — `explorer` = Navis

---

**한 줄:** Navis **내부**만 `ResizeObserver`로 좁다/넓다를 나누고, 좁을 땐 **트리 스플릿 숨김 + 상단 검색·경로 UI**, 데이터는 **한벌**로 둔다.
