<!-- PanelMermaidStyle.vue
  Mermaid 차트 스타일 편집 패널
  파일 레벨 스타일 설정
  Props 기반으로 재사용 가능하도록 패널화
-->

<template>
  <div class="nexa-panel-section mermaid-style-section q-pa-md">
    <!-- 스타일 상태 표시 -->
    <div class="style-status q-mb-md q-pa-sm" :class="hasCustomStyle ? 'status-custom' : 'status-default'">
      <q-icon :name="hasCustomStyle ? 'check_circle' : 'info'" size="16px" class="q-mr-xs" />
      <span class="text-caption status-text">
        {{ hasCustomStyle ? '커스텀 스타일 적용 중' : '기본 스타일 적용 중' }}
      </span>
    </div>

    <!-- 노드 설정 -->
    <div class="section-group q-mb-md">
      <div class="section-label q-mb-sm">노드 설정</div>
      <div class="color-row row items-center q-gutter-sm">
        <div class="col-auto label-text">글자색상:</div>
        <div class="col-auto text-caption">{{ style.textColor }}</div>
        <div class="col"></div>
        <q-btn flat dense class="color-box-btn q-pa-none" style="min-width: auto; height: auto">
          <q-popup-proxy ref="textColorPopup" anchor="bottom left" self="top left" transition-show="scale" transition-hide="scale">
            <q-color v-model="style.textColor" format-model="hex" />
          </q-popup-proxy>
          <div class="color-box" :style="{ backgroundColor: style.textColor }"></div>
        </q-btn>
      </div>
      <div class="color-row row items-center q-gutter-sm">
        <div class="col-auto label-text">배경색상:</div>
        <div class="col-auto text-caption">{{ style.nodeBg }}</div>
        <div class="col"></div>
        <q-btn flat dense class="color-box-btn q-pa-none" style="min-width: auto; height: auto">
          <q-popup-proxy ref="nodeBgPopup" anchor="bottom left" self="top left" transition-show="scale" transition-hide="scale">
            <q-color v-model="style.nodeBg" format-model="hex" />
          </q-popup-proxy>
          <div class="color-box" :style="{ backgroundColor: style.nodeBg }"></div>
        </q-btn>
      </div>
      <div class="color-row row items-center q-gutter-sm">
        <div class="col-auto label-text">테두리:</div>
        <div class="col-auto text-caption">{{ style.nodeBorder }}</div>
        <div class="col"></div>
        <q-btn flat dense class="color-box-btn q-pa-none" style="min-width: auto; height: auto">
          <q-popup-proxy ref="nodeBorderPopup" anchor="bottom left" self="top left" transition-show="scale" transition-hide="scale">
            <q-color v-model="style.nodeBorder" format-model="hex" />
          </q-popup-proxy>
          <div class="color-box" :style="{ backgroundColor: style.nodeBorder }"></div>
        </q-btn>
      </div>
      <div class="row items-center q-gutter-sm">
        <div class="col-auto label-text">글자크기:</div>
        <q-slider v-model="style.textSize" :min="10" :max="24" :step="1" class="col" />
        <div class="col-auto text-caption slider-value">{{ style.textSize }}px</div>
      </div>
      <div class="row items-center q-gutter-sm">
        <div class="col-auto label-text">노드두께:</div>
        <q-slider v-model="style.nodeBorderWidth" :min="1" :max="10" :step="1" class="col" />
        <div class="col-auto text-caption slider-value">{{ style.nodeBorderWidth }}px</div>
      </div>
    </div>

    <!-- 라인 설정 -->
    <div class="section-group q-mb-md">
      <div class="section-label q-mb-sm">라인 설정</div>
      <div class="color-row row items-center q-gutter-sm">
        <div class="col-auto label-text">글자색상:</div>
        <div class="col-auto text-caption">{{ style.edgeText }}</div>
        <div class="col"></div>
        <q-btn flat dense class="color-box-btn q-pa-none" style="min-width: auto; height: auto">
          <q-popup-proxy ref="edgeTextPopup" anchor="bottom left" self="top left" transition-show="scale" transition-hide="scale">
            <q-color v-model="style.edgeText" format-model="hex" @update:model-value="handleEdgeTextChange" />
          </q-popup-proxy>
          <div class="color-box" :style="{ backgroundColor: style.edgeText }"></div>
        </q-btn>
      </div>
      <div class="color-row row items-center q-gutter-sm">
        <div class="col-auto label-text">라인색상:</div>
        <div class="col-auto text-caption">{{ style.lineColor }}</div>
        <div class="col"></div>
        <q-btn flat dense class="color-box-btn q-pa-none" style="min-width: auto; height: auto">
          <q-popup-proxy ref="lineColorPopup" anchor="bottom left" self="top left" transition-show="scale" transition-hide="scale">
            <q-color v-model="style.lineColor" format-model="hex" />
          </q-popup-proxy>
          <div class="color-box" :style="{ backgroundColor: style.lineColor }"></div>
        </q-btn>
      </div>
      <div class="row items-center q-gutter-sm">
        <div class="col-auto label-text">글자크기:</div>
        <q-slider v-model="style.edgeLabelSize" :min="10" :max="24" :step="1" class="col" />
        <div class="col-auto text-caption slider-value">{{ style.edgeLabelSize }}px</div>
      </div>
      <div class="row items-center q-gutter-sm">
        <div class="col-auto label-text">라인두께:</div>
        <q-slider v-model="style.lineWidth" :min="1" :max="10" :step="1" class="col" />
        <div class="col-auto text-caption slider-value">{{ style.lineWidth }}px</div>
      </div>
      <div class="row items-center q-gutter-sm">
        <div class="col-auto label-text">스타일:</div>
        <q-select v-model="style.lineStyle" :options="lineStyleOptions" class="col" dense outlined style="outline: 1px solid var(--nexa-border)" />
      </div>
    </div>

    <!-- 그림자 효과 설정 -->
    <div class="section-group shadow-section q-mb-md">
      <div class="section-label q-mb-sm shadow-title-row">
        <span>그림자 효과</span>
        <q-toggle v-model="style.nodeShadow" />
      </div>
      <template v-if="style.nodeShadow">
        <div class="color-row row items-center q-gutter-sm">
          <div class="col-auto label-text">색상:</div>
          <div class="col-auto text-caption">{{ style.nodeShadowColor }}</div>
          <div class="col"></div>
          <q-btn flat dense class="color-box-btn q-pa-none" style="min-width: auto; height: auto">
            <q-popup-proxy ref="nodeShadowColorPopup" anchor="bottom left" self="top left" transition-show="scale" transition-hide="scale">
              <q-color v-model="style.nodeShadowColor" format-model="hex" />
            </q-popup-proxy>
            <div class="color-box" :style="{ backgroundColor: style.nodeShadowColor }"></div>
          </q-btn>
        </div>
        <div class="row items-center q-gutter-sm">
          <div class="col-auto label-text">블러:</div>
          <q-slider v-model="style.nodeShadowBlur" :min="0" :max="20" :step="1" class="col" />
          <div class="col-auto text-caption slider-value">{{ style.nodeShadowBlur }}px</div>
        </div>
        <div class="row items-center q-gutter-sm">
          <div class="col-auto label-text">오프셋 X:</div>
          <q-slider v-model="style.nodeShadowOffsetX" :min="-10" :max="10" :step="1" class="col" />
          <div class="col-auto text-caption slider-value">{{ style.nodeShadowOffsetX }}px</div>
        </div>
        <div class="row items-center q-gutter-sm">
          <div class="col-auto label-text">오프셋 Y:</div>
          <q-slider v-model="style.nodeShadowOffsetY" :min="-10" :max="10" :step="1" class="col" />
          <div class="col-auto text-caption slider-value">{{ style.nodeShadowOffsetY }}px</div>
        </div>
      </template>
    </div>

    <!-- 적용 버튼 -->
    <div class="q-mt-md">
      <q-btn color="primary" label="적용" @click="applyStyle" class="full-width" :loading="isSaving" />
    </div>

    <!-- 기본값으로 리셋 버튼 -->
    <div class="q-mt-sm">
      <q-btn outline color="grey-7" label="기본값으로 리셋" @click="resetToDefault" class="full-width" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useMermaidStyle } from '@domains/dev/modules/document-manager/composables/useMermaidStyle.js'
