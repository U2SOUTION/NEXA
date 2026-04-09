# [NXN] 모스 HUD 시청각 동기화 — 소스 분석 및 구현 순서

> **목표:** 모스 미리듣기 재생과 닉시 온라인 HUD를 시간적으로 맞춘다.  
> **1단계:** 방식 **②** — 재생 시점에 **가운데 현재 부호 강조 + 양옆 맥락이 한 화면에 꽉 차게** 표시.  
> **2단계(옵션):** 방식 **①** — **DIT·타임라인과 마퀴(스크롄) 속도 동기화** (안정화 후 사용자 옵션으로 제공).

---

## 1. 현재 소스 구조 (관련 파일만)

| 파일 | 역할 |
|------|------|
| `src/system/nixie/morseTimeline.ts` | `normalizeDemoHudText` 결과 문자열 → `MorseSoundEvent[]` (`dot` / `dash` / `gap`, ms). 토큰은 공백 분리, `^`는 단어 간 갭. |
| `src/system/nixie/morseWebAudioCore.ts` | `playMorseTimeline(events, options)` — Web Audio로 이벤트 순서 재생, `totalMs` 후 페이드·종료(운영). DSP 실험 그래프는 `morseWebAudioDsp.ts`에 별도 보관. |
| `src/system/nixie/nixieDotMap.ts` | `normalizeDemoHudText`, `encodeTextToMorseHudText`, `mapHudTextToDots(input, scrollOffset)`, `hudTapePeriodWidthCols`, `textFitsCompletelyInGrid`. 긴 문자열은 **열 단위 테이프 스크롄**으로 24×7에 매핑. |
| `src/system/nixie/nixieUiConfig.ts` (`NIXIE_HUD_MARQUEE`) | 마퀴 `intervalMs`, `colsPerTick` — **재생 DIT와 무관한 고정 주기.** |
| `src/system/store/nmapSnapshotStore.ts` | `demo_hud_text`, `demo_hud_morse_enabled`, `demo_hud_scroll_offset`, `morse_dit_ms` 등. `tickDemoHudMarquee()`가 `demo_hud_scroll_offset`만 갱신. |
| `src/system/nixie/components/NixieDevControls.vue` | `buildMorseSoundTimeline` + `playMorseTimeline` 호출, **`morsePlaying`은 컴포넌트 로컬 ref** — 닉시 캐릭터와 공유되지 않음. |
| `src/system/nixie/components/NixieOnlineCharacter.vue` | `getDemoTextMask()` → `mapHudTextToDots(norm, scroll)`. `syncHudMarqueeTimer()` → `setInterval`로 `tickDemoHudMarquee()`. `syncLumina()`로 마스크에 켜진 도트 전체에 펄스. |

### 1.1 데이터 흐름 (현재)

```
[사용자 입력] → nmap.setDemoHudText / setDemoHudMorseEnabled
    → snapshot.demo_hud_text (+ 모스면 encode 경유)
         ├→ NixieOnlineCharacter: mapHudTextToDots(..., demo_hud_scroll_offset)  ← 마퀴와 독립 타이머
         └→ NixieDevControls: 미리듣기 시 buildMorseSoundTimeline → playMorseTimeline  ← 오디오만
```

**갭:** 재생 중 **“지금 몇 번째 이벤트/어느 토큰(글자)”** 이 날지 HUD가 모름. 마퀴는 `NIXIE_HUD_MARQUEE.intervalMs`만 따름.

---

## 2. 방식 ② 구현 — 권장 순서 (1단계)

### 2.0 설계 원칙

- **단일 진실 공급원:** `buildMorseSoundTimeline`과 동일한 규칙으로 **토큰(또는 점/대시) 단위 시간축**을 계산할 수 있어야 한다.  
  → `morseTimeline.ts`에 **토큰·이벤트별 누적 시간(ms)** 또는 **재생 구간 메타데이터** export 권장.
- **오디오와 UI 동기:** `playMorseTimeline` 내부에서 이미 이벤트별 지속시간을 알고 있으므로, **`setTimeout` 체인** 또는 **`performance.now()` 기준 시작 시각 + 누적 ms**로 HUD 갱신(간단·재생 로직과 1:1 대응).  
  → 고정밀 필요 시 `AudioContext`의 `currentTime`과 스케줄 시각을 맞추는 확장은 2단계(①)에서 검토.
- **표시:** “한 점만”이 아니라 **24열 안에 현재 토큰을 중심에 두고 앞뒤 토큰(맥락)이 보이도록** `scrollOffset` 또는 **전용 서브스트링 + 짧은 테이프**로 `mapHudTextToDots` 입력을 조정.

