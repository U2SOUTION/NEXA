/**
 * 문서 스토리지 관리
 * 로컬 스토리지에 데이터를 저장하고 불러오는 함수들
 */
import { isRef, nextTick } from 'vue'
import type { Ref } from 'vue'
import {
  loadSupportedExtensions as loadExtensions,
  saveSupportedExtensions as saveExtensions,
  removeExtension,
} from '@system/config/documentConfig'
import { getDocFileUrl } from '@system/utils/apiBaseUrl'

/** 체크박스 상태: 파일별 line key -> checked */
export type CheckboxStates = Record<string, Record<string, boolean>>

export interface TOCSettingsInput {
  tocAutoCloseOnContentClick?: Ref<boolean> | boolean
  autoCollapse?: Ref<boolean> | boolean
  autoHighlightOnScroll?: Ref<boolean>
  hideCompleted?: Ref<boolean> | boolean
  showExcludedFiles?: Ref<boolean>
  searchMode?: Ref<string>
  listMode?: Ref<string>
  sortOrder?: Ref<string>
  sortType?: Ref<string>
}

export interface SidebarRefs {
  fileUsageCounts?: Ref<Record<string, number>>
  priorityStates?: Ref<Record<string, number>>
  favoriteStates?: Ref<Record<string, boolean>>
}

/** store 인스턴스에 공통으로 쓰이는 필드 (Pinia store 또는 레거시 객체) */
export interface DocumentManagerStoreLike {
  fileContents?: Record<string, string>
  checkboxStates?: CheckboxStates
  markdownFiles?: Array<{ name: string; path?: string; relativePath?: string; displayName?: string; modifiedDate?: string }>
  selectedFile?: { name: string; path?: string; displayName?: string; modifiedDate?: string }
  trashFiles?: string[]
  addToTrash?: (fileName: string) => void
  removeFromTrash?: (fileName: string) => void
  loadTrashFilesFromStorage?: () => void
  value?: string[]
}

export function loadCheckboxStates(checkboxStates: Ref<CheckboxStates> | CheckboxStates): void {
  try {
    const saved = localStorage.getItem('dev-checkbox-states')
    if (!saved || saved === 'undefined' || saved === 'null' || saved.trim() === '') {
      return
    }
    try {
      const parsed = JSON.parse(saved) as CheckboxStates
      if (isRef(checkboxStates)) {
        checkboxStates.value = parsed
      } else {
        Object.assign(checkboxStates, parsed)
      }
    } catch (parseError) {
      console.warn('체크박스 상태 파싱 실패, localStorage 항목 제거:', parseError)
      localStorage.removeItem('dev-checkbox-states')
    }
  } catch (error) {
    console.error('체크박스 상태 불러오기 실패:', error)
    try {
      localStorage.removeItem('dev-checkbox-states')
    } catch {
      /* ignore */
    }
  }
}

export function saveCheckboxStates(
  checkboxStates: Ref<CheckboxStates> | CheckboxStates,
): void {
  try {
    const states = isRef(checkboxStates) ? checkboxStates.value : checkboxStates
    localStorage.setItem('dev-checkbox-states', JSON.stringify(states))
  } catch (error) {
    console.error('체크박스 상태 저장 실패:', error)
  }
}

