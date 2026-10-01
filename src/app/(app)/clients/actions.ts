'use server';

import { createClient } from '@/lib/supabase/server';
import {
  createClientSchema,
  updateClientSchema,
  deleteClientSchema,
  CreateClientInput,
  UpdateClientInput,
} from '@/lib/validation/client';
import { revalidatePath } from 'next/cache';

export interface ClientActionResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Creates a new client for the authenticated tailor.
 */
export async function createClientAction(
  payload: CreateClientInput
): Promise<ClientActionResponse<{ id: string }>> {
  // 1. Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to perform this action.' };
  }

  // 2. Validate
  const parsed = createClientSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: 'Validation failed. Please check the fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, phone, notes } = parsed.data;

  // 3. Mutate
  const { data, error } = await supabase
    .from('clients')
    .insert({
      tailor_id: user.id,
      name,
      phone,
      notes,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'Failed to create client. Please try again.' };
  }

  revalidatePath('/clients');
  revalidatePath('/dashboard');
  return { success: true, data: { id: data.id } };
}

/**
 * Updates an existing client for the authenticated tailor.
 */
export async function updateClientAction(
  payload: UpdateClientInput
): Promise<ClientActionResponse<{ id: string }>> {
  // 1. Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to perform this action.' };
  }

  // 2. Validate
  const parsed = updateClientSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: 'Validation failed. Please check the fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id: clientId, name, phone, notes } = parsed.data;

  // 3. Mutate
  const { error } = await supabase
    .from('clients')
    .update({
      name,
      phone,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId)
    .eq('tailor_id', user.id);

  if (error) {
    return { error: 'Failed to update client. Please try again.' };
  }

  revalidatePath('/clients');
  revalidatePath(`/clients/${clientId}`);
  revalidatePath('/dashboard');
  return { success: true, data: { id: clientId } };
}

/**
 * Deletes a client. If measurements exist, the foreign key constraint
 * (ON DELETE RESTRICT) will prevent deletion and return a friendly error.
 */
export async function deleteClientAction(
  clientId: string
): Promise<ClientActionResponse> {
  // 1. Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to perform this action.' };
  }

  // 2. Validate
  const parsed = deleteClientSchema.safeParse({ id: clientId });
  if (!parsed.success) {
    return { error: 'Invalid client ID.' };
  }

  // 3. Mutate
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', parsed.data.id)
    .eq('tailor_id', user.id);

  if (error) {
    // Foreign key violation error code in Postgres is 23503
    if (error.code === '23503' || error.message.includes('foreign key constraint')) {
      return {
        error:
          'Cannot delete client: This client has saved measurement records. To preserve historical records, clients with measurements cannot be removed.',
      };
    }
    return { error: 'Failed to delete client. Please try again.' };
  }

  revalidatePath('/clients');
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Fetches all clients belonging to the authenticated tailor along with their order & debt summary.
 */
export async function getClients() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', data: [] };
  }

  // 1. Fetch clients
  const { data: clientsData, error: clientError } = await supabase
    .from('clients')
    .select(`
      id,
      name,
      phone,
      notes,
      created_at,
      updated_at
    `)
    .eq('tailor_id', user.id)
    .order('name', { ascending: true });

  if (clientError || !clientsData) {
    return { error: 'Failed to load clients', data: [] };
  }

  // 2. Fetch ledger entries to compute debt per client
  const { data: ledgerData } = await supabase
    .from('ledger_entries')
    .select('id, client_id, client_name, total_amount, deposit_amount, status')
    .eq('tailor_id', user.id);

  const entries = ledgerData || [];

  const clientsWithDebt = clientsData.map((client) => {
    // Match by client_id or matching trimmed name
    const clientOrders = entries.filter(
      (e) => e.client_id === client.id || (e.client_name && e.client_name.trim().toLowerCase() === client.name.trim().toLowerCase())
    );

    let totalDebt = 0;
    let activeOrdersCount = 0;

    for (const order of clientOrders) {
      const balance = Math.max(0, Number(order.total_amount) - Number(order.deposit_amount));
      if (balance > 0) {
        totalDebt += balance;
      }
      if (order.status === 'started' || order.status === 'in_progress' || order.status === 'ready') {
        activeOrdersCount++;
      }
    }

    return {
      ...client,
      total_debt: totalDebt,
      active_orders_count: activeOrdersCount,
      total_orders_count: clientOrders.length,
    };
  });

  return { data: clientsWithDebt };
}

/**
 * Fetches a single client along with their historical measurements, ledger orders & debt summary.
 */
export async function getClientProfile(clientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', data: null };
  }

  // 1. Get client info
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('tailor_id', user.id)
    .single();

  if (clientError || !client) {
    return { error: 'Client not found', data: null };
  }

  // 2. Get measurements for this client (newest first per DR-2/FR-4.3)
  const { data: measurements, error: measurementsError } = await supabase
    .from('measurements')
    .select(`
      id,
      template_id,
      template_name_snapshot,
      fields_snapshot,
      taken_at,
      created_at
    `)
    .eq('client_id', clientId)
    .eq('tailor_id', user.id)
    .order('taken_at', { ascending: false });

  // 3. Get ledger orders for this client
  const { data: ordersData } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('tailor_id', user.id)
    .or(`client_id.eq.${clientId},client_name.ilike.${client.name}`)
    .order('entry_date', { ascending: false });

  const orders = (ordersData || []).map((e) => ({
    ...e,
    deposit_amount: Number(e.deposit_amount) || 0,
    total_amount: Number(e.total_amount) || 0,
  }));

  let totalDebt = 0;
  let activeOrdersCount = 0;
  let completedOrdersCount = 0;

  for (const o of orders) {
    const balance = Math.max(0, o.total_amount - o.deposit_amount);
    if (balance > 0) {
      totalDebt += balance;
    }
    if (o.status === 'started' || o.status === 'in_progress' || o.status === 'ready') {
      activeOrdersCount++;
    } else if (o.status === 'delivered') {
      completedOrdersCount++;
    }
  }

  return {
    data: {
      client: {
        ...client,
        total_debt: totalDebt,
        active_orders_count: activeOrdersCount,
        completed_orders_count: completedOrdersCount,
      },
      measurements: measurementsError ? [] : measurements,
      orders,
    },
  };
}
