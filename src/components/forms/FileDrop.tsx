'use client'

import { useId, useState } from 'react'
import { UploadIcon } from '@/components/icons'

type FileDropProps = {
  name: string
  max?: number
  /** Max size per file in bytes */
  maxBytes?: number
  title?: string
  hint?: React.ReactNode
  error?: string
}

/** Dashed drop zone for reference images. The input stays a real file input for the form post. */
export function FileDrop({
  name,
  max = 5,
  maxBytes = 10 * 1024 * 1024,
  title = 'Add reference photos',
  hint,
  error,
}: FileDropProps) {
  const id = useId()
  const [files, setFiles] = useState<File[]>([])
  const [problem, setProblem] = useState<string | null>(null)

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? [])
    let message: string | null = null
    if (picked.length > max) message = `Please choose up to ${max} images.`
    else if (picked.some((f) => !f.type.startsWith('image/'))) message = 'Only image files, please.'
    else if (picked.some((f) => f.size > maxBytes))
      message = `Each image needs to be under ${Math.round(maxBytes / 1024 / 1024)} MB.`
    if (message) event.target.value = ''
    setProblem(message)
    setFiles(message ? [] : picked)
  }

  const shown = error ?? problem
  return (
    <div className="col-span-full">
      <label
        htmlFor={id}
        className="flex flex-col items-center gap-1.5 rounded-[3px] border-[1.5px] border-dashed border-mauve-pale bg-cream p-[26px] text-center has-[+input:focus-visible]:outline-2 has-[+input:focus-visible]:outline-offset-3 has-[+input:focus-visible]:outline-mauve"
      >
        <UploadIcon className="text-mauve" />
        <span className="font-display text-xl">{title}</span>
        {hint && <span className="text-[15px] text-muted">{hint}</span>}
      </label>
      <input
        id={id}
        name={name}
        type="file"
        multiple
        accept="image/*"
        onChange={onChange}
        aria-invalid={shown ? true : undefined}
        aria-describedby={shown ? `${id}-error` : files.length ? `${id}-list` : undefined}
        className="sr-only"
      />
      {files.length > 0 && (
        <ul
          id={`${id}-list`}
          className="mt-3 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[15px] text-ink-soft"
        >
          {files.map((f) => (
            <li key={`${f.name}-${f.size}`}>✦ {f.name}</li>
          ))}
        </ul>
      )}
      {shown && (
        <p id={`${id}-error`} role="alert" className="mt-2 mb-0 text-[15px] text-mauve italic">
          {shown}
        </p>
      )}
    </div>
  )
}
