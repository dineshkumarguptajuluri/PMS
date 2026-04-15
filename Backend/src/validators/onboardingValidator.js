const { z } = require('zod');

// Indian GST format: 2 digits state code + 10 char PAN + 1 digit entity + Z + 1 check digit
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const onboardingSchema = z.object({
  legalName: z
    .string({ required_error: 'Legal name is required' })
    .min(2, 'Legal name must be at least 2 characters'),
  gstNumber: z
    .string({ required_error: 'GST number is required' })
    .regex(GST_REGEX, 'Invalid Indian GST number format (e.g., 22AAAAA0000A1Z5)'),
  industryType: z
    .string({ required_error: 'Industry type is required' })
    .min(2, 'Industry type must be at least 2 characters'),
  employeeCount: z
    .number({ invalid_type_error: 'Employee count must be a number' })
    .int('Employee count must be a whole number')
    .positive('Employee count must be positive')
    .optional(),
  userId: z
    .number({ required_error: 'userId is required' })
    .int('userId must be an integer')
    .positive('userId must be positive')
});

module.exports = { onboardingSchema };
