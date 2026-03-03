# [기획서] Tiptap + Monaco 최대 뷰 전략

UniversalViewer 개념을 폐기하고, **모든 파일**을 **Tiptap(문서)** 또는 **Monaco(코드)**로 뷰·편집·추가한다는 전략을 담은 기획서이다. 3D, PDF 등 에디터에서 열기 어려운 형식만 별도 지능형 뷰어(NexusLens/NexaScope)로 미루며, 본 문서는 **Tiptap·Monaco에서 가능한 최대 뷰**를 설계한다.

---

## 1. 전략 요약

### 1.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **이원화** | 텍스트·미디어 → Tiptap, 코드·설정·구조화 데이터 → Monaco |
| **에디터 우선** | 단순 보기가 아닌 **뷰 + 편집 + 신규 추가** 모두 에디터에서 수행 |
| **특별 뷰어 최소화** | 3D, PDF 등 에디터에 부적합한 형식만 별도 뷰어(NexusLens 등)로 분리·추후 구현 |

### 1.2 특별 뷰어(NexusLens/NexaScope) 범위(미루기)

| 유형 | 대표 확장자 | 사유 |
|------|-------------|------|
| PDF | pdf | 렌더링·주석·폼 등 별도 라이브러리 필요 |
| 3D 모델 | stl, obj, step, iges, 3mf, ply | WebGL 기반 뷰어 필요 |
| 압축 파일 | zip, rar, 7z, tar 등 | 목록·추출 UI 별도 필요 |

위 유형은 **NexusLens/NexaScope**라는 지능형 뷰어로 통합·추후 기획 예정.

---

## 2. Tiptap 뷰 범위

### 2.1 현재 구축된 Tiptap 기능

| 기능 | 확장 | 비고 |
|------|------|------|
| 리치 텍스트 | StarterKit, Underline, Link, Table, TaskList, Highlight, TextAlign, Color, FontFamily, Subscript, Superscript | base/full 스킨 공통 |
| 이미지 | `@tiptap/extension-image` | 인라인·base64 지원, 업로드 핸들러 연동 |
| 유튜브 | `@tiptap/extension-youtube` | URL 기반 임베드 |

### 2.2 Tiptap에서 처리할 파일 유형

| 유형 | 확장자 | 방식 | 비고 |
|------|--------|------|------|
| **마크다운** | md, mdx | `parseMarkdown` → HTML → Tiptap | 기존 적용 |
| **평문** | txt | 그대로 HTML `<p>` 감싸서 삽입 | 즉시 가능 |
| **HTML** | html, htm | HTML 직접 로드 | XSS 필터 적용 필수 |
| **이미지** | jpg, jpeg, png, gif, webp, svg, bmp, ico | Image 확장 `<img src="...">` | 업로드 URL 또는 base64 |
| **오디오** | mp3, wav, ogg, flac, aac, m4a, wma | `@tiptap/extension-audio` 추가 | Tiptap 공식 확장 |
| **비디오** | mp4, webm, mkv, mov 등 | HTML5 `<video>` 커스텀 확장 또는 iframe | 확장 개발 필요 |
| **CSV** | csv | 파싱 → Tiptap Table 노드로 변환 | 파서 + Table 확장 활용 |
| **RTF** | rtf | 서버 또는 라이브러리로 HTML 변환 | `rtf-to-html` 등 검토 |
| **Office** | docx, xlsx, pptx | 서버 변환 파이프라인 | 복잡도 높음, Phase 2 이후 |

### 2.3 Tiptap 확장 추가·개발 계획

| 확장 | 출처 | 역할 | 우선순위 |
|------|------|------|----------|
| `@tiptap/extension-audio` | 공식 | 로컬/URL 오디오 재생 | P0 |
| Video (로컬 파일) | 커스텀 | HTML5 `<video>` 노드, src 속성 | P0 |
| CSV → Table | 유틸 | CSV 파싱 후 Table 노드 삽입 | P1 |
| RTF 변환 | 서버/클라이언트 | rtf → html 후 Tiptap 로드 | P2 |

---

## 3. Monaco 뷰 범위

### 3.1 현재 지원 언어 (extToMonacoLanguage)

| 확장자 | Monaco language |
|--------|-----------------|
| js, mjs, cjs, jsx | javascript |
| ts, mts, cts, tsx | typescript |
| json | json |
| yaml, yml | yaml |
| xml | xml |
| py | python |
| css, scss | css, scss |
| html, htm, vue | html |
| md | markdown |
| sql | sql |
| sh, bash | shell |
| env, toml, ini, cfg, conf | (env: plaintext, 나머지: 확장 필요) |

### 3.2 Monaco 추가 지원 권장 (우선순위)

