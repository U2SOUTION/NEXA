/**
 * 부품 관리 시스템의 대분류 카테고리 상수
 *
 * 이 파일은 부품 분류의 대분류명 목록을 중앙에서 관리합니다.
 * 향후 대분류 약어(Category Abbreviation) 매핑도 여기에 추가될 예정입니다.
 */

// 기본 대분류 목록 (띄어쓰기 없이 통일)
export const DEFAULT_CATEGORIES = [
  '능동소자',
  '수동소자',
  '제어소자',
  '모듈보드',
  '하드웨어',
  '전원전압',
  '통신저장',
  '출력구동',
  '센서입력',
  '공구/소모품',
]

// 대분류 약어 매핑
// C Code와 겹치지 않도록 주의 (예: ACT는 C Code로 사용 가능하므로 ACP 사용)
export const CATEGORY_ABBREVIATIONS = {
  '능동소자': 'ACP',      // Active Component Parts (ACT 대신 사용, C Code와 겹침 방지)
  '수동소자': 'PAS',      // Passive Components
  '제어소자': 'CTL',      // Control Components
  '모듈보드': 'MOD',      // Module Board
  '하드웨어': 'HWD',      // Hardware
  '전원전압': 'PWR',      // Power
  '통신저장': 'COM',      // Communication Storage
  '출력구동': 'OUT',      // Output Drive
  '센서입력': 'SEN',      // Sensor Input
  '공구/소모품': 'TOL',   // Tools/Consumables
}
