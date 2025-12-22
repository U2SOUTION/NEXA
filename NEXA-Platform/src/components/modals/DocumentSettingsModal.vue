<!-- DocumentSettingsModal.vue
  문서 관리 설정 모달
  BaseModal을 사용하여 구현
-->
<template>
  <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" modal-id="document-settings-modal" title-en="DOCUMENT SETTINGS" title-ko="문서 관리 설정" :initial-size="{ width: 500, height: 800 }" :min-size="{ width: 400, height: 500 }" :max-size="maxSize">
    <template #content>
      <div class="document-settings-content">
        <!-- 메뉴 이동 스텝 설정 -->
        <div class="settings-section">
          <div class="settings-section-title">
            <q-icon name="mouse" size="20px" class="q-mr-sm" />
            <span>메뉴 휠 스크롤 스텝 이동 스텝 수 설정</span>
          </div>
          <div class="settings-section-content">
            <div class="text-caption text-grey-6">
              <span class="step-value">{{ wheelScrollStep }} Step</span> 한 번에 스크롤할 메뉴 아이템 개수를 설정합니다.
            </div>
            <q-slider v-model="wheelScrollStep" :min="1" :max="10" :step="1" snap label :label-value="`${wheelScrollStep}`" color="primary" />
          </div>
        </div>

        <!-- 애니메이션 설정 -->
        <div class="settings-section">
          <div class="settings-section-title">
            <q-icon name="animation" size="20px" class="q-mr-sm" />
            <span>메뉴 스크롤 애니메이션</span>
          </div>
          <div class="settings-section-content">
            <q-checkbox v-model="enableMenuAnimation" label="애니메이션 활성화" color="primary" dense />
            <div class="text-caption text-grey-6">메뉴 스크롤 시 부드러운 애니메이션 효과를 사용합니다.</div>
          </div>
        </div>

        <!-- 재정렬 시간 설정 -->
        <div class="settings-section">
          <div class="settings-section-title">
            <q-icon name="schedule" size="20px" class="q-mr-sm" />
            <span>우선순위 모드 자동 재정렬</span>
          </div>
          <div class="settings-section-content">
            <q-checkbox v-model="enableAutoReorder" label="자동 재정렬 사용" color="primary" dense />
            <div class="text-caption text-grey-6">우선순위 모드에서 파일을 드래그 앤 드롭한 후 자동으로 절대 순위로 재정렬되는 시간을 설정합니다.</div>
            <div v-if="enableAutoReorder" class="auto-reorder-options">
              <q-slider v-model="reorderDelaySeconds" :min="1" :max="10" :step="1" label :label-value="`${reorderDelaySeconds}초`" color="primary" />
            </div>
          </div>
        </div>

        <!-- 토스트 메시지 설정 -->
        <div class="settings-section">
          <div class="settings-section-title">
            <q-icon name="notifications" size="20px" class="q-mr-sm" />
            <span>알림 메시지</span>
          </div>
          <div class="settings-section-content">
            <q-checkbox v-model="showToastMessages" label="토스트 메시지 표시" color="primary" dense />
            <div class="text-caption text-grey-6">드래그 앤 드롭 시 우선순위 변경 메시지를 표시합니다.</div>
            <div v-if="showToastMessages" class="toast-timeout-options">
              <q-slider v-model="toastTimeoutSeconds" :min="1" :max="60" :step="0.5" label :label-value="`${toastTimeoutSeconds}초`" color="primary" />
            </div>
          </div>
        </div>

        <!-- 데이터 초기화 -->
        <div class="settings-section">
          <div class="settings-section-title">
            <q-icon name="refresh" size="20px" class="q-mr-sm" />
            <span>데이터 초기화</span>
          </div>
          <div class="settings-section-content">
            <div class="text-caption text-grey-6">저장된 사용빈도와 우선순위 데이터를 초기화합니다.</div>
            <div class="row q-gutter-sm">
              <q-btn outline color="primary" label="사용빈도 초기화" @click="handleResetUsage" class="col" />
              <q-btn outline color="primary" label="우선순위 초기화" @click="handleResetPriority" class="col" />
            </div>
          </div>
        </div>

        <!-- 키보드 단축키 -->
        <div class="settings-section">
          <div class="settings-section-title">
            <q-icon name="keyboard" size="20px" class="q-mr-sm" />
            <span>키보드 단축키</span>
          </div>
          <div class="settings-section-content">
            <div class="shortcut-list">
              <div class="shortcut-item">
                <div class="shortcut-key">
                  <kbd>ESC</kbd>
                </div>
                <div class="shortcut-description">
                  목차 열기/닫기 (편집 모드가 아닐 때)<br />
                  <span class="text-caption text-grey-6">편집 모드일 때는 편집 모드 종료</span>
                </div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-key"><kbd>Ctrl</kbd> + <kbd>E</kbd></div>
                <div class="shortcut-description">
                  편집 모드 토글<br />
                  <span class="text-caption text-grey-6">Mac: Cmd + E</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 문서 폴더 경로 설정 -->
        <div class="settings-section">
          <div class="settings-section-title">
            <q-icon name="folder" size="20px" class="q-mr-sm" />
            <span>문서 폴더 경로</span>
          </div>
          <div class="settings-section-content">
            <div class="text-caption text-grey-6 q-mb-sm">문서가 저장된 폴더의 경로를 설정합니다. 상대 경로 또는 절대 경로를 사용할 수 있습니다.</div>
            <q-input v-model="documentFolderPath" outlined dense placeholder="예: ../../../NEXA-Documentation 또는 C:/Documents/NEXA-Documentation" class="q-mb-sm">
              <template v-slot:prepend>
                <q-icon name="folder_open" />
              </template>
            </q-input>
            <div class="text-caption text-grey-6">
              <q-icon name="info" size="14px" class="q-mr-xs" />
              변경 사항은 서버 재시작 후 적용됩니다.
            </div>
          </div>
        </div>

        <!-- 지원 확장자 설정 -->
        <div class="settings-section">
          <div class="settings-section-title">
            <q-icon name="description" size="20px" class="q-mr-sm" />
            <span>지원 확장자</span>
          </div>
          <div class="settings-section-content">
            <div class="text-caption text-grey-6 q-mb-sm">문서 관리 시스템에서 지원할 파일 확장자를 선택하세요. 미리 정의된 확장자 목록에서만 선택 가능합니다.</div>
            <div class="extension-list q-mb-sm">
              <div v-if="supportedExtensions.length === 0" class="text-caption text-grey-6 q-py-sm">선택된 확장자가 없습니다. 아래 목록에서 선택하세요.</div>
              <div v-else class="extension-items">
                <q-chip v-for="(ext, index) in supportedExtensions" :key="index" :label="ext" color="primary" text-color="white" removable @remove="removeExtension(ext)" class="q-mr-xs q-mb-xs" />
              </div>
            </div>
            <div class="text-caption text-grey-7 q-mb-sm" style="font-weight: 500">사용 가능한 확장자 목록:</div>
            <div class="available-extensions q-mb-sm">
              <q-checkbox v-for="ext in availableExtensions" :key="ext.value" v-model="ext.selected" :label="ext.label" color="primary" dense @update:model-value="handleExtensionToggle(ext.value, $event)" class="extension-checkbox" />
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              <q-icon name="info" size="14px" class="q-mr-xs" />
              변경 사항은 서버 재시작 후 적용됩니다.
            </div>
          </div>
        </div>

        <!-- 기타 설정 -->
        <div class="settings-section">
          <div class="settings-section-title">
            <q-icon name="tune" size="20px" class="q-mr-sm" />
            <span>기타 설정</span>
          </div>
          <div class="settings-section-content">
            <div>
              <q-checkbox v-model="hideCompleted" label="완료된 항목 숨기기" color="primary" dense @update:model-value="handleHideCompletedChange" />
            </div>
            <div>
              <q-checkbox v-model="autoHighlightOnScroll" label="스크롤 시 현재 섹션 하일라이팅" color="primary" dense @update:model-value="handleAutoHighlightChange" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <q-btn flat label="취소" @click="close" />
      <q-btn color="primary" label="저장" @click="handleSave" />
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useDocumentManagerStore } from 'src/stores/documentManagerStore'
import { saveTOCSettings } from 'src/modules/document-manager/services/documentStorage.js'
import BaseModal from 'src/components/ui/BaseModal.vue'

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'resetUsage', 'resetPriority'])