### 2.1 단계별 작업

| 순서 | 작업 | 비고 |
|------|------|------|
| **A** | `morseTimeline.ts` | `buildMorseSoundTimeline`와 동일 파싱으로 **이벤트 인덱스 → 누적 시작 ms** 배열, 또는 **토큰 인덱스 → [startMs, endMs)** 생성 함수 추가 (예: `buildMorseEventSchedule`, `getMorseTokenTimeRanges`). `^`·글자 간 갭 포함 일치 필수. |
| **B** | `nixieDotMap.ts` (또는 전용 `morseHudLayout.ts`) | 정규화된 HUD 문자열에서 **토큰 경계의 “테이프 상 열 위치”**를 구해, **중앙 정렬 스크롄 오프셋**을 계산하는 헬퍼 (예: `scrollOffsetToCenterToken(full, tokenIndex)`). 기존 `hudTapePeriodWidthCols` / `mapTapeToHudDotsColScroll` 규칙과 충돌 없이 검증. |
| **C** | `morseWebAudioCore.ts` | `playMorseTimeline`에 **옵션 콜백** 추가: `onEventStart?(index, event, elapsedMs)`, `onComplete?()`, `onStop?()` — 재생 루프와 동일한 순서로 호출. 정지 시 타이머 정리. |
| **D** | `nmapSnapshotStore.ts` | 재생 UI 동기용 필드 추가 (예: `morse_playback_active`, `morse_playback_mode: 'idle' \| 'sync-window'`, `morse_playback_highlight: { tokenIndex, eventIndex }`). 또는 최소한 **Pinia에 재생 상태만** 두고 나머지는 별 모듈. |
| **E** | `NixieDevControls.vue` | `playMorsePreview`에서 재생 시작/종료 시 스토어 갱신, 콜백에서 토큰/이벤트 인덱스 갱신. **루프 재생** 시 세대 번호(`morsePlayGeneration`)와 동일하게 무효화. |
| **F** | `NixieOnlineCharacter.vue` | `morse_playback_active && demo_hud_morse_enabled && sync 모드`일 때: (1) **기존 `hudMarqueeTimer` 일시 중지** 또는 `tickDemoHudMarquee` 무시, (2) `getDemoTextMask` 분기 — **스토어가 지정한 스크롄/하이라이트**로 마스크 생성, (3) `syncLumina`에서 **현재 토큰 도트만 더 밝게** (이중 마스크: base + accent). |
| **G** | 설정 UI | `NixieDevControls` 또는 스토어 플래그로 **“모스 재생 시 HUD 동기(②)”** 토글. 기본 ON은 정책에 따라. |
| **H** | 검증 | 짧은 문장 / 긴 문장 / `^` 포함 / 재생 중 DIT 변경(재시작) / 탭 숨김 / 연속 재생 ON. |

### 2.2 방식 ② 완료 기준 (DoD)

- 미리듣기 재생 중 마퀴 **단독 타이머**와 어긋나지 않고(동기 모드에서는 마퀴 정지 또는 무시), **소리가 나는 구간과 동일한 리듬**으로 가운데 맥락이 갱신됨.
- **한 화면에 현재 부호만**이 아니라 **양옆 모스 부호가 함께 보이는 폭**으로 배치됨 (24×7 활용).
- 재생 종료·정지 시 HUD 상태가 **일관되게 복귀** (스크롄 오프셋, 루미나, 타이머).

### 2.3 단계별 진행 절차 (한 번에 붙이지 않기)

아래는 **§2.1 A~H**를 순서대로 쪼개되, **각 단계마다 “여기까지 되면 다음으로”** 검증할 수 있게 한 것이다. **다음 단계로 넘어가기 전**에 해당 단계의 **완료 조건**을 만족하는지 확인한다.

