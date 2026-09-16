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
  Sparkles,
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
          icon: <Ban className="w-4 h-4 text-red-400" />,
          bgColor: 'bg-red-500/10 border-red-500/20',
          verb: 'suspended account of',
          pillColor: 'bg-red-950/80 text-red-300 border-red-800',
        };
      case 'reactivate':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
          verb: 'reactivated account of',
          pillColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
        };
      case 'change_plan':
        return {
          icon: <Crown className="w-4 h-4 text-amber-400" />,
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          verb: 'updated subscription plan for',
          pillColor: 'bg-amber-950/80 text-amber-300 border-amber-800',
        };
      case 'promote_admin':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-lime-400" />,
          bgColor: 'bg-lime-500/10 border-lime-500/20',
          verb: 'promoted to Admin:',
          pillColor: 'bg-lime-950/80 text-lime-300 border-lime-800',
        };
      case 'demote_admin':
        return {
          icon: <ShieldMinus className="w-4 h-4 text-orange-400" />,
          bgColor: 'bg-orange-500/10 border-orange-500/20',
          verb: 'demoted to Tailor:',
          pillColor: 'bg-orange-950/80 text-orange-300 border-orange-800',
        };
      case 'create_global_template':
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
          bgColor: 'bg-purple-500/10 border-purple-500/20',
          verb: 'published global style template:',
          pillColor: 'bg-purple-950/80 text-purple-300 border-purple-800',
        };
      case 'delete_global_template':
        return {
          icon: <Trash2 className="w-4 h-4 text-slate-400" />,
          bgColor: 'bg-slate-800 border-slate-700',
          verb: 'deleted global style template:',
          pillColor: 'bg-slate-900 text-slate-300 border-slate-700',
        };
      default:
        return {
          icon: <History className="w-4 h-4 text-slate-400" />,
          bgColor: 'bg-slate-800 border-slate-700',
          verb: 'performed administrative action on',
          pillColor: 'bg-slate-900 text-slate-300 border-slate-700',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Admin Audit Log
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
              FR-5.4 Security Record
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable chronological record of administrative actions, plan upgrades, role promotions, and global template events.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold self-start sm:self-auto transition"
        >
          <span>Back to Overview</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl text-xs text-red-200">
          Failed to load audit logs: {error.message}
        </div>
      )}

      {/* Audit Log Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span>Recorded Administrative Events ({logs.length})</span>
          </h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/50 border border-dashed border-slate-800 rounded-xl space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No audit events recorded yet</p>
            <p className="text-xs text-slate-500">
              When an administrator modifies an account, promotes a user, changes a plan, or manages global templates, the audit trail will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/70">
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
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 border ${cfg.bgColor}`}
                    >
                      {cfg.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">
                          {actorName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {cfg.verb}
                        </span>
                        <span className="text-xs font-bold text-lime-400">
                          {targetName}
                        </span>
                      </div>

                      {(log.previous_status || log.new_status) && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          {log.previous_status && (
                            <>
                              <span className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                                {log.previous_status}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-600" />
                            </>
                          )}
                          <span className={`px-1.5 py-0.5 rounded border font-semibold ${cfg.pillColor}`}>
                            {log.new_status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 sm:text-right shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
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

