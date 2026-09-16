'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Clock, AlertTriangle, ShieldCheck, LogIn, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionTimeoutContextType {
  resetTimer: () => void;
  lastActive: number;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | null>(null);

export function useSessionTimeout() {
  const context = useContext(SessionTimeoutContext);
  if (!context) {
    throw new Error('useSessionTimeout must be used within a SessionTimeoutProvider');
  }
  return context;
}

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
  /** Inactivity limit in minutes before session expires (default: 15) */
  timeoutMinutes?: number;
  /** Warning prompt appearance in minutes before expiry (default: 2) */
  warningMinutes?: number;
  /** Target login route on expiry: 'tailor' -> /login, 'admin' -> /admin-login */
  role?: 'tailor' | 'admin';
}

const STORAGE_KEY = 'tailor_app_last_activity';

export function SessionTimeoutProvider({
  children,
  timeoutMinutes = 15,
  warningMinutes = 2,
  role = 'tailor',
}: SessionTimeoutProviderProps) {
  const supabase = createClient();
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  const [lastActive, setLastActive] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? parseInt(stored, 10) : Date.now();
    }
    return Date.now();
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const isLoggingOutRef = useRef<boolean>(false);
  const lastThrottleRef = useRef<number>(Date.now());

  // Function to record user activity
  const recordActivity = useCallback(() => {
    const now = Date.now();
    // Throttle localStorage writes to once every 3 seconds
    if (now - lastThrottleRef.current > 3000) {
      lastThrottleRef.current = now;
      setLastActive(now);
      try {
        localStorage.setItem(STORAGE_KEY, now.toString());
      } catch {
        // Fallback if storage restricted
      }
      if (showWarning) {
        setShowWarning(false);
      }
    }
  }, [showWarning]);

  // Explicit user reset (e.g. clicking "Stay Logged In")
  const resetTimer = useCallback(() => {
    const now = Date.now();
    lastThrottleRef.current = now;
    setLastActive(now);
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch {
      // ignore
    }
    setShowWarning(false);
  }, []);

  // Perform sign-out when expired
  const handleSignOut = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setShowWarning(false);
    setIsExpired(true);

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[SessionTimeout] SignOut error:', err);
    }
  }, [supabase]);

  // Listen to user interaction events across the window
  useEffect(() => {
    if (isExpired) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel', 'click'];
    const handleEvent = () => recordActivity();

    // Cross-tab synchronization via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime)) {
          setLastActive(remoteTime);
          if (showWarning) {
            setShowWarning(false);
          }
        }
      }
    };

    events.forEach((ev) => window.addEventListener(ev, handleEvent, { passive: true }));
    window.addEventListener('storage', handleStorage);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleEvent));
      window.removeEventListener('storage', handleStorage);
    };
  }, [recordActivity, isExpired, showWarning]);

  // Interval timer to evaluate session state
  useEffect(() => {
    if (isExpired) return;

    const checkInterval = setInterval(() => {
      let currentLastActive = lastActive;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          currentLastActive = parseInt(stored, 10);
        }
      } catch {
        // fallback to state
      }

      const now = Date.now();
      const elapsed = now - currentLastActive;
      const remaining = timeoutMs - elapsed;

      if (remaining <= 0) {
        // Expired
        setSecondsRemaining(0);
        handleSignOut();
      } else if (remaining <= warningMs) {
        // Within warning window
        setSecondsRemaining(Math.ceil(remaining / 1000));
        setShowWarning(true);
      } else {
        // Safe
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [lastActive, timeoutMs, warningMs, isExpired, showWarning, handleSignOut]);

  // Format seconds into MM:SS
  const formatTime = (secs: number | null) => {
    if (secs === null || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const loginRoute = role === 'admin' ? '/admin-login' : '/login';

  return (
    <SessionTimeoutContext.Provider value={{ resetTimer, lastActive }}>
      {children}

      {/* Inactivity Warning Modal */}
      {showWarning && !isExpired && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up"
        >
          <div className="w-full max-w-md bg-[#071A34] border border-[#2e7d32]/40 rounded-2xl p-6 shadow-2xl shadow-slate-950/80 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Session Inactivity Warning
              </h3>
              <p className="text-sm text-slate-300">
                You have been inactive for a while. For your security, you will be automatically logged out in:
              </p>
              <div className="py-2 text-3xl font-black font-mono text-amber-400">
                {formatTime(secondsRemaining)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={resetTimer}
                className="w-full sm:w-auto bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Stay Logged In
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Log Out Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Session Expired / Re-authentication Prompt Modal */}
      {isExpired && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in-up"
        >
          <div className="w-full max-w-md bg-[#071A34] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-950/90 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight">
                Session Expired
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your session has ended due to inactivity to protect customer measurements and account security.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => {
                  window.location.href = `${loginRoute}?reason=session_timeout`;
                }}
                className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold py-3 shadow-lg shadow-[#2e7d32]/20 flex items-center justify-center gap-2 text-base"
              >
                <LogIn className="w-5 h-5" />
                Re-Authenticate & Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </SessionTimeoutContext.Provider>
  );
}
