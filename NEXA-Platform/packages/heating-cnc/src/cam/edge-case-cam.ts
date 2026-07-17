/**
 * Heating CNC — Edge Case CAM reference implementation (MVP v0.1)
 *
 * Canonical spec: ../05-GCode-CAM-Pipeline.md#edge-case-cam--비정형-자재--편심-보정-mvp-v01-필수
 * Target deploy path: packages/heating-cnc/src/cam/edge-case-cam.ts
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CamEdgeCaseJson {
  scan_pass_enabled: boolean;
  scan_a_step_deg: number;
  scan_f_ratio: number;
  scan_s_pwm: number;
  scan_rpm: number;
  scan_z_touch_offset_mm: number;
  irregularity_k: number;
  irregularity_f_floor: number;
  eccentricity_lead_k: number;
  auto_eccentricity_from_scan: boolean;
  eccentricity_max_mm: number;
  /** 패스별 대칭 수렴 — 초기 비정형 → 깊은 패스에서 F·편심 보정 완화 */
  symmetry_convergence_enabled: boolean;
  symmetry_model: 'pass_depth' | 'telemetry' | 'blend';
  pass_total: number;
  stock_removal_mm: number;
  symmetry_ecc_decay: number;
  symmetry_irreg_decay: number;
  /** irregularity_index → e_shape_mm (scan 없을 때) */
  k_shape_from_irregularity: number;
  inter_pass_rescan: boolean;
  rescan_every_n_passes: number;
}

export const DEFAULT_CAM_EDGE_CASE: CamEdgeCaseJson = {
  scan_pass_enabled: true,
  scan_a_step_deg: 45,
  scan_f_ratio: 0.35,
  scan_s_pwm: 400,
  scan_rpm: 3,
  scan_z_touch_offset_mm: 0.5,
  irregularity_k: 1.2,
  irregularity_f_floor: 0.5,
  eccentricity_lead_k: 1.5,
  auto_eccentricity_from_scan: true,
  eccentricity_max_mm: 2.0,
  symmetry_convergence_enabled: true,
  symmetry_model: 'blend',
  pass_total: 3,
  stock_removal_mm: 2.0,
  symmetry_ecc_decay: 1.5,
  symmetry_irreg_decay: 1.8,
  k_shape_from_irregularity: 2.0,
  inter_pass_rescan: false,
  rescan_every_n_passes: 2,
};

export interface ScanSample {
  aDeg: number;
  aLoadPct: number;
}

export interface ScanPassResult {
  samples: ScanSample[];
  loadMean: number;
  loadSpan: number;
  irregularityIndex: number;
  fAdj: number;
  fNominal: number;
  skipped: boolean;
  aborted: boolean;
  abortReason?: 'stall_crit' | 'operator';
}

export interface EccentricityModel {
  /** @deprecated Pass 0 합계 — `e_mount_mm + e_shape_mm` 사용 권장 */
  e_mm: number;
  phase_deg: number;
  source: 'scan' | 'gap4' | 'manual' | 'decomposed';
}

/**
 * 이원화 편심 — 두 물리 원인을 분리.
 * - e_mount: A축 대비 장착 오프셋 → 패스와 무관 **상수**
 * - e_shape: 비정형 단면에서 오는 유효 편심 → 대칭 수렴 s 에 따라 **감쇠**
 */
export interface SplitEccentricity {
  eMountMm: number;
  eShapeMm: number;
  phaseDeg: number;
  mountSource: 'gap4' | 'manual' | 'none';
  shapeSource: 'scan' | 'irregularity' | 'manual' | 'none';
}

export function totalEccentricity(split: SplitEccentricity): number {
  return split.eMountMm + split.eShapeMm;
}

export function splitToLegacyModel(split: SplitEccentricity): EccentricityModel {
  return {
    e_mm: totalEccentricity(split),
    phase_deg: split.phaseDeg,
    source: 'decomposed',
  };
}

