'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Layers,
  Users,
  Ruler,
  Clock,
  Edit2,
  Check,
  Scissors,
  LogOut,
  ShieldCheck,
  Smartphone,
  ArrowLeft,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/(auth)/actions';
import { updateTailorName, type TailorProfileData } from './actions';
import { PwaInstallButton } from '@/components/pwa/PwaInstallButton';

interface ProfileClientProps {
  initialProfile: TailorProfileData | null;
  errorMessage?: string;
}

export function ProfileClient({ initialProfile, errorMessage }: ProfileClientProps) {
  const [profile, setProfile] = useState<TailorProfileData | null>(initialProfile);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(initialProfile?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Avatar color accent generator based on name
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'TR';
  };

  const initials = profile ? getInitials(profile.name) : 'TR';

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const formData = new FormData();
    formData.append('name', nameInput.trim());

    try {
      const res = await updateTailorName(formData);
      if (res.error) {
        setSaveError(res.error);
      } else if (res.errors?.name) {
        setSaveError(res.errors.name[0]);
      } else {
        setProfile((prev) => (prev ? { ...prev, name: nameInput.trim() } : null));
        setIsEditingName(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setSaveError('Failed to update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile && errorMessage) {
    return (
      <div className="space-y-4 py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Could not load profile</h2>
        <p className="text-xs text-slate-500">{errorMessage}</p>
        <Link href="/dashboard">
          <Button size="sm" variant="outline" className="mt-2 text-xs">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs text-[#1b5e20] font-bold">Tailor Account</span>
      </div>

      {/* ── Main Profile Card with Avatar ── */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/60 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          {/* Avatar Ring */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#e8f5e9] border-2 border-emerald-200 flex items-center justify-center text-2xl sm:text-3xl font-black text-[#1b5e20] shadow-sm font-mono">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-[#1b5e20] text-white flex items-center justify-center border-2 border-white shadow">
              <Scissors className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Name & Basic Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {isEditingName ? (
                <form onSubmit={handleUpdateName} className="flex items-center gap-2 w-full max-w-sm">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20] rounded-xl px-3 py-1.5 text-sm text-slate-900 font-bold focus:outline-none transition"
                    placeholder="Enter your name..."
                    autoFocus
                  />
                  <Button
                    size="sm"
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#1b5e20] hover:bg-[#144818] text-white text-xs font-bold"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameInput(profile.name);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{profile.name}</h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-[#1b5e20] hover:bg-emerald-50 border border-slate-200 transition cursor-pointer"
                    title="Edit name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Plan Badge */}
              <div className="self-center sm:self-auto">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-[#1b5e20] border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {profile.plan === 'premium' ? 'PRO Atelier' : 'Free Tailor Plan'}
                </span>
              </div>
            </div>

            {/* Email & Join Date */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Success Alert */}
            {saveSuccess && (
              <div className="text-xs text-[#1b5e20] font-semibold flex items-center gap-1 pt-1">
                <Check className="w-3.5 h-3.5" />
                <span>Profile name updated successfully!</span>
              </div>
            )}
            {saveError && (
              <div className="text-xs text-red-600 font-semibold flex items-center gap-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{saveError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Studio Statistics Grid ── */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          My Workshop Numbers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Customers</span>
              <Users className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {profile.stats.client_count}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Total registered</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Garment Styles</span>
              <Layers className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {profile.stats.template_count}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Saved styles</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Measurements</span>
              <Ruler className="w-3.5 h-3.5 text-[#1b5e20]" />
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {profile.stats.measurement_count}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Saved size cards</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Status</span>
              <Shield className="w-3.5 h-3.5 text-[#1b5e20]" />
            </div>
            <div className="text-sm font-black text-[#1b5e20] capitalize">
              {profile.status}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cloud verified</div>
          </div>
        </div>
      </div>

      {/* ── App Installation / PWA Section ── */}
      <div className="rounded-2xl bg-white border border-emerald-200/80 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1b5e20] border border-emerald-200 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                PWA Home Screen App
              </h3>
              <p className="text-[11px] text-slate-500">
                Install Madinki on your phone or computer for 1-tap workshop access.
              </p>
            </div>
          </div>
          <PwaInstallButton variant="badge" />
        </div>
        <PwaInstallButton variant="menu" />
      </div>

      {/* ── Security & Account Settings ── */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Account Security & Preferences
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <div className="font-bold text-slate-900">Default Measurement Unit</div>
              <div className="text-slate-500 text-[11px]">Inches (Standard for Bespoke Tailoring)</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200">
              Inches (in)
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <div className="font-bold text-slate-900">Data Isolation (Row-Level Security)</div>
              <div className="text-slate-500 text-[11px]">Only you have access to your shop data</div>
            </div>
            <span className="text-[#1b5e20] font-bold">Enabled</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-bold text-slate-900">Sign Out of Workshop</div>
              <div className="text-slate-500 text-[11px]">End active session on this device</div>
            </div>
            <form action={logout}>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
