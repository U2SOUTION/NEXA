import { z } from 'zod'

/**
 * [LEVEL 1] 하드웨어 및 물리적 정의 (Hardware Abstraction)
 * 장치가 가진 물리적 한계와 성능을 정의합니다.
 * 특정 제품명(STOVE) 대신 기능적 클래스로 관리하여 확장성을 확보합니다.
 */

// 하드웨어 대분류: 장치의 물리적 역할
export const HardwareClassEnum = z.enum([
  'THERMAL_CONTROL', // 열 생성 및 제어 (난로, 보일러, 히터)
  'FLUID_CONTROL', // 액체/기체 흐름 제어 (펌프, 밸브)
  'ATMOSPHERE_SENSE', // 환경 데이터 측정 (온습도, 미세먼지)
  'POWER_MANAGEMENT', // 에너지 관리 (배터리, 스마트 플러그)
  'MOTION_CONTROL', // 물리적 구동 (댐퍼 모터, 컨베이어 벨트)
  'GENERIC_GATEWAY', // 단순 데이터 중계 및 수집 장치
])

// 하드웨어 프로파일: 입출력(I/O)의 정밀도와 성격
export const CapabilityProfileEnum = z.enum([
  'ANALOG_INPUT_ONLY', // 읽기 전용 센서 (예: 단순 온도계)
  'BINARY_SWITCH', // 켜고 끄는 단순 제어 (예: 전등, 릴레이)
  'PRECISION_STEPPER', // 수치 기반 정밀 제어 (예: 댐퍼 각도 0~90도)
  'STREAMING_DATA', // 고속 연속 데이터 (예: 전력 파형, 진동 센서)
])

/**
 * [LEVEL 2] 데이터 통신 및 품질 (Data Quality & Performance)
 * 네트워크 부하와 데이터의 중요도를 결정하는 기준입니다.
 */

// 데이터 갱신 주기: 실시간성 요구 수준
export const UpdateFrequencyEnum = z.enum([
  'REALTIME', // 100ms 미만 (즉각적인 하드웨어 반응 필요 시)
  'NORMAL', // 1~5초 (일반적인 모니터링 데이터)
  'LAZY', // 1분 이상 (변화가 적은 통계성 데이터)
])

// 데이터 중요도: 사고 발생 시 시스템 알림 및 저장 정책의 기준
export const DataCriticalityEnum = z.enum([
  'LOW', // 단순 로그용 데이터
  'MEDIUM', // 일반적인 운영 정보
  'HIGH', // 주의가 필요한 임계치 접근 데이터
  'MISSION_CRITICAL', // 장비 파손이나 화재 위험 등 최우선 순위
])

/**
 * [LEVEL 3] 시스템 논리 및 권한 (System Logic & Access)
 * NEXA 소프트웨어 내부에서 데이터가 흐르는 범위와 조작 권한을 정의합니다.
 */

// 도메인 분류: 데이터의 기능적 정체성
export const NexetDomainEnum = z.enum([
  'SENSING', // 외부로부터 들어오는 순수 데이터
  'ACTUATING', // 외부로 나가는 제어 명령
  'SYSTEM', // 장치 자체의 건강 상태 (RSSI, CPU 등)
  'ANALYTICS', // AI가 가공하여 생성한 2차 지표
])

// 사용 범위: NEXA의 어떤 메뉴(Canvas)에서 이 넥셋을 사용할 것인가
export const SystemScopeEnum = z.enum([
  'BOARD', // 사용자용 대시보드 화면
  'NODE', // 로직을 설계하는 노드 에디터
  'TEACH', // AI 학습 및 데이터 분석 모드
  'ALL', // 모든 메뉴에서 접근 가능
])

// 제어 권한 모드: 누가 이 데이터를 변경할 수 있는가
export const ControlModeEnum = z.enum([
  'READ_ONLY', // 화면 표시 전용 (사용자/AI 수정 불가)
  'USER_CONTROL', // 사용자 수동 조작 우선
  'AI_OPTIMIZED', // AI의 자동 제어와 사용자 개입의 공존
  'LOCKED', // 시스템 보호를 위한 강제 잠금 상태
])

/**
 * [LEVEL 4] 시각화 유형 (Visualization)
 * 최종적으로 사용자에게 어떤 형태의 UI 컴포넌트로 보여줄 것인가를 결정합니다.
 */

export const VisualTypeEnum = z.enum([
  'METER', // 게이지, 원형 바늘 등 수치 시각화
  'SLIDER', // 범위를 조절하는 조절 바
  'TOGGLE', // ON/OFF 스위치
  'PLOT', // 차트, 그래프 등 시계열 데이터
  'TEXT', // 텍스트 메시지 및 레이블
])

// 연산자 카테고리 분류
export const FormulatorGroupEnum = z.enum([
  'MATH', // 산술 연산 (더하기, 평균 등)
  'LOGIC', // 논리 연산 (비교, AND/OR 등)
  'FILTER', // 데이터 가공 (범위 제한, 노이즈 제거 등)
  'TIME', // 시간 제어 (지연, 홀드 등)
  'CONVERT', // 데이터 변환 (단위 변환, 스케일링 등)
])
