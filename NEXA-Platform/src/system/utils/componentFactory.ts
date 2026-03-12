/**
 * 컴포넌트 팩토리 함수
 *
 * 표준 계약을 준수하는 컴포넌트를 생성하는 유틸리티 함수들
 *
 * @see docs/표준_계약_적용_실전_예제.md
 */

import type { BoardComponent, PanelComponent, ChartComponent, BlockComponent, MetadataContract, DataSourceContract } from '../schemas/common/component-contract'
import { uid } from 'quasar'

/**
 * 기본 메타데이터 생성
 */
function createMetadata(overrides?: Partial<MetadataContract>): MetadataContract {
  const now = new Date().toISOString()
  return {
    createdAt: now,
    updatedAt: now,
    tags: [],
    ...overrides,
  }
}

/**
 * 새로운 보드 컴포넌트 생성
 *
 * @example
 * ```typescript
 * const board = createBoard({
 *   name: '대시보드 1',
 *   preset: 'split-lr',
 *   devices: ['device-001']
 * })
 * ```
 */
export function createBoard(data: { name: string; preset?: 'single' | 'split-lr' | 'l-shape' | 'split-tb'; devices?: string[]; author?: string; tags?: string[] }): BoardComponent {
  const board: BoardComponent = {
    // 필수 필드
    id: uid(),
    type: 'board',
    version: '1.0',

    // 메타데이터 (표준)
    metadata: createMetadata({
      author: data.author,
      tags: data.tags,
      description: data.name,
    }),

    // 보드 자율적 구조
    preset: data.preset || 'single',
    panes: [],
    devices: data.devices || [],
    dataSource: undefined,

    // 표준 메서드
    toJSON() {
      return {
        id: this.id,
        type: this.type,
        version: this.version,
        metadata: this.metadata,
        preset: this.preset,
        panes: this.panes,
        devices: this.devices,
        actions: this.actions || [],
        dataSource: this.dataSource ?? undefined,
      }
    },
  }

  return board
}

/**
 * 보드 업데이트 (표준 계약 준수)
 */
