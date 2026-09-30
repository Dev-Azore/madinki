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
  Layers,
  ChevronRight,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Clock,
  Phone,
  ShieldCheck,
  History,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  getMeasurementWizardData,
  recordMeasurement,
  getLatestClientMeasurement,
  ClientOption,
  TemplateOption,
} from '../actions';
import { Button } from '@/components/ui/button';
import { WhatsAppShareButton } from '@/components/measurements/WhatsAppShareButton';

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'CL';
}

function MeasurementWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedClientId = searchParams.get('clientId');
  const preselectedTemplateId = searchParams.get('templateId');

  // Wizard step state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Data lists
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);

  // Step 1 Selections
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Step 2 Form Values & Units
  const [takenAt, setTakenAt] = useState<string>(() => {
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return localIso;
  });
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [activeUnit, setActiveUnit] = useState<'in' | 'cm'>('in');
  const [activeFocusedField, setActiveFocusedField] = useState<string | null>(null);

  // Historical Prefill State
  const [previousFitting, setPreviousFitting] = useState<{
    taken_at?: string;
    fields_snapshot?: Array<{ field_name: string; unit: string | null; value: string }>;
  } | null>(null);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  // Step 3 Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Input refs for keyboard auto-advance
  const fieldInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

          let initialClientId = '';
          let initialTemplateId = '';

          if (preselectedClientId && res.clients.some((c) => c.id === preselectedClientId)) {
            initialClientId = preselectedClientId;
            setSelectedClientId(preselectedClientId);
          }

          if (preselectedTemplateId && res.templates.some((t) => t.id === preselectedTemplateId)) {
            initialTemplateId = preselectedTemplateId;
            setSelectedTemplateId(preselectedTemplateId);
          }

          if (initialClientId && initialTemplateId) {
            setCurrentStep(2);
          }
        }
      } catch {
        if (isMounted) {
          setLoadError('Failed to load customers and styles. Please try again.');
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
  }, [preselectedClientId, preselectedTemplateId]);

  // Active selections
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  // Initialize field values when a template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setFieldValues((prev) => {
        const next: Record<string, string> = {};
        for (const field of selectedTemplate.template_fields) {
          next[field.field_name] = prev[field.field_name] || '';
        }
        return next;
      });
    }
  }, [selectedTemplate]);

  // Check for previous fitting snapshot
  useEffect(() => {
    let isMounted = true;
    if (selectedClientId && selectedTemplateId) {
      setIsLoadingPrevious(true);
      getLatestClientMeasurement(selectedClientId, selectedTemplateId)
        .then((data) => {
          if (isMounted) {
            setPreviousFitting(data);
            setIsLoadingPrevious(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoadingPrevious(false);
        });
    } else {
      setPreviousFitting(null);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedClientId, selectedTemplateId]);

  // Handle prefill from previous fitting
  const handleApplyPreviousFitting = () => {
    if (!previousFitting?.fields_snapshot) return;
    const next: Record<string, string> = { ...fieldValues };
    previousFitting.fields_snapshot.forEach((f) => {
      if (f.value && f.field_name) {
        next[f.field_name] = f.value;
      }
    });
    setFieldValues(next);
    setHasPrefilled(true);
  };

  // Filtered clients for search
  const filteredClients = useMemo(() => {
    const q = clientSearchQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [clients, clientSearchQuery]);

  const handleFieldValueChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Quick Nudge Math Helper (+0.25, +0.5, +1.0, -0.5)
  const handleNudgeValue = (fieldName: string, delta: number) => {
    const current = parseFloat(fieldValues[fieldName] || '0') || 0;
    const nextVal = Math.max(0, current + delta);
    handleFieldValueChange(
      fieldName,
      nextVal === 0 ? '' : nextVal % 1 === 0 ? nextVal.toString() : nextVal.toFixed(1)
    );
  };

  // Progress metrics
  const totalFields = selectedTemplate?.template_fields.length || 0;
  const filledFieldsCount = useMemo(() => {
    return Object.values(fieldValues).filter((v) => v && v.trim().length > 0).length;
  }, [fieldValues]);

  const completionPercent = totalFields > 0 ? Math.round((filledFieldsCount / totalFields) * 100) : 0;

  const hasAtLeastOneFieldFilled = filledFieldsCount > 0;

  // Key navigation (Enter -> next field)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && selectedTemplate) {
      e.preventDefault();
      const nextField = selectedTemplate.template_fields[index + 1];
      if (nextField && fieldInputRefs.current[nextField.field_name]) {
        fieldInputRefs.current[nextField.field_name]?.focus();
      } else {
        handleStep2Next();
      }
    }
  };

  const handleStep1Next = () => {
    if (selectedClientId && selectedTemplateId) {
      setSubmitError(null);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStep2Next = () => {
    if (!hasAtLeastOneFieldFilled) {
      setSubmitError('Please enter at least one measurement point to continue.');
      return;
    }
    setSubmitError(null);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMeasurement = async () => {
    if (!selectedClientId || !selectedTemplateId || !selectedTemplate) {
      setSubmitError('Customer or garment style selection is missing.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formattedFieldValues = selectedTemplate.template_fields.map((tf) => ({
        field_name: tf.field_name,
        unit: tf.unit || activeUnit,
        value: (fieldValues[tf.field_name] || '').trim(),
      }));

      const res = await recordMeasurement({
        client_id: selectedClientId,
        template_id: selectedTemplateId,
        taken_at: takenAt ? new Date(takenAt).toISOString() : new Date().toISOString(),
        field_values: formattedFieldValues,
      });

      if (res.error) {
        setSubmitError(res.error);
        setIsSubmitting(false);
      } else {
        router.push(`/clients/${selectedClientId}`);
        router.refresh();
      }
    } catch {
      setSubmitError('A network error occurred while saving. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4 max-w-xl mx-auto">
        <Loader2 className="w-10 h-10 animate-spin text-[#81c784]" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto space-y-4 py-8">
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-100 rounded-xl text-xs font-semibold transition cursor-pointer"
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
    <div className="space-y-6 max-w-3xl mx-auto pb-16 animate-fade-in-up">
      {/* Top Header & Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href={selectedClientId ? `/clients/${selectedClientId}` : '/dashboard'}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#2e7d32]/50 text-slate-600 hover:text-[#0B2545] rounded-xl transition cursor-pointer text-xs font-semibold shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{selectedClientId ? 'Back to Customer' : 'Dashboard'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#1b5e20] rounded-full uppercase tracking-wider">
              Step {currentStep} of 3
            </span>
          </div>
        </div>

        {/* Wizard Stepper Bar */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 text-xs font-bold transition cursor-pointer ${
                currentStep >= 1 ? 'text-[#1b5e20]' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                  currentStep > 1
                    ? 'bg-[#2e7d32] text-white border-[#2e7d32] shadow-xs'
                    : currentStep === 1
                    ? 'bg-emerald-50 text-[#1b5e20] border-[#2e7d32]'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="hidden sm:inline">1. Customer & Style</span>
            </button>

            <div
              className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                currentStep >= 2 ? 'bg-[#2e7d32]' : 'bg-slate-200'
              }`}
            />

            {/* Step 2 */}
            <button
              type="button"
              disabled={!selectedClientId || !selectedTemplateId}
              onClick={() => {
                if (selectedClientId && selectedTemplateId) setCurrentStep(2);
              }}
              className={`flex items-center gap-2 text-xs font-bold transition ${
                selectedClientId && selectedTemplateId
                  ? 'cursor-pointer text-[#1b5e20]'
                  : 'opacity-50 cursor-not-allowed text-slate-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                  currentStep > 2
                    ? 'bg-[#2e7d32] text-white border-[#2e7d32] shadow-xs'
                    : currentStep === 2
                    ? 'bg-emerald-50 text-[#1b5e20] border-[#2e7d32]'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="hidden sm:inline">2. Record Sizes</span>
            </button>

            <div
              className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                currentStep === 3 ? 'bg-[#2e7d32]' : 'bg-slate-200'
              }`}
            />

            {/* Step 3 */}
            <button
              type="button"
              disabled={!selectedClientId || !selectedTemplateId || !hasAtLeastOneFieldFilled}
              onClick={() => {
                if (selectedClientId && selectedTemplateId && hasAtLeastOneFieldFilled) {
                  setCurrentStep(3);
                }
              }}
              className={`flex items-center gap-2 text-xs font-bold transition ${
                selectedClientId && selectedTemplateId && hasAtLeastOneFieldFilled
                  ? 'cursor-pointer text-[#1b5e20]'
                  : 'opacity-50 cursor-not-allowed text-slate-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                  currentStep === 3
                    ? 'bg-emerald-50 text-[#1b5e20] border-[#2e7d32]'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">3. Review & Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submit / Validation Banner */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 animate-fade-in-up">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{submitError}</div>
        </div>
      )}

      {/* STEP 1: SELECT CUSTOMER & STYLE */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Customer Selection Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center border border-emerald-200">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0B2545]">1. Select Customer</h2>
                  <p className="text-xs text-slate-500">Choose who you are fitting today</p>
                </div>
              </div>

              <Link
                href="/clients/new"
                className="inline-flex items-center gap-1.5 text-xs text-[#1b5e20] hover:underline font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Customer</span>
              </Link>
            </div>

            {/* Customer Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                placeholder="Search customer by name or phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none shadow-xs transition"
              />
            </div>

            {/* Customer List */}
            {clients.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3">
                <p className="text-sm text-slate-600">No customers registered yet.</p>
                <Link href="/clients/new">
                  <Button className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create First Customer
                  </Button>
                </Link>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                No customer found matching &ldquo;{clientSearchQuery}&rdquo;
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {filteredClients.map((client) => {
                  const isSelected = selectedClientId === client.id;
                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setSubmitError(null);
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-[#2e7d32] text-slate-900 shadow-sm ring-1 ring-[#2e7d32]'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                            isSelected
                              ? 'bg-[#2e7d32] text-white'
                              : 'bg-emerald-50 text-[#1b5e20] border border-emerald-200'
                          }`}
                        >
                          {getInitials(client.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate text-[#0B2545]">{client.name}</p>
                          {client.phone && (
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[#2e7d32]" />
                              {client.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#2e7d32] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Garment Style / Template Selection Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center border border-emerald-200">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0B2545]">2. Select Garment Style</h2>
                  <p className="text-xs text-slate-500">Which clothing style are you measuring?</p>
                </div>
              </div>

              <Link
                href="/templates/new"
                className="inline-flex items-center gap-1.5 text-xs text-[#1b5e20] hover:underline font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Style Template</span>
              </Link>
            </div>

            {/* Template List */}
            {templates.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3">
                <p className="text-sm text-slate-600">No measurement templates created yet.</p>
                <Link href="/templates/new">
                  <Button className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create First Template
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setSubmitError(null);
                      }}
                      className={`flex flex-col p-4 rounded-2xl border text-left transition cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-[#2e7d32] text-slate-900 shadow-sm ring-1 ring-[#2e7d32]'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#0B2545]">{tpl.name}</span>
                          {tpl.is_global && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                              Global
                            </span>
                          )}
                        </div>
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-[#2e7d32] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <span className="text-[11px] px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-[#1b5e20] rounded-full font-bold">
                            {tpl.template_fields.length}{' '}
                            {tpl.template_fields.length === 1 ? 'point' : 'points'}
                          </span>
                        )}
                      </div>

                      {/* Field Tags Preview */}
                      <div className="flex flex-wrap gap-1">
                        {tpl.template_fields.slice(0, 4).map((f) => (
                          <span
                            key={f.id}
                            className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-200"
                          >
                            {f.field_name}
                          </span>
                        ))}
                        {tpl.template_fields.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-bold px-1 py-0.5">
                            +{tpl.template_fields.length - 4} more
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end pt-2">
            <Button
              type="button"
              disabled={!selectedClientId || !selectedTemplateId}
              onClick={handleStep1Next}
              className="bg-gradient-to-r from-[#2e7d32] to-[#388e3c] hover:from-[#1b5e20] hover:to-[#2e7d32] text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-[#2e7d32]/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Next: Record Sizes</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: ENTER MEASUREMENT SIZES */}
      {currentStep === 2 && selectedTemplate && selectedClient && (
        <div className="space-y-6">
          {/* Active Context Banner */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1b5e20] border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0 font-mono shadow-xs">
                {getInitials(selectedClient.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-[#0B2545]">{selectedClient.name}</p>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-[#1b5e20] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    {selectedTemplate.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTemplate.template_fields.length} points to measure
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-slate-500 hover:text-[#0B2545] underline font-semibold self-start sm:self-auto cursor-pointer"
            >
              Change customer or style
            </button>
          </div>

          {/* Historical Pre-Fill Suggestion */}
          {previousFitting && !hasPrefilled && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-[#1b5e20] shrink-0" />
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-[#0B2545]">Previous fitting found for this customer</p>
                  <p className="text-slate-500">
                    Recorded on {previousFitting.taken_at ? new Date(previousFitting.taken_at).toLocaleDateString('en-GB') : 'prior visit'}.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleApplyPreviousFitting}
                className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold text-xs self-start sm:self-auto shrink-0 shadow-xs"
              >
                <History className="w-3.5 h-3.5 mr-1" />
                Pre-fill from Last Fitting
              </Button>
            </div>
          )}

          {/* Tools & Progress Bar */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Progress Count */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0B2545]">Fitting Progress</span>
                  <span className="text-xs font-mono font-bold text-[#1b5e20]">
                    {filledFieldsCount} / {totalFields} points ({completionPercent}%)
                  </span>
                </div>
                <div className="w-full sm:w-64 h-2 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-[#2e7d32] to-[#4caf50] transition-all duration-300 rounded-full"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              {/* Unit Toggle & Fitting Date */}
              <div className="flex items-center gap-3">
                {/* Unit Switcher */}
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveUnit('in')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeUnit === 'in'
                        ? 'bg-[#2e7d32] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#0B2545]'
                    }`}
                  >
                    Inches (in)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveUnit('cm')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeUnit === 'cm'
                        ? 'bg-[#2e7d32] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#0B2545]'
                    }`}
                  >
                    Centimeters (cm)
                  </button>
                </div>
              </div>
            </div>

            {/* Fitting Date / Time */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2e7d32]" />
                <span>Session Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl text-xs text-slate-900 outline-none transition font-medium shadow-xs"
              />
            </div>
          </div>

          {/* Body Measurements Entry Sheet */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0B2545] flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#1b5e20]" />
                  <span>Enter Measurement Values</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tap numeric chips or type exact sizes. Press [Enter] to jump to next field.
                </p>
              </div>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {selectedTemplate.template_fields.map((field, idx) => {
                const val = fieldValues[field.field_name] || '';
                const isFocused = activeFocusedField === field.field_name;
                const fieldUnit = field.unit || activeUnit;

                return (
                  <div
                    key={field.id}
                    className={`p-4 bg-slate-50 border rounded-2xl space-y-2.5 transition-all ${
                      isFocused
                        ? 'border-[#2e7d32] ring-2 ring-[#2e7d32]/20 bg-white shadow-sm'
                        : val
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="text-[11px] text-[#1b5e20] font-mono font-bold">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold">{field.field_name}</span>
                      </label>
                      <span className="text-[11px] font-bold text-[#1b5e20] px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                        {fieldUnit}
                      </span>
                    </div>

                    {/* Numeric Input & Quick Clear */}
                    <div className="relative flex items-center bg-white border border-slate-300 rounded-xl px-3 py-1 shadow-xs">
                      <input
                        ref={(el) => {
                          fieldInputRefs.current[field.field_name] = el;
                        }}
                        type="text"
                        inputMode="decimal"
                        value={val}
                        onFocus={() => setActiveFocusedField(field.field_name)}
                        onBlur={() => setActiveFocusedField(null)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onChange={(e) => handleFieldValueChange(field.field_name, e.target.value)}
                        placeholder="0.0"
                        className="w-full text-lg sm:text-xl font-mono font-black py-1.5 bg-transparent text-[#0B2545] placeholder-slate-400 outline-none"
                      />
                      {val && (
                        <button
                          type="button"
                          onClick={() => handleFieldValueChange(field.field_name, '')}
                          className="text-xs text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                          title="Clear field"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Fast Nudge Chips (+0.5, +1.0, -0.5) */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                        Quick:
                      </span>
                      {[
                        { label: '+0.5', delta: 0.5 },
                        { label: '+1.0', delta: 1.0 },
                        { label: '+2.0', delta: 2.0 },
                        { label: '-0.5', delta: -0.5 },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleNudgeValue(field.field_name, chip.delta)}
                          className="text-[11px] font-mono font-bold px-2 py-0.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-[#1b5e20] rounded-md transition cursor-pointer active:scale-95 shadow-xs"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Back to Selection</span>
            </Button>

            <Button
              type="button"
              onClick={handleStep2Next}
              className="bg-gradient-to-r from-[#2e7d32] to-[#388e3c] hover:from-[#1b5e20] hover:to-[#2e7d32] text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-[#2e7d32]/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Review & Save</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & SAVE */}
      {currentStep === 3 && selectedTemplate && selectedClient && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0B2545]">3. Review & Confirm</h2>
                <p className="text-xs text-slate-500">
                  Check all sizes carefully before saving the record.
                </p>
              </div>
            </div>

            {/* Context Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#1b5e20]" />
                  Customer
                </p>
                <p className="text-sm font-bold text-[#0B2545] truncate">{selectedClient.name}</p>
                {selectedClient.phone && (
                  <p className="text-xs text-slate-500">{selectedClient.phone}</p>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#1b5e20]" />
                  Garment Style
                </p>
                <p className="text-sm font-bold text-[#0B2545] truncate">{selectedTemplate.name}</p>
                <p className="text-xs text-slate-500">
                  {filledFieldsCount} of {selectedTemplate.template_fields.length} points recorded
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#1b5e20]" />
                  Fitting Timestamp
                </p>
                <p className="text-sm font-bold text-[#0B2545] truncate">
                  {takenAt ? new Date(takenAt).toLocaleDateString('en-GB') : 'Today'}
                </p>
                <p className="text-xs text-slate-500">
                  {takenAt ? new Date(takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Measurements Table Review */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Measurement Summary
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {selectedTemplate.template_fields.map((tf, index) => {
                const val = fieldValues[tf.field_name] || '';
                const hasValue = val.trim().length > 0;
                const fieldUnit = tf.unit || activeUnit;

                return (
                  <div
                    key={tf.id}
                    className="flex items-center justify-between p-3.5 text-xs sm:text-sm hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-slate-400 w-5">
                        {index + 1}.
                      </span>
                      <span className="font-bold text-[#0B2545]">{tf.field_name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasValue ? (
                        <div className="flex items-center gap-1.5 font-mono font-black text-[#1b5e20] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                          <span>{val}</span>
                          <span className="text-xs font-semibold text-[#1b5e20]">{fieldUnit}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Not recorded</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safe Record Notice */}
          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-start gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#1b5e20] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-[#0B2545]">Safe Record:</strong> Once saved,
              this measurement will be permanently added to{' '}
              <strong className="text-[#0B2545]">{selectedClient.name}</strong>&rsquo;s fitting history and cannot be changed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setCurrentStep(2)}
              className="text-xs order-2 sm:order-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Back to Edit Sizes</span>
            </Button>

            <div className="flex items-center gap-2.5 order-1 sm:order-2">
              <WhatsAppShareButton
                data={{
                  clientName: selectedClient.name,
                  clientPhone: selectedClient.phone,
                  templateName: selectedTemplate.name,
                  takenAt: takenAt,
                  fields: selectedTemplate.template_fields.map((tf) => ({
                    field_name: tf.field_name,
                    unit: tf.unit || activeUnit,
                    value: (fieldValues[tf.field_name] || '').trim(),
                  })),
                }}
              />

              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveMeasurement}
                className="bg-gradient-to-r from-[#2e7d32] to-[#388e3c] hover:from-[#1b5e20] hover:to-[#2e7d32] active:scale-95 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-[#2e7d32]/25 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Record</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MeasurementNewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4 max-w-xl mx-auto">
          <Loader2 className="w-10 h-10 animate-spin text-[#81c784]" />
          <p className="text-sm font-medium">Loading...</p>
        </div>
      }
    >
      <MeasurementWizard />
    </Suspense>
  );
}
