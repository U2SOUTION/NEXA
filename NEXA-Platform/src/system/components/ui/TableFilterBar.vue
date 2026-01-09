<!-- TableFilterBar.vue
  범용 테이블 필터 바 컴포넌트
  검색 필드와 동적 필터(셀렉트)를 제공
-->
<template>
  <div class="table-filter-bar row q-gutter-xs q-mb-md items-center">
    <!-- 검색 필드 (자동완성 및 히스토리 지원) -->
    <div class="col-12 col-md search-input-wrapper" style="position: relative">
      <q-input
        :ref="searchInputRef"
        :model-value="searchText"
        :placeholder="searchPlaceholder"
        outlined
        dense
        clearable
        class="search-input"
        :style="{ border: 'none', '--q-field-border-color': '#000000' }"
        @update:model-value="handleSearchInput"
        @focus="handleSearchFocus"
        @blur="handleSearchBlur"
        @keydown.enter="handleSearchEnter"
        @keydown.escape="hideSuggestions"
        @keydown.down.prevent="navigateSuggestions(1)"
        @keydown.up.prevent="navigateSuggestions(-1)"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-btn-dropdown
            flat
            dense
            round
            size="sm"
            class="search-field-selector-btn"
            menu-class="search-field-selector-menu"
            :menu-style="{ backgroundColor: 'var(--nexa-surface)' }"
            :offset="[0, 4]"
          >
            <q-tooltip>검색 필드 선택</q-tooltip>
            <q-list
              dense
              :style="{
                minWidth: '180px',
                backgroundColor: 'var(--nexa-surface)',
                padding: '8px 0',
              }"
            >
              <q-item-label
                header
                class="text-weight-bold"
                :style="{
                  backgroundColor: 'var(--nexa-surface)',
                  color: 'var(--nexa-text-secondary)',
                }"
              >
                검색 필드 선택
              </q-item-label>
              <!-- 전체 필드 옵션 -->
              <q-item
                clickable
                :style="{ backgroundColor: 'var(--nexa-surface)' }"
                @click="selectAllFieldsOption"
              >
                <q-item-section avatar>
                  <q-checkbox
                    :model-value="isAllFieldsSelected"
                    @update:model-value="selectAllFieldsOption"
                    @click.stop
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>전체 필드</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator :style="{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }" />
              <!-- 개별 필드 옵션 -->
              <q-item
                v-for="field in availableSearchFields"
                :key="field.value"
                clickable
                :disable="isAllFieldsSelected"
                :style="{ backgroundColor: 'var(--nexa-surface)' }"
                @click="toggleFieldSelection(field.value)"
              >
                <q-item-section avatar>
                  <q-checkbox
                    :model-value="selectedSearchFields.includes(field.value)"
                    :disable="isAllFieldsSelected"
                    @update:model-value="toggleFieldSelection(field.value)"
                    @click.stop
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ field.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
      </q-input>

      <!-- 자동완성 및 히스토리 제안 목록 -->
      <div
        v-if="showSuggestions && (autocompleteSuggestions.length > 0 || searchHistory.length > 0)"
        class="search-suggestions"
      >
        <!-- 자동완성 제안 -->
        <div v-if="autocompleteSuggestions.length > 0" class="suggestions-section">
          <q-list dense>
            <q-item
              v-for="(item, index) in autocompleteSuggestions"
              :key="`autocomplete-${index}`"
              clickable
              :class="{ 'suggestion-active': selectedSuggestionIndex === index }"
              @click="selectAutocompleteSuggestion(item)"
            >
              <q-item-section avatar>
                <q-icon name="search" size="16px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getSuggestionText(item) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 검색 히스토리 -->
        <div v-if="searchHistory.length > 0" class="suggestions-section">
          <q-list dense>
            <q-item
              v-for="(historyItem, index) in searchHistory"
              :key="`history-${index}`"
              clickable
              :class="{
                'suggestion-active':
                  selectedSuggestionIndex === autocompleteSuggestions.length + index,
              }"
              @click="selectHistoryItem(historyItem)"
            >
              <q-item-section avatar>
                <q-icon name="history" size="16px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ historyItem }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  dense
                  size="xs"
                  icon="close"
                  @click.stop="removeHistoryItem(historyItem)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>

    <!-- 동적 필터들 -->
    <template v-for="(filter, index) in filters" :key="filter.key || index">
      <q-select
        :model-value="getFilterValue(filter)"
        :options="getFilterOptions(filter)"
        :label="filter.label"
        :option-value="filter.optionValue"
        :option-label="filter.optionLabel"
        :emit-value="filter.emitValue !== false"
        :map-options="filter.mapOptions !== false"
        outlined
        dense
        :clearable="filter.clearable !== false"
        :class="['col-12', 'col-md', filter.class || 'filter-select']"
        :style="{ border: 'none', '--q-field-border-color': '#000000' }"
        @update:model-value="handleFilterUpdate(filter.key, $event)"
      />
    </template>

    <!-- 프리셋 버튼 (필터들 뒤에 배치) -->
    <q-btn-dropdown
      v-if="presetsStorageKey && presetsStorageKey.length > 0"
      flat
      dense
      icon="filter_list"
      label="프리셋"
      class="col-auto preset-dropdown-btn"
      menu-class="preset-dropdown-menu"
      :menu-style="{ backgroundColor: 'var(--nexa-surface)' }"
      @show="presetNameInput = ''"
    >
      <q-tooltip>필터 프리셋 관리</q-tooltip>
      <q-list
        dense
        :style="{
          minWidth: '280px',
          backgroundColor: 'var(--nexa-surface)',
          padding: '8px 0',
        }"
      >
        <!-- 신규 저장 섹션 -->
        <q-item :style="{ backgroundColor: 'var(--nexa-surface)' }">
          <q-item-section>
            <q-input
              v-model="presetNameInput"
              placeholder="저장할 필터 프리셋 이름을 입력하세요"
              dense
              outlined
              autofocus
              :disable="!hasActiveFilter"
              @keydown.enter="handleSavePreset"
              @keydown.escape="presetNameInput = ''"
            >
              <template v-slot:append>
                <q-icon
                  v-if="presetNameInput && hasActiveFilter"
                  name="check"
                  class="cursor-pointer"
                  @click="handleSavePreset"
                />
              </template>
            </q-input>
            <q-item-label
              v-if="!hasActiveFilter"
              caption
              :style="{
                color: 'var(--nexa-text-secondary)',
                paddingTop: '4px',
              }"
            >
              필터를 적용한 후 저장할 수 있습니다
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- 저장된 프리셋 목록 -->
        <template v-if="presets.length > 0">
          <q-separator
            :style="{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              margin: '8px 0',
            }"
          />
          <q-item
            v-for="preset in presets"
            :key="preset.id"
            clickable
            v-close-popup
            :style="{ backgroundColor: 'var(--nexa-surface)' }"
            @click="handlePresetClick(preset)"
          >
            <q-item-section avatar>
              <q-icon name="filter_list" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ preset.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                dense
                size="xs"
                icon="close"
                @click.stop="handlePresetRemove(preset.id)"
              />
            </q-item-section>
          </q-item>
        </template>
        <q-item v-else :style="{ backgroundColor: 'var(--nexa-surface)' }">
          <q-item-section>
            <q-item-label
              caption
              :style="{
                color: 'var(--nexa-text-secondary)',
                textAlign: 'center',
                padding: '8px',
              }"
            >
              저장된 프리셋이 없습니다
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <!-- 선택 수량 표시 (optional) -->
    <div
      v-if="
        (selectedCount !== undefined && selectedCount > 0) ||
        (hasActiveFilter && filteredCount !== undefined && filteredCount > 0)
      "
      class="col-auto selected-count-text"
      :style="{ color: 'var(--nexa-text-primary)' }"
    >
      <template v-if="hasActiveFilter && filteredCount !== undefined && filteredCount > 0">
        <template v-if="selectedCount !== undefined && selectedCount > 0">
          Filter {{ selectedCount }}/{{ filteredCount }}
        </template>
        <template v-else> Filter {{ filteredCount }} </template>
      </template>
      <template v-else-if="selectedCount !== undefined && selectedCount > 0">
        Sel {{ selectedCount }}
      </template>
    </div>

    <!-- 오른쪽 정렬을 위한 공간 -->
    <div v-if="showSpacer" class="col-auto q-ml-auto"></div>

    <!-- 슬롯: 추가 버튼이나 작업 메뉴 등 -->
    <div v-if="$slots.actions" class="col-auto">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  // 검색 텍스트 (v-model)
  searchText: {
    type: String,
    default: '',
  },
  // 검색 필드 placeholder
  searchPlaceholder: {
    type: String,
    default: '검색...',
  },
  // 필터 배열
  // 각 필터는 { key, model, options, label, optionValue, optionLabel, emitValue, mapOptions, clearable, class } 형태
  filters: {
    type: Array,
    default: () => [],
  },
  // 선택 수량 표시 (optional)
  selectedCount: {
    type: Number,
    default: undefined,
  },
  // 필터링된 결과 수량 (optional, 필터링이 있을 때 선택 수량과 함께 표시)
  filteredCount: {
    type: Number,
    default: undefined,
  },
  // 필터링 활성화 여부 (optional, 필터링이 있을 때만 "4/10" 형식으로 표시 및 프리셋 저장 버튼 표시)
  hasActiveFilter: {
    type: Boolean,
    default: false,
  },
  // 오른쪽 공간 표시 여부
  showSpacer: {
    type: Boolean,
    default: true,
  },
  // 자동완성 데이터 (배열)
  autocompleteData: {
    type: Array,
    default: () => [],
  },
  // 자동완성 검색 필드 (문자열 배열)
  autocompleteFields: {
    type: Array,
    default: () => [],
  },
  // 히스토리 저장 키 (localStorage)
  historyStorageKey: {
    type: String,
    default: '',
  },
  // 최대 히스토리 개수
  maxHistoryItems: {
    type: Number,
    default: 10,
  },
  // 최대 자동완성 제안 개수
  maxAutocompleteItems: {
    type: Number,
    default: 5,
  },
  // 검색 필드 라벨 맵 (예: { name: '이름', c_code: '코드', description: '설명' })
  searchFieldLabels: {
    type: Object,
    default: () => ({}),
  },
  // 검색 필드 선택 저장 키 (localStorage)
  searchFieldsStorageKey: {
    type: String,
    default: '',
  },
  // 필터 프리셋 저장 키 (localStorage)
  presetsStorageKey: {
    type: String,
    default: '',
  },
  // 현재 필터 상태 (프리셋 저장용)
  currentFilterState: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits([
  'update:searchText',
  'update:filter',
  'update:searchFields',
  'load-preset',
  'save-preset',
  'remove-preset',
])

