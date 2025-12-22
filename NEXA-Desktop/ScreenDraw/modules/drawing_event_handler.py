# 드로잉 이벤트 핸들러 모듈
from PySide6.QtCore import Qt, QPoint, QRect, QTimer
from PySide6.QtGui import QColor


class DrawingEventHandler:
    """
    드로잉 관련 마우스 이벤트 핸들러 클래스
    
    메인 윈도우의 마우스 이벤트 처리를 담당합니다.
    드로잉, 컬러 픽커, 리사이즈 등의 기능을 처리합니다.
    """
    
    def __init__(self, window):
        """
        Args:
            window: ScreenDrawWindow 인스턴스
        """
        self.window = window
    
    def handle_mouse_press(self, event):
        """마우스 누름 이벤트 처리"""
        # 컬러 픽커 모드일 때는 색상 추출 처리 (drawing_mode와 무관하게 작동)
        if hasattr(self.window, 'color_manager') and self.window.color_manager.color_picker_mode:
            if event.button() == Qt.LeftButton:
                global_pos = event.globalPosition().toPoint()
                # 컨트롤 패널 영역이면 무시
                if hasattr(self.window, 'control_panel') and self.window.control_panel.isVisible():
                    panel_geo = self.window.control_panel.geometry()
                    if panel_geo.contains(global_pos.x(), global_pos.y()):
                        event.ignore()
                        return
                
                picked_color = self.window.color_manager.pick_color_from_screen(global_pos)
                if picked_color.isValid():
                    # 통합 색상 설정 메서드 사용 (픽커 모드이므로 프리뷰 박스도 업데이트)
                    if hasattr(self.window, 'color_manager'):
                        self.window.color_manager.set_color(picked_color, source="picker", update_preview=True)
                    # 색상 선택 후에도 컬러 픽커 모드는 유지 (ESC나 버튼으로 종료)
                event.accept()
                return
        
        if not self.window.drawing_mode:
            event.ignore()
            return
        
        # 컨트롤 패널 영역인지 확인 (독립 윈도우이므로 화면 좌표로 확인)
        if hasattr(self.window, 'control_panel') and self.window.control_panel.isVisible():
            global_pos = event.globalPosition().toPoint()
            panel_geo = self.window.control_panel.geometry()
            if panel_geo.contains(global_pos.x(), global_pos.y()):
                event.ignore()
                return
        
        # Area 모드일 때 드로잉 영역 리사이즈 핸들 확인
        if self.window.drawing_area_mode == "partial" and self.window.drawing_area_rect:
            global_pos = event.globalPosition().toPoint()
            handle = self.window.get_drawing_area_resize_handle(global_pos)
            if handle:
                self.window.drawing_area_resize_handle = handle
                self.window.drawing_area_resize_start_pos = global_pos
                self.window.drawing_area_resize_start_rect = QRect(self.window.drawing_area_rect)
                event.accept()
                return
        
        if event.button() == Qt.LeftButton:
            # Area 모드일 때는 영역 안에서만 드로잉 시작
            if self.window.drawing_area_mode == "partial":
                global_pos = event.globalPosition().toPoint()
                if not self.window.is_point_in_drawing_area(global_pos):
                    event.ignore()
                    return
            
            # 그리기 시작
            self.window.drawing = True
            self.window.last_point = event.position().toPoint()
            self.window.drawing_paths.append({
                'points': [self.window.last_point],
                'color': QColor(self.window.pen_color),
                'width': self.window.pen_width
            })
            event.accept()
    
    def handle_mouse_move(self, event):
        """마우스 이동 이벤트 처리"""
        # 컬러 픽커 모드일 때는 커서만 변경 (별도 처리 없음)
        if hasattr(self.window, 'color_manager') and self.window.color_manager.color_picker_mode:
            event.accept()
            return
        
        if not self.window.drawing_mode:
            event.ignore()
            return
        
        # Area 모드일 때 영역 밖에서는 이벤트를 투과 (일반 마우스 조작 가능)
        if self.window.drawing_area_mode == "partial":
            global_pos = event.globalPosition().toPoint()
            # 리사이즈 중이 아닐 때만 체크
            if not self.window.drawing_area_resize_handle:
                if not self.window.is_point_in_drawing_area(global_pos):
                    # 드로잉 영역 리사이즈 핸들도 아닌 경우에만 이벤트 투과
                    if not (self.window.drawing_area_rect and self.window.get_drawing_area_resize_handle(global_pos)):
                        event.ignore()
                        return
        
        # 컨트롤 패널 영역인지 확인 (실시간으로 위치 확인)
        if hasattr(self.window, 'control_panel') and self.window.control_panel.isVisible():
            global_pos = event.globalPosition().toPoint()
            panel_geo = self.window.control_panel.geometry()
            if panel_geo.contains(global_pos.x(), global_pos.y()):
                event.ignore()
                return
        
        # Area 모드일 때 리사이즈 처리
        if self.window.drawing_area_mode == "partial" and self.window.drawing_area_resize_handle:
            if event.buttons() & Qt.LeftButton and hasattr(self.window, 'drawing_area_resize_start_rect'):
                self._handle_resize_move(event)
                event.accept()
                return
        
        # Area 모드일 때 드로잉 영역 외부는 무시
        if self.window.drawing_area_mode == "partial":
            global_pos = event.globalPosition().toPoint()
            if not self.window.is_point_in_drawing_area(global_pos):
                # 드로잉 중이었다면 종료
                if self.window.drawing:
                    self.window.drawing = False
                event.ignore()
                return
            
        if self.window.drawing and event.buttons() & Qt.LeftButton:
            # Area 모드일 때는 영역 안에서만 계속 그리기
            if self.window.drawing_area_mode == "partial":
                global_pos = event.globalPosition().toPoint()
                if not self.window.is_point_in_drawing_area(global_pos):
                    # 영역 밖으로 나가면 드로잉 중지
                    self.window.drawing = False
                    event.ignore()
                    return
            
            # 그리기 중
            current_point = event.position().toPoint()
            if len(self.window.drawing_paths) > 0:
                self.window.drawing_paths[-1]['points'].append(current_point)
            self.window.last_point = current_point
            self.window.update()  # 화면 갱신하여 실시간으로 그리기 표시
            # 그리기 중에도 컨트롤 패널이 최상위에 있도록 유지
            if hasattr(self.window, 'control_panel') and self.window.control_panel.isVisible():
                QTimer.singleShot(10, lambda: self.window.control_panel.raise_() if hasattr(self.window, 'control_panel') else None)
            event.accept()
        else:
            event.ignore()
    
    def handle_mouse_release(self, event):
        """마우스 릴리즈 이벤트 처리"""
        if event.button() == Qt.LeftButton:
            self.window.drawing = False
            if hasattr(self.window, 'drag_position'):
                del self.window.drag_position
            # 리사이즈 종료
            if self.window.drawing_area_resize_handle:
                self.window.drawing_area_resize_handle = None
                self.window.drawing_area_resize_start_pos = None
                if hasattr(self.window, 'drawing_area_resize_start_rect'):
                    del self.window.drawing_area_resize_start_rect
                # Area 모드 리사이즈 후 설정 저장
                if self.window.drawing_area_mode == "partial":
                    self.window.save_config()
            # 드로잉 종료 후 컨트롤 패널을 최상위로 유지
            if hasattr(self.window, 'control_panel') and self.window.control_panel.isVisible():
                def ensure_panel_on_top():
                    if hasattr(self.window, 'control_panel') and self.window.control_panel.isVisible():
                        self.window.control_panel.raise_()
                        self.window.control_panel.activateWindow()
                QTimer.singleShot(10, ensure_panel_on_top)
    
    def _handle_resize_move(self, event):
        """드로잉 영역 리사이즈 처리 (Area 모드)"""
        from PySide6.QtWidgets import QApplication
        
        # 모든 모니터를 포함한 전체 영역 계산
        screens = QApplication.screens()
        if screens:
            min_x = min(s.geometry().x() for s in screens)
            min_y = min(s.geometry().y() for s in screens)
            max_x = max(s.geometry().x() + s.geometry().width() for s in screens)
            max_y = max(s.geometry().y() + s.geometry().height() for s in screens)
            all_screens_rect = QRect(min_x, min_y, max_x - min_x, max_y - min_y)
        else:
            screen = QApplication.primaryScreen().geometry()
            all_screens_rect = QRect(screen.x(), screen.y(), screen.width(), screen.height())
        
        current_global_pos = event.globalPosition().toPoint()
        delta = current_global_pos - self.window.drawing_area_resize_start_pos
        rect = QRect(self.window.drawing_area_resize_start_rect)
        
        handle = self.window.drawing_area_resize_handle
        if "left" in handle:
            rect.setLeft(rect.left() + delta.x())
        if "right" in handle:
            rect.setRight(rect.right() + delta.x())
        if "top" in handle:
            rect.setTop(rect.top() + delta.y())
        if "bottom" in handle:
            rect.setBottom(rect.bottom() + delta.y())
        
        # 최소 크기 제한
        if rect.width() < 200:
            if "left" in handle:
                rect.setLeft(rect.right() - 200)
            else:
                rect.setRight(rect.left() + 200)
        if rect.height() < 200:
            if "top" in handle:
                rect.setTop(rect.bottom() - 200)
            else:
                rect.setBottom(rect.top() + 200)
        
        # 모든 모니터를 포함한 전체 영역 경계 체크
        if rect.left() < all_screens_rect.left():
            if "left" in handle:
                rect.setLeft(all_screens_rect.left())
            else:
                rect.setRight(rect.left() + rect.width())
        if rect.right() > all_screens_rect.right():
            if "right" in handle:
                rect.setRight(all_screens_rect.right())
            else:
                rect.setLeft(rect.right() - rect.width())
        if rect.top() < all_screens_rect.top():
            if "top" in handle:
                rect.setTop(all_screens_rect.top())
            else:
                rect.setBottom(rect.top() + rect.height())
        if rect.bottom() > all_screens_rect.bottom():
            if "bottom" in handle:
                rect.setBottom(all_screens_rect.bottom())
            else:
                rect.setTop(rect.bottom() - rect.height())
        
        self.window.drawing_area_rect = rect
        self.window.update()

