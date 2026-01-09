<!-- ThemeColorPanel.vue
  선택한 색상의 상세 정보 및 편집 패널
-->
<template>
  <div class="theme-color-panel">
    <div class="panel-content q-pa-md">
      <!-- 선택한 색상 미리보기 -->
      <div v-if="selectedColor" class="color-preview-section q-mb-md">
        <div class="color-preview-box" :style="{ backgroundColor: selectedColor.value }"></div>
        <div class="color-info">
          <div class="color-variable-name">{{ selectedColor.name }}</div>
          <div class="color-value">{{ selectedColor.value }}</div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <q-icon name="palette" size="48px" class="q-mb-sm" />
        <div class="empty-message">색상을 선택하세요</div>
        <div class="empty-hint">왼쪽 목록에서 색상을 클릭하여 상세 정보를 확인하세요.</div>
      </div>

      <!-- 색상 정보 섹션 -->
      <div v-if="selectedColor" class="info-section q-mt-md">
        <h4 class="section-title">색상 정보</h4>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">변수명</div>
            <div class="info-value">{{ selectedColor.name }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">HEX</div>
            <div class="info-value">{{ selectedColor.value }}</div>
          </div>
          <!-- TODO: RGB, HSL 변환 추가 -->
        </div>
      </div>

      <!-- 사용 통계 섹션 -->
      <div v-if="selectedColor" class="statistics-section q-mt-md">
        <h4 class="section-title">사용 통계</h4>
        <div class="statistics-content">
          <div class="stat-item">
            <div class="stat-label">사용 횟수</div>
            <div class="stat-value">{{ usageCount || 0 }}회</div>
          </div>
          <div v-if="usageFiles && usageFiles.length > 0" class="files-list">
            <div v-for="file in usageFiles" :key="file.path" class="file-item" @click="handleFileClick(file.path)">{{ file.path }} ({{ file.count }}회)</div>
          </div>
        </div>
      </div>

      <!-- 범용 색상 기능 섹션 -->
      <div v-if="selectedColor" class="universal-colors-section q-mt-md">
        <h4 class="section-title">범용 색상 기능</h4>
        <div class="universal-colors-content">
          <div class="empty-state-small">
            <q-icon name="extension" size="32px" class="q-mb-sm" />
            <div class="empty-message-small">범용 색상 기능 준비 중</div>
          </div>
        </div>
      </div>

      <!-- 색상 편집 섹션 -->
      <div v-if="selectedColor" class="edit-section q-mt-md">
        <h4 class="section-title">색상 편집</h4>
        <div class="edit-content">
          <div class="color-picker-wrapper">
            <q-color v-model="colorPickerValue" format-model="hex" @update:model-value="handleColorChange" class="color-picker" />
          </div>
          <div class="color-input-wrapper q-mt-md">
            <q-input v-model="colorPickerValue" label="HEX 색상" outlined dense @update:model-value="handleColorInputChange">
              <template v-slot:append>
                <q-icon name="colorize" />
              </template>
            </q-input>
          </div>
          <div class="edit-actions q-mt-md">
            <q-btn label="색상 업데이트" color="primary" unelevated :loading="isUpdating" :disable="!hasColorChanged" @click="handleUpdateColor" class="full-width" />
            <q-btn v-if="hasColorChanged" label="취소" flat @click="handleCancelEdit" class="full-width q-mt-sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  selectedColor: {
    type: Object,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  usageFiles: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['fileClicked', 'colorEdit', 'colorUpdated'])

const $q = useQuasar()

// 색상 편집 상태
const colorPickerValue = ref('#000000')
const originalColorValue = ref('')
const isUpdating = ref(false)
const hasColorChanged = computed(() => {
  if (!props.selectedColor) return false
  return colorPickerValue.value !== originalColorValue.value
})

