'use server';

import { createClient } from '@/lib/supabase/server';
import {
  createLedgerEntrySchema,
  updateLedgerEntrySchema,
  updateLedgerStatusSchema,
  ledgerSettingsSchema,
  DEFAULT_LEDGER_COLUMNS,
  CreateLedgerEntryInput,
  UpdateLedgerEntryInput,
  UpdateLedgerStatusInput,
  LedgerColumnConfig,
  LedgerStatus,
} from '@/lib/validation/ledger';
import { revalidatePath } from 'next/cache';

export interface ActionResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface LedgerEntryItem {
  id: string;
  tailor_id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string | null;
  entry_date: string;
  delivery_date: string | null;
  sets_count: number;
  style_type: string;
  embroidery_work: string;
  agbada_count: number;
  deposit_amount: number;
  total_amount: number;
  status: LedgerStatus;
  notes: string | null;
  custom_fields: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface LedgerStats {
  totalJobs: number;
  startedJobs: number;
  readyJobs: number;
  deliveredJobs: number;
  totalRevenue: number;
  totalDeposited: number;
  pendingBalance: number;
}

/**
 * Fetches all ledger entries, summary analytics, and tailor column configurations.
 */
export async function getLedgerData(): Promise<{
  entries: LedgerEntryItem[];
  stats: LedgerStats;
  columnsConfig: LedgerColumnConfig[];
  clients: Array<{ id: string; name: string; phone: string | null }>;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      entries: [],
      stats: {
        totalJobs: 0,
        startedJobs: 0,
        readyJobs: 0,
        deliveredJobs: 0,
        totalRevenue: 0,
        totalDeposited: 0,
        pendingBalance: 0,
      },
      columnsConfig: DEFAULT_LEDGER_COLUMNS,
      clients: [],
      error: 'You must be signed in to view your ledger.',
    };
  }

  // 1. Fetch ledger entries
  const { data: entriesData, error: entriesError } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('tailor_id', user.id)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  // 2. Fetch clients for autocomplete
  const { data: clientsData } = await supabase
    .from('clients')
    .select('id, name, phone')
    .eq('tailor_id', user.id)
    .order('name', { ascending: true });

  // 3. Fetch column settings
  const { data: settingsData } = await supabase
    .from('ledger_settings')
    .select('columns_config')
    .eq('tailor_id', user.id)
    .maybeSingle();

  if (entriesError) {
    return {
      entries: [],
      stats: {
        totalJobs: 0,
        startedJobs: 0,
        readyJobs: 0,
        deliveredJobs: 0,
        totalRevenue: 0,
        totalDeposited: 0,
        pendingBalance: 0,
      },
      columnsConfig: DEFAULT_LEDGER_COLUMNS,
      clients: clientsData || [],
      error: 'Failed to load ledger records.',
    };
  }

  const entries = (entriesData || []).map((e) => ({
    ...e,
    deposit_amount: Number(e.deposit_amount) || 0,
    total_amount: Number(e.total_amount) || 0,
  })) as LedgerEntryItem[];

  // Calculate ledger stats
  let totalRevenue = 0;
  let totalDeposited = 0;
  let startedJobs = 0;
  let readyJobs = 0;
  let deliveredJobs = 0;

  for (const entry of entries) {
    totalRevenue += entry.total_amount;
    totalDeposited += entry.deposit_amount;
    if (entry.status === 'started' || entry.status === 'in_progress') {
      startedJobs++;
    } else if (entry.status === 'ready') {
      readyJobs++;
    } else if (entry.status === 'delivered') {
      deliveredJobs++;
    }
  }

  const pendingBalance = Math.max(0, totalRevenue - totalDeposited);

  const columnsConfig: LedgerColumnConfig[] =
    settingsData?.columns_config && Array.isArray(settingsData.columns_config) && settingsData.columns_config.length > 0
      ? (settingsData.columns_config as unknown as LedgerColumnConfig[])
      : DEFAULT_LEDGER_COLUMNS;

  return {
    entries,
    stats: {
      totalJobs: entries.length,
      startedJobs,
      readyJobs,
      deliveredJobs,
      totalRevenue,
      totalDeposited,
      pendingBalance,
    },
    columnsConfig,
    clients: clientsData || [],
  };
}

/**
 * Creates a new ledger entry.
 */
