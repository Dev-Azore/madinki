'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Ruler,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Scissors,
  Wallet,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react';
import { getClientProfile, deleteClientAction } from '../actions';
import { WhatsAppShareButton } from '@/components/measurements/WhatsAppShareButton';
import { QuickPaymentModal } from '@/app/(app)/ledger/QuickPaymentModal';
import { WhatsAppReceiptModal } from '@/app/(app)/ledger/WhatsAppReceiptModal';
import { LedgerEntryItem } from '@/app/(app)/ledger/actions';

interface MeasurementSnapshotField {
  field_name: string;
  unit?: string | null;
  value: string;
}

interface MeasurementRecord {
  id: string;
  template_id: string | null;
  template_name_snapshot: string;
  fields_snapshot: MeasurementSnapshotField[];
  taken_at: string;
  created_at: string;
}

interface ClientData {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_debt?: number;
  active_orders_count?: number;
  completed_orders_count?: number;
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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [client, setClient] = useState<ClientData | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [orders, setOrders] = useState<LedgerEntryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'measurements' | 'orders'>('measurements');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded measurement card
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modals
  const [paymentOrder, setPaymentOrder] = useState<LedgerEntryItem | null>(null);
  const [whatsAppOrder, setWhatsAppOrder] = useState<LedgerEntryItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!clientId) return;
    try {
      const res = await getClientProfile(clientId);
      if (res.error || !res.data) {
        setError(res.error || 'Client not found');
      } else {
        setClient(res.data.client as ClientData);
        const fetchedMeasurements = (res.data.measurements || []) as unknown as MeasurementRecord[];
        setMeasurements(fetchedMeasurements);
        setOrders((res.data.orders || []) as unknown as LedgerEntryItem[]);
        if (fetchedMeasurements.length > 0 && !expandedId) {
          setExpandedId(fetchedMeasurements[0].id);
        }
      }
    } catch {
      setError('Failed to load client profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [clientId]);

  const handleDeleteClient = async () => {
    if (!client) return;
    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      const res = await deleteClientAction(client.id);
      if (res.error) {
        setDeleteErrorMessage(res.error);
      } else {
        router.push('/clients');
      }
    } catch {
      setDeleteErrorMessage('An error occurred while deleting the client.');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasDebt = Boolean(client && (client.total_debt || 0) > 0);

  return (
    <div className="space-y-6 animate-fade-in-up pb-28">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-800 transition py-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Koma Jerin Masu Dinki (Back to Customers)</span>
        </Link>

        {client && (
          <div className="flex items-center gap-1">
            <Link
              href={`/clients/${client.id}/edit`}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setDeleteErrorMessage(null);
                setShowDeleteModal(true);
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
              title="Delete Profile"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p>{error}</p>
            <Link
              href="/clients"
              className="text-xs text-red-600 underline hover:text-red-800 mt-1 inline-block font-semibold"
            >
              Back to Customers
            </Link>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
          <p className="text-sm font-medium">Bude asusun mai dinki...</p>
        </div>
      )}

      {!isLoading && !error && client && (
        <>
          {/* Outstanding Debt Alert Banner (Tailor Psychology) */}
          {hasDebt && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in-up">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-rose-950 text-sm">
                      ⚠️ Yana da Bashi (Has Unpaid Debt):
                    </span>
                    <span className="font-black text-rose-700 text-base font-mono">
                      {formatCurrency(client.total_debt || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Wannan mai dinki ya karbi kaya ba tare da ya kammala biyan kudi ba.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-2xs transition cursor-pointer"
                >
                  Duba Kayan da ke da Bashi
                </button>
              </div>
            </div>
          )}

          {/* Customer Profile Hero Card */}
          <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl relative overflow-hidden shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
              <div className="space-y-3.5 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200/90 rounded-2xl flex items-center justify-center font-black text-xl font-mono shadow-xs">
                    {getInitials(client.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {client.name}
                      </h1>
                      {hasDebt && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider">
                          Bashi: {formatCurrency(client.total_debt || 0)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Rijista: {formatDate(client.created_at)}
                    </p>
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {client.phone ? (
                    <>
                      <a
                        href={`tel:${client.phone}`}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-800" />
                        <span className="font-mono">{client.phone}</span>
                      </a>
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-800 text-xs font-bold rounded-xl transition shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Message on WhatsApp</span>
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Babu lambar waya a ajiye</span>
                  )}
                </div>

                {/* Notes if any */}
                {client.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-lg">
                    {client.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                <Link
                  href={`/measurements/new?clientId=${client.id}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer flex-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Auna Sabon Kaya</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('measurements')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'measurements'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ruler className="w-4 h-4" />
              <span>Auna Kayan (Measurements: {measurements.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Littafin Dinki (Orders in E-Book: {orders.length})</span>
              {hasDebt && (
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              )}
            </button>
          </div>

          {/* Tab 1: Measurements */}
          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-emerald-800" />
                    <span>Tarihin Awo (Measurement History)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sizes recorded for {client.name} are stored permanently.
                  </p>
                </div>

                {measurements.length > 0 && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Print Slip</span>
                  </button>
                )}
              </div>

              {/* Empty State */}
              {measurements.length === 0 ? (
                <div className="p-10 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-3 shadow-xs">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <Ruler className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Babu awo a ajiye tukuna
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Take this customer&apos;s sizes to start building their permanent measurement history.
                  </p>
                  <Link
                    href={`/measurements/new?clientId=${client.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Auna Kaya Yanzu</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {measurements.map((measurement, index) => {
                    const isExpanded = expandedId === measurement.id;
                    const takenDate = new Date(measurement.taken_at);

                    return (
                      <div
                        key={measurement.id}
                        className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition-all duration-200"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : measurement.id)}
                          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                              #{measurements.length - index}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-sm">
                                  {measurement.template_name_snapshot}
                                </h3>
                                {index === 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] tracking-tight">
                                    Mafi Kusa (Latest)
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Taken on {takenDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-slate-400 hidden sm:inline">
                              {measurement.fields_snapshot.length} figures
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-slate-100 pt-4 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                              {measurement.fields_snapshot.map((f, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                                >
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                    {f.field_name}
                                  </span>
                                  <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                                    {f.value}{' '}
                                    <span className="text-[10px] font-normal text-slate-400">
                                      {f.unit || 'in'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <WhatsAppShareButton
                                data={{
                                  clientName: client.name,
                                  clientPhone: client.phone,
                                  templateName: measurement.template_name_snapshot,
                                  takenAt: measurement.taken_at,
                                  fields: measurement.fields_snapshot.map((f) => ({
                                    field_name: f.field_name,
                                    unit: f.unit ?? null,
                                    value: f.value,
                                  })),
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Orders & Debt in E-Book */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-800" />
                    <span>Dinkin {client.name} a Littafin Aiki ({orders.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track all garments, deposits, remaining balances &amp; delivery statuses.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-10 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-3 shadow-xs">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Babu dinki a littafi ga {client.name}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Record a garment order for this client in the E-Book to track stitching progress and payments.
                  </p>
                  <Link
                    href="/ledger"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bude Littafin Dinki (Go to E-Book)</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const balance = Math.max(0, order.total_amount - order.deposit_amount);
                    const isFullyPaid = balance === 0 && order.total_amount > 0;
                    const isDebt = order.status === 'delivered' && balance > 0;

                    return (
                      <div
                        key={order.id}
                        className={`p-4 sm:p-5 bg-white border rounded-3xl shadow-xs transition-all ${
                          isDebt
                            ? 'border-rose-300 ring-1 ring-rose-200'
                            : 'border-slate-200/90'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-slate-900 text-base">
                                {order.style_type || 'Plain Outfit'}
                              </h3>
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                                {order.sets_count} Set{order.sets_count > 1 ? 's' : ''}
                              </span>
                              {order.agbada_count > 0 && (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                                  +{order.agbada_count} Agbada
                                </span>
                              )}
                              {isDebt && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px] tracking-tight uppercase">
                                  Bashi: {formatCurrency(balance)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                              <span>Aiki: <strong>{order.embroidery_work || 'Plain'}</strong></span>
                              <span>Karba: <strong>{formatDate(order.entry_date)}</strong></span>
                              {order.delivery_date && (
                                <span>Bayarwa: <strong>{formatDate(order.delivery_date)}</strong></span>
                              )}
                            </div>

                            {/* Financial breakdown */}
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-3 gap-2 text-center max-w-md">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                                <div className="text-xs font-black text-slate-900 font-mono">
                                  {formatCurrency(order.total_amount)}
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Ajiya (Paid)</span>
                                <div className="text-xs font-black text-emerald-800 font-mono">
                                  {formatCurrency(order.deposit_amount)}
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">Balance</span>
                                {isFullyPaid ? (
                                  <div className="text-xs font-black text-emerald-800 flex items-center justify-center gap-0.5 font-mono">
                                    <BadgeCheck className="w-3 h-3" />
                                    Paid
                                  </div>
                                ) : (
                                  <div className={`text-xs font-black font-mono ${isDebt ? 'text-rose-600 font-black' : 'text-amber-700'}`}>
                                    {formatCurrency(balance)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick action buttons */}
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                            {balance > 0 && (
                              <button
                                type="button"
                                onClick={() => setPaymentOrder(order)}
                                className={`px-4 py-2 text-white font-bold rounded-xl text-xs shadow-2xs transition cursor-pointer flex items-center gap-1.5 ${
                                  isDebt
                                    ? 'bg-rose-600 hover:bg-rose-700'
                                    : 'bg-emerald-800 hover:bg-emerald-900'
                                }`}
                              >
                                <Wallet className="w-3.5 h-3.5" />
                                <span>Biya {formatCurrency(balance)}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setWhatsAppOrder(order)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-800" />
                              <span>Rasidi (WhatsApp)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Delete Customer Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-fade-in-up">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-black text-slate-900">Goge Mai Dinki?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Shin kuna da tabbacin kuna son goge asusun <strong>{client.name}</strong>?
                  </p>
                </div>

                {deleteErrorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed">
                    {deleteErrorMessage}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    A&apos;a, Bar Shi
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClient}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eh, Goge'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modals for payment and WhatsApp */}
          <QuickPaymentModal
            isOpen={Boolean(paymentOrder)}
            entry={paymentOrder}
            onClose={() => setPaymentOrder(null)}
            onSuccess={fetchProfile}
          />

          <WhatsAppReceiptModal
            isOpen={Boolean(whatsAppOrder)}
            entry={whatsAppOrder}
            onClose={() => setWhatsAppOrder(null)}
          />
        </>
      )}
    </div>
  );
}
