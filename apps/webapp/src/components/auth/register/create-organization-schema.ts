import { z } from 'zod';

export const organizationFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  stripe_customer_id: z.string().min(1, 'stripe customer id is required'),
});

export type OrganizationFormSchemaType = z.infer<typeof organizationFormSchema>;
