# NIXIE [ARCH] 사운드 DSP 4축과 6대 의미축 (UI·Web Audio) 아키텍처

## 정책 고정 (Atomic Clock 우선)

- **DIT(속도) SSOT**는 `morse_dit_ms` 하나로 고정한다.
- DIT 변경 권한은 아래 두 경로만 허용한다.
  - 수동 DIT 슬라이더(`setMorseDitMs`)
  - 원자시계 프리셋(`morse_atomic_clock`) 오버라이드
- 의미 6축(`tension`/`uncanniness`/`mechanical`/`space`/`vitality`/`harmony`)은 **DIT에 관여하지 않는다**.
- 의미 6축은 톤/레이어 질감(DSP 4축, detune/jitter/filter/release, 공간/조화 등)에만 관여한다.
- 즉, 매핑 ON 상태에서도 DIT는 원자시계/수동값을 그대로 유지하며, 다른 축 변화로 변하지 않는다.

## 개요

- **DSP 4축** (`filter` · `release` · `detune` · `jitter`): Web Audio 그래프에서 실제로 돌아가는 **노브**. UI·이벤트는 가능하면 **Hz를 직접 넣지 않고** 이 네 값(0~1)만 넘긴다.
- **의미 6축** (`tension` · `uncanniness` · `mechanical` · `space` · `vitality` · `harmony`): 내러티브·스냅샷이 넘기는 **연속 목표값**(0~1). `mapNixieSoundAtmosphereToLayerParams` 등으로 **DSP 4 + 선택 필드**로 합성된다.
- **출력 경로는 둘**: (1) **레이어 프로브** — `nixieSoundLayerAudio.ts` 전용 `AudioContext`, 지속 테스트 톤. (2) **모스 미리듣기(운영)** — `morseWebAudioCore.ts`, 타임라인 이벤트마다 오실 생성. 참고: `morseWebAudioDsp.ts`는 DSP 실험 보관 파일(비운영).

```mermaid
flowchart LR
  subgraph ui [UI / 스냅샷]
    A6[의미 6축 0~1]
    D4[DSP 4축 0~1]
  end
  subgraph map [매핑]
    MC["map…ToLayerParams\n표 A · R1~R3"]
    MD["map…ToMorseDelta\n표 B · Hz/pan 보조"]
  end
  subgraph audio [Web Audio]
    P[nixieSoundLayerAudio\n프로브]
    M[morseWebAudioCore\n모스(운영)]
  end
  A6 --> MC
  MC --> D4
  D4 --> P
  D4 --> M
  A6 --> MD
  MD --> M
```

---

## 1. 타입·모듈 SSOT

| 역할 | 심볼·설명 | 파일 |
|------|-----------|------|
| DSP 레이어 파라미터 | `NixieSoundLayerParams`, `getNixieSoundLayers` | `src/system/nixie/nixieSoundLayerParams.ts` |
| 의미 대기권 파라미터 | `NixieSoundAtmosphereParams`, `getNixieSoundAtmosphere` | `src/system/nixie/nixieSoundAtmosphereParams.ts` |
| 의미 → DSP·모스 | `mapNixieSoundAtmosphereToLayerParams`, `mapNixieSoundAtmosphereToMorseDelta`, `NIXIE_SOUND_ATMOSPHERE_MAP_SPEC_VERSION` | `src/system/nixie/nixieSoundAtmosphereMap.ts` |
| 축별 DSP·프로브 그래프 | 필터·트레몰로·듀얼 오실·지터·공간·이질 잡음·**조화 간격** | `src/system/nixie/nixieSoundLayerAudio.ts` |
| 모스 재생(운영) | `playMorseTimeline`, `setMorseSoundLayerParams`, `setMorseCarrierFrequencyHz` | `src/system/nixie/morseWebAudioCore.ts` |
| 모스 재생(DSP 실험·비운영) | 위와 유사 API, DSP 그래프 포함 | `src/system/nixie/morseWebAudioDsp.ts` |
| 스냅샷·토글 | `sound_atmosphere_*`, `sound_atmosphere_mapping_enabled` | `src/system/store/nexnapSnapshotStore.ts` |
| 개발 패널 | 4축 + 6축 슬라이더, 매핑 토글 | `src/system/nixie/components/NixieDevControls.vue` |

의미 축의 선택 필드(`mechanicalBlend01`, `spaceBlend01`, … `harmonyBlend01`)는 매핑 결과로만 채워지며, **프로브·모스**가 동일 타입을 소비한다.

---

## 2. DSP 4축 — 청각 역할과 코드 대응

