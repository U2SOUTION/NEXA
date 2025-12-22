# 설정 다이얼로그 모듈
from PySide6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QPushButton, 
                               QLabel, QTabWidget, QWidget)
from PySide6.QtCore import Qt
from modules.config.ui_constants import Colors, BorderWidths, Sizes, BackgroundColors, TextColors, BorderRadius, Padding


class SettingsDialog(QDialog):
    """
    설정 다이얼로그 클래스
    
    애플리케이션의 다양한 설정을 관리하는 다이얼로그입니다.
    탭 구조로 설정 항목을 분류하여 관리합니다.
    """
    
    def __init__(self, parent=None):
        """
        Args:
            parent: 부모 위젯 (ScreenDrawWindow)
        """
        super().__init__(parent)
        self.parent_window = parent
        
        self.setWindowTitle("설정")
        self.setMinimumSize(600, 500)
        self.setModal(True)  # 모달 다이얼로그로 설정
        
        # 레이아웃 설정
        main_layout = QVBoxLayout(self)
        main_layout.setSpacing(15)
        main_layout.setContentsMargins(20, 20, 20, 20)
        
        # 탭 위젯 생성
        self.tab_widget = QTabWidget()
        main_layout.addWidget(self.tab_widget)
        
        # 탭 추가 (향후 확장 가능)
        # 현재는 기본 구조만 제공
        self.create_general_tab()
        self.create_shortcut_tab()
        
        # 버튼 레이아웃 (하단)
        button_layout = QHBoxLayout()
        button_layout.addStretch()  # 왼쪽 공간 채우기
        
        # 확인 버튼
        self.ok_button = QPushButton("확인")
        self.ok_button.clicked.connect(self.accept)
        button_layout.addWidget(self.ok_button)
        
        # 취소 버튼
        self.cancel_button = QPushButton("취소")
        self.cancel_button.clicked.connect(self.reject)
        button_layout.addWidget(self.cancel_button)
        
        main_layout.addLayout(button_layout)
        
        # 스타일 적용
        self.apply_styles()
    
    def create_general_tab(self):
        """일반 설정 탭 생성"""
        general_tab = QWidget()
        general_layout = QVBoxLayout(general_tab)
        general_layout.setSpacing(10)
        general_layout.setContentsMargins(15, 15, 15, 15)
        
        # 예시: 설정 항목 추가 위치
        placeholder_label = QLabel("일반 설정 항목이 여기에 추가됩니다.")
        placeholder_label.setAlignment(Qt.AlignCenter)
        general_layout.addWidget(placeholder_label)
        general_layout.addStretch()
        
        self.tab_widget.addTab(general_tab, "일반")
    
    def create_shortcut_tab(self):
        """단축키 설정 탭 생성"""
        shortcut_tab = QWidget()
        shortcut_layout = QVBoxLayout(shortcut_tab)
        shortcut_layout.setSpacing(10)
        shortcut_layout.setContentsMargins(15, 15, 15, 15)
        
        # 예시: 단축키 설정 항목 추가 위치
        placeholder_label = QLabel("단축키 설정 항목이 여기에 추가됩니다.")
        placeholder_label.setAlignment(Qt.AlignCenter)
        shortcut_layout.addWidget(placeholder_label)
        shortcut_layout.addStretch()
        
        self.tab_widget.addTab(shortcut_tab, "단축키")
    
    def apply_styles(self):
        """다이얼로그 스타일 적용"""
        border_color = Colors.BUTTON_BORDER
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {BackgroundColors.MAIN};
            }}
            QTabWidget::pane {{
                border: {BorderWidths.BUTTON}px solid {border_color};
                border-radius: {BorderRadius.DIALOG}px;
                background-color: {BackgroundColors.CONTROL_PANEL};
            }}
            QTabBar::tab {{
                background-color: {BackgroundColors.BUTTON};
                border: {BorderWidths.BUTTON}px solid {border_color};
                border-bottom: none;
                border-top-left-radius: {BorderRadius.BUTTON}px;
                border-top-right-radius: {BorderRadius.BUTTON}px;
                padding: 8px 20px;
                color: {TextColors.PRIMARY};
                margin-right: 2px;
            }}
            QTabBar::tab:selected {{
                background-color: {BackgroundColors.CONTROL_PANEL};
            }}
            QTabBar::tab:hover {{
                background-color: {BackgroundColors.BUTTON_HOVER};
            }}
            QPushButton {{
                background-color: {BackgroundColors.BUTTON};
                border: {BorderWidths.BUTTON}px solid {border_color};
                border-radius: {BorderRadius.BUTTON}px;
                padding: 8px 20px;
                color: {TextColors.PRIMARY};
                min-width: 80px;
            }}
            QPushButton:hover {{
                background-color: {BackgroundColors.BUTTON_HOVER};
            }}
            QPushButton:pressed {{
                background-color: {BackgroundColors.BUTTON_PRESSED};
            }}
            QLabel {{
                color: {TextColors.PRIMARY};
            }}
        """)
    
    def accept(self):
        """확인 버튼 클릭 시 설정 저장 및 다이얼로그 닫기"""
        # TODO: 설정 저장 로직 추가
        super().accept()
    
    def reject(self):
        """취소 버튼 클릭 시 다이얼로그 닫기 (변경 사항 저장 안 함)"""
        super().reject()

