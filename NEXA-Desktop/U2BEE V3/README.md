# U2BEE V3 Chrome Extension

NEXA Platform 통합 버전의 U2BEE Chrome Extension입니다.

## 개요

U2BEE V3는 Chrome Extension과 NEXA Platform의 하이브리드 아키텍처를 사용합니다:
- **Extension**: 최소한의 역할 (콘텐츠 수집, Chrome API 접근)
- **Platform**: 모든 UI 및 비즈니스 로직 제공 (iframe으로 로드)

## 구조

```
U2BEE V3/
├── manifest.json          # Extension 매니페스트 (Manifest V3)
├── popup.html            # Popup UI (iframe 컨테이너)
├── sidepanel.html        # Side Panel UI (iframe 컨테이너)
├── popup.js              # Popup 스크립트
├── sidepanel.js          # Side Panel 스크립트
├── background/
│   └── background.js     # Background Service Worker
├── content/
│   └── content.js        # Content Script (기본 구조)
└── assets/
    └── icon*.png         # Extension 아이콘
```

## 설치 방법

### 1. NEXA Platform 실행

Extension을 사용하기 전에 NEXA Platform이 실행 중이어야 합니다:

```bash
cd NEXA-Platform
npm run dev
```

Platform은 `http://localhost:9000`에서 실행됩니다.

### 2. Extension 로드

1. Chrome 브라우저에서 `chrome://extensions/` 접속
2. 우측 상단의 "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `NEXA-Desktop/U2BEE V3` 폴더 선택

### 3. Extension 사용

- **Popup**: Extension 아이콘 클릭 → Popup 창에서 U2BEE UI 확인
- **Side Panel**: Extension 아이콘 우클릭 → "사이드 패널 열기" 선택

## 개발 가이드

### 주요 파일 설명

#### manifest.json
- Manifest V3 형식
- Popup 및 Side Panel 지원
- Content Script는 YouTube 페이지에서만 실행
- iframe으로 `http://localhost:9000` 로드 허용

#### popup.html / sidepanel.html
- iframe만 포함하는 최소한의 HTML
- NEXA Platform의 `/extension?extension=u2bee` 페이지 로드
- 모드 전환 버튼 포함

#### background/background.js
- Service Worker (Manifest V3)
- 메시지 라우팅 (향후 확장용)
- 탭 업데이트 감지

#### content/content.js
- Content Script 기본 구조
- 현재는 빈 스크립트 (향후 정보 추출 로직 추가 예정)

## 통신 구조

### Extension ↔ Platform 통신

현재는 iframe을 통한 직접 통신만 사용합니다. 향후 postMessage 기반 통신 추가 예정:

```javascript
// Extension → Platform
window.parent.postMessage({
    type: 'EXTENSION_MESSAGE',
    data: { ... }
}, '*');

// Platform → Extension
window.addEventListener('message', (event) => {
    if (event.data.type === 'PLATFORM_MESSAGE') {
        // 처리
    }
});
```

## 다음 단계

1. **Phase 3: 기본 통신 구조**
   - postMessage 통신 기본 구조 구현
   - 메시지 타입 정의
   - 에러 처리

2. **Phase 4: 기능 1 - 콘텐츠 평가**
   - YouTube 정보 추출
   - Content Script와 UI 연동
   - 평가 데이터 저장

## 문제 해결

### iframe이 로드되지 않는 경우

1. NEXA Platform이 실행 중인지 확인 (`http://localhost:9000`)
2. Extension의 `host_permissions`에 `http://localhost:*/*`가 포함되어 있는지 확인
3. Chrome 개발자 도구 콘솔에서 에러 메시지 확인

### Side Panel이 열리지 않는 경우

- Chrome 114 이상 버전 필요
- `chrome://extensions/`에서 Extension이 활성화되어 있는지 확인

## 참고 자료

- [U2BEE V3 기획서](../../NEXA-Documentation/Desktop/01-기획/U2BEE_V3_NEXA_Platform_통합_기획서.md)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Side Panel API](https://developer.chrome.com/docs/extensions/reference/sidePanel/)
