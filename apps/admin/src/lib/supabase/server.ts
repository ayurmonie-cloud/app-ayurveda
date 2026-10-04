import 'server-only';

import type { Database } from '@ayurmonie/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { getEnv } from '@/lib/env';

/**
 * Client Supabase côté serveur, authentifié avec la session de l'admin (cookies).
 * Il utilise la clé publique : toutes les lectures passent par la RLS, qui réserve
 * les données sensibles au rôle admin.
 */
export async function createClient() {
  const env = getEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Appelé depuis un Server Component : le proxy se charge de rafraîchir la session.
          }
        },
      },
    },
  );
}
