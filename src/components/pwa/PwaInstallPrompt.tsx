'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  X,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY_INSTALLED = 'madinki_pwa_installed';
const STORAGE_KEY_DISMISSED_AT = 'madinki_pwa_dismissed_at';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours cooldown
const DISPLAY_DURATION_MS = 8000; // Show for 8 seconds, then auto-disappear

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    const installedInStorage = localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true';

    if (isStandalone || installedInStorage) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // 3. Check 24-hour dismissal cooldown
    const dismissedAt = localStorage.getItem(STORAGE_KEY_DISMISSED_AT);
    const isCooldownActive = dismissedAt && Date.now() - Number(dismissedAt) < ONE_DAY_MS;

    // 4. Handle standard Chromium PWA beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Only show banner if not in cooldown
      if (!isCooldownActive) {
        // Small delay so it doesn't jarringly pop on load
        setTimeout(() => setShowBanner(true), 2500);
      }
    };

    // 5. Handle app installed event
    const handleAppInstalled = () => {
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      setIsInstalled(true);
      setShowBanner(false);
      setShowIosModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS users where beforeinstallprompt doesn't fire, show once per day
    if (isIosDevice && !isCooldownActive && !isStandalone) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Auto-dismiss after 8 seconds and start 24-hour cooldown
  useEffect(() => {
    if (!showBanner || showIosModal) return;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_DISMISSED_AT, String(Date.now()));
      setShowBanner(false);
    }, DISPLAY_DURATION_MS);

    return () => clearTimeout(timer);
  }, [showBanner, showIosModal]);

  const handleDismiss = () => {
    // Record timestamp so it won't appear again on refresh within 24h
    localStorage.setItem(STORAGE_KEY_DISMISSED_AT, String(Date.now()));
    setShowBanner(false);
  };

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) {
      // If browser hasn't fired beforeinstallprompt yet, prompt instructions
      setShowIosModal(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
        setIsInstalled(true);
        setShowBanner(false);
      } else {
        handleDismiss();
      }
    } catch {
      handleDismiss();
    } finally {
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <>
      {/* Floating Smart Install Banner */}
      <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-md mx-auto animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-md border border-emerald-200 shadow-xl shadow-slate-900/10 rounded-2xl p-4 flex items-center justify-between gap-3.5">
          {/* Brand Icon */}
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
            <svg
              className="w-6 h-6 text-[#1b5e20]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-slate-900 tracking-tight">
                Install Madinki
              </h4>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-50 text-[#1b5e20] text-[9px] font-bold uppercase border border-emerald-200">
                <Smartphone className="w-2.5 h-2.5" />
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Fast home screen access & instant measuring
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1b5e20] hover:bg-[#144818] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Dismiss for today"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari / Manual Installation Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1b5e20]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Add Madinki to Home Screen
                  </h3>
                  <p className="text-[11px] text-slate-500">Install in 2 quick taps</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Tap the Share button</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    At the bottom or top of Safari: <Share className="w-3.5 h-3.5 text-sky-600 inline" />
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#1b5e20] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Choose &apos;Add to Home Screen&apos;</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    Scroll down and select: <PlusSquare className="w-3.5 h-3.5 text-[#1b5e20] inline" />
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIosModal(false);
                handleDismiss();
              }}
              className="w-full py-2.5 bg-[#1b5e20] hover:bg-[#144818] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
