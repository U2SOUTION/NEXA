<template>
  <q-page class="my-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary q-mb-sm">MY</h1>
        <p class="text-body1 text-grey-7">내 정보 및 등록 기기 관리</p>
      </div>

      <q-tabs v-model="myTab" class="q-mb-lg">
        <q-tab name="profile" label="내 정보" icon="account_circle" />
        <q-tab name="projects" label="내 프로젝트" icon="folder" />
        <q-tab name="devices" label="등록한 디바이스" icon="devices_other" />
        <q-tab name="equipment" label="등록한 제작 장비" icon="precision_manufacturing" />
        <q-tab name="settings" label="내 기기 설정" icon="settings" />
        <q-tab name="logout" label="로그아웃" icon="logout" />
      </q-tabs>

      <q-tab-panels v-model="myTab" animated>
        <!-- 내 정보 -->
        <q-tab-panel name="profile" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">내 정보</h3>
          <template v-if="authStore.isLoggedIn && authStore.user">
            <div class="profile-block">
              <div class="profile-row"><span class="profile-label">아이디</span><span class="profile-value">{{ authStore.user.id }}</span></div>
              <div class="profile-row"><span class="profile-label">이메일</span><span class="profile-value">{{ authStore.user.email }}</span></div>
              <div class="profile-row"><span class="profile-label">표시 이름</span><span class="profile-value">{{ authStore.user.display_name || '—' }}</span></div>
              <div class="profile-row"><span class="profile-label">역할</span><span class="profile-value">{{ authStore.user.role }}</span></div>
              <div class="profile-row"><span class="profile-label">등급</span><span class="profile-value">{{ authStore.user.tier }} ({{ authStore.tierLabel }})</span></div>
              <div v-if="authStore.user.allowed_domains != null" class="profile-row"><span class="profile-label">허용 도메인</span><span class="profile-value">{{ formatJson(authStore.user.allowed_domains) }}</span></div>
              <div v-if="authStore.user.created_at" class="profile-row"><span class="profile-label">가입일</span><span class="profile-value">{{ formatDate(authStore.user.created_at) }}</span></div>
              <div v-if="authStore.user.updated_at" class="profile-row"><span class="profile-label">수정일</span><span class="profile-value">{{ formatDate(authStore.user.updated_at) }}</span></div>
            </div>
          </template>
          <template v-else>
            <p class="q-mb-md">로그인이 필요합니다.</p>
            <q-btn flat color="primary" label="로그인" to="/login" />
          </template>
        </q-tab-panel>

        <!-- 내 프로젝트 -->
        <q-tab-panel name="projects" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">내 프로젝트</h3>
          <template v-if="!authStore.isLoggedIn">
            <p class="q-mb-md">로그인이 필요합니다.</p>
            <q-btn flat color="primary" label="로그인" to="/login" />
          </template>
          <template v-else>
            <div class="q-mb-md">
              <q-btn dense color="primary" icon="add" label="프로젝트 추가" @click="openProjectDialog" :loading="projectStore.loading" />
            </div>
            <div v-if="projectStore.loading" class="text-center q-pa-lg"><q-spinner-dots color="primary" /></div>
            <div v-else-if="projectStore.error" class="text-negative q-mb-md">{{ projectStore.error }}</div>
            <div v-else-if="projectStore.projects.length === 0" class="empty-state text-center q-pa-xl">
              <q-icon name="folder" size="64px" color="grey-5" class="q-mb-md" />
              <div class="text-h6 text-grey-7 q-mb-sm">등록한 프로젝트가 없습니다</div>
              <div class="text-caption text-grey-6">위 "프로젝트 추가" 버튼으로 추가하세요.</div>
            </div>
            <div v-else class="project-list">
              <div v-for="p in projectStore.projects" :key="p.id" class="device-row q-pa-sm q-mb-sm rounded-borders" style="background: var(--q-color-dark); border: 1px solid rgba(255,255,255,0.1);">
                <div class="row items-center justify-between">
                  <div>
                    <span class="text-weight-medium">{{ p.name || '(이름 없음)' }}</span>
                    <span v-if="p.description" class="q-ml-sm text-caption text-grey-6">{{ p.description }}</span>
                  </div>
                  <div class="text-caption text-grey-6">{{ formatDate(p.created_at) }}</div>
                </div>
              </div>
            </div>
          </template>

          <q-dialog v-model="showProjectDialog" persistent>
            <q-card style="min-width: 360px">
              <q-card-section>
                <div class="text-h6">새 프로젝트</div>
              </q-card-section>
              <q-card-section>
                <q-input v-model="projectForm.name" label="이름" outlined dense class="q-mb-sm" />
                <q-input v-model="projectForm.description" label="설명 (선택)" outlined dense type="textarea" autogrow />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="취소" v-close-popup @click="closeProjectDialog" />
                <q-btn unelevated color="primary" label="추가" :loading="projectStore.loading" @click="submitProject" />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-tab-panel>

        <!-- 등록한 디바이스 -->
        <q-tab-panel name="devices" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">등록한 디바이스</h3>
          <template v-if="!authStore.isLoggedIn">
            <p class="q-mb-md">로그인이 필요합니다.</p>
            <q-btn flat color="primary" label="로그인" to="/login" />
          </template>
          <template v-else>
            <div class="q-mb-md">
              <q-btn dense color="primary" icon="add" label="디바이스 등록" @click="openRegisterDevice" :loading="loadingRegister" />
            </div>
            <div v-if="loadingDevices" class="text-center q-pa-lg"><q-spinner-dots color="primary" /></div>
            <div v-else-if="devicesError" class="text-negative q-mb-md">{{ devicesError }}</div>
            <div v-else-if="deviceList.length === 0" class="empty-state text-center q-pa-xl">
              <q-icon name="devices_other" size="64px" color="grey-5" class="q-mb-md" />
              <div class="text-h6 text-grey-7 q-mb-sm">등록한 디바이스가 없습니다</div>
              <div class="text-caption text-grey-6">위 "디바이스 등록" 버튼으로 추가하세요.</div>
            </div>
            <div v-else class="device-list">
              <div v-for="d in deviceList" :key="d.id" class="device-row q-pa-sm q-mb-sm rounded-borders" style="background: var(--q-color-dark); border: 1px solid rgba(255,255,255,0.1);">
                <div class="row items-center justify-between">
                  <div>
                    <span class="text-weight-medium">{{ d.name || '(이름 없음)' }}</span>
                    <span v-if="d.device_type" class="q-ml-sm text-caption text-grey-6">{{ d.device_type }}</span>
                    <span v-if="d.role" class="q-ml-sm text-caption">({{ d.role }})</span>
                  </div>
                  <div class="text-caption text-grey-6">
                    <span v-if="d.last_seen">마지막 접속 {{ formatDate(d.last_seen) }}</span>
                    <q-badge v-if="!d.is_active" color="grey" label="비활성" class="q-ml-sm" />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 디바이스 등록 다이얼로그 -->
          <q-dialog v-model="showRegisterDialog" persistent>
            <q-card style="min-width: 360px">
              <q-card-section>
                <div class="text-h6">새 디바이스 등록</div>
              </q-card-section>
              <q-card-section v-if="!newDeviceToken">
                <q-input v-model="registerForm.name" label="이름 (선택)" outlined dense class="q-mb-sm" />
                <q-input v-model="registerForm.device_type" label="유형 (선택, 예: esp32)" outlined dense />
              </q-card-section>
              <q-card-section v-else>
                <p class="text-caption text-warning q-mb-sm">device_token은 이번에만 표시됩니다. 안전하게 저장하세요.</p>
                <q-input v-model="newDeviceToken" outlined dense readonly class="q-mb-sm">
                  <template #append>
                    <q-btn flat dense icon="content_copy" @click="copyDeviceToken" />
                  </template>
                </q-input>
              </q-card-section>
              <q-card-actions align="right">
                <template v-if="!newDeviceToken">
                  <q-btn flat label="취소" v-close-popup @click="closeRegisterDialog" />
                  <q-btn unelevated color="primary" label="등록" :loading="loadingRegister" @click="submitRegisterDevice" />
                </template>
                <template v-else>
                  <q-btn flat label="닫기" v-close-popup @click="closeRegisterDialog" />
                </template>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-tab-panel>

        <!-- 등록한 제작 장비 -->
        <q-tab-panel name="equipment" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="precision_manufacturing" size="24px" class="q-mr-sm" />
            등록한 제작 장비
          </h3>
          <div class="empty-state text-center q-pa-xl">
            <q-icon name="precision_manufacturing" size="64px" color="grey-5" class="q-mb-md" />
            <div class="text-h6 text-grey-7 q-mb-sm">등록한 제작 장비가 없습니다</div>
            <div class="text-caption text-grey-6">
              제작 장비를 등록하여 관리하세요
            </div>
          </div>
        </q-tab-panel>

        <!-- 내 기기 설정 -->
        <q-tab-panel name="settings" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="settings" size="24px" class="q-mr-sm" />
            내 기기 설정
          </h3>
          <div class="text-body2 text-grey-7">
            등록한 기기의 설정을 관리할 수 있습니다.
          </div>
        </q-tab-panel>

        <!-- 로그아웃 -->
        <q-tab-panel name="logout" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="logout" size="24px" class="q-mr-sm" />
            로그아웃
          </h3>
          <p class="text-body2 text-grey-7 q-mb-md">
            현재 세션에서 로그아웃합니다.
          </p>
          <q-btn v-if="authStore.isLoggedIn" color="primary" flat label="로그아웃" icon="logout" @click="handleLogout" />
          <p v-else class="text-body2 text-grey-6">로그인된 상태가 아닙니다.</p>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Device } from '@system/types'
