# 컨트롤 패널 관리 모듈
from PySide6.QtWidgets import QWidget, QLayout
from PySide6.QtCore import Qt, QTimer
from typing import Dict, Optional, Any, Union


class ControlPanelManager:
    """
    컨트롤 패널(툴바) 위젯 관리 클래스
    
    위젯 등록, 생명주기 관리 및 동적 위젯 표시/숨김 시 컨트롤 패널 크기 자동 조정을 제공합니다.
    
    주의:
    - 이 클래스는 컨트롤 패널(툴바)의 위젯 관리만 담당합니다.
    - 드로잉 영역 관련 기능은 ScreenDrawWindow에서 처리됩니다.
    - 크기 조정은 동적 위젯 표시/숨김 시에만 자동으로 수행됩니다.
    - 사용자가 직접 툴바를 리사이즈하는 기능은 현재 없습니다.
    
    사용 예시:
        # 위젯 추가 및 등록 (일반 위젯)
        manager.add_widget('my_button', button_widget, layout=my_layout)
        
        # 동적 위젯 추가 (표시/숨김 시 크기 자동 조정)
        manager.add_widget('preview_box', preview_widget, layout=my_layout, dynamic=True)
        
        # 위젯 조회
        widget = manager.get_widget('my_button')
        
        # 위젯 표시/숨김
        manager.show_widget('preview_box')
        manager.hide_widget('preview_box')
    """
    
    def __init__(self, parent_window):
        """
        Args:
            parent_window: ScreenDrawWindow 인스턴스
        """
        self.parent_window = parent_window
        self.control_panel: Optional[QWidget] = None
        self.widgets: Dict[str, Dict[str, Any]] = {}  # 위젯 레지스트리
        # {name: {'widget': widget, 'dynamic': bool, 'layout': layout}}
        
        # 레이아웃 관리자 초기화 (지연 초기화를 위해 None으로 시작)
        self.layout_manager: Optional[Any] = None
    
    def add_widget(self, name: str, widget: QWidget, layout: Union[QLayout, None] = None, 
                   dynamic: bool = False, **layout_kwargs) -> QWidget:
        """
        위젯을 레이아웃에 추가하고 등록하는 편의 메서드
        
        이 메서드는 위젯을 레이아웃에 추가하면서 동시에 위젯 레지스트리에 등록합니다.
        동적 위젯으로 등록하면 표시/숨김 시 컨트롤 패널 크기가 자동으로 조정됩니다.
        
        Args:
            name: 위젯 이름 (고유 식별자)
            widget: 추가할 위젯
            layout: 위젯을 추가할 레이아웃 (필수)
            dynamic: 동적 위젯 여부 (표시/숨김 시 크기 조정 필요, 기본값: False)
            **layout_kwargs: 레이아웃의 addWidget()에 전달할 추가 인자
        
        Returns:
            추가된 위젯 (체이닝 가능)
        
        Raises:
            ValueError: layout이 제공되지 않은 경우
        """
        if layout is None:
            raise ValueError(f"layout은 필수입니다. 위젯 '{name}' 추가 시 layout을 제공해주세요.")
        
        # 레이아웃에 위젯 추가
        layout.addWidget(widget, **layout_kwargs)
        
        # 위젯 등록
        self.register_widget(name, widget, dynamic=dynamic, layout=layout)
        
        return widget
    
    def register_widget(self, name: str, widget: QWidget, dynamic: bool = False, layout=None):
        """
        위젯 등록 (레이아웃에 추가하지 않고 등록만 수행)
        
        이미 레이아웃에 추가된 위젯을 등록할 때 사용합니다.
        위젯을 레이아웃에 추가하면서 등록하려면 add_widget()을 사용하세요.
        
        Args:
            name: 위젯 이름 (고유 식별자)
            widget: 등록할 위젯
            dynamic: 동적 위젯 여부 (표시/숨김 시 크기 조정 필요, 기본값: False)
            layout: 위젯이 속한 레이아웃 (선택적, 동적 크기 조정 시 유용)
        """
        if name in self.widgets:
            print(f"[경고] 위젯 '{name}'이 이미 등록되어 있습니다. 기존 등록을 덮어씁니다.")
        
        self.widgets[name] = {
            'widget': widget,
            'dynamic': dynamic,
            'layout': layout
        }
        
        # 동적 위젯인 경우 show/hide 이벤트를 후킹하여 크기 조정
        if dynamic:
            self._setup_dynamic_widget_hooks(widget)
    
    def _setup_dynamic_widget_hooks(self, widget: QWidget):
        """동적 위젯의 show/hide 이벤트 후킹"""
        # QWidget의 showEvent와 hideEvent를 오버라이드하는 방식
        from PySide6.QtCore import QEvent
        
        original_showEvent = widget.showEvent if hasattr(widget, 'showEvent') and callable(getattr(widget, 'showEvent', None)) else None
        original_hideEvent = widget.hideEvent if hasattr(widget, 'hideEvent') and callable(getattr(widget, 'hideEvent', None)) else None
        
        def showEvent(event: QEvent):
            # 원래 showEvent가 있으면 호출
            if original_showEvent:
                original_showEvent(event)
            else:
                # QWidget의 기본 showEvent 호출
                QWidget.showEvent(widget, event)
            # 위젯의 geometry 업데이트
            widget.updateGeometry()
            # QTimer를 사용하여 레이아웃 업데이트 후 크기 조정 (약간의 지연 추가)
            QTimer.singleShot(10, self.adjust_panel_size)
        
        def hideEvent(event: QEvent):
            # 원래 hideEvent가 있으면 호출
            if original_hideEvent:
                original_hideEvent(event)
            else:
                # QWidget의 기본 hideEvent 호출
                QWidget.hideEvent(widget, event)
            # 위젯의 geometry 업데이트
            widget.updateGeometry()
            # QTimer를 사용하여 레이아웃 업데이트 후 크기 조정 (약간의 지연 추가)
            QTimer.singleShot(10, self.adjust_panel_size)
        
        widget.showEvent = showEvent
        widget.hideEvent = hideEvent
    
    def show_widget(self, name: str):
        """위젯 표시 및 레이아웃 업데이트"""
        if name in self.widgets:
            widget = self.widgets[name]['widget']
            widget.show()
            # 동적 위젯이 아닌 경우에도 명시적으로 크기 조정
            if not self.widgets[name]['dynamic']:
                QTimer.singleShot(0, self.adjust_panel_size)
    
    def hide_widget(self, name: str):
        """위젯 숨김 및 레이아웃 업데이트"""
        if name in self.widgets:
            widget = self.widgets[name]['widget']
            widget.hide()
            # 동적 위젯이 아닌 경우에도 명시적으로 크기 조정
            if not self.widgets[name]['dynamic']:
                QTimer.singleShot(0, self.adjust_panel_size)
    
    def get_widget(self, name: str) -> Optional[QWidget]:
        """
        등록된 위젯 가져오기
        
        Args:
            name: 위젯 이름
        
        Returns:
            위젯 객체 (없으면 None)
        """
        if name in self.widgets:
            return self.widgets[name]['widget']
        return None
    
    def has_widget(self, name: str) -> bool:
        """위젯이 등록되어 있는지 확인"""
        return name in self.widgets
    
    def get_all_widgets(self) -> Dict[str, QWidget]:
        """등록된 모든 위젯 반환"""
        return {name: info['widget'] for name, info in self.widgets.items()}
    
    def get_dynamic_widgets(self) -> Dict[str, QWidget]:
        """동적 위젯만 반환"""
        return {name: info['widget'] for name, info in self.widgets.items() if info['dynamic']}
    
    def adjust_panel_size(self):
        """
        컨트롤 패널(툴바) 크기 자동 조정 (LayoutManager에 위임)
        
        동적 위젯의 표시/숨김 시 호출되어 컨트롤 패널 크기를 자동으로 조정합니다.
        실제 크기 조정 작업은 ControlPanelLayoutManager에 위임합니다.
        
        참고:
        - 드로잉 영역의 크기 조정과는 무관합니다.
        - 사용자가 직접 툴바를 리사이즈하는 기능은 현재 없습니다.
        """
        # 레이아웃 관리자가 있으면 위임, 없으면 직접 처리
        if self.layout_manager:
            self.layout_manager.adjust_panel_size()
        else:
            # 레이아웃 관리자가 없을 때의 기본 동작 (하위 호환성)
            if self.control_panel and self.control_panel.isVisible():
                self.control_panel.adjustSize()
                self.control_panel.update()
    
    def set_control_panel(self, panel: QWidget):
        """컨트롤 패널 위젯 설정"""
        self.control_panel = panel
        
        # 레이아웃 관리자 초기화 및 연결
        if not self.layout_manager:
            from modules.control_panel_layout_manager import ControlPanelLayoutManager
            self.layout_manager = ControlPanelLayoutManager(self)
    
    def set_layout_manager(self, layout_manager):
        """레이아웃 관리자 설정"""
        self.layout_manager = layout_manager

