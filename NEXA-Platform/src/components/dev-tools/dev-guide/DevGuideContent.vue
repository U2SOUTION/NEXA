<!-- DevGuideContent.vue
  개발 가이드 메인 컨텐츠 컴포넌트
  샘플 모음 및 상세 뷰 관리
-->
<template>
  <div class="dev-guide-content">
    <!-- 샘플이 선택되지 않았을 때: 샘플 모음 -->
    <div v-if="!selectedSample" class="sample-collection-view">
      <div class="collection-header">
        <div class="header-top">
          <div class="header-left">
            <h2 class="collection-title">개발 가이드 샘플 모음</h2>
            <p class="collection-description">NEXA 시스템의 디자인 샘플을 탐색하고 참고하세요.</p>
          </div>
          <div class="header-options">
            <div class="display-options-group">
              <q-btn
                v-for="(option, index) in displayOptionButtons"
                :key="option.value"
                :icon="option.icon"
                :label="option.label"
                :class="{
                  'display-option-btn': true,
                  'option-active': cardDisplayOptions.includes(option.value),
                  'first-btn': index === 0,
                  'last-btn': index === displayOptionButtons.length - 1,
                }"
                dense
                @click="toggleDisplayOption(option.value)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 샘플 그리드 -->
      <div v-if="filteredSamples.length > 0" class="sample-grid" ref="sampleGridRef">
        <div v-for="sample in filteredSamples" :key="sample.id" :data-sample-id="sample.id" class="sample-card" @click="handleSampleSelect(sample)">
          <!-- 미리보기 영역 (옵션에 따라 표시) -->
          <div v-if="cardDisplayOptions.includes('preview')" class="sample-card-preview">
            <!-- 뷰포트에 보이는 경우에만 실제 컴포넌트 로드 -->
            <template v-if="isSampleVisible(sample.id)">
              <!-- 에러 상태 -->
              <div v-if="hasPreviewError(sample.id)" class="preview-error">
                <q-icon name="error" size="32px" color="negative" />
                <p class="preview-text">로드 실패</p>
                <p class="preview-error-message">{{ getPreviewErrorMessage(sample.id) }}</p>
              </div>
              <!-- 파싱된 미리보기 컴포넌트 (설명글 포함 모든 내용 표시) -->
              <template v-else-if="getPreviewComponent(sample.id)">
                <div class="card-preview-component">
                  <component :is="getPreviewComponent(sample.id)" />
                </div>
              </template>
              <!-- 로딩 상태 -->
              <div v-else-if="isLoadingPreview(sample.id)" class="preview-loading">
                <q-spinner size="24px" color="primary" />
              </div>
              <!-- 플레이스홀더 -->
              <div v-else class="preview-placeholder">
                <q-icon name="preview" size="32px" color="grey-5" />
                <p class="preview-text">미리보기</p>
              </div>
            </template>
            <!-- 뷰포트에 보이지 않는 경우 스켈레톤 표시 -->
            <div v-else class="preview-skeleton">
              <q-icon name="preview" size="32px" color="grey-5" />
            </div>
          </div>

          <!-- 정보 영역 -->
          <div class="sample-card-info">
            <div v-if="cardDisplayOptions.includes('title')" class="sample-card-header">
              <q-icon :name="sample.icon || 'style'" class="sample-card-icon" />
              <div class="sample-card-title">{{ sample.displayName || sample.name }}</div>
            </div>
            <div class="sample-card-body">
              <div v-if="cardDisplayOptions.includes('category')" class="sample-card-category">{{ sample.category }}</div>
              <div v-if="cardDisplayOptions.includes('description')" class="sample-card-description">{{ sample.description || '설명 없음' }}</div>
              <div v-if="cardDisplayOptions.includes('tags') && sample.tags && sample.tags.length > 0" class="sample-card-tags">
                <q-chip v-for="tag in sample.tags.slice(0, 3)" :key="tag" class="sample-card-tag">
                  {{ tag }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 샘플이 없을 때 -->
      <div v-else class="no-samples q-pa-lg text-center">
        <q-icon name="style" size="64px" color="grey-5" class="q-mb-md" />
        <p class="no-samples-message">검색 결과가 없습니다.</p>
        <p class="no-samples-hint">샘플을 등록하면 여기에 표시됩니다.</p>
      </div>
    </div>

    <!-- 샘플이 선택되었을 때: 샘플 상세 뷰 -->
    <div v-else class="sample-detail-view">
      <div class="detail-header">
        <q-btn flat icon="arrow_back" @click="handleBack" />
        <h2 class="detail-title">{{ selectedSample.displayName || selectedSample.name }}</h2>
      </div>

      <div class="detail-content">
        <!-- 샘플 미리보기 -->
        <div class="detail-section">
          <div class="preview-header">
            <h3 class="section-title">미리보기</h3>
            <div class="preview-header-actions">
              <q-btn :icon="isFavorite ? 'star' : 'star_border'" :color="isFavorite ? 'warning' : 'grey-7'" dense flat round :title="isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'" @click="handleToggleFavorite" />
              <q-btn :icon="previewControlsExpanded ? 'expand_less' : 'expand_more'" :label="previewControlsExpanded ? '컨트롤 숨김' : '컨트롤 보기'" dense flat @click="previewControlsExpanded = !previewControlsExpanded" />
            </div>
          </div>

          <!-- 테스트 컨트롤 패널 -->
          <div v-if="previewControlsExpanded" class="preview-controls">
            <div class="control-group">
              <div class="control-inputs">
                <div class="control-input-item">
                  <label>너비: {{ previewWidth }}px</label>
                  <q-slider v-model="previewWidth" :min="200" :max="1200" :step="50" />
                </div>
                <div class="control-input-item">
                  <label>높이: {{ autoHeight ? '자동' : `${previewHeight}px` }}</label>
                  <div class="height-control-row">
                    <q-slider v-model="previewHeight" :min="100" :max="800" :step="50" :disable="autoHeight" />
                    <q-btn flat dense :icon="autoHeight ? 'height' : 'height_off'" :label="autoHeight ? '자동' : '수동'" :class="{ 'bg-active': autoHeight }" @click="autoHeight = !autoHeight" />
                  </div>
                </div>
              </div>
            </div>

            <div class="control-group">
              <div class="control-inputs">
                <div class="background-controls-row">
                  <q-btn flat dense label="기본값 리셋" icon="refresh" :class="{ 'bg-active': false }" @click="resetPreviewSize" />
                  <q-btn flat dense label="다크" icon="dark_mode" :class="{ 'bg-active': previewBackgroundMode === 'dark' }" @click="previewBackgroundMode = 'dark'" />
                  <q-btn flat dense label="라이트" icon="light_mode" :class="{ 'bg-active': previewBackgroundMode === 'light' }" @click="previewBackgroundMode = 'light'" />
                  <q-btn flat dense label="커스텀" icon="colorize" :class="{ 'bg-active': previewBackgroundMode === 'custom' }" :style="{ backgroundColor: previewBackgroundMode === 'custom' ? previewCustomColor : 'transparent' }" @click="previewBackgroundMode = 'custom'">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-color v-model="previewCustomColor" />
                    </q-popup-proxy>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>

          <!-- 높이 경고 메시지 -->
          <div v-if="heightWarning" class="height-warning">
            <q-icon name="warning" size="16px" />
            <span>{{ heightWarning }}</span>
          </div>

          <!-- 샘플 미리보기 (래퍼 없이 직접 렌더링) -->
          <div ref="previewContainerRef" :style="previewContainerStyle" class="sample-preview-direct">
            <!-- 샘플 컴포넌트 실제 렌더링 -->
            <component v-if="sampleComponent && !isLoading && !loadError" :is="sampleComponent" />
            <!-- 로딩 상태 -->
            <div v-else-if="isLoading" class="preview-loading">
              <q-spinner color="primary" size="48px" />
              <p class="preview-text">샘플 로딩 중...</p>
            </div>
            <!-- 에러 상태 -->
            <div v-else-if="loadError" class="preview-error">
              <q-icon name="error" size="48px" color="negative" />
              <p class="preview-text">컴포넌트를 로드할 수 없습니다</p>
              <p class="preview-note">{{ loadError }}</p>
            </div>
            <!-- 플레이스홀더 (초기 상태) -->
            <div v-else class="preview-placeholder">
              <q-icon name="image" size="48px" color="grey-5" />
              <p class="preview-text">미리보기 영역</p>
              <p class="preview-note">컴포넌트: {{ selectedSample.componentPath || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- 사용 예제 & Import 정보 -->
        <!-- TODO: 특정 샘플에서 필요할 수 있으므로 주석 처리만 함 -->
        <!--
        <div v-if="selectedSample?.componentPath" class="detail-section">
          <div class="section-header">
            <h3 class="section-title">사용 예제</h3>
            <q-btn flat dense icon="content_copy" size="sm" label="전체 복사" @click="handleCopyUsageExample" />
          </div>

          <div class="info-section">
            <div class="usage-example-code">
              <pre><code>{{ usageExampleCode }}</code></pre>
            </div>
          </div>
        </div>
        -->

        <!-- 디자인 결정 요소 -->
        <div v-if="selectedSample.designDecisions" class="detail-section">
          <h3 class="section-title">디자인 결정 요소</h3>
          <div class="info-section">
            <div class="design-decisions">
              <div v-for="(value, key) in selectedSample.designDecisions" :key="key" class="decision-item">
                <div class="decision-key">{{ key }}:</div>
                <div class="decision-value">{{ value }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 코드 에디터 -->
        <div class="detail-section">
          <h3 class="section-title">원본 코드 편집</h3>
          <div class="info-section code-editor-section">
            <CodeEditor v-if="fileContent && selectedSample?.componentPath" :file-path="selectedSample.componentPath" :file-content="fileContent" @save="handleFileSave" @reload="handleFileReload" />
            <div v-else-if="isLoadingFile" class="file-loading">
              <q-spinner color="primary" size="32px" />
              <p class="file-loading-text">파일 로딩 중...</p>
            </div>
            <div v-else-if="fileLoadError" class="file-error">
              <q-icon name="error" size="32px" color="negative" />
              <p class="file-error-text">{{ fileLoadError }}</p>
            </div>
          </div>
        </div>

        <!-- AI 참조 키워드 -->
        <div class="detail-section">
          <h3 class="section-title">AI 참조 키워드</h3>
          <div class="info-section">
            <div class="ai-reference">
              <q-input :model-value="`@${selectedSample.name}`" readonly outlined dense>
                <template v-slot:append>
                  <q-btn flat dense icon="content_copy" @click="handleCopyKeyword" />
                </template>
              </q-input>
              <p class="ai-reference-note">AI에게 "{{ `@${selectedSample.name}` }} 샘플 참고"라고 말하면 됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, shallowRef, computed, nextTick, markRaw, h } from 'vue'
import { useQuasar } from 'quasar'
import { useDevGuide } from 'src/composables/dev-tools/useDevGuide'
import { useDevGuideStore } from 'src/stores/devGuideStore'
import { copyTextToClipboard } from 'src/utils/clipboard'
import CodeEditor from './CodeEditor.vue'
// import { generateUsageExample } from 'src/utils/dev-guide/usage-example-generator.js'
import { analyzeSampleDependencies } from 'src/utils/dev-guide/dependency-analyzer.js'
import { removeTitles, parseComponentForPreview } from 'src/utils/dev-guide/previewParser.js'

const $q = useQuasar()
const { selectedSample, filteredSamples, handleSampleSelect, favoriteSamples, toggleFavorite } = useDevGuide()

// Store 인스턴스
const store = useDevGuideStore()

// CACHE_CONFIG는 일반 객체이므로 직접 접근
const CACHE_CONFIG = store.CACHE_CONFIG

// 샘플 그리드 참조
const sampleGridRef = ref(null)

// 카드 표시 옵션
const cardDisplayOptions = ref(['title', 'category', 'description', 'tags'])

// Intersection Observer 인스턴스
let intersectionObserver = null

// 로컬 스토리지에서 카드 표시 옵션 복원
function loadCardDisplayOptions() {
  try {
    const saved = localStorage.getItem('dev-guide-card-display-options')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        cardDisplayOptions.value = parsed
      }
    }
  } catch (error) {
    console.error('[DevGuideContent] 카드 표시 옵션 복원 실패:', error)
  }
}

// 표시 옵션 버튼 설정
const displayOptionButtons = computed(() => [
  { label: '미리보기', value: 'preview', icon: 'preview' },
  { label: '제목', value: 'title', icon: 'text_fields' },
  { label: '카테고리', value: 'category', icon: 'category' },
  { label: '설명', value: 'description', icon: 'description' },
  { label: '태그', value: 'tags', icon: 'label' },
])

// 표시 옵션 토글 함수
function toggleDisplayOption(optionValue) {
  const index = cardDisplayOptions.value.indexOf(optionValue)
  if (index > -1) {
    // 이미 활성화되어 있으면 제거
    cardDisplayOptions.value.splice(index, 1)
  } else {
    // 비활성화되어 있으면 추가
    cardDisplayOptions.value.push(optionValue)
  }

  // localStorage에 저장
  try {
    localStorage.setItem('dev-guide-card-display-options', JSON.stringify(cardDisplayOptions.value))
  } catch (error) {
    console.error('[DevGuideContent] 카드 표시 옵션 저장 실패:', error)
  }
}

// 샘플 컴포넌트 로딩 상태
const sampleComponent = shallowRef(null)
const isLoading = ref(false)
const loadError = ref(null)

// 파일 내용 로딩 상태
const fileContent = ref('')
const isLoadingFile = ref(false)
const fileLoadError = ref(null)

// 의존성 분석 결과
const dependencies = ref(null)

// 미리보기 테스트 컨트롤
const previewControlsExpanded = ref(true)
const previewWidth = ref(800)
const previewHeight = ref(400)
const previewBackgroundMode = ref('dark')
const previewCustomColor = ref('#1e1e1e')
const autoHeight = ref(true) // 자동 높이 조정 활성화
const previewContainerRef = ref(null) // 미리보기 컨테이너 DOM 참조
const heightWarning = ref(null) // 높이 조정 경고 메시지
let resizeObserver = null // ResizeObserver 인스턴스

// 커스텀 색상 변경 감지
watch(previewCustomColor, () => {
  // 커스텀 색상이 변경되면 커스텀 모드로 전환
  if (previewBackgroundMode.value !== 'custom') {
    previewBackgroundMode.value = 'custom'
  }
})

// 미리보기 컨테이너 스타일 (크기 + 배경색)
const previewContainerStyle = computed(() => {
  let backgroundColor = 'transparent'

  switch (previewBackgroundMode.value) {
    case 'dark':
      backgroundColor = 'var(--nexa-background)'
      break
    case 'light':
      backgroundColor = '#ffffff'
      break
    case 'custom':
      backgroundColor = previewCustomColor.value
      break
    case 'transparent':
    default:
      backgroundColor = 'transparent'
      break
  }

  const baseStyle = {
    width: '100%',
    position: 'relative',
    backgroundColor,
    paddingTop: '0',
    paddingRight: '16px',
    paddingLeft: '16px',
    paddingBottom: '0',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  }

  if (autoHeight.value) {
    // 자동 높이 모드: height와 maxHeight 제한 없음
    // 내부 컨텐츠의 실제 높이에 맞춰 자동 조정
    return {
      ...baseStyle,
      height: 'auto',
      minHeight: '0',
      maxHeight: 'none',
      overflowY: 'visible',
      overflow: 'visible', // 모든 overflow 제거
      display: 'block', // 블록 요소로 명시
      paddingBottom: '16px', // 하단 여유 공간 확보 (내용이 잘리지 않도록)
      transition: 'width 0.9s ease-out, background-color 0.3s ease-out',
    }
  } else {
    // 수동 높이 모드: 고정 높이 + 스크롤
    return {
      ...baseStyle,
      height: `${previewHeight.value}px`,
      maxHeight: `${previewHeight.value}px`,
      overflowY: 'auto',
      transition: 'height 0.9s ease-out, max-height 0.9s ease-out, width 0.9s ease-out, background-color 0.3s ease-out',
    }
  }
})

// 미리보기 크기 및 배경 리셋
function resetPreviewSize() {
  previewWidth.value = 800
  previewHeight.value = 400
  previewBackgroundMode.value = 'transparent'
  previewCustomColor.value = '#1e1e1e'
  autoHeight.value = true
  heightWarning.value = null
}

// 높이 자동 조정 함수
async function adjustHeightAutomatically() {
  if (!previewContainerRef.value || !sampleComponent.value) return

  // nextTick을 사용하여 DOM 업데이트 후 높이 측정
  await nextTick()

  // 추가 지연을 두어 렌더링 완료 보장 (이미지나 폰트 로딩 대기)
  setTimeout(() => {
    if (previewContainerRef.value && sampleComponent.value) {
      const container = previewContainerRef.value

      // 실제 내부 컨텐츠의 높이 측정 (헤더 포함 전체)
      // scrollHeight는 padding을 포함한 전체 스크롤 가능한 높이
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight

      // 내부 첫 번째 자식 요소의 실제 높이도 측정 (이중 확인)
      const firstChild = container.firstElementChild
      let contentHeight = scrollHeight

      if (firstChild) {
        // 첫 번째 자식의 실제 높이 측정
        // offsetHeight는 padding + border + content 포함
        const childHeight = firstChild.offsetHeight || firstChild.scrollHeight
        // 컨테이너의 border와 padding 계산
        const containerBorder = 8 // border: 4px solid = 상하 4px씩
        const containerPadding = autoHeight.value ? 16 : 0 // 자동 모드일 때 padding-bottom: 16px
        contentHeight = Math.max(scrollHeight, childHeight + containerBorder + containerPadding)
      }

      // 자동 높이 모드인 경우 경고만 표시
      if (autoHeight.value) {
        // 자동 높이 모드에서는 경고 없음 (CSS가 자동으로 처리)
        heightWarning.value = null
      } else {
        // 수동 높이 모드에서 오버플로우 발생 시 경고
        if (scrollHeight > clientHeight || contentHeight > clientHeight) {
          const actualHeight = Math.max(scrollHeight, contentHeight)
          heightWarning.value = `⚠️ 높이가 부족합니다. 실제 높이: ${actualHeight}px, 현재 높이: ${clientHeight}px`
        } else {
          heightWarning.value = null
        }
      }
    }
  }, 500) // 렌더링 완료를 위해 지연 시간 증가
}

// ResizeObserver로 높이 변화 추적
function setupResizeObserver() {
  if (!previewContainerRef.value || !window.ResizeObserver) return

  // 기존 observer 제거
  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  resizeObserver = new ResizeObserver((entries) => {
    if (autoHeight.value && sampleComponent.value) {
      // 자동 높이 모드에서 크기 변화 감지 시 오버플로우 확인
      for (const entry of entries) {
        const { height, scrollHeight } = entry.target

        if (scrollHeight > height) {
          // 오버플로우 발생 (이론적으로는 발생하지 않아야 함)
          console.warn('[ResizeObserver] 오버플로우 감지:', { height, scrollHeight })
        }
      }
    }
  })

  resizeObserver.observe(previewContainerRef.value)
}

function cleanupResizeObserver() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

// 수동 높이 조정 감지
watch(previewHeight, () => {
  if (autoHeight.value) {
    autoHeight.value = false
    heightWarning.value = '⚠️ 수동 높이 조정 모드입니다. 오버플로우가 발생할 수 있습니다.'
    // 수동 모드로 전환 후 높이 검증
    setTimeout(() => {
      adjustHeightAutomatically()
    }, 100)
  } else {
    // 수동 조정 중에도 경고 업데이트
    adjustHeightAutomatically()
  }
})

// 자동 높이 모드 토글 감지
watch(autoHeight, (newValue) => {
  if (newValue) {
    // 자동 모드로 전환 시 경고 제거 및 높이 재조정
    heightWarning.value = null
    adjustHeightAutomatically()
  }
})

// 사용 예제 코드 생성
// TODO: 특정 샘플에서 필요할 수 있으므로 주석 처리만 함
/*
const usageExampleCode = computed(() => {
  if (!selectedSample.value?.componentPath) return ''

  // componentPath에서 파일명 추출
  const path = selectedSample.value.componentPath
  const parts = path.split('/')
  const fileName = parts[parts.length - 1] || ''

  // 파일명에서 확장자 제거하여 컴포넌트명 추출
  const componentName = fileName.replace(/\.vue$/, '')
  if (!componentName) return ''

  // import 경로 생성
  const importPath = path.startsWith('src/') ? path : `src/${path}`

  // displayName 추출
  const displayName = selectedSample.value.displayName || selectedSample.value.name || componentName

  // 외부 유틸리티 함수 사용 (Vue 컴파일러 오류 방지)
  return generateUsageExample(componentName, importPath, displayName)
})
*/

// Vite의 import.meta.glob을 사용하여 모든 샘플 컴포넌트 미리 등록
const guideModules = import.meta.glob('/src/guides/**/*.vue', { eager: false })

// ============================================
// 미리보기 관련 함수 (Phase 1: 기본 미리보기)
// ============================================

/**
 * 샘플 컴포넌트를 미리보기용으로 로드
 * @param {Object} sample - 샘플 객체
 * @returns {Promise<Object|null>} - 로드된 컴포넌트 또는 null
 */
async function loadPreviewComponent(sample) {
  if (!sample?.componentPath) {
    return null
  }

  const sampleId = sample.id

  // 이미 로드된 경우 캐시에서 반환
  if (store.hasLoadedPreview(sampleId)) {
    return store.getLoadedPreview(sampleId)
  }

  // 이미 로딩 중인 경우
  if (store.isLoadingPreview(sampleId)) {
    return null
  }

  // 로딩 시작
  store.addLoadingPreview(sampleId)

  try {
    // componentPath에서 전체 경로 구성
    let fullPath = sample.componentPath

    // src/ 접두사가 없으면 추가
    if (!fullPath.startsWith('src/')) {
      fullPath = `src/${fullPath}`
    }

    // /src/로 시작하도록 정규화
    if (!fullPath.startsWith('/src/')) {
      fullPath = `/${fullPath}`
    }

    // import.meta.glob으로 등록된 모듈 찾기
    let moduleLoader = guideModules[fullPath]

    // 정확한 매칭이 실패하면 대체 경로 시도
    if (!moduleLoader) {
      const availableKeys = Object.keys(guideModules)
      const alternativeKey = availableKeys.find((key) => {
        const keyWithoutPrefix = key.replace('/src/', '')
        return keyWithoutPrefix === sample.componentPath || key.endsWith(sample.componentPath)
      })

      if (alternativeKey) {
        moduleLoader = guideModules[alternativeKey]
      }
    }

    if (!moduleLoader) {
      throw new Error(`컴포넌트를 찾을 수 없습니다: ${fullPath}`)
    }

    // 모듈 로드
    const module = await moduleLoader()

    // 모듈에서 default export 또는 named export 가져오기
    const component = module.default || module

    if (!component) {
      throw new Error('컴포넌트를 찾을 수 없습니다 (default export 없음)')
    }

    // 컴포넌트를 markRaw로 표시하여 반응형으로 만들지 않음 (성능 최적화)
    const rawComponent = markRaw(component)

    // 캐시에 저장 (Store 액션 사용)
    store.addLoadedPreview(sampleId, rawComponent)
    store.clearPreviewError(sampleId) // 에러 제거

    // 캐시 크기 확인 및 정리
    store.cleanupOldCache()

    return rawComponent
  } catch (error) {
    console.error(`[DevGuideContent] 미리보기 로드 실패 (${sampleId}):`, error)
    store.setPreviewError(sampleId, {
      message: error.message || '컴포넌트를 로드할 수 없습니다',
      timestamp: Date.now(),
    })
    return null
  } finally {
    store.removeLoadingPreview(sampleId)
  }
}

/**
 * 미리보기용 래퍼 컴포넌트 생성
 * 여러 루트 노드를 가진 컴포넌트를 단일 루트로 감싸기
 * @param {Object} component - 원본 컴포넌트
 * @returns {Object} - 래핑된 컴포넌트
 */
function createPreviewWrapper(component, sampleId) {
  return {
    name: 'PreviewWrapper',
    setup() {
      const containerRef = ref(null)

      onMounted(() => {
        // DOM 마운트 후 헤더 제거 및 파싱
        nextTick(() => {
          if (containerRef.value) {
            // 파싱 수행
            const parseResult = parseComponentForPreview(containerRef.value)

            // 파싱 정보 저장
            if (sampleId) {
              store.setPreviewInfo(sampleId, parseResult)
            }

            // 타이틀 제거 (파싱 함수 내부에서 이미 수행되지만 명시적으로도 수행)
            removeTitles(containerRef.value)
          }
        })
      })

      return () => {
        return h('div', { ref: containerRef, class: 'preview-component-wrapper' }, [h(component)])
      }
    },
  }
}

/**
 * 미리보기 컴포넌트 가져오기 (래핑된 버전)
 * @param {string} sampleId - 샘플 ID
 * @returns {Object|null} - 래핑된 컴포넌트 또는 null
 */
function getPreviewComponent(sampleId) {
  const component = store.getLoadedPreview(sampleId)
  if (!component) {
    // 디버깅: 컴포넌트가 로드되지 않은 경우 자동 로드 시도
    if (import.meta.env.DEV) {
      const sample = filteredSamples.value.find((s) => s.id === sampleId)
      if (sample && !store.isLoadingPreview(sampleId)) {
        // 로딩 중이 아닌데도 컴포넌트가 없으면 로드 시도
        loadPreviewComponent(sample)
      }
    }
    return null
  }

  // 접근 시간 업데이트 (LRU)
  store.updateCacheAccessTime(sampleId)

  // 래퍼가 이미 적용되었는지 확인 (name이 PreviewWrapper인 경우)
  if (component.name === 'PreviewWrapper') {
    return component
  }

  // 래퍼 생성 및 캐시 업데이트 (sampleId 전달하여 파싱 정보 저장)
  const wrappedComponent = createPreviewWrapper(component, sampleId)
  const rawWrappedComponent = markRaw(wrappedComponent)
  store.addLoadedPreview(sampleId, rawWrappedComponent)

  return rawWrappedComponent
}

/**
 * 미리보기 로딩 중인지 확인
 * @param {string} sampleId - 샘플 ID
 * @returns {boolean} - 로딩 중이면 true
 */
function isLoadingPreview(sampleId) {
  return store.isLoadingPreview(sampleId)
}

/**
 * 미리보기 에러가 있는지 확인
 * @param {string} sampleId - 샘플 ID
 * @returns {boolean} - 에러가 있으면 true
 */
function hasPreviewError(sampleId) {
  return store.hasPreviewError(sampleId)
}

/**
 * 미리보기 에러 메시지 가져오기
 * @param {string} sampleId - 샘플 ID
 * @returns {string} - 에러 메시지
 */
function getPreviewErrorMessage(sampleId) {
  const error = store.getPreviewError(sampleId)
  if (!error) return '알 수 없는 오류'

  // 에러 객체 또는 문자열 처리
  if (typeof error === 'string') {
    return error
  }
  if (error.message) {
    return error.message
  }
  return '컴포넌트를 로드할 수 없습니다'
}

/**
 * 샘플이 보이는지 확인 (템플릿용)
 * @param {string} sampleId - 샘플 ID
 * @returns {boolean} 보이는지 여부
 */
function isSampleVisible(sampleId) {
  // Store의 헬퍼 함수 사용
  return store.isVisibleSample(sampleId)
}

// 샘플 컴포넌트 로드 함수
async function loadSampleComponent() {
  if (!selectedSample.value?.componentPath) {
    sampleComponent.value = null
    loadError.value = null
    return
  }

  isLoading.value = true
  loadError.value = null
  sampleComponent.value = null

  try {
    // componentPath에서 전체 경로 구성
    // 예: "guides/styles/charts/bar/NexaChartBar.vue" -> "/src/guides/styles/charts/bar/NexaChartBar.vue"
    let fullPath = selectedSample.value.componentPath

    // src/ 접두사가 없으면 추가
    if (!fullPath.startsWith('src/')) {
      fullPath = `src/${fullPath}`
    }

    // /src/로 시작하도록 정규화
    if (!fullPath.startsWith('/src/')) {
      fullPath = `/${fullPath}`
    }

    // import.meta.glob으로 등록된 모듈 찾기
    const moduleLoader = guideModules[fullPath]

    if (!moduleLoader) {
      throw new Error(`컴포넌트를 찾을 수 없습니다: ${fullPath}`)
    }

    // 모듈 로드
    const module = await moduleLoader()

    // 모듈에서 default export 또는 named export 가져오기
    sampleComponent.value = module.default || module
  } catch (error) {
    console.error('[DevGuideContent] 컴포넌트 로드 실패:', error)
    loadError.value = error.message || '컴포넌트를 로드할 수 없습니다. 파일 경로를 확인해주세요.'
    sampleComponent.value = null
  } finally {
    isLoading.value = false
    // 샘플 로딩 완료 후 자동 높이 조정
    if (autoHeight.value) {
      adjustHeightAutomatically()
    }
  }
}

// 샘플 컴포넌트 변경 감지하여 자동 높이 조정
watch(
  sampleComponent,
  async () => {
    if (autoHeight.value && sampleComponent.value) {
      await adjustHeightAutomatically()
      // ResizeObserver 재설정
      await nextTick()
      setupResizeObserver()
    } else {
      cleanupResizeObserver()
    }
  },
  { flush: 'post' },
)

// selectedSample 변경 시 자동 높이 모드로 리셋
watch(
  () => selectedSample.value?.id,
  () => {
    if (selectedSample.value) {
      autoHeight.value = true
      heightWarning.value = null
    }
  },
)

// ============================================
// 미리보기 자동 로드 (Phase 1)
// ============================================

// 미리보기 옵션이 켜질 때 샘플 로드
const showPreview = computed(() => cardDisplayOptions.value.includes('preview'))

// defineExpose 제거됨 - 이제 Store를 통해 상태 공유

watch(
  showPreview,
  (newValue) => {
    if (newValue && filteredSamples.value.length > 0) {
      // DOM이 준비될 때까지 대기 후 로드
      nextTick(() => {
        loadVisiblePreviews()
      })
    }
  },
  { immediate: true },
) // 초기 로드 보장

// 필터링된 샘플 변경 시 Intersection Observer 재설정
watch(
  () => filteredSamples.value,
  async () => {
    if (!showPreview.value) {
      return
    }

    // 뷰포트 목록 초기화 (Store에서 직접 접근 필요)
    // visibleSamples는 Set이므로 직접 clear 불가, 각 항목을 제거해야 함
    // 하지만 필터 변경 시에는 자동으로 정리되므로 생략

    // Observer 재설정
    await nextTick()
    setupIntersectionObserver()

    // 초기 로드: 처음 12개는 즉시 로드
    const initialSamples = filteredSamples.value.slice(0, 12)
    initialSamples
      .filter((sample) => sample?.componentPath)
      .forEach((sample) => {
        store.addVisibleSample(sample.id)
        loadPreviewComponent(sample)
      })

    // 캐시 정리 (필터 변경 후)
    store.cleanupOldCache()
  },
  { immediate: true },
)

/**
 * Intersection Observer 설정
 * 뷰포트에 보이는 카드만 실제 컴포넌트 로드
 */
function setupIntersectionObserver() {
  if (!sampleGridRef.value || !showPreview.value) {
    return
  }

  // 기존 Observer 정리
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }

  // Intersection Observer 옵션
  const options = {
    root: null, // 뷰포트 기준
    rootMargin: '100px', // 뷰포트 밖 100px 전에 미리 로드
    threshold: 0.1, // 10% 이상 보이면 트리거
  }

  // Observer 콜백
  const callback = (entries) => {
    entries.forEach((entry) => {
      const sampleId = entry.target.getAttribute('data-sample-id')
      if (!sampleId) return

      if (entry.isIntersecting) {
        // 뷰포트에 보이면 표시 목록에 추가
        store.addVisibleSample(sampleId)

        // 컴포넌트 로드
        const sample = filteredSamples.value.find((s) => s.id === sampleId)
        if (sample && sample.componentPath && !store.hasLoadedPreview(sampleId)) {
          loadPreviewComponent(sample)
        }
      } else {
        // 뷰포트에서 벗어나면 제거 (정확한 카운트를 위해)
        store.removeVisibleSample(sampleId)
      }
    })
  }

  // Observer 생성
  intersectionObserver = new IntersectionObserver(callback, options)

  // 모든 카드 관찰 시작
  nextTick(() => {
    if (sampleGridRef.value) {
      const cards = sampleGridRef.value.querySelectorAll('.sample-card[data-sample-id]')
      cards.forEach((card) => {
        intersectionObserver.observe(card)
      })
    }
  })
}

