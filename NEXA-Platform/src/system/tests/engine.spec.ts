/**
 * 파일명: src/system/tests/engine.spec.ts
 * 역할: Vitest 환경에서 엔진 로직을 검증합니다.
 */
import { describe, it, expect } from 'vitest'
import { Blueprint } from '@system/schemas/modules/blueprint'
import { processFlow } from '@engines/services/flowManager'

describe('NEXA 엔진 흐름 테스트', () => {
  it('온도 데이터가 포뮬레이터를 거쳐 정상적으로 변환되어야 한다', () => {
    // 가상의 설계도 데이터
    const mockBlueprint: any = {
      metadata: { id: 'bp-001' },
      composition: {
        panels: [],
        formulators: [
          {
            metadata: { id: 'f-scaler' },
            identity: { group: 'MATH', type: 'SCALER' },
            display: { label: '변환기' },
            settings: { min: 0, max: 100 },
          },
        ],
        connections: [
          {
            source: { formulatorId: 'p-raw' },
            target: { formulatorId: 'f-scaler', ingredientId: 'in' },
          },
        ],
      },
    }

    const input = { 'p-raw': 0.5 }
    const result = processFlow(mockBlueprint as Blueprint, input)

    // 결과 검증: 0.5가 0~100 사이에서 50으로 변환되었는지 확인
    expect(result['f-scaler']).toBe(50)
  })
})
