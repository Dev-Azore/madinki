'use client';

import { useEffect, useRef, useState } from 'react';
import { useUserPlan } from '@/lib/hooks/useUserPlan';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export function AdBanner({
  slotId,
  format = 'auto',
  responsive = true,
  className = '',
}: AdBannerProps) {
  const { plan, isLoading } = useUserPlan();
  const [hasError, setHasError] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const targetSlotId = slotId || process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

  useEffect(() => {
    // If premium, no client ID, or already encountered error, do not push
    if (plan === 'premium' || !clientId || !targetSlotId || hasError) {
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn('AdSense failed to push ad unit, collapsing container:', err);
      setHasError(true);
    }
  }, [plan, clientId, targetSlotId, hasError]);

  // FR-6.2: Gated by user plan — premium users never see ads
  if (plan === 'premium' || isLoading) {
    return null;
  }

  // FR-6.4: Graceful collapse on error or if no ads configured
  if (hasError) {
    return null;
  }

  // If no AdSense credentials configured (e.g. pre-launch/dev), collapse completely
  if (!clientId || !targetSlotId) {
    return null;
  }

  return (
    <div
      className={`my-4 overflow-hidden rounded-2xl border border-[#0B2545]/60 bg-[#071A34]/40 p-1.5 text-center transition-all duration-300 ${className}`}
    >
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={targetSlotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
