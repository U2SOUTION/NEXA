/**
 * 문서 스토리지 관리
 * 로컬 스토리지에 데이터를 저장하고 불러오는 함수들
 */
import { isRef, nextTick } from 'vue'

/**
 * 체크박스 상태 불러오기
 * @param {Object} checkboxStates - 체크박스 상태 객체 (ref)
 */
export function loadCheckboxStates(checkboxStates) {
  try {
    const saved = localStorage.getItem('dev-checkbox-states')

    // saved가 없거나, 문자열 "undefined"/"null"이거나, 빈 문자열이면 무시
    if (!saved || saved === 'undefined' || saved === 'null' || saved.trim() === '') {
      return
    }

    try {
      const parsed = JSON.parse(saved)
      checkboxStates.value = parsed
    } catch (parseError) {
      // JSON 파싱 실패 시 해당 localStorage 항목 제거
      console.warn('체크박스 상태 파싱 실패, localStorage 항목 제거:', parseError)
      localStorage.removeItem('dev-checkbox-states')
    }
  } catch (error) {
    console.error('체크박스 상태 불러오기 실패:', error)
    // 에러 발생 시 localStorage 항목 제거 (손상된 데이터 정리)
    try {
      localStorage.removeItem('dev-checkbox-states')
    } catch {
      // 제거 실패는 무시
    }
  }
}

/**
 * 체크박스 상태 저장
 * @param {Object} checkboxStates - 체크박스 상태 객체 (ref)
 */
export function saveCheckboxStates(checkboxStates) {
  try {
    // checkboxStates가 ref인지 확인
    const states = checkboxStates?.value || checkboxStates
    localStorage.setItem('dev-checkbox-states', JSON.stringify(states))
  } catch (error) {
    console.error('체크박스 상태 저장 실패:', error)
  }
}

/**
 * 목차 설정 불러오기
 * @param {Object} settings - 설정 객체들 (ref)
 */
export function loadTOCSettings(settings) {
  try {
    const saved = localStorage.getItem('dev-toc-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      // ref 객체에 안전하게 값 설정
      if (parsed.autoCloseOnContentClick !== undefined && settings.tocAutoCloseOnContentClick && isRef(settings.tocAutoCloseOnContentClick)) {
        settings.tocAutoCloseOnContentClick.value = parsed.autoCloseOnContentClick
      }
      // autoHighlightOnScroll 불러오기 (기본값: false)
      if (settings.autoHighlightOnScroll && isRef(settings.autoHighlightOnScroll)) {
        settings.autoHighlightOnScroll.value = parsed.autoHighlightOnScroll !== undefined ? parsed.autoHighlightOnScroll : false
      }
      // hideCompleted 불러오기 (기본값: false)
      if (settings.hideCompleted) {
        if (isRef(settings.hideCompleted)) {
          settings.hideCompleted.value = parsed.hideCompleted !== undefined ? parsed.hideCompleted : false
        } else {
          settings.hideCompleted = parsed.hideCompleted !== undefined ? parsed.hideCompleted : false
        }
      }
      // showExcludedFiles 불러오기 (기본값: false)
      if (settings.showExcludedFiles && isRef(settings.showExcludedFiles)) {
        settings.showExcludedFiles.value = parsed.showExcludedFiles !== undefined ? parsed.showExcludedFiles : false
      }
      if (parsed.searchMode !== undefined && settings.searchMode && isRef(settings.searchMode)) {
        settings.searchMode.value = parsed.searchMode
      }
      if (parsed.listMode !== undefined && settings.listMode && isRef(settings.listMode)) {
        settings.listMode.value = parsed.listMode
      }
      if (parsed.sortOrder !== undefined && settings.sortOrder && isRef(settings.sortOrder)) {
        settings.sortOrder.value = parsed.sortOrder
      }
      if (parsed.sortType !== undefined && settings.sortType && isRef(settings.sortType)) {
        settings.sortType.value = parsed.sortType
      }
    }
  } catch (error) {
    console.error('목차 설정 불러오기 실패:', error)
  }
}

/**
 * 목차 설정 저장
 * @param {Object} settings - 설정 객체들 (ref)
 */
