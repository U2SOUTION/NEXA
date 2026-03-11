<template>
  <div class="project-selector">
    <q-select
      v-model="selectedId"
      :options="selectOptions"
      option-value="id"
      option-label="label"
      emit-value
      map-options
      dense
      outlined
      :loading="projectStore.loading"
      :label="label"
      class="project-select"
      @update:model-value="onSelect"
    >
      <template #prepend>
        <q-icon name="folder" size="20px" />
      </template>
      <template #append>
        <q-btn flat dense round icon="add" size="sm" title="새 프로젝트" @click.stop="openCreateDialog" />
      </template>
    </q-select>

    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">새 프로젝트</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newName" label="이름" outlined dense class="q-mb-sm" />
          <q-input v-model="newDescription" label="설명 (선택)" outlined dense type="textarea" autogrow />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup @click="showCreateDialog = false" />
          <q-btn unelevated color="primary" label="추가" :loading="projectStore.loading" :disable="!newName.trim()" @click="submitCreate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProjectStore } from '@system/store/projectStore'
import { useAuthStore } from '@system/store/authStore'

withDefaults(
  defineProps<{
    label?: string
  }>(),
  { label: '프로젝트' }
)

const projectStore = useProjectStore()
const authStore = useAuthStore()

const selectedId = ref<string | null>(null)
const showCreateDialog = ref(false)
const newName = ref('')
const newDescription = ref('')

const selectOptions = computed(() => {
  const list = projectStore.projects.map((p) => ({
    id: p.id,
    label: p.name || '(이름 없음)',
  }))
  return list
})

watch(
  () => projectStore.currentProjectId,
  (id) => {
    selectedId.value = id
  },
  { immediate: true }
)

watch(
  () => projectStore.projects,
  () => {
    if (projectStore.currentProjectId && !projectStore.projects.some((p) => p.id === projectStore.currentProjectId)) {
      projectStore.setCurrentProject(null)
    }
    selectedId.value = projectStore.currentProjectId
  },
  { deep: true }
)

function onSelect(id: string | null) {
  projectStore.setCurrentProject(id)
}

function openCreateDialog() {
  newName.value = ''
  newDescription.value = ''
  showCreateDialog.value = true
}

async function submitCreate() {
  if (!newName.value.trim()) return
  const created = await projectStore.createProject({
    name: newName.value.trim(),
    description: newDescription.value.trim() || undefined,
  })
  if (created) {
    projectStore.setCurrentProject(created.id)
    showCreateDialog.value = false
  }
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    projectStore.fetchProjects()
  }
})
</script>

<style scoped>
.project-selector {
  min-width: 180px;
}
</style>
