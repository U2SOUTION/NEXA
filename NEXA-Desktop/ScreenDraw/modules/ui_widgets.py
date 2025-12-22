# UI 위젯 클래스들
from PySide6.QtWidgets import QWidget, QPushButton
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QPainter, QPen, QColor

# 상수 import (중앙 집중식 관리)
from .config.ui_constants import Colors, BorderWidths, Sizes, parse_rgba_color

class PenStrokeWidthDisplayWidget(QWidget):
    """펜 스트로크 두께를 원형으로 표시하고 조정할 수 있는 위젯"""
    def __init__(self, stroke_width: int, parent=None):
        super().__init__(parent)
        self.stroke_width_value = stroke_width
        self.parent_window = None  # 나중에 설정됨
        self.setFixedSize(Sizes.PEN_STROKE_WIDTH_DISPLAY_SIZE[0], Sizes.PEN_STROKE_WIDTH_DISPLAY_SIZE[1])
        # 배경 제거 (투명)
        self.setStyleSheet("background-color: transparent;")
        self.setCursor(Qt.PointingHandCursor)
        self.setMouseTracking(True)
        self.hovered = False
    
    def _get_current_color(self) -> QColor:
        """현재 선택된 색상 가져오기 (안전한 방식)"""
        if hasattr(self, 'parent_window') and self.parent_window:
            return self.parent_window.pen_color
        return QColor(255, 255, 255)  # 기본값: 흰색
    
    def setStrokeWidth(self, stroke_width: int):
        """펜 스트로크 두께 설정"""
        self.stroke_width_value = stroke_width
        self.update()
    
    def setWidth(self, width: int):
        """하위 호환성을 위한 별칭 (DEPRECATED: setStrokeWidth 사용 권장)"""
        self.setStrokeWidth(width)
    
    def enterEvent(self, event):
        self.hovered = True
        self.update()
    
    def leaveEvent(self, event):
        self.hovered = False
        self.update()
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 위젯 영역 보더 그리기 (호버 시 보더 색상만 변화)
        if self.hovered:
            # 호버 시 호버 보더 색상 사용
            border_color = parse_rgba_color(Colors.HOVER_BORDER)
        else:
            # 일반 상태: 버튼 보더 색상 사용
            border_color = parse_rgba_color(Colors.BUTTON_BORDER, QColor(128, 128, 128, 200))
        
        border_pen = QPen(border_color, BorderWidths.BUTTON)
        painter.setPen(border_pen)
        painter.setBrush(Qt.NoBrush)
        painter.drawRoundedRect(self.rect().adjusted(0, 0, -1, -1), Sizes.PEN_STROKE_WIDTH_DISPLAY_BORDER_RADIUS, Sizes.PEN_STROKE_WIDTH_DISPLAY_BORDER_RADIUS)
        
        # 원형으로 펜 스트로크 두께 표시
        center_x = self.width() // 2
        center_y = self.height() // 2
        radius = self.stroke_width_value // 2
        
        # 현재 선택된 색상 가져오기
        current_color = self._get_current_color()
        
        # 원 그리기 (테두리만) - 현재 선택된 색상으로 표시
        pen = QPen(current_color, 2)
        painter.setPen(pen)
        painter.setBrush(Qt.NoBrush)
        painter.drawEllipse(center_x - radius, center_y - radius, radius * 2, radius * 2)
    
    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            # 클릭 위치에 따라 증가/감소 결정
            click_y = event.position().toPoint().y()
            center_y = self.height() // 2
            
            if click_y < center_y:
                # 위쪽 클릭: 증가
                if hasattr(self, 'parent_window'):
                    self.parent_window.adjust_pen_width(1)
            else:
                # 아래쪽 클릭: 감소
                if hasattr(self, 'parent_window'):
                    self.parent_window.adjust_pen_width(-1)
    
    def wheelEvent(self, event):
        # 마우스 휠로 조정
        delta = event.angleDelta().y()
        if delta > 0:
            # 위로 스크롤: 증가
            if hasattr(self, 'parent_window'):
                self.parent_window.adjust_pen_width(1)
        else:
            # 아래로 스크롤: 감소
            if hasattr(self, 'parent_window'):
                self.parent_window.adjust_pen_width(-1)

