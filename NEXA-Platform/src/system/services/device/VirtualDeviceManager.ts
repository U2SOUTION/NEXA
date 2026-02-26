/**
 * File: VirtualDeviceManager.js
 * Path: src/system/services/device/VirtualDeviceManager.js
 * Description: 가상 IoT 장비와 NEXA 캔버스 간의 데이터 통신 및 보안 매핑 중재
 */

class VirtualDeviceManager {
  constructor() {
    // 현재 활성화된 가상 장비들의 상태 저장소
    this.activeDevices = new Map()
    // 이벤트 콜백 리스트 (캔버스 노드 업데이트용)
    this.subscribers = []
  }

  /**
   * 장비 등록 및 명세(Spec) 업데이트
   * @param {string} deviceId - 장비 고유 ID (Static 또는 초기 Dynamic ID)
   * @param {Array} ports - 장비의 포트 리스트
   */
  registerDevice(deviceId, ports) {
    this.activeDevices.set(deviceId, {
      lastSeen: new Date(),
      ports: ports,
    })
    console.log(`✨ [VDM] Device Registered: ${deviceId}`)
    this.notifySubscribers('DEVICE_REGISTERED', { deviceId, ports })
  }

  /**
   * 포트 값 변경 이벤트 처리
   * 가상 장비 UI에서 값이 바뀌면 이 함수가 호출됩니다.
   */
  updatePortValue(deviceId, staticKey, dynamicId, newValue) {
    const device = this.activeDevices.get(deviceId)
    if (device) {
      const port = device.ports.find((p) => p.staticKey === staticKey)
      if (port) {
        port.value = newValue
        // 캔버스 엔진에 보안 검증된 값 전달
        this.notifySubscribers('PORT_UPDATED', {
          deviceId,
          staticKey,
          dynamicId, // 보안 확인용
          value: newValue,
        })
      }
    }
  }

  /**
   * 보안 핵심: ID 순환(Rotation) 발생 보고
   */
  reportIdRotation(deviceId, rotationMap) {
    console.log(`🛡️ [VDM] Security Alert: ID Rotation for ${deviceId}`)
    this.notifySubscribers('ID_ROTATED', { deviceId, rotationMap })
  }

  /**
   * 캔버스 노드 등 외부에서 이벤트를 구독하기 위한 함수
   */
  subscribe(callback) {
    this.subscribers.push(callback)
  }

  notifySubscribers(event, data) {
    this.subscribers.forEach((callback) => callback(event, data))
  }
}

// 싱글톤 인스턴스로 수출
export const vdm = new VirtualDeviceManager()