export function loadTOCSettings(settings: TOCSettingsInput): void {
  try {
    const saved = localStorage.getItem('dev-toc-settings')
    if (!saved) return
    const parsed = JSON.parse(saved) as Record<string, unknown>
    if (parsed.autoCloseOnContentClick !== undefined && settings.tocAutoCloseOnContentClick && isRef(settings.tocAutoCloseOnContentClick)) {
      settings.tocAutoCloseOnContentClick.value = parsed.autoCloseOnContentClick as boolean
    }
    if (settings.autoHighlightOnScroll && isRef(settings.autoHighlightOnScroll)) {
      settings.autoHighlightOnScroll.value = parsed.autoHighlightOnScroll !== undefined ? (parsed.autoHighlightOnScroll as boolean) : false
    }
    if (settings.hideCompleted !== undefined) {
      if (isRef(settings.hideCompleted)) {
        settings.hideCompleted.value = parsed.hideCompleted !== undefined ? (parsed.hideCompleted as boolean) : false
      } else {
        (settings as { hideCompleted: boolean }).hideCompleted = parsed.hideCompleted !== undefined ? (parsed.hideCompleted as boolean) : false
      }
    }
    if (settings.showExcludedFiles && isRef(settings.showExcludedFiles)) {
      settings.showExcludedFiles.value = parsed.showExcludedFiles !== undefined ? (parsed.showExcludedFiles as boolean) : false
    }
    if (parsed.searchMode !== undefined && settings.searchMode && isRef(settings.searchMode)) {
      settings.searchMode.value = parsed.searchMode as string
    }
    if (parsed.listMode !== undefined && settings.listMode && isRef(settings.listMode)) {
      settings.listMode.value = parsed.listMode as string
    }
    if (parsed.sortOrder !== undefined && settings.sortOrder && isRef(settings.sortOrder)) {
      settings.sortOrder.value = parsed.sortOrder as string
    }
    if (parsed.sortType !== undefined && settings.sortType && isRef(settings.sortType)) {
      settings.sortType.value = parsed.sortType as string
    }
  } catch (error) {
    console.error('목차 설정 불러오기 실패:', error)
  }
}

export function saveTOCSettings(settings: TOCSettingsInput): void {
  try {
    const settingsToSave: Record<string, unknown> = {
      autoCloseOnContentClick: settings.tocAutoCloseOnContentClick && isRef(settings.tocAutoCloseOnContentClick) ? settings.tocAutoCloseOnContentClick.value : (settings as Record<string, unknown>).tocAutoCloseOnContentClick,
      autoHighlightOnScroll: settings.autoHighlightOnScroll && isRef(settings.autoHighlightOnScroll) ? settings.autoHighlightOnScroll.value : (settings as Record<string, unknown>).autoHighlightOnScroll,
      searchMode: settings.searchMode?.value ?? (settings as Record<string, unknown>).searchMode,
      listMode: settings.listMode?.value ?? (settings as Record<string, unknown>).listMode,
      sortOrder: settings.sortOrder?.value ?? (settings as Record<string, unknown>).sortOrder,
      sortType: settings.sortType?.value ?? (settings as Record<string, unknown>).sortType,
    }
    if (settings.hideCompleted !== undefined) {
      settingsToSave.hideCompleted = isRef(settings.hideCompleted) ? settings.hideCompleted.value : settings.hideCompleted
    }
    if (settings.showExcludedFiles !== undefined) {
      settingsToSave.showExcludedFiles = isRef(settings.showExcludedFiles) ? settings.showExcludedFiles.value : settings.showExcludedFiles
    }
    localStorage.setItem('dev-toc-settings', JSON.stringify(settingsToSave))
  } catch (error) {
    console.error('목차 설정 저장 실패:', error)
  }
}

export function loadTOCExpandedState(fileName: string): Record<string, boolean> | null {
  try {
    const key = `dev-toc-expanded-${fileName}`
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved) as Record<string, boolean>
  } catch (error) {
    console.error('[Storage] 목차 확장 상태 불러오기 실패:', error)
  }
  return null
}

export function saveTOCExpandedState(
  fileName: string,
  expandedState: Record<string, boolean>,
): void {
  try {
    const key = `dev-toc-expanded-${fileName}`
    localStorage.setItem(key, JSON.stringify(expandedState))
  } catch (error) {
    console.error('[Storage] 목차 확장 상태 저장 실패:', error)
  }
}

export function loadSupportedExtensions(): string[] {
  try {
    return loadExtensions()
  } catch (error) {
    console.error('지원 확장자 목록 불러오기 실패:', error)
    return ['.md', '.mermaid.css']
  }
}

export function saveSupportedExtensions(extensions: string[]): void {
  try {
    saveExtensions(extensions)
  } catch (error) {
    console.error('지원 확장자 목록 저장 실패:', error)
  }
}

