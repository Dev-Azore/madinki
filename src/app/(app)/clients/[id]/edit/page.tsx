'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Loader2, AlertCircle } from 'lucide-react';
import { getClientProfile } from '../../actions';
import { ClientForm } from '../../ClientForm';

interface ClientData {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
}

export default function EditClientPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const [client, setClient] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    let ignore = false;

    async function load() {
      try {
        const res = await getClientProfile(clientId);
        if (ignore) return;
        if (res.error || !res.data) {
          setError(res.error || 'Client not found');
        } else {
          setClient(res.data.client);
        }
      } catch {
        if (!ignore) {
          setError('Failed to load client details');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [clientId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/clients/${clientId}`}
          className="p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-[#0B2545] rounded-xl shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2545] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1b5e20]" />
            Edit Client Information
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Update contact numbers and client preferences.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1b5e20]" />
          <p className="text-sm">Loading client data...</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p>{error}</p>
            <Link
              href="/clients"
              className="text-xs text-red-600 underline hover:text-red-800 mt-1 inline-block"
            >
              Back to Client Directory
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !error && client && <ClientForm initialData={client} />}
    </div>
  );
}
