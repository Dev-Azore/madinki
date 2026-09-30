'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  Search,
  Phone,
  Ruler,
  ChevronRight,
  AlertCircle,
  Loader2,
  Trash2,
  Edit2,
  Calendar,
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
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'CL';
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    let ignore = false;

    async function fetchClients() {
      try {
        const res = await getClients();
        if (ignore) return;
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setClients(res.data as ClientItem[]);
        }
      } catch {
        if (!ignore) {
          setError('Failed to load clients. Please try again.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchClients();

    return () => {
      ignore = true;
    };
  }, []);

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
      setDeleteErrorMessage('An error occurred while deleting the client.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery)) ||
    (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header & New Client CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b5e20]">
              Customer Directory
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0B2545] mt-1">
            Client Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Manage your client contact numbers and fitting records.
          </p>
        </div>

        <Link
          href="/clients/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] active:scale-95 text-white font-bold rounded-xl text-sm shadow-sm shadow-[#2e7d32]/20 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </Link>
      </div>

      {/* Search Bar with Counter Pill */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client name, phone number, or notes..."
          className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-300 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs transition"
        />
        {clients.length > 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-slate-100 text-[#1b5e20] text-[11px] font-mono border border-slate-200">
            {filteredClients.length} of {clients.length}
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              onClick={loadClients}
              className="text-xs text-red-600 underline hover:text-red-800 mt-1 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1b5e20]" />
          <p className="text-sm">Loading client directory...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && clients.length === 0 && (
        <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-[#1b5e20] rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">No clients added yet</h3>
            <p className="text-xs text-slate-600 mt-1">
              Add your first customer to start recording fittings and garment sizes.
            </p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Client</span>
          </Link>
        </div>
      )}

      {/* Filtered No Results */}
      {!isLoading && !error && clients.length > 0 && filteredClients.length === 0 && (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-sm">No clients found matching &ldquo;{searchQuery}&rdquo;</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-[#1b5e20] hover:underline mt-1 cursor-pointer font-semibold"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Clients Cards Grid */}
      {!isLoading && !error && filteredClients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredClients.map((client) => {
            const initials = getInitials(client.name);
            return (
              <div
                key={client.id}
                className="p-5 bg-white border border-slate-200/90 hover:border-[#2e7d32]/50 rounded-2xl transition flex flex-col justify-between group shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/clients/${client.id}`}
                      className="flex items-center gap-3 group-hover:text-[#1b5e20] transition cursor-pointer"
                    >
                      {/* Client Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#1b5e20] font-black text-xs flex items-center justify-center flex-shrink-0 font-mono shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0B2545] text-base group-hover:text-[#1b5e20] transition">
                          {client.name}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: #{client.id.slice(0, 6)}
                        </span>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/clients/${client.id}/edit`}
                        title="Edit Client"
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteErrorMessage(null);
                          setClientToDelete(client);
                        }}
                        title="Delete Client"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact & Notes Snippet */}
                  <div className="mt-3.5 space-y-1.5 text-xs">
                    {client.phone ? (
                      <a
                        href={`tel:${client.phone}`}
                        className="flex items-center gap-2 text-slate-700 hover:text-[#1b5e20] transition font-medium"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#2e7d32]" />
                        <span>{client.phone}</span>
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 text-slate-400 italic">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>No phone number</span>
                      </span>
                    )}

                    {client.notes && (
                      <p className="text-[11px] text-slate-600 line-clamp-1 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        &ldquo;{client.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Quick Actions */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(client.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-1 font-bold text-[#1b5e20] hover:underline"
                  >
                    <span>Fittings & History</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
          <div className="bg-white border border-red-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0B2545]">Delete Client Profile</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete <strong>{clientToDelete.name}</strong>? This will remove their client record.
              </p>
            </div>

            {deleteErrorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {deleteErrorMessage}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setClientToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
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

      {/* Ad Banner bottom */}
      <div className="pt-2">
        <AdBanner slotId="clients_bottom" />
      </div>
    </div>
  );
}
