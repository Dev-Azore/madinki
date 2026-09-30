'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Scissors,
  Check,
  Layers,
  ShieldCheck,
  RefreshCw,
  Send,
  Phone,
  Ruler,
  CheckCircle2,
  Lock,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

type GarmentPreset = 'kaftan_male' | 'female_gown' | 'babban_riga';

interface PresetData {
  title: string;
  category: string;
  description: string;
  defaultClient: string;
  defaultPhone: string;
  fields: { name: string; shortName: string; defaultVal: string; placeholder: string }[];
}

const NIGERIAN_PRESETS: Record<GarmentPreset, PresetData> = {
  kaftan_male: {
    title: 'Royal Kaftan (Male)',
    category: 'Northern Bespoke Menswear',
    description: 'Custom shirt length, shoulder width, chest circumference, sleeves, and trousers (Sokoto).',
    defaultClient: 'Alhaji Faisal Abubakar',
    defaultPhone: '0803 123 4567',
    fields: [
      { name: 'Tsawon Riga (Shirt Length)', shortName: 'Shirt Length', defaultVal: '38.5', placeholder: '38.5' },
      { name: 'Fadin Kafada (Shoulder)', shortName: 'Shoulder', defaultVal: '18.5', placeholder: '18.5' },
      { name: 'Kirji (Chest)', shortName: 'Chest', defaultVal: '41.0', placeholder: '41.0' },
      { name: 'Tsawon Hannu (Sleeve)', shortName: 'Sleeve', defaultVal: '25.0', placeholder: '25.0' },
      { name: 'Kewaye Wando (Waist)', shortName: 'Waist', defaultVal: '34.0', placeholder: '34.0' },
      { name: 'Tsawon Wando (Trouser)', shortName: 'Trouser', defaultVal: '41.5', placeholder: '41.5' },
    ],
  },
  female_gown: {
    title: 'Female Gown / Abaya / Skirt',
    category: 'Bespoke Womenswear & Gowns',
    description: 'Precision fits for luxury Abayas, fitted gowns, corset seams, and 6-piece skirts.',
    defaultClient: 'Hajiya Fatima Bello',
    defaultPhone: '0809 555 1234',
    fields: [
      { name: 'Kirji (Bust Circumference)', shortName: 'Bust', defaultVal: '37.0', placeholder: '37.0' },
      { name: 'Karkashin Kirji (Underbust)', shortName: 'Underbust', defaultVal: '30.5', placeholder: '30.5' },
      { name: 'Kunkuru (Waist)', shortName: 'Waist', defaultVal: '29.0', placeholder: '29.0' },
      { name: 'Kugu (Full Hip)', shortName: 'Hip', defaultVal: '42.0', placeholder: '42.0' },
      { name: 'Tsawon Riga (Abaya Length)', shortName: 'Abaya Length', defaultVal: '59.0', placeholder: '59.0' },
      { name: 'Tsawon Hannu (Sleeve)', shortName: 'Sleeve', defaultVal: '23.5', placeholder: '23.5' },
    ],
  },
  babban_riga: {
    title: 'Babban Riga 3-Piece Set',
    category: 'Traditional Grand Menswear',
    description: '3-piece traditional wear: Outer Babban Riga robe, Inner Buba shirt, and Sokoto trousers.',
    defaultClient: 'Malam Umar Rufa\'i',
    defaultPhone: '0802 987 6543',
    fields: [
      { name: 'Tsawon Robe (Outer Length)', shortName: 'Robe Length', defaultVal: '58.0', placeholder: '58.0' },
      { name: 'Fadin Hannu (Wing Span)', shortName: 'Wing Span', defaultVal: '66.0', placeholder: '66.0' },
      { name: 'Kirjin Buba (Inner Shirt Chest)', shortName: 'Inner Chest', defaultVal: '44.5', placeholder: '44.5' },
      { name: 'Tsawon Buba (Inner Length)', shortName: 'Inner Length', defaultVal: '38.0', placeholder: '38.0' },
      { name: 'Tsawon Wando (Trouser Length)', shortName: 'Trouser', defaultVal: '42.0', placeholder: '42.0' },
      { name: 'Wuyan Riga (Neck Width)', shortName: 'Neck Width', defaultVal: '16.5', placeholder: '16.5' },
    ],
  },
};

