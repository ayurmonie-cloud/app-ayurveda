import type { Locale } from '@ayurmonie/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { setLocale } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

const profileKey = (userId: string | undefined) => ['profile', userId] as const;

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: profileKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, locale, dosha')
        .eq('id', userId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

/** Change la langue de l'interface et l'enregistre dans le profil. */
export function useUpdateLocale() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: async (locale: Locale) => {
      await setLocale(locale);
      if (!userId) return;
      const { error } = await supabase.from('profiles').update({ locale }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey(userId) }),
  });
}