const searchInputRef = ref(null)
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)
const searchHistory = ref([])
const isSearchFocused = ref(false)
const selectedSearchFields = ref([])
const ALL_FIELDS_VALUE = '__all__'

// 전체 필드 선택 여부
const isAllFieldsSelected = computed(() => {
  return selectedSearchFields.value.includes(ALL_FIELDS_VALUE)
})

// 사용 가능한 검색 필드 목록
const availableSearchFields = computed(() => {
  if (!props.autocompleteFields || props.autocompleteFields.length === 0) return []
  return props.autocompleteFields.map((field) => ({
    value: field,
    label: props.searchFieldLabels[field] || field,
  }))
})

// 모든 검색 필드 가져오기 (전체 필드 옵션용)
function getAllSearchFields() {
  return [...props.autocompleteFields]
}

// 검색 필드 선택 상태 로드
function loadSearchFields() {
  if (
    !props.searchFieldsStorageKey ||
    !props.autocompleteFields ||
    props.autocompleteFields.length === 0
  ) {
    // 기본값: 전체 필드 선택
    selectedSearchFields.value = [ALL_FIELDS_VALUE]
    emit('update:searchFields', getAllSearchFields())
    return
  }
  try {
    const stored = localStorage.getItem(props.searchFieldsStorageKey)
    if (stored) {
      const savedFields = JSON.parse(stored)
      // 전체 필드 옵션이 저장되어 있으면 그대로 사용
      if (savedFields.includes(ALL_FIELDS_VALUE)) {
        selectedSearchFields.value = [ALL_FIELDS_VALUE]
        emit('update:searchFields', getAllSearchFields())
        return
      }
      // 저장된 필드가 현재 사용 가능한 필드에 포함되어 있는지 확인
      selectedSearchFields.value = savedFields.filter((field) =>
        props.autocompleteFields.includes(field),
      )
      // 저장된 필드가 없거나 모두 유효하지 않으면 기본값 사용
      if (selectedSearchFields.value.length === 0) {
        selectedSearchFields.value = [ALL_FIELDS_VALUE]
        emit('update:searchFields', getAllSearchFields())
      } else {
        emit('update:searchFields', selectedSearchFields.value)
      }
    } else {
      // 저장된 값이 없으면 기본값: 전체 필드 선택
      selectedSearchFields.value = [ALL_FIELDS_VALUE]
      emit('update:searchFields', getAllSearchFields())
    }
  } catch (error) {
    console.error('검색 필드 선택 로드 실패:', error)
    selectedSearchFields.value = [ALL_FIELDS_VALUE]
    emit('update:searchFields', getAllSearchFields())
  }
}

