import 'server-only';

import { redirect } from 'next/navigation';
import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';

export type AdminSession =
  { status: 'admin'; email: string } | { status: 'forbidden'; email: string };

/**
 * Vérifie que la personne connectée est administratrice. La vérification fait foi
 * côté base aussi : la RLS ne renvoie les données sensibles qu'au rôle admin.
 */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', userId)
    .single();

  const email = profile?.email ?? claims.claims.email ?? '';
  return profile?.role === 'admin' ? { status: 'admin', email } : { status: 'forbidden', email };
});
