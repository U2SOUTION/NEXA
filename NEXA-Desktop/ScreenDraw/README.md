# ScreenDraw 개발 버전

## 개요

화면에 그림을 그려 문제점을 표시하고 캡처하는 도구 (개발자용)

## 주요 기능

### 1. 드로잉 영역 모드

-   **전체 영역 모드**: 전체 화면에서 드로잉 가능
-   **부분 영역 모드**: 지정된 영역에서만 드로잉 가능
    -   컨트롤 패널 아래에 드로잉 영역 박스 표시
    -   크기 조절 가능 (모서리/변 드래그)
    -   컨트롤 패널을 따라 이동

### 2. 캡처 기능

-   **전체 화면 저장**: 전체 화면을 파일로 저장
-   **드로잉 영역만 저장**: 부분 영역 모드일 때 해당 영역만 저장
-   **클립보드 저장**: 파일 저장 없이 클립보드에만 저장

### 3. 펜 설정

-   색상 선택 (Python 컬러 피커)
-   선 두께 조절 (1-20px)
-   프리셋 버튼 (1px, 3px, 5px, 10px)

### 4. 웹 플랫폼 연결 (실험)

-   NEXA 플랫폼 서버로 드로잉 데이터 전송
-   HTTP POST 요청 (포트 3000)
-   `requests` 라이브러리 필요

## 사용 방법

### 실행

```bash
python ScreenDraw.py
```

### 단축키

-   `Ctrl+Shift+D`: 그리기 모드 토글
-   `ESC`: 그리기 모드 종료

### 드로잉 영역 모드 전환

-   컨트롤 패널의 "전체 영역" / "부분 영역" 버튼 클릭

### 캡처

-   컨트롤 패널의 "캡처 ▼" 버튼 클릭
-   메뉴에서 원하는 옵션 선택

### 웹 플랫폼 전송

-   `requests` 라이브러리 설치 필요: `pip install requests`
-   NEXA 플랫폼 서버 실행 중이어야 함 (포트 3000)
-   "플랫폼 전송" 버튼 클릭

## 의존성

### 필수

-   PySide6
-   pynput

### 선택 (웹 플랫폼 연결)

-   requests

## 설치

```bash
pip install PySide6 pynput
pip install requests  # 웹 플랫폼 연결용
```

## 개발자 가이드

### ControlPanelManager 사용법

`ControlPanelManager`는 컨트롤 패널의 위젯 생명주기를 관리하고, 동적 위젯의 표시/숨김 시 자동으로 컨트롤 패널 크기를 조정합니다.

#### 기본 사용법

```python
from modules.control_panel_manager import ControlPanelManager

# ControlPanelManager는 ScreenDrawWindow 초기화 시 자동으로 생성됩니다
# self.control_panel_manager로 접근 가능

# 1. 일반 위젯 추가 및 등록
self.my_button = QPushButton("버튼")
self.my_button.clicked.connect(self.on_button_click)
self.control_panel_manager.add_widget('my_button', self.my_button, layout=layout)

# 2. 동적 위젯 추가 (표시/숨김 시 컨트롤 패널 크기 자동 조정)
self.preview_box = ColorPreviewBox(parent_widget, height=25)
self.control_panel_manager.add_widget('preview_box', self.preview_box,
                                       layout=layout, dynamic=True)

# 3. 위젯 조회
widget = self.control_panel_manager.get_widget('my_button')

# 4. 위젯 표시/숨김 (동적 위젯의 경우 크기 자동 조정)
self.control_panel_manager.show_widget('preview_box')
self.control_panel_manager.hide_widget('preview_box')

# 5. 위젯 존재 확인
if self.control_panel_manager.has_widget('my_button'):
    print("위젯이 등록되어 있습니다")

# 6. 모든 위젯 조회
all_widgets = self.control_panel_manager.get_all_widgets()

# 7. 동적 위젯만 조회
dynamic_widgets = self.control_panel_manager.get_dynamic_widgets()
```

#### 동적 위젯이란?

동적 위젯은 런타임에 표시/숨김이 되는 위젯입니다. `dynamic=True`로 등록하면:

-   위젯이 표시될 때 컨트롤 패널이 자동으로 확장됩니다
-   위젯이 숨겨질 때 컨트롤 패널이 자동으로 축소됩니다
-   빈 공간이 생기지 않습니다

예시: `color_preview_box`는 컬러 픽커 모드가 활성화될 때만 표시되므로 동적 위젯으로 등록되어 있습니다.

#### 기존 위젯 등록 (레이아웃에 이미 추가된 경우)

```python
# 이미 레이아웃에 추가된 위젯을 등록만 하는 경우
layout.addWidget(self.existing_widget)
self.control_panel_manager.register_widget('existing_widget', self.existing_widget,
                                            dynamic=False, layout=layout)
```

#### 새로운 위젯 추가 시 권장 패턴

```python
# setup_control_panel() 메서드 내에서
def setup_control_panel(self):
    # ... 레이아웃 생성 ...
    layout = QHBoxLayout(content_widget)

    # ✅ 권장: add_widget() 사용 (추가와 등록을 한 번에)
    self.new_btn = QPushButton("새 버튼")
    self.new_btn.clicked.connect(self.on_new_button_click)
    self.control_panel_manager.add_widget('new_btn', self.new_btn, layout=layout)

    # ❌ 비권장: 직접 addWidget() 사용 (등록되지 않음)
    # layout.addWidget(self.new_btn)  # 이렇게 하면 위젯 관리 시스템에서 추적 불가
```

#### 주요 메서드

-   `add_widget(name, widget, layout, dynamic=False)`: 위젯을 레이아웃에 추가하고 등록
-   `register_widget(name, widget, dynamic=False, layout=None)`: 위젯 등록만 수행
-   `get_widget(name)`: 등록된 위젯 조회
-   `has_widget(name)`: 위젯 등록 여부 확인
-   `show_widget(name)`: 위젯 표시
-   `hide_widget(name)`: 위젯 숨김
-   `get_all_widgets()`: 모든 등록된 위젯 반환
-   `get_dynamic_widgets()`: 동적 위젯만 반환
-   `adjust_panel_size()`: 컨트롤 패널 크기 수동 조정

## 웹 플랫폼 서버 설정

NEXA 플랫폼 서버에 다음 엔드포인트를 추가해야 합니다:

```javascript
app.post("/api/screendraw", (req, res) => {
    const drawingData = req.body;
    console.log("Received drawing data:", drawingData);
    // 나중에 DB 저장 또는 처리
    res.json({ success: true, message: "Drawing data received" });
});
```

## 파일 구조

```
ScreenDraw-Dev/
├── ScreenDraw.py    # 메인 프로그램
└── README.md        # 이 파일
```

## 향후 계획

-   실행 취소/다시 실행 (Undo/Redo)
-   텍스트 입력 기능
-   도형 그리기 (직선, 사각형, 원형, 화살표)
-   이모티콘 배치
-   레이어 관리
