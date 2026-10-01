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
  Calendar,
  Layers,
  Sparkles,
  Phone,
  CheckCircle2,
  TableProperties,
  LayoutGrid,
  AlertTriangle,
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
import { QuickPaymentModal } from './QuickPaymentModal';
import { WhatsAppReceiptModal } from './WhatsAppReceiptModal';
import { LedgerColumnCustomizer } from './LedgerColumnCustomizer';
import { AdBanner } from '@/components/ads/AdBanner';

type StatusFilter = 'all' | 'started' | 'ready' | 'delivered';
type PeriodFilter = 'week' | 'month' | 'year' | 'all';
type ViewMode = 'cards' | 'book';

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
  return `₦${(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  } catch {
    return iso;
  }
}

const STATUS_LABELS: Record<LedgerStatus, string> = {
  started: 'Ana Dinki (Sewing)',
  in_progress: 'In Progress',
  ready: 'Ya Shirya (Ready)',
  delivered: 'An Karba (Delivered)',
};

const STATUS_BADGES: Record<LedgerStatus, { text: string; bg: string; border: string }> = {
  started: { text: 'Ana Dinki (Sewing)', bg: 'bg-amber-50 text-amber-800', border: 'border-amber-200' },
  in_progress: { text: 'In Progress', bg: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
  ready: { text: 'Ya Shirya (Ready)', bg: 'bg-sky-50 text-sky-700', border: 'border-sky-200' },
  delivered: { text: 'An Karba (Delivered)', bg: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-200' },
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
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntryItem | null>(null);
  const [paymentEntry, setPaymentEntry] = useState<LedgerEntryItem | null>(null);
  const [whatsAppEntry, setWhatsAppEntry] = useState<LedgerEntryItem | null>(null);
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check for overdue / due today items
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const overdueOrders = useMemo(() => {
    return allEntries.filter((e) => {
      if (e.status === 'delivered') return false;
      if (!e.delivery_date) return false;
      return e.delivery_date <= todayIso;
    });
  }, [allEntries, todayIso]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    const periodStart = getPeriodStart(periodFilter);
    return allEntries.filter((entry) => {
      if (showOverdueOnly) {
        if (entry.status === 'delivered' || !entry.delivery_date || entry.delivery_date > todayIso) {
          return false;
        }
      }

      if (periodStart && new Date(entry.entry_date) < periodStart) return false;

      if (statusFilter === 'started' && entry.status !== 'started' && entry.status !== 'in_progress') {
        return false;
      }
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
  }, [allEntries, periodFilter, statusFilter, searchQuery, showOverdueOnly, todayIso]);

  // Dynamic statistics
  const stats = useMemo<LedgerStats>(() => {
    const out: LedgerStats = {
      totalJobs: filteredEntries.length,
      startedJobs: 0,
      readyJobs: 0,
      deliveredJobs: 0,
      totalRevenue: 0,
      totalDeposited: 0,
      pendingBalance: 0,
    };
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
    setAllEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, status: nextStatus } : e))
    );
    try {
      const res = await updateLedgerStatus({ id: entry.id, status: nextStatus });
      if (res.error) loadData();
    } catch {
      loadData();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteLedgerEntry(entryToDelete.id);
      if (res.error) {
        alert(res.error);
      } else {
        setAllEntries((prev) => prev.filter((e) => e.id !== entryToDelete.id));
        setEntryToDelete(null);
      }
    } catch {
      alert('Failed to delete entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  const periodLabel: Record<PeriodFilter, string> = {
    week: 'Kwanaki 7 (7 Days)',
    month: 'Wannan Watan (This Month)',
    year: 'Wannan Shekarar (This Year)',
    all: 'Duka Lokaci (All Time)',
  };

  return (
    <div className="space-y-5 animate-fade-in-up pb-28">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-tight mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Littafin Dinki (Tailor E-Book)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Littafin Dinki &amp; Kudin Aiki
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer orders, plain &amp; design styles, deposits &amp; pending balances.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Customizer settings */}
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-2xl shadow-2xs transition cursor-pointer"
            title="Configure Ledger Columns"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* New Order Button */}
          <button
            type="button"
            onClick={() => {
              setEditingEntry(null);
              setIsEntryModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Sabon Aiki (New Order)</span>
          </button>
        </div>
      </div>

      {/* Urgency Alert Banner (Tailor Psychology: Never miss promised clothes!) */}
      {overdueOrders.length > 0 && !showOverdueOnly && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-300/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-black text-amber-950 block">
                {overdueOrders.length} Dinki na bukatar bayarwa yau / Ya wuce lokaci!
              </span>
              <span className="text-amber-800 text-[11px]">
                {overdueOrders.length} order(s) due today or overdue for customer pickup.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowOverdueOnly(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold shadow-2xs whitespace-nowrap cursor-pointer transition"
          >
            Duba Su (View)
          </button>
        </div>
      )}

      {showOverdueOnly && (
        <div className="p-3 bg-amber-100/80 border border-amber-300 rounded-2xl flex items-center justify-between text-xs">
          <span className="font-bold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            Viewing {filteredEntries.length} overdue &amp; due-today orders only
          </span>
          <button
            type="button"
            onClick={() => setShowOverdueOnly(false)}
            className="px-2.5 py-1 bg-white text-amber-900 border border-amber-300 rounded-xl font-bold text-[11px] hover:bg-amber-50 cursor-pointer"
          >
            Show All Orders
          </button>
        </div>
      )}

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
        {(['week', 'month', 'year', 'all'] as PeriodFilter[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPeriodFilter(p);
              setShowOverdueOnly(false);
            }}
            className={`flex-1 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              periodFilter === p
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {p === 'week' ? 'Kwanaki 7' : p === 'month' ? 'Wannan Watan' : p === 'year' ? 'Wannan Shekarar' : 'Duka (All Time)'}
          </button>
        ))}
      </div>

      {/* Financial & Job KPIs in Tailor Language */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Active Sewing */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Kayan da ke Aiki
            </span>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="text-xl font-black text-slate-900">{stats.startedJobs}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            {stats.readyJobs} ya shirya · {stats.deliveredJobs} an karba
          </p>
        </div>

        {/* Total Billed */}
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Jimillar Kudin Dinki
            </span>
            <TrendingUp className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            {stats.totalJobs} dinki · {periodLabel[periodFilter]}
          </p>
        </div>

        {/* Deposits in Hand */}
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/70 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Kudi a Hannu (Ajiya)
            </span>
            <Wallet className="w-3 h-3 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-emerald-800">
            {formatCurrency(stats.totalDeposited)}
          </div>
          <p className="text-[10px] text-emerald-700/70 font-medium mt-0.5">
            Cash &amp; deposits collected
          </p>
        </div>

        {/* Pending Balance (Ragowar Kudi a Waje) */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Ragowar Kudi (Balance)
            </span>
            <Clock className="w-3 h-3 text-amber-700" />
          </div>
          <div className="text-xl font-black text-amber-800">
            {formatCurrency(stats.pendingBalance)}
          </div>
          <p className="text-[10px] text-amber-700/70 font-medium mt-0.5">
            Sauran kudi da ke waje
          </p>
        </div>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nemi mai kaya, nau'in dinki, lamba... (Search)"
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer text-base leading-none"
            >
              &times;
            </button>
          )}
        </div>

        {/* View Toggle (Cards vs Littafin Dinki Grid) + Status Filter */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
            {(
              [
                { key: 'all', label: `Duka (${periodEntries.length})` },
                {
                  key: 'started',
                  label: `Dinki (${
                    periodEntries.filter(
                      (e) => e.status === 'started' || e.status === 'in_progress'
                    ).length
                  })`,
                },
                {
                  key: 'ready',
                  label: `Shirya (${
                    periodEntries.filter((e) => e.status === 'ready').length
                  })`,
                },
                {
                  key: 'delivered',
                  label: `An Karba (${
                    periodEntries.filter((e) => e.status === 'delivered').length
                  })`,
                },
              ] as { key: StatusFilter; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === key
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* View Mode */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card View (Aikin Hannu)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('book')}
              className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'book'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Littafin Dinki Grid View"
            >
              <TableProperties className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              onClick={loadData}
              className="text-xs text-red-600 underline hover:text-red-800 mt-1 cursor-pointer font-bold"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm font-medium">Bude Littafin Dinki...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && allEntries.length === 0 && (
        <div className="p-8 sm:p-12 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Littafinku a bude yake</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Record your first customer order — every garment, deposit, and balance tracked right here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingEntry(null);
              setIsEntryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white text-xs font-bold rounded-2xl shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Rubuta Sabon Dinki (New Order)</span>
          </button>
        </div>
      )}

      {/* Filter yielded no results */}
      {!isLoading && !error && allEntries.length > 0 && filteredEntries.length === 0 && (
        <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-3xl space-y-2">
          <p className="text-sm font-bold text-slate-700">Ba a sami dinki mai dacewa ba</p>
          <p className="text-xs text-slate-400">
            Try a different period, status, or clear the search.
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setPeriodFilter('all');
              setSearchQuery('');
              setShowOverdueOnly(false);
            }}
            className="mt-2 text-xs text-emerald-800 underline font-bold cursor-pointer"
          >
            Clear all filters (Goge zabuka)
          </button>
        </div>
      )}

      {/* Content Rendering: Either Table / Book or Cards */}
      {!isLoading && !error && filteredEntries.length > 0 && (
        <div className="space-y-3">
          {/* Book View (Desktop Table) */}
          <div
            className={`${
              viewMode === 'book' ? 'block' : 'hidden md:block'
            } bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center">#</th>
                    <th className="py-3 px-4">Ranar Karba</th>
                    <th className="py-3 px-4">Mai Kayan (Customer)</th>
                    <th className="py-3 px-3 text-center">Sets</th>
                    <th className="py-3 px-4">Nau&apos;in Dinki</th>
                    <th className="py-3 px-4">Aiki</th>
                    <th className="py-3 px-3 text-center">Agbada</th>
                    <th className="py-3 px-4 text-right">Ajiya (Deposit)</th>
                    <th className="py-3 px-4 text-right">Jimilla (Total)</th>
                    <th className="py-3 px-4 text-right">Ragowa (Balance)</th>
                    <th className="py-3 px-4 text-center">Mataki</th>
                    <th className="py-3 px-4 text-right">Aiki</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredEntries.map((entry, index) => {
                    const balance = Math.max(0, entry.total_amount - entry.deposit_amount);
                    const isFullyPaid = balance === 0 && entry.total_amount > 0;
                    const badge = STATUS_BADGES[entry.status];

                    return (
                      <tr key={entry.id} className="hover:bg-emerald-50/20 transition-colors group">
                        <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                          {formatDate(entry.entry_date)}
                          {entry.delivery_date && (
                            <div className="text-[10px] text-slate-400 font-sans">
                              Due: {formatDate(entry.delivery_date)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{entry.client_name}</div>
                          {entry.client_phone && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {entry.client_phone}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                          {entry.sets_count}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[11px] text-slate-700">
                            {entry.style_type || 'Plain'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {entry.embroidery_work || 'Plain'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {entry.agbada_count > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                              {entry.agbada_count}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">
                          {formatCurrency(entry.deposit_amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                          {formatCurrency(entry.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                          {isFullyPaid ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-800 text-[11px] font-black">
                              <BadgeCheck className="w-3.5 h-3.5" />
                              Paid
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-amber-700">{formatCurrency(balance)}</span>
                              <button
                                type="button"
                                onClick={() => setPaymentEntry(entry)}
                                className="px-1.5 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold cursor-pointer transition"
                                title="Collect Payment"
                              >
                                Collect
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <select
                            value={entry.status}
                            onChange={(e) =>
                              handleQuickStatusChange(entry, e.target.value as LedgerStatus)
                            }
                            className={`px-2 py-1 rounded-xl text-[10px] font-black border focus:outline-none cursor-pointer ${badge.bg} ${badge.border}`}
                          >
                            <option value="started">Ana Dinki (Sewing)</option>
                            <option value="ready">Ya Shirya (Ready)</option>
                            <option value="delivered">An Karba (Delivered)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setWhatsAppEntry(entry)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              title="Send WhatsApp Receipt"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEntry(entry);
                                setIsEntryModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Edit Entry"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEntryToDelete(entry)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
              <span>
                Showing <strong>{filteredEntries.length}</strong> of{' '}
                <strong>{allEntries.length}</strong> orders · {periodLabel[periodFilter]}
              </span>
              <div className="flex items-center gap-4 font-mono font-bold">
                <span>
                  Deposits in hand:{' '}
                  <strong className="text-emerald-800">
                    {formatCurrency(stats.totalDeposited)}
                  </strong>
                </span>
                <span>
                  Pending Balance:{' '}
                  <strong className="text-amber-800">
                    {formatCurrency(stats.pendingBalance)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Cards View (Mobile + Responsive Grid) */}
          <div
            className={`${
              viewMode === 'cards' ? 'block' : 'block md:hidden'
            } grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`}
          >
            {filteredEntries.map((entry) => {
              const balance = Math.max(0, entry.total_amount - entry.deposit_amount);
              const isFullyPaid = balance === 0 && entry.total_amount > 0;
              const isOverdue =
                entry.status !== 'delivered' &&
                entry.delivery_date &&
                entry.delivery_date <= todayIso;
              const badge = STATUS_BADGES[entry.status];

              return (
                <div
                  key={entry.id}
                  className={`bg-white border rounded-3xl shadow-2xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                    isOverdue
                      ? 'border-amber-300 ring-1 ring-amber-300/60'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Top */}
                  <div className="p-4 pb-2.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-black text-sm text-slate-900 leading-snug">
                            {entry.client_name}
                          </h3>
                          {isOverdue && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider animate-pulse">
                              Due!
                            </span>
                          )}
                        </div>
                        {entry.client_phone && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {entry.client_phone}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {formatDate(entry.entry_date)}
                        </span>
                        {entry.delivery_date && (
                          <span
                            className={`text-[9px] font-bold block ${
                              isOverdue ? 'text-red-600 font-black' : 'text-slate-500'
                            }`}
                          >
                            Due: {formatDate(entry.delivery_date)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Style Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {entry.style_type || 'Plain'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {entry.embroidery_work || 'Plain'}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold font-mono">
                        {entry.sets_count} Set{entry.sets_count !== 1 ? 's' : ''}
                      </span>
                      {entry.agbada_count > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold font-mono">
                          +{entry.agbada_count} Agbada
                        </span>
                      )}
                    </div>

                    {/* Notes if any */}
                    {entry.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                        &ldquo;{entry.notes}&rdquo;
                      </p>
                    )}

                    {/* Money Breakdown Box */}
                    <div className="p-3 bg-slate-50/90 border border-slate-100 rounded-2xl grid grid-cols-3 gap-2 text-center mt-2">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Jimilla (Total)
                        </div>
                        <div className="text-xs font-black text-slate-900 font-mono">
                          {formatCurrency(entry.total_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                          Ajiya (Paid)
                        </div>
                        <div className="text-xs font-black text-emerald-800 font-mono">
                          {formatCurrency(entry.deposit_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                          Ragowa (Balance)
                        </div>
                        {isFullyPaid ? (
                          <div className="text-xs font-black text-emerald-800 flex items-center justify-center gap-0.5 font-mono">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Paid
                          </div>
                        ) : (
                          <div className="text-xs font-black text-amber-700 font-mono">
                            {formatCurrency(balance)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Actions */}
                  <div className="border-t border-slate-100 p-3 bg-slate-50/50 space-y-2">
                    {/* Quick collect button if balance remains */}
                    {balance > 0 && (
                      <button
                        type="button"
                        onClick={() => setPaymentEntry(entry)}
                        className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Karbi Ragowar Kudi (Collect {formatCurrency(balance)})</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      {/* Quick Status Dropdown */}
                      <select
                        value={entry.status}
                        onChange={(e) =>
                          handleQuickStatusChange(entry, e.target.value as LedgerStatus)
                        }
                        className={`flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black border focus:outline-none cursor-pointer ${badge.bg} ${badge.border}`}
                      >
                        <option value="started">Ana Dinki (Sewing)</option>
                        <option value="ready">Ya Shirya (Ready)</option>
                        <option value="delivered">An Karba (Delivered)</option>
                      </select>

                      {/* Tool buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setWhatsAppEntry(entry)}
                          className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                          title="WhatsApp Receipt"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsEntryModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEntryToDelete(entry)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Period Financial Summary Bar */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
            <span>
              Kudin Shiga a {periodLabel[periodFilter]}:{' '}
              <strong className="text-slate-900 font-mono font-black text-sm">
                {formatCurrency(stats.totalRevenue)}
              </strong>
            </span>
            <div className="flex items-center gap-4 font-mono font-bold">
              <span>
                Kudi a Hannu:{' '}
                <strong className="text-emerald-800 font-black">
                  {formatCurrency(stats.totalDeposited)}
                </strong>
              </span>
              <span>
                Ragowa a Waje:{' '}
                <strong className="text-amber-800 font-black">
                  {formatCurrency(stats.pendingBalance)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <LedgerEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(null);
        }}
        onSuccess={loadData}
        initialEntry={editingEntry}
        clients={clients}
      />

      <QuickPaymentModal
        isOpen={Boolean(paymentEntry)}
        entry={paymentEntry}
        onClose={() => setPaymentEntry(null)}
        onSuccess={loadData}
      />

      <WhatsAppReceiptModal
        isOpen={Boolean(whatsAppEntry)}
        entry={whatsAppEntry}
        onClose={() => setWhatsAppEntry(null)}
      />

      <LedgerColumnCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        columns={columnsConfig}
        onSave={(newCols) => setColumnsConfig(newCols)}
      />

      {/* Delete Confirmation Modal with Profit Advisory */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-fade-in-up">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Goge Wannan Dinki? (Delete Record)
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                You are about to remove <strong>{entryToDelete.client_name}</strong>&apos;s order (
                {formatDate(entryToDelete.entry_date)}) from your ledger book.
              </p>
              <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                  Shawara: Kayan da aka gama kuma aka bayar yana da kyau a bar shi a littafi don
                  lissafin ribar mako, wata da shekara. Goge shi kawai idan kuskure aka yi wajen
                  rubutawa.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                A&apos;a, Bar Shi (Keep It)
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eh, Goge (Delete)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Ad banner */}
      <div className="pt-2">
        <AdBanner slotId="ledger_bottom" />
      </div>
    </div>
  );
}
