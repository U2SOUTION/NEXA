# 컨트롤 패널 UI 구성 모듈
from PySide6.QtWidgets import (QWidget, QHBoxLayout, QVBoxLayout, QPushButton, 
                               QLabel, QMenu, QApplication)
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont, QColor
from modules.config.ui_constants import Colors, BorderWidths, Sizes, BackgroundColors, TextColors, BorderRadius, Padding
from modules.ui_widgets import PenStrokeWidthDisplayWidget, PresetPenStrokeWidthButton, PresetColorButton, ColorPreviewBox
from modules.platform_communicator import HAS_REQUESTS


class ControlPanelBuilder:
    """
    컨트롤 패널 UI 구성 클래스
    
    컨트롤 패널의 모든 UI 요소를 생성하고 구성합니다.
    """
    
    def __init__(self, window):
        """
        Args:
            window: ScreenDrawWindow 인스턴스
        """
        self.window = window
    
    def build(self):
        """
        컨트롤 패널 전체 구성
        
        Returns:
            QWidget: 구성된 컨트롤 패널 위젯
        """
        # 컨트롤 패널 위젯 생성
        control_panel = QWidget()
        control_panel.setWindowFlags(Qt.Window | Qt.WindowStaysOnTopHint | Qt.FramelessWindowHint | Qt.Tool)
        control_panel.setAutoFillBackground(True)
        
        # 컨트롤 패널 드래그를 위한 변수 초기화
        self.window.control_panel_drag_position = None
        
        # 드래그 핸들러 생성 (나중에 setup_event_handlers 호출)
        from modules.control_panel_drag_handler import ControlPanelDragHandler
        drag_handler = ControlPanelDragHandler(control_panel, self.window)
        self.window.control_panel_drag_handler = drag_handler
        
        # 메인 컨테이너 구성
        main_container = self._create_main_container()
        
        # 브랜드 라벨 생성
        brand_label = self._create_brand_label(main_container)
        
        # 중앙 컨텐츠 위젯 생성
        content_widget, content_layout = self._create_content_widget()
        
        # 버튼들 생성 및 추가
        self._create_buttons(content_layout)
        
        # 오른쪽 정보 라벨 생성
        info_container = self._create_info_label(main_container)
        
        # 레이아웃 구성
        main_layout = main_container.layout()
        if main_layout:
            main_layout.addWidget(brand_label)
            main_layout.addWidget(content_widget)
            main_layout.addWidget(info_container)
        
        # 컨트롤 패널에 메인 컨테이너 추가
        panel_layout = QVBoxLayout(control_panel)
        panel_layout.setContentsMargins(0, 0, 0, 0)
        panel_layout.addWidget(main_container)
        
        # ESC 키 단축키 연결
        self._setup_esc_shortcut(control_panel)
        
        # 드래그 핸들러 이벤트 연결 (모든 위젯 생성 후)
        drag_handler.setup_event_handlers()
        
        # 브랜드 라벨과 정보 라벨에 드래그 핸들러 연결
        self._connect_drag_handlers(brand_label, info_container, drag_handler)
        
        return control_panel
    
    def _create_main_container(self) -> QWidget:
        """메인 컨테이너 생성"""
        main_container = QWidget()
        main_container.setStyleSheet(f"""
            QWidget {{
                background-color: {BackgroundColors.CONTROL_PANEL};
                border-radius: {BorderRadius.CONTROL_PANEL}px;
            }}
        """)
        main_layout = QHBoxLayout(main_container)
        main_layout.setContentsMargins(0, 0, 0, 0)
        return main_container
    
    def _create_brand_label(self, parent) -> QLabel:
        """브랜드 라벨 생성"""
        button_height = 25
        brand_label = QLabel("NEXA", parent)
        brand_label.setFixedHeight(button_height)
        
        # 폰트 설정
        brand_font = QFont()
        brand_font.setFamily("Arial Black")
        brand_font.setPointSize(18)
        brand_font.setWeight(QFont.Black)
        brand_font.setBold(True)
        brand_label.setFont(brand_font)
        
        # 스타일시트
        brand_label.setStyleSheet(f"""
            QLabel {{
                background-color: {BackgroundColors.TRANSPARENT};
                color: {TextColors.BRAND};
                padding-left: 12px;
                padding-right: 1px;
            }}
        """)
        brand_label.setAlignment(Qt.AlignCenter | Qt.AlignVCenter)
        brand_label.setCursor(Qt.PointingHandCursor)
        # 드래그 이벤트는 나중에 _connect_drag_handlers에서 연결
        
        self.window.brand_label = brand_label
        return brand_label
    
    def _create_content_widget(self):
        """중앙 컨텐츠 위젯 생성"""
        content_widget = QWidget()
        border_color = Colors.BUTTON_BORDER
        hover_border_color = Colors.HOVER_BORDER
        content_widget.setStyleSheet(f"""
            QWidget {{
                background-color: {BackgroundColors.TRANSPARENT};
            }}
            QPushButton {{
                background-color: {BackgroundColors.BUTTON_NORMAL};
                border: {BorderWidths.BUTTON}px solid {border_color};
                border-radius: {BorderRadius.BUTTON}px;
                padding: {Padding.BUTTON_VERTICAL}px {Padding.BUTTON_HORIZONTAL}px;
                color: {TextColors.PRIMARY};
                font-weight: bold;
            }}
            QPushButton:hover {{
                border: {BorderWidths.BUTTON}px solid {hover_border_color};
            }}
            QPushButton:pressed {{
                background-color: {BackgroundColors.BUTTON_PRESSED};
            }}
            QPushButton::menu-indicator {{
                subcontrol-origin: padding;
                subcontrol-position: right center;
                left: -10px;
                width: 12px;
            }}
            QSpinBox {{
                background-color: {BackgroundColors.SPINBOX};
                border: {BorderWidths.BUTTON}px solid {border_color};
                border-radius: {BorderRadius.SPINBOX}px;
                padding: {Padding.SPINBOX}px;
                color: {TextColors.PRIMARY};
            }}
            QLabel {{
                color: {TextColors.PRIMARY};
            }}
        """)
        layout = QHBoxLayout(content_widget)
        layout.setSpacing(10)
        layout.setContentsMargins(0, 10, 0, 10)
        return content_widget, layout
    
    def _create_buttons(self, layout: QHBoxLayout):
        """모든 버튼들 생성 및 레이아웃에 추가"""
        # 컬러 픽커 버튼
        self.window.color_picker_btn = QPushButton("Picker")
        self.window.color_picker_btn.clicked.connect(self.window.toggle_color_picker_mode)
        self.window.control_panel_manager.add_widget('color_picker_btn', self.window.color_picker_btn, layout=layout)
        
        # 색상 프리뷰 박스
        button_height = 25
        self.window.color_preview_box = ColorPreviewBox(layout.parentWidget(), button_height)
        self.window.control_panel_manager.add_widget('color_preview_box', self.window.color_preview_box, 
                                                     layout=layout, dynamic=True)
        
        # 색상 선택 버튼
        self.window.color_btn = QPushButton("Color")
        self.window.color_btn.clicked.connect(self.window.choose_color)
        self.window.control_panel_manager.add_widget('color_btn', self.window.color_btn, layout=layout)
        
        # 색상 프리셋 버튼
        self._create_color_preset_buttons(layout)
        
        # 선 두께 조정 위젯
        self.window.width_display = PenStrokeWidthDisplayWidget(self.window.pen_width, self.window)
        self.window.width_display.parent_window = self.window
        self.window.control_panel_manager.add_widget('width_display', self.window.width_display, layout=layout)
        
        # 펜 두께 프리셋 버튼
        self._create_width_preset_buttons(layout)
        
        # 드로잉 영역 모드 토글 버튼
        self.window.draw_mode_btn = QPushButton("Screen")
        self.window.draw_mode_btn.clicked.connect(self.window.toggle_drawing_area_mode)
        self.window.control_panel_manager.add_widget('draw_mode_btn', self.window.draw_mode_btn, layout=layout)
        
        # 지우기 버튼
        self.window.clear_btn = QPushButton("Clear")
        self.window.clear_btn.clicked.connect(self.window.clear_drawing)
        self.window.control_panel_manager.add_widget('clear_btn', self.window.clear_btn, layout=layout)
        
        # 캡처 버튼 (드롭다운 메뉴: Screen 모드일 때만 옵션 표시)
        # setMenu()를 사용하면 Qt가 자동으로 드롭다운 화살표를 추가하므로 텍스트에는 화살표를 포함하지 않음
        self.window.save_btn = QPushButton("Capture")
        self.window.capture_menu = QMenu(self.window.save_btn)
        # 메뉴 스타일 적용 (배경색, 테두리 등) - 저장 버튼과 동일한 스타일
        self.window.capture_menu.setStyleSheet(f"""
            QMenu {{
                background-color: rgba(64, 64, 64, 240);
                border: 2px solid rgba(128, 128, 128, 200);
                border-radius: 6px;
                padding: {Padding.MENU}px;
            }}
            QMenu::item {{
                background-color: transparent;
                color: #E0E0E0;
                padding: {Padding.MENU_ITEM_VERTICAL}px {Padding.MENU_ITEM_HORIZONTAL}px;
                border-radius: 4px;
                min-width: 180px;
            }}
            QMenu::item:selected {{
                background-color: rgba(100, 100, 100, 200);
                color: #FFFFFF;
            }}
        """)
        self.window.capture_menu.addAction("Copy Current Monitor", lambda: self.window.save_screenshot("clipboard", "current_monitor"))
        self.window.capture_menu.addAction("Copy All Monitors", lambda: self.window.save_screenshot("clipboard", "all_monitors"))
        # clicked 이벤트 연결 (모드에 관계없이 클릭 처리)
        self.window.save_btn.clicked.connect(self._handle_capture_click)
        # 현재 모드에 따라 메뉴 설정 (Screen 모드일 때만 메뉴 표시)
        if self.window.drawing_area_mode == "full":
            self.window.save_btn.setMenu(self.window.capture_menu)
        else:
            self.window.save_btn.setMenu(None)
        self.window.control_panel_manager.add_widget('save_btn', self.window.save_btn, layout=layout)
        
        # 저장 버튼 (드롭다운 메뉴: 파일 저장 옵션)
        # setMenu()를 사용하면 Qt가 자동으로 드롭다운 화살표를 추가하므로 텍스트에는 화살표를 포함하지 않음
        self.window.file_save_btn = QPushButton("Save")
        self.window.file_save_menu = QMenu(self.window.file_save_btn)
        # 메뉴 스타일 적용 (배경색, 테두리 등)
        self.window.file_save_menu.setStyleSheet(f"""
            QMenu {{
                background-color: rgba(64, 64, 64, 240);
                border: 2px solid rgba(128, 128, 128, 200);
                border-radius: 6px;
                padding: {Padding.MENU}px;
            }}
            QMenu::item {{
                background-color: transparent;
                color: #E0E0E0;
                padding: {Padding.MENU_ITEM_VERTICAL}px {Padding.MENU_ITEM_HORIZONTAL}px;
                border-radius: 4px;
                min-width: 180px;
            }}
            QMenu::item:selected {{
                background-color: rgba(100, 100, 100, 200);
                color: #FFFFFF;
            }}
        """)
        self.window.file_save_menu.addAction("Save Drawing Area", lambda: self.window.save_screenshot("file", "drawing_area"))
        self.window.file_save_menu.addAction("Save Current Monitor", lambda: self.window.save_screenshot("file", "current_monitor"))
        self.window.file_save_menu.addAction("Save All Monitors", lambda: self.window.save_screenshot("file", "all_monitors"))
        # setMenu를 사용하여 드롭다운 메뉴 연결
        self.window.file_save_btn.setMenu(self.window.file_save_menu)
        self.window.control_panel_manager.add_widget('file_save_btn', self.window.file_save_btn, layout=layout)
        
        # 닫기 버튼
        self.window.close_btn = QPushButton("Close (ESC)")
        self.window.close_btn.clicked.connect(self.window.deactivate_drawing_mode)
        self.window.control_panel_manager.add_widget('close_btn', self.window.close_btn, layout=layout)
        
        # 웹 플랫폼 전송 버튼 (선택적)
        if HAS_REQUESTS:
            self.window.send_btn = QPushButton("Send")
            self.window.send_btn.clicked.connect(self.window.send_to_platform)
            layout.addWidget(self.window.send_btn)
        
        # 완전 종료 버튼
        from PySide6.QtWidgets import QApplication
        self.window.quit_btn = QPushButton("Quit")
        self.window.quit_btn.clicked.connect(QApplication.quit)
        border_color = Colors.BUTTON_BORDER
        hover_border_color = Colors.HOVER_BORDER
        self.window.quit_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {BackgroundColors.BUTTON_QUIT};
                border: {BorderWidths.BUTTON}px solid {border_color};
                border-radius: {BorderRadius.BUTTON}px;
                padding: {Padding.BUTTON_VERTICAL}px {Padding.BUTTON_HORIZONTAL}px;
                color: {TextColors.PRIMARY};
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {BackgroundColors.BUTTON_QUIT_HOVER};
                border: {BorderWidths.BUTTON}px solid {hover_border_color};
            }}
        """)
        layout.addWidget(self.window.quit_btn)
        
        # 설정 버튼 (아이콘 버튼)
        self.window.settings_btn = self.window.create_settings_icon_button()
        self.window.settings_btn.setToolTip("설정")
        self.window.settings_btn.clicked.connect(self.window.show_settings_dialog)
        self.window.control_panel_manager.add_widget('settings_btn', self.window.settings_btn, layout=layout)
    
    def _create_color_preset_buttons(self, layout: QHBoxLayout):
        """색상 프리셋 버튼들 생성"""
        color_preset_frame = QWidget()
        color_preset_frame.setFixedHeight(20)
        self.window.color_preset_buttons = []
        
        preset_colors = [
            QColor(255, 0, 0),    # 빨강
            QColor(64, 224, 208), # 바다색 (터키즈)
            QColor(0, 255, 0),    # 초록
            QColor(255, 255, 0)   # 노랑
        ]
        button_width = 22
        for idx, color in enumerate(preset_colors):
            is_first = (idx == 0)
            is_last = (idx == len(preset_colors) - 1)
            color_preset_btn = PresetColorButton(color, is_first, is_last, color_preset_frame)
            color_preset_btn.setParentWindow(self.window)  # 부모 윈도우 설정 (선택된 색상 확인용)
            color_preset_btn.setGeometry(idx * button_width, 0, button_width, 20)
            color_preset_btn.clicked.connect(lambda c=color: self.window.set_preset_color(c))
            self.window.color_preset_buttons.append(color_preset_btn)
        color_preset_frame.setFixedWidth(len(preset_colors) * button_width)
        layout.addWidget(color_preset_frame)
    
    def _create_width_preset_buttons(self, layout: QHBoxLayout):
        """펜 두께 프리셋 버튼들 생성"""
        preset_frame = QWidget()
        preset_layout = QHBoxLayout(preset_frame)
        preset_layout.setContentsMargins(0, 0, 0, 0)
        preset_layout.setSpacing(2)
        self.window.preset_buttons = []
        for width in [1, 3, 5, 10]:
            preset_btn = PresetPenStrokeWidthButton(width)
            preset_btn.parent_window = self.window  # 색상 업데이트를 위해 설정
            preset_btn.clicked.connect(lambda checked, w=width: self.window.set_preset_width(w))
            preset_layout.addWidget(preset_btn)
            self.window.preset_buttons.append(preset_btn)
        layout.addWidget(preset_frame)
    
    def _create_info_label(self, parent) -> QWidget:
        """오른쪽 정보 라벨 생성 (모니터 정보 표시)"""
        info_container = QWidget()
        button_height = 25
        info_container.setFixedHeight(button_height)
        info_layout = QVBoxLayout(info_container)
        info_layout.setContentsMargins(4, 0, 12, 0)
        info_layout.setSpacing(0)
        
        # 모니터 정보 라벨 (현재 위치/모니터 수량)
        monitor_info_label = QLabel("1/1")
        monitor_info_label.setFixedHeight(button_height)
        monitor_info_label.setStyleSheet(f"""
            QLabel {{
                background-color: {BackgroundColors.TRANSPARENT};
                color: {TextColors.SECONDARY};
                font-size: 9px;
                font-weight: bold;
                padding: 0px;
                margin: 0px;
            }}
        """)
        monitor_info_label.setAlignment(Qt.AlignRight | Qt.AlignVCenter)
        monitor_info_label.setCursor(Qt.PointingHandCursor)
        monitor_info_label.mousePressEvent = self._show_monitor_detail_info
        info_layout.addWidget(monitor_info_label)
        
        # 컨테이너 스타일
        info_container.setStyleSheet(f"""
            QWidget {{
                background-color: {BackgroundColors.TRANSPARENT};
                border-top-right-radius: {Sizes.CONTROL_PANEL_HANDLE_BORDER_RADIUS}px;
                border-bottom-right-radius: {Sizes.CONTROL_PANEL_HANDLE_BORDER_RADIUS}px;
            }}
        """)
        info_container.setCursor(Qt.PointingHandCursor)
        # 드래그 이벤트는 나중에 _connect_drag_handlers에서 연결
        
        # 모니터 정보 라벨을 window에 저장하여 업데이트 가능하도록 함
        self.window.monitor_info_label = monitor_info_label
        self.window.info_label = info_container
        
        # 초기 모니터 정보 업데이트
        self._update_monitor_info()
        
        return info_container
    
    def _update_monitor_info(self):
        """모니터 정보 업데이트 (현재 위치/모니터 수량) - ScreenManager 사용"""
        if not hasattr(self.window, 'monitor_info_label'):
            return
        
        try:
            # ScreenManager 사용 (있으면)
            if hasattr(self.window, 'screen_manager'):
                screen_manager = self.window.screen_manager
                screens_info = screen_manager.get_screens_info()
                total_monitors = len(screens_info)
                
                # 현재 모니터 위치 찾기
                current_monitor_index = 0
                if hasattr(self.window, 'control_panel') and self.window.control_panel.isVisible():
                    current_screen = screen_manager.get_screen_for_widget(self.window.control_panel)
                    current_monitor_index = screen_manager.get_screen_index(current_screen)
            else:
                # ScreenManager가 없을 때는 기존 로직 사용 (하위 호환성)
                screens = QApplication.screens()
                total_monitors = len(screens)
                
                current_monitor_index = 0
                if hasattr(self.window, 'control_panel') and self.window.control_panel.isVisible():
                    panel_geo = self.window.control_panel.geometry()
                    center_point = panel_geo.center()
                    
                    for idx, screen in enumerate(screens):
                        screen_rect = screen.geometry()
                        if screen_rect.contains(center_point):
                            current_monitor_index = idx
                            break
            
            # 표시: 현재 위치/전체 수량 (1-based index)
            monitor_info_label = self.window.monitor_info_label
            monitor_info_label.setText(f"{current_monitor_index + 1}/{total_monitors}")
        except Exception as e:
            pass  # 모니터 정보 업데이트 오류는 조용히 무시
    
    def _show_monitor_detail_info(self, event=None):
        """모니터 상세 정보 표시 (클릭 시)"""
        from PySide6.QtWidgets import QMenu
        from PySide6.QtGui import QClipboard
        
        screens = QApplication.screens()
        total_monitors = len(screens)
        
        # 현재 모니터 찾기
        current_screen = None
        current_monitor_index = 0
        if hasattr(self.window, 'control_panel') and self.window.control_panel.isVisible():
            panel_geo = self.window.control_panel.geometry()
            center_point = panel_geo.center()
            
            for idx, screen in enumerate(screens):
                screen_rect = screen.geometry()
                if screen_rect.contains(center_point):
                    current_screen = screen
                    current_monitor_index = idx
                    break
        
        if not current_screen:
            current_screen = QApplication.primaryScreen()
        
        # 상세 정보 메뉴 생성
        menu = QMenu(self.window.monitor_info_label)
        menu.setStyleSheet(f"""
            QMenu {{
                background-color: rgba(64, 64, 64, 240);
                border: 2px solid rgba(128, 128, 128, 200);
                border-radius: 6px;
                padding: {Padding.MENU_DETAIL}px;
            }}
            QMenu::item {{
                background-color: transparent;
                color: #E0E0E0;
                padding: {Padding.MENU_DETAIL_ITEM_VERTICAL}px {Padding.MENU_DETAIL_ITEM_HORIZONTAL}px;
                border-radius: 4px;
                min-width: 250px;
            }}
            QMenu::item:selected {{
                background-color: rgba(100, 100, 100, 200);
                color: #FFFFFF;
            }}
        """)
        
        # 모니터 정보 표시
        screen_geo = current_screen.geometry()
        is_primary = current_screen == QApplication.primaryScreen()
        orientation = "세로" if screen_geo.height() > screen_geo.width() else "가로"
        
        menu.addAction(f"현재 모니터: {current_monitor_index + 1}/{total_monitors}")
        menu.addAction(f"이름: {current_screen.name()}")
        menu.addAction(f"해상도: {screen_geo.width()}x{screen_geo.height()}")
        menu.addAction(f"위치: ({screen_geo.x()}, {screen_geo.y()})")
        menu.addAction(f"방향: {orientation}")
        menu.addAction(f"기본 모니터: {'예' if is_primary else '아니오'}")
        menu.addSeparator()
        menu.addAction(f"전체 모니터 수: {total_monitors}")
        
        # 메뉴 표시
        global_pos = self.window.monitor_info_label.mapToGlobal(
            self.window.monitor_info_label.rect().bottomRight()
        )
        menu.exec(global_pos)
    
    def _setup_esc_shortcut(self, control_panel: QWidget):
        """ESC 키 단축키 설정"""
        from PySide6.QtGui import QShortcut, QKeySequence
        control_panel_esc_shortcut = QShortcut(QKeySequence(Qt.Key_Escape), control_panel)
        control_panel_esc_shortcut.setContext(Qt.WindowShortcut)
        control_panel_esc_shortcut.activated.connect(self.window.handle_escape_key)
    
    def _handle_capture_click(self):
        """캡처 버튼 클릭 처리 (Screen 모드일 때만 옵션 메뉴 표시, Area 모드일 때는 바로 실행)"""
        # setMenu()를 사용했을 때, clicked 이벤트는 메뉴가 표시되지 않을 때만 발생함
        # 전체 모드일 때는 setMenu()로 인해 드롭다운 화살표를 클릭하면 자동으로 메뉴가 표시됨
        # 따라서 clicked 이벤트가 발생한다는 것은 버튼 본문을 클릭했거나, 부분 모드라는 의미
        if self.window.drawing_area_mode == "full":
            # 전체 모드일 때는 메뉴가 설정되어 있으므로, 버튼 본문을 클릭했을 때도 메뉴 표시
            # 버튼의 오른쪽 하단 모서리 위치 계산
            button_rect = self.window.save_btn.rect()
            global_pos = self.window.save_btn.mapToGlobal(button_rect.bottomRight())
            # 메뉴를 버튼 아래에 표시
            self.window.capture_menu.exec(global_pos)
        else:
            # 부분 모드일 때는 바로 드로잉 영역 복사
            # 부분 모드에서는 메뉴를 표시하지 않으므로 clicked 이벤트가 정상적으로 발생
            self.window.save_screenshot("clipboard", "drawing_area")
    
    def _connect_drag_handlers(self, brand_label, info_container, drag_handler):
        """브랜드 라벨과 정보 컨테이너에 드래그 핸들러 연결"""
        # 브랜드 라벨에 드래그 핸들러 연결
        brand_label.mousePressEvent = drag_handler.handle_mouse_press
        brand_label.mouseMoveEvent = drag_handler.handle_mouse_move
        brand_label.mouseReleaseEvent = drag_handler.handle_mouse_release
        
        # 정보 컨테이너와 그 안의 라벨들에 드래그 핸들러 연결
        info_container.mousePressEvent = drag_handler.handle_mouse_press
        info_container.mouseMoveEvent = drag_handler.handle_mouse_move
        info_container.mouseReleaseEvent = drag_handler.handle_mouse_release
        
        # 정보 컨테이너의 각 라벨에도 연결 (모니터 정보 라벨 제외 - 클릭 이벤트가 있음)
        for child in info_container.children():
            if isinstance(child, QLabel) and child != self.window.monitor_info_label:
                child.mousePressEvent = drag_handler.handle_mouse_press
                child.mouseMoveEvent = drag_handler.handle_mouse_move
                child.mouseReleaseEvent = drag_handler.handle_mouse_release