// 검색 필드 선택 상태 저장
function saveSearchFields() {
  if (!props.searchFieldsStorageKey) return
  try {
    localStorage.setItem(props.searchFieldsStorageKey, JSON.stringify(selectedSearchFields.value))
  } catch (error) {
    console.error('검색 필드 선택 저장 실패:', error)
  }
}

// 필드 선택 토글
function toggleFieldSelection(field) {
  // 전체 필드가 선택되어 있으면 개별 필드 선택 불가
  if (isAllFieldsSelected.value) return

  const index = selectedSearchFields.value.indexOf(field)
  if (index > -1) {
    // 이미 선택된 필드는 해제 (단, 최소 1개는 유지)
    if (selectedSearchFields.value.length > 1) {
      selectedSearchFields.value.splice(index, 1)
    }
  } else {
    // 선택되지 않은 필드는 추가
    selectedSearchFields.value.push(field)
  }
  saveSearchFields()
  emit('update:searchFields', selectedSearchFields.value)
}

// 전체 필드 옵션 선택/해제
function selectAllFieldsOption() {
  if (isAllFieldsSelected.value) {
    // 전체 필드 해제 시 첫 번째 필드만 선택
    if (props.autocompleteFields.length > 0) {
      selectedSearchFields.value = [props.autocompleteFields[0]]
      emit('update:searchFields', selectedSearchFields.value)
    }
  } else {
    // 전체 필드 선택
    selectedSearchFields.value = [ALL_FIELDS_VALUE]
    emit('update:searchFields', getAllSearchFields())
  }
  saveSearchFields()
}

