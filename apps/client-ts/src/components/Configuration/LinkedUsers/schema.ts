import { z } from "zod"

export const linkedUsersSchema = z.object({
  linked_user_id: z.string(),
  remote_user_id: z.string(),
})
export type ColumnLU = z.infer<typeof linkedUsersSchema>