import { z } from 'zod';

export const measurementFieldValueSchema = z.object({
  field_name: z
    .string()
    .trim()
    .min(1, 'Field name is required')
    .max(100, 'Field name must be under 100 characters'),
  unit: z
    .string()
    .trim()
    .max(20, 'Unit must be under 20 characters')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  value: z
    .string()
    .trim()
    .min(1, 'Please enter a measurement value')
    .max(50, 'Value must be under 50 characters'),
});

export const recordMeasurementSchema = z.object({
  client_id: z.string().uuid('Please select a valid customer').optional().nullable(),
  new_client_name: z.string().trim().max(100).optional().nullable(),
  new_client_phone: z.string().trim().max(30).optional().nullable(),
  template_id: z.string().uuid().optional().nullable(),
  style_name: z.string().trim().max(100).optional().nullable(),
  save_as_default_points: z.boolean().optional(),
  taken_at: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date/time format',
    }),
  field_values: z
    .array(measurementFieldValueSchema)
    .min(1, 'At least one measurement field value is required'),
});

export type MeasurementFieldValueInput = z.infer<typeof measurementFieldValueSchema>;
export type RecordMeasurementInput = z.infer<typeof recordMeasurementSchema>;