const $q = useQuasar()
const documentStore = useDocumentManagerStore()

// 최대 크기 설정 (높이를 더 크게)
const maxSize = computed(() => ({
  width: window.innerWidth * 0.95,
  height: window.innerHeight * 0.98,
}))

// 설정 상태 (localStorage에서 불러오기)
const wheelScrollStep = ref(1)
const enableMenuAnimation = ref(true)
const reorderDelaySeconds = ref(3)
const enableAutoReorder = ref(true)
const showToastMessages = ref(true)
const toastTimeoutSeconds = ref(3.5) // 초 단위 (1~60초)

// 문서 폴더 경로 및 확장자 설정 (UI만 구성, 로직은 이후 적용)
const documentFolderPath = ref('../../../NEXA-Documentation')
const supportedExtensions = ref(['.md', '.mermaid.css'])

// 사용 가능한 확장자 목록 (미리 정의된 목록만 허용)
const availableExtensions = ref([
  { value: '.md', label: '.md (Markdown)', selected: true },
  { value: '.mermaid.css', label: '.mermaid.css (Mermaid 스타일)', selected: true },
  { value: '.txt', label: '.txt (텍스트)', selected: false },
  { value: '.markdown', label: '.markdown (Markdown)', selected: false },
  { value: '.mdx', label: '.mdx (MDX)', selected: false },
  { value: '.html', label: '.html (HTML)', selected: false },
  { value: '.css', label: '.css (CSS)', selected: false },
  { value: '.json', label: '.json (JSON)', selected: false },
  { value: '.yaml', label: '.yaml (YAML)', selected: false },
  { value: '.yml', label: '.yml (YAML)', selected: false },
])

