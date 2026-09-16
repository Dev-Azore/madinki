'use server';

import { createClient } from '@/lib/supabase/server';
import {
  updateTailorStatusSchema,
  UpdateTailorStatusInput,
  updateTailorPlanSchema,
  UpdateTailorPlanInput,
  updateUserRoleSchema,
  UpdateUserRoleInput,
  createGlobalTemplateSchema,
  CreateGlobalTemplateInput,
} from '@/lib/validation/admin';
import { revalidatePath } from 'next/cache';

export interface AdminActionResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Helper: Verify caller is Admin
// ---------------------------------------------------------------------------
async function verifyAdminCaller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, error: 'Unauthorized: You must be signed in.' };
  }

  const { data: adminProfile, error: adminError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminError || adminProfile?.role !== 'admin') {
    return { supabase, user, error: 'Forbidden: Admin privileges required.' };
  }

  return { supabase, user, error: null };
}

// ---------------------------------------------------------------------------
// 1. updateTailorStatusAction
// ---------------------------------------------------------------------------
export async function updateTailorStatusAction(
  payload: UpdateTailorStatusInput
): Promise<AdminActionResponse> {
  const { supabase, user, error: authError } = await verifyAdminCaller();
  if (authError || !user) return { error: authError || 'Unauthorized' };

  const parsed = updateTailorStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: 'Invalid input provided.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { target_id, action } = parsed.data;

  if (target_id === user.id) {
    return { error: 'You cannot change your own administrator account status.' };
  }

  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('id, name, status, role')
    .eq('id', target_id)
    .single();

  if (targetError || !targetUser) {
    return { error: 'Target user not found.' };
  }

  const previousStatus = targetUser.status;
  const newStatus = action === 'suspend' ? 'suspended' : 'active';

  if (previousStatus === newStatus) {
    return { error: `Account is already ${newStatus}.` };
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ status: newStatus })
    .eq('id', target_id);

  if (updateError) {
    return { error: 'Failed to update user status in database.' };
  }

  // Audit Log
  await supabase.from('admin_audit_log').insert({
    actor_id: user.id,
    target_id: target_id,
    action: action,
    previous_status: previousStatus,
    new_status: newStatus,
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/tailors/${target_id}`);
  revalidatePath('/admin/audit-log');

  return { success: true };
}

// ---------------------------------------------------------------------------
// 2. updateTailorPlanAction (Free <-> Premium)
// ---------------------------------------------------------------------------
export async function updateTailorPlanAction(
  payload: UpdateTailorPlanInput
): Promise<AdminActionResponse> {
  const { supabase, user, error: authError } = await verifyAdminCaller();
  if (authError || !user) return { error: authError || 'Unauthorized' };

  const parsed = updateTailorPlanSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: 'Invalid plan selection.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { target_id, plan } = parsed.data;

  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('id, name, plan')
    .eq('id', target_id)
    .single();

  if (targetError || !targetUser) {
    return { error: 'Target user not found.' };
  }

  const previousPlan = targetUser.plan;

  if (previousPlan === plan) {
    return { error: `User is already on the ${plan} plan.` };
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ plan })
    .eq('id', target_id);

  if (updateError) {
    return { error: 'Failed to update user subscription plan.' };
  }

  // Audit Log
  await supabase.from('admin_audit_log').insert({
    actor_id: user.id,
    target_id: target_id,
    action: 'change_plan',
    previous_status: `plan:${previousPlan}`,
    new_status: `plan:${plan}`,
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/tailors/${target_id}`);
  revalidatePath('/admin/audit-log');

  return { success: true };
}

