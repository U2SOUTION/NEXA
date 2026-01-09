import { z } from 'zod'

/**
 * [ADDER_RECIPE]
 * 여러 성분을 합산합니다.
 * 특별한 설정보다는 입력 성분(ingredients)의 개수에 따라 동적으로 작동합니다.
 * [보안] z.record(z.string(), z.any())를 사용하여 유연한 설정을 허용하면서 인자 에러를 방지합니다.
 * 동적 유연성: ADDER나 AVERAGER는 입력 성분(ingredients) 배열의 길이에 따라 2개 이상의 값을 자유롭게 처리할 수 있도록 설계되었습니다.
 * 안정성 장치: SCALER의 clamp 옵션은 센서 오작동으로 인해 예상 범위를 벗어난 값이 들어와도 시스템 전체에 무리가 가지 않도록 값을 가두는 역할을 합니다
 */
export const AdderSettingsSchema = z.object({
  offset: z.number().default(0), // 합산 결과에 추가할 보정값
})

/**
 * [SCALER_RECIPE]
 * 입력 범위(예: 센서 0~1023)를 출력 범위(예: 0~100%)로 비례 계산하여 변환합니다.
 * 공학적 요리에서 가장 빈번하게 사용되는 '단위 변환기'입니다.
 */
export const ScalerSettingsSchema = z.object({
  inputMin: z.number(), // 소스 최소값
  inputMax: z.number(), // 소스 최대값
  outputMin: z.number(), // 결과 최소값
  outputMax: z.number(), // 결과 최대값
  clamp: z.boolean().default(true), // 범위를 벗어날 경우 최소/최대값에 고정할지 여부
})

/**
 * [AVERAGER_RECIPE]
 * 투입된 성분들의 평균을 계산합니다.
 */
export const AveragerSettingsSchema = z.object({
  precision: z.number().int().min(0).max(5).default(2), // 소수점 자릿수 설정
})
