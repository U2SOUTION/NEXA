/**
 * 파일명: src/services/engine/evaluatorService.ts
 * 역할: 개별 포뮬레이터(배합기) 노드의 실제 연산 로직을 실행하고 결과를 반환합니다.
 */

import { z } from 'zod' // 데이터 규격 검증을 위한 Zod 라이브러리

// 필요한 스키마 및 타입 임포트
import { Blueprint } from '../../schemas/modules/blueprint' // 설계도 규격
import { Formulator } from '../../schemas/modules/formulator' // 포뮬레이터 규격
import { FeedbackStatusEnum } from '../../schemas/common/display' // 피드백 상태 규격

/**
 * [ evaluateFormulator ]
 * 특정 포뮬레이터 노드 하나에 대해 입력을 받아 연산을 수행하는 핵심 함수입니다.
 */
export const evaluateFormulator = (
  formulator: Formulator, // 계산할 대상 노드 정보
  inputs: Record<string, any>, // 연결선을 통해 들어온 데이터 바구니
) => {
  // 1. 노드의 정체성(그룹, 타입)과 설정값(settings)을 추출합니다.
  const { group, type } = formulator.identity // MATH, LOGIC 등 그룹과 ADDER, SCALER 등 타입
  const settings = formulator.settings || {} // 사용자가 입력한 조리법(설정), 없으면 빈 객체

  // 2. 산술 연산 그룹(MATH)인 경우의 처리 로직
  if (group === 'MATH') {
    // [ADDER] 모든 입력값을 하나로 더하는 요리
    if (type === 'ADDER') {
      // 모든 입력 성분을 숫자로 변환하여 합산합니다. (값이 없으면 0 처리)
      const result = Object.values(inputs).reduce((acc, val) => acc + (Number(val) || 0), 0)

      return {
        value: result, // 결과 수치
        status: 'SUITABLE' as z.infer<typeof FeedbackStatusEnum>, // 상태: 적합
        message: '성공적으로 합산되었습니다.', // 사용자 피드백 메시지
      }
    }

    // [SCALER] 입력값을 특정 범위로 변환하는 요리
    if (type === 'SCALER') {
      const rawValue = Number(inputs['in']) || 0 // 'in' 단자로 들어온 원시 데이터
      const min = Number(settings['min']) || 0 // 설정된 최소값
      const max = Number(settings['max']) || 100 // 설정된 최대값

      // [유효성 검사] 최소값이 최대값보다 크면 요리 불가 상태를 반환합니다. (피드백 시스템)
      if (min >= max) {
        return {
          value: rawValue, // 계산 없이 원시값 반환
          status: 'IMPOSSIBLE' as z.infer<typeof FeedbackStatusEnum>, // 상태: 불가
          message: '범위 설정이 잘못되었습니다 (min >= max).', // 에러 메시지
        }
      }

      // 간단한 범위 변환 공식 적용
      const scaledValue = rawValue * (max - min) + min

      return {
        value: scaledValue,
        status: 'SUITABLE' as z.infer<typeof FeedbackStatusEnum>,
        message: '수치 변환이 완료되었습니다.',
      }
    }
  }

  // 3. 일치하는 로직이 없을 경우의 기본 반환값
  return {
    value: 0,
    status: 'NONE' as z.infer<typeof FeedbackStatusEnum>,
    message: '해당 레시피의 계산 로직을 찾을 수 없습니다.',
  }
}

/**
 * [ executeBlueprint ]
 * 설계도 전체를 읽어 실시간 엔진을 가동하는 메인 진입 함수입니다.
 */
export const executeBlueprint = (blueprint: Blueprint, rawData: Record<string, any>) => {
  // 설계도 이름과 함께 엔진 가동 로그를 남깁니다.
  console.log(`[NEXA 엔진] '${blueprint.config.name}' 설계도를 가동합니다.`)

  return {
    timestamp: new Date().toISOString(), // 가동 시각 기록
    results: {}, // 이후 flowManager를 통해 계산된 값들이 채워질 공간
  }
}