/**
 * Intersection Observer 정리
 */
function cleanupIntersectionObserver() {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }
}

/**
 * 오래된 캐시 정리 (LRU 방식)
 * visibleSamples에 없는 컴포넌트 중 오래된 것부터 제거
 */
// cleanupOldCache 함수 제거됨 - Store의 cleanupOldCache 액션 사용

/**
 * 주기적 캐시 정리 (인터벌)
 */
let cacheCleanupInterval = null

function startCacheCleanupInterval() {
  if (cacheCleanupInterval) {
    return
  }

  cacheCleanupInterval = setInterval(() => {
    store.cleanupOldCache()
  }, CACHE_CONFIG.CLEANUP_INTERVAL)
}

function stopCacheCleanupInterval() {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval)
    cacheCleanupInterval = null
  }
}

// clearAllCache 함수 제거됨 - Store의 clearAllCache 액션 사용
// 필요시 store.clearAllCache() 호출

/**
 * 뷰포트에 보이는 샘플의 미리보기 로드 (초기 로드용)
 */
function loadVisiblePreviews() {
  if (!showPreview.value) {
    return
  }

  // Intersection Observer 설정
  setupIntersectionObserver()

  // 초기 로드: 처음 12개는 즉시 로드 (빠른 초기 렌더링)
  const initialSamples = filteredSamples.value.slice(0, 12)
  initialSamples
    .filter((sample) => sample?.componentPath)
    .forEach((sample) => {
      store.addVisibleSample(sample.id)
      loadPreviewComponent(sample)
    })
}

