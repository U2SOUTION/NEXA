# 플랫폼 통신 모듈
from PySide6.QtWidgets import QWidget, QPushButton, QVBoxLayout, QLabel
from PySide6.QtCore import Qt
from datetime import datetime
from typing import Optional

# 웹 플랫폼 연결 (선택적)
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

class PlatformCommunicator:
    """플랫폼 통신 관리 클래스"""
    
    def __init__(self, parent_window, api_url: str = "http://localhost:3000/api/screendraw"):
        """
        Args:
            parent_window: ScreenDrawWindow 인스턴스
            api_url: 플랫폼 API URL
        """
        self.parent_window = parent_window
        self.api_url = api_url
        self.connected = False
    
    def send_to_platform(self):
        """웹 플랫폼으로 드로잉 데이터 전송"""
        if not HAS_REQUESTS:
            self.parent_window.show_message("requests 라이브러리가 설치되지 않았습니다")
            return
        
        # 드로잉 데이터를 JSON으로 변환
        drawing_data = {
            'drawing_paths': [],
            'timestamp': datetime.now().isoformat(),
            'drawing_area_mode': self.parent_window.drawing_area_mode
        }
        
        for path_data in self.parent_window.drawing_paths:
            # QPoint를 튜플로 변환
            points = [(p.x(), p.y()) for p in path_data['points']]
            # QColor를 문자열로 변환
            color = path_data['color'].name()
            drawing_data['drawing_paths'].append({
                'points': points,
                'color': color,
                'width': path_data['width']
            })
        
        # Area 모드일 때 영역 정보 추가
        if self.parent_window.drawing_area_mode == "partial" and self.parent_window.drawing_area_rect:
            drawing_data['drawing_area'] = {
                'x': self.parent_window.drawing_area_rect.x(),
                'y': self.parent_window.drawing_area_rect.y(),
                'width': self.parent_window.drawing_area_rect.width(),
                'height': self.parent_window.drawing_area_rect.height()
            }
        
        try:
            # NEXA 플랫폼 서버로 전송
            response = requests.post(
                self.api_url,
                json=drawing_data,
                timeout=5
            )
            if response.status_code == 200:
                self.parent_window.show_message("플랫폼으로 전송 완료")
            else:
                self.parent_window.show_message(f"전송 실패: {response.status_code}")
        except requests.exceptions.ConnectionError:
            self.parent_window.show_message("서버에 연결할 수 없습니다 (포트 3000 확인)")
        except Exception as e:
            self.parent_window.show_message(f"전송 오류: {str(e)}")
    
    def create_platform_ui(self, parent: QWidget) -> Optional[QPushButton]:
        """플랫폼 통신 UI 생성"""
        if HAS_REQUESTS:
            send_btn = QPushButton("플랫폼 전송")
            send_btn.clicked.connect(self.send_to_platform)
            return send_btn
        return None