class PenStrokeWidthButton(QPushButton):
    """펜 스트로크 두께를 실제 크기로 표시하는 버튼"""
    def __init__(self, stroke_width: int, text: str = "", parent=None):
        super().__init__(text, parent)
        self.stroke_width_value = stroke_width
        self.setFixedSize(25, 25)
        border_color = Colors.BUTTON_BORDER
        from .config.ui_constants import BackgroundColors, TextColors, BorderRadius, Padding
        self.setStyleSheet(f"padding: {Padding.WIDGET_NONE}px; background-color: {BackgroundColors.BUTTON_NORMAL}; border: {BorderWidths.BUTTON}px solid {border_color}; border-radius: {BorderRadius.SPINBOX}px; color: {TextColors.PRIMARY};")
    
    def setStrokeWidth(self, stroke_width: int):
        """펜 스트로크 두께 설정"""
        self.stroke_width_value = stroke_width
        self.update()
    
    def setWidth(self, width: int):
        """하위 호환성을 위한 별칭 (DEPRECATED: setStrokeWidth 사용 권장)"""
        self.setStrokeWidth(width)
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 배경 그리기
        from .config.ui_constants import BackgroundColors
        bg_color = parse_rgba_color(BackgroundColors.BUTTON_NORMAL)
        painter.fillRect(self.rect(), bg_color)
        
        # 텍스트가 있으면 텍스트 그리기
        if self.text():
            painter.setPen(QColor(255, 255, 255))
            painter.setFont(self.font())
            painter.drawText(self.rect(), Qt.AlignCenter, self.text())
        else:
            # 텍스트가 없으면 실제 펜 스트로크 두께로 선 그리기
            pen = QPen(QColor(255, 255, 255), self.stroke_width_value)
            pen.setCapStyle(Qt.RoundCap)
            painter.setPen(pen)
            center_y = self.height() // 2
            margin = 3
            painter.drawLine(margin, center_y, self.width() - margin, center_y)

class PresetPenStrokeWidthButton(QPushButton):
    """프리셋 펜 스트로크 두께를 실제 크기로 표시하는 버튼"""
    def __init__(self, stroke_width: int, parent=None):
        super().__init__(parent)
        self.stroke_width_value = stroke_width
        self.parent_window = None  # 나중에 설정됨 (색상 업데이트를 위해)
        self.setFixedSize(Sizes.PRESET_PEN_STROKE_WIDTH_BUTTON_SIZE[0], Sizes.PRESET_PEN_STROKE_WIDTH_BUTTON_SIZE[1])
        self.setMouseTracking(True)
        self.hovered = False
        
        hover_border_color = Colors.HOVER_BORDER
        from .config.ui_constants import BackgroundColors, Padding
        # 배경 제거, 평소에는 보더 없음, 호버 시에만 보더 표시
        self.setStyleSheet(f"""
            QPushButton {{
                padding: {Padding.WIDGET_NONE}px; 
                background-color: {BackgroundColors.TRANSPARENT}; 
                border: none; 
                border-radius: {Sizes.PRESET_PEN_STROKE_WIDTH_BUTTON_BORDER_RADIUS}px;
            }}
            QPushButton:hover {{
                border: {BorderWidths.BUTTON}px solid {hover_border_color};
            }}
        """)
    
    def _get_current_color(self) -> QColor:
        """현재 선택된 색상 가져오기 (안전한 방식)"""
        if hasattr(self, 'parent_window') and self.parent_window:
            return self.parent_window.pen_color
        return QColor(255, 255, 255)  # 기본값: 흰색
    
    def enterEvent(self, event):
        self.hovered = True
        self.update()
    
    def leaveEvent(self, event):
        self.hovered = False
        self.update()
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 호버 시에만 보더 표시
        if self.hovered:
            # 호버 시 호버 보더 색상 사용
            border_color = parse_rgba_color(Colors.HOVER_BORDER)
            border_pen = QPen(border_color, BorderWidths.BUTTON)
            painter.setPen(border_pen)
            painter.setBrush(Qt.NoBrush)
            painter.drawRoundedRect(self.rect().adjusted(0, 0, -1, -1), Sizes.PRESET_PEN_STROKE_WIDTH_BUTTON_BORDER_RADIUS, Sizes.PRESET_PEN_STROKE_WIDTH_BUTTON_BORDER_RADIUS)
        
        # 실제 펜 스트로크 두께로 선 그리기 (현재 선택된 색상 사용)
        current_color = self._get_current_color()
        pen = QPen(current_color, self.stroke_width_value)
        pen.setCapStyle(Qt.RoundCap)
        painter.setPen(pen)
        
        # 중앙에 수평선 그리기
        center_y = self.height() // 2
        margin = 3
        painter.drawLine(margin, center_y, self.width() - margin, center_y)