| 단계 | 무엇을 한다 | 완료 조건 (이 단계에서 확인) |
|------|-------------|------------------------------|
| **0** | **베이스라인** | `quasar dev`로 앱이 뜨고, 콘솔에 빨간 에러가 없다. `@/...` import가 있으면 **`@system/...` 등 정의된 별칭으로만** 고친다(§4.3). 가능하면 **`quasar build`** 한 번으로 모듈 해석 오류가 없는지 본다(모나코 플러그인 등 **별도 이슈**는 문서화만 하고 모스 작업과 섞지 않는다). |
| **1** | **`morseTimeline.ts`만** — `buildMorseSoundTimeline`와 **동일 파싱**으로 `events` + **이벤트별 표시 토큰 인덱스**(또는 누적 ms 배열)를 내는 함수 추가 | 짧은/긴 문자열, `^` 포함 샘플에 대해 **수동으로 기대 토큰 경계와 일치**하는지 확인. **UI·스토어·오디오 코드 변경 없음.** |
| **2** | **`nixieDotMap.ts`만** — 토큰 인덱스 → **문자 구간**, `scrollOffsetToCenterToken` / **강조용 char-range 마스크** 등 레이아웃 헬퍼 | §1의 `mapHudTextToDots`·`hudTapePeriodWidthCols`와 **같은 정규화 문자열**을 넣었을 때 스크롄이 **한 주기 안에서만** 도는지, 짧은 문장은 스크롄 0인지 확인. **여전히 Vue/Pinia 없음.** |
| **3** | **`morseWebAudioCore.ts`만** — `playMorseTimeline`에 **`onEventStart` / `onComplete` / 정지 시 타이머 정리`**만 추가 | 미리듣기 재생 시 **콘솔 로그**로 이벤트 인덱스가 타임라인 순서대로 찍히는지 확인. **Pinia 갱신 없음.** |
| **4** | **`nmapSnapshotStore.ts`만** — 재생 동기에 필요한 **필드 + action** 최소 집합 (`morse_playback_active`, 스크롄 오버라이드, 하이라이트 인덱스, 종료 시 복구 등) | DevTools에서 action을 **수동 호출**하거나 임시 버튼으로 스냅샷만 바꿔 **필드가 일관되게 갱신·복귀**하는지 확인. **닉시 캐릭터는 아직 안 묶어도 됨.** |
| **5** | **`NixieDevControls.vue`** — 미리듣기 시작/종료 시 **4번 action** 호출, **3번 콜백**에서 스크롄·토큰 갱신, **세대 번호로 무효화**, **같은 값이면 `applyPatch` 생략(디듀프)** | 재생 중 HUD 숫자/스크롄이 **과도하게 깜빡이지 않는지**, 연속 클릭 시 꼬이지 않는지 확인. |
| **6** | **`NixieOnlineCharacter.vue`** — 동기 모드일 때 마퀴 타이머/`tick` 무시, 마스크·`syncLumina`에 **base + accent** | 재생 중에만 **마퀴와 재생 스크롄이 싸우지 않는지**, 끄면 **예전 HUD·마퀴로 돌아오는지** 확인(§4.3 항목 6). |
| **7** | **토글 UI + §2.1 H 전체 검증** | 짧은/긴 문장, `^`, 탭 숨김, DIT 변경 후 재생 등 **DoD(§2.2)** 재확인. |

**진행 팁**

- **0단계(적용 기록):** `src/system/config/errorMessages.ts`에서 `@/system/schemas/errors` → `@system/schemas/errors` 로 수정함. Vite/Rollup **`Failed to resolve import "@/..."`** 를 제거하는 것이 0단계의 핵심이다. `quasar build`는 이후 단계에서 **Monaco 플러그인 `writeBundle`(Windows 경로 이중 결합)** 또는 **d3 `schemeCategory20` export** 등으로 실패할 수 있으며, 그때는 §4.3과 **모스 작업과 분리**해 추적한다.
- **1단계(적용 기록):** `morseTimeline.ts`에 `buildMorseSoundTimelineWithMeta` 추가 — `events`·`eventDisplayTokenIndex`(토큰 인덱스, `^`/단어 갭은 `-1`)·`eventStartMs` 누적. `buildMorseSoundTimeline`은 **동일 `events`** 를 메타에서 위임해 파싱 이원화 방지. 검증: `src/system/nixie/morseTimeline.test.ts` + `npx vitest run src/system/nixie/morseTimeline.test.ts`.
- **2단계(적용 기록):** `nixieDotMap.ts`에 `tapeColStartForCharIndex`, `getMorseTokenCharRange`, `scrollOffsetToCenterToken`, `mapHudTextToDotsCharRangeMask` 추가. `mapTapeToHudDotsColScroll`에 **슬롯 필터** 옵션을 넣어 전체 테이프와 동일 스크롄으로 부분 문자만 그리기. 검증: `src/system/nixie/nixieDotMap.morseLayout.test.ts` + `npx vitest run src/system/nixie/nixieDotMap.morseLayout.test.ts`.
- **3단계(적용 기록):** `morseWebAudioCore.ts`에 `MorsePlaybackHooks` + `PlayMorseOptions.playbackHooks` — `onEventStart`(이벤트 인덱스·이벤트·누적 `elapsedMs`), `onComplete`(자연 종료·페이드 후), `onStopped`(중단). `activePlaybackHookTimers` + `stopMorsePlayback` / `resolvePlayPromiseIfPending`에서 정리. **UI 연결 없이** 브라우저에서 `playbackHooks`로 `console.log`로 순서 확인 가능.
- **4단계(적용 기록):** `nmapSnapshotStore.ts`에 `morse_hud_sync_with_playback`, `morse_playback_active`, `morse_playback_generation`, `morse_playback_scroll_offset_override`, `morse_playback_highlight_token_index`, `morse_playback_scroll_restore` 및 `setMorseHudSyncWithPlayback` / `beginMorsePlaybackHudSync` / `setMorsePlaybackHudFrame` / `endMorsePlaybackHudSync`. 동기 모드 재생 중 `tickDemoHudMarquee`는 **조기 return**(마퀴와 재생 스크롄 경합 방지).
- **0→1→2**는 **순수 함수**라서 Vue 없이도 디버그하기 쉽다. 여기서 파싱/스크롄이 틀리면 **3 이후를 붙여도 고쳐지지 않는다.**
- **3에서 Pinia를 넣지 말고** 콜백만 검증하면, 오디오 쪽 버그와 상태 버그를 **분리**할 수 있다.
- **4와 5를 한 커밋에 몰지 말고**, 4만 먼저 스토어 단위로 검증한 뒤 5에서 DevControls를 연결하면 **원인 추적**이 쉽다.
- **6에서 처음으로 GSAP·watch 빈도**가 이슈가 된다. 스칼라만 watch·rAF 합치기는 §4.1·§4.3을 따른다.

---

## 3. 방식 ① 구현 — 2단계 (옵션, 안정화 후)

### 3.1 선행 조건

- 방식 ②에서 이미 확보한 **이벤트/토큰 시간축**과 **`morse_playback_active`** 파이프라인.
- `demo_hud_scroll_offset`을 **재생 진행률에 연동**할지, **별도 “동기 마퀴 모드” 전용 오프셋**을 둘지 결정 (스냅샷 스키마 `schemaVersion` 또는 새 필드).

### 3.2 단계별 작업

| 순서 | 작업 | 비고 |
|------|------|------|
| **A** | `nixieUiConfig` (`NIXIE_HUD_MARQUEE`) vs 재생 | 동기 모드에서 `intervalMs`를 **`ditMs * k` (또는 이벤트 경계마다 스텝)** 로 두는 방식 중 선택. **가변 갭**이 많아 **고정 interval만으로는 부족** → **토큰/이벤트 종료 시점에만 스크롄 스텝**하는 편이 안전. |
| **B** | `tickDemoHudMarquee` | 옵션: “재생 동기 모드”일 때는 **오디오 스케줄 또는 콜백이 `setDemoHudScrollOffset`을 호출**하고, `setInterval` 마퀴는 비활성. |
| **C** | `morseWebAudioCore` | 필요 시 **AudioContext `currentTime`** 기준 진행률 노출로 드리프트 보정. |
| **D** | 사용자 옵션 | **“마퀴 = DIT 동기(①)”** vs **“윈도우·센터 강조(②)”** 전환. 스토어에 `morse_hud_sync_mode: 'marquee-dit' \| 'center-window'` 등. |
| **E** | 회귀 테스트 | ①/② 전환, 재생 없이 일반 HUD만 켠 경우 기존 마퀴와 동일 동작 유지. |

---

## 4. 리스크 및 주의

### 4.1 구현 시 (일반)

- **스냅샷 `applyPatch`:** `NixieDevControls` 주석대로 배열 watch 지양 — 재생 상태는 **스칼라 필드**로 분리.
- **이중 재생:** 빠른 연속 클릭 시 `morsePlayGeneration`과 스토어 재생 세대 일치 필수.
- **성능:** 이벤트마다 전체 `mapHudTextToDots` 재계산은 부담 가능 — 토큰 윈도우가 짧으면 **부분 문자열 + 고정 스크롄**으로 줄이기.

### 4.2 실패 사례·원인 (2026-04, 재구현 전 참고)

증상이 **“빈(흰) 화면”** 또는 **“브라우저 먹통”**일 때, 아래는 **서로 다른 줄기**다. 하나만 고치면 나머지 증상이 남을 수 있다.

| 구분 | 원인 요약 | 모스 HUD 작업과의 관계 |
|------|-----------|------------------------|
| **A. 런타임·연출 과부하** | 재생 중 **Pinia `applyPatch` 고빈도** + `NixieOnlineCharacter`의 **watch → GSAP `syncLumina` 등**이 잦게 돌면 메인 스레드 부담·체감 멈춤. | 방식 ② 구현 시 **스토어 갱신 빈도·watch 범위·rAF 배치**를 설계 단계에서 제한하지 않으면 재현 가능. |
| **B. 번들·모듈 해석 실패** | `quasar.config.js`에는 **`@` → `src` 별칭이 없고** `@system`, `@frame` 등만 정의되어 있다. `@/system/...` 형태로 import한 파일이 있으면 **Vite가 모듈을 못 찾아** 청크 로드 실패·**앱 전체 미표시**로 이어질 수 있다. (예: `src/system/config/errorMessages.ts`에서 `@/system/schemas/errors` 사용 시 빌드/번들 단계에서 실패.) | **모스 기능과 무관한 파일**이어도 부트스트랩·공용 모듈 경로로 끌려 들어가면 **같은 증상**이 난다. |

**정리:** “두 번 실패”처럼 느껴진 것은 **원인 A(모스·동기화 경로)** 와 **원인 B(임포트·별칭)** 가 **동시에 의심되기 쉬운데**, 실제로는 **다른 레이어**에서 터졌기 때문이다.

### 4.3 다음에 무엇을 조심할지 (체크리스트)

1. **증상 분리:** 흰 화면이면 **브라우저 개발자 도구 콘솔의 첫 번째 빨간 에러 한 줄**을 먼저 확보한다. (`Failed to resolve module`, `Cannot find module`이면 **B 쪽**을 우선 의심.)
2. **빌드로 걸러내기:** 로컬에서 **`quasar build`**(또는 CI)로 **Rollup/Vite 해석 오류**가 없는지 확인한다. dev만 쓰면 청크 로딩 순서에 따라 **B가 나중에 드러날** 수 있다.
3. **임포트 규칙:** 이 레포에서는 **`@system/...`**, `@frame/...` 등 **문서·`quasar.config.js`에 정의된 별칭만** 사용한다. `@/...`는 **기본 제공되지 않는다고 가정**한다. 새 파일 추가 시 동료 리뷰로 `@/` 오남용을 막는다.
4. **모스 동기화만 손댈 때:** 스토어에 넣는 필드는 **최소화**하고, 재생 틱마다 바뀌는 값은 **디듀프(같은 토큰·같은 스크롄이면 패치 생략)** 또는 **컴포넌트 로컬 ref + provide** 등으로 **Pinia 갱신 횟수를 줄이는지** 검토한다.
5. **GSAP·watch:** `syncLumina` / `syncJitter` 전체를 **스냅샷 전체 deep watch**에 묶지 않는다. **필요한 스칼라만** `watch` 소스로 두고, 고빈도 구간은 **`requestAnimationFrame`으로 한 프레임에 한 번** 합친다(문서 §2.0·기존 주석과 일치).
6. **회귀:** 재생 **없이** 일반 HUD·마퀴만 켠 경우 **기존 동작**과 동일한지 매번 확인한다.

---

## 5. 문서 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-09 | 초안: 현재 소스 분석, ②·① 구현 순서 및 DoD 정리 |
| 2026-04-09 | §4.2~4.3 추가: 실패 사례(과부하 vs 임포트 별칭), 재구현 시 체크리스트 |
| 2026-04-09 | §2.3 추가: 단계별 진행 절차(0~7) 및 단계마다 완료 조건·진행 팁 |
| 2026-04-09 | 0단계: `errorMessages.ts` `@system` import 적용, §2.3 진행 팁에 0단계 기록 추가 |
| 2026-04-09 | 1단계: `buildMorseSoundTimelineWithMeta` + `morseTimeline.test.ts`, §2.3 진행 팁에 1단계 기록 |
| 2026-04-09 | 2단계: 모스 HUD 레이아웃 헬퍼(`nixieDotMap`) + `nixieDotMap.morseLayout.test.ts`, §2.3 진행 팁에 2단계 기록 |
| 2026-04-09 | 3단계: `morseWebAudioCore` `playbackHooks` + 타이머 정리, §2.3 진행 팁에 3단계 기록 |
| 2026-04-09 | 4단계: `nmapSnapshotStore` 모스 재생 HUD 필드·action + `tickDemoHudMarquee` 동기 모드 조기 return |
