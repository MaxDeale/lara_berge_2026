import { lookup } from 'node:dns/promises'
import { PAYFAST_ITN_HOSTS, payfastConfig } from './config'
import { itnParamString, itnSignatureValid } from './signature'

/** The caller's IP. On Vercel the first x-forwarded-for entry is the real client. */
export function sourceIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip') || null
}

/** Check 2: the notification came from one of PayFast's hosts (resolved fresh each time) */
export async function fromPayfast(ip: string | null): Promise<boolean> {
  if (!ip) return false
  const results = await Promise.allSettled(PAYFAST_ITN_HOSTS.map((h) => lookup(h, { all: true })))
  const valid = new Set(
    results.flatMap((r) => (r.status === 'fulfilled' ? r.value.map((a) => a.address) : [])),
  )
  return valid.has(ip.replace(/^::ffff:/, ''))
}

/** Check 3: amount_gross matches the order total, to the cent */
export const amountMatches = (amountGross: string | undefined, totalCents: number) =>
  amountGross !== undefined && Math.abs(Math.round(Number(amountGross) * 100) - totalCents) <= 1

/** Check 4: PayFast confirms the notification is genuine */
export async function confirmedByPayfast(posted: Array<[string, string]>): Promise<boolean> {
  const res = await fetch(payfastConfig().validateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: itnParamString(posted),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })
  return (await res.text()).trim() === 'VALID'
}

export type ItnChecks = {
  signature: boolean
  source: boolean
  amount: boolean
  merchant: boolean
  server: boolean
}

export async function runItnChecks(
  posted: Array<[string, string]>,
  ip: string | null,
  totalCents: number,
): Promise<ItnChecks> {
  const cfg = payfastConfig()
  const data = Object.fromEntries(posted)
  const signature = itnSignatureValid(posted, cfg.passphrase)
  const [source, server] = await Promise.all([
    fromPayfast(ip),
    // Only bother PayFast when the cheap checks already pass
    signature ? confirmedByPayfast(posted).catch(() => false) : Promise.resolve(false),
  ])
  return {
    signature,
    source,
    amount: amountMatches(data.amount_gross, totalCents),
    merchant: !cfg.merchantId || data.merchant_id === cfg.merchantId,
    server,
  }
}
