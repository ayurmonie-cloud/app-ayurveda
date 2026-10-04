import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Identifiants de connexion. Les messages d'erreur sont des clés de traduction
 * (voir @ayurmonie/i18n), traduites à l'affichage.
 */
export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: 'auth.invalidEmail' })),
  password: z.string().min(PASSWORD_MIN_LENGTH, { error: 'auth.passwordTooShort' }),
});

export type Credentials = z.infer<typeof credentialsSchema>;
