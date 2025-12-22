# 화면에 그림을 그려 문제점을 표시하고 캡처하는 도구
import sys
import traceback

try:
    from PySide6.QtWidgets import (QApplication, QWidget, QPushButton, QHBoxLayout, 
                                    QVBoxLayout, QSpinBox, QLabel,
                                    QSystemTrayIcon, QMenu)
    from PySide6.QtCore import QFileSystemWatcher, QTimer
    from PySide6.QtCore import Qt, QPoint, QRect, QThread, Signal, QFileSystemWatcher, QTimer
    from PySide6.QtGui import QPainter, QPen, QColor, QPixmap, QIcon, QScreen, QKeySequence, QShortcut, QClipboard, QPolygon, QFont
    from datetime import datetime
    import os
    import json
    from pynput import keyboard
    
    # 모듈 import
    from modules.ui_widgets import PenStrokeWidthDisplayWidget, PresetPenStrokeWidthButton, PresetColorButton
    from modules.config_manager import ConfigManager
    from modules.color_manager import ColorManager
    from modules.pen_stroke_width_manager import PenStrokeWidthManager
    from modules.action_buttons import ActionButtons
    from modules.platform_communicator import PlatformCommunicator, HAS_REQUESTS
    from modules.control_panel_manager import ControlPanelManager
    from modules.control_panel_layout_manager import ControlPanelLayoutManager
    from modules.settings_dialog import SettingsDialog
    from modules.control_panel_builder import ControlPanelBuilder
    from modules.drawing_event_handler import DrawingEventHandler
    from modules.control_panel_drag_handler import ControlPanelDragHandler
    from modules.splash_screen import SplashScreen
    from modules.config.ui_constants import Colors, BorderWidths, Sizes, BackgroundColors, TextColors, BorderRadius, Padding
    
    # 웹 플랫폼 연결 (선택적)
    # HAS_REQUESTS는 platform_communicator에서 import
except Exception as e:
    print(f"Import error: {e}")
    traceback.print_exc()
    input("Press Enter to exit...")
    sys.exit(1)