// ---------------------------------------------------------------------------
// 3. updateUserRoleAction (Promote / Demote Admin)
// ---------------------------------------------------------------------------
export async function updateUserRoleAction(
  payload: UpdateUserRoleInput
): Promise<AdminActionResponse> {
  const { supabase, user, error: authError } = await verifyAdminCaller();
  if (authError || !user) return { error: authError || 'Unauthorized' };

  const parsed = updateUserRoleSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: 'Invalid role selection.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { target_id, role } = parsed.data;

  if (target_id === user.id && role !== 'admin') {
    return { error: 'Safety Guard: You cannot demote your own administrator account.' };
  }

  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('id, name, role')
    .eq('id', target_id)
    .single();

  if (targetError || !targetUser) {
    return { error: 'Target user not found.' };
  }

  const previousRole = targetUser.role;

  if (previousRole === role) {
    return { error: `User already has role '${role}'.` };
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ role })
    .eq('id', target_id);

  if (updateError) {
    return { error: 'Failed to update user role in database.' };
  }

  // Audit Log
  await supabase.from('admin_audit_log').insert({
    actor_id: user.id,
    target_id: target_id,
    action: role === 'admin' ? 'promote_admin' : 'demote_admin',
    previous_status: `role:${previousRole}`,
    new_status: `role:${role}`,
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/tailors/${target_id}`);
  revalidatePath('/admin/audit-log');

  return { success: true };
}

// ---------------------------------------------------------------------------
// 4. getTailorInspectionData (Deep-dive inspection for a tailor)
// ---------------------------------------------------------------------------
export async function getTailorInspectionData(tailorId: string) {
  const { supabase, error: authError } = await verifyAdminCaller();
  if (authError) return { error: authError, data: null };

  // 1. Fetch tailor user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, name, role, plan, status, created_at, updated_at')
    .eq('id', tailorId)
    .single();

  if (profileError || !profile) {
    return { error: 'Tailor profile not found.', data: null };
  }

  // 2. Fetch tailor's clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, phone, notes, created_at, updated_at')
    .eq('tailor_id', tailorId)
    .order('created_at', { ascending: false });

  // 3. Fetch tailor's templates
  const { data: templates } = await supabase
    .from('templates')
    .select(`
      id,
      name,
      is_global,
      created_at,
      template_fields (
        id,
        field_name,
        unit,
        order_index
      )
    `)
    .eq('tailor_id', tailorId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // 4. Fetch tailor's recent measurements
  const { data: measurements } = await supabase
    .from('measurements')
    .select(`
      id,
      client_id,
      template_id,
      template_name_snapshot,
      fields_snapshot,
      taken_at,
      created_at
    `)
    .eq('tailor_id', tailorId)
    .order('taken_at', { ascending: false })
    .limit(50);

  return {
    error: null,
    data: {
      profile,
      clients: clients || [],
      templates: templates || [],
      measurements: measurements || [],
    },
  };
}

// ---------------------------------------------------------------------------
// 5. createGlobalTemplateAction (Global Template Library)
// ---------------------------------------------------------------------------
export async function createGlobalTemplateAction(
  payload: CreateGlobalTemplateInput
): Promise<AdminActionResponse<{ id: string }>> {
  const { supabase, user, error: authError } = await verifyAdminCaller();
  if (authError || !user) return { error: authError || 'Unauthorized' };

  const parsed = createGlobalTemplateSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: 'Invalid template data.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, fields } = parsed.data;

  // Insert template with is_global = true
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .insert({
      name,
      tailor_id: user.id,
      is_global: true,
    })
    .select('id')
    .single();

  if (templateError || !template) {
    return { error: `Failed to create global template: ${templateError?.message}` };
  }

  // Insert template fields
  const fieldsToInsert = fields.map((f, idx) => ({
    template_id: template.id,
    field_name: f.field_name,
    unit: f.unit || null,
    order_index: idx,
  }));

  const { error: fieldsError } = await supabase
    .from('template_fields')
    .insert(fieldsToInsert);

  if (fieldsError) {
    return { error: `Failed to insert template fields: ${fieldsError.message}` };
  }

  // Audit log
  await supabase.from('admin_audit_log').insert({
    actor_id: user.id,
    target_id: user.id,
    action: 'create_global_template',
    previous_status: null,
    new_status: name,
  });

  revalidatePath('/admin/templates');
  revalidatePath('/templates');
  revalidatePath('/measurements/new');

  return { success: true, data: { id: template.id } };
}

// ---------------------------------------------------------------------------
// 6. deleteGlobalTemplateAction
// ---------------------------------------------------------------------------
export async function deleteGlobalTemplateAction(
  templateId: string
): Promise<AdminActionResponse> {
  const { supabase, user, error: authError } = await verifyAdminCaller();
  if (authError || !user) return { error: authError || 'Unauthorized' };

  const { data: template, error: fetchError } = await supabase
    .from('templates')
    .select('id, name, is_global')
    .eq('id', templateId)
    .single();

  if (fetchError || !template) {
    return { error: 'Global template not found.' };
  }

  const { error: deleteError } = await supabase
    .from('templates')
    .delete()
    .eq('id', templateId);

  if (deleteError) {
    return { error: 'Failed to delete global template.' };
  }

  await supabase.from('admin_audit_log').insert({
    actor_id: user.id,
    target_id: user.id,
    action: 'delete_global_template',
    previous_status: template.name,
    new_status: 'deleted',
  });

  revalidatePath('/admin/templates');
  revalidatePath('/templates');
  revalidatePath('/measurements/new');

  return { success: true };
}