| 축 | 청감 | 구현 요지 (`nixieSoundLayerAudio`) |
|----|------|-------------------------------------|
| **Filter** | 밝기·먹먹함 | `filter01` → `BiquadFilterNode` 저역 `frequency`·`Q` |
| **Release** | 꼬리·맥박 | `release01` → 트레몰로 깊이; 모스에서는 **닷/대시 엔벨로프 릴리즈**에도 반영 |
| **Detune** | 두 음 간격·입체 | 듀얼 오실 `detune` ±스프레드 |
| **Jitter** | 미세 떨림 | 고속 LFO → `detune` 변조 등 |

그래프 순서 개념: **발진(듀얼·파형)** → **필터** → **게인(릴리즈/트레몰로)** → **공간 믹스** … (지터는 발진 `detune`에 주로 탑재).

---

## 3. 의미 6축 — 필드와 스냅샷

| 표시 | `NixieSoundAtmosphereParams` | 비고 |
|------|------------------------------|------|
| 긴장 | `tension01` | 캐리어 오프셋·패닝 보조 등에 쓰임(표 B) |
| 이질감 | `uncanniness01` | 지터·디튜닝·잡음 가중 |
| 기계성 | `mechanical01` | 파형·Q·R3 릴리즈 감쇠 |
| 공간감 | `space01` | Delay+피드백 웻·드라이 (`spaceBlend01`) |
| 활력 | `vitality01` | 트레몰로 속도 등 |
| 조화 | `harmony01` | `harmonyBlend01` → **듀얼 오실 둘째 음 간격**(1 → 완전 5도 비율) |

스냅샷 필드명·0~100 저장은 `nexnapSnapshotStore`와 `NixieDevControls`를 본문으로 한다.

---

## 4. 매핑 M-C v0.1 (`NIXIE_SOUND_ATMOSPHERE_MAP_SPEC_VERSION`)

### 4.1 합성식 (DSP 4축)

- 각 차원 \(k \in \{\texttt{filter}, \texttt{release}, \texttt{detune}, \texttt{jitter}\}\):  
  \(\texttt{dsp}_k = \mathrm{clamp01}(\sum_i w_{i,k} \cdot \mathrm{axis}_i)\) — 가중치 \(w_{i,k}\)는 **표 A**(코드: `W_FILTER` … `W_JITTER`).
- **R3**: `mechanical01` ≥ 임계 시 `release01_eff = clamp01(release_base − β·mechanical01)` — `β` = `NIXIE_ATMOSPHERE_RELEASE_MECHANICAL_BETA`.
- **R2**: `harmony01` ≥ 임계 시 이질감 유래 **지터 가중**에 0.75배.
- **R1**: 긴장·활력 둘 다 높을 때 지터 보수(0.85배) — 코드 주석·테스트 참고.

### 4.2 표 A — 의미 축 → DSP 가중 (코드와 동일)

행 순서: 긴장, 이질감, 기계성, 공간감, 활력, 조화.

| 의미 축 ↓ | filter01 | release01 | detune01 | jitter01 |
|-----------|----------|-----------|----------|----------|
| 긴장 | 0.45 | 0.25 | 0.15 | 0.35 |
| 이질감 | 0.32 | 0.28 | 0.60 | 0.82 |
| 기계성 | 0.44 | 0.04 | 0.36 | 0.44 |
| 공간감 | 0.20 | 0.40 | 0.25 | 0.10 |
| 활력 | 0.42 | 0.50 | 0.56 | 0.34 |
| 조화 | 0.35 | 0.30 | 0.50 | 0.15 |

의미 축별 **블렌드**(`mechanicalBlend01` 등)는 `mapNixieSoundAtmosphereToLayerParams` 반환 객체에 그대로 실려 DSP 쪽 보조 입력이 된다.

### 4.3 표 B — 모스 델타 (`mapNixieSoundAtmosphereToMorseDelta`)

- **DIT(ms)**: 델타에 **포함하지 않음**. `morse_dit_ms` + 원자시계 오버라이드만 반영(의미 6축 비관여).
- **carrierOffsetHzFromTension**: 최대 120×`tension01`.
- **carrierUncannyOffsetMaxHz**: 매핑 스펙에 유지(후속 톤 연출 여지). **현재 운영 모스**는 `morseWebAudioCore`에서 **UNCANNY → 이벤트마다 난수 Hz 오프셋 보조 사인** 혼합으로 이질감을 낸다(메인 캐리어 톤 상승과 분리).
- **panWobbleDepth01**: 미세 패닝 흔들림 깊이.

세부 식은 코드·`nixieSoundAtmosphereMap.test.ts`가 기준이다.

### 4.4 표 C — 규칙 ID (코드 상수와 동명)

