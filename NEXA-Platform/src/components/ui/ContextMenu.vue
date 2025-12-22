<!--
  ContextMenu.vue

  전역적으로 재사용 가능한 컨텍스트 메뉴 컴포넌트
  마우스 오른쪽 클릭 시 표시되는 메뉴

  ===== 주요 기능 =====
  - 마우스 위치에 메뉴 표시
  - 메뉴 아이템 렌더링 (라벨, 아이콘, 구분선, 하위 메뉴)
  - 키보드 네비게이션 지원
  - 외부 클릭 시 자동 닫기
  - 애니메이션 효과

  ===== 사용법 =====

  <template>
    <ContextMenu
      v-model:visible="contextMenuVisible"
      :position="contextMenuPosition"
      :items="contextMenuItems"
      @item-click="handleMenuItemClick"
    />
  </template>

  <script setup>
  import { computed } from 'vue'
  import ContextMenu from '@/components/ui/ContextMenu.vue'
  import { useContextMenu } from '@/composables/useContextMenu'

  const { showContextMenu, hideContextMenu, contextMenuState } = useContextMenu()

  const contextMenuVisible = computed(() => contextMenuState.visible.value)
  const contextMenuPosition = computed(() => contextMenuState.position.value)
  const contextMenuItems = computed(() => contextMenuState.items.value)

  function handleMenuItemClick(item, event) {
    // 메뉴 아이템 클릭 처리
    hideContextMenu()
  }
  </script>
-->

<template>
  <Teleport to="body">
    <Transition name="context-menu-fade">
      <div
        v-if="visible"
        ref="menuRef"
        class="context-menu"
        :style="menuStyle"
        @click.stop
        @contextmenu.prevent
      >
        <!-- 타이틀 영역 -->
        <div class="context-menu-header">
          <q-icon name="menu" size="16px" class="context-menu-header-icon" />
          <span class="context-menu-header-title">NEXA context menu</span>
        </div>
        <q-separator class="context-menu-header-separator" />
        <q-list class="context-menu-list">
          <template v-for="(item, index) in filteredItems" :key="item.id || index">
            <!-- 구분선 -->
            <q-separator v-if="item.separator" class="context-menu-separator" />

            <!-- 메뉴 아이템 -->
            <q-item
              v-else-if="isItemVisible(item)"
              :disable="isItemDisabled(item)"
              clickable
              :class="{
                'context-menu-item': true,
                'context-menu-item--danger': item.danger,
                'context-menu-item--active': activeIndex === index,
                'context-menu-item--disabled': isItemDisabled(item),
              }"
              :style="
                isItemDisabled(item)
                  ? { opacity: '0.3', color: 'var(--nexa-text-secondary, rgba(0, 0, 0, 0.3))' }
                  : {}
              "
              @click="handleItemClick(item, $event)"
              @mouseenter="activeIndex = index"
            >
              <!-- 아이콘 -->
              <q-item-section v-if="item.icon" avatar class="context-menu-item-icon">
                <q-icon :name="item.icon" />
              </q-item-section>

              <!-- 라벨 -->
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
                <q-item-label v-if="item.caption" caption>{{ item.caption }}</q-item-label>
              </q-item-section>

              <!-- 배지 -->
              <q-item-section v-if="item.badge" side>
                <q-badge :label="item.badge" />
              </q-item-section>

              <!-- 단축키 -->
              <q-item-section v-if="item.shortcut" side class="context-menu-shortcut">
                <span class="text-caption text-grey-6">{{ item.shortcut }}</span>
              </q-item-section>

              <!-- 하위 메뉴 화살표 -->
              <q-item-section v-if="item.children && item.children.length > 0" side>
                <q-icon name="chevron_right" size="xs" />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
    </Transition>

    <!-- 외부 클릭 감지를 위한 오버레이 -->
    <div
      v-if="visible"
      class="context-menu-overlay"
      @click="handleOverlayClick"
      @contextmenu.prevent="handleOverlayClick"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  items: {
    type: Array,
    default: () => [],
  },
  theme: {
    type: String,
    default: 'auto', // 'light' | 'dark' | 'auto'
    validator: (value) => ['light', 'dark', 'auto'].includes(value),
  },
})

