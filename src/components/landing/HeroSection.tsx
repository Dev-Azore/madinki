'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Scissors,
  Ruler,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
  Plus,
  Phone,
  Calendar,
  Check,
} from 'lucide-react';

interface MockClient {
  id: string;
  name: string;
  phone: string;
  garment: string;
  status: 'Ready' | 'In Progress' | 'Fitting';
  date: string;
  measurements: { label: string; value: string }[];
}

const MOCK_CLIENTS: MockClient[] = [
  {
    id: '1',
    name: 'Faisal Abubakar',
    phone: '0803 123 4567',
    garment: 'Royal Kaftan Set',
    status: 'Ready',
    date: '15 Sep 2026',
    measurements: [
      { label: 'Tsawon Riga', value: '38.5"' },
      { label: 'Kafada', value: '18.5"' },
      { label: 'Kirji', value: '41.0"' },
      { label: 'Hannu', value: '25.0"' },
      { label: 'Wando', value: '41.5"' },
      { label: 'Kafa', value: '14.5"' },
    ],
  },
  {
    id: '2',
    name: 'Umar Rufa\'i',
    phone: '0802 987 6543',
    garment: 'Babban Riga 3-Piece',
    status: 'In Progress',
    date: '14 Sep 2026',
    measurements: [
      { label: 'Tsawon Robe', value: '58.0"' },
      { label: 'Hannu Span', value: '66.0"' },
      { label: 'Kirjin Buba', value: '44.5"' },
      { label: 'Wuyan Riga', value: '16.5"' },
      { label: 'Tsawon Wando', value: '42.0"' },
      { label: 'Kafa Width', value: '15.0"' },
    ],
  },
  {
    id: '3',
    name: 'Hajiya Fatima Bello',
    phone: '0809 555 1234',
    garment: 'Abaya & 6-Piece Skirt',
    status: 'Fitting',
    date: '12 Sep 2026',
    measurements: [
      { label: 'Kirji (Bust)', value: '37.0"' },
      { label: 'Karkashin Kirji', value: '30.5"' },
      { label: 'Kunkuru (Waist)', value: '29.0"' },
      { label: 'Kugu (Hip)', value: '42.0"' },
      { label: 'Tsawon Riga', value: '59.0"' },
      { label: 'Tsawon Siket', value: '43.0"' },
    ],
  },
];

export function HeroSection() {
  const [selectedClientId, setSelectedClientId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredClients = MOCK_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.garment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const activeClient =
    MOCK_CLIENTS.find((c) => c.id === selectedClientId) || MOCK_CLIENTS[0];

  const handleCopyTicket = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
      {/* Background Lighting & Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      {/* Radial Spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[550px] bg-gradient-to-b from-emerald-100/50 via-slate-100/60 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Hero Header */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-200 shadow-xs hover:border-emerald-300 transition cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1b5e20] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1b5e20]" />
            </span>
            <span className="text-xs font-bold text-slate-800">
              The Digital Measurement Book for Nigerian Tailors
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Record Client Measurements.{' '}
            <span className="bg-gradient-to-r from-[#1b5e20] via-[#2e7d32] to-[#388e3c] bg-clip-text text-transparent">
              Never Lose a Size Again.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
            Replace torn notebooks with a fast, private mobile app designed for Kaftan, Babban Riga, Senator, and Gowns. Works on any phone.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 h-14 bg-[#1b5e20] hover:bg-[#144818] text-white text-base font-bold rounded-2xl shadow-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#demo" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 h-14 bg-white hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-slate-400 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-xs"
              >
                <Ruler className="w-4 h-4 text-[#1b5e20]" />
                <span>Test Interactive Studio</span>
              </Button>
            </a>
          </div>

          {/* Micro Value Line */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1b5e20]" />
              100% Free for Independent Tailors
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1b5e20]" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1b5e20]" />
              Instant Search on Mobile
            </span>
          </div>
        </div>

        {/* Interactive Live App Interface Simulation */}
        <div className="mt-14 sm:mt-18 max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
            {/* App Top Toolbar */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-[#1b5e20]" />
                <span className="ml-2 text-xs font-bold text-slate-700 hidden sm:inline">
                  TailorApp Studio • Active Client Directory
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#1b5e20] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1b5e20] animate-pulse" />
                  Live Interactive Preview
                </span>
              </div>
            </div>

            {/* Split View */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Left Column: Client List with Search */}
              <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Your Saved Clients ({filteredClients.length})
                    </span>
                    <span className="text-[11px] text-[#1b5e20] font-semibold">
                      Click to inspect
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-3.5">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or phone..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition"
                    />
                  </div>

                  {/* Client Cards Stack */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredClients.map((client) => {
                      const isSelected = client.id === activeClient.id;
                      return (
                        <button
                          key={client.id}
                          onClick={() => setSelectedClientId(client.id)}
                          className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${isSelected
                            ? 'bg-emerald-50/70 border border-emerald-200 shadow-xs'
                            : 'bg-slate-50/50 border border-slate-100 hover:bg-slate-100'
                            }`}
                        >
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{client.name}</span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1b5e20]" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {client.garment}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${client.status === 'Ready'
                              ? 'bg-emerald-100 text-[#1b5e20]'
                              : client.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800'
                              }`}
                          >
                            {client.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Left Bottom Quick Add Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1b5e20]" />
                    <span>Protected Cloud Storage</span>
                  </span>
                  <Link href="/register" className="text-[#1b5e20] hover:underline font-bold flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>Add New</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Selected Client's Fitting Ticket Details */}
              <div className="md:col-span-7 p-5 sm:p-6 bg-slate-50/40 flex flex-col justify-between space-y-5">
                <div>
                  {/* Selected Client Header Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[#1b5e20] font-black text-base">
                        {activeClient.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900">
                          {activeClient.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#1b5e20]" />
                            {activeClient.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {activeClient.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#1b5e20] border border-emerald-200">
                      {activeClient.garment}
                    </span>
                  </div>

                  {/* Measurements Grid */}
                  <div className="py-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                      <span>Saved Measurement Blueprint</span>
                      <span className="text-[#1b5e20] font-mono text-xs font-semibold">
                        Unit: Inches
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {activeClient.measurements.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs transition"
                        >
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            {m.label}
                          </div>
                          <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ticket Action Footer */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#1b5e20]" />
                    <span>Fitting Ticket #TK-{activeClient.id}092</span>
                  </div>

                  <button
                    onClick={handleCopyTicket}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1b5e20]" />
                        <span className="text-[#1b5e20]">Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Ruler className="w-3.5 h-3.5 text-[#1b5e20]" />
                        <span>Copy Fitting Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
