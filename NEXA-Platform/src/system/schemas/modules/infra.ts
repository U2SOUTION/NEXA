import { z } from 'zod'
import { MetadataSchema } from '../common/metadata'

/**
 * [DeviceSchema]
 * NEXA 시스템에 등록되는 하드웨어 장치의 표준 규격을 정의합니다.
 */
export const DeviceSchema = z.object({
  metadata: MetadataSchema,
  
  // 장치 기본 정보
  info: z.object({
    name: z.string(),
    model: z.string().optional(),
    manufacturer: z.string().optional(),
    serialNumber: z.string().optional(),
    category: z.enum(['GATEWAY', 'SENSOR', 'ACTUATOR', 'CONTROLLER', 'OTHER']).default('OTHER'),
  }),

  // 통신 설정
  connection: z.object({
    type: z.enum(['MQTT', 'MODBUS', 'HTTP', 'WEBSOCKET', 'DIRECT']).default('MQTT'),
    address: z.string().optional(), // IP, Topic, or Port
    port: z.number().int().optional(),
    status: z.enum(['ONLINE', 'OFFLINE', 'ERROR', 'UNKNOWN']).default('UNKNOWN'),
    lastSeen: z.string().datetime().optional(),
  }),

  // 하드웨어 리소스 상태
  resources: z.object({
    cpuUsage: z.number().min(0).max(100).optional(),
    memoryUsage: z.number().min(0).max(100).optional(),
    storageUsage: z.number().min(0).max(100).optional(),
    temperature: z.number().optional(),
    uptime: z.number().optional(), // seconds
  }).optional(),

  // 태그 및 확장 정보
  tags: z.array(z.string()).default([]),
  attributes: z.record(z.any()).default({}),
})

/**
 * [NetworkSchema]
 * 장치 간의 네트워크 토폴로지 및 상태를 정의합니다.
 */
export const NetworkSchema = z.object({
  metadata: MetadataSchema,
  
  networkInfo: z.object({
    ssid: z.string().optional(),
    protocol: z.string().default('TCP/IP'),
    topology: z.enum(['MESH', 'STAR', 'HYBRID']).default('STAR'),
  }),

  // 연결된 노드 목록 (Device ID 기반)
  nodes: z.array(z.object({
    deviceId: z.string(),
    role: z.enum(['MASTER', 'SLAVE', 'ROUTER', 'END_DEVICE']).default('END_DEVICE'),
    parentId: z.string().optional(),
  })).default([]),
})

export type Device = z.infer<typeof DeviceSchema>
export type Network = z.infer<typeof NetworkSchema>
