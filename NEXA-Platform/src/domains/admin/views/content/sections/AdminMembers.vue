<!-- [NEXA-ADMIN-01] 회원 목록 - Quasar 테이블 -->
<template>
  <div class="admin-section">
    <div class="text-h5 q-mb-md">회원 목록</div>
    <p v-if="fetchError" class="text-body2 text-negative q-mb-md">{{ fetchError }}</p>
    <p v-else class="text-body2 text-grey-7 q-mb-md">가입일, Tier·역할 등 필터·검색 (추후 확장)</p>
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="loading"
      :pagination="pagination"
      @request="onRequest"
      class="admin-members-table"
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.status === 'active' ? 'positive' : 'grey'">
            {{ props.row.status === 'active' ? '활성' : '비활성' }}
          </q-badge>
        </q-td>
      </template>
      <template #no-data>
        <div class="full-width row flex-center q-pa-lg text-grey-7">
          {{ loading ? '불러오는 중…' : '등록된 회원이 없습니다.' }}
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'
import { useAuthStore } from '@system/store/authStore'

// 검색은 왼쪽 사이드바 통합 검색(adminStore.searchQuery, searchScope) 사용. 추후 필터·분기 연동

const authStore = useAuthStore()
const loading = ref(false)
const rows = ref<MemberRow[]>([])
const fetchError = ref<string | null>(null)

const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const columns = [
  { name: 'email', label: '이메일', align: 'left', field: 'email', sortable: true },
  { name: 'displayName', label: '이름', align: 'left', field: 'displayName', sortable: true },
  { name: 'role', label: '역할', align: 'left', field: 'role', sortable: true },
  { name: 'tier', label: 'Tier', align: 'left', field: 'tier', sortable: true },
  { name: 'status', label: '상태', align: 'center', field: 'status' },
  { name: 'createdAt', label: '가입일', align: 'left', field: 'createdAt', sortable: true },
]

interface MemberRow {
  id: string
  email: string
  displayName: string
  role: string
  tier: string
  status: 'active' | 'inactive'
  createdAt: string
}

interface ApiMember {
  id: string
  email: string
  display_name: string
  role: string
  tier: string
  created_at: string
  status: 'active' | 'inactive'
}

function onRequest(props: { pagination: { page: number; rowsPerPage: number; sortBy: string; descending: boolean } }) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  fetchMembers()
}

function toMemberRow(r: ApiMember): MemberRow {
  return {
    id: r.id,
    email: r.email,
    displayName: r.display_name ?? '',
    role: r.role ?? 'user',
    tier: r.tier ?? 'BASIC',
    status: r.status,
    createdAt: r.created_at ? new Date(r.created_at).toLocaleString('ko-KR') : '',
  }
}

async function fetchMembers() {
  if (!authStore.isLoggedIn) {
    rows.value = []
    fetchError.value = '로그인이 필요합니다.'
    return
  }
  loading.value = true
  fetchError.value = null
  try {
    const headers = authStore.getAuthHeaders() as Record<string, string>
    const res = await fetch(`${getApiBaseUrl()}/admin/members`, { headers })
    if (res.status === 401) {
      fetchError.value = '인증이 만료되었습니다. 다시 로그인해 주세요.'
      rows.value = []
      pagination.value.rowsNumber = 0
      return
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      fetchError.value = (body as { message?: string }).message ?? `조회 실패 (${res.status})`
      rows.value = []
      pagination.value.rowsNumber = 0
      return
    }
    const data = (await res.json()) as ApiMember[]
    rows.value = Array.isArray(data) ? data.map(toMemberRow) : []
    pagination.value.rowsNumber = rows.value.length
  } catch (e) {
    fetchError.value = e instanceof Error ? e.message : String(e)
    rows.value = []
    pagination.value.rowsNumber = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMembers()
})
</script>

<style lang="scss" scoped>
.admin-section {
  width: 100%;
}
.admin-members-table {
  th {
    font-weight: 600;
  }
}
</style>
