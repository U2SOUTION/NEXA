import type { Ref } from 'vue'
import { computed } from 'vue'

export interface FileWithName {
  name: string
}

/**
 * 문서 통계 계산 Composable
 */
export function useDocumentStats(
  markdownFiles: Ref<FileWithName[]>,
  fileContents: Ref<Record<string, string>>,
  checkboxStates: Ref<Record<string, Record<string, boolean>>>,
) {
  function getFileCheckboxStats(file: FileWithName) {
    if (!fileContents.value || !fileContents.value[file.name]) {
      return { total: 0, completed: 0, pending: 0 }
    }
    
    const content = fileContents.value[file.name]
    if (!content) {
      return { total: 0, completed: 0, pending: 0 }
    }

    const fileKey = file.name
    const fileCheckboxStates = (checkboxStates.value && checkboxStates.value[fileKey]) || {}

    const lines = content.split('\n')
    let total = 0
    let completed = 0
    let inCodeBlock = false

    lines.forEach((line: string, lineIndex: number) => {
      const cleanLine = line.replace(/\r$/, '')
      const trimmedLine = cleanLine.trim()

      // 코드 블록 시작/종료 감지
      if (trimmedLine.startsWith('```')) {
        inCodeBlock = !inCodeBlock
        return
      }

      // 코드 블록 내부는 제외
      if (inCodeBlock) return

      // 체크박스 패턴 매칭 (하이픈 뒤 공백 1개 이상 허용)
      const checkboxMatch = cleanLine.match(/^(\s*)- +\[([ x])\] (.+)$/)
      if (checkboxMatch) {
        total++
        const lineKey = `line-${lineIndex}`
        const originalChecked = checkboxMatch[2].toLowerCase() === 'x'
        const isChecked = fileCheckboxStates[lineKey] !== undefined ? fileCheckboxStates[lineKey] : originalChecked

        if (isChecked) {
          completed++
        }
      }
    })

    return {
      total,
      completed,
      pending: total - completed,
    }
  }

  function getFileTotalCount(file: FileWithName) {
    return getFileCheckboxStats(file).total
  }

  // 파일의 완료된 체크박스 개수
  function getFileCompletedCount(file: FileWithName) {
    return getFileCheckboxStats(file).completed
  }

  // 파일의 미완료 체크박스 개수
  function getFilePendingCount(file: FileWithName) {
    return getFileCheckboxStats(file).pending
  }

  // 파일의 진행률 (0-100)
  function getFileProgress(file: FileWithName) {
    const stats = getFileCheckboxStats(file)
    if (stats.total === 0) return 0
    return Math.round((stats.completed / stats.total) * 100)
  }

  // 전체 통계 계산
  const overallStats = computed(() => {
    let total = 0
    let completed = 0

    if (!markdownFiles.value || !Array.isArray(markdownFiles.value)) {
      return { total: 0, completed: 0, pending: 0 }
    }

    markdownFiles.value.forEach((file: FileWithName) => {
      const stats = getFileCheckboxStats(file)
      total += stats.total
      completed += stats.completed
    })

    return {
      total,
      completed,
      pending: total - completed,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
    }
  })

  // 전체 진행률
  const overallProgress = computed(() => overallStats.value.progress)

  // 전체 완료 개수
  const totalCompleted = computed(() => overallStats.value.completed)

  // 전체 미완료 개수
  const totalPending = computed(() => overallStats.value.pending)

  // 전체 아이템 개수
  const totalItems = computed(() => overallStats.value.total)

  return {
    getFileCheckboxStats,
    getFileTotalCount,
    getFileCompletedCount,
    getFilePendingCount,
    getFileProgress,
    overallStats,
    overallProgress,
    totalCompleted,
    totalPending,
    totalItems,
  }
}