class PresetColorButton(QWidget):
    """프리셋 색상을 표시하는 버튼 (QWidget으로 직접 구현하여 간격 완전 제거)"""
    clicked = Signal()
    
    def __init__(self, color: QColor, is_first: bool = False, is_last: bool = False, parent=None):
        super().__init__(parent)
        self.color_value = color
        self.is_first = is_first
        self.is_last = is_last
        self.parent_window = None  # 나중에 설정됨 (선택된 색상 확인용)
        self.setFixedSize(Sizes.COLOR_PRESET_WIDTH, Sizes.COLOR_PRESET_HEIGHT)
        self.setCursor(Qt.PointingHandCursor)
        self.setMouseTracking(True)
        self.hovered = False
        # 간격 완전 제거를 위한 마진 설정
        self.setContentsMargins(0, 0, 0, 0)
    
    def setParentWindow(self, parent_window):
        """부모 윈도우 설정 (선택된 색상 확인용)"""
        self.parent_window = parent_window
    
    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.clicked.emit()
    
    def enterEvent(self, event):
        self.hovered = True
        self.update()
    
    def leaveEvent(self, event):
        self.hovered = False
        self.update()
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 색상으로 채워진 사각형 그리기 (마진 없이 전체 영역 사용)
        painter.fillRect(self.rect(), self.color_value)
        
        # 현재 선택된 색상인지 확인
        is_selected = False
        if hasattr(self, 'parent_window') and self.parent_window:
            from .color_manager import ColorManager
            current_color = self.parent_window.pen_color
            # 색상 비교 (RGB만 비교, Alpha는 무시)
            is_selected = ColorManager.colors_match(self.color_value, current_color)
        
        # 선택된 색상이거나 호버 시 보더 표시
        if is_selected or self.hovered:
            if is_selected:
                # 선택된 색상: 더 두꺼운 보더로 강조
                border_color = parse_rgba_color(Colors.HOVER_BORDER, QColor(255, 255, 255, 255))
                border_width = BorderWidths.HOVER + 1  # 더 두껍게
            else:
                # 호버 시 호버 보더 색상 사용
                border_color = parse_rgba_color(Colors.HOVER_BORDER)
                border_width = BorderWidths.HOVER
            
            border_pen = QPen(border_color, border_width)
            painter.setPen(border_pen)
            painter.setBrush(Qt.NoBrush)
            
            # 보더가 위젯 경계 밖으로 나가지 않도록 보더 두께의 절반만큼 안쪽으로 조정
            half_width = border_width // 2
            painter.drawRect(self.rect().adjusted(half_width, half_width, -half_width, -half_width))

