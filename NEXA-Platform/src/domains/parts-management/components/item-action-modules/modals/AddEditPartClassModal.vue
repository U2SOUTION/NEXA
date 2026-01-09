<!-- AddEditPartClassModal.vue
  부품 분류 추가/수정 모달
-->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" no-backdrop>
    <q-card class="add-class-dialog-card">
      <q-card-section class="add-class-dialog-section">
        <div class="text-h5 q-mb-lg dialog-title">
          <span class="dialog-title-en">PART CLASSES</span>
          <span class="dialog-title-ko">
            <template v-if="insertMode && insertTargetItem">
              <span class="insert-target-block">
                <q-icon :name="insertMode === 'insert-above' ? 'arrow_upward' : 'arrow_downward'" class="q-mr-xs" />
                {{ insertTargetItem.name || '-' }}
              </span>
              <span class="q-mx-sm"> > </span>
              <span>{{ insertMode === 'insert-above' ? '위에 끼워넣기' : '아래에 끼워넣기' }}</span>
            </template>
            <template v-else>
              {{ dialogTitle }}
            </template>
          </span>
        </div>

        <div class="add-class-dialog-form" @keydown.enter.prevent="handleFormEnter">
          <!-- 대분류명과 클래스명을 한 줄로 배치 -->
          <div class="row q-col-gutter-md q-mb-md">
            <q-select v-model="formData.category" label="대분류 선택 *" :options="formCategoryOptions" outlined dense clearable class="col" />
            <q-input v-model="formData.name" label="클래스명 *" outlined dense :class="['col', { 'has-duplicate-error': !!classNameError }]" :loading="classNameChecking" @blur="checkClassNameDuplicate(true)" @compositionend="checkClassNameDuplicate(true)" />
          </div>
          <!-- C Code와 Code Name을 한 줄로 배치 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <q-input
              ref="cCodeInputRef"
              :model-value="formData.c_code"
              label="C Code *"
              outlined
              dense
              :class="['col', { 'has-duplicate-error': !!cCodeError }]"
              :loading="cCodeChecking"
              @update:model-value="handleCCodeInput"
              @keydown="handleCCodeKeydown"
              @blur="checkCCodeDuplicate(true)"
              @compositionend="checkCCodeDuplicate(true)"
            >
              <template v-slot:append>
                <span class="text-caption text-grey-6"> {{ formData.c_code?.length || 0 }}/6 </span>
              </template>
            </q-input>
            <q-input v-model="formData.code_name" label="Code Name" outlined dense class="col" />
          </div>
          <q-input v-model="formData.description" label="설명" outlined dense class="q-mb-lg" />

          <q-input v-model="formData.example" label="예시" outlined dense class="q-mb-lg" />

          <!-- 상세설명 -->
          <div class="q-mb-lg">
            <TiptapEditor
              :model-value="formData.detailed_description"
              :part-class-id="editingClass?.id || null"
              @update:model-value="
                (value) => {
                  formData.detailed_description = value || ''
                }
              "
              placeholder="부품 분류에 대한 상세한 설명을 입력하세요. 테이블, 이미지, 링크 등을 포함할 수 있습니다..."
            />
          </div>

          <!-- 파일 업로드 섹션 -->
          <div class="file-upload-section q-mt-lg">
            <div class="text-subtitle2 q-mb-sm" style="opacity: 0.6">
              첨부 파일 업로드
              <span class="text-caption text-grey-6 q-ml-sm">(한 번에 최대 10개까지 선택 가능)</span>
            </div>

            <!-- 파일 선택 -->
            <q-file
              v-model="selectedFiles"
              label="파일들 선택"
              outlined
              dense
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.zip,.rar,.7z,.tar,.gz,.bz2,.xz,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.m4v,.mp3,.wav,.ogg,.flac,.aac,.m4a,.wma,.stl,.obj,.step,.iges,.3mf,.ply"
              @update:model-value="handleFileSelect"
              class="q-mb-md"
              :max-files="10"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- 선택된 파일 미리보기 -->
            <div v-if="filePreviews.length > 0" class="file-previews q-mb-md">
              <div v-for="(preview, index) in filePreviews" :key="index" class="file-preview-item q-mb-sm">
                <div class="row items-center q-gutter-sm">
                  <div v-if="preview.type === 'image'" class="preview-image">
                    <img :src="preview.url" alt="Preview" style="max-width: 100px; max-height: 100px; object-fit: contain" />
                  </div>
                  <q-icon v-else name="description" size="40px" />
                  <div class="col">
                    <div class="text-caption">{{ preview.name }}</div>
                    <div class="text-caption text-grey-6">{{ formatFileSize(preview.size) }}</div>
                  </div>
                  <q-btn flat dense round icon="close" size="md" @click="removeFilePreview(index)" :style="{ color: 'var(--nexa-warning)' }" />
                </div>
              </div>
            </div>

            <!-- 업로드 진행률 표시 (인라인) -->
            <UploadProgress :files="uploadProgressFiles" :show="showUploadProgress" @cancel="handleUploadCancel" />

            <!-- 업로드된 일반 파일 목록 (편집 모드일 때만) -->
            <div v-if="editingClass && uploadedFiles.length > 0" class="uploaded-files q-mt-md">
              <div class="text-subtitle2 q-mb-sm" style="opacity: 0.6">업로드된 파일</div>
              <div v-for="file in uploadedFiles" :key="file.id" class="uploaded-file-item q-mb-xs">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="description" size="24px" />
                  <div class="col">
                    <div class="text-caption">{{ file.original_filename }}</div>
                    <div class="text-caption text-grey-6">
                      {{ formatFileSize(file.file_size) }}
                    </div>
                  </div>
                  <q-btn flat dense round icon="delete" size="md" @click="deleteUploadedFile(file.id)" :style="{ color: 'var(--nexa-warning)' }" />
                </div>
              </div>
            </div>

            <!-- 에디터 이미지 목록 (편집 모드일 때만, 참고용) -->
            <div v-if="editingClass && editorImageFiles.length > 0" class="uploaded-editor-images q-mt-md">
              <div class="text-subtitle2 q-mb-sm" style="opacity: 0.6">에디터 이미지</div>
              <div class="text-caption text-grey-6 q-mb-sm" style="opacity: 0.7">상세설명에 포함된 이미지입니다. 상세설명에서 삭제하면 자동으로 제거됩니다.</div>
              <div v-for="file in editorImageFiles" :key="file.id" class="uploaded-file-item q-mb-xs" style="opacity: 0.6">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="image" size="24px" />
                  <div class="col">
                    <div class="text-caption">{{ file.original_filename }}</div>
                    <div class="text-caption text-grey-6">
                      {{ formatFileSize(file.file_size) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="add-class-dialog-actions">
        <div class="row items-center full-width relative-position">
          <!-- 버튼들: 중앙 정렬 -->
          <div class="col-auto" style="position: absolute; left: 50%; transform: translateX(-50%)">
            <q-btn flat label="취소" class="dialog-action-btn dialog-action-btn-cancel" @click="handleCancel" />
            <q-btn flat label="저장" class="dialog-action-btn dialog-action-btn-save" :class="{ 'q-btn--disabled': uploading }" @click="saveClass" />
          </div>
          <!-- 오른쪽: 맨 위에 추가 체크박스 제거 (드롭다운 메뉴로 이동) -->
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePartsDataStore } from '@system/store/partsDataStore.js'
import { DEFAULT_CATEGORIES, CATEGORY_ABBREVIATIONS } from '@system/constants/categories.js'
import TiptapEditor from '../../TiptapEditor.vue'
import UploadProgress from '@system/components/ui/UploadProgress.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  editingItem: {
    type: Object,
    default: null,
  },
  partClasses: {
    type: Array,
    default: () => [],
  },
  insertMode: {
    type: String,
    default: null, // null | 'insert-above' | 'insert-below'
  },
  insertTargetItem: {
    type: Object,
    default: null, // 끼워넣기 기준 항목
  },
})