import { getDefaultMermaidCss, getMermaidStylePath } from '@domains/dev/modules/document-manager/services/mermaidStyleStorage.js'

// Props 정의
const props = defineProps({
  filePath: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
})

const $q = useQuasar()

// 팝업 ref들
const nodeBgPopup = ref(null)
const nodeBorderPopup = ref(null)
const lineColorPopup = ref(null)
const textColorPopup = ref(null)
const edgeTextPopup = ref(null)
const nodeShadowColorPopup = ref(null)

// 현재 파일 경로 (Props 기반)
const currentFilePath = computed(() => props.filePath || '')

// 스타일 관리 Composable 사용
const {
  nodeBg,
  nodeBorder,
  nodeBorderWidth,
  lineColor,
  lineWidth,
  lineStyle,
  textColor,
  textSize,
  edgeText,
  edgeLabelSize,
  nodeShadow,
  nodeShadowBlur,
  nodeShadowOffsetX,
  nodeShadowOffsetY,
  nodeShadowColor,
  hasCustomStyle,
  resetToDefault: resetStyle,
  generateFileLevelCss,
  saveFileStyle,
  loadFileStyle,
} = useMermaidStyle(currentFilePath)

// 스타일 객체 (v-model 바인딩용)
const style = ref({
  nodeBg: nodeBg.value,
  nodeBorder: nodeBorder.value,
  nodeBorderWidth: nodeBorderWidth.value,
  lineColor: lineColor.value,
  lineWidth: lineWidth.value,
  lineStyle: lineStyle.value,
  textColor: textColor.value,
  textSize: textSize.value,
  edgeText: edgeText.value,
  edgeLabelSize: edgeLabelSize.value,
  nodeShadow: nodeShadow.value,
  nodeShadowBlur: nodeShadowBlur.value,
  nodeShadowOffsetX: nodeShadowOffsetX.value,
  nodeShadowOffsetY: nodeShadowOffsetY.value,
  nodeShadowColor: nodeShadowColor.value,
})

