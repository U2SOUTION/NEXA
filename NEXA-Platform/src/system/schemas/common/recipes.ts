/**
 * src/system/schemas/common/recipes.ts
 * 각 그룹별로 사용할 수 있는 세부 레시피(Recipe) 목록입니다.
 */
import { z } from 'zod'

export const MathRecipeEnum = z.enum(['ADDER', 'SUBTRACTOR', 'AVERAGER', 'SCALER', 'MULTIPLIER'])

export const LogicRecipeEnum = z.enum(['COMPARATOR', 'AND', 'OR', 'NOT', 'BETWEEN'])

export const FilterRecipeEnum = z.enum(['DEADBAND', 'SMOOTHER', 'LIMITER'])
