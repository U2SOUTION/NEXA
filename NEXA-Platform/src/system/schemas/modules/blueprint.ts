import { z } from 'zod' // 데이터 규격 정의를 위한 Zod 임포트

/**
 * [ 외부 스키마 임포트 ]
 * 설계도를 구성하는 작은 조각(모듈)들을 가져옵니다.
 * 넥셋 통합(Panels Integration): 기존에 포뮬레이터와 연결선만 있던 구조에 panels 배열을 추가했습니다.
 * 이로써 **"어떤 넥셋(데이터 원천)에서 시작해서, 어떤 포뮬레이터(가공)를 거쳐, 어떤 넥셋(결과)로 끝나는지"**에 대한 전체 흐름을 저장할 수 있습니다.
 * 상태 보존(Visual Consistency): 사용자가 캔버스를 어디까지 옮겼고 얼마나 확대했는지(viewport)를 기록하여, 나중에 다시 열었을 때 작업을 바로 이어갈 수 있게 합니다.
 * 지구적 맥락의 전파: Blueprint의 metadata에 위치 정보를 넣으면, 이 설계도 자체가 특정 지역(예: "서울 지사") 전용 시스템이 될 수도 있고, 전 지구를 아우르는 범용 시스템이 될 수도 있습니다.
 */
import { MetadataSchema } from '../common/metadata' // 설계도 자체의 생성/수정 정보
import { FormulatorSchema } from './formulator' // 연산 로직(요리사) 규격
import { ConnectionSchema } from './connection' // 노드 간 연결(혈관) 규격
import { NexetSchema } from './nexet' // [추가] 시각적 넥셋(조리대) 규격

/**
 * [ BlueprintSchema ]
 * NEXA 시스템의 '전체 로직 설계도'입니다.
 * 지구 어딘가에 존재하는 넥셋들과 그 안의 데이터 흐름을 한눈에 담는 지도 역할을 합니다.
 */
export const BlueprintSchema = z.object({
  // 1. 설계도 기본 메타데이터 (이 설계도의 ID, 소유자, 위치 정보 등)
  metadata: MetadataSchema,

  // 2. 설계도 기본 설정
  config: z.object({
    name: z.string(), // 설계도의 이름 (예: "우리집 스마트 거실 아트 배합")
    description: z.string().optional(), // 설계도에 대한 설명
    isLocked: z.boolean().default(false), // 수정 방지를 위한 잠금 상태
  }),

  // 3. 핵심 구성 요소 (Composition)
  // 설계도 안에 실제로 어떤 부품들이 들어있는지 정의합니다.
  composition: z.object({
    // 캔버스에 배치된 모든 넥셋 (RAW_SOURCE 및 LOGIC_RESULT 포함)
    panels: z.array(NexetSchema).default([]),

    // 데이터를 가공하는 모든 연산기 (수학, 논리 등)
    formulators: z.array(FormulatorSchema).default([]),

    // 넥셋과 포뮬레이터 사이를 잇는 모든 연결선
    connections: z.array(ConnectionSchema).default([]),
  }),

  // 4. 시각적 뷰포트 (Viewport)
  // 사용자가 D3.js 캔버스에서 어느 위치를 보고 있었는지 기억합니다.
  viewport: z
    .object({
      zoom: z.number().default(1), // 화면 확대/축소 배율
      pan: z.object({
        x: z.number().default(0), // 화면 가로 스크롤 위치
        y: z.number().default(0), // 화면 세로 스크롤 위치
      }),
    })
    .optional(),

  // 5. 엔진 실행 정책 (Runtime)
  // 이 설계도가 실제로 엔진에서 어떻게 돌아갈지 결정합니다.
  runtime: z.object({
    isActive: z.boolean().default(true), // 이 로직을 현재 가동할지 여부
    priority: z.number().int().default(1), // 여러 설계도 중 처리 우선순위
  }),
})

/**
 * [ Blueprint 타입 추론 ]
 * 정의한 스키마로부터 TypeScript 타입을 생성하여 실제 개발 시 활용합니다.
 */
export type Blueprint = z.infer<typeof BlueprintSchema>