// 라인 스타일 옵션
const lineStyleOptions = ['solid', 'dashed', 'dotted']

// 원본 ref 변경 시 스타일 객체 업데이트
watch(nodeBg, (val) => {
  style.value.nodeBg = val
})
watch(nodeBorder, (val) => {
  style.value.nodeBorder = val
})
watch(nodeBorderWidth, (val) => {
  style.value.nodeBorderWidth = val
})
// lineColor watch는 아래에 있음
watch(lineWidth, (val) => {
  style.value.lineWidth = val
})
watch(lineStyle, (val) => {
  style.value.lineStyle = val
})
watch(textColor, (val) => {
  style.value.textColor = val
})
watch(textSize, (val) => {
  style.value.textSize = val
})
watch(edgeText, (val) => {
  if (val && val !== style.value.edgeText) {
    style.value.edgeText = val
  }
  // edgeText 변경 시 실시간 반영 (edgeLabelSize와 동일한 방식)
  if (realtimeStyleDebounceTimer) {
    clearTimeout(realtimeStyleDebounceTimer)
  }
  realtimeStyleDebounceTimer = setTimeout(async () => {
    await nextTick()
    applyRealtimeStyles()
  }, 100) // edgeText는 색상이므로 더 빠른 반응 필요
})
watch(edgeLabelSize, (val) => {
  style.value.edgeLabelSize = val
})
watch(nodeShadow, (val) => {
  style.value.nodeShadow = val
})
watch(nodeShadowBlur, (val) => {
  style.value.nodeShadowBlur = val
})
watch(nodeShadowOffsetX, (val) => {
  style.value.nodeShadowOffsetX = val
})
watch(nodeShadowOffsetY, (val) => {
  style.value.nodeShadowOffsetY = val
})
watch(nodeShadowColor, (val) => {
  style.value.nodeShadowColor = val
})

