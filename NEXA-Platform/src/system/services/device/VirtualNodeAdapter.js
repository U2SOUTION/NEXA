/**
 * File: VirtualNodeAdapter.js
 * Path: src/system/services/device/VirtualNodeAdapter.js
 * Description: VDM 데이터를 ForceDirectedDiagram 형식으로 변환하여 렌더링 엔진에 전달
 */

import { vdm } from './VirtualDeviceManager'

class VirtualNodeAdapter {
  constructor() {
    this.isInitialized = false
    this.currentDiagramData = { packages: [], dependencies: [] }
  }

  init() {
    if (this.isInitialized) return

    vdm.subscribe((event, data) => {
      switch (event) {
        case 'DEVICE_REGISTERED':
          this.syncWithDiagram(data.deviceId, data.ports)
          break
        case 'ID_ROTATED':
          this.handleSecurityUpdate(data.deviceId, data.rotationMap)
          break
      }
    })

    this.isInitialized = true
  }

  /**
   * D3 렌더러가 인식할 수 있는 객체 구조로 변환
   */
  syncWithDiagram(deviceId, ports) {
    // 1. 노드(Package) 생성
    const newNode = {
      id: deviceId,
      name: deviceId,
      color: 'var(--nexa-orange)', // IoT 장비 전용 색상
      radius: 50, // 기본 노드보다 조금 크게
      ports: ports, // 확장 데이터 보존
    }

    // 2. 기존 데이터에 추가 (중복 체크 후)
    const exists = this.currentDiagramData.packages.find((p) => p.id === deviceId)
    if (!exists) {
      this.currentDiagramData.packages.push(newNode)
    }

    // 3. 렌더링 엔진에 데이터 전달 및 갱신 요청
    this.requestRender()
  }

  requestRender() {
    console.log('🚀 [Adapter] D3 렌더러에 갱신된 데이터 전달:', this.currentDiagramData)
    // TODO: 현재 페이지의 ForceDirectedDiagram 인스턴스에 데이터를 주입하고 다시 그립니다.
    // window.dispatchEvent(new CustomEvent('nexa-render-update', { detail: this.currentDiagramData }));
  }

  handleSecurityUpdate(deviceId, rotationMap) {
    // 보안 ID 갱신 시 노드 내부 데이터 업데이트
    const node = this.currentDiagramData.packages.find((p) => p.id === deviceId)
    if (node) {
      node.lastSecurityRotation = new Date().getTime()
      node.rotationMap = rotationMap
      console.log(`🛡️ [Adapter] Node ${deviceId} Security Mapping Synced.`)
    }
  }
}

export const nodeAdapter = new VirtualNodeAdapter()
