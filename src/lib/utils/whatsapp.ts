/**
 * Generates a formatted WhatsApp fitting slip message and direct sharing URL.
 */

export interface MeasurementPoint {
  field_name: string;
  unit: string | null;
  value: string;
}

export interface WhatsAppShareData {
  clientName: string;
  clientPhone?: string | null;
  templateName: string;
  takenAt?: string | null;
  fields: MeasurementPoint[];
}

export function generateWhatsAppMessage(data: WhatsAppShareData): string {
  const { clientName, clientPhone, templateName, takenAt, fields } = data;

  const dateStr = takenAt
    ? new Date(takenAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  const filledFields = fields.filter((f) => f.value && f.value.trim().length > 0);

  const measurementsList = filledFields
    .map((f) => `• *${f.field_name}:* ${f.value}${f.unit ? ` ${f.unit}` : ''}`)
    .join('\n');

  const lines = [
    `✂️ *TailorApp — Fitting Measurement Slip*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Customer:* ${clientName}`,
    clientPhone ? `📞 *Phone:* ${clientPhone}` : null,
    `👗 *Garment Style:* ${templateName}`,
    `📅 *Fitting Date:* ${dateStr}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📏 *MEASURED SIZES:*`,
    measurementsList || `(No measurements recorded)`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🧵 *Recorded with TailorApp*`,
  ].filter(Boolean);

  return lines.join('\n');
}

export function generateWhatsAppUrl(data: WhatsAppShareData): string {
  const message = generateWhatsAppMessage(data);
  const encodedText = encodeURIComponent(message);

  // If phone number is available, clean it up
  let cleanedPhone = '';
  if (data.clientPhone) {
    cleanedPhone = data.clientPhone.replace(/[^0-9]/g, '');
    // If Nigerian local format (080...), convert to +23480...
    if (cleanedPhone.startsWith('0') && cleanedPhone.length === 11) {
      cleanedPhone = '234' + cleanedPhone.slice(1);
    }
  }

  if (cleanedPhone) {
    return `https://wa.me/${cleanedPhone}?text=${encodedText}`;
  }

  return `https://wa.me/?text=${encodedText}`;
}
