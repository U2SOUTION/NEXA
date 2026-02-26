<template>
  <div class="shortcuts-settings">
    <div class="settings-header">
      <div class="header-content">
        <div class="header-text">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="keyboard" size="24px" class="q-mr-sm" />
            키보드 단축키
          </h3>
          <p class="text-body2 text-grey-7 q-mb-lg">단축키를 확인하고 수정하거나 새로운 단축키를 추가할 수 있습니다.</p>
        </div>
        <div class="header-actions">
          <q-btn color="primary" icon="add" label="새 단축키 추가" @click="showAddDialog = true" />
        </div>
      </div>
    </div>

    <!-- 단축키 목록 (카테고리별 정리) -->
    <div class="shortcuts-list q-mb-lg">
      <template v-for="category in categorizedShortcuts" :key="category.name">
        <div class="category-section">
          <div class="category-header">
            <q-icon :name="category.icon" size="20px" class="q-mr-sm" />
            <span class="category-title">{{ category.title }}</span>
          </div>
          <q-list>
            <q-item v-for="shortcut in category.shortcuts" :key="shortcut.id" class="shortcut-item">
              <q-item-section>
                <div class="shortcut-label-row">
                  <q-item-label class="shortcut-description">{{ shortcut.description || shortcut.id }}</q-item-label>
                  <kbd class="shortcut-key" @click="executeShortcut(shortcut)">{{ formatCombo(shortcut.setting?.combo || shortcut.combo || getComboFromSetting(shortcut.setting)) }}</kbd>
                </div>
              </q-item-section>
              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn flat dense round icon="edit" color="primary" size="sm" @click="editShortcut(shortcut)">
                    <q-tooltip>수정</q-tooltip>
                  </q-btn>
                  <q-toggle :model-value="getShortcutEnabled(shortcut)" :true-value="true" :false-value="false" @update:model-value="toggleShortcut(shortcut.id, $event)" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>
    </div>
  </div>

  <br />

  <!-- 브라우저 기본 단축키 -->
  <div class="shortcuts-settings browser-Shortcuts" :style="browserContainerStyle">
    <div class="settings-header">
      <div class="header-content">
        <div class="header-text">
          <h3 class="text-h6 q-mb-md">브라우저 단축키</h3>
          <p class="text-body2 text-grey-7 q-mb-lg">시스템에서 고정된 단축키 목록이며 수정할 수 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 단축키 목록 -->
    <div class="shortcuts-list q-mb-lg">
      <q-list>
        <q-item v-for="browserShortcut in browserShortcuts" :key="browserShortcut.id" class="shortcut-item">
          <q-item-section>
            <div class="shortcut-label-row">
              <q-item-label class="shortcut-description">{{ browserShortcut.description }}</q-item-label>
              <kbd class="shortcut-key" @click="showBrowserShortcutInfo(browserShortcut)">{{ formatCombo(browserShortcut.combo) }}</kbd>
            </div>
          </q-item-section>
          <q-item-section side>
            <div class="row q-gutter-xs">
              <q-btn flat dense round icon="edit" color="primary" size="sm" disabled>
                <q-tooltip>브라우저 기본 단축키는 수정할 수 없습니다</q-tooltip>
              </q-btn>
              <q-toggle :model-value="true" disabled dense color="primary" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>

  <!-- 단축키 수정/추가 다이얼로그 -->
  <q-dialog v-model="showEditDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">{{ editingShortcut?.id ? '단축키 수정' : '새 단축키 추가' }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model="editForm.description" label="설명" outlined dense class="q-mb-md" />
        <q-input v-model="editForm.combo" label="키 조합 (예: ctrl+b, ctrl+shift+s)" outlined dense class="q-mb-md" hint="Ctrl, Shift, Alt와 키를 +로 연결하세요">
          <template v-slot:append>
            <q-btn flat dense icon="keyboard" @click="captureKeyCombo">
              <q-tooltip>키 조합 캡처</q-tooltip>
            </q-btn>
          </template>
        </q-input>
        <div v-if="capturing" class="text-caption text-primary q-mt-sm">키 조합을 입력하세요... (ESC로 취소)</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" color="grey" v-close-popup @click="cancelEdit" />
        <q-btn flat label="삭제" color="negative" v-if="editingShortcut?.id" @click="deleteShortcut" />
        <q-btn flat label="저장" color="primary" @click="saveShortcut" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useGlobalShortcuts } from '@system/composables/useGlobalShortcuts'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const { getRegisteredShortcuts, updateShortcut, setShortcutEnabled, registerShortcut, unregisterShortcut, getShortcutHandler, getCategorizedShortcuts } = useGlobalShortcuts()

