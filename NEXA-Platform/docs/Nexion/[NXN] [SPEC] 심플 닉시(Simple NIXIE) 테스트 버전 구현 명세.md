## [NXN-SPEC] 심플 닉시(Simple NIXIE) 테스트 버전 구현 명세

**구현 위치:** `NEXA-Platform\src\system\nixie\components\NixieOnlineCharacter.vue`  
**시뮬 패널:** `NEXA-Platform\src\system\nixie\components\NixieDevControls.vue` — **Nexion 도메인 우측 패널** `NexionRightPanel.vue`의 **단일 `q-expansion-item`(NIXIE 시뮬)** 안에 `embedded` 로 배치. 배포 시 체험용 노출 여부는 정책에 따름. 상세는 GSAP UI 명세.  
**Nexnap 스토어(계획):** `NEXA-Platform\src\system\store\nexnapSnapshotStore.ts` — §3.1 네이밍·import, **§3.2 트리**  
**참고 SSOT:** `docs/NIXIE ARCH 닉시 설계도.md`, `docs/Nexion/[NXN] [UIUX] Nexion 5대 지능 — Vue Flow·Dagre·ExplorerTree 구현 정리.md` §6 (NIXIE 연동), `docs/rules/stack-and-dependencies.md` §3 (Pinia)  
**연출·UI·GSAP (상세):** `docs/Nexion/[NXN] [SPEC] 심플 닉시 GSAP 적용 UI 구현 v0.1.md` — **Lumina·Jitter·갸우뚱·개발용 버튼 등 모든 시각 구현**  
**1차 구현:** 위 GSAP UI 명세의 **임시 액션 버튼 시뮬레이션**을 우선한다.

Nexion 기능 구축과 병행하여 실제 데이터 흐름을 검증하기 위한 **심플 닉시(Simple NIXIE) 테스트 버전** 명세입니다.  
**원칙:** 본 파일은 **Nexnap 계약·전역 스토어·파일 구조·물리 격자 요약**만 다룬다. **CSS 키프레임·클래스 기반 연출 경로는 사용하지 않는다.** 시각·인터랙션·GSAP 적용은 **전부** `[NXN] [SPEC] 심플 닉시 GSAP 적용 UI 구현 v0.1.md` 를 따른다.

**현재 코드 상태:** 드래그 가능한 전역 슬롯(placeholder) 수준. 격자·Nexnap·GSAP 연동은 **목표 스펙**이며, 구현 시 본 명세 + GSAP UI 명세를 따른다.

---

### 1. 개요 및 정체성

- **정체성:** 닉시(NIXIE)는 지능의 얼굴이자 존재의 **디지털 쉘(Digital Shell)**입니다.
- **목적:** Nexnap에 따른 도트 격자 반응, 신뢰도 기반 **Jitter**, 인격적 **갸우뚱** 등을 **스토어 기반**으로 선제 검증합니다. **연출 수단은 GSAP** (상세는 GSAP UI 명세).
- **배치:** **플랫폼 프레임**(`frame/layout`)의 전역 오버레이. Nexion 뷰 내부가 아니라 **앱 전역**에서 동작하는 것을 전제로 합니다(설계도·Vue Flow 규약과 정합).

---

### 2. 물리적 규격 (Physical Spec)

- **외형:** **180px × 60px** 전후의 **라운드 박스(Round Box)** (레이아웃·접근성에 맞게 소폭 조정 가능).
- **디스플레이:** 닉시관 느낌의 **리테인드 모드(Retained Mode)** — 상태가 누적·갱신되는 격자.
- **도트 격자:** **가로 18 × 세로 6** (총 108 셀). DOM·SVG·Canvas 선택 및 셀별 연출 방식은 **GSAP UI 명세**에서 정한다.
- **그래프 엔진:** **독립 노드 108개를 Vue Flow 등으로 두지 않음** (미니 HUD에 과한 부하·의존성 방지).

---

### 3. 통신 규격: Nexnap (NEXA Meta Action Protocol)

