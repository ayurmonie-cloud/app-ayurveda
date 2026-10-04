import { createClient } from '@/lib/supabase/server';

async function getStats() {
  const supabase = await createClient();
  const count = async (table: 'programs' | 'profiles' | 'enrollments' | 'ratings') => {
    const { count: total } = await supabase.from(table).select('*', { count: 'exact', head: true });
    return total ?? 0;
  };
  const [programs, customers, enrollments, ratings] = await Promise.all([
    count('programs'),
    count('profiles'),
    count('enrollments'),
    count('ratings'),
  ]);
  return [
    { label: 'Programmes', value: programs },
    { label: 'Comptes', value: customers },
    { label: 'Inscriptions', value: enrollments },
    { label: 'Retours', value: ratings },
  ];
}

export default async function DashboardPage() {
  const stats = await getStats();
  return (
    <div className="stack">
      <h1>Tableau de bord</h1>
      <ul className="stats">
        {stats.map((stat) => (
          <li key={stat.label} className="card">
            <p className="muted small">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </li>
        ))}
      </ul>
      <p className="muted">
        La gestion des programmes, des quiz et des retours arrive dans les prochaines étapes.
      </p>
    </div>
  );
}
