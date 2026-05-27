/**
 * @file types.ts
 * @role M2P v2 패킷 타입 SSOT — void_ratio_delta · focus_blur_scale. margin_ratio v1 폐기.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.8 · 부록 A
 */

export interface M2PPacketV2 {
  v: 2
  source: 'peripheral' | 'sim-slider' | 'nixie-agent' | string
  ts: number
  void_ratio_delta: number
  focus_blur_scale: number
}