시스템 표준 **Nexnap** 의미를 담은 **정규화 스냅샷**을 앱 전역에서 일관되게 반영합니다.

**전달 방식(확정): 전역 스토어(Pinia) SSOT**

- **목적:** Nexion에서 **최초 테스트** 후에도 **모든 도메인**에서 동일 규격으로 재사용 — NIXIE·향후 HUD 등 **소비자는 구독만** 추가하면 됨.
- **저장:** **Pinia** 모듈 하나에 **Nexnap 스냅샷**(아래 필드)을 `state`로 둠. 갱신은 **`actions`만** 사용(컴포넌트에서 필드 직접 대입 지양).
- **구독:** `NixieOnlineCharacter` 등은 **`storeToRefs` + `computed`** 로 연출 파생. props로 Nexnap을 넘기는 방식은 **전역 재사용 목표에는 비권장**(예외: 단위 테스트·스토리북 격리 시에만).
- **생산자:** Nexion·보드·시스템 등 도메인별 데이터는 각자 두고, 닉시에 필요한 형태만 **mapper → `actions`** 으로 스냅샷에 반영.
- **수송 계층 분리:** WebSocket / MQTT / REST 등은 **스냅샷 계약 바깥**. 어댑터가 수신·정규화한 뒤 **동일 action**을 호출하면 소비자 코드는 변하지 않음.
- **확장:** 호환을 위해 **`schemaVersion`(또는 `nmapVersion`)** 필드 여지를 두는 것을 권장.

| 필드                     | 역할                              | 도트·전체 박스에 주는 효과                      |
| :----------------------- | :-------------------------------- | :---------------------------------------------- |
| `how_state`              | FLOW / STUCK / VOID               | 색·배경 리듬, STUCK 시 Jitter 가산              |
| `who_pulse`              | WILL / ECHO / ASK                 | Lumina 밝기·점멸 주기(WILL = 가장 안정)         |
| `confidence_score`       | 0–100                             | `user_defined_threshold` **미만**이면 Jitter ON |
| `warn_token`             | 예: `ADAPTER_TIMEOUT` / `null`    | **갸우뚱** + Reddish                            |
| (권장) `schemaVersion`   | 스냅샷 계약 버전                  | 필드 확장·마이그레이션 시 호환용                |
| `ui_entropy_mode`        | 예: `full` / `minimal` / `static` | 로우-엔트로피 제동·GSAP·Jitter 억제 수준        |
| `is_virtual`             | `boolean`                         | 가상 실행·고스트 레이어 표시                    |
| `source_shell_id`        | 문자열·nullable                   | 외부 쉘 유입(Nebula Influx) 시뮬                |
| `user_defined_threshold` | 0–100 (기본 **95**)               | Jitter·ASK 판단에 쓰는 사용자 임계              |

#### 3.0 스냅샷 기본값 (권장 · 초기 로드)

구현 시 `nexnapSnapshotStore` 초기 `state`에 맞춘다. 필요 시 `actions.resetToDefaults()` 로 복귀.

| 필드                     | 권장 기본값                                    |
| :----------------------- | :--------------------------------------------- |
| `how_state`              | `FLOW`                                         |
| `who_pulse`              | `ECHO`                                         |
| `confidence_score`       | `100`                                          |
| `is_virtual`             | `false`                                        |
| `ui_entropy_mode`        | `full` (또는 팀에서 정한 기본 엔트로피 모드명) |
| `user_defined_threshold` | `95`                                           |
| `source_shell_id`        | `null` 또는 현재 쉘 식별자                     |
| `schemaVersion`          | `1`                                            |

**임계 판단(권장):** `confidence_score < user_defined_threshold` 이면 Jitter·ASK 뉘앙스를 낸다(세부 연출은 GSAP UI 명세).

#### 3.1 코드베이스 배치·네이밍 (플랫폼 규약)

프로젝트는 **`system/` vs `domains/`** 로 스토어 성격을 나눈다(`docs/rules/stack-and-dependencies.md` §3). **Nexnap 스냅샷은 앱 전역 SSOT**이므로 **도메인 폴더가 아니라 `system/store`** 에 둔다.