export function loadFileUsageCounts(
  fileUsageCounts: Ref<Record<string, number>>,
): void {
  try {
    const saved = localStorage.getItem('dev-file-usage-counts')
    if (saved) {
      fileUsageCounts.value = JSON.parse(saved) as Record<string, number>
    }
  } catch (error) {
    console.error('파일 사용 빈도 불러오기 실패:', error)
  }
}

export function saveFileUsageCounts(
  fileUsageCounts: Ref<Record<string, number>>,
): void {
  try {
    localStorage.setItem('dev-file-usage-counts', JSON.stringify(fileUsageCounts.value))
  } catch (error) {
    console.error('파일 사용 빈도 저장 실패:', error)
  }
}

export function incrementFileUsage(
  fileName: string,
  fileUsageCounts: Ref<Record<string, number>>,
): void {
  if (!fileUsageCounts.value[fileName]) {
    fileUsageCounts.value[fileName] = 0
  }
  fileUsageCounts.value[fileName]++
  saveFileUsageCounts(fileUsageCounts)
}

export function loadFavoriteStates(
  favoriteStates: Ref<Record<string, boolean>>,
): void {
  try {
    const saved = localStorage.getItem('dev-favorite-states')
    if (saved) {
      favoriteStates.value = JSON.parse(saved) as Record<string, boolean>
    }
  } catch (error) {
    console.error('즐겨찾기 상태 불러오기 실패:', error)
  }
}

export function saveFavoriteStates(
  favoriteStates: Ref<Record<string, boolean>>,
): void {
  try {
    localStorage.setItem('dev-favorite-states', JSON.stringify(favoriteStates.value))
  } catch (error) {
    console.error('즐겨찾기 상태 저장 실패:', error)
  }
}

export function toggleFavorite(
  fileName: string,
  favoriteStates: Ref<Record<string, boolean>>,
): void {
  if (!favoriteStates.value[fileName]) {
    favoriteStates.value[fileName] = false
  }
  favoriteStates.value[fileName] = !favoriteStates.value[fileName]
  saveFavoriteStates(favoriteStates)
}

export function loadPriorityStates(
  priorityStates: Ref<Record<string, number>>,
): void {
  try {
    const saved = localStorage.getItem('dev-priority-states')
    if (saved) {
      priorityStates.value = JSON.parse(saved) as Record<string, number>
    }
  } catch (error) {
    console.error('우선순위 상태 불러오기 실패:', error)
  }
}

export function savePriorityStates(
  priorityStates: Ref<Record<string, number>>,
): void {
  try {
    localStorage.setItem('dev-priority-states', JSON.stringify(priorityStates.value))
  } catch (error) {
    console.error('우선순위 상태 저장 실패:', error)
  }
}

export function setFilePriority(
  fileName: string,
  priority: number,
  priorityStates: Ref<Record<string, number>>,
): void {
  priorityStates.value[fileName] = priority
  savePriorityStates(priorityStates)
}

function saveTrashFiles(trashFiles: { value: string[] } | string[]): void {
  try {
    const valueToSave = Array.isArray(trashFiles) ? trashFiles : trashFiles.value
    const arrayToSave = Array.isArray(valueToSave) ? Array.from(valueToSave) : []
    localStorage.setItem('dev-trash-files', JSON.stringify(arrayToSave))
  } catch (error) {
    console.error('휴지통 파일 목록 저장 실패:', error)
  }
}

