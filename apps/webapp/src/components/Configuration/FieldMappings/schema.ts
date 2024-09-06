import { z } from "zod"

export const mappingSchema = z.object({
  standard_object: z.string(),
  source_app: z.string(),
  status: z.string(),
  category: z.string(),
  source_field: z.string(),
  destination_field: z.string(),
  data_type: z.string()
})

export type Mapping = z.infer<typeof mappingSchema>