// 브라우저 단축키 컨테이너 스타일
const browserContainerStyle = computed(() => {
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--nexa-border-color').trim() || 'rgba(0, 0, 0, 0.385)'
  return {
    border: `1px solid ${borderColor}`,
    borderRadius: '14px',
    marginTop: '24px',
  }
})

const shortcuts = ref([])
const showEditDialog = ref(false)
const showAddDialog = ref(false)
const editingShortcut = ref(null)
const editForm = ref({
  description: '',
  combo: '',
})
const capturing = ref(false)
let keyCaptureHandler = null

// 브라우저 기본 단축키 목록
const browserShortcuts = ref([
  { id: 'browser-devtools', description: '개발자 도구 열기/닫기', combo: 'ctrl+shift+i' },
  { id: 'browser-console', description: '콘솔 열기/닫기', combo: 'ctrl+shift+j' },
  { id: 'browser-inspect', description: '요소 선택 모드', combo: 'ctrl+shift+c' },
  { id: 'browser-close-tab', description: '탭 닫기 (일부 브라우저)', combo: 'ctrl+w' },
  { id: 'browser-back', description: '뒤로 가기 (일부 브라우저)', combo: 'alt+left' },
  { id: 'browser-forward', description: '앞으로 가기 (일부 브라우저)', combo: 'alt+right' },
])

// 브라우저 단축키 정보 표시
function showBrowserShortcutInfo(browserShortcut) {
  $q.notify({
    type: 'info',
    message: `${browserShortcut.description} - 브라우저 기본 단축키입니다`,
    position: 'top',
    timeout: 2000,
    icon: 'info',
  })
}

// 카테고리별로 정리된 단축키 (useGlobalShortcuts에서 관리)
const categorizedShortcuts = computed(() => {
  return getCategorizedShortcuts(shortcuts.value)
})

// 단축키 목록 로드
function loadShortcuts() {
  shortcuts.value = getRegisteredShortcuts()
}

// 키 조합 포맷팅
function formatCombo(combo) {
  if (!combo) return '미설정'
  return combo
    .split('+')
    .map((key) => {
      const keyMap = {
        ctrl: 'Ctrl',
        shift: 'Shift',
        alt: 'Alt',
        cmd: 'Cmd',
        meta: 'Cmd',
      }
      return keyMap[key.toLowerCase()] || key.toUpperCase()
    })
    .join(' + ')
}

// 설정에서 키 조합 추출 (하위 호환성)
function getComboFromSetting(setting) {
  if (!setting) return null
  if (setting.combo) return setting.combo

  const parts = []
  if (setting.ctrlKey) parts.push('ctrl')
  if (setting.metaKey) parts.push('cmd')
  if (setting.shiftKey) parts.push('shift')
  if (setting.altKey) parts.push('alt')
  if (setting.key) parts.push(setting.key)

  return parts.length > 0 ? parts.join('+') : null
}

// 단축키 수정
function editShortcut(shortcut) {
  editingShortcut.value = shortcut
  editForm.value = {
    description: shortcut.description || '',
    combo: shortcut.setting?.combo || shortcut.combo || getComboFromSetting(shortcut.setting) || '',
  }
  showEditDialog.value = true
}

// 단축키 활성화 상태 가져오기
function getShortcutEnabled(shortcut) {
  return shortcut.setting?.enabled !== false
}

// 단축키 활성화/비활성화
function toggleShortcut(shortcutId, enabled) {
  setShortcutEnabled(shortcutId, enabled !== false)
  loadShortcuts()
  $q.notify({
    type: 'positive',
    message: enabled ? '단축키가 활성화되었습니다' : '단축키가 비활성화되었습니다',
    position: 'top',
    timeout: 2000,
  })
}