| 항목                       | 규약                                                                                      | 본 명세 예시                                                             |
| :------------------------- | :---------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **디렉터리**               | 플랫폼 공용 Pinia                                                                         | `NEXA-Platform/src/system/store/`                                        |
| **파일명**                 | `camelCase` + `Store` 접미사 (기존: `dashboardLayoutStore.ts`, `userSettingsStore.ts` 등) | `nexnapSnapshotStore.ts` (구현 시 파일명 확정; 의미만 동일하면 됨)         |
| **컴포저블**               | `use` + PascalCase + `Store`                                                              | `useNexnapSnapshotStore`                                                   |
| **Pinia `defineStore` id** | 짧은 문자열, 기존 스토어와 중복 금지                                                      | 예: `'nexnapSnapshot'`                                                     |
| **import 경로**            | Vite 별칭 `@system/store/...`                                                             | `import { useNexnapSnapshotStore } from '@system/store/nexnapSnapshotStore'` |

**도메인 한정 스토어와의 구분:** Nexion 캔버스 전용 상태는 `src/domains/nexion/modules/core/stores/nexionFlowStore.ts` 등 **도메인 경로**에 둔다. Nexion이 Nexnap을 **생산**할 때는 플로우 스토어·뷰에서 읽은 값을 **mapper로 정규화한 뒤** `useNexnapSnapshotStore`의 **action**만 호출해 전역 스냅샷을 갱신한다.

#### 3.2 관련 파일 구조

경로 기준은 **`NEXA-Platform/`** (프론트 루트). **굵게** = 본 명세의 핵심 축, `[계획]` = 아직 없을 수 있음.

```text
NEXA-Platform/
├── docs/Nexion/
│   ├── [NXN] [SPEC] 심플 닉시(Simple NIXIE) 테스트 버전 구현 명세.md   … 본 명세 (계약·스토어)
│   ├── [NXN] [SPEC] 심플 닉시 GSAP 적용 UI 구현 v0.1.md               … 연출·UI·GSAP·개발용 컨트롤
│   └── …
│
├── src/
│   ├── frame/layout/
│   │   ├── MainLayout.vue                   … `<NixieOnlineCharacter />` 전역 마운트
│   │   └── components/
│   │       ├── NixieOnlineCharacter.vue   … 온라인 닉시 HUD · 스토어 구독 · GSAP(상세는 GSAP 명세)
│   │       └── NixieDevControls.vue         … Nexnap 시뮬 UI (`actions`만 호출 · Nexion 우측 아코디언에서 사용)
│   │
│   ├── system/store/
│   │   ├── nexnapSnapshotStore.ts             … [계획] Nexnap 스냅샷 Pinia SSOT
│   │   └── (선택) nexnapSnapshotTypes.ts      … 스냅샷 타입만 분리할 때
│   │
│   └── domains/nexion/
│       ├── views/right/
│       │   └── NexionRightPanel.vue         … **NIXIE 시뮬** 아코디언에 `<NixieDevControls embedded />`
│       ├── modules/core/stores/
│       │   └── nexionFlowStore.ts           … Nexion 캔버스(생산자 측 기존 스토어)
│       └── (선택) composables/ 또는 modules/core/utils/
│           … Nexion → 스냅샷 정규화 후 useNexnapSnapshotStore 액션 호출
```

**역할 요약**

| 구분            | 경로                                               | 역할                                                          |
| :-------------- | :------------------------------------------------- | :------------------------------------------------------------ |
| **소비자(UI)**  | `system/nixie/components/NixieOnlineCharacter.vue` | `useNexnapSnapshotStore` 구독 → GSAP 연출 (명세)                |
| **시뮬 UI**     | `system/nixie/components/NixieDevControls.vue`     | 스토어 `actions`만 호출 · **NexionRightPanel** 아코디언       |
| **부트스트랩**  | `frame/layout/MainLayout.vue`                      | `NixieOnlineCharacter` 전역 마운트(우측 드로어는 도메인 패널) |
| **전역 SSOT**   | `system/store/nexnapSnapshotStore.ts`                | Nexnap 스냅샷 `state` + 갱신 `actions`                        |
| **도메인 상태** | `domains/nexion/.../nexionFlowStore.ts`            | 플로우·노드 등(닉시와 별개; mapper의 입력)                    |
| **매핑(선택)**  | `domains/nexion/**` 하위 `composables` / `utils`   | 생산자가 스냅샷 형식으로만 주입                               |