const emit = defineEmits(['update:modelValue', 'saved', 'cancel'])

const $q = useQuasar()
const partsDataStore = usePartsDataStore()

// 편집 중인 클래스
const editingClass = ref(null)

// 폼 데이터
const formData = ref({
  name: '',
  c_code: '',
  code_name: '',
  description: '',
  category: '',
  d_code: '',
  example: '',
  detailed_description: '',
})

// 다이얼로그 타이틀 (끼워넣기 모드가 아닐 때만 사용)
const dialogTitle = computed(() => {
  if (editingClass.value) {
    return '부품 분류 수정'
  } else {
    return '부품 분류 추가'
  }
})

/**
 * 끼워넣기 위치 계산 및 재정렬 항목 목록 생성
 * @param {string} insertMode - 'insert-above' | 'insert-below'
 * @param {Object} targetItem - 끼워넣기 기준 항목
 * @param {Array} partClasses - 전체 부품 분류 목록
 * @returns {Object} { sort_order, sub_sort_order, itemsToUpdate }
 */
function calculateInsertPosition(insertMode, targetItem, partClasses) {
  let targetSortOrder = targetItem.sort_order || 0

  // 대상의 sort_order가 0이면 최소값을 찾아서 설정
  if (targetSortOrder === 0) {
    const sameZeroItems = partClasses.filter((item) => (item.sort_order || 0) === 0)
    if (sameZeroItems.length > 0) {
      targetSortOrder = 0
    } else {
      const minItem = partClasses.filter((item) => (item.sort_order || 0) > 0).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]
      if (minItem && minItem.sort_order > 10) {
        targetSortOrder = Math.max(10, minItem.sort_order - 10)
      } else {
        targetSortOrder = 10
      }
    }
  }

  // 같은 sort_order를 가진 모든 항목 찾기 (현재 순서대로 정렬)
  const sameSortOrderItems = partClasses
    .filter((item) => (item.sort_order || 0) === targetSortOrder)
    .sort((a, b) => {
      const aSub = a.sub_sort_order || 0
      const bSub = b.sub_sort_order || 0
      if (aSub !== bSub) return aSub - bSub
      const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : 0
      if (aUpdated !== bUpdated) return bUpdated - aUpdated
      return (a.id || 0) - (b.id || 0)
    })

  // 대상 항목의 현재 위치 찾기
  const targetIndex = sameSortOrderItems.findIndex((item) => item.id === targetItem.id)

  if (targetIndex === -1) {
    // 대상 항목을 찾을 수 없으면 기본값 사용
    return {
      sort_order: targetSortOrder,
      sub_sort_order: insertMode === 'insert-above' ? 0 : 1,
      itemsToUpdate: [],
    }
  }

  // 끼워넣을 위치 결정
  const insertIndex = insertMode === 'insert-above' ? targetIndex : targetIndex + 1

  // 같은 sort_order를 가진 모든 항목의 sub_sort_order 재정렬
  const itemsToReorder = [...sameSortOrderItems]
  itemsToReorder.splice(insertIndex, 0, { id: 'new', isNew: true })

  // 재정렬된 sub_sort_order 계산: 0부터 시작하는 연속된 정수
  const startSubSort = 0
  const itemsToUpdate = []
  let newSubSortOrder = 0

  itemsToReorder.forEach((item, index) => {
    if (item.isNew) {
      newSubSortOrder = startSubSort + index
    } else {
      itemsToUpdate.push({
        id: item.id,
        sort_order: targetSortOrder,
        sub_sort_order: startSubSort + index,
      })
    }
  })

  return {
    sort_order: targetSortOrder,
    sub_sort_order: newSubSortOrder,
    itemsToUpdate,
  }
}

