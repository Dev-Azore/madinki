import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Ban,
  Ruler,
  FolderGit2,
  ExternalLink,
  Crown,
  ShieldAlert,
} from 'lucide-react';
import { TailorStatusToggle } from '@/components/admin/TailorStatusToggle';
import { TailorPlanToggle } from '@/components/admin/TailorPlanToggle';
import { TailorRoleToggle } from '@/components/admin/TailorRoleToggle';

interface TailorStatRow {
  tailor_id: string;
  name: string;
  role?: 'tailor' | 'admin';
  status: 'active' | 'suspended';
  plan: 'free' | 'premium';
  client_count: number;
  template_count: number;
  measurement_count: number;
  last_activity: string | null;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Call the secure RPC function defined in migration (FR-5.2)
  const { data: rawStats, error } = await supabase.rpc('admin_tailor_stats');

  const stats = (rawStats || []) as TailorStatRow[];

  // Compute platform-wide KPI aggregates
  const totalTailors = stats.length;
  const activeTailors = stats.filter((t) => t.status === 'active').length;
  const suspendedTailors = stats.filter((t) => t.status === 'suspended').length;
  const totalClients = stats.reduce((acc, t) => acc + Number(t.client_count || 0), 0);
  const totalMeasurements = stats.reduce(
    (acc, t) => acc + Number(t.measurement_count || 0),
    0
  );
  const premiumUsers = stats.filter((t) => t.plan === 'premium').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Overview & Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor platform activity, inspect tailor clients & measurements, and manage account privileges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/templates"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            Manage Global Templates
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Users */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Users</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalTailors}</p>
          <p className="text-[11px] text-slate-400">Registered SaaS users</p>
        </div>

        {/* Card 2: Active Accounts */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{activeTailors}</p>
          <p className="text-[11px] text-slate-400">In good standing</p>
        </div>

        {/* Card 3: Suspended Accounts */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Suspended</span>
            <div className="w-7 h-7 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Ban className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600">{suspendedTailors}</p>
          <p className="text-[11px] text-slate-400">Access disabled</p>
        </div>

        {/* Card 4: Premium Plan Tier */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Premium</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{premiumUsers}</p>
          <p className="text-[11px] text-slate-400">Ad-free tier</p>
        </div>

        {/* Card 5: Total Clients */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Clients</span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalClients}</p>
          <p className="text-[11px] text-slate-400">Across all tailors</p>
        </div>

        {/* Card 6: Total Measurements */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 col-span-2 sm:col-span-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Measurements</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Ruler className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalMeasurements}</p>
          <p className="text-[11px] text-slate-400">Immutable snapshots</p>
        </div>
      </div>

      {/* Tailor Table Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden space-y-4 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">User Directory & Privilege Management</h2>
            <p className="text-xs text-slate-500">
              Live metrics, plan tiering, role promotions, and direct data inspection for all accounts.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto border border-slate-200">
            {stats.length} {stats.length === 1 ? 'Account' : 'Accounts'}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            Failed to load account statistics: {error.message}
          </div>
        )}

        {stats.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No user accounts found</p>
            <p className="text-xs text-slate-400">
              When users register on the platform, their activity metrics will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold bg-slate-50/70">
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Plan Tier</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Clients</th>
                  <th className="py-3 px-3 text-center">Templates</th>
                  <th className="py-3 px-3 text-center">Measures</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.map((tailor) => {
                  const role = tailor.role || 'tailor';
                  const isSelf = currentUser?.id === tailor.tailor_id;
                  const formattedDate = tailor.last_activity
                    ? new Date(tailor.last_activity).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'No activity yet';

                  return (
                    <tr
                      key={tailor.tailor_id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-xs text-[#1b5e20] shrink-0">
                            {tailor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900">{tailor.name}</p>
                              {isSelf && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-50 text-[#1b5e20] rounded border border-emerald-200">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 truncate max-w-[120px] sm:max-w-[150px]">
                              {tailor.tailor_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Toggle */}
                      <td className="py-3.5 px-3">
                        <TailorRoleToggle
                          userId={tailor.tailor_id}
                          userName={tailor.name}
                          currentRole={role}
                          isSelf={isSelf}
                        />
                      </td>

                      {/* Plan Toggle */}
                      <td className="py-3.5 px-3">
                        <TailorPlanToggle
                          tailorId={tailor.tailor_id}
                          tailorName={tailor.name}
                          currentPlan={tailor.plan}
                        />
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-3">
                        <TailorStatusToggle
                          tailorId={tailor.tailor_id}
                          tailorName={tailor.name}
                          currentStatus={tailor.status}
                          isSelf={isSelf}
                        />
                      </td>

                      {/* Client Count */}
                      <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-800">
                        {tailor.client_count}
                      </td>

                      {/* Template Count */}
                      <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-800">
                        {tailor.template_count}
                      </td>

                      {/* Measurement Count */}
                      <td className="py-3.5 px-3 text-center font-mono font-semibold text-[#1b5e20]">
                        {tailor.measurement_count}
                      </td>

                      {/* Last Activity */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {formattedDate}
                      </td>

                      {/* Deep Inspection Link */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/tailors/${tailor.tailor_id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-[#1b5e20] text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

