'use client';

import { useState, useMemo } from 'react';
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
  Phone,
  Eye,
  UserPlus,
  Compass,
  ArrowUpRight,
  MessageCircle,
  ShieldCheck,
  Check,
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
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatWhatsAppLink(phone: string, clientName: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(`Hello ${clientName}, this is your tailor. Your measurement profile is safely recorded in our atelier studio.`);
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

function getFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return 'Tailor';
  return trimmed.split(' ')[0] || trimmed;
}

export function DashboardClient({ stats, statsError }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'with_fittings' | 'pending'>('all');
  const [activeTipIndex, setActiveTipIndex] = useState<number | null>(null);

  const greeting = getTimeGreeting();
  const firstName = getFirstName(stats?.user_name || 'Tailor');
  const recentClients = stats?.recent_clients || [];

  const filteredClients = useMemo(() => {
    let list = recentClients;

    if (activeFilter === 'with_fittings') {
      list = list.filter((c) => c.last_measurement);
    } else if (activeFilter === 'pending') {
      list = list.filter((c) => !c.last_measurement);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q)) ||
          (c.notes && c.notes.toLowerCase().includes(q)) ||
          (c.last_measurement?.template_name &&
            c.last_measurement.template_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [recentClients, searchQuery, activeFilter]);

  const statCards = [
    {
      id: 'clients',
      label: 'Client Roster',
      value: stats ? stats.client_count.toString() : '0',
      icon: Users,
      badge: 'Active Directory',
      badgeColor: 'bg-emerald-50 text-[#1b5e20] border-emerald-200/80',
      accentColor: 'text-[#1b5e20]',
      iconBg: 'bg-emerald-50 border-emerald-200/90 text-[#1b5e20]',
      glow: 'from-emerald-200/30 via-emerald-100/10 to-transparent',
      borderColor: 'hover:border-emerald-400/80',
      href: '/clients',
      subtext: 'Registered clients',
    },
    {
      id: 'fittings',
      label: 'Fitting Tickets',
      value: stats ? stats.measurement_count.toString() : '0',
      icon: Ruler,
      badge: 'Immutable Vault',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200/80',
      accentColor: 'text-sky-700',
      iconBg: 'bg-sky-50 border-sky-200/90 text-sky-700',
      glow: 'from-sky-200/30 via-sky-100/10 to-transparent',
      borderColor: 'hover:border-sky-400/80',
      href: '/measurements/new',
      subtext: 'Captured size blueprints',
    },
    {
      id: 'templates',
      label: 'Garment Presets',
      value: stats ? stats.template_count.toString() : '0',
      icon: Layers,
      badge: 'Style Cuts',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200/80',
      accentColor: 'text-purple-700',
      iconBg: 'bg-purple-50 border-purple-200/90 text-purple-700',
      glow: 'from-purple-200/30 via-purple-100/10 to-transparent',
      borderColor: 'hover:border-purple-400/80',
      href: '/templates',
      subtext: 'Kaftan, Riga & Gowns',
    },
    {
      id: 'activity',
      label: 'Latest Fitting',
      value: stats ? formatLastActivity(stats.last_activity) : 'No records',
      icon: Clock,
      badge: 'Shop Activity',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200/80',
      accentColor: 'text-amber-800',
      iconBg: 'bg-amber-50 border-amber-200/90 text-amber-800',
      glow: 'from-amber-200/30 via-amber-100/10 to-transparent',
      borderColor: 'hover:border-amber-400/80',
      href: '/clients',
      small: true,
      subtext: 'Most recent ticket',
    },
  ];

  const quickTips = [
    {
      title: 'Direct WhatsApp Customer Delivery',
      desc: 'After saving any client fitting snapshot, tap the WhatsApp button to instantly share a pre-formatted measurement slip directly to their phone.',
    },
    {
      title: 'Immutable Snapshots Guarantee',
      desc: 'Measurements can never be overwritten by mistake. Every order gets its own permanent timestamped blueprint record.',
    },
    {
      title: 'Taking Babban Riga Wingspan',
      desc: 'Measure wrist-to-wrist across outstretched arms with tape held straight along the collarline for the grand royal drape.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto pb-8">
      {/* ── Atelier Executive Header Card ── */}
      <div className="relative rounded-3xl bg-white/95 backdrop-blur-md p-5 sm:p-7 border border-slate-200/90 shadow-sm overflow-hidden group">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-100/50 via-teal-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-50/60 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-[#1b5e20] text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#1b5e20] animate-pulse" />
              <span>Tailor Atelier Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage client fitting snapshots, traditional cuts, and instant WhatsApp slips.
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2.5 pt-1 sm:pt-0 shrink-0">
            <Link
              href="/measurements/new"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4.5 py-3 rounded-2xl bg-gradient-to-r from-[#1b5e20] via-[#17521c] to-[#113f15] hover:from-[#144818] hover:to-[#0e3310] text-white text-xs font-black shadow-md shadow-emerald-950/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Fitting</span>
            </Link>

            <Link
              href="/clients/new"
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Add New Customer"
            >
              <UserPlus className="w-4 h-4 text-[#1b5e20]" />
              <span>Add Client</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Sync Error Alert ── */}
      {statsError && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <div className="flex-1">
            <span className="font-bold">Sync Issue: </span>
            <span>{statsError}</span>
          </div>
        </div>
      )}

      {/* ── KPI Metric Cards Grid (Redesigned with Tactile Depth & Hover Lift) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const cardContent = (
            <div
              key={stat.id}
              className={`relative p-4.5 rounded-3xl bg-white border border-slate-200/90 ${stat.borderColor} shadow-xs hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full group overflow-hidden cursor-pointer`}
            >
              {/* Subtle top-right ambient glow */}
              <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${stat.glow} rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-60`} />

              <div>
                {/* Header row: Icon + Action Arrow */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className={`w-9.5 h-9.5 rounded-2xl border flex items-center justify-center transition-all duration-200 shadow-2xs ${stat.iconBg}`}>
                    <Icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                  </div>

                  <div className="w-6.5 h-6.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 text-[#1b5e20] shadow-2xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Stat Label */}
                <div className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>

              {/* Stat Value & Subtitle */}
              <div className="pt-2 relative z-10">
                <div className={`font-black text-slate-900 font-mono tracking-tight ${stat.small ? 'text-sm sm:text-base' : 'text-2xl sm:text-3xl'}`}>
                  {stat.value}
                </div>
                <div className="text-[10.5px] text-slate-400 mt-0.5 truncate font-medium">
                  {stat.subtext}
                </div>
              </div>
            </div>
          );

          return stat.href ? (
            <Link key={stat.id} href={stat.href} className="block h-full">
              {cardContent}
            </Link>
          ) : (
            <div key={stat.id} className="h-full">{cardContent}</div>
          );
        })}
      </div>

      {/* ── SEARCH & CLIENT FITTING DIRECTORY HUB ── */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Hub Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-center text-[#1b5e20] shadow-2xs">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Customer Fitting Directory
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Instant search by customer name, phone number, or garment style
                </p>
              </div>
            </div>

            <Link
              href="/clients"
              className="text-xs font-bold text-[#1b5e20] hover:underline flex items-center gap-1 transition"
            >
              <span>All Clients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, 080... or Kaftan, Riga..."
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-[#1b5e20] focus:ring-2 focus:ring-[#1b5e20]/10 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-full cursor-pointer transition text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-[#1b5e20] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Clients ({recentClients.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('with_fittings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'with_fittings'
                  ? 'bg-[#1b5e20] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              With Fitting Snapshots
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'pending'
                  ? 'bg-[#1b5e20] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pending 1st Fitting
            </button>
          </div>
        </div>

        {/* Client Results Cards Grid */}
        <div className="p-4 sm:p-5">
          {recentClients.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/80 rounded-3xl border border-dashed border-slate-200 space-y-3.5 p-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1b5e20] border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <div className="max-w-xs mx-auto">
                <p className="text-sm font-black text-slate-800">Your customer directory is empty</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add your first customer to start recording permanent digital measurements and sending WhatsApp slips.
                </p>
              </div>
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#1b5e20] hover:bg-[#144818] text-white text-xs font-black shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Customer</span>
              </Link>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              No customers found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredClients.slice(0, 8).map((client) => {
                const initials = getInitials(client.name);
                return (
                  <div
                    key={client.id}
                    className="p-4.5 bg-white hover:bg-slate-50/60 border border-slate-200/90 hover:border-emerald-300/90 rounded-3xl transition-all duration-200 flex flex-col justify-between gap-3.5 shadow-xs hover:shadow-md hover:shadow-slate-900/5 group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="w-10.5 h-10.5 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200/90 text-[#1b5e20] font-black text-xs flex items-center justify-center font-mono shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/clients/${client.id}`}
                              className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#1b5e20] transition-colors truncate block"
                            >
                              {client.name}
                            </Link>
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5 font-medium">
                              {client.phone ? (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{client.phone}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400">No phone attached</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct WhatsApp Quick Share Button */}
                        {client.phone && (
                          <a
                            href={formatWhatsAppLink(client.phone, client.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#1b5e20] flex items-center justify-center shrink-0 transition-colors shadow-2xs"
                            title="Chat or share on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Snapshot Garment Tag */}
                      <div className="flex items-center gap-2">
                        {client.last_measurement ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50/80 text-[#1b5e20] border border-emerald-200/70 text-[10.5px] font-bold">
                            <Ruler className="w-3 h-3" />
                            <span>{client.last_measurement.template_name}</span>
                            <span className="text-emerald-400">•</span>
                            <span className="font-mono">{client.last_measurement.fields_count} sizes</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-[10.5px] font-semibold">
                            <span>Ready for 1st fitting</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Row */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <Link
                        href={`/clients/${client.id}`}
                        className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>View History</span>
                      </Link>

                      <Link
                        href={`/measurements/new?clientId=${client.id}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-[11px] font-black text-[#1b5e20] flex items-center gap-1 transition shadow-2xs hover:scale-[1.02]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Record Fitting</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── STUDIO WORKBENCH CARDS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[
          {
            href: '/measurements/new',
            title: 'Take New Fitting',
            desc: 'Capture size specifications into an immutable snapshot ticket',
            Icon: Ruler,
            color: 'bg-emerald-50 border-emerald-200/90 text-[#1b5e20]',
            badge: 'Start Ticket',
          },
          {
            href: '/clients',
            title: 'Customer Directory',
            desc: 'Browse complete client rosters, phone numbers, and past slips',
            Icon: Users,
            color: 'bg-sky-50 border-sky-200/90 text-sky-700',
            badge: 'Client CRM',
          },
          {
            href: '/templates',
            title: 'Garment Style Blueprints',
            desc: 'Configure field definitions for Kaftan, Babban Riga, and Gowns',
            Icon: Layers,
            color: 'bg-purple-50 border-purple-200/90 text-purple-700',
            badge: 'Custom Cuts',
          },
        ].map(({ href, title, desc, Icon, color, badge }) => (
          <Link
            key={href}
            href={href}
            className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300/90 shadow-xs hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#1b5e20] transition-colors">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                {desc}
              </p>
            </div>

            <div className="pt-4 flex items-center text-xs font-bold text-[#1b5e20] group-hover:translate-x-0.5 transition-transform gap-1">
              <span>Open Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── WORKSHOP GUIDES ACCORDION CARD ── */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#1b5e20]">
              <Scissors className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Master Tailoring Tips & Best Practices
            </h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {quickTips.map((tip, idx) => {
            const isOpen = activeTipIndex === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setActiveTipIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-800 hover:text-[#1b5e20] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-[#1b5e20] border border-emerald-200 text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{tip.title}</span>
                  </span>
                  <span className={`text-slate-400 font-mono text-sm transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100 animate-fade-in">
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
