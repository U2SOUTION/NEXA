# 펜 스트로크 두께 관리 모듈
from PySide6.QtWidgets import QWidget
from typing import List, Tuple
from .ui_widgets import PenStrokeWidthDisplayWidget, PresetPenStrokeWidthButton

class PenStrokeWidthManager:
    """펜 스트로크 두께 관리 클래스"""
    
    def __init__(self, parent_window):
        """
        Args:
            parent_window: ScreenDrawWindow 인스턴스
        """
        self.parent_window = parent_window
        # 프리셋 펜 스트로크 두께 목록
        self.preset_stroke_widths = [1, 3, 5, 10]
    
    def set_pen_stroke_width(self, stroke_width: int):
        """펜 스트로크 두께 설정"""
        self.parent_window.pen_width = stroke_width
        # 위젯 업데이트
        if hasattr(self.parent_window, 'width_display'):
            self.parent_window.width_display.setWidth(stroke_width)
        # 설정 저장은 parent_window에서 처리
        if hasattr(self.parent_window, 'save_config'):
            self.parent_window.save_config()
    
    def adjust_pen_stroke_width(self, delta: int):
        """펜 스트로크 두께를 증가/감소"""
        new_width = self.parent_window.pen_width + delta
        if 1 <= new_width <= 20:
            self.parent_window.pen_width = new_width
            # 위젯 업데이트
            if hasattr(self.parent_window, 'width_display'):
                self.parent_window.width_display.setWidth(new_width)
            # 설정 저장은 parent_window에서 처리
            if hasattr(self.parent_window, 'save_config'):
                self.parent_window.save_config()
    
    def set_preset_stroke_width(self, stroke_width: int):
        """프리셋 스트로크 두께 설정"""
        self.parent_window.pen_width = stroke_width
        # 위젯 업데이트
        if hasattr(self.parent_window, 'width_display'):
            self.parent_window.width_display.setWidth(stroke_width)
        # 설정 저장은 parent_window에서 처리
        if hasattr(self.parent_window, 'save_config'):
            self.parent_window.save_config()
    
    def create_stroke_width_widgets(self, parent: QWidget) -> Tuple[PenStrokeWidthDisplayWidget, List[PresetPenStrokeWidthButton]]:
        """펜 스트로크 두께 위젯들 생성"""
        # 펜 스트로크 두께 조정을 위한 원형 위젯
        width_display = PenStrokeWidthDisplayWidget(self.parent_window.pen_width, parent)
        # 위젯에 직접 참조 연결
        width_display.parent_window = self.parent_window
        
        # 프리셋 펜 스트로크 두께 버튼들
        preset_buttons = []
        for stroke_width in self.preset_stroke_widths:
            preset_btn = PresetPenStrokeWidthButton(stroke_width, parent)
            preset_btn.clicked.connect(lambda checked=False, w=stroke_width: self.set_preset_stroke_width(w))
            preset_buttons.append(preset_btn)
        
        return width_display, preset_buttons
    
    # 하위 호환성을 위한 별칭 메서드들 (기존 코드와의 호환성 유지)
    def set_pen_width(self, width: int):
        """펜 두께 설정 (하위 호환성용 별칭)"""
        self.set_pen_stroke_width(width)
    
    def adjust_pen_width(self, delta: int):
        """펜 두께를 증가/감소 (하위 호환성용 별칭)"""
        self.adjust_pen_stroke_width(delta)
    
    def set_preset_width(self, width: int):
        """프리셋 두께 설정 (하위 호환성용 별칭)"""
        self.set_preset_stroke_width(width)
    
    def create_width_widgets(self, parent: QWidget) -> Tuple[PenStrokeWidthDisplayWidget, List[PresetPenStrokeWidthButton]]:
        """선 두께 위젯들 생성 (하위 호환성용 별칭)"""
        return self.create_stroke_width_widgets(parent)

