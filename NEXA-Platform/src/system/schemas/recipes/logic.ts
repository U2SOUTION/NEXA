import { z } from 'zod'

/**
 * [COMPARATOR_RECIPE]
 * 두 수치를 비교하여 논리값(Boolean)을 출력합니다.
 * "A가 B보다 큰가?"와 같은 기본적인 판단을 수행합니다.
 */
export const ComparatorSettingsSchema = z.object({
  operator: z.enum(['>', '<', '>=', '<=', '==', '!=']), // 비교 연산자
  tolerance: z.number().default(0), // 미세한 진동에 의한 떨림 방지를 위한 허용 오차
})

/**
 * [LOGIC_GATE_RECIPE]
 * 여러 논리 성분(Boolean)을 결합하여 하나의 결과를 만듭니다.
 * AND, OR, NOT, XOR 등 표준 논리 게이트 역할을 합니다.
 */
export const LogicGateSettingsSchema = z.object({
  gateType: z.enum(['AND', 'OR', 'NOT', 'XOR', 'NAND']), // 논리 연산 유형
})

/**
 * [BETWEEN_RECIPE]
 * 입력값이 특정 범위(Min ~ Max) 안에 있는지 확인합니다.
 * "온도가 적정 범위(20~25도) 내에 있는가?"를 판별할 때 유용합니다.
 */
export const BetweenSettingsSchema = z.object({
  min: z.number(),
  max: z.number(),
  inclusive: z.boolean().default(true), // 경계값 포함 여부
})