export function InteractiveDemo() {
  const [activePreset, setActivePreset] = useState<GarmentPreset>('kaftan_male');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [clientName, setClientName] = useState(NIGERIAN_PRESETS.kaftan_male.defaultClient);
  const [clientPhone, setClientPhone] = useState(NIGERIAN_PRESETS.kaftan_male.defaultPhone);
  const [outputTab, setOutputTab] = useState<'whatsapp' | 'ticket'>('whatsapp');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    NIGERIAN_PRESETS.kaftan_male.fields.forEach((f) => {
      initial[f.name] = f.defaultVal;
    });
    return initial;
  });

  const handlePresetChange = (preset: GarmentPreset) => {
    setActivePreset(preset);
    setClientName(NIGERIAN_PRESETS[preset].defaultClient);
    setClientPhone(NIGERIAN_PRESETS[preset].defaultPhone);
    const initial: Record<string, string> = {};
    NIGERIAN_PRESETS[preset].fields.forEach((f) => {
      initial[f.name] = f.defaultVal;
    });
    setFieldValues(initial);
    setIsSaved(false);
    setCopied(false);
  };

  const handleFieldChange = (name: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: val }));
    setIsSaved(false);
  };

  const handleAdjustValue = (name: string, delta: number) => {
    const currentVal = parseFloat(fieldValues[name] || '0') || 0;
    const newVal = Math.max(0, currentVal + delta).toFixed(1);
    setFieldValues((prev) => ({ ...prev, [name]: newVal }));
    setIsSaved(false);
  };

  const handleSimulateSave = () => {
    setIsSaved(true);
  };

  const handleCopyWhatsAppText = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const current = NIGERIAN_PRESETS[activePreset];

  return (
    <section id="demo" className="py-20 sm:py-28 relative overflow-hidden bg-[#f6f8fa] border-y border-slate-200">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-slate-200/60 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── Section Header with Guided Explanation ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-200 text-[#1b5e20] text-xs font-bold uppercase tracking-wider shadow-xs">
            <Ruler className="w-3.5 h-3.5" />
            <span>Interactive Tailor Workbench • Test-Drive Live</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            See How 1-Tap Fitting Works.{' '}
            <span className="bg-gradient-to-r from-[#1b5e20] via-[#2e7d32] to-[#388e3c] bg-clip-text text-transparent">
              Live in Your Browser.
            </span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed">
            Experience how quickly measurements are typed, calculated, and transformed into instant client WhatsApp slips and permanent fitting tickets.
          </p>

          {/* 3 Psychological Step Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left max-w-2xl mx-auto">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#1b5e20] font-black text-xs flex items-center justify-center border border-emerald-200">1</span>
              <span className="text-xs font-bold text-slate-800">Pick Garment Style</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#1b5e20] font-black text-xs flex items-center justify-center border border-emerald-200">2</span>
              <span className="text-xs font-bold text-slate-800">Tweak Sizes with Stepper</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-[#1b5e20] font-black text-xs flex items-center justify-center border border-emerald-200">3</span>
              <span className="text-xs font-bold text-slate-800">Deliver WhatsApp Slip</span>
            </div>
          </div>
        </div>

        {/* ── Garment Style Selector Pills ── */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-10">
          {(
            [
              { key: 'kaftan_male', label: '1. Royal Kaftan (Male)' },
              { key: 'female_gown', label: '2. Female Gown / Abaya' },
              { key: 'babban_riga', label: '3. Babban Riga 3-Piece' },
            ] as const
          ).map((item) => {
            const isActive = activePreset === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handlePresetChange(item.key)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-[#1b5e20] text-white shadow-md shadow-emerald-950/15 scale-105 ring-2 ring-emerald-400/20'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90 shadow-xs hover:scale-102'
                }`}
              >
                <Scissors className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1b5e20]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Main Interactive Split Workbench ── */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden">
          {/* Top Workbench Status Bar */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b5e20] animate-pulse" />
              <span className="text-xs font-black text-slate-800 tracking-tight">
                Live Studio Simulator • {current.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Active Unit:</span>
              <div className="flex items-center p-1 bg-slate-200/70 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUnit('in')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    unit === 'in'
                      ? 'bg-white text-[#1b5e20] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Inches (&quot;)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    unit === 'cm'
                      ? 'bg-white text-[#1b5e20] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CM
                </button>
              </div>
            </div>
          </div>

          {/* Split 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* ── LEFT COLUMN: Interactive Input Desk ── */}
            <div className="lg:col-span-7 p-5 sm:p-7 space-y-5 bg-white">
              {/* Customer Info Card */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Customer Details</span>
                  <span className="text-[11px] font-semibold text-[#1b5e20] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Private Tenant Vault
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Customer Full Name:
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none transition shadow-xs"
                      placeholder="e.g. Alhaji Faisal Abubakar"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Phone (WhatsApp Enabled):
                    </label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none transition shadow-xs"
                      placeholder="e.g. 0803 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Measurement Fields Grid with + / - Interactive Adjusters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Measurement Points ({current.fields.length})
                  </div>
                  <span className="text-[11px] text-[#1b5e20] font-semibold">
                    💡 Click + / - to see live slip update
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {current.fields.map((field) => (
                    <div
                      key={field.name}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-xs flex items-center justify-between gap-2 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-slate-700 truncate group-hover:text-[#1b5e20] transition-colors" title={field.name}>
                          {field.name}
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <input
                            type="text"
                            value={fieldValues[field.name] ?? ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-16 bg-transparent text-lg font-black text-slate-900 font-mono focus:outline-none"
                            placeholder={field.placeholder}
                          />
                          <span className="text-xs font-bold text-[#1b5e20] font-mono">
                            {unit}
                          </span>
                        </div>
                      </div>

                      {/* Quick Steppers (+ / - 0.5 inches) */}
                      <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleAdjustValue(field.name, -0.5)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                          title="Subtract 0.5 inches"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustValue(field.name, 0.5)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-[#1b5e20] flex items-center justify-center text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                          title="Add 0.5 inches"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Save Simulator Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1b5e20]" />
                  <span>Permanent snapshot • Zero overwrite risk</span>
                </div>

                <Button
                  type="button"
                  onClick={handleSimulateSave}
                  className={`w-full sm:w-auto px-6 h-11 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-[#1b5e20] text-white shadow-sm'
                      : 'bg-gradient-to-r from-[#1b5e20] to-[#144818] hover:from-[#144818] hover:to-[#0e3310] text-white shadow-md shadow-emerald-950/15 active:scale-95'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Ticket Locked & Generated!</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Freeze & Generate Fitting Slip</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Live Customer Slip Outcome Screen ── */}
            <div className="lg:col-span-5 p-5 sm:p-7 bg-slate-50/70 flex flex-col justify-between space-y-5">
              <div>
                {/* View Switcher: WhatsApp vs Official Ticket */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Live Output Preview
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setOutputTab('whatsapp')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        outputTab === 'whatsapp'
                          ? 'bg-white text-[#1b5e20] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutputTab('ticket')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        outputTab === 'ticket'
                          ? 'bg-white text-[#1b5e20] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Fitting Ticket</span>
                    </button>
                  </div>
                </div>

                {/* Output Screen View */}
                {outputTab === 'whatsapp' ? (
                  /* ── WhatsApp Message Simulation ── */
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Customer WhatsApp Chat View:</span>
                      <span className="font-bold text-[#1b5e20] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1b5e20]" />
                        Real-time formatted
                      </span>
                    </div>

                    <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-300 font-sans shadow-inner">
                      <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-200 text-slate-800 space-y-2 text-xs font-mono leading-relaxed">
                        <div className="font-bold text-slate-900 font-sans flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-[#1b5e20]" />
                            <span>✂️ TailorApp — Fitting Slip</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <div>━━━━━━━━━━━━━━━━━━━━</div>
                          <div>👤 *Customer:* <span className="font-bold text-slate-900">{clientName || 'Customer'}</span></div>
                          <div>📞 *Phone:* {clientPhone || 'N/A'}</div>
                          <div>👗 *Style:* {current.title}</div>
                          <div>📅 *Date:* {new Date().toLocaleDateString('en-GB')}</div>
                          <div>━━━━━━━━━━━━━━━━━━━━</div>
                        </div>

                        <div className="py-1">
                          <div className="font-bold text-slate-900 text-[11px] mb-1">📏 *MEASURED SIZES ({unit}):*</div>
                          {current.fields.map((f) => (
                            <div key={f.name} className="text-[11px]">
                              • *{f.shortName}:* {fieldValues[f.name] || f.defaultVal} {unit}
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-dashed border-slate-200 text-[10px] text-slate-500 font-sans flex items-center justify-between">
                          <span>🧵 *Recorded with TailorApp*</span>
                          <span className="text-emerald-700 font-bold">✓✓ Sent</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyWhatsAppText}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-[#1b5e20]" />
                          <span className="text-[#1b5e20]">WhatsApp Message Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-[#1b5e20]" />
                          <span>Copy WhatsApp Text Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* ── Official Immutable Fitting Ticket Simulation ── */
                  <div className="mt-4 space-y-3">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <div className="font-black text-slate-900 text-sm">{clientName}</div>
                          <div className="text-[11px] text-slate-500">{current.title}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#1b5e20] text-[10px] font-black uppercase border border-emerald-200">
                          {isSaved ? '🔒 Locked Snapshot' : 'Draft Ticket'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {current.fields.map((f) => (
                          <div key={f.name} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-[10px] text-slate-500 truncate">{f.shortName}</div>
                            <div className="text-base font-black text-slate-900 font-mono">
                              {fieldValues[f.name] || f.defaultVal} {unit}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                        <span>Ticket ID: #TK-88301</span>
                        <span>{new Date().toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Psychology CTA Footnote */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-xs text-slate-800 space-y-2">
                <div className="font-black text-[#1b5e20] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready to replace paper notebooks in your shop?</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Join independent tailors across Nigeria managing client fitting snapshots with zero lost records.
                </p>
                <div className="pt-1">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#1b5e20] hover:underline"
                  >
                    <span>Create Free Tailor Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
