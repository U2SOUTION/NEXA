/**
 * PDF 내보내기 유틸리티
 */

import { formatDataArray } from './exportFormatter'
import type { ColumnDef } from './exportTypes'
import type { FormattingOptions, ExportPdfOptions } from './exportTypes'

interface JsPDFDoc {
  addFileToVFS: (fileName: string, fontBase64: string) => void
  addFont: (fileName: string, fontName: string, fontStyle: string) => void
  getFontList: () => Record<string, unknown>
  setFont: (font: string, style?: string) => void
  setFontSize: (size: number) => void
  text: (text: string, x: number, y: number, options?: { align?: string }) => void
  output: (type: 'blob') => Blob
  internal: { getNumberOfPages: () => number }
}

async function addKoreanFont(doc: JsPDFDoc): Promise<void> {
  try {
    console.log('한글 폰트 추가 시작...')

    // Regular 폰트 추가
    const regularSuccess = await loadAndAddFont(
      doc,
      'NotoSansKR-Regular.ttf',
      'NotoSansKR',
      'normal',
      'noto-sans-kr-regular',
    )

    // Bold 폰트 추가 (헤더용)
    const boldSuccess = await loadAndAddFont(
      doc,
      'NotoSansKR-Bold.ttf',
      'NotoSansKR',
      'bold',
      'noto-sans-kr-bold',
    )

    if (!regularSuccess) {
      console.error('Regular 폰트 추가 실패 - PDF에서 한글이 깨질 수 있습니다.')
    }

    if (!boldSuccess) {
      console.warn('Bold 폰트 추가 실패 - 헤더는 Regular 폰트로 표시됩니다.')
    }

    // 최종 폰트 목록 확인
    const fontList = doc.getFontList()
    console.log('최종 등록된 폰트 목록:', fontList)
  } catch (error) {
    console.error('한글 폰트 로드 실패, 기본 폰트 사용:', error)
    // 폰트 로드 실패 시 기본 폰트 사용 (한글이 깨질 수 있음)
  }
}

/**
 * 폰트 파일을 로드하고 jsPDF에 추가
 * @param {Object} doc - jsPDF 인스턴스
 * @param {string} fileName - 폰트 파일명
 * @param {string} fontName - jsPDF에 등록할 폰트 이름
 * @param {string} fontStyle - 폰트 스타일 ('normal', 'bold' 등)
 * @param {string} cacheKey - localStorage 캐시 키
 * @returns {Promise<boolean>} 폰트 추가 성공 여부
 */
async function loadAndAddFont(doc: JsPDFDoc, fileName: string, fontName: string, fontStyle: string, cacheKey: string): Promise<boolean> {
  try {
    // 폰트 캐시 확인 (로컬 스토리지 사용)
    let fontBase64 = localStorage.getItem(cacheKey)

    if (!fontBase64) {
      // 프로젝트에 포함된 폰트 파일을 로드 시도
      try {
        // Vite를 통해 폰트 파일을 로드
        // 동적 import는 MIME type 오류를 발생시킬 수 있으므로 직접 경로 사용
        // Vite 개발 서버에서는 /src/assets/fonts/ 경로가 자동으로 처리됨
        const fontUrl = `/src/assets/fonts/${fileName}`

        console.log(`폰트 로드 시도: ${fontUrl}`)

        const response = await fetch(fontUrl)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const fontBlob = await response.blob()
        console.log(`폰트 파일 로드 성공: ${fileName}, 크기: ${fontBlob.size} bytes`)

        // Blob을 base64로 변환
        fontBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result
            const base64 = typeof result === 'string' ? result.split(',')[1] : undefined
            resolve(base64 ?? '')
          }
          reader.onerror = reject
          reader.readAsDataURL(fontBlob)
        })

        console.log(`폰트 base64 변환 완료: ${fileName}, 크기: ${fontBase64.length} chars`)

        // 캐시에 저장 시도 (용량 제한으로 실패할 수 있음)
        // 폰트 파일이 크므로(약 8MB) localStorage 용량 제한을 초과할 수 있음
        // 실패해도 메모리에서 사용 중이므로 기능에는 문제 없음
        try {
          localStorage.setItem(cacheKey, fontBase64)
          console.log(`폰트 캐시 저장 완료: ${fileName}`)
        } catch {
          // localStorage 저장 실패는 정상 (용량 제한)
          // 폰트는 메모리에 로드되어 사용 중이므로 문제 없음
          console.debug(`폰트 캐시 저장 건너뜀 (용량 제한): ${fileName}`)
        }
      } catch (importError) {
        // 폰트 파일이 없거나 로드 실패 시
        if (fontStyle === 'normal') {
          // Regular 폰트는 필수이므로 경고
          console.error(
            `한글 폰트 파일을 찾을 수 없습니다. src/assets/fonts/${fileName} 파일을 추가하세요.`,
            importError,
          )
          console.warn('폰트 파일이 없으면 PDF에서 한글이 깨질 수 있습니다.')
        } else {
          // Bold 등은 선택사항이므로 조용히 실패
          console.debug(`선택적 폰트 로드 실패 (${fileName}):`, importError)
        }
        return false // 폰트 추가 실패
      }
    } else {
      console.log(`폰트 캐시에서 로드: ${fileName}`)
    }

    // jsPDF에 폰트 추가
    try {
      // VFS에 파일 추가
      doc.addFileToVFS(fileName, fontBase64)
      console.log(`VFS에 폰트 추가 완료: ${fileName}`)

      // 폰트 등록
      doc.addFont(fileName, fontName, fontStyle)
      console.log(`폰트 등록 완료: ${fontName}, 스타일: ${fontStyle}`)

      // 등록 확인
      const fontList = doc.getFontList()
      console.log('등록된 폰트 목록:', fontList)

      // 폰트가 제대로 등록되었는지 확인
      const isRegistered = Object.keys(fontList).some((key) => key.includes(fontName))

      if (!isRegistered) {
        console.warn(`폰트 등록 확인 실패: ${fontName} (${fontStyle})`)
        return false
      }

      return true
    } catch (fontError) {
      console.error(`jsPDF 폰트 추가 실패 (${fileName}):`, fontError)
      // 폰트 추가 실패 시 기본 폰트 사용
      return false
    }
  } catch (error) {
    console.error(`폰트 로드 중 오류 발생 (${fileName}):`, error)
    return false
  }
}

