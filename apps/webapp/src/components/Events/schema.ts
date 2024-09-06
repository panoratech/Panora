import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const eventSchema = z.object({
  method: z.string(),
  url: z.string(),
  status: z.string(),
  direction: z.string(),
  integration: z.string(),
  id_linked_user: z.string(),
  date: z.string()
})

export type Event = z.infer<typeof eventSchema>