// 파일 업로드 관련
const selectedFiles = ref([])
const filePreviews = ref([])
const uploadedFiles = ref([]) // 일반 첨부 파일만
const editorImageFiles = ref([]) // 에디터 이미지만
const uploading = ref(false)
const uploadProgressFiles = ref([]) // 업로드 진행률 추적용
const showUploadProgress = ref(false)
const uploadCancelHandlers = ref([]) // 업로드 취소 핸들러

// C Code 중복 체크 관련
const cCodeError = ref('')
const cCodeChecking = ref(false)
let cCodeCheckTimer = null
const cCodeInputRef = ref(null)

// 클래스명 중복 체크 관련
const classNameError = ref('')
const classNameChecking = ref(false)
let classNameCheckTimer = null

// 폼용 카테고리 옵션
const formCategoryOptions = computed(() => {
  // 기존 데이터에서 가져온 카테고리
  const existingCategories = [...new Set(props.partClasses.map((c) => c.category).filter(Boolean))]

  // DEFAULT_CATEGORIES의 순서를 유지하고, 그 뒤에 기존 카테고리 중 없는 것만 추가
  const defaultSet = new Set(DEFAULT_CATEGORIES)
  const additionalCategories = existingCategories.filter((cat) => !defaultSet.has(cat))

  // DEFAULT_CATEGORIES 순서 유지 + 추가 카테고리
  return [...DEFAULT_CATEGORIES, ...additionalCategories]
})

// 편집 아이템이 변경되면 폼 데이터 업데이트
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
      editingClass.value = newItem
      formData.value = { ...newItem }

      // detailed_description이 null이거나 undefined일 경우 빈 문자열로 초기화
      if (formData.value.detailed_description == null) {
        formData.value.detailed_description = ''
      }

      // D Code가 없으면 category를 기반으로 자동 설정
      if (!formData.value.d_code && formData.value.category && CATEGORY_ABBREVIATIONS[formData.value.category]) {
        formData.value.d_code = CATEGORY_ABBREVIATIONS[formData.value.category]
      }

      // C Code 에러 초기화 (편집 모드에서는 기존 값이므로 중복 아님)
      cCodeError.value = ''
      cCodeChecking.value = false
      if (cCodeCheckTimer) {
        clearTimeout(cCodeCheckTimer)
        cCodeCheckTimer = null
      }

      // 클래스명 에러 초기화 (편집 모드에서는 기존 값이므로 중복 아님)
      classNameError.value = ''
      classNameChecking.value = false
      if (classNameCheckTimer) {
        clearTimeout(classNameCheckTimer)
        classNameCheckTimer = null
      }

      // 파일 목록 로드 (편집 모드일 때만)
      loadFilesForEditing()
    } else {
      editingClass.value = null
      resetForm()
    }
  },
  { immediate: true },
)

// 모달이 열릴 때 폼 초기화
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && !props.editingItem) {
      resetForm()
    }
  },
)

// 카테고리 변경 감지
watch(
  () => formData.value.category,
  (newCategory) => {
    // D Code가 없으면 category를 기반으로 자동 설정
    if (newCategory && CATEGORY_ABBREVIATIONS[newCategory]) {
      formData.value.d_code = CATEGORY_ABBREVIATIONS[newCategory]
    }
  },
)

// C Code 입력 감지 (디바운싱)
watch(
  () => formData.value.c_code,
  () => {
    if (!editingClass.value) {
      // 추가 모드일 때만 디바운싱 체크
      checkCCodeDuplicate(false)
    }
  },
)

// 클래스명 입력 감지 (디바운싱)
watch(
  () => formData.value.name,
  () => {
    if (!editingClass.value) {
      // 추가 모드일 때만 디바운싱 체크
      checkClassNameDuplicate(false)
    }
  },
)

// 편집 모드일 때 파일 목록 로드
async function loadFilesForEditing() {
  if (!editingClass.value || !editingClass.value.id) return

  try {
    // 일반 파일과 에디터 이미지를 각각 가져오기
    const [regularFiles, editorImages] = await Promise.all([partsDataStore.fetchPartClassRegularFiles(editingClass.value.id), partsDataStore.fetchPartClassEditorImages(editingClass.value.id)])
    // 일반 파일과 에디터 이미지 분리
    uploadedFiles.value = regularFiles || []
    editorImageFiles.value = editorImages || []
  } catch (error) {
    console.error('파일 목록 로드 실패:', error)
    uploadedFiles.value = []
    editorImageFiles.value = []
  }
}