const emit = defineEmits(['update:visible', 'item-click', 'close'])

const $q = useQuasar()
const menuRef = ref(null)
const activeIndex = ref(-1)
const adjustedPosition = ref({ x: 0, y: 0 })

// 테마 감지 (향후 사용 예정)
// eslint-disable-next-line no-unused-vars
const isDark = computed(() => {
  if (props.theme === 'light') return false
  if (props.theme === 'dark') return true
  return $q.dark.isActive
})

// 필터링된 아이템 (구분선과 visible=false인 항목 제외)
const filteredItems = computed(() => {
  return props.items.filter((item) => {
    if (item.separator) return true
    return isItemVisible(item)
  })
})

// 메뉴 위치 조정 함수
function adjustMenuPosition() {
  if (!menuRef.value || !props.visible) {
    adjustedPosition.value = { x: props.position.x, y: props.position.y }
    return
  }

  // 실제 메뉴 크기 측정
  const rect = menuRef.value.getBoundingClientRect()
  const menuWidth = rect.width
  const menuHeight = rect.height
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const padding = 8

  let finalX = props.position.x
  let finalY = props.position.y

  // 오른쪽 경계 체크
  if (finalX + menuWidth > windowWidth) {
    finalX = windowWidth - menuWidth - padding
    if (finalX < padding) finalX = padding
  }

  // 아래쪽 경계 체크
  if (finalY + menuHeight > windowHeight) {
    // 위쪽으로 이동 (마우스 위치 위에 표시)
    finalY = props.position.y - menuHeight
    // 그래도 위쪽 경계를 벗어나면 화면 하단에 맞춤
    if (finalY < padding) {
      finalY = windowHeight - menuHeight - padding
      if (finalY < padding) finalY = padding
    }
  }

  // 왼쪽 경계 체크
  if (finalX < padding) {
    finalX = padding
  }

  // 위쪽 경계 체크
  if (finalY < padding) {
    finalY = padding
  }

  adjustedPosition.value = { x: finalX, y: finalY }
}

// 메뉴 스타일 (위치)
const menuStyle = computed(() => {
  return {
    left: `${adjustedPosition.value.x}px`,
    top: `${adjustedPosition.value.y}px`,
    zIndex: 9999,
  }
})

// 아이템 표시 여부 확인
function isItemVisible(item) {
  if (item.separator) return true
  if (item.visible === false) return false
  if (typeof item.visible === 'function') {
    return item.visible(item)
  }
  return true
}

// 아이템 비활성화 여부 확인
function isItemDisabled(item) {
  if (item.disabled === true) return true
  if (typeof item.disabled === 'function') {
    return item.disabled(item)
  }
  return false
}

// 아이템 클릭 처리
function handleItemClick(item, event) {
  if (isItemDisabled(item)) return

  // 하위 메뉴가 있으면 처리 (향후 구현)
  if (item.children && item.children.length > 0) {
    // TODO: 하위 메뉴 표시 로직
    return
  }

  emit('item-click', item, event)
  closeMenu()
}

// 오버레이 클릭 처리
function handleOverlayClick() {
  closeMenu()
}

// 메뉴 닫기
function closeMenu() {
  emit('update:visible', false)
  emit('close')
  activeIndex.value = -1
}

// 키보드 이벤트 처리
function handleKeydown(event) {
  if (!props.visible) return

  switch (event.key) {
    case 'Escape':
      closeMenu()
      event.preventDefault()
      break
    case 'ArrowDown':
      navigateItems(1)
      event.preventDefault()
      break
    case 'ArrowUp':
      navigateItems(-1)
      event.preventDefault()
      break
    case 'Enter':
      if (activeIndex.value >= 0 && activeIndex.value < filteredItems.value.length) {
        const item = filteredItems.value[activeIndex.value]
        if (!item.separator && !isItemDisabled(item)) {
          handleItemClick(item, event)
        }
      }
      event.preventDefault()
      break
  }
}

