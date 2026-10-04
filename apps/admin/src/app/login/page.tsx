import type { Metadata } from 'next';

import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Connexion' };

export default function LoginPage() {
  return (
    <main className="centered">
      <div className="card narrow stack">
        <h1>Ayurmonie · Admin</h1>
        <p className="muted">Connecte-toi avec ton compte administratrice.</p>
        <LoginForm />
      </div>
    </main>
  );
}
