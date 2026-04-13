import { z } from 'zod' // Zod: 데이터 규격을 정의하고 검증하는 라이브러리입니다.

/**
 * [ 외부 스키마 및 분류 체계 임포트 ]
 * 다른 파일에서 정의한 규격들을 가져와서 조립합니다.
 */
import { MetadataSchema } from '../common/metadata' // 생성일, ID 등 기본 메타데이터 규격
import { SemanticSchema } from '../common/semantic' // 데이터의 의미와 태그 규격
import { CommandSchema } from '../common/command' // 제어 명령 규격
import { DisplaySchema } from '../common/display' // 시각적 상태 및 피드백 규격
import { HardwareClassEnum, CapabilityProfileEnum, UpdateFrequencyEnum, DataCriticalityEnum, NexetDomainEnum, SystemScopeEnum, ControlModeEnum, VisualTypeEnum } from '../common/taxonomy' // 사전 정의된 분류 목록(Enum)들

/**
 * [ NexetTypeEnum ]
 * 넥셋을 두 가지로 분리합니다: 가공 안 된 원천(RAW) vs 로직으로 정제된 결과(RESULT)
 */
export const NexetTypeEnum = z.enum(['RAW_SOURCE', 'LOGIC_RESULT'])

/**
 * [ NexetSchema ]
 * NEXA 시스템의 최소 단위인 '넥셋'의 전체 구조를 정의하는 핵심 스키마입니다.
 */
export const NexetSchema = z.object({
  // 1. 기본 정보: 시스템이 자동으로 관리하는 생성/수정/신원 정보
  metadata: MetadataSchema.extend({
    // [비전 반영] 지구적 규모를 위한 좌표 정보 추가
    location: z
      .object({
        lat: z.number().describe('위도'), // 소수점 형태의 위도값
        lng: z.number().describe('경도'), // 소수점 형태의 경도값
        alt: z.number().optional().describe('고도'), // 선택 사항인 고도값
      })
      .optional(),
  }),

  // 2. 의미론적 정보: 사람이 이해하는 태그나 설명문
  semantic: SemanticSchema,

  // 3. 넥셋 정체성: 이 패널이 어떤 종류이고 어디까지 노출될지 결정
  identity: z.object({
    type: NexetTypeEnum, // RAW_SOURCE(원천) 인가 LOGIC_RESULT(결과) 인가
    hwClass: HardwareClassEnum, // 물리적 분류 (열 제어, 조명 제어 등)
    hwProfile: CapabilityProfileEnum, // 장치 특성 (정밀 제어, 단순 OnOff 등)
    domain: NexetDomainEnum, // 기능적 분류 (액추에이터, 센서 등)
    scope: z.array(SystemScopeEnum), // 노출 범위 (보드, 노드, 글로벌 등)
    mode: ControlModeEnum, // 제어 모드 (수동, AI 최적화 등)
    visual: VisualTypeEnum, // UI 형태 (슬라이더, 비디오 스트림 등)

    // 외부 시스템 연동 설정 (ERP 등에서 이 결과를 재사용할 때 사용)
    isExportable: z.boolean().default(false), // 외부로 데이터를 보낼지 여부
    exportKey: z.string().optional(), // 외부 시스템과 약속된 고유 식별 키
  }),

  // 4. 운영 정책: 데이터의 중요도와 갱신 주기
  policy: z.object({
    updateFrequency: UpdateFrequencyEnum, // 얼마나 자주 업데이트할 것인가 (실시간, 1분 등)
    criticality: DataCriticalityEnum, // 이 데이터가 얼마나 중요한가 (안전 직결 여부 등)
  }),

  // 5. 시각적/물리적 설정: 화면에 그려질 때 필요한 수치들
  config: z.object({
    label: z.string(), // 사용자가 화면에서 볼 이름
    unit: z.string().optional(), // 단위 (예: °C, %, Lux, dB)

    // 노드 에디터 캔버스에서의 배치 정보
    layout: z.object({
      x: z.number(), // 캔버스 가로 좌표
      y: z.number(), // 캔버스 세로 좌표
      width: z.number().default(300), // 넥셋 가로 크기
      height: z.number().default(200), // 넥셋 세로 크기
    }),

    // 수치 조절 범위 설정
    range: z
      .object({
        min: z.number().default(0), // 최소값
        max: z.number().default(100), // 최대값
        step: z.number().default(1), // 조절 간격
      })
      .optional(),
  }),

  // 6. 데이터 바인딩: 이 패널이 어디서 데이터를 가져오는지 정의
  binding: z.object({
    // RAW 타입일 경우 장치ID(GatewayID), RESULT 타입일 경우 연산기ID(FormulatorID)를 넣음
    targetId: z.string().describe('데이터 소스의 고유 식별자'),
    propertyKey: z.string().describe('소스 내의 구체적인 속성 명칭'),
  }),

  // 7. 실시간 상태 정보: 현재 데이터 값과 시스템 피드백 (불가/부적절/적합 등)
  status: DisplaySchema,

  // 8. 제어 인터페이스: 명령을 보낼 수 있는 통로 (읽기 전용이면 null 가능)
  control: CommandSchema.nullable(),
})

/**
 * [ Panel 타입 추론 ]
 * 정의한 Zod 스키마를 바탕으로 실제 코딩에서 쓸 TypeScript 타입을 자동으로 만듭니다.
 */
export type Panel = z.infer<typeof NexetSchema>
