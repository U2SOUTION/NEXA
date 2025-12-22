# 색상 관리 모듈
from PySide6.QtWidgets import QColorDialog, QWidget, QApplication
from PySide6.QtGui import QColor, QCursor, QPixmap, QImage
from PySide6.QtCore import Qt, QPoint
from typing import List
from .ui_widgets import PresetColorButton

class ColorManager:
    """색상 관리 클래스"""
    
    def __init__(self, parent_window):
        """
        Args:
            parent_window: ScreenDrawWindow 인스턴스
        """
        self.parent_window = parent_window
        # 컬러 픽커 모드 상태
        self.color_picker_mode = False
        # 프리셋 색상 목록
        self.preset_colors = [
            QColor(255, 0, 0),      # 빨강 #FF0000
            QColor(64, 224, 208),   # 바다색 (터키즈) #40E0D0
            QColor(0, 255, 0),      # 초록 #00FF00
            QColor(255, 255, 0)     # 노랑 #FFFF00
        ]
    
    def set_color(self, color: QColor, source: str = "unknown", update_preview: bool = False):
        """
        색상 설정 통합 메서드
        
        Args:
            color: 설정할 색상
            source: 색상 변경 소스 ("preset", "dialog", "picker", "unknown")
            update_preview: 색상 프리뷰 박스 업데이트 여부 (픽커 모드일 때만 True)
        """
        self.parent_window.pen_color = color
        
        # 위젯 업데이트 (선 굵기 위젯, 프리셋 선 굵기 버튼)
        self._update_color_widgets(color)
        
        # 색상 프리뷰 박스 업데이트 (픽커 모드일 때만)
        if update_preview and hasattr(self.parent_window, 'color_preview_box'):
            if not hasattr(self.parent_window.color_preview_box, 'parent_window') or self.parent_window.color_preview_box.parent_window is None:
                self.parent_window.color_preview_box.setParentWindow(self.parent_window)
            self.parent_window.color_preview_box.setColor(color)
            self.parent_window.color_preview_box.showPreview()
        
        # 설정 저장은 parent_window에서 처리
        if hasattr(self.parent_window, 'save_config'):
            self.parent_window.save_config()
        
        print(f"[개발 모드] 색상 변경 ({source}): RGB({color.red()}, {color.green()}, {color.blue()})")
    
    def choose_color(self) -> QColor:
        """색상 선택 다이얼로그 열기"""
        current_color = self.parent_window.pen_color
        
        # parent를 control_panel로 설정하여 전체 모니터에서 작동하도록 함
        # ScreenDrawWindow를 parent로 하면 Area 모드에서 드로잉 영역 내부에만 제한됨
        # control_panel은 독립 윈도우이므로 전체 화면에서 접근 가능
        parent_widget = None
        if hasattr(self.parent_window, 'control_panel') and self.parent_window.control_panel:
            parent_widget = self.parent_window.control_panel
        
        color = QColorDialog.getColor(current_color, parent_widget, "펜 색상 선택")
        if color.isValid():
            self.set_color(color, source="dialog", update_preview=False)
        return color
    
    def set_preset_color(self, color: QColor):
        """프리셋 색상 설정"""
        self.set_color(color, source="preset", update_preview=False)
    
    def _update_color_widgets(self, color: QColor):
        """색상 변경 시 관련 위젯들 업데이트"""
        # 선 굵기 위젯 업데이트
        if hasattr(self.parent_window, 'width_display') and self.parent_window.width_display:
            self.parent_window.width_display.update()
        
        # 프리셋 선 굵기 버튼들 업데이트 (선 색상 변경 반영)
        if hasattr(self.parent_window, 'preset_buttons'):
            for btn in self.parent_window.preset_buttons:
                if hasattr(btn, 'update'):
                    btn.update()
    
    def get_current_color(self) -> QColor:
        """현재 선택된 색상 가져오기"""
        return self.parent_window.pen_color
    
    @staticmethod
    def colors_match(color1: QColor, color2: QColor) -> bool:
        """
        두 색상이 일치하는지 확인 (RGB만 비교, Alpha는 무시)
        
        Args:
            color1: 첫 번째 색상
            color2: 두 번째 색상
        
        Returns:
            RGB 값이 일치하면 True, 아니면 False
        """
        return (color1.red() == color2.red() and
                color1.green() == color2.green() and
                color1.blue() == color2.blue())
    
    def activate_color_picker_mode(self):
        """컬러 픽커 모드 활성화"""
        self.color_picker_mode = True
        
        # 윈도우가 보이지 않으면 표시 (전체 화면에서 마우스 이벤트를 받기 위해 필요)
        if hasattr(self.parent_window, 'isVisible') and not self.parent_window.isVisible():
            self.parent_window.show()
            self.parent_window.raise_()
            self.parent_window.activateWindow()
        
        # 원래 커서 저장 (활성화 전에 저장)
        if hasattr(self.parent_window, 'cursor'):
            self.original_cursor = self.parent_window.cursor()
        else:
            # 기본 커서로 설정
            from PySide6.QtGui import QCursor
            self.original_cursor = QCursor(Qt.ArrowCursor)
        
        # 커서를 십자 모양으로 변경 (컬러 픽커 모드)
        if hasattr(self.parent_window, 'setCursor'):
            self.parent_window.setCursor(Qt.CrossCursor)
        
        # paintEvent를 호출하여 전체 화면에 배경을 그리도록 함
        if hasattr(self.parent_window, 'update'):
            self.parent_window.update()
        
        print("[개발 모드] 컬러 픽커 모드 활성화 - 화면에서 색상을 선택하세요 (ESC로 종료)")
    
    def deactivate_color_picker_mode(self):
        """컬러 픽커 모드 비활성화"""
        self.color_picker_mode = False
        
        # 커서 복원
        if hasattr(self.parent_window, 'setCursor'):
            if hasattr(self, 'original_cursor') and self.original_cursor:
                self.parent_window.setCursor(self.original_cursor)
            else:
                # 기본 화살표 커서로 복원
                self.parent_window.setCursor(Qt.ArrowCursor)
        
        # paintEvent를 호출하여 투명 배경을 다시 그리도록 함 (전체 화면 배경 제거)
        if hasattr(self.parent_window, 'update'):
            self.parent_window.update()
        
        print("[개발 모드] 컬러 픽커 모드 비활성화")
    
    def pick_color_from_screen(self, global_pos: QPoint) -> QColor:
        """화면의 특정 위치에서 색상 추출"""
        try:
            # 모든 모니터 중에서 해당 위치가 속한 모니터 찾기
            screens = QApplication.screens()
            target_screen = None
            
            for screen in screens:
                screen_rect = screen.geometry()
                if (screen_rect.left() <= global_pos.x() <= screen_rect.right() and
                    screen_rect.top() <= global_pos.y() <= screen_rect.bottom()):
                    target_screen = screen
                    break
            
            if not target_screen:
                target_screen = QApplication.primaryScreen()
            
            # 해당 모니터의 스크린샷 찍기
            pixmap = target_screen.grabWindow(0)
            
            # 화면 좌표를 픽스맵 좌표로 변환
            screen_rect = target_screen.geometry()
            pixmap_x = global_pos.x() - screen_rect.x()
            pixmap_y = global_pos.y() - screen_rect.y()
            
            # 픽셀 색상 가져오기
            image = pixmap.toImage()
            if (0 <= pixmap_x < image.width() and 0 <= pixmap_y < image.height()):
                pixel_color = image.pixelColor(pixmap_x, pixmap_y)
                return pixel_color
            else:
                return QColor()
        except Exception as e:
            print(f"[개발 모드] 색상 추출 오류: {e}")
            return QColor()
    
    def create_preset_buttons(self, parent_widget: QWidget) -> List[PresetColorButton]:
        """프리셋 색상 버튼들 생성"""
        from .config.ui_constants import Sizes
        
        buttons = []
        button_width = Sizes.COLOR_PRESET_WIDTH
        button_height = Sizes.COLOR_PRESET_HEIGHT
        
        for idx, color in enumerate(self.preset_colors):
            is_first = (idx == 0)
            is_last = (idx == len(self.preset_colors) - 1)
            color_preset_btn = PresetColorButton(color, is_first, is_last, parent_widget)
            # 직접 위치 지정하여 완전히 붙이기
            color_preset_btn.setGeometry(idx * button_width, 0, button_width, button_height)
            color_preset_btn.clicked.connect(lambda c=color: self.set_preset_color(c))
            buttons.append(color_preset_btn)
        
        # 프레임 크기를 버튼들의 총 너비로 설정
        parent_widget.setFixedWidth(len(self.preset_colors) * button_width)
        
        return buttons
