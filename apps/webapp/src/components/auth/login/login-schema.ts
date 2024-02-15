import { z } from 'zod';
import { registerSchema } from '../register/register-schema';

export const loginSchema = registerSchema.pick({
  email: true,
  password: true,
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