export interface LeadInPolicy {
  leadInMm: number;
  approachRatio: number;
  heatLeadMm: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface EdgeCaseCamOutput {
  scan: ScanPassResult;
  splitEccentricity: SplitEccentricity;
  /** Pass 0 합계 — 하위 호환 */
  eccentricity?: EccentricityModel;
  leadInAdjMm: number;
  fApproach: number;
  scanGcode?: string[];
  leadInGcode?: string[];
  passFeedPlan?: PassFeedPlan[];
  warnings: string[];
}

export interface ScanPassContext {
  fNominal: number;
  zNominal: number;
  xCut: number;
  yCut: number;
  edgeCase: CamEdgeCaseJson;
  /** StallGuard crit during scan — exceed → abort */
  stallCritPct?: number;
}

// ---------------------------------------------------------------------------
// Scan Pass analysis
// ---------------------------------------------------------------------------

const IRREGULARITY_SKIP_THRESHOLD = 0.15;

export function analyzeScanPass(
  samples: ScanSample[],
  fNominal: number,
  kIrreg = 1.2,
  fFloor = 0.5,
): ScanPassResult {
  if (samples.length === 0) {
    return {
      samples: [],
      loadMean: 0,
      loadSpan: 0,
      irregularityIndex: 0,
      fAdj: fNominal,
      fNominal,
      skipped: true,
      aborted: false,
    };
  }

  const loads = samples.map((s) => s.aLoadPct);
  const loadMean = loads.reduce((a, b) => a + b, 0) / loads.length;
  const loadSpan = Math.max(...loads) - Math.min(...loads);
  const irregularityIndex = loadSpan / Math.max(loadMean, 1);

  if (irregularityIndex < IRREGULARITY_SKIP_THRESHOLD) {
    return {
      samples,
      loadMean,
      loadSpan,
      irregularityIndex,
      fAdj: fNominal,
      fNominal,
      skipped: true,
      aborted: false,
    };
  }

  const scale = Math.max(fFloor, Math.min(1, 1 - kIrreg * irregularityIndex));
  return {
    samples,
    loadMean,
    loadSpan,
    irregularityIndex,
    fAdj: Math.round(fNominal * scale),
    fNominal,
    skipped: false,
    aborted: false,
  };
}

/** Append sample; abort if load exceeds crit (scan-mode relaxed threshold applied upstream). */
export function appendScanSample(
  samples: ScanSample[],
  sample: ScanSample,
  stallCritPct: number,
): { samples: ScanSample[]; aborted: boolean } {
  const next = [...samples, sample];
  if (sample.aLoadPct >= stallCritPct) {
    return { samples: next, aborted: true };
  }
  return { samples: next, aborted: false };
}

export function finalizeAbortedScan(
  samples: ScanSample[],
  fNominal: number,
  fFloor: number,
  reason: ScanPassResult['abortReason'] = 'stall_crit',
): ScanPassResult {
  return {
    samples,
    loadMean: 0,
    loadSpan: 0,
    irregularityIndex: 1.0,
    fAdj: Math.round(fNominal * fFloor),
    fNominal,
    skipped: false,
    aborted: true,
    abortReason: reason,
  };
}

// ---------------------------------------------------------------------------
// Eccentricity
// ---------------------------------------------------------------------------

const K_LOAD_MM_PER_PCT = 0.04; // field tuning

export function eccentricityFromScan(samples: ScanSample[]): EccentricityModel {
  if (samples.length === 0) {
    return { e_mm: 0, phase_deg: 0, source: 'scan' };
  }
  const peak = samples.reduce((a, b) => (b.aLoadPct > a.aLoadPct ? b : a));
  const span =
    Math.max(...samples.map((s) => s.aLoadPct)) -
    Math.min(...samples.map((s) => s.aLoadPct));
  return {
    e_mm: K_LOAD_MM_PER_PCT * span,
    phase_deg: peak.aDeg,
    source: 'scan',
  };
}

export function eccentricityFromGap4(gapsMm: [number, number, number, number]): EccentricityModel {
  const max = Math.max(...gapsMm);
  const min = Math.min(...gapsMm);
  const peakIdx = gapsMm.indexOf(max);
  return {
    e_mm: (max - min) / 2,
    phase_deg: peakIdx * 90,
    source: 'gap4',
  };
}

export interface DecomposeEccentricityInput {
  gap4?: [number, number, number, number];
  scanSamples?: ScanSample[];
  irregularityIndex?: number;
  manualMountMm?: number;
  manualShapeMm?: number;
  manualPhaseDeg?: number;
  kLoad?: number;
  kShapeFromIrregularity?: number;
}

/**
 * Scan·4점 간극·수동 입력을 **장착 편심(e_mount)** 과 **형상 편심(e_shape)** 으로 분해.
 *
 * - e_mount: gap4 / manual mount — 가공 패스와 무관하게 유지
 * - e_shape: scan 잔차 또는 irregularity 기반 — Symmetry Convergence 로 감쇠
 */
export function decomposeEccentricity(input: DecomposeEccentricityInput): SplitEccentricity {
  const kLoad = input.kLoad ?? K_LOAD_MM_PER_PCT;
  const kShapeIrreg = input.kShapeFromIrregularity ?? 2.0;

  let eMount = 0;
  let eShape = 0;
  let phaseDeg = input.manualPhaseDeg ?? 0;
  let mountSource: SplitEccentricity['mountSource'] = 'none';
  let shapeSource: SplitEccentricity['shapeSource'] = 'none';

  if (input.gap4) {
    const g = eccentricityFromGap4(input.gap4);
    eMount = g.e_mm;
    phaseDeg = g.phase_deg;
    mountSource = 'gap4';
  } else if (input.manualMountMm != null && input.manualMountMm > 0) {
    eMount = input.manualMountMm;
    mountSource = 'manual';
  }

  if (input.manualShapeMm != null && input.manualShapeMm > 0) {
    eShape = input.manualShapeMm;
    shapeSource = 'manual';
  } else if (input.scanSamples && input.scanSamples.length > 0) {
    const loads = input.scanSamples.map((s) => s.aLoadPct);
    const span = Math.max(...loads) - Math.min(...loads);
    const peak = input.scanSamples.reduce((a, b) =>
      b.aLoadPct > a.aLoadPct ? b : a,
    );
    if (!phaseDeg) phaseDeg = peak.aDeg;
    const eTotalScan = kLoad * span;
    eShape = Math.max(0, eTotalScan - eMount);
    shapeSource = 'scan';
  }

  const irreg = input.irregularityIndex ?? 0;
  if (eShape === 0 && irreg >= IRREGULARITY_SKIP_THRESHOLD) {
    eShape = kShapeIrreg * irreg;
    shapeSource = shapeSource === 'none' ? 'irregularity' : shapeSource;
  }

  return { eMountMm: eMount, eShapeMm: eShape, phaseDeg, mountSource, shapeSource };
}

// ---------------------------------------------------------------------------
// Lead-in G-code
// ---------------------------------------------------------------------------

export function offsetAlongPath(from: Vec3, to: Vec3, deltaMm: number): Vec3 {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dy, dz) || 1;
  const t = deltaMm / len;
  return {
    x: from.x + dx * t,
    y: from.y + dy * t,
    z: from.z + dz * t,
  };
}