// 색상 값을 HEX로 변환하는 함수
function convertToHex(colorValue) {
  if (!colorValue) return '#000000'

  // 이미 HEX 형식인 경우
  if (colorValue.startsWith('#')) {
    // rgba hex 형식 (#rrggbbaa)을 #rrggbb로 변환
    if (colorValue.length === 9) {
      return colorValue.substring(0, 7)
    }
    return colorValue
  }

  // rgba 형식인 경우
  if (colorValue.startsWith('rgba') || colorValue.startsWith('rgb')) {
    const match = colorValue.match(/\d+/g)
    if (match && match.length >= 3) {
      const r = parseInt(match[0])
      const g = parseInt(match[1])
      const b = parseInt(match[2])
      return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
    }
  }

  // hsl 형식인 경우 (간단한 변환)
  if (colorValue.startsWith('hsl')) {
    // TODO: HSL to HEX 변환 구현 (필요시)
    return '#000000'
  }

  return '#000000'
}

// 선택된 색상이 변경될 때 색상 피커 값 업데이트
watch(
  () => props.selectedColor,
  (newColor) => {
    if (newColor) {
      const hexValue = convertToHex(newColor.value)
      colorPickerValue.value = hexValue
      originalColorValue.value = hexValue
    }
  },
  { immediate: true },
)

// 색상 피커 값 변경 핸들러
function handleColorChange() {
  // 값이 변경되면 자동으로 반영됨 (v-model로 자동 처리)
}

// 색상 입력 필드 변경 핸들러
function handleColorInputChange(newValue) {
  // HEX 형식 검증
  if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
    colorPickerValue.value = newValue
  }
}

// 색상 업데이트 핸들러
async function handleUpdateColor() {
  if (!props.selectedColor || !hasColorChanged.value) return

  if (!import.meta.env.DEV) {
    $q.notify({
      type: 'negative',
      message: '개발 환경에서만 색상 수정이 가능합니다.',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  isUpdating.value = true

  try {
    // 현재 테마 모드 확인
    const isDark = $q.dark.isActive
    const themeFile = isDark ? 'system/css/themes/dark.scss' : 'system/css/themes/light.scss'

    // SCSS 파일 읽기
    const readResponse = await fetch(`http://localhost:3000/api/dev/files/${themeFile}/content`)
    if (!readResponse.ok) {
      throw new Error('테마 파일을 읽을 수 없습니다.')
    }

    const readData = await readResponse.json()
    let scssContent = readData.content

    // 변수명 추출 (--nexa-xxx)
    const variableName = props.selectedColor.name

    // HEX 값을 원래 형식으로 변환 (rgba인 경우 alpha 값 유지)
    let newColorValue = colorPickerValue.value
    const originalValue = props.selectedColor.value

    // 원래 값이 rgba 형식이었던 경우 alpha 값 유지
    if (originalValue.startsWith('rgba')) {
      const alphaMatch = originalValue.match(/rgba?\([^)]+,\s*([^)]+)\)/)
      if (alphaMatch) {
        const alpha = alphaMatch[1].trim()
        // HEX를 RGB로 변환
        const hex = colorPickerValue.value.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        newColorValue = `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
    } else if (originalValue.startsWith('rgb')) {
      // rgb 형식인 경우
      const hex = colorPickerValue.value.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      newColorValue = `rgb(${r}, ${g}, ${b})`
    }

    // SCSS 파일에서 해당 변수 찾아서 교체
    // 정규식: --nexa-xxx: 기존값; 형태를 찾아서 교체
    const variableRegex = new RegExp(`(${variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*)([^;]+)(;)`, 'g')
    scssContent = scssContent.replace(variableRegex, `$1${newColorValue}$3`)

    // SCSS 파일 저장
    const saveResponse = await fetch(`http://localhost:3000/api/dev/files/${themeFile}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: scssContent,
      }),
    })

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json()
      throw new Error(errorData.error || '테마 파일 저장에 실패했습니다.')
    }

    // 성공 알림
    $q.notify({
      type: 'positive',
      message: '색상이 업데이트되었습니다. 페이지를 새로고침하세요.',
      position: 'top',
      timeout: 3000,
    })

    // 원래 값 업데이트
    originalColorValue.value = colorPickerValue.value

    // 부모 컴포넌트에 색상 업데이트 알림
    emit('colorUpdated', {
      variableName,
      newValue: newColorValue,
      theme: isDark ? 'dark' : 'light',
    })
  } catch (error) {
    console.error('[ThemeColorPanel] 색상 업데이트 실패:', error)
    $q.notify({
      type: 'negative',
      message: `색상 업데이트 실패: ${error.message}`,
      position: 'top',
      timeout: 3000,
    })
  } finally {
    isUpdating.value = false
  }
}

