import { formatZAR } from '@/lib/format'
import { siteUrl } from '@/lib/site'
import type { StoredOrder } from '@/lib/orders/orders'
import type { Email } from './send'

// Plain HTML emails, styled inline so they survive email clients: cream page, Lara's lettering,
// a serif stack that falls back from IM Fell English to Georgia, mauve links.

const C = {
  cream: '#F6F2EA',
  paper: '#FBF9F4',
  ink: '#3B3530',
  soft: '#4E4640',
  muted: '#6F655D',
  mauve: '#6E5268',
  line: '#E1D8CB',
}
const SERIF = "'IM Fell English', Georgia, 'Times New Roman', serif"
const BODY = "Alegreya, Georgia, 'Times New Roman', serif"

export const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const zar = (cents: number) => formatZAR(cents).replace(/ /g, ' ')

function layout(title: string, body: string) {
  const site = siteUrl()
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.cream};color:${C.ink};font-family:${BODY};font-size:17px;line-height:1.6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td align="center" style="padding-bottom:24px"><a href="${site}"><img src="${site}/brand/logo-name.png" width="220" alt="Lara Bergé" style="display:block;border:0;width:220px;height:auto"></a>
<div style="font-family:${SERIF};font-variant:small-caps;letter-spacing:0.42em;color:${C.mauve};font-size:13px;margin-top:2px">artworks</div></td></tr>
<tr><td style="background:${C.paper};border:1px solid ${C.line};padding:32px 28px">${body}</td></tr>
<tr><td align="center" style="padding-top:20px;font-size:13px;color:${C.muted}">Lara Berge Artworks · <a href="${site}" style="color:${C.mauve}">${esc(site.replace(/^https?:\/\//, ''))}</a></td></tr>
</table></td></tr></table></body></html>`
}

const h1 = (s: string) =>
  `<h1 style="margin:0 0 12px;font-family:${SERIF};font-weight:400;font-size:28px;line-height:1.15;color:${C.ink}">${s}</h1>`
const p = (s: string) => `<p style="margin:0 0 14px;color:${C.soft}">${s}</p>`
const link = (href: string, label: string) =>
  `<a href="${esc(href)}" style="color:${C.mauve}">${esc(label)}</a>`

function itemsTable(order: StoredOrder) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">${esc(i.title)}<br><span style="font-size:14px;color:${C.muted}">${
          i.type === 'original' ? 'Original painting' : `Signed print · ${esc(i.size)} · × ${i.qty}`
        }</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};white-space:nowrap">${zar(i.unitPrice * i.qty)}</td></tr>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:16px">${rows}
<tr><td style="padding:8px 0">Subtotal</td><td align="right">${zar(order.subtotal)}</td></tr>
<tr><td style="padding:4px 0">${order.delivery.method === 'collect' ? 'Collection' : 'Shipping'}</td><td align="right">${order.shipping === 0 ? 'Free' : zar(order.shipping)}</td></tr>
<tr><td style="padding:8px 0;font-family:${SERIF};font-size:20px">Total paid</td><td align="right" style="font-family:${SERIF};font-size:20px">${zar(order.total)}</td></tr></table>`
}

function deliveryText(order: StoredOrder) {
  const d = order.delivery
  if (d.method === 'collect') return 'Collect from the studio (arrange a time with the buyer)'
  return [d.line1, d.suburb, d.city, d.province, d.postalCode, d.country].filter(Boolean).join(', ')
}

const itemsText = (order: StoredOrder) =>
  order.items
    .map(
      (i) =>
        `- ${i.title} (${i.type === 'original' ? 'original' : `print ${i.size} x ${i.qty}`}): ${zar(i.unitPrice * i.qty)}`,
    )
    .join('\n')

/** To the buyer, once PayFast confirms payment */
export function orderConfirmation(order: StoredOrder): Email {
  const url = `${siteUrl()}/order/${order._id}`
  const html = layout(
    `Order ${order.reference}`,
    h1(`Thank you, ${esc(order.customer.firstName)}!`) +
      p(
        `Your little world has found a home. This is your receipt for order <strong>${esc(order.reference)}</strong>.`,
      ) +
      itemsTable(order) +
      p(
        order.delivery.method === 'collect'
          ? 'Lara will email you to arrange a time to collect.'
          : `It will be wrapped by hand and sent to: ${esc(deliveryText(order))}. Lara will send a note with tracking when it leaves the studio.`,
      ) +
      p(`${link(url, 'View your order')} · Questions? Just reply to this email.`),
  )
  const text = `Thank you, ${order.customer.firstName}!\n\nOrder ${order.reference}\n${itemsText(order)}\nTotal paid: ${zar(order.total)}\n\n${
    order.delivery.method === 'collect'
      ? 'Lara will email you to arrange a time to collect.'
      : `Sending to: ${deliveryText(order)}`
  }\n\nView your order: ${url}`
  return {
    to: order.customer.email,
    subject: `Your order ${order.reference} from Lara Berge Artworks`,
    html,
    text,
  }
}

/** To Lara, with everything she needs to pack and send */
export function newOrderForLara(order: StoredOrder, to: string, conflicts: string[] = []): Email {
  const studio = `${siteUrl()}/studio/intent/edit/id=${order._id};type=order/`
  const c = order.customer
  const warn = conflicts.length
    ? p(
        `<strong style="color:${C.mauve}">Needs attention:</strong> payment arrived after the reservation ran out, and ${esc(conflicts.join(', '))} had already gone to someone else.`,
      )
    : ''
  const html = layout(
    `New order ${order.reference}`,
    h1(`New order ${esc(order.reference)}`) +
      warn +
      p(
        `<strong>${esc(c.firstName)} ${esc(c.lastName)}</strong><br>${link(`mailto:${c.email}`, c.email)}<br>${esc(c.phone ?? '')}`,
      ) +
      itemsTable(order) +
      p(`<strong>Delivery:</strong> ${esc(deliveryText(order))}`) +
      (order.gift ? p('<strong>This is a gift:</strong> leave the price out of the parcel.') : '') +
      (order.notes ? p(`<strong>Their note:</strong> ${esc(order.notes)}`) : '') +
      p(link(studio, 'Open the order in the Studio')),
  )
  const text = `New order ${order.reference}\n${conflicts.length ? `NEEDS ATTENTION: ${conflicts.join(', ')} already sold\n` : ''}${c.firstName} ${c.lastName} <${c.email}> ${c.phone ?? ''}\n\n${itemsText(order)}\nTotal: ${zar(order.total)}\n\nDelivery: ${deliveryText(order)}${order.gift ? '\nGIFT: leave the price out' : ''}${order.notes ? `\nNote: ${order.notes}` : ''}\n\n${studio}`
  return {
    to,
    subject: `New order ${order.reference}: ${zar(order.total)}`,
    html,
    text,
    replyTo: c.email,
  }
}

type Commission = {
  name: string
  email: string
  kind: 'oil' | 'digital'
  sizeOrUse: string
  budget: string
  deadline: string
  gift: boolean
  idea: string
  share: boolean
  imageUrls: string[]
  requestId: string
}

export function commissionForLara(c: Commission, to: string): Email {
  const studio = `${siteUrl()}/studio/intent/edit/id=${c.requestId};type=commissionRequest/`
  const rows: Array<[string, string]> = [
    ['Kind', c.kind === 'oil' ? 'Oil painting' : 'Digital illustration'],
    [c.kind === 'oil' ? 'Size' : 'For', c.sizeOrUse],
    ['Budget', c.budget],
    ['Needed by', c.deadline || 'No date given'],
    ['Gift', c.gift ? 'Yes' : 'No'],
    ['May share it', c.share ? 'Yes' : 'No'],
  ]
  const html = layout(
    'New commission request',
    h1(`A commission idea from ${esc(c.name)}`) +
      p(link(`mailto:${c.email}`, c.email)) +
      `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px;font-size:16px">${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:2px 16px 2px 0;color:${C.muted}">${k}</td><td>${esc(v)}</td></tr>`,
        )
        .join('')}</table>` +
      p(`<strong>Their idea:</strong><br>${esc(c.idea).replace(/\n/g, '<br>')}`) +
      (c.imageUrls.length
        ? p(
            `<strong>Reference photos:</strong><br>${c.imageUrls.map((u, i) => link(u, `Photo ${i + 1}`)).join(' · ')}`,
          )
        : p('No reference photos.')) +
      p(link(studio, 'Open the request in the Studio')),
  )
  const text = `Commission idea from ${c.name} <${c.email}>\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${c.idea}\n\n${c.imageUrls.join('\n')}\n\n${studio}`
  return { to, subject: `Commission idea from ${c.name}`, html, text, replyTo: c.email }
}

export function commissionAutoReply(c: Commission, replyDays: string): Email {
  const html = layout(
    'Your idea is in safe paws',
    h1('Your idea is in safe paws') +
      p(
        `Hello ${esc(c.name)}, thank you for telling me about your idea! I'll read it properly with a cup of tea and reply within ${esc(replyDays)} with a quote and a first sketch.`,
      ) +
      p(
        `<strong>What you sent:</strong> ${c.kind === 'oil' ? 'an oil painting' : 'a digital illustration'}, ${esc(c.sizeOrUse.toLowerCase())}.<br>${esc(c.idea).replace(/\n/g, '<br>')}`,
      ) +
      p('Lara'),
  )
  const text = `Hello ${c.name},\n\nThank you for telling me about your idea! I'll reply within ${replyDays} with a quote and a first sketch.\n\nWhat you sent:\n${c.idea}\n\nLara`
  return { to: c.email, subject: 'Your commission idea is in safe paws', html, text }
}

type Contact = { name: string; email: string; topic: string; message: string }

export function contactForLara(c: Contact, to: string): Email {
  const html = layout(
    'New message',
    h1(`A note from ${esc(c.name)}`) +
      p(`${link(`mailto:${c.email}`, c.email)} · ${esc(c.topic)}`) +
      p(esc(c.message).replace(/\n/g, '<br>')),
  )
  return {
    to,
    subject: `${c.topic}: a note from ${c.name}`,
    html,
    text: `${c.name} <${c.email}>\n${c.topic}\n\n${c.message}`,
    replyTo: c.email,
  }
}

export function contactAutoReply(c: Contact, replyTime: string): Email {
  const html = layout(
    'Your note is on its way',
    h1('Your note is on its way') +
      p(`Hello ${esc(c.name)}, thank you for writing! I usually reply within ${esc(replyTime)}.`) +
      p(`<strong>Your message:</strong><br>${esc(c.message).replace(/\n/g, '<br>')}`) +
      p('Lara'),
  )
  return {
    to: c.email,
    subject: 'Thank you for your note',
    html,
    text: `Hello ${c.name},\n\nThank you for writing! I usually reply within ${replyTime}.\n\nYour message:\n${c.message}\n\nLara`,
  }
}
