/**
 * 파일명: src/services/engine/flowManager.ts
 * 역할: 설계도(Blueprint) 내의 노드 간 데이터 흐름을 관제하고 실행 순서를 관리합니다.
 */

import { Blueprint } from '@system/schemas/modules/blueprint' // 설계도 규격
import { Connection } from '@system/schemas/modules/connection' // 연결선 규격
import { evaluateFormulator } from './evaluatorService' // 연산 엔진

/**
 * [ determineExecutionOrder ]
 * 노드들의 연결 상태를 분석하여 계산 우선순위를 결정합니다.
 */
export const determineExecutionOrder = (blueprint: Blueprint) => {
  // 현재는 등록된 순서대로 반환하지만, 추후 의존성 그래프(DAG) 분석 로직이 추가될 자리입니다.
  const { formulators } = blueprint.composition
  return formulators
}

/**
 * [ processFlow ]
 * 실시간으로 데이터를 노드 사이사이에 흘려보내며 전체 로직을 실행합니다.
 */
export const processFlow = (
  blueprint: Blueprint,
  initialInputs: Record<string, any>, // 외부에서 들어온 초기값 (예: 센서 데이터)
) => {
  // 1. 모든 노드의 계산 결과가 임시 저장될 바구니입니다.
  const flowResults: Record<string, any> = { ...initialInputs }

  // 2. 실행 순서에 맞춰 노드 리스트를 가져옵니다.
  const executionQueue = determineExecutionOrder(blueprint)

  // 3. 각 노드(배합기)를 하나씩 순차적으로 연산합니다.
  executionQueue.forEach((formulator) => {
    // 현재 노드로 들어오는 모든 연결선(입력선)을 찾습니다.
    const incomingConnections = blueprint.composition.connections.filter((conn) => conn.target.formulatorId === formulator.metadata.id)

    // 연산기에 투입할 입력 성분(Ingredients)들을 모읍니다.
    const currentInputs: Record<string, any> = {}
    incomingConnections.forEach((conn) => {
      // 소스 노드에서 계산되었던 결과값을 가져와 현재 노드의 입력값으로 매핑합니다.
      const sourceValue = flowResults[conn.source.formulatorId]
      currentInputs[conn.target.ingredientId] = sourceValue
    })

    // 4. 실제로 요리(연산)를 수행합니다.
    const evaluation = evaluateFormulator(formulator, currentInputs)

    // 5. 결과값을 저장소에 기록하여 다음 노드가 재료로 쓸 수 있게 합니다.
    flowResults[formulator.metadata.id] = evaluation.value

    // 계산 진행 상황을 로그로 출력합니다. (display.label 사용)
    console.log(`[Flow] ${formulator.display.label}: ${evaluation.message} (결과: ${evaluation.value})`)
  })

  // 최종적으로 모든 노드가 가공된 결과 맵을 반환합니다.
  return flowResults
}
