import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl.js'

export const usePartsDataStore = defineStore('partsData', () => {
  // 상태
  const partClasses = ref([])
  const trashPartClasses = ref([]) // 휴지통에 있는 부품 클래스 목록
  const trashCount = ref(0) // 휴지통 개수
  const partModels = ref([])
  const partSpecs = ref([])
  const partFiles = ref([])
  const selectedPartClass = ref(null)
  const selectedPartClasses = ref([]) // 복수 선택된 부품 클래스 목록
  const isSidebarDetailViewActive = ref(false) // 사이드바 상세 뷰 활성화 상태 (상세 모드 진입 여부)

  // 복수 선택 모드 설정 (나중에 DB화 예정)
  const multiSelectSummaryThreshold = ref(5) // 요약 모드로 표시할 최대 개수 (기본값: 5, 최소값: 1)
  const multiSelectListThreshold = ref(6) // 리스트 모드로 표시할 최소 개수 (기본값: 6, 최소값: 1)

  // API 기본 URL (환경에 따라 변경)
  const API_BASE_URL = getApiBaseUrl()
  const API_BASE_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

  // 부품 클래스 관련
  async function fetchPartClasses() {
    try {
      const response = await fetch(`${API_BASE_URL}/part-classes`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      partClasses.value = data
    } catch (error) {
      console.error('Failed to fetch part classes:', error)
      // API 서버가 실행되지 않은 경우 빈 배열 반환
      partClasses.value = []
      throw error
    }
  }

  // 휴지통에 있는 부품 클래스 목록 조회
  async function fetchTrashPartClasses() {
    try {
      const response = await fetch(`${API_BASE_URL}/part-classes/trash`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      trashPartClasses.value = data
      return data
    } catch (error) {
      console.error('Failed to fetch trash part classes:', error)
      trashPartClasses.value = []
      throw error
    }
  }

  // 휴지통 개수 조회
  async function fetchTrashCount() {
    try {
      const response = await fetch(`${API_BASE_URL}/part-classes/trash/count`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      trashCount.value = Number(data.count) || 0
      return trashCount.value
    } catch (error) {
      console.error('Failed to fetch trash count:', error)
      trashCount.value = 0
      throw error
    }
  }

  async function createPartClass(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      const newClass = await response.json()
      partClasses.value.push(newClass)
      return newClass
    } catch (error) {
      console.error('Failed to create part class:', error)
      throw error
    }
  }

  async function updatePartClass(id, data) {
    try {
      console.log('[updatePartClass] 시작:', { id, data })
      const response = await fetch(`${API_BASE_URL}/part-classes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      console.log('[updatePartClass] 응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[updatePartClass] 오류:', errorData)
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const updated = await response.json()
      console.log('[updatePartClass] 업데이트된 데이터:', updated)

      const index = partClasses.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        partClasses.value[index] = updated
      }

      console.log('[updatePartClass] 반환:', updated)
      return updated // 업데이트된 객체 반환 (파일 업로드를 위해 필요)
    } catch (error) {
      console.error('[updatePartClass] 실패:', error)
      throw error
    }
  }

  async function deletePartClass(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-classes/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      // soft delete 되었으므로 활성 목록에서만 제거
      partClasses.value = partClasses.value.filter((c) => c.id !== id)
      // 휴지통 카운트는 필요 시 상위 컴포넌트에서 fetchTrashCount 호출로 갱신
    } catch (error) {
      console.error('Failed to delete part class:', error)
      throw error
    }
  }

  // 복수 삭제 (soft delete) - ids: number[]
  async function bulkDeletePartClasses(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('ids 배열이 필요합니다.')
      }

      const response = await fetch(`${API_BASE_URL}/part-classes/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // soft delete 된 항목을 활성 목록에서 제거
      const idSet = new Set(ids.map((id) => Number(id)))
      partClasses.value = partClasses.value.filter((c) => !idSet.has(Number(c.id)))

      return result
    } catch (error) {
      console.error('Failed to bulk delete part classes:', error)
      throw error
    }
  }

  // 단일 복구
  async function restorePartClass(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-classes/${id}/restore`, {
        method: 'POST',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const restored = data.item

      if (restored && restored.id) {
        // 활성 목록에 추가 (단, 중복 방지)
        const existingIndex = partClasses.value.findIndex((c) => c.id === restored.id)
        if (existingIndex !== -1) {
          partClasses.value[existingIndex] = restored
        } else {
          partClasses.value.push(restored)
        }
        // 휴지통 목록에서 제거
        trashPartClasses.value = trashPartClasses.value.filter((c) => c.id !== restored.id)
      }

      return restored
    } catch (error) {
      console.error('Failed to restore part class:', error)
      throw error
    }
  }

  // 복수 복구 - ids: number[]
  async function bulkRestorePartClasses(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('ids 배열이 필요합니다.')
      }

      const response = await fetch(`${API_BASE_URL}/part-classes/bulk-restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // 복구 후 활성 목록을 다시 불러오고, 휴지통 목록/카운트는 상위에서 재조회 가능
      await fetchPartClasses()
      // 휴지통 목록은 사용 중일 때 상위에서 fetchTrashPartClasses를 다시 호출하는 편이 명확

      return result
    } catch (error) {
      console.error('Failed to bulk restore part classes:', error)
      throw error
    }
  }

  // 휴지통에서 영구 삭제 (파일 포함)
  async function permanentDeletePartClass(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-classes/${id}/permanent`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      const result = await response.json()

      // 휴지통 목록에서 제거
      trashPartClasses.value = trashPartClasses.value.filter((c) => c.id !== id)

      return result
    } catch (error) {
      console.error('Failed to permanently delete part class:', error)
      throw error
    }
  }

  // 활성화/비활성화 (단일)
  async function togglePartClassActiveStatus(id, isActive) {
    try {
      // 기존 데이터를 가져와서 is_active만 변경
      const existingItem = partClasses.value.find((c) => c.id === id)
      if (!existingItem) {
        throw new Error('항목을 찾을 수 없습니다.')
      }

      // 필수 필드 확인 및 데이터 준비
      const updateData = {
        name: existingItem.name,
        category: existingItem.category,
        c_code: existingItem.c_code || '',
        code_name: existingItem.code_name || '',
        description: existingItem.description || '',
        example: existingItem.example || '',
        detailed_description: existingItem.detailed_description || '',
        sort_order: existingItem.sort_order,
        is_active: isActive ? 1 : 0,
      }

      console.log('[togglePartClassActiveStatus] 업데이트 데이터:', {
        id,
        isActive,
        updateData,
        existingItem,
      })

      // 기존 updatePartClass 함수를 사용하여 전체 데이터와 함께 업데이트
      const updated = await updatePartClass(id, updateData)

      return updated
    } catch (error) {
      console.error('Failed to toggle part class active status:', error)
      throw error
    }
  }

  // 활성화/비활성화 (복수)
  async function bulkTogglePartClassesActiveStatus(ids, isActive) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('ids 배열이 필요합니다.')
      }

      // 각 항목을 개별적으로 업데이트 (기존 updatePartClass 사용)
      const updatePromises = ids.map(async (id) => {
        const existingItem = partClasses.value.find((c) => c.id === id)
        if (!existingItem) {
          console.warn(`항목 ID ${id}를 찾을 수 없습니다.`)
          return null
        }
        return await updatePartClass(id, {
          ...existingItem,
          is_active: isActive ? 1 : 0,
        })
      })

      const results = await Promise.all(updatePromises)
      const updatedItems = results.filter((item) => item !== null)

      return {
        success: true,
        count: updatedItems.length,
        items: updatedItems,
      }
    } catch (error) {
      console.error('Failed to bulk toggle part classes active status:', error)
      throw error
    }
  }

  // 즐겨찾기 토글 (단일)
  async function togglePartClassFavoriteStatus(id, isFavorite) {
    try {
      // 기존 데이터를 가져와서 is_favorite만 변경
      const existingItem = partClasses.value.find((c) => c.id === id)
      if (!existingItem) {
        throw new Error('항목을 찾을 수 없습니다.')
      }

      // 필수 필드 확인 및 데이터 준비
      const updateData = {
        name: existingItem.name,
        category: existingItem.category,
        c_code: existingItem.c_code || '',
        code_name: existingItem.code_name || '',
        description: existingItem.description || '',
        example: existingItem.example || '',
        detailed_description: existingItem.detailed_description || '',
        sort_order: existingItem.sort_order,
        is_active: existingItem.is_active,
        is_favorite: isFavorite ? 1 : 0,
      }

      // 기존 updatePartClass 함수를 사용하여 전체 데이터와 함께 업데이트
      const updated = await updatePartClass(id, updateData)

      return updated
    } catch (error) {
      console.error('Failed to toggle part class favorite status:', error)
      throw error
    }
  }

  // 즐겨찾기 토글 (복수)
  async function bulkTogglePartClassesFavoriteStatus(ids, isFavorite) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('ids 배열이 필요합니다.')
      }

      // 각 항목을 개별적으로 업데이트 (기존 updatePartClass 사용)
      const updatePromises = ids.map(async (id) => {
        const existingItem = partClasses.value.find((c) => c.id === id)
        if (!existingItem) {
          console.warn(`항목 ID ${id}를 찾을 수 없습니다.`)
          return null
        }
        return await updatePartClass(id, {
          ...existingItem,
          is_favorite: isFavorite ? 1 : 0,
        })
      })

      const results = await Promise.all(updatePromises)
      const updatedItems = results.filter((item) => item !== null)

      return {
        success: true,
        count: updatedItems.length,
        items: updatedItems,
      }
    } catch (error) {
      console.error('Failed to bulk toggle part classes favorite status:', error)
      throw error
    }
  }

  // sort_order 재정렬 (10단위로 재정렬)
  async function reinitializeSortOrder() {
    try {
      const response = await fetch(`${API_BASE_URL}/part-classes/reinitialize-sort-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // 재정렬 후 데이터 다시 가져오기
      await fetchPartClasses()

      return result
    } catch (error) {
      console.error('Failed to reinitialize sort order:', error)
      throw error
    }
  }

  async function reorderPartClasses(items) {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('items 배열이 필요합니다.')
      }

      // 유효한 항목만 필터링
      const validItems = items
        .filter(
          (item) =>
            item &&
            typeof item === 'object' &&
            typeof item.id === 'number' &&
            !isNaN(item.id) &&
            item.id > 0 &&
            typeof item.sort_order === 'number' &&
            !isNaN(item.sort_order) &&
            item.sort_order >= 0 &&
            typeof (item.sub_sort_order ?? 0) === 'number' &&
            !isNaN(item.sub_sort_order ?? 0),
        )
        .map((item) => ({
          id: Number(item.id),
          sort_order: Number(item.sort_order),
          sub_sort_order: Number(item.sub_sort_order ?? 0),
        }))

      if (validItems.length === 0) {
        throw new Error('유효한 항목이 없습니다.')
      }

      // 디버깅: API 호출 전 데이터 확인
      if (import.meta.env.DEV) {
        console.log('[API] 순서 변경 요청 (전체):', JSON.stringify(validItems, null, 2))
      }

      const response = await fetch(`${API_BASE_URL}/part-classes/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validItems }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // 디버깅: API 응답 확인
      if (import.meta.env.DEV) {
        console.log('[API] 순서 변경 응답:', JSON.stringify(result, null, 2))
      }

      // 재정렬 후 데이터 다시 가져오기
      await fetchPartClasses()

      // 디버깅: 데이터 재조회 후 확인
      if (import.meta.env.DEV) {
        console.log('[API] 데이터 재조회 후 확인:')
        validItems.forEach((item) => {
          const found = partClasses.value.find((p) => p.id === item.id)
          console.log(`[API] 항목 ID ${item.id}:`, {
            요청값: item.sort_order,
            실제값: found?.sort_order,
            이름: found?.name,
            일치여부: item.sort_order === found?.sort_order,
          })
        })
      }
    } catch (error) {
      console.error('Failed to reorder part classes:', error)
      throw error
    }
  }

  // 부품 모델 관련
  async function fetchPartModels(classId = null) {
    try {
      const url = classId
        ? `${API_BASE_URL}/part-models/class/${classId}`
        : `${API_BASE_URL}/part-models`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      partModels.value = data
    } catch (error) {
      console.error('Failed to fetch part models:', error)
      partModels.value = []
      throw error
    }
  }

  // 부품 스펙 관련
  async function fetchPartSpecs(modelId = null) {
    try {
      const url = modelId
        ? `${API_BASE_URL}/part-specs/model/${modelId}`
        : `${API_BASE_URL}/part-specs`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      partSpecs.value = data
    } catch (error) {
      console.error('Failed to fetch part specs:', error)
      partSpecs.value = []
      throw error
    }
  }

  async function createPartSpec(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-specs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      const newSpec = await response.json()
      partSpecs.value.push(newSpec)
      return newSpec
    } catch (error) {
      console.error('Failed to create part spec:', error)
      throw error
    }
  }

  async function updatePartSpec(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-specs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      const updated = await response.json()
      const index = partSpecs.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        partSpecs.value[index] = updated
      }
    } catch (error) {
      console.error('Failed to update part spec:', error)
      throw error
    }
  }

  async function deletePartSpec(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-specs/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      partSpecs.value = partSpecs.value.filter((s) => s.id !== id)
    } catch (error) {
      console.error('Failed to delete part spec:', error)
      throw error
    }
  }

  // 부품 파일 관련
  async function fetchPartFiles(specId = null) {
    try {
      const url = specId
        ? `${API_BASE_URL}/part-files/spec/${specId}`
        : `${API_BASE_URL}/part-files`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      partFiles.value = data
    } catch (error) {
      console.error('Failed to fetch part files:', error)
      partFiles.value = []
      throw error
    }
  }

  async function createPartFile(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      const newFile = await response.json()
      partFiles.value.push(newFile)
      return newFile
    } catch (error) {
      console.error('Failed to create part file:', error)
      throw error
    }
  }

  async function updatePartFile(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-files/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      const updated = await response.json()
      const index = partFiles.value.findIndex((f) => f.id === id)
      if (index !== -1) {
        partFiles.value[index] = updated
      }
    } catch (error) {
      console.error('Failed to update part file:', error)
      throw error
    }
  }

  async function deletePartFile(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-files/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      partFiles.value = partFiles.value.filter((f) => f.id !== id)
    } catch (error) {
      console.error('Failed to delete part file:', error)
      throw error
    }
  }

  // 파일 업로드 (part_class_id용)
  // progressCallback: (progress) => void - 진행률 콜백 (0-100)
  async function uploadPartClassFile(partClassId, file, progressCallback = null) {
    return new Promise((resolve, reject) => {
      try {
        console.log('[uploadPartClassFile] 시작:', {
          partClassId,
          fileName: file.name,
          fileSize: file.size,
        })

        // 파일 크기 검증 (파일 타입별 크기 제한은 서버에서 확인)
        // 여기서는 기본 검증만 수행
        const MAX_FILE_SIZE = 100 * 1024 * 1024 // 최대 100MB (서버에서 파일 타입별로 제한)
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `파일 크기가 너무 큽니다. (최대 100MB, 현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
          )
        }

        // FormData 생성
        const formData = new FormData()
        formData.append('file', file)
        formData.append('part_class_id', partClassId.toString())

        // XMLHttpRequest 사용 (진행률 표시 지원)
        const xhr = new XMLHttpRequest()

        // 진행률 이벤트 리스너
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && progressCallback) {
            const percentComplete = (e.loaded / e.total) * 100
            progressCallback(percentComplete)
          }
        })

        // 완료 이벤트 리스너
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const uploadedFile = JSON.parse(xhr.responseText)
              console.log('[uploadPartClassFile] 업로드 성공:', uploadedFile)
              // 파일 목록에 추가
              partFiles.value.push(uploadedFile)
              if (progressCallback) progressCallback(100)
              resolve(uploadedFile)
            } catch (parseError) {
              console.error('[uploadPartClassFile] 응답 파싱 실패:', parseError)
              reject(new Error('서버 응답을 파싱할 수 없습니다.'))
            }
          } else {
            // 에러 응답 처리
            try {
              const errorData = JSON.parse(xhr.responseText)
              console.error('[uploadPartClassFile] API 오류:', errorData)
              reject(new Error(errorData.error || `HTTP error! status: ${xhr.status}`))
            } catch {
              reject(new Error(`HTTP error! status: ${xhr.status}`))
            }
          }
        })

        // 에러 이벤트 리스너
        xhr.addEventListener('error', () => {
          console.error('[uploadPartClassFile] 네트워크 오류')
          reject(new Error('네트워크 오류가 발생했습니다.'))
        })

        // 중단 이벤트 리스너
        xhr.addEventListener('abort', () => {
          console.log('[uploadPartClassFile] 업로드 중단')
          reject(new Error('업로드가 중단되었습니다.'))
        })

        // 요청 전송
        xhr.open('POST', `${API_BASE_URL}/part-files/upload`)
        xhr.send(formData)
      } catch (error) {
        console.error('[uploadPartClassFile] 업로드 실패:', error)
        reject(error)
      }
    })
  }

  // 특정 part_class_id의 파일 목록 조회
  async function fetchPartClassFiles(partClassId) {
    try {
      const response = await fetch(`${API_BASE_URL}/part-files?part_class_id=${partClassId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch part class files:', error)
      throw error
    }
  }

  // 일반 첨부 파일만 조회 (에디터 이미지 제외)
  async function fetchPartClassRegularFiles(partClassId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/part-files?part_class_id=${partClassId}&is_editor_image=0`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch part class regular files:', error)
      throw error
    }
  }

  // 에디터 이미지만 조회
  async function fetchPartClassEditorImages(partClassId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/part-files?part_class_id=${partClassId}&is_editor_image=1`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch part class editor images:', error)
      throw error
    }
  }

  // 임시 파일 업로드 (part_class_id 없이도 가능)
  async function uploadTempFile(file) {
    try {
      console.log('[uploadTempFile] 시작:', { fileName: file.name, fileSize: file.size })

      // 파일 크기 검증 (실제 파일 크기 기준, 최대 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `파일 크기가 너무 큽니다. (최대 10MB, 현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        )
      }

      console.log('[uploadTempFile] 파일을 base64로 변환 중...')
      // 파일을 base64로 변환
      const fileBuffer = await file.arrayBuffer()
      const base64Data = btoa(
        new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
      )

      console.log('[uploadTempFile] base64 변환 완료, 크기:', base64Data.length)

      // Base64 인코딩 후 크기 확인 (약 133% 증가)
      const base64Size = base64Data.length
      const estimatedJsonSize = base64Size + 200 // JSON 메타데이터 고려
      if (estimatedJsonSize > 15 * 1024 * 1024) {
        throw new Error(
          `파일이 너무 큽니다. Base64 인코딩 후 크기가 제한을 초과합니다. (최대 10MB 파일 권장)`,
        )
      }

      console.log('[uploadTempFile] API 호출 중...', `${API_BASE_URL}/part-files/upload-temp`)
      const response = await fetch(`${API_BASE_URL}/part-files/upload-temp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          file_data: base64Data,
        }),
      })

      console.log('[uploadTempFile] API 응답:', response.status, response.statusText)

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          console.error('[uploadTempFile] API 오류:', errorData)
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        } else {
          if (response.status === 413) {
            throw new Error(
              '파일 크기가 너무 큽니다. Base64 인코딩으로 인해 실제 전송 크기가 증가합니다. (최대 10MB 파일 권장)',
            )
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      const uploadedFile = await response.json()
      console.log('[uploadTempFile] 업로드 성공:', uploadedFile)

      // 파일 URL 생성 (서버 URL + temp_file_path)
      let filePath = uploadedFile.temp_file_path

      // 한글 경로 처리를 위해 URL 인코딩
      if (filePath.startsWith('uploads/')) {
        const pathAfterUploads = filePath.substring(8)
        const pathParts = pathAfterUploads.split('/')
        filePath = 'uploads/' + pathParts.map((part) => encodeURIComponent(part)).join('/')
      }

      const fileUrl = `${API_BASE_ORIGIN}/${filePath}`

      return {
        ...uploadedFile,
        url: fileUrl, // 에디터에 삽입할 URL
      }
    } catch (error) {
      console.error('[uploadTempFile] 업로드 실패:', error)
      throw error
    }
  }

  // 임시 파일을 정식 폴더로 이동하고 DB에 저장
  async function moveTempFileToPartClass(partClassId, tempFilePath, originalFilename) {
    try {
      console.log('[moveTempFileToPartClass] 시작:', {
        partClassId,
        tempFilePath,
        originalFilename,
      })

      // 임시 파일 경로에서 실제 경로 추출 (URL에서 경로 부분만)
      let relativeTempPath = tempFilePath
      if (tempFilePath.startsWith('http://') || tempFilePath.startsWith('https://')) {
        // URL에서 경로 추출
        const urlObj = new URL(tempFilePath)
        relativeTempPath = urlObj.pathname.startsWith('/')
          ? urlObj.pathname.substring(1)
          : urlObj.pathname
      }

      // 임시 파일이 아니면 에러
      if (!relativeTempPath.startsWith('uploads/_temp/')) {
        throw new Error('임시 파일만 이동할 수 있습니다.')
      }

      // 서버에 이동 요청 (서버에서 SKU와 경로 생성)
      // target_folder_path와 target_filename은 서버에서 자동 생성됨
      const response = await fetch(`${API_BASE_URL}/part-files/move-temp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part_class_id: partClassId,
          temp_file_path: relativeTempPath,
          target_folder_path: '', // 서버에서 자동 생성
          target_filename: '', // 서버에서 자동 생성 (임시 파일 경로에서 확장자 추출)
          original_filename: originalFilename,
          is_editor_image: 1,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '임시 파일 이동 실패')
      }

      const result = await response.json()
      console.log('[moveTempFileToPartClass] 이동 완료:', result)

      // 새로운 파일 URL 생성
      let filePath = result.file_path
      if (filePath.startsWith('uploads/')) {
        const pathAfterUploads = filePath.substring(8)
        const pathParts = pathAfterUploads.split('/')
        filePath = 'uploads/' + pathParts.map((part) => encodeURIComponent(part)).join('/')
      }
      const newFileUrl = `${API_BASE_ORIGIN}/${filePath}`

      return {
        oldUrl: tempFilePath,
        newUrl: newFileUrl,
        filePath: result.file_path,
      }
    } catch (error) {
      console.error('[moveTempFileToPartClass] 이동 실패:', error)
      throw error
    }
  }

  // 사용되지 않는 에디터 이미지 삭제 (지연 삭제)
  async function cleanupOrphanedEditorImages(partClassId, currentImageUrls) {
    try {
      console.log('[cleanupOrphanedEditorImages] 시작:', {
        partClassId,
        imageCount: currentImageUrls.length,
      })

      const response = await fetch(`${API_BASE_URL}/part-files/cleanup-orphaned-editor-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part_class_id: partClassId,
          current_image_urls: currentImageUrls,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('[cleanupOrphanedEditorImages] 삭제 완료:', result)

      return result
    } catch (error) {
      console.error('[cleanupOrphanedEditorImages] 삭제 실패:', error)
      throw error
    }
  }

  // 에디터 이미지 업로드 (part_class_id용, is_editor_image = 1)
  // progressCallback: (progress) => void - 진행률 콜백 (0-100)
  async function uploadEditorImage(partClassId, file, progressCallback = null) {
    return new Promise((resolve, reject) => {
      try {
        console.log('[uploadEditorImage] 시작:', {
          partClassId,
          fileName: file.name,
          fileSize: file.size,
        })

        // 파일 크기 검증 (파일 타입별 크기 제한은 서버에서 확인)
        const MAX_FILE_SIZE = 100 * 1024 * 1024 // 최대 100MB (서버에서 파일 타입별로 제한)
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `파일 크기가 너무 큽니다. (최대 100MB, 현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
          )
        }

        // FormData 생성
        const formData = new FormData()
        formData.append('file', file)
        formData.append('part_class_id', partClassId.toString())
        formData.append('is_editor_image', '1') // 에디터 이미지 표시
        formData.append('filename', file.name) // 원본 파일명 명시적으로 전달

        // XMLHttpRequest 사용 (진행률 표시 지원)
        const xhr = new XMLHttpRequest()

        // 진행률 이벤트 리스너
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && progressCallback) {
            const percentComplete = (e.loaded / e.total) * 100
            progressCallback(percentComplete)
          }
        })

        // 완료 이벤트 리스너
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const uploadedFile = JSON.parse(xhr.responseText)
              console.log('[uploadEditorImage] 업로드 성공:', uploadedFile)

              // 파일 URL 생성 (서버 URL + file_path)
              // 한글 경로 처리를 위해 URL 인코딩
              let filePath = uploadedFile.file_path

              // file_path가 uploads/로 시작하는 경우, 이후 경로만 인코딩
              if (filePath.startsWith('uploads/')) {
                const pathAfterUploads = filePath.substring(8) // 'uploads/'.length = 8
                const pathParts = pathAfterUploads.split('/')
                filePath = 'uploads/' + pathParts.map((part) => encodeURIComponent(part)).join('/')
              } else {
                // uploads/ 접두사가 없으면 추가 후 인코딩
                const pathParts = filePath.split('/')
                filePath = 'uploads/' + pathParts.map((part) => encodeURIComponent(part)).join('/')
              }

              const fileUrl = `${API_BASE_ORIGIN}/${filePath}`

              if (progressCallback) progressCallback(100)
              resolve({
                ...uploadedFile,
                url: fileUrl, // 에디터에 삽입할 URL
              })
            } catch (parseError) {
              console.error('[uploadEditorImage] 응답 파싱 실패:', parseError)
              reject(new Error('서버 응답을 파싱할 수 없습니다.'))
            }
          } else {
            // 에러 응답 처리
            try {
              const errorData = JSON.parse(xhr.responseText)
              console.error('[uploadEditorImage] API 오류:', errorData)
              reject(new Error(errorData.error || `HTTP error! status: ${xhr.status}`))
            } catch {
              reject(new Error(`HTTP error! status: ${xhr.status}`))
            }
          }
        })

        // 에러 이벤트 리스너
        xhr.addEventListener('error', () => {
          console.error('[uploadEditorImage] 네트워크 오류')
          reject(new Error('네트워크 오류가 발생했습니다.'))
        })

        // 중단 이벤트 리스너
        xhr.addEventListener('abort', () => {
          console.log('[uploadEditorImage] 업로드 중단')
          reject(new Error('업로드가 중단되었습니다.'))
        })

        // 요청 전송 (파일명을 쿼리 파라미터로 전달)
        const encodedFilename = encodeURIComponent(file.name)
        const uploadUrl = `${API_BASE_URL}/part-files/upload?filename=${encodedFilename}`
        console.log('[uploadEditorImage] 파일명:', file.name)
        console.log('[uploadEditorImage] 업로드 URL:', uploadUrl)
        xhr.open('POST', uploadUrl)
        xhr.send(formData)
      } catch (error) {
        console.error('[uploadEditorImage] 업로드 실패:', error)
        reject(error)
      }
    })
  }

  return {
    partClasses,
    trashPartClasses,
    trashCount,
    partModels,
    partSpecs,
    partFiles,
    selectedPartClass,
    fetchPartClasses,
    fetchTrashPartClasses,
    fetchTrashCount,
    createPartClass,
    updatePartClass,
    deletePartClass,
    bulkDeletePartClasses,
    restorePartClass,
    bulkRestorePartClasses,
    permanentDeletePartClass,
    togglePartClassActiveStatus,
    bulkTogglePartClassesActiveStatus,
    togglePartClassFavoriteStatus,
    bulkTogglePartClassesFavoriteStatus,
    reorderPartClasses,
    reinitializeSortOrder,
    fetchPartModels,
    fetchPartSpecs,
    createPartSpec,
    updatePartSpec,
    deletePartSpec,
    fetchPartFiles,
    createPartFile,
    updatePartFile,
    deletePartFile,
    uploadPartClassFile,
    uploadEditorImage,
    uploadTempFile,
    moveTempFileToPartClass,
    cleanupOrphanedEditorImages,
    fetchPartClassFiles,
    fetchPartClassRegularFiles,
    fetchPartClassEditorImages,
    isSidebarDetailViewActive,
    selectedPartClasses,
    multiSelectSummaryThreshold,
    multiSelectListThreshold,
  }
})
