const { z } = require('zod');

const checkpointSchema = z.object({
  projectId: z
    .number({ required_error: 'projectId is required' })
    .int('projectId must be an integer')
    .positive('projectId must be positive'),
  title: z
    .string({ required_error: 'Checkpoint title is required' })
    .min(2, 'Checkpoint title must be at least 2 characters'),
  targetDate: z
    .string({ required_error: 'Target date is required' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'targetDate must be a valid date string' }),
  order: z
    .number({ required_error: 'Order is required' })
    .int('Order must be a whole number')
    .nonnegative('Order cannot be negative'),
  status: z
    .enum(['PENDING', 'DONE'], { message: 'Status must be PENDING or DONE' })
    .optional()
});

const checkpointUpdateSchema = z.object({
  title: z
    .string()
    .min(2, 'Checkpoint title must be at least 2 characters')
    .optional(),
  targetDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'targetDate must be a valid date string' })
    .optional(),
  order: z
    .number()
    .int('Order must be a whole number')
    .nonnegative('Order cannot be negative')
    .optional(),
  status: z
    .enum(['PENDING', 'DONE'], { message: 'Status must be PENDING or DONE' })
    .optional()
});

module.exports = { checkpointSchema, checkpointUpdateSchema };