export async function createLedgerEntry(
  payload: CreateLedgerEntryInput
): Promise<ActionResponse<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to add an entry.' };
  }

  const parsed = createLedgerEntrySchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: 'Validation failed. Please check the inputs.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Auto-link client if existing client with same name or ID exists
  let clientId = data.client_id || null;
  if (!clientId && data.client_name.trim()) {
    const { data: matchedClient } = await supabase
      .from('clients')
      .select('id')
      .eq('tailor_id', user.id)
      .ilike('name', data.client_name.trim())
      .limit(1)
      .maybeSingle();

    if (matchedClient) {
      clientId = matchedClient.id;
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('ledger_entries')
    .insert({
      tailor_id: user.id,
      client_id: clientId,
      client_name: data.client_name.trim(),
      client_phone: data.client_phone || null,
      entry_date: data.entry_date,
      delivery_date: data.delivery_date || null,
      sets_count: data.sets_count,
      style_type: data.style_type || 'Plain',
      embroidery_work: data.embroidery_work || 'Plain',
      agbada_count: data.agbada_count,
      deposit_amount: data.deposit_amount,
      total_amount: data.total_amount,
      status: data.status,
      notes: data.notes || null,
      custom_fields: data.custom_fields || {},
    })
    .select('id')
    .single();

  if (insertError || !inserted) {
    return { error: 'Failed to record ledger entry. Please try again.' };
  }

  revalidatePath('/ledger');
  revalidatePath('/dashboard');
  return { success: true, data: { id: inserted.id } };
}

/**
 * Updates an existing ledger entry.
 */
export async function updateLedgerEntry(
  payload: UpdateLedgerEntryInput
): Promise<ActionResponse<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to update an entry.' };
  }

  const parsed = updateLedgerEntrySchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: 'Validation failed. Please check the inputs.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const { error: updateError } = await supabase
    .from('ledger_entries')
    .update({
      client_id: data.client_id || null,
      client_name: data.client_name.trim(),
      client_phone: data.client_phone || null,
      entry_date: data.entry_date,
      delivery_date: data.delivery_date || null,
      sets_count: data.sets_count,
      style_type: data.style_type || 'Plain',
      embroidery_work: data.embroidery_work || 'Plain',
      agbada_count: data.agbada_count,
      deposit_amount: data.deposit_amount,
      total_amount: data.total_amount,
      status: data.status,
      notes: data.notes || null,
      custom_fields: data.custom_fields || {},
    })
    .eq('id', data.id)
    .eq('tailor_id', user.id);

  if (updateError) {
    return { error: 'Failed to update ledger entry.' };
  }

  revalidatePath('/ledger');
  revalidatePath('/dashboard');
  return { success: true, data: { id: data.id } };
}

/**
 * Quick updates the status of an entry (e.g. toggling Start -> Ready -> Delivered / Tik).
 */
export async function updateLedgerStatus(
  payload: UpdateLedgerStatusInput
): Promise<ActionResponse<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const parsed = updateLedgerStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: 'Invalid status' };
  }

  const { error: updateError } = await supabase
    .from('ledger_entries')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)
    .eq('tailor_id', user.id);

  if (updateError) {
    return { error: 'Failed to update job status.' };
  }

  revalidatePath('/ledger');
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Deletes a ledger entry.
 */
export async function deleteLedgerEntry(id: string): Promise<ActionResponse<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error: deleteError } = await supabase
    .from('ledger_entries')
    .delete()
    .eq('id', id)
    .eq('tailor_id', user.id);

  if (deleteError) {
    return { error: 'Failed to delete ledger entry.' };
  }

  revalidatePath('/ledger');
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Saves tailor's customized column preferences.
 */
export async function saveLedgerSettings(
  columns: LedgerColumnConfig[]
): Promise<ActionResponse<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const parsed = ledgerSettingsSchema.safeParse({ columns });
  if (!parsed.success) {
    return { error: 'Invalid column configuration.' };
  }

  const { error: upsertError } = await supabase
    .from('ledger_settings')
    .upsert(
      {
        tailor_id: user.id,
        columns_config: parsed.data.columns as unknown as import('@/types/database').Json,
      },
      { onConflict: 'tailor_id' }
    );

  if (upsertError) {
    return { error: 'Failed to save column settings.' };
  }

  revalidatePath('/ledger');
  return { success: true };
}
