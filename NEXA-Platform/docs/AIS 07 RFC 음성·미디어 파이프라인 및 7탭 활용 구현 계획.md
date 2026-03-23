# [NEXA-AI-07] Ollama Whisper 모델 채팅 연동 구현 계획

**목표**: Ollama에 설치된 Whisper 모델(큰 것/작은 것)을 AI 채팅에서 음성 입력(STT)으로 사용할 수 있도록 연동한다.

**작성일**: 2025-03-05

---

## 0. 구현 전 필수 체크 사항

### 0.1 Vercel AI SDK와의 관계

- **현재 사용**: 채팅·타이틀 생성은 **Vercel AI SDK** (`ai`, `ollama-ai-provider-v2`)의 `generateText` / `streamText` + `ollama(model)` 로만 동작한다. 입력은 **텍스트 + 이미지(멀티모달)** 만 SDK로 전달된다.
- **STT(음성→텍스트)**: Vercel AI SDK에는 **음성 입력·transcribe API가 없음**. Speech-to-Text는 SDK 범위 밖이므로 **별도 백엔드 엔드포인트(`/ai/transcribe`)로 구현**하고, 클라이언트는 “마이크 → 오디오 → transcribe API → 텍스트”만 받아서 기존 채팅 입력란/메시지로 넣어 주면 된다.
- **필수 확인 사항**:
  - [ ] **채팅 응답**: 기존처럼 AI SDK `generateText` / `streamText`만 사용. Whisper 연동은 “입력 전처리(오디오→텍스트)”에만 쓰이므로 **SDK 변경 불필요**.
  - [ ] **입력 경로**: 마이크/파일 → transcribe API(Whisper) → 텍스트 → 기존 `sendMessage()` 플로우에 텍스트만 주입. **SDK에는 텍스트/이미지 메시지만 전달**하므로 SDK 호환성 유지.
  - [ ] **Provider**: Ollama provider는 **채팅용 모델**에만 사용. Whisper는 **Ollama의 transcribe API 또는 별도 Whisper 서비스**로 호출하므로, provider 확장 여부는 불필요(transcribe는 HTTP 직접 호출).

정리하면, **이 기능 구현 시 Vercel AI SDK 쪽 코드 변경은 필요 없고**, transcribe 전용 라우트/서비스만 추가하면 된다.

---

## 1. 현재 AI 도메인 구조 요약

### 1.1 디렉터리 및 역할

| 구분       | 경로                        | 역할                                            |
| ---------- | --------------------------- | ----------------------------------------------- |
| **프론트** | `src/domains/ai/`           | AI 도메인 페이지, 채팅·에디터·미디어·탐색기 등  |
| **백엔드** | `server/domains/ai/`        | Ollama 연동(모델 목록/채팅/타이틀 생성), 라우트 |
| **설정**   | `server/config/aiConfig.js` | `OLLAMA_URL` (기본 `http://192.168.0.15:11434`) |

### 1.2 Ollama 연동 현황

- **모델 목록**: `GET /api/tags` → `aiApi.listModels()` → `useAiModels.loadModels()`
- **모델 상세**: `POST /api/show` → `capabilities` 배열(completion, vision, audio) 수집 → `useAiSettings.modelCapabilities`에 저장
- **채팅**: Vercel AI SDK `generateText` / `streamText` + `ollama(model)` 사용
- **엔드포인트**: `GET /ai/models`, `POST /ai/model-show`, `POST /ai/chat`, `POST /ai/chat-stream`, `POST /ai/check`, `POST /ai/generate-title`
- **URL**: 채팅/모델 조회는 요청 시 URL을 보내지 않음 → 서버의 `OLLAMA_URL`만 사용. UI의 Ollama URL은 **연결 확인**에만 사용됨.

### 1.3 모델 타입 및 UI 반영

| capability     | 의미              | UI 반영                                         |
| -------------- | ----------------- | ----------------------------------------------- |
| **completion** | 텍스트 생성(채팅) | 채팅 아이콘, 기본 표시                          |
| **vision**     | 이미지 입력       | 채팅에서 이미지 첨부/붙여넣기 활성화            |
| **audio**      | 음성 관련         | 아이콘만 표시, **채팅에서 음성 입력 연동 없음** |

- 코딩 전용 “모델 타입”은 없음. 코드 에디터는 동일 채팅 모델로 생성한 텍스트를 삽입하는 구조.
- 사용자가 설치한 모델: 순수 대화 모델, 이미지 첨부 가능 모델, 코딩용 모델, **Whisper 큰 것/작은 것 2종**.

### 1.4 채팅 흐름 (현재)

1. **입력**: `AiChatPanel` — `q-input`(textarea) `inputText` + (vision일 때) 이미지 첨부/붙여넣기
2. **전송**: `sendMessage()` → user 메시지(텍스트 + 이미지 base64) 구성 → `aiApi.chat` / `aiApi.chatStream` 호출
3. **백엔드**: `toSdkMessages()`로 이미지 포함 user 메시지 변환 후 `streamText`/`generateText` 호출
4. **응답**: NDJSON 스트림 또는 일괄 응답으로 assistant 메시지 추가·저장

**음성→텍스트(STT) 단계는 현재 없음.**

### 1.5 Whisper / STT 현황

- 코드베이스에 **Whisper 또는 다른 STT 구현 없음**.
- `AiAudioEditorPanel`은 “준비 중” 플레이스홀더만 있으며, 오디오→텍스트 변환 로직 없음.
- 기획 문서([NEXA-AI-03], [NEXA-AI-04])에는 “미디어→텍스트(LLaVA, Whisper 등)”, “Whisper 등 음성→텍스트” 활용 방향만 명시됨.

---

## 2. 목표 시나리오

- **채팅에서 음성 입력**: 사용자가 마이크 녹음 또는 오디오 파일을 올리면, Ollama의 Whisper 모델로 STT 후 **텍스트를 채팅 입력란에 넣거나 바로 user 메시지로 전송**.
- **모델 선택 UI**: 채팅용 드롭다운에는 **Whisper 모델을 제외**하고, 대화/이미지/코딩용 모델만 노출. **마이크(음성 입력) 버튼은 모델과 무관하게 항상 표시**하여, 어떤 채팅 모델을 선택하든 음성 입력 → STT(Whisper) → 텍스트 → 선택된 채팅 모델로 전송되도록 한다.
- **선택 사항**: 오디오 패널(`AiAudioEditorPanel`)에서 “오디오 → 텍스트” 후 결과를 채팅/에디터로 전달.

---

## 3. Ollama Whisper 연동 방식 정리

- Ollama 공식 API 문서에는 **전용 `/api/transcribe` 엔드포인트가 명시되어 있지 않음**. 일부 환경에서는 커뮤니티 Modelfile 또는 별도 래퍼로 Whisper를 올려 사용하는 경우가 있음.
- **구현 시 선택지**:
  1. **Ollama에 transcribe API가 있는 경우**: 해당 URL로 `POST` (오디오 파일 또는 base64) 호출해 텍스트 수신. 백엔드에서 `transcribe(audio, options)` 래핑.
  2. **Ollama에 transcribe API가 없는 경우**: 동일 서버 또는 별도 서비스로 **Whisper 전용 HTTP API**(예: whisper.cpp 서버, Python FastAPI 등)를 두고, NEXA 백엔드는 그쪽을 호출하도록 구현. 사용자가 “Ollama에 Whisper 설치”라고 한 것은 **같은 머신에서 Whisper를 쓰겠다**는 의미로 해석 가능하므로, 같은 서버에서 Node에서 외부 Whisper 서비스를 호출하는 구조로 가도 됨.

**권장**: 먼저 사용 중인 Ollama 인스턴스에서 `POST /api/transcribe`(또는 문서화된 transcribe 경로) 존재 여부를 확인한 뒤,

- 있으면: 해당 API를 호출하는 `transcribe()` 서비스 + 라우트 추가.
- 없으면: `WHISPER_URL`(또는 `OLLAMA_WHISPER_URL`) 같은 설정을 두고, 별도 Whisper HTTP 서비스 호출로 통일.

---

## 4. 갭 분석

### 4.1 백엔드

| 갭                       | 설명                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| STT 전용 엔드포인트 없음 | `POST /ai/transcribe` (또는 유사) 미구현                           |
| Whisper 호출 로직 없음   | Ollama transcribe 또는 외부 Whisper API 호출 없음                  |
| STT 모델/URL 설정 없음   | Whisper 전용 URL 또는 모델명(예: whisper, whisper:small) 설정 없음 |

### 4.2 프론트엔드

| 갭                                    | 설명                                                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 채팅 음성 입력 UI 없음                | “음성 입력” 버튼, 녹음/파일 선택, 진행 표시 없음                                                                                                                                           |
| 녹음/파일 → 서버 → 텍스트 플로우 없음 | 오디오 blob 전송 및 결과를 `inputText`/메시지로 반영하는 코드 없음                                                                                                                         |
| STT API 클라이언트 없음               | `aiApi.transcribe()` 미구현                                                                                                                                                                |
| capabilities의 audio                  | 현재 아이콘 표시만, “이 모델이 음성을 받는다”는 채팅 동작과는 무관. Whisper는 **STT 전용**이므로 “채팅 모델”과 분리해, “음성 입력 사용 시 STT에 Whisper 사용”으로 설계하는 것이 자연스러움 |

### 4.3 설정

- 오른쪽 패널 등에서 “채팅 음성 입력 사용” 토글, “STT 모델”(Whisper 큰/작은 것 선택) 또는 “Whisper 서비스 URL” 설정이 없음.

---

## 5. 구현 계획

### 5.1 1단계: 백엔드 STT 엔드포인트

| 작업                       | 내용                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Ollama transcribe 확인** | 실제 사용 중인 Ollama에서 transcribe API 유무·스펙 확인 (경로, request/response 형식). 없으면 별도 Whisper HTTP 서비스 URL 사용 방식으로 설계 |
| **설정**                   | `server/config/aiConfig.js`에 `OLLAMA_URL` 외 `WHISPER_URL`(선택) 또는 transcribe 시 사용할 `model`(예: `whisper`, `whisper:small`) 추가 검토 |
| **ai.service.js**          | `transcribe(audioBuffer                                                                                                                       | base64, options?)`함수 추가. Ollama transcribe API 호출 또는`WHISPER_URL`로 전달. 반환: `{ text: string }` |
| **ai.routes.js**           | `POST /ai/transcribe` 추가. body: multipart(file) 또는 `{ audio: base64 }`, optional `model`, `language` 등. 응답: `{ text }`                 |
| **에러 처리**              | 서비스 불가 시 503 또는 400, 메시지로 “STT 서비스를 사용할 수 없습니다” 등 안내                                                               |

### 5.2 2단계: 모델 선택 UI 정책 (채팅용 목록에서 Whisper 제외)