import { useAuthStore } from '@system/store/authStore'
import { useProjectStore } from '@system/store/projectStore'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const myTab = ref('profile')

const deviceList = ref<Device[]>([])
const loadingDevices = ref(false)
const devicesError = ref('')
const showRegisterDialog = ref(false)
const newDeviceToken = ref('')
const loadingRegister = ref(false)
const registerForm = ref({ name: '', device_type: '' })

onMounted(() => {
  authStore.init()
})

const showProjectDialog = ref(false)
const projectForm = ref({ name: '', description: '' })

watch(myTab, (tab) => {
  if (tab === 'devices' && authStore.isLoggedIn) fetchDevices()
  if (tab === 'projects' && authStore.isLoggedIn) projectStore.fetchProjects()
})

function openProjectDialog() {
  projectForm.value = { name: '', description: '' }
  showProjectDialog.value = true
}

function closeProjectDialog() {
  showProjectDialog.value = false
}

async function submitProject() {
  if (!projectForm.value.name?.trim()) return
  const created = await projectStore.createProject({
    name: projectForm.value.name.trim(),
    description: projectForm.value.description?.trim() || undefined,
  })
  if (created) {
    showProjectDialog.value = false
  }
}

async function fetchDevices() {
  if (!authStore.isLoggedIn) return
  loadingDevices.value = true
  devicesError.value = ''
  try {
    const res = await fetch(`${getApiBaseUrl()}/devices`, {
      headers: authStore.getAuthHeaders() as Record<string, string>,
    })
    if (res.status === 401) {
      devicesError.value = '인증이 만료되었습니다. 다시 로그인해 주세요.'
      return
    }
    if (!res.ok) {
      devicesError.value = `목록 조회 실패 (${res.status})`
      return
    }
    const data = await res.json()
    deviceList.value = Array.isArray(data) ? (data as Device[]) : []
  } catch (e) {
    devicesError.value = (e instanceof Error ? e.message : (e ? String(e) : '목록 조회 중 오류'))
  } finally {
    loadingDevices.value = false
  }
}