export async function renameFile(
  oldFileName: string,
  newFileName: string,
  store: DocumentManagerStoreLike,
  sidebarRefs?: SidebarRefs | null,
): Promise<boolean> {
  try {
    const response = await fetch(getDocFileUrl(oldFileName), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newFileName }),
    })
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(errorData.error || `서버 오류: ${response.status}`)
    }
    await response.json()

    if (store.fileContents && store.fileContents[oldFileName] !== undefined) {
      const currentFileContents = store.fileContents
      const newFileContents = { ...currentFileContents }
      newFileContents[newFileName] = newFileContents[oldFileName]
      delete newFileContents[oldFileName]
      store.fileContents = newFileContents
    }

    if (store.checkboxStates && store.checkboxStates[oldFileName] !== undefined) {
      const currentCheckboxStates = store.checkboxStates
      const newCheckboxStates = { ...currentCheckboxStates }
      newCheckboxStates[newFileName] = newCheckboxStates[oldFileName]
      delete newCheckboxStates[oldFileName]
      store.checkboxStates = newCheckboxStates
      saveCheckboxStates(newCheckboxStates)
    }

    try {
      const savedUsageCounts = localStorage.getItem('dev-file-usage-counts')
      if (savedUsageCounts) {
        const usageCounts = JSON.parse(savedUsageCounts) as Record<string, number>
        if (usageCounts[oldFileName] !== undefined) {
          usageCounts[newFileName] = usageCounts[oldFileName]
          delete usageCounts[oldFileName]
          localStorage.setItem('dev-file-usage-counts', JSON.stringify(usageCounts))
        }
      }
    } catch (error) {
      console.error('[Rename] dev-file-usage-counts 키 변경 실패:', error)
    }

    try {
      const savedPriorityStates = localStorage.getItem('dev-priority-states')
      if (savedPriorityStates) {
        const priorityStates = JSON.parse(savedPriorityStates) as Record<string, number>
        if (priorityStates[oldFileName] !== undefined) {
          priorityStates[newFileName] = priorityStates[oldFileName]
          delete priorityStates[oldFileName]
          localStorage.setItem('dev-priority-states', JSON.stringify(priorityStates))
        }
      }
    } catch (error) {
      console.error('[Rename] dev-priority-states 키 변경 실패:', error)
    }

    try {
      const savedFavoriteStates = localStorage.getItem('dev-favorite-states')
      if (savedFavoriteStates) {
        const favoriteStates = JSON.parse(savedFavoriteStates) as Record<string, boolean>
        if (favoriteStates[oldFileName] !== undefined) {
          favoriteStates[newFileName] = favoriteStates[oldFileName]
          delete favoriteStates[oldFileName]
          localStorage.setItem('dev-favorite-states', JSON.stringify(favoriteStates))
        }
      }
    } catch (error) {
      console.error('[Rename] dev-favorite-states 키 변경 실패:', error)
    }

    try {
      if (store.trashFiles && store.trashFiles.includes(oldFileName)) {
        const trashFilesArray = Array.from(store.trashFiles)
        const index = trashFilesArray.indexOf(oldFileName)
        if (index !== -1) {
          trashFilesArray[index] = newFileName
          if (store.addToTrash && store.removeFromTrash) {
            store.removeFromTrash(oldFileName)
            store.addToTrash(newFileName)
          } else {
            store.trashFiles = trashFilesArray
          }
          saveTrashFiles({ value: trashFilesArray })
        }
      }
    } catch (error) {
      console.error('[Rename] trashFiles 키 변경 실패:', error)
    }

    if (sidebarRefs) {
      if (sidebarRefs.fileUsageCounts?.value && sidebarRefs.fileUsageCounts.value[oldFileName] !== undefined) {
        sidebarRefs.fileUsageCounts.value[newFileName] = sidebarRefs.fileUsageCounts.value[oldFileName]
        delete sidebarRefs.fileUsageCounts.value[oldFileName]
        saveFileUsageCounts(sidebarRefs.fileUsageCounts)
      }
      if (sidebarRefs.priorityStates?.value && sidebarRefs.priorityStates.value[oldFileName] !== undefined) {
        sidebarRefs.priorityStates.value[newFileName] = sidebarRefs.priorityStates.value[oldFileName]
        delete sidebarRefs.priorityStates.value[oldFileName]
        savePriorityStates(sidebarRefs.priorityStates)
      }
      if (sidebarRefs.favoriteStates?.value && sidebarRefs.favoriteStates.value[oldFileName] !== undefined) {
        sidebarRefs.favoriteStates.value[newFileName] = sidebarRefs.favoriteStates.value[oldFileName]
        delete sidebarRefs.favoriteStates.value[oldFileName]
        saveFavoriteStates(sidebarRefs.favoriteStates)
      }
    }

    await nextTick()
    await nextTick()

    if (store.markdownFiles && Array.isArray(store.markdownFiles)) {
      const oldFileNameOnly = oldFileName.split('/').pop()
      const newFileNameOnly = newFileName.split('/').pop()
      const now = new Date().toISOString()
      const fileIndex = store.markdownFiles.findIndex((file) => file.name.split('/').pop() === oldFileNameOnly)
      if (fileIndex !== -1 && newFileNameOnly) {
        const file = store.markdownFiles[fileIndex]
        store.markdownFiles[fileIndex] = {
          ...file,
          name: newFileNameOnly,
          displayName: removeExtension(newFileNameOnly).replace(/_/g, ' '),
          modifiedDate: now,
          path: file.path ? file.path.split('/').slice(0, -1).concat([newFileNameOnly]).join('/') : file.path,
        }
      }
    }

    if (store.selectedFile) {
      const oldFileNameOnly = oldFileName.split('/').pop()
      const newFileNameOnly = newFileName.split('/').pop()
      const currentSelectedFileNameOnly = store.selectedFile.name.split('/').pop()
      if (currentSelectedFileNameOnly === oldFileNameOnly && store.fileContents?.[newFileName] && newFileNameOnly) {
        const now = new Date().toISOString()
        let updatedPath = store.selectedFile.path
        if (updatedPath && newFileNameOnly) {
          const pathParts = updatedPath.split('/')
          pathParts[pathParts.length - 1] = newFileNameOnly
          updatedPath = pathParts.join('/')
        }
        store.selectedFile = {
          ...store.selectedFile,
          name: newFileNameOnly,
          displayName: removeExtension(newFileNameOnly).replace(/_/g, ' '),
          path: updatedPath,
          modifiedDate: now,
        }
      }
    }

    if (!sidebarRefs) {
      window.dispatchEvent(
        new CustomEvent('file-renamed', { detail: { oldFileName, newFileName } }),
      )
    }
    return true
  } catch (error) {
    console.error('[Rename] renameFile 실패:', error)
    throw error
  }
}

