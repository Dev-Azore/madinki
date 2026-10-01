'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  SlidersHorizontal,
  Loader2,
  Trash2,
  Edit2,
  MessageCircle,
  AlertCircle,
  BadgeCheck,
  Clock,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  getLedgerData,
  deleteLedgerEntry,
  updateLedgerStatus,
  LedgerEntryItem,
  LedgerStats,
} from './actions';
import {
  LedgerColumnConfig,
  LedgerStatus,
  DEFAULT_LEDGER_COLUMNS,
} from '@/lib/validation/ledger';
import { LedgerEntryModal } from './LedgerEntryModal';
import { LedgerColumnCustomizer } from './LedgerColumnCustomizer';
import { AdBanner } from '@/components/ads/AdBanner';

type StatusFilter = 'all' | 'started' | 'ready' | 'delivered';
type PeriodFilter = 'week' | 'month' | 'year' | 'all';

function getPeriodStart(period: PeriodFilter): Date | null {
  if (period === 'all') return null;
  const now = new Date();
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), 0, 1);
}

function formatCurrency(n: number) {
  return 'N' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  } catch {
    return iso;
  }
}

const STATUS_LABELS: Record<LedgerStatus, string> = {
  started: 'Sewing',
  in_progress: 'In Progress',
  ready: 'Ready',
  delivered: 'Delivered',
};

