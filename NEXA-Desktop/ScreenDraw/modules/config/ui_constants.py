# UI 관련 상수 정의 (중앙 집중식 관리)
from PySide6.QtGui import QColor
import re

# 스플래시 스크린 관련 상수
class SplashScreenConstants:
    """스플래시 스크린 관련 상수"""
    MIN_DISPLAY_TIME = 1000  # 최소 표시 시간 (밀리초, 2초)

# 기본 색상 값 정의 (헥사 코드)
# BRAND: 브랜드 색상, PRIMARY: UI 요소 텍스트, SECONDARY: 설명글
# RED, GREEN, BLUE: 기본 색상, GRAY_DARK, GRAY_LIGHT: 회색 계열
class ColorValues:
    BRAND = "#008000"
    PRIMARY = "#9acd32"
    SECONDARY = "#4d934d"
    RED = "#FF0000"
    GREEN = "#00FF00"
    BLUE = "#0000FF"
    GRAY_DARK = "#1a1a1a"
    GRAY_LIGHT = "#C8C8C8"

# 텍스트 색상 상수 (ColorValues 재사용)
# BRAND: 로고/타이틀, PRIMARY: UI 요소 텍스트, SECONDARY: 설명글
# RED, GREEN, BLUE: 기본 색상
# GRAY_DARK, GRAY_LIGHT: 회색 계열
class TextColors:
    BRAND = ColorValues.BRAND
    PRIMARY = ColorValues.PRIMARY
    SECONDARY = ColorValues.SECONDARY
    RED = ColorValues.RED
    GREEN = ColorValues.GREEN
    BLUE = ColorValues.BLUE
    GRAY_DARK = ColorValues.GRAY_DARK
    GRAY_LIGHT = ColorValues.GRAY_LIGHT

# 색상 상수 (QColor 객체, ColorValues 재사용)
# AREA_BORDER: 드로잉 영역 테두리, DEFAULT_PEN: 기본 펜 색상
# BUTTON_BORDER, HOVER_BORDER: 버튼 보더 색상 (rgba 문자열)
class Colors:
    AREA_BORDER = QColor(ColorValues.BRAND)
    BUTTON_BORDER = "rgba(128, 128, 128, 200)"
    HOVER_BORDER = "rgba(200, 200, 200, 255)"
    DEFAULT_PEN = QColor(ColorValues.RED)

# 배경색 상수 (rgba 문자열)
# CONTROL_PANEL: 컨트롤 패널 배경, BUTTON_*: 버튼 상태별 배경
# SPINBOX: 스핀박스 배경, TRANSPARENT: 투명
class BackgroundColors:
    MAIN = "rgba(45, 45, 45, 255)"
    CONTROL_PANEL = "rgba(64, 64, 64, 220)"
    BUTTON = "rgba(100, 100, 100, 200)"
    BUTTON_NORMAL = "rgba(100, 100, 100, 200)"
    BUTTON_HOVER = "rgba(120, 120, 120, 220)"
    BUTTON_PRESSED = "rgba(80, 80, 80, 250)"
    BUTTON_QUIT = "rgba(200, 50, 50, 200)"
    BUTTON_QUIT_HOVER = "rgba(255, 80, 80, 200)"
    SPINBOX = "rgba(100, 100, 100, 200)"
    TRANSPARENT = "transparent"

# 보더 두께 상수 (픽셀)
class BorderWidths:
    BUTTON = 1
    HOVER = 2
    AREA = 3
    HANDLE = 1

# 보더 반경 상수 (픽셀)
class BorderRadius:
    CONTROL_PANEL = 4
    BUTTON = 5
    SPINBOX = 3
    PEN_STROKE_WIDTH_DISPLAY = 5
    PRESET_PEN_STROKE_WIDTH_BUTTON = 3
    DIALOG = 8
    # 하위 호환성을 위한 별칭
    WIDTH_DISPLAY = 5  # DEPRECATED: PEN_STROKE_WIDTH_DISPLAY 사용 권장
    PRESET_WIDTH_BUTTON = 3  # DEPRECATED: PRESET_PEN_STROKE_WIDTH_BUTTON 사용 권장

