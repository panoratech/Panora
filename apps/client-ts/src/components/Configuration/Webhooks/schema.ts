import { z } from "zod"

export const webhookSchema = z.object({
  scope: z.string(),
  url: z.string(),
  endpoint_description: z.string(),
  secret: z.string(),
  id_webhook_endpoint: z.string(),
  active: z.boolean()
})

export type Webhook = z.infer<typeof webhookSchema>