// 파일 내용 로드 함수
async function loadFileContent() {
  if (!selectedSample.value?.componentPath) {
    fileContent.value = ''
    fileLoadError.value = null
    dependencies.value = null
    return
  }

  isLoadingFile.value = true
  fileLoadError.value = null

  try {
    const response = await fetch(`http://localhost:3000/api/dev/files/${selectedSample.value.componentPath}/content`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.success && data.content) {
      fileContent.value = data.content
      // 의존성 분석
      dependencies.value = analyzeSampleDependencies(data.content, selectedSample.value.componentPath)
    } else {
      throw new Error('파일 내용을 가져올 수 없습니다.')
    }
  } catch (error) {
    console.error('[DevGuideContent] 파일 로드 실패:', error)
    fileLoadError.value = error.message || '파일을 로드할 수 없습니다.'
    fileContent.value = ''
    dependencies.value = null
  } finally {
    isLoadingFile.value = false
  }
}

// 파일 저장 핸들러
function handleFileSave(newContent) {
  // 파일이 저장되면 컴포넌트도 다시 로드하고 의존성도 다시 분석
  fileContent.value = newContent
  if (selectedSample.value?.componentPath) {
    dependencies.value = analyzeSampleDependencies(newContent, selectedSample.value.componentPath)
  }
  loadSampleComponent()
}

