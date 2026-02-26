/**
 * system/constants — NEXA 플랫폼 상수 정의 진입점
 *
 * - 모든 공용 상수는 이 폴더에만 정의한다 (AGENTS 규칙).
 * - 도메인에서는 @system/constants 로 import만 한다.
 * - 새 상수는 as const 를 사용해 타입이 좁혀지도록 한다.
 *
 * @see docs/JS_TS_전환_계획.md
 */

export {
  DEFAULT_CATEGORIES,
  CATEGORY_ABBREVIATIONS,
} from './categories.js'
