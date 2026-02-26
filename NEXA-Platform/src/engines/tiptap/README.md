# Tiptap 엔진 — 폴더 구조와 역할

## 원칙

- **원본 유지**: 엔진(스킨·utils)은 도메인에 의존하지 않는다. 도메인별 특별한 기능은 **도메인에서 주입**한다 (예: `uploadHandler`, `placeholder`, `toolbarOrder`).
- **직접 만든 툴(Extension)·배치**: 사용자 편의를 위해 엔진에 커스텀 툴·배치를 두는 것은 스킨 단위로 허용한다. “이 스킨만의 툴/모양”은 해당 스킨 폴더에만 둔다.
- **스킨별 차이**: 스킨 이름마다 **기능·툴·모양**이 다를 수 있다. 한 스킨 = 한 묶음(툴 정의 + UI)으로 관리한다.

## 스킨 개념

- **스킨 이름마다** → 다른 기능, 다른 툴 세트, 다른 UI(모양)를 가질 수 있다.
- 각 스킨은 `extensions.ts`(어떤 툴을 쓸지) + `TiptapEditor.vue`(툴바·다이얼로그·스타일 등)로 구성된다.
- **파일명은 모든 스킨에서 동일**하게 둔다 (`extensions.ts`, `TiptapEditor.vue`). 내용만 스킨별로 다르게 작성한다. 이렇게 해서 스킨을 갈아끼울 때 경로만 바꾸면 되고, 규칙이 통일된다.
- 도메인은 **스킨 하나를 선택**해 사용하고, 나머지 동작은 props/주입으로 맞춘다. 엔진 내부를 도메인이 직접 수정하지 않는다.

---

## 의도한 구조 (리네이밍/재구성 시 참고)

- **스킨(모델·버전)** = **툴 사용 정의** + **해당 UI** 를 한 묶음으로 두는 폴더.
- **utils** = **기본 기능** + **직접 만든 기능**을 두고, 각 스킨에서 필요할 때 사용.

```
tiptap/
  skins/                    # 스킨 = 툴 정의 + UI 한 세트 (스킨마다 기능·툴·모양 상이 가능)
    base/                   # 스킨명: base (현재 기본 풀 툴 세트)
      extensions.ts         # 이 스킨이 쓰는 Extension(툴) 정의
      TiptapEditor.vue      # 이 스킨의 툴바·다이얼로그·풀스크린 등 UI
    (추가 스킨 예: minimal/, rich/, …)
  utils/                    # 공통 유틸. 스킨에서 필요 시 import
    fileFormat.ts           # 파일 크기 포맷
    youtube.ts              # YouTube URL → 비디오 ID
    clipboardImage.ts       # 클립보드 이미지 → File
```

- **extensions.ts** (스킨 내부): 이 스킨에서 “어떤 툴을 쓸지” 정의 (StarterKit, Image, Table, YouTube, 커스텀 확장 등). 스킨마다 파일명은 동일, 내용만 다름.
- **TiptapEditor.vue** (스킨 내부): 그 툴들의 **모양·UI** (버튼, 다이얼로그, 붙여넣기 등). 스킨마다 파일명은 동일, 내용만 다름.
- **utils**: 스킨/확장에서 공통으로 쓰는 로직. 스킨이 필요할 때만 import 해서 사용.

## 현재 구조와의 대응

| 현재 위치 | 의도한 구조에서의 위치 |
|-----------|-------------------------|
| `extensions/baseExtensions.ts` | `skins/base/extensions.ts` (스킨별 툴 정의) |
| `BaseTiptapEditor.vue` | `skins/base/TiptapEditor.vue` (스킨별 UI) |
| `utils/*` | `utils/*` 유지 (기본·직접 만든 기능, 스킨에서 사용) |

이 구조로 리네이밍/이동 시 도메인에서는 예: `@engines/tiptap/skins/base/TiptapEditor.vue` 로 참조하면 됨.  
기존 경로 유지가 필요하면 `tiptap/BaseTiptapEditor.vue` 에서 스킨 컴포넌트를 re-export 하는 방식으로 호환 가능.
