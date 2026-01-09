<template>
  <div class="theme-manager-content">
    <div class="settings-section">
      <div class="theme-header">
        <h3 class="section-title">테마 설정</h3>
        <q-btn-toggle
          v-model="isDarkMode"
          :options="[
            { label: '라이트', value: false, icon: 'light_mode' },
            { label: '다크', value: true, icon: 'dark_mode' },
          ]"
          @update:model-value="toggleTheme"
          toggle-color="primary"
        />
      </div>

      <!-- 색상 변수 표시 섹션 -->
      <div class="color-variables-section">
        <div class="section-header">
          <h4 class="section-subtitle">NEXA Theme Colors</h4>
        </div>
        <div v-for="category in sortedColorCategories" :key="category.category" class="category-section">
          <h5 class="category-title">
            <q-icon name="palette" size="sm" class="category-icon" />
            <span class="category-name">{{ category.categoryDisplay }}</span>
            <span v-if="category.translation" class="category-translation">({{ category.translation }})</span>
          </h5>
          <div class="color-grid">
            <div v-for="color in category.colors" :key="color.name" class="color-item" :class="{ 'color-item-selected': selectedColor && selectedColor.name === color.name }">
              <div class="color-box" :style="{ backgroundColor: color.value }" @click="(e) => handleColorClick(color, e)"></div>
              <div class="color-info">
                <div class="color-name">{{ color.name.replace('--nexa-', '') }}</div>
                <div class="color-value">{{ color.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { extractThemeColors } from '@system/utils/themeColorParser'
import { addRecentColor } from 'src/modules/theme-manager/services/recentColorsManager'

const props = defineProps({
  sortOption: {
    type: String,
    default: 'category',
  },
  searchQuery: {
    type: String,
    default: '',
  },
  categoryFilter: {
    type: String,
    default: null,
  },
})

const $q = useQuasar()
const isDarkMode = ref($q.dark.isActive)
const colorCategories = ref([])
const translationCache = ref(new Map())

// 선택된 색상 상태
const selectedColor = ref(null)

// 기본 번역 매핑 (폴백용)
const defaultTranslations = {
  nexa: '넥사',
  text: '텍스트',
  background: '배경',
  surface: '표면',
  button: '버튼',
  item: '아이템',
  panel: '패널',
  form: '폼',
  modal: '모달',
  toast: '토스트',
  progress: '프로그레스',
  tab: '탭',
  accordion: '아코디언',
  list: '리스트',
  tooltip: '툴팁',
  chart: '차트',
  link: '링크',
  shadow: '그림자',
  table: '테이블',
  select: '셀렉트',
  border: '보더',
  drawer: '드로어',
  header: '헤더',
  resize: '리사이즈',
  scrollbar: '스크롤바',
  warning: '경고',
  error: '에러',
  other: '기타',
}

/**
 * 카테고리명 번역 (무료 번역 API 사용, 실패 시 기본 매핑)
 * @param {string} category - 카테고리명 (영문)
 * @returns {Promise<string>} 번역된 카테고리명 (한글)
 */
async function translateCategory(category) {
  // 캐시 확인
  if (translationCache.value.has(category)) {
    return translationCache.value.get(category)
  }

  // 기본 매핑에서 확인
  if (defaultTranslations[category]) {
    const translation = defaultTranslations[category]
    translationCache.value.set(category, translation)
    return translation
  }

  // 무료 번역 API 시도 (Google Translate 무료 버전)
  try {
    // 방법 1: Google Translate API (무료 버전)
    // 주의: 실제로는 CORS 문제가 있을 수 있으므로 실험적
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(category)}`)

    if (response.ok) {
      const data = await response.json()
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translation = data[0][0][0]
        translationCache.value.set(category, translation)
        return translation
      }
    }
  } catch (error) {
    // API 실패 시 기본 매핑 사용
    console.warn('[ThemeManagerContent] 번역 API 실패, 기본 매핑 사용:', error)
  }

  // 모든 방법 실패 시 원본 반환
  const fallback = category
  translationCache.value.set(category, fallback)
  return fallback
}

/**
 * 모든 카테고리에 번역 추가
 */
async function addTranslationsToCategories() {
  for (const categoryData of colorCategories.value) {
    if (!categoryData.translation) {
      categoryData.translation = await translateCategory(categoryData.category)
    }
  }
}

// 정렬된 색상 카테고리 (computed)
const sortedColorCategories = computed(() => {
  const categories = [...colorCategories.value]
  let filtered = categories

  // 검색 필터 적용
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase()
    filtered = categories.map((category) => ({
      ...category,
      colors: category.colors.filter((color) => {
        const name = color.name.toLowerCase()
        const value = color.value.toLowerCase()
        const categoryName = category.category.toLowerCase()
        return name.includes(query) || value.includes(query) || categoryName.includes(query)
      }),
    })).filter((category) => category.colors.length > 0)
  }

  // 카테고리 필터 적용
  if (props.categoryFilter) {
    filtered = filtered.filter((category) => category.category === props.categoryFilter)
  }

  // 정렬 적용
  switch (props.sortOption) {
    case 'name':
      // 카테고리 내 색상을 변수명 알파벳 순으로 정렬
      return categories.map((category) => ({
        ...category,
        colors: [...category.colors].sort((a, b) => {
          const nameA = a.name.replace('--nexa-', '').toLowerCase()
          const nameB = b.name.replace('--nexa-', '').toLowerCase()
          return nameA.localeCompare(nameB)
        }),
      }))

    case 'value':
      // 카테고리 내 색상을 색상 값으로 정렬 (HEX 값을 숫자로 변환하여 비교)
      return categories.map((category) => ({
        ...category,
        colors: [...category.colors].sort((a, b) => {
          const hexA = a.value.replace('#', '')
          const hexB = b.value.replace('#', '')
          return parseInt(hexA, 16) - parseInt(hexB, 16)
        }),
      }))

    case 'category':
    default:
      // 카테고리별 기본 정렬 (원본 순서 유지)
      return filtered
  }
})

// 색상 변수 추출 함수
async function loadThemeColors() {
  nextTick(async () => {
    try {
      const colors = extractThemeColors()
      colorCategories.value = colors
      console.log('[ThemeManagerContent] 로드된 색상 카테고리:', colors.length)
      console.log('[ThemeManagerContent] 색상 데이터:', colors)

      // 번역 추가
      await addTranslationsToCategories()
    } catch (error) {
      console.error('[ThemeManagerContent] 색상 변수 로드 실패:', error)
    }
  })
}

// 전역 테마 변경 이벤트 리스너
function handleThemeManagerThemeChanged(event) {
  const themeValue = event.detail.theme
  const isDark = themeValue === 'dark'
  if (isDarkMode.value !== isDark) {
    isDarkMode.value = isDark
  }
}

// 컴포넌트 마운트 후 초기 로드
onMounted(() => {
  loadThemeColors()
  // 테마 관리에서 테마 변경 시 동기화
  window.addEventListener('theme-manager-theme-changed', handleThemeManagerThemeChanged)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  window.removeEventListener('theme-manager-theme-changed', handleThemeManagerThemeChanged)
})

// 테마 변경 감시 (ThemeManagerHeader에서 변경된 경우도 감지)
watch(isDarkMode, (newValue) => {
  $q.dark.set(newValue)
  // 테마 전환 후 색상 변수 다시 로드
  loadThemeColors()
})

// Quasar 다크 모드 변경 감시
watch(
  () => $q.dark.isActive,
  () => {
    isDarkMode.value = $q.dark.isActive
    loadThemeColors()
  },
)

const toggleTheme = (value) => {
  isDarkMode.value = value
  // 테마 전환 시 body 클래스 즉시 업데이트
  document.body.classList.toggle('dark', isDarkMode.value)

  // ThemeManagerHeader에 테마 변경 알림 (동기화)
  const themeValue = value ? 'dark' : 'light'
  window.dispatchEvent(new CustomEvent('theme-manager-theme-changed', { detail: { theme: themeValue } }))

  // 색상 변수 다시 로드
  loadThemeColors()
}

/**
 * 색상 클릭 핸들러 (변수명 복사 + 오른쪽 패널에 전달)
 * @param {Object} color - 색상 객체 {name: string, value: string}
 * @param {Event} event - 클릭 이벤트 객체
 */
function handleColorClick(color, event) {
  // 선택 상태 업데이트
  selectedColor.value = {
    name: color.name,
    value: color.value,
  }

  console.log('[ThemeManagerContent] 색상 클릭:', selectedColor.value)

  // 변수명 복사
  copyVariableName(color.name, event)

  // 최근 색상에 추가
  addRecentColor({
    name: color.name,
    value: color.value,
  })

  // 오른쪽 패널에 색상 전달
  const customEvent = new CustomEvent('theme-color-selected', {
    detail: {
      color: selectedColor.value,
    },
  })
  console.log('[ThemeManagerContent] 이벤트 발행:', customEvent.detail)
  window.dispatchEvent(customEvent)
}

/**
 * 변수명을 클립보드에 복사
 * @param {string} variableName - CSS 변수명 (예: --nexa-primary)
 * @param {Event} event - 클릭 이벤트 객체
 */
async function copyVariableName(variableName, event) {
  let textToCopy = variableName
  const isCtrlClick = event?.ctrlKey || event?.metaKey // Mac에서는 metaKey (Cmd)
  const isAltClick = event?.altKey

  // Strip 체크박스 상태 확인
  let removeDash = false
  try {
    const stored = localStorage.getItem('theme-manager-remove-dash-on-copy')
    removeDash = stored === 'true'
  } catch {
    removeDash = false
  }

  // 키 조합에 따른 단계별 제거
  if (isCtrlClick || isAltClick) {
    // 접두사 '--' 제거 (0단계)
    let processed = variableName.startsWith('--') ? variableName.slice(2) : variableName

    // Strip이 체크되어 있고 Ctrl+클릭이면 1단계까지 제거
    const shouldRemoveLevel1 = isAltClick || (removeDash && isCtrlClick)

    if (shouldRemoveLevel1) {
      // 1단계까지 제거 (--와 첫 번째 - 이전까지 제거)
      // 예: --nexa-primary-color -> primary-color
      const parts = processed.split('-')
      if (parts.length > 1) {
        // 첫 번째 부분(nexa) 제거, 나머지 결합
        processed = parts.slice(1).join('-')
      }
    }
    // Ctrl+클릭 (Strip 체크 안 함): 0단계만 (--만 제거, 이미 처리됨)

    textToCopy = processed
  } else {
    // 일반 클릭: 체크박스 옵션 확인
    if (removeDash && variableName.startsWith('--')) {
      textToCopy = variableName.slice(2)
    }
  }

  // 클릭한 위치 계산
  const clickY = event?.clientY || 100
  const viewportHeight = window.innerHeight

  // 클릭한 위치에 따라 position 결정
  // 화면 상단 1/3 이내면 'top', 하단 1/3 이내면 'bottom', 중간이면 'top'
  let position = 'top'
  if (clickY > (viewportHeight * 2) / 3) {
    position = 'bottom'
  }

  const showNotification = (message, type = 'positive') => {
    // 커스텀 위치로 notify 생성
    $q.notify({
      message,
      type,
      position,
      timeout: 2000,
      icon: 'content_copy',
      iconSize: '16px', // 아이콘 크기 줄이기
      actions: [{ icon: 'close', color: 'white', round: true, handler: () => {} }],
    })

    // notify가 생성된 후 위치 및 스타일 조정
    nextTick(() => {
      const notifyEl = document.querySelector('.q-notification')
      if (notifyEl) {
        if (event) {
          const clickX = event.clientX
          const clickY = event.clientY
          // 클릭 위치 근처에 표시 (왼쪽 정렬)
          notifyEl.style.position = 'fixed'
          notifyEl.style.top = `${Math.min(clickY + 20, viewportHeight - 100)}px`
          notifyEl.style.left = `${Math.max(20, clickX - 150)}px`
          notifyEl.style.transform = 'none'
        }

        // 닫기 버튼 크기 줄이기
        const closeBtn = notifyEl.querySelector('.q-btn')
        if (closeBtn) {
          closeBtn.style.width = '20px'
          closeBtn.style.height = '20px'
          closeBtn.style.minWidth = '20px'
          const closeIcon = closeBtn.querySelector('.q-icon')
          if (closeIcon) {
            closeIcon.style.fontSize = '14px'
          }
        }
      }
    })
  }

  try {
    await navigator.clipboard.writeText(textToCopy)
    showNotification(`${textToCopy}`) // 변수명 복사됨: ${textToCopy}
  } catch {
    // 클립보드 API 실패 시 fallback
    try {
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      showNotification(`${textToCopy}`) // 변수명 복사됨: ${textToCopy}
    } catch {
      showNotification('복사 실패', 'negative')
    }
  }
}
</script>

<style lang="scss" scoped>
.theme-manager-content {
  .settings-section {
    max-width: 100%;
    margin: 0;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .section-subtitle {
        margin: 0;
      }

      .sort-select {
        min-width: 180px;
      }
    }
    padding: 0;
  }

  .theme-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
    margin: 0;
    font-weight: 600;
    color: var(--nexa-text-primary);
    position: relative;
    padding-bottom: 0.5rem;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      border-radius: 2px;
      background-color: var(--nexa-primary);
    }
  }

  .color-preview {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: var(--nexa-panel-bg);
    border: 1px solid var(--nexa-panel-border);
    border-radius: 8px;

    h4 {
      margin-bottom: 0.75rem;
      color: var(--nexa-text-primary);
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.75rem;
    }

    .color-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;

      .color-box {
        width: 60px;
        height: 60px;
        border-radius: 6px;
        border: 2px solid var(--nexa-border-color);
      }

      span {
        font-size: 0.9rem;
        color: var(--nexa-text-secondary);
      }
    }
  }

  //칼라 섹션 스타일
  .color-variables-section {
    //margin-top: 1rem;
    padding: 1rem;
    background-color: var(--nexa-panel-bg);
    border: 1px solid var(--nexa-panel-border);
    border-radius: 8px;

    .section-subtitle {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
      color: var(--nexa-text-primary);
      font-weight: 600;
    }

    .category-section {
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }

      .category-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
        color: var(--nexa-text-primary);
        font-weight: 500;
        padding-bottom: 0.3rem;
        border-bottom: 1px solid var(--nexa-border-color);

        .category-icon {
          color: var(--nexa-primary);
          flex-shrink: 0;
        }

        .category-name {
          font-weight: 600;
          color: var(--nexa-text-primary);
        }

        .category-translation {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--nexa-text-secondary);
          opacity: 0.8;
        }
      }

      .color-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.375rem;
      }

      .color-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.3rem;
        background-color: var(--nexa-item-bg);
        border: 1px solid var(--nexa-item-border);
        border-radius: 6px;
        transition: all 0.2s ease;
        position: relative;

        &.color-item-selected {
          border-color: var(--nexa-primary);
          background-color: var(--nexa-surface-hover);

          .color-box {
            border: 3px solid var(--nexa-primary);
            box-shadow:
              0 0 0 2px var(--nexa-background),
              0 0 8px rgba(0, 123, 255, 0.5);
          }
        }

        &:hover {
          background-color: var(--nexa-item-hover-bg);
          border-color: var(--nexa-item-hover-border);
        }

        .color-box {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          border: 1px solid var(--nexa-border-color);
          flex-shrink: 0;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;

          &:hover {
            transform: scale(1.1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          &:active {
            transform: scale(1.05);
          }
        }

        .color-info {
          flex: 1;
          min-width: 0;

          .color-name {
            font-size: 0.8rem;
            font-weight: 300;
            color: var(--nexa-text-secondary);
            margin-bottom: 0.15rem;
            word-break: break-word;
            letter-spacing: 0.01em;
            line-height: 1;
          }

          .color-value {
            font-size: 0.375rem;
            color: var(--nexa-text-hint);
            font-family: monospace;
            word-break: break-all;
          }
        }
      }
    }
  }
}
</style>
