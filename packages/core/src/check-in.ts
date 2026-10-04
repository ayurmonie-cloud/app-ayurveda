import { z } from 'zod';

/** Échelle de 1 (très bas) à 5 (excellent) utilisée par le check-in quotidien. */
export const scoreSchema = z.number().int().min(1).max(5);

export const isoDateSchema = z.iso.date();

export const checkInSchema = z.object({
  /** Généré sur l'appareil pour permettre la saisie hors connexion puis la synchronisation. */
  id: z.uuid(),
  date: isoDateSchema,
  energy: scoreSchema,
  sleep: scoreSchema,
  digestion: scoreSchema,
  mood: scoreSchema,
  stress: scoreSchema,
  note: z.string().trim().max(2000).optional(),
});

export type CheckIn = z.infer<typeof checkInSchema>;