export function buildLeadInWithEccentricity(
  pPre: Vec3,
  pCut: Vec3,
  baseS: number,
  targetF: number,
  policy: LeadInPolicy,
  edgeCase: CamEdgeCaseJson,
  ecc?: EccentricityModel,
): string[] {
  const e = ecc?.e_mm ?? 0;
  const leadMm = policy.leadInMm + edgeCase.eccentricity_lead_k * e;
  const approachRatio = policy.approachRatio * (1 - 0.1 * e);
  const fApproach = Math.round(targetF * approachRatio);
  const pHeat = offsetAlongPath(pPre, pCut, -(leadMm + policy.heatLeadMm));

  return [
    `;@nexa lead_in_adj=${leadMm.toFixed(2)} e_mm=${e.toFixed(2)} phase=${ecc?.phase_deg ?? 0}`,
    `G00 X${pHeat.x.toFixed(3)} Y${pHeat.y.toFixed(3)} Z${pHeat.z.toFixed(3)}`,
    `M3 S${baseS}`,
    `G01 X${pPre.x.toFixed(3)} Y${pPre.y.toFixed(3)} Z${pPre.z.toFixed(3)} F${fApproach}`,
    `G01 X${pCut.x.toFixed(3)} Y${pCut.y.toFixed(3)} Z${pCut.z.toFixed(3)} F${targetF}`,
  ];
}

// ---------------------------------------------------------------------------
// Scan Pass G-code generator
// ---------------------------------------------------------------------------

