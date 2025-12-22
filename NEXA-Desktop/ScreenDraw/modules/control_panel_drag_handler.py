# 컨트롤 패널 드래그 핸들러 모듈
from PySide6.QtCore import Qt, QPoint, QRect
from PySide6.QtWidgets import QApplication


class ControlPanelDragHandler:
    """
    컨트롤 패널 드래그 핸들러 클래스
    
    컨트롤 패널의 드래그 기능을 담당합니다.
    마우스 이벤트를 처리하여 패널을 이동시키고, 모니터 경계를 고려합니다.
    """
    
    def __init__(self, control_panel, window):
        """
        Args:
            control_panel: 드래그할 컨트롤 패널 위젯
            window: ScreenDrawWindow 인스턴스 (드로잉 영역 업데이트 등에 사용)
        """
        self.control_panel = control_panel
        self.window = window
    
    def setup_event_handlers(self):
        """컨트롤 패널에 마우스 이벤트 핸들러 연결"""
        self.control_panel.mousePressEvent = self.handle_mouse_press
        self.control_panel.mouseMoveEvent = self.handle_mouse_move
        self.control_panel.mouseReleaseEvent = self.handle_mouse_release
    
    def handle_mouse_press(self, event):
        """컨트롤 패널 마우스 누름 이벤트 (드래그 시작)"""
        if event.button() == Qt.LeftButton:
            self.window.control_panel_drag_position = event.globalPosition().toPoint() - self.control_panel.frameGeometry().topLeft()
            event.accept()
        else:
            event.ignore()
    
    def handle_mouse_move(self, event):
        """컨트롤 패널 마우스 이동 이벤트 (드래그 중) - 개선된 버전"""
        if self.window.control_panel_drag_position is not None and event.buttons() & Qt.LeftButton:
            # 새 위치 계산
            new_pos = event.globalPosition().toPoint() - self.window.control_panel_drag_position
            panel_width = self.control_panel.width()
            panel_height = self.control_panel.height()
            
            new_x = new_pos.x()
            new_y = new_pos.y()
            
            # 커서 위치가 어떤 모니터에 있는지 판단
            cursor_point = event.globalPosition().toPoint()
            target_screen_info = self.window.get_screen_at_point(cursor_point)
            
            if target_screen_info:
                screen_rect = target_screen_info['geometry']
                
                # 해당 모니터의 경계 내로 제한
                if new_x < screen_rect.left():
                    new_x = screen_rect.left()
                if new_x + panel_width > screen_rect.right():
                    new_x = screen_rect.right() - panel_width
                if new_y < screen_rect.top():
                    new_y = screen_rect.top()
                if new_y + panel_height > screen_rect.bottom():
                    new_y = screen_rect.bottom() - panel_height
                
                # 각 모니터별 설정 적용 (향후 확장 가능)
                # 예: 세로 모니터일 때는 상단 정렬, 가로 모니터일 때는 중앙 정렬 등
                # if target_screen_info['is_portrait']:
                #     # 세로 모니터 특별 처리
                #     pass
            else:
                # 커서가 모니터 밖에 있으면 가장 가까운 모니터 찾기
                target_screen_info = self.window.get_nearest_screen(cursor_point)
                if target_screen_info:
                    screen_rect = target_screen_info['geometry']
                    # 경계 제한
                    if new_x < screen_rect.left():
                        new_x = screen_rect.left()
                    if new_x + panel_width > screen_rect.right():
                        new_x = screen_rect.right() - panel_width
                    if new_y < screen_rect.top():
                        new_y = screen_rect.top()
                    if new_y + panel_height > screen_rect.bottom():
                        new_y = screen_rect.bottom() - panel_height
                else:
                    # 모니터 정보가 없으면 기본 모니터 사용
                    screen = QApplication.primaryScreen().geometry()
                    if new_x < screen.left():
                        new_x = screen.left()
                    if new_x + panel_width > screen.right():
                        new_x = screen.right() - panel_width
                    if new_y < screen.top():
                        new_y = screen.top()
                    if new_y + panel_height > screen.bottom():
                        new_y = screen.bottom() - panel_height
            
            self.control_panel.move(new_x, new_y)
            # 컨트롤 패널 위치 업데이트 (마우스 이벤트 처리용)
            # 모니터 정보 업데이트 (컨트롤 패널 이동 시)
            self._update_monitor_info()
            panel_geo = self.control_panel.geometry()
            self.window.control_panel_rect = QRect(panel_geo.x(), panel_geo.y(), panel_geo.width(), panel_geo.height())
            # Area 모드일 때 드로잉 영역도 함께 이동
            if self.window.drawing_area_mode == "partial":
                self.window.update_drawing_area_rect()
                self.window.update()
            event.accept()
        else:
            event.ignore()
    
    def handle_mouse_release(self, event):
        """컨트롤 패널 마우스 릴리즈 이벤트 (드래그 종료)"""
        if event.button() == Qt.LeftButton:
            self.window.control_panel_drag_position = None
            # 컨트롤 패널 위치 업데이트
            panel_geo = self.control_panel.geometry()
            self.window.control_panel_rect = QRect(panel_geo.x(), panel_geo.y(), panel_geo.width(), panel_geo.height())
            # 모니터 정보 업데이트 (드래그 종료 시 최종 업데이트)
            self._update_monitor_info()
            # 설정 파일에 모든 설정 저장 (위치, Area 모드 정보 등)
            self.window.save_config()
            event.accept()
        else:
            event.ignore()
    
    def _update_monitor_info(self):
        """모니터 정보 업데이트 헬퍼 메서드"""
        if hasattr(self.window, 'control_panel_builder'):
            if hasattr(self.window.control_panel_builder, '_update_monitor_info'):
                self.window.control_panel_builder._update_monitor_info()

