'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Ruler,
  Search,
  Check,
  Calendar,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Phone,
  Trash2,
  Scissors,
  Save,
  UserPlus,
  ChevronDown,
} from 'lucide-react';
import {
  getMeasurementWizardData,
  recordMeasurement,
  ClientOption,
  TemplateOption,
} from '../actions';
import { Button } from '@/components/ui/button';

interface MeasurementPointRow {
  id: string;
  field_name: string;
  value: string;
  unit: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'CU';
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function MeasurementSheetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedClientId = searchParams.get('clientId');

  // Loading & Data State
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);

  // Customer State
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Sheet Settings
  const [styleName, setStyleName] = useState('Standard Fitting');
  const [globalUnit, setGlobalUnit] = useState<'in' | 'cm'>('in');
  const [takenAt, setTakenAt] = useState<string>(() => {
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return localIso;
  });

  // Dynamic Measurement Rows — Starts with clean blank rows for tailor to enter freshly
  const [measurementRows, setMeasurementRows] = useState<MeasurementPointRow[]>([
    { id: generateId(), field_name: '', value: '', unit: 'in' },
    { id: generateId(), field_name: '', value: '', unit: 'in' },
    { id: generateId(), field_name: '', value: '', unit: 'in' },
  ]);

  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [activeFocusedRowId, setActiveFocusedRowId] = useState<string | null>(null);

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const valueInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const nameInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load initial data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const res = await getMeasurementWizardData();
        if (!isMounted) return;

        if (res.error) {
          setLoadError(res.error);
        } else {
          setClients(res.clients);
          setTemplates(res.templates);

          if (preselectedClientId && res.clients.some((c) => c.id === preselectedClientId)) {
            setSelectedClientId(preselectedClientId);
            setCustomerMode('existing');
          } else if (res.clients.length === 0) {
            setCustomerMode('new');
          } else {
            // Default to first customer if available
            if (!preselectedClientId && res.clients.length > 0) {
              setSelectedClientId(res.clients[0].id);
            }
          }
        }
      } catch {
        if (isMounted) {
          setLoadError('Failed to load customer records. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [preselectedClientId]);

  // Selected client object
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  // Filtered clients list
  const filteredClients = useMemo(() => {
    const q = clientSearchQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [clients, clientSearchQuery]);

  // Unit switch handler for all rows
  const handleUnitChange = (newUnit: 'in' | 'cm') => {
    setGlobalUnit(newUnit);
    setMeasurementRows((prev) =>
      prev.map((r) => ({
        ...r,
        unit: newUnit,
      }))
    );
  };

  // Row update handlers
  const handleUpdateRowFieldName = (rowId: string, newName: string) => {
    setMeasurementRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, field_name: newName } : r))
    );
  };

  const handleUpdateRowValue = (rowId: string, newValue: string) => {
    setMeasurementRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, value: newValue } : r))
    );
  };

  const handleNudgeValue = (rowId: string, delta: number) => {
    const row = measurementRows.find((r) => r.id === rowId);
    if (!row) return;
    const current = parseFloat(row.value || '0') || 0;
    const nextVal = Math.max(0, current + delta);
    handleUpdateRowValue(
      rowId,
      nextVal === 0 ? '' : nextVal % 1 === 0 ? nextVal.toString() : nextVal.toFixed(1)
    );
  };

  const handleAddRow = () => {
    const newRow: MeasurementPointRow = {
      id: generateId(),
      field_name: '',
      value: '',
      unit: globalUnit,
    };
    setMeasurementRows((prev) => [...prev, newRow]);
    setTimeout(() => {
      nameInputRefs.current[newRow.id]?.focus();
    }, 50);
  };

  const handleDeleteRow = (rowId: string) => {
    if (measurementRows.length <= 1) {
      setMeasurementRows([{ id: generateId(), field_name: '', value: '', unit: globalUnit }]);
      return;
    }
    setSubmitError(null);
    setMeasurementRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  // Key navigation between rows (Enter -> next row)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextRow = measurementRows[index + 1];
      if (nextRow && nameInputRefs.current[nextRow.id]) {
        nameInputRefs.current[nextRow.id]?.focus();
      } else {
        handleAddRow();
      }
    }
  };

  // Progress calculations
  const filledPointsCount = useMemo(() => {
    return measurementRows.filter((r) => r.value && r.value.trim().length > 0).length;
  }, [measurementRows]);

  // Save measurement handler
  const handleSave = async () => {
    setSubmitError(null);

    // Validate Customer
    if (customerMode === 'existing' && !selectedClientId) {
      setSubmitError('Please select a customer.');
      return;
    }

    if (customerMode === 'new' && (!newClientName || newClientName.trim().length === 0)) {
      setSubmitError('Please enter the customer full name.');
      return;
    }

    // Validate points
    const validPoints = measurementRows
      .filter((r) => r.field_name && r.field_name.trim().length > 0)
      .map((r) => ({
        field_name: r.field_name.trim(),
        unit: r.unit || globalUnit,
        value: (r.value || '').trim(),
      }));

    if (validPoints.length === 0) {
      setSubmitError('Please enter at least one measurement point name (e.g. Shoulder, Length, Chest...).');
      return;
    }

    const hasAtLeastOneValue = validPoints.some((p) => p.value.length > 0);
    if (!hasAtLeastOneValue) {
      setSubmitError('Please enter at least one measurement size number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await recordMeasurement({
        client_id: customerMode === 'existing' ? selectedClientId : undefined,
        new_client_name: customerMode === 'new' ? newClientName.trim() : undefined,
        new_client_phone: customerMode === 'new' && newClientPhone ? newClientPhone.trim() : undefined,
        style_name: styleName || 'Standard Fitting',
        save_as_default_points: saveAsDefault,
        taken_at: takenAt ? new Date(takenAt).toISOString() : new Date().toISOString(),
        field_values: validPoints,
      });

      if (res.error) {
        setSubmitError(res.error);
        setIsSubmitting(false);
      } else if (res.data?.client_id) {
        router.push(`/clients/${res.data.client_id}`);
        router.refresh();
      } else {
        router.push('/clients');
        router.refresh();
      }
    } catch {
      setSubmitError('A network error occurred while saving. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4 max-w-xl mx-auto">
        <Loader2 className="w-10 h-10 animate-spin text-[#1b5e20]" />
        <p className="text-sm font-medium">Opening measurement pad...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto space-y-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-16 animate-fade-in-up">
      {/* ── Top Header Navigation ── */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={selectedClientId ? `/clients/${selectedClientId}` : '/dashboard'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-slate-900 rounded-xl transition cursor-pointer text-xs font-bold shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#1b5e20]" />
          <span>{selectedClientId ? 'Back to Customer' : 'Dashboard'}</span>
        </Link>

        {/* Global Unit Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleUnitChange('in')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                globalUnit === 'in'
                  ? 'bg-[#1b5e20] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inches (in)
            </button>
            <button
              type="button"
              onClick={() => handleUnitChange('cm')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                globalUnit === 'cm'
                  ? 'bg-[#1b5e20] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              cm
            </button>
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {submitError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-700 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs font-bold leading-relaxed">{submitError}</div>
        </div>
      )}

      {/* ── CUSTOMER & OUTFIT HEADER ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Customer Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-[#1b5e20] border border-emerald-200/90 flex items-center justify-center font-black text-xs font-mono shrink-0 shadow-2xs">
              {customerMode === 'existing' && selectedClient
                ? getInitials(selectedClient.name)
                : customerMode === 'new' && newClientName.trim()
                ? getInitials(newClientName)
                : 'CU'}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Customer
              </span>
              {customerMode === 'existing' ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                    className="flex items-center justify-between w-full text-left font-black text-slate-900 text-sm sm:text-base hover:text-[#1b5e20] transition group cursor-pointer"
                  >
                    <span className="truncate">
                      {selectedClient ? selectedClient.name : 'Select customer...'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 ml-1" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => {
                    setNewClientName(e.target.value);
                    setSubmitError(null);
                  }}
                  placeholder="Type customer name..."
                  className="w-full font-black text-slate-900 text-sm sm:text-base bg-transparent border-b border-slate-300 focus:border-[#1b5e20] outline-none placeholder:text-slate-400 placeholder:font-normal"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {customerMode === 'existing' ? (
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('new');
                  setIsCustomerDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1b5e20] border border-emerald-200/90 text-xs font-black transition cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ New Customer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <span>Pick Existing</span>
              </button>
            )}
          </div>
        </div>

        {/* Existing Customer Dropdown Search */}
        {customerMode === 'existing' && isCustomerDropdownOpen && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-fade-in shadow-inner">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#1b5e20]"
                autoFocus
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {filteredClients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setIsCustomerDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                    selectedClientId === c.id
                      ? 'bg-[#1b5e20] text-white font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {c.phone && (
                    <span className={`text-[10px] font-mono ${selectedClientId === c.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {c.phone}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New Customer Phone (if mode is new) */}
        {customerMode === 'new' && (
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Phone Number (for WhatsApp size slip)
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                placeholder="e.g. 0803 123 4567"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#1b5e20] focus:bg-white rounded-xl text-xs text-slate-900 outline-none font-medium"
              />
            </div>
          </div>
        )}

        {/* Outfit Name & Session Date */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Outfit Style
            </span>
            <input
              type="text"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              placeholder="e.g. Kaftan, Senator, Gown..."
              className="w-full text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#1b5e20] outline-none py-0.5 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#1b5e20]" />
            <input
              type="datetime-local"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ── THE MEASUREMENT PAD (Ledger Table) ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#1b5e20]" />
            <h3 className="text-sm font-black text-slate-900">
              Measurement Points
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#1b5e20] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            {filledPointsCount} filled
          </span>
        </div>

        {/* Live Measurement Rows */}
        <div className="divide-y divide-slate-100">
          {measurementRows.map((row, index) => {
            const isFocused = activeFocusedRowId === row.id;

            return (
              <div
                key={row.id}
                className={`py-2.5 px-1 flex items-center justify-between gap-2 transition-colors ${
                  isFocused ? 'bg-emerald-50/50 rounded-xl px-2' : ''
                }`}
              >
                {/* Row Number & Point Name Input */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <input
                    ref={(el) => {
                      nameInputRefs.current[row.id] = el;
                    }}
                    type="text"
                    value={row.field_name}
                    onChange={(e) => handleUpdateRowFieldName(row.id, e.target.value)}
                    onFocus={() => setActiveFocusedRowId(row.id)}
                    onBlur={() => setActiveFocusedRowId(null)}
                    placeholder="Type body point (e.g. Shoulder, Chest, Length...)"
                    className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-none focus:outline-none placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>

                {/* Number Input & Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Quick Nudges on Desktop/Tablet */}
                  <div className="hidden xs:flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleNudgeValue(row.id, -0.5)}
                      className="w-6 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-bold flex items-center justify-center transition cursor-pointer"
                      title="-0.5"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudgeValue(row.id, 0.5)}
                      className="w-6 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-bold flex items-center justify-center transition cursor-pointer"
                      title="+0.5"
                    >
                      +
                    </button>
                  </div>

                  {/* Value Input */}
                  <div className="relative">
                    <input
                      ref={(el) => {
                        valueInputRefs.current[row.id] = el;
                      }}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={row.value}
                      onFocus={() => setActiveFocusedRowId(row.id)}
                      onBlur={() => setActiveFocusedRowId(null)}
                      onChange={(e) => handleUpdateRowValue(row.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="0.0"
                      className="w-20 sm:w-24 pl-2 pr-6 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#1b5e20] focus:bg-white rounded-xl text-sm font-black text-slate-900 font-mono text-right outline-none transition"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none font-mono">
                      {row.unit || globalUnit}
                    </span>
                  </div>

                  {/* Delete Row */}
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(row.id)}
                    className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                    title="Remove line"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Another Line Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-dashed border-emerald-300 text-[#1b5e20] text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Measurement Line</span>
          </button>
        </div>
      </div>

      {/* ── AUTO-SAVE & SUBMIT ── */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-xs">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveAsDefault}
            onChange={(e) => setSaveAsDefault(e.target.checked)}
            className="w-4 h-4 text-[#1b5e20] focus:ring-[#1b5e20] rounded border-slate-300 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-700">
            Remember my measurement points for future customers
          </span>
        </label>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            href={selectedClientId ? `/clients/${selectedClientId}` : '/dashboard'}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl transition"
          >
            Cancel
          </Link>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="bg-gradient-to-r from-[#1b5e20] via-[#17521c] to-[#113f15] hover:from-[#144818] hover:to-[#0e3310] text-white font-black py-3 px-7 rounded-2xl shadow-md shadow-emerald-950/15 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Measurement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Measurement</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewMeasurementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4 max-w-xl mx-auto">
          <Loader2 className="w-10 h-10 animate-spin text-[#1b5e20]" />
          <p className="text-sm font-medium">Opening measurement pad...</p>
        </div>
      }
    >
      <MeasurementSheetContent />
    </Suspense>
  );
}
