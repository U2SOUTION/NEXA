/**
 * @file index.ts
 * @role LayoutPolicy 모듈 public API — 인터페이스·타입 re-export.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.3
 */

export type { LayoutPolicy, ResolvedLayout, ComponentPlacement, GridTemplate } from './types'
export { DefaultLayoutPolicy } from './DefaultLayoutPolicy'
export { SingleColumnPolicy } from './SingleColumnPolicy'