const isSaving = ref(false)

// 실시간 스타일 적용 디바운싱
let realtimeStyleDebounceTimer = null

// edgeText 변경 핸들러 (q-color의 @update:model-value 이벤트용)
function handleEdgeTextChange(newColor) {
  // style.value.edgeText는 이미 q-color의 v-model에 의해 업데이트됨
  // edgeText.value를 직접 업데이트하여 실시간 반영 보장
  if (newColor && newColor !== edgeText.value) {
    edgeText.value = newColor
    if (import.meta.env.DEV) {
      console.log('[handleEdgeTextChange] edgeText.value 업데이트:', newColor)
    }
  }

  // 실시간 반영
  if (realtimeStyleDebounceTimer) {
    clearTimeout(realtimeStyleDebounceTimer)
  }
  realtimeStyleDebounceTimer = setTimeout(async () => {
    await nextTick()
    if (import.meta.env.DEV) {
      console.log('[handleEdgeTextChange] applyRealtimeStyles 호출, edgeText.value:', edgeText.value)
    }
    applyRealtimeStyles()
  }, 100) // 색상 선택은 더 빠른 반응 필요
}

/**
 * 실시간 스타일 미리보기 적용
 * UI에서 스타일 변경 시 즉시 Mermaid 차트에 반영 (임시 적용)
 */
