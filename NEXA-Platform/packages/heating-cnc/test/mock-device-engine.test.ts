import { describe, expect, it } from 'vitest';
import { MockDeviceEngine } from '../src/motion/MockDeviceEngine.js';

describe('MockDeviceEngine', () => {
  it('locks executor on manual_overdrive', () => {
    const engine = new MockDeviceEngine('ui_sim');
    const result = engine.setWorkSession('manual_overdrive');
    expect(result.ok).toBe(true);
    expect(result.gcode_executor_state).toBe('LOCKED');
    expect(engine.start().ok).toBe(false);
  });

  it('rejects jog during machining run', () => {
    const engine = new MockDeviceEngine('ui_sim');
    engine.start();
    const jog = engine.jog('X', 1);
    expect(jog.ok).toBe(false);
  });
});
