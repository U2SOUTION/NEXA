# TODO: Nexion Vue Flow 엣지 (선택 강조 · 미리보기 색)

**상태:** 미해결. 이전에 시도한 다중 색 파싱 헬퍼는 효과 불확실·코드 비대로 되돌림. 다음에 다시 볼 때 이 목록만 참고.

## 1. 선택 시 색이 옅게 보임

- **증상:** 설정에서 「선택 시 강조 색」을 비우면 `connectionStrokeColor`(연결 미리보기 색)로 강조하는데, 그때 선이 **반투명처럼** 보인다는 피드백.
- **가설:** `q-color`가 `rgba(…, α)`, `hsla(…)`, `#RRGGBBAA` 등 **알파가 포함된 문자열**을 저장하면, `--nxn-edge-selected-stroke`에 그대로 들어가 SVG `stroke`에 알파가 남음. CSS의 `stroke-opacity: 1`은 **색 문자열 안의 알파**를 없애지 않음.
- **다음 액션 (작게):**
  - DevTools에서 선택된 `.vue-flow__edge-path`의 **computed `stroke`**, **`opacity`**, **`stroke-opacity`** 확인.
  - `userSettings.nexionFlow.connectionStrokeColor` 실제 저장 형식 확인.
  - 해결은 **한 경로만**: 예) 브라우저 `getComputedStyle`로 한 번 정규화, 또는 검증된 소형 색 유틸 **1개**만 도입. 긴 정규식·함수 나열은 피할 것.

## 2. 관련 코드 위치

- `src/domains/nexion/views/content/canvas/NexionCanvasView.vue` — `nexionFlowCssVars`, 엣지/연결선용 CSS 변수 및 `.vue-flow__edge-path` 스타일.
- `src/system/store/userSettingsStore.ts` — `nexionFlow.edgeSelectedStrokeColor`, `connectionStrokeColor`.
- `src/domains/settings/components/NexionFlowSettings.vue` — UI 문구·스와치.

## 3. Vue Flow 참고

- 코어 기본: 비선택 `#b1b1b7`, 선택 시 경로 `#555` (`@vue-flow/core/dist/style.css`).
- unscoped `<style>` 블록에는 **`:deep()`를 쓰지 말 것** (scoped 전용; 무효 선택자로 스타일 전체가 빠질 수 있음).