export function resetFileUsageCounts(
  fileUsageCounts: Ref<Record<string, number>>,
): void {
  fileUsageCounts.value = {}
  localStorage.removeItem('dev-file-usage-counts')
}

export function resetPriorityStates(
  priorityStates: Ref<Record<string, number>>,
): void {
  priorityStates.value = {}
  localStorage.removeItem('dev-priority-states')
}

export function loadTrashFiles(store: DocumentManagerStoreLike): void {
  if (store?.loadTrashFilesFromStorage) {
    store.loadTrashFilesFromStorage()
  } else {
    console.warn('[Trash] loadTrashFiles: store 메서드를 사용할 수 없음, 레거시 방식 사용')
    try {
      const saved = localStorage.getItem('dev-trash-files')
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        if (store?.trashFiles !== undefined) {
          store.trashFiles = Array.isArray(parsed) ? parsed : []
        } else if (store && 'value' in store && store.value !== undefined) {
          (store as DocumentManagerStoreLike & { value: string[] }).value = Array.isArray(parsed) ? parsed : []
        }
      } else {
        if (store?.trashFiles !== undefined) {
          store.trashFiles = []
        } else if (store && 'value' in store && store.value !== undefined) {
          (store as DocumentManagerStoreLike & { value: string[] }).value = []
        }
      }
    } catch (error) {
      console.error('휴지통 파일 목록 불러오기 실패:', error)
      if (store?.trashFiles !== undefined) {
        store.trashFiles = []
      } else if (store && 'value' in store && store.value !== undefined) {
        (store as DocumentManagerStoreLike & { value: string[] }).value = []
      }
    }
  }
}

