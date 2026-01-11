<!-- PrintExportModule.vue
  출력/내보내기/공유 모듈: 공유 URL, 바코드 출력, QR 코드 출력, 라벨 출력, 데이터 인쇄, 내보내기
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
import { getPrintExportMenuItems } from './menuItems'

const props = defineProps({
  selectedCount: {
    type: Number,
    default: 0,
  },
  hasActiveFilter: {
    type: Boolean,
    default: false,
  },
  printMenuLabel: {
    type: String,
    default: '데이터 인쇄',
  },
  exportMenuLabel: {
    type: String,
    default: '내보내기',
  },
  disabledMenuItemColor: {
    type: String,
    default: '#777777',
  },
})

const emit = defineEmits(['share', 'print', 'export'])

// menuItems.js에서 메뉴 아이템 가져오기
const menuItems = computed(() => {
  return getPrintExportMenuItems({
    selectedCount: props.selectedCount,
    hasActiveFilter: props.hasActiveFilter,
    printMenuLabel: props.printMenuLabel,
    exportMenuLabel: props.exportMenuLabel,
  })
})

// 아이템 클릭 핸들러
function handleItemClick(item) {
  if (item.disabled) return

  // action을 emit 이벤트로 변환
  if (item.action === 'share') {
    emit('share')
  } else if (item.action === 'export') {
    emit('export')
  } else if (item.action.startsWith('print-')) {
    // print-barcode, print-qrcode, print-label, print-data
    const printMode = item.action.replace('print-', '')
    emit('print', printMode === 'data' ? 'data-print' : printMode)
  }
}
</script>
