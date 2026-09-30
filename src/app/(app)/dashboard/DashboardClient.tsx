'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Layers,
  Ruler,
  Clock,
  Plus,
  AlertCircle,
  Scissors,
  ArrowRight,
  Search,
  ChevronRight,
  Info,
  ShieldCheck,
  Phone,
  Eye,
} from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';
import type { DashboardStats, DashboardClientItem } from './actions';

interface DashboardClientProps {
  stats: DashboardStats | null;
  statsError?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'CL';
}

function formatLastActivity(dateStr: string | null): string {
  if (!dateStr) return 'No records yet';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardClient({ stats, statsError }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTipIndex, setActiveTipIndex] = useState<number | null>(null);

  const greeting = getTimeGreeting();
  const recentClients = stats?.recent_clients || [];

  const filteredClients = recentClients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery)) ||
    (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.last_measurement?.template_name &&
      c.last_measurement.template_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const statCards = [
    {
      label: 'Clients',
      value: stats ? stats.client_count.toString() : '0',
      icon: Users,
      color: 'text-sky-700',
      bg: 'from-sky-50 to-sky-100/60',
      iconBg: 'bg-sky-100 border-sky-200',
      href: '/clients',
      subtext: 'Registered customers',
    },
    {
      label: 'Measurements',
      value: stats ? stats.measurement_count.toString() : '0',
      icon: Ruler,
      color: 'text-[#1b5e20]',
      bg: 'from-emerald-50 to-emerald-100/60',
      iconBg: 'bg-emerald-100 border-emerald-200',
      href: null,
      subtext: 'Permanent fitting records',
    },
    {
      label: 'Templates',
      value: stats ? stats.template_count.toString() : '0',
      icon: Layers,
      color: 'text-violet-700',
      bg: 'from-violet-50 to-violet-100/60',
      iconBg: 'bg-violet-100 border-violet-200',
      href: '/templates',
      subtext: 'Garment styles',
    },
    {
      label: 'Last Fitting',
      value: stats ? formatLastActivity(stats.last_activity) : 'No records yet',
      icon: Clock,
      color: 'text-amber-700',
      bg: 'from-amber-50 to-amber-100/60',
      iconBg: 'bg-amber-100 border-amber-200',
      href: null,
      small: true,
      subtext: 'Recent shop activity',
    },
  ];

  const quickTips = [
    {
      title: 'Quick Fitting Lookup',
      desc: 'Type any customer name or phone in the search box above to immediately pull up their size history when they walk into your shop.',
    },
    {
      title: 'Taking Babban Riga Span',
      desc: 'Measure wrist-to-wrist across the wingspan with arms outstretched for traditional full-body drape.',
    },
    {
      title: 'Immutable Snapshots',
      desc: 'Measurements can never be overwritten by accident. Every order gets its own permanent timestamped record.',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* ── Studio Header ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b5e20] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1b5e20]">
              Studio Workspace
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, Tailor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Search and view customer measurement records anytime.
          </p>
        </div>

        <Link
          href="/measurements/new"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] text-white text-xs font-bold shadow-sm hover:shadow-md hover:from-[#144818] hover:to-[#1b5e20] transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Fitting</span>
        </Link>
      </div>

      {/* ── Sync Error state ── */}
      {statsError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <span className="font-bold">Sync Issue: </span>
            <span>{statsError}</span>
          </div>
        </div>
      )}

      {/* ── SEARCH HERO HUB ── */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Top gradient band */}
        <div className="h-1 bg-gradient-to-r from-[#1b5e20] via-[#2e7d32] to-emerald-400" />

        <div className="p-5 space-y-4">
          {/* Section label + link */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-[#1b5e20]" />
              </div>
              <span className="text-sm font-bold text-slate-900">Customer Records</span>
            </div>
            <Link href="/clients" className="text-[11px] font-bold text-[#1b5e20] hover:underline flex items-center gap-0.5 transition">
              All clients <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or garment type…"
              className="w-full pl-10 pr-10 py-3 bg-slate-50/80 border border-slate-200 focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/10 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-full cursor-pointer transition text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Results label */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
            {searchQuery
              ? `Results (${filteredClients.length})`
              : `Recent Fittings (${recentClients.length})`}
          </div>

          {/* Client results */}
          {recentClients.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">No customers yet</p>
                <p className="text-xs text-slate-400 mt-0.5">Add your first client to get started</p>
              </div>
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] text-white text-xs font-bold shadow-xs hover:shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Customer</span>
              </Link>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No customers found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {filteredClients.slice(0, 8).map((client) => {
                const initials = getInitials(client.name);
                return (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-100 hover:border-emerald-200 rounded-xl transition-all duration-150 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 text-[#1b5e20] font-black text-[10px] flex items-center justify-center font-mono shrink-0 group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#1b5e20] transition-colors truncate">
                          {client.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {client.last_measurement ? (
                            <span className="text-[#1b5e20]/80 font-medium">
                              {client.last_measurement.template_name}
                            </span>
                          ) : client.phone ? (
                            <span>{client.phone}</span>
                          ) : (
                            <span>Client profile</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1b5e20] transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const delay = ['stagger-1','stagger-2','stagger-3','stagger-4'][i] || '';
          const card = (
            <div
              key={stat.label}
              className={`animate-fade-in-up ${delay} rounded-2xl p-4 bg-gradient-to-br ${stat.bg} border border-white/80 shadow-xs card-hover flex flex-col justify-between gap-2.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {stat.label}
                </span>
                <div className={`w-7 h-7 rounded-lg ${stat.iconBg} border flex items-center justify-center transition-transform`}>
                  <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <div className={`font-extrabold text-slate-900 ${stat.small ? 'text-sm leading-snug' : 'text-2xl'}`}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{stat.subtext}</div>
              </div>
            </div>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Studio Shortcuts
          </h3>
        </div>
        <div className="divide-y divide-slate-100/80">
          {[
            { href: '/clients', label: 'Client Directory', Icon: Users, color: 'bg-sky-50 border-sky-200 text-sky-700' },
            { href: '/measurements/new', label: 'Record Measurement', Icon: Ruler, color: 'bg-emerald-50 border-emerald-200 text-[#1b5e20]' },
            { href: '/templates', label: 'Garment Templates', Icon: Layers, color: 'bg-violet-50 border-violet-200 text-violet-700' },
          ].map(({ href, label, Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Workshop Tips ── */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Workshop Tips
          </h3>
        </div>
        <div className="divide-y divide-slate-100/80">
          {quickTips.map((tip, idx) => {
            const isOpen = activeTipIndex === idx;
            return (
              <div key={idx}>
                <button
                  onClick={() => setActiveTipIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Scissors className="w-3 h-3 text-[#1b5e20] shrink-0" />
                    <span>{tip.title}</span>
                  </span>
                  <span className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-3.5 pt-0 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100 animate-fade-in">
                    {tip.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Ad Banner ── */}
      <div className="pt-1">
        <AdBanner slotId="dashboard_bottom" />
      </div>
    </div>
  );
}

export default DashboardClient;
