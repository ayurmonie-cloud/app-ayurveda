'use server';

import { credentialsSchema } from '@ayurmonie/core';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export type SignInState = { error?: string };

const errorMessages: Record<string, string> = {
  'auth.invalidEmail': 'Adresse e-mail invalide.',
  'auth.passwordTooShort': 'Le mot de passe doit contenir au moins 8 caractères.',
};

export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    const key = parsed.error.issues[0]?.message ?? '';
    return { error: errorMessages[key] ?? 'Identifiants invalides.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: 'Email ou mot de passe incorrect.' };

  redirect('/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
