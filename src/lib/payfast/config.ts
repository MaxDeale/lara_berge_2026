// PayFast settings. Checked against developers.payfast.co.za (Custom Integration) on 2026-10-11.

export type PayfastMode = 'sandbox' | 'live'

export const PAYFAST_HOSTS = {
  live: 'www.payfast.co.za',
  sandbox: 'sandbox.payfast.co.za',
} as const

/** Hosts PayFast sends ITNs from (Step 4.3, "valid domains") */
export const PAYFAST_ITN_HOSTS = [
  'www.payfast.co.za',
  'sandbox.payfast.co.za',
  'w1w.payfast.co.za',
  'w2w.payfast.co.za',
] as const

export function payfastConfig() {
  const mode: PayfastMode = process.env.PAYFAST_MODE === 'live' ? 'live' : 'sandbox'
  const host = PAYFAST_HOSTS[mode]
  const merchantId = process.env.PAYFAST_MERCHANT_ID ?? ''
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY ?? ''
  const passphrase = process.env.PAYFAST_PASSPHRASE || undefined
  return {
    mode,
    host,
    processUrl: `https://${host}/eng/process`,
    validateUrl: `https://${host}/eng/query/validate`,
    merchantId,
    merchantKey,
    passphrase,
    /** False until the merchant details are in the environment */
    configured: merchantId !== '' && merchantKey !== '',
  }
}

/** Rands with two decimals, as PayFast expects: 125050 cents -> "1250.50" */
export const payfastAmount = (cents: number) => (cents / 100).toFixed(2)
