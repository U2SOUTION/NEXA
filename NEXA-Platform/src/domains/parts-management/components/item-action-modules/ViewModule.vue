<!-- ViewModule.vue
  조회 모듈: 상세보기, 변경 이력, 관련 부품 보기
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
        <!-- Tooltip (복수 선택 시) -->
        <q-tooltip
          v-if="item.disabled && selectedCount > 1"
          anchor="top middle"
          self="bottom middle"
          :offset="[0, 4]"
        >
          <div class="row items-center q-gutter-xs">
            <q-icon name="info" size="16px" />
            <span>
              {{
                item.action === 'view-detail'
                  ? '단일 항목만 상세보기 가능합니다'
                  : item.action === 'view-history'
                    ? '단일 항목만 변경 이력 조회 가능합니다'
                    : '단일 항목만 관련 부품 조회 가능합니다'
              }}
            </span>
          </div>
        </q-tooltip>

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
import { getViewMenuItems } from './menuItems'

const props = defineProps({
  selectedRowId: {
    type: [Number, String],
    default: null,
  },
  selectedCount: {
    type: Number,
    default: 0,
  },
  disabledMenuItemColor: {
    type: String,
    default: '#777777',
  },
})

const emit = defineEmits(['view-detail', 'view-history', 'view-related'])

// menuItems.js에서 메뉴 아이템 가져오기
const menuItems = computed(() => {
  return getViewMenuItems({
    selectedRowId: props.selectedRowId,
    selectedCount: props.selectedCount,
  })
})

// 아이템 클릭 핸들러
function handleItemClick(item) {
  if (item.disabled) return

  // action을 emit 이벤트로 변환
  const actionMap = {
    'view-detail': 'view-detail',
    'view-history': 'view-history',
    'view-related': 'view-related',
  }

  const emitEvent = actionMap[item.action]
  if (emitEvent) {
    emit(emitEvent)
  }
}
</script>
