'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  Search,
  Phone,
  Ruler,
  AlertCircle,
  Loader2,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  Scissors,
  BookOpen,
} from 'lucide-react';
import { getClients, deleteClientAction } from './actions';
import { AdBanner } from '@/components/ads/AdBanner';

interface ClientItem {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_debt?: number;
  active_orders_count?: number;
  total_orders_count?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'CL';
}

function formatCurrency(n: number) {
  return `₦${(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'has_phone' | 'debt'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [clientToDelete, setClientToDelete] = useState<ClientItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    setError(null);
    try {
      const res = await getClients();
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setClients(res.data as ClientItem[]);
      }
    } catch {
      setError('Failed to load clients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      const res = await deleteClientAction(clientToDelete.id);
      if (res.error) {
        setDeleteErrorMessage(res.error);
      } else {
        setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
        setClientToDelete(null);
      }
    } catch {
      setDeleteErrorMessage('An error occurred while deleting the customer.');
    } finally {
      setIsDeleting(false);
    }
  };

  const debtClientsCount = useMemo(() => {
    return clients.filter((c) => (c.total_debt || 0) > 0).length;
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (filterType === 'has_phone' && !client.phone) return false;
      if (filterType === 'debt' && (client.total_debt || 0) <= 0) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = client.name.toLowerCase().includes(query);
        const matchesPhone = client.phone ? client.phone.toLowerCase().includes(query) : false;
        return matchesName || matchesPhone;
      }
      return true;
    });
  }, [clients, filterType, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in-up pb-28">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-tight mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Masu Dinki (Customer Directory)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Masu Kayan Dinki
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your customers, measurement sizes, active orders &amp; debts.
          </p>
        </div>

        <Link
          href="/clients/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Sabuwar Rijista (New Customer)</span>
        </Link>
      </div>

      {/* Debt Warning Strip if any customer owes money */}
      {debtClientsCount > 0 && filterType !== 'debt' && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-black text-rose-950 block">
                Akwai mutum {debtClientsCount} da ake bin sa bashi!
              </span>
              <span className="text-rose-700 text-[11px]">
                {debtClientsCount} customer(s) have unpaid balances / outstanding debts.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilterType('debt')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold shadow-2xs cursor-pointer whitespace-nowrap transition"
          >
            Duba Masu Bashi
          </button>
        </div>
      )}

      {/* Search Bar & Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nemi mai kaya da suna ko lamba..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs transition"
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

        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Duka ({clients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('has_phone')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterType === 'has_phone'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mai Lamba (Phone)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('debt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterType === 'debt'
                ? 'bg-rose-600 text-white shadow-xs'
                : debtClientsCount > 0
                ? 'text-rose-700 hover:text-rose-900 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚠️ Masu Bashi ({debtClientsCount})
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
              onClick={loadClients}
              className="text-xs text-red-600 underline hover:text-red-800 mt-1 cursor-pointer font-semibold"
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
          <p className="text-sm font-medium">Bude jerin masu dinki...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && clients.length === 0 && (
        <div className="p-10 text-center bg-white border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Ba a saka kowa ba tukuna</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Add your first customer to start recording measurements and tracking orders in your E-Book.
            </p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Saka Sabon Mai Dinki</span>
          </Link>
        </div>
      )}

      {/* Filtered No Results */}
      {!isLoading && !error && clients.length > 0 && filteredClients.length === 0 && (
        <div className="p-10 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2">
          <p className="text-sm font-medium">
            Ba a sami mai dinki mai dacewa da &ldquo;{searchQuery}&rdquo; ba
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="text-xs text-emerald-800 hover:underline cursor-pointer font-bold inline-block"
          >
            Goge zabuka (Clear search &amp; filters)
          </button>
        </div>
      )}

      {/* Clients Cards Grid */}
      {!isLoading && !error && filteredClients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((client) => {
            const initials = getInitials(client.name);
            const hasDebt = (client.total_debt || 0) > 0;
            const hasActiveOrders = (client.active_orders_count || 0) > 0;

            return (
              <div
                key={client.id}
                className={`p-5 bg-white border rounded-3xl transition-all duration-200 flex flex-col justify-between group shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                  hasDebt ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200/90 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/clients/${client.id}`}
                      className="flex items-center gap-3.5 group-hover:text-emerald-800 transition cursor-pointer flex-1 min-w-0"
                    >
                      {/* Client Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200/90 text-emerald-800 font-black text-sm flex items-center justify-center flex-shrink-0 font-mono shadow-2xs group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-800 transition truncate">
                            {client.name}
                          </h3>
                          {hasDebt && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] tracking-tight">
                              Bashi: {formatCurrency(client.total_debt || 0)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: #{client.id.slice(0, 6)}
                        </span>
                      </div>
                    </Link>

                    {/* Top Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/clients/${client.id}/edit`}
                        title="Edit Customer"
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteErrorMessage(null);
                          setClientToDelete(client);
                        }}
                        title="Delete Customer"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges / Order stats */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    {hasActiveOrders && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px] flex items-center gap-1">
                        <Scissors className="w-3 h-3 text-amber-700" />
                        {client.active_orders_count} Dinki a Hannu
                      </span>
                    )}
                    {(client.total_orders_count || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium text-[10px] flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        {client.total_orders_count} Orders a Littafi
                      </span>
                    )}
                  </div>

                  {/* Phone & Date */}
                  <div className="mt-3 space-y-2 text-xs">
                    {client.phone ? (
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`tel:${client.phone}`}
                          className="flex items-center gap-2 text-slate-700 hover:text-emerald-800 transition font-bold"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-800" />
                          <span className="font-mono">{client.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-emerald-800 hover:underline"
                        >
                          WhatsApp
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Babu lambar waya</span>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Registered {new Date(client.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Cards */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-xs font-bold text-slate-600 hover:text-emerald-800 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Duba Asusun (View Profile)</span>
                  </Link>

                  <Link
                    href={`/measurements/new?clientId=${client.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Ruler className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Auna Kaya</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">Goge Mai Dinki?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Shin kuna da tabbacin kuna son goge <strong>{clientToDelete.name}</strong>?
              </p>
            </div>

            {deleteErrorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {deleteErrorMessage}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                A&apos;a, Bar Shi
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eh, Goge'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-2">
        <AdBanner slotId="clients_bottom" />
      </div>
    </div>
  );
}
