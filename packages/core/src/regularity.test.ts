import { describe, expect, it } from 'vitest';

import { computeRegularity } from './regularity';

describe('computeRegularity', () => {
  it('compte les jours actifs distincts sur 7 jours glissants', () => {
    const result = computeRegularity(
      ['2026-10-04', '2026-10-04', '2026-10-02', '2026-09-28', '2026-09-27'],
      '2026-10-04',
    );
    expect(result).toEqual({ activeDays: 3, windowDays: 7, ratio: 3 / 7 });
  });

  it('ignore les dates futures', () => {
    expect(computeRegularity(['2026-10-05'], '2026-10-04').activeDays).toBe(0);
  });

  it('traverse correctement un changement de mois et d’heure', () => {
    expect(computeRegularity(['2026-10-25', '2026-10-31'], '2026-11-01', 8).activeDays).toBe(2);
  });

  it('refuse une fenêtre ou une date invalide', () => {
    expect(() => computeRegularity([], '2026-10-04', 0)).toThrow(RangeError);
    expect(() => computeRegularity(['04/10/2026'], '2026-10-04')).toThrow(RangeError);
  });
});
