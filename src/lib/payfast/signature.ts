import { createHash } from 'node:crypto'

/**
 * PHP's urlencode(), which PayFast's reference code uses: RFC 1738 style, spaces as "+",
 * upper-case hex, and every character except A-Z a-z 0-9 - _ . escaped.
 * (encodeURIComponent leaves ! ' ( ) * ~ alone, which would break signatures.)
 */
export function pfEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+')
}

/**
 * The checkout signature (PayFast docs, Custom Integration, Step 2):
 * non-blank fields in the documented order, values trimmed and urlencoded,
 * joined with "&", then "&passphrase=…", then MD5 (lower-case hex).
 * `fields` must already be in PayFast's attribute order.
 */
export function checkoutSignature(fields: Array<[string, string]>, passphrase?: string): string {
  const pairs = fields
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}=${pfEncode(v.trim())}`)
  if (passphrase) pairs.push(`passphrase=${pfEncode(passphrase.trim())}`)
  return md5(pairs.join('&'))
}

/**
 * The ITN parameter string (Step 4.3): every posted field in the order received, up to (not
 * including) "signature", urlencoded. Values are not trimmed. Also what /eng/query/validate expects.
 */
export function itnParamString(posted: Array<[string, string]>): string {
  const pairs: string[] = []
  for (const [k, v] of posted) {
    if (k === 'signature') break
    pairs.push(`${k}=${pfEncode(v)}`)
  }
  return pairs.join('&')
}

export function itnSignatureValid(posted: Array<[string, string]>, passphrase?: string): boolean {
  const received = posted.find(([k]) => k === 'signature')?.[1]
  if (!received) return false
  let s = itnParamString(posted)
  if (passphrase) s += `&passphrase=${pfEncode(passphrase)}`
  return md5(s) === received
}

export const md5 = (s: string) => createHash('md5').update(s, 'utf8').digest('hex')
