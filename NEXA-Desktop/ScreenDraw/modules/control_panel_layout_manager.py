# 컨트롤 패널 레이아웃 관리 모듈
from PySide6.QtWidgets import QWidget, QLayout, QHBoxLayout, QVBoxLayout
from PySide6.QtCore import Qt, QTimer, QSize
from PySide6.QtGui import QScreen
from typing import Optional, Literal
from PySide6.QtWidgets import QApplication


class ControlPanelLayoutManager:
    """
    컨트롤 패널(툴바) 레이아웃 관리 클래스
    
    컨트롤 패널의 레이아웃 방향 전환, 자동 크기 조정, 모니터 감지 등 레이아웃 관련 기능을 담당합니다.
    
    주의:
    - 이 클래스는 컨트롤 패널(툴바)의 크기 조정만 담당합니다.
    - 드로잉 영역의 크기 조정은 ScreenDrawWindow에서 별도로 처리됩니다.
    
    현재 구현:
    - 동적 위젯 표시/숨김 시 컨트롤 패널 크기 자동 조정
    - 레이아웃 방향 관리 (가로/세로) - 기본 구조만 제공
    - 모니터 위치 및 방향 감지 - 기본 구조만 제공
    
    향후 구현 예정:
    - 레이아웃 방향 자동 전환 (모니터 방향에 따라)
    - 위젯 재배치 (방향 전환 시)
    - 사용자 직접 크기 조정 기능 (현재는 없음)
    """
    
    def __init__(self, control_panel_manager):
        """
        Args:
            control_panel_manager: ControlPanelManager 인스턴스
        """
        self.control_panel_manager = control_panel_manager
        self.orientation: Literal["horizontal", "vertical"] = "horizontal"  # 현재 레이아웃 방향
        self.current_screen: Optional[QScreen] = None
        self.main_layout: Optional[QLayout] = None
    
    def set_main_layout(self, layout: QLayout):
        """메인 레이아웃 설정"""
        self.main_layout = layout
    
    def get_orientation(self) -> Literal["horizontal", "vertical"]:
        """현재 레이아웃 방향 반환"""
        return self.orientation
    
    def detect_screen_orientation(self) -> Literal["horizontal", "vertical"]:
        """
        현재 모니터의 방향을 감지하여 레이아웃 방향 추천
        
        Returns:
            "horizontal" 또는 "vertical"
        """
        screen = self._get_current_screen()
        if screen:
            geometry = screen.geometry()
            # 세로가 더 길면 세로 레이아웃, 가로가 더 길면 가로 레이아웃
            if geometry.height() > geometry.width():
                return "vertical"
            else:
                return "horizontal"
        return "horizontal"  # 기본값
    
    def _get_current_screen(self) -> Optional[QScreen]:
        """현재 컨트롤 패널이 위치한 모니터 감지 (ScreenManager 사용)"""
        control_panel = self.control_panel_manager.control_panel
        if not control_panel or not control_panel.isVisible():
            self.current_screen = QApplication.primaryScreen()
            return self.current_screen
        
        # ScreenManager 사용 (있으면)
        window = self.control_panel_manager.window
        if hasattr(window, 'screen_manager'):
            screen_manager = window.screen_manager
            self.current_screen = screen_manager.get_screen_for_widget(control_panel) or QApplication.primaryScreen()
            return self.current_screen
        else:
            # ScreenManager가 없을 때는 기존 로직 사용 (하위 호환성)
            center_point = control_panel.geometry().center()
            screens = QApplication.screens()
            
            for screen in screens:
                screen_geometry = screen.geometry()
                if screen_geometry.contains(center_point):
                    self.current_screen = screen
                    return screen
            
            self.current_screen = QApplication.primaryScreen()
            return self.current_screen
    
    def switch_orientation(self, orientation: Literal["horizontal", "vertical"]):
        """
        레이아웃 방향 전환
        
        Args:
            orientation: "horizontal" 또는 "vertical"
        
        Note:
            현재는 기본 구조만 제공. 실제 레이아웃 전환 기능은
            위젯 재배치 로직이 필요하므로 향후 구현 예정.
        """
        if self.orientation == orientation:
            return
        
        self.orientation = orientation
        # TODO: 레이아웃 전환 로직 구현
        # - QHBoxLayout ↔ QVBoxLayout 전환
        # - 위젯 재배치
        # - 크기 조정
    
    def adjust_size_for_orientation(self):
        """
        방향 변경에 따른 크기 조정
        
        레이아웃 방향이 변경되었을 때 호출됩니다.
        현재는 기본 구조만 제공되며 향후 구현 예정입니다.
        """
        if self.main_layout:
            self._update_layout_geometry()
    
    def adjust_panel_size(self):
        """
        컨트롤 패널(툴바) 크기 자동 조정
        
        동적 위젯의 표시/숨김 시 호출되어 컨트롤 패널의 크기를 
        레이아웃에 맞게 자동으로 조정합니다.
        
        참고:
        - 이 메서드는 컨트롤 패널(툴바)의 크기만 조정합니다.
        - 드로잉 영역의 크기 조정과는 무관합니다.
        - 사용자가 직접 툴바를 리사이즈하는 기능은 현재 없습니다.
        
        ControlPanelManager에서 호출됩니다.
        레이아웃 무효화, 활성화, 최적 크기 계산 등을 수행합니다.
        """
        control_panel = self.control_panel_manager.control_panel
        if not control_panel or not control_panel.isVisible():
            return
        
        # 레이아웃을 무효화하고 업데이트
        layout = control_panel.layout()
        if layout:
            # 모든 자식 위젯의 geometry 업데이트
            for i in range(layout.count()):
                item = layout.itemAt(i)
                if item and item.widget():
                    item.widget().updateGeometry()
            
            # 레이아웃 무효화 및 활성화
            layout.invalidate()
            layout.activate()
            
            # 최소 크기 계산 후 적용
            min_size = layout.totalMinimumSize()
            if min_size.isValid():
                # adjustSize() 호출 (레이아웃의 최적 크기로 조정)
                control_panel.adjustSize()
            else:
                # adjustSize() 호출
                control_panel.adjustSize()
        else:
            # 레이아웃이 없으면 그냥 adjustSize() 호출
            control_panel.adjustSize()
        
        # update() 호출로 화면 갱신
        control_panel.update()
    
    def _update_layout_geometry(self):
        """레이아웃 geometry 업데이트 (내부 헬퍼)"""
        if self.main_layout:
            # 방향에 따라 적절한 크기 조정
            self.adjust_panel_size()
    
    def get_optimal_size(self) -> Optional[QSize]:
        """
        현재 레이아웃에 대한 최적 크기 계산
        
        Returns:
            QSize 객체 또는 None
        """
        control_panel = self.control_panel_manager.control_panel
        if not control_panel:
            return None
        
        layout = control_panel.layout()
        if layout:
            return layout.totalMinimumSize()
        return None
    
    def update_screen_info(self):
        """현재 모니터 정보 업데이트"""
        self._get_current_screen()

