import { describe, expect, it } from 'vitest';

import { credentialsSchema } from './auth';

describe('credentialsSchema', () => {
  it('normalise l’adresse e-mail', () => {
    expect(
      credentialsSchema.parse({ email: '  Anais@Ayurmonie.FR ', password: 'motdepasse' }).email,
    ).toBe('anais@ayurmonie.fr');
  });

  it('renvoie des clés de traduction en cas d’erreur', () => {
    const result = credentialsSchema.safeParse({ email: 'pas-un-email', password: 'court' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message).sort()).toEqual([
      'auth.invalidEmail',
      'auth.passwordTooShort',
    ]);
  });
});