**1차 (웹·ESP32·파이썬·모바일·설정)** — 구현 시 우선 적용

| 확장자 | Monaco language | 용도 |
|--------|-----------------|------|
| c, h | c | C / ESP32 |
| cpp, cc, cxx, hpp | cpp | C++ / ESP32 |
| ino | cpp | Arduino / ESP32 (같은 C++ 계열) |
| kt, kts | kotlin | Android (Kotlin) |
| swift | swift | iOS |
| dart | dart | Flutter |
| env | plaintext | 환경변수 |
| toml | toml | Cargo, Poetry 등 설정 |
| dockerfile | dockerfile | 컨테이너 |
| makefile, mk | makefile | 빌드 |

**2차 (후순위)** — 사용 빈도 낮음, 필요 시 추후 추가

| 확장자 | Monaco language |
|--------|-----------------|
| cs | csharp |
| java | java |
| go | go |
| rs | rust |
| rb | ruby |
| php | php |
| r | r |
| lua | lua |
| graphql | graphql |
| ini, cfg, conf | ini 또는 plaintext |

### 3.3 Monaco에서 처리할 파일 유형 (통합)

| 유형 | 확장자 | 비고 |
|------|--------|------|
| **코드** | js, ts, jsx, tsx, mjs, cjs, mts, cts, py, css, scss, html, htm, vue, c, cpp, cs, go, rs, java, rb, php, r, kt, swift, dart, lua | 확장 순차 적용 |
| **구조화 데이터** | json, yaml, yml, xml, toml | - |
| **설정** | env, ini, cfg, conf | plaintext 또는 ini |
| **스크립트** | sh, bash, ps1 | shell, powershell |
| **문서(코드성)** | md | 마크다운은 Tiptap·Monaco 양쪽 가능 → 전략 결정 필요 |
| **DB** | sql | - |
| **빌드/배포** | dockerfile, makefile | - |

> **md 처리 전략**: Tiptap에서 리치 렌더링, Monaco에서는 소스 편집. 현재는 `isCodeFile`에 포함되어 Monaco로 가므로, **문서·미디어 탭과 분리된 코드 탭 전용**으로 유지 가능. 사용자 선택 옵션(문서 탭 vs 코드 탭)은 추후 고려.

---

## 4. 파일 타입별 매핑 표

### 4.1 최종 라우팅 규칙

```
파일 선택
  ├─ isCodeFile(ext) → Monaco (코드 탭)
  └─ 그 외
       ├─ image → Tiptap (Image 노드)
       ├─ audio → Tiptap (Audio 노드, 확장 추가)
       ├─ video → Tiptap (Video 노드, 커스텀 확장)
       ├─ md, txt, html → Tiptap (parseMarkdown/HTML)
       ├─ csv → Tiptap (Table 변환)
       ├─ rtf → Tiptap (변환 후)
       ├─ pdf, 3d_model, archive → NexusLens (추후)
       └─ 기타 → plaintext (Monaco) 또는 Tiptap
```

### 4.2 상세 매핑표

| file_type (server) | 확장자 | 뷰 대상 | 편집 | 비고 |
|--------------------|--------|---------|------|------|
| image | jpg, png, gif, webp, svg, bmp, ico | Tiptap | O (삽입·교체) | Image 확장 |
| video | mp4, webm, mkv, mov, avi, wmv, flv, m4v | Tiptap | O (삽입) | Video 확장 추가 |
| audio | mp3, wav, ogg, flac, aac, m4a, wma | Tiptap | O (삽입) | Audio 확장 추가 |
| document | txt, csv, rtf, doc, docx, xls, xlsx, ppt, pptx | Tiptap | txt/csv/rtf O, Office P2 | - |
| pdf | pdf | NexusLens | - | 추후 |
| 3d_model | stl, obj, step 등 | NexusLens | - | 추후 |
| archive | zip, rar, 7z 등 | NexusLens 또는 미지원 | - | 추후 |
| (코드) | js, ts, json, yaml, xml, py 등 | Monaco | O | isCodeFile |

---

## 5. 구현 단계

### Phase 0: 현재 상태 정리

- [x] Monaco: CODE_EXTENSIONS 기반 코드 파일 라우팅
- [x] Tiptap: Image, YouTube, parseMarkdown
- [x] UniversalViewer: **당분간 보존** (삭제·폐기 안 함). JSON은 Monaco 이관 완료. 추후 NexusLens로 대체 예정.

### Phase 1: Tiptap 미디어 확장 (P0)

