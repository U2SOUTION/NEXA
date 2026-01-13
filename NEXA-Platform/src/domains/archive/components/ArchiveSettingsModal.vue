<template>
  <BaseModal :model-value="model" @update:model-value="(v) => emit('update:modelValue', v)" modal-id="archive-settings-modal" title-en="ARCHIVE SETTINGS" title-ko="Archive 설정" :initial-size="{ width: 480, height: 620 }" :min-size="{ width: 420, height: 560 }">
    <template #content>
      <div class="modal-content">
        <div class="section">
          <div class="section-title row items-center q-gutter-xs">
            <q-icon name="login" size="18px" class="text-primary" />
            <div class="text-subtitle2">기본 진입 섹션</div>
          </div>
          <q-option-group v-model="localLanding" type="radio" :options="landingOptions" dense />
          <div class="text-caption text-grey-6">Archive 클릭 시 기본으로 열릴 섹션을 선택합니다.</div>
        </div>

        <div class="section">
          <div class="section-title row items-center q-gutter-xs">
            <q-icon name="info" size="18px" class="text-primary" />
            <div class="text-subtitle2">추가 설정</div>
          </div>
          <div class="text-caption text-grey-6">추후 IoT 제어/권한 설정 등을 확장할 수 있습니다.</div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="row justify-end q-gutter-sm q-pa-md footer-actions">
        <q-btn unelevated dense label="기본값" class="save-btn set-btn-default" @click="resetLanding" />
        <q-btn unelevated dense label="저장" class="save-btn set-btn-save" @click="save" />
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '@system/components/ui/BaseModal.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  defaultLanding: {
    type: String,
    default: 'index',
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const landingOptions = [
  { label: 'Index', value: 'index' },
  { label: 'Hub', value: 'hub' },
  { label: 'Editor', value: 'editor' },
  { label: 'Connector', value: 'connector' },
  { label: 'Insights', value: 'insights' },
]

const localLanding = ref(props.defaultLanding || 'index')

watch(
  () => props.defaultLanding,
  (val) => {
    localLanding.value = val || 'index'
  },
)

function resetLanding() {
  localLanding.value = 'index'
}

function save() {
  emit('save', localLanding.value || 'index')
  model.value = false
}
</script>

<style lang="scss" scoped>
.modal-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-x: hidden;
}

.section {
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 6px;
  padding: 10px 12px;
}

.section-title {
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 6px;
}

.footer-actions {
  border-top: 1px solid var(--nexa-border-color);
}

.save-btn {
  min-width: 96px;
  font-weight: 700;
  margin-bottom: 18px;
}

.set-btn-save {
  background: var(--nexa-button-save-bg, var(--nexa-button-primary-bg));
  color: var(--nexa-button-primary-text);
}

.set-btn-default {
  background: var(--nexa-surface);
  color: var(--nexa-text-secondary);
  border: 1px solid var(--nexa-border-color);
}
</style>