| ID | 조건 | 처리 |
|----|------|------|
| R1 | 긴장·활력 동시 고값 | 지터 보수 |
| R2 | 조화 ≥ `NIXIE_ATMOSPHERE_R2_HARMONY_THRESHOLD` | 이질감→지터 항 감쇠 |
| R3 | 기계성 ≥ `NIXIE_ATMOSPHERE_R3_MECHANICAL_THRESHOLD` | 릴리즈 효과 감쇠 |

### 4.5 적용 채널 (v0.1)

| 출력 | DSP 합성 | Hz·pan 델타(매핑) / DIT는 스냅샷만 | 조화(간격) |
|------|----------|-------------------------------------|------------|
| 모스 미리듣기 | ☑ | ☑ Hz·pan · DIT는 스냅샷 | ☑ 듀얼 오실 `osc2 = osc1 × harmonyIntervalRatio` |
| 레이어 프로브 | ☑ | — | ☑ 동일 비율 |
| 건반·샘플(후속) | (동일 타입 재사용) | 별도 | 스케일·화성 확장 여지 |

순수 사인 모스에서 **조화**는 멜로디 스케일 대신 **주파수 비율(유니즌→5도)** 로 청감을 낸다. 펜타토닉 등은 **후속 음원 경로**에서 확장하는 전제를 유지한다.

---

## 5. 런타임 동작 (요약)

- **매핑 토글 켜짐**: `effectiveNixieSoundLayers`가 프로브·모스에 주입되고, 수동 DSP 슬라이더는 해당 경로에서 덮어쓰기 정책을 따른다(구현은 `NixieDevControls`).
- **모스**: `PlayMorseOptions.soundLayers`, 재생 중 `setMorseSoundLayerParams` / `setMorseCarrierFrequencyHz`가 **듀얼 오실 쌍** 기준으로 유지된다.
- **dit·톤 변경**: DIT 변경(슬라이더/원자시계)은 타임라인 재구성이 필요하며, 톤 변경은 라이브 반영 정책을 따른다.

---

## 6. 커스터마이징 가이드

### 6.1 DSP “느낌”만 바꿀 때 (`nixieSoundLayerAudio.ts`)

- 필터 범위: `FILTER_LP_MIN_HZ` / `FILTER_LP_MAX_HZ`
- 디튜닝·지터 상한: `DETUNE_SPREAD_MAX_CENTS`, `JITTER_DETUNE_MOD_MAX_CENTS` 등
- 기계성·이질감 보조: `MECH_*`, `UNCANNY_*`, `MECH_SQUARE_WAVE_THRESHOLD`
- 공간: `SPACE_DELAY_*`, `NIXIE_SPACE_WET_LP_*`
- **조화 간격**: `HARMONY_INTERVAL_MAX_RATIO` (기본 3/2 = 완전 5도)

상수 변경 후 **프로브로 먼저** 듣고 모스에 반영되는지 확인한다.

### 6.2 의미 → DSP·모스 비율을 바꿀 때 (`nixieSoundAtmosphereMap.ts`)

- 표 A 배열 `W_FILTER` … `W_JITTER` 수정 시 **문서 표 4.2·`nixieSoundAtmosphereMap.test.ts`** 함께 갱신.
- R1~R3 임계·계수: 파일 상단 `export` 상수와 테스트.
- 스펙 버전: `NIXIE_SOUND_ATMOSPHERE_MAP_SPEC_VERSION` 올리고 본 문서에 한 줄 기록.

### 6.3 새 의미 축·DSP 보조 필드를 넣을 때

1. `nixieSoundAtmosphereParams` / 스냅샷 스키마에 필드 추가  
2. `mapNixieSoundAtmosphereToLayerParams`에서 `NixieSoundLayerParams` 선택 필드로 전달  
3. `nixieSoundLayerAudio`·`morseWebAudioCore`(운영)·`morseWebAudioDsp`(실험)에서 소비 여부 결정  
4. 단위 테스트·개발 패널 슬라이더

---

## 7. 디자인 메모 (짧게)

- **리버브**: 1차는 `DelayNode`+피드백; `ConvolverNode`는 IR·부하 이슈로 후순위.
- **활력·템포**: `playbackRate`·스케줄 축 스케일은 HUD·타임라인과 **동시에** 설계.
- **축 중복**: 긴장과 활력이 비슷한 청감으로 겹치면 표 A 가중·R1으로 이미 분리; 더 쪼개려면 가중치·상한을 조정.

---

## 8. 관련 참고

- `src/system/nixie/nixieUiConfig.ts` — HUD 등 UI 상수  
- `nixieSoundAtmosphereMap.test.ts`, `nixieSoundLayerAudio.test.ts` — 수치 회귀 방지  
- (개념·시나리오) `NIXIE 음악 건반 인터페이스와 비언어적 공감.md` — 본 문서는 **구현·아키텍처**에 집중
