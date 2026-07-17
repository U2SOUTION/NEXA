import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CAM_EDGE_CASE,
  analyzeScanPass,
  decomposeEccentricity,
  runEdgeCaseCam,
  totalEccentricity,
} from '../src/cam/edge-case-cam.js';

describe('analyzeScanPass', () => {
  it('returns skipped when samples are empty', () => {
    const result = analyzeScanPass([], 600);
    expect(result.skipped).toBe(true);
    expect(result.fAdj).toBe(600);
  });

  it('reduces feed when irregularity is high', () => {
    const samples = [
      { aDeg: 0, aLoadPct: 20 },
      { aDeg: 90, aLoadPct: 55 },
      { aDeg: 180, aLoadPct: 22 },
      { aDeg: 270, aLoadPct: 50 },
    ];
    const result = analyzeScanPass(samples, 600, 1.2, 0.5);
    expect(result.skipped).toBe(false);
    expect(result.fAdj).toBeLessThan(600);
    expect(result.fAdj).toBeGreaterThanOrEqual(300);
  });
});

describe('decomposeEccentricity', () => {
  it('splits mount from gap4 and shape from scan', () => {
    const split = decomposeEccentricity({
      gap4: [2.0, 2.2, 2.0, 2.4],
      scanSamples: [
        { aDeg: 0, aLoadPct: 25 },
        { aDeg: 90, aLoadPct: 60 },
      ],
    });
    expect(split.eMountMm).toBeGreaterThan(0);
    expect(split.mountSource).toBe('gap4');
    expect(split.shapeSource).toBe('scan');
  });
});

describe('runEdgeCaseCam', () => {
  it('produces pass feed plan for irregular stock', () => {
    const output = runEdgeCaseCam({
      fNominal: 600,
      zNominal: 34,
      xCut: 120,
      yCut: 0,
      pPre: { x: 110, y: 0, z: 34 },
      pCut: { x: 120, y: 0, z: 34 },
      baseS: 650,
      leadInPolicy: { leadInMm: 5, approachRatio: 0.6, heatLeadMm: 3 },
      edgeCase: DEFAULT_CAM_EDGE_CASE,
      scanSamples: [
        { aDeg: 0, aLoadPct: 30 },
        { aDeg: 90, aLoadPct: 58 },
        { aDeg: 180, aLoadPct: 32 },
        { aDeg: 270, aLoadPct: 55 },
      ],
    });

    expect(output.scan.skipped).toBe(false);
    expect(output.passFeedPlan?.length).toBe(DEFAULT_CAM_EDGE_CASE.pass_total);
    expect(totalEccentricity(output.splitEccentricity)).toBeGreaterThan(0);
    expect(output.scanGcode?.[0]).toContain('scan_pass');
  });
});
