# U2BEE V3 외부 서버 마이그레이션 가이드

## 📋 개요

현재 U2BEE V3는 localhost를 사용하고 있어 Chrome의 Private Network Access 정책에 의해 권한 요청 문제가 발생합니다. 외부 서버(공인 도메인)로 마이그레이션하면 이 문제를 완전히 해결할 수 있습니다.

## ⚠️ 현재 문제점

### iframe 사용 위치별 구분

U2BEE V3는 세 가지 위치에서 iframe을 사용합니다:

1. **Extension Popup iframe** (`popup.html`)
   - Extension Popup 내부에서 사용
   - Extension 페이지 컨텍스트에서 실행
   - ✅ **문제 없음**: 권한 요청 문제 발생하지 않음

2. **Extension Side Panel iframe** (`sidepanel.html`)
   - Extension Side Panel 내부에서 사용
   - Extension 페이지 컨텍스트에서 실행
   - ✅ **문제 없음**: 권한 요청 문제 발생하지 않음

3. **Content Script에서 주입하는 iframe** (`content/injectUI.js`)
   - 웹 페이지에 Shadow DOM으로 주입
   - 웹 페이지 컨텍스트에서 실행
   - ⚠️ **문제 발생**: localhost 권한 요청 문제 발생

### 문제 상세

1. **Content Script에서 주입하는 iframe의 localhost 권한 요청**
   - 웹 페이지(Content Script)에서 localhost iframe 삽입 시 각 사이트마다 권한 요청 발생
   - Extension의 `host_permissions`로는 우회 불가능
   - 권한 거부 시 빈 창 표시 문제

2. **사이트별 권한 관리**
   - 각 웹 사이트 도메인별로 권한이 개별 관리됨
   - 한 번 허용해도 다른 사이트에서는 다시 요청됨

## ✅ 해결 방안

외부 서버(공인 도메인 + HTTPS) 사용 시:
- localhost 권한 요청 문제 완전 해결
- 빈 창 문제 해결
- HTTPS 보안 강화

## 🔧 마이그레이션 체크리스트

### 1. manifest.json 수정

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; frame-src https://u2bee.nexa.com"
  },
  "host_permissions": [
    "https://u2bee.nexa.com/*",  // 공인 도메인 추가
    "*://*.youtube.com/*",
    "<all_urls>"
  ]
}
```

### 2. HTML 파일 수정

#### popup.html (Extension Popup iframe)
```html
<!-- Extension Popup에서 사용하는 iframe -->
<!-- 변경 전 -->
<iframe src="http://localhost:9000/#/extension?extension=u2bee&mode=popup" />

<!-- 변경 후 -->
<iframe src="https://u2bee.nexa.com/#/extension?extension=u2bee&mode=popup" />
```
**참고**: Extension 페이지 컨텍스트에서 실행되므로 권한 요청 문제는 없지만, 일관성을 위해 변경 필요

#### sidepanel.html (Extension Side Panel iframe)
```html
<!-- Extension Side Panel에서 사용하는 iframe -->
<!-- 변경 전 -->
<iframe src="http://localhost:9000/#/extension?extension=u2bee&mode=sidepanel" />

<!-- 변경 후 -->
<iframe src="https://u2bee.nexa.com/#/extension?extension=u2bee&mode=sidepanel" />
```
**참고**: Extension 페이지 컨텍스트에서 실행되므로 권한 요청 문제는 없지만, 일관성을 위해 변경 필요

### 3. JavaScript 파일 수정

#### content/injectUI.js (Content Script에서 주입하는 iframe)
```javascript
// Content Script에서 웹 페이지에 주입하는 iframe
// ⚠️ 이 부분이 가장 중요: 권한 요청 문제가 발생하는 부분
// 변경 전
iframe.src = "http://localhost:9000/#/extension?extension=u2bee&mode=injected";

// 변경 후
iframe.src = "https://u2bee.nexa.com/#/extension?extension=u2bee&mode=injected";
```
**참고**: 웹 페이지 컨텍스트에서 실행되므로 외부 서버로 변경 시 권한 요청 문제 해결

#### popup.js, sidepanel.js
```javascript
// 변경 전
if (!event.origin.includes("localhost") && !event.origin.includes("127.0.0.1")) {
    return;
}

// 변경 후
if (!event.origin.includes("u2bee.nexa.com")) {
    return;
}
```

### 4. NEXA Platform 설정

- NEXA Platform이 공인 도메인에서 실행되도록 설정
- HTTPS 인증서 설정 (Let's Encrypt 등)
- CORS 설정 확인
- 환경 변수로 URL 관리 (선택사항)

## 📝 환경 변수 기반 URL 관리 (선택사항)

개발/프로덕션 환경을 쉽게 전환하기 위해 환경 변수 기반 구조를 도입할 수 있습니다:

```javascript
// config.js (새로 생성)
const PLATFORM_URL = process.env.NODE_ENV === 'production' 
    ? 'https://u2bee.nexa.com'
    : 'http://localhost:9000';

// 사용 예시
iframe.src = `${PLATFORM_URL}/#/extension?extension=u2bee&mode=injected`;
```

## 🚀 배포 후 확인 사항

### Extension 페이지 iframe (Popup/Side Panel)
1. ✅ Popup iframe이 정상적으로 로드되는지 확인
2. ✅ Side Panel iframe이 정상적으로 로드되는지 확인
3. ✅ HTTPS 연결이 정상적으로 작동하는지 확인

### Content Script에서 주입하는 iframe
1. ✅ 웹 페이지에 주입된 iframe이 정상적으로 로드되는지 확인
2. ✅ **권한 요청 다이얼로그가 더 이상 나타나지 않는지 확인** (가장 중요)
3. ✅ **빈 창 문제가 해결되었는지 확인** (가장 중요)
4. ✅ HTTPS 연결이 정상적으로 작동하는지 확인
5. ✅ CORS 에러가 발생하지 않는지 확인
6. ✅ Shadow DOM 내부의 iframe이 정상 작동하는지 확인

## 📅 예상 일정

- **단기**: 현재 기능 유지 (개발 및 테스트 계속 진행)
- **중기**: 외부 서버 배포 준비 (도메인, 호스팅, HTTPS 설정)
- **장기**: 외부 서버로 마이그레이션 완료

## 🔗 관련 파일

- `manifest.json` - Extension 권한 및 CSP 설정
- `popup.html` - Popup UI iframe
- `sidepanel.html` - Side Panel UI iframe
- `content/injectUI.js` - Content Script UI 주입
- `popup.js` - Popup 스크립트
- `sidepanel.js` - Side Panel 스크립트

---

**마지막 업데이트**: 2024년 12월
