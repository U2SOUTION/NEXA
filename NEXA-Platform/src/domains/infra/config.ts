/**
 * INFRA 도메인 설정 (v2)
 */

export const INFRA_CONFIG = {
  name: 'infra',
  label: '인프라 관리',
  icon: 'settings',
  
  // 하위 메뉴 설정
  subMenus: [
    {
      id: 'my-devices',
      label: '장치 관리',
      icon: 'devices',
      description: '장치 목록 및 상세 관리'
    },
    {
      id: 'physical-map',
      label: '물리 맵',
      icon: 'map',
      description: '도면 기반 자산 배치'
    },
    {
      id: 'system-status',
      label: '시스템 상태',
      icon: 'monitor_heart',
      description: '실시간 리소스 모니터링'
    }
  ]
}

export default INFRA_CONFIG
