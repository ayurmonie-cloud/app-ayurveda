import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Quiz' };

export default function Page() {
  return (
    <div className="stack">
      <h1>Quiz</h1>
      <p className="muted">Bientôt disponible.</p>
    </div>
  );
}
