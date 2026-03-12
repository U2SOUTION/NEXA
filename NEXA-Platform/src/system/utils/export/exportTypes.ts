/**
 * 내보내기/인쇄 공통 타입
 */

export interface ColumnDef {
  name: string
  label: string
  field?: string
  [key: string]: unknown
}

export interface FormattingOptions {
  dateFormat?: string
  numberFormat?: { useThousandSeparator?: boolean; decimalPlaces?: number }
  nullValue?: 'empty' | 'na' | 'dash'
  removeHtmlTags?: boolean
}

export interface ExportCsvOptions {
  delimiter?: 'comma' | 'semicolon' | 'tab'
  encoding?: string
}

export interface ExportExcelOptions {
  sheetSplit?: 'none' | 'byCount' | 'bySize'
  [key: string]: unknown
}

export interface ExportPdfOptions {
  pageSize?: 'a4' | 'a3' | 'letter'
  orientation?: 'portrait' | 'landscape'
  header?: { show?: boolean; title?: string }
  footer?: { show?: boolean; pageNumber?: boolean; showDate?: boolean }
  [key: string]: unknown
}

export interface PrintOptions {
  header?: { show?: boolean; title?: string; showDate?: boolean }
  footer?: { show?: boolean; pageNumber?: boolean; showDate?: boolean }
  style?: { fontSize?: string; borderWidth?: string; padding?: string }
  watermark?: { text?: string; customText?: string; position?: string; opacity?: number; show?: boolean }
  paperSize?: string
  orientation?: string
  color?: boolean
  [key: string]: unknown
}
