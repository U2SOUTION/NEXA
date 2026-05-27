/**
 * @file useBaxStore.ts
 * @role BAX 런타임 Store (비영속).
 *       bax_mode·void_ratio·focus_blur_scale·viewport_band·circuit_state·M2P ingest.
 *       ATS와 Store 분리. M2P 슬라이더 값은 새로고침 시 초기화.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §1.3.3 · NFR-07
 */

export function useBaxStore() {
  return {
    bax_mode: 'contextual' as const,
    void_ratio: 52,
    focus_blur_scale: 0.7,
  }
}
