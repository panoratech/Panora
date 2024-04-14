import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const mappingSchema = z.object({
    provider_name: z.string(),
    auth_type: z.string(),
    activate: z.boolean(),
    credentials: z.object({
        clientID: z.string().optional(),
        clientSecret: z.string().optional(),
        scope: z.string().optional(),
        apiKey: z.string().optional(),
        username: z.string().optional(),
        secret: z.string().optional()

    }),
    action: z.string(),
    logoPath: z.string(),
    // destination_field: z.string(),
    // data_type: z.string()
})

export type Mapping = z.infer<typeof mappingSchema>