import { z } from 'zod'

/**
 * [DEADBAND_RECIPE]
 * 미세한 값의 변화를 무시하여 제어 장치의 잦은 ON/OFF(헌팅 현상)를 방지합니다.
 * 설정된 임계값보다 적게 변하면 이전 값을 유지합니다.
 *
 * 시스템 수명 연장: DEADBAND를 통해 불필요한 장비 가동을 줄여 하드웨어의 마모를 방지할 수 있습니다.
 * 데이터 신뢰도 향상: SMOOTHER는 저가형 센서에서 발생하는 일시적인 튀는 값(Spike)을 효과적으로 억제합니다.
 * 최후의 보루: LIMITER는 논리적 오류가 발생하더라도 하드웨어가 허용 범위를 넘어서는 동작을 하지 못하도록 차단하는 안전장치입니다.
 */
export const DeadbandSettingsSchema = z.object({
  width: z.number().min(0), // 변화를 무시할 구간의 너비
  mode: z.enum(['ABSOLUTE', 'PERCENTAGE']).default('ABSOLUTE'), // 절대값 또는 비율 기준
})

/**
 * [SMOOTHER_RECIPE] (이동 평균 또는 지수 필터)
 * 급격하게 튀는 값을 완만하게 만들어줍니다.
 * 센서의 튀는 현상을 잡거나 부드러운 가속/감속이 필요할 때 사용합니다.
 */
export const SmootherSettingsSchema = z.object({
  factor: z.number().min(0).max(1).default(0.2), // 값이 클수록 이전 데이터의 비중이 높아짐 (부드러워짐)
  sampleWindow: z.number().int().min(1).default(10), // 이동 평균 계산 시 사용할 샘플 개수
})

/**
 * [LIMITER_RECIPE]
 * 출력값이 특정 범위를 절대로 넘지 않도록 강제로 가둡니다.
 * 하드웨어 보호를 위한 '안전 가이드라인' 역할을 합니다.
 */
export const LimiterSettingsSchema = z.object({
  min: z.number().optional(), // 하한값 (없으면 제한 없음)
  max: z.number().optional(), // 상한값 (없으면 제한 없음)
})
