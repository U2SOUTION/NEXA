'use client';

import { touchStyle } from '@/components/heating-cnc/touchStyle';

interface JogGridProps {
  disabled?: boolean;
  onJog: (axis: 'X' | 'Y' | 'Z' | 'A', delta: number) => void;
}

const AXES = ['X', 'Y', 'Z', 'A'] as const;

export function JogGrid({ disabled, onJog }: JogGridProps) {
  return (
    <section className="card">
      <h2 className="card__title">Jog</h2>
      <div className="jog-grid">
        {AXES.map((axis) => {
          const step = axis === 'A' ? 5 : 1;
          return (
            <div key={axis} className="jog-axis">
              <span className="jog-axis__label">{axis}</span>
              <button
                type="button"
                className="jog-btn"
                style={touchStyle()}
                disabled={disabled}
                onClick={() => onJog(axis, step)}
                aria-label={`${axis} 축 +${step}`}
              >
                +
              </button>
              <button
                type="button"
                className="jog-btn"
                style={touchStyle()}
                disabled={disabled}
                onClick={() => onJog(axis, -step)}
                aria-label={`${axis} 축 -${step}`}
              >
                −
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
