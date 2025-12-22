# 모니터 관리 모듈
from PySide6.QtWidgets import QApplication
from PySide6.QtGui import QScreen
from PySide6.QtCore import QPoint, QRect
from typing import Optional, List, Dict


class ScreenManager:
    """
    모니터(스크린) 관리 클래스
    
    다중 모니터 환경에서 모니터 감지, 위치 계산, 정보 제공 등의 기능을 중앙 집중식으로 관리합니다.
    앞으로 인터랙티브 기능과 설정 요소가 증가할 때 모니터 관련 로직을 일관되게 처리할 수 있도록 설계되었습니다.
    """
    
    def __init__(self):
        """ScreenManager 초기화"""
        self._screens_cache: Optional[List[QScreen]] = None
        self._screens_info_cache: Optional[List[Dict]] = None
        self._refresh_screens()
    
    def _refresh_screens(self):
        """모니터 정보 새로고침 (캐시 업데이트)"""
        self._screens_cache = QApplication.screens()
        self._screens_info_cache = []
        
        for idx, screen in enumerate(self._screens_cache):
            screen_rect = screen.geometry()
            screen_info = {
                'index': idx,
                'screen': screen,
                'geometry': screen_rect,
                'x': screen_rect.x(),
                'y': screen_rect.y(),
                'width': screen_rect.width(),
                'height': screen_rect.height(),
                'is_primary': screen == QApplication.primaryScreen(),
                'is_landscape': screen_rect.width() > screen_rect.height(),
                'is_portrait': screen_rect.height() > screen_rect.width(),
                'name': screen.name() if hasattr(screen, 'name') else f"Screen {idx + 1}"
            }
            self._screens_info_cache.append(screen_info)
    
    def get_screens(self) -> List[QScreen]:
        """모든 모니터 목록 반환"""
        if self._screens_cache is None:
            self._refresh_screens()
        return self._screens_cache or []
    
    def get_screens_info(self) -> List[Dict]:
        """모든 모니터 정보 목록 반환"""
        if self._screens_info_cache is None:
            self._refresh_screens()
        return self._screens_info_cache or []
    
    def get_screen_at_point(self, point: QPoint) -> Optional[QScreen]:
        """
        특정 좌표가 속한 모니터 반환
        
        Args:
            point: 확인할 좌표 (QPoint)
        
        Returns:
            해당 좌표가 속한 QScreen 객체, 없으면 None
        """
        screens = self.get_screens()
        for screen in screens:
            screen_rect = screen.geometry()
            if screen_rect.contains(point):
                return screen
        return None
    
    def get_screen_for_rect(self, rect: QRect) -> Optional[QScreen]:
        """
        사각형이 속한 모니터 반환 (중심점 기준)
        
        Args:
            rect: 확인할 사각형 (QRect)
        
        Returns:
            사각형의 중심점이 속한 QScreen 객체, 없으면 None
        """
        if not rect or not rect.isValid():
            return QApplication.primaryScreen()
        
        center_point = rect.center()
        return self.get_screen_at_point(center_point) or QApplication.primaryScreen()
    
    def get_screen_for_widget(self, widget) -> Optional[QScreen]:
        """
        위젯이 위치한 모니터 반환
        
        Args:
            widget: 확인할 위젯 (QWidget)
        
        Returns:
            위젯이 위치한 QScreen 객체, 없으면 기본 모니터
        """
        if not widget or not widget.isVisible():
            return QApplication.primaryScreen()
        
        widget_geo = widget.geometry()
        center_point = widget_geo.center()
        return self.get_screen_at_point(center_point) or QApplication.primaryScreen()
    
    def get_screen_index(self, screen: QScreen) -> int:
        """
        모니터의 인덱스 반환 (0-based)
        
        Args:
            screen: 확인할 QScreen 객체
        
        Returns:
            모니터 인덱스 (0부터 시작), 없으면 0
        """
        screens = self.get_screens()
        try:
            return screens.index(screen)
        except ValueError:
            return 0
    
    def get_screen_info(self, screen: QScreen) -> Optional[Dict]:
        """
        모니터 정보 딕셔너리 반환
        
        Args:
            screen: 확인할 QScreen 객체
        
        Returns:
            모니터 정보 딕셔너리, 없으면 None
        """
        screens_info = self.get_screens_info()
        for info in screens_info:
            if info['screen'] == screen:
                return info
        return None
    
    def get_center_position_for_screen(self, screen: QScreen, widget_width: int = 600, widget_height: int = 500) -> QPoint:
        """
        특정 모니터의 중앙 좌표 계산 (위젯 배치용)
        
        Args:
            screen: 대상 모니터 (QScreen)
            widget_width: 배치할 위젯의 너비
            widget_height: 배치할 위젯의 높이
        
        Returns:
            중앙 좌표 (QPoint)
        """
        screen_rect = screen.geometry()
        x = screen_rect.x() + (screen_rect.width() - widget_width) // 2
        y = screen_rect.y() + (screen_rect.height() - widget_height) // 2
        return QPoint(x, y)
    
    def get_nearest_screen(self, point: QPoint) -> Optional[QScreen]:
        """
        특정 좌표에서 가장 가까운 모니터 반환
        
        Args:
            point: 확인할 좌표 (QPoint)
        
        Returns:
            가장 가까운 QScreen 객체, 없으면 None
        """
        screens = self.get_screens()
        if not screens:
            return None
        
        min_distance = float('inf')
        nearest_screen = None
        
        for screen in screens:
            screen_rect = screen.geometry()
            center_x = screen_rect.x() + screen_rect.width() // 2
            center_y = screen_rect.y() + screen_rect.height() // 2
            distance = ((point.x() - center_x) ** 2 + (point.y() - center_y) ** 2) ** 0.5
            
            if distance < min_distance:
                min_distance = distance
                nearest_screen = screen
        
        return nearest_screen or QApplication.primaryScreen()
    
    def refresh(self):
        """모니터 정보 강제 새로고침 (모니터 구성 변경 시 호출)"""
        self._refresh_screens()