# 패딩 상수 (픽셀)
class Padding:
    # 일반 버튼 패딩
    BUTTON_HORIZONTAL = 10
    BUTTON_VERTICAL = 5
    # 특수 위젯 패딩 (펜 스트로크 두께 버튼 등)
    WIDGET_NONE = 0  # 패딩 없음 (특수 위젯용)
    # 스핀박스 패딩
    SPINBOX = 3
    # 컨트롤 패널 패딩
    CONTROL_PANEL_CONTENT = 10
    # 메뉴 패딩
    MENU = 4  # 메뉴 컨테이너 패딩
    MENU_ITEM_VERTICAL = 6  # 메뉴 아이템 세로 패딩
    MENU_ITEM_HORIZONTAL = 20  # 메뉴 아이템 가로 패딩
    # 상세 정보 메뉴 패딩 (더 큰 메뉴용)
    MENU_DETAIL = 8  # 상세 정보 메뉴 컨테이너 패딩
    MENU_DETAIL_ITEM_VERTICAL = 8  # 상세 정보 메뉴 아이템 세로 패딩
    MENU_DETAIL_ITEM_HORIZONTAL = 16  # 상세 정보 메뉴 아이템 가로 패딩

# 크기 상수 (픽셀)
# 컨트롤 패널, 버튼, 색상 프리셋, 선 두께 위젯, 리사이즈 핸들 크기
class Sizes:
    CONTROL_PANEL_HANDLE_WIDTH = 10
    CONTROL_PANEL_BORDER_RADIUS = 4
    CONTROL_PANEL_BG_ALPHA = 220
    CONTROL_PANEL_HANDLE_BORDER_RADIUS = 6
    BUTTON_BORDER_RADIUS = 4
    COLOR_PRESET_WIDTH = 22
    COLOR_PRESET_HEIGHT = 20
    PEN_STROKE_WIDTH_DISPLAY_SIZE = (40, 25)
    PEN_STROKE_WIDTH_DISPLAY_BORDER_RADIUS = 5
    PRESET_PEN_STROKE_WIDTH_BUTTON_SIZE = (30, 25)
    PRESET_PEN_STROKE_WIDTH_BUTTON_BORDER_RADIUS = 3
    RESIZE_HANDLE_SIZE = 14
    # 하위 호환성을 위한 별칭
    WIDTH_DISPLAY_SIZE = (40, 25)  # DEPRECATED: PEN_STROKE_WIDTH_DISPLAY_SIZE 사용 권장
    WIDTH_DISPLAY_BORDER_RADIUS = 5  # DEPRECATED: PEN_STROKE_WIDTH_DISPLAY_BORDER_RADIUS 사용 권장
    PRESET_WIDTH_BUTTON_SIZE = (30, 25)  # DEPRECATED: PRESET_PEN_STROKE_WIDTH_BUTTON_SIZE 사용 권장
    PRESET_WIDTH_BUTTON_BORDER_RADIUS = 3  # DEPRECATED: PRESET_PEN_STROKE_WIDTH_BUTTON_BORDER_RADIUS 사용 권장


# 유틸리티 함수
def parse_rgba_color(color_string: str, default: QColor = None) -> QColor:
    """
    rgba() 문자열을 QColor로 변환
    
    Args:
        color_string: "rgba(r, g, b, a)" 형식의 문자열
        default: 파싱 실패 시 반환할 기본 색상 (None이면 기본값 사용)
    
    Returns:
        QColor 객체
    """
    if default is None:
        default = QColor(200, 200, 200, 255)
    
    match = re.search(r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)', color_string)
    if match:
        r, g, b, a = map(int, match.groups())
        return QColor(r, g, b, a)
    return default

