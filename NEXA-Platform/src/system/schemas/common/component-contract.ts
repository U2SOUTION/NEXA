/**
 * 컴포넌트 표준 계약 (Component Standard Contract)
 *
 * 모든 컴포넌트(노드, 보드, 차트, 블록, 넥셋)가 따라야 하는 최소한의 공통 규약
 *
 * @see docs/컴포넌트_표준_계약.md
 */

/**
 * 컴포넌트 타입
 */
export type ComponentType = 'board' | 'node' | 'chart' | 'block' | 'panel'

/**
 * 메타데이터 계약
 */
export interface MetadataContract {
  /** 생성일시 (ISO 8601 형식) */
  createdAt: string
  /** 수정일시 (ISO 8601 형식) */
  updatedAt: string
  /** 작성자 ID (선택적) */
  author?: string
  /** 태그 배열 (선택적) */
  tags?: string[]
  /** 설명 (선택적) */
  description?: string
}

/**
 * 액션 타입
 */
export type ActionType = 'control' | 'update' | 'trigger'

/**
 * 인터랙션 계약 (액션)
 */
export interface ActionContract {
  /** 액션 ID (고유 식별자) */
  id: string
  /** 액션 타입 */
  type: ActionType
  /** 대상 (디바이스 ID, 넥셋 ID 등) */
  target: string
  /** 액션 파라미터 */
  params: Record<string, unknown>
  /** 활성화 여부 */
  enabled: boolean
  /** 액션 라벨 (UI 표시용, 선택적) */
  label?: string
  /** 액션 설명 (선택적) */
  description?: string
  /** 우선순위 (낮을수록 높은 우선순위, 선택적) */
  priority?: number
}

/**
 * 데이터 소스 타입
 */
export type DataSourceType = 'db' | 'api' | 'device' | 'static'

/**
 * 데이터 소스 계약
 */
export interface DataSourceContract {
  /** 데이터 소스 타입 */
  type: DataSourceType
  /** 연결 정보 (DB 연결 문자열, API URL 등) */
  connection: string
  /** 쿼리 정보 (SQL 쿼리, API 파라미터 등, 선택적) */
  query?: Record<string, unknown>
  /** 갱신 주기 (밀리초, 선택적) */
  refreshInterval?: number
}

/**
 * 컴포넌트 표준 계약 인터페이스
 *
 * 모든 컴포넌트는 이 인터페이스를 구현해야 합니다.
 */
export interface ComponentContract {
  /** 고유 식별자 (UUID 권장) */
  id: string
  /** 컴포넌트 타입 */
  type: ComponentType
  /** 버전 정보 (예: '1.0', '2.1') */
  version: string
  /** 메타데이터 */
  metadata: MetadataContract
  /** 인터랙션 표준 (제어 기능이 있는 경우, 선택적) */
  actions?: ActionContract[]
  /** 데이터 소스 표준 (선택적) */
  dataSource?: DataSourceContract
  /** 표준 JSON 형식으로 변환 */
  toJSON(): Omit<ComponentContract, 'toJSON'>
}

/**
 * 보드 컴포넌트 확장 인터페이스
 */
export interface BoardComponent extends ComponentContract {
  type: 'board'
  /** 레이아웃 프리셋 */
  preset: 'single' | 'split-lr' | 'l-shape' | 'split-tb'
  /** 창(Pane) 구조 및 넥셋 배열 */
  panes: Array<{
    id: string
    panels: Array<{
      id: string
      content: unknown
    }>
  }>
  /** 연결된 디바이스 ID 배열 */
  devices: string[]
}

/**
 * 노드 컴포넌트 확장 인터페이스
 */
export interface NodeComponent extends ComponentContract {
  type: 'node'
  /** 노드 배열 (트리거, 처리, 액션) */
  nodes: Array<{
    id: string
    type: string
    [key: string]: unknown
  }>
  /** 노드 간 연결 정보 (소켓 연결) */
  connections: Array<{
    from: string
    to: string
    [key: string]: unknown
  }>
  /** 데이터 흐름 정의 */
  dataFlow: Record<string, unknown>
}

/**
 * 차트 컴포넌트 확장 인터페이스
 */
export interface ChartComponent extends ComponentContract {
  type: 'chart'
  /** 차트 타입 */
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
  /** 시각화 데이터 */
  data: unknown[]
  /** 차트 옵션 (스케일, 색상 등) */
  options: Record<string, unknown>
}

/**
 * 블록 컴포넌트 확장 인터페이스
 */
export interface BlockComponent extends ComponentContract {
  type: 'block'
  /** 블록 타입 */
  blockType: 'time' | 'weather' | 'chart' | 'board' | 'device'
  /** 블록 설정 */
  config: Record<string, unknown>
}

/**
 * 넥셋 컴포넌트 확장 인터페이스
 */
export interface PanelComponent extends ComponentContract {
  type: 'panel'
  /** 넥셋 타입 */
  panelType: string
  /** 그리드 위치/크기 */
  grid: {
    x: number
    y: number
    w: number
    h: number
  }
  /** 넥셋 내용 */
  content: unknown
}

/**
 * 모든 컴포넌트 타입의 유니온
 */
export type AnyComponent = BoardComponent | NodeComponent | ChartComponent | BlockComponent | PanelComponent

/**
 * 컴포넌트 타입 가드 함수
 */
export function isBoardComponent(component: AnyComponent): component is BoardComponent {
  return component.type === 'board'
}

export function isNodeComponent(component: AnyComponent): component is NodeComponent {
  return component.type === 'node'
}

export function isChartComponent(component: AnyComponent): component is ChartComponent {
  return component.type === 'chart'
}

export function isBlockComponent(component: AnyComponent): component is BlockComponent {
  return component.type === 'block'
}

export function isPanelComponent(component: AnyComponent): component is PanelComponent {
  return component.type === 'panel'
}