class ScreenDrawWindow(QWidget):
    # 설정 파일 경로
    CONFIG_FILE = "ScreenDrawConfig.json"
    
    # 색상 상수는 modules.config.constants에서 import하여 사용
    # AREA_BORDER_COLOR -> Colors.AREA_BORDER
    # BUTTON_BORDER_COLOR -> Colors.BUTTON_BORDER
    # HOVER_BORDER_COLOR -> Colors.HOVER_BORDER
    
    def __init__(self):
        super().__init__()
        
        # 전체 화면으로 설정 (모든 모니터 포함)
        screens = QApplication.screens()
        if screens:
            # 모든 모니터를 포함한 전체 영역 계산
            min_x = min(s.geometry().x() for s in screens)
            min_y = min(s.geometry().y() for s in screens)
            max_x = max(s.geometry().x() + s.geometry().width() for s in screens)
            max_y = max(s.geometry().y() + s.geometry().height() for s in screens)
            self.setGeometry(min_x, min_y, max_x - min_x, max_y - min_y)
        else:
            screen = QApplication.primaryScreen().geometry()
            self.setGeometry(0, 0, screen.width(), screen.height())
        
        # 윈도우 속성 설정 (항상 위, 테두리 없음, 투명)
        self.setWindowFlags(Qt.Window | Qt.WindowStaysOnTopHint | 
                           Qt.FramelessWindowHint | Qt.Tool)
        self.setAttribute(Qt.WA_TranslucentBackground)
        # 마우스 이벤트를 항상 받을 수 있도록 설정
        self.setMouseTracking(True)
        # 마우스 이벤트를 받을 수 있도록 설정
        self.setAttribute(Qt.WA_AcceptTouchEvents, False)
        
        # 그리기 모드 상태
        self.drawing_mode = False  # 그리기 모드 활성화 여부
        
        # 드로잉 영역 모드 (Screen/Area)
        self.drawing_area_mode = "full"  # "full" (Screen 모드) 또는 "partial" (Area 모드)
        self.drawing_area_rect = None  # Area 모드일 때 드로잉 영역 (QRect)
        self.drawing_area_resize_handle = None  # 리사이즈 핸들 위치 ("corner", "edge", None)
        self.drawing_area_resize_start_pos = None  # 리사이즈 시작 위치
        
        # 전역 단축키 관련 (단순화된 버전)
        
        # 그리기 관련 변수
        self.drawing = False
        self.last_point = QPoint()
        self.pen_color = Colors.DEFAULT_PEN  # 기본 색상: 빨강
        self.pen_width = 3  # 기본 선 두께
        self.drawing_paths = []  # 그린 경로들을 저장 (각 경로는 {points, color, width} 딕셔너리)
        
        # 모니터 정보 초기화
        self.screens_info = []  # 각 모니터 정보 저장
        self.init_screens_info()
        
        # 모듈 초기화
        self.config_manager = ConfigManager()
        from modules.screen_manager import ScreenManager
        self.screen_manager = ScreenManager()  # 모니터 관리자 초기화
        self.color_manager = ColorManager(self)
        self.pen_stroke_width_manager = PenStrokeWidthManager(self)
        # 하위 호환성을 위한 별칭
        self.width_manager = self.pen_stroke_width_manager
        self.action_buttons = ActionButtons(self)
        self.platform_communicator = PlatformCommunicator(self)
        self.control_panel_manager = ControlPanelManager(self)
        self.drawing_event_handler = DrawingEventHandler(self)
        
        # 설정 로드
        config = self.config_manager.load_config()
        self.saved_panel_x = config.get('panel_x')
        self.saved_panel_y = config.get('panel_y')
        self.saved_drawing_area_mode = config.get('drawing_area_mode')
        self.saved_drawing_area_rect = config.get('drawing_area_rect')
        self.saved_pen_color = config.get('pen_color')
        self.saved_pen_width = config.get('pen_width')
        
        # 로드한 설정 적용
        if self.saved_drawing_area_mode:
            self.drawing_area_mode = self.saved_drawing_area_mode
        
        if self.saved_pen_color:
            self.pen_color = QColor(
                self.saved_pen_color.get('r', 255),
                self.saved_pen_color.get('g', 0),
                self.saved_pen_color.get('b', 0),
                self.saved_pen_color.get('a', 255)
            )
        
        if self.saved_pen_width is not None:
            self.pen_width = self.saved_pen_width
        
        # 컨트롤 패널 (상단에 고정)
        self.setup_control_panel()
        
        # 시스템 트레이 아이콘 설정
        self.setup_tray_icon()
        
        # 전역 단축키 설정 (Ctrl+Shift+N)
        self.setup_global_hotkey()
        
        # ESC 키로 그리기 모드 종료 및 컬러 픽커 모드 종료
        esc_shortcut = QShortcut(QKeySequence(Qt.Key_Escape), self)
        esc_shortcut.setContext(Qt.WidgetShortcut)  # 위젯에서 작동
        esc_shortcut.activated.connect(self.handle_escape_key)
        
        # 초기에는 그리기 모드로 시작 (하지만 스플래시가 닫힐 때까지 숨김)
        self.drawing_mode = True
        # 초기에는 숨김 상태로 유지 (스플래시가 닫힌 후 표시됨)
        self.hide()
        # 초기 드로잉 영역 설정
        if self.drawing_area_mode == "partial":
            self.update_drawing_area_rect()
    
    def init_screens_info(self):
        """초기 로딩 시 각 모니터 정보 저장"""
        screens = QApplication.screens()
        self.screens_info = []
        
        for idx, screen in enumerate(screens):
            screen_rect = screen.geometry()
            screen_info = {
                'index': idx,
                'geometry': screen_rect,  # QRect
                'x': screen_rect.x(),
                'y': screen_rect.y(),
                'width': screen_rect.width(),
                'height': screen_rect.height(),
                'is_primary': screen == QApplication.primaryScreen(),
                'is_landscape': screen_rect.width() > screen_rect.height(),  # 가로 모니터
                'is_portrait': screen_rect.height() > screen_rect.width(),  # 세로 모니터
            }
            self.screens_info.append(screen_info)
    
    def get_screen_at_point(self, point: QPoint) -> dict:
        """커서 위치가 어떤 모니터에 있는지 판단"""
        for screen_info in self.screens_info:
            rect = screen_info['geometry']
            if (rect.left() <= point.x() <= rect.right() and
                rect.top() <= point.y() <= rect.bottom()):
                return screen_info
        return None
    
    def get_nearest_screen(self, point: QPoint) -> dict:
        """가장 가까운 모니터 찾기"""
        if not self.screens_info:
            return None
        
        min_distance = float('inf')
        nearest_screen = None
        
        for screen_info in self.screens_info:
            rect = screen_info['geometry']
            center_x = rect.x() + rect.width() // 2
            center_y = rect.y() + rect.height() // 2
            distance = ((point.x() - center_x) ** 2 + (point.y() - center_y) ** 2) ** 0.5
            
            if distance < min_distance:
                min_distance = distance
                nearest_screen = screen_info
        
        return nearest_screen
    
    def get_screen_for_rect(self, rect: QRect) -> QScreen:
        """드로잉 영역(QRect)이 속한 모니터를 반환 (ScreenManager 사용)"""
        if hasattr(self, 'screen_manager'):
            screen = self.screen_manager.get_screen_for_rect(rect) or QApplication.primaryScreen()
            return screen
        else:
            # ScreenManager가 없을 때는 기존 로직 사용 (하위 호환성)
            if not rect or not rect.isValid():
                return QApplication.primaryScreen()
            center_point = rect.center()
            screens = QApplication.screens()
            for screen in screens:
                screen_rect = screen.geometry()
                if screen_rect.contains(center_point):
                    return screen
            return QApplication.primaryScreen()
    
    def get_current_monitor_screen(self) -> QScreen:
        """컨트롤 패널이 위치한 모니터를 반환 (ScreenManager 사용)"""
        if hasattr(self, 'screen_manager'):
            if hasattr(self, 'control_panel') and self.control_panel.isVisible():
                screen = self.screen_manager.get_screen_for_widget(self.control_panel)
                return screen
            return QApplication.primaryScreen()
        else:
            # ScreenManager가 없을 때는 기존 로직 사용 (하위 호환성)
            if hasattr(self, 'control_panel') and self.control_panel.isVisible():
                panel_geo = self.control_panel.geometry()
                center_point = panel_geo.center()
                screens = QApplication.screens()
                
                for screen in screens:
                    screen_rect = screen.geometry()
                    if screen_rect.contains(center_point):
                        return screen
            return QApplication.primaryScreen()
    
        
    def setup_control_panel(self):
        """컨트롤 패널 구성 (ControlPanelBuilder 사용)"""
        # ControlPanelBuilder를 사용하여 컨트롤 패널 구성
        builder = ControlPanelBuilder(self)
        self.control_panel_builder = builder  # 모니터 정보 업데이트를 위해 저장
        self.control_panel = builder.build()
        
        # 컨트롤 패널 드래그를 위한 변수 초기화
        self.control_panel_drag_position = None
        
        # 컨트롤 패널 매니저에 컨트롤 패널 설정
        self.control_panel_manager.set_control_panel(self.control_panel)
        
        # 레이아웃 관리자에 메인 레이아웃 설정
        if self.control_panel_manager.layout_manager:
            # main_container의 레이아웃 찾기
            for child in self.control_panel.children():
                if isinstance(child, QWidget):
                    main_layout = child.layout()
                    if isinstance(main_layout, QHBoxLayout):
                        self.control_panel_manager.layout_manager.set_main_layout(main_layout)
                        break
        
        # 브랜드 라벨과 정보 라벨은 이미 마우스 이벤트 연결됨 (위에서 설정)
        
        # 컨트롤 패널 초기 크기 설정 (위젯 내용에 맞게 자동 계산)
        # 참고: 사용자가 직접 툴바를 리사이즈하는 기능은 현재 없습니다.
        #       동적 위젯 표시/숨김 시에만 자동으로 크기가 조정됩니다.
        self.control_panel.adjustSize()
        # 독립 윈도우이므로 화면 좌표로 위치 설정
        # 설정에서 로드한 위치 사용, 없으면 기본값
        if (hasattr(self, 'saved_panel_x') and hasattr(self, 'saved_panel_y') and 
            self.saved_panel_x is not None and self.saved_panel_y is not None):
            panel_x = self.saved_panel_x
            panel_y = self.saved_panel_y
        else:
            screen = QApplication.primaryScreen().geometry()
            panel_x = (screen.width() - self.control_panel.width()) // 2
            panel_y = 20
        self.control_panel.setGeometry(panel_x, panel_y, self.control_panel.width(), self.control_panel.height())
        # 컨트롤 패널이 항상 보이도록 설정
        self.control_panel.setAttribute(Qt.WA_TransparentForMouseEvents, False)
        self.control_panel.setAutoFillBackground(True)
        # 컨트롤 패널 위치 저장 (마우스 이벤트 처리용)
        self.control_panel_rect = QRect(panel_x, panel_y, self.control_panel.width(), self.control_panel.height())
        
        # 컨트롤 패널에도 ESC 키 단축키 연결 (컬러 픽커 모드 종료용)
        control_panel_esc_shortcut = QShortcut(QKeySequence(Qt.Key_Escape), self.control_panel)
        control_panel_esc_shortcut.setContext(Qt.WindowShortcut)
        control_panel_esc_shortcut.activated.connect(self.handle_escape_key)
        
        # 로드한 설정 적용 (색상, 선 두께)
        if hasattr(self, 'width_display'):
            self.width_display.setWidth(self.pen_width)
        
        # Area 모드 정보 복원
        if self.drawing_area_mode == "partial" and self.saved_drawing_area_rect:
            self.drawing_area_rect = QRect(
                self.saved_drawing_area_rect['x'],
                self.saved_drawing_area_rect['y'],
                self.saved_drawing_area_rect['width'],
                self.saved_drawing_area_rect['height']
            )
        
        # 드로잉 모드 버튼 텍스트 업데이트
        if hasattr(self, 'draw_mode_btn'):
            if self.drawing_area_mode == "partial":
                self.draw_mode_btn.setText("Area")
            else:
                self.draw_mode_btn.setText("Screen")
        
        # 초기에는 숨김 (나중에 drawing_mode 활성화 시 표시)
        # self.control_panel.show()  # 초기에는 숨김
        # self.control_panel.raise_()  # 최상위로
        # self.control_panel.activateWindow()  # 활성화
    
    def save_config(self):
        """설정 파일에 모든 설정 저장"""
        config = {}
        
        # 툴바 위치
        if hasattr(self, 'control_panel') and self.control_panel.isVisible():
            panel_geo = self.control_panel.geometry()
            config['panel_x'] = panel_geo.x()
            config['panel_y'] = panel_geo.y()
        
        # 드로잉 영역 모드
        config['drawing_area_mode'] = self.drawing_area_mode
        
        # Area 모드 정보
        if self.drawing_area_mode == "partial" and self.drawing_area_rect:
            config['drawing_area_rect'] = {
                'x': self.drawing_area_rect.x(),
                'y': self.drawing_area_rect.y(),
                'width': self.drawing_area_rect.width(),
                'height': self.drawing_area_rect.height()
            }
        else:
            config['drawing_area_rect'] = None
        
        # 색상 (RGB 값으로 저장)
        config['pen_color'] = {
            'r': self.pen_color.red(),
            'g': self.pen_color.green(),
            'b': self.pen_color.blue(),
            'a': self.pen_color.alpha()
        }
        
        # 선 두께
        config['pen_width'] = self.pen_width
        
        # ConfigManager를 통해 저장
        self.config_manager.save_config(config)
        
    def setup_tray_icon(self):
        self.tray_icon = QSystemTrayIcon(self)
        try:
            # img 폴더의 트레이 아이콘 경로 (절대 경로 사용)
            icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img", "tray_icon.png")
            if os.path.exists(icon_path):
                self.tray_icon.setIcon(QIcon(icon_path))
            else:
                # tray_icon.png가 없으면 icon.png 또는 icon.ico 시도
                icon_path_png = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img", "icon.png")
                icon_path_ico = os.path.join(os.path.dirname(os.path.abspath(__file__)), "img", "icon.ico")
                if os.path.exists(icon_path_png):
                    self.tray_icon.setIcon(QIcon(icon_path_png))
                elif os.path.exists(icon_path_ico):
                    self.tray_icon.setIcon(QIcon(icon_path_ico))
        except Exception as e:
            print(f"트레이 아이콘 설정 오류: {e}")
        self.tray_icon.setToolTip('화면 그리기 도구 (Ctrl+Shift+N으로 토글)')
        
        tray_menu = QMenu()
        toggle_action = tray_menu.addAction("그리기 모드 토글 (Ctrl+Shift+N)")
        toggle_action.triggered.connect(self.toggle_drawing_mode)
        tray_menu.addSeparator()
        quit_action = tray_menu.addAction("Exit")
        quit_action.triggered.connect(QApplication.quit)
        
        self.tray_icon.setContextMenu(tray_menu)
        self.tray_icon.show()
        self.tray_icon.activated.connect(self.tray_icon_activated)
        
    def tray_icon_activated(self, reason):
        if reason == QSystemTrayIcon.DoubleClick:
            self.toggle_drawing_mode()
    
    def setup_global_hotkey(self):
        """
        전역 단축키 설정 (Ctrl+Shift+N) - 단순화된 버전
        
        pynput을 사용하여 전역 단축키를 등록합니다.
        """
        import threading
        
        def on_activate():
            """단축키 활성화 시 호출되는 콜백"""
            try:
                # Qt 메인 스레드에서 실행되도록 QTimer 사용
                from PySide6.QtCore import QTimer
                QTimer.singleShot(0, self.toggle_drawing_mode)
            except Exception as e:
                print(f"[개발 모드] 전역 단축키 콜백 오류: {e}")
        
        try:
            hotkey = keyboard.HotKey(
                keyboard.HotKey.parse('<ctrl>+<shift>+n'),
                on_activate
            )
        except Exception as e:
            print(f"[개발 모드] 전역 단축키 등록 실패: {e}")
            return
        
        def start_listener():
            """키보드 리스너를 시작하는 함수"""
            try:
                def on_press(key):
                    try:
                        hotkey.press(key)
                    except:
                        pass
                
                def on_release(key):
                    try:
                        hotkey.release(key)
                    except:
                        pass
                
                with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
                    listener.join()
            except Exception as e:
                print(f"[개발 모드] 키보드 리스너 오류: {e}")
        
        try:
            listener_thread = threading.Thread(target=start_listener, daemon=True, name="HotkeyListener")
            listener_thread.start()
            self.hotkey_listener = listener_thread
        except Exception as e:
            print(f"[개발 모드] 전역 단축키 스레드 시작 실패: {e}")
    
    def create_settings_icon_button(self):
        """
        설정 아이콘 버튼 생성 (기어 아이콘)
        
        Returns:
            QPushButton: 설정 아이콘이 있는 버튼
        """
        # 기어 아이콘을 직접 그려서 QIcon 생성
        icon_size = 18
        pixmap = QPixmap(icon_size, icon_size)
        pixmap.fill(Qt.transparent)
        
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 텍스트 색상으로 펜 설정
        pen_color = QColor(TextColors.PRIMARY)
        pen = QPen(pen_color, 2.0)
        painter.setPen(pen)
        painter.setBrush(Qt.NoBrush)
        
        # 기어 아이콘 그리기 (더 명확한 기어 모양)
        import math
        center_x, center_y = icon_size // 2, icon_size // 2
        outer_radius = 7
        inner_radius = 3
        
        # 외곽 원 (톱니 바깥쪽)
        painter.drawEllipse(center_x - outer_radius, center_y - outer_radius,
                           outer_radius * 2, outer_radius * 2)
        
        # 내부 원 (톱니 안쪽)
        painter.drawEllipse(center_x - inner_radius, center_y - inner_radius,
                           inner_radius * 2, inner_radius * 2)
        
        # 톱니 그리기 (8개의 톱니)
        num_teeth = 8
        for i in range(num_teeth):
            angle = (2 * math.pi * i) / num_teeth
            # 톱니 바깥쪽 점
            outer_x = center_x + outer_radius * math.cos(angle)
            outer_y = center_y + outer_radius * math.sin(angle)
            # 톱니 안쪽 점
            inner_x = center_x + inner_radius * math.cos(angle)
            inner_y = center_y + inner_radius * math.sin(angle)
            # 선 그리기
            painter.drawLine(int(outer_x), int(outer_y), int(inner_x), int(inner_y))
        
        painter.end()
        
        # 아이콘 버튼 생성
        icon_btn = QPushButton()
        icon_btn.setIcon(QIcon(pixmap))
        icon_btn.setFixedSize(25, 25)
        icon_btn.setIconSize(pixmap.size())
        
        return icon_btn
    
    def show_settings_dialog(self):
        """설정 다이얼로그 표시 (현재 툴바가 있는 모니터의 중앙에 표시)"""
        try:
            dialog = SettingsDialog(self)
            
            # 현재 툴바가 있는 모니터의 중앙에 다이얼로그 표시
            if hasattr(self, 'screen_manager'):
                current_screen = self.get_current_monitor_screen()
                if current_screen:
                    center_pos = self.screen_manager.get_center_position_for_screen(
                        current_screen, 
                        widget_width=600, 
                        widget_height=500
                    )
                    dialog.move(center_pos.x(), center_pos.y())
            
            dialog.exec()
        except Exception as e:
            print(f"[개발 모드] 설정 다이얼로그 오류: {e}")
            import traceback
            traceback.print_exc()
    
    def toggle_drawing_mode(self):
        """그리기 모드 토글"""
        try:
            print(f"[개발 모드] 그리기 모드 토글 호출 (현재 상태: drawing_mode={self.drawing_mode})")
            if self.drawing_mode:
                self.deactivate_drawing_mode()
            else:
                self.activate_drawing_mode()
        except Exception as e:
            print(f"[개발 모드] 그리기 모드 토글 오류: {e}")
            import traceback
            traceback.print_exc()
    
    def activate_drawing_mode(self):
        """그리기 모드 활성화"""
        if not self.drawing_mode:
            self.drawing_mode = True
            self.show()
            self.raise_()
            self.activateWindow()
            # 컨트롤 패널 표시 확인 및 최상위로
            if hasattr(self, 'control_panel'):
                # 현재 위치 유지 (설정에서 로드한 위치 또는 기본 위치)
                panel_geo = self.control_panel.geometry()
                # 컨트롤 패널 위치 저장 (마우스 이벤트 처리용)
                self.control_panel_rect = QRect(panel_geo.x(), panel_geo.y(), panel_geo.width(), panel_geo.height())
                # Area 모드일 때 드로잉 영역 업데이트
                if self.drawing_area_mode == "partial":
                    self.update_drawing_area_rect()
                self.control_panel.show()
                self.control_panel.raise_()
                self.control_panel.activateWindow()
                self.control_panel.update()  # 강제 업데이트
                self.control_panel.repaint()  # 강제 다시 그리기
            self.update()  # 화면 갱신
            self.tray_icon.showMessage(
                "그리기 모드 활성화",
                "마우스로 그림을 그릴 수 있습니다.\nESC 키를 누르면 종료됩니다.",
                2000
            )
    
    def handle_escape_key(self):
        """ESC 키 처리: 컬러 픽커 모드가 활성화되어 있으면 종료, 그리기 모드가 활성화되어 있으면 그리기 모드 종료"""
        if hasattr(self, 'color_manager') and self.color_manager.color_picker_mode:
            self.toggle_color_picker_mode()
        elif self.drawing_mode:
            self.deactivate_drawing_mode()
        # 그리기 모드도 컬러 픽커 모드도 아닐 때는 아무것도 하지 않음
    
    def deactivate_drawing_mode(self):
        """그리기 모드 비활성화 (일반 마우스 모드로 복귀)"""
        self.drawing_mode = False
        self.drawing = False
        # 컬러 픽커 모드도 함께 종료
        if hasattr(self, 'color_manager') and self.color_manager.color_picker_mode:
            self.color_manager.deactivate_color_picker_mode()
            if hasattr(self, 'color_picker_btn'):
                self.color_picker_btn.setText("Picker")
                if hasattr(self, 'control_panel'):
                    self.control_panel.update()
        self.hide()
        # 컨트롤 패널도 숨기기
        if hasattr(self, 'control_panel'):
            self.control_panel.hide()
        # 그린 내용은 유지 (다시 활성화하면 보임)
    
    def choose_color(self):
        """색상 선택 (ColorManager 위임)"""
        self.color_manager.choose_color()
    
    def toggle_color_picker_mode(self):
        """컬러 픽커 모드 토글"""
        if self.color_manager.color_picker_mode:
            self.color_manager.deactivate_color_picker_mode()
            if hasattr(self, 'color_picker_btn'):
                self.color_picker_btn.setText("Picker")
                # 버튼 업데이트를 위해 컨트롤 패널도 업데이트
                if hasattr(self, 'control_panel'):
                    self.control_panel.update()
            # 색상 프리뷰 박스 숨김 (컨트롤 패널 크기 자동 조정)
            # 참고: 동적 위젯 숨김 시 컨트롤 패널(툴바) 크기가 자동으로 축소됩니다.
            #       드로잉 영역 크기 조정과는 무관합니다.
            if hasattr(self, 'color_preview_box'):
                self.color_preview_box.hidePreview()
                # 명시적으로 크기 조정 (동적 훅이 작동하지 않을 경우 대비)
                from PySide6.QtCore import QTimer
                QTimer.singleShot(10, self.control_panel_manager.adjust_panel_size)
            # 그리기 모드가 아니면 윈도우 숨김
            if not self.drawing_mode:
                self.hide()
            # 컨트롤 패널에 포커스 주기 (대화창 입력 가능하도록)
            if hasattr(self, 'control_panel') and self.control_panel.isVisible():
                from PySide6.QtCore import QTimer
                QTimer.singleShot(50, lambda: self.control_panel.raise_() if hasattr(self, 'control_panel') else None)
                QTimer.singleShot(50, lambda: self.control_panel.activateWindow() if hasattr(self, 'control_panel') else None)
        else:
            self.color_manager.activate_color_picker_mode()
            if hasattr(self, 'color_picker_btn'):
                self.color_picker_btn.setText("Exit")
                # 버튼 업데이트를 위해 컨트롤 패널도 업데이트
                if hasattr(self, 'control_panel'):
                    self.control_panel.update()
            # 색상 프리뷰 박스 표시 (현재 펜 색상으로)
            if hasattr(self, 'color_preview_box'):
                # 부모 윈도우 설정 (색상 정보 메뉴 표시용)
                if not hasattr(self.color_preview_box, 'parent_window') or self.color_preview_box.parent_window is None:
                    self.color_preview_box.setParentWindow(self)
                self.color_preview_box.setColor(self.pen_color)
                self.color_preview_box.showPreview()
                # 컨트롤 패널 크기 자동 조정
                # 참고: 동적 위젯 표시 시 컨트롤 패널(툴바) 크기가 자동으로 확장됩니다.
                #       드로잉 영역 크기 조정과는 무관합니다.
                from PySide6.QtCore import QTimer
                QTimer.singleShot(10, self.control_panel_manager.adjust_panel_size)
            # paintEvent가 호출되도록 update (전체 화면에 배경을 그리기 위해)
            self.update()
    
    def set_preset_color(self, color: QColor):
        """프리셋 색상 설정 (ColorManager 위임)"""
        self.color_manager.set_preset_color(color)
    
    def set_pen_width(self, width):
        """펜 스트로크 두께 설정 (PenStrokeWidthManager 위임)"""
        self.pen_stroke_width_manager.set_pen_stroke_width(width)
    
    def adjust_pen_width(self, delta):
        """펜 스트로크 두께를 증가/감소 (PenStrokeWidthManager 위임)"""
        self.pen_stroke_width_manager.adjust_pen_stroke_width(delta)
    
    def set_preset_width(self, width):
        """프리셋 스트로크 두께 설정 (PenStrokeWidthManager 위임)"""
        self.pen_stroke_width_manager.set_preset_stroke_width(width)
    
    def toggle_drawing_area_mode(self):
        """드로잉 영역 모드 토글 (ActionButtons 위임)"""
        self.action_buttons.toggle_drawing_area_mode()
    
    def update_drawing_area_rect(self):
        """
        드로잉 영역 사각형 업데이트 (컨트롤 패널 아래)
        
        툴바 이동 시 호출되어 드로잉 영역의 위치를 컨트롤 패널 아래로 재조정합니다.
        기존 드로잉 영역의 크기는 유지하고, 위치만 업데이트합니다.
        """
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
        
        # 기존 드로잉 영역 크기 유지 (사용자가 리사이즈한 경우 보존)
        existing_width = 800  # 기본값
        existing_height = 600  # 기본값
        if self.drawing_area_rect and self.drawing_area_rect.isValid():
            # 기존 드로잉 영역이 있으면 그 크기를 유지
            existing_width = self.drawing_area_rect.width()
            existing_height = self.drawing_area_rect.height()
        
        if hasattr(self, 'control_panel') and self.control_panel.isVisible():
            panel_geo = self.control_panel.geometry()
            # 컨트롤 패널 아래에 드로잉 영역 생성 (위치만 재조정, 크기는 유지)
            area_x = panel_geo.x()
            area_y = panel_geo.y() + panel_geo.height() + 10
            
            # 기존 크기 사용
            area_width = existing_width
            area_height = existing_height
            
            # 모든 모니터를 포함한 전체 영역 경계 확인
            if area_x + area_width > all_screens_rect.right():
                area_x = all_screens_rect.right() - area_width - 20
            if area_y + area_height > all_screens_rect.bottom():
                area_y = all_screens_rect.bottom() - area_height - 20
            if area_x < all_screens_rect.left():
                area_x = all_screens_rect.left() + 20
            if area_y < all_screens_rect.top():
                area_y = all_screens_rect.top() + 20
            
            self.drawing_area_rect = QRect(area_x, area_y, area_width, area_height)
        else:
            # 컨트롤 패널이 없으면 전체 영역 중앙 (기존 크기 유지)
            area_width = existing_width
            area_height = existing_height
            area_x = all_screens_rect.x() + (all_screens_rect.width() - area_width) // 2
            area_y = all_screens_rect.y() + (all_screens_rect.height() - area_height) // 2
            self.drawing_area_rect = QRect(area_x, area_y, area_width, area_height)
    
    def get_drawing_area_resize_handle(self, global_pos):
        """
        드로잉 영역 리사이즈 핸들 위치 확인 (화면 좌표 사용)
        
        Area 모드에서 드로잉 영역의 리사이즈 핸들(모서리/변) 위치를 확인합니다.
        
        Args:
            global_pos: 화면 좌표의 마우스 위치
        
        Returns:
            핸들 위치 문자열 ("top-left", "top-right", "bottom-left", "bottom-right", 
            "left", "right", "top", "bottom") 또는 None
            
        참고:
        - 이 메서드는 드로잉 영역의 크기 조정을 위한 것입니다.
        - 컨트롤 패널(툴바)의 리사이즈 기능은 현재 없습니다.
        """
        if not self.drawing_area_rect:
            return None
        
        handle_size = Sizes.RESIZE_HANDLE_SIZE
        rect = self.drawing_area_rect
        
        # global_pos가 QPoint인지 확인
        if isinstance(global_pos, QPoint):
            x, y = global_pos.x(), global_pos.y()
        else:
            x, y = global_pos.x(), global_pos.y()
        
        # 모서리 확인
        if (abs(x - rect.left()) < handle_size and abs(y - rect.top()) < handle_size):
            return "top-left"
        elif (abs(x - rect.right()) < handle_size and abs(y - rect.top()) < handle_size):
            return "top-right"
        elif (abs(x - rect.left()) < handle_size and abs(y - rect.bottom()) < handle_size):
            return "bottom-left"
        elif (abs(x - rect.right()) < handle_size and abs(y - rect.bottom()) < handle_size):
            return "bottom-right"
        # 변 확인
        elif abs(x - rect.left()) < handle_size:
            return "left"
        elif abs(x - rect.right()) < handle_size:
            return "right"
        elif abs(y - rect.top()) < handle_size:
            return "top"
        elif abs(y - rect.bottom()) < handle_size:
            return "bottom"
        
        return None
    
    def draw_drawing_area_resize_handles(self, painter: QPainter, rect: QRect):
        """
        드로잉 영역의 리사이즈 핸들 그리기
        
        Area 모드에서 드로잉 영역의 모서리에 삼각형 리사이즈 핸들을 그립니다.
        사용자가 이 핸들을 드래그하여 드로잉 영역의 크기를 조정할 수 있습니다.
        
        Args:
            painter: QPainter 객체
            rect: 드로잉 영역 사각형 (윈도우 좌표)
            
        참고:
        - 이 메서드는 드로잉 영역의 리사이즈 핸들만 그립니다.
        - 컨트롤 패널(툴바)의 리사이즈 핸들은 현재 없습니다.
        """
        handle_size = Sizes.RESIZE_HANDLE_SIZE
        
        # 삼각형 색상 (전역 색상 사용, 투명도 없음)
        painter.setPen(QPen(Colors.AREA_BORDER, BorderWidths.HANDLE))  # 선 두께 더 가늘게
        painter.setBrush(Colors.AREA_BORDER)  # 채우기도 동일 색상
        
        # 좌상단 삼각형
        top_left_triangle = QPolygon([
            QPoint(rect.left(), rect.top()),
            QPoint(rect.left() + handle_size, rect.top()),
            QPoint(rect.left(), rect.top() + handle_size)
        ])
        painter.drawPolygon(top_left_triangle)
        
        # 우상단 삼각형
        top_right_triangle = QPolygon([
            QPoint(rect.right(), rect.top()),
            QPoint(rect.right() - handle_size, rect.top()),
            QPoint(rect.right(), rect.top() + handle_size)
        ])
        painter.drawPolygon(top_right_triangle)
        
        # 좌하단 삼각형
        bottom_left_triangle = QPolygon([
            QPoint(rect.left(), rect.bottom()),
            QPoint(rect.left() + handle_size, rect.bottom()),
            QPoint(rect.left(), rect.bottom() - handle_size)
        ])
        painter.drawPolygon(bottom_left_triangle)
        
        # 우하단 삼각형
        bottom_right_triangle = QPolygon([
            QPoint(rect.right(), rect.bottom()),
            QPoint(rect.right() - handle_size, rect.bottom()),
            QPoint(rect.right(), rect.bottom() - handle_size)
        ])
        painter.drawPolygon(bottom_right_triangle)
    
    def is_point_in_drawing_area(self, global_pos):
        """점이 드로잉 영역 안에 있는지 확인 (화면 좌표 사용)"""
        if self.drawing_area_mode == "full":
            return True
        elif self.drawing_area_mode == "partial" and self.drawing_area_rect:
            # global_pos가 QPoint인지 확인
            if isinstance(global_pos, QPoint):
                return self.drawing_area_rect.contains(global_pos.x(), global_pos.y())
            else:
                # 이미 튜플이나 다른 형태일 수 있음
                return self.drawing_area_rect.contains(global_pos)
        return False
    
    def clear_drawing(self):
        """그린 내용 모두 지우기 (ActionButtons 위임)"""
        self.action_buttons.clear_drawing()
    
    def save_screenshot(self, mode="clipboard", save_mode="drawing_area"):
        """스크린샷 저장 (ActionButtons 위임)"""
        self.action_buttons.save_screenshot(mode, save_mode)
    
    def show_message(self, message):
        # 간단한 메시지 표시 (나중에 개선 가능)
        print(message)
        if hasattr(self, 'tray_icon'):
            self.tray_icon.showMessage("ScreenDraw", message, 2000)
    
    def send_to_platform(self):
        """웹 플랫폼으로 드로잉 데이터 전송 (PlatformCommunicator 위임)"""
        self.platform_communicator.send_to_platform()
    
    def mousePressEvent(self, event):
        """마우스 누름 이벤트 처리 (DrawingEventHandler에 위임)"""
        self.drawing_event_handler.handle_mouse_press(event)
    
    def mouseMoveEvent(self, event):
        """마우스 이동 이벤트 처리 (DrawingEventHandler에 위임)"""
        self.drawing_event_handler.handle_mouse_move(event)
    
    def mouseReleaseEvent(self, event):
        """마우스 릴리즈 이벤트 처리 (DrawingEventHandler에 위임)"""
        self.drawing_event_handler.handle_mouse_release(event)
    
    
    def showEvent(self, event):
        """윈도우가 표시될 때 호출"""
        super().showEvent(event)
        # 컨트롤 패널 위치 업데이트 (현재 위치 유지)
        if hasattr(self, 'control_panel'):
            panel_geo = self.control_panel.geometry()
            # 컨트롤 패널 위치 저장 (마우스 이벤트 처리용)
            self.control_panel_rect = QRect(panel_geo.x(), panel_geo.y(), panel_geo.width(), panel_geo.height())
            self.control_panel.show()
            self.control_panel.raise_()
            self.control_panel.activateWindow()
            self.control_panel.update()
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 마우스 이벤트를 받기 위해 매우 투명한 배경 그리기 (거의 보이지 않음)
        # alpha=1로 설정하면 거의 투명하지만 마우스 이벤트는 받을 수 있음
        transparent_bg = QColor(0, 0, 0, 1)  # 거의 투명한 검은색
        
        # 컬러 픽커 모드일 때는 항상 전체 화면에 배경을 그려서 마우스 이벤트를 받을 수 있도록 함
        is_color_picker_mode = (hasattr(self, 'color_manager') and 
                               hasattr(self.color_manager, 'color_picker_mode') and 
                               self.color_manager.color_picker_mode)
        
        if self.drawing_mode or is_color_picker_mode:
            if self.drawing_area_mode == "full" or is_color_picker_mode:
                # Screen 모드 또는 컬러 픽커 모드: 전체 화면에 투명 배경
                painter.fillRect(self.rect(), transparent_bg)
            elif self.drawing_area_mode == "partial" and self.drawing_area_rect:
                # Area 모드: 드로잉 영역에만 투명 배경 (영역 밖은 마우스 이벤트 투과)
                # 화면 좌표를 윈도우 좌표로 변환
                area_rect = self.drawing_area_rect  # 화면 좌표
                window_global_pos = self.mapToGlobal(QPoint(0, 0))  # 윈도우의 화면 좌표
                local_rect = QRect(
                    area_rect.x() - window_global_pos.x(),
                    area_rect.y() - window_global_pos.y(),
                    area_rect.width(),
                    area_rect.height()
                )
                # 드로잉 영역에만 배경 그리기 (영역 밖은 그리지 않음)
                painter.fillRect(local_rect, transparent_bg)
        
        # 그린 경로들을 다시 그리기
        # 컨트롤 패널은 독립 윈도우이므로 자동으로 그려짐
        
        for path_data in self.drawing_paths:
            points = path_data['points']
            if len(points) > 1:
                pen = QPen(path_data['color'], path_data['width'])
                pen.setCapStyle(Qt.RoundCap)
                pen.setJoinStyle(Qt.RoundJoin)
                painter.setPen(pen)
                # 점들을 연결하여 그리기
                for i in range(len(points) - 1):
                    painter.drawLine(points[i], points[i + 1])
            elif len(points) == 1:
                # 단일 점도 그리기 (원으로 표시)
                pen = QPen(path_data['color'], path_data['width'])
                painter.setPen(pen)
                painter.drawEllipse(points[0], path_data['width']//2, path_data['width']//2)
        
        # 드로잉 가능 영역을 빨간색 스트로크로 표시
        if self.drawing_mode:
            if self.drawing_area_mode == "full":
                # Screen 모드: 전체 화면 테두리
                stroke_pen = QPen(Colors.AREA_BORDER, BorderWidths.AREA)  # 전역 색상 사용
                painter.setPen(stroke_pen)
                painter.setBrush(Qt.NoBrush)  # 채우기 없음
                painter.drawRect(self.rect().adjusted(1, 1, -1, -1))  # 테두리 그리기
            elif self.drawing_area_mode == "partial" and self.drawing_area_rect:
                # Area 모드: 드로잉 영역만 테두리
                stroke_pen = QPen(Colors.AREA_BORDER, BorderWidths.AREA)  # 전역 색상 사용
                painter.setPen(stroke_pen)
                painter.setBrush(Qt.NoBrush)  # 채우기 없음
                # 화면 좌표를 윈도우 좌표로 변환
                area_rect = self.drawing_area_rect  # 화면 좌표
                window_global_pos = self.mapToGlobal(QPoint(0, 0))  # 윈도우의 화면 좌표
                local_rect = QRect(
                    area_rect.x() - window_global_pos.x(),
                    area_rect.y() - window_global_pos.y(),
                    area_rect.width(),
                    area_rect.height()
                )
                painter.drawRect(local_rect)
                
                # 드로잉 영역 코너에 삼각형 리사이즈 핸들 그리기
                self.draw_drawing_area_resize_handles(painter, local_rect)
        
        # paintEvent 후에도 컨트롤 패널이 최상위에 있도록 보장
        if hasattr(self, 'control_panel') and self.control_panel.isVisible():
            # paintEvent가 완료된 후 실행되도록 QTimer 사용
            from PySide6.QtCore import QTimer
            QTimer.singleShot(0, lambda: self.control_panel.raise_() if hasattr(self, 'control_panel') else None)

if __name__ == "__main__":
    try:
        print("Starting ScreenDraw...")
        app = QApplication(sys.argv)
        print("QApplication created")
        app.setQuitOnLastWindowClosed(False)
        
        # 스플래시 스크린 표시
        splash = SplashScreen()
        splash.show()
        app.processEvents()  # 스플래시 즉시 표시
        
        # 시스템 트레이 아이콘 지원 확인
        if not QSystemTrayIcon.isSystemTrayAvailable():
            print("Warning: System tray is not available")
        else:
            print("System tray is available")
        
        print("Creating window...")
        window = ScreenDrawWindow()
        # 스플래시가 표시되는 동안 메인 윈도우는 숨김 상태로 유지
        window.hide()
        print("Window created")
        
        # 컨트롤 패널 준비 (초기에는 숨김 상태)
        if hasattr(window, 'control_panel'):
            window.control_panel.hide()  # 스플래시 중에는 숨김
            print("Preparing control panel...")
        else:
            print("ERROR: control_panel not found!")
        
        # Area 모드일 때 드로잉 영역 업데이트는 스플래시가 닫힌 후 컨트롤 패널이 표시된 후에 수행
        # (컨트롤 패널이 보이는 상태에서만 올바른 위치 계산 가능)
        
        # 스플래시 닫기 전 최소 표시 시간 대기 (스플래시 파일에서 가져옴)
        from PySide6.QtCore import QTimer
        def close_splash_and_show_window():
            splash.close()
            splash.deleteLater()
            
            # 컨트롤 패널 먼저 표시 (드로잉 영역 위치 계산을 위해 필요)
            if hasattr(window, 'control_panel'):
                print("Showing control panel...")
                window.control_panel.show()
                window.control_panel.raise_()
                window.control_panel.activateWindow()
                window.control_panel.update()
                window.control_panel.repaint()
                print("Control panel shown")
            
            # Area 모드일 때 드로잉 영역 업데이트 (컨트롤 패널이 표시된 후)
            if window.drawing_area_mode == "partial":
                window.update_drawing_area_rect()
            
            # 윈도우가 완전히 초기화된 후 표시
            print("Showing window...")
            window.show()
            window.raise_()
            window.activateWindow()
            window.update()  # 이제 업데이트 호출
            print("Window shown")
        
        # 프로그레스바 애니메이션 시작 (최소 표시 시간과 동기화)
        # 애니메이션이 완료되면 자동으로 close_splash_and_show_window 호출
        from modules.config.ui_constants import SplashScreenConstants
        splash.animate_progress(duration_ms=SplashScreenConstants.MIN_DISPLAY_TIME, callback=close_splash_and_show_window)
        
        print("Entering event loop...")
        sys.exit(app.exec())
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
        if 'splash' in locals():
            splash.close()
        input("Press Enter to exit...")
        sys.exit(1)