// 검색 히스토리 로드
function loadSearchHistory() {
  if (!props.historyStorageKey) return
  try {
    const stored = localStorage.getItem(props.historyStorageKey)
    if (stored) {
      searchHistory.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('검색 히스토리 로드 실패:', error)
    searchHistory.value = []
  }
}

// 검색 히스토리 저장
function saveSearchHistory() {
  if (!props.historyStorageKey) return
  try {
    localStorage.setItem(props.historyStorageKey, JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('검색 히스토리 저장 실패:', error)
  }
}

// 검색어를 히스토리에 추가
function addToHistory(searchTerm) {
  if (!searchTerm || !searchTerm.trim()) return
  const trimmed = searchTerm.trim()
  // 중복 제거
  searchHistory.value = searchHistory.value.filter((item) => item !== trimmed)
  // 맨 앞에 추가
  searchHistory.value.unshift(trimmed)
  // 최대 개수 제한
  if (searchHistory.value.length > props.maxHistoryItems) {
    searchHistory.value = searchHistory.value.slice(0, props.maxHistoryItems)
  }
  saveSearchHistory()
}

// 히스토리 항목 제거
function removeHistoryItem(item) {
  searchHistory.value = searchHistory.value.filter((h) => h !== item)
  saveSearchHistory()
}

// 자동완성 제안 계산 (선택된 필드만 검색)
const autocompleteSuggestions = computed(() => {
  if (!props.searchText || props.searchText.trim().length < 1) return []
  if (!props.autocompleteData || props.autocompleteData.length === 0) return []
  if (!selectedSearchFields.value || selectedSearchFields.value.length === 0) return []

  const searchLower = props.searchText.toLowerCase().trim()
  const suggestions = []

  // 검색할 필드 목록 결정
  const fieldsToSearch = isAllFieldsSelected.value
    ? getAllSearchFields()
    : selectedSearchFields.value

  for (const item of props.autocompleteData) {
    // 이미 최대 개수에 도달하면 중단
    if (suggestions.length >= props.maxAutocompleteItems) break

    // 선택된 검색 필드 중 하나라도 일치하면 추가
    for (const field of fieldsToSearch) {
      const fieldValue = item[field]
      if (fieldValue && String(fieldValue).toLowerCase().includes(searchLower)) {
        // 중복 제거 (같은 항목이 여러 필드에서 매칭될 수 있음)
        if (!suggestions.find((s) => s === item)) {
          suggestions.push(item)
        }
        break
      }
    }
  }

  return suggestions
})

// 제안 텍스트 생성 (선택된 필드 우선)
function getSuggestionText(item) {
  if (!item) return ''
  // 검색할 필드 목록 결정
  const fieldsToSearch = isAllFieldsSelected.value
    ? getAllSearchFields()
    : selectedSearchFields.value
  // 선택된 필드 중 첫 번째로 값이 있는 필드의 값을 반환
  for (const field of fieldsToSearch) {
    if (item[field]) {
      return String(item[field])
    }
  }
  // 선택된 필드에 값이 없으면 전체 필드에서 찾기
  for (const field of props.autocompleteFields) {
    if (item[field]) {
      return String(item[field])
    }
  }
  return ''
}

// 검색 입력 핸들러
function handleSearchInput(value) {
  emit('update:searchText', value)
  selectedSuggestionIndex.value = -1
  // 검색어가 변경되면 제안 표시
  if (value && value.trim().length > 0) {
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
}

// 검색 필드 포커스
function handleSearchFocus() {
  isSearchFocused.value = true
  // 검색어가 있으면 자동완성, 없으면 히스토리 표시
  if (props.searchText && props.searchText.trim().length > 0) {
    showSuggestions.value = true
  } else if (searchHistory.value.length > 0) {
    showSuggestions.value = true
  }
}

// 검색 필드 블러
function handleSearchBlur() {
  // 약간의 지연을 두어 클릭 이벤트가 먼저 실행되도록
  setTimeout(() => {
    isSearchFocused.value = false
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }, 200)
}

// 검색 엔터 키
function handleSearchEnter() {
  if (selectedSuggestionIndex.value >= 0) {
    // 선택된 제안이 있으면 해당 제안 선택
    if (selectedSuggestionIndex.value < autocompleteSuggestions.value.length) {
      selectAutocompleteSuggestion(autocompleteSuggestions.value[selectedSuggestionIndex.value])
    } else {
      const historyIndex = selectedSuggestionIndex.value - autocompleteSuggestions.value.length
      if (historyIndex < searchHistory.value.length) {
        selectHistoryItem(searchHistory.value[historyIndex])
      }
    }
  } else if (props.searchText && props.searchText.trim()) {
    // 검색어가 있으면 히스토리에 추가
    addToHistory(props.searchText)
    showSuggestions.value = false
  }
}

// 제안 목록 네비게이션
function navigateSuggestions(direction) {
  const totalSuggestions = autocompleteSuggestions.value.length + searchHistory.value.length
  if (totalSuggestions === 0) return

  selectedSuggestionIndex.value += direction
  if (selectedSuggestionIndex.value < 0) {
    selectedSuggestionIndex.value = totalSuggestions - 1
  } else if (selectedSuggestionIndex.value >= totalSuggestions) {
    selectedSuggestionIndex.value = 0
  }
}

// 제안 목록 숨기기
function hideSuggestions() {
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
}

// 자동완성 제안 선택
function selectAutocompleteSuggestion(item) {
  const suggestionText = getSuggestionText(item)
  if (suggestionText) {
    emit('update:searchText', suggestionText)
    addToHistory(suggestionText)
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }
}

// 히스토리 항목 선택
function selectHistoryItem(item) {
  emit('update:searchText', item)
  // 선택한 항목을 맨 위로 이동
  searchHistory.value = searchHistory.value.filter((h) => h !== item)
  searchHistory.value.unshift(item)
  saveSearchHistory()
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
}

// 필터 프리셋 관련
const presets = ref([])
const presetNameInput = ref('')
const showPresetInput = ref(false)

// 프리셋 로드
function loadPresets() {
  if (!props.presetsStorageKey) return
  try {
    const stored = localStorage.getItem(props.presetsStorageKey)
    if (stored) {
      presets.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('프리셋 로드 실패:', error)
    presets.value = []
  }
}

// 프리셋 저장
function savePresets() {
  if (!props.presetsStorageKey) return
  try {
    localStorage.setItem(props.presetsStorageKey, JSON.stringify(presets.value))
  } catch (error) {
    console.error('프리셋 저장 실패:', error)
  }
}

// 프리셋 클릭 (불러오기)
function handlePresetClick(preset) {
  emit('load-preset', preset)
  // 활성 상태 업데이트
  presets.value = presets.value.map((p) => ({
    ...p,
    active: p.id === preset.id,
  }))
  savePresets()
}

// 프리셋 저장
function handleSavePreset() {
  if (!presetNameInput.value.trim()) return
  if (!props.currentFilterState) return

  const newPreset = {
    id: Date.now().toString(),
    name: presetNameInput.value.trim(),
    filterState: { ...props.currentFilterState },
    active: false,
  }

  presets.value.push(newPreset)
  savePresets()
  presetNameInput.value = ''
  showPresetInput.value = false

  emit('save-preset', newPreset)
}

// 프리셋 삭제
function handlePresetRemove(presetId) {
  presets.value = presets.value.filter((p) => p.id !== presetId)
  savePresets()
  emit('remove-preset', presetId)
}

// 초기화
onMounted(() => {
  loadSearchHistory()
  loadSearchFields()
  loadPresets()
})

// 필터 값 추출 (ref 객체인 경우 .value를 반환)
function getFilterValue(filter) {
  if (!filter.model) return null
  // ref 객체인지 확인 (Vue 3의 ref는 .value 속성을 가짐)
  if (typeof filter.model === 'object' && 'value' in filter.model) {
    return filter.model.value
  }
  // 일반 값인 경우 그대로 반환
  return filter.model
}

// 필터 옵션 추출 (computed 객체인 경우 .value를 반환)
function getFilterOptions(filter) {
  if (!filter.options) return []
  // computed 객체인지 확인 (Vue 3의 computed는 .value 속성을 가짐)
  if (typeof filter.options === 'object' && 'value' in filter.options) {
    return filter.options.value
  }
  // 일반 배열인 경우 그대로 반환
  return filter.options
}

// 필터 업데이트 핸들러
function handleFilterUpdate(filterKey, value) {
  emit('update:filter', { key: filterKey, value })
}

// 외부에서 searchInputRef에 접근할 수 있도록 expose
defineExpose({
  searchInputRef,
  presets,
  loadPresets,
})
</script>

<style lang="scss" scoped>
@import './TableFilterBar.scss';
</style>
