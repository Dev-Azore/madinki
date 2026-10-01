'use client';

import { useState } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  Send,
  Scissors,
} from 'lucide-react';
import { LedgerEntryItem } from './actions';

interface WhatsAppReceiptModalProps {
  isOpen: boolean;
  entry: LedgerEntryItem | null;
  onClose: () => void;
}

type MessageType = 'ready' | 'receipt' | 'reminder';
type Lang = 'hausa' | 'english';

export function WhatsAppReceiptModal({
  isOpen,
  entry,
  onClose,
}: WhatsAppReceiptModalProps) {
  const [msgType, setMsgType] = useState<MessageType>('ready');
  const [lang, setLang] = useState<Lang>('hausa');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !entry) return null;

  const balance = Math.max(0, entry.total_amount - entry.deposit_amount);
  const formattedDate = (() => {
    try {
      return new Date(entry.entry_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return entry.entry_date;
    }
  })();

  const deliveryDateFormatted = entry.delivery_date
    ? (() => {
        try {
          return new Date(entry.delivery_date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        } catch {
          return entry.delivery_date;
        }
      })()
    : null;

  const generateMessage = (): string => {
    const setsText = `${entry.sets_count} Set${entry.sets_count > 1 ? 's' : ''}${
      entry.agbada_count > 0 ? ` + ${entry.agbada_count} Agbada` : ''
    }`;

    if (lang === 'hausa') {
      if (msgType === 'ready') {
        return `Assalamu alaikum ${entry.client_name},\n\nDinkinku na ${entry.style_type || 'Kaftan'} (${setsText}, Aiki: ${entry.embroidery_work || 'Plain'}) ya kammala kuma ya shirya a shagon dinki.\n\n` +
          `• Jimillar Kudi: ₦${entry.total_amount.toLocaleString()}\n` +
          `• Kudin Ajiya da aka bayar: ₦${entry.deposit_amount.toLocaleString()}\n` +
          `• Ragowar Kudi: ${balance > 0 ? `₦${balance.toLocaleString()}` : 'Babu (An biya duka)'}\n\n` +
          `Za a iya zuwa karba a kowane lokaci. Mun gode da aminci!`;
      }
      if (msgType === 'receipt') {
        return `Assalamu alaikum ${entry.client_name},\n\nMun karbi dinkinku a shagonmu:\n\n` +
          `• Ranar Karba: ${formattedDate}\n` +
          `• Nau'in Dinki: ${entry.style_type || 'Plain'}\n` +
          `• Aiki: ${entry.embroidery_work || 'Plain'}\n` +
          `• Yawan Kaya: ${setsText}\n` +
          (deliveryDateFormatted ? `• Ranar Bayarwa: ${deliveryDateFormatted}\n` : '') +
          `\n• Jimillar Kudi: ₦${entry.total_amount.toLocaleString()}\n` +
          `• Kudin Ajiya: ₦${entry.deposit_amount.toLocaleString()}\n` +
          `• Ragowar Kudi: ₦${balance.toLocaleString()}\n\n` +
          `Mun gode kwarai da zabin shagonmu.`;
      }
      // reminder
      return `Assalamu alaikum ${entry.client_name},\n\nMuna tunatar da ku cikin girmamawa game da ragowar kudin dinkinku na ₦${balance.toLocaleString()} (${entry.style_type || 'Kaftan'}).\n\nNagode sosai!`;
    }

    // English
    if (msgType === 'ready') {
      return `Hello ${entry.client_name},\n\nYour order of ${entry.style_type || 'Outfit'} (${setsText}, Work: ${entry.embroidery_work || 'Plain'}) is ready for collection at our tailor shop.\n\n` +
        `• Total Bill: ₦${entry.total_amount.toLocaleString()}\n` +
        `• Deposit Paid: ₦${entry.deposit_amount.toLocaleString()}\n` +
        `• Balance Due: ${balance > 0 ? `₦${balance.toLocaleString()}` : '₦0 (Fully Paid)'}\n\n` +
        `You can stop by anytime to pick up. Thank you for your business!`;
    }
    if (msgType === 'receipt') {
      return `Hello ${entry.client_name},\n\nThank you for placing your tailoring order with us:\n\n` +
        `• Order Date: ${formattedDate}\n` +
        `• Style: ${entry.style_type || 'Plain'}\n` +
        `• Embroidery / Work: ${entry.embroidery_work || 'Plain'}\n` +
        `• Quantity: ${setsText}\n` +
        (deliveryDateFormatted ? `• Promised Delivery Date: ${deliveryDateFormatted}\n` : '') +
        `\n• Total Bill: ₦${entry.total_amount.toLocaleString()}\n` +
        `• Deposit Paid: ₦${entry.deposit_amount.toLocaleString()}\n` +
        `• Balance Due: ₦${balance.toLocaleString()}\n\n` +
        `We appreciate your business!`;
    }
    return `Hello ${entry.client_name},\n\nThis is a friendly reminder regarding your outstanding tailoring balance of ₦${balance.toLocaleString()} for your ${entry.style_type || 'order'}.\n\nThank you!`;
  };

  const messageText = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    let phone = (entry.client_phone || '').replace(/[^0-9]/g, '');
    if (phone.startsWith('0') && phone.length === 11) {
      phone = '234' + phone.slice(1);
    }
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`
      : `https://wa.me/?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shadow-2xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                WhatsApp Notification &amp; Receipt
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Send updates directly to {entry.client_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Type Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setMsgType('ready')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer text-center ${
              msgType === 'ready'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ready for Pickup
          </button>
          <button
            type="button"
            onClick={() => setMsgType('receipt')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer text-center ${
              msgType === 'receipt'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Order Receipt
          </button>
          <button
            type="button"
            onClick={() => setMsgType('reminder')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer text-center ${
              msgType === 'reminder'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Balance Reminder
          </button>
        </div>

        {/* Language selector */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Message Language:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLang('hausa')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                lang === 'hausa'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hausa
            </button>
            <button
              type="button"
              onClick={() => setLang('english')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                lang === 'english'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="p-4 bg-emerald-50/50 border border-emerald-200/90 rounded-2xl relative font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
          {messageText}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Message</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer active:scale-95 text-xs"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