// 파일 새로고침 핸들러
function handleFileReload() {
  loadFileContent()
}

// selectedSample 변경 감시
watch(
  () => selectedSample.value?.componentPath,
  (newPath, oldPath) => {
    if (newPath && newPath !== oldPath) {
      loadSampleComponent()
      loadFileContent()
    } else if (!newPath) {
      sampleComponent.value = null
      loadError.value = null
      isLoading.value = false
      fileContent.value = ''
      fileLoadError.value = null
      isLoadingFile.value = false
    }
  },
  { immediate: true },
)

// 뒤로 가기 핸들러
function handleBack() {
  selectedSample.value = null
  window.dispatchEvent(new CustomEvent('dev-guide-sample-deselected'))
}

// 사용 예제 코드 복사 핸들러
// TODO: 특정 샘플에서 필요할 수 있으므로 주석 처리만 함
/*
async function handleCopyUsageExample() {
  if (usageExampleCode.value) {
    await copyTextToClipboard(usageExampleCode.value)
    $q.notify({
      type: 'positive',
      message: '사용 예제 코드가 복사되었습니다.',
      position: 'top',
      timeout: 1000,
    })
  }
}
*/

// 즐겨찾기 상태 확인
const isFavorite = computed(() => {
  if (!selectedSample.value) return false
  return favoriteSamples.value.some((s) => s.id === selectedSample.value.id)
})

