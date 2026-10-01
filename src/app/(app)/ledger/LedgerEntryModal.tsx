'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Save,
  User,
  Phone,
  Scissors,
  CheckCircle2,
} from 'lucide-react';
import {
  createLedgerEntry,
  updateLedgerEntry,
  LedgerEntryItem,
} from './actions';
import { CreateLedgerEntryInput, LedgerStatus } from '@/lib/validation/ledger';

interface LedgerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialEntry?: LedgerEntryItem | null;
  clients: Array<{ id: string; name: string; phone: string | null }>;
}

const COMMON_STYLES = [
  'Plain',
  'Design',
  'Royal Kaftan',
  'Senator Wear',
  'Babban Riga',
  'Jalabiya / Gown',
  'Shirt & Trouser',
  'Suit / Safari',
];

const COMMON_WORKS = [
  'Plain (Babu Aiki)',
  'Computer Embroidery',
  'Monogram (Mono)',
  'Hand Embroidery (Hannu)',
  'Stone Work',
  'Normal Stitch',
  'Piping / Neck Design',
];

export function LedgerEntryModal({
  isOpen,
  onClose,
  onSuccess,
  initialEntry,
  clients,
}: LedgerEntryModalProps) {
  const isEditing = Boolean(initialEntry);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [setsCount, setSetsCount] = useState<number>(1);
  const [styleType, setStyleType] = useState('Plain');
  const [embroideryWork, setEmbroideryWork] = useState('Plain (Babu Aiki)');
  const [agbadaCount, setAgbadaCount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<string>('0');
  const [totalAmount, setTotalAmount] = useState<string>('0');
  const [status, setStatus] = useState<LedgerStatus>('started');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      setClientName(initialEntry.client_name || '');
      setClientPhone(initialEntry.client_phone || '');
      setClientId(initialEntry.client_id || null);
      setEntryDate(initialEntry.entry_date || new Date().toISOString().slice(0, 10));
      setDeliveryDate(initialEntry.delivery_date || '');
      setSetsCount(initialEntry.sets_count || 1);
      setStyleType(initialEntry.style_type || 'Plain');
      setEmbroideryWork(initialEntry.embroidery_work || 'Plain (Babu Aiki)');
      setAgbadaCount(initialEntry.agbada_count || 0);
      setDepositAmount(initialEntry.deposit_amount.toString());
      setTotalAmount(initialEntry.total_amount.toString());
      setStatus(initialEntry.status || 'started');
      setNotes(initialEntry.notes || '');
    } else {
      setClientName('');
      setClientPhone('');
      setClientId(null);
      setEntryDate(new Date().toISOString().slice(0, 10));
      setDeliveryDate('');
      setSetsCount(1);
      setStyleType('Plain');
      setEmbroideryWork('Plain (Babu Aiki)');
      setAgbadaCount(0);
      setDepositAmount('0');
      setTotalAmount('0');
      setStatus('started');
      setNotes('');
    }
    setError(null);
  }, [initialEntry, isOpen]);

  if (!isOpen) return null;

  const numDeposit = parseFloat(depositAmount) || 0;
  const numTotal = parseFloat(totalAmount) || 0;
  const balance = Math.max(0, numTotal - numDeposit);

  const filteredClients = clients.filter(
    (c) =>
      clientName.trim() &&
      c.name.toLowerCase().includes(clientName.toLowerCase()) &&
      c.name.toLowerCase() !== clientName.toLowerCase()
  );

  const handleSelectClient = (c: { id: string; name: string; phone: string | null }) => {
    setClientName(c.name);
    if (c.phone) setClientPhone(c.phone);
    setClientId(c.id);
    setShowClientSuggestions(false);
  };

  const setDepositHalf = () => {
    if (numTotal > 0) {
      setDepositAmount(Math.round(numTotal / 2).toString());
    }
  };

  const setDepositFull = () => {
    if (numTotal > 0) {
      setDepositAmount(numTotal.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientName.trim()) {
      setError('Customer name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateLedgerEntryInput = {
        client_id: clientId,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim() || null,
        entry_date: entryDate,
        delivery_date: deliveryDate || null,
        sets_count: Number(setsCount) || 1,
        style_type: styleType.trim() || 'Plain',
        embroidery_work: embroideryWork.trim() || 'Plain',
        agbada_count: Number(agbadaCount) || 0,
        deposit_amount: numDeposit,
        total_amount: numTotal,
        status,
        notes: notes.trim() || null,
        custom_fields: {},
      };

      if (isEditing && initialEntry) {
        const res = await updateLedgerEntry({
          ...payload,
          id: initialEntry.id,
        });
        if (res.error) {
          setError(res.error);
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await createLedgerEntry(payload);
        if (res.error) {
          setError(res.error);
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shadow-2xs">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {isEditing ? 'Gyara Aiki (Edit Order)' : 'Rubuta Sabon Aiki (New Order)'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Record customer outfit order, embroidery & billing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 relative">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Mai Kayan (Customer Name) <span className="text-emerald-700">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    setShowClientSuggestions(true);
                  }}
                  onFocus={() => setShowClientSuggestions(true)}
                  placeholder="e.g. Alhaji Ibrahim"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-700 focus:bg-white rounded-xl text-slate-900 font-bold focus:outline-none shadow-2xs"
                  required
                />
              </div>

              {/* Autocomplete dropdown */}
              {showClientSuggestions && filteredClients.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-36 overflow-y-auto">
                  {filteredClients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectClient(c)}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-emerald-50 flex items-center justify-between border-b border-slate-50 last:border-0 cursor-pointer"
                    >
                      <span className="font-bold text-slate-800">{c.name}</span>
                      {c.phone && <span className="text-[10px] text-slate-400">{c.phone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Lambar Waya (Phone Number)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="0803..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-700 focus:bg-white rounded-xl text-slate-900 font-semibold focus:outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Dates & Quantities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Ranar Karba (Booked)
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl text-slate-900 font-bold focus:outline-none shadow-2xs text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Ranar Bayarwa (Due Date)
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl text-slate-900 font-bold focus:outline-none shadow-2xs text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Yawan Kaya (Sets)
              </label>
              <input
                type="number"
                min="1"
                value={setsCount}
                onChange={(e) => setSetsCount(parseInt(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl text-slate-900 font-black focus:outline-none shadow-2xs text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Agbada / Babban Riga
              </label>
              <input
                type="number"
                min="0"
                value={agbadaCount}
                onChange={(e) => setAgbadaCount(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl text-slate-900 font-bold focus:outline-none shadow-2xs text-xs"
              />
            </div>
          </div>

          {/* Style & Embroidery Work */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Nau&apos;in Dinki (Style)
              </label>
              <input
                type="text"
                list="style-suggestions"
                value={styleType}
                onChange={(e) => setStyleType(e.target.value)}
                placeholder="e.g. Plain, Royal Kaftan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-700 focus:bg-white rounded-xl text-slate-900 font-bold focus:outline-none shadow-2xs"
              />
              <datalist id="style-suggestions">
                {COMMON_STYLES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Aiki (Embroidery / Work)
              </label>
              <input
                type="text"
                list="work-suggestions"
                value={embroideryWork}
                onChange={(e) => setEmbroideryWork(e.target.value)}
                placeholder="e.g. Plain, Computer, Mono"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-700 focus:bg-white rounded-xl text-slate-900 font-bold focus:outline-none shadow-2xs"
              />
              <datalist id="work-suggestions">
                {COMMON_WORKS.map((w) => (
                  <option key={w} value={w} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Deposit & Total Price & Balance with Quick Calculate */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                    Kudin Ajiya (Deposit)
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-black text-xs text-emerald-800">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-emerald-200 focus:border-emerald-800 rounded-xl text-slate-900 font-black text-sm focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                  Jimillar Kudi (Total Bill)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-black text-xs text-emerald-800">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-emerald-200 focus:border-emerald-800 rounded-xl text-slate-900 font-black text-sm focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                  Ragowar Kudi (Balance)
                </label>
                <div className="px-3 py-1.5 bg-white/90 border border-emerald-200/80 rounded-xl font-black text-sm flex items-center text-amber-700">
                  ₦{balance.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Quick deposit shortcuts */}
            {numTotal > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-emerald-800 font-bold">Quick Ajiya:</span>
                <button
                  type="button"
                  onClick={setDepositHalf}
                  className="px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold text-[10px] hover:bg-emerald-100 transition cursor-pointer"
                >
                  50% (₦{Math.round(numTotal / 2).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={setDepositFull}
                  className="px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold text-[10px] hover:bg-emerald-100 transition cursor-pointer"
                >
                  Full Paid (₦{numTotal.toLocaleString()})
                </button>
              </div>
            )}
          </div>

          {/* Job Status Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Matakin Aiki (Order Status)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('started')}
                className={`py-2 px-2 text-center rounded-xl font-bold border transition cursor-pointer text-xs ${
                  status === 'started' || status === 'in_progress'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ⏳ Ana Dinki (Sewing)
              </button>
              <button
                type="button"
                onClick={() => setStatus('ready')}
                className={`py-2 px-2 text-center rounded-xl font-bold border transition cursor-pointer text-xs ${
                  status === 'ready'
                    ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ✨ Ya Shirya (Ready)
              </button>
              <button
                type="button"
                onClick={() => setStatus('delivered')}
                className={`py-2 px-2 text-center rounded-xl font-bold border transition cursor-pointer text-xs ${
                  status === 'delivered'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ✅ An Karba (Delivered)
              </button>
            </div>
          </div>

          {/* Notes / Special remarks */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Karin Bayani / Shawara (Notes / Fabric details)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Yadukoji fari, button na azurfa, gaggawa ce..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl text-slate-900 font-medium focus:outline-none shadow-2xs text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Record in Ledger'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
