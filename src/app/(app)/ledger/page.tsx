'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  SlidersHorizontal,
  Printer,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Edit2,
  MessageCircle,
  Ruler,
  Share2,
  User,
  ChevronDown,
  Layers,
  Sparkles,
  Scissors,
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

export default function TailorEBookPage() {
  const [entries, setEntries] = useState<LedgerEntryItem[]>([]);
  const [stats, setStats] = useState<LedgerStats>({
    totalJobs: 0,
    startedJobs: 0,
    readyJobs: 0,
    deliveredJobs: 0,
    totalRevenue: 0,
    totalDeposited: 0,
    pendingBalance: 0,
  });
  const [columnsConfig, setColumnsConfig] = useState<LedgerColumnConfig[]>(DEFAULT_LEDGER_COLUMNS);
  const [clients, setClients] = useState<Array<{ id: string; name: string; phone: string | null }>>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'started' | 'ready' | 'delivered'>('all');

  // Modals
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
        setEntries(res.entries);
        setStats(res.stats);
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

  const handleQuickStatusChange = async (entry: LedgerEntryItem, nextStatus: LedgerStatus) => {
    // Optimistic UI update
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, status: nextStatus } : e))
    );

    try {
      const res = await updateLedgerStatus({ id: entry.id, status: nextStatus });
      if (res.error) {
        loadData();
      }
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
        setEntries((prev) => prev.filter((e) => e.id !== entryToDelete.id));
        setEntryToDelete(null);
      }
    } catch {
      alert('Failed to delete entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'started' && entry.status !== 'started' && entry.status !== 'in_progress') {
          return false;
        }
        if (statusFilter === 'ready' && entry.status !== 'ready') return false;
        if (statusFilter === 'delivered' && entry.status !== 'delivered') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = entry.client_name.toLowerCase().includes(q);
        const matchesPhone = entry.client_phone && entry.client_phone.includes(q);
        const matchesStyle = entry.style_type.toLowerCase().includes(q);
        const matchesWork = entry.embroidery_work.toLowerCase().includes(q);
        const matchesDate = entry.entry_date.includes(q);
        return matchesName || matchesPhone || matchesStyle || matchesWork || matchesDate;
      }

      return true;
    });
  }, [entries, statusFilter, searchQuery]);

  const enabledCols = useMemo(() => {
    return columnsConfig.filter((c) => c.enabled);
  }, [columnsConfig]);

  const formatWhatsAppOrderLink = (entry: LedgerEntryItem) => {
    const balance = Math.max(0, entry.total_amount - entry.deposit_amount);
    const text = `✂️ *Madinki Tailor E-Book Receipt*\n━━━━━━━━━━━━━━━\n👤 *Customer:* ${entry.client_name}\n📅 *Date:* ${entry.entry_date}\n🧵 *Style:* ${entry.style_type}\n🪡 *Work / Aiki:* ${entry.embroidery_work}\n👕 *Sets / Qty:* ${entry.sets_count}${entry.agbada_count > 0 ? ` + ${entry.agbada_count} Agbada` : ''}\n━━━━━━━━━━━━━━━\n💰 *Total Price:* ₦${entry.total_amount.toLocaleString()}\n💵 *Deposit Paid:* ₦${entry.deposit_amount.toLocaleString()}\n⏳ *Balance:* ₦${balance.toLocaleString()}\n📍 *Status:* ${entry.status === 'delivered' ? 'Delivered / An Karba' : entry.status === 'ready' ? 'Ready / An Gama' : 'In Progress / Ana Dinki'}\n━━━━━━━━━━━━━━━\n*Thank you for sewing with us!*`;
    
    let cleanPhone = (entry.client_phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = '234' + cleanPhone.slice(1);
    }

    if (cleanPhone) {
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#1b5e20] text-xs font-bold tracking-tight">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tailor E-Book • Littafin Dinki</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            My Tailoring Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track daily customer garment orders, styles, embroidery work, deposits & balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-2xl shadow-2xs transition cursor-pointer"
            title="Configure columns"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#1b5e20]" />
            <span className="hidden sm:inline">Columns</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingEntry(null);
              setIsEntryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1b5e20] to-[#144818] hover:from-[#144818] hover:to-[#0e3310] active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-emerald-950/15 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Order Entry</span>
          </button>
        </div>
      </div>

      {/* ── Financial & Job Analytics Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Sewing */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Jobs (Start)</span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {stats.startedJobs} <span className="text-xs font-semibold text-slate-400">in sewing</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {stats.readyJobs} ready • {stats.deliveredJobs} delivered
          </p>
        </div>

        {/* Total Billed */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Billed (Full)
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₦{stats.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Across {stats.totalJobs} recorded orders
          </p>
        </div>

        {/* Deposits Collected */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Deposits Collected
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#1b5e20]">
            ₦{stats.totalDeposited.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Received upfront from clients
          </p>
        </div>

        {/* Pending Balance */}
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
            Uncollected Balance
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-800">
            ₦{stats.pendingBalance.toLocaleString()}
          </div>
          <p className="text-[10px] text-amber-700/80 font-medium">
            Sauran Kudi to collect on delivery
          </p>
        </div>
      </div>

      {/* ── Controls Bar: Search & Status Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, style (Plain/Kaftan), embroidery work..."
            className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/15 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs transition font-medium"
          />
          {entries.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-mono border border-slate-200">
              {filteredEntries.length} of {entries.length}
            </span>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-[#1b5e20] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('started')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'started'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⏳ Start / Sewing ({stats.startedJobs})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ready')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'ready'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ Ready ({stats.readyJobs})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'delivered'
                ? 'bg-white text-[#1b5e20] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✅ Delivered ({stats.deliveredJobs})
          </button>
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
          <Loader2 className="w-8 h-8 animate-spin text-[#1b5e20]" />
          <p className="text-sm font-medium">Opening your Tailor E-Book...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && entries.length === 0 && (
        <div className="p-10 text-center bg-white border border-dashed border-slate-300 rounded-3xl max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-[#1b5e20] rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Your E-Book is clean & empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Digitize your daily tailor notebook! Record your client orders, sets, plain/design styles, embroidery work, and deposits here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingEntry(null);
              setIsEntryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#1b5e20] to-[#144818] text-white text-xs font-bold rounded-2xl shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record First Order</span>
          </button>
        </div>
      )}

      {/* ── Main Ledger Table (Digital Notebook View) ── */}
      {!isLoading && !error && entries.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Customer Name</th>
                  <th className="py-3 px-3">Set / Qty</th>
                  <th className="py-3 px-3.5">Style (Plain/Design)</th>
                  <th className="py-3 px-3.5">Work / Aiki</th>
                  <th className="py-3 px-3 text-center">Agbada</th>
                  <th className="py-3 px-3.5 text-right">Deposit</th>
                  <th className="py-3 px-3.5 text-right">Total</th>
                  <th className="py-3 px-3.5 text-right">Balance</th>
                  <th className="py-3 px-3.5 text-center">Status / Tik</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredEntries.map((entry) => {
                  const balance = Math.max(0, entry.total_amount - entry.deposit_amount);

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-emerald-50/30 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {entry.entry_date}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{entry.client_name}</span>
                          {entry.client_phone && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({entry.client_phone})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sets */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {entry.sets_count}
                      </td>

                      {/* Style */}
                      <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[11px]">
                          {entry.style_type || 'Plain'}
                        </span>
                      </td>

                      {/* Embroidery Work */}
                      <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                        <span className="text-[11px] font-medium">
                          {entry.embroidery_work || 'Plain'}
                        </span>
                      </td>

                      {/* Agbada */}
                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {entry.agbada_count > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                            {entry.agbada_count}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Deposit */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-[#1b5e20] whitespace-nowrap">
                        ₦{entry.deposit_amount.toLocaleString()}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3.5 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                        ₦{entry.total_amount.toLocaleString()}
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                        {balance > 0 ? (
                          <span className="text-amber-700">₦{balance.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">Paid</span>
                        )}
                      </td>

                      {/* Status / Quick Toggle */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <select
                          value={entry.status}
                          onChange={(e) =>
                            handleQuickStatusChange(entry, e.target.value as LedgerStatus)
                          }
                          className={`px-2 py-1 rounded-xl text-[11px] font-black border focus:outline-none cursor-pointer ${
                            entry.status === 'delivered'
                              ? 'bg-emerald-50 text-[#1b5e20] border-emerald-300'
                              : entry.status === 'ready'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="started">⏳ Start (Ana Dinki)</option>
                          <option value="ready">✨ Ready (An Gama)</option>
                          <option value="delivered">✅ Delivered (Tik)</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* WhatsApp receipt link */}
                          <a
                            href={formatWhatsAppOrderLink(entry)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Share Order Slip via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit Entry */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEntry(entry);
                              setIsEntryModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Edit Ledger Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Entry */}
                          <button
                            type="button"
                            onClick={() => setEntryToDelete(entry)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Entry"
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

          {/* Table Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-medium">
            <span>
              Showing <strong>{filteredEntries.length}</strong> orders in your digital ledger
            </span>
            <div className="flex items-center gap-4 text-[11px] font-mono font-bold">
              <span>Deposits: <strong className="text-[#1b5e20]">₦{stats.totalDeposited.toLocaleString()}</strong></span>
              <span>Pending: <strong className="text-amber-800">₦{stats.pendingBalance.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
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

      <LedgerColumnCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        columns={columnsConfig}
        onSave={(newCols) => setColumnsConfig(newCols)}
      />

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Ledger Entry</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete the order record for <strong>{entryToDelete.client_name}</strong> ({entryToDelete.entry_date})?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Banner */}
      <div className="pt-2">
        <AdBanner slotId="ledger_bottom" />
      </div>
    </div>
  );
}