// 즐겨찾기 토글 핸들러
function handleToggleFavorite() {
  if (!selectedSample.value) return
  const wasFavorite = isFavorite.value
  toggleFavorite(selectedSample.value)
  $q.notify({
    type: 'positive',
    message: wasFavorite ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.',
    position: 'top',
    timeout: 1000,
  })
}

// 키워드 복사 핸들러
async function handleCopyKeyword() {
  if (selectedSample.value?.name) {
    await copyTextToClipboard(`@${selectedSample.value.name}`)
    $q.notify({
      type: 'positive',
      message: 'AI 참조 키워드가 복사되었습니다.',
      position: 'top',
      timeout: 1000,
    })
  }
}

// 샘플 선택 이벤트 리스너 (하위 호환성 유지)
function handleSampleSelected() {
  // selectedSample은 Store에서 관리되므로 자동으로 업데이트됨
  // watch가 자동으로 컴포넌트를 로드함
}

// 전역 이벤트 핸들러 제거됨 - 이제 Store를 통해 상태 공유

onMounted(() => {
  // 로컬 스토리지에서 카드 표시 옵션 복원
  loadCardDisplayOptions()

  // 하위 호환성을 위해 샘플 선택 이벤트 리스너 유지
  window.addEventListener('dev-guide-sample-selected', handleSampleSelected)

  // 초기 로드
  if (selectedSample.value?.componentPath) {
    loadSampleComponent()
  }
  // ResizeObserver 설정 (DOM이 준비된 후)
  nextTick(() => {
    if (previewContainerRef.value && sampleComponent.value) {
      setupResizeObserver()
    }
  })

  // 미리보기 옵션이 켜져있으면 초기 로드 (watch와 중복되지만 보장)
  if (showPreview.value && filteredSamples.value.length > 0) {
    nextTick(() => {
      // DOM이 완전히 준비될 때까지 추가 대기
      setTimeout(() => {
        loadVisiblePreviews()
      }, 100)
    })
  }

  // 주기적 캐시 정리 시작
  startCacheCleanupInterval()
})

