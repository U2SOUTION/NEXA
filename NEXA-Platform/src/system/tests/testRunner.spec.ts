/**
 * 파일명: src/system/tests/testRunner.spec.ts
 * 역할: Vitest 환경에서 설계도(Blueprint)의 데이터 흐름을 시뮬레이션하고 검증합니다.
 */

import { describe, it, expect } from 'vitest'
// [경로] tsconfig.json의 paths 설정(@/)을 사용하여 안전하게 임포트합니다.
import { Blueprint } from '@system/schemas/modules/blueprint'
import { processFlow } from '@engines/services/flowManager'

describe('NEXA 엔진 통합 시뮬레이션', () => {
  it('온도 센서 데이터가 합산 및 범위 변환 로직을 거쳐 최종 결과값에 도달해야 한다', () => {
    // 1. 테스트를 위한 가상의 설계도(Mock Blueprint) 정의
    const mockBlueprint = {
      metadata: { id: 'bp-001', createdAt: new Date(), version: '1.0.0' },
      config: { name: '지구 온난화 감시 아트를 위한 온도 배합' },
      composition: {
        // 데이터의 시작과 끝을 담당하는 넥셋
        panels: [
          { metadata: { id: 'p-raw-1' }, identity: { type: 'RAW_SOURCE' }, display: { label: '서울 온도 센서' } },
          { metadata: { id: 'p-res-1' }, identity: { type: 'LOGIC_RESULT' }, display: { label: '아트 조명 강도' } },
        ],
        // 실제 연산을 수행하는 포뮬레이터(배합기)
        formulators: [
          {
            metadata: { id: 'f-adder' },
            identity: { group: 'MATH', type: 'ADDER' },
            interface: { ingredients: [], results: [] },
            display: { label: '기본 온도 보정기', color: 'blue', description: '온도 합산' },
            settings: {},
          },
          {
            metadata: { id: 'f-scaler' },
            identity: { group: 'MATH', type: 'SCALER' },
            interface: { ingredients: [], results: [] },
            display: { label: '조명 변환기', color: 'orange', description: '범위 변환' },
            settings: { min: 0, max: 255 }, // 0~1 범위를 0~255로 변환한다고 가정
          },
        ],
        // 노드 사이를 잇는 데이터 통로(연결선)
        connections: [
          {
            source: { formulatorId: 'p-raw-1' },
            target: { formulatorId: 'f-adder', ingredientId: 'in1' },
          },
          {
            source: { formulatorId: 'f-adder' },
            target: { formulatorId: 'f-scaler', ingredientId: 'in' },
          },
        ],
      },
    } as Blueprint

    // 2. 외부에서 주입되는 가상의 센서 데이터 (서울 온도 0.5도 보정값 가정)
    const sensorInput = {
      'p-raw-1': 0.5,
    }

    // 3. 엔진 가동 (flowManager 실행)
    // 실제 서비스 로직을 호출하여 연산을 수행합니다.
    const finalResults = processFlow(mockBlueprint, sensorInput)

    // 4. 검증 (Expectation)
    // [ADDER] 결과는 0.5 (입력이 하나이므로)
    // [SCALER] 결과는 0.5 * (255 - 0) + 0 = 127.5
    const expectedValue = 127.5

    console.log(`[Test] 입력값: ${sensorInput['p-raw-1']} -> 최종 결과: ${finalResults['f-scaler']}`)

    // 결과값이 예상치와 일치하는지 확인합니다.
    expect(finalResults['f-scaler']).toBe(expectedValue)
  })
})
