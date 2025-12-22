<!-- BasicActionsModule.vue
  기본 작업 모듈: 끼워넣기, 편집, 삭제, 순서 변경, 복제
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
        <!-- Tooltip (끼워넣기, 편집, 복제) -->
        <q-tooltip
          v-if="
            item.disabled &&
            (item.action === 'insert-above' ||
              item.action === 'insert-below' ||
              item.action === 'edit' ||
              item.action === 'duplicate')
          "
          anchor="top middle"
          self="bottom middle"
          :offset="[0, 4]"
        >
          <div class="row items-center q-gutter-xs">
            <q-icon name="info" size="16px" />
            <span>
              {{
                item.action === 'insert-above' || item.action === 'insert-below'
                  ? '단일 항목만 끼워넣기 가능합니다'
                  : item.action === 'edit'
                    ? '단일 항목만 편집 가능합니다'
                    : '이 테이블에서 사용할 수 없는 기능입니다'
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
                : item.danger
                  ? { color: 'var(--nexa-negative-color)' }
                  : { color: 'var(--nexa-ui-primary)' }
            "
          />
        </q-item-section>
        <q-item-section>
          <q-item-label
            :style="
              item.disabled
                ? { color: disabledMenuItemColor }
                : item.danger
                  ? { color: 'var(--nexa-negative-color)' }
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
import { getBasicActionsMenuItems } from './menuItems' //메뉴아이템 menuItems.js 임포트

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

const emit = defineEmits(['insert-above', 'insert-below', 'edit', 'delete', 'reorder', 'duplicate'])

// menuItems.js에서 메뉴 아이템들을 담은 배열을 반환
const menuItems = computed(() => {
  return getBasicActionsMenuItems({
    selectedRowId: props.selectedRowId,
    selectedCount: props.selectedCount,
  })
})

// 아이템 클릭 핸들러
function handleItemClick(item) {
  if (item.disabled) return

  // action을 emit 이벤트로 변환
  const actionMap = {
    'insert-above': 'insert-above',
    'insert-below': 'insert-below',
    edit: 'edit',
    delete: 'delete',
    reorder: 'reorder',
    duplicate: 'duplicate',
  }

  const emitEvent = actionMap[item.action]
  if (emitEvent) {
    emit(emitEvent)
  }
}
</script>
