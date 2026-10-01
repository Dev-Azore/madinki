import { z } from 'zod';

export const ledgerStatusEnum = z.enum(['started', 'in_progress', 'ready', 'delivered']);
export type LedgerStatus = z.infer<typeof ledgerStatusEnum>;

export const createLedgerEntrySchema = z.object({
  client_id: z.string().uuid().optional().nullable(),
  client_name: z
    .string()
    .trim()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name must be under 100 characters'),
  client_phone: z
    .string()
    .trim()
    .max(30, 'Phone number must be under 30 characters')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  entry_date: z
    .string()
    .min(1, 'Order date is required')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  delivery_date: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid delivery date' })
    .transform((val) => (val && val.length > 0 ? val : null)),
  sets_count: z.coerce.number().int().min(0, 'Sets count cannot be negative').default(1),
  style_type: z.string().trim().max(100).optional().default('Plain'),
  embroidery_work: z.string().trim().max(100).optional().default('Plain'),
  agbada_count: z.coerce.number().int().min(0, 'Agbada count cannot be negative').default(0),
  deposit_amount: z.coerce.number().min(0, 'Deposit amount cannot be negative').default(0),
  total_amount: z.coerce.number().min(0, 'Total amount cannot be negative').default(0),
  status: ledgerStatusEnum.default('started'),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes must be under 500 characters')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  custom_fields: z.record(z.string(), z.string()).optional().default({}),
});

export const updateLedgerEntrySchema = createLedgerEntrySchema.extend({
  id: z.string().uuid('Invalid entry ID'),
});

export const updateLedgerStatusSchema = z.object({
  id: z.string().uuid('Invalid entry ID'),
  status: ledgerStatusEnum,
});

export const ledgerColumnConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  hausaLabel: z.string().optional(),
  enabled: z.boolean(),
  order: z.number(),
  isCustom: z.boolean().optional(),
});

export const ledgerSettingsSchema = z.object({
  columns: z.array(ledgerColumnConfigSchema),
});

export type CreateLedgerEntryInput = z.infer<typeof createLedgerEntrySchema>;
export type UpdateLedgerEntryInput = z.infer<typeof updateLedgerEntrySchema>;
export type UpdateLedgerStatusInput = z.infer<typeof updateLedgerStatusSchema>;
export type LedgerColumnConfig = z.infer<typeof ledgerColumnConfigSchema>;
export type LedgerSettingsInput = z.infer<typeof ledgerSettingsSchema>;

export const DEFAULT_LEDGER_COLUMNS: LedgerColumnConfig[] = [
  { id: 'entry_date', label: 'Date', enabled: true, order: 0 },
  { id: 'client_name', label: 'Customer', enabled: true, order: 1 },
  { id: 'sets_count', label: 'Qty / Sets', enabled: true, order: 2 },
  { id: 'style_type', label: 'Style', enabled: true, order: 3 },
  { id: 'embroidery_work', label: 'Work / Design', enabled: true, order: 4 },
  { id: 'agbada_count', label: 'Agbada', enabled: true, order: 5 },
  { id: 'delivery_date', label: 'Due Date', enabled: false, order: 6 },
  { id: 'deposit_amount', label: 'Deposit (₦)', enabled: true, order: 7 },
  { id: 'total_amount', label: 'Total (₦)', enabled: true, order: 8 },
  { id: 'balance', label: 'Balance (₦)', enabled: true, order: 9 },
  { id: 'status', label: 'Status', enabled: true, order: 10 },
];
