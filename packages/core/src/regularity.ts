/**
 * Régularité sur une fenêtre glissante, plutôt qu'une série stricte qui
 * retombe à zéro au premier jour manqué.
 */
export interface Regularity {
  /** Jours de la fenêtre avec au moins une activité. */
  activeDays: number;
  /** Taille de la fenêtre, en jours. */
  windowDays: number;
  /** Part des jours actifs, entre 0 et 1. */
  ratio: number;
}

const DAY_MS = 86_400_000;

/**
 * @param activityDates dates d'activité au format AAAA-MM-JJ (doublons acceptés)
 * @param today date du jour au format AAAA-MM-JJ, dans le fuseau de l'utilisateur
 * @param windowDays nombre de jours, aujourd'hui compris
 */
export function computeRegularity(
  activityDates: readonly string[],
  today: string,
  windowDays = 7,
): Regularity {
  if (!Number.isInteger(windowDays) || windowDays < 1) {
    throw new RangeError('windowDays doit être un entier positif');
  }
  const end = toUtcDay(today);
  const start = end - (windowDays - 1) * DAY_MS;
  const active = new Set(activityDates.map(toUtcDay).filter((day) => day >= start && day <= end));
  return {
    activeDays: active.size,
    windowDays,
    ratio: active.size / windowDays,
  };
}

function toUtcDay(isoDate: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new RangeError(`Date invalide : ${isoDate}`);
  const [, y, m, d] = match;
  return Date.UTC(Number(y), Number(m) - 1, Number(d));
}
