import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { checkoutSignature, itnParamString, itnSignatureValid, pfEncode } from './signature'

const md5 = (s: string) => createHash('md5').update(s).digest('hex')

describe('pfEncode (PHP urlencode)', () => {
  it('encodes spaces as + and uses upper-case hex', () => {
    expect(pfEncode('First Name')).toBe('First+Name')
    expect(pfEncode('http://www.yourdomain.co.za/return.php')).toBe(
      'http%3A%2F%2Fwww.yourdomain.co.za%2Freturn.php',
    )
    expect(pfEncode('test@test.com')).toBe('test%40test.com')
    expect(pfEncode('Order#123')).toBe('Order%23123')
  })

  it('escapes the characters encodeURIComponent leaves alone', () => {
    expect(pfEncode("!'()*~")).toBe('%21%27%28%29%2A%7E')
  })

  it('keeps unreserved characters and encodes UTF-8', () => {
    expect(pfEncode('A-z_0.9')).toBe('A-z_0.9')
    expect(pfEncode('Bergé')).toBe('Berg%C3%A9')
  })
})

describe('checkoutSignature', () => {
  // The full form example from PayFast's docs (Custom Integration, Step 3)
  const docsExample: Array<[string, string]> = [
    ['merchant_id', '10000100'],
    ['merchant_key', '46f0cd694581a'],
    ['return_url', 'http://www.yourdomain.co.za/return.php'],
    ['cancel_url', 'http://www.yourdomain.co.za/cancel.php'],
    ['notify_url', 'http://www.yourdomain.co.za/notify.php'],
    ['name_first', 'First Name'],
    ['name_last', 'Last Name'],
    ['email_address', 'test@test.com'],
    ['m_payment_id', '1234'],
    ['amount', '10.00'],
    ['item_name', 'Order#123'],
  ]
  const expectedString =
    'merchant_id=10000100&merchant_key=46f0cd694581a' +
    '&return_url=http%3A%2F%2Fwww.yourdomain.co.za%2Freturn.php' +
    '&cancel_url=http%3A%2F%2Fwww.yourdomain.co.za%2Fcancel.php' +
    '&notify_url=http%3A%2F%2Fwww.yourdomain.co.za%2Fnotify.php' +
    '&name_first=First+Name&name_last=Last+Name&email_address=test%40test.com' +
    '&m_payment_id=1234&amount=10.00&item_name=Order%23123'

  it('signs the docs example with its passphrase, fields in documented order', () => {
    expect(checkoutSignature(docsExample, 'jt7NOE43FZPn')).toBe(
      md5(`${expectedString}&passphrase=jt7NOE43FZPn`),
    )
  })

  it('works without a passphrase', () => {
    expect(checkoutSignature(docsExample)).toBe(md5(expectedString))
  })

  it('skips blank fields and trims values', () => {
    const withBlanks: Array<[string, string]> = [
      ...docsExample.slice(0, 8),
      ['cell_number', ''],
      ['m_payment_id', ' 1234 '],
      ...docsExample.slice(9),
    ]
    expect(checkoutSignature(withBlanks, 'jt7NOE43FZPn')).toBe(
      md5(`${expectedString}&passphrase=jt7NOE43FZPn`),
    )
  })

  it('depends on field order (PayFast does not sort)', () => {
    const shuffled = [...docsExample].reverse()
    expect(checkoutSignature(shuffled, 'jt7NOE43FZPn')).not.toBe(
      checkoutSignature(docsExample, 'jt7NOE43FZPn'),
    )
  })
})

describe('ITN signature', () => {
  // Shaped like the "Transaction Webhook Payload" example in PayFast's docs
  const fieldsBeforeSignature: Array<[string, string]> = [
    ['m_payment_id', 'SuperUnique1'],
    ['pf_payment_id', '1089250'],
    ['payment_status', 'COMPLETE'],
    ['item_name', 'test product'],
    ['item_description', ''],
    ['amount_gross', '200.00'],
    ['amount_fee', '-4.60'],
    ['amount_net', '195.40'],
    ['custom_str1', ''],
    ['name_first', ''],
    ['email_address', ''],
    ['merchant_id', '10012577'],
  ]
  const paramString =
    'm_payment_id=SuperUnique1&pf_payment_id=1089250&payment_status=COMPLETE' +
    '&item_name=test+product&item_description=&amount_gross=200.00&amount_fee=-4.60' +
    '&amount_net=195.40&custom_str1=&name_first=&email_address=&merchant_id=10012577'

  it('builds the parameter string in received order, keeping blanks, stopping at signature', () => {
    const posted: Array<[string, string]> = [
      ...fieldsBeforeSignature,
      ['signature', 'x'],
      ['extra', 'y'],
    ]
    expect(itnParamString(posted)).toBe(paramString)
  })

  it('accepts a correctly signed ITN and rejects a tampered one', () => {
    const signature = md5(`${paramString}&passphrase=jt7NOE43FZPn`)
    const posted: Array<[string, string]> = [...fieldsBeforeSignature, ['signature', signature]]
    expect(itnSignatureValid(posted, 'jt7NOE43FZPn')).toBe(true)
    expect(itnSignatureValid(posted, 'wrong')).toBe(false)

    const tampered = posted.map(([k, v]): [string, string] => [
      k,
      k === 'amount_gross' ? '1.00' : v,
    ])
    expect(itnSignatureValid(tampered, 'jt7NOE43FZPn')).toBe(false)
  })

  it('rejects an ITN without a signature', () => {
    expect(itnSignatureValid(fieldsBeforeSignature, 'jt7NOE43FZPn')).toBe(false)
  })
})
