---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-06-12
updated: 2026-06-13
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# AI 모델 현황과 적용 시나리오

## AI 모델 처리 능력별 비교 테이블 (낮은 수준 ➡️ 높은 수준 순)

| 처리 능력 수준               | 긱 (Geek) 용어                              | 처리 가능 데이터 형식               | 대표적인 모델                           | 올라마 (Ollama) 호환 모델명                                                        |
| ---------------------- | ---------------------------------------- | -------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| Level 1  <br>글만 읽는 AI  | LLM  <br>(Large Language Model)          | 텍스트 (글자, 소스 코드)            | GPT-3.5, Llama 3                  | `ollama run llama3.1`  <br>`ollama run qwen3`                              |
| Level 2  <br>눈이 달린 AI  | VLM  <br>(Vision-Language Model)         | 텍스트 + 이미지 (사진, 도표)         | LLaVA, Qwen2.5-VL                 | `ollama run llava`  <br>`ollama run qwen3-vl`                              |
| Level 3  <br>흐름을 보는 AI | VLM (Video 확장형)  <br>또는 경량 LMM           | 텍스트 + 이미지 + 비디오 (영상)       | Gemini 1.5 Flash, Gemma 3         | `ollama run gemma4`  <br>`ollama run llama3.2-vision`                      |
| Level 4  <br>모든 감각 통합  | LMM / Omni  <br>(Large Multimodal Model) | 텍스트 + 이미지 + 비디오 + 오디오 (소리) | GPT-4o, Gemini 2.0 Pro, MiniCPM-o | `ollama run openbmb/minicpm-o2.6:8b`  <br>`ollama run nemotron3` (Omni 버전) |

---

## 실무 적용을 위한 Ollama 특화 모델 분류 가이드

| 특화 영역 분류                      | 긱 (Geek) 용어 / 기술                          | 권장 Ollama 모델명                                           | 최소 VRAM / 용량                                      | 핵심 강점 및 실무 적용 시나리오 (Use Case)                                                                                                                                 |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 임베딩 & RAG  <br>(정보 검색 특화)  | Dense & Hybrid  <br>Retrieval             | `qwen3-embedding`  <br>`bge-m3`  <br>`nomic-embed-text` | Qwen3: 5GB (8B)  <br>BGE: 600MB  <br>Nomic: 280MB | * Qwen3: 2026 년 기준 다국어 MTEB 벤치마크 최상위. 대형 사내 문서 검색.  <br>* BGE-M3: 키워드 (Sparse) + 의미 (Dense) 복합 검색 엔진 구축.  <br>* Nomic: 8K 긴 문맥 지원, CPU 전용 저사양 서버용.            |
| 2. 오디오 & 옴니  <br>(소리/멀티모달)    | Speech-to-Text  <br>& Native Omni         | `openbmb/minicpm-o2.6:8b`  <br>`karanchopda333/whisper` | MiniCPM: 5.5GB  <br>Whisper: 1.5GB~               | * MiniCPM-o: 모바일 기기 급에서도 구동되는 실시간 음성/영상 네이티브 융합 모델. 실시간 안내 키오스크 개발.  <br>* Whisper: 로컬 음성 회의록 작성 및 오디오 스크립트 추출.                                               |
| 3. 소형 기기 사용성  <br>(온디바이스/경량)  | On-Device SLM  <br>(Small Language Model) | `gemma4:2b`  <br>`llama3.2:1b`  <br>`qwen3:1.5b`        | Gemma: 1.6GB  <br>Llama: 1.3GB  <br>Qwen: 1.2GB   | * 노트북, 싱글보드 컴퓨터 (라즈베리파이 등), 스마트폰 앱 연동용.  <br>* 네트워크가 단절된 공장, 현장 단말기에서 실시간 로그 분석 및 간단한 고객 응대 챗봇 구현. 크기 대비 성능 최적화.                                              |
| 4. 코드 생성 & 에이전트  <br>(개발 자동화) | Coding Agent  <br>& Function Calling      | `qwen3-coder-next`  <br>`llama3.1:8b`                   | Qwen Coder: 5GB  <br>Llama: 5GB                   | * Qwen Coder: IDE(VS Code 등) 와 연동하여 로컬 전용 GitHub Copilot 대체재 구축. 보안이 중요한 기업 소스코드 개발 지원.  <br>* Llama 3.1: API 함수 호출 (Function Calling) 기반의 자동화 에이전트 워크플로우 제어. |

---

## 음성 인식 (STT) 및 음성 합성 (TTS) 하드웨어별 최적 모델 비교

