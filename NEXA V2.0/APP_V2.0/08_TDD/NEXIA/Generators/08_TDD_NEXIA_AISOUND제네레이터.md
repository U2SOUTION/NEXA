---
implements_doc: 
see_also: []
doc_id: TDD-030
title: "AI SOUND 제너레이터"
category: "08_TDD"
domain: NEXIA
status: archived
created: 2026-06-10
updated: 2026-06-11
parent_doc: TDD-028
terms_standard: ["pyodide", "tone-js", "webassembly"]
terms_nexa: ["AISOUND", "SCAMP", "Pippi", "Vivex"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/pyodide", "std/tone-js", "std/webassembly", "nexa/AISOUND", "nexa/SCAMP", "nexa/Pippi", "nexa/Vivex"]
---

# React + Monaco + Pyodide + Pippi/SCAMP + Tone.js + Ollama(플랫폼) 중심 정리

> **⛔ archived (2026-06-13):** **Phase 2+** Generator · MVP 7탭 P0 밖 · **SSOT ✗**
> **대체:** [TDD-010](../08_TDD_NEXIA_구조기술스택운영방침.md) · [AI협력 파이프라인 (archived)](./08_TDD_NEXIA_AI협력제네레이터파이프라인.md)


**브라우저:** 자연어 → **NEXA 플랫폼 API**가 Pippi/SCAMP(Python) 코드 생성 → Monaco 편집 → **Pyodide**로 WAV/MIDI 등 **자산 굽기** → **Tone.js**로 재생·실시간 변조 → (선택) Wavesurfer / paper.js / P5.js.

- **DSP·버퍼 생성·재생 변조:** 사용자 브라우저 — **오디오 DSP 서버 없음**
- **LLM·오케스트:** **플랫폼 웹 서버** (Ollama + 음악/코드용 모델 + 선택 클라우드) — 사용자 PC Ollama **불요**

> 3D 스택 대칭: [`AI 3D 제네레이터.md`](./08_TDD_NEXIA_AI3D제네레이터.md) · Wasm: [`WebAssembly 는 무엇인가.md`](./08_TDD_NEXIA_WebAssembly개요.md)

---

## 1. 3D CAD ↔ 사운드 1:1 대칭 (확정 스택)

| 역할 | 3D (`AI 3D 제네레이터`) | 사운드 (본 문서) |
|------|-------------------------|------------------|
| 코드 입력 | Monaco | Monaco |
| 플랫폼 LLM | `/api/v1/cad/generate` → C3Dv0 등 | `/api/v1/sound/generate` → **음악·Pippi/SCAMP 용 모델** |
| Wasm 연산 | Pyodide + CadQuery | Pyodide + **Pippi / SCAMP** (검증 필요) |
| **배치** “굽기” | ToMesh → R3F | WAV / Float32 → **Tone.js 버퍼** |
| **실시간** 뷰·인터랙션 | R3F | **Tone.js** (+ Wavesurfer 파형) |
| 탭 1 | 3D 부품 | **음색·SFX** (Pippi) |
| 탭 2 | 2D 전개도 선행 | **시퀀서·전개도** (paper.js + SCAMP → MIDI) |
| 외부 마감 | Fusion / Blender | **DAW** (Ableton, Logic Pro 등) |

**대원칙 (3D 와 동일):**
**머리·재료 = AI + Pyodide(버튼/레시피 변경 시)** · **손·귀 = Tone.js(센서·슬라이더 고주파)** · **눈 = paper.js / P5.js / Wavesurfer**

---

## 2. 데이터 흐름

| 레벨 | 범위 |
|------|------|
| **A. MVP 런타임** | React → 플랫폼 API → Monaco → Pyodide(굽기) → Tone.js → export |
| **B. 오케스트 고도화** | 다중 에이전트·모델 라우터·클라우드 폴백 (Phase 2, 동일 서버) |

### 2.1 [A] MVP 파이프

```json
[React: 자연어, 슬라이더, 센서, 탭]
        ↓ HTTPS
[NEXA 플랫폼 API]  POST /api/v1/sound/generate
        ↓ 내부
[오케스트]  탭·번역·System Prompt (§6)
        ↓
[Ollama @ 플랫폼]  Pippi/SCAMP 코드 생성  │  클라우드 LLM 폴백
        ↓
[Monaco]  편집
        ↓  「굽기」 Run / AI 생성 후
[Pyodide]  Pippi → WAV/Float32  │  SCAMP → MIDI (가능 시)
        ↓
[Tone.js]  Player·이펙트·Transport · 센서 실시간 ramp
        ↓
[Wavesurfer / paper.js / P5]  파형·시퀀서·영상 (선택)
        ↓
[export]  .WAV (탭1) · .MID (탭2)
```

**브라우저 → Ollama 직접 호출 금지.** C3Dv0(CAD) 와 **음악 도메인 모델**은 플랫폼 라우터에서 분리합니다.

**실시간 정책 (확정 — 초기 문서와의 차이)**

| 트리거 | 처리 |
|--------|------|
| 센서·슬라이더·마우스 (고주파) | **Tone.js 만** — `filter.frequency`, `playbackRate`, `wet`, `volume` 등 |
| AI 생성·레시피 변경·「다시 굽기」 | 플랫폼 API → Monaco → **Pyodide(Pippi/SCAMP)** → 새 WAV/MIDI → Tone 에 로드 |
| ❌ 비권장 | 센서마다 **Pyodide 전체 재합성** (지연·버벅) |

### 2.2 [B] 오케스트레이션 (Phase 2)

NEXA 에이전트 허브·전시 맥락·음색 템플릿·A/B 모델 — **같은 `/sound/generate` 뒤**에서 확장.

---

## 3. 역할 분담 (스택 맵)

| 레이어 | 기술 | 위치 | 역할 |
|--------|------|------|------|
| UI | React (Vite) | 브라우저 | 탭·보정·Monaco |
| API | `/api/v1/sound/generate` | 플랫폼 | 인증·레이트리밋 |
| 오케스트 | NEXA 서비스 | 플랫폼 | §6 프롬프트·번역·라우팅 |
| LLM | Ollama + (선택) 클라우드 | 플랫폼 | → Pippi/SCAMP Python |
| 편집 | Monaco | 브라우저 | 코드·굽기 트리거 |
| DSP 굽기 | Pyodide + Pippi/SCAMP | 브라우저 | WAV·MIDI **배치** |
| **실시간 오디오** | **Tone.js** | 브라우저 | 재생·변조·Transport |
| 파형 UI | Wavesurfer.js (선택) | 브라우저 | R3F 파형에 대응 |
| 시퀀서 UI | paper.js (탭 2) | 브라우저 | 피아노롤·전개도 |
| 비주얼 | P5.js (미디어 아트) | 브라우저 | 영상 픽셀 연출 |

---

## 4. 핵심 파이썬 엔진 (CadQuery 대체)

Pyodide 에서 **「굽기」** 할 때 쓰는 엔진입니다. **CadQuery(OCP.wasm) 만큼 브라우저 보장은 없음** — MVP 에서 스모크 테스트 필수.

### Pippi (탭 1 — 음색·SFX)

- 파형 합성·필터·env·`dsp.buffer` — **코드 = 소리** → LLM 친화
- 예: `oscs.Sine(freq=440).play(duration=2).env('pluck')`
- 출력: **Float32 / WAV blob** → Tone.js `Tone.ToneAudioBuffer` 로드

### SCAMP (탭 2 — 작곡·MIDI)

- 음표·박자·화음·템포 — **악보·시퀀스 로직**
- 출력: **.MID** (Pyodide 불가 시 **플랫폼에서 SCAMP 실행** 폴백 검토)

---

## 5. Tone.js — 실시간층 (주력)

Web Audio API 위의 **확정 실시간 엔진**입니다. (문서 초안의 “순수 Web Audio 만”은 Tone.js 로 통일.)

| 용도 | Tone.js |
|------|---------|
| 재생 | `Player`, `GrainPlayer`, `ToneAudioBuffer` |
| 변조 | `Filter`, `Reverb`, `PitchShift`, `AutoFilter` |
| 동기 | `Transport` — P5 `video`·본편 싱크 |
| 센서 | `param.rampTo(value, time)` — Wasm 재호출 없음 |

**흐름:** Pyodide 가 구운 WAV → `const player = new Tone.Player(url).toDestination()` → 센서 → `filter.frequency.rampTo(...)`.

**신규 합성 최소화:** 전시·슬라이더는 **이미 로드된 샘플 변조**가 기본. 새 텍스처가 필요하면 **AI + Pippi 재굽기** 버튼.

---

## 6. 제품 구조 — 탭 1 / 탭 2

### 공통

- 입력: 자연어 (한국어 UI) → **플랫폼 API** (§7)
- 보정: Hz, dB, Reverb 등 — **슬라이더 → Tone.js**; 레시피 변경 시 API·Pyodide

### 탭 1 — Pippi 음색·SFX

| 항목 | 연결 |
|------|------|
| AI | Pippi Python (플랫폼 LLM) |
| 굽기 | Pyodide → WAV |
| 실시간 | **Tone.js** + (선택) Wavesurfer |
| 출력 | `.WAV` |
| 센서 | Tone 파라미터 (§2.1 표) |

### 탭 2 — SCAMP + paper.js 시퀀서·전개도

| 항목 | 연결 |
|------|------|
| 역할 | 탭 1 **소리 부품**을 시간축에 배치 — 3D 「2D 전개도 선행」과 동형 |
| UI | **paper.js** — 벡터 피아노롤·그리드 (DOM/CSS 만으로는 무거움) |
| 편집 | 드래그·리사이즈 → **타임라인 JSON** (MVP) → SCAMP 템플릿 채움 → MIDI |
| AI | SCAMP 코드 생성 (플랫폼) |
| 출력 | `.MID` |
| 청취 | MIDI → (Pyodide/서버) WAV 프리뷰 → Tone.js |

**탭 2 MVP 현실화:** paper.js ↔ SCAMP **완전 자동 번역**은 Phase 2; MVP 는 AI SCAMP + paper **시각화** 병행.

**탭 격리:** 3D 와 같이 Vite 폴더·상태 분리.

---

## 7. 한국어 · 플랫폼 프롬프트 (3D §3.1 대칭)

- UI 한국어 유지 → 플랫폼에서 **번역·System Prompt** → Ollama
- 치수·Hz·BPM·`mm` 등 **보존**
- 번역: 플랫폼 Ollama 소형 모델 / 규칙 템플릿 / (선택) 클라우드 / `draftPromptEn` 확인 UI

**탭 1 System (요약)**
`Output ONLY valid Python using pippi. Synthesize audio to a variable `final_audio` suitable for export to WAV. No markdown.`

**탭 2 System (요약)**
`Output ONLY valid Python using scamp for notation. Output MIDI-oriented structure. No markdown.`

(전체 문장 예시는 구현 시 `AI 3D 제네레이터.md` §3.1.2 형식으로 sound 전용 파일에 확장.)

---

## 8. 미디어 아트 — Pippi 예제 · P5.js · 연출 모드

### 8.1 Pippi 스크립트 (AI → Monaco) — **굽기용**

센서 변수는 **알고리즘 뼈대**이며, 값 변경 시 **기본은 Tone.js 매핑**. **「다시 굽기」** 시에만 Pyodide 재실행.

```python
from pippi import dsp, oscs, fx, tune

# globals: JS가 굽기 직전에 set (재굽기 시에만)
SENSOR_HEART_RATE = 120.0
SENSOR_DISTANCE = 0.65

bpm = SENSOR_HEART_RATE
beat = 60 / bpm
total_length = beat * 16
output_buffer = dsp.buffer(length=total_length)

pos = 0
while pos < total_length:
    if SENSOR_DISTANCE < 0.4:
        pulse_freq = 880.0 * (1.0 - SENSOR_DISTANCE)
        high_sound = oscs.Sine(freq=pulse_freq).play(duration=beat * 0.25).env('pluck')
        output_buffer.dub(high_sound, pos)
    for freq in tune.chord('A', 'min7'):
        bass = oscs.Sawtooth(freq=freq / 4).play(duration=beat).env('line')
        bass = bass.pan(SENSOR_DISTANCE)
        output_buffer.dub(bass * 0.3, pos)
    pos += beat

reverb_amount = SENSOR_DISTANCE * 0.8
final_audio = fx.reverb(output_buffer, wet=reverb_amount)
# → Pyodide: final_audio to Float32/WAV → Tone.js
```

**전시 매핑 예:** `SENSOR_DISTANCE` → Tone `reverb.wet` + (저주기) P5 왜곡 강도.

### 8.2 연출 모드 (P5 + Tone)

| 모드 | 동작 |
|------|------|
| **인트로** | P5 입자만 (가벼움); 백그라운드 Pyodide 굽기 |
| **본편** | `Tone.Transport` + `video.play()` 동시 스타트 |
| **인터랙** | 센서 → **Tone.js + P5 `draw()`** (Wasm 재굽기 없음) |

### 8.3 P5.js 연출 예 (클라이언트)

- **슬릿 스캔:** 픽셀 라인 누적 ↔ 센서 속도
- **픽셀/파티클:** **Tone.js** `Meter`/`Analyser` → P5 좌표 (Pippi 매 프레임 X)
- **타이포:** 진폭 → `textSize`
- **매트:** 카메라 마스크 + 영상 블렌드

영상 **원본**은 CDN·정적 호스팅; **연출 연산**은 클라이언트 (AE 프리렌더 불필요).

---

## 9. DAW 마감 (Blender/Fusion 대응)

- 대상: Ableton Live, Logic Pro, Cubase 등
- 연동: 웹에서 `.WAV` · `.MID` 다운로드 → DAW 타임라인에 드래그
- 웹에서 **사전 청음·전개도 검증** 후 스튜디오 마스터링

---

## 10. 배포·운영 · 비용 3 축

| 항목 | 내용 |
|------|------|
| 프론트 | 정적 빌드 + Wasm 번들 |
| 플랫폼 API | `/sound/generate` · 오케스트 |
| Ollama | **플랫폼 서버** — 음악/Pippi/SCAMP 용 모델 (+ 번역 소형 모델) |
| **DSP 서버** | **0** — Pyodide·Tone.js 는 클라이언트 |
| **LLM 비용** | **≠ 0** |

### 10.1 비용·데이터 (3D §7.1 과 동일 구조)

#### 축 A — DSP·재생·P5/paper (클라이언트)

| 구간 | 위치 |
|------|------|
| Pippi/SCAMP 굽기 | Pyodide (브라우저) |
| 재생·센서 변조 | **Tone.js** |
| 파형·시퀀서·영상 연출 | Wavesurfer, paper.js, P5 |

→ **상시 오디오 DSP 서버 VM** 불필요.

#### 축 B — LLM·오케스트 (플랫폼)

자연어·생성 **Python 코드** → 플랫폼 Ollama/클라우드. 사용자 Ollama 설치 없음.

#### 축 C — CDN·영상·API

Wasm 번들·영상 원본·인증·DB.

#### 데이터·프라이버시

| 데이터 | 경로 |
|--------|------|
| WAV·메시급 버퍼 | 기본 **브라우저** |
| 프롬프트·코드 | **플랫폼 LLM** |
| 오프라인 | Monaco + Tone(샘플) 또는 Pyodide 만 |

- ✅ *「오디오 DSP·재생은 브라우저 (Tone.js+Wasm). AI 코드는 **NEXA 플랫폼** LLM.»*
- ❌ *「플랫폼·LLM 까지 전부 0 원»*

#### 10.1.1 최소 사양

**클라이언트:** RAM **8GB+** (Pyodide+Tone; Ollama 불필요), Web Audio, Chromium 권장.
**플랫폼:** Ollama GPU/VRAM, 레이트리밋, 음악 모델 버전 고정.

#### Phase 2+ 하이브리드

| 트리거 | 대응 |
|--------|------|
| Pyodide+SCAMP 실패 | 플랫폼에서 MIDI/WAV 렌더 API |
| 품질 한계 | 클라우드 LLM 폴백 |
| 저사양 | Tone 만 + 프리셋 WAV |

---

## 11. 구현 순서

1. **Vite + React** — Monaco / Tone.js / 재생 버튼
2. **Tone.js** — WAV URL 재생 + 슬라이더 → `rampTo`
3. **Wavesurfer** (선택) — 파형
4. **Pyodide 스모크** — Pippi `sine` → WAV → Tone
5. **API 스텁** — `POST /api/v1/sound/generate`
6. **플랫폼 Ollama** — Pippi/SCAMP 프롬프트 (§7)
7. **탭 1** — 음색 UI + export WAV
8. **탭 2** — paper.js UI + SCAMP/MIDI (폴백 포함)
9. **P5** — 전시 모드 (인트로/본편/인터랙)
10. **오케스트 [B]** — 라우터·클라우드·에이전트

(3D CAD 앱과 **상단 대분류 탭**으로 레이아웃 분리 — [`AI 3D 제네레이터.md`](./08_TDD_NEXIA_AI3D제네레이터.md) §8 과 병행.)

---

## 12. 명시적으로 검토할 것

| 항목 | 이유 |
|------|------|
| **Pippi @ Pyodide** | micropip·NumPy·성능 스모크 |
| **SCAMP @ Pyodide** | 실패 시 플랫폼 MIDI 렌더 |
| **플랫폼 `/sound/generate`** | 인증·스트리밍·레이트리밋 |
| **음악 LLM vs C3Dv0** | 도메인 모델 분리 |
| **한국어 번역** | §7, `draftPromptEn` |
| **센서 → Tone only** | Wasm 재굽기 디바운스 정책 |
| **paper.js → SCAMP** | MVP JSON 중간 형식 |
| **Tone Transport + P5 video** | 싱크 |
| **프라이버시** | §10.1 |
| **비용 3 축** | A/B/C 모니터링 |

---

## 참고 링크

- [Pippi / Python audio (llllllll.co)](https://llllllll.co/t/python-music-audio-processing-and-sound-manipulation/64378)
- [SCAMP (PyPI)](https://pypi.org/project/scamp/)
- [Tone.js](https://tonejs.github.io/)
- [p5.js](https://p5js.org/)
- [paper.js](http://paperjs.org/)
- [awesome-python-audio](https://github.com/andreimatveyeu/awesome-python-audio)
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [AI 협력 제너레이터 파이프라인 (TDD-028)](./08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |
| 음성 PRD | [음성·미디어 파이프라인 7탭 (PRD-007)](../../../05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인.md) |