export function saveTOCSettings(settings) {
  try {
    const settingsToSave = {
      autoCloseOnContentClick: settings.tocAutoCloseOnContentClick?.value ?? settings.tocAutoCloseOnContentClick,
      autoHighlightOnScroll: settings.autoHighlightOnScroll?.value ?? settings.autoHighlightOnScroll,
      searchMode: settings.searchMode?.value ?? settings.searchMode,
      listMode: settings.listMode?.value ?? settings.listMode,
      sortOrder: settings.sortOrder?.value ?? settings.sortOrder,
      sortType: settings.sortType?.value ?? settings.sortType,
    }

    // hideCompleted가 있으면 추가 (ref일 수도 있고 일반 값일 수도 있음)
    if (settings.hideCompleted !== undefined) {
      settingsToSave.hideCompleted = isRef(settings.hideCompleted) ? settings.hideCompleted.value : settings.hideCompleted
    }

    // showExcludedFiles가 있으면 추가
    if (settings.showExcludedFiles !== undefined) {
      settingsToSave.showExcludedFiles = isRef(settings.showExcludedFiles) ? settings.showExcludedFiles.value : settings.showExcludedFiles
    }

    localStorage.setItem('dev-toc-settings', JSON.stringify(settingsToSave))
  } catch (error) {
    console.error('목차 설정 저장 실패:', error)
  }
}

/**
 * 목차 확장 상태 불러오기 (파일별)
 * @param {string} fileName - 파일명
 * @returns {Object} 확장 상태 객체 { itemId: boolean }
 */
export function loadTOCExpandedState(fileName) {
  try {
    const key = `dev-toc-expanded-${fileName}`
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('[Storage] 목차 확장 상태 불러오기 실패:', error)
  }
  return null
}

/**
 * 목차 확장 상태 저장 (파일별)
 * @param {string} fileName - 파일명
 * @param {Object} expandedState - 확장 상태 객체 { itemId: boolean }
 */
export function saveTOCExpandedState(fileName, expandedState) {
  try {
    const key = `dev-toc-expanded-${fileName}`
    localStorage.setItem(key, JSON.stringify(expandedState))
  } catch (error) {
    console.error('[Storage] 목차 확장 상태 저장 실패:', error)
  }
}

/**
 * 파일 사용 빈도 불러오기
 * @param {Object} fileUsageCounts - 파일 사용 빈도 객체 (ref)
 */
