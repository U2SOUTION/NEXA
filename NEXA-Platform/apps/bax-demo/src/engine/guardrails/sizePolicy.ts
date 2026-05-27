/**
 * @file sizePolicy.ts
 * @role G1 면적 정책 — BLOCK TEXTURE 면적 ≤20%. OVERLAY는 계산 제외.
 * @guardrail G1
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §1.2
 */

export function enforceTextureAreaCap(textureAreaRatio: number): boolean {
  return textureAreaRatio <= 0.2
}