---

### 4. 시각·연출·UI (본 문서 범위 밖)

**Lumina·Jitter·갸우뚱·Reddish·임시 버튼·인터랙션·GSAP Timeline·SVG/Canvas 선택** 등은 **구현하지 않고**, 다음 문서에 위임한다.

- **`docs/Nexion/[NXN] [SPEC] 심플 닉시 GSAP 적용 UI 구현 v0.1.md`**

본 테스트 명세는 **데이터 계약(Pinia)과 격자 목표 크기**까지만 고정한다.

---

### 5. 기술 스택 (본 파일 기준)

| 레이어          | 기술                                                                 | 용도                                                     |
| :-------------- | :------------------------------------------------------------------- | :------------------------------------------------------- |
| **UI 프레임**   | **Vue 3 + Quasar 2**                                                 | 컴포넌트·라운드 박스·전역 슬롯 배치                      |
| **상태**        | **Pinia 전역 스토어** (Nexnap 스냅샷 SSOT) + 컴포넌트 **`computed`** | 스냅샷 구독·임계 비교                                    |
| **연출 런타임** | **GSAP** (`package.json`에 `gsap` 추가 — GSAP UI 명세)               | 트윈·Timeline — **CSS 애니메이션으로 대체하지 않음**     |
| **실시간 입력** | **스토어 `actions`** ← 도메인 mapper / (후속) Socket·MQTT 어댑터     | 수송은 가변, **계약은 스냅샷 타입 + action API** 로 고정 |

**스토어 실제 파일명·import:** **§3.1** 및 문서 상단 **Nexnap 스토어(계획)** 줄.

**본 프로토타입에서 제외(미니 HUD):**

- **Vue Flow:** NEXU 대형 캔버스용. 108셀 격자에는 **사용하지 않음.**
- **D3.js:** 좌표·물리 시뮬이 필요해질 때만 검토.
- **WebGL/셰이더:** 별도 단계에서 검토.

---

### 6. 확장(후속 기획) — 폭발(Explosion) 등

Nexnap 도달 시 도트가 **바깥으로 퍼지는 Explosion** 연출은 **강도·지속시간·easing** 등 수치가 필요하므로, **세부는 `docs/Nexion/[NXN] [SPEC] 심플 닉시(Simple NIXIE)  확장 구현 v0.2.md`** 및 GSAP UI 명세에서 확정한다.

---

### 7. 테스트 시나리오 (DoD)

시나리오의 **“어떻게 보이는가”** 는 GSAP UI 명세의 버튼·프로토타입과 맞춘다. 데이터 측면 DoD는 다음을 만족하면 된다.

1. **정상 흐름:** Nexnap(또는 동일 스냅샷) 반영 시 도트가 **Lumina** 뉘앙스로 반응하는가?
2. **저확신:** `confidence_score` 를 임계 미만으로 둘 때 **Jitter**가 켜지는가?
3. **에러 대응:** 타임아웃·STUCK 시 **갸우뚱**·**Reddish** 신호가 오는가?

이 심플 닉시는 **Phase 1–2**에서 지능적 추적(Traceability)이 **비언어적으로** 드러나는지 검증하는 도구입니다.

---

### 8. 기대 효과

**미니 닉시(NIXIE Miniature)** 는 NEXU 캔버스의 넓은 Why Chain을 **18×6** 크기의 시각 언어로 압축해 전달합니다. 사용자는 긴 텍스트 전에 **빛의 리듬·떨림·기울기**만으로 **공감(Empathy)** 과 **확신도**를 직관적으로 받을 수 있게 하는 것이 목표입니다.