// 초기화: supportedExtensions에 따라 availableExtensions의 selected 상태 설정
function initializeExtensionSelection() {
  availableExtensions.value.forEach((ext) => {
    ext.selected = supportedExtensions.value.includes(ext.value)
  })
}

// 확장자 토글 처리
function handleExtensionToggle(extValue, isSelected) {
  if (isSelected) {
    // 선택된 경우 추가
    if (!supportedExtensions.value.includes(extValue)) {
      supportedExtensions.value.push(extValue)
    }
  } else {
    // 선택 해제된 경우 제거
    const index = supportedExtensions.value.indexOf(extValue)
    if (index > -1) {
      supportedExtensions.value.splice(index, 1)
    }
  }
}

// 확장자 제거 (Chip에서 제거 버튼 클릭 시)
function removeExtension(extValue) {
  const index = supportedExtensions.value.indexOf(extValue)
  if (index > -1) {
    supportedExtensions.value.splice(index, 1)
    // availableExtensions의 selected 상태도 업데이트
    const ext = availableExtensions.value.find((e) => e.value === extValue)
    if (ext) {
      ext.selected = false
    }
  }
}

// 컴포넌트 마운트 시 초기화
initializeExtensionSelection()

// localStorage에서 메뉴 이동 스텝 설정 불러오기
function loadWheelScrollStep() {
  try {
    const saved = localStorage.getItem('dev-menu-wheel-scroll-step')
    if (saved) {
      const parsedValue = parseInt(saved, 10)
      if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 10) {
        wheelScrollStep.value = parsedValue
      }
    }
  } catch (error) {
    console.error('메뉴 이동 스텝 설정 불러오기 실패:', error)
  }
}

// localStorage에 메뉴 이동 스텝 설정 저장
function saveWheelScrollStep() {
  try {
    const stepValue = Math.max(1, Math.min(10, Math.round(wheelScrollStep.value)))
    localStorage.setItem('dev-menu-wheel-scroll-step', stepValue.toString())
    // 같은 탭에서 변경 감지를 위한 CustomEvent 발생
    window.dispatchEvent(new CustomEvent('wheel-scroll-step-changed'))
  } catch (error) {
    console.error('메뉴 이동 스텝 설정 저장 실패:', error)
  }
}

// localStorage에서 토스트 메시지 설정 불러오기
function loadToastSettings() {
  try {
    const saved = localStorage.getItem('dev-toast-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.showToastMessages !== undefined) {
        showToastMessages.value = parsed.showToastMessages
      }
      if (parsed.toastTimeoutSeconds !== undefined) {
        toastTimeoutSeconds.value = parsed.toastTimeoutSeconds
      }
    }
  } catch (error) {
    console.error('토스트 메시지 설정 불러오기 실패:', error)
  }
}

// localStorage에 토스트 메시지 설정 저장
function saveToastSettings() {
  try {
    localStorage.setItem(
      'dev-toast-settings',
      JSON.stringify({
        showToastMessages: showToastMessages.value,
        toastTimeoutSeconds: toastTimeoutSeconds.value,
      }),
    )
  } catch (error) {
    console.error('토스트 메시지 설정 저장 실패:', error)
  }
}

// localStorage에서 애니메이션 설정 불러오기
function loadMenuAnimation() {
  try {
    const saved = localStorage.getItem('dev-menu-animation-enabled')
    if (saved !== null) {
      enableMenuAnimation.value = saved === 'true'
    }
  } catch (error) {
    console.error('애니메이션 설정 불러오기 실패:', error)
  }
}

