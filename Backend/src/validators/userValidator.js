const { z } = require('zod');

const userSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),
  role: z
    .enum(['ADMIN', 'MANAGER', 'CLIENT'], { message: 'Role must be ADMIN, MANAGER, or CLIENT' })
    .optional()
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty')
});

module.exports = { userSchema, loginSchema };