// 편집 취소 핸들러
function handleCancelEdit() {
  if (props.selectedColor) {
    colorPickerValue.value = originalColorValue.value
  }
}

function handleFileClick(filePath) {
  emit('fileClicked', filePath)
}
</script>

<style lang="scss" scoped>
.theme-color-panel {
  width: 100%;

  .panel-content {
    width: 100%;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: var(--nexa-text-secondary);

    .empty-message {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      color: var(--nexa-text-secondary);
    }

    .empty-hint {
      font-size: 0.75rem;
      color: var(--nexa-text-hint);
    }
  }

  .empty-state-small {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    text-align: center;
    color: var(--nexa-text-secondary);

    .empty-message-small {
      font-size: 0.8rem;
      color: var(--nexa-text-hint);
    }
  }

  .color-preview-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--nexa-panel-bg);
    border: 1px solid var(--nexa-panel-border);
    border-radius: 8px;

    .color-preview-box {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      border: 2px solid var(--nexa-border-color);
      flex-shrink: 0;
    }

    .color-info {
      flex: 1;

      .color-variable-name {
        font-size: 1rem;
        font-weight: 600;
        color: var(--nexa-text-primary);
        margin-bottom: 0.5rem;
      }

      .color-value {
        font-size: 0.85rem;
        font-family: monospace;
        color: var(--nexa-text-secondary);
      }
    }
  }

  .section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--nexa-text-primary);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .info-section {
    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background-color: var(--nexa-item-bg);
        border: 1px solid var(--nexa-item-border);
        border-radius: 4px;

        .info-label {
          font-size: 0.85rem;
          color: var(--nexa-text-secondary);
        }

        .info-value {
          font-size: 0.85rem;
          font-family: monospace;
          color: var(--nexa-text-primary);
          font-weight: 500;
        }
      }
    }
  }

  .statistics-section {
    .statistics-content {
      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background-color: var(--nexa-item-bg);
        border: 1px solid var(--nexa-item-border);
        border-radius: 4px;
        margin-bottom: 0.75rem;

        .stat-label {
          font-size: 0.85rem;
          color: var(--nexa-text-secondary);
        }

        .stat-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--nexa-primary);
        }
      }

      .files-list {
        margin-top: 0.5rem;

        .file-item {
          font-size: 0.8rem;
          color: var(--nexa-text-secondary);
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;

          &:hover {
            background-color: var(--nexa-item-hover-bg);
            color: var(--nexa-primary);
          }
        }
      }
    }
  }

  .universal-colors-section,
  .edit-section {
    padding: 1rem;
    background-color: var(--nexa-panel-bg);
    border: 1px solid var(--nexa-panel-border);
    border-radius: 8px;

    .edit-content {
      .color-picker-wrapper {
        display: flex;
        justify-content: center;
        padding: 1rem;
        background-color: var(--nexa-item-bg);
        border-radius: 8px;

        .color-picker {
          width: 100%;
        }
      }

      .color-input-wrapper {
        .q-field {
          background-color: var(--nexa-item-bg);
        }
      }

      .edit-actions {
        .q-btn {
          min-height: 40px;
        }
      }
    }
  }
}
</style>
