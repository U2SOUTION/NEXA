# 프리셋 시스템 리팩토링 계획

## 목표

- 신규 보드 초기 구성
- 기존 보드 레이아웃 수정
- 창 구성 변경 없이 옵션/기능만 관리 (미래 확장)

## 제안 파일 구조 (간소화)

```
src/
├── composables/
│   └── useBoardPreset.js                      # 프리셋 관련 모든 로직 통합
│
├── utils/
│   └── boardWindowPreset.js                  # 보드창 프리셋 메타데이터 + 썸네일 + 유효성 검사 통합
│
└── board/
    ├── NexaBoardSetup.vue                     # 보드 초기 설정 컨테이너 (프리셋 + 디바이스 포함)
    ├── NexaDashboardRenderer.vue              # 기존
    ├── window/                                # 보드창 프리셋 관련 컴포넌트
    │   ├── WindowPresetCard.vue               # 보드창 프리셋 카드 (아이콘/썸네일 포함)
    │   ├── WindowPresetSelector.vue           # 보드창 프리셋 선택기 (공통 로직)
    │   ├── WindowPresetSetupView.vue          # 보드창 프리셋 선택 뷰 (NexaBoardSetup에서 사용)
    │   └── WindowPresetEditModal.vue          # 보드창 프리셋 편집 모달 (WindowPresetModal 대체)
    └── device/                                # 디바이스 관련 컴포넌트
        └── DeviceConnectionView.vue           # 디바이스 연결 확인 뷰 (NexaBoardSetup에서 사용)
```

## 상세 구조 설명

### 1. Composable (`src/composables/useBoardPreset.js`)

모든 프리셋 관련 로직을 하나의 파일에 통합

```javascript
import { ref, computed } from 'vue'
import { useDashboardLayoutStore } from 'src/stores/dashboardLayoutStore'
import { useBoardMenuStore } from 'src/stores/boardMenuStore'

export function useBoardPreset(mode = 'select') {
  // mode: 'setup' | 'edit' | 'options'
  const dashboardLayoutStore = useDashboardLayoutStore()
  const boardMenuStore = useBoardMenuStore()

  // 선택 로직
  const tempSelectedPreset = ref(null)
  const activePreset = computed(() => dashboardLayoutStore.activePreset)
  const presets = computed(() => dashboardLayoutStore.presets)

  // 구성 관리
  function selectPreset(preset, options = {}) {
    // options: { immediate: true, save: true }
  }

  function confirmSelection() {
    // 임시 선택을 확정
  }

  function applyPreset(preset, boardNode) {
    // 프리셋을 보드에 적용
  }

  function initializePreset(preset, boardNode) {
    // 신규 보드에 프리셋 초기화
  }

  // 옵션 관리 (미래 확장)
  const presetOptions = ref({})
  function setOption(preset, optionKey, value) {}
  function getOptions(preset) {}

  return {
    // 선택
    tempSelectedPreset,
    activePreset,
    presets,
    selectPreset,
    confirmSelection,
    // 구성
    applyPreset,
    initializePreset,
    // 옵션
    presetOptions,
    setOption,
    getOptions,
    mode,
  }
}
```

### 2. Utils (`src/utils/windowPresetMetadata.js`)

프리셋 메타데이터, 썸네일, 유효성 검사를 하나의 파일에 통합

```javascript
// 프리셋 메타데이터
export const PRESET_METADATA = {
  single: {
    label: '단일 창',
    icon: 'crop_square',
    description: '하나의 큰 패널로 구성됩니다.',
    thumbnail: { type: 'single', panes: ['main'] },
    category: 'basic',
    available: true,
  },
  'split-lr': {
    label: '좌우 분할',
    icon: 'view_week',
    description: '왼쪽과 오른쪽, 두 개의 패널로 분할됩니다.',
    thumbnail: { type: 'split-lr', panes: ['left', 'right'] },
    category: 'basic',
    available: true,
  },
  // ...
}

// 헬퍼 함수들
export function getPresetMetadata(preset) {
  return PRESET_METADATA[preset] || { label: preset, icon: 'dashboard_customize', description: '' }
}

export function getPresetLabel(preset) {
  return getPresetMetadata(preset).label
}

export function getPresetDescription(preset) {
  return getPresetMetadata(preset).description
}

export function getPresetIcon(preset) {
  return getPresetMetadata(preset).icon
}

export function getPresetThumbnailConfig(preset) {
  return getPresetMetadata(preset).thumbnail || {}
}

// 유효성 검사
export function validatePreset(preset) {
  return PRESET_METADATA[preset]?.available ?? false
}

export function canApplyPreset(preset, boardNode) {
  return validatePreset(preset) && (!boardNode || boardNode.type === 'board')
}
```

