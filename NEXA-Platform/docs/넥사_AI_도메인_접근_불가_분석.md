# 넥사 AI 도메인 접근 불가 원인 분석

## 1. 현재 구조 요약

| 구분 | 경로/키 | 파일 |
|------|---------|------|
| 라우트 | `path: 'nexa-ai'` (자식 of `/`) | `src/frame/router/domainRoutes.ts` |
| 도메인 컴포넌트 | - | `src/domains/ai/AiDomain.vue` |
| 콘텐츠(자식 라우트) | `name: 'NexaAiChat'` | `src/domains/ai/views/content/AiContent.vue` |
| 레지스트리 메뉴명 | `nexa-ai` | `src/frame/registry/domainRegistry.js` (left: AiLeftNav, right: AiRightPanel) |
| 메인 메뉴 탭 | `route: '/nexa-ai'` | `src/frame/layout/MainLayout.vue` (mainMenuTabs) |

- **beforeEnter**: nexa-ai 라우트에는 없음 (nexa-archive, extension만 해당).
- **네비게이션**: `GlobalNavbarLeft`에서 `q-route-tab`의 `:to="/nexa-ai"` 및 `handleTabClick`에서 `router.push('/nexa-ai')`로 이동.

→ 라우트/메뉴/레지스트리 설정상 **nexa-ai 접근을 막는 코드는 없음**.

---

## 2. 가능 원인 (우선순위)

### 2.1 캐시로 인한 404 (가능성 높음)

- **과거**: `apiBaseUrl.js` / `clipboard.js`를 참조하던 시절의 번들이 브라우저 또는 Vite 캐시에 남아 있으면, 런타임에 `apiBaseUrl.js` 등을 요청해 **404** 발생.
- **결과**: AI 도메인 청크(또는 그 의존 청크) 로드 실패 → **ChunkLoadError** 또는 **빈 화면/접근 불가**.
- **현재 코드**: `apiBaseUrl.js` / `clipboard.js` 참조는 제거된 상태이며, 빌드도 성공함.

**조치**

1. 개발 서버 중지 후 재시작.
2. 브라우저 **강력 새로고침** (Ctrl+Shift+R) 또는 캐시 비우기.
3. 필요 시 Vite 캐시 삭제 후 재실행:
   - `rm -rf node_modules/.vite` (또는 Windows: `Remove-Item -Recurse -Force node_modules\.vite`).
   - `npx quasar dev` 다시 실행.

### 2.2 동적 import 실패 (레지스트리 사이드바)

- `/nexa-ai` 진입 시 `currentMenu`가 `nexa-ai`로 바뀌며 `MainLayout`의 `watch(currentMenu)`에서:
  - `getLeftSidebarComponent('nexa-ai')` → `AiLeftNav.vue` 동적 import
  - `getRightSidebarComponent('nexa-ai')` → `AiRightPanel.vue` 동적 import
- 위 둘 중 하나라도 **실패**(예: 내부 의존성 404, 문법/런타임 에러)하면 해당 패널만 안 뜰 수 있음.
- **메인 영역**(`router-view` → `AiDomain.vue` → `AiContent.vue`)은 별도 청크이므로, **접근 자체가 안 된다**면 보통은 **라우트 컴포넌트(AiDomain.vue) 또는 그 직간접 의존성 로드 실패**를 의심.

**확인**

- 브라우저 콘솔에 `Failed to fetch dynamically imported module` 또는 404 URL이 있는지 확인.
- Network 탭에서 `nexa-ai` 이동 시 실패하는 요청(빨간색) 확인.

### 2.3 AiDomain.vue 직간접 의존성

- `AiDomain.vue`는 `@system/composables/useDomainIntercom`만 사용 (확장자 없음 → `useDomainIntercom.ts` 로드).
- `useDomainIntercom.ts`는 `@system/store/dashboardLayoutStore`, `./useEventBus` 사용 (해당 파일들 존재).
- AI 도메인 내부에서 `@system/utils/apiBaseUrl` 사용처: `AiLeftNav.vue`, `AiChatPanel.vue`, `useAiAssets.js`, `aiApi.js` — 모두 **확장자 없음**으로 수정된 상태.

→ **소스 기준으로는 404를 유발할 import는 없음**. 캐시/이전 번들에 의한 404 가능성은 2.1 참고.

---

## 3. 확인 절차 (사용자/개발자)

1. **개발 서버**  
   - 터미널에서 `npx quasar dev` 재시작.

2. **브라우저**  
   - `/nexa-ai` 직접 입력 또는 AI 탭 클릭.
   - **F12 → Console**: 빨간 에러 메시지 (ChunkLoadError, 404, Failed to fetch dynamically imported module 등) 확인.
   - **F12 → Network**: 실패한 요청(주소에 `apiBaseUrl`, `clipboard`, 또는 청크 해시 파일명 포함) 확인.

3. **캐시 제거**  
   - 2번에서 404 또는 ChunkLoadError가 보이면:
     - `node_modules/.vite` 삭제 후 `npx quasar dev` 재실행.
     - 브라우저 강력 새로고침 또는 시크릿 창에서 `http(s)://.../...#/nexa-ai` 재현.

4. **빌드**  
   - `npx quasar build` 는 이미 성공하며, `AiDomain-*.js` 청크가 생성됨.  
   - 접근 불가가 **개발 모드에서만** 발생하면 위 캐시/Network 확인이 우선.

---

## 4. 브라우저 로그로 확인된 원인 (2025-02)

- **GET .../apiBaseUrl.js → 404**  
  소스에는 `apiBaseUrl.ts`만 있는데, Vite 의존성 사전 번들/캐시가 **`.js`** URL로 요청함.
- **GET .../clipboard.js → 404**  
  동일하게 `clipboard.ts`만 있는데 **`.js`** 로 요청됨.
- **Failed to fetch dynamically imported module: ErpLeftNav.vue / AiContent.vue**  
  위 404 때문에 해당 청크의 의존성 로드가 실패하면서 동적 import 실패로 이어짐.

**조치**: `apiBaseUrl.js`, `clipboard.js`를 **re-export 파일**로 추가하여 `.js` 요청 시에도 `apiBaseUrl.ts` / `clipboard.ts`를 내려주도록 함. (실제 구현은 .ts에만 유지.)

---

## 5. 요약

- **라우트/메뉴/레지스트리**: nexa-ai 접근을 막는 설정 없음.
- **확인된 원인**: Vite/캐시가 `apiBaseUrl.js`, `clipboard.js`를 요청하는데 해당 경로에 파일이 없어 404 → 동적 import 연쇄 실패.
- **적용한 수정**: `src/system/utils/apiBaseUrl.js`, `src/system/utils/clipboard.js` re-export 추가.
- **추가 권장**: 개발 서버 재시작 후 브라우저 강력 새로고침. 필요 시 `node_modules/.vite` 삭제 후 재실행.
