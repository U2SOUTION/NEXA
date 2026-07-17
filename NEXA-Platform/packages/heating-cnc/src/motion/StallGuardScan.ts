import type { ScanSample } from '../cam/edge-case-cam.js';

export interface StallGuardScanOptions {
  stepDeg?: number;
  baseLoadPct?: number;
  loadSpanPct?: number;
  stallCritPct?: number;
}

export interface StallGuardScanProgress {
  sample: ScanSample;
  index: number;
  total: number;
}

/** Simulate A-axis scan samples with synthetic load map (MVP · ui_sim / device-sim). */
export function generateStallGuardScanSamples(
  options: StallGuardScanOptions = {},
): ScanSample[] {
  const stepDeg = options.stepDeg ?? 45;
  const base = options.baseLoadPct ?? 28;
  const span = options.loadSpanPct ?? 22;
  const steps = Math.floor(360 / stepDeg);
  const samples: ScanSample[] = [];

  for (let i = 0; i < steps; i++) {
    const aDeg = i * stepDeg;
    const wave = Math.sin((aDeg * Math.PI) / 180);
    const aLoadPct = Math.round(base + span * (0.5 + 0.5 * wave));
    samples.push({ aDeg, aLoadPct });
  }

  return samples;
}

export function* iterateStallGuardScan(
  options: StallGuardScanOptions = {},
): Generator<StallGuardScanProgress> {
  const samples = generateStallGuardScanSamples(options);
  const stallCrit = options.stallCritPct ?? 95;
  let index = 0;

  for (const sample of samples) {
    if (sample.aLoadPct >= stallCrit) {
      throw new Error('stall_crit');
    }
    yield { sample, index, total: samples.length };
    index += 1;
  }
}
