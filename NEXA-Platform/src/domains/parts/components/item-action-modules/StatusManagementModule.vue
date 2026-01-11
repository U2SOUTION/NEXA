<!-- StatusManagementModule.vue
  상태 관리 모듈: 활성화/비활성화, 즐겨찾기
  menuItems.js를 사용하여 메뉴 아이템 로직 재사용
-->
<template>
  <div>
    <template v-for="(item, index) in menuItems" :key="item.id || index">
      <!-- 구분선 -->
      <q-separator v-if="item.separator" />

      <!-- 메뉴 아이템 -->
      <q-item
        v-else
        clickable
        v-close-popup
        :disable="item.disabled"
        :style="item.disabled ? { color: disabledMenuItemColor } : {}"
        @click="handleItemClick(item)"
      >
        <q-item-section avatar>
          <q-icon
            :name="item.icon"
            :style="
              item.disabled
                ? { color: disabledMenuItemColor }
                : { color: 'var(--nexa-ui-primary)' }
            "
          />
        </q-item-section>
        <q-item-section>
          <q-item-label
            :style="
              item.disabled
                ? { color: disabledMenuItemColor }
                : { color: 'var(--nexa-text-primary)' }
            "
          >
            {{ item.label }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusManagementMenuItems } from './menuItems'

const props = defineProps({
  selectedCount: {
    type: Number,
    default: 0,
  },
  hasActiveFilter: {
    type: Boolean,
    default: false,
  },
  activateStatusMenuLabel: {
    type: String,
    default: '활성화/비활성화',
  },
  favoriteMenuItemLabel: {
    type: String,
    default: '즐겨찾기',
  },
  disabledMenuItemColor: {
    type: String,
    default: '#777777',
  },
})

const emit = defineEmits(['toggle-activate', 'toggle-favorite'])

// menuItems.js에서 메뉴 아이템 가져오기
const menuItems = computed(() => {
  return getStatusManagementMenuItems({
    selectedCount: props.selectedCount,
    hasActiveFilter: props.hasActiveFilter,
    activateStatusMenuLabel: props.activateStatusMenuLabel,
    favoriteMenuItemLabel: props.favoriteMenuItemLabel,
  })
})

// 아이템 클릭 핸들러
function handleItemClick(item) {
  if (item.disabled) return

  // action을 emit 이벤트로 변환
  const actionMap = {
    'toggle-activate': 'toggle-activate',
    'toggle-favorite': 'toggle-favorite',
  }

  const emitEvent = actionMap[item.action]
  if (emitEvent) {
    emit(emitEvent)
  }
}
</script>