export function generateScanPassGcode(ctx: ScanPassContext): string[] {
  const { edgeCase, fNominal, zNominal, xCut, yCut } = ctx;
  const zTouch = zNominal - edgeCase.scan_z_touch_offset_mm;
  const fScan = Math.round(fNominal * edgeCase.scan_f_ratio);
  const steps = Math.floor(360 / edgeCase.scan_a_step_deg);
  const lines: string[] = [
    ';@nexa phase=scan_pass',
    'G90',
    `M210 R${edgeCase.scan_rpm}`,
    `G01 X${xCut.toFixed(3)} Y${yCut.toFixed(3)} Z${zTouch.toFixed(3)} F0`,
    `M3 S${edgeCase.scan_s_pwm}`,
  ];

  for (let i = 0; i < steps; i++) {
    const aDeg = i * edgeCase.scan_a_step_deg;
    lines.push(`G01 A${aDeg} F${fScan} ;@nexa scan_sample`);
  }

  lines.push('M5', ';@nexa phase=scan_pass_end');
  return lines;
}

// ---------------------------------------------------------------------------
// Symmetry Convergence — 패스별 대칭 수렴 (비정형 → 원통)
// ---------------------------------------------------------------------------

export interface SymmetryProgressInput {
  passIndex: number;           // 0 = first roughing pass after scan
  passTotal: number;
  zRemovedMm: number;          // cumulative stock removed this job
  stockRemovalMm: number;      // total planned removal
  /** Live StallGuard span during M210 — optional telemetry path */
  loadSpanNow?: number;
  loadSpanInitial?: number;
  model: CamEdgeCaseJson['symmetry_model'];
}

export interface PassFeedPlan {
  passIndex: number;
  symmetryProgress: number;
  fPass: number;
  irregularityRemaining: number;
  eMountMm: number;
  eShapeEffMm: number;
  eEffectiveMm: number;
  leadInAdjMm: number;
}

/** Smooth ease-in-out for F recovery — avoids sudden speed jump. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0 || 1)));
  return t * t * (3 - 2 * t);
}

/**
 * 대칭 수렴 진행도 s ∈ [0,1].
 * s=0: 초기 비정형(Scan 직후) · s=1: 목표 원통에 근접(마지막 패스).
 */
export function computeSymmetryProgress(input: SymmetryProgressInput): number {
  const { passIndex, passTotal, zRemovedMm, stockRemovalMm, model } = input;
  const passDenom = Math.max(1, passTotal - 1);
  const sPass = passIndex / passDenom;
  const sDepth = stockRemovalMm > 0 ? zRemovedMm / stockRemovalMm : sPass;

  let sTel = sPass;
  if (
    input.loadSpanInitial != null &&
    input.loadSpanInitial > 0 &&
    input.loadSpanNow != null
  ) {
    sTel = 1 - Math.min(1, input.loadSpanNow / input.loadSpanInitial);
  }

  switch (model) {
    case 'pass_depth':
      return smoothstep(0, 1, sDepth);
    case 'telemetry':
      return smoothstep(0, 1, sTel);
    case 'blend':
    default:
      // 계획(깊이)과 실측(부하) 중 **보수적** 값 — F 상향은 느리게
      return smoothstep(0, 1, Math.min(sDepth, sTel));
  }
}

/** 패스별 F — 초기 F_adj 에서 F_nominal 으로 수렴. */
export function fForPass(
  scan: ScanPassResult,
  symmetryProgress: number,
): number {
  if (scan.skipped || scan.fAdj >= scan.fNominal) {
    return scan.fNominal;
  }
  const s = smoothstep(0, 1, symmetryProgress);
  return Math.round(scan.fAdj + (scan.fNominal - scan.fAdj) * s);
}

/** 잔여 비정형 지수 — 패스가 깊어질수록 0 에 수렴. */
export function irregularityForPass(
  i0: number,
  symmetryProgress: number,
  decay = 1.8,
): number {
  return i0 * Math.pow(Math.max(0, 1 - symmetryProgress), decay);
}

/** 패스별 유효 편심 — e_mount 상수 + e_shape 만 수렴 감쇠. */
export function effectiveEccentricityForPass(
  split: SplitEccentricity,
  symmetryProgress: number,
  shapeDecay = 1.5,
): { eMountMm: number; eShapeEffMm: number; eEffectiveMm: number } {
  const shapeScale = Math.pow(Math.max(0, 1 - symmetryProgress), shapeDecay);
  const eShapeEffMm = split.eShapeMm * shapeScale;
  return {
    eMountMm: split.eMountMm,
    eShapeEffMm,
    eEffectiveMm: split.eMountMm + eShapeEffMm,
  };
}

