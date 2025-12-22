# 핫 리로드 관리 모듈 (개발 모드 전용) - watchdog 사용
from PySide6.QtWidgets import QWidget, QApplication
from PySide6.QtCore import QObject, QTimer, Signal
from PySide6.QtGui import QShortcut, QKeySequence
import os
import sys


class HotReloadManager(QObject):
    """
    핫 리로드 관리 클래스 (watchdog 사용)
    
    개발 모드에서 파일 변경 감지 및 UI/스타일 자동 리로드를 담당합니다.
    """
    file_changed = Signal(str)  # 파일 변경 시그널
    
    def __init__(self, window):
        """
        Args:
            window: ScreenDrawWindow 인스턴스
        """
        super().__init__()
        self.window = window
        self.observer = None
        self.observer_thread = None
        self.reload_shortcut = None
        self.reload_ui_shortcut = None
        self.dev_mode = True
        self.watched_paths = []
        
    def setup(self):
        """핫 리로드 기능 초기화 및 설정"""
        if not self.dev_mode:
            return
        
        try:
            from watchdog.observers import Observer
            from watchdog.events import FileSystemEventHandler
            
            self._setup_file_watcher()
            self._setup_shortcuts()
            print(f"[개발 모드] 핫 리로드 기능 활성화 (watchdog 사용)")
            print("[개발 모드] Ctrl+R로 스타일 리로드, Ctrl+Shift+R로 UI 리로드")
        except ImportError:
            print("[개발 모드] watchdog 라이브러리가 설치되지 않았습니다.")
            print("[개발 모드] 설치: pip install watchdog")
            self.dev_mode = False
        except Exception as e:
            print(f"[개발 모드] 핫 리로드 설정 오류: {e}")
            self.dev_mode = False
    
    def _setup_file_watcher(self):
        """파일 변경 감지 설정 (watchdog 사용)"""
        try:
            from watchdog.observers import Observer
            from watchdog.events import FileSystemEventHandler
            
            # 감시할 디렉토리 설정 (현재 스크립트가 있는 디렉토리)
            script_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
            if not script_dir or not os.path.exists(script_dir):
                script_dir = os.getcwd()
            
            # modules 디렉토리도 감시
            modules_dir = os.path.join(script_dir, 'modules')
            
            self.watched_paths = [script_dir]
            if os.path.exists(modules_dir):
                self.watched_paths.append(modules_dir)
            
            # 이벤트 핸들러 생성
            event_handler = FileChangeHandler(self._on_file_changed)
            
            # Observer 생성 및 시작
            self.observer = Observer()
            for path in self.watched_paths:
                if os.path.exists(path):
                    self.observer.schedule(event_handler, path, recursive=True)
                    print(f"[개발 모드] 파일 감시 활성화: {path}")
            
            # 별도 스레드에서 Observer 시작
            self.observer.start()
            
        except Exception as e:
            print(f"[개발 모드] 파일 감시 설정 오류: {e}")
            import traceback
            traceback.print_exc()
    
    def _setup_shortcuts(self):
        """핫 리로드 단축키 설정"""
        # 스타일 리로드 (Ctrl+R)
        self.reload_shortcut = QShortcut(QKeySequence("Ctrl+R"), self.window)
        self.reload_shortcut.activated.connect(self.reload_styles)
        
        # UI 리로드 (Ctrl+Shift+R)
        self.reload_ui_shortcut = QShortcut(QKeySequence("Ctrl+Shift+R"), self.window)
        self.reload_ui_shortcut.activated.connect(self.reload_ui)
    
    def _on_file_changed(self, file_path):
        """파일 변경 감지 시 호출"""
        print(f"[개발 모드] 파일 변경 감지: {file_path}")
        # 파일명에 따라 다른 처리
        filename = os.path.basename(file_path)
        
        if filename == 'ScreenDraw.py':
            # 메인 파일 변경 시 UI 리로드
            QTimer.singleShot(500, self.reload_ui)
        elif filename.endswith('.py') and 'modules' in file_path:
            # 모듈 파일 변경 시 스타일만 리로드
            QTimer.singleShot(300, self.reload_styles)
    
    def reload_styles(self):
        """스타일시트만 리로드 (ui_constants 모듈 재로드 및 모든 스타일시트 재적용)"""
        try:
            print("[개발 모드] 스타일시트 리로드 중...")
            
            # 1. ui_constants 모듈 재로드
            import importlib
            import sys
            
            # ui_constants 모듈 찾기 및 재로드
            modules_to_reload = []
            for module_name in sys.modules.keys():
                if 'ui_constants' in module_name:
                    modules_to_reload.append(module_name)
            
            for module_name in modules_to_reload:
                try:
                    importlib.reload(sys.modules[module_name])
                    print(f"[개발 모드] 모듈 재로드: {module_name}")
                except Exception as e:
                    print(f"[개발 모드] 모듈 재로드 실패 ({module_name}): {e}")
            
            # 2. control_panel_builder의 스타일시트 재적용 메서드 호출
            if hasattr(self.window, 'control_panel_builder'):
                if hasattr(self.window.control_panel_builder, 'reapply_styles'):
                    self.window.control_panel_builder.reapply_styles()
                else:
                    # reapply_styles 메서드가 없으면 직접 재적용
                    self._reapply_all_styles()
            else:
                # control_panel_builder가 없으면 직접 재적용
                self._reapply_all_styles()
            
            QApplication.processEvents()
            print("[개발 모드] 스타일시트 업데이트 완료")
        except Exception as e:
            print(f"[개발 모드] 스타일시트 리로드 오류: {e}")
            import traceback
            traceback.print_exc()
    
    def _reapply_all_styles(self):
        """모든 위젯의 스타일시트 재적용"""
        try:
            from modules.config.ui_constants import (
                Colors, BorderWidths, Sizes, BackgroundColors, 
                TextColors, BorderRadius, Padding
            )
            
            if not hasattr(self.window, 'control_panel'):
                return
            
            # 메인 컨테이너 스타일 재적용
            main_container = None
            for child in self.window.control_panel.children():
                if isinstance(child, QWidget) and child.styleSheet():
                    if "background-color" in child.styleSheet() and "CONTROL_PANEL" in str(BackgroundColors.CONTROL_PANEL):
                        main_container = child
                        break
            
            if main_container:
                main_container.setStyleSheet(f"""
                    QWidget {{
                        background-color: {BackgroundColors.CONTROL_PANEL};
                        border-radius: {BorderRadius.CONTROL_PANEL}px;
                    }}
                """)
            
            # 브랜드 라벨 스타일 재적용
            if hasattr(self.window, 'brand_label') and self.window.brand_label:
                self.window.brand_label.setStyleSheet(f"""
                    QLabel {{
                        background-color: {BackgroundColors.TRANSPARENT};
                        color: {TextColors.BRAND};
                        padding-left: 12px;
                        padding-right: 1px;
                    }}
                """)
            
            # 컨텐츠 위젯 스타일 재적용 (가장 중요 - 모든 버튼에 영향)
            content_widget = None
            for child in self.window.control_panel.children():
                if isinstance(child, QWidget):
                    for grandchild in child.children():
                        if isinstance(grandchild, QWidget) and grandchild.styleSheet():
                            if "QPushButton" in grandchild.styleSheet():
                                content_widget = grandchild
                                break
                    if content_widget:
                        break
            
            if content_widget:
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
            
            # 메뉴 스타일 재적용
            if hasattr(self.window, 'capture_menu') and self.window.capture_menu:
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
            
            if hasattr(self.window, 'file_save_menu') and self.window.file_save_menu:
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
            
            # Quit 버튼 스타일 재적용
            if hasattr(self.window, 'quit_btn') and self.window.quit_btn:
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
                    QPushButton:pressed {{
                        background-color: {BackgroundColors.BUTTON_PRESSED};
                    }}
                """)
            
            # 모니터 정보 라벨 스타일 재적용
            if hasattr(self.window, 'monitor_info_label') and self.window.monitor_info_label:
                self.window.monitor_info_label.setStyleSheet(f"""
                    QLabel {{
                        background-color: {BackgroundColors.TRANSPARENT};
                        color: {TextColors.PRIMARY};
                        padding-right: 8px;
                        font-size: 9px;
                        font-weight: bold;
                        padding: 0px;
                        margin: 0px;
                    }}
                """)
            
            # 모든 위젯 업데이트
            if self.window.control_panel:
                self.window.control_panel.update()
                for widget in self.window.control_panel.findChildren(QWidget):
                    widget.update()
                    
        except Exception as e:
            print(f"[개발 모드] 스타일 재적용 오류: {e}")
            import traceback
            traceback.print_exc()
    
    def reload_ui(self):
        """UI 재구성 (컨트롤 패널만 다시 빌드)"""
        try:
            print("[개발 모드] UI 리로드 중...")
            # 기존 컨트롤 패널 위치 및 상태 저장
            old_geometry = None
            was_visible = False
            if hasattr(self.window, 'control_panel') and self.window.control_panel:
                try:
                    was_visible = self.window.control_panel.isVisible()
                    if was_visible:
                        old_geometry = self.window.control_panel.geometry()
                except:
                    pass
                
                # 기존 컨트롤 패널의 모든 자식 위젯도 제거
                try:
                    if hasattr(self.window, 'brand_label') and self.window.brand_label:
                        self.window.brand_label.setParent(None)
                        self.window.brand_label.deleteLater()
                except:
                    pass
                try:
                    if hasattr(self.window, 'info_label') and self.window.info_label:
                        self.window.info_label.setParent(None)
                        self.window.info_label.deleteLater()
                except:
                    pass
                
                # 기존 컨트롤 패널 완전히 제거
                try:
                    self.window.control_panel.hide()
                    self.window.control_panel.setParent(None)
                    self.window.control_panel.deleteLater()
                except:
                    pass
                
                # 관련 속성들도 초기화
                if hasattr(self.window, 'control_panel_drag_position'):
                    self.window.control_panel_drag_position = None
                
                # 즉시 처리되도록 이벤트 루프 실행
                QApplication.processEvents()
                # 추가 지연으로 위젯 제거 완료 보장
                QTimer.singleShot(150, lambda: self._continue_reload(old_geometry, was_visible))
            else:
                # 컨트롤 패널이 없으면 바로 생성
                self._continue_reload(None, True)  # 기본적으로 보이도록
        except Exception as e:
            print(f"[개발 모드] UI 리로드 오류: {e}")
            import traceback
            traceback.print_exc()
            # 오류 발생 시에도 컨트롤 패널 재생성 시도
            QTimer.singleShot(200, lambda: self._continue_reload(None, True))
    
    def _continue_reload(self, old_geometry, was_visible):
        """리로드 계속 진행 (위젯 제거 후 실행)"""
        try:
            print("[개발 모드] 컨트롤 패널 재생성 중...")
            # 컨트롤 패널 다시 생성
            if hasattr(self.window, 'setup_control_panel'):
                self.window.setup_control_panel()
            
            # 이전 위치로 복원 (없으면 기본 위치 사용)
            if hasattr(self.window, 'control_panel'):
                if old_geometry is not None:
                    self.window.control_panel.setGeometry(old_geometry)
                else:
                    # 기본 위치 설정
                    screen = QApplication.primaryScreen().geometry()
                    panel_x = (screen.width() - self.window.control_panel.width()) // 2
                    panel_y = 20
                    self.window.control_panel.setGeometry(panel_x, panel_y, 
                                                          self.window.control_panel.width(), 
                                                          self.window.control_panel.height())
                
                # 항상 표시
                self.window.control_panel.show()
                self.window.control_panel.raise_()
                self.window.control_panel.activateWindow()
                print("[개발 모드] 컨트롤 패널 표시 완료")
            
            # 파일 감시 다시 설정 (필요시)
            if self.observer and not self.observer.is_alive():
                QTimer.singleShot(500, self._reconnect_file_watcher)
            
            print("[개발 모드] UI 리로드 완료")
        except Exception as e:
            print(f"[개발 모드] 리로드 계속 진행 중 오류: {e}")
            import traceback
            traceback.print_exc()
            # 오류 발생 시에도 컨트롤 패널이 보이도록 재시도
            try:
                if hasattr(self.window, 'control_panel'):
                    self.window.control_panel.show()
            except:
                pass
    
    def _reconnect_file_watcher(self):
        """파일 감시 재연결 (필요시)"""
        if self.observer and not self.observer.is_alive():
            try:
                self._setup_file_watcher()
                print("[개발 모드] 파일 감시 재연결 완료")
            except Exception as e:
                print(f"[개발 모드] 파일 감시 재연결 오류: {e}")
    
    def cleanup(self):
        """리소스 정리"""
        if self.observer:
            try:
                self.observer.stop()
                self.observer.join(timeout=2.0)
            except Exception as e:
                print(f"[개발 모드] Observer 정리 오류: {e}")
