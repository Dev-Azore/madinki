'use client';

import { useState, useRef, MouseEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Scissors,
  Ruler,
  ArrowRight,
  ShieldCheck,
  Search,
  Plus,
  Phone,
  Calendar,
  Check,
  Share2,
  Layers,
  ChevronRight,
  Send,
  Lock,
  Smartphone,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface MockClient {
  id: string;
  name: string;
  phone: string;
  garment: string;
  status: 'Ready' | 'In Progress' | 'Fitting';
  date: string;
  measurements: { label: string; key: string; value: string; x: number; y: number }[];
}

const MOCK_CLIENTS: MockClient[] = [
  {
    id: '1',
    name: 'Alhaji Faisal Abubakar',
    phone: '0803 123 4567',
    garment: 'Royal Kaftan Set',
    status: 'Ready',
    date: '15 Sep 2026',
    measurements: [
      { label: 'Kafada (Shoulder)', key: 'shoulder', value: '18.5"', x: 50, y: 18 },
      { label: 'Kirji (Chest)', key: 'chest', value: '41.0"', x: 50, y: 32 },
      { label: 'Tsawon Riga (Length)', key: 'length', value: '38.5"', x: 50, y: 55 },
      { label: 'Hannu (Sleeve)', key: 'sleeve', value: '25.0"', x: 18, y: 36 },
      { label: 'Kunkuru (Waist)', key: 'waist', value: '34.0"', x: 50, y: 68 },
      { label: 'Tsawon Wando (Trouser)', key: 'trouser', value: '41.5"', x: 50, y: 88 },
    ],
  },
  {
    id: '2',
    name: 'Malam Umar Rufa\'i',
    phone: '0802 987 6543',
    garment: 'Babban Riga 3-Piece',
    status: 'In Progress',
    date: '14 Sep 2026',
    measurements: [
      { label: 'Tsawon Robe', key: 'length', value: '58.0"', x: 50, y: 50 },
      { label: 'Hannu Span', key: 'sleeve', value: '66.0"', x: 15, y: 35 },
      { label: 'Kirjin Buba', key: 'chest', value: '44.5"', x: 50, y: 30 },
      { label: 'Wuyan Riga', key: 'shoulder', value: '16.5"', x: 50, y: 15 },
      { label: 'Tsawon Wando', key: 'trouser', value: '42.0"', x: 50, y: 85 },
      { label: 'Kafa Width', key: 'waist', value: '15.0"', x: 50, y: 92 },
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
      { label: 'Kirji (Bust)', key: 'chest', value: '37.0"', x: 50, y: 28 },
      { label: 'Karkashin Kirji', key: 'waist', value: '30.5"', x: 50, y: 40 },
      { label: 'Kunkuru (Waist)', key: 'waist', value: '29.0"', x: 50, y: 50 },
      { label: 'Kugu (Hip)', key: 'trouser', value: '42.0"', x: 50, y: 65 },
      { label: 'Tsawon Riga', key: 'length', value: '59.0"', x: 50, y: 80 },
      { label: 'Hannu (Sleeve)', key: 'sleeve', value: '23.5"', x: 20, y: 38 },
    ],
  },
];

type FeatureCardId = 'whatsapp' | 'snapshot' | 'presets';

export function HeroSection() {
  const [selectedClientId, setSelectedClientId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ticket' | 'blueprint' | 'whatsapp'>('whatsapp');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<FeatureCardId>('whatsapp');

  // 3D Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 5;
    const rotateX = -((y - centerY) / centerY) * 5;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseEnter = () => {
    setIsHoveringCard(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringCard(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

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
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      {/* ── Ambient Background Lighting ── */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[950px] h-[400px] sm:h-[550px] bg-gradient-to-b from-emerald-100/70 via-slate-100/80 to-transparent rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 -left-24 w-88 h-88 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-slate-200/60 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── Centered Hero Header ── */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Brand Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-emerald-200/90 shadow-xs hover:border-emerald-300 transition-all hover:scale-105 cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1b5e20] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1b5e20]" />
            </span>
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Cloud Measurement Studio & Fitting Ledger
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.08]">
            Master Your Tailoring.{' '}
            <span className="bg-gradient-to-r from-[#1b5e20] via-[#2e7d32] to-[#388e3c] bg-clip-text text-transparent">
              Never Lose a Measurement Again.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
            A fast, beautiful, and secure workspace designed for bespoke fashion designers and master tailors. Capture fitting snapshots, create Kaftan blueprints, and send WhatsApp measurement slips instantly.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1 w-full sm:w-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 h-14 bg-gradient-to-r from-[#1b5e20] to-[#144818] hover:from-[#144818] hover:to-[#0e3310] text-white text-base font-bold rounded-2xl shadow-md shadow-emerald-950/15 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#demo" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 h-14 bg-white/90 hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-slate-400 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Ruler className="w-4 h-4 text-[#1b5e20]" />
                <span>Try Interactive Studio</span>
              </Button>
            </a>
          </div>

          {/* ── Interactive Feature Deck (Replaced static bullets with rich interactive micro-cards) ── */}
          <div className="w-full pt-4 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: WhatsApp Slip */}
              <button
                type="button"
                onClick={() => {
                  setActiveFeature('whatsapp');
                  setActiveTab('whatsapp');
                }}
                className={`group p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border relative overflow-hidden ${activeFeature === 'whatsapp'
                    ? 'bg-white border-[#1b5e20] shadow-md shadow-emerald-950/5 ring-2 ring-[#1b5e20]/10 scale-[1.02]'
                    : 'bg-white/80 hover:bg-white border-slate-200/90 shadow-xs hover:border-slate-300 hover:scale-[1.01]'
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${activeFeature === 'whatsapp'
                      ? 'bg-[#1b5e20] text-white'
                      : 'bg-emerald-50 text-[#1b5e20] group-hover:bg-emerald-100'
                    }`}>
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1b5e20] border border-emerald-200">
                    1-Tap Share
                  </span>
                </div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#1b5e20] transition-colors">
                  Instant WhatsApp Slip
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Deliver formatted fitting tickets directly to customer phones.
                </div>
              </button>

              {/* Card 2: Immutable Snapshots */}
              <button
                type="button"
                onClick={() => {
                  setActiveFeature('snapshot');
                  setActiveTab('ticket');
                }}
                className={`group p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border relative overflow-hidden ${activeFeature === 'snapshot'
                    ? 'bg-white border-[#1b5e20] shadow-md shadow-emerald-950/5 ring-2 ring-[#1b5e20]/10 scale-[1.02]'
                    : 'bg-white/80 hover:bg-white border-slate-200/90 shadow-xs hover:border-slate-300 hover:scale-[1.01]'
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${activeFeature === 'snapshot'
                      ? 'bg-[#1b5e20] text-white'
                      : 'bg-emerald-50 text-[#1b5e20] group-hover:bg-emerald-100'
                    }`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Immutable
                  </span>
                </div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#1b5e20] transition-colors">
                  Permanent Fitting History
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Every size snapshot is frozen in time. Zero overwritten tickets.
                </div>
              </button>

              {/* Card 3: Traditional Presets */}
              <button
                type="button"
                onClick={() => {
                  setActiveFeature('presets');
                  setActiveTab('blueprint');
                }}
                className={`group p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border relative overflow-hidden ${activeFeature === 'presets'
                    ? 'bg-white border-[#1b5e20] shadow-md shadow-emerald-950/5 ring-2 ring-[#1b5e20]/10 scale-[1.02]'
                    : 'bg-white/80 hover:bg-white border-slate-200/90 shadow-xs hover:border-slate-300 hover:scale-[1.01]'
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${activeFeature === 'presets'
                      ? 'bg-[#1b5e20] text-white'
                      : 'bg-emerald-50 text-[#1b5e20] group-hover:bg-emerald-100'
                    }`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#1b5e20] border border-emerald-200">
                    Kaftan & Riga
                  </span>
                </div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#1b5e20] transition-colors">
                  Traditional Blueprint Cuts
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Pre-configured fields for Kaftan, Babban Riga, Senator & Gowns.
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3D Interactive Live Studio Workbench ── */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto perspective-1200 relative">
          {/* Floating 3D Badge (Top Left) */}
          <div className="hidden lg:flex absolute -top-5 -left-8 z-30 animate-float-slow items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-200/90 shadow-lg shadow-emerald-950/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1b5e20] to-[#144818] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Scissors className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-slate-900">Bespoke Fit Engine</div>
              <div className="text-[10px] text-slate-500 font-medium">Precision Measurement Standards</div>
            </div>
          </div>

          {/* Floating 3D Badge (Bottom Right) */}
          <div className="hidden lg:flex absolute -bottom-5 -right-8 z-30 animate-float-reverse items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-200/90 shadow-lg shadow-emerald-950/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-[#1b5e20] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-slate-900">1-Tap WhatsApp Slip</div>
              <div className="text-[10px] text-slate-500 font-medium">Automatic ticket formatting</div>
            </div>
          </div>

          {/* Main 3D Card Container */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: isHoveringCard
                ? 'transform 0.1s ease-out'
                : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
              transformStyle: 'preserve-3d',
            }}
            className="relative rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden group"
          >
            {/* Dynamic Glare Reflection Overlay */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-20"
              style={{
                opacity: isHoveringCard ? 0.35 : 0,
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
              }}
            />

            {/* App Top Toolbar */}
            <div className="px-5 py-3.5 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-[#1b5e20]" />
                <span className="ml-2 text-xs font-bold text-slate-700 hidden sm:inline">
                  TailorApp Studio • Atelier Workbench
                </span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('ticket')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'ticket'
                      ? 'bg-white text-[#1b5e20] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Fitting Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('blueprint')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'blueprint'
                      ? 'bg-white text-[#1b5e20] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Anatomy Blueprint</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('whatsapp')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'whatsapp'
                      ? 'bg-white text-[#1b5e20] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Slip</span>
                </button>
              </div>
            </div>

            {/* Split View Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Left Column: Client List with Live Search */}
              <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-white">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Saved Client Profiles ({filteredClients.length})
                    </span>
                    <span className="text-[11px] text-[#1b5e20] font-semibold flex items-center gap-0.5">
                      <span>Tap to inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-3.5">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, outfit, or phone..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition shadow-xs"
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
                              ? 'bg-emerald-50/80 border border-emerald-200 shadow-xs translate-x-1'
                              : 'bg-slate-50/50 border border-slate-100 hover:bg-slate-100/80 hover:border-slate-200'
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
                    <span>Isolated DB Vault</span>
                  </span>
                  <Link href="/register" className="text-[#1b5e20] hover:underline font-bold flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>New Client</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Selected View */}
              <div className="md:col-span-7 p-5 sm:p-6 bg-slate-50/50 flex flex-col justify-between space-y-5">
                {activeTab === 'ticket' && (
                  /* ── TAB 1: FITTING TICKET ── */
                  <div>
                    {/* Header Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1b5e20] font-black text-base shadow-xs">
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
                        <span>Captured Size Blueprint</span>
                        <span className="text-[#1b5e20] font-mono text-xs font-bold">
                          Unit: Inches (&quot;)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {activeClient.measurements.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all group/item"
                          >
                            <div className="text-[11px] text-slate-500 font-medium truncate group-hover/item:text-[#1b5e20] transition-colors">
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
                )}

                {activeTab === 'blueprint' && (
                  /* ── TAB 2: INTERACTIVE ANATOMY BLUEPRINT ── */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          {activeClient.garment} Cut Architecture
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Hover points to highlight key tailored measurements
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#1b5e20] border border-emerald-200">
                        Interactive Blueprint
                      </span>
                    </div>

                    {/* Garment Silhouette with Pulsing Hotspots */}
                    <div className="relative h-64 w-full bg-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden p-4">
                      <svg
                        viewBox="0 0 200 240"
                        className="h-full w-auto text-slate-200 stroke-current fill-slate-50/80 stroke-1"
                      >
                        {/* Kaftan/Senator Outer Silhouette */}
                        <path
                          d="M 60 20 L 75 40 L 125 40 L 140 20 L 180 50 L 160 100 L 145 90 L 145 220 L 55 220 L 55 90 L 40 100 L 20 50 Z"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                        {/* Neckline Placket */}
                        <path d="M 90 40 L 100 85 L 110 40" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                        <line x1="100" y1="85" x2="100" y2="130" stroke="#cbd5e1" strokeWidth="2" />
                      </svg>

                      {/* Interactive Measurement Hotspots */}
                      {activeClient.measurements.map((node) => {
                        const isNodeHovered = hoveredNode === node.key;
                        return (
                          <div
                            key={node.key}
                            onMouseEnter={() => setHoveredNode(node.key)}
                            onMouseLeave={() => setHoveredNode(null)}
                            style={{ top: `${node.y}%`, left: `${node.x}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                          >
                            <div className="relative group/node flex items-center justify-center">
                              <span
                                className={`absolute w-7 h-7 rounded-full bg-emerald-500/20 transition-transform ${isNodeHovered ? 'scale-150 animate-ping' : 'animate-pulse'
                                  }`}
                              />
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isNodeHovered
                                    ? 'bg-[#1b5e20] border-white scale-125 shadow-md'
                                    : 'bg-white border-[#1b5e20]'
                                  }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1b5e20] group-hover/node:bg-white" />
                              </div>

                              {/* Tooltip Tag */}
                              <div
                                className={`absolute bottom-full mb-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap pointer-events-none transition-all duration-150 shadow-md ${isNodeHovered
                                    ? 'opacity-100 scale-100 -translate-y-1'
                                    : 'opacity-0 scale-95 translate-y-0'
                                  }`}
                              >
                                {node.label}: {node.value}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'whatsapp' && (
                  /* ── TAB 3: WHATSAPP SLIP PREVIEW ── */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          WhatsApp Fitting Slip Generator
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Pre-formatted text slip ready to send to {activeClient.name}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366]/15 text-[#1b5e20] border border-[#25D366]/30 flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        Live Preview
                      </span>
                    </div>

                    {/* WhatsApp Chat Bubble Simulation */}
                    <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-300 font-sans shadow-inner max-h-64 overflow-y-auto">
                      <div className="bg-white rounded-xl rounded-tl-none p-3.5 shadow-sm max-w-sm border border-slate-200 text-slate-800 space-y-1.5 text-xs font-mono leading-relaxed">
                        <div className="font-bold text-slate-900 font-sans flex items-center gap-1.5 pb-1 border-b border-slate-100">
                          <Scissors className="w-3.5 h-3.5 text-[#1b5e20]" />
                          <span>TailorApp — Fitting Slip</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <div>👤 Customer: <span className="font-bold text-slate-800">{activeClient.name}</span></div>
                          <div>📞 Phone: {activeClient.phone}</div>
                          <div>👗 Garment: {activeClient.garment}</div>
                          <div>📅 Date: {activeClient.date}</div>
                        </div>
                        <div className="pt-1 border-t border-dashed border-slate-200 text-[11px]">
                          <div className="font-bold text-slate-900 mb-0.5">📏 SIZES:</div>
                          {activeClient.measurements.map((m, i) => (
                            <div key={i}>• {m.label}: {m.value}</div>
                          ))}
                        </div>
                        <div className="pt-1 text-[10px] text-slate-400 font-sans italic">
                          🧵 Recorded with TailorApp
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ticket Action Footer */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#1b5e20]" />
                    <span>Snapshot Ticket #TK-{activeClient.id}092</span>
                  </div>

                  <button
                    onClick={handleCopyTicket}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1b5e20]" />
                        <span className="text-[#1b5e20]">Blueprint Copied!</span>
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
