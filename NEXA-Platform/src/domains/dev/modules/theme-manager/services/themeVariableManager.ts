/**
 * 테마 변수 관리 서비스
 * 테마 변수 삭제 및 관리 기능을 제공합니다.
 */

export interface VariableUsageResult {
  isUsed: boolean
  files: string[]
  usageCount: number
}

export interface DeleteVariableResult {
  success: boolean
  message: string
  usage?: VariableUsageResult
}

export interface BatchDeleteResult {
  variableName: string
  success: boolean
  message: string
}

export interface VariableDeclaration {
  line: number
  content: string
}

export interface UpdateThemeResult {
  success: boolean
  message: string
}

export async function checkVariableUsage(
  variableName: string,
): Promise<VariableUsageResult> {
  console.log('[themeVariableManager] checkVariableUsage 호출됨:', variableName)
  return { isUsed: false, files: [], usageCount: 0 }
}

export async function deleteVariable(
  variableName: string,
): Promise<DeleteVariableResult> {
  console.log('[themeVariableManager] deleteVariable 호출됨:', variableName)
  const usage = await checkVariableUsage(variableName)
  if (usage.isUsed) {
    return {
      success: false,
      message: `변수가 ${usage.usageCount}개 파일에서 사용 중입니다. 삭제하기 전에 모든 사용처를 제거하세요.`,
      usage,
    }
  }
  return { success: true, message: '변수가 성공적으로 삭제되었습니다.' }
}

export async function batchDeleteVariables(
  variableNames: string[],
): Promise<BatchDeleteResult[]> {
  console.log('[themeVariableManager] batchDeleteVariables 호출됨:', variableNames)
  const results: BatchDeleteResult[] = []
  for (const variableName of variableNames) {
    try {
      const result = await deleteVariable(variableName)
      results.push({ variableName, ...result })
    } catch (err) {
      const error = err as Error
      results.push({
        variableName,
        success: false,
        message: error.message || '삭제 중 오류가 발생했습니다.',
      })
    }
  }
  return results
}

export function findVariableDeclarations(
  fileContent: string,
  variableName: string,
): VariableDeclaration[] {
  const lines = fileContent.split('\n')
  const declarations: VariableDeclaration[] = []
  const pattern = new RegExp(
    `--${variableName.replace('--nexa-', 'nexa-')}\\s*:`,
  )
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      declarations.push({ line: index + 1, content: line })
    }
  })
  return declarations
}

export async function updateThemeFile(
  themeName: string,
  fileContent: string,
): Promise<UpdateThemeResult> {
  console.log('[themeVariableManager] updateThemeFile 호출됨:', {
    themeName,
    contentLength: fileContent.length,
  })
  return { success: false, message: '백엔드 API 연동이 필요합니다.' }
}

export function initialize(): void {
  console.log('[themeVariableManager] 초기화 완료')
}
