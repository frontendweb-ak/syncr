import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
})

export const env = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
})
