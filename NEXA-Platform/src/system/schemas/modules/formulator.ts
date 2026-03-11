/**
 * 파일명: src/system/schemas/modules/formulator.ts
 * 역할: NEXA 시스템의 핵심 연산 단위인 '포뮬레이터(배합기)'의 데이터 규격을 정의합니다.
 */

import { z } from 'zod' // Zod 라이브러리 임포트

// 공통 스키마 및 분류 체계 임포트
import { MetadataSchema } from '../common/metadata'
// Taxonomy에서 정의된 그룹 분류 (MATH, LOGIC 등)
import { FormulatorGroupEnum } from '../common/taxonomy'

/**
 * [IngredientSchema]
 * 포뮬레이터의 입구(Input)와 출구(Output) 단자를 정의하는 규격입니다.
 * 요리의 재료(성분)와 완성된 요리(결과)의 데이터 타입을 검증합니다.
 */
const IngredientSchema = z.object({
  id: z.string(), // 성분 고유 식별자 (예: "in_temp", "out_alarm")
  label: z.string(), // UI 노드 단자 옆에 표시될 이름 (예: "현재 온도", "알람 신호")
  type: z.enum(['NUMBER', 'BOOLEAN', 'STRING', 'ANY']), // 데이터의 성질 정의
})

/**
 * [FormulatorSchema]
 * 독립적인 연산 로직을 가진 '배합기(노드)'의 통합 규격입니다.
 */
export const FormulatorSchema = z.object({
  // 1. 배합기 생성 및 추적 메타데이터 (ID, 생성시간 등)
  metadata: MetadataSchema,

  // 2. 배합기 정체성 (Taxonomy 연동)
  identity: z.object({
    group: FormulatorGroupEnum, // 배합 그룹 (예: MATH, LOGIC, FILTER 등)
    type: z.string(), // 세부 레시피 종류 (예: "ADDER", "SCALER")
    version: z.string().default('1.0.0'), // 로직 버전 관리
  }),

  // 3. 배합 인터페이스 (입출력 구성)
  // 노드 좌우에 배치될 단자(Socket)들의 정보입니다.
  interface: z.object({
    ingredients: z.array(IngredientSchema).default([]), // 투입 성분 (Inputs)
    results: z.array(IngredientSchema).default([]), // 추출 결과 (Outputs)
  }),

  /**
   * 4. 배합 세부 설정 (Recipe Settings)
   * 조리법의 구체적인 수치나 옵션을 저장합니다.
   * z.record를 사용하여 어떤 형태의 설정값도 유연하게 수용합니다.
   */
  settings: z.record(z.string(), z.unknown()).optional(),

  // 5. 시각적 표현 및 설명 (Kitchen UI 렌더링용)
  display: z.object({
    label: z.string(), // [추가] 노드 상단에 표시될 메인 이름 (예: "온도 합산기")
    icon: z.string().optional(), // 노드 성격에 맞는 아이콘 코드
    color: z.string(), // 그룹 테마 색상 (예: MATH는 파란색)
    description: z.string(), // 이 노드가 데이터를 어떻게 가공하는지에 대한 설명
  }),
})

/**
 * [ Formulator 타입 추론 ]
 * 정의된 스키마로부터 TypeScript 타입을 추출하여 서비스 레이어에서 사용합니다.
 */
export type Formulator = z.infer<typeof FormulatorSchema>