// localStorage에 애니메이션 설정 저장
function saveMenuAnimation() {
  try {
    localStorage.setItem('dev-menu-animation-enabled', enableMenuAnimation.value.toString())
    // 같은 탭에서 변경 감지를 위한 CustomEvent 발생
    window.dispatchEvent(new CustomEvent('menu-animation-changed'))
  } catch (error) {
    console.error('애니메이션 설정 저장 실패:', error)
  }
}

// 컴포넌트 마운트 시 설정 불러오기
loadWheelScrollStep()
loadToastSettings()
loadMenuAnimation()

// 기존 설정 값 가져오기
const hideCompleted = ref(documentStore.hideCompleted)
const autoHighlightOnScroll = ref(documentStore.autoHighlightOnScroll)

// 설정 변경 감지
watch(
  () => documentStore.hideCompleted,
  (value) => {
    hideCompleted.value = value
  },
)

watch(
  () => documentStore.autoHighlightOnScroll,
  (value) => {
    autoHighlightOnScroll.value = value
  },
)

// hideCompleted 변경 핸들러
function handleHideCompletedChange(value) {
  documentStore.hideCompleted = value
  // saveTOCSettings는 ref 객체를 받지만, hideCompleted는 일반 값이므로 직접 저장
  try {
    const saved = localStorage.getItem('dev-toc-settings')
    const parsed = saved ? JSON.parse(saved) : {}
    parsed.hideCompleted = value
    localStorage.setItem('dev-toc-settings', JSON.stringify(parsed))
  } catch (error) {
    console.error('hideCompleted 저장 실패:', error)
  }
}

// autoHighlightOnScroll 변경 핸들러
function handleAutoHighlightChange(value) {
  documentStore.autoHighlightOnScroll = value
  saveTOCSettings({
    hideCompleted: documentStore.hideCompleted,
    autoHighlightOnScroll: value,
  })
}

// 사용빈도 초기화 핸들러
function handleResetUsage() {
  $q.dialog({
    title: '사용빈도 초기화',
    message: '사용빈도를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    persistent: true,
    ok: {
      label: '초기화',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  }).onOk(() => {
    emit('resetUsage')
  })
}

// 우선순위 초기화 핸들러
function handleResetPriority() {
  $q.dialog({
    title: '우선순위 초기화',
    message: '우선순위를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    persistent: true,
    ok: {
      label: '초기화',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  }).onOk(() => {
    emit('resetPriority')
  })
}

// 저장 핸들러
function handleSave() {
  // localStorage에 설정 저장
  saveWheelScrollStep()
  saveToastSettings()
  saveMenuAnimation()
  // TODO: localStorage에 설정 저장
  // - reorderDelaySeconds
  // - enableAutoReorder

  emit('save', {
    reorderDelaySeconds: reorderDelaySeconds.value,
    enableAutoReorder: enableAutoReorder.value,
    showToastMessages: showToastMessages.value,
    toastTimeoutSeconds: toastTimeoutSeconds.value,
    hideCompleted: hideCompleted.value,
    autoHighlightOnScroll: autoHighlightOnScroll.value,
  })

  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.document-settings-content {
  width: 100%;

  .settings-section {
    margin-bottom: 0;

    .settings-section-title {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      color: var(--nexa-text-primary);
      margin-bottom: 6px;
    }

    .settings-section-content {
      padding-left: 28px;
      margin-bottom: 12px;

      .text-caption {
        display: block;
        margin-top: 0;

        .step-value {
          font-weight: 600;
          color: var(--nexa-text-primary);
          margin-right: 4px;
        }
      }

      .shortcut-list {
        .shortcut-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0;
          gap: 16px;

          &:last-child {
            margin-bottom: 0;
          }

          .shortcut-key {
            flex-shrink: 0;
            min-width: 120px;

            kbd {
              display: inline-block;
              padding: 4px 8px;
              margin: 2px;
              font-size: 12px;
              font-weight: 600;
              line-height: 1.4;
              color: var(--nexa-text-primary);
              background-color: var(--nexa-background-darker);
              border: 1px solid var(--nexa-border-color);
              border-radius: 4px;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
          }

          .shortcut-description {
            flex: 1;
            font-size: 14px;
            color: var(--nexa-text-secondary);
            line-height: 1.5;
          }
        }
      }

      .extension-list {
        min-height: 40px;
        padding: 8px;
        background-color: var(--nexa-surface);
        border: 1px solid var(--nexa-border-color);
        border-radius: 4px;

        .extension-items {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }

      .available-extensions {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        background-color: var(--nexa-surface);
        border: 1px solid var(--nexa-border-color);
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;

        .extension-checkbox {
          margin-bottom: 4px;
        }
      }
    }
  }
}
</style>