### 3. Components (`src/board/window/`)

#### `WindowPresetCard.vue` - 보드창 프리셋 카드 (아이콘/썸네일 포함)

```vue
<template>
  <div class="preset-card" :class="{ active, selected }" @click="$emit('select', preset)">
    <!-- 썸네일 모드 -->
    <div v-if="displayMode === 'thumbnail'" class="preset-thumbnail" :class="`thumbnail-${preset}`">
      <!-- 썸네일 렌더링 로직 (기존 WindowPresetModal의 썸네일 코드) -->
    </div>

    <!-- 아이콘 모드 -->
    <div v-else-if="displayMode === 'icon'" class="preset-icon">
      <q-icon :name="icon" size="xl" :color="selected ? 'white' : 'primary'" />
    </div>

    <!-- 정보 -->
    <div class="preset-info">
      <div class="preset-label">{{ label }}</div>
      <div class="preset-description">{{ description }}</div>
    </div>

    <!-- 선택 표시 -->
    <slot name="indicator" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getPresetMetadata } from 'src/utils/boardWindowPreset'

const props = defineProps({
  preset: { type: String, required: true },
  active: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  displayMode: { type: String, default: 'thumbnail' }, // 'thumbnail' | 'icon'
})

const metadata = computed(() => getPresetMetadata(props.preset))
const label = computed(() => metadata.value.label)
const description = computed(() => metadata.value.description)
const icon = computed(() => metadata.value.icon)
</script>
```

#### `WindowPresetSelector.vue` - 보드창 프리셋 선택기

```vue
<template>
  <div class="preset-selector" :class="`selector-${displayMode}`">
    <WindowPresetCard v-for="preset in presets" :key="preset" :preset="preset" :active="activePreset === preset" :selected="tempSelectedPreset === preset" :display-mode="displayMode" @select="handleSelect">
      <template #indicator>
        <q-icon v-if="activePreset === preset" name="check_circle" color="primary" />
      </template>
    </WindowPresetCard>
  </div>
</template>

<script setup>
import { useBoardPreset } from 'src/composables/useBoardPreset'
import WindowPresetCard from 'src/board/window/WindowPresetCard.vue'

const props = defineProps({
  mode: { type: String, default: 'select' },
  displayMode: { type: String, default: 'thumbnail' },
  selectionMode: { type: String, default: 'immediate' }, // 'immediate' | 'confirm'
})

const emit = defineEmits(['select', 'confirm'])

const { presets, activePreset, tempSelectedPreset, selectPreset } = useBoardPreset(props.mode)

function handleSelect(preset) {
  if (props.selectionMode === 'immediate') {
    selectPreset(preset, { immediate: true })
  } else {
    selectPreset(preset, { immediate: false })
  }
  emit('select', preset)
}
</script>
```

#### `WindowPresetSetupView.vue` - 보드창 프리셋 선택 뷰 (NexaBoardSetup에서 사용)

```vue
<template>
  <div class="preset-setup-view">
    <div class="setup-header">
      <div class="text-subtitle1 q-mb-sm">
        <q-icon name="dashboard_customize" size="22px" class="q-mr-xs" color="primary" />
        NEXA 보드 창 구성 선택
      </div>
      <p class="text-caption text-grey-7">아래에서 보드 대시보드의 기본 레이아웃을 선택하세요. 이 설정은 나중에 변경할 수 있습니다.</p>
    </div>

    <WindowPresetSelector mode="setup" display-mode="icon" selection-mode="confirm" @select="handleSelect" />
  </div>
</template>

<script setup>
import { useBoardPreset } from 'src/composables/useBoardPreset'
import WindowPresetSelector from 'src/board/window/WindowPresetSelector.vue'

const emit = defineEmits(['select'])

const { tempSelectedPreset } = useBoardPreset('setup')

function handleSelect(preset) {
  emit('select', preset)
}
</script>
```

