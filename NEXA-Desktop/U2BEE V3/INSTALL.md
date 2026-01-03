# U2BEE V3 Chrome Extension 설치 가이드

## 📋 사전 준비사항

### 1. NEXA Platform 실행 확인

Extension을 사용하기 전에 **NEXA Platform이 실행 중**이어야 합니다.

```bash
# NEXA-Platform 디렉토리로 이동
cd NEXA-Platform

# 개발 서버 실행
npm run dev
```

**확인 방법:**

-   브라우저에서 `http://localhost:9000` 접속
-   정상적으로 NEXA Platform이 로드되는지 확인

---

## 🔧 Chrome Extension 설치 단계

### 1단계: Chrome 확장 프로그램 페이지 열기

1. Chrome 브라우저를 실행합니다
2. 주소창에 다음을 입력하거나 복사하여 붙여넣기:
    ```
    chrome://extensions/
    ```
3. Enter 키를 누릅니다

**또는:**

-   Chrome 메뉴 (☰) → **확장 프로그램** → **확장 프로그램 관리**

---

### 2단계: 개발자 모드 활성화

1. 확장 프로그램 페이지 우측 상단에서 **"개발자 모드"** 토글을 찾습니다
2. 토글을 **켜기(ON)** 상태로 변경합니다

    ```
    [개발자 모드] ← 이 토글이 켜져 있어야 합니다
    ```

---

### 3단계: 확장 프로그램 로드

1. **"압축해제된 확장 프로그램을 로드합니다"** 버튼을 클릭합니다

    - 개발자 모드가 활성화되면 이 버튼이 나타납니다

2. 파일 선택 창이 열리면 다음 경로로 이동합니다:

    ```
    E:\NEXA System\NEXA\NEXA-Desktop\U2BEE V3
    ```

3. **"U2BEE V3"** 폴더를 선택하고 **"폴더 선택"** 또는 **"선택"** 버튼을 클릭합니다

---

### 4단계: 설치 확인

설치가 성공하면 다음과 같이 표시됩니다:

-   ✅ **U2BEE V3** 확장 프로그램이 목록에 나타납니다
-   ✅ 확장 프로그램이 **활성화(켜짐)** 상태입니다
-   ✅ 아이콘이 Chrome 툴바에 표시됩니다 (아이콘 파일이 없으면 기본 아이콘 표시)

**확인 사항:**

-   확장 프로그램 이름: **U2BEE V3**
-   버전: **3.0.0**
-   설명: **YouTube Content Manager - NEXA Platform 통합 버전**

---

### 5단계: Extension 사용하기

#### 방법 1: Popup으로 열기

1. Chrome 툴바에서 **U2BEE V3 아이콘**을 클릭합니다
2. Popup 창이 열리며 NEXA Platform의 U2BEE UI가 로드됩니다
3. U2BEE의 모든 기능을 사용할 수 있습니다

#### 방법 2: Side Panel로 열기

1. Chrome 툴바에서 **U2BEE V3 아이콘을 우클릭**합니다
2. 메뉴에서 **"사이드 패널 열기"** 또는 **"Open side panel"**을 선택합니다
3. Chrome 우측에 Side Panel이 열리며 U2BEE UI가 표시됩니다

**참고:** Side Panel 기능은 Chrome 114 이상 버전에서만 사용 가능합니다.

---

## ⚠️ 문제 해결

### 문제 1: Extension이 로드되지 않는 경우

**증상:** "매니페스트 파일을 읽을 수 없습니다" 또는 "오류가 발생했습니다"

**해결 방법:**

1. `manifest.json` 파일이 올바른 위치에 있는지 확인
2. `manifest.json` 파일의 JSON 형식이 올바른지 확인 (쉼표, 따옴표 등)
3. Chrome 개발자 도구 콘솔에서 에러 메시지 확인

---

### 문제 2: iframe이 로드되지 않는 경우

**증상:** Popup/Side Panel에 "로드 실패" 메시지가 표시됨

**해결 방법:**

1. **NEXA Platform이 실행 중인지 확인**

    ```bash
    # NEXA-Platform 디렉토리에서
    npm run dev
    ```

2. **브라우저에서 직접 접속 테스트**

    - `http://localhost:9000/#/extension?extension=u2bee` 접속
    - 정상적으로 로드되는지 확인

3. **Extension 권한 확인**

    - `chrome://extensions/`에서 U2BEE V3 클릭
    - "사이트 액세스" 권한이 `http://localhost:*`를 포함하는지 확인

4. **CORS 설정 확인**
    - NEXA Platform이 localhost에서 실행 중인지 확인
    - 방화벽이나 보안 소프트웨어가 차단하지 않는지 확인

---

### 문제 3: Side Panel이 열리지 않는 경우

**증상:** "사이드 패널 열기" 옵션이 없거나 클릭해도 반응 없음

**해결 방법:**

1. Chrome 버전 확인 (Chrome 114 이상 필요)
    - 주소창에 `chrome://version/` 입력하여 버전 확인
2. Extension이 활성화되어 있는지 확인
3. Chrome을 재시작해보기

---

### 문제 4: 아이콘이 표시되지 않는 경우

**증상:** Extension 아이콘이 기본 아이콘으로 표시됨

**해결 방법:**

1. `assets/` 폴더에 아이콘 파일이 있는지 확인

    - `icon16.png` (16x16)
    - `icon32.png` (32x32)
    - `icon48.png` (48x48)
    - `icon128.png` (128x128)

2. 아이콘 파일이 없으면:
    - U2BEE V2의 아이콘을 복사하여 사용하거나
    - 기본 아이콘을 생성하여 사용

---

## 🔄 Extension 업데이트

코드를 수정한 후 Extension을 업데이트하려면:

1. `chrome://extensions/` 페이지로 이동
2. U2BEE V3 확장 프로그램에서 **새로고침 아이콘 (🔄)** 클릭
3. 또는 Extension을 **비활성화 → 활성화**하여 다시 로드

---

## 🗑️ Extension 제거

Extension을 제거하려면:

1. `chrome://extensions/` 페이지로 이동
2. U2BEE V3 확장 프로그램에서 **"제거"** 버튼 클릭
3. 확인 대화상자에서 **"제거"** 클릭

---

## 📝 참고 사항

-   **개발 모드:** 개발자 모드로 로드한 Extension은 Chrome을 재시작해도 유지됩니다
-   **자동 업데이트:** 개발 모드 Extension은 자동으로 업데이트되지 않으므로 수동으로 새로고침해야 합니다
-   **배포:** 실제 사용자에게 배포하려면 Chrome Web Store에 업로드해야 합니다

---

## 🎯 다음 단계

Extension이 정상적으로 설치되면:

1. ✅ Popup/Side Panel에서 U2BEE UI 확인
2. ✅ 모든 탭이 정상 작동하는지 확인
3. ✅ Phase 3: 기본 통신 구조 구현 (향후)

---

**도움이 필요하신가요?**

-   [U2BEE V3 기획서](../../NEXA-Documentation/Desktop/01-기획/U2BEE_V3_NEXA_Platform_통합_기획서.md)
-   [README.md](./README.md)
