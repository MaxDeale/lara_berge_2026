// Public Sanity settings, safe for both the browser (Studio) and the server.
export const projectId = required(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
)
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2026-10-01'

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing environment variable ${name}. See .env.example.`)
  return value
}