const STATUS_COLORS: Record<LedgerStatus, string> = {
  started: 'bg-amber-50 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-sky-50 text-sky-700 border-sky-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export default function TailorEBookPage() {
  const [allEntries, setAllEntries] = useState<LedgerEntryItem[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string; phone: string | null }>>([]);
  const [columnsConfig, setColumnsConfig] = useState<LedgerColumnConfig[]>(DEFAULT_LEDGER_COLUMNS);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntryItem | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<LedgerEntryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getLedgerData();
      if (res.error) {
        setError(res.error);
      } else {
        setAllEntries(res.entries);
        setColumnsConfig(res.columnsConfig);
        setClients(res.clients);
      }
    } catch {
      setError('Failed to load ledger records. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredEntries = useMemo(() => {
    const periodStart = getPeriodStart(periodFilter);
    return allEntries.filter((entry) => {
      if (periodStart && new Date(entry.entry_date) < periodStart) return false;
      if (statusFilter === 'started' && entry.status !== 'started' && entry.status !== 'in_progress') return false;
      if (statusFilter === 'ready' && entry.status !== 'ready') return false;
      if (statusFilter === 'delivered' && entry.status !== 'delivered') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.client_name.toLowerCase().includes(q) ||
          (entry.client_phone && entry.client_phone.includes(q)) ||
          entry.style_type.toLowerCase().includes(q) ||
          entry.embroidery_work.toLowerCase().includes(q) ||
          entry.entry_date.includes(q)
        );
      }
      return true;
    });
  }, [allEntries, periodFilter, statusFilter, searchQuery]);

  const stats = useMemo<LedgerStats>(() => {
    const out: LedgerStats = { totalJobs: filteredEntries.length, startedJobs: 0, readyJobs: 0, deliveredJobs: 0, totalRevenue: 0, totalDeposited: 0, pendingBalance: 0 };
    for (const e of filteredEntries) {
      if (e.status === 'started' || e.status === 'in_progress') out.startedJobs++;
      else if (e.status === 'ready') out.readyJobs++;
      else if (e.status === 'delivered') out.deliveredJobs++;
      out.totalRevenue += e.total_amount;
      out.totalDeposited += e.deposit_amount;
      out.pendingBalance += Math.max(0, e.total_amount - e.deposit_amount);
    }
    return out;
  }, [filteredEntries]);

  const periodEntries = useMemo(() => {
    const periodStart = getPeriodStart(periodFilter);
    if (!periodStart) return allEntries;
    return allEntries.filter((e) => new Date(e.entry_date) >= periodStart);
  }, [allEntries, periodFilter]);

  const handleQuickStatusChange = async (entry: LedgerEntryItem, nextStatus: LedgerStatus) => {
    setAllEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, status: nextStatus } : e)));
    try {
      const res = await updateLedgerStatus({ id: entry.id, status: nextStatus });
      if (res.error) loadData();
    } catch { loadData(); }
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteLedgerEntry(entryToDelete.id);
      if (res.error) { alert(res.error); }
      else { setAllEntries((prev) => prev.filter((e) => e.id !== entryToDelete.id)); setEntryToDelete(null); }
    } catch { alert('Failed to delete entry.'); }
    finally { setIsDeleting(false); }
  };

  const formatWhatsAppOrderLink = (entry: LedgerEntryItem) => {
    const balance = Math.max(0, entry.total_amount - entry.deposit_amount);
    const text = `Tailor E-Book Receipt\n\nCustomer: ${entry.client_name}\nDate: ${entry.entry_date}\nStyle: ${entry.style_type}\nWork: ${entry.embroidery_work}\nSets: ${entry.sets_count}${entry.agbada_count > 0 ? ' + ' + entry.agbada_count + ' Agbada' : ''}\n\nTotal: N${entry.total_amount.toLocaleString()}\nDeposit: N${entry.deposit_amount.toLocaleString()}\nBalance: N${balance.toLocaleString()}\nStatus: ${STATUS_LABELS[entry.status]}\n\nThank you!`;
    let phone = (entry.client_phone || '').replace(/[^0-9]/g, '');
    if (phone.startsWith('0') && phone.length === 11) phone = '234' + phone.slice(1);
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const periodLabel: Record<PeriodFilter, string> = { week: 'Last 7 Days', month: 'This Month', year: 'This Year', all: 'All Time' };

  return (
    <div className="space-y-5 animate-fade-in-up pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-tight mb-2">
            <BookOpen className="w-3 h-3" />
            <span>Tailor E-Book</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">My Tailoring Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Track orders, styles, payments &amp; balances.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => setIsCustomizerOpen(true)} className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl shadow-2xs transition cursor-pointer" title="Configure columns">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => { setEditingEntry(null); setIsEntryModalOpen(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 active:scale-95 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
        {(['week', 'month', 'year', 'all'] as PeriodFilter[]).map((p) => (
          <button key={p} type="button" onClick={() => setPeriodFilter(p)}
            className={`flex-1 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap ${periodFilter === p ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
            {p === 'week' ? '7 Days' : p === 'month' ? 'Month' : p === 'year' ? 'Year' : 'All Time'}
          </button>
        ))}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Jobs</span>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="text-xl font-black text-slate-900">{stats.startedJobs}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stats.readyJobs} ready ? {stats.deliveredJobs} delivered</p>
        </div>
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Billed</span>
            <TrendingUp className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stats.totalJobs} orders ? {periodLabel[periodFilter]}</p>
        </div>
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/70 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Deposits In</span>
            <Wallet className="w-3 h-3 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-emerald-800">{formatCurrency(stats.totalDeposited)}</div>
          <p className="text-[10px] text-emerald-700/70 font-medium mt-0.5">Cash received upfront</p>
        </div>
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">To Collect</span>
            <Clock className="w-3 h-3 text-amber-700" />
          </div>
          <div className="text-xl font-black text-amber-800">{formatCurrency(stats.pendingBalance)}</div>
          <p className="text-[10px] text-amber-700/70 font-medium mt-0.5">Sauran kudi on delivery</p>
        </div>
      </div>

      {/* Search + Status Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search customer, style, work..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs transition" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer text-base leading-none">&times;</button>}
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
          {([
            { key: 'all', label: `All (${periodEntries.length})` },
            { key: 'started', label: `Sewing (${periodEntries.filter(e => e.status === 'started' || e.status === 'in_progress').length})` },
            { key: 'ready', label: `Ready (${periodEntries.filter(e => e.status === 'ready').length})` },
            { key: 'delivered', label: `Done (${periodEntries.filter(e => e.status === 'delivered').length})` },
          ] as { key: StatusFilter; label: string }[]).map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setStatusFilter(key)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap ${statusFilter === key ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <button onClick={loadData} className="text-xs text-red-600 underline hover:text-red-800 mt-1 cursor-pointer font-bold">Try again</button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm font-medium">Opening your Tailor E-Book...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && allEntries.length === 0 && (
        <div className="p-8 sm:p-12 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Your E-Book is empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Record your first customer order — every garment, deposit, and balance tracked here.</p>
          </div>
          <button type="button" onClick={() => { setEditingEntry(null); setIsEntryModalOpen(true); }} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white text-xs font-bold rounded-2xl shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer">
            <Plus className="w-4 h-4" /><span>Record First Order</span>
          </button>
        </div>
      )}

      {/* No results for filter */}
      {!isLoading && !error && allEntries.length > 0 && filteredEntries.length === 0 && (
        <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-3xl space-y-2">
          <p className="text-sm font-bold text-slate-700">No orders match your filter</p>
          <p className="text-xs text-slate-400">Try a different period, status, or clear the search.</p>
          <button onClick={() => { setStatusFilter('all'); setPeriodFilter('all'); setSearchQuery(''); }} className="mt-2 text-xs text-emerald-800 underline font-bold cursor-pointer">Clear all filters</button>
        </div>
      )}

      {/* Ledger Entries */}
      {!isLoading && !error && filteredEntries.length > 0 && (
        <div className="space-y-2">
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[820px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-3 text-center">Sets</th>
                    <th className="py-3 px-4">Style</th>
                    <th className="py-3 px-4">Work / Aiki</th>
                    <th className="py-3 px-3 text-center">Agbada</th>
                    <th className="py-3 px-4 text-right">Deposit</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredEntries.map((entry) => {
                    const balance = Math.max(0, entry.total_amount - entry.deposit_amount);
                    const isFullyPaid = balance === 0 && entry.total_amount > 0;
                    return (
                      <tr key={entry.id} className="hover:bg-emerald-50/20 transition-colors group">
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">{formatDate(entry.entry_date)}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{entry.client_name}</div>
                          {entry.client_phone && <div className="text-[10px] text-slate-400">{entry.client_phone}</div>}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">{entry.sets_count}</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[11px] text-slate-700">{entry.style_type || 'Plain'}</span></td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">{entry.embroidery_work || 'Plain'}</td>
                        <td className="py-3 px-3 text-center font-mono">
                          {entry.agbada_count > 0 ? <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">{entry.agbada_count}</span> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">{formatCurrency(entry.deposit_amount)}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900 whitespace-nowrap">{formatCurrency(entry.total_amount)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                          {isFullyPaid ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-800 text-[10px] font-black"><BadgeCheck className="w-3 h-3" />Paid</span>
                          ) : (
                            <span className="text-amber-700">{formatCurrency(balance)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <select value={entry.status} onChange={(e) => handleQuickStatusChange(entry, e.target.value as LedgerStatus)} className={`px-2 py-1 rounded-xl text-[10px] font-black border focus:outline-none cursor-pointer ${STATUS_COLORS[entry.status]}`}>
                            <option value="started">Sewing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                            <a href={formatWhatsAppOrderLink(entry)} target="_blank" rel="noopener noreferrer" className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition" title="WhatsApp Receipt"><MessageCircle className="w-3.5 h-3.5" /></a>
                            <button type="button" onClick={() => { setEditingEntry(entry); setIsEntryModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer" title="Edit / Update Payment"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button type="button" onClick={() => setEntryToDelete(entry)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
              <span>Showing <strong>{filteredEntries.length}</strong> of <strong>{allEntries.length}</strong> orders ? {periodLabel[periodFilter]}</span>
              <div className="flex items-center gap-4 font-mono font-bold">
                <span>Deposits: <strong className="text-emerald-800">{formatCurrency(stats.totalDeposited)}</strong></span>
                <span>Uncollected: <strong className="text-amber-800">{formatCurrency(stats.pendingBalance)}</strong></span>
              </div>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden space-y-2">
            {filteredEntries.map((entry) => {
              const balance = Math.max(0, entry.total_amount - entry.deposit_amount);
              const isFullyPaid = balance === 0 && entry.total_amount > 0;
              return (
                <div key={entry.id} className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-start justify-between p-3.5 pb-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-900">{entry.client_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[entry.status]}`}>{STATUS_LABELS[entry.status]}</span>
                      </div>
                      {entry.client_phone && <p className="text-[11px] text-slate-400 mt-0.5">{entry.client_phone}</p>}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap ml-2 mt-0.5">{formatDate(entry.entry_date)}</span>
                  </div>
                  {/* Tags */}
                  <div className="px-3.5 pb-2.5 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">{entry.style_type || 'Plain'}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">{entry.embroidery_work || 'Plain'} work</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">{entry.sets_count} set{entry.sets_count !== 1 ? 's' : ''}</span>
                    {entry.agbada_count > 0 && <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">{entry.agbada_count} Agbada</span>}
                  </div>
                  {/* Financial */}
                  <div className="mx-3.5 mb-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total</div>
                      <div className="text-sm font-black text-slate-900">{formatCurrency(entry.total_amount)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Deposit</div>
                      <div className="text-sm font-black text-emerald-800">{formatCurrency(entry.deposit_amount)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700">Balance</div>
                      {isFullyPaid ? (
                        <div className="text-sm font-black text-emerald-800 flex items-center justify-center gap-0.5"><BadgeCheck className="w-3.5 h-3.5" />Paid</div>
                      ) : (
                        <div className="text-sm font-black text-amber-700">{formatCurrency(balance)}</div>
                      )}
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="border-t border-slate-100 px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <select value={entry.status} onChange={(e) => handleQuickStatusChange(entry, e.target.value as LedgerStatus)} className={`flex-1 px-2 py-2 rounded-xl text-[11px] font-black border focus:outline-none cursor-pointer ${STATUS_COLORS[entry.status]}`}>
                      <option value="started">Sewing (Ana Dinki)</option>
                      <option value="ready">Ready (An Gama)</option>
                      <option value="delivered">Delivered (Tik)</option>
                    </select>
                    <div className="flex items-center gap-0.5">
                      <a href={formatWhatsAppOrderLink(entry)} target="_blank" rel="noopener noreferrer" className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"><MessageCircle className="w-4 h-4" /></a>
                      <button type="button" onClick={() => { setEditingEntry(entry); setIsEntryModalOpen(true); }} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setEntryToDelete(entry)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Mobile summary */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-600 space-y-1.5">
              <div className="flex justify-between"><span>Total Billed ({periodLabel[periodFilter]})</span><strong className="text-slate-900">{formatCurrency(stats.totalRevenue)}</strong></div>
              <div className="flex justify-between"><span>Deposits Collected</span><strong className="text-emerald-800">{formatCurrency(stats.totalDeposited)}</strong></div>
              <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5"><span className="text-amber-800 font-bold">Uncollected Balance</span><strong className="text-amber-800">{formatCurrency(stats.pendingBalance)}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <LedgerEntryModal isOpen={isEntryModalOpen} onClose={() => { setIsEntryModalOpen(false); setEditingEntry(null); }} onSuccess={loadData} initialEntry={editingEntry} clients={clients} />
      <LedgerColumnCustomizer isOpen={isCustomizerOpen} onClose={() => setIsCustomizerOpen(false)} columns={columnsConfig} onSave={(newCols) => setColumnsConfig(newCols)} />

      {/* Delete Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-fade-in-up">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center"><Trash2 className="w-5 h-5" /></div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Order Record?</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">You are about to remove <strong>{entryToDelete.client_name}</strong>&apos;s order ({formatDate(entryToDelete.entry_date)}) from your ledger.</p>
              <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">Tip: Keep delivered orders — they count toward your weekly, monthly and yearly profit reports. Delete only if recorded by mistake.</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => setEntryToDelete(null)} disabled={isDeleting} className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">Keep It</button>
              <button type="button" onClick={handleDeleteConfirm} disabled={isDeleting} className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-1"><AdBanner slotId="ledger_bottom" /></div>
    </div>
  );
}

