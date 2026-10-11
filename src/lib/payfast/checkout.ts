import { payfastAmount, payfastConfig } from './config'
import { checkoutSignature } from './signature'

export type PayfastRedirect = { action: string; fields: Array<[string, string]> }

type PaymentRequest = {
  orderId: string
  reference: string
  totalCents: number
  firstName: string
  lastName: string
  email: string
  siteUrl: string
}

/**
 * The hidden form that sends the shopper to PayFast. Field order follows PayFast's attribute
 * list (merchant, customer, transaction), which the signature depends on.
 */
export function buildPayfastRedirect(req: PaymentRequest): PayfastRedirect {
  const cfg = payfastConfig()
  const fields: Array<[string, string]> = [
    ['merchant_id', cfg.merchantId],
    ['merchant_key', cfg.merchantKey],
    ['return_url', `${req.siteUrl}/order/${req.orderId}`],
    ['cancel_url', `${req.siteUrl}/checkout?cancelled=${req.orderId}`],
    ['notify_url', `${req.siteUrl}/api/payfast/itn`],
    ['name_first', req.firstName.slice(0, 100)],
    ['name_last', req.lastName.slice(0, 100)],
    ['email_address', req.email.slice(0, 100)],
    ['m_payment_id', req.orderId],
    ['amount', payfastAmount(req.totalCents)],
    ['item_name', `Lara Berge Artworks order ${req.reference}`],
  ]
  const signature = checkoutSignature(fields, cfg.passphrase)
  return {
    action: cfg.processUrl,
    // PayFast ignores blank fields in the signature, so leave them out of the form too
    fields: [...fields.filter(([, v]) => v !== ''), ['signature', signature]],
  }
}