export function loadFileUsageCounts(fileUsageCounts) {
  try {
    const saved = localStorage.getItem('dev-file-usage-counts')
    if (saved) {
      fileUsageCounts.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('파일 사용 빈도 불러오기 실패:', error)
  }
}

/**
 * 파일 사용 빈도 저장
 * @param {Object} fileUsageCounts - 파일 사용 빈도 객체 (ref)
 */
export function saveFileUsageCounts(fileUsageCounts) {
  try {
    localStorage.setItem('dev-file-usage-counts', JSON.stringify(fileUsageCounts.value))
  } catch (error) {
    console.error('파일 사용 빈도 저장 실패:', error)
  }
}

/**
 * 파일 사용 빈도 증가
 * @param {string} fileName - 파일명
 * @param {Object} fileUsageCounts - 파일 사용 빈도 객체 (ref)
 */
export function incrementFileUsage(fileName, fileUsageCounts) {
  if (!fileUsageCounts.value[fileName]) {
    fileUsageCounts.value[fileName] = 0
  }
  fileUsageCounts.value[fileName]++
  saveFileUsageCounts(fileUsageCounts)
}

/**
 * 즐겨찾기 상태 불러오기
 * @param {Object} favoriteStates - 즐겨찾기 상태 객체 (ref)
 */
export function loadFavoriteStates(favoriteStates) {
  try {
    const saved = localStorage.getItem('dev-favorite-states')
    if (saved) {
      favoriteStates.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('즐겨찾기 상태 불러오기 실패:', error)
  }
}

/**
 * 즐겨찾기 상태 저장
 * @param {Object} favoriteStates - 즐겨찾기 상태 객체 (ref)
 */
export function saveFavoriteStates(favoriteStates) {
  try {
    localStorage.setItem('dev-favorite-states', JSON.stringify(favoriteStates.value))
  } catch (error) {
    console.error('즐겨찾기 상태 저장 실패:', error)
  }
}

/**
 * 즐겨찾기 토글
 * @param {string} fileName - 파일명
 * @param {Object} favoriteStates - 즐겨찾기 상태 객체 (ref)
 */
export function toggleFavorite(fileName, favoriteStates) {
  if (!favoriteStates.value[fileName]) {
    favoriteStates.value[fileName] = false
  }
  favoriteStates.value[fileName] = !favoriteStates.value[fileName]
  saveFavoriteStates(favoriteStates)
}

/**
 * 우선순위 상태 불러오기
 * @param {Object} priorityStates - 우선순위 상태 객체 (ref)
 */
export function loadPriorityStates(priorityStates) {
  try {
    const saved = localStorage.getItem('dev-priority-states')
    if (saved) {
      priorityStates.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('우선순위 상태 불러오기 실패:', error)
  }
}

/**
 * 우선순위 상태 저장
 * @param {Object} priorityStates - 우선순위 상태 객체 (ref)
 */
export function savePriorityStates(priorityStates) {
  try {
    localStorage.setItem('dev-priority-states', JSON.stringify(priorityStates.value))
  } catch (error) {
    console.error('우선순위 상태 저장 실패:', error)
  }
}

/**
 * 파일 우선순위 설정
 * @param {string} fileName - 파일명
 * @param {number} priority - 우선순위 점수
 * @param {Object} priorityStates - 우선순위 상태 객체 (ref)
 */
export function setFilePriority(fileName, priority, priorityStates) {
  priorityStates.value[fileName] = priority
  savePriorityStates(priorityStates)
}

/**
 * 파일명 변경 (모든 관련 데이터 키 변경)
 * @param {string} oldFileName - 기존 파일명
 * @param {string} newFileName - 새 파일명
 * @param {Object} store - documentManagerStore 인스턴스
 * @param {Object} sidebarRefs - 사이드바 refs { fileUsageCounts, priorityStates, favoriteStates }
 * @returns {Promise<boolean>} 성공 여부
 */
export async function renameFile(oldFileName, newFileName, store, sidebarRefs) {
  try {
    // 1. 백엔드 API 호출 (파일명 변경)
    const encodedOldFileName = encodeURIComponent(oldFileName)
    const response = await fetch(`http://localhost:3000/api/docs/${encodedOldFileName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newFileName }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `서버 오류: ${response.status}`)
    }

    await response.json()

    // 2. Store 데이터 키 변경
    // fileContents (Vue 반응성을 위해 새 객체로 교체)
    // Pinia store에서 ref는 자동으로 unwrap되지만, 할당 시 .value 사용이 더 안전함
    if (store.fileContents && store.fileContents[oldFileName] !== undefined) {
      const currentFileContents = store.fileContents
      const newFileContents = { ...currentFileContents }
      newFileContents[newFileName] = newFileContents[oldFileName]
      delete newFileContents[oldFileName]
      // Pinia store의 ref에 새 객체 할당 (자동 unwrap됨)
      store.fileContents = newFileContents
    }

    // checkboxStates (Vue 반응성을 위해 새 객체로 교체)
    if (store.checkboxStates && store.checkboxStates[oldFileName] !== undefined) {
      const currentCheckboxStates = store.checkboxStates
      const newCheckboxStates = { ...currentCheckboxStates }
      newCheckboxStates[newFileName] = newCheckboxStates[oldFileName]
      delete newCheckboxStates[oldFileName]
      // Pinia store의 ref에 새 객체 할당 (자동 unwrap됨)
      store.checkboxStates = newCheckboxStates
      // localStorage에도 저장
      saveCheckboxStates(newCheckboxStates)
    }

    // 3. localStorage 데이터 키 변경
    // dev-file-usage-counts
    try {
      const savedUsageCounts = localStorage.getItem('dev-file-usage-counts')
      if (savedUsageCounts) {
        const usageCounts = JSON.parse(savedUsageCounts)
        if (usageCounts[oldFileName] !== undefined) {
          usageCounts[newFileName] = usageCounts[oldFileName]
          delete usageCounts[oldFileName]
          localStorage.setItem('dev-file-usage-counts', JSON.stringify(usageCounts))
        }
      }
    } catch (error) {
      console.error('[Rename] dev-file-usage-counts 키 변경 실패:', error)
    }

    // dev-priority-states
    try {
      const savedPriorityStates = localStorage.getItem('dev-priority-states')
      if (savedPriorityStates) {
        const priorityStates = JSON.parse(savedPriorityStates)
        if (priorityStates[oldFileName] !== undefined) {
          priorityStates[newFileName] = priorityStates[oldFileName]
          delete priorityStates[oldFileName]
          localStorage.setItem('dev-priority-states', JSON.stringify(priorityStates))
        }
      }
    } catch (error) {
      console.error('[Rename] dev-priority-states 키 변경 실패:', error)
    }

    // dev-favorite-states
    try {
      const savedFavoriteStates = localStorage.getItem('dev-favorite-states')
      if (savedFavoriteStates) {
        const favoriteStates = JSON.parse(savedFavoriteStates)
        if (favoriteStates[oldFileName] !== undefined) {
          favoriteStates[newFileName] = favoriteStates[oldFileName]
          delete favoriteStates[oldFileName]
          localStorage.setItem('dev-favorite-states', JSON.stringify(favoriteStates))
        }
      }
    } catch (error) {
      console.error('[Rename] dev-favorite-states 키 변경 실패:', error)
    }

    // dev-trash-files (배열 내 문자열 변경)
    try {
      if (store.trashFiles && store.trashFiles.includes(oldFileName)) {
        const trashFilesArray = Array.from(store.trashFiles)
        const index = trashFilesArray.indexOf(oldFileName)
        if (index !== -1) {
          trashFilesArray[index] = newFileName
          // Store 업데이트
          if (store.addToTrash && store.removeFromTrash) {
            store.removeFromTrash(oldFileName)
            store.addToTrash(newFileName)
          } else {
            store.trashFiles = trashFilesArray
          }
          // localStorage 저장
          saveTrashFiles({ value: trashFilesArray })
        }
      }
    } catch (error) {
      console.error('[Rename] trashFiles 키 변경 실패:', error)
    }

    // 4. Sidebar refs 키 변경
    if (sidebarRefs) {
      // fileUsageCounts
      if (sidebarRefs.fileUsageCounts && sidebarRefs.fileUsageCounts.value) {
        if (sidebarRefs.fileUsageCounts.value[oldFileName] !== undefined) {
          sidebarRefs.fileUsageCounts.value[newFileName] = sidebarRefs.fileUsageCounts.value[oldFileName]
          delete sidebarRefs.fileUsageCounts.value[oldFileName]
          saveFileUsageCounts(sidebarRefs.fileUsageCounts)
        }
      }

      // priorityStates
      if (sidebarRefs.priorityStates && sidebarRefs.priorityStates.value) {
        if (sidebarRefs.priorityStates.value[oldFileName] !== undefined) {
          sidebarRefs.priorityStates.value[newFileName] = sidebarRefs.priorityStates.value[oldFileName]
          delete sidebarRefs.priorityStates.value[oldFileName]
          savePriorityStates(sidebarRefs.priorityStates)
        }
      }

      // favoriteStates
      if (sidebarRefs.favoriteStates && sidebarRefs.favoriteStates.value) {
        if (sidebarRefs.favoriteStates.value[oldFileName] !== undefined) {
          sidebarRefs.favoriteStates.value[newFileName] = sidebarRefs.favoriteStates.value[oldFileName]
          delete sidebarRefs.favoriteStates.value[oldFileName]
          saveFavoriteStates(sidebarRefs.favoriteStates)
        }
      }
    }

    // 5. selectedFile 업데이트 (fileContents 키 변경 완료 후 Vue 반응성이 처리되도록 여러 번 nextTick으로 대기)
    // markdownFiles는 사이드바에서 handleFileRenamed로 처리하므로 여기서는 selectedFile만 업데이트
    // computed 속성들이 재계산될 수 있으므로 여러 번 대기
    await nextTick()
    await nextTick()

    // markdownFiles 배열에서 파일명과 메타데이터 업데이트
    if (store.markdownFiles && Array.isArray(store.markdownFiles)) {
      const oldFileNameOnly = oldFileName.split('/').pop()
      const newFileNameOnly = newFileName.split('/').pop()
      const now = new Date().toISOString()

      const fileIndex = store.markdownFiles.findIndex((file) => {
        const fileNameOnly = file.name.split('/').pop()
        return fileNameOnly === oldFileNameOnly
      })

      if (fileIndex !== -1) {
        const file = store.markdownFiles[fileIndex]
        // 파일명과 수정일 업데이트 (파일명 변경 시점을 수정일로 반영)
        store.markdownFiles[fileIndex] = {
          ...file,
          name: newFileNameOnly,
          displayName: newFileNameOnly.replace('.md', '').replace(/_/g, ' '),
          modifiedDate: now, // 파일명 변경 시점을 수정일로 설정
          // path도 업데이트
          path: file.path ? file.path.split('/').slice(0, -1).concat([newFileNameOnly]).join('/') : file.path,
        }
      }
    }

    if (store.selectedFile) {
      const oldFileNameOnly = oldFileName.split('/').pop()
      const newFileNameOnly = newFileName.split('/').pop()
      const currentSelectedFileNameOnly = store.selectedFile.name.split('/').pop()

      if (currentSelectedFileNameOnly === oldFileNameOnly) {
        // fileContents에 새 키가 존재하는지 확인
        if (store.fileContents && store.fileContents[newFileName]) {
          const now = new Date().toISOString()
          // selectedFile 객체를 새로 생성하여 할당 (Vue 반응성 보장)
          // fileContents 키 변경이 완료된 후에 변경하므로, computed 속성들이 올바른 키로 접근 가능
          let updatedPath = store.selectedFile.path
          if (updatedPath) {
            // path에서 파일명 부분만 교체
            const pathParts = updatedPath.split('/')
            pathParts[pathParts.length - 1] = newFileNameOnly
            updatedPath = pathParts.join('/')
          }

          store.selectedFile = {
            ...store.selectedFile,
            name: newFileNameOnly,
            displayName: newFileNameOnly.replace('.md', '').replace(/_/g, ' '),
            path: updatedPath,
            modifiedDate: now, // 파일명 변경 시점을 수정일로 설정
          }
        }
      }
    }

    // 6. 사이드바에 변경 사항 알림 (커스텀 이벤트 발생)
    // sidebarRefs가 null이면 (DevelopmentPage에서 호출한 경우), 이벤트를 통해 사이드바에 알림
    if (!sidebarRefs) {
      window.dispatchEvent(
        new CustomEvent('file-renamed', {
          detail: { oldFileName, newFileName },
        }),
      )
    }

    return true
  } catch (error) {
    console.error('[Rename] renameFile 실패:', error)
    throw error
  }
}

/**
 * 파일 사용 빈도 초기화
 * @param {Object} fileUsageCounts - 파일 사용 빈도 객체 (ref)
 */
export function resetFileUsageCounts(fileUsageCounts) {
  fileUsageCounts.value = {}
  localStorage.removeItem('dev-file-usage-counts')
}

/**
 * 우선순위 상태 초기화
 * @param {Object} priorityStates - 우선순위 상태 객체 (ref)
 */
export function resetPriorityStates(priorityStates) {
  priorityStates.value = {}
  localStorage.removeItem('dev-priority-states')
}

/**
 * 휴지통에 있는 파일 목록 불러오기
 * @param {Object} store - documentManagerStore 인스턴스
 */
export function loadTrashFiles(store) {
  if (store?.loadTrashFilesFromStorage) {
    // Store의 메서드 사용 (반응성 보장)
    store.loadTrashFilesFromStorage()
  } else {
    // 레거시 방식 (ref 직접 전달)
    console.warn('[Trash] loadTrashFiles: store 메서드를 사용할 수 없음, 레거시 방식 사용')
    try {
      const saved = localStorage.getItem('dev-trash-files')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (store?.trashFiles !== undefined) {
          store.trashFiles = Array.isArray(parsed) ? parsed : []
        } else if (store?.value !== undefined) {
          store.value = Array.isArray(parsed) ? parsed : []
        }
      } else {
        if (store?.trashFiles !== undefined) {
          store.trashFiles = []
        } else if (store?.value !== undefined) {
          store.value = []
        }
      }
    } catch (error) {
      console.error('휴지통 파일 목록 불러오기 실패:', error)
      if (store?.trashFiles !== undefined) {
        store.trashFiles = []
      } else if (store?.value !== undefined) {
        store.value = []
      }
    }
  }
}

/**
 * 휴지통 파일 목록 저장
 * @param {Object} trashFiles - 휴지통 파일 목록 배열 (ref)
 */
function saveTrashFiles(trashFiles) {
  try {
    // 값을 명시적으로 배열로 복사
    const valueToSave = trashFiles.value || trashFiles
    const arrayToSave = Array.isArray(valueToSave) ? Array.from(valueToSave) : []
    localStorage.setItem('dev-trash-files', JSON.stringify(arrayToSave))
  } catch (error) {
    console.error('휴지통 파일 목록 저장 실패:', error)
  }
}

/**
 * 파일을 휴지통으로 이동
 * @param {string} fileName - 파일명
 * @param {Object} store - documentManagerStore 인스턴스
 */
export function moveToTrash(fileName, store) {
  if (store.addToTrash) {
    // Store의 메서드 사용
    store.addToTrash(fileName)
    // 값이 업데이트된 직후 명시적으로 복사하여 저장
    const currentValue = Array.from(store.trashFiles)
    saveTrashFiles({ value: currentValue })
  } else {
    // 레거시 방식 (ref 직접 전달)
    if (!store.trashFiles.includes(fileName)) {
      const currentArray = Array.isArray(store.trashFiles) ? Array.from(store.trashFiles) : []
      const newArray = [...currentArray, fileName]
      store.trashFiles = newArray
      saveTrashFiles({ value: Array.from(store.trashFiles) })
    }
  }
}

/**
 * 휴지통에서 파일 복구
 * @param {string} fileName - 파일명
 * @param {Object} store - documentManagerStore 인스턴스
 */
export function restoreFromTrash(fileName, store) {
  if (store.removeFromTrash) {
    store.removeFromTrash(fileName)
    saveTrashFiles({ value: store.trashFiles })
  } else {
    // 레거시 방식
    store.trashFiles = Array.from(store.trashFiles).filter((name) => name !== fileName)
    saveTrashFiles({ value: store.trashFiles })
  }
}

/**
 * 휴지통에서 영구 삭제 (API 호출 후 localStorage에서도 제거)
 * @param {string} fileName - 파일명
 * @param {Object} store - documentManagerStore 인스턴스
 * @returns {Promise<boolean>} - 삭제 성공 여부
 */
export async function permanentlyDeleteFromTrash(fileName, store) {
  try {
    // URL 인코딩 (한글 파일명 처리)
    const encodedFileName = encodeURIComponent(fileName)

    // API 호출하여 실제 파일 삭제
    const response = await fetch(`http://localhost:3000/api/docs/${encodedFileName}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `서버 오류: ${response.status}`)
    }

    await response.json()

    // localStorage에서도 제거
    if (store.removeFromTrash) {
      store.removeFromTrash(fileName)
      saveTrashFiles({ value: store.trashFiles })
    } else {
      // 레거시 방식
      store.trashFiles = Array.from(store.trashFiles).filter((name) => name !== fileName)
      saveTrashFiles({ value: store.trashFiles })
    }

    return true
  } catch (error) {
    console.error('[Trash] permanentlyDeleteFromTrash 실패:', error)
    throw error // 호출자에서 처리할 수 있도록 에러 전달
  }
}

/**
 * 전체 휴지통 비우기 (모든 휴지통 파일 영구 삭제)
 * @param {Object} store - documentManagerStore 인스턴스
 * @returns {Promise<number>} - 삭제된 파일 수
 */
export async function emptyTrash(store) {
  try {
    // 초기 trashFiles 배열을 복사 (각 파일 삭제 시 배열이 변경되므로 미리 복사)
    const trashFilesToDelete = Array.from(store.trashFiles || [])
    
    if (trashFilesToDelete.length === 0) {
      console.log('[Trash] emptyTrash: 휴지통이 이미 비어있습니다')
      return 0
    }

    console.log(`[Trash] emptyTrash: ${trashFilesToDelete.length}개 파일 삭제 시작`)

    let successCount = 0
    let failCount = 0
    const failedFiles = []

    // 모든 휴지통 파일을 순차적으로 삭제
    for (const fileName of trashFilesToDelete) {
      try {
        // URL 인코딩 (한글 파일명 처리)
        const encodedFileName = encodeURIComponent(fileName)

        // API 호출하여 실제 파일 삭제
        const response = await fetch(`http://localhost:3000/api/docs/${encodedFileName}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `서버 오류: ${response.status}`)
        }

        await response.json()
        console.log(`[Trash] 파일 삭제 성공: ${fileName}`)
        successCount++
      } catch (error) {
        console.error(`[Trash] 파일 삭제 실패: ${fileName}`, error)
        failCount++
        failedFiles.push(fileName)
      }
    }

    // 모든 파일 삭제 시도 후, 성공한 파일들을 trashFiles에서 제거
    // (permanentlyDeleteFromTrash를 사용하지 않고 직접 처리하여 중복 제거 방지)
    if (successCount > 0) {
      const remainingFiles = trashFilesToDelete.filter((fileName) => failedFiles.includes(fileName))
      
      // store 업데이트
      if (store.removeFromTrash) {
        // 성공한 파일들만 제거
        trashFilesToDelete.forEach((fileName) => {
          if (!failedFiles.includes(fileName)) {
            store.removeFromTrash(fileName)
          }
        })
      } else {
        // 레거시 방식: 실패한 파일만 남김
        store.trashFiles = remainingFiles
      }
      
      // localStorage 저장
      saveTrashFiles({ value: store.trashFiles || [] })
    }

    // 결과 반환
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