/**
 * PDF 내보내기
 * @param {Array<Object>} data - 내보낼 데이터 배열
 * @param {Array<string>} columns - 선택된 열 이름 배열
 * @param {Array<Object>} columnDefinitions - 열 정의 배열 (label 포함)
 * @param {Object} options - PDF 옵션
 * @param {Object} formattingOptions - 포맷팅 옵션
 * @returns {Promise<Blob>} PDF Blob 객체
 */
export async function exportToPDF(
  data: Record<string, unknown>[],
  columns: string[],
  columnDefinitions: ColumnDef[] = [],
  options: ExportPdfOptions = {},
  formattingOptions: FormattingOptions = {}
): Promise<Blob> {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('내보낼 데이터가 없습니다.')
  }

  // 동적 import로 jspdf와 jspdf-autotable 로드
  const jsPDFModule = await import('jspdf')
  const autoTableModule = await import('jspdf-autotable')

  // jspdf는 named export 또는 default export를 제공할 수 있음 (생성자로 단언)
  type JsPDFCtorType = new (opts: { orientation?: string; unit?: string; format?: number[] }) => JsPDFDoc
  const JsPDFCtor = (jsPDFModule.jsPDF ?? jsPDFModule.default ?? jsPDFModule) as unknown as JsPDFCtorType
  // jspdf-autotable은 default export를 제공
  const autoTable = autoTableModule.default || autoTableModule

  // 데이터 포맷팅
  const formattedData = formatDataArray(data, columns, formattingOptions)

  const pageSizes: Record<string, { width: number; height: number }> = {
    a4: { width: 210, height: 297 },
    a3: { width: 297, height: 420 },
    letter: { width: 216, height: 279 },
  }
  const pageSize = pageSizes[options.pageSize ?? 'a4'] ?? pageSizes.a4
  const orientation = options.orientation === 'landscape' ? 'landscape' : 'portrait'

  const doc = new JsPDFCtor({
    orientation,
    unit: 'mm',
    format: [pageSize.width, pageSize.height],
  })

  await addKoreanFont(doc as unknown as JsPDFDoc)

  // 한글 폰트 설정
  try {
    doc.setFont('NotoSansKR')
  } catch (error) {
    // 폰트 설정 실패 시 기본 폰트 사용
    console.warn('한글 폰트 설정 실패:', error)
  }

  const getColumnLabel = (colName: string): string => {
    const colDef = columnDefinitions.find((col: ColumnDef) => col.name === colName)
    return colDef?.label ?? colName
  }

  const headers = columns.map((colName: string) => getColumnLabel(colName))

  const rows = formattedData.map((row: Record<string, string>) => {
    return columns.map((colName: string) => String(row[colName] ?? ''))
  })

  const pdfOpts = options as ExportPdfOptions
  if (pdfOpts.header?.show) {
    const headerTitle = pdfOpts.header?.title ?? '데이터 내보내기'
    try {
      doc.setFont('NotoSansKR', 'bold') // Bold 스타일 사용
    } catch {
      // Bold 폰트가 없으면 Regular 사용
      doc.setFont('NotoSansKR', 'normal')
    }
    doc.setFontSize(16)
    doc.text(headerTitle, 14, 20)
    // 헤더 후 본문 폰트를 Regular로 복원
    doc.setFont('NotoSansKR', 'normal')
  }

  // 테이블 생성
  ;(autoTable as (doc: unknown, opts: Record<string, unknown>) => void)(doc, {
    head: [headers],
    body: rows,
    startY: pdfOpts.header?.show ? 30 : 20,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'NotoSansKR', // 한글 폰트 사용
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
      font: 'NotoSansKR', // 한글 폰트 사용 (Bold 스타일)
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 20, right: 14, bottom: 20, left: 14 },
    didDrawPage: (data: { pageNumber: number }) => {
      if (pdfOpts.footer?.show) {
        const pageCount = (doc as unknown as JsPDFDoc).internal.getNumberOfPages()
        const pageNumber = data.pageNumber

        if (pdfOpts.footer?.pageNumber) {
          doc.setFont('NotoSansKR', 'normal') // Regular 폰트 사용
          doc.setFontSize(8) // 작은 크기로 설정
          doc.text(
            `페이지 ${pageNumber} / ${pageCount}`,
            pageSize.width / 2,
            pageSize.height - 10,
            {
              align: 'center',
            },
          )
        }

        // 날짜
        const now = new Date()
        const dateStr = now.toLocaleDateString('ko-KR')
        doc.setFont('NotoSansKR', 'normal') // Regular 폰트 사용
        doc.setFontSize(8) // 작은 크기로 설정
        doc.text(dateStr, pageSize.width - 14, pageSize.height - 10, {
          align: 'right',
        })
      }
    },
  })

  // PDF Blob 생성
  const pdfBlob = doc.output('blob')
  return pdfBlob
}

/**
 * PDF 다운로드
 * @param {Blob} blob - PDF Blob 객체
 * @param {string} fileName - 파일명
 */
export function downloadPDF(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
