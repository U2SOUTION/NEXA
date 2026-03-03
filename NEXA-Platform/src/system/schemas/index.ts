// 1. 공통 규격 (Common)
export * from './common/metadata'
export * from './common/taxonomy'
export * from './common/component-contract'

// 2. 핵심 모듈 (Modules)
export * from './modules/formulator'
export * from './modules/connection'
export * from './modules/blueprint'
export * from './modules/panel'
export * from './modules/infra'
export * from './modules/files'
export * from './modules/fileSourceMetadata'

// 3. 세부 레시피 (Recipes)
export * from './recipes/math'
export * from './recipes/logic'
export * from './recipes/filter'
export * from './recipes/gateway'

// 4. 시스템 운영 규격 (Engine & Storage)
export * from './engine/runtime'
export * from './storage/repository'

/**
 * [NexaSchemaSystem]
 * 전체 시스템의 스키마를 하나로 묶어 관리할 수 있는 최상위 객체입니다.
 */
export const NexaSchema = {
  // 나중에 필요 시 전체 스키마를 그룹화하여 접근할 수 있습니다.
}
