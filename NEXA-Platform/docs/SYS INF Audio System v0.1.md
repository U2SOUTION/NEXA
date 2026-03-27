# NEXA 오디오 시스템 설계 문서 v0.1

## 공간을 감각으로 채우는 지능형 오디오 레이어

> **설계 철학**
> 음악은 배경이 되고, 음성은 전경이 되고,
> 조명은 리듬을 따라가고, 넥슈가 그 전체를 지휘한다.
> 단순한 재생이 아니라 공간 전체가 하나의 감각 레이어가 되는 것.

---

## 목차

1. [전체 아키텍처](#1-전체-아키텍처)
2. [오디오 서버 — PipeWire · PulseAudio](#2-오디오-서버--pipewire--pulseaudio)
3. [Duck & Restore — 음성 우선 볼륨 제어](#3-duck--restore--음성-우선-볼륨-제어)
4. [Snapcast — 저지연 멀티룸 오디오](#4-snapcast--저지연-멀티룸-오디오)
5. [공간 오디오 재구성](#5-공간-오디오-재구성)
6. [오디오 분석 — BPM · 주파수 · 감정](#6-오디오-분석--bpm--주파수--감정)
7. [조명 연동 — Lumina 오디오 싱크](#7-조명-연동--lumina-오디오-싱크)
8. [상황별 오디오 시나리오](#8-상황별-오디오-시나리오)
9. [MQTT 토픽 설계](#9-mqtt-토픽-설계)
10. [HEXAGON 연결](#10-hexagon-연결)
11. [Python 파이프라인 구현](#11-python-파이프라인-구현)
12. [하드웨어 구성](#12-하드웨어-구성)
13. [미해결 과제](#13-미해결-과제)

---

## 1. 전체 아키텍처

```
[음원 소스]
  로컬 파일 · Spotify · YouTube Music
  인터넷 라디오 · TTS 음성
          ↓
[오디오 서버 (PC / RPi)]
  PipeWire or PulseAudio
  Snapcast 서버
  Python 오디오 파이프라인
          ↓ WiFi (저지연)
[출력 레이어]
  ├─ Snapcast 클라이언트 (각 방 앰프·스피커)
  ├─ 넥슈 내장 스피커
  ├─ Bluetooth 스피커 (보조)
  └─ HDMI 앰프 (홈시어터)
          ↓ MQTT
[NEXA 플랫폼]
  넥슈 오케스트레이터
  Duck & Restore 로직
  BPM · 주파수 분석
  조명 · 커튼 · 센서 연동
          ↓
[넥슈 UI]
  Lumina 오디오 싱크
  NEXU 캔버스 리듬 반응
  음성 명령 처리
```

---

## 2. 오디오 서버 — PipeWire · PulseAudio

### 2.1 PipeWire (권장 — Linux 차세대 표준)

```
특징:
  PulseAudio + JACK + ALSA 통합 대체
  저지연 (프로 오디오 수준)
  Bluetooth · USB · 네트워크 오디오 통합
  Ubuntu 22.04+ · Raspberry Pi OS 기본 탑재

NEXA 활용:
  가상 싱크(Virtual Sink) 생성
  → 오디오 스트림 실시간 가로채기
  → BPM·주파수 분석 파이프 연결
  → Duck & Restore 볼륨 제어
```

**핵심 구성**

```bash
# PipeWire 가상 싱크 생성 (분석용)
pw-cli create-node adapter \
  factory.name=support.null-audio-sink \
  node.name=nexa-analyzer \
  media.class=Audio/Sink

# 오디오 스트림을 분석 싱크로 라우팅
pw-link <음원 출력> nexa-analyzer:playback_FL
pw-link <음원 출력> nexa-analyzer:playback_FR
```

### 2.2 PulseAudio (Windows Python 대안)

```python
# Python pulsectl — 볼륨 제어
import pulsectl

pulse = pulsectl.Pulse('nexa-audio')

def get_sink_volume(sink_name='default'):
    for sink in pulse.sink_list():
        if sink_name in sink.name:
            return pulse.volume_get_all_chans(sink)

def set_sink_volume(volume, sink_name='default'):
    for sink in pulse.sink_list():
        if sink_name in sink.name:
            pulse.volume_set_all_chans(sink, volume)
```

### 2.3 Windows — Python sounddevice + pycaw

```python
# Windows 오디오 제어
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
import comtypes

def get_windows_volume():
    devices = AudioUtilities.GetSpeakers()
    interface = devices.Activate(
        IAudioEndpointVolume._iid_, comtypes.CLSCTX_ALL, None)
    volume = interface.QueryInterface(IAudioEndpointVolume)
    return volume.GetMasterVolumeLevelScalar()

def set_windows_volume(level: float):
    # level: 0.0 ~ 1.0
    devices = AudioUtilities.GetSpeakers()
    interface = devices.Activate(
        IAudioEndpointVolume._iid_, comtypes.CLSCTX_ALL, None)
    volume = interface.QueryInterface(IAudioEndpointVolume)
    volume.SetMasterVolumeLevelScalar(level, None)
```

---

## 3. Duck & Restore — 음성 우선 볼륨 제어

> **핵심 개념**
> 음악 볼륨이 크더라도 음성 피드백·명령 시에는
> 자동으로 볼륨을 낮추고(duck) 완료 후 복귀(restore)한다.
> 음악의 흐름을 끊지 않으면서 대화가 가능해진다.

### 3.1 Duck & Restore 흐름

```
[음악 재생 중]
  볼륨: 80%
          ↓
  wake word "넥슈야" 감지
  or 음성 입력 시작
          ↓
[Duck 단계]
  0.3초에 걸쳐 볼륨 → 15%
  (급격한 차단 아님 · 부드러운 감소)
          ↓
[음성 처리]
  TTS 응답 재생
  or 사용자 음성 명령 수신
          ↓
[Restore 단계]
  응답 완료 후 1초 대기
  2초에 걸쳐 볼륨 → 80% 복귀
  (서서히 올라오는 느낌)
```

### 3.2 Duck 레벨 기준

| 상황               | Duck 레벨   | 전환 시간 | 복귀 대기         |
| ------------------ | ----------- | --------- | ----------------- |
| Wake word 감지     | 20%         | 0.3초     | —                 |
| TTS 응답 재생      | 15%         | 0.3초     | 응답 완료 후 1초  |
| 전화 연동          | 10%         | 0.5초     | 통화 종료 후 2초  |
| 긴급 알림 (Safety) | 5%          | 즉각      | 알림 확인 후      |
| 취침 유도          | 점진적 감소 | 10분      | 수면 감지 후 정지 |

### 3.3 Python 구현

```python
import asyncio
import pulsectl
from dataclasses import dataclass

@dataclass
class DuckConfig:
    duck_level: float = 0.15       # 15%로 줄임
    duck_duration: float = 0.3     # 0.3초에 걸쳐
    restore_delay: float = 1.0     # 완료 후 1초 대기
    restore_duration: float = 2.0  # 2초에 걸쳐 복귀

class DuckRestoreController:
    def __init__(self):
        self.pulse = pulsectl.Pulse('nexa-duck')
        self.original_volume = None
        self.is_ducked = False
        self.config = DuckConfig()

    async def duck(self):
        if self.is_ducked:
            return
        # 현재 볼륨 저장
        self.original_volume = get_sink_volume()
        self.is_ducked = True
        # 부드러운 감소
        await self._smooth_volume(
            self.original_volume,
            self.config.duck_level,
            self.config.duck_duration
        )

    async def restore(self):
        if not self.is_ducked:
            return
        # 대기 후 복귀
        await asyncio.sleep(self.config.restore_delay)
        await self._smooth_volume(
            self.config.duck_level,
            self.original_volume,
            self.config.restore_duration
        )
        self.is_ducked = False
        self.original_volume = None

    async def _smooth_volume(self, start, end, duration):
        steps = int(duration * 60)  # 60fps
        for i in range(steps + 1):
            vol = start + (end - start) * (i / steps)
            set_sink_volume(vol)
            await asyncio.sleep(duration / steps)

# 사용 예시
duck_ctrl = DuckRestoreController()

async def on_wake_word():
    await duck_ctrl.duck()

async def on_response_complete():
    await duck_ctrl.restore()
```

---

## 4. Snapcast — 저지연 멀티룸 오디오

> **목표:** 집 전체의 스피커가 완벽하게 동기화되어
> 어느 방을 이동해도 음악이 끊기지 않고 이어진다.

### 4.1 Snapcast 개요

```
지연: ~1ms 수준 동기화
방식: 서버가 오디오 스트림을 브로드캐스트
      각 방의 클라이언트가 수신·재생

서버: PC or Raspberry Pi (메인 넥슈)
클라이언트:
  각 방의 Raspberry Pi (Lite 넥슈)
  Android 앱 (Snapdroid)
  iOS 앱 (Snapcast)
  Windows/Mac 앱
```

### 4.2 서버 구성

```bash
# Snapcast 서버 설치 (Ubuntu/RPi)
sudo apt install snapserver

# /etc/snapserver.conf
[stream]
source = pipe:///tmp/snapfifo?name=nexa&sampleformat=48000:16:2&codec=flac
source = spotify:///librespot?name=Spotify&username=...&password=...
source = airplay:///shairport-sync?name=AirPlay

[server]
threads = -1

# FIFO 파이프 생성 (Python → Snapcast)
mkfifo /tmp/snapfifo
```

### 4.3 Python → Snapcast 스트리밍

```python
import subprocess
import sounddevice as sd
import numpy as np

class SnapcastStreamer:
    def __init__(self, fifo_path='/tmp/snapfifo'):
        self.fifo_path = fifo_path
        self.sample_rate = 48000
        self.channels = 2
        self.fifo = None

    def start(self):
        self.fifo = open(self.fifo_path, 'wb')

    def write_audio(self, audio_data: np.ndarray):
        # float32 → int16 변환
        pcm = (audio_data * 32767).astype(np.int16)
        self.fifo.write(pcm.tobytes())
        self.fifo.flush()

    def stop(self):
        if self.fifo:
            self.fifo.close()
```

### 4.4 클라이언트 구성 (각 방 RPi)

```bash
# Snapcast 클라이언트 설치
sudo apt install snapclient

# 자동 시작
sudo systemctl enable snapclient
sudo systemctl start snapclient

# 볼륨 개별 제어 (MQTT 연동)
snapclient --host nexa-server.local --volume 80
```

### 4.5 방별 볼륨 개별 제어

```python
import requests

class SnapcastController:
    def __init__(self, server='localhost', port=1705):
        self.base = f'http://{server}:{port}/jsonrpc'

    def get_clients(self):
        resp = requests.post(self.base, json={
            'id': 1, 'jsonrpc': '2.0',
            'method': 'Server.GetStatus'
        })
        return resp.json()['result']['server']['groups']

    def set_client_volume(self, client_id: str, volume: int):
        requests.post(self.base, json={
            'id': 1, 'jsonrpc': '2.0',
            'method': 'Client.SetVolume',
            'params': {
                'id': client_id,
                'volume': {'percent': volume, 'muted': False}
            }
        })

    def duck_room(self, room_name: str, level: int = 15):
        clients = self.get_clients()
        for group in clients:
            for client in group['clients']:
                if room_name in client.get('config', {}).get('name', ''):
                    self.set_client_volume(client['id'], level)
```

---

## 5. 공간 오디오 재구성

### 5.1 EasyEffects (Linux) — 룸 EQ·공간 보정

```
기능:
  파라메트릭 EQ (31밴드)
  컴프레서 · 리미터
  Convolution Reverb (공간 임펄스 응답)
  Bass Enhancer
  스테레오 확장

NEXA 연동:
  공간별 EQ 프리셋 저장
  → 거실 프리셋 · 침실 프리셋 · 서재 프리셋
  → 방 이동 감지 시 자동 전환
```

### 5.2 Convolution Reverb — 공간 음향 특성 적용

```
개념:
  실제 공간의 임펄스 응답(IR) 측정
  → 모든 음악에 그 공간감 적용

측정 방법:
  스피커에서 스윕 사인파 재생
  마이크로 녹음
  impulse response 추출
  → 이후 모든 음원에 컨볼루션 적용

활용:
  작은 스피커에 큰 홀 음향 부여
  방 크기에 맞는 자연스러운 잔향
```

### 5.3 멀티채널 구성

| 구성        | 채널          | 활용             |
| ----------- | ------------- | ---------------- |
| 스테레오    | 2.0           | 기본 · 넥슈 내장 |
| 2.1         | 서브우퍼 포함 | 거실 메인 시스템 |
| 5.1         | 홈시어터      | HDMI ARC 연동    |
| Dolby Atmos | 7.1.4         | 고급 공간 오디오 |
| 멀티룸      | N×2.0         | Snapcast 분산    |

---

## 6. 오디오 분석 — BPM · 주파수 · 감정

### 6.1 실시간 오디오 분석 파이프라인

```python
import numpy as np
import librosa
import sounddevice as sd
from scipy import signal

class AudioAnalyzer:
    def __init__(self, sample_rate=44100, block_size=2048):
        self.sr = sample_rate
        self.block_size = block_size
        self.buffer = np.zeros(block_size * 4)

    def analyze(self, audio_block: np.ndarray) -> dict:
        # 버퍼 업데이트
        self.buffer = np.roll(self.buffer, -len(audio_block))
        self.buffer[-len(audio_block):] = audio_block[:,0]

        # 주파수 분석 (FFT)
        fft = np.abs(np.fft.rfft(self.buffer))
        freqs = np.fft.rfftfreq(len(self.buffer), 1/self.sr)

        # 주파수 대역별 에너지
        bass    = self._band_energy(fft, freqs, 20, 250)
        mid     = self._band_energy(fft, freqs, 250, 4000)
        treble  = self._band_energy(fft, freqs, 4000, 20000)

        # RMS 볼륨
        rms = np.sqrt(np.mean(self.buffer**2))

        # 스펙트럼 무게중심 (밝기 지표)
        centroid = np.sum(freqs * fft) / (np.sum(fft) + 1e-8)

        return {
            'rms':      float(rms),
            'bass':     float(bass),
            'mid':      float(mid),
            'treble':   float(treble),
            'centroid': float(centroid),
            'is_silent': rms < 0.01,
        }

    def _band_energy(self, fft, freqs, low, high):
        mask = (freqs >= low) & (freqs <= high)
        return np.mean(fft[mask]) if mask.any() else 0.0
```

### 6.2 BPM 감지

```python
class BPMDetector:
    def __init__(self, sample_rate=44100):
        self.sr = sample_rate
        self.onset_history = []
        self.bpm = 0

    def detect(self, audio_buffer: np.ndarray) -> float:
        # onset 감지
        onset_frames = librosa.onset.onset_detect(
            y=audio_buffer, sr=self.sr,
            units='time', backtrack=True
        )

        if len(onset_frames) >= 4:
            # 박자 간격으로 BPM 추정
            intervals = np.diff(onset_frames)
            median_interval = np.median(intervals)
            if median_interval > 0:
                self.bpm = 60.0 / median_interval

        return self.bpm
```

### 6.3 오디오 감정 분류

```python
class AudioMoodClassifier:
    """
    주파수·BPM·다이나믹스로 음악 분위기 분류
    → 조명·넥슈 Lumina 색온도 자동 설정
    """
    def classify(self, analysis: dict, bpm: float) -> dict:
        bass    = analysis['bass']
        treble  = analysis['treble']
        rms     = analysis['rms']

        # 분위기 판단
        if bpm > 120 and rms > 0.3:
            mood = 'energetic'
            lumina_color = 'warm_white'   # 활발
            lumina_brightness = 0.9
        elif bpm < 80 and bass > treble:
            mood = 'calm'
            lumina_color = 'soft_gold'    # 편안
            lumina_brightness = 0.5
        elif treble > bass and bpm > 100:
            mood = 'bright'
            lumina_color = 'cool_white'   # 집중
            lumina_brightness = 0.7
        elif bpm < 70 and rms < 0.15:
            mood = 'melancholic'
            lumina_color = 'dim_blue'     # 감성
            lumina_brightness = 0.3
        else:
            mood = 'neutral'
            lumina_color = 'warm_white'
            lumina_brightness = 0.6

        return {
            'mood': mood,
            'lumina_color': lumina_color,
            'lumina_brightness': lumina_brightness,
            'bpm': bpm,
        }
```

---

## 7. 조명 연동 — Lumina 오디오 싱크

### 7.1 넥슈 Lumina ↔ 오디오 매핑

| 오디오 신호     | Lumina 반응    | 설명                         |
| --------------- | -------------- | ---------------------------- |
| 볼륨 크기 (RMS) | 밝기 비례      | 조용할수록 희미, 클수록 밝게 |
| 저음 (Bass)     | 황금·주황 비율 | 따뜻함                       |
| 고음 (Treble)   | 청백 비율      | 차가움·집중                  |
| BPM             | 맥동 속도      | 빠른 음악 → 빠른 Jitter      |
| 무음            | 희미한 맥동    | 배경 존재 표시               |
| Duck 구간       | 색온도 → 청백  | 음성 모드                    |
| TTS 재생        | 황금 밝음      | 넥슈 말하는 중               |

### 7.2 WS2812B LED 제어 (MQTT 연동)

```python
import mqtt
import json
import colorsys

class LuminaAudioSync:
    def __init__(self, mqtt_client):
        self.mqtt = mqtt_client
        self.smoothing = 0.3  # 부드러운 전환 계수

    def update(self, analysis: dict, mood: dict):
        # RMS → 밝기
        brightness = min(1.0, analysis['rms'] * 3.0)
        brightness = self._smooth(brightness)

        # 주파수 → 색조
        bass_ratio   = analysis['bass'] / (analysis['bass'] + analysis['treble'] + 0.001)
        treble_ratio = 1 - bass_ratio

        # 황금(저음) ↔ 청백(고음) 블렌딩
        hue = 0.12 * bass_ratio + 0.58 * treble_ratio  # 황금~청백
        r, g, b = colorsys.hsv_to_rgb(hue, 0.7, brightness)

        # MQTT 발행
        self.mqtt.publish(
            f'nexa/u/{USER_ID}/nexu/lumina/audio',
            json.dumps({
                'r': int(r * 255),
                'g': int(g * 255),
                'b': int(b * 255),
                'brightness': brightness,
                'mood': mood['mood'],
                'bpm': mood['bpm'],
            })
        )

    def _smooth(self, value):
        if not hasattr(self, '_prev'):
            self._prev = value
        self._prev = self._prev * (1 - self.smoothing) + value * self.smoothing
        return self._prev
```

### 7.3 Ambilight 효과 (LCD 앰비언트)

```python
class AmbilightController:
    """
    LCD 화면 또는 음악 색상을 주변 LED로 확장
    음악 장르별 앰비언트 컬러 자동 설정
    """
    GENRE_COLORS = {
        'classical':   (255, 220, 160),  # 따뜻한 황금
        'jazz':        (180, 140, 100),  # 앰버
        'electronic':  (100, 180, 255),  # 차가운 청색
        'rock':        (255, 80, 60),    # 붉은 에너지
        'ambient':     (160, 200, 220),  # 은빛 청색
        'hiphop':      (200, 100, 255),  # 보라
        'acoustic':    (255, 200, 120),  # 따뜻한 황금
        'sleep':       (50, 30, 10),     # 극소 앰버
    }

    def get_ambient_color(self, genre: str, brightness: float):
        base = self.GENRE_COLORS.get(genre, (255, 220, 160))
        return tuple(int(c * brightness) for c in base)
```

---

## 8. 상황별 오디오 시나리오

### 8.1 기상 루틴

```
[침실 기상 감지 (LD2410C)]
          ↓
볼륨 0% 에서 시작
  → 30초에 걸쳐 천천히 상승 (20%)
  → 수면 유도 음악 → 기상 음악 크로스페이드
  → 2분 후 적정 볼륨 (60%)

조명 연동:
  커튼 열림 속도 = 볼륨 상승 속도
  자연광 밝기에 따라 목표 볼륨 조정
  (밝은 날 → 더 활기찬 음악·밝은 조명)

넥슈 TTS:
  볼륨 60% 도달 후
  "좋은 아침이에요. 오늘 서울 맑고 오전 10시 회의 있어요"
  → Duck → 브리핑 → Restore
```

### 8.2 음성 명령 중

```
[음악 재생 중 - 볼륨 75%]
          ↓
마이크: "넥슈야, 20분 후에 알려줘"
          ↓
Wake word 감지
  → Duck: 0.3초에 75% → 15%
          ↓
음성 인식 + 처리
  → TTS: "20분 후에 알려드릴게요"
          ↓
Restore: 1초 대기 → 2초에 15% → 75%
          ↓
음악 자연스럽게 복귀
```

### 8.3 취침 유도

```
[수면 모드 시작 - 사용자 설정 or 자동 감지]
          ↓
현재 음악 → 수면 유도 음악 크로스페이드 (2분)
조명: 서서히 감소 (10분에 걸쳐)
볼륨: 서서히 감소 (10분에 걸쳐)
          ↓
침실 LD2410C: 호흡 안정 · 움직임 없음 감지
  → 수면 진입 판단
          ↓
볼륨: 1분에 걸쳐 0%
조명: 완전 소등
넥슈: Deep Sleep 전환
```

### 8.4 귀가 감지

```
[현관 LD2450 귀가 감지]
          ↓
외출 중 정지된 음악 재생 재개
  (마지막 재생 상태 복원)
볼륨: 0에서 서서히 상승
조명: 현관부터 순차 점등

넥슈 TTS (선택):
  "어서오세요. 오늘 기온 많이 떨어졌어요"
  → Duck → 인사 → Restore
```

### 8.5 우주 이벤트 연동

```
[태양풍 Kp≥5 감지]
          ↓
음악 볼륨: 3초에 걸쳐 20% 감소 (페이드)
넥슈 Lumina: 황금 → 보라 전환
          ↓
넥슈 TTS:
  "태양풍이 감지됐어요. 8분 후 도달 예정이에요"
          ↓
Restore: 볼륨 복귀
Lumina: 보라 맥동 유지 (우주 감지 상태)
```

### 8.6 집중 모드 (서재)

```
[서재 LD2410C 장시간 정지 감지]
          ↓
음악 장르 → 집중 음악 자동 전환
  (Ambient · Lo-fi · 클래식)
볼륨: 적정 집중 볼륨 (40%)
조명: 청백 차가운 색온도

방해금지 연동:
  알림 억제
  Duck 빈도 최소화 (꼭 필요한 것만)

이석 감지 시:
  볼륨 서서히 감소
  조명 자동 조절
```

---

## 9. MQTT 토픽 설계

### 9.1 오디오 상태 발행

| 토픽                                 | 발행 주체           | 내용                         |
| ------------------------------------ | ------------------- | ---------------------------- |
| `nexa/u/{uid}/audio/status`          | Python 파이프라인   | 재생 상태 · 볼륨 · 현재 트랙 |
| `nexa/u/{uid}/audio/analysis`        | Python 파이프라인   | BPM · 주파수 · RMS · 무드    |
| `nexa/u/{uid}/audio/duck`            | 넥슈 오케스트레이터 | Duck 시작·종료 이벤트        |
| `nexa/u/{uid}/nexu/lumina/audio`     | Python 파이프라인   | Lumina 색상·밝기             |
| `nexa/u/{uid}/audio/snapcast/{room}` | Snapcast 컨트롤러   | 방별 볼륨·음소거             |

### 9.2 오디오 명령 구독

| 토픽                                         | 구독 주체         | 명령                           |
| -------------------------------------------- | ----------------- | ------------------------------ |
| `nexa/u/{uid}/audio/command`                 | Python 파이프라인 | play·pause·volume·duck·restore |
| `nexa/u/{uid}/audio/scene`                   | Python 파이프라인 | morning·sleep·focus·party·away |
| `nexa/u/{uid}/audio/snapcast/{room}/command` | Snapcast 컨트롤러 | 방별 볼륨·소스 변경            |

### 9.3 페이로드 예시 — 오디오 분석

```json
{
  "cap": "nexa.usr001.home.audio.analysis.v1",
  "where": "SELF",
  "when": "MOMENT",
  "who": "TICK",
  "what": "FACT",
  "how": "FLOW",
  "bpm": 98.5,
  "rms": 0.42,
  "bass": 0.65,
  "mid": 0.48,
  "treble": 0.31,
  "mood": "calm",
  "lumina_color": "soft_gold",
  "is_silent": false,
  "ts": 1711234567890
}
```

---

## 10. HEXAGON 연결

| 오디오 이벤트      | Where  | When     | Who  | What | How   |
| ------------------ | ------ | -------- | ---- | ---- | ----- |
| 음악 재생 중       | SELF   | DURATION | TICK | FACT | FLOW  |
| Wake word 감지     | SELF   | MOMENT   | ASK  | RULE | FLOW  |
| Duck 실행          | SELF   | MOMENT   | WILL | RULE | FLOW  |
| Restore 완료       | SELF   | MOMENT   | TICK | FACT | FLOW  |
| 취침 유도 시작     | FIELD  | DURATION | WILL | RULE | FLOW  |
| 우주 이벤트 오디오 | DOMAIN | MOMENT   | ECHO | LINK | FLOW  |
| 볼륨 이상 감지     | SELF   | MOMENT   | TICK | FACT | STUCK |

---

## 11. Python 파이프라인 구현

### 11.1 전체 파이프라인 구조

```python
import asyncio
import sounddevice as sd
import numpy as np
import paho.mqtt.client as mqtt_client

class NexaAudioPipeline:
    def __init__(self, config: dict):
        self.sr = config.get('sample_rate', 44100)
        self.block = config.get('block_size', 2048)
        self.user_id = config['user_id']

        self.analyzer   = AudioAnalyzer(self.sr, self.block)
        self.bpm_det    = BPMDetector(self.sr)
        self.mood_cls   = AudioMoodClassifier()
        self.duck_ctrl  = DuckRestoreController()
        self.lumina     = LuminaAudioSync(self._mqtt)
        self.snapcast   = SnapcastController()

        self._mqtt = mqtt_client.Client()
        self._setup_mqtt()

    def _setup_mqtt(self):
        self._mqtt.connect('localhost', 1883)
        self._mqtt.subscribe(
            f'nexa/u/{self.user_id}/audio/command'
        )
        self._mqtt.on_message = self._on_command

    def _on_command(self, client, userdata, msg):
        import json
        cmd = json.loads(msg.payload)
        action = cmd.get('action')

        if action == 'duck':
            asyncio.create_task(self.duck_ctrl.duck())
        elif action == 'restore':
            asyncio.create_task(self.duck_ctrl.restore())
        elif action == 'volume':
            set_sink_volume(cmd.get('level', 0.5))
        elif action == 'scene':
            asyncio.create_task(
                self._apply_scene(cmd.get('scene'))
            )

    async def _apply_scene(self, scene: str):
        scenes = {
            'morning': {'vol': 0.6, 'fade': 30},
            'sleep':   {'vol': 0.0, 'fade': 600},
            'focus':   {'vol': 0.4, 'fade': 5},
            'away':    {'vol': 0.0, 'fade': 10},
        }
        if scene in scenes:
            s = scenes[scene]
            target = s['vol']
            current = get_sink_volume()
            await self.duck_ctrl._smooth_volume(
                current, target, s['fade']
            )

    def audio_callback(self, indata, frames, time, status):
        # 실시간 오디오 분석
        analysis = self.analyzer.analyze(indata)
        bpm      = self.bpm_det.detect(indata[:,0])
        mood     = self.mood_cls.classify(analysis, bpm)

        # Lumina 업데이트
        self.lumina.update(analysis, mood)

        # MQTT 발행 (100ms마다)
        if hasattr(self, '_pub_counter'):
            self._pub_counter += 1
        else:
            self._pub_counter = 0

        if self._pub_counter % 5 == 0:
            import json
            self._mqtt.publish(
                f'nexa/u/{self.user_id}/audio/analysis',
                json.dumps({**analysis, **mood, 'ts': int(time.currentTime * 1000)})
            )

    def start(self):
        self._mqtt.loop_start()
        with sd.InputStream(
            samplerate=self.sr,
            blocksize=self.block,
            channels=2,
            callback=self.audio_callback
        ):
            print('NEXA Audio Pipeline 시작')
            asyncio.get_event_loop().run_forever()
```

### 11.2 실행

```bash
# 의존성 설치
pip install sounddevice numpy librosa pulsectl \
            paho-mqtt scipy colorsys

# 파이프라인 실행
python nexa_audio.py --user-id usr001 --sample-rate 44100
```

---

## 12. 하드웨어 구성

### 12.1 등급별 오디오 하드웨어

| 등급         | 앰프                 | 스피커        | 마이크          | 특징              |
| ------------ | -------------------- | ------------- | --------------- | ----------------- |
| **Lite**     | MAX98357A (I2S)      | 3W 패시브     | INMP441         | 넥슈 내장 · 소형  |
| **Standard** | HiFiBerry AMP2       | 20W×2 패시브  | ReSpeaker 2-Mic | RPi HAT · 고음질  |
| **Pro**      | WiFi 앰프 (Snapcast) | 기존 홈오디오 | ReSpeaker 4-Mic | 멀티룸 · 최고음질 |

### 12.2 WiFi 앰프 옵션 (Snapcast 클라이언트 내장)

| 제품                        | 출력     | 특징                            |
| --------------------------- | -------- | ------------------------------- |
| **Raspberry Pi + 앰프 HAT** | 20~60W   | 완전 제어 가능 · NEXA 통합 최적 |
| **Arylic Up2Stream**        | 50W×2    | WiFi 내장 · Snapcast 지원       |
| **Volumio 기반 DAC**        | DAC 출력 | 고음질 · 기존 앰프 연결         |

### 12.3 무선 저지연 음원 소스 전송

```
유선 대비 WiFi 오디오 지연:
  Bluetooth A2DP:  ~150~200ms (동기화 어려움)
  AirPlay 2:       ~2초 (멀티룸 동기화)
  Snapcast:        ~1ms (최저 지연 · 권장)
  DLNA/UPnP:       ~200~500ms

결론:
  Snapcast가 NEXA 멀티룸에 최적
  구형 스피커 연동 시 Arylic 브릿지 활용
```

---

## 13. 미해결 과제

| 우선순위 | 과제                             | 내용                                                          |
| -------- | -------------------------------- | ------------------------------------------------------------- |
| 🔴 높음  | Wake word 엔진 선택              | Porcupine vs openWakeWord vs Picovoice — "넥슈야" 커스텀 학습 |
| 🔴 높음  | Duck 타이밍 최적화               | 너무 빠르면 부자연스럽고 느리면 음성 잘림 — 실측 필요         |
| 🟡 중간  | 음악 장르 자동 분류              | BPM·주파수만으로 정확도 한계 — 경량 ML 모델 도입 검토         |
| 🟡 중간  | iOS AirPlay + Snapcast 동기화    | iPhone에서 재생 시 Snapcast와 동기화 방법                     |
| 🟡 중간  | Dolby Atmos 파이프라인           | Linux에서 Atmos 처리 방법 (현재 Windows 전용)                 |
| 🟡 중간  | 구형 스마트폰 오디오 출력        | Snapcast Android 앱 연동 · 지연 최적화                        |
| 🟢 낮음  | 임펄스 응답 측정 자동화          | 공간 음향 특성 자동 측정·적용 파이프라인                      |
| 🟢 낮음  | 음악 감정 → ES 연동              | 재생 음악이 사용자 ES에 영향 주는 방향성 연구                 |
| 🟢 낮음  | 공간 이동 감지 + 오디오 핸드오프 | 방 이동 시 음악이 자연스럽게 따라오는 것                      |

---

_NEXA Platform · Audio System Design v0.1 · 내부 설계 문서_
_최종 업데이트: 2026년 3월_
_관련 문서: NEXU VISION 넥슈는 무엇이가 v0.2.md · NEXA_NEXU_Hardware_v0.1.md · NEXA_MQTT_Infrastructure_v0.4.md_