async function applyRealtimeStyles() {
  // 모든 Mermaid 블록 찾기
  const mermaidBlocks = document.querySelectorAll('.mermaid-block')
  if (mermaidBlocks.length === 0) {
    return
  }

  // 1. 기본 스타일
  const defaultCss = getDefaultMermaidCss()

  // 2. 설정 파일 스타일 (localStorage에서만 확인, HEAD 요청 방지)
  // 실시간 스타일 적용에서는 네트워크 요청 없이 localStorage만 확인
  let savedFileCss = null
  if (currentFilePath.value) {
    try {
      const cssPath = getMermaidStylePath(currentFilePath.value)
      const localStorageKey = `mermaid-style:${cssPath}`
      const saved = localStorage.getItem(localStorageKey)
      if (saved) {
        savedFileCss = saved
      }
    } catch {
      // localStorage 읽기 실패는 무시
    }
  }

  // 3. 실시간 UI 설정값 (현재 조정 중인 값, 마지막 = 최우선)
  const realtimeCss = generateFileLevelCss()

  // 디버깅: edgeText 확인
  if (import.meta.env.DEV) {
    const edgeTextInCss = realtimeCss.match(/\.edgeLabel[^}]*fill:\s*([^!;]+)/i) || realtimeCss.match(/\.edgeText[^}]*fill:\s*([^!;]+)/i)
    if (edgeTextInCss) {
      console.log('[실시간 스타일] 생성된 CSS의 엣지 텍스트 색상:', edgeTextInCss[1]?.trim())
    }
    console.log('[실시간 스타일] edgeText.value:', edgeText.value)
    console.log('[실시간 스타일] style.value.edgeText:', style.value.edgeText)
    console.log('[실시간 스타일] generateFileLevelCss에서 사용할 edgeText:', edgeText.value)
  }

  // CSS 순서: 기본 → 설정파일 → 실시간 (마지막이 최우선)
  const finalCss = defaultCss + (savedFileCss ? '\n' + savedFileCss : '') + '\n' + realtimeCss

  // 각 블록에 CSS 주입
  mermaidBlocks.forEach((block) => {
    const mermaidId = block.getAttribute('data-mermaid-id')
    if (!mermaidId) {
      console.warn('[실시간 스타일] mermaidId를 찾을 수 없습니다:', block)
      return
    }

    // 기존 스타일 태그 제거
    const existingStyle = document.getElementById(`mermaid-style-${mermaidId}`)
    if (existingStyle) {
      existingStyle.remove()
    }

    // 새 스타일 태그 생성 및 주입
    const styleTag = document.createElement('style')
    styleTag.id = `mermaid-style-${mermaidId}`
    styleTag.textContent = finalCss
    document.head.appendChild(styleTag)

    // CSS 주입 후 인라인 스타일도 업데이트 (SVG fill 속성은 인라인 스타일이 우선하므로)
    // 약간의 지연 후 forceApplyThemeStyles 호출하여 인라인 스타일 업데이트
    setTimeout(() => {
      // useMermaid의 forceApplyThemeStyles는 내부 함수이므로 직접 호출 불가
      // 대신 DOM을 직접 조작하여 인라인 스타일 업데이트
      const svg = block.querySelector('svg')
      if (svg) {
        // 1. 노드 텍스트 요소에 최신 색상 적용
        const nodeTextElements = svg.querySelectorAll('.nodeLabel text, .nodeLabel, .flowchart-label text, .label text, text:not(.edgeLabel text):not(.edgeLabel span):not(.messageText)')
        nodeTextElements.forEach((textEl) => {
          if (textEl.textContent && textEl.textContent.trim() !== '') {
            // 엣지 라벨이 아닌 경우만
            if (!textEl.closest('.edgeLabel') && !textEl.closest('.edgeLabels')) {
              textEl.removeAttribute('fill')
              textEl.style.setProperty('fill', textColor.value, 'important')
              textEl.style.fill = textColor.value
              textEl.setAttribute('fill', textColor.value)
            }
          }
        })

        // 2. HTML 요소 (foreignObject 내부)에도 적용
        const nodeHtmlElements = svg.querySelectorAll('.nodeLabel span, .nodeLabel p, .nodeLabel div, .flowchart-label span, .flowchart-label p, .flowchart-label div')
        nodeHtmlElements.forEach((htmlEl) => {
          if (htmlEl.textContent && htmlEl.textContent.trim() !== '') {
            if (!htmlEl.closest('.edgeLabel') && !htmlEl.closest('.edgeLabels')) {
              htmlEl.style.setProperty('color', textColor.value, 'important')
              htmlEl.style.color = textColor.value
            }
          }
        })

        // 3. 라인 색상 적용 (path, line 요소)
        const lineElements = svg.querySelectorAll('.edge path, .edgePath path, .messageLine0, .messageLine1, path[stroke], line[stroke]')
        lineElements.forEach((lineEl) => {
          // fill이 none인 경우만 (노드가 아닌 경우)
          const currentFill = lineEl.getAttribute('fill')
          if (!currentFill || currentFill === 'none' || currentFill === 'transparent') {
            lineEl.removeAttribute('stroke')
            lineEl.style.setProperty('stroke', lineColor.value, 'important')
            lineEl.style.stroke = lineColor.value
            lineEl.setAttribute('stroke', lineColor.value)
          }
        })

        // 4. 엣지 라벨 텍스트 색상 적용
        // 엣지 라벨은 .edgeLabel 클래스를 가진 g 요소 내부에 있음
        const edgeLabelGroups = svg.querySelectorAll('.edgeLabel, .edgeLabels, g[class*="edgeLabel"]')
        edgeLabelGroups.forEach((group) => {
          // 그룹 내부의 모든 텍스트 요소 찾기
          const textElements = group.querySelectorAll('text, tspan')
          textElements.forEach((textEl) => {
            if (textEl.textContent && textEl.textContent.trim() !== '') {
              textEl.removeAttribute('fill')
              textEl.style.setProperty('fill', edgeText.value, 'important')
              textEl.style.fill = edgeText.value
              textEl.setAttribute('fill', edgeText.value)
            }
          })

          // 그룹 내부의 HTML 요소 (foreignObject 내부)
          const htmlElements = group.querySelectorAll('span, p, div')
          htmlElements.forEach((htmlEl) => {
            if (htmlEl.textContent && htmlEl.textContent.trim() !== '') {
              htmlEl.style.setProperty('color', edgeText.value, 'important')
              htmlEl.style.color = edgeText.value
            }
          })
        })

        // .edgeText 클래스를 가진 요소도 처리
        const edgeTextElements = svg.querySelectorAll('.edgeText, [class*="edgeText"]')
        edgeTextElements.forEach((edgeEl) => {
          if (edgeEl.textContent && edgeEl.textContent.trim() !== '') {
            if (edgeEl.tagName === 'text' || edgeEl.tagName === 'tspan') {
              edgeEl.removeAttribute('fill')
              edgeEl.style.setProperty('fill', edgeText.value, 'important')
              edgeEl.style.fill = edgeText.value
              edgeEl.setAttribute('fill', edgeText.value)
            } else {
              edgeEl.style.setProperty('color', edgeText.value, 'important')
              edgeEl.style.color = edgeText.value
            }
          }
        })

        if (import.meta.env.DEV) {
          console.log('[실시간 스타일] 엣지 라벨 요소 적용 완료:', {
            edgeLabelGroups: edgeLabelGroups.length,
            edgeTextElements: edgeTextElements.length,
            edgeTextValue: edgeText.value,
          })
        }

        // 5. 메시지 텍스트 (시퀀스 다이어그램) - 라인 색상 사용
        const messageTextElements = svg.querySelectorAll('.messageText')
        messageTextElements.forEach((msgEl) => {
          if (msgEl.textContent && msgEl.textContent.trim() !== '') {
            msgEl.removeAttribute('fill')
            msgEl.style.setProperty('fill', lineColor.value, 'important')
            msgEl.style.fill = lineColor.value
            msgEl.setAttribute('fill', lineColor.value)
          }
        })
      }
    }, 50)
  })
}

