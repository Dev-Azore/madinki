'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  FileText,
  Calendar,
  Ruler,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Tag,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { getClientProfile, deleteClientAction } from '../actions';
import { WhatsAppShareButton } from '@/components/measurements/WhatsAppShareButton';

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
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'CL';
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [client, setClient] = useState<ClientData | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded measurement cards
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      if (!clientId) return;
      try {
        const res = await getClientProfile(clientId);
        if (ignore) return;
        if (res.error || !res.data) {
          setError(res.error || 'Client not found');
        } else {
          setClient(res.data.client);
          const fetchedMeasurements = (res.data.measurements || []) as unknown as MeasurementRecord[];
          setMeasurements(fetchedMeasurements);
          if (fetchedMeasurements.length > 0) {
            setExpandedId(fetchedMeasurements[0].id);
          }
        }
      } catch {
        if (!ignore) {
          setError('Failed to load client profile');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      ignore = true;
    };
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
        router.refresh();
      }
    } catch {
      setDeleteErrorMessage('An error occurred while deleting the client.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 p-2 bg-[#071A34] border border-[#0B2545] hover:border-[#2e7d32]/50 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold pr-1">Client Directory</span>
        </Link>

        {client && (
          <div className="flex items-center gap-2">
            <Link
              href={`/clients/${client.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#071A34] border border-[#0B2545] hover:border-[#2e7d32]/50 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#81c784]" />
              <span>Edit Info</span>
            </Link>
            <button
              onClick={() => {
                setDeleteErrorMessage(null);
                setShowDeleteModal(true);
              }}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
              title="Delete Client"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#81c784]" />
          <p className="text-sm">Loading client profile...</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-800 rounded-2xl text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p>{error}</p>
            <Link
              href="/clients"
              className="text-xs text-red-400 underline hover:text-red-300 mt-1 inline-block"
            >
              Back to Client Directory
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !error && client && (
        <>
          {/* Client Profile Card */}
          <div className="p-6 sm:p-7 bg-[#071A34] border border-[#2e7d32]/30 rounded-3xl relative overflow-hidden shadow-2xl shadow-[#040e1e]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-[#040e1e] text-[#81c784] border-2 border-[#2e7d32] rounded-2xl flex items-center justify-center font-black text-xl font-mono shadow">
                    {getInitials(client.name)}
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">
                      {client.name}
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Customer registered on {new Date(client.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Contact & Notes */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {client.phone ? (
                    <a
                      href={`tel:${client.phone}`}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#040e1e] hover:bg-[#0B2545] border border-[#0B2545] rounded-xl text-xs font-bold text-[#81c784] transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#2e7d32]" />
                      <span>{client.phone}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No phone number on file</span>
                  )}
                </div>

                {client.notes && (
                  <div className="p-3.5 bg-[#040e1e] border border-[#0B2545] rounded-xl text-xs text-slate-300 space-y-1">
                    <p className="text-[11px] font-bold text-[#81c784] flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Fitting Preferences & Notes:
                    </p>
                    <p className="text-slate-300 whitespace-pre-wrap">{client.notes}</p>
                  </div>
                )}
              </div>

              {/* Action: Take Measurement */}
              <Link
                href={`/measurements/new?clientId=${client.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold rounded-xl text-sm shadow-xl shadow-[#2e7d32]/25 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Measurement</span>
              </Link>
            </div>
          </div>

          {/* Measurements History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-[#81c784]" />
                  <span>Fitting Records ({measurements.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Historical measurements are preserved permanently with exact dates.
                </p>
              </div>

              {measurements.length > 0 && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#071A34] hover:bg-[#0B2545] border border-[#0B2545] text-slate-300 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#81c784]" />
                  <span>Print Ticket</span>
                </button>
              )}
            </div>

            {/* Empty History */}
            {measurements.length === 0 ? (
              <div className="p-8 text-center bg-[#071A34] border border-dashed border-[#0B2545] rounded-3xl space-y-3">
                <div className="w-12 h-12 bg-[#2e7d32]/15 text-[#81c784] border border-[#2e7d32]/30 rounded-2xl flex items-center justify-center mx-auto">
                  <Ruler className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  No measurements recorded yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Record measurements using a garment template to start building this customer&apos;s fitting history.
                </p>
                <Link
                  href={`/measurements/new?clientId=${client.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#2e7d32]/25 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Take First Measurement</span>
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
                      className="bg-[#071A34] border border-[#0B2545] rounded-2xl overflow-hidden transition hover:border-[#2e7d32]/50"
                    >
                      {/* Card Header */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(measurement.id)}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-[#0B2545]/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#040e1e] border border-[#0B2545] text-[#81c784] rounded-xl">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-sm sm:text-base">
                                {measurement.template_name_snapshot}
                              </h3>
                              {index === 0 && (
                                <span className="px-2 py-0.5 bg-[#2e7d32]/20 border border-[#2e7d32]/40 text-[#81c784] text-[10px] font-bold rounded-full">
                                  Latest
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>Recorded {takenDate.toLocaleDateString('en-GB')} at{' '}
                              {takenDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 hidden sm:inline">
                            {measurement.fields_snapshot?.length || 0} fields
                          </span>
                          <div className="p-1 text-slate-400">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Card Body - Fields Snapshot Grid */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-[#0B2545]">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-3">
                            {measurement.fields_snapshot &&
                            measurement.fields_snapshot.length > 0 ? (
                              measurement.fields_snapshot.map((field, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="p-3 bg-[#040e1e] border border-[#0B2545] rounded-xl"
                                >
                                  <p className="text-[11px] font-medium text-slate-400 truncate">
                                    {field.field_name}
                                  </p>
                                  <p className="text-base font-black text-white mt-1 flex items-baseline gap-1 font-mono">
                                    <span>{field.value}</span>
                                    {field.unit && (
                                      <span className="text-xs font-normal text-[#81c784]">
                                        {field.unit}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500 col-span-full">
                                No field values recorded.
                              </p>
                            )}
                          </div>

                          <div className="mt-3.5 pt-3 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-[#0B2545]">
                            <div className="flex items-center gap-2">
                              <span>Ticket ID: #{measurement.id.slice(0, 8)}</span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-1 text-[#81c784]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Immutable snapshot</span>
                              </span>
                            </div>

                            <WhatsAppShareButton
                              data={{
                                clientName: client.name,
                                clientPhone: client.phone,
                                templateName: measurement.template_name_snapshot,
                                takenAt: measurement.taken_at,
                                fields: measurement.fields_snapshot.map((f) => ({
                                  field_name: f.field_name,
                                  unit: f.unit || null,
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
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && client && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-[#071A34] border border-red-500/30 rounded-3xl shadow-2xl space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/10 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Client?</h3>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to delete{' '}
              <span className="font-bold text-white">&ldquo;{client.name}&rdquo;</span>?
            </p>

            {deleteErrorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  Cannot Delete Client
                </p>
                <p>{deleteErrorMessage}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteErrorMessage(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#0B2545] hover:bg-[#040e1e] text-slate-300 rounded-xl text-sm font-medium transition cursor-pointer"
              >
                Close
              </button>
              {!deleteErrorMessage && (
                <button
                  type="button"
                  onClick={handleDeleteClient}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