#### `DeviceConnectionView.vue` - 디바이스 연결 확인 뷰

```vue
<template>
  <div class="device-connection-view">
    <div class="text-subtitle1 q-mb-sm">
      <q-icon name="devices" size="22px" class="q-mr-xs" color="primary" />
      연결된 디바이스 확인 (선택 사항)
    </div>
    <div v-if="devices && devices.length > 0">
      <q-list bordered>
        <q-item v-for="device in devices" :key="device.id || device">
          <q-item-section avatar>
            <q-icon name="developer_board" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ getDeviceDisplayName(device.id || device) }}</q-item-label>
            <q-item-label caption>{{ device.type || '-' }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div v-else class="text-grey-7">이 보드에 아직 연결된 디바이스가 없습니다. '보드 관리'에서 추가할 수 있습니다.</div>
  </div>
</template>

<script setup>
const props = defineProps({
  devices: {
    type: Array,
    default: () => [],
  },
})

function getDeviceDisplayName(deviceId) {
  const tempDevices = {
    living_temp_sensor_01: '거실 온도 센서',
    front_door_cam_alpha: '현관문 카메라',
    master_room_light_switch: '안방 조명 스위치',
    kitchen_gas_detector_v2: '주방 가스 감지기',
    garden_sprinkler_main: '정원 스프링클러',
  }
  return tempDevices[deviceId] || deviceId
}
</script>
```

#### `NexaBoardSetup.vue` - 보드 초기 설정 컨테이너 (리팩토링)

```vue
<template>
  <div v-if="isOpen" class="nexa-setup-panel">
    <div class="background-text">NEXA BOARD</div>
    <div class="nexa-setup-title q-mb-sm">
      <q-icon name="dashboard" size="48px" class="q-mr-sm" color="primary" />
      <span class="board-name">{{ boardName }}</span>
    </div>
    <div class="welcome-message q-mb-md">
      보드 시작을 환영합니다.<br />
      지금부터 새로운 보드의 대시보드를 쉽고 빠르게 구성할 수 있습니다.<br />
      아래 단계에 따라 초기 설정을 진행해 주세요.
    </div>

    <!-- 디바이스 연결 확인 -->
    <div class="setup-section q-mb-lg step-bordered">
      <DeviceConnectionView :devices="devices" />
    </div>

    <!-- 프리셋 선택 -->
    <div class="setup-section q-mb-lg step-bordered">
      <WindowPresetSetupView @select="handlePresetSelect" />
    </div>

    <!-- 시작 버튼 -->
    <div class="text-center q-mt-lg">
      <q-btn label="선택한 넥사보드 창으로 시작하기" color="primary" icon-right="arrow_forward" size="lg" :disable="!tempSelectedPreset" @click="confirmAndStartLayout" unelevated />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useDashboardLayoutStore } from 'src/stores/dashboardLayoutStore'
import { useBoardPreset } from 'src/composables/useBoardPreset'
import WindowPresetSetupView from 'src/board/window/WindowPresetSetupView.vue'
import DeviceConnectionView from 'src/board/device/DeviceConnectionView.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  boardName: { type: String, required: true },
  devices: { type: Array, default: () => [] },
})

const $q = useQuasar()
const dashboardLayoutStore = useDashboardLayoutStore()
const { tempSelectedPreset, confirmSelection, initializePreset } = useBoardPreset('setup')

function handlePresetSelect(preset) {
  tempSelectedPreset.value = preset
}

async function confirmAndStartLayout() {
  if (!tempSelectedPreset.value) {
    $q.notify({
      type: 'warning',
      message: '먼저 레이아웃 프리셋을 선택해주세요.',
      icon: 'warning',
    })
    return
  }

  await confirmSelection()
  const selectedNode = dashboardLayoutStore.selectedNodeForDashboard
  if (selectedNode && selectedNode.type === 'board') {
    await initializePreset(tempSelectedPreset.value, selectedNode)
  }
}
</script>
```

