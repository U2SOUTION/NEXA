/**
 * Chrome/브라우저 확장 API 타입 (Performance.memory, Navigator.connection 등)
 */
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }

  interface Navigator {
    connection?: NetworkInformation
    mozConnection?: NetworkInformation
    webkitConnection?: NetworkInformation
  }

  interface NetworkInformation {
    downlink?: number
    effectiveType?: string
    rtt?: number
    saveData?: boolean
  }
}

export {}
