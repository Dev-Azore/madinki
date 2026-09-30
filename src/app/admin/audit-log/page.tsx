import { createClient } from '@/lib/supabase/server';
import {
  History,
  ShieldAlert,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  Crown,
  ShieldCheck,
  ShieldMinus,
  Layers,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

interface AuditLogRow {
  id: string;
  action:
    | 'suspend'
    | 'reactivate'
    | 'change_plan'
    | 'promote_admin'
    | 'demote_admin'
    | 'create_global_template'
    | 'delete_global_template';
  previous_status: string | null;
  new_status: string | null;
  created_at: string;
  actor_id: string;
  target_id: string;
  actor?: {
    id: string;
    name: string;
  } | null;
  target?: {
    id: string;
    name: string;
  } | null;
}

export default async function AdminAuditLogPage() {
  const supabase = await createClient();

  // Fetch audit log entries ordered newest first
  const { data: rawLogs, error } = await supabase
    .from('admin_audit_log')
    .select(`
      id,
      action,
      previous_status,
      new_status,
      created_at,
      actor_id,
      target_id,
      actor:users!admin_audit_log_actor_id_fkey (
        id,
        name
      ),
      target:users!admin_audit_log_target_id_fkey (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  const logs = (rawLogs || []) as unknown as AuditLogRow[];

  const getActionConfig = (action: AuditLogRow['action']) => {
    switch (action) {
      case 'suspend':
        return {
          icon: <Ban className="w-4 h-4 text-red-600" />,
          bgColor: 'bg-red-50 border-red-200',
          verb: 'suspended account of',
          pillColor: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'reactivate':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-[#1b5e20]" />,
          bgColor: 'bg-emerald-50 border-emerald-200',
          verb: 'reactivated account of',
          pillColor: 'bg-emerald-50 text-[#1b5e20] border-emerald-200',
        };
      case 'change_plan':
        return {
          icon: <Crown className="w-4 h-4 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-200',
          verb: 'updated subscription plan for',
          pillColor: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'promote_admin':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-[#1b5e20]" />,
          bgColor: 'bg-emerald-50 border-emerald-200',
          verb: 'promoted to Admin:',
          pillColor: 'bg-emerald-50 text-[#1b5e20] border-emerald-200',
        };
      case 'demote_admin':
        return {
          icon: <ShieldMinus className="w-4 h-4 text-orange-600" />,
          bgColor: 'bg-orange-50 border-orange-200',
          verb: 'demoted to Tailor:',
          pillColor: 'bg-orange-50 text-orange-700 border-orange-200',
        };
      case 'create_global_template':
        return {
          icon: <Layers className="w-4 h-4 text-purple-600" />,
          bgColor: 'bg-purple-50 border-purple-200',
          verb: 'published global style template:',
          pillColor: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'delete_global_template':
        return {
          icon: <Trash2 className="w-4 h-4 text-slate-500" />,
          bgColor: 'bg-slate-100 border-slate-200',
          verb: 'deleted global style template:',
          pillColor: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      default:
        return {
          icon: <History className="w-4 h-4 text-slate-500" />,
          bgColor: 'bg-slate-100 border-slate-200',
          verb: 'performed administrative action on',
          pillColor: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Audit Log
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              FR-5.4 Security Record
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Immutable chronological record of administrative actions, plan upgrades, role promotions, and global template events.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-xs transition"
        >
          <span>Back to Overview</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          Failed to load audit logs: {error.message}
        </div>
      )}

      {/* Audit Log Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-600" />
            <span>Recorded Administrative Events ({logs.length})</span>
          </h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No audit events recorded yet</p>
            <p className="text-xs text-slate-500">
              When an administrator modifies an account, promotes a user, changes a plan, or manages global templates, the audit trail will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {logs.map((log) => {
              const cfg = getActionConfig(log.action);
              const actorName = log.actor?.name || 'Administrator';
              const targetName = log.target?.name || `Target (${log.target_id.slice(0, 8)}...)`;
              const timestamp = new Date(log.created_at).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 border ${cfg.bgColor}`}
                    >
                      {cfg.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {actorName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {cfg.verb}
                        </span>
                        <span className="text-xs font-bold text-[#1b5e20]">
                          {targetName}
                        </span>
                      </div>

                      {(log.previous_status || log.new_status) && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          {log.previous_status && (
                            <>
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600">
                                {log.previous_status}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                            </>
                          )}
                          <span className={`px-1.5 py-0.5 rounded border font-semibold ${cfg.pillColor}`}>
                            {log.new_status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 sm:text-right shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{timestamp}</span>
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

