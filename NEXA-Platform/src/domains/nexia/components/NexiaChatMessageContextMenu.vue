<!--
  Cockpit 채팅 메시지 영역용 우클릭 메뉴 (Teleport + QMenu).
  - 부모에서 document 캡처·대상 텍스트 해석 후 modelValue / anchor / hasText 등만 넘김
  - prepend / append 슬롯으로 다른 패널·기능에서 항목 확장 (이미지·미디어 등)
-->
<template>
  <Teleport to="body">
    <div v-if="active" class="nexia-chat-message-ctx-anchor" :style="anchorStyle" aria-hidden="true">
      <q-menu
        :model-value="modelValue"
        class="nexia-chat-messages-context-menu"
        anchor="top left"
        self="top left"
        @update:model-value="$emit('update:modelValue', $event)"
      >
        <q-list dense style="min-width: 200px">
          <slot name="prepend" :has-text="hasText" :editor-available="editorAvailable" :close="closeMenu" />
          <q-item clickable :disable="!hasText" @click.capture.stop="onCopyClick">
            <q-item-section avatar><q-icon name="content_copy" size="sm" /></q-item-section>
            <q-item-section>복사</q-item-section>
          </q-item>
          <q-item clickable v-close-popup :disable="!hasText" @click="$emit('addMemo')">
            <q-item-section avatar><q-icon name="sticky_note_2" size="sm" /></q-item-section>
            <q-item-section>메모에 추가</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-close-popup :disable="!hasText || !editorAvailable" @click="$emit('insertEthos')">
            <q-item-section avatar><q-icon name="edit_note" size="sm" /></q-item-section>
            <q-item-section>Ethos(에토스)에 삽입</q-item-section>
          </q-item>
          <q-item clickable v-close-popup :disable="!hasText || !editorAvailable" @click="$emit('insertGlos')">
            <q-item-section avatar><q-icon name="code" size="sm" /></q-item-section>
            <q-item-section>Glos(글로스)에 삽입</q-item-section>
          </q-item>
          <slot name="append" :has-text="hasText" :editor-available="editorAvailable" :close="closeMenu" />
        </q-list>
      </q-menu>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** q-menu 열림 */
  modelValue: { type: Boolean, default: false },
  /** 채널 선택 등으로 앵커 DOM을 마운트할지 */
  active: { type: Boolean, default: true },
  anchorX: { type: Number, default: 0 },
  anchorY: { type: Number, default: 0 },
  hasText: { type: Boolean, default: false },
  editorAvailable: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'copy', 'addMemo', 'insertEthos', 'insertGlos'])

const anchorStyle = computed(() => ({
  position: 'fixed',
  left: `${props.anchorX}px`,
  top: `${props.anchorY}px`,
  width: '1px',
  height: '1px',
  zIndex: 7000,
}))

function closeMenu() {
  emit('update:modelValue', false)
}

function onCopyClick() {
  emit('copy')
}
</script>
