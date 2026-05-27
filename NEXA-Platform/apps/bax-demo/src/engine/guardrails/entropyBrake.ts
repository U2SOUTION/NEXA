/**
 * @file entropyBrake.ts
 * @role G3 Entropy brake — tick당 MUTABLE 재배치·spillover 최대 1건.
 * @guardrail G3
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §1.2 · §2.12
 */

let mutationsThisTick = 0

export function canMutateThisTick(): boolean {
  return mutationsThisTick < 1
}

export function recordMutation(): void {
  mutationsThisTick += 1
}

export function resetTickCounter(): void {
  mutationsThisTick = 0
}
