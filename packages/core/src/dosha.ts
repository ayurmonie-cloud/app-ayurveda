export const DOSHAS = ['vata', 'pitta', 'kapha'] as const;
export type Dosha = (typeof DOSHAS)[number];

/** Points qu'une réponse de quiz attribue à chaque dosha (stockés en base avec la réponse). */
export type DoshaScores = Partial<Record<Dosha, number>>;

export interface DoshaResult {
  /** Total par dosha. */
  scores: Record<Dosha, number>;
  /** Part de chaque dosha, entre 0 et 1. */
  shares: Record<Dosha, number>;
  /** Dosha(s) dominant(s), par ordre décroissant ; deux en cas de profil bi-doshique. */
  dominant: Dosha[];
}

/**
 * Additionne les points des réponses choisies. Un second dosha est considéré
 * comme co-dominant lorsqu'il est à moins de `closeness` (en part) du premier.
 */
export function computeDoshaResult(answers: readonly DoshaScores[], closeness = 0.1): DoshaResult {
  const scores: Record<Dosha, number> = { vata: 0, pitta: 0, kapha: 0 };
  for (const answer of answers) {
    for (const dosha of DOSHAS) scores[dosha] += Math.max(0, answer[dosha] ?? 0);
  }
  const total = DOSHAS.reduce((sum, dosha) => sum + scores[dosha], 0);
  const shares: Record<Dosha, number> = {
    vata: total ? scores.vata / total : 0,
    pitta: total ? scores.pitta / total : 0,
    kapha: total ? scores.kapha / total : 0,
  };
  if (total === 0) return { scores, shares, dominant: [] };

  const ranked = [...DOSHAS].sort((a, b) => shares[b] - shares[a]);
  const [first, second] = ranked as [Dosha, Dosha, Dosha];
  const dominant = shares[first] - shares[second] < closeness ? [first, second] : [first];
  return { scores, shares, dominant };
}
