// 보드창 프리셋 메타데이터, 썸네일, 유효성 검사 통합

export type PresetKey = 'single' | 'split-lr' | 'l-shape' | 'split-tb'

// 프리셋 메타데이터
export const PRESET_METADATA = {
  single: {
    label: '단일 창',
    icon: 'crop_square',
    description: '하나의 큰 넥셋로 구성됩니다.',
    thumbnail: { type: 'single', panes: ['main'] },
    category: 'basic',
    available: true,
  },
  'split-lr': {
    label: '좌우 분할',
    icon: 'view_week',
    description: '왼쪽과 오른쪽, 두 개의 넥셋로 분할됩니다.',
    thumbnail: { type: 'split-lr', panes: ['left', 'right'] },
    category: 'basic',
    available: true,
  },
  'l-shape': {
    label: 'L자형 분할',
    icon: 'view_quilt',
    description: '왼쪽 넥셋과, 상하로 분할된 오른쪽 넥셋로 구성됩니다.',
    thumbnail: { type: 'l-shape', panes: ['left', 'top', 'bottom'] },
    category: 'basic',
    available: true,
  },
  'split-tb': {
    label: '상하 분할',
    icon: 'view_stream',
    description: '위쪽과 아래쪽, 두 개의 넥셋로 분할됩니다.',
    thumbnail: { type: 'split-tb', panes: ['top', 'bottom'] },
    category: 'basic',
    available: true,
  },
}

// 헬퍼 함수들
export function getPresetMetadata(preset: string) {
  return (
    (PRESET_METADATA as Record<string, (typeof PRESET_METADATA)[PresetKey]>)[preset] || {
      label: preset,
      icon: 'dashboard_customize',
      description: '사용자 정의 레이아웃입니다.',
      thumbnail: { type: 'default', panes: [] },
      category: 'custom',
      available: false,
    }
  )
}

export function getPresetLabel(preset: string) {
  return getPresetMetadata(preset).label
}

export function getPresetDescription(preset: string) {
  return getPresetMetadata(preset).description
}

export function getPresetIcon(preset: string) {
  // LayoutSection에서 사용하는 아이콘 매핑 (기존과 호환성 유지)
  const iconMap: Record<PresetKey, string> = {
    single: 'view_agenda',
    'split-lr': 'view_week',
    'l-shape': 'view_quilt',
    'split-tb': 'view_day',
  }
  return (iconMap as Record<string, string>)[preset] || getPresetMetadata(preset).icon || 'view_quilt'
}

export function getPresetThumbnailConfig(preset: string) {
  return getPresetMetadata(preset).thumbnail || {}
}

// 유효성 검사
export function validatePreset(preset: string) {
  return (PRESET_METADATA as Record<string, { available?: boolean }>)[preset]?.available ?? false
}

export function canApplyPreset(preset: string, boardNode: { type?: string } | null | undefined) {
  return validatePreset(preset) && (!boardNode || boardNode.type === 'board')
}
