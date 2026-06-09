import { z } from "zod"

export const customerSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  serviceName: z.string(),
})

export type Customer = z.infer<typeof customerSchema>
