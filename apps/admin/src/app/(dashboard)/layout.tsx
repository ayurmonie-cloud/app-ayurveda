import Link from 'next/link';
import type { ReactNode } from 'react';

import { signOut } from '@/app/actions';
import { getAdminSession } from '@/lib/auth';

const NAV = [
  { href: '/', label: 'Tableau de bord' },
  { href: '/programs', label: 'Programmes' },
  { href: '/quizzes', label: 'Quiz' },
  { href: '/customers', label: 'Clients' },
  { href: '/feedback', label: 'Retours' },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (session.status === 'forbidden') {
    return (
      <main className="centered">
        <div className="card narrow stack">
          <h1>Accès réservé</h1>
          <p className="muted">Le compte {session.email} n&apos;a pas le rôle administrateur.</p>
          <form action={signOut}>
            <button type="submit" className="button secondary">
              Se déconnecter
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="brand">Ayurmonie</p>
        <nav aria-label="Navigation principale">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <form action={signOut} className="signout">
          <p className="muted small">{session.email}</p>
          <button type="submit" className="button secondary">
            Se déconnecter
          </button>
        </form>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