// 엔터 키 처리
function handleFormEnter(event) {
  // 텍스트 영역이나 에디터에서는 엔터 키 허용
  const target = event.target
  if (target.tagName === 'TEXTAREA' || target.closest('.tiptap-editor')) {
    return
  }

  // 저장 버튼이 비활성화되어 있지 않으면 저장 실행
  if (!uploading.value) {
    saveClass()
  }
}

// C Code 키다운 핸들러
function handleCCodeKeydown(event) {
  // 특수문자 입력 차단 (알파벳과 숫자만 허용)
  const isAlphanumeric = /^[A-Za-z0-9]$/.test(event.key)
  const isAllowedKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'].includes(event.key)

  // Ctrl/Cmd + A, C, V, X 등은 허용
  if (event.ctrlKey || event.metaKey) {
    return
  }

  // 알파벳/숫자가 아니고 허용된 키도 아니면 입력 차단
  if (!isAlphanumeric && !isAllowedKey) {
    event.preventDefault()
    showToastAboveInput('C Code는 알파벳과 대문자와 숫자만 입력 가능합니다.')
    return
  }

  // 현재 값이 이미 6자이고, 삭제/백스페이스/화살표 키가 아닌 경우 입력 차단
  if (formData.value.c_code && formData.value.c_code.length >= 6 && !isAllowedKey) {
    event.preventDefault()
    showToastAboveInput('C Code는 최대 6자까지 입력 가능합니다.')
  }
}

// C Code 입력 핸들러 - 대문자 변환, 특수문자 제거, 길이 제한
function handleCCodeInput(value) {
  if (!value) {
    formData.value.c_code = ''
    return
  }

  // 특수문자 제거 (알파벳과 숫자만 허용)
  let processed = value.replace(/[^A-Za-z0-9]/g, '')

  // 대문자 변환
  processed = processed.toUpperCase()

  // 길이 제한 (최대 6자)
  if (processed.length > 6) {
    processed = processed.substring(0, 6)
  }

  formData.value.c_code = processed
}

// C Code 중복 체크
function checkCCodeDuplicate(immediate = false) {
  // 타이머 초기화
  if (cCodeCheckTimer) {
    clearTimeout(cCodeCheckTimer)
  }

  // 입력값이 없으면 에러 초기화
  if (!formData.value.c_code || formData.value.c_code.trim() === '') {
    cCodeError.value = ''
    cCodeChecking.value = false
    return
  }

  // 즉시 체크 (blur, compositionend 이벤트 시)
  if (immediate) {
    const inputCCode = formData.value.c_code.trim().toLowerCase()

    // 편집 모드일 때는 현재 편집 중인 항목 제외하고 중복 체크
    const existingClass = props.partClasses.find((c) => c.c_code && c.c_code.toLowerCase() === inputCCode && (!editingClass.value || c.id !== editingClass.value.id))

    if (existingClass) {
      // 클래스명이 있으면 표시, 없으면 ID 표시
      const className = existingClass.name || `ID: ${existingClass.id}`
      const errorMessage = `이미 사용 중인 C Code입니다. (클래스명: ${className})`
      cCodeError.value = errorMessage
      // 토스트 메시지 표시
      $q.notify({
        type: 'warning',
        message: errorMessage,
        position: 'center',
        timeout: 3000,
      })
    } else {
      cCodeError.value = ''
    }

    cCodeChecking.value = false
    return
  }

  // 디바운싱: 300ms 후 체크 (watch, input 이벤트 시)
  cCodeChecking.value = true
  cCodeCheckTimer = setTimeout(() => {
    const inputCCode = formData.value.c_code.trim().toLowerCase()

    // 편집 모드일 때는 현재 편집 중인 항목 제외하고 중복 체크
    const existingClass = props.partClasses.find((c) => c.c_code && c.c_code.toLowerCase() === inputCCode && (!editingClass.value || c.id !== editingClass.value.id))

    if (existingClass) {
      // 클래스명이 있으면 표시, 없으면 ID 표시
      const className = existingClass.name || `ID: ${existingClass.id}`
      const errorMessage = `이미 사용 중인 C Code입니다. (클래스명: ${className})`
      cCodeError.value = errorMessage
      // 토스트 메시지 표시
      $q.notify({
        type: 'warning',
        message: errorMessage,
        position: 'center',
        timeout: 3000,
      })
    } else {
      cCodeError.value = ''
    }

    cCodeChecking.value = false
  }, 300)
}

// 클래스명 중복 체크
function checkClassNameDuplicate(immediate = false) {
  // 타이머 초기화
  if (classNameCheckTimer) {
    clearTimeout(classNameCheckTimer)
  }

  // 입력값이 없으면 에러 초기화
  if (!formData.value.name || formData.value.name.trim() === '') {
    classNameError.value = ''
    classNameChecking.value = false
    return
  }

  // 즉시 체크 (blur, compositionend 이벤트 시)
  if (immediate) {
    const inputName = formData.value.name.trim()

    // 편집 모드일 때는 현재 편집 중인 항목 제외하고 중복 체크
    const existingClass = props.partClasses.find((c) => c.name && c.name.trim() === inputName && (!editingClass.value || c.id !== editingClass.value.id))

    if (existingClass) {
      const errorMessage = `이미 사용 중인 클래스명입니다. (C Code: ${existingClass.c_code || '-'})`
      classNameError.value = errorMessage
      // 토스트 메시지 표시
      $q.notify({
        type: 'warning',
        message: errorMessage,
        position: 'center',
        timeout: 3000,
      })
    } else {
      classNameError.value = ''
    }

    classNameChecking.value = false
    return
  }

  // 디바운싱: 300ms 후 체크 (watch, input 이벤트 시)
  classNameChecking.value = true
  classNameCheckTimer = setTimeout(() => {
    const inputName = formData.value.name.trim()

    // 편집 모드일 때는 현재 편집 중인 항목 제외하고 중복 체크
    const existingClass = props.partClasses.find((c) => c.name && c.name.trim() === inputName && (!editingClass.value || c.id !== editingClass.value.id))

    if (existingClass) {
      const errorMessage = `이미 사용 중인 클래스명입니다. (C Code: ${existingClass.c_code || '-'})`
      classNameError.value = errorMessage
      // 토스트 메시지 표시
      $q.notify({
        type: 'warning',
        message: errorMessage,
        position: 'center',
        timeout: 3000,
      })
    } else {
      classNameError.value = ''
    }

    classNameChecking.value = false
  }, 300)
}