export function moveToTrash(fileName: string, store: DocumentManagerStoreLike): void {
  if (store.addToTrash && store.trashFiles) {
    store.addToTrash(fileName)
    saveTrashFiles({ value: Array.from(store.trashFiles) })
  } else if (store.trashFiles && !store.trashFiles.includes(fileName)) {
    const currentArray = Array.from(store.trashFiles)
    store.trashFiles = [...currentArray, fileName]
    saveTrashFiles({ value: Array.from(store.trashFiles) })
  }
}

export function restoreFromTrash(fileName: string, store: DocumentManagerStoreLike): void {
  if (store.removeFromTrash && store.trashFiles) {
    store.removeFromTrash(fileName)
    saveTrashFiles({ value: store.trashFiles })
  } else if (store.trashFiles) {
    store.trashFiles = store.trashFiles.filter((name) => name !== fileName)
    saveTrashFiles({ value: store.trashFiles })
  }
}

export async function permanentlyDeleteFromTrash(
  fileName: string,
  store: DocumentManagerStoreLike,
): Promise<boolean> {
  try {
    const filePath = fileName
    const fileNameOnly = filePath.includes('/') ? filePath.split('/').pop()! : filePath
    const response = await fetch(getDocFileUrl(filePath), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(errorData.error || `서버 오류: ${response.status}`)
    }
    await response.json()

    if (store.markdownFiles) {
      const fileIndex = store.markdownFiles.findIndex(
        (file) =>
          file.name === fileNameOnly ||
          file.name === filePath ||
          file.path === filePath ||
          file.relativePath === filePath ||
          file.relativePath === fileNameOnly,
      )
      if (fileIndex !== -1) {
        store.markdownFiles.splice(fileIndex, 1)
        console.log(`[Trash] markdownFiles에서 파일 제거: ${filePath}`)
      }
    }

    if (store.removeFromTrash && store.trashFiles) {
      store.removeFromTrash(fileNameOnly)
      saveTrashFiles({ value: store.trashFiles })
    } else if (store.trashFiles) {
      store.trashFiles = store.trashFiles.filter((name) => name !== fileNameOnly)
      saveTrashFiles({ value: store.trashFiles })
    }

    try {
      const checkboxStates = JSON.parse(localStorage.getItem('dev-checkbox-states') || '{}') as Record<string, unknown>
      if (checkboxStates[fileNameOnly]) {
        delete checkboxStates[fileNameOnly]
        localStorage.setItem('dev-checkbox-states', JSON.stringify(checkboxStates))
      }
      const usageCounts = JSON.parse(localStorage.getItem('dev-file-usage-counts') || '{}') as Record<string, number>
      if (usageCounts[fileNameOnly]) {
        delete usageCounts[fileNameOnly]
        localStorage.setItem('dev-file-usage-counts', JSON.stringify(usageCounts))
      }
      const favoriteStates = JSON.parse(localStorage.getItem('dev-favorite-states') || '{}') as Record<string, boolean>
      if (favoriteStates[fileNameOnly]) {
        delete favoriteStates[fileNameOnly]
        localStorage.setItem('dev-favorite-states', JSON.stringify(favoriteStates))
      }
      const priorityStates = JSON.parse(localStorage.getItem('dev-priority-states') || '{}') as Record<string, number>
      if (priorityStates[fileNameOnly]) {
        delete priorityStates[fileNameOnly]
        localStorage.setItem('dev-priority-states', JSON.stringify(priorityStates))
      }
      console.log(`[Trash] 로컬 스토리지에서 관련 데이터 제거 완료: ${fileNameOnly}`)
    } catch (storageError) {
      console.warn('[Trash] 로컬 스토리지 정리 중 오류 (계속 진행):', storageError)
    }
    return true
  } catch (error) {
    console.error('[Trash] permanentlyDeleteFromTrash 실패:', error)
    throw error
  }
}