// 캐시 상태 변경 watch 제거됨 - Store의 자동 반응성으로 처리

onBeforeUnmount(() => {
  window.removeEventListener('dev-guide-sample-selected', handleSampleSelected)
  cleanupResizeObserver()
  cleanupIntersectionObserver()
  stopCacheCleanupInterval()

  // 최종 캐시 정리 (모든 캐시 제거) - Store 액션 사용
  store.clearAllCache()
})

// previewContainerRef 변경 감지하여 ResizeObserver 설정
watch(previewContainerRef, (newRef) => {
  if (newRef && sampleComponent.value && autoHeight.value) {
    nextTick(() => {
      setupResizeObserver()
    })
  } else {
    cleanupResizeObserver()
  }
})
</script>

<style lang="scss" scoped>
.dev-guide-content {
  height: 100%;
  padding: 0 24px;

  .sample-collection-view {
    .collection-header {
      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 16px;
        margin-bottom: 6px;

        .header-left {
          flex: 1;
        }

        .header-options {
          flex-shrink: 0;

          .display-options-group {
            display: flex;
            align-items: center;
            border: 1px solid var(--nexa-border-color);
            border-radius: 4px;
            overflow: hidden;
            background-color: var(--nexa-surface);
          }

          .display-option-btn {
            font-size: 0.75rem;
            padding: 4px 10px;
            min-height: 28px;
            transition: all 0.2s ease;
            background-color: transparent;
            color: var(--nexa-text-secondary);
            border: none;
            border-radius: 0;
            border-right: 1px solid var(--nexa-border-color);

            &:last-child {
              border-right: none;
            }

            &:hover {
              background-color: var(--nexa-surface-hover);
            }

            &.option-active {
              background-color: var(--nexa-button-primary-bg);
              color: var(--nexa-button-primary-text);
            }

            &.option-disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            &.first-btn {
              border-top-left-radius: 4px;
              border-bottom-left-radius: 4px;
            }

            &.last-btn {
              border-top-right-radius: 4px;
              border-bottom-right-radius: 4px;
            }
          }
        }
      }

      .collection-title {
        color: var(--nexa-text-primary);
        font-size: 2rem;
        font-weight: 900;
        margin-bottom: 4px;
      }

      .collection-description {
        color: var(--nexa-text-secondary);
        font-size: 1rem;
        margin: 0;
      }
    }

    .sample-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 6px;
    }

    .sample-card {
      background-color: var(--nexa-surface);
      border: 1px solid var(--nexa-border-color);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;

      &:hover {
        background-color: var(--nexa-surface-hover);
        border-color: var(--nexa-border-hover);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .sample-card-preview {
        width: 100%;
        height: 180px;
        background-color: var(--nexa-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid var(--nexa-border-color);
        overflow: hidden;
        position: relative;

        .card-preview-component {
          width: 100%;
          height: 100%;
          overflow: hidden;
          padding: 8px;
          box-sizing: border-box;

          // 래퍼 컴포넌트 스타일
          :deep(.preview-component-wrapper) {
            width: 100%;
            min-height: 100%;
            display: block;
            position: relative;
          }

          // 컴포넌트 내부 요소 스타일 보정
          :deep(.sample-header) {
            margin-bottom: 16px;
          }

          :deep(.sample-container) {
            width: 100%;
            min-height: 100px; // 최소 높이 보장
          }

          // Quasar 컴포넌트 스타일 보정
          :deep(.q-card) {
            min-height: 60px; // 카드 최소 높이
          }
        }

        .preview-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .preview-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--nexa-text-secondary);

          .preview-text {
            font-size: 0.75rem;
            margin: 0;
          }
        }

        .preview-skeleton {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: var(--nexa-background);
          opacity: 0.5;
        }

        .preview-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 100%;
          padding: 16px;
          background-color: var(--nexa-background);
          color: var(--nexa-text-secondary);

          .preview-text {
            font-size: 0.875rem;
            font-weight: 500;
            margin: 0;
            color: var(--nexa-error);
          }

          .preview-error-message {
            font-size: 0.75rem;
            margin: 0;
            text-align: center;
            color: var(--nexa-text-secondary);
            word-break: break-word;
            max-width: 100%;
          }
        }

        .preview-description-only {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 100%;
          color: var(--nexa-text-secondary);

          .preview-text {
            font-size: 0.75rem;
            margin: 0;
            text-align: center;
          }
        }
      }

      .sample-card-info {
        padding: 12px 16px;
      }

      .sample-card-header {
        display: flex;
        align-items: center;

        .sample-card-icon {
          margin-right: 8px;
          color: var(--nexa-text-secondary);
        }

        .sample-card-title {
          color: var(--nexa-text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }
      }

      .sample-card-body {
        .sample-card-category {
          color: var(--nexa-text-secondary);
          font-size: 0.875rem;
        }

        .sample-card-description {
          color: var(--nexa-text-secondary);
          font-size: 0.875rem;
          margin-bottom: 6px;
        }

        .sample-card-tags {
          display: flex;
          gap: 2px;
          row-gap: 2px; // 줄바꿈 시 상하 간격 최소화
          flex-wrap: wrap;
          align-items: flex-start; // 상단 정렬
        }

        .sample-card-tag {
          padding: 3px 8px;
          font-size: 0.575rem;
          color: var(--nexa-text-secondary);
          margin: 0; // Quasar 기본 margin 제거
        }
      }
    }

    .no-samples {
      .no-samples-message {
        color: var(--nexa-text-primary);
        font-size: 1.1rem;
        font-weight: 500;
      }

      .no-samples-hint {
        color: var(--nexa-text-secondary);
        font-size: 0.875rem;
      }
    }
  }

  .sample-detail-view {
    .detail-header {
      display: flex;
      align-items: center;

      .detail-title {
        color: var(--nexa-text-primary);
        font-size: 1.75rem;
        font-weight: 900;
        margin-left: 8px;
      }
    }

    .detail-content {
      .detail-section {
        .section-title {
          color: var(--nexa-text-primary);
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;

          .preview-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }

        .preview-controls {
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;

          .control-group {
            .control-inputs {
              display: flex;
              flex-direction: column;
              gap: 2px;

              .control-input-item {
                display: flex;
                align-items: center;
                gap: 2px;

                label {
                  min-width: 80px;
                  color: var(--nexa-text-secondary);
                  font-size: 0.875rem;
                  white-space: nowrap;
                }

                .height-control-row {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  flex: 1;

                  .q-slider {
                    flex: 1;
                  }

                  .q-btn {
                    min-width: 60px;
                  }
                }

                .q-slider {
                  flex: 1;
                }
              }

              .background-controls-row {
                display: flex;
                gap: 8px;
                align-items: center;

                .q-btn {
                  flex: 1;
                }

                .bg-active {
                  background-color: var(--nexa-surface-hover);
                }
              }
            }
          }
        }

        .height-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          margin-bottom: 8px;
          background-color: var(--nexa-warning);
          color: var(--nexa-text-primary);
          border-radius: 4px;
          font-size: 0.875rem;
          border-left: 3px solid var(--nexa-warning);
        }

        .sample-preview-direct {
          border: 4px solid var(--nexa-border-color);
          border-radius: 8px;

          .preview-placeholder,
          .preview-loading,
          .preview-error {
            text-align: center;
            color: var(--nexa-text-secondary);

            .preview-text {
              margin: 0;
              font-weight: 500;
            }

            .preview-note {
              font-size: 0.875rem;
              color: var(--nexa-text-disabled);
            }
          }

          .preview-error {
            .preview-text {
              color: var(--nexa-error);
              font-weight: 600;
            }
          }
        }

        .info-section {
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 6px;

          .usage-example-code {
            pre {
              margin: 0;
              overflow-x: auto;
              padding: 0 22px;
              border-radius: 4px;
              color: var(--nexa-text-secondary) !important;

              code {
                line-height: 1.1 !important;
                font-family: 'Courier New', monospace;
                font-size: 0.875rem;
                color: var(--nexa-text-primary);
                line-height: 1.6;
              }
            }
          }

          // 디자인 결정 요소 스타일
          .design-decisions {
            .decision-item {
              display: flex;
              border-bottom: 1px solid var(--nexa-border-color);

              &:last-child {
                border-bottom: none;
              }

              .decision-key {
                color: var(--nexa-text-secondary);
                font-weight: 500;
                min-width: 120px;
              }

              .decision-value {
                color: var(--nexa-text-primary);
                flex: 1;
              }
            }
          }

          // 코드 에디터 섹션 스타일
          &.code-editor-section {
            padding: 0 16px;
            min-height: 500px;
            display: flex;
            flex-direction: column;

            .file-loading,
            .file-error {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 200px;
              color: var(--nexa-text-secondary);

              .file-loading-text,
              .file-error-text {
                font-size: 0.875rem;
              }

              .file-error-text {
                color: var(--nexa-error);
              }
            }
          }

          // AI 참조 키워드 스타일
          .ai-reference {
            .ai-reference-note {
              color: var(--nexa-text-secondary);
              font-size: 0.875rem;
            }
          }
        }
      }
    }
  }
}
</style>
