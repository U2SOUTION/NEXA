# 설정 관리 모듈
import os
import json
from typing import Dict, Optional, Any

class ConfigManager:
    """설정 파일 관리 클래스"""
    CONFIG_FILE = "ScreenDrawConfig.json"
    
    def __init__(self, config_file: Optional[str] = None):
        """
        Args:
            config_file: 설정 파일 경로 (기본값: CONFIG_FILE)
        """
        self.config_file = config_file or self.CONFIG_FILE
        self.config = {}
    
    def load_config(self) -> Dict[str, Any]:
        """설정 파일에서 모든 설정 로드"""
        config = {
            'panel_x': None,
            'panel_y': None,
            'drawing_area_mode': None,
            'drawing_area_rect': None,
            'pen_color': None,
            'pen_width': None
        }
        
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    loaded_config = json.load(f)
                    config.update(loaded_config)
            except Exception as e:
                print(f"설정 파일 로드 오류: {e}")
        
        return config
    
    def save_config(self, config: Dict[str, Any]):
        """설정 파일에 모든 설정 저장"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"설정 파일 저장 오류: {e}")