// 스타일 변경 감지 및 실시간 적용 (디바운싱)
watch(
  () => style.value,
  async (newStyle) => {
    // 원본 ref 업데이트 (edgeText, edgeLabelSize 포함)
    // 주의: edgeText는 별도 watch가 있으므로 여기서는 조건부 업데이트
    nodeBg.value = newStyle.nodeBg
    nodeBorder.value = newStyle.nodeBorder
    nodeBorderWidth.value = newStyle.nodeBorderWidth
    lineColor.value = newStyle.lineColor
    lineWidth.value = newStyle.lineWidth
    lineStyle.value = newStyle.lineStyle
    textColor.value = newStyle.textColor
    textSize.value = newStyle.textSize
    // edgeText는 별도 watch가 있지만, 여기서도 업데이트하여 일관성 유지
    if (newStyle.edgeText && newStyle.edgeText !== edgeText.value) {
      edgeText.value = newStyle.edgeText
    }
    edgeLabelSize.value = newStyle.edgeLabelSize
    nodeShadow.value = newStyle.nodeShadow
    nodeShadowBlur.value = newStyle.nodeShadowBlur
    nodeShadowOffsetX.value = newStyle.nodeShadowOffsetX
    nodeShadowOffsetY.value = newStyle.nodeShadowOffsetY
    nodeShadowColor.value = newStyle.nodeShadowColor
    // ref 업데이트가 완료될 때까지 대기
    await nextTick()
    // 디바운싱: 300ms 이내 중복 호출 무시
    if (realtimeStyleDebounceTimer) {
      clearTimeout(realtimeStyleDebounceTimer)
    }
    realtimeStyleDebounceTimer = setTimeout(() => {
      applyRealtimeStyles()
    }, 300)
  },
  { deep: true },
)

