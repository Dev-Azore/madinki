'use server';

import { createClient } from '@/lib/supabase/server';

export interface DashboardClientItem {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  last_measurement?: {
    template_name: string;
    taken_at: string;
    fields_count: number;
  } | null;
}

export interface DashboardStats {
  user_name: string;
  client_count: number;
  template_count: number;
  measurement_count: number;
  last_activity: string | null;
  recent_clients: DashboardClientItem[];
}

export interface DashboardStatsResponse {
  data: DashboardStats | null;
  error?: string;
}

/**
 * Returns aggregate statistics and recent client records for the authenticated tailor's dashboard.
 * Prioritizes fast client search & fitting lookup over creation.
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'Unauthorized' };
  }

  // 1. Fetch user's profile name
  const { data: userProfile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  const userName =
    userProfile?.name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Tailor';

  // 2. Fetch aggregate statistics via security definer RPC
  const { data: statsData, error: statsError } = await supabase.rpc('tailor_dashboard_stats');

  if (statsError) {
    console.error('[Supabase tailor_dashboard_stats RPC error]:', statsError);
    return { data: null, error: `Failed to load dashboard statistics: ${statsError.message}` };
  }

  const row = Array.isArray(statsData) ? statsData[0] : statsData;

  // 3. Fetch clients with their recent measurements for immediate lookup
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, phone, notes, created_at')
    .eq('tailor_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(20);

  // 4. Fetch recent measurements to associate with client lookup
  const { data: measurementsData } = await supabase
    .from('measurements')
    .select('client_id, template_name_snapshot, fields_snapshot, taken_at')
    .eq('tailor_id', user.id)
    .order('taken_at', { ascending: false })
    .limit(50);

  const measurementMap = new Map<string, { template_name: string; taken_at: string; fields_count: number }>();

  if (measurementsData) {
    for (const m of measurementsData) {
      if (!measurementMap.has(m.client_id)) {
        const fields = Array.isArray(m.fields_snapshot) ? m.fields_snapshot : [];
        measurementMap.set(m.client_id, {
          template_name: m.template_name_snapshot || 'Custom Garment',
          taken_at: m.taken_at,
          fields_count: fields.length,
        });
      }
    }
  }

  const recent_clients: DashboardClientItem[] = (clientsData || []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    notes: c.notes,
    created_at: c.created_at,
    last_measurement: measurementMap.get(c.id) || null,
  }));

  return {
    data: {
      user_name: userName,
      client_count: Number(row?.client_count ?? 0),
      template_count: Number(row?.template_count ?? 0),
      measurement_count: Number(row?.measurement_count ?? 0),
      last_activity: row?.last_activity ?? null,
      recent_clients,
    },
  };
}
