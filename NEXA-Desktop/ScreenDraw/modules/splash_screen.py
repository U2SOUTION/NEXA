# 스플래시 스크린 모듈
from PySide6.QtWidgets import QWidget, QLabel, QProgressBar, QVBoxLayout
from PySide6.QtCore import Qt, QTimer, QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QPainter, QFont, QColor, QPen, QBrush
from modules.config.ui_constants import ColorValues, TextColors, SplashScreenConstants
import os


class SplashScreen(QWidget):
    """스플래시 스크린 위젯"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowFlags(
            Qt.Window | 
            Qt.WindowStaysOnTopHint | 
            Qt.FramelessWindowHint | 
            Qt.SplashScreen
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        
        # 윈도우 크기 설정
        self.setFixedSize(1000, 360)
        
        # 레이아웃 설정
        layout = QVBoxLayout()  # 수직 레이아웃 (위젯들을 세로로 배치)
        # setContentsMargins(left, top, right, bottom): 레이아웃의 여백 설정 (픽셀 단위)
        # - left: 왼쪽 여백 (40px)
        # - top: 위쪽 여백 (40px)
        # - right: 오른쪽 여백 (40px)
        # - bottom: 아래쪽 여백 (40px)
        layout.setContentsMargins(10, 10, 10, 10)
        # setSpacing(value): 레이아웃 내 위젯들 사이의 간격 설정 (픽셀 단위)
        # - value: 위젯 간 간격 (10px)
        layout.setSpacing(1)
        
        # 메인 타이틀 (NEXA)
        self.title_label = QLabel("NEXA")
        title_font = QFont()
        title_font.setFamily("Arial Black")  # 두꺼운 폰트
        title_font.setPointSize(200)
        title_font.setBold(True)
        title_font.setWeight(QFont.Black)  # 최대한 두껍게
        self.title_label.setFont(title_font)
        self.title_label.setAlignment(Qt.AlignCenter)
        # 브랜드 색상 사용
        self.title_label.setStyleSheet(f"color: {ColorValues.BRAND}; background: transparent;")
        
        # 서브 타이틀 (U2 SOLUTION) - 메인 타이틀과 가로 길이 맞추기
        self.subtitle_label = QLabel("U2 SOLUTION")
        subtitle_font = QFont()
        subtitle_font.setFamily("Arial")
        subtitle_font.setPointSize(17)
        subtitle_font.setBold(True)
        self.subtitle_label.setFont(subtitle_font)
        self.subtitle_label.setAlignment(Qt.AlignCenter)
        # 브랜드 색상 사용 (더 어둡게)
        self.subtitle_label.setStyleSheet(f"color: {TextColors.BRAND}; background: transparent;")
        
        # 메인 타이틀과 서브 타이틀의 가로 길이를 맞추기 위해 폰트 크기 조정
        # 레이아웃이 설정된 후에 폰트 크기를 조정
        self._adjust_subtitle_width = True
        
        # 프로그레스바 (크기를 절반으로 줄이고 중앙 정렬)
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setValue(0)
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setFixedHeight(4)
        # 너비를 윈도우 너비의 절반으로 설정
        progress_width = self.width() // 1.5
        self.progress_bar.setFixedWidth(progress_width)
        # 브랜드 색상을 사용한 프로그레스바 스타일
        brand_color = ColorValues.BRAND
        # 헥사 코드를 RGB로 변환하여 rgba 문자열 생성
        r = int(brand_color[1:3], 16)
        g = int(brand_color[3:5], 16)
        b = int(brand_color[5:7], 16)
        brand_rgba_light = f"rgba({r}, {g}, {b}, 100)"
        
        self.progress_bar.setStyleSheet(f"""
            QProgressBar {{
                border: none;
                background-color: {brand_rgba_light};
                border-radius: 2px;
            }}
            QProgressBar::chunk {{
                background-color: {brand_color};
                border-radius: 2px;
            }}
        """)
        
        # 레이아웃에 추가
        # addStretch(): 유연한 공간 추가 (위젯들을 중앙에 배치하기 위한 공간)
        layout.addStretch()  # 상단 여백 공간
        # addWidget(widget): 위젯을 레이아웃에 추가
        layout.addWidget(self.title_label)  # 메인 타이틀 (NEXA)
        layout.addWidget(self.subtitle_label)  # 서브 타이틀 (U2 SOLUTION)
        layout.addStretch()  # 하단 여백 공간
        # 프로그레스바를 중앙 정렬하기 위한 레이아웃
        progress_container = QWidget()  # 프로그레스바를 감싸는 컨테이너 위젯
        progress_layout = QVBoxLayout()  # 프로그레스바 컨테이너의 수직 레이아웃
        # setContentsMargins(0, 0, 0, 0): 컨테이너 내부 여백 제거 (왼쪽, 위, 오른쪽, 아래 모두 0px)
        progress_layout.setContentsMargins(0, 0, 0, 0)
        # addWidget(widget, alignment): 위젯을 레이아웃에 추가하고 정렬 설정
        # - widget: 추가할 위젯 (self.progress_bar)
        # - alignment: 정렬 방식 (Qt.AlignCenter = 중앙 정렬)
        progress_layout.addWidget(self.progress_bar, alignment=Qt.AlignCenter)
        progress_container.setLayout(progress_layout)  # 컨테이너에 레이아웃 설정
        layout.addWidget(progress_container)  # 메인 레이아웃에 컨테이너 추가
        
        self.setLayout(layout)
        
        # 중앙 정렬을 위한 변수
        self._center_position = None
        
        # 페이드 인 애니메이션
        self.setWindowOpacity(0.0)
        self.fade_animation = QPropertyAnimation(self, b"windowOpacity")
        self.fade_animation.setDuration(300)
        self.fade_animation.setStartValue(0.0)
        self.fade_animation.setEndValue(1.0)
        self.fade_animation.setEasingCurve(QEasingCurve.InOutQuad)
        
    def showEvent(self, event):
        """표시 시 중앙 정렬 및 페이드 인"""
        super().showEvent(event)
        self._center_on_screen()
        
        # 서브 타이틀 폰트 크기 조정 (메인 타이틀과 가로 길이 맞추기)
        if self._adjust_subtitle_width:
            self._adjust_subtitle_to_match_title()
        
        self.fade_animation.start()
    
    def _adjust_subtitle_to_match_title(self):
        """서브 타이틀의 가로 길이를 메인 타이틀과 맞추기"""
        from PySide6.QtGui import QFontMetrics
        
        # 메인 타이틀의 실제 너비 측정
        title_metrics = QFontMetrics(self.title_label.font())
        title_width = title_metrics.horizontalAdvance(self.title_label.text())
        
        # 서브 타이틀의 현재 너비 측정
        subtitle_metrics = QFontMetrics(self.subtitle_label.font())
        subtitle_text = self.subtitle_label.text()
        current_subtitle_width = subtitle_metrics.horizontalAdvance(subtitle_text)
        
        # 비율 계산하여 폰트 크기 조정
        if current_subtitle_width > 0 and title_width > 0:
            scale_factor = title_width / current_subtitle_width
            current_size = self.subtitle_label.font().pointSize()
            new_size = int(current_size * scale_factor)
            
            # 폰트 크기 업데이트
            subtitle_font = self.subtitle_label.font()
            subtitle_font.setPointSize(new_size)
            self.subtitle_label.setFont(subtitle_font)
        
        self._adjust_subtitle_width = False
        
    def _center_on_screen(self):
        """화면 중앙에 배치"""
        from PySide6.QtWidgets import QApplication
        screen = QApplication.primaryScreen().geometry()
        x = (screen.width() - self.width()) // 2
        y = (screen.height() - self.height()) // 2
        self.move(x, y)
        
    def set_progress(self, value: int):
        """프로그레스바 값 설정 (0-100)"""
        self.progress_bar.setValue(value)
        from PySide6.QtWidgets import QApplication
        QApplication.processEvents()
    
    def animate_progress(self, duration_ms: int = None, callback=None):
        """
        프로그레스바를 부드럽게 애니메이션 (0에서 100까지)
        
        Args:
            duration_ms: 애니메이션 지속 시간 (밀리초). None이면 SplashScreenConstants.MIN_DISPLAY_TIME 사용
            callback: 애니메이션 완료 후 호출할 콜백 함수
        """
        if duration_ms is None:
            duration_ms = SplashScreenConstants.MIN_DISPLAY_TIME
        
        # 프로그레스바를 0으로 초기화
        self.progress_bar.setValue(0)
        
        # 애니메이션 단계 수 (부드러운 애니메이션을 위해 100단계)
        steps = 100
        step_duration = duration_ms // steps
        current_step = 0
        
        def update_progress():
            nonlocal current_step
            if current_step <= steps:
                # 0에서 100까지 선형 증가
                progress_value = int((current_step / steps) * 100)
                self.progress_bar.setValue(progress_value)
                from PySide6.QtWidgets import QApplication
                QApplication.processEvents()
                
                current_step += 1
                if current_step <= steps:
                    QTimer.singleShot(step_duration, update_progress)
                else:
                    # 애니메이션 완료
                    if callback:
                        callback()
        
        # 첫 번째 업데이트 시작
        QTimer.singleShot(step_duration, update_progress)
        
    def paintEvent(self, event):
        """투명 배경 그리기 (선택적: 약간의 그림자 효과)"""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 투명 배경 (선택적: 약간의 어두운 배경 추가 가능)
        # painter.fillRect(self.rect(), QColor(0, 0, 0, 0))  # 완전 투명
        
        # 선택적: 약간의 반투명 배경 (더 보기 좋게)
        painter.fillRect(self.rect(), QColor(0, 0, 0, 0))  # 완전 투명 유지
        
        super().paintEvent(event)

