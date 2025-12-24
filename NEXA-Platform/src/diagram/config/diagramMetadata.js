/**
 * diagramMetadata.js
 * 다이어그램 메타데이터 및 설정
 */

export const diagramTypes = {
  ERD: 'erd',
  FLOW: 'flow',
  NETWORK: 'network',
}

export const diagramMetadata = {
  [diagramTypes.ERD]: {
    name: 'ERD',
    label: 'Entity Relationship Diagram',
    description: '데이터베이스 테이블 관계 시각화',
    icon: 'schema',
    supportedFeatures: ['zoom', 'pan', 'node-drag', 'export'],
  },
  [diagramTypes.FLOW]: {
    name: 'Flow',
    label: 'Flowchart',
    description: '프로세스 흐름도',
    icon: 'account_tree',
    supportedFeatures: ['zoom', 'pan', 'node-drag', 'export'],
  },
  [diagramTypes.NETWORK]: {
    name: 'Network',
    label: 'Network Diagram',
    description: '네트워크 토폴로지 시각화',
    icon: 'hub',
    supportedFeatures: ['zoom', 'pan', 'node-drag', 'export'],
  },
}

export function getDiagramMetadata(type) {
  return diagramMetadata[type] || null
}