| 작업                 | 내용                                                                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **채팅용 모델 목록** | `useAiModels.models` 전체가 아닌 **Whisper 제외 목록**을 채팅 패널·오른쪽 패널의 모델 선택 `q-select`에 사용. 필터 기준: 모델 이름이 `whisper` 포함 시 제외 (예: `whisper`, `whisper:small` 등).                                       |
| **구현 위치**        | `useAiModels`에서 `chatModels`(또는 `modelsForChat`) computed/getter 제공, 또는 `AiChatPanel`/`AiRightPanel`에서 `models`를 필터링한 `chatModelOptions` 사용. 기본 선택값이 Whisper였을 경우, 필터 후 첫 번째 채팅용 모델로 자동 보정. |
| **Whisper 모델**     | STT 전용이므로 “채팅 모델 선택” 드롭다운에는 노출하지 않음. STT 모델 선택은 설정(오른쪽 패널 등)에서 “STT 모델: whisper / whisper:small” 따로 두는 방식 권장.                                                                          |

### 5.3 3단계: 프론트 API 및 채팅 연동 (마이크 아이콘 공통)

| 작업                | 내용                                                                                                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **aiApi.ts**        | `transcribe(audioBlob: Blob, options?: { model?: string }) => Promise<{ text: string }>` 추가. `FormData` 또는 base64로 전송, `POST /ai/transcribe` 호출                                                                            |
| **AiChatPanel.vue** | 입력 영역 append에 **마이크 아이콘 버튼** 추가. **모델 선택과 무관하게 항상 표시** (어떤 채팅 모델이든 음성 입력 사용 가능). 클릭 시: (1) 녹음 시작(MediaRecorder) 또는 (2) 오디오 파일 선택. 녹음 중이면 다시 클릭 시 중지 후 전송 |
| **AiChatPanel.vue** | 녹음/파일 → `aiApi.transcribe(blob)` 호출 → 성공 시 반환 `text`를 `inputText`에 넣거나, 옵션에 따라 “바로 전송” 시 user 메시지로 추가 후 `sendMessage()`와 동일한 플로우로 전송                                                     |
| **진행/에러 UI**    | 로딩 스피너, “녹음 중…”, “변환 중…”, 실패 시 Notify 메시지                                                                                                                                                                          |

### 5.4 4단계: 설정 및 STT 모델 선택(선택)

| 작업                             | 내용                                                                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **useAiSettings / AiRightPanel** | “채팅 음성 입력 사용” 토글, **STT 전용 모델**(Whisper 큰/작은 것) 선택. transcribe 요청 시 해당 model 전달. 채팅 모델 선택과 별도. |
| **STT 모델 목록**                | 전체 모델 중 이름에 `whisper` 포함된 것만 STT용 드롭다운에 노출하거나, 고정 옵션 `whisper` / `whisper:small` 중 선택.              |

### 5.5 5단계: 오디오 패널 연동(선택)

| 작업                   | 내용                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **AiAudioEditorPanel** | “텍스트로 변환” 버튼 추가. 현재 열린 오디오 파일/블롭으로 `aiApi.transcribe()` 호출 후 결과를 클립보드 복사 또는 채팅 입력란/에디터로 전달 |

---

## 6. 파일 변경 목록 (예상)

