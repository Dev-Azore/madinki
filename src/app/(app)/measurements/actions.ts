'use server';

import { createClient } from '@/lib/supabase/server';
import {
  recordMeasurementSchema,
  RecordMeasurementInput,
} from '@/lib/validation/measurement';
import { revalidatePath } from 'next/cache';

export interface ActionResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface ClientOption {
  id: string;
  name: string;
  phone: string | null;
}

export interface TemplateFieldOption {
  id: string;
  field_name: string;
  unit: string | null;
  order_index: number;
}

export interface TemplateOption {
  id: string;
  name: string;
  template_fields: TemplateFieldOption[];
}

/**
 * Records a new immutable measurement snapshot for a client.
 * Server Action pattern: Auth -> Validate -> Authoritative Snapshot -> Mutate
 */
export async function recordMeasurement(
  payload: RecordMeasurementInput
): Promise<ActionResponse<{ id: string }>> {
  // 1. Authenticate — never trust the client
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to record measurements.' };
  }

  // 2. Validate input schema
  const parsed = recordMeasurementSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: 'Please fill in the required measurement fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { client_id, template_id, taken_at, field_values } = parsed.data;

  // 3. Verify client belongs to this tailor
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', client_id)
    .eq('tailor_id', user.id)
    .single();

  if (clientError || !client) {
    return { error: 'Client not found or you do not have permission to access this client.' };
  }

  // 4. Authoritatively fetch the template and active template fields from DB
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select(`
      id,
      name,
      template_fields (
        id,
        field_name,
        unit,
        order_index
      )
    `)
    .eq('id', template_id)
    .eq('tailor_id', user.id)
    .is('deleted_at', null)
    .single();

  if (templateError || !template) {
    return { error: 'Selected template is no longer available or was deleted.' };
  }

  const sortedTemplateFields = (template.template_fields || []).sort(
    (a, b) => a.order_index - b.order_index
  );

  if (sortedTemplateFields.length === 0) {
    return { error: 'Template has no defined fields to record.' };
  }

  // 5. Construct the immutable snapshot (DR-2 / §3.7)
  // Combine authoritative field names + units from DB with tailor-entered values
  const enteredValueMap = new Map<string, string>();
  for (const fv of field_values) {
    enteredValueMap.set(fv.field_name.toLowerCase().trim(), fv.value.trim());
  }

  const fieldsSnapshot = sortedTemplateFields.map((tf) => {
    const entered = enteredValueMap.get(tf.field_name.toLowerCase().trim()) ?? '';
    return {
      field_name: tf.field_name,
      unit: tf.unit ?? null,
      value: entered,
    };
  });

  // Verify at least one value is entered
  const hasAtLeastOneValue = fieldsSnapshot.some((f) => f.value.length > 0);
  if (!hasAtLeastOneValue) {
    return { error: 'Please enter at least one measurement value.' };
  }

  const measurementTimestamp = taken_at && !isNaN(Date.parse(taken_at))
    ? new Date(taken_at).toISOString()
    : new Date().toISOString();

  // 6. Mutate — Insert immutable measurement record
  const { data: measurement, error: insertError } = await supabase
    .from('measurements')
    .insert({
      client_id: client.id,
      tailor_id: user.id,
      template_id: template.id,
      template_name_snapshot: template.name,
      fields_snapshot: fieldsSnapshot,
      taken_at: measurementTimestamp,
    })
    .select('id')
    .single();

  if (insertError || !measurement) {
    console.error('[Supabase measurements.insert error]:', insertError);
    return {
      error: insertError
        ? `Failed to record measurement: ${insertError.message}`
        : 'Failed to record measurement. Please try again.',
    };
  }

  // 7. Revalidate relevant cache paths
  revalidatePath('/clients');
  revalidatePath(`/clients/${client.id}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    data: { id: measurement.id },
  };
}

/**
 * Fetches clients and active templates to initialize the measurement recording wizard.
 */
export async function getMeasurementWizardData(): Promise<{
  clients: ClientOption[];
  templates: TemplateOption[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { clients: [], templates: [], error: 'Unauthorized' };
  }

  // 1. Fetch clients
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, phone')
    .eq('tailor_id', user.id)
    .order('name', { ascending: true });

  // 2. Fetch templates with fields
  const { data: templatesData, error: templatesError } = await supabase
    .from('templates')
    .select(`
      id,
      name,
      template_fields (
        id,
        field_name,
        unit,
        order_index
      )
    `)
    .eq('tailor_id', user.id)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (clientsError || templatesError) {
    return {
      clients: clientsData || [],
      templates: [],
      error: 'Failed to load clients or templates.',
    };
  }

  const formattedTemplates = (templatesData || []).map((t) => ({
    ...t,
    template_fields: (t.template_fields || []).sort(
      (a, b) => a.order_index - b.order_index
    ),
  }));

  return {
    clients: clientsData || [],
    templates: formattedTemplates,
  };
}

/**
 * Fetches the most recent measurement snapshot for a client and template
 * to enable fast pre-filling during fittings.
 */
export async function getLatestClientMeasurement(
  clientId: string,
  templateId: string
): Promise<{
  taken_at?: string;
  fields_snapshot?: Array<{ field_name: string; unit: string | null; value: string }>;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !clientId || !templateId) {
    return null;
  }

  const { data } = await supabase
    .from('measurements')
    .select('taken_at, fields_snapshot')
    .eq('client_id', clientId)
    .eq('template_id', templateId)
    .eq('tailor_id', user.id)
    .order('taken_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data || !data.fields_snapshot) {
    return null;
  }

  return {
    taken_at: data.taken_at,
    fields_snapshot: data.fields_snapshot as Array<{
      field_name: string;
      unit: string | null;
      value: string;
    }>,
  };
}
