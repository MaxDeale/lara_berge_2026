'use client'

import Image from 'next/image'
import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { sendCommission } from '@/app/actions/commission'
import { Button, TextButton } from '@/components/Button'
import { useCommissionKind } from '@/components/commissions/CommissionKind'
import { FilterChips } from '@/components/FilterChips'
import { FileDrop } from '@/components/forms/FileDrop'
import {
  Checkbox,
  describedBy,
  Field,
  Honeypot,
  Select,
  TextArea,
  TextInput,
} from '@/components/forms/fields'
import { brand } from '@/lib/brand'
import { downscale } from '@/lib/forms/downscale'
import { DIGITAL_USES, MAX_REFERENCE_BYTES, MAX_REFERENCES } from '@/lib/forms/commission'
import type { FormState } from '@/lib/forms/contact'

type CommissionFormProps = {
  oilSizes: string[]
  budgets: string[]
  replyDays: string
}

const initial: FormState = { status: 'idle' }

export function CommissionForm(props: CommissionFormProps) {
  const [round, setRound] = useState(0)
  return <CommissionFormRound key={round} {...props} onAgain={() => setRound((r) => r + 1)} />
}

function CommissionFormRound({
  oilSizes,
  budgets,
  replyDays,
  onAgain,
}: CommissionFormProps & { onAgain: () => void }) {
  const [state, action, sending] = useActionState(sendCommission, initial)
  const [preparing, startPreparing] = useTransition()
  const pending = sending || preparing

  // Shrink the photos in the browser first so they fit the upload limit, then send
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    startPreparing(async () => {
      const files = form
        .getAll('references')
        .filter((f): f is File => f instanceof File && f.size > 0)
      form.delete('references')
      for (const file of files) form.append('references', await downscale(file))
      startTransition(() => action(form))
    })
  }
  const { kind, setKind } = useCommissionKind()
  const thanksRef = useRef<HTMLHeadingElement>(null)
  const e = state.errors ?? {}
  const v = state.values ?? {}
  const sizeOptions = kind === 'oil' ? oilSizes : [...DIGITAL_USES]

  useEffect(() => {
    if (state.status === 'sent') thanksRef.current?.focus()
  }, [state.status])

  if (state.status === 'sent') {
    return (
      <div
        role="status"
        className="animate-fadeup border border-hairline bg-paper px-6 py-14 text-center md:px-10"
      >
        <Image
          src={brand.doodads.greyCat}
          alt=""
          className="cat mx-auto mb-4 block h-auto w-[110px]"
        />
        <h2
          ref={thanksRef}
          tabIndex={-1}
          className="m-0 mb-2 font-display text-[32px] font-normal outline-none md:text-[38px]"
        >
          Your idea is in safe paws
        </h2>
        <p className="mx-auto mt-0 mb-2 max-w-[520px] text-ink-soft">
          Thank you! Lara will read it properly with a cup of tea and reply within {replyDays} with
          a quote and a first sketch.
        </p>
        <p className="m-0 mb-[22px] text-base text-muted">
          A copy of your request is in your inbox.
        </p>
        <TextButton onClick={onAgain}>send another idea →</TextButton>
      </div>
    )
  }

  return (
    <div className="border border-hairline bg-paper p-[clamp(28px,5vw,56px)]">
      <h2
        id="form-h"
        className="m-0 mb-1.5 text-center font-display text-[34px] font-normal md:text-[40px]"
      >
        Tell Lara your idea
      </h2>
      <p className="m-0 mb-8 text-center text-[17px] text-ink-soft">
        No commitment yet. This just starts the conversation.
      </p>
      <form
        onSubmit={onSubmit}
        noValidate
        className="relative grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-6 gap-y-[22px]"
      >
        <Honeypot />
        <input type="hidden" name="kind" value={kind} />
        <Field label="Your name" htmlFor="k-name" error={e.name}>
          <TextInput
            {...describedBy('k-name', { error: e.name })}
            name="name"
            autoComplete="name"
            required
            defaultValue={v.name}
          />
        </Field>
        <Field label="Email address" htmlFor="k-email" error={e.email}>
          <TextInput
            {...describedBy('k-email', { error: e.email })}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={v.email}
          />
        </Field>
        <fieldset className="col-span-full m-0 border-0 p-0">
          <legend className="mb-2 p-0 text-base text-ink-soft">Type of commission</legend>
          <FilterChips
            label="Type of commission"
            size="lg"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'oil', label: 'Oil painting' },
              { value: 'digital', label: 'Digital illustration' },
            ]}
          />
        </fieldset>
        <Field
          label={kind === 'oil' ? 'Canvas size' : 'What will it be used for?'}
          htmlFor="k-size"
          error={e.sizeOrUse}
        >
          {/* Re-mount when the kind changes so the first option is selected */}
          <Select
            key={kind}
            {...describedBy('k-size', { error: e.sizeOrUse })}
            name="sizeOrUse"
            defaultValue={sizeOptions.includes(v.sizeOrUse ?? '') ? v.sizeOrUse : undefined}
          >
            {sizeOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
        <Field label="Rough budget" htmlFor="k-budget" error={e.budget}>
          <Select
            {...describedBy('k-budget', { error: e.budget })}
            name="budget"
            defaultValue={v.budget}
          >
            {budgets.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
        <Field label="Needed by (optional)" htmlFor="k-date" error={e.deadline}>
          <TextInput
            {...describedBy('k-date', { error: e.deadline })}
            name="deadline"
            type="date"
            defaultValue={v.deadline}
          />
        </Field>
        <Field label="Is it a gift?" htmlFor="k-for">
          <Select id="k-for" name="gift" defaultValue={v.gift ?? 'me'}>
            <option value="me">It&apos;s for me</option>
            <option value="gift">It&apos;s a gift</option>
          </Select>
        </Field>
        <Field label="Describe your idea" htmlFor="k-idea" wide error={e.idea}>
          <TextArea
            {...describedBy('k-idea', { error: e.idea })}
            name="idea"
            rows={6}
            required
            defaultValue={v.idea}
            placeholder="Who or what is in it, the mood, colours you love, where it will hang…"
          />
        </Field>
        <FileDrop
          name="references"
          max={MAX_REFERENCES}
          maxBytes={MAX_REFERENCE_BYTES}
          error={e.references}
          hint={`Pets, places, people, mood pictures · up to ${MAX_REFERENCES} images`}
        />
        <Checkbox
          name="share"
          defaultChecked
          className="col-span-full"
          label="Lara may share the finished piece on her website and Instagram"
        />
        <div className="col-span-full mt-1.5 flex justify-center">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? 'Sending…' : 'Send my idea'}
          </Button>
        </div>
        {state.message && (
          <p role="alert" className="col-span-full m-0 text-center text-mauve italic">
            {state.message}
          </p>
        )}
      </form>
    </div>
  )
}
