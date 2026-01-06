import { z } from 'zod'

/**
 * [PHYSICAL_INPUT_RECIPE]
 * 외부 센서나 물리적 장치로부터 데이터를 읽어옵니다.
 * "어느 핀(Pin)에서 어떤 신호를 읽을 것인가?"를 정의합니다.
 *
 * ✨ 설계 포인트
 * 물리/논리 분리: Formulator 내부의 로직은 하드웨어가 바뀌어도 변하지 않습니다. 오직 GATEWAY의 channelId만 수정하면 다른 장비에 바로 이식할 수 있습니다.
 * Fail-Safe 보장: failSafeValue를 통해 시스템 소프트웨어가 멈추더라도 하드웨어가 폭주하지 않고 안전한 상태(예: 밸브 닫힘)를 유지하도록 설계했습니다.
 * 추상화: VirtualGateway를 통해 실제 센서 없이도 시뮬레이션 데이터를 주입하거나 UI에서 수동 제어값을 입력받을 수 있는 확장성을 확보했습니다.
 */
export const PhysicalInputSettingsSchema = z.object({
  channelId: z.string(), // 하드웨어 채널 또는 핀 번호 (예: "A0", "GPIO_14")
  signalType: z.enum(['ANALOG', 'DIGITAL', 'MODBUS', 'VIRTUAL']), // 신호 물리 계층
  samplingRate: z.number().int().min(10).default(100), // 샘플링 주기 (ms)
  unit: z.string().optional(), // 단위 명칭 (예: "V", "mA", "℃")
})

/**
 * [PHYSICAL_OUTPUT_RECIPE]
 * 계산된 배합 결과를 실제 하드웨어로 내보냅니다.
 * "어떤 장치를 어떤 방식으로 제어할 것인가?"를 정의합니다.
 */
export const PhysicalOutputSettingsSchema = z.object({
  channelId: z.string(), // 제어할 하드웨어 핀/주소
  signalType: z.enum(['PWM', 'DIGITAL', 'ANALOG', 'MODBUS']), // 출력 방식
  failSafeValue: z.number().optional(), // 통신 두절이나 시스템 오류 시 출력할 안전 값
  range: z.object({
    min: z.number().default(0),
    max: z.number().default(255), // 하드웨어 해상도 (예: 8bit PWM)
  }),
})

/**
 * [VIRTUAL_GATEWAY_RECIPE]
 * 대시보드 UI나 API 등 소프트웨어적인 입출력을 처리합니다.
 * 하드웨어가 아닌 사용자의 클릭이나 외부 서버의 데이터를 가져올 때 사용합니다.
 */
export const VirtualGatewaySettingsSchema = z.object({
  key: z.string(), // 데이터 바인딩을 위한 고유 키
  persistence: z.boolean().default(false), // 재부팅 시 마지막 값 유지 여부
})
