import { describe, expect, it } from 'vitest';

import { checkInSchema } from './check-in';

const valid = {
  id: '6f1c2a4e-8d3b-4f5a-9c7e-2b1d0a9e8f7c',
  date: '2026-10-04',
  energy: 4,
  sleep: 3,
  digestion: 5,
  mood: 4,
  stress: 2,
};

describe('checkInSchema', () => {
  it('accepte un check-in complet', () => {
    expect(checkInSchema.parse({ ...valid, note: '  Bonne journée ' }).note).toBe('Bonne journée');
  });

  it('refuse une note hors de l’échelle 1 à 5', () => {
    expect(checkInSchema.safeParse({ ...valid, energy: 6 }).success).toBe(false);
    expect(checkInSchema.safeParse({ ...valid, sleep: 0 }).success).toBe(false);
    expect(checkInSchema.safeParse({ ...valid, mood: 2.5 }).success).toBe(false);
  });

  it('refuse une date mal formée', () => {
    expect(checkInSchema.safeParse({ ...valid, date: '2026-13-01' }).success).toBe(false);
  });
});