/** @deprecated — effectiveEccentricityForPass 사용 */
export function eccentricityForPass(
  ecc: EccentricityModel | undefined,
  symmetryProgress: number,
  decay = 1.5,
): EccentricityModel | undefined {
  if (!ecc) return undefined;
  const split: SplitEccentricity = {
    eMountMm: 0,
    eShapeMm: ecc.e_mm,
    phaseDeg: ecc.phase_deg,
    mountSource: 'none',
    shapeSource: ecc.source === 'gap4' ? 'none' : 'scan',
  };
  if (ecc.source === 'gap4') {
    split.eMountMm = ecc.e_mm;
    split.eShapeMm = 0;
    split.mountSource = 'gap4';
  }
  const eff = effectiveEccentricityForPass(split, symmetryProgress, decay);
  return { ...ecc, e_mm: eff.eEffectiveMm };
}

export function leadInAdjMm(
  leadInBaseMm: number,
  kEcc: number,
  eEffectiveMm: number,
): number {
  return leadInBaseMm + kEcc * eEffectiveMm;
}

export function buildPassFeedPlan(
  scan: ScanPassResult,
  split: SplitEccentricity,
  edgeCase: CamEdgeCaseJson,
  leadInBaseMm: number,
): PassFeedPlan[] {
  if (!edgeCase.symmetry_convergence_enabled || scan.skipped) {
    const e0 = totalEccentricity(split);
    return [
      {
        passIndex: 0,
        symmetryProgress: 1,
        fPass: scan.fNominal,
        irregularityRemaining: 0,
        eMountMm: split.eMountMm,
        eShapeEffMm: split.eShapeMm,
        eEffectiveMm: e0,
        leadInAdjMm: leadInAdjMm(leadInBaseMm, edgeCase.eccentricity_lead_k, e0),
      },
    ];
  }

  const plans: PassFeedPlan[] = [];
  const stockPerPass = edgeCase.stock_removal_mm / Math.max(1, edgeCase.pass_total);

  for (let i = 0; i < edgeCase.pass_total; i++) {
    const s = computeSymmetryProgress({
      passIndex: i,
      passTotal: edgeCase.pass_total,
      zRemovedMm: stockPerPass * (i + 1),
      stockRemovalMm: edgeCase.stock_removal_mm,
      loadSpanInitial: scan.loadSpan,
      model: edgeCase.symmetry_model,
    });
    const eff = effectiveEccentricityForPass(
      split,
      s,
      edgeCase.symmetry_ecc_decay,
    );
    plans.push({
      passIndex: i,
      symmetryProgress: s,
      fPass: fForPass(scan, s),
      irregularityRemaining: irregularityForPass(
        scan.irregularityIndex,
        s,
        edgeCase.symmetry_irreg_decay,
      ),
      eMountMm: eff.eMountMm,
      eShapeEffMm: eff.eShapeEffMm,
      eEffectiveMm: eff.eEffectiveMm,
      leadInAdjMm: leadInAdjMm(
        leadInBaseMm,
        edgeCase.eccentricity_lead_k,
        eff.eEffectiveMm,
      ),
    });
  }
  return plans;
}

/** 패스 경계에서 재스캔 필요 여부 (Phase 2 · inter_pass_rescan). */
export function shouldInterPassRescan(
  passIndex: number,
  edgeCase: CamEdgeCaseJson,
): boolean {
  if (!edgeCase.inter_pass_rescan || passIndex === 0) return false;
  return passIndex % edgeCase.rescan_every_n_passes === 0;
}

// ---------------------------------------------------------------------------
// Pipeline orchestrator
// ---------------------------------------------------------------------------

export interface EdgeCaseCamInput {
  fNominal: number;
  zNominal: number;
  xCut: number;
  yCut: number;
  pPre: Vec3;
  pCut: Vec3;
  baseS: number;
  leadInPolicy: LeadInPolicy;
  edgeCase: CamEdgeCaseJson;
  scanSamples?: ScanSample[];
  gap4?: [number, number, number, number];
  manualMountMm?: number;
  manualShapeMm?: number;
  /** @deprecated — gap4 / manualMountMm·manualShapeMm 사용 */
  manualEccentricity?: EccentricityModel;
}

