'use client';

import { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY_INSTALLED = 'tailorapp_pwa_installed';

interface PwaInstallButtonProps {
  className?: string;
  variant?: 'button' | 'badge' | 'menu';
}

export function PwaInstallButton({
  className = '',
  variant = 'button',
}: PwaInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    const installedInStorage = localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true';

    if (isStandalone || installedInStorage) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      setIsInstalled(true);
      setShowModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (isIos || !deferredPrompt) {
      setShowModal(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
        setIsInstalled(true);
      }
    } catch {
      setShowModal(true);
    } finally {
      setDeferredPrompt(null);
    }
  };

  // If already installed, render a subtle installed badge or nothing based on variant
  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>App Installed</span>
        </span>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'menu' ? (
        <button
          type="button"
          onClick={handleTriggerInstall}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold bg-[#040e1e] hover:bg-[#0B2545] text-slate-200 hover:text-white border border-[#0B2545] transition cursor-pointer ${className}`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#2e7d32]/20 text-[#81c784] flex items-center justify-center shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="font-bold text-white">Download & Install App</p>
            <p className="text-[11px] text-slate-400">Install to your home screen</p>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleTriggerInstall}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer bg-[#2e7d32]/20 hover:bg-[#2e7d32]/30 text-[#81c784] border border-[#2e7d32]/40 active:scale-95 ${className}`}
          title="Install TailorApp on your device"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {/* Guide Modal for iOS / Direct Installation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#071A34] border border-[#2e7d32]/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#040e1e] border border-[#2e7d32]/60 flex items-center justify-center text-[#81c784]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Install TailorApp
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isIos ? 'Quick 2-step setup on iOS' : 'Add to your Home Screen'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#040e1e] border border-[#0B2545] rounded-2xl p-4 text-xs text-slate-300">
              {isIos ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-white">Tap the Share button</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        Located in Safari toolbar: <Share className="w-3.5 h-3.5 text-blue-400 inline" />
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-[#0B2545]" />

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-[#81c784] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-white">Select &apos;Add to Home Screen&apos;</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        Scroll down and tap: <PlusSquare className="w-3.5 h-3.5 text-[#81c784] inline" />
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-white">Chrome / Edge / Android:</p>
                  <p className="text-[11px] text-slate-400">
                    Tap your browser menu (three dots <strong>⋮</strong>) in the top right, then select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
