/**
 * 전역 프로젝트 스토어 [NEXA-AUTH-01] §2.2 3단계
 * 로그인 사용자의 프로젝트 목록·현재 선택 프로젝트.
 * MY 페이지·아카이브·ERP 등 모든 도메인에서 동일 스토어 사용.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '@system/types'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl'
import { useAuthStore } from '@system/store/authStore'

const STORAGE_CURRENT_PROJECT = 'nexa_current_project_id'

export type { Project }

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const currentProjectId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentProject = computed(() => {
    const id = currentProjectId.value
    if (!id) return null
    return projects.value.find((p) => p.id === id) ?? null
  })

  function getAuthHeaders(): Record<string, string> {
    const auth = useAuthStore()
    return auth.getAuthHeaders() as Record<string, string>
  }

  function loadStoredCurrentProject() {
    try {
      const id = localStorage.getItem(STORAGE_CURRENT_PROJECT)
      if (id && projects.value.some((p) => p.id === id)) {
        currentProjectId.value = id
      }
    } catch {
      // ignore
    }
  }

  async function fetchProjects(): Promise<void> {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      projects.value = []
      currentProjectId.value = null
      return
    }
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${getApiBaseUrl()}/projects`, {
        headers: getAuthHeaders(),
      })
      if (res.status === 401) {
        projects.value = []
        currentProjectId.value = null
        return
      }
      if (!res.ok) {
        error.value = `목록 조회 실패 (${res.status})`
        return
      }
      const data = await res.json()
      projects.value = Array.isArray(data) ? data : []
      loadStoredCurrentProject()
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload: { name: string; description?: string }): Promise<Project | null> {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return null
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${getApiBaseUrl()}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          name: payload.name.trim(),
          description: payload.description?.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        error.value = (data as { message?: string }).message ?? `추가 실패 (${res.status})`
        return null
      }
      const created = data as Project
      projects.value = [created, ...projects.value]
      return created
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      return null
    } finally {
      loading.value = false
    }
  }

  function setCurrentProject(id: string | null): void {
    currentProjectId.value = id
    try {
      if (id) {
        localStorage.setItem(STORAGE_CURRENT_PROJECT, id)
      } else {
        localStorage.removeItem(STORAGE_CURRENT_PROJECT)
      }
    } catch {
      // ignore
    }
  }

  function clear(): void {
    projects.value = []
    currentProjectId.value = null
    error.value = null
    try {
      localStorage.removeItem(STORAGE_CURRENT_PROJECT)
    } catch {
      // ignore
    }
  }

  return {
    projects,
    currentProjectId,
    currentProject,
    loading,
    error,
    fetchProjects,
    createProject,
    setCurrentProject,
    loadStoredCurrentProject,
    clear,
  }
})