// 토스트 메시지 표시 (입력 필드 위에)
function showToastAboveInput(message) {
  $q.notify({
    type: 'warning',
    message: message,
    position: 'top',
    timeout: 2000,
  })
}

// 파일 타입별 최대 크기 가져오기
function getMaxFileSize(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const fileType = file.type || ''

  // 이미지 파일
  if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension)) {
    return 10 * 1024 * 1024 // 10MB
  }
  // PDF 파일
  if (fileType === 'application/pdf' || extension === 'pdf') {
    return 50 * 1024 * 1024 // 50MB
  }
  // 문서 파일
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'].includes(extension)) {
    return 20 * 1024 * 1024 // 20MB
  }
  // 비디오 파일
  if (fileType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(extension)) {
    return 500 * 1024 * 1024 // 500MB
  }
  // 오디오 파일
  if (fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(extension)) {
    return 50 * 1024 * 1024 // 50MB
  }
  // 3D 모델 파일
  if (['stl', 'obj', 'step', 'iges', '3mf', 'ply'].includes(extension)) {
    return 100 * 1024 * 1024 // 100MB
  }
  // 압축 파일
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return 100 * 1024 * 1024 // 100MB
  }
  // 기본값
  return 10 * 1024 * 1024 // 10MB
}

// 파일 선택 핸들러
async function handleFileSelect(files) {
  filePreviews.value = []

  if (!files || files.length === 0) {
    return
  }

  // FileList를 배열로 변환
  const fileArray = Array.isArray(files) ? files : Array.from(files)

  // 파일 크기 검증 (파일 타입별 최대 크기)
  const oversizedFiles = fileArray.filter((file) => {
    const maxSize = getMaxFileSize(file)
    return file.size > maxSize
  })

  if (oversizedFiles.length > 0) {
    const fileInfo = oversizedFiles.map((file) => {
      const maxSize = getMaxFileSize(file)
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)
      return `${file.name} (최대 ${maxSizeMB}MB)`
    })
    $q.notify({
      type: 'negative',
      message: '파일 크기가 너무 큽니다.',
      caption: fileInfo.join(', '),
      position: 'top',
    })
    // 크기 초과 파일 제외
    const validFiles = fileArray.filter((file) => {
      const maxSize = getMaxFileSize(file)
      return file.size <= maxSize
    })
    selectedFiles.value = validFiles
    if (validFiles.length === 0) {
      return
    }
    // 유효한 파일만 처리하도록 fileArray 업데이트
    fileArray.length = 0
    fileArray.push(...validFiles)
  }

  // 모든 파일을 Promise로 처리
  const previewPromises = fileArray.map((file) => {
    return new Promise((resolve) => {
      const preview = {
        name: file.name,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: null,
      }

      if (preview.type === 'image') {
        const reader = new FileReader()
        reader.onload = (e) => {
          preview.url = e.target.result
          resolve(preview)
        }
        reader.onerror = () => {
          // 읽기 실패 시에도 preview 객체는 반환
          resolve(preview)
        }
        reader.readAsDataURL(file)
      } else {
        // 이미지가 아닌 경우 바로 반환
        resolve(preview)
      }
    })
  })

  // 모든 파일 읽기 완료 후 배열에 추가
  const previews = await Promise.all(previewPromises)
  filePreviews.value = previews
}