| 분류                            | 하드웨어 구현 방식                     | 추천 최적 모델                                   | 데이터 처리 형태 / 특징                                       | 주요 실무 적용 유스케이스 (Use Case)                   |
| ----------------------------- | ------------------------------ | ------------------------------------------ | ---------------------------------------------------- | ------------------------------------------- |
| 사운드 ➡️ 텍스트  <br>(STT / 음성 명령) | 1. ESP32 자체 구동  <br>(인터넷 독립형)  | Espressif WakeNet  <br>/ MultiNet          | 초경량 임베디드 단어 인식 모델.  <br>미리 지정한 3~5 개 키워드 실시간 탐지.      | 사내 보안망 스마트 스위치,  <br>" 불 켜줘 ", " 에어컨 꺼줘 " 가전 제어 |
|                               | 2. ESP32 + 외부 서버  <br>(하이브리드형) | Groq Whisper API  <br>/ Distil-Whisper     | ESP32 가 마이크로 녹음한 음성을  <br>Wi-Fi 로 전달하여 고속 서버에서 받아쓰기.   | 회의실 로컬 음성 기록기,  <br>자연어 명령을 알아듣는 고성능 비서     |
|                               | 3. 메인 PC / 서버  <br>(로컬 단독형)    | OpenAI Whisper  <br>(Large-v3 / Turbo) [1] | 전 세계 표준 수준의 최고 정확도 모델.  <br>다국어, 사투리, 잡음 섞인 오디오 판독.  | 대규모 실시간 자막 생성,  <br>고정형 키오스크 음성 엔진          |
| 텍스트 ➡️ 사운드  <br>(TTS / 소리 출력) | 1. ESP32 자체 구동  <br>(인터넷 독립형)  | eSpeak NG  <br>/ Flite                     | AI 기반이 아닌 전통적 수식 기반 합성.  <br>하드웨어 부담은 거의 없으나 로봇 기계음. | 네트워크 단절된 스마트 팩토리 경고음,  <br>간단한 가이드 장비 음성 안내 |
|                               | 2. ESP32 + 외부 서버  <br>(하이브리드형) | OpenAI Realtime API  <br>/ Meta Wit.ai     | 서버에서 실시간 스트리밍으로 변환된  <br>오디오 파형 (PCM) 을 ESP32 가 받아 재생.  | 스마트 스피커 시제품 개발,  <br>사람처럼 대화하는 초소형 감성 인형    |
|                               | 3. 메인 PC / 서버  <br>(로컬 단독형)    | Kokoro-82M  <br>/ CosyVoice 2              | 단 82M 크기로 상용 솔루션급 고음질 출력.  <br>다양한 화자와 자연스러운 억양 구현.  | 로컬 가상 비서 시스템 목소리,  <br>사내 문서 오디오북 자동 변환     |

---

## 🛠️ 하이브리드 (ESP32 + 서버) 아키텍처 구현 가이드

ESP32(특히 음성 하드웨어 가속이 가능한 ESP32-S3 칩 권장) 로 상용 수준의 대화형 인형이나 가전비서를 만들 때는 위 테이블의 2 번 (하이브리드형) 조합을 다음과 같은 흐름으로 엮는 것이 정석입니다.

```text
[ESP32-S3 + INMP441 마이크] ➡️ (음성 녹음 후 Wi-Fi 전송)
  ⬇️
[외부 PC/클라우드 서버]
  1. Distil-Whisper (듣기: 음성을 텍스트로 변환)
  2. Ollama Llama 3.2 / Gemma 4 (생각: 텍스트 읽고 답변 생성)
  3. Kokoro-82M (말하기: 답변을 자연스러운 음성 파일로 생성)
  ⬇️
[ESP32-S3 + I2S 오디오 앰프(MAX98357) + 스피커] ⬅️ (서버에서 오디오 다운로드 후 스트리밍 재생)
```

이 흐름으로 시스템을 구성하면 배터리로 구동되는 초소형 ESP32 칩에서도 지연 속도 1 초 미만의 놀랍도록 자연스러운 AI 대화 장치를 빌드할 수 있습니다.

하이브리드 구성을 위해 ESP32 에서 Wi-Fi 로 오디오 데이터를 보내는 아두이노 C++ 코드나, 서버 측의 음성 - 텍스트 파이프라인 연동 파이썬 스크립트 중 어떤 것이 필요하신가요? 구현하고 싶으신 단계의 스펙을 말씀해 주시면 구체적인 코드로 구현해 드리겠습니다!
