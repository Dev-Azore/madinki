import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Users,
  Ruler,
  Layers,
  Calendar,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { getTailorInspectionData } from '@/app/admin/actions';
import { TailorStatusToggle } from '@/components/admin/TailorStatusToggle';
import { TailorPlanToggle } from '@/components/admin/TailorPlanToggle';
import { TailorRoleToggle } from '@/components/admin/TailorRoleToggle';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function TailorInspectionPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getTailorInspectionData(id);

  if (error || !data || !data.profile) {
    notFound();
  }

  const { profile, clients, templates, measurements } = data;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl transition text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tailor Directory</span>
        </Link>

        <span className="text-xs font-mono px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-full shadow-xs">
          ID: {profile.id}
        </span>
      </div>

      {/* Tailor Profile Header & Controls */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1b5e20] to-[#144818] text-white font-black text-xl flex items-center justify-center shadow-xs border border-emerald-300">
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    profile.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {profile.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <TailorPlanToggle
              tailorId={profile.id}
              tailorName={profile.name}
              currentPlan={profile.plan as 'free' | 'premium'}
            />
            <TailorRoleToggle
              userId={profile.id}
              userName={profile.name}
              currentRole={profile.role as 'tailor' | 'admin'}
            />
            <TailorStatusToggle
              tailorId={profile.id}
              tailorName={profile.name}
              currentStatus={profile.status as 'active' | 'suspended'}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Total Customers
            </span>
            <p className="text-2xl font-black text-slate-900">{clients.length}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1b5e20]" />
              Style Templates
            </span>
            <p className="text-2xl font-black text-slate-900">{templates.length}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-sky-600" />
              Fittings Taken
            </span>
            <p className="text-2xl font-black text-slate-900">{measurements.length}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Recent Activity
            </span>
            <p className="text-xs font-bold text-slate-800 mt-2">
              {measurements[0]?.taken_at
                ? new Date(measurements[0].taken_at).toLocaleDateString('en-GB')
                : 'No fittings yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs: Customer Roster, Templates, and Measurement History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Customer Roster */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Customer Profiles ({clients.length})</span>
            </h2>
          </div>

          {clients.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              No customers created yet by this tailor.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 max-h-96 overflow-y-auto">
              {clients.map((c) => (
                <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-slate-100/70 transition">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{c.name}</p>
                    {c.phone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(c.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Style Templates */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1b5e20]" />
              <span>Custom Templates ({templates.length})</span>
            </h2>
          </div>

          {templates.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              No custom templates created yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{tpl.name}</span>
                    <span className="text-[11px] px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-[#1b5e20] rounded-full font-bold">
                      {tpl.template_fields?.length || 0} fields
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tpl.template_fields?.map((f: { id: string; field_name: string; unit: string | null }) => (
                      <span key={f.id} className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md">
                        {f.field_name} {f.unit ? `(${f.unit})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Measurement Snapshots Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Ruler className="w-4 h-4 text-sky-600" />
          <span>Recorded Measurement Snapshots (Recent 50)</span>
        </h2>

        {measurements.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            No measurement snapshots taken yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40 max-h-96 overflow-y-auto">
            {measurements.map((m) => {
              const fields = Array.isArray(m.fields_snapshot) ? m.fields_snapshot : [];
              return (
                <div key={m.id} className="p-4 space-y-2 hover:bg-slate-100/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{m.template_name_snapshot}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(m.taken_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#1b5e20] px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      {fields.length} points
                    </span>
                  </div>

                  {/* Fields snapshot preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fields.map((item: unknown, idx: number) => {
                      const f = item as { field_name?: string; unit?: string | null; value?: string };
                      return (
                        <span key={idx} className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono shadow-xs">
                          <strong className="text-slate-900">{f.field_name || 'Point'}:</strong> {f.value || '-'} {f.unit || ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