// 아이템 네비게이션
function navigateItems(direction) {
  const items = filteredItems.value.filter((item) => !item.separator && !isItemDisabled(item))
  if (items.length === 0) return

  let newIndex = activeIndex.value
  if (newIndex < 0) {
    newIndex = direction > 0 ? 0 : items.length - 1
  } else {
    const currentItemIndex = filteredItems.value.findIndex((item, idx) => idx === activeIndex.value)
    const currentItem = filteredItems.value[currentItemIndex]
    const currentItemInFiltered = items.findIndex((item) => item === currentItem)

    newIndex = currentItemInFiltered + direction
    if (newIndex < 0) newIndex = items.length - 1
    if (newIndex >= items.length) newIndex = 0

    const newItem = items[newIndex]
    const newItemIndex = filteredItems.value.findIndex((item) => item === newItem)
    newIndex = newItemIndex
  }

  activeIndex.value = newIndex
}

// 라이프사이클
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// position 변경 시 위치 조정
watch(
  () => props.position,
  () => {
    if (props.visible) {
      nextTick(() => {
        adjustMenuPosition()
      })
    }
  },
  { immediate: true },
)

// visible 변경 시 activeIndex 리셋 및 위치 재계산
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      activeIndex.value = -1
      // 초기 위치 설정
      adjustedPosition.value = { x: props.position.x, y: props.position.y }
      nextTick(() => {
        // 메뉴가 표시된 후 포커스 처리 및 위치 재계산
        if (menuRef.value) {
          menuRef.value.focus()
          adjustMenuPosition()
        }
      })
    }
  },
)
</script>

<style lang="scss" scoped>
.context-menu {
  position: fixed;
  min-width: 200px;
  max-width: 400px;
  background: var(--nexa-surface, var(--q-dark-page, #ffffff));
  border: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.12));
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  outline: none;
  opacity: 0.9;

  .context-menu-header {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background-color: var(--nexa-panel-header, rgba(0, 0, 0, 0.05));
    border-radius: 4px 4px 0 0;
  }

  .context-menu-header-icon {
    margin-right: 8px;
    color: var(--nexa-ui-primary, var(--q-primary));
    opacity: 0.8;
  }

  .context-menu-header-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--nexa-text-primary, var(--q-dark-page));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.7;
  }

  .context-menu-header-separator {
    margin: 0;
  }

  .context-menu-list {
    padding: 4px 0;
  }

  .context-menu-separator {
    margin: 4px 0;
  }

  .context-menu-item {
    min-height: 36px;
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(.q-item--disabled) {
      background-color: var(--q-dark-selection, rgba(0, 0, 0, 0.08));
    }

    &--active {
      background-color: var(--q-dark-selection, rgba(0, 0, 0, 0.12));
    }

    // 비활성화된 메뉴 아이템 스타일
    &.q-item--disabled,
    &--disabled {
      cursor: not-allowed !important;

      .q-item__label,
      .q-item__section--main .q-item__label,
      .q-item__section--avatar .q-icon {
        color: var(--nexa-text-secondary);
        opacity: 0.9;
      }
    }

    &--danger {
      color: var(--nexa-warning);

      &:hover:not(.q-item--disabled) {
        background-color: var(--q-negative);
        color: white;
      }
    }
  }

  .context-menu-item-icon {
    min-width: 32px;
  }

  .context-menu-shortcut {
    min-width: auto;
    padding-left: 16px;
  }
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.45);
  transition: opacity 0.15s ease;
}

// 애니메이션
.context-menu-fade-enter-active,
.context-menu-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.context-menu-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.context-menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
