/**
 * # system/types — NEXA 플랫폼 타입 정의 진입점
 *
 * ## 초기 설계와 방향
 *
 * 1. **단일 정의 위치**
 *    - 모든 공용 타입은 이 폴더(`src/system/types/`)에만 정의한다.
 *    - 도메인 내부에 `types.ts` / `types/*.ts` 생성 금지 (AGENTS 규칙).
 *    - 도메인·frame·engines에서는 여기서 import만 한다.
 *
 * 2. **스키마 우선, 타입은 보조**
 *    - 런타임 검증이 필요한 데이터(API 응답, 폼 입력, 경계 통과 데이터)는
 *      `src/system/schemas/`의 Zod 스키마로 정의하고, 타입은 `z.infer<typeof Schema>`로 추론한다.
 *    - 이 파일에서는 스키마에서 추론한 타입을 re-export하여 `@system/types` 한 곳에서 쓸 수 있게 한다.
 *    - 스키마로 표현하기 어렵거나 순수 컴파일타임 전용인 타입만 여기에 직접 정의한다.
 *
 * 3. **추가 시 규칙**
 *    - 새 타입이 필요하면 이 디렉터리 하위에 모듈로 추가한 뒤, 이 index에서 re-export한다.
 *    - 도메인 전용처럼 보이는 타입도 여기에 정의하고, 해당 도메인에서만 import한다 (도메인 내부 파일에 정의하지 않음).
 *    - 네이밍: PascalCase. 여러 도메인에서 쓰이면 `common/`, 한 도메인 관련이면 `domains/ai.d.ts` 등으로 구분 가능.
 *
 * 4. **import 경로**
 *    - 프로젝트 alias 기준: `@system/types` 또는 `@/system/types` 로 참조.
 *
 * @see docs/JS_TS_전환_계획.md
 * @see AGENTS 규칙 (타입·스키마·상수는 system에만 정의)
 */

// --- Branded ID (서버·프론트 공유, 혼용 방지) [NEXA-PLATFORM-TS-01] §2.4 ---
export type { UserId, ProjectId, DeviceId, ArchiveId } from './ids'
export {
  toUserId,
  toUserIdSafe,
  userIdSchema,
  toProjectId,
  toProjectIdSafe,
  projectIdSchema,
  toDeviceId,
  toDeviceIdSafe,
  deviceIdSchema,
  toArchiveId,
  toArchiveIdSafe,
  archiveIdSchema,
} from './ids'

// --- 공통 타입 뼈대 (전 도메인·서버-프론트 공유) ---
export type {
  ApiResponse,
  ApiErrorResponse,
  ApiResult,
  PaginationParams,
  PaginationResult,
} from './common/api'

export type { DeviceStatus, SensorData } from './common/device'

// --- 스키마에서 추론된 타입 re-export ---
export type { Metadata } from '../schemas/common/metadata'
export type {
  ListFilesItem,
  FileCategory,
  FileType,
} from '../schemas/modules/files'

/** 파일 메타데이터 (목록/탐색기용) — ListFilesItem과 동일 */
export type { ListFilesItem as FileMeta } from '../schemas/modules/files'