export function updateBoard(board: BoardComponent, updates: Partial<Pick<BoardComponent, 'preset' | 'panes' | 'devices'>>): BoardComponent {
  return {
    ...board,
    ...updates,
    metadata: {
      ...board.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 새로운 패널 컴포넌트 생성
 *
 * @example
 * ```typescript
 * const panel = createPanel({
 *   panelType: 'chart',
 *   grid: { x: 0, y: 0, w: 6, h: 4 }
 * })
 * ```
 */
export function createPanel(data: { panelType: string; grid: { x: number; y: number; w: number; h: number }; content?: unknown; tags?: string[] }): PanelComponent {
  const panel: PanelComponent = {
    // 필수 필드
    id: uid(),
    type: 'panel',
    version: '1.0',

    // 메타데이터 (표준)
    metadata: createMetadata({
      tags: data.tags,
    }),

    // 패널 자율적 구조
    panelType: data.panelType,
    grid: data.grid,
    content: data.content || null,
    dataSource: undefined,

    // 표준 메서드
    toJSON() {
      return {
        id: this.id,
        type: this.type,
        version: this.version,
        metadata: this.metadata,
        panelType: this.panelType,
        grid: this.grid,
        content: this.content,
        actions: this.actions || [],
        dataSource: this.dataSource ?? undefined,
      }
    },
  }

  return panel
}

/**
 * 패널 이동 (인터랙션 표준화)
 */
export function movePanel(panel: PanelComponent, newPosition: { x: number; y: number }): PanelComponent {
  return {
    ...panel,
    grid: {
      ...panel.grid,
      x: newPosition.x,
      y: newPosition.y,
    },
    // 인터랙션을 actions 배열로 기록
    actions: [
      ...(panel.actions || []),
      {
        id: uid(),
        type: 'control' as const,
        target: panel.id,
        params: {
          action: 'move',
          x: newPosition.x,
          y: newPosition.y,
        },
        enabled: true,
        label: '패널 이동',
      },
    ],
    metadata: {
      ...panel.metadata,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 새로운 차트 컴포넌트 생성
 *
 * @example
 * ```typescript
 * const chart = createChart({
 *   chartType: 'line',
 *   dataSource: {
 *     type: 'db',
 *     connection: 'postgresql://...',
 *     query: { table: 'sensor_data' }
 *   }
 * })
 * ```
 */
export function createChart(data: {
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
  dataSource?: {
    type: 'db' | 'api' | 'device' | 'static'
    connection: string
    query?: Record<string, unknown>
    refreshInterval?: number
  }
  options?: Record<string, unknown>
  tags?: string[]
}): ChartComponent {
  const chart: ChartComponent = {
    // 필수 필드
    id: uid(),
    type: 'chart',
    version: '1.0',

    // 메타데이터 (표준)
    metadata: createMetadata({
      tags: data.tags,
    }),

    // 차트 자율적 구조
    chartType: data.chartType,
    data: [],
    options: data.options || {},

    // 데이터 소스 표준화
    dataSource: data.dataSource
      ? {
          type: data.dataSource.type,
          connection: data.dataSource.connection,
          query: data.dataSource.query,
          refreshInterval: data.dataSource.refreshInterval,
        } as DataSourceContract
      : undefined,

    // 표준 메서드
    toJSON() {
      return {
        id: this.id,
        type: this.type,
        version: this.version,
        metadata: this.metadata,
        chartType: this.chartType,
        data: this.data,
        options: this.options,
        actions: this.actions || [],
        dataSource: this.dataSource ?? undefined,
      }
    },
  }

  return chart
}

/**
 * 새로운 블록 컴포넌트 생성
 *
 * @example
 * ```typescript
 * const block = createBlock({
 *   blockType: 'time',
 *   config: { format: 'HH:mm:ss' }
 * })
 * ```
 */
export function createBlock(data: {
  blockType: 'time' | 'weather' | 'chart' | 'board' | 'device'
  config: Record<string, unknown>
  dataSource?: {
    type: 'db' | 'api' | 'device' | 'static'
    connection: string
    query?: Record<string, unknown>
    refreshInterval?: number
  }
  tags?: string[]
}): BlockComponent {
  const block: BlockComponent = {
    // 필수 필드
    id: uid(),
    type: 'block',
    version: '1.0',

    // 메타데이터 (표준)
    metadata: createMetadata({
      tags: data.tags,
    }),

    // 블록 자율적 구조
    blockType: data.blockType,
    config: data.config,

    // 데이터 소스 표준화
    dataSource: data.dataSource
      ? {
          type: data.dataSource.type,
          connection: data.dataSource.connection,
          query: data.dataSource.query,
          refreshInterval: data.dataSource.refreshInterval,
        } as DataSourceContract
      : undefined,

    // 표준 메서드
    toJSON() {
      return {
        id: this.id,
        type: this.type,
        version: this.version,
        metadata: this.metadata,
        blockType: this.blockType,
        config: this.config,
        actions: this.actions || [],
        dataSource: this.dataSource ?? undefined,
      }
    },
  }

  return block
}

/**
 * 기존 보드 데이터를 표준 계약 형식으로 변환
 *
 * 기존 코드를 리팩토링할 때 사용
 */
export function migrateBoardToStandardContract(oldBoard: { id: string; name: string; preset?: string; devices?: string[]; createdAt?: string; updatedAt?: string; author?: string; [key: string]: unknown }): BoardComponent {
  const now = new Date().toISOString()

  return {
    id: oldBoard.id,
    type: 'board',
    version: '1.0',
    metadata: createMetadata({
      createdAt: oldBoard.createdAt || now,
      updatedAt: oldBoard.updatedAt || now,
      author: oldBoard.author,
      description: oldBoard.name,
    }),
    preset: (oldBoard.preset === 'split-lr' || oldBoard.preset === 'l-shape' || oldBoard.preset === 'split-tb'
      ? oldBoard.preset
      : 'single') as BoardComponent['preset'],
    panes: [],
    devices: oldBoard.devices || [],
    dataSource: undefined,
    toJSON() {
      return {
        id: this.id,
        type: this.type,
        version: this.version,
        metadata: this.metadata,
        preset: this.preset,
        panes: this.panes,
        devices: this.devices,
        actions: this.actions || [],
        dataSource: this.dataSource ?? undefined,
      }
    },
  }
}
