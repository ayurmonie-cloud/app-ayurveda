'use client';

import { useActionState } from 'react';

import { signIn, type SignInState } from '@/app/actions';

export function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});

  return (
    <form action={action} className="stack">
      <label className="field">
        <span>Adresse e-mail</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label className="field">
        <span>Mot de passe</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? (
        <p role="alert" className="error">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="button" disabled={pending}>
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