// 파일 경로 변경 시 스타일 로드 (Props 기반)
watch(
  () => props.filePath,
  async (newFilePath, oldFilePath) => {
    // 파일이 실제로 변경되었을 때만 처리
    if (newFilePath && newFilePath !== oldFilePath) {
      // DOM과 Mermaid 렌더링이 완료될 때까지 대기
      await nextTick()
      // Mermaid 렌더링이 완료될 시간을 고려한 대기 (useMermaid에서 800ms 대기 사용)
      setTimeout(async () => {
        // DOM에서 직접 확인 (가장 정확)
        const markdownContainer = document.querySelector('.markdown-content')
        const mermaidBlocks = markdownContainer?.querySelectorAll('.mermaid-block') || []
        const hasBlocksNow = mermaidBlocks.length > 0 || (props.content || '').includes('mermaid-block')
        // Mermaid 블록이 있는 파일일 때만 스타일 로드
        if (hasBlocksNow) {
          // 설정 파일에서 스타일 로드 (없으면 기본값 사용)
          await loadFileStyle()
          // 로드 후 스타일 객체 업데이트
          style.value = {
            nodeBg: nodeBg.value,
            nodeBorder: nodeBorder.value,
            nodeBorderWidth: nodeBorderWidth.value,
            lineColor: lineColor.value,
            lineWidth: lineWidth.value,
            lineStyle: lineStyle.value,
            textColor: textColor.value,
            textSize: textSize.value,
            edgeText: edgeText.value,
            edgeLabelSize: edgeLabelSize.value,
            nodeShadow: nodeShadow.value,
            nodeShadowBlur: nodeShadowBlur.value,
            nodeShadowOffsetX: nodeShadowOffsetX.value,
            nodeShadowOffsetY: nodeShadowOffsetY.value,
            nodeShadowColor: nodeShadowColor.value,
          }
          // 스타일 로드 후 실시간 적용
          await applyRealtimeStyles()
        } else {
          // Mermaid 블록이 없으면 기본값으로 리셋
          resetToDefault()
        }
      }, 1000) // Mermaid 렌더링 완료 후 스타일 로드 (800ms + 여유 시간)
    }
  },
)

// 스타일 적용
async function applyStyle() {
  if (!currentFilePath.value) {
    $q.notify({
      type: 'warning',
      message: '파일이 선택되지 않았습니다.',
      position: 'top',
    })
    return
  }

  isSaving.value = true

  try {
    // 스타일 저장
    const success = await saveFileStyle()

    if (success) {
      // 저장 후 실시간 스타일 재적용 (이미 저장된 값 반영)
      await applyRealtimeStyles()
      $q.notify({
        type: 'positive',
        message: '스타일이 저장되었습니다.',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: '스타일 저장에 실패했습니다.',
        position: 'top',
        timeout: 5000,
      })
    }
  } catch (error) {
    console.error('[PanelMermaidStyle] 스타일 적용 실패:', error)
    $q.notify({
      type: 'negative',
      message: '스타일 적용 중 오류가 발생했습니다.',
      position: 'top',
    })
  } finally {
    isSaving.value = false
  }
}

// 기본값으로 리셋
function resetToDefault() {
  resetStyle()
  style.value = {
    nodeBg: nodeBg.value,
    nodeBorder: nodeBorder.value,
    nodeBorderWidth: nodeBorderWidth.value,
    lineColor: lineColor.value,
    lineWidth: lineWidth.value,
    lineStyle: lineStyle.value,
    textColor: textColor.value,
    textSize: textSize.value,
    edgeText: edgeText.value,
    edgeLabelSize: edgeLabelSize.value,
    nodeShadow: nodeShadow.value,
    nodeShadowBlur: nodeShadowBlur.value,
    nodeShadowOffsetX: nodeShadowOffsetX.value,
    nodeShadowOffsetY: nodeShadowOffsetY.value,
    nodeShadowColor: nodeShadowColor.value,
  }
}
</script>

<!-- 스타일은 src/system/css/nexa-system/_panel.scss에서 전역으로 관리됩니다 -->