| 작업 | 설명 | 산출물 |
|------|------|--------|
| Audio 확장 추가 | `@tiptap/extension-audio` 설치·extensions.ts 등록 | 오디오 파일 Tiptap 뷰·삽입 |
| Video 확장 추가 | HTML5 `<video>` 노드 커스텀 확장 작성 | 비디오 파일 Tiptap 뷰·삽입 |
| 라우팅 수정 | 이미지·오디오·비디오 → Tiptap(문서 탭) | AiExplorerPanel, AiLeftNav 등 |
| 파일 오픈 시 HTML 생성 | 이미지: `<img>`, 오디오: `setAudio`, 비디오: `setVideo` | fileToEditorHtml 확장 |

### Phase 2: Tiptap 문서 확장 (P1)

| 작업 | 설명 | 산출물 |
|------|------|--------|
| CSV → Table | CSV 파싱 후 Tiptap Table 노드로 변환 | CSV 파일 Tiptap 뷰 |
| TXT 처리 | 평문을 `<p>`로 감싸서 Tiptap 로드 | txt 파일 Tiptap 뷰 |
| md in Tiptap | md 선택 시 문서 탭으로 열기 옵션 (선택) | 사용자 경험 개선 |

### Phase 3: Monaco 언어 확장 (P1)

| 작업 | 설명 | 산출물 |
|------|------|--------|
| extToMonacoLanguage 1차 확대 | c, cpp, h, hpp, ino, kt, kts, swift, dart, env, toml, dockerfile, makefile | 웹·ESP32·파이썬·모바일·설정 지원 |
| CODE_EXTENSIONS 동기화 | extToMonacoLanguage와 일치하도록 확장 | - |
| (추후) 2차 확대 | cs, java, go, rs, rb, php, r, lua, graphql, ini 등 | 필요 시 순차 추가 |

### Phase 4: RTF·Office (P2)

| 작업 | 설명 | 산고 |
|------|------|------|
| RTF 변환 | rtf → html (클라이언트 라이브러리 또는 API) | 복잡도 중 |
| Office 변환 | docx/xlsx/pptx → html 또는 텍스트 (서버) | 복잡도 높음 |

### Phase 5: NexusLens (추후)

- PDF, 3D, 아카이브 등 별도 기획서로 분리
- AI 인사이트 통합 설계

---

## 6. 라우팅 로직 변경 요약

### 6.1 isCodeFile → Monaco

```ts
// CODE_EXTENSIONS (1차 확장: 웹·ESP32·파이썬·모바일·설정)
const CODE_EXTENSIONS = [
  'js','mjs','cjs','ts','mts','cts','jsx','tsx',
  'json','yaml','yml','xml','py','css','scss',
  'html','htm','md','sql','sh','bash','vue',
  'env','toml','ini','cfg','conf',
  // Phase 3 1차: 웹·ESP32·모바일
  'c','h','cpp','cc','cxx','hpp','ino',
  'kt','kts','swift','dart',
  'dockerfile','makefile','mk',
  // Phase 3 2차(추후): 'go','rs','cs','java','rb','php','r','lua','graphql'
]
```

### 6.2 isTiptapFile → Tiptap (문서 탭)

```ts
// Tiptap으로 열 파일
const TIPTAP_EXTENSIONS = [
  'txt', 'csv', 'rtf',           // 문서
  'jpg','jpeg','png','gif','webp','svg','bmp','ico',  // 이미지
  'mp3','wav','ogg','flac','aac','m4a','wma',        // 오디오
  'mp4','webm','mkv','mov','avi','wmv','flv','m4v',  // 비디오
]
// md는 전략에 따라 Tiptap 또는 Monaco
```

### 6.3 isNexusLensFile → 특별 뷰어 (미구현)

```ts
const NEXUS_LENS_EXTENSIONS = ['pdf', 'stl','obj','step','iges','3mf','ply', 'zip','rar','7z','tar','gz']
// 현재: "지원하지 않는 형식" 메시지 또는 다운로드 링크
```

---

## 7. 관련 문서

| 문서 | 설명 |
|------|------|
| [NEXA-AI-02] 탐색기_UI_전략_구체화 | 탐색기·뷰어 요구사항 |
| [NEXA-AI-03] AI_협업형_멀티_에디터_플랫폼_구축 | 탭·패널·뷰어 탭 정의 |
| [NEXA-AI-01] 웹_탐색기_문서폴더_연동 | 문서 폴더 연동 |

---

## 8. 결론

- **Tiptap**: 텍스트 문서(md, txt, html), 이미지, 오디오(Audio 확장), 비디오(Video 확장), CSV(Table 변환), RTF(변환) → **뷰·편집·추가** 모두 가능하도록 확장
- **Monaco**: 코드·설정·구조화 데이터 → 언어 지원 확대
- **NexusLens/NexaScope**: PDF, 3D, 압축 → 추후 지능형 뷰어로 별도 기획

이 기획서를 바탕으로 Phase 1(Audio·Video Tiptap 확장)부터 순차 적용하면 된다.