class ColorPreviewBox(QWidget):
    """선택된 색상을 표시하는 박스 위젯"""
    def __init__(self, parent=None, height=25):
        super().__init__(parent)
        self.color_value = QColor(255, 0, 0)  # 기본 색상: 빨강
        self.parent_window = None  # 나중에 설정됨
        # 버튼 높이와 맞춤, 너비는 색상 프리셋 버튼과 동일
        self.setFixedSize(Sizes.COLOR_PRESET_WIDTH, height)
        self.setContentsMargins(0, 0, 0, 0)
        self.setCursor(Qt.PointingHandCursor)
        # 초기에는 숨김
        self.hide()
    
    def setParentWindow(self, parent_window):
        """부모 윈도우 설정 (색상 정보 메뉴 표시용)"""
        self.parent_window = parent_window
    
    def setColor(self, color: QColor):
        """색상 설정 및 업데이트"""
        self.color_value = color
        self.update()
    
    def showPreview(self):
        """프리뷰 표시"""
        self.show()
    
    def hidePreview(self):
        """프리뷰 숨김"""
        self.hide()
    
    def mousePressEvent(self, event):
        """클릭 시 색상 정보 메뉴 표시"""
        if event.button() == Qt.LeftButton:
            self.show_color_info_menu(event.globalPosition().toPoint())
    
    def show_color_info_menu(self, global_pos):
        """색상 정보 팝업창 표시"""
        from PySide6.QtWidgets import QMenu, QApplication
        from PySide6.QtGui import QClipboard
        
        menu = QMenu(self)
        
        # 팝업창 스타일 적용 (배경이 있는 팝업처럼 보이도록)
        from .config.ui_constants import Padding
        menu.setStyleSheet(f"""
            QMenu {{
                background-color: rgba(64, 64, 64, 240);
                border: 2px solid rgba(128, 128, 128, 200);
                border-radius: 6px;
                padding: {Padding.MENU_DETAIL}px;
            }}
            QMenu::item {{
                background-color: transparent;
                color: #E0E0E0;
                padding: {Padding.MENU_DETAIL_ITEM_VERTICAL}px {Padding.MENU_DETAIL_ITEM_HORIZONTAL}px;
                border-radius: 4px;
                min-width: 200px;
            }}
            QMenu::item:selected {{
                background-color: rgba(100, 100, 100, 200);
                color: #FFFFFF;
            }}
        """)
        
        # 색상 정보 형식들
        r, g, b = self.color_value.red(), self.color_value.green(), self.color_value.blue()
        a = self.color_value.alpha()
        
        # RGB 형식
        rgb_text = f"RGB({r}, {g}, {b})"
        rgb_action = menu.addAction(f"RGB:    {rgb_text}")
        rgb_action.setData(rgb_text)
        
        # HEX 형식
        hex_text = f"#{r:02X}{g:02X}{b:02X}"
        hex_action = menu.addAction(f"HEX:    {hex_text}")
        hex_action.setData(hex_text)
        
        # RGBA 형식
        rgba_text = f"RGBA({r}, {g}, {b}, {a})"
        rgba_action = menu.addAction(f"RGBA:   {rgba_text}")
        rgba_action.setData(rgba_text)
        
        # rgba CSS 형식
        rgba_css_text = f"rgba({r}, {g}, {b}, {a/255:.2f})"
        rgba_css_action = menu.addAction(f"CSS:    {rgba_css_text}")
        rgba_css_action.setData(rgba_css_text)
        
        # 메뉴 표시 및 선택 처리
        action = menu.exec(global_pos)
        
        if action and action.data():
            # 선택된 텍스트를 클립보드에 복사
            clipboard = QApplication.clipboard()
            clipboard.setText(action.data())
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 색상으로 채워진 사각형 그리기
        painter.fillRect(self.rect(), self.color_value)
        
        # 보더 그리기
        border_qcolor = parse_rgba_color(Colors.BUTTON_BORDER, QColor(128, 128, 128, 200))
        border_pen = QPen(border_qcolor, BorderWidths.BUTTON)
        painter.setPen(border_pen)
        painter.setBrush(Qt.NoBrush)
        painter.drawRect(self.rect().adjusted(0, 0, -1, -1))

# 하위 호환성을 위한 별칭 (파일 끝에 배치)
WidthDisplayWidget = PenStrokeWidthDisplayWidget
WidthButton = PenStrokeWidthButton
PresetWidthButton = PresetPenStrokeWidthButton
