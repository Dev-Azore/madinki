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
  is_global?: boolean;
  template_fields: TemplateFieldOption[];
}

/**
 * Records a new immutable measurement snapshot for a client.
 * Server Action pattern: Auth -> Validate -> Authoritative Snapshot -> Mutate
 */
export async function recordMeasurement(
  payload: RecordMeasurementInput
): Promise<ActionResponse<{ id: string; client_id: string }>> {
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
      error: 'Please check the measurement fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    client_id,
    new_client_name,
    new_client_phone,
    template_id,
    style_name,
    save_as_default_points,
    taken_at,
    field_values,
  } = parsed.data;

  // 3. Resolve Customer (Existing or create on the fly)
  let resolvedClientId = client_id;
  let clientName = '';

  if (resolvedClientId) {
    const { data: existingClient, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', resolvedClientId)
      .eq('tailor_id', user.id)
      .single();

    if (clientError || !existingClient) {
      return { error: 'Customer not found or you do not have permission to access this customer.' };
    }
    clientName = existingClient.name;
  } else if (new_client_name && new_client_name.trim().length > 0) {
    // Create new customer on the spot
    const { data: newClient, error: createClientError } = await supabase
      .from('clients')
      .insert({
        tailor_id: user.id,
        name: new_client_name.trim(),
        phone: new_client_phone ? new_client_phone.trim() : null,
      })
      .select('id, name')
      .single();

    if (createClientError || !newClient) {
      return { error: 'Failed to create new customer profile. Please try again.' };
    }

    resolvedClientId = newClient.id;
    clientName = newClient.name;
  } else {
    return { error: 'Please select a customer or enter a customer name.' };
  }

  // 4. Build the fields snapshot from the tailor-entered points
  const validFields = field_values
    .filter((f) => f.field_name && f.field_name.trim().length > 0)
    .map((f) => ({
      field_name: f.field_name.trim(),
      unit: f.unit ?? null,
      value: (f.value || '').trim(),
    }));

  const hasAtLeastOneValue = validFields.some((f) => f.value.length > 0);
  if (!hasAtLeastOneValue) {
    return { error: 'Please enter at least one measurement size value.' };
  }

  const resolvedStyleName = (style_name && style_name.trim().length > 0)
    ? style_name.trim()
    : 'Standard Fitting';

  // 5. Handle default points persistence if requested
  let resolvedTemplateId = template_id || null;

  if (save_as_default_points && validFields.length > 0) {
    try {
      // Find existing template with this name or create new one
      const { data: existingTpl } = await supabase
        .from('templates')
        .select('id')
        .eq('tailor_id', user.id)
        .eq('name', resolvedStyleName)
        .is('deleted_at', null)
        .maybeSingle();

      let targetTplId = existingTpl?.id;

      if (!targetTplId) {
        const { data: createdTpl } = await supabase
          .from('templates')
          .insert({
            tailor_id: user.id,
            name: resolvedStyleName,
          })
          .select('id')
          .single();

        if (createdTpl) {
          targetTplId = createdTpl.id;
        }
      }

      if (targetTplId) {
        resolvedTemplateId = targetTplId;
        // Replace template fields
        await supabase
          .from('template_fields')
          .delete()
          .eq('template_id', targetTplId);

        const fieldsToInsert = validFields.map((f, idx) => ({
          template_id: targetTplId,
          field_name: f.field_name,
          unit: f.unit || 'in',
          order_index: idx,
        }));

        await supabase.from('template_fields').insert(fieldsToInsert);
      }
    } catch (e) {
      console.error('[Default Points Save Error]:', e);
      // Non-fatal; continue saving measurement
    }
  }

  const measurementTimestamp = taken_at && !isNaN(Date.parse(taken_at))
    ? new Date(taken_at).toISOString()
    : new Date().toISOString();

  // 6. Mutate — Insert immutable measurement record
  const { data: measurement, error: insertError } = await supabase
    .from('measurements')
    .insert({
      client_id: resolvedClientId,
      tailor_id: user.id,
      template_id: resolvedTemplateId,
      template_name_snapshot: resolvedStyleName,
      fields_snapshot: validFields,
      taken_at: measurementTimestamp,
    })
    .select('id')
    .single();

  if (insertError || !measurement) {
    console.error('[Supabase measurements.insert error]:', insertError);
    return {
      error: insertError
        ? `Failed to save measurement: ${insertError.message}`
        : 'Failed to save measurement. Please try again.',
    };
  }

  // 7. Revalidate relevant cache paths
  revalidatePath('/clients');
  revalidatePath(`/clients/${resolvedClientId}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    data: { id: measurement.id, client_id: resolvedClientId },
  };
}

/**
 * Fetches clients and active templates to initialize the measurement recording wizard.
 * Returns both tailor's custom templates and platform global templates.
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

  // 2. Fetch tailor's own custom templates with fields
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
    .order('created_at', { ascending: false });

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