function openRegisterDevice() {
  newDeviceToken.value = ''
  registerForm.value = { name: '', device_type: '' }
  showRegisterDialog.value = true
}

function closeRegisterDialog() {
  showRegisterDialog.value = false
  newDeviceToken.value = ''
  if (authStore.isLoggedIn) fetchDevices()
}

async function submitRegisterDevice() {
  loadingRegister.value = true
  try {
    const res = await fetch(`${getApiBaseUrl()}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authStore.getAuthHeaders() as Record<string, string>) },
      body: JSON.stringify({
        name: registerForm.value.name || undefined,
        device_type: registerForm.value.device_type || undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      devicesError.value = data.message || data.error || `등록 실패 (${res.status})`
      return
    }
    newDeviceToken.value = data.device_token || ''
  } catch (e) {
    devicesError.value = (e instanceof Error ? e.message : (e ? String(e) : '등록 중 오류'))
  } finally {
    loadingRegister.value = false
  }
}

function copyDeviceToken() {
  if (!newDeviceToken.value) return
  navigator.clipboard.writeText(newDeviceToken.value).then(() => {
    // Quasar Notify 없이 간단히 처리 가능; 필요 시 $q.notify
  }).catch(() => {})
}

function formatDate(value: string | number | Date | null | undefined) {
  if (!value) return '—'
  try {
    const d = new Date(value as string | number)
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString('ko-KR')
  } catch {
    return String(value)
  }
}

function formatJson(value: unknown) {
  if (value == null) return '—'
  return typeof value === 'string' ? value : JSON.stringify(value)
}

async function handleLogout() {
  projectStore.clear()
  await authStore.logout()
  router.push('/')
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.my-page {
  background: var(--nexa-background);
  min-height: 100vh;
}

.network-tab-panel {
  counter-reset: section-counter;
  background-color: var(--nexa-background-lower);
  border-radius: 4px;
  padding: 16px 35px;
}

.profile-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.profile-row {
  display: flex;
  gap: 12px;
  align-items: baseline;
}
.profile-label {
  flex: 0 0 100px;
  font-size: 0.85rem;
  color: var(--q-color-grey-7);
}
.profile-value {
  word-break: break-all;
}
</style>

