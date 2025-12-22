# 액션 버튼 관리 모듈
from PySide6.QtWidgets import QPushButton, QMenu, QApplication
from PySide6.QtGui import QPainter, QPen, QPixmap, QClipboard
from PySide6.QtCore import Qt, QPoint, QRect
from PySide6.QtGui import QColor
from datetime import datetime
from typing import Dict, Optional

class ActionButtons:
    """액션 버튼 관리 클래스"""
    
    def __init__(self, parent_window):
        """
        Args:
            parent_window: ScreenDrawWindow 인스턴스
        """
        self.parent_window = parent_window
    
    def clear_drawing(self):
        """그린 내용 모두 지우기"""
        self.parent_window.drawing_paths = []
        self.parent_window.update()
    
    def save_screenshot(self, mode: str = "clipboard", save_mode: str = "drawing_area"):
        """
        캡처 및 저장
        
        Args:
            mode: "clipboard" 또는 "file"
            save_mode: "drawing_area" (드로잉 영역), "current_monitor" (현재 모니터), "all_monitors" (모든 모니터)
        """
        pixmap = None
        
        if save_mode == "drawing_area":
            pixmap = self._capture_drawing_area()
        elif save_mode == "current_monitor":
            pixmap = self._capture_current_monitor()
        elif save_mode == "all_monitors":
            pixmap = self._capture_all_monitors()
        else:
            # 기본값: 드로잉 영역
            pixmap = self._capture_drawing_area()
        
        if not pixmap or pixmap.isNull():
            self.parent_window.show_message("캡처 실패")
            return
        
        if mode == "clipboard":
            # 클립보드에 저장
            clipboard = QApplication.clipboard()
            clipboard.setPixmap(pixmap)
            self.parent_window.show_message("클립보드에 저장되었습니다")
        else:
            # 파일로 저장
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            save_mode_suffix = f"_{save_mode}" if save_mode != "drawing_area" else ""
            filename = f"screen_capture{save_mode_suffix}_{timestamp}.png"
            
            if pixmap.save(filename):
                self.parent_window.show_message(f"저장 완료: {filename}")
            else:
                self.parent_window.show_message("저장 실패")
    
    def _capture_drawing_area(self) -> QPixmap:
        """드로잉 영역 캡처"""
        if self.parent_window.drawing_area_mode == "partial" and self.parent_window.drawing_area_rect:
            # Area 모드: 지정된 드로잉 영역만 캡처
            area_rect = self.parent_window.drawing_area_rect
            
            # 드로잉 영역이 속한 모니터 감지
            target_screen = self.parent_window.get_screen_for_rect(area_rect)
            
            # 해당 모니터의 전체 스크린샷
            full_pixmap = target_screen.grabWindow(0)
            screen_geometry = target_screen.geometry()
            
            # 드로잉 영역을 모니터 기준 좌표로 변환
            area_in_screen = QRect(
                area_rect.x() - screen_geometry.x(),
                area_rect.y() - screen_geometry.y(),
                area_rect.width(),
                area_rect.height()
            )
            
            # 모니터 내 영역만 복사
            pixmap = full_pixmap.copy(area_in_screen)
        else:
            # Screen 모드: 현재 모니터 전체 캡처
            target_screen = self.parent_window.get_current_monitor_screen()
            pixmap = target_screen.grabWindow(0)
        
        # 그린 내용을 캡처에 추가
        return self._draw_paths_on_pixmap(pixmap, "drawing_area")
    
    def _capture_current_monitor(self) -> QPixmap:
        """현재 모니터 전체 캡처"""
        target_screen = self.parent_window.get_current_monitor_screen()
        pixmap = target_screen.grabWindow(0)
        
        # 그린 내용을 캡처에 추가
        return self._draw_paths_on_pixmap(pixmap, "current_monitor")
    
    def _capture_all_monitors(self) -> QPixmap:
        """모든 모니터 캡처"""
        screens = QApplication.screens()
        if not screens:
            return self._capture_current_monitor()
        
        # 모든 모니터를 포함한 전체 영역 계산
        min_x = min(s.geometry().x() for s in screens)
        min_y = min(s.geometry().y() for s in screens)
        max_x = max(s.geometry().x() + s.geometry().width() for s in screens)
        max_y = max(s.geometry().y() + s.geometry().height() for s in screens)
        
        # 전체 영역 크기의 빈 픽스맵 생성
        all_monitors_pixmap = QPixmap(max_x - min_x, max_y - min_y)
        all_monitors_pixmap.fill(QColor(0, 0, 0, 0))  # 투명 배경
        
        painter = QPainter(all_monitors_pixmap)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 각 모니터를 전체 픽스맵에 그리기
        for screen in screens:
            screen_geometry = screen.geometry()
            screen_pixmap = screen.grabWindow(0)
            
            # 모니터를 전체 픽스맵의 올바른 위치에 그리기
            target_x = screen_geometry.x() - min_x
            target_y = screen_geometry.y() - min_y
            painter.drawPixmap(target_x, target_y, screen_pixmap)
        
        painter.end()
        
        # 그린 내용을 캡처에 추가
        return self._draw_paths_on_pixmap(all_monitors_pixmap, "all_monitors")
    
    def _draw_paths_on_pixmap(self, pixmap: QPixmap, capture_mode: str = "drawing_area") -> QPixmap:
        """픽스맵에 그린 경로들을 추가
        
        Args:
            pixmap: 그릴 픽스맵
            capture_mode: "drawing_area", "current_monitor", "all_monitors"
        """
        if not pixmap or pixmap.isNull():
            return pixmap
        
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 캡처 모드에 따라 좌표 변환 방식 결정
        offset_x = 0
        offset_y = 0
        target_screen_geometry = None
        
        if capture_mode == "drawing_area" and self.parent_window.drawing_area_mode == "partial" and self.parent_window.drawing_area_rect:
            # Area 모드: 드로잉 영역이 속한 모니터의 geometry 가져오기
            area_rect = self.parent_window.drawing_area_rect
            target_screen = self.parent_window.get_screen_for_rect(area_rect)
            target_screen_geometry = target_screen.geometry()
            # 드로잉 영역의 시작점을 0,0으로 만들기 위한 오프셋
            offset_x = -area_rect.x()
            offset_y = -area_rect.y()
        elif capture_mode == "all_monitors":
            # 모든 모니터 캡처: 모든 모니터를 포함한 전체 영역의 최소 좌표를 offset으로 사용
            screens = QApplication.screens()
            if screens:
                min_x = min(s.geometry().x() for s in screens)
                min_y = min(s.geometry().y() for s in screens)
                # 전체 픽스맵이 이미 모든 모니터를 포함하므로 offset은 0
                offset_x = -min_x
                offset_y = -min_y
            target_screen_geometry = None  # 모든 모니터이므로 단일 geometry 없음
        else:
            # Screen 모드 또는 현재 모니터 캡처: 현재 모니터의 geometry만 사용
            target_screen = self.parent_window.get_current_monitor_screen()
            target_screen_geometry = target_screen.geometry()
            # 전체 모니터 캡처이므로 offset 불필요
        
        for path_data in self.parent_window.drawing_paths:
            points = path_data['points']
            if len(points) > 1:
                pen = QPen(path_data['color'], path_data['width'])
                pen.setCapStyle(Qt.RoundCap)
                pen.setJoinStyle(Qt.RoundJoin)
                painter.setPen(pen)
                
                # 화면 좌표를 픽스맵 좌표로 변환
                for i in range(len(points) - 1):
                    p1 = points[i]
                    p2 = points[i + 1]
                    
                    # 윈도우 좌표를 화면 좌표(global)로 변환
                    global_p1 = self.parent_window.mapToGlobal(p1)
                    global_p2 = self.parent_window.mapToGlobal(p2)
                    
                    # 픽스맵 좌표로 변환 (모니터 오프셋 고려)
                    if capture_mode == "all_monitors":
                        # 모든 모니터 캡처: 전체 픽스맵 좌표계 사용
                        pixmap_p1 = QPoint(global_p1.x() + offset_x, global_p1.y() + offset_y)
                        pixmap_p2 = QPoint(global_p2.x() + offset_x, global_p2.y() + offset_y)
                    elif target_screen_geometry:
                        # 단일 모니터 캡처: 모니터 기준 좌표 변환
                        pixmap_p1 = QPoint(
                            global_p1.x() - target_screen_geometry.x() + offset_x,
                            global_p1.y() - target_screen_geometry.y() + offset_y
                        )
                        pixmap_p2 = QPoint(
                            global_p2.x() - target_screen_geometry.x() + offset_x,
                            global_p2.y() - target_screen_geometry.y() + offset_y
                        )
                    else:
                        pixmap_p1 = QPoint(global_p1.x() + offset_x, global_p1.y() + offset_y)
                        pixmap_p2 = QPoint(global_p2.x() + offset_x, global_p2.y() + offset_y)
                    
                    painter.drawLine(pixmap_p1, pixmap_p2)
                
                # 첫 점도 그리기 (원점)
                if len(points) > 0:
                    p0 = points[0]
                    global_p0 = self.parent_window.mapToGlobal(p0)
                    if capture_mode == "all_monitors":
                        # 모든 모니터 캡처: 전체 픽스맵 좌표계 사용
                        pixmap_p0 = QPoint(global_p0.x() + offset_x, global_p0.y() + offset_y)
                    elif target_screen_geometry:
                        # 단일 모니터 캡처: 모니터 기준 좌표 변환
                        pixmap_p0 = QPoint(
                            global_p0.x() - target_screen_geometry.x() + offset_x,
                            global_p0.y() - target_screen_geometry.y() + offset_y
                        )
                    else:
                        pixmap_p0 = QPoint(global_p0.x() + offset_x, global_p0.y() + offset_y)
                    painter.drawEllipse(pixmap_p0, path_data['width']//2, path_data['width']//2)
        
        painter.end()
        return pixmap
    
    def toggle_drawing_area_mode(self):
        """드로잉 영역 모드 토글 (Screen/Area)"""
        if self.parent_window.drawing_area_mode == "full":
            self.parent_window.drawing_area_mode = "partial"
            self.parent_window.draw_mode_btn.setText("Area")
            # Area 모드 초기화 (컨트롤 패널 아래)
            self.parent_window.update_drawing_area_rect()
            # Area 모드: 캡처 버튼에서 메뉴 제거 (바로 실행되도록)
            if hasattr(self.parent_window, 'save_btn') and self.parent_window.save_btn:
                self.parent_window.save_btn.setMenu(None)
        else:
            self.parent_window.drawing_area_mode = "full"
            self.parent_window.draw_mode_btn.setText("Screen")
            self.parent_window.drawing_area_rect = None
            # Screen 모드: 캡처 버튼에 메뉴 추가 (옵션 선택 가능)
            if hasattr(self.parent_window, 'save_btn') and self.parent_window.save_btn:
                if hasattr(self.parent_window, 'capture_menu') and self.parent_window.capture_menu:
                    self.parent_window.save_btn.setMenu(self.parent_window.capture_menu)
        self.parent_window.update()
        # 설정 저장은 parent_window에서 처리
        if hasattr(self.parent_window, 'save_config'):
            self.parent_window.save_config()
    
    def create_action_buttons(self) -> Dict[str, QPushButton]:
        """액션 버튼들 생성"""
        # 드로잉 영역 모드 토글 버튼
        draw_mode_btn = QPushButton("Screen")
        draw_mode_btn.clicked.connect(self.toggle_drawing_area_mode)
        
        # 지우기 버튼
        clear_btn = QPushButton("지우기")
        clear_btn.clicked.connect(self.clear_drawing)
        
        # 저장 버튼 (드롭다운 메뉴)
        from PySide6.QtWidgets import QMenu
        save_btn = QPushButton("캡처 ▼")
        save_menu = QMenu()
        save_menu.addAction("전체 화면 저장", lambda: self.save_screenshot("full"))
        save_menu.addAction("드로잉 영역만 저장", lambda: self.save_screenshot("area"))
        save_menu.addAction("클립보드에만 저장", lambda: self.save_screenshot("clipboard"))
        save_btn.setMenu(save_menu)
        
        return {
            'draw_mode': draw_mode_btn,
            'clear': clear_btn,
            'save': save_btn
        }

