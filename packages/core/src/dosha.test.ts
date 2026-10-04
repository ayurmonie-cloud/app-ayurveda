import { describe, expect, it } from 'vitest';

import { computeDoshaResult } from './dosha';

describe('computeDoshaResult', () => {
  it('identifie un dosha dominant', () => {
    const result = computeDoshaResult([{ vata: 3 }, { vata: 2, pitta: 1 }, { kapha: 1 }]);
    expect(result.scores).toEqual({ vata: 5, pitta: 1, kapha: 1 });
    expect(result.dominant).toEqual(['vata']);
    expect(result.shares.vata).toBeCloseTo(5 / 7);
  });

  it('détecte un profil bi-doshique', () => {
    const result = computeDoshaResult([{ pitta: 5 }, { kapha: 5 }, { vata: 1 }]);
    expect(result.dominant).toHaveLength(2);
    expect(result.dominant).toEqual(expect.arrayContaining(['pitta', 'kapha']));
  });

  it('ignore les points négatifs et gère un quiz vide', () => {
    expect(computeDoshaResult([{ vata: -3 }]).dominant).toEqual([]);
    expect(computeDoshaResult([]).shares).toEqual({ vata: 0, pitta: 0, kapha: 0 });
  });
});
