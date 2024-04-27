import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const connectionSchema = z.object({
  organisation: z.string(),
  app: z.string(),
  category: z.string(),
  vertical: z.string(),
  status: z.string(),
  linkedUser: z.string(),
  date: z.date(),
  connectionToken: z.string()
})

export type Connection = z.infer<typeof connectionSchema>