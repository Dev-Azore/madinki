import { getDashboardStats } from './actions';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Tailor Dashboard — Madinki',
  description: 'Search clients, view fittings, and manage garment measurements.',
};

/**
 * Server Component: fetches stats on the server, then passes them down
 * to the Client Component so the rest of the tailor PWA shell stays CSR.
 */
export default async function DashboardPage() {
  const { data: stats, error } = await getDashboardStats();

  return <DashboardClient stats={stats} statsError={error} />;
}

