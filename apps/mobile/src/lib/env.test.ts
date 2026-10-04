import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
vi.stubEnv('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');

const { parseEnv } = await import('./env');

describe('parseEnv', () => {
  it('accepte une configuration complète', () => {
    expect(
      parseEnv({
        EXPO_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x',
      }).EXPO_PUBLIC_SUPABASE_URL,
    ).toBe('https://abc.supabase.co');
  });

  it('nomme les variables manquantes', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_SUPABASE_URL: 'pas une url' })).toThrow(
      /EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });
});
