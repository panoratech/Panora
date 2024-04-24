import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const apiKeySchema = z.object({
  name: z.string(),
  token: z.string(),
  created: z.string(),
})

export type ApiKey = z.infer<typeof apiKeySchema>