/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — strict 타입은 추후 엔진 재작성 시 적용
/**
 * diagramMetadata.js
 * 다이어그램 메타데이터 및 설정
 */

export const diagramTypes = {
  ERD: 'erd',
  FLOW: 'flow',
  NETWORK: 'network',
  DEPENDENCY: 'dependency',
  FILETREE: 'filetree',
  DEPENDENCY_ANALYSIS: 'dependency-analysis',
  IOT_NETWORK: 'iot-network',
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
  [diagramTypes.DEPENDENCY]: {
    name: 'Dependency',
    label: '파일 의존성 그래프',
    description: '파일 간 의존성 관계 시각화',
    icon: 'account_tree',
    supportedFeatures: ['zoom', 'pan', 'node-drag', 'export'],
  },
  [diagramTypes.FILETREE]: {
    name: 'FileTree',
    label: 'File Tree',
    description: '파일 구조 트리 시각화',
    icon: 'view_module',
    supportedFeatures: ['zoom', 'pan', 'expand-collapse', 'export'],
  },
  [diagramTypes.DEPENDENCY_ANALYSIS]: {
    name: 'DependencyAnalysis',
    label: '패키지 의존성 그래프',
    description: '패키지 의존성 분석 시각화',
    icon: 'hub',
    supportedFeatures: ['zoom', 'pan', 'node-drag', 'export', 'node-hover', 'force-layout'],
  },
  [diagramTypes.IOT_NETWORK]: {
    name: 'IoTNetwork',
    label: 'IoT Device Network',
    description: '가상 장비 연동 시뮬레이터 그래프',
    icon: 'devices',
    supportedFeatures: ['zoom', 'pan', 'node-drag', 'export'],
  },
}

export function getDiagramMetadata(type) {
  return diagramMetadata[type] || null
}
