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
        className={`p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1b5e20] border border-emerald-300 transition flex items-center justify-center cursor-pointer shadow-xs ${className}`}
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
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition bg-emerald-50 hover:bg-emerald-100 text-[#1b5e20] border border-emerald-300 cursor-pointer active:scale-95 shadow-xs ${className}`}
      title="Send measurement slip via WhatsApp"
    >
      <Share2 className="w-3.5 h-3.5" />
      <span>Share Slip via WhatsApp</span>
    </a>
  );
}