#### `WindowPresetEditModal.vue` - 보드창 프리셋 편집 모달 (WindowPresetModal 대체)

```vue
<template>
  <q-dialog v-model="showModal" :maximized="$q.screen.lt.md" persistent>
    <q-card class="preset-edit-modal" :style="modalCardStyle">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">NEXA 보드창 선택</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <WindowPresetSelector mode="edit" display-mode="thumbnail" selection-mode="immediate" @select="handleSelect" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useBoardPreset } from 'src/composables/useBoardPreset'
import WindowPresetSelector from 'src/board/window/WindowPresetSelector.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const $q = useQuasar()

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const modalCardStyle = computed(() => {
  if ($q.screen.lt.md) {
    return { width: '100%', maxWidth: '100%' }
  } else if ($q.screen.lt.lg) {
    return { minWidth: '500px', maxWidth: '600px', width: '90vw' }
  } else {
    return { minWidth: '600px', maxWidth: '750px', width: '70vw' }
  }
})

const { selectPreset } = useBoardPreset('edit')

function handleSelect(preset) {
  selectPreset(preset, { immediate: true, save: true })
}
</script>
```

## 사용 예시

### 1. 신규 보드 구성

```vue
<template>
  <NexaBoardSetup :is-open="showSetup" :board-name="boardName" :devices="devices" />
</template>

<script setup>
import NexaBoardSetup from 'src/board/NexaBoardSetup.vue'
</script>
```

### 2. 기존 보드 수정

```vue
<template>
  <WindowPresetEditModal v-model="showEdit" />
</template>

<script setup>
import WindowPresetEditModal from 'src/board/window/WindowPresetEditModal.vue'
</script>
```

## 마이그레이션 계획

1. **1단계**: Utils 생성 (`boardWindowPreset.js`) - 보드창 프리셋 메타데이터 통합
2. **2단계**: Composable 생성 (`useBoardPreset.js`) - 모든 로직 통합
3. **3단계**: 보드창 프리셋 컴포넌트 생성 (`WindowPresetCard.vue`, `WindowPresetSelector.vue`, `WindowPresetSetupView.vue`)
4. **4단계**: 디바이스 컴포넌트 생성 (`DeviceConnectionView.vue`)
5. **5단계**: 모달 생성 (`WindowPresetEditModal.vue`)
6. **6단계**: `NexaBoardSetup.vue` 리팩토링 (새 컴포넌트 사용)
7. **7단계**: 기존 컴포넌트 교체 및 제거
   - `src/board/NexaBoardSetup.vue` → 리팩토링하여 `WindowPresetSetupView`와 `DeviceConnectionView` 사용
   - `src/components/board/WindowPresetModal.vue` → `src/board/window/WindowPresetEditModal.vue`로 이동 및 대체

## 장점

1. **간결성**: 파일 수 최소화 (6개 컴포넌트 + 2개 유틸)
2. **모듈화**: 프리셋과 디바이스를 별도 컴포넌트로 분리하여 재사용성 향상
3. **재사용성**: 공통 컴포넌트와 로직 재사용
4. **확장성**: 새로운 모드나 옵션 추가 용이
5. **유지보수성**: 중앙 집중식 메타데이터 관리
6. **일관성**: 모든 프리셋 UI가 동일한 구조 사용

## 파일 요약

- **Utils**: `boardWindowPreset.js` (1개) - 보드창 프리셋 메타데이터, 썸네일, 유효성 검사 통합
- **위치**: 모든 보드 관련 컴포넌트는 `src/board/` 아래에 통합
- **Composable**: `useBoardPreset.js` (1개) - 선택, 구성, 옵션 로직 통합
- **Components**:
  - `WindowPresetCard.vue`, `WindowPresetSelector.vue`, `WindowPresetSetupView.vue`, `WindowPresetEditModal.vue` (보드창 프리셋 4개)
  - `DeviceConnectionView.vue` (디바이스 1개)
  - `NexaBoardSetup.vue` (컨테이너, 유지)
- **총 7개 파일** (컴포넌트 6개 + composable 1개 + utils 1개)