// 단축키 실행
function executeShortcut(shortcut) {
  // 단축키가 비활성화되어 있으면 실행하지 않음
  if (shortcut.setting?.enabled === false) {
    $q.notify({
      type: 'warning',
      message: '비활성화된 단축키입니다',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  // 레지스트리에서 실제 handler 가져오기
  const handler = getShortcutHandler(shortcut.id) || shortcut.handler

  // handler가 있으면 실행
  if (handler && typeof handler === 'function') {
    try {
      handler()
      $q.notify({
        type: 'positive',
        message: `${shortcut.description || shortcut.id} 실행됨`,
        position: 'top',
        timeout: 1500,
      })
    } catch (error) {
      console.error('[ShortcutsSettings] 단축키 실행 오류:', error)
      $q.notify({
        type: 'negative',
        message: '단축키 실행 중 오류가 발생했습니다',
        position: 'top',
        timeout: 2000,
      })
    }
  } else {
    $q.notify({
      type: 'info',
      message: '이 단축키는 실행할 수 없습니다',
      position: 'top',
      timeout: 2000,
    })
  }
}

// 키 조합 캡처 시작
function captureKeyCombo() {
  capturing.value = true
  editForm.value.combo = ''

  keyCaptureHandler = (event) => {
    if (event.key === 'Escape') {
      capturing.value = false
      document.removeEventListener('keydown', keyCaptureHandler)
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const parts = []
    if (event.ctrlKey) parts.push('ctrl')
    if (event.metaKey) parts.push('cmd')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')

    // 특수 키 처리
    let key = event.key.toLowerCase()
    if (key === 'control' || key === 'meta' || key === 'shift' || key === 'alt') {
      return // 수정자 키만 눌렀을 때는 무시
    }

    // 특수 키 이름 변환
    const specialKeys = {
      ' ': 'space',
      arrowup: 'up',
      arrowdown: 'down',
      arrowleft: 'left',
      arrowright: 'right',
    }
    key = specialKeys[key] || key

    parts.push(key)
    editForm.value.combo = parts.join('+')
    capturing.value = false
    document.removeEventListener('keydown', keyCaptureHandler)
  }

  document.addEventListener('keydown', keyCaptureHandler, true)
}

// 단축키 저장
function saveShortcut() {
  if (!editForm.value.combo || !editForm.value.description) {
    $q.notify({
      type: 'negative',
      message: '설명과 키 조합을 모두 입력해주세요',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  if (editingShortcut.value?.id) {
    // 수정
    updateShortcut(editingShortcut.value.id, {
      combo: editForm.value.combo,
      description: editForm.value.description,
    })
    $q.notify({
      type: 'positive',
      message: '단축키가 수정되었습니다',
      position: 'top',
      timeout: 2000,
    })
  } else {
    // 추가
    const newId = `custom_${Date.now()}`
    registerShortcut(newId, {
      description: editForm.value.description,
      combo: editForm.value.combo,
      handler: () => {
        $q.notify({
          type: 'info',
          message: `${editForm.value.description} 단축키 실행`,
          position: 'top',
          timeout: 2000,
        })
      },
    })
    $q.notify({
      type: 'positive',
      message: '새 단축키가 추가되었습니다',
      position: 'top',
      timeout: 2000,
    })
  }

  loadShortcuts()
  cancelEdit()
}

// 단축키 삭제
function deleteShortcut() {
  if (!editingShortcut.value?.id) return

  $q.dialog({
    title: '단축키 삭제',
    message: '이 단축키를 삭제하시겠습니까?',
    persistent: true,
    ok: {
      label: '삭제',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  }).onOk(() => {
    unregisterShortcut(editingShortcut.value.id)
    loadShortcuts()
    cancelEdit()
    $q.notify({
      type: 'positive',
      message: '단축키가 삭제되었습니다',
      position: 'top',
      timeout: 2000,
    })
  })
}

// 수정 취소
function cancelEdit() {
  showEditDialog.value = false
  showAddDialog.value = false
  editingShortcut.value = null
  editForm.value = {
    description: '',
    combo: '',
  }
  capturing.value = false
  if (keyCaptureHandler) {
    document.removeEventListener('keydown', keyCaptureHandler)
    keyCaptureHandler = null
  }
}

// 새 단축키 추가 다이얼로그 열기
function openAddDialog() {
  editingShortcut.value = null
  editForm.value = {
    description: '',
    combo: '',
  }
  showEditDialog.value = true
}

onMounted(() => {
  // localStorage에 저장된 커스텀 단축키를 레지스트리에 다시 등록
  restoreCustomShortcuts()
  loadShortcuts()
  // showAddDialog가 true가 되면 다이얼로그 열기
  if (showAddDialog.value) {
    openAddDialog()
    showAddDialog.value = false
  }
})

// localStorage에 저장된 커스텀 단축키 복원
function restoreCustomShortcuts() {
  try {
    const saved = localStorage.getItem('nexa-global-shortcuts')
    if (saved) {
      const savedSettings = JSON.parse(saved)
      for (const [shortcutId, setting] of Object.entries(savedSettings)) {
        // 커스텀 단축키이고 레지스트리에 없는 경우
        if (shortcutId.startsWith('custom_') && !shortcuts.value.find((s) => s.id === shortcutId)) {
          // 기본 핸들러로 등록
          registerShortcut(shortcutId, {
            combo: setting.combo,
            description: setting.description || shortcutId,
            enabled: setting.enabled !== undefined ? setting.enabled : true,
            handler: () => {
              $q.notify({
                type: 'info',
                message: `${setting.description || shortcutId} 단축키 실행`,
                position: 'top',
                timeout: 2000,
              })
            },
          })
        }
      }
    }
  } catch (error) {
    console.error('[ShortcutsSettings] 커스텀 단축키 복원 실패:', error)
  }
}

onBeforeUnmount(() => {
  if (keyCaptureHandler) {
    document.removeEventListener('keydown', keyCaptureHandler)
  }
})

// showAddDialog 감시
watch(showAddDialog, (newVal) => {
  if (newVal) {
    openAddDialog()
    showAddDialog.value = false
  }
})
</script>

<style lang="scss" scoped>
.shortcuts-settings {
  border: 1px solid var(--nexa-border-color);
  border-radius: 14px;

  .settings-header {
    background-color: var(--nexa-panel-header);
    padding: 3px 16px;
    border-radius: 14px 14px 0 0;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .header-text {
      flex: 1;
    }

    .header-actions {
      flex-shrink: 0;
      padding-top: 8px;
    }

    .text-h6 {
      color: var(--nexa-text-primary);
      font-weight: 900;
      line-height: 1;
      font-size: 28px;
    }

    .text-body2 {
      color: var(--nexa-text-secondary) !important;
      line-height: 1;
      margin-top: -10px;
    }
  }

  // Quasar 리스트 보더 제거
  :deep(.q-list) {
    border: none !important;
  }

  .category-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .category-header {
      display: flex;
      align-items: center;
      padding: 12px 26px;
      background-color: var(--nexa-surface);
      border-bottom: 1px solid var(--nexa-border-color);
      margin-bottom: 0;

      .category-title {
        color: var(--nexa-text-primary);
        font-weight: 600;
        font-size: 1rem;
      }
    }
  }

  .shortcut-item {
    padding: 8px 26px;

    border-bottom: 1px solid var(--nexa-border-color);
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--nexa-surface);
    }

    &:last-child {
      border-bottom: none;
    }

    // 라벨과 핫키를 한 줄로 배치
    .shortcut-label-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .shortcut-description {
        color: var(--nexa-text-secondary);
        margin: 0;
        flex: 1;
      }

      kbd.shortcut-key {
        color: var(--nexa-text-primary);
        font-weight: 900;
        letter-spacing: -1px;
        background-color: var(--nexa-background-darker);
        border: 1px solid var(--nexa-border-color);
        border-radius: 4px;
        padding: 4px 10px;
        flex-shrink: 0;
        margin-right: 12px;
        cursor: pointer;
      }
    }
  }
}

.browser-Shortcuts {
  margin-top: 24px;
  margin-bottom: 24px;
}
</style>