| 파일                                               | 변경 내용                                                                                                                                          |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/config/aiConfig.js`                        | (선택) `WHISPER_URL` 또는 STT용 model 기본값                                                                                                       |
| `server/domains/ai/ai.service.js`                  | `transcribe()` 추가, Ollama 또는 외부 Whisper 호출                                                                                                 |
| `server/domains/ai/ai.routes.js`                   | `POST /ai/transcribe` 라우트 추가                                                                                                                  |
| `src/domains/ai/composables/useAiModels.ts`        | **채팅용 모델 목록**: Whisper 제외한 `chatModels`(또는 getter) 제공. 기본 선택이 Whisper일 때 첫 번째 채팅용 모델로 보정                           |
| `src/domains/ai/services/aiApi.ts`                 | `transcribe()` 메서드 추가                                                                                                                         |
| `src/domains/ai/components/AiChatPanel.vue`        | **모델 선택**: `models` 대신 `chatModels`(Whisper 제외) 사용. **마이크 버튼**: 모델 무관 항상 표시, 녹음/파일 → transcribe → 입력란 또는 바로 전송 |
| `src/domains/ai/views/right/AiRightPanel.vue`      | **모델 선택**: 채팅용 목록(Whisper 제외) 사용. (선택) STT 모델 설정 UI                                                                             |
| `src/domains/ai/composables/useAiSettings.ts`      | (선택) STT 사용 여부, STT 모델명 저장                                                                                                              |
| `src/domains/ai/components/AiAudioEditorPanel.vue` | (5단계) “텍스트로 변환” + transcribe 연동. (장기) **Wavesurfer.js**로 파형 시각화·구간 선택·트림 UI                                                                 |
| `src/domains/ai/components/AiExplorerPanel.vue`    | (장기) FFmpeg·AI 생성 JSON 뷰 패널, 데이터 추가·생성 액션 버튼(메타 추출/STT/요약/썸네일/복합 파이프라인)                                          |

---

## 7. 기술 참고 사항

- **브라우저 녹음**: `navigator.mediaDevices.getUserMedia({ audio: true })` + `MediaRecorder` (mimeType 예: `audio/webm`). 서버/Whisper가 지원하는 포맷으로 제한하거나, 백엔드에서 변환 검토.
- **파일 크기/타임아웃**: 긴 녹음은 요청 크기·타임아웃 제한 고려. 필요 시 “최대 N초” 안내 또는 클라이언트에서 잘라서 전송.
- **capabilities의 audio**: 현재는 “채팅 모델이 오디오를 이해한다”는 의미로 쓰이지만, 실제 채팅은 텍스트+이미지만 전송 중. Whisper는 **입력만 STT로 바꿔 주는 역할**이므로, “채팅 모델”과 “STT 모델”을 분리. **채팅 모델 선택 UI에는 Whisper를 아예 제외**하고, **마이크 아이콘은 어떤 채팅 모델이든 항상 표시**해 함께 사용 가능하게 한다.

### 7.1 준비해야 할 코딩 기술

FFmpeg 바이너리 연동·API 라우트 추가 등 **백엔드 인프라** 외에, **AI 협력**을 위한 다음 기술을 사전에 준비한다.

| 기술 영역                          | 구체 기술                                          | 설명·활용                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **프롬프트 엔지니어링**            | 팩트 기반 입력 구성, Few-shot 예시, 역할·형식 지시 | 추출된 `audioFacts`·`videoFacts`·`transcript`를 AI에 전달할 때 **구조화된 컨텍스트**로 조합. 예: `"다음 팩트를 바탕으로 3문장 요약을 생성해라: transcript: {...}, audioFacts.bpm: 98, videoFacts.scene_changes: 5개"`. Few-shot으로 원하는 JSON 형식 예시를 주고, `"위와 동일한 구조로 출력해라"` 지시. 요약·키워드·메타포·객체 감지별로 **별도 프롬프트 템플릿**을 두고 태스크별 최적화.            |
| **데이터 파싱 및 검증**            | **Zod**, `generateObject`(Vercel AI SDK)           | AI가 생성한 JSON이 스키마에 맞는지 **검증**. Zod 스키마로 `summary`, `keywords`, `object_detection`, `metaphor_nodes` 등 정의 후 `zodSchema.parse(aiRawOutput)` 호출. 파싱 실패 시 재시도·폴백(기본값 또는 에러 로그). [NEXA-AI-04]의 **Zod 스키마 기반 구조화 출력**과 연동. `generateObject` 사용 시 스키마를 SDK에 전달해 모델이 JSON 모드로 응답하도록 유도.                                     |
| **벡터 임베딩**                    | Ollama Embeddings, 벡터 저장·ANN 검색              | 추출된 `transcript`·`summary`·`keywords`·`video_narrative` 등을 **임베딩**하여 `file_embeddings`(또는 별도 벡터 테이블)에 저장. [NEXA-AI-04]의 벡터·메타데이터 역할 분리 원칙 준수. **"유사 미디어 검색"**: 쿼리 텍스트를 임베딩한 뒤 코사인 유사도·ANN(예: HNSW)로 유사 문서 검색. 미디어별 `source_metadata` + 벡터를 결합해 "비슷한 음원/영상 찾기" 기능 구현. 저장·인덱싱 전략은 **7.1.4** 참고. |
| **구조화 출력(Structured Output)** | Vercel AI SDK `generateObject`, JSON Mode          | 요약·키워드·메타포·객체 감지 등 **고정 스키마 출력**이 필요한 경우 `generateObject` + Zod 스키마로 응답 형식 강제. JSON 파싱 오류·불완전 필드 감소.                                                                                                                                                                                                                                                  |
| **비동기·재시도**                  | 큐·워커, 지수 백오프                               | 메타데이터 추출·임베딩·팩트 파이프라인을 **비동기**로 실행([NEXA-AI-04] 2.2). AI 호출 실패 시 재시도(지수 백오프). 긴 영상·대용량 파이프라인은 작업 큐(Bull, Agenda 등)로 분리. **구현 시 최우선**: 씬 전환 감지(FFmpeg)·다량 썸네일 Vision 분석은 **리소스 집약적**이므로 비동기 큐와 재시도 로직을 **Phase 5(탐색기 확장) 진입 전** 반드시 선 구현.                                                |
| **Rule Manager 연동**              | 스코프별 프롬프트·룰 주입                          | [NEXA-AI-04] §4.1, [NEXA-AI-05] 룰·프롬프트 통합. `image.machine` vs `image.philosophy` 스코프에 따라 메타포 추출 억제/적극 적용. 프롬프트 템플릿을 **코드 하드코딩**이 아니라 Rule Manager에서 로드해 도메인별·프로젝트별 전환 가능하게 함.                                                                                                                                                         |

#### 7.1.1 프롬프트 엔지니어링 상세

추출된 팩트를 AI에 전달할 때 **최상의 요약·해석**을 얻기 위한 구성 원칙:

- **컨텍스트 순서**: (1) 역할 지시 ("너는 요약 전문가다") → (2) 출력 형식 ("JSON으로 summary, keywords를 반환해라") → (3) Few-shot 예시 1~2개 → (4) 실제 입력(transcript, audioFacts 요약, videoFacts 요약).
- **입력 길이 제한**: 긴 transcript는 앞 N자 + 뒤 N자만 전달하거나, 별도 요약 단계를 거친 뒤 그 결과를 2차 요약에 전달. 토큰 한도 내에서 핵심만 유지.
- **태스크별 프롬프트 분리**: 요약용·키워드용·메타포용·객체 감지용을 **별도 템플릿**으로 두고, Rule Manager 스코프와 매핑.

#### 7.1.2 데이터 파싱 및 검증 (Zod)

- **스키마 정의**: `ai.summary`, `ai.keywords`, `ai.object_detection`, `ai.metaphor_nodes` 등에 대한 Zod 스키마를 `server/schemas/` 등에 정의. `z.array(z.object({...}))` 형태로 중첩 구조 지원.
- **검증 흐름**: `const result = schema.safeParse(raw)` → `success`면 DB 저장, `error`면 로그·재시도 또는 기본값 반영.
- **Vercel AI SDK 연동**: `generateObject({ schema: zodSchema })` 사용 시, 응답이 스키마에 맞도록 모델에 힌트를 줌. 파싱 실패 가능성 감소.

#### 7.1.3 벡터 임베딩 및 유사 미디어 검색

- **임베딩 대상**: `transcript`(또는 앞 500자), `summary`, `keywords`(배열을 공백 결합), `video_narrative`. 필요 시 `object_detection` 라벨 목록, `metaphor_nodes`의 `meaning` 텍스트 등도 결합.
- **저장**: `file_embeddings` 테이블(file_id, model_id, dimension, vector BLOB). [NEXA-AI-04] 벡터·메타데이터 분리 원칙.
- **검색**: 쿼리 문자열 → Ollama Embeddings API로 벡터화 → 코사인 유사도 또는 ANN 인덱스(HNSW, IVFFlat)로 유사 파일 검색. "이 음원과 비슷한 내용의 영상 찾기" 등 크로스미디어 검색 가능.

#### 7.1.4 source_metadata·벡터·대용량 팩트 저장 및 인덱싱 전략

`source_metadata`·벡터·대용량 팩트(주파수 스펙트럼 벡터·diarization·씬 전환·썸네일 경로 등)가 파일 시스템 또는 DB에 저장될 때, **성능 저하를 방지**하기 위한 인덱싱 및 저장 분리 전략을 둔다.

| 구분                | 경량(인덱스·검색용)                                                                                                                                              | 대용량(분리·지연 로드)                                                                                                                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **source_metadata** | file_id, path, media_type, duration, bpm, summary, keywords, mood.label 등 **검색·필터·정렬에 쓰이는 필드만** DB 컬럼 또는 JSONB로 저장. B-tree·GIN 인덱스 적용. | 전체 JSON(ffmpeg 원본·audioFacts 전체·videoFacts 전체)은 **별도 파일** 또는 **LOB/별도 테이블**에 저장, DB에는 `metadata_blob_path` 같은 참조만.                                                                                                                                 |
| **벡터(임베딩)**    | `file_embeddings` 테이블: file_id, model_id, dimension. **벡터 컬럼**에는 ANN 인덱스(HNSW 또는 IVFFlat) 적용. pgvector, Milvus, Qdrant 등 활용.                  | 벡터 자체는 검색 전용이므로 인덱스와 함께 저장. 다만 **다중 모델·다중 차원** 벡터는 테이블 분리 또는 파티셔닝으로 스캔 범위 축소.                                                                                                                                                |
| **대용량 팩트**     | `frequency_spectrum.bands` 요약(4~8 구간 에너지 비율)·`spectral_centroid_hz`·`bpm`·`scene_changes_sec` 개수 등 **집계·필터용 스칼라**만 DB에.                    | **전체 스펙트럼 벡터**(고해상도 FFT 출력)·`silence_segments`·`diarization`·`thumbnails[]`(base64 제외, path만)·`keyframe_timestamps_sec`(긴 목록) 등은 **파일 시스템**(JSON/바이너리) 또는 별도 `fact_blobs` 테이블에 저장, `file_id`+`fact_type`로 참조. 필요 시 **lazy load**. |

**인덱싱 전략 요약**

- **DB 인덱스**
  - `file_id`, `path`, `media_type`, `created_at`: B-tree (목록·필터·정렬).
  - `source_metadata` 일부(JSONB): GIN 인덱스(`summary`, `keywords` 등). JSONB 전체에 GIN 적용 시 크기·업데이트 비용 증가 → **경량 필드만** JSONB로 두고 인덱스.
  - 벡터: ANN 인덱스(HNSW: recall·속도 균형, IVFFlat: 대용량·빌드 비용 절감). `lists`(IVFFlat), `ef_construction`(HNSW) 등 파라미터 튜닝.
- **파일 시스템 저장**
  - 대용량 팩트 JSON: `{base_path}/{file_id}/facts.json` 형태로 저장. DB에는 `facts_path` 컬럼만. 탐색기 JSON 뷰·시각화 시 **온디맨드 로드**.
  - 주파수 스펙트럼: 검색용은 4~8 구간 요약만 DB/경량 JSON; **전체 FFT 벡터**는 `{file_id}/spectrum.raw` 등 별도 파일, 차트 시각화 시에만 로드.
- **쿼리 분리**
  - 목록·필터·정렬: 경량 메타·인덱스만 사용. 대용량 BLOB/JSON 조회 금지.
  - 상세 JSON 뷰·차트: `file_id`로 해당 파일의 `facts_path` 참조 후 파일/LOB fetch.

---

## 8. 장기 계획: 미디어 파이프라인 및 도구 전략

단순 텍스트 변환(Whisper STT)을 넘어, **업로드/녹음 미디어의 포맷 정규화·전처리·다중 도구 연동**까지 고려한 장기 설계이다. AI 도메인에서 이미지·오디오·영상을 다룰 때 **FFmpeg 활용은 필수**로 두고, 용도별로 보조 도구를 조합하는 구도를 권장한다.

### 8.0 Ollama 모델 역할 정의 및 선택 기준

UI 정책(Whisper 제외, 마이크 아이콘 공통)과 STT 연결 외에, **음원·영상 내용을 파악하기 위해 어떤 Ollama 모델을 쓸 것인가**에 대한 역할 정의와 선택 기준을 둔다. 단순히 “채팅 모델” 하나만 두지 않고, **입력 유형(음성/이미지/영상)별·목적별로 모델을 분리**한다.

#### 8.0.1 STT 모델 (Whisper)

| 역할              | 모델 예시              | 선택 기준                                                                                                                                                  |
| ----------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **음성 → 텍스트** | whisper, whisper:small | **정확도 vs 속도**: whisper:small(경량·빠름), whisper(큰 것·정확도 우선). 채널/도메인별로 “실시간 입력용 small / 녹음본·회의록용 large” 등 사전 설정 권장. |

- 채팅용 모델 선택 UI에서는 제외. 설정에서 **STT 전용 모델**로만 선택.

#### 8.0.2 텍스트 분석 모델 (음원 내용 해석용)

Whisper로 추출한 **텍스트의 의미를 해석**하기 위한 LLM. 요약·키워드·감정·도메인별 분류 등에 사용한다.

| 역할            | 모델 예시                       | 선택 기준                                                                                                                   |
| --------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **경량·실시간** | Llama 3.2 1B/3B                 | 저사양·빠른 응답 필요 시. 짧은 요약·키워드 추출 위주.                                                                       |
| **고성능·일반** | Llama 3.2 8B, Mistral 7B        | 요약·의미 해석·감정 분석 등 본격 텍스트 분석. 도메인 제약 없을 때 기본 선택.                                                |
| **도메인 특화** | Mistral, CodeLlama 등           | **기술/코드** transcripts → CodeLlama. **비즈니스/회의** → Mistral. **한국어 비중 높음** → 한국어 fine-tune 모델 우선 검토. |
| **대용량·정밀** | Llama 3.1 70B, Mistral Large 등 | 긴 음원·복잡한 논리 구조 해석, 다국어 혼재 시. 서버 리소스 충분할 때만.                                                     |

- **도메인 기반 선택 로직(예시)**
  - 채널/프로젝트에 “코딩”, “회의”, “일반” 등 라벨이 있으면, 해당 라벨에 매핑된 “텍스트 분석 모델”을 사용.
  - 기본값: Llama 3.2 8B 또는 Mistral 7B. 설정에서 “음원 텍스트 분석 모델”을 채팅 모델과 별도로 선택 가능하게 둔다.

#### 8.0.3 비전 모델 (LLaVA 등) — 영상 썸네일·이미지 분석

영상 썸네일·키프레임 이미지를 분석할 때, **단순 객체 설명**을 넘어 **상징적 의미·맥락**까지 뽑아내기 위한 Vision LLM 역할 정의.

| 역할                 | 모델 예시                   | 구체적 역할                                                                                                                                |
| -------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **객체·장면 기술**   | LLaVA, Llama 3.2 Vision     | “무엇이 보이는가”: 인물 수, 배경, 물체, 색감, 조명. 탐색기 썸네일 미리보기·기본 태그용.                                                    |
| **상징·맥락 해석**   | LLaVA 1.5/1.6, Phi-3 Vision | “무슨 의미·분위기인가”: 광고/다큐/교육/엔터테인먼트 구분, 감정 분위기(긍정/부정/중립), 키 메시지 추출. 썸네일만으로 영상 콘텐츠 의도 추정. |
| **도메인 특화 시각** | (Vision fine-tune)          | 의료·제조·교육 등 도메인 한정 이미지에서 전문 용어·프로토콜 인식. 필요 시 전용 Vision 모델 도입.                                           |

- **LLaVA 활용 시나리오**

  1. **1단계 (기본)**: FFmpeg로 추출한 썸네일/키프레임 → LLaVA에 “이 이미지에 무엇이 보이는지 한 문장으로 설명해줘” → `ai.thumbnail_description` (단순 기술).
  2. **2단계 (상징)**: 같은 이미지 → “이 장면이 전달하려는 분위기·메시지·장르를 짧게 분석해줘. 상징적 의미가 있으면 포함해줘” → `ai.symbolic_meaning` (상징·맥락).
  3. **3단계 (검색용)**: `thumbnail_description` + `symbolic_meaning`을 JSON에 저장 → 탐색기에서 “광고 같음”, “교육용”, “긍정적 분위기” 등으로 필터·검색.
  4. **4단계 (서사)**: **여러 장의 썸네일**을 LLaVA에 **한꺼번에** 전달 → “이 영상의 전체 흐름·서사를 3~5문장으로 요약해줘” → `ai.video_narrative`. 상세는 **8.2.2.1·8.2.2.2** 참고.

- **설정**: “비전 분석 모델”(LLaVA 1.5/1.6 등)을 채팅 모델·텍스트 분석 모델과 분리해 선택. 경량(빠른 썸네일 분석) vs 고성능(상징 해석) 트레이드오프에서 선택 가능하게 한다.

### 8.1 FFmpeg를 중심으로 한 위치

- **역할**: 영상·오디오의 **디코딩·인코딩·포맷 변환·코덱 통일**의 핵심. 서버에서 사용자 업로드/녹음 파일을 Whisper·SoX·MLT 등으로 넘기기 전에 **전처리(리샘플, 컨테이너 변환, 트랜스코드)**를 FFmpeg로 수행하면 안정성이 높아진다.
- **NEXA 연동 포인트**:
  - **STT 직전**: 브라우저 녹음(webm 등) 또는 업로드(m4a, aac 등) → FFmpeg로 WAV/FLAC 등 Whisper 권장 포맷으로 변환 후 transcribe API 전달.
  - **오디오 패널**: 재생·트림·노멀라이즈 전에 포맷 통일.
  - **영상 파이프라인**: 추출 오디오 트랙 → STT, 또는 키프레임/구간 추출 → Vision 모델 입력 등.

장기적으로는 **서버(또는 전용 워커)에 FFmpeg 바이너리 연동**을 전제로, `/ai/transcribe` 등에서 “입력 파일 → FFmpeg 전처리(선택) → Whisper” 파이프라인을 두는 구성을 목표로 할 수 있다.

### 8.2 미디어 도구 구분 및 활용 시나리오

| 구분           | 도구 명칭            | 특징 및 강점                                                       | 활용 시나리오                                                                      |
| -------------- | -------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **핵심 기반**  | **FFmpeg**           | 포맷·코덱·스트림 처리의 사실상 표준. 디코딩/인코딩/필터·메타 추출. | 업로드 미디어 정규화, STT 전 오디오 변환, 썸네일·구간 추출, 서버 사이드 트랜스코드 |
| 강력한 대안    | GStreamer            | 파이프라인 기반의 멀티미디어 프레임워크. 매우 유연한 구조.         | 실시간 스트리밍(CCTV, 드론), 임베디드 시스템                                       |
| 인텔 전용      | Intel IPP / OneVPL   | 인텔 CPU/GPU에 최적화된 미디어 라이브러리.                         | 고속 인코딩 및 하드웨어 가속이 필수인 윈도우 기반 PC 시스템                        |
| 영상 편집 특화 | MLT Framework        | 비선형 영상 편집(NLE) 엔진. 자막, 전환 효과 등에 최적화.           | AI와 협업하여 복잡한 영상 타임라인을 편집할 때                                     |
| 오디오 특화    | SoX (Sound eXchange) | 오디오계의 FFmpeg. 소리 변환 및 필터 처리에 매우 강력.             | 순수 오디오 파형 분석 및 정규화(Normalization)                                     |
| 경량 엔진      | Libav                | FFmpeg에서 파생된 라이브러리. 좀 더 정제된 코드 구조 지향.         | 가벼운 서버 사이드 미디어 변환                                                     |
| **클라이언트 UI** | **Wavesurfer.js**     | 웹 오디오 파형 시각화, 구간 선택(Regions), 재생·줌·트림 UI. Vue/React 래퍼 제공. | 오디오 패널 파형 표시, 트림 구간 시각적 선택, 무음 구간·STT 결과 타임라인 오버레이   |

- **Wavesurfer.js**: 오디오 처리 UI용 **클라이언트 라이브러리**. AiAudioEditorPanel에서 파형·구간 선택·재생 제어. FFmpeg/SoX(서버)와 보완.
- **FFmpeg**: 위 표의 “핵심 기반”으로, NEXA에서는 **1차 권장**. STT 전처리·썸네일·메타 추출·포맷 통일을 한 곳에서 담당.
- **GStreamer**: 실시간 스트리밍·엣지/임베디드가 필요해질 때 검토. FFmpeg와 병행 또는 특정 경로만 대체.
- **Intel IPP / OneVPL**: 윈도우·인텔 환경에서 HW 가속 인코딩이 중요할 때 선택 도입.
- **MLT Framework**: 영상 편집 탭에서 타임라인·자막·전환 효과를 본격 다룰 때, AI(채팅/자동 자막 등)와 연동하는 NLE 엔진으로 검토.
- **SoX**: 오디오 전용 필터·노멀라이즈·파형 분석이 FFmpeg만으로 부족할 때 보조. AI 오디오 메타·Whisper 품질 개선 전처리와 조합.
- **Libav**: 서버 리소스가 제한된 환경에서 FFmpeg 대신 경량 변환용으로 검토.

### 8.2.1 오디오 팩트 데이터(JSON) 추출 정의

SoX·FFmpeg를 활용한 **오디오 파형 분석 및 정규화** 외에, 탐색기에서 **시각화**하거나 **검색 조건**으로 쓸 수 있도록 **음원에서 추출하는 팩트 데이터**를 JSON 필드로 정의한다. 단순히 “메타데이터”로 뭉뚱그리지 않고, 아래 항목별로 스키마를 두고 추출·저장한다.

| 팩트 데이터 항목                                   | 설명                                                                                                                                               | 추출 도구                                                          | 탐색기 활용                                                      |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **주파수 대역별 에너지 분포 (Frequency Spectrum)** | 주파수 구간(예: 0–200Hz, 200–1k, 1k–4k, 4k+ Hz)별 에너지 비율 또는 스펙트럼 벡터. SoX `stat`·FFmpeg `showfreqs`/`avectorscope` 또는 FFT 기반 분석. | SoX, FFmpeg(필터) 또는 전용 스펙트럼 분석 스크립트                 | 스펙트럼 차트 시각화, “저음/고음 비중” 검색 필터                 |
| **BPM (Beats Per Minute)**                         | 박자·템포. SoX는 직접 BPM 출력 없음; FFmpeg 필터 또는 외부 라이브러리(aubio 등)로 추정.                                                            | FFmpeg + aubio/essentia 등 또는 전용 BPM 추정 서비스               | BPM 범위 검색(예: 90–120 BPM), 타임라인 BPM 표시                 |
| **무음 구간 위치 (Silence Segments)**              | 구간별 시작·종료 시각(초). FFmpeg `silencedetect`, SoX `silence` 로그 파싱.                                                                        | FFmpeg(`silencedetect`), SoX                                       | 무음 구간 타임라인 시각화, “무음 제거 후 길이” 검색, 스킵 포인트 |
| **화자 변경 지점 (Diarization)**                   | “누가 언제 말했는지” 구간(화자 ID, 시작·종료 시각). 음성만으로는 FFmpeg/SoX 불가 → 전용 Diarization 모델(예: pyannote) 또는 Whisper 확장 활용.     | 전용 Diarization 모델(예: pyannote), (장기) Whisper 기반 화자 구분 | 화자별 구간 타임라인, “화자 A만” 필터/검색                       |
| **물리적 특성 (기본)**                             | 길이(duration), 샘플레이트(sample_rate), 채널 수(channels), 비트레이트(bit_rate), 포맷(format).                                                    | FFmpeg(ffprobe)                                                    | 목록 컬럼·필터(길이, 채널 등)                                    |
| **음량·에너지 (Loudness / RMS)**                   | 전체 또는 구간별 RMS, LUFS(라우드니스). SoX `stat -v`, FFmpeg `volumedetect`·`ebur128`.                                                            | SoX, FFmpeg                                                        | “큰 소리 구간” 하이라이트, 정규화 전/후 비교                     |
| **스펙트럼 중심 (Spectral Centroid)**              | 주파수 가중 평균(톤 “밝기” 지표). SoX 스펙트럼 분석 또는 외부 분석.                                                                                | SoX 기반 분석, 전용 라이브러리                                     | “밝은/어두운 톤” 검색, 시각화                                    |
| **제로 크로싱 레이트 (Zero-Crossing Rate)**        | 단위 시간당 부호 변경 횟수(음성/노이즈 구분에 활용).                                                                                               | SoX, FFmpeg 또는 스크립트                                          | 음성/무음 구간 보조 판별, 검색 품질 보정                         |
| **감정/분위기 1차 지표 (Sentiment/Mood)**          | 톤·템포·에너지 기반 1차 지표. spectral_centroid(밝은/어두운), BPM(느린/빠른), energy(침착/활기). AI 해석 전 **계산 가능한 팩트**로 저장.           | SoX, FFmpeg, 스펙트럼 분석                                         | “차분한 오디오”, “에너지 높음” 필터, 2차 AI 감정 해석 입력       |

**JSON 스키마 조각 예시 (오디오 팩트 전용)**  
탐색기·검색에서 사용할 오디오 팩트만 모은 최소 구조. 8.5.1의 파일 단위 JSON에 `audioFacts` 등으로 포함할 수 있다.

```json
{
  "audioFacts": {
    "physical": {
      "duration_sec": 125.4,
      "sample_rate": 44100,
      "channels": 2,
      "bit_rate_kbps": 320,
      "format": "mp3"
    },
    "frequency_spectrum": {
      "bands": [
        { "range_hz": [0, 200], "energy_ratio": 0.12 },
        { "range_hz": [200, 1000], "energy_ratio": 0.35 },
        { "range_hz": [1000, 4000], "energy_ratio": 0.38 },
        { "range_hz": [4000, 22050], "energy_ratio": 0.15 }
      ],
      "spectral_centroid_hz": 2100
    },
    "bpm": 98,
    "silence_segments": [
      { "start_sec": 0.0, "end_sec": 1.2 },
      { "start_sec": 45.3, "end_sec": 47.1 }
    ],
    "diarization": [
      { "speaker_id": "spk0", "start_sec": 1.2, "end_sec": 28.5 },
      { "speaker_id": "spk1", "start_sec": 28.5, "end_sec": 45.3 }
    ],
    "loudness": { "rms": -18.5, "lufs": -14.2 },
    "zero_crossing_rate_mean": 0.032,
    "sentiment_mood_indicators": {
      "spectral_brightness": "mid",
      "tempo_category": "moderate",
      "energy_level": "medium"
    }
  }
}
```

- `sentiment_mood_indicators`: 톤·템포·에너지를 기반으로 한 **1차 지표** (계산 또는 규칙 매핑). AI 감정 해석의 입력으로 활용. `spectral_brightness`: low/mid/high, `tempo_category`: slow/moderate/fast, `energy_level`: low/medium/high 등.
- **추출 파이프라인**: 오디오 파일 업로드/선택 시 **메타 추출** 액션에서 FFmpeg(ffprobe)로 `physical` 수집; **오디오 팩트 추출** 액션에서 SoX/FFmpeg/전용 스크립트로 spectrum·silence·loudness·BPM 등 계산; Diarization은 별도 모델 실행 후 `diarization` 배열만 병합.
- **탐색기 연동**: 위 필드를 파일별 JSON에 저장한 뒤, 8.5.1의 “FFmpeg·AI 생성 JSON 함께 보기” 패널에 표시하고, 목록/필터에서 “BPM 범위”, “무음 비율”, “길이” 등으로 검색·정렬할 수 있도록 한다.

### 8.2.2 비디오 팩트 데이터(JSON) 추출 정의

FFmpeg를 활용해 **영상에서 추출하는 팩트 데이터**를 JSON 필드로 정의한다. 오디오(8.2.1)와 마찬가지로, 탐색기에서 **시각화**하거나 **검색 조건**으로 쓸 수 있도록 항목을 구체화한다.

| 팩트 데이터 항목                          | 설명                                                                                                                                 | 추출 도구                                         | 탐색기 활용                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------ |
| **물리적 특성 (기본)**                    | 해상도(width, height), 프레임레이트(fps), 코덱(codec), 길이(duration), 비트레이트(bit_rate), 컨테이너(format), 화면비(aspect_ratio). | FFmpeg(ffprobe)                                   | 목록 컬럼·필터(해상도, 길이, fps 등)                   |
| **키프레임 위치 (Keyframe Timestamps)**   | I-프레임 타임스탬프 목록. 세그먼트·구간 점프용.                                                                                      | FFmpeg `select='eq(pict_type,I)'` 또는 ffprobe    | 타임라인 마커, 구간 검색·스킵                          |
| **씬 전환 지점 (Scene Change Detection)** | 씬 전환이 감지된 시각(초) 목록.                                                                                                      | FFmpeg `select='gt(scene,0.3)'` 또는 전용 씬 검출 | 씬 단위 타임라인 시각화, “씬 N” 검색                   |
| **오디오 트랙 정보**                      | 영상 내장 오디오 스트림 수·코덱·채널·샘플레이트. 영상→STT 시 어떤 트랙 사용할지 결정에 활용.                                         | FFmpeg(ffprobe)                                   | “음성 있는 영상” 필터, STT 전 트랙 선택                |
| **썸네일/키프레임 이미지**                | 구간별 대표 프레임 경로 또는 base64. 키프레임·씬 전환 지점 기준 추출.                                                                | FFmpeg(`-vframes 1`, `select` 등)                 | 타임라인 썸네일, 씬 목록 미리보기                      |
| **색공간·픽셀 포맷**                      | color_space, color_transfer, color_range, pix_fmt.                                                                                   | FFmpeg(ffprobe)                                   | 고급 필터·변환 결정                                    |
| **프레임 수 (Frame Count)**               | 총 프레임 수. duration × fps 검증용.                                                                                                 | FFmpeg(ffprobe)                                   | 길이·fps 검증, 검색 보조                               |
| **감정/분위기 1차 지표 (Sentiment/Mood)** | 색감·밝기·대비 기반 1차 지표. FFmpeg `histogram`·평균 밝기·도미넌트 컬러 등. AI 해석 전 **계산 가능한 팩트**로 저장.                 | FFmpeg(필터), 전용 컬러 분석 스크립트             | “어두운 톤”, “밝은 색감” 필터, 2차 AI 분위기 해석 입력 |

**JSON 스키마 조각 예시 (비디오 팩트 전용)**  
8.5.1의 파일 단위 JSON에 `videoFacts` 등으로 포함할 수 있다.

```json
{
  "videoFacts": {
    "physical": {
      "width": 1920,
      "height": 1080,
      "fps": 29.97,
      "duration_sec": 320.5,
      "codec": "h264",
      "bit_rate_kbps": 5000,
      "format": "mp4",
      "aspect_ratio": "16:9"
    },
    "keyframe_timestamps_sec": [0, 2.5, 5.1, 8.0, 12.3],
    "scene_changes_sec": [0, 15.2, 28.7, 45.1, 62.3],
    "audio_tracks": [{ "index": 0, "codec": "aac", "channels": 2, "sample_rate": 48000 }],
    "thumbnails": [
      { "timestamp_sec": 0, "path": "...", "scene_index": 0, "source": "scene_change" },
      { "timestamp_sec": 15.2, "path": "...", "scene_index": 1, "source": "scene_change" }
    ],
    "color": {
      "color_space": "bt709",
      "pix_fmt": "yuv420p"
    },
    "frame_count": 9600,
    "sentiment_mood_indicators": {
      "brightness_avg": 0.45,
      "contrast_category": "medium",
      "dominant_hue": "warm"
    }
  }
}
```

- `sentiment_mood_indicators`: 색감·밝기·대비 기반 **1차 지표**. `brightness_avg` 0~1, `contrast_category`: low/medium/high, `dominant_hue`: warm/cool/neutral 등. AI 분위기 해석 입력.
- `thumbnails`: 각 항목에 `timestamp_sec`, `path` 외에 `scene_index`(씬 순서), `source`(`"scene_change"` | `"keyframe"`) 보강. `object_detection.scene_ref`·타임라인 매핑에 활용.
- **추출 파이프라인**: 영상 파일 선택 시 **메타 추출** 액션에서 FFmpeg(ffprobe)로 `physical`·`audio_tracks`·`color`·`frame_count` 수집; **비디오 팩트 추출** 액션에서 `select` 필터로 `keyframe_timestamps_sec`·`scene_changes_sec` 추출, 썸네일 생성.
- **탐색기 연동**: `videoFacts`를 파일별 JSON에 저장. 8.5.1 패널에 표시하고, “해상도”, “길이”, “fps”, “씬 수” 등으로 검색·정렬. 타임라인 UI에서 키프레임·씬 전환 지점 시각화.
- **오디오+비디오 통합**: 영상 파일은 `videoFacts`(영상 전용)와 `audioFacts`(추출된 오디오 트랙 분석), `ai.transcript`(Whisper)를 함께 가질 수 있다. STT 전에 FFmpeg로 오디오 트랙 추출 → 오디오 팩트·Whisper 파이프라인 적용.

### 8.2.3 AI 협력용 1차 팩트 확장 (객체 감지·감정/분위기·메타포)

AI 협력을 극대화하기 위해 **더 세분화된 팩트 중심 필드**를 추가한다. 8.2.1·8.2.2의 물리·신호 팩트에 이어, Vision/LLM 출력을 **구조화된 1차 팩트**로 저장하는 항목을 정의한다.

| 팩트 필드                        | 설명                                                                                                                                                        | 추출 소스                                                                                   | 탐색기·AI 활용                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **객체 감지 (Object Detection)** | 영상·이미지 내 등장하는 **주요 사물·인물** 리스트. 씬별 또는 전체 집계.                                                                                     | Vision 모델(LLaVA, Llama 3.2 Vision 등) 또는 전용 OD 모델(YOLO 등)                          | “사람 3명”, “컴퓨터, 책상” 등 검색, Nexus 노드·엣지 입력, 2차 메타포 추출 기초   |
| **감정/분위기 (Sentiment/Mood)** | 오디오: 톤·템포·에너지 1차 지표(8.2.1 `sentiment_mood_indicators`). 영상: 색감·밝기 1차 지표(8.2.2). AI가 이 지표를 입력으로 **2차 감정·분위기** 해석 가능. | 오디오: SoX/FFmpeg·스펙트럼. 영상: FFmpeg·컬러 분석. (선택) transcript·썸네일 기반 LLM 추론 | “차분한”, “긴장감”, “밝은 분위기” 검색·필터, 메타포 노드 연결                    |
| **메타포 노드 (Metaphor Nodes)** | [NEXA-AI-04] §4.1, [NEXA-AI-06]에서 언급한 **예술적·철학적 분석**을 위한 기초 데이터. “A가 B를 상징” 형태의 메타포 쌍.                                      | Vision-Language 모델(LLaVA 등) + 메타포 전용 프롬프트([NEXA-AI-04] image.philosophy 스코프) | Nexus Graph 노드·엣지(`symbolizes`) 입력, 지식 그래프·예술적 인사이트 파이프라인 |

**JSON 스키마 조각 (ai 확장 — 객체 감지·메타포 노드)**

```json
{
  "ai": {
    "object_detection": [
      { "label": "person", "count": 2, "scene_ref": { "start_sec": 0, "end_sec": 15 }, "confidence": 0.92 },
      { "label": "laptop", "count": 1, "scene_ref": { "start_sec": 0, "end_sec": 15 }, "confidence": 0.88 },
      { "label": "whiteboard", "count": 1, "scene_ref": { "start_sec": 15, "end_sec": 45 }, "confidence": 0.85 }
    ],
    "metaphor_nodes": [
      { "source": "빛", "target": "진리", "meaning": "밝음이 진리를 드러냄" },
      { "source": "바다", "target": "무한", "meaning": "끝없는 넓이" }
    ]
  }
}
```

- **object_detection**: Vision/OD 모델이 추출한 **주요 사물·인물** 목록. `label`, `count`, `scene_ref`: `{ start_sec, end_sec }`(구간, 이미지/전체 구간이면 생략 가능), `confidence`(0~1, OD 모델 출력). Nexus 노드·검색·2차 분석 기초.
- **metaphor_nodes**: [NEXA-AI-04] §4.1.2 이미지 메타포 스키마(`source`, `target`, `meaning`)와 [NEXA-AI-06] `symbolizes` 엣지에 대응. **예술적 분석**·지식 그래프의 기초 데이터. 도메인(기계 vs 철학)별로 메타포 추출 룰·억제 적용([NEXA-AI-04] §4.1.1 참고).
- **감정/분위기**: 1차 지표는 `audioFacts.sentiment_mood_indicators`, `videoFacts.sentiment_mood_indicators`에 저장. AI가 이 지표 + transcript·썸네일을 입력으로 **2차 감정·분위기** 텍스트(예: `mood_label: "긴장감"`)를 생성하면 `ai.mood` 등에 추가 저장 가능.

#### 8.2.2.1 키프레임 선정 기준 및 씬 전환 기반 추출

썸네일을 **일정 시간 간격**이 아니라 **화면 전환이 일어나는 지점**을 감지해 뽑도록 한다. FFmpeg `select` 필터를 활용한 기술적 구현 방법을 정리한다.

| 선정 방식                       | FFmpeg 구현                                                                     | 설명                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **씬 전환 감지 (Scene Change)** | `select='gt(scene,0.3)'`, `showinfo`                                            | 인접 프레임 간 픽셀 차이가 임계값(예: 0.3)을 넘으면 씬 전환으로 판정. 컷 전환·카메라 전환 지점에 해당.                   |
| **장면 변화 민감도**            | `scene` 값 조절 (0.1~0.5)                                                       | 값이 낮을수록 민감(작은 변화도 감지) → 썸네일 수 많음. 높을수록 완만(큰 전환만) → 수 적음. 도메인·영상 유형별 튜닝 권장. |
| **I-프레임 보완**               | `select='eq(pict_type,I)'`                                                      | 코덱 I-프레임만 추출. 씬 전환과 상관없이 디코딩 기준점이 되는 프레임. 씬 감지 실패 시 폴백 또는 보완용.                  |
| **하이브리드**                  | 1) `scene`로 시각 변경 지점 추출 → 2) 각 지점에서 I-프레임 근처 프레임 1장 추출 | 화면 전환 지점 + 디코딩 안정성 확보. 추천 구성.                                                                          |

- **구현 예시 (FFmpeg)**

  - 씬 전환 타임스탬프 추출: `ffmpeg -i input.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep showinfo` → 파싱해 `scene_changes_sec` 목록 생성.
  - 각 시각에서 썸네일 이미지 추출: `ffmpeg -ss {timestamp} -i input.mp4 -vframes 1 -q:v 2 thumb_{n}.jpg`.

- **결과**: `videoFacts.scene_changes_sec`와 대응하는 `thumbnails[]`를 JSON에 저장. **단순 N초 간격이 아닌, 시각적 전환이 있는 구간만** 썸네일로 사용 → “내용 파악”에 유리.

#### 8.2.2.2 멀티모달 서사(Narrative) 추출 파이프라인

여러 장의 썸네일을 AI에게 **한꺼번에 전달**하여 영상의 **전체 흐름·서사**를 요약하는 Vision-Language 파이프라인을 설계한다.

| 단계                        | 내용                                                                                                 | 기술                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **1. 키프레임 수 결정**     | 영상 길이·씬 수에 따라 썸네일 개수 제한. 예: 최대 8~16장. Vision 모델 입력 토큰·이미지 수 제한 고려. | `scene_changes_sec`에서 균등 샘플링 또는 중요도 기반 선정 (예: 앞·중간·끝 강조)               |
| **2. 멀티이미지 입력 구성** | 선택된 썸네일 N장을 **한 요청에 함께** Vision-Language 모델에 전달. LLaVA 등은 멀티이미지 입력 지원. | 이미지 배열 + 시스템 프롬프트: “아래 이미지들은 한 영상에서 시간 순서대로 추출된 장면들이다.” |
| **3. 서사 추출 프롬프트**   | “이 영상의 전체 흐름을 3~5문장으로 요약해줘. 등장인물·장소·사건 전개·분위기 변화를 포함해줘.”        | 8.0.3 비전 모델(LLaVA 1.5/1.6 등) 호출                                                        |
| **4. JSON 반영**            | 생성된 텍스트를 `ai.video_narrative` 필드로 저장.                                                    | 탐색기 JSON 뷰, “이 영상 무슨 내용?” 검색·필터에 활용                                         |

- **파이프라인 흐름**  
  `FFmpeg(씬 전환 감지) → 썸네일 N장 추출 → videoFacts.thumbnails`  
  → `Vision-Language 모델(LLaVA 등)에 N장 한꺼번에 입력`  
  → `서사 요약 텍스트 생성 → ai.video_narrative`  
  → JSON 뷰에 반영, 탐색기 검색·Nexus 노드 등에서 활용.

- **제약·보완**

  - 모델별 멀티이미지 수 제한(예: 4~8장) 존재. 긴 영상은 “앞·중·후” 3구간에서 각 2~3장 등으로 샘플링.
  - 음성·자막이 있으면 `ai.transcript`(Whisper)와 `ai.video_narrative`(시각 서사)를 **함께** 저장하고, 검색 시 두 필드를 조합해 활용.

- **구현 우선순위(리소스 소모 대응)**  
  씬 전환 감지(FFmpeg)와 다량 썸네일 Vision 분석은 CPU·메모리·GPU를 크게 소모한다. 구현 시 **비동기 큐(Queue)**와 **재시도 로직**을 **최우선**으로 설계·도입한다.
  - FFmpeg 씬 감지·썸네일 추출: 작업 큐(Bull, Agenda 등)로 분리, 동시 실행 수 제한.
  - Vision 모델 호출(썸네일 분석·서사 추출·객체 감지): 지수 백오프 재시도, 타임아웃·실패 시 큐 재등록 또는 스킵 후 로그.
  - Phase 5(탐색기 데이터 생성 액션) 구현 전 위 큐·재시도 인프라를 먼저 갖추는 것을 권장.

### 8.3 NEXA AI 도메인과의 매핑

| 도메인 기능                            | 1차 도구                                                                                          | 보조/장기 도구                    | 비고                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 채팅 음성 입력(STT)                    | Whisper                                                                                           | **FFmpeg**(업로드/녹음 포맷 변환) | 브라우저 webm 등 → FFmpeg → Whisper 권장 포맷                                                                                            |
| 오디오 패널 (재생·트림·노멀라이즈)     | **FFmpeg**                                                                                        | **SoX**                           | 포맷 통일·필터는 FFmpeg; 세밀한 오디오 처리 시 SoX                                                                                       |
| 오디오 → 텍스트(패널/배치)             | Whisper                                                                                           | FFmpeg, SoX                       | 전처리로 품질·호환성 확보                                                                                                                |
| 영상 편집·타임라인·자막                | (현재 없음)                                                                                       | **FFmpeg**, **MLT**               | 장기: MLT NLE + AI 연동                                                                                                                  |
| 실시간 스트리밍 수집                   | (현재 없음)                                                                                       | **GStreamer**                     | CCTV·드론 등 수집 파이프라인                                                                                                             |
| 서버 경량 변환                         | **FFmpeg**                                                                                        | **Libav**                         | 리소스 제약 시 Libav 검토                                                                                                                |
| **탐색기 메타·JSON 뷰 및 데이터 생성** | **FFmpeg**(메타/썸네일/오디오·비디오 팩트), **SoX**(오디오 팩트), **Whisper**(STT), **LLM**(요약) | —                                 | 탐색기에서 FFmpeg·AI 생성 JSON 함께 보기 + 오디오 팩트(8.2.1)·비디오 팩트(8.2.2)·STT·요약 등 **데이터 추가·생성 액션** 버튼 제공 (8.5.1) |

#### 8.3.1 미디어 분석 전용 오케스트레이션 워크플로우

[NEXA-AI-03] AI 협업형 멀티 에디터 플랫폼 구축 문서의 **5.7 멀티 에이전트·오케스트레이터**에서 정의한 **useAiOrchestrator** 흐름(입력 분석 → 라우팅 → 미디어→텍스트 변환 → 컨텍스트 구성 → 모델 호출 → Zod 검증 → 결과 반영)을 기반으로, **미디어 파일(오디오·영상·이미지) 분석**에 특화된 오케스트레이션 워크플로우를 정의한다. [NEXA-AI-03] §5.7 참고.

**미디어 분석 파이프라인 단계**

| 단계 | 내용 | 사용 도구 |
|------|------|-----------|
| **① 입력 분류** | 파일 타입(audio/video/image)·미디어 상태 판별. 라우팅 규칙에 따라 진행 경로 결정. | 파일 확장자·ffprobe |
| **② 메타·팩트 추출** | FFmpeg(ffprobe)·SoX로 physical·audioFacts·videoFacts 기반 수집. 씬 전환·키프레임·썸네일 추출은 **비동기 큐**로 실행(8.2.2.2, 7.1). | FFmpeg, SoX |
| **③ 미디어→텍스트** | 오디오/영상 내장 오디오 → Whisper(STT). 이미지/썸네일 → Vision(LLaVA 등) 객체·상징 해석. | Whisper, LLaVA |
| **④ 2차 분석 라우팅** | transcript·썸네일·팩트를 입력으로 **요약·키워드·객체 감지·메타포·mood** 등 태스크별 모델 선택. | [NEXA-AI-03] 라우팅 규칙, Rule Manager |
| **⑤ 모델 호출·검증** | 텍스트 LLM(요약·키워드), Vision(객체·메타포) 호출. 응답은 **Zod 스키마**(7.1.2)로 검증 후 JSON 반영. | Vercel AI SDK, Zod |
| **⑥ 결과 통합·저장** | audioFacts·videoFacts·ai.* 를 **source_metadata·벡터** 저장 전략(7.1.4)에 따라 분리 저장. | DB, 파일 시스템 |

- **오케스트레이터 확장**: [NEXA-AI-03]의 `useAiOrchestrator`는 코드/문서/이미지 모델 라우팅이 주이다. **미디어 분석 전용** 워크플로우는 FFmpeg·Whisper·Vision·LLM을 **순차·병렬**로 조합하는 **서버/백엔드 파이프라인**으로 구현할 수 있으며, Phase 5 탐색기 데이터 생성 액션의 **복합 파이프라인** 실행 시 이 워크플로우가 호출된다.
- **Rule Manager 연동**: [NEXA-AI-05] 룰·프롬프트 통합. 미디어 분석용 스키마·프롬프트 템플릿을 `consumer: metadata_extract` 또는 `media_analysis` 등으로 구분해 Resolution API에서 로드.

### 8.4 장기 로드맵 (미디어 관점)

1. **Phase 1 (현 문서)**  
   Whisper STT 연동, 채팅 마이크 입력, 모델 선택 UI(Whisper 제외). **미디어 전처리는 최소한**(업로드 포맷 그대로 transcribe 시도 또는 클라이언트 제한).

2. **Phase 2**  
   **FFmpeg 도입**: transcribe 전 오디오 포맷/샘플레이트 정규화(예: 16kHz mono WAV). 서버 또는 전용 워커에서 `ffmpeg` 실행 래퍼 또는 Node 바인딩 사용. 업로드·녹음 파일에 대해 “FFmpeg 전처리 → Whisper” 파이프라인 고정.

3. **Phase 3**  
   **오디오 패널 고도화**: **Wavesurfer.js**로 파형 시각화·구간 선택·트림 UI. FFmpeg + (필요 시) SoX로 트림·노멀라이즈·포맷 변환 API 노출. AiAudioEditorPanel에서 “텍스트로 변환”뿐 아니라 재생·편집·메타 추출까지 연동.

4. **Phase 4**  
   **영상·NLE**: MLT 또는 FFmpeg 기반 타임라인 편집 검토. AI(채팅/자동 자막·요약)와 협업하는 영상 워크플로우 설계.

5. **Phase 5**  
   **탐색기(Explorer) 확장**: 선택 파일에 대해 **FFmpeg·AI 생성 JSON 함께 보기** 패널, **데이터 추가·생성 액션** 버튼(메타 추출, 음성→텍스트, 요약 생성, 썸네일, 복합 파이프라인) 도입. 상세는 8.5.1 참고.  
   **진입 전 선행 작업**: 씬 전환·썸네일 Vision 분석 등 리소스 집약 작업을 위한 **비동기 큐(Queue)**와 **재시도 로직**을 먼저 구현할 것(7.1, 8.2.2.2 참고).

6. **Phase 6 (선택)**  
   실시간 스트리밍(GStreamer), 인텔 HW 가속(OneVPL), 경량 변환(Libav) 등 환경·요구에 따라 선택 도입.

### 8.5 7개 탭별 미디어·AI 활용 구체화

AI 도메인 content 영역의 **7개 탭**(`aiPanelRegistry` 기준: Dialogue, Narrative, Logic, Media, Sense, Nexus, Explorer)별로, Whisper·FFmpeg·미디어 도구·채팅 모델을 **어디서 어떻게 쓸지** 정리한다.

| 탭 ID         | 탭 명칭   | 컴포넌트               | STT/Whisper  | FFmpeg·미디어 도구  | 채팅/LLM    | 구체 시나리오                                                                                                                                                                                                                                                                            |
| ------------- | --------- | ---------------------- | ------------ | ------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **dialogue**  | Dialogue  | AiChatPanel            | ✅ **핵심**  | (Phase2부터) 전처리 | ✅ **핵심** | **마이크 버튼** 항상 표시. 녹음/파일 → (FFmpeg 정규화) → **Whisper transcribe** → 텍스트를 입력란에 넣거나 바로 전송 → **선택된 채팅 모델**로 응답. 이미지 첨부(vision 모델)는 기존 유지.                                                                                                |
| **narrative** | Narrative | AiEditorPanel          | 보조         | —                   | 보조        | 채팅/패널에서 **“에디터에 삽입”** 시 AI 생성 텍스트·**STT 결과**를 문서에 삽입. 음성으로 메모한 뒤 transcribe → Narrative에 붙여넣기 워크플로우.                                                                                                                                         |
| **logic**     | Logic     | AiCodeEditorPanel      | 보조         | —                   | 보조        | 채팅/패널에서 **“코드에 삽입”** 시 AI 생성 코드 삽입. 음성으로 “이 함수 리팩터해줘” → STT → 채팅 → 생성 코드를 Logic 탭에 삽입.                                                                                                                                                          |
| **media**     | Media     | AiMediaPanel           | ✅ 오디오 탭 | ✅ **핵심**         | 보조        | **Image**: Vision 모델 분석·채팅 연동(기존). **Audio** 하위탭: **Wavesurfer.js** 파형·구간 선택, 재생·트림·노멀라이즈(FFmpeg/SoX), **“텍스트로 변환”** → Whisper. **Video** 하위탭: (장기) FFmpeg 구간 추출·오디오 트랙 추출 → Whisper 자막/요약; MLT NLE 연동 시 타임라인 편집. |
| **sense**     | Sense     | AiUniversalViewerPanel | —            | 보조                | —           | 이미지·오디오·영상 **통합 뷰**. 재생·썸네일·메타 표시. (장기) FFmpeg로 썸네일/구간 미리보기 생성. 미디어 선택 시 Dialogue/Media와 연동해 “이걸로 질문”·“이걸 텍스트로 변환” 등 액션 노출 가능.                                                                                           |
| **nexus**     | Nexus     | AiNexusPanel           | —            | —                   | 보조        | 지식 그래프·관계 맵. 채팅/문서/미디어에서 추출한 **엔티티·요약**을 노드로 활용. (장기) 오디오/영상 → Whisper·요약 LLM → Nexus 노드 자동 생성.                                                                                                                                            |
| **explorer**  | Explorer  | AiExplorerPanel        | 보조         | ✅ **연동**         | 보조        | 파일 트리·카드/테이블 뷰 + **FFmpeg·AI 생성 JSON 함께 보기**. **데이터 추가·생성 액션 버튼**(메타 추출, STT, 요약 등)으로 탐색기에서 직접 생성 명령 실행. 미디어 선택 시 해당 탭으로 열기.                                                                                               |

#### 탭별 상세 정리

- **Dialogue (채팅)**

  - **Phase 1**: 마이크 → transcribe API(Whisper) → 텍스트 → 현재 선택된 채팅 모델로 전송. 모델 선택은 Whisper 제외.
  - **Phase 2~**: 업로드/녹음 파일을 서버에서 FFmpeg로 정규화(포맷·샘플레이트) 후 Whisper 호출.
  - 이미지 첨부는 기존처럼 vision capable 채팅 모델로만 전송.

- **Narrative (문서 에디터)**

  - STT 결과·채팅에서 “에디터에 삽입”한 텍스트를 Tiptap 문서에 반영.
  - “음성 메모 → transcribe → Narrative에 붙여넣기” 플로우로 활용.

- **Logic (코드 에디터)**

  - 채팅에서 “코드에 삽입” 시 Monaco에 삽입.
  - 음성 질문 → STT → 채팅 → 생성 코드를 Logic에 삽입하는 시나리오.

- **Media**

  - **Image**: 기존 Vision 채팅·이미지 분석 유지.
  - **Audio**: 재생·트림·노멀라이즈(FFmpeg/SoX). “텍스트로 변환” → Whisper → 결과를 채팅 입력란·Narrative·클립보드로 전달.
  - **Video**: (장기) FFmpeg로 오디오 추출 → Whisper 자막/요약; MLT로 타임라인 편집 시 AI와 협업.
  - 3D/Vector/Animation/Font/Wide: 현재는 편집·뷰 위주; 필요 시 메타·썸네일에 FFmpeg 활용 검토.

- **Sense (뷰어)**

  - 멀티미디어 통합 뷰. (장기) FFmpeg 기반 썸네일·구간 미리보기. “이 미디어로 채팅”·“이 오디오 텍스트로 변환” 등 액션으로 Dialogue/Media와 연동.

- **Nexus**

  - 채팅·문서·(장기) 오디오/영상 요약에서 나온 엔티티·관계를 그래프로 시각화. Whisper+LLM 파이프라인 결과를 노드/엣지로 반영.

- **Explorer**
  - 파일 선택 시 타입별로 해당 탭(dialogue/media 등)으로 열기. (장기) 오디오/영상 파일 우클릭 “텍스트로 변환” → transcribe → Narrative/Dialogue로 전달.
  - **아래 8.5.1**에서 탐색기 전용 “FFmpeg·AI JSON 연동” 및 “데이터 추가·생성 액션” 상세 기술.

#### 8.5.1 탐색기(Explorer): FFmpeg·AI 생성 JSON 연동 및 데이터 추가·생성 액션

탐색기에서 **파일 목록/트리와 함께** FFmpeg·AI 파이프라인 결과(메타·transcribe·요약 등)를 **JSON 형태로 함께 보고**, 같은 화면에서 **데이터를 추가 생성하는 액션**을 실행할 수 있도록 하는 구성을 목표로 한다.

**1) FFmpeg + AI 생성 JSON 함께 보기**

| 구분            | 내용                                                                                                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **표시 대상**   | 선택한 파일(또는 폴더)에 대해 이미 생성·저장된 **메타데이터·AI 결과**를 JSON으로 표시. 예: FFmpeg `ffprobe` 메타(코덱, 해상도, 길이 등), Whisper transcribe 결과, LLM 요약·키워드, [NEXA-AI-04] 파일 source metadata 등.                        |
| **UI 배치**     | 탐색기 우측 또는 하단 **패널/드로어**에 “메타·AI 결과” 영역. 파일 선택 시 해당 파일의 **저장된 JSON**(또는 서버에서 실시간 조회)을 트리/키-값/코드 블록 형태로 표시.                                                                            |
| **데이터 소스** | 서버에서 파일별로 저장한 메타·transcribe·요약 JSON; 또는 FFmpeg/Whisper/LLM API 호출 결과를 캐시한 스토어. 동일 파일에 대해 **FFmpeg 메타**와 **AI 생성 필드**(transcript, summary 등)를 하나의 JSON 뷰에서 함께 보여 줄 수 있도록 스키마 설계. |

**2) 데이터 추가·생성 액션 버튼**

탐색기(목록/카드/테이블 뷰) 또는 파일 우클릭 메뉴에서 **“데이터 추가 생성”**을 트리거할 수 있는 액션 버튼/메뉴를 둔다. 선택된 파일에 대해 아래 작업을 실행하고, 결과를 JSON 뷰에 반영·저장한다.

| 액션 명칭                  | 실행 내용                                                                                  | 사용 도구                                                                              | 결과 반영                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **메타 추출**              | 선택 파일의 포맷·코덱·길이·해상도 등 추출                                                  | FFmpeg(ffprobe)                                                                        | JSON 뷰에 메타 노드 추가, 저장                                           |
| **오디오 팩트 추출**       | 오디오 파일에서 주파수 스펙트럼·BPM·무음 구간·음량 등 **팩트 데이터** 추출 (8.2.1 정의)    | FFmpeg(silencedetect 등), SoX(stat·스펙트럼), (선택) BPM/Diarization 전용 도구         | JSON 뷰에 `audioFacts` 노드 추가, 탐색기 시각화·검색 조건으로 활용       |
| **비디오 팩트 추출**       | 영상 파일에서 해상도·fps·키프레임·씬 전환·오디오 트랙 등 **팩트 데이터** 추출 (8.2.2 정의) | FFmpeg(ffprobe, select 필터)                                                           | JSON 뷰에 `videoFacts` 노드 추가, 타임라인·검색 조건으로 활용            |
| **음성→텍스트**            | 오디오/영상에서 음성만 추출 후 텍스트 변환                                                 | FFmpeg(오디오 추출) + Whisper                                                          | transcript 필드 생성, JSON 뷰·Narrative/Dialogue 전달 옵션               |
| **요약/키워드 생성**       | 파일명·메타·(선택) transcript를 LLM에 전달해 요약·키워드 생성                              | **텍스트 분석 모델**(8.0.2: Llama 3.2, Mistral 등)                                     | summary, keywords 등 필드 추가, JSON 뷰 갱신                             |
| **썸네일·상징 분석**       | 영상 썸네일/키프레임 → 객체 기술 + 상징·맥락 해석                                          | FFmpeg(씬 전환 기반 추출, 8.2.2.1) + **비전 모델**(8.0.3: LLaVA 등)                    | thumbnail_description, symbolic_meaning 필드 추가, 탐색기 검색·필터 활용 |
| **객체 감지**              | 영상·이미지 내 주요 사물·인물 리스트 추출 (8.2.3)                                          | **비전 모델**(LLaVA 등) 또는 전용 OD 모델                                              | object_detection 필드 추가, Nexus·검색 기초                              |
| **메타포 추출**            | [NEXA-AI-04] 예술적 분석용 메타포(은유) 쌍 추출 (8.2.3)                                    | **비전 모델** + 메타포 전용 프롬프트(image.philosophy 스코프)                          | metaphor_nodes 필드 추가, Nexus Graph 노드·엣지 입력                     |
| **서사(Narrative) 추출**   | 여러 장의 썸네일을 Vision-Language 모델에 한꺼번에 전달해 영상 전체 흐름·서사 요약         | FFmpeg(씬 전환 기반 썸네일) + **비전 모델**(8.0.3: LLaVA 등) 멀티이미지 입력 (8.2.2.2) | video_narrative 필드 추가, “이 영상 무슨 내용?” 검색·Nexus 연동          |
| **썸네일 생성**            | 이미지/영상 첫 프레임 또는 구간 썸네일                                                     | FFmpeg                                                                                 | thumbnail 경로 또는 base64, 메타에 연결                                  |
| **(복합) 전체 파이프라인** | 메타 추출 → (오디오면) 오디오 팩트·(영상이면) 비디오 팩트·STT → 요약 생성                  | FFmpeg + SoX + Whisper + LLM                                                           | JSON 뷰에 메타·audioFacts·videoFacts·transcript·summary 한 번에 반영     |

- **버튼 배치**: 탐색기 툴바에 “데이터 생성” 드롭다운 또는 아이콘 그룹, 또는 **파일(들) 선택 시** 컨텍스트 툴바/우클릭 메뉴에 “메타 추출”, “텍스트로 변환”, “요약 생성”, “전체 파이프라인 실행” 등 노출.
- **상태 표시**: 실행 중(로딩), 완료(체크), 실패(에러) 표시. 생성된 JSON은 즉시 “메타·AI 결과” 패널에 반영.
- **리소스 대응 구현 우선순위**: 비디오 팩트 추출(씬 전환)·썸네일·상징 분석·서사 추출·객체 감지 등 Vision·FFmpeg 집약 작업은 **비동기 큐(Queue)**와 **재시도 로직**(지수 백오프)을 **먼저** 설계·구현한다. 7.1 비동기·재시도, 8.2.2.2 구현 우선순위 참고.

**3) JSON 스키마 예시(탐색기 연동용)**

파일 단위로 FFmpeg 메타와 AI 결과를 한 덩어리로 다루기 위한 최소 예시. 실제 저장 위치·키 이름은 구현 시 정한다.

**역할 구분: ffmpeg vs audioFacts.physical / videoFacts.physical**

| 구분                                              | 역할                                                                                  | 용도                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **ffmpeg** (선택)                                 | FFmpeg `ffprobe`의 **원본 출력**. 포맷·스트림의 raw 메타.                             | 디버깅·폴백·원본 조회. 분석 파이프라인 실패 시 참조.       |
| **audioFacts.physical** / **videoFacts.physical** | **정규화·분석용 메타**. FFmpeg 출력에서 추출해 검색·필터·시각화에 적합한 형태로 정제. | 탐색기 목록·필터·타임라인 UI, AI 입력 컨텍스트. 우선 사용. |

- 권장: `*Facts.physical`을 **1차 소스**로 두고, 필요 시에만 `ffmpeg` 보존. 중복을 피하려면 `ffmpeg` 생략하고 `*Facts.physical`만 저장해도 됨.

- `schema_version`: 스키마 버전 문자열(예: `"1.0"`). 역호환 처리에 사용.
- `media_type`: `"audio"` | `"video"` | `"image"`. 파일 유형 명시. 파싱·필수/선택 노드 판단에 활용.

```json
{
  "schema_version": "1.0",
  "media_type": "video",
  "fileId": "...",
  "path": "/domain/ai/...",
  "ffmpeg": {
    "format": { "format_name": "...", "duration": 120.5 },
    "streams": [{"codec_type": "audio", "sample_rate": "44100"}, ...]
  },
  "audioFacts": {},
  "videoFacts": {},
  "ai": {
    "transcript": "Whisper 변환 결과 텍스트...",
    "summary": "8.0.2 텍스트 분석 모델(Llama/Mistral 등)로 생성한 요약",
    "keywords": ["키워드1", "키워드2"],
    "thumbnail_description": "8.0.3 LLaVA 등으로 생성한 썸네일 객체 기술",
    "symbolic_meaning": "8.0.3 LLaVA 등으로 추출한 상징·맥락·분위기",
    "video_narrative": "8.2.2.2 멀티모달 파이프라인: 여러 썸네일 → LLaVA 등에 한꺼번에 입력해 추출한 영상 전체 서사·흐름 요약",
    "object_detection": [],
    "metaphor_nodes": [],
    "mood": { "label": "긴장감", "score": 0.82, "mood_description": "액션 중심 분위기" },
    "generatedAt": "2025-03-05T..."
  }
}
```

- `audioFacts`: 오디오 파일인 경우 **8.2.1**에 정의한 주파수 스펙트럼·BPM·무음 구간·화자 변경 지점(diarization)·음량·`sentiment_mood_indicators`(감정/분위기 1차 지표) 등 팩트 데이터. 구조는 8.2.1 JSON 예시 참고.
- `videoFacts`: 영상 파일인 경우 **8.2.2**에 정의한 해상도·fps·키프레임·씬 전환·오디오 트랙·썸네일·`sentiment_mood_indicators`(색감·밝기 기반 1차 지표) 등 팩트 데이터. 구조는 8.2.2 JSON 예시 참고. 영상에 내장 오디오가 있으면 `audioFacts`·`ai.transcript`와 함께 보유 가능.
- `ai.object_detection`: **8.2.3** 정의. 영상/이미지 내 주요 사물·인물 리스트. Vision/OD 모델 출력.
- `ai.metaphor_nodes`: **8.2.3** 정의. [NEXA-AI-04]·[NEXA-AI-06] 예술적·철학적 분석용 메타포(은유) 쌍. Nexus Graph 입력.
- `ai.mood`: **8.5.2** 정의. 정규화용 `label`·`score`와 자유 텍스트용 `mood_description` 구조.

**파일 타입별 필수/선택 노드**

| 노드                                          | audio | video                | image |
| --------------------------------------------- | ----- | -------------------- | ----- |
| schema_version, media_type                    | 필수  | 필수                 | 필수  |
| ffmpeg                                        | 선택  | 선택                 | 선택  |
| audioFacts                                    | 필수  | 선택(내장 오디오 시) | —     |
| videoFacts                                    | —     | 필수                 | —     |
| imageFacts                                    | —     | —                    | 필수  |
| ai.transcript                                 | 선택  | 선택                 | —     |
| ai.summary, ai.keywords                       | 선택  | 선택                 | 선택  |
| ai.thumbnail_description, ai.symbolic_meaning | —     | 선택                 | 선택  |
| ai.object_detection                           | —     | 선택                 | 선택  |
| ai.metaphor_nodes                             | —     | 선택                 | 선택  |
| ai.mood                                       | 선택  | 선택                 | 선택  |
| ai.video_narrative                            | —     | 선택                 | —     |

**8.5.2 ai.mood 구조 (정규화 vs 자유 텍스트)**

| 필드                 | 타입         | 설명                                                                    |
| -------------------- | ------------ | ----------------------------------------------------------------------- |
| **label**            | string       | 정규화된 감정/분위기 라벨(예: "긴장감", "밝은 분위기"). 검색·필터용.    |
| **score**            | number (0~1) | (선택) 신뢰도 또는 강도. AI 출력 시 활용.                               |
| **mood_description** | string       | (선택) 자유 텍스트 해석. 1차 지표 + transcript·썸네일 기반 AI 2차 해석. |

```json
"mood": {
  "label": "긴장감",
  "score": 0.82,
  "mood_description": "고조된 액션 장면과 빠른 컷 전환으로 인한 긴박한 분위기"
}
```

- 정규화 검색·필터: `label` 우선 사용. `mood_description`은 자연어 검색·표시용.

**8.5.3 이미지 전용 스키마 (imageFacts)**

이미지는 **단일 프레임**이므로 video와 구간·타임라인 개념이 없다. `videoFacts`의 `physical` + `sentiment_mood_indicators`를 **imageFacts**로 공통화하여, 단일 이미지와 video의 첫 프레임/대표 프레임을 동일 스키마로 처리할 수 있다.

| 필드                      | 설명                                                     | 비디오 단일 프레임과의 관계                                     |
| ------------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| physical                  | width, height, format 등                                 | video.physical과 동일 구조                                      |
| sentiment_mood_indicators | 색감·밝기·대비 1차 지표                                  | videoFacts와 동일                                               |
| (없음)                    | keyframe_timestamps_sec, scene_changes_sec, thumbnails[] | 이미지는 구간이 없으므로 생략. 썸네일=원본 또는 동일 경로 참조. |

```json
{
  "schema_version": "1.0",
  "media_type": "image",
  "fileId": "...",
  "path": "/domain/ai/...",
  "imageFacts": {
    "physical": { "width": 1920, "height": 1080, "format": "jpeg", "color_space": "srgb" },
    "sentiment_mood_indicators": { "brightness_avg": 0.52, "contrast_category": "medium", "dominant_hue": "neutral" }
  },
  "ai": {
    "thumbnail_description": "인물 1명과 책상",
    "symbolic_meaning": "독서와 학습의 상징",
    "object_detection": [{ "label": "person", "count": 1, "confidence": 0.95 }],
    "metaphor_nodes": [],
    "mood": { "label": "차분한", "score": 0.78 }
  }
}
```

- **공통화 전략**: `imageFacts.physical` + `imageFacts.sentiment_mood_indicators`는 `videoFacts`의 동일 필드와 구조를 공유. video 단일 프레임(썸네일) 분석 시에도 동일 노드로 저장 가능.
- 탐색기에서 “FFmpeg + AI 생성 JSON 함께 보기”는 위와 같은 구조(ffmpeg 메타 + audioFacts + videoFacts + ai)를 **동일 화면**에서 조회·표시하는 것을 의미한다.
- “데이터 추가·생성 액션”은 위 필드 중 비어 있는 항목을 채우거나, 전체를 다시 생성하는 명령으로 정의할 수 있다.

이 구도를 통해 “단순 텍스트 변환”을 넘어 **FFmpeg 중심의 미디어 파이프라인**과 **Whisper·SoX·MLT·GStreamer 등 역할 분담**이 명확한 장기 기획으로 확장되며, **7개 탭 각각에서의 활용**이 구체화된다.

---

## 9. 체크리스트 (구현 후)

- [ ] **Vercel AI SDK**: 채팅 응답은 기존 `generateText`/`streamText` 유지, transcribe는 별도 API로만 처리함 확인
- [ ] Ollama(또는 별도 Whisper 서비스) transcribe 호출 스펙 확정
- [ ] `POST /ai/transcribe` 동작 및 에러 응답 확인
- [ ] **채팅 모델 선택**: Whisper 제외 목록만 드롭다운에 노출, 기본값이 Whisper일 때 채팅용 모델로 보정 동작 확인
- [ ] **마이크 아이콘**: 모델과 무관하게 항상 표시, 음성 → STT → 텍스트 → 선택된 채팅 모델로 전송 동작 확인
- [ ] (선택) 오른쪽 패널 STT 설정 저장/적용
- [ ] (선택) 오디오 패널 “텍스트로 변환” 동작
- [ ] (장기) FFmpeg 전처리 파이프라인 검토 및 Phase 2 설계
- [ ] (Phase 5 선행) 씬 전환·썸네일 Vision 분석용 **비동기 큐·재시도 로직** 구현 (Bull/Agenda, 지수 백오프)
- [ ] (장기) 탐색기: FFmpeg·AI 생성 JSON 함께 보기 + 데이터 추가·생성 액션 버튼 (8.5.1)
- [ ] (준비) **코딩 기술**: 프롬프트 엔지니어링·Zod 검증·벡터 임베딩·구조화 출력·비동기·Rule Manager 연동 (7.1)
- [ ] (준비) **저장·인덱싱**: source_metadata·벡터·대용량 팩트 분리 저장 및 인덱싱 전략 적용 (7.1.4)

이 문서를 기준으로 1단계(백엔드)부터 순차 구현하면, Ollama에 설치한 Whisper 모델을 채팅에서 음성 입력으로 사용할 수 있다. 장기적으로는 **섹션 8**의 FFmpeg·동반 도구 전략에 따라 미디어 파이프라인을 확장할 수 있다.

---

## 10. 추후 검토

- **AI 멀티모달 입출력 오케스트레이션**: 인증 시스템 구축 완료 후, **ACE-Step** 또는 유사 포지션의 AI 모델(음악 생성·비전-언어 멀티모달 등)을 useAiOrchestrator와 연동해 입출력 라우팅 확장 검토. Whisper·Ollama·LLaVA·클라우드 AI와 역할 분리·라우팅 전략 수립 필요. 추후 상세 보강.