export async function emptyTrash(store: DocumentManagerStoreLike): Promise<number> {
  try {
    const trashFilesToDelete = Array.from(store.trashFiles || [])
    if (trashFilesToDelete.length === 0) {
      console.log('[Trash] emptyTrash: 휴지통이 이미 비어있습니다')
      return 0
    }
    console.log(`[Trash] emptyTrash: ${trashFilesToDelete.length}개 파일 삭제 시작`)
    let successCount = 0
    let failCount = 0
    const failedFiles: string[] = []
    const deletedFileNames: string[] = []

    for (const fileName of trashFilesToDelete) {
      try {
        let filePath = fileName
        if (store.markdownFiles) {
          const file = store.markdownFiles.find(
            (f) => f.name === fileName || f.path === fileName || f.relativePath === fileName,
          )
          if (file?.relativePath) filePath = file.relativePath
        }
        const response = await fetch(getDocFileUrl(filePath), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as { error?: string }
          throw new Error(errorData.error || `서버 오류: ${response.status}`)
        }
        await response.json()
        console.log(`[Trash] 파일 삭제 성공: ${filePath}`)
        successCount++
        deletedFileNames.push(fileName)
      } catch (error) {
        console.error(`[Trash] 파일 삭제 실패: ${fileName}`, error)
        failCount++
        failedFiles.push(fileName)
      }
    }

    if (successCount > 0) {
      if (store.markdownFiles) {
        deletedFileNames.forEach((fileName) => {
          const fileIndex = store.markdownFiles!.findIndex(
            (file) =>
              file.name === fileName ||
              file.path === fileName ||
              file.relativePath === fileName ||
              file.relativePath?.endsWith(fileName),
          )
          if (fileIndex !== -1) {
            store.markdownFiles!.splice(fileIndex, 1)
            console.log(`[Trash] markdownFiles에서 파일 제거: ${fileName}`)
          }
        })
      }
      if (store.removeFromTrash) {
        deletedFileNames.forEach((fileName) => store.removeFromTrash!(fileName))
      } else {
        store.trashFiles = failedFiles
      }
      saveTrashFiles({ value: store.trashFiles || [] })

      try {
        deletedFileNames.forEach((fileNameOnly) => {
          const checkboxStates = JSON.parse(localStorage.getItem('dev-checkbox-states') || '{}') as Record<string, unknown>
          if (checkboxStates[fileNameOnly]) {
            delete checkboxStates[fileNameOnly]
            localStorage.setItem('dev-checkbox-states', JSON.stringify(checkboxStates))
          }
          const usageCounts = JSON.parse(localStorage.getItem('dev-file-usage-counts') || '{}') as Record<string, number>
          if (usageCounts[fileNameOnly]) {
            delete usageCounts[fileNameOnly]
            localStorage.setItem('dev-file-usage-counts', JSON.stringify(usageCounts))
          }
          const favoriteStates = JSON.parse(localStorage.getItem('dev-favorite-states') || '{}') as Record<string, boolean>
          if (favoriteStates[fileNameOnly]) {
            delete favoriteStates[fileNameOnly]
            localStorage.setItem('dev-favorite-states', JSON.stringify(favoriteStates))
          }
          const priorityStates = JSON.parse(localStorage.getItem('dev-priority-states') || '{}') as Record<string, number>
          if (priorityStates[fileNameOnly]) {
            delete priorityStates[fileNameOnly]
            localStorage.setItem('dev-priority-states', JSON.stringify(priorityStates))
          }
        })
        console.log(`[Trash] 로컬 스토리지에서 관련 데이터 제거 완료: ${deletedFileNames.length}개 파일`)
      } catch (storageError) {
        console.warn('[Trash] 로컬 스토리지 정리 중 오류 (계속 진행):', storageError)
      }
    }

    if (failCount > 0) {
      const errorMessage = `${successCount}개 파일 삭제 성공, ${failCount}개 파일 삭제 실패`
      console.error(`[Trash] emptyTrash 부분 실패: ${errorMessage}`)
      throw new Error(errorMessage)
    }
    console.log(`[Trash] emptyTrash 완료: ${successCount}개 파일 삭제 성공`)
    return successCount
  } catch (error) {
    console.error('[Trash] emptyTrash 실패:', error)
    throw error
  }
}