export function runEdgeCaseCam(input: EdgeCaseCamInput): EdgeCaseCamOutput {
  const { edgeCase, fNominal, scanSamples = [] } = input;
  const warnings: string[] = [];

  let scan: ScanPassResult;
  if (!edgeCase.scan_pass_enabled || scanSamples.length === 0) {
    scan = analyzeScanPass([], fNominal, edgeCase.irregularity_k, edgeCase.irregularity_f_floor);
  } else {
    scan = analyzeScanPass(
      scanSamples,
      fNominal,
      edgeCase.irregularity_k,
      edgeCase.irregularity_f_floor,
    );
  }

  let split = decomposeEccentricity({
    gap4: input.gap4,
    scanSamples: scan.samples.length ? scan.samples : input.scanSamples,
    irregularityIndex: scan.irregularityIndex,
    manualMountMm: input.manualMountMm,
    manualShapeMm: input.manualShapeMm,
    kShapeFromIrregularity: edgeCase.k_shape_from_irregularity,
  });

  if (input.manualEccentricity) {
    if (input.manualEccentricity.source === 'gap4') {
      split = {
        ...split,
        eMountMm: input.manualEccentricity.e_mm,
        mountSource: 'manual',
        phaseDeg: input.manualEccentricity.phase_deg,
      };
    } else {
      split = {
        ...split,
        eShapeMm: input.manualEccentricity.e_mm,
        shapeSource: 'manual',
        phaseDeg: input.manualEccentricity.phase_deg,
      };
    }
  }

  const eTotal = totalEccentricity(split);
  if (eTotal > edgeCase.eccentricity_max_mm) {
    warnings.push(
      `e_total=${eTotal.toFixed(2)} exceeds max ${edgeCase.eccentricity_max_mm} — mechanical alignment required`,
    );
  }

  const pass0 = effectiveEccentricityForPass(split, 0, edgeCase.symmetry_ecc_decay);
  const eccentricity = splitToLegacyModel(split);
  const leadInAdjMmVal = leadInAdjMm(
    input.leadInPolicy.leadInMm,
    edgeCase.eccentricity_lead_k,
    pass0.eEffectiveMm,
  );
  const fApproach = Math.round(
    scan.fAdj * input.leadInPolicy.approachRatio * (1 - 0.1 * pass0.eEffectiveMm),
  );

  const scanGcode = edgeCase.scan_pass_enabled
    ? generateScanPassGcode({
        fNominal,
        zNominal: input.zNominal,
        xCut: input.xCut,
        yCut: input.yCut,
        edgeCase,
      })
    : undefined;

  const leadInGcode = buildLeadInWithEccentricity(
    input.pPre,
    input.pCut,
    input.baseS,
    scan.fAdj,
    input.leadInPolicy,
    edgeCase,
    { e_mm: pass0.eEffectiveMm, phase_deg: split.phaseDeg, source: 'decomposed' },
  );

  const passFeedPlan = buildPassFeedPlan(
    scan,
    split,
    edgeCase,
    input.leadInPolicy.leadInMm,
  );

  return {
    scan,
    splitEccentricity: split,
    eccentricity,
    leadInAdjMm: leadInAdjMmVal,
    fApproach,
    scanGcode,
    leadInGcode,
    passFeedPlan,
    warnings,
  };
}

/** Serialize for D1 `job_logs.scan_result_json`. */
export function toScanResultJson(output: EdgeCaseCamOutput): string {
  return JSON.stringify({
    scan_result: {
      irregularity_index: output.scan.irregularityIndex,
      f_nominal: output.scan.fNominal,
      f_adj: output.scan.fAdj,
      skipped: output.scan.skipped,
      aborted: output.scan.aborted,
      samples: output.scan.samples.map((s) => ({
        a_deg: s.aDeg,
        a_load_pct: s.aLoadPct,
      })),
    },
    eccentricity: {
      e_mount_mm: output.splitEccentricity.eMountMm,
      e_shape_mm: output.splitEccentricity.eShapeMm,
      e_mm: totalEccentricity(output.splitEccentricity),
      phase_deg: output.splitEccentricity.phaseDeg,
      mount_source: output.splitEccentricity.mountSource,
      shape_source: output.splitEccentricity.shapeSource,
    },
    lead_in_adj_mm: output.leadInAdjMm,
    pass_feed_plan: output.passFeedPlan?.map((p) => ({
      pass_index: p.passIndex,
      symmetry_progress: p.symmetryProgress,
      f_pass: p.fPass,
      irregularity_remaining: p.irregularityRemaining,
      e_mount_mm: p.eMountMm,
      e_shape_eff_mm: p.eShapeEffMm,
      e_effective_mm: p.eEffectiveMm,
      lead_in_adj_mm: p.leadInAdjMm,
    })),
    warnings: output.warnings,
  });
}
