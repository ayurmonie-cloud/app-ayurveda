import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Retours' };

export default function Page() {
  return (
    <div className="stack">
      <h1>Retours</h1>
      <p className="muted">Bientôt disponible.</p>
    </div>
  );
}
