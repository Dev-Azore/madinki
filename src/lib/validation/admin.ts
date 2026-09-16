import { z } from 'zod';

export const updateTailorStatusSchema = z.object({
  target_id: z.string().uuid('Invalid tailor ID'),
  action: z.enum(['suspend', 'reactivate']),
});

export const updateTailorPlanSchema = z.object({
  target_id: z.string().uuid('Invalid tailor ID'),
  plan: z.enum(['free', 'premium']),
});

export const updateUserRoleSchema = z.object({
  target_id: z.string().uuid('Invalid user ID'),
  role: z.enum(['tailor', 'admin']),
});

export const globalTemplateFieldSchema = z.object({
  field_name: z
    .string()
    .min(1, 'Field name is required')
    .max(50, 'Field name must be under 50 characters')
    .trim(),
  unit: z.string().max(10, 'Unit must be under 10 characters').trim().optional().nullable(),
});

export const createGlobalTemplateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be under 100 characters')
    .trim(),
  fields: z
    .array(globalTemplateFieldSchema)
    .min(1, 'At least one measurement field is required')
    .max(50, 'Maximum 50 fields per template'),
});

export type UpdateTailorStatusInput = z.infer<typeof updateTailorStatusSchema>;
export type UpdateTailorPlanInput = z.infer<typeof updateTailorPlanSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateGlobalTemplateInput = z.infer<typeof createGlobalTemplateSchema>;
