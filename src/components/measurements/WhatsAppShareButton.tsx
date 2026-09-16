'use client';

import { Share2 } from 'lucide-react';
import { generateWhatsAppUrl, type WhatsAppShareData } from '@/lib/utils/whatsapp';

interface WhatsAppShareButtonProps {
  data: WhatsAppShareData;
  className?: string;
  variant?: 'button' | 'icon' | 'badge';
}

export function WhatsAppShareButton({
  data,
  className = '',
  variant = 'button',
}: WhatsAppShareButtonProps) {
  const url = generateWhatsAppUrl(data);

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center justify-center cursor-pointer ${className}`}
        title="Share fitting slip on WhatsApp"
        aria-label="Share fitting slip on WhatsApp"
      >
        <Share2 className="w-4 h-4" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 cursor-pointer active:scale-95 shadow-sm ${className}`}
      title="Send measurement slip via WhatsApp"
    >
      <Share2 className="w-3.5 h-3.5" />
      <span>Share Slip via WhatsApp</span>
    </a>
  );
}
