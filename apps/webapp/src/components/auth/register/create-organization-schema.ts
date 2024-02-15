import { z } from 'zod';

export const organizationFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type OrganizationFormSchemaType = z.infer<typeof organizationFormSchema>;
