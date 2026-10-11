'use client'

import Image from 'next/image'
import { useActionState, useEffect, useRef, useState } from 'react'
import { sendContact } from '@/app/actions/contact'
import { Button, TextButton } from '@/components/Button'
import {
  describedBy,
  Field,
  Honeypot,
  Select,
  TextArea,
  TextInput,
} from '@/components/forms/fields'
import { brand } from '@/lib/brand'
import { CONTACT_TOPICS, type FormState } from '@/lib/forms/contact'

const initial: FormState = { status: 'idle' }

/** Contact form with the "Your note is on its way" sent state. */
export function ContactForm({ replyTime }: { replyTime: string }) {
  const [round, setRound] = useState(0)
  return (
    <ContactFormRound key={round} replyTime={replyTime} onAgain={() => setRound((r) => r + 1)} />
  )
}

function ContactFormRound({ replyTime, onAgain }: { replyTime: string; onAgain: () => void }) {
  const [state, action, pending] = useActionState(sendContact, initial)
  const thanksRef = useRef<HTMLHeadingElement>(null)
  const e = state.errors ?? {}
  const v = state.values ?? {}

  useEffect(() => {
    if (state.status === 'sent') thanksRef.current?.focus()
  }, [state.status])

  if (state.status === 'sent') {
    return (
      <div
        role="status"
        className="animate-fadeup border border-hairline bg-paper px-6 py-12 text-center md:px-10"
      >
        <Image src={brand.doodads.galCat} alt="" className="mx-auto mb-4 block h-auto w-[120px]" />
        <h2
          ref={thanksRef}
          tabIndex={-1}
          className="m-0 mb-2 font-display text-[30px] font-normal outline-none md:text-[34px]"
        >
          Your note is on its way
        </h2>
        <p className="m-0 mb-5 text-ink-soft">
          Thank you! A copy is in your inbox, and Lara will write back soon.
        </p>
        <TextButton onClick={onAgain}>send another →</TextButton>
      </div>
    )
  }

  return (
    <form
      action={action}
      noValidate
      className="relative grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-6 gap-y-[22px]"
    >
      <Honeypot />
      <Field label="Your name" htmlFor="c-name" error={e.name}>
        <TextInput
          {...describedBy('c-name', { error: e.name })}
          name="name"
          autoComplete="name"
          required
          defaultValue={v.name}
        />
      </Field>
      <Field label="Email address" htmlFor="c-email" error={e.email}>
        <TextInput
          {...describedBy('c-email', { error: e.email })}
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={v.email}
        />
      </Field>
      <Field label="What's it about?" htmlFor="c-topic" wide error={e.topic}>
        <Select
          {...describedBy('c-topic', { error: e.topic })}
          name="topic"
          defaultValue={v.topic ?? CONTACT_TOPICS[0]}
        >
          {CONTACT_TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </Field>
      <Field label="Your message" htmlFor="c-msg" wide error={e.message}>
        <TextArea
          {...describedBy('c-msg', { error: e.message })}
          name="message"
          rows={7}
          required
          defaultValue={v.message}
        />
      </Field>
      <div className="col-span-full flex flex-wrap items-center gap-x-6 gap-y-3.5">
        <Button type="submit" disabled={pending} className="min-h-[50px] px-[30px]">
          {pending ? 'Sending…' : 'Send message'}
        </Button>
        <span className="text-base text-muted">Lara usually replies within {replyTime}.</span>
      </div>
      {state.message && (
        <p role="alert" className="col-span-full m-0 text-mauve italic">
          {state.message}
        </p>
      )}
    </form>
  )
}