// 파일 미리보기 제거
function removeFilePreview(index) {
  filePreviews.value.splice(index, 1)
  if (Array.isArray(selectedFiles.value)) {
    selectedFiles.value.splice(index, 1)
  } else {
    selectedFiles.value = []
  }
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 업로드 속도 포맷팅
function formatSpeed(bytesPerSecond) {
  if (!bytesPerSecond || bytesPerSecond === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  return Math.round((bytesPerSecond / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 남은 시간 포맷팅
function formatETA(seconds) {
  if (!seconds || seconds === 0 || !isFinite(seconds)) return '계산 중...'
  if (seconds < 60) return `${Math.round(seconds)}초`
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}분 ${secs}초`
  }
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}시간 ${mins}분`
}

// 업로드 취소 핸들러
function handleUploadCancel() {
  // TODO: XMLHttpRequest abort 구현 (필요시)
  showUploadProgress.value = false
  uploading.value = false
}

// 업로드된 파일 삭제
async function deleteUploadedFile(fileId) {
  $q.dialog({
    title: '삭제 확인',
    message: '이 파일을 삭제하시겠습니까?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await partsDataStore.deletePartFile(fileId)
      uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== fileId)
      $q.notify({
        type: 'positive',
        message: '파일이 삭제되었습니다.',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: '파일 삭제에 실패했습니다.',
        caption: error.message,
      })
    }
  })
}

// 폼 초기화
function resetForm() {
  editingClass.value = null
  formData.value = {
    name: '',
    c_code: '',
    code_name: '',
    description: '',
    category: '',
    d_code: '',
    example: '',
    detailed_description: '',
  }
  selectedFiles.value = []
  filePreviews.value = []
  uploadedFiles.value = []
  editorImageFiles.value = []
  uploading.value = false
  cCodeError.value = ''
  cCodeChecking.value = false
  classNameError.value = ''
  classNameChecking.value = false

  // 타이머 정리
  if (cCodeCheckTimer) {
    clearTimeout(cCodeCheckTimer)
    cCodeCheckTimer = null
  }
  if (classNameCheckTimer) {
    clearTimeout(classNameCheckTimer)
    classNameCheckTimer = null
  }
}

// 저장
async function saveClass() {
  // 대분류부터 체크
  if (!formData.value.category) {
    $q.notify({
      type: 'warning',
      message: '대분류명을 선택 하세요.',
      position: 'center',
    })
    return
  }

  // 클래스명 체크
  if (!formData.value.name) {
    $q.notify({
      type: 'warning',
      message: '클래스명을 입력하세요.',
      position: 'center',
    })
    return
  }

  // C Code 필수 체크
  if (!formData.value.c_code || formData.value.c_code.trim() === '') {
    $q.notify({
      type: 'warning',
      message: 'C Code를 입력하세요.',
      position: 'center',
    })
    return
  }

  // c_code 길이 검증 (최대 6자)
  if (formData.value.c_code && formData.value.c_code.length > 6) {
    $q.notify({
      type: 'warning',
      message: 'C Code는 최대 10자까지 입력 가능합니다.',
      position: 'center',
    })
    return
  }

  // C Code 중복 체크 (에러가 있으면 저장 불가)
  if (cCodeError.value) {
    $q.notify({
      type: 'warning',
      message: 'C Code 중복을 확인해주세요.',
      position: 'center',
    })
    return
  }

  // 클래스명 중복 체크 (에러가 있으면 저장 불가)
  if (classNameError.value) {
    $q.notify({
      type: 'warning',
      message: '클래스명 중복을 확인해주세요.',
      position: 'center',
    })
    return
  }

  try {
    let savedClass = null
    const previousHtml = editingClass.value?.detailed_description || ''

    // editingClass가 있고 id가 있으면 수정 모드, id가 없으면 추가 모드 (복제 포함)
    if (editingClass.value && editingClass.value.id) {
      try {
        savedClass = await partsDataStore.updatePartClass(editingClass.value.id, formData.value)

        if (!savedClass) {
          // updatePartClass가 undefined를 반환하면 기존 editingClass를 사용
          savedClass = editingClass.value
        }

        $q.notify({
          type: 'positive',
          message: '수정되었습니다.',
        })
      } catch (updateError) {
        // 업데이트 실패 시에도 파일 업로드를 위해 editingClass 사용
        savedClass = editingClass.value
        throw updateError
      }
    } else {
      // 새로 추가할 때: sort_order 설정
      const saveData = { ...formData.value }

      // 끼워넣기 모드인 경우
      if (props.insertMode && props.insertTargetItem) {
        const insertResult = calculateInsertPosition(props.insertMode, props.insertTargetItem, props.partClasses)
        saveData.sort_order = insertResult.sort_order
        saveData.sub_sort_order = insertResult.sub_sort_order
        if (insertResult.itemsToUpdate.length > 0) {
          saveData._reorderSameSortOrderItems = insertResult.itemsToUpdate
        }
      } else if (props.insertMode === 'add-to-top') {
        // 맨 앞에 추가: 첫 번째 항목의 sort_order - 10 또는 0
        const firstItem = props.partClasses[0]
        if (firstItem && firstItem.sort_order !== undefined) {
          saveData.sort_order = Math.max(0, firstItem.sort_order - 10)
          saveData.sub_sort_order = 0
        } else {
          saveData.sort_order = 0
          saveData.sub_sort_order = 0
        }
      } else if (props.insertMode === 'add-to-bottom') {
        // 맨 뒤에 추가: sort_order를 보내지 않으면 서버에서 자동으로 최대값 + 10으로 설정됨 (10단위 증가)
        // 별도 처리 불필요
      }

      savedClass = await partsDataStore.createPartClass(saveData)

      // 끼워넣기 모드에서 같은 sort_order를 가진 항목들의 sub_sort_order 재정렬
      if (saveData._reorderSameSortOrderItems && saveData._reorderSameSortOrderItems.length > 0) {
        try {
          await partsDataStore.reorderPartClasses(saveData._reorderSameSortOrderItems)
          if (import.meta.env.DEV) {
            console.log('[끼워넣기] 같은 sort_order 항목들의 sub_sort_order 재정렬 완료:', saveData._reorderSameSortOrderItems)
          }
        } catch (error) {
          console.error('[끼워넣기] sub_sort_order 재정렬 실패:', error)
          // 재정렬 실패해도 새 항목은 저장되었으므로 경고만 표시
          $q.notify({
            type: 'warning',
            message: '항목은 추가되었지만 정렬 순서 업데이트에 실패했습니다.',
            timeout: 3000,
          })
        }
      }

      $q.notify({
        type: 'positive',
        message: '추가되었습니다.',
      })
    }

    // 에디터의 임시 파일을 정식 폴더로 이동
    if (savedClass && savedClass.id && formData.value.detailed_description) {
      try {
        const htmlContent = formData.value.detailed_description
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlContent, 'text/html')
        const images = doc.body.querySelectorAll('img')

        let updatedHtml = htmlContent
        let movedCount = 0

        for (const img of images) {
          const src = img.src || img.getAttribute('src') || ''

          // 임시 파일 URL인지 확인 (uploads/_temp/ 포함)
          if (src.includes('uploads/_temp/') || src.includes('uploads%2F_temp%2F')) {
            try {
              // URL 디코딩
              const decodedSrc = decodeURIComponent(src)
              const urlMatch = decodedSrc.match(/uploads\/_temp\/([^"'\s]+)/)

              if (urlMatch) {
                const tempFileName = urlMatch[1]
                // 이미지 태그에서 data-original-filename 속성 확인
                const dataOriginalFilename = img.getAttribute('data-original-filename')
                // data 속성이 없으면 확장자만 추출하여 기본값 사용
                const ext = tempFileName.split('.').pop() || 'jpg'
                const originalFilename = dataOriginalFilename || `image.${ext}`

                // 임시 파일을 정식 폴더로 이동
                const moveResult = await partsDataStore.moveTempFileToPartClass(savedClass.id, decodedSrc, originalFilename)

                // HTML에서 URL 교체
                updatedHtml = updatedHtml.replace(new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), moveResult.newUrl)
                movedCount++
              }
            } catch (error) {
              // 개발 모드에서만 에러 로그 출력
              if (import.meta.env.DEV) {
                console.error('임시 파일 이동 실패:', error)
              }
              // 계속 진행
            }
          }
        }

        // URL이 변경되었으면 업데이트
        if (movedCount > 0 && updatedHtml !== htmlContent) {
          await partsDataStore.updatePartClass(savedClass.id, {
            ...formData.value,
            detailed_description: updatedHtml,
          })
          formData.value.detailed_description = updatedHtml
        }
      } catch (error) {
        // 개발 모드에서만 에러 로그 출력
        if (import.meta.env.DEV) {
          console.error('임시 파일 처리 중 오류:', error)
        }
        // 에러가 발생해도 계속 진행
      }
    }

    // 사용되지 않는 에디터 이미지 삭제 (지연 삭제)
    // 편집 모드일 때만 실행 (새로 추가 모드에서는 이전 이미지가 없음)
    if (editingClass.value && savedClass && savedClass.id && formData.value.detailed_description) {
      try {
        const currentHtml = formData.value.detailed_description
        const parser = new DOMParser()
        const doc = parser.parseFromString(currentHtml, 'text/html')
        const images = doc.body.querySelectorAll('img')

        // 현재 사용 중인 이미지 URL 추출
        const currentImageUrls = Array.from(images)
          .map((img) => {
            return img.src || img.getAttribute('src') || ''
          })
          .filter((url) => url && (url.includes('uploads/') || url.startsWith('http')))

        // 사용되지 않는 이미지 삭제
        if (currentImageUrls.length > 0 || previousHtml) {
          const cleanupResult = await partsDataStore.cleanupOrphanedEditorImages(savedClass.id, currentImageUrls)

          if (cleanupResult.deleted_count > 0) {
            // 개발 모드에서만 로그 출력
            if (import.meta.env.DEV) {
              console.log(`[saveClass] ${cleanupResult.deleted_count}개의 사용되지 않는 이미지가 삭제되었습니다.`)
            }
          }
        }
      } catch (error) {
        // 개발 모드에서만 에러 로그 출력
        if (import.meta.env.DEV) {
          console.error('사용되지 않는 이미지 삭제 중 오류:', error)
        }
        // 에러가 발생해도 계속 진행 (삭제 실패는 치명적이지 않음)
      }
    }

    // 파일 업로드 처리
    if (selectedFiles.value && selectedFiles.value.length > 0 && savedClass && savedClass.id) {
      uploading.value = true
      showUploadProgress.value = true

      // 업로드 진행률 추적을 위한 파일 상태 초기화
      uploadProgressFiles.value = selectedFiles.value.map((file) => ({
        name: file.name,
        progress: 0,
        completed: false,
        error: null,
        speed: null,
        eta: null,
      }))
      uploadCancelHandlers.value = []

      try {
        // 모든 파일을 병렬로 업로드 (진행률 추적)
        const uploadPromises = selectedFiles.value.map((file, index) => {
          let lastLoaded = 0
          let lastTime = Date.now()

          return new Promise((resolve, reject) => {
            // 진행률 콜백
            const progressCallback = (progress) => {
              const now = Date.now()
              const timeDiff = (now - lastTime) / 1000 // 초 단위
              const loadedDiff = (progress / 100) * file.size - lastLoaded

              if (timeDiff > 0 && loadedDiff > 0) {
                const speed = loadedDiff / timeDiff // bytes/sec
                const remainingBytes = file.size - (progress / 100) * file.size
                const etaSeconds = remainingBytes / speed

                uploadProgressFiles.value[index].speed = formatSpeed(speed)
                uploadProgressFiles.value[index].eta = formatETA(etaSeconds)
              }

              uploadProgressFiles.value[index].progress = progress
              lastLoaded = (progress / 100) * file.size
              lastTime = now
            }

            // 업로드 실행
            partsDataStore
              .uploadPartClassFile(savedClass.id, file, progressCallback)
              .then((result) => {
                uploadProgressFiles.value[index].completed = true
                uploadProgressFiles.value[index].progress = 100
                resolve(result)
              })
              .catch((error) => {
                uploadProgressFiles.value[index].error = error.message
                uploadProgressFiles.value[index].completed = true
                reject(error)
              })
          })
        })

        await Promise.all(uploadPromises)

        $q.notify({
          type: 'positive',
          message: `${selectedFiles.value.length}개 파일이 업로드되었습니다.`,
        })
      } catch {
        const failedCount = uploadProgressFiles.value.filter((f) => f.error).length
        $q.notify({
          type: 'negative',
          message: '파일 업로드 중 오류가 발생했습니다.',
          caption: `${failedCount}개 파일 업로드 실패`,
        })
      } finally {
        uploading.value = false
        // 업로드 완료 후 1초 뒤 진행률 창 닫기
        setTimeout(() => {
          showUploadProgress.value = false
          uploadProgressFiles.value = []
          uploadCancelHandlers.value = []
        }, 1000)
      }
    }

    // 모달 닫기 및 폼 초기화
    emit('update:modelValue', false)
    resetForm()
    emit('saved', savedClass)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '저장에 실패했습니다.',
      caption: error.message,
    })
  }
}

// 취소
function handleCancel() {
  emit('update:modelValue', false)
  resetForm()
  emit('cancel')
}

// 컴포넌트 언마운트 시 타이머 정리
onUnmounted(() => {
  if (cCodeCheckTimer) {
    clearTimeout(cCodeCheckTimer)
    cCodeCheckTimer = null
  }
  if (classNameCheckTimer) {
    clearTimeout(classNameCheckTimer)
    classNameCheckTimer = null
  }
})
</script>

<style lang="scss" scoped>
// ===== 분류 추가 모달창 스타일 =====
.add-class-dialog-card {
  min-width: 90vw;
  max-width: 800px;
  width: 90vw;
  border: 1px solid var(--nexa-ui-primary);

  @media (min-width: 800px) {
    min-width: 700px;
    width: 90vw;
    max-width: 800px;
  }

  @media (max-width: 600px) {
    min-width: 95vw;
    width: 95vw;
    max-width: 95vw;
  }
}

.add-class-dialog-section {
  padding: 120px 64px;

  @media (max-width: 600px) {
    padding: 32px 16px;
  }
}

.dialog-title {
  color: var(--nexa-text-primary);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog-title-en {
  font-weight: 900;
  text-transform: uppercase;
  font-size: 3em;
  line-height: 1.2;
}

.dialog-title-ko {
  font-weight: 400;
  font-size: 0.75em;
}

.insert-target-block {
  display: inline-flex;
  align-items: center;
  background-color: rgba(65, 170, 223, 0.2);
  border: 1px solid rgba(65, 170, 223, 0.5);
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: 600;
  color: var(--nexa-ui-primary);
}

.add-class-dialog-form {
  padding: 48px 24px;

  @media (max-width: 600px) {
    padding: 24px 12px;
  }

  :deep(.q-field--outlined .q-field__control::before) {
    border-color: #000000;
  }

  :deep(.q-field--outlined.q-field--focused .q-field__control::before),
  :deep(.q-field--outlined:hover .q-field__control::before) {
    border-color: #000000;
  }

  :deep(.q-field__label) {
    color: var(--nexa-text-primary);
    opacity: 0.5;
  }

  :deep(.q-select__dropdown-icon) {
    color: var(--nexa-text-primary);
    opacity: 0.5;
  }

  :deep(.has-duplicate-error.q-field--outlined .q-field__control::before),
  :deep(.has-duplicate-error.q-field--outlined .q-field__control::after) {
    border-color: var(--nexa-warning);
  }

  :deep(.has-duplicate-error.q-field--outlined.q-field--focused .q-field__control::before),
  :deep(.has-duplicate-error.q-field--outlined.q-field--focused .q-field__control::after),
  :deep(.has-duplicate-error.q-field--outlined:hover .q-field__control::before),
  :deep(.has-duplicate-error.q-field--outlined:hover .q-field__control::after) {
    border-color: var(--nexa-warning);
  }

  :deep(.has-duplicate-error .q-field__append .q-icon),
  :deep(.has-duplicate-error .q-field__prepend .q-icon),
  :deep(.has-duplicate-error .q-field__append .q-spinner),
  :deep(.has-duplicate-error .q-field__prepend .q-spinner) {
    color: var(--nexa-warning);
  }

  :deep(.q-field) {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  :deep(.row .q-field) {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  :deep(.q-mb-lg) {
    margin-bottom: 10px;
  }
}

.add-class-dialog-actions {
  padding: 0 48px 96px 48px;
  margin-top: -66px;

  @media (max-width: 600px) {
    padding: 0 12px 24px 12px;
    margin-top: -54px;
  }
}

.dialog-action-btn {
  min-width: 140px;
  font-size: 20px;
  padding: 8px 32px;
  font-weight: 600;
}

.dialog-action-btn-cancel {
  &:hover {
    opacity: 0.8;
  }
}

.dialog-action-btn-save {
  &:hover:not(.q-btn--disabled) {
    opacity: 0.9;
  }

  &.q-btn--disabled {
    opacity: 0.5;
  }
}

// 파일 미리보기 및 업로드 관련 스타일
.file-previews {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-preview-item {
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.uploaded-files {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 12px;
}

.uploaded-file-item {
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.preview-image {
